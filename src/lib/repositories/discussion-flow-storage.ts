import type { DiscussionEngineFlowPayload } from "@/types/api";

function createGeneratedDiscussionId(topicId: string) {
  return `generated-${topicId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

export function prepareDiscussionFlowForStorage(
  flow: DiscussionEngineFlowPayload,
  assignNewId = false
): DiscussionEngineFlowPayload {
  const discussionId = assignNewId
    ? createGeneratedDiscussionId(flow.topicId)
    : flow.discussion.id;
  const discussionSlug = assignNewId
    ? `${flow.discussion.slug}-${discussionId.slice(-8)}`
    : flow.discussion.slug;
  const responseIdMap = new Map(
    flow.responses.map((response, index) => [
      response.id,
      assignNewId ? `response-${discussionId}-${index + 1}` : response.id,
    ])
  );
  const responses = flow.responses.map((response) => ({
    ...response,
    id: responseIdMap.get(response.id) ?? response.id,
    discussionId,
  }));
  const rebuttals = flow.rebuttals.map((rebuttal, index) => ({
    ...rebuttal,
    id: assignNewId ? `rebuttal-${discussionId}-${index + 1}` : rebuttal.id,
    discussionId,
    targetResponseId:
      responseIdMap.get(rebuttal.targetResponseId) ?? rebuttal.targetResponseId,
  }));
  const consensus = flow.consensus
    ? {
        ...flow.consensus,
        id: assignNewId ? `consensus-${discussionId}` : flow.consensus.id,
        discussionId,
      }
    : null;
  const contentDraft = flow.contentDraft
    ? {
        ...flow.contentDraft,
        id: assignNewId ? `content-${discussionId}` : flow.contentDraft.id,
        discussionId,
        consensusId: consensus?.id ?? flow.contentDraft.consensusId,
        slug: discussionSlug,
      }
    : null;

  return {
    ...flow,
    discussion: {
      ...flow.discussion,
      id: discussionId,
      slug: discussionSlug,
      responseIds: responses.map((response) => response.id),
      crossRebuttalIds: rebuttals.map((rebuttal) => rebuttal.id),
      consensusId: consensus?.id,
    },
    responses,
    rebuttals,
    consensus,
    contentDraft,
  };
}
