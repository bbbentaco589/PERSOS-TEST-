import {
  AIErrorCode,
  AIProviderError,
  type AIProvider,
  type ConsensusOutput,
} from "@/lib/ai";
import { DiscussionStatus, HumanReviewStatus, ResponseRound, ContentFormat } from "@/constants/discussion";
import type { RepositoryBundle } from "@/lib/repositories";
import type {
  AIResponse,
  Character,
  Consensus,
  ContentDraft,
  CrossRebuttal,
  Discussion,
  Source,
  Topic,
} from "@/types";
import { attachSourcesToDiscussion, createDiscussionFromTopic } from "./generate-discussion-flow";

type AIEngineRepositories = Pick<RepositoryBundle, "characters" | "sources" | "topics">;

type DiscussionContext = {
  topic: Topic;
  sources: Source[];
  characters: Character[];
};

function assertParticipantCount(discussion: Discussion) {
  if (discussion.participants.length < 2 || discussion.participants.length > 3) {
    throw new AIProviderError(
      AIErrorCode.DiscussionGenerationFailed,
      "MVP 토론 참여자는 2~3명이어야 합니다.",
      400
    );
  }
}

async function resolveDiscussionContext(
  discussion: Discussion,
  repositories: AIEngineRepositories
): Promise<DiscussionContext> {
  assertParticipantCount(discussion);
  const [topic, sources, characters] = await Promise.all([
    repositories.topics.getTopicById(discussion.topicId),
    repositories.sources.getSourcesByIds(discussion.sourceIds),
    Promise.all(
      discussion.participants.map((participant) =>
        repositories.characters.getCharacterById(participant.characterId)
      )
    ),
  ]);
  if (!topic) {
    throw new AIProviderError(
      AIErrorCode.DiscussionGenerationFailed,
      `토론 Topic을 찾을 수 없습니다: ${discussion.topicId}`,
      404
    );
  }
  if (characters.some((character) => !character)) {
    throw new AIProviderError(
      AIErrorCode.DiscussionGenerationFailed,
      "토론 참여 AI Employee 정보를 찾을 수 없습니다.",
      404
    );
  }

  return { topic, sources, characters: characters as Character[] };
}

function filterSourceReferences(references: string[], sources: Source[]) {
  const allowed = new Set(sources.map((source) => source.id));
  return [...new Set(references.filter((reference) => allowed.has(reference)))];
}

export async function generateAIResponsesForDiscussion(
  discussion: Discussion,
  repositories: AIEngineRepositories,
  provider: AIProvider
): Promise<AIResponse[]> {
  const context = await resolveDiscussionContext(discussion, repositories);
  return Promise.all(context.characters.map(async (character, index) => {
    const output = await provider.generateInitialResponse({
      topic: context.topic,
      sources: context.sources,
      character,
      outputLanguage: "ko",
      lengthConstraint: "핵심 응답 350~550자",
    });
    if (output.characterId !== character.id) {
      throw new AIProviderError(
        AIErrorCode.ResponseInvalid,
        `AI 응답 Character ID가 일치하지 않습니다: ${character.id}`,
        502
      );
    }

    return {
      id: `response-ai-${discussion.id}-${index + 1}`,
      discussionId: discussion.id,
      characterId: character.id,
      round: ResponseRound.Opening,
      stance: output.position,
      content: `${output.response}\n\n판단 근거: ${output.reasoning}`,
      confidence: character.confidence === "High" ? "High" : "Medium",
      sourceIds: filterSourceReferences(output.sourceReferences, context.sources),
      createdAt: discussion.createdAt,
    };
  }));
}

export async function generateAICrossRebuttalsForDiscussion(
  discussion: Discussion,
  responses: AIResponse[],
  repositories: AIEngineRepositories,
  provider: AIProvider
): Promise<CrossRebuttal[]> {
  const context = await resolveDiscussionContext(discussion, repositories);
  if (responses.length !== context.characters.length) {
    throw new AIProviderError(
      AIErrorCode.DiscussionGenerationFailed,
      "모든 참여자의 1차 응답이 있어야 상호 반박을 생성할 수 있습니다.",
      400
    );
  }
  const characterById = new Map(context.characters.map((character) => [character.id, character]));

  return Promise.all(responses.map(async (response, index) => {
    const targetResponse = responses[(index + 1) % responses.length];
    const respondingCharacter = characterById.get(response.characterId);
    const targetCharacter = characterById.get(targetResponse.characterId);
    if (!respondingCharacter || !targetCharacter) {
      throw new AIProviderError(
        AIErrorCode.DiscussionGenerationFailed,
        "상호 반박 Character 관계를 구성할 수 없습니다.",
        400
      );
    }

    const output = await provider.generateCrossRebuttal({
      topic: context.topic,
      sources: context.sources,
      respondingCharacter,
      targetCharacter,
      respondingInitialResponse: response,
      targetResponse,
      outputLanguage: "ko",
      lengthConstraint: "인정 항목 1문장과 반박 250~400자",
    });
    if (
      output.responderCharacterId !== respondingCharacter.id ||
      output.targetCharacterId !== targetCharacter.id
    ) {
      throw new AIProviderError(
        AIErrorCode.ResponseInvalid,
        "AI 상호 반박의 Character 관계가 요청과 일치하지 않습니다.",
        502
      );
    }

    return {
      id: `rebuttal-ai-${discussion.id}-${index + 1}`,
      discussionId: discussion.id,
      fromCharacterId: respondingCharacter.id,
      targetResponseId: targetResponse.id,
      content: output.acknowledgedPoint
        ? `인정: ${output.acknowledgedPoint}\n\n반박: ${output.rebuttal}`
        : output.rebuttal,
      createdAt: discussion.createdAt,
    };
  }));
}

function mapConsensusOutput(
  output: ConsensusOutput,
  discussion: Discussion,
  sources: Source[],
  topic: Topic
): Consensus {
  return {
    id: `consensus-ai-${discussion.id}`,
    discussionId: discussion.id,
    summary: `${output.summary}\n\n최종 합의: ${output.finalConsensus}`,
    keyAgreements: output.agreements,
    openQuestions: output.limitations,
    disagreements: output.disagreements,
    confidence: output.agreements.length >= 2 ? "High" : "Medium",
    riskLevel: topic.riskLevel,
    sourceIds: filterSourceReferences(output.sourceReferences, sources),
    createdAt: discussion.createdAt,
  };
}

export async function generateAIConsensusForDiscussion(
  discussion: Discussion,
  responses: AIResponse[],
  rebuttals: CrossRebuttal[],
  repositories: AIEngineRepositories,
  provider: AIProvider
): Promise<Consensus> {
  const context = await resolveDiscussionContext(discussion, repositories);
  const output = await provider.generateConsensus({
    topic: context.topic,
    sources: context.sources,
    responses,
    rebuttals,
    outputLanguage: "ko",
  });
  return mapConsensusOutput(output, discussion, context.sources, context.topic);
}

function domainConsensusToProviderOutput(consensus: Consensus): ConsensusOutput {
  return {
    summary: consensus.summary,
    agreements: consensus.keyAgreements,
    disagreements: consensus.disagreements,
    finalConsensus: consensus.summary,
    limitations: consensus.openQuestions,
    sourceReferences: consensus.sourceIds,
  };
}

export async function generateAIContentDraftForDiscussion(
  discussion: Discussion,
  responses: AIResponse[],
  rebuttals: CrossRebuttal[],
  consensus: Consensus,
  repositories: AIEngineRepositories,
  provider: AIProvider
): Promise<ContentDraft> {
  const context = await resolveDiscussionContext(discussion, repositories);
  const output = await provider.generateContentDraft({
    topic: context.topic,
    sources: context.sources,
    responses,
    rebuttals,
    consensus: domainConsensusToProviderOutput(consensus),
    targetContentType: "Web Article",
    outputLanguage: "ko",
  });
  const reviewNotes = output.reviewNotes.length
    ? `\n\n## 인간 검토 메모\n${output.reviewNotes.map((note) => `- ${note}`).join("\n")}`
    : "";

  return {
    id: `content-ai-${discussion.id}`,
    discussionId: discussion.id,
    consensusId: consensus.id,
    title: output.title,
    slug: discussion.slug,
    format: ContentFormat.WebArticle,
    excerpt: output.summary,
    body: `${output.body}${reviewNotes}`,
    status: HumanReviewStatus.PendingReview,
    targetChannels: ["Web", "Internal"],
    createdAt: discussion.createdAt,
    updatedAt: discussion.createdAt,
  };
}

export async function createAIDiscussionEngineFlow(
  topicId: string,
  options: { participantIds?: string[]; mode?: Discussion["mode"] },
  repositories: AIEngineRepositories,
  provider: AIProvider
) {
  const draft = await createDiscussionFromTopic(topicId, options, repositories);
  const sourced = await attachSourcesToDiscussion(draft, repositories);
  const responses = await generateAIResponsesForDiscussion(sourced, repositories, provider);
  const rebuttals = await generateAICrossRebuttalsForDiscussion(
    sourced,
    responses,
    repositories,
    provider
  );
  const consensus = await generateAIConsensusForDiscussion(
    sourced,
    responses,
    rebuttals,
    repositories,
    provider
  );
  const contentDraft = await generateAIContentDraftForDiscussion(
    sourced,
    responses,
    rebuttals,
    consensus,
    repositories,
    provider
  );
  const discussion: Discussion = {
    ...sourced,
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
