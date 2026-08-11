import type {
  EmployeeReactionPost,
  OrganizationRunTopic,
} from "@/types";
import type {
  GeneratedEmployeeReaction,
  GeneratedEmployeeReply,
} from "@/lib/ai/employee-reaction-prompt-builder";
import { selectPublicFeedAuthorEmployeeId } from "./public-feed-interactions";

const boardLabels = {
  public: "전사원 공개 피드",
  debate: "전사원 찬반 토론",
  anonymous: "전사원 익명 채팅",
} as const;

function slugify(value: string) {
  const latin = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54);
  return latin || "organization-topic";
}

export function buildOrganizationRunPost(input: {
  runId: string;
  topic: OrganizationRunTopic;
  reactions: GeneratedEmployeeReaction[];
  authorEmployeeId?: string;
  replies?: GeneratedEmployeeReply[];
  publishedAt?: string;
}): EmployeeReactionPost {
  const publishedAt = input.publishedAt ?? new Date().toISOString();
  const shortId = input.runId.slice(0, 8);
  const id = `organization-run-${shortId}`;
  const isPublicFeed = input.topic.boardType === "public";
  const authorEmployeeId = isPublicFeed
    ? input.authorEmployeeId ??
      selectPublicFeedAuthorEmployeeId(
        input.reactions.map((reaction) => reaction.employeeId)
      )
    : undefined;
  const visibleReactions = isPublicFeed && authorEmployeeId
    ? input.reactions.filter(
        (reaction) => reaction.employeeId !== authorEmployeeId
      )
    : input.reactions;
  const authorPosition = isPublicFeed && authorEmployeeId
    ? input.reactions.find(
        (reaction) => reaction.employeeId === authorEmployeeId
      )
    : undefined;
  const reactions = visibleReactions.map((reaction, index) => ({
    ...reaction,
    id: `${id}-reaction-${index + 1}`,
    postId: id,
    createdAt: new Date(
      new Date(publishedAt).getTime() + index * 60_000
    ).toISOString(),
  }));
  return {
    id,
    slug: `${slugify(input.topic.title)}-${shortId}`,
    board:
      input.topic.boardType === "public"
        ? "public-feed"
        : input.topic.boardType,
    boardLabel: boardLabels[input.topic.boardType],
    title: input.topic.title,
    summary: input.topic.topicSummary,
    body: input.topic.body,
    imageUrl: input.topic.imageUrl,
    authorEmployeeId,
    authorPosition: authorPosition
      ? {
          employeeId: authorPosition.employeeId,
          stance: authorPosition.stance,
          coreOpinion: authorPosition.coreOpinion,
          concerns: authorPosition.concerns,
          suggestion: authorPosition.suggestion,
        }
      : undefined,
    publishedAt,
    reactions,
    replies: (input.replies ?? []).flatMap((reply, index) => {
      const parent = reactions.find(
        (reaction) => reaction.employeeId === reply.parentEmployeeId
      );
      if (!parent || !authorEmployeeId) return [];
      return [{
        id: `${id}-reply-${index + 1}`,
        postId: id,
        parentReactionId: parent.id,
        employeeId: authorEmployeeId,
        content: reply.content,
        createdAt: new Date(
          new Date(parent.createdAt).getTime() + 30_000
        ).toISOString(),
      }];
    }),
  };
}
