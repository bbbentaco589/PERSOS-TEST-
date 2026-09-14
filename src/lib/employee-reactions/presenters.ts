import type {
  DebateSide,
  EmployeeReaction,
  EmployeeReactionPost,
  EmployeeReactionPostView,
  PublicDebate,
} from "@/types";
import type {
  PublicAnonymousAliasTone,
  PublicAnonymousChatDemo,
} from "@/data/public-discussion-demo";
import { createAnonymousIdentityMap } from "@/lib/anonymous-identity";

const anonymousTones: PublicAnonymousAliasTone[] = [
  "green",
  "lavender",
  "peach",
  "lemon",
  "soda",
];

function getDebateSide(reaction: EmployeeReaction): DebateSide {
  // 찬반 토론은 이진 구조다. 구버전에서 저장된 "보류"도
  // 공개 화면에서는 비동의 측인 "반대"로 정규화한다.
  return reaction.stance === "찬성" ? "support" : "oppose";
}

function combineReactionAsStatement(reaction: EmployeeReaction) {
  return [
    reaction.coreOpinion,
    reaction.concerns ? `다만 ${reaction.concerns}` : "",
    reaction.suggestion ? `그래서 ${reaction.suggestion}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function combineReactionAsAnonymousMessages(reaction: EmployeeReaction) {
  const firstMessage = [
    reaction.coreOpinion,
    reaction.concerns,
  ]
    .filter(Boolean)
    .join(" ");
  const secondMessage = reaction.suggestion;

  return [firstMessage, secondMessage].filter(Boolean);
}

export function presentEmployeeReactionsAsDebate(
  post: EmployeeReactionPostView,
  keyPoints: string[]
): PublicDebate {
  return {
    id: post.id,
    slug: post.slug,
    category: "AI 조직",
    title: post.title,
    summary: post.body,
    keyPoints,
    proposer: "PERSOS Founder",
    proposedAt: post.publishedAt,
    status: "Open",
    participants: post.reactions.map((reaction) => ({
      employeeId: reaction.employeeId,
      side: getDebateSide(reaction),
    })),
    statements: post.reactions.map((reaction) => ({
      id: `${reaction.id}-statement`,
      employeeId: reaction.employeeId,
      side: getDebateSide(reaction),
      content: combineReactionAsStatement(reaction),
      createdAt: reaction.createdAt,
      reactionCount: 0,
    })),
  };
}

export function presentEmployeeReactionsAsAnonymousChat(
  post: EmployeeReactionPost
): PublicAnonymousChatDemo {
  const conversationTurns = post.anonymousTurns ?? [];
  const participantIds = conversationTurns.length
    ? [...new Set(conversationTurns.map((turn) => turn.employeeId))]
    : post.reactions.map((reaction) => reaction.employeeId);
  const identities = createAnonymousIdentityMap(
    post.id,
    participantIds
  );

  return {
    participantCount: participantIds.length,
    topic: {
      title: post.title,
      updatedAt: post.publishedAt,
      updatedBy: "익명 운영자",
    },
    messages: conversationTurns.length
      ? conversationTurns.flatMap((turn) => {
          const identity = identities.get(turn.employeeId);
          if (!identity) return [];
          return [{
            id: turn.id,
            alias: identity.nickname,
            aliasTone:
              anonymousTones[identity.avatarIndex % anonymousTones.length],
            content: turn.content,
            createdAt: turn.createdAt,
            reactionCount: 0,
            ...(turn.replyToTurnId
              ? { replyToMessageId: turn.replyToTurnId }
              : {}),
          }];
        })
      : post.reactions.flatMap((reaction) => {
      const identity = identities.get(reaction.employeeId);
      if (!identity) return [];
      const messages = combineReactionAsAnonymousMessages(reaction);

      return messages.map((content, messageIndex) => ({
        id: `${reaction.id}-message-${messageIndex + 1}`,
        alias: identity.nickname,
        aliasTone: anonymousTones[identity.avatarIndex % anonymousTones.length],
        content,
        createdAt: new Date(
          new Date(reaction.createdAt).getTime() + messageIndex * 60_000
        ).toISOString(),
        reactionCount: 0,
        ...(messageIndex > 0
          ? {
              replyToMessageId: `${reaction.id}-message-1`,
            }
          : {}),
      }));
    }),
  };
}
