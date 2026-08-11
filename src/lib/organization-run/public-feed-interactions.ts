import type {
  EmployeeReactionInteractionType,
  EmployeeReactionPost,
  EmployeeReactionStance,
} from "@/types";

const QUESTION_ENDING = /(?:\?|까요|나요|습니까|인가요|일까요)(?:[.!…\s]|$)/u;

export function selectPublicFeedAuthorEmployeeId(
  employeeIds: readonly string[]
) {
  return employeeIds.includes("tect") ? "tect" : employeeIds[0];
}

function areOpposingStances(
  authorStance: EmployeeReactionStance,
  commentStance: EmployeeReactionStance
) {
  return (
    (authorStance === "찬성" && commentStance === "반대") ||
    (authorStance === "반대" && commentStance === "찬성")
  );
}

export function shouldGenerateAuthorReply(input: {
  interactionType?: EmployeeReactionInteractionType;
  commentText: string;
  authorStance: EmployeeReactionStance;
  commentStance: EmployeeReactionStance;
}) {
  return (
    input.interactionType === "질문" ||
    input.interactionType === "반박" ||
    QUESTION_ENDING.test(input.commentText) ||
    areOpposingStances(input.authorStance, input.commentStance)
  );
}

export function normalizePublicFeedAuthorship(
  post: EmployeeReactionPost
): EmployeeReactionPost {
  if (post.board !== "public-feed") {
    return { ...post, replies: post.replies ?? [] };
  }

  const authorEmployeeId =
    post.authorEmployeeId ??
    selectPublicFeedAuthorEmployeeId(
      post.reactions.map((reaction) => reaction.employeeId)
    );
  if (!authorEmployeeId) return { ...post, replies: post.replies ?? [] };

  return {
    ...post,
    authorEmployeeId,
    reactions: post.reactions.filter(
      (reaction) => reaction.employeeId !== authorEmployeeId
    ),
    replies: (post.replies ?? []).filter(
      (reply) => reply.employeeId === authorEmployeeId
    ),
  };
}
