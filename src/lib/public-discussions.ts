import { DiscussionStatus, HumanReviewStatus } from "@/constants/discussion";
import { getRepositories, type RepositoryBundle } from "@/lib/repositories";
import type {
  AIResponse,
  Character,
  Consensus,
  ContentDraft,
  CrossRebuttal,
  Discussion,
  Source,
} from "@/types";

export type PublicDiscussionDetail = {
  discussion: Discussion;
  responses: AIResponse[];
  rebuttals: CrossRebuttal[];
  consensus: Consensus;
  contentDraft: ContentDraft;
  sources: Source[];
  characters: Character[];
};

function isPublished(discussion: Discussion, contentDraft?: ContentDraft | null) {
  return discussion.status === DiscussionStatus.Published &&
    contentDraft?.status === HumanReviewStatus.Published;
}

export async function listPublicDiscussions(
  repositories: RepositoryBundle = getRepositories()
) {
  const [seededDiscussions, generatedFlows] = await Promise.all([
    repositories.discussions.listDiscussions(),
    repositories.discussionPersistence.listGeneratedDiscussionFlows(),
  ]);
  const seededPublished = (await Promise.all(seededDiscussions.map(async (discussion) => {
    const drafts = await repositories.contentDrafts.getContentDraftsByDiscussionId(discussion.id);
    return isPublished(discussion, drafts.find((draft) => draft.status === HumanReviewStatus.Published))
      ? discussion
      : null;
  }))).filter((discussion): discussion is Discussion => Boolean(discussion));
  const generatedPublished = generatedFlows
    .filter((flow) => isPublished(flow.discussion, flow.contentDraft))
    .map((flow) => flow.discussion);

  return [...generatedPublished, ...seededPublished]
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}

export async function getPublicDiscussionBySlug(
  slug: string,
  repositories: RepositoryBundle = getRepositories()
): Promise<PublicDiscussionDetail | null> {
  const generatedFlows = await repositories.discussionPersistence.listGeneratedDiscussionFlows();
  const generated = [...generatedFlows]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .find((flow) => flow.discussion.slug === slug && isPublished(flow.discussion, flow.contentDraft));

  if (generated?.consensus && generated.contentDraft) {
    return {
      discussion: generated.discussion,
      responses: generated.responses,
      rebuttals: generated.rebuttals,
      consensus: generated.consensus,
      contentDraft: generated.contentDraft,
      sources: generated.sources,
      characters: generated.characters,
    };
  }

  const discussion = await repositories.discussions.getDiscussionBySlug(slug);
  if (!discussion || discussion.status !== DiscussionStatus.Published) return null;

  const [responses, rebuttals, consensus, drafts, sources, characters] = await Promise.all([
    repositories.aiResponses.getResponsesByDiscussionId(discussion.id),
    repositories.crossRebuttals.getCrossRebuttalsByDiscussionId(discussion.id),
    repositories.consensus.getConsensusByDiscussionId(discussion.id),
    repositories.contentDrafts.getContentDraftsByDiscussionId(discussion.id),
    repositories.sources.getSourcesByIds(discussion.sourceIds),
    Promise.all(discussion.participants.map((participant) =>
      repositories.characters.getCharacterById(participant.characterId)
    )),
  ]);
  const contentDraft = drafts.find((draft) => draft.status === HumanReviewStatus.Published);
  if (!consensus || !contentDraft || !isPublished(discussion, contentDraft)) return null;

  return {
    discussion,
    responses,
    rebuttals,
    consensus,
    contentDraft,
    sources,
    characters: characters.filter((character): character is Character => Boolean(character)),
  };
}
