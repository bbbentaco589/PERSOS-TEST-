import { DiscussionMode, DiscussionStatus } from "@/constants/discussion";
import type { RepositoryBundle } from "@/lib/repositories";
import type { Discussion } from "@/types";
import { generateMockConsensus } from "./build-consensus";
import { createContentDraftFromConsensus } from "./create-content-draft";
import {
  attachSourcesToDiscussion,
  createDiscussionFromTopic,
  generateMockAIResponses,
  generateMockCrossRebuttal,
} from "./generate-discussion-flow";

export async function createMockDiscussionEngineFlow(
  topicId: string,
  options?: {
    participantIds?: string[];
    mode?: DiscussionMode;
  },
  repositories?: Pick<RepositoryBundle, "characters" | "sources" | "topics">
) {
  if (!repositories) {
    throw new Error("Discussion Engine repositories are required.");
  }

  const draftDiscussion = await createDiscussionFromTopic(topicId, options, repositories);
  const sourcedDiscussion = await attachSourcesToDiscussion(draftDiscussion, repositories);
  const responses = generateMockAIResponses(sourcedDiscussion);
  const rebuttals = generateMockCrossRebuttal(sourcedDiscussion, responses);
  const consensus = generateMockConsensus(sourcedDiscussion, responses, rebuttals);
  const contentDraft = createContentDraftFromConsensus(consensus, sourcedDiscussion);

  const discussion: Discussion = {
    ...sourcedDiscussion,
    status: DiscussionStatus.PendingReview,
    responseIds: responses.map((response) => response.id),
    crossRebuttalIds: rebuttals.map((rebuttal) => rebuttal.id),
    consensusId: consensus.id,
  };

  return {
    topicId,
    discussion,
    sources: await repositories.sources.getSourcesByIds(discussion.sourceIds),
    responses,
    rebuttals,
    consensus,
    contentDraft,
  };
}

export {
  attachSourcesToDiscussion,
  createDiscussionFromTopic,
  generateMockAIResponses,
  generateMockCrossRebuttal,
};
