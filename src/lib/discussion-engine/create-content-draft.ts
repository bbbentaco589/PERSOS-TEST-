import { ContentFormat, HumanReviewStatus } from "@/constants/discussion";
import type { Consensus, ContentDraft, Discussion } from "@/types";

export function createContentDraftFromConsensus(
  consensus: Consensus,
  discussion: Discussion
): ContentDraft {
  return {
    id: `content-generated-${discussion.id}`,
    discussionId: discussion.id,
    consensusId: consensus.id,
    title: discussion.title,
    slug: discussion.slug,
    format: ContentFormat.WebArticle,
    excerpt: consensus.summary,
    body:
      `${consensus.summary}\n\nKey agreements:\n${consensus.keyAgreements
        .map((agreement) => `- ${agreement}`)
        .join("\n")}`,
    status: HumanReviewStatus.PendingReview,
    targetChannels: ["Web", "Internal"],
    createdAt: discussion.createdAt,
    updatedAt: discussion.createdAt,
  };
}
