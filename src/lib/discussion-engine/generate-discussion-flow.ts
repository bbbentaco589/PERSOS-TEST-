import {
  DiscussionMode,
  DiscussionStatus,
  ResponseRound,
} from "@/constants/discussion";
import type { RepositoryBundle } from "@/lib/repositories";
import { isDefaultAssignmentCharacter } from "@/lib/character-runtime-policy";
import type { AIResponse, Character, CrossRebuttal, Discussion, Topic } from "@/types";

type DiscussionEngineRepositories = Pick<
  RepositoryBundle,
  "characters" | "sources" | "topics"
>;

function buildParticipants(characters: Character[]) {
  return characters.map((character, index) => ({
    characterId: character.id,
    departmentId: character.departmentId,
    role: index === 0 ? ("Lead" as const) : index === 1 ? ("Reviewer" as const) : ("Challenger" as const),
    order: index + 1,
  }));
}

async function getDefaultParticipants(repositories: DiscussionEngineRepositories) {
  return buildParticipants(
    (await repositories.characters.listCharacters())
      .filter(isDefaultAssignmentCharacter)
      .slice(0, 3)
  );
}

export async function createDiscussionFromTopic(
  topicId: string,
  options?: {
    participantIds?: string[];
    mode?: DiscussionMode;
  },
  repositories?: DiscussionEngineRepositories
): Promise<Discussion> {
  if (!repositories) {
    throw new Error("Discussion Engine repositories are required.");
  }

  const topic = await repositories.topics.getTopicById(topicId);

  if (!topic) {
    throw new Error(`Topic not found: ${topicId}`);
  }

  const sources = await repositories.sources.getSourcesByTopicId(topic.id);
  const selectedCharacters = options?.participantIds?.length
    ? (await repositories.characters.listCharacters()).filter((character) =>
        options.participantIds?.includes(character.id)
      )
    : [];
  const participants = selectedCharacters.length
    ? buildParticipants(selectedCharacters)
    : await getDefaultParticipants(repositories);

  return {
    id: `disc-generated-${topic.id}`,
    slug: topic.slug,
    topicId: topic.id,
    title: topic.title,
    kicker: "생성 토론",
    summary: topic.description,
    status: DiscussionStatus.Draft,
    mode: options?.mode ?? DiscussionMode.RoundTable,
    departmentIds: [...new Set(participants.map((participant) => participant.departmentId))],
    participants,
    sourceIds: sources.map((source) => source.id),
    responseIds: [],
    crossRebuttalIds: [],
    readingTime: "초안",
    createdAt: topic.createdAt,
  };
}

export async function attachSourcesToDiscussion(
  discussion: Discussion,
  repositories?: Pick<RepositoryBundle, "sources">,
  sourceIds?: string[]
): Promise<Discussion> {
  if (!repositories) {
    throw new Error("Discussion Engine source repository is required.");
  }

  const resolvedSourceIds = sourceIds ?? (await repositories.sources
    .getSourcesByTopicId(discussion.topicId)).map((source) => source.id);

  return {
    ...discussion,
    sourceIds: resolvedSourceIds,
    status: DiscussionStatus.SourceAttached,
  };
}

export function generateMockAIResponses(discussion: Discussion): AIResponse[] {
  return discussion.participants.map((participant, index) => ({
    id: `resp-generated-${discussion.id}-${index + 1}`,
    discussionId: discussion.id,
    characterId: participant.characterId,
    round: ResponseRound.Opening,
    stance: `Position ${index + 1} on ${discussion.title}`,
    content:
      `Mock response from ${participant.characterId}: evaluate "${discussion.title}" through the participant role of ${participant.role}.`,
    confidence: index === 0 ? "High" : "Medium",
    sourceIds: discussion.sourceIds,
    createdAt: discussion.createdAt,
  }));
}

export function generateMockCrossRebuttal(
  discussion: Discussion,
  responses: AIResponse[]
): CrossRebuttal[] {
  if (responses.length < 2) {
    return [];
  }

  return responses.slice(1).map((response, index) => ({
    id: `rebuttal-generated-${discussion.id}-${index + 1}`,
    discussionId: discussion.id,
    fromCharacterId: response.characterId,
    targetResponseId: responses[0].id,
    content:
      `Mock rebuttal: ${response.characterId} challenges the lead response and asks for clearer source limits.`,
    createdAt: discussion.createdAt,
  }));
}

export async function getTopicForDiscussionFlow(
  topicId: string,
  repositories: Pick<RepositoryBundle, "topics">
): Promise<Topic> {
  const topic = await repositories.topics.getTopicById(topicId);

  if (!topic) {
    throw new Error(`Topic not found: ${topicId}`);
  }

  return topic;
}
