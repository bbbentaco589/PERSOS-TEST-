import assert from "node:assert/strict";
import test from "node:test";

import { rankPopularContentsByAIComments } from "@/lib/public-discovery";
import type { EmployeeReactionPost } from "@/types";

function createPost(
  id: string,
  options: {
    board?: EmployeeReactionPost["board"];
    publishedAt: string;
    reactionCount?: number;
    replyCount?: number;
    anonymousTurnCount?: number;
  }
): EmployeeReactionPost {
  const board = options.board ?? "public-feed";
  return {
    id,
    slug: `post-${id}`,
    board,
    boardLabel:
      board === "debate"
        ? "전사원 찬반 토론"
        : board === "anonymous"
          ? "전사원 익명 채팅"
          : "전사원 공개 피드",
    title: `게시글 ${id}`,
    summary: "요약",
    body: "본문",
    publishedAt: options.publishedAt,
    reactions: Array.from({ length: options.reactionCount ?? 0 }, (_, index) => ({
      id: `${id}-reaction-${index}`,
      postId: id,
      employeeId: "tect" as const,
      stance: "찬성" as const,
      coreOpinion: "의견",
      concerns: "우려",
      suggestion: "제안",
      createdAt: options.publishedAt,
    })),
    replies: Array.from({ length: options.replyCount ?? 0 }, (_, index) => ({
      id: `${id}-reply-${index}`,
      postId: id,
      parentReactionId: `${id}-reaction-0`,
      employeeId: "char-001" as const,
      content: "답글",
      createdAt: options.publishedAt,
    })),
    anonymousTurns: options.anonymousTurnCount
      ? Array.from({ length: options.anonymousTurnCount }, (_, index) => ({
          id: `${id}-turn-${index}`,
          postId: id,
          employeeId: "char-003" as const,
          content: "익명 메시지",
          createdAt: options.publishedAt,
        }))
      : undefined,
  };
}

test("인기 콘텐츠는 최근 7일의 AI 댓글 수로 정렬하고 동률이면 최신 글을 우선한다", () => {
  const now = new Date("2026-09-17T12:00:00.000Z");
  const ranked = rankPopularContentsByAIComments(
    [
      createPost("older-tie", {
        publishedAt: "2026-09-15T12:00:00.000Z",
        reactionCount: 3,
        replyCount: 2,
      }),
      createPost("newer-tie", {
        publishedAt: "2026-09-16T12:00:00.000Z",
        reactionCount: 4,
        replyCount: 1,
      }),
      createPost("most-comments", {
        publishedAt: "2026-09-14T12:00:00.000Z",
        reactionCount: 4,
        replyCount: 3,
      }),
      createPost("expired", {
        publishedAt: "2026-09-01T12:00:00.000Z",
        reactionCount: 20,
      }),
    ],
    5,
    now
  );

  assert.deepEqual(
    ranked.map((content) => content.id),
    ["most-comments", "newer-tie", "older-tie"]
  );
  assert.equal(ranked[0].commentCount, 7);
  assert.equal(ranked[0].href, "/discussion/post-most-comments");
});

test("익명 채팅은 생성 초안과 실제 채팅을 중복 합산하지 않는다", () => {
  const ranked = rankPopularContentsByAIComments(
    [
      createPost("anonymous", {
        board: "anonymous",
        publishedAt: "2026-09-17T11:00:00.000Z",
        reactionCount: 3,
        anonymousTurnCount: 6,
      }),
      createPost("public", {
        publishedAt: "2026-09-17T10:00:00.000Z",
        reactionCount: 4,
        replyCount: 3,
      }),
    ],
    5,
    new Date("2026-09-17T12:00:00.000Z")
  );

  assert.deepEqual(
    ranked.map((content) => [content.id, content.commentCount]),
    [
      ["public", 7],
      ["anonymous", 6],
    ]
  );
});
