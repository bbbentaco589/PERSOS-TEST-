import { Redis } from "@upstash/redis";

import type {
  EmployeeReactionBoard,
  EmployeeReactionPost,
} from "@/types";

import type { OrganizationRunPublisher } from "./types";

type PublishedBoard = Exclude<EmployeeReactionBoard, "investor-demo">;

const KEY = {
  post: (slug: string) => `persos:org-run:post:${slug}`,
  posts: "persos:org-run:posts:all",
  boardPosts: (board: PublishedBoard) =>
    `persos:org-run:posts:board:${board}`,
  summaries: "persos:org-run:topic-summaries",
  run: (runId: string) => `persos:org-run:run:${runId}`,
  lock: "persos:org-run:execution-lock",
  rate: (bucket: number) => `persos:org-run:rate:${bucket}`,
} as const;

function readKVConfig() {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return undefined;
  return { url, token };
}

function normalizeStoredPost(post: EmployeeReactionPost) {
  const storedBoard = (post as unknown as { board: string }).board;
  if (storedBoard !== "public") return post;
  return {
    ...post,
    board: "public-feed" as const,
  };
}

function uniqueSlugs(slugs: string[]) {
  return [...new Set(slugs)];
}

export function isOrganizationRunKVConfigured() {
  return Boolean(readKVConfig());
}

export class KVOrganizationRunPublisher implements OrganizationRunPublisher {
  private readonly redis: Redis;

  constructor(config = readKVConfig()) {
    if (!config) {
      throw new Error(
        "KV_REST_API_URL과 KV_REST_API_TOKEN이 모두 필요합니다."
      );
    }
    this.redis = new Redis(config);
  }

  async listPosts(board?: PublishedBoard) {
    const [allSlugs, boardSlugs] = await Promise.all([
      this.redis.get<string[]>(KEY.posts),
      board
        ? this.redis.get<string[]>(KEY.boardPosts(board))
        : Promise.resolve(undefined),
    ]);
    const slugs = uniqueSlugs([
      ...(boardSlugs ?? []),
      ...(allSlugs ?? []),
    ]);
    const posts = await Promise.all(
      slugs.map((slug) =>
        this.redis.get<EmployeeReactionPost>(KEY.post(slug))
      )
    );
    const availablePosts = posts
      .filter((post): post is EmployeeReactionPost => Boolean(post))
      .map(normalizeStoredPost);
    if (!board) return availablePosts;

    const boardPosts = availablePosts.filter((post) => post.board === board);
    const expectedSlugs = boardPosts.map((post) => post.slug);
    if (
      expectedSlugs.length !== (boardSlugs ?? []).length ||
      expectedSlugs.some((slug, index) => slug !== boardSlugs?.[index])
    ) {
      await this.redis.set(KEY.boardPosts(board), expectedSlugs);
    }
    return boardPosts;
  }

  async getPost(slug: string) {
    const post =
      (await this.redis.get<EmployeeReactionPost>(KEY.post(slug))) ?? undefined;
    return post ? normalizeStoredPost(post) : undefined;
  }

  async listTopicSummaries() {
    return (await this.redis.get<string[]>(KEY.summaries)) ?? [];
  }

  async publish(post: EmployeeReactionPost, runId: string) {
    const [currentSlugs, currentBoardSlugs, currentSummaries] =
      await Promise.all([
        this.redis.get<string[]>(KEY.posts),
        this.redis.get<string[]>(KEY.boardPosts(post.board)),
        this.redis.get<string[]>(KEY.summaries),
      ]);
    const slugs = [
      post.slug,
      ...(currentSlugs ?? []).filter((slug) => slug !== post.slug),
    ].slice(0, 200);
    const boardSlugs = [
      post.slug,
      ...(currentBoardSlugs ?? []).filter((slug) => slug !== post.slug),
    ].slice(0, 200);
    const summaries = [
      post.summary,
      ...(currentSummaries ?? []).filter((summary) => summary !== post.summary),
    ].slice(0, 200);

    await this.redis
      .multi()
      .set(KEY.post(post.slug), post)
      .set(KEY.posts, slugs)
      .set(KEY.boardPosts(post.board), boardSlugs)
      .set(KEY.summaries, summaries)
      .set(KEY.run(runId), {
        runId,
        status: "completed",
        postSlug: post.slug,
        board: post.board,
        publishedAt: post.publishedAt,
      })
      .exec();

    const [storedPost, storedSlugs, storedBoardSlugs] = await Promise.all([
      this.getPost(post.slug),
      this.redis.get<string[]>(KEY.posts),
      this.redis.get<string[]>(KEY.boardPosts(post.board)),
    ]);
    if (
      !storedPost ||
      !storedSlugs?.includes(post.slug) ||
      !storedBoardSlugs?.includes(post.slug)
    ) {
      throw new Error(
        "게시글 상세 데이터 또는 목록 인덱스 저장을 확인하지 못했습니다."
      );
    }
  }

  async acquireExecutionLock(token: string, ttlSeconds: number) {
    const result = await this.redis.set(KEY.lock, token, {
      nx: true,
      ex: ttlSeconds,
    });
    return result === "OK";
  }

  async releaseExecutionLock(token: string) {
    await this.redis.eval(
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
      [KEY.lock],
      [token]
    );
  }

  async consumeRateLimit(limit: number, windowSeconds: number) {
    const bucket = Math.floor(Date.now() / (windowSeconds * 1_000));
    const count = Number(
      await this.redis.eval(
        "local n = redis.call('incr', KEYS[1]); if n == 1 then redis.call('expire', KEYS[1], ARGV[1]) end; return n",
        [KEY.rate(bucket)],
        [windowSeconds]
      )
    );
    return count <= limit;
  }
}

let publisher: KVOrganizationRunPublisher | undefined;

export function getOrganizationRunPublisher() {
  if (!isOrganizationRunKVConfigured()) return undefined;
  publisher ??= new KVOrganizationRunPublisher();
  return publisher;
}
