import type { EmployeeReactionPost } from "@/types";

export type PendingReactions = {
  slug: string;
  publishedAt: string;
  reactions: EmployeeReactionPost["reactions"];
  replies: NonNullable<EmployeeReactionPost["replies"]>;
  nextStage: 1 | 2;
};

export function splitInitialReactions(post: EmployeeReactionPost) {
  if (post.board === "anonymous") return { initial: post, pending: undefined };
  const initial = {
    ...post,
    reactions: post.reactions.slice(0, 1),
    replies: [],
  } satisfies EmployeeReactionPost;
  const pending: PendingReactions = {
    slug: post.slug,
    publishedAt: post.publishedAt,
    reactions: post.reactions.slice(1),
    replies: post.replies ?? [],
    nextStage: 1,
  };
  return { initial, pending: pending.reactions.length || pending.replies.length ? pending : undefined };
}

export function releaseReactionStage(post: EmployeeReactionPost, pending: PendingReactions, stage: 1 | 2, now: string) {
  if (pending.nextStage !== stage && stage !== 2) return { post, pending };
  const released = stage === 1 ? pending.reactions.slice(0, 1) : pending.reactions;
  const remaining = pending.reactions.slice(released.length);
  const replies = stage === 2 ? pending.replies : [];
  const nextPost = {
    ...post,
    reactions: [...post.reactions, ...released.filter((item) => !post.reactions.some((existing) => existing.id === item.id)).map((item, index) => ({ ...item, createdAt: new Date(Date.parse(now) + index * 45_000).toISOString() }))],
    replies: [...(post.replies ?? []), ...replies.filter((item) => !(post.replies ?? []).some((existing) => existing.id === item.id)).map((item, index) => ({ ...item, createdAt: new Date(Date.parse(now) + (released.length + index) * 45_000).toISOString() }))],
  } satisfies EmployeeReactionPost;
  return {
    post: nextPost,
    pending: stage === 1 ? { ...pending, reactions: remaining, nextStage: 2 as const } : undefined,
  };
}
