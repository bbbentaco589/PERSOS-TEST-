import { Redis } from "@upstash/redis";

import type {
  CharacterActivityMemory,
  CharacterRelationship,
  EmployeeReactionBoard,
  EmployeeReactionPost,
  OrganizationRunReviewItem,
  OrganizationRunReviewStatus,
} from "@/types";
import { getAutomationPolicy } from "@/lib/automation-control-store";
import { listCharacterContextRecords } from "@/lib/character-context-store";

import type { OrganizationRunPublisher } from "./types";
import { normalizePublicFeedAuthorship } from "./public-feed-interactions";

type PublishedBoard = Exclude<EmployeeReactionBoard, "investor-demo">;

const PRODUCTION_KEY_PREFIX = "persos:org-run";

function normalizeNamespaceSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getOrganizationRunKVKeyPrefix(
  env: Readonly<Record<string, string | undefined>> = process.env
) {
  if (env.VERCEL_ENV === "production") return PRODUCTION_KEY_PREFIX;

  if (env.VERCEL_ENV === "preview") {
    const namespace = normalizeNamespaceSegment(
      env.PERSOS_KV_NAMESPACE?.trim() ||
        env.VERCEL_GIT_COMMIT_REF?.trim() ||
        "shared"
    );
    return `persos:preview:${namespace || "shared"}:org-run`;
  }

  const namespace = normalizeNamespaceSegment(
    env.PERSOS_KV_NAMESPACE?.trim() || "local"
  );
  return `persos:development:${namespace || "local"}:org-run`;
}

function createKeys(prefix: string) {
  return {
    post: (slug: string) => `${prefix}:post:${slug}`,
    posts: `${prefix}:posts:all`,
    boardPosts: (board: PublishedBoard) => `${prefix}:posts:board:${board}`,
    employeePosts: (employeeId: string) => `${prefix}:posts:employee:${employeeId}`,
    summaries: `${prefix}:topic-summaries`,
    run: (runId: string) => `${prefix}:run:${runId}`,
    review: (id: string) => `${prefix}:review:${id}`,
    reviews: `${prefix}:reviews:all`,
    lock: `${prefix}:execution-lock`,
    rate: (bucket: number) => `${prefix}:rate:${bucket}`,
    memories: `${prefix}:automation:memory:all`,
    employeeMemories: (employeeId: string) => `${prefix}:automation:memory:employee:${employeeId}`,
    relationships: `${prefix}:automation:relationships:all`,
  } as const;
}

function readKVConfig() {
  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return undefined;
  return { url, token };
}

function normalizeStoredPost(post: EmployeeReactionPost) {
  const storedBoard = (post as unknown as { board: string }).board;
  const normalizedBoardPost = storedBoard === "public" ? {
    ...post,
    board: "public-feed" as const,
  } : post;
  return normalizePublicFeedAuthorship(normalizedBoardPost);
}

function uniqueSlugs(slugs: string[]) {
  return [...new Set(slugs)];
}

export function isOrganizationRunKVConfigured() {
  return Boolean(readKVConfig());
}

export class KVOrganizationRunPublisher implements OrganizationRunPublisher {
  private readonly redis: Redis;
  private readonly key: ReturnType<typeof createKeys>;

  constructor(
    config = readKVConfig(),
    keyPrefix = getOrganizationRunKVKeyPrefix()
  ) {
    if (!config) {
      throw new Error(
        "Vercel KV 또는 Upstash Redis REST 환경변수가 필요합니다."
      );
    }
    this.redis = new Redis(config);
    this.key = createKeys(keyPrefix);
  }

  async listPosts(board?: PublishedBoard) {
    const [allSlugs, boardSlugs] = await Promise.all([
      this.redis.get<string[]>(this.key.posts),
      board
        ? this.redis.get<string[]>(this.key.boardPosts(board))
        : Promise.resolve(undefined),
    ]);
    const slugs = uniqueSlugs([
      ...(boardSlugs ?? []),
      ...(allSlugs ?? []),
    ]);
    const posts = await Promise.all(
      slugs.map((slug) =>
        this.redis.get<EmployeeReactionPost>(this.key.post(slug))
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
      await this.redis.set(this.key.boardPosts(board), expectedSlugs);
    }
    return boardPosts;
  }

  async getPost(slug: string) {
    const post =
      (await this.redis.get<EmployeeReactionPost>(this.key.post(slug))) ??
      undefined;
    return post ? normalizeStoredPost(post) : undefined;
  }

  async listTopicSummaries() {
    return (await this.redis.get<string[]>(this.key.summaries)) ?? [];
  }

  async publish(post: EmployeeReactionPost, runId: string) {
    const [currentSlugs, currentBoardSlugs, currentSummaries] =
      await Promise.all([
        this.redis.get<string[]>(this.key.posts),
        this.redis.get<string[]>(this.key.boardPosts(post.board)),
        this.redis.get<string[]>(this.key.summaries),
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
      .set(this.key.post(post.slug), post)
      .set(this.key.posts, slugs)
      .set(this.key.boardPosts(post.board), boardSlugs)
      .set(this.key.summaries, summaries)
      .set(this.key.run(runId), {
        runId,
        status: "completed",
        postSlug: post.slug,
        board: post.board,
        publishedAt: post.publishedAt,
      })
      .exec();

    const [storedPost, storedSlugs, storedBoardSlugs] = await Promise.all([
      this.getPost(post.slug),
      this.redis.get<string[]>(this.key.posts),
      this.redis.get<string[]>(this.key.boardPosts(post.board)),
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
    await this.recordCharacterContinuity(post);
  }

  async listPostsByEmployeeId(employeeId: string) {
    const indexedSlugs = await this.redis.get<string[]>(this.key.employeePosts(employeeId));
    if (!indexedSlugs) {
      const posts = await this.listPosts();
      return posts.filter((post) =>
        post.authorEmployeeId === employeeId ||
        post.reactions.some((reaction) => reaction.employeeId === employeeId) ||
        (post.replies ?? []).some((reply) => reply.employeeId === employeeId)
      );
    }
    const posts = await Promise.all(indexedSlugs.map((slug) => this.getPost(slug)));
    return posts.filter((post): post is EmployeeReactionPost => Boolean(post));
  }

  private async recordCharacterContinuity(post: EmployeeReactionPost) {
    const policy = await getAutomationPolicy();
    const boardType: CharacterActivityMemory["boardType"] = post.board === "public-feed" ? "public" : post.board;
    const participantIds = [...new Set([
      ...(post.authorEmployeeId ? [post.authorEmployeeId] : []),
      ...post.reactions.map((reaction) => reaction.employeeId),
      ...(post.replies ?? []).map((reply) => reply.employeeId),
    ])];
    const currentAll = (await this.redis.get<CharacterActivityMemory[]>(this.key.memories)) ?? [];
    const created: CharacterActivityMemory[] = post.reactions.map((reaction) => ({
      id: `${post.id}:${reaction.employeeId}`,
      employeeId: reaction.employeeId,
      boardType,
      postSlug: post.slug,
      title: post.title,
      summary: post.summary,
      stance: reaction.stance,
      participantIds,
      createdAt: reaction.createdAt || post.publishedAt,
    }));
    if (post.authorEmployeeId && post.authorPosition) {
      created.push({
        id: `${post.id}:${post.authorEmployeeId}`,
        employeeId: post.authorEmployeeId,
        boardType,
        postSlug: post.slug,
        title: post.title,
        summary: post.summary,
        stance: post.authorPosition.stance,
        participantIds,
        createdAt: post.publishedAt,
      });
    }

    const currentRelationships = (await this.redis.get<CharacterRelationship[]>(this.key.relationships)) ?? [];
    const relationshipMap = new Map(currentRelationships.map((item) => [`${item.employeeId}:${item.counterpartEmployeeId}`, item]));
    for (const employeeId of participantIds) {
      for (const counterpartEmployeeId of participantIds) {
        if (employeeId === counterpartEmployeeId) continue;
        const relationKey = `${employeeId}:${counterpartEmployeeId}`;
        const current = relationshipMap.get(relationKey);
        relationshipMap.set(relationKey, {
          employeeId,
          counterpartEmployeeId,
          interactionCount: (current?.interactionCount ?? 0) + 1,
          boardTypes: [...new Set([...(current?.boardTypes ?? []), boardType])],
          lastPostSlug: post.slug,
          lastInteractionAt: post.publishedAt,
        });
      }
    }

    const pipeline = this.redis.multi()
      .set(this.key.memories, [...created, ...currentAll.filter((item) => item.postSlug !== post.slug)].slice(0, 500))
      .set(this.key.relationships, [...relationshipMap.values()].slice(0, 500));
    const participantState = await Promise.all(participantIds.map(async (employeeId) => {
      const [currentMemories, currentPostSlugs] = await Promise.all([
        this.redis.get<CharacterActivityMemory[]>(this.key.employeeMemories(employeeId)),
        this.redis.get<string[]>(this.key.employeePosts(employeeId)),
      ]);
      return { employeeId, currentMemories, currentPostSlugs };
    }));
    const legacyPosts = participantState.some((item) => !item.currentPostSlugs)
      ? await this.listPosts()
      : [];
    for (const { employeeId, currentMemories, currentPostSlugs } of participantState) {
      const backfilledSlugs = currentPostSlugs ?? legacyPosts
        .filter((candidate) =>
          candidate.authorEmployeeId === employeeId ||
          candidate.reactions.some((reaction) => reaction.employeeId === employeeId) ||
          (candidate.replies ?? []).some((reply) => reply.employeeId === employeeId)
        )
        .map((candidate) => candidate.slug);
      pipeline.set(
        this.key.employeeMemories(employeeId),
        [...created.filter((item) => item.employeeId === employeeId), ...(currentMemories ?? []).filter((item) => item.postSlug !== post.slug)].slice(0, policy.memoryRetention)
      );
      pipeline.set(
        this.key.employeePosts(employeeId),
        [post.slug, ...backfilledSlugs.filter((slug) => slug !== post.slug)].slice(0, 200)
      );
    }
    await pipeline.exec();
  }

  async getCharacterMemoryContexts(employeeIds: readonly string[]) {
    const [memoryLists, relationships, contextRecordLists] = await Promise.all([
      Promise.all(employeeIds.map((employeeId) => this.redis.get<CharacterActivityMemory[]>(this.key.employeeMemories(employeeId)))),
      this.redis.get<CharacterRelationship[]>(this.key.relationships),
      Promise.all(employeeIds.map((employeeId) => listCharacterContextRecords(employeeId))),
    ]);
    const relationList = relationships ?? [];
    return Object.fromEntries(employeeIds.map((employeeId, index) => [employeeId, {
      recentActivities: (memoryLists[index] ?? []).slice(0, 5).map((item) => `${item.title} (${item.boardType}, ${item.stance ?? "입장 없음"})`),
      relationships: relationList
        .filter((item) => item.employeeId === employeeId)
        .sort((left, right) => right.lastInteractionAt.localeCompare(left.lastInteractionAt))
        .slice(0, 5)
        .map((item) => `${item.counterpartEmployeeId}와 ${item.interactionCount}회 함께 참여; 최근 ${item.boardTypes.at(-1) ?? "활동"}`),
      verifiedContext: contextRecordLists[index]
        .filter((item) => item.pinned)
        .slice(0, 5)
        .map((item) => `${item.title}: ${item.body}`),
    }]));
  }

  async listReviewItems(status?: OrganizationRunReviewStatus) {
    const ids = (await this.redis.get<string[]>(this.key.reviews)) ?? [];
    const items = await Promise.all(
      ids.map((id) =>
        this.redis.get<OrganizationRunReviewItem>(this.key.review(id))
      )
    );
    return items
      .filter((item): item is OrganizationRunReviewItem => Boolean(item))
      .filter((item) => !status || item.status === status)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async getReviewItem(id: string) {
    return (
      (await this.redis.get<OrganizationRunReviewItem>(this.key.review(id))) ??
      undefined
    );
  }

  async saveReviewItem(item: OrganizationRunReviewItem) {
    const currentIds = (await this.redis.get<string[]>(this.key.reviews)) ?? [];
    const ids = [item.id, ...currentIds.filter((id) => id !== item.id)].slice(
      0,
      300
    );
    await this.redis
      .multi()
      .set(this.key.review(item.id), item)
      .set(this.key.reviews, ids)
      .set(this.key.run(item.runId), {
        runId: item.runId,
        status: item.status,
        reviewItemId: item.id,
        board: item.boardType,
        updatedAt: item.updatedAt,
      })
      .exec();
  }

  async updateReviewItem(item: OrganizationRunReviewItem) {
    await this.redis
      .multi()
      .set(this.key.review(item.id), item)
      .set(this.key.run(item.runId), {
        runId: item.runId,
        status: item.status,
        reviewItemId: item.id,
        board: item.boardType,
        postSlug: item.status === "approved" ? item.post?.slug : undefined,
        updatedAt: item.updatedAt,
      })
      .exec();
  }

  async acquireExecutionLock(token: string, ttlSeconds: number) {
    const result = await this.redis.set(this.key.lock, token, {
      nx: true,
      ex: ttlSeconds,
    });
    return result === "OK";
  }

  async releaseExecutionLock(token: string) {
    await this.redis.eval(
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
      [this.key.lock],
      [token]
    );
  }

  async consumeRateLimit(limit: number, windowSeconds: number) {
    const bucket = Math.floor(Date.now() / (windowSeconds * 1_000));
    const count = Number(
      await this.redis.eval(
        "local n = redis.call('incr', KEYS[1]); if n == 1 then redis.call('expire', KEYS[1], ARGV[1]) end; return n",
        [this.key.rate(bucket)],
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
