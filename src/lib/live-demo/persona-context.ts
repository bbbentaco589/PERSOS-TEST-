import { getCharacterPromptProfile } from "@/lib/ai/character-prompt-profile";
import type { RepositoryBundle } from "@/lib/repositories/interfaces";
import type { Character, KnowledgeEntry } from "@/types";

export type LiveDemoPersonaContext = {
  persona: {
    id: string;
    slug: string;
    name: string;
    division: string;
    team: string;
    jobTitle: string;
    specialties: string[];
    personality: string;
    values: string[];
    speakingStyle: string;
    judgmentGuide: string;
    worldAndRelationshipRules: string[];
    prohibitedTopics: string[];
    allowedTopics: string[];
  };
  assignment: {
    responsibility: string;
    stance?: string;
  };
  knowledge: Array<Pick<KnowledgeEntry, "id" | "title" | "summary">>;
  recentContents: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
  recentConversation: Array<{
    id: string;
    personaId: string;
    body: string;
    createdAt: string;
  }>;
};

const LIVE_DEMO_PERSONA_IDS = ["char-001", "char-002", "char-003"] as const;

export function isLiveDemoPersonaId(personaId: string) {
  return LIVE_DEMO_PERSONA_IDS.includes(
    personaId as (typeof LIVE_DEMO_PERSONA_IDS)[number]
  );
}

export async function getLiveDemoCharacters(repositories: RepositoryBundle) {
  const characters = await Promise.all(
    LIVE_DEMO_PERSONA_IDS.map((id) =>
      repositories.characters.getCharacterById(id)
    )
  );
  if (characters.some((character) => !character)) {
    throw new Error("SIG·LUMI·박봉남 Canonical Character를 모두 찾지 못했습니다.");
  }
  return characters as Character[];
}

export async function buildPersonaContext(
  repositories: RepositoryBundle,
  personaId: string,
  assignment: LiveDemoPersonaContext["assignment"],
  recentConversationLimit = 10
): Promise<LiveDemoPersonaContext> {
  if (!isLiveDemoPersonaId(personaId)) {
    throw new Error(`Live Demo 대상이 아닌 Persona ID입니다: ${personaId}`);
  }

  const character = await repositories.characters.getCharacterById(personaId);
  if (!character) {
    throw new Error(`Persona Canonical Profile을 찾지 못했습니다: ${personaId}`);
  }

  const [division, team, knowledgeEntries, generatedContents] =
    await Promise.all([
      repositories.organization.getDivisionById(character.divisionId),
      repositories.organization.getTeamById(character.teamId),
      repositories.knowledgeEntries.listKnowledgeEntries(),
      repositories.liveDemo.listGeneratedContents({ status: "published" }),
    ]);
  const promptProfile = getCharacterPromptProfile(character);
  const recentOwnContents = generatedContents
    .filter((content) => content.personaId === personaId)
    .slice(0, 5);
  const recentConversation = generatedContents
    .filter(
      (content) =>
        content.contentType === "anonymous" ||
        content.contentType === "debate"
    )
    .slice(0, recentConversationLimit);

  return {
    persona: {
      id: character.id,
      slug: character.slug,
      name: character.nameKo,
      division: division?.nameKo ?? character.divisionId,
      team: team?.nameKo ?? character.teamId,
      jobTitle: character.jobTitleKo,
      specialties: character.specialtiesKo,
      personality: character.personality,
      values: character.values,
      speakingStyle: promptProfile.speakingStyle,
      judgmentGuide: promptProfile.judgmentGuide,
      worldAndRelationshipRules: character.personaRules,
      prohibitedTopics: character.prohibitedTopics,
      allowedTopics: character.allowedTopics,
    },
    assignment,
    knowledge: knowledgeEntries
      .filter(
        (entry) =>
          entry.status === "Reviewed" &&
          entry.relatedEmployeeIds.includes(personaId)
      )
      .slice(0, 5)
      .map(({ id, title, summary }) => ({ id, title, summary })),
    recentContents: recentOwnContents.map((content) => ({
      id: content.id,
      title: content.title,
      body: content.publicBody,
      createdAt: content.createdAt,
    })),
    recentConversation: recentConversation.map((content) => ({
      id: content.id,
      personaId: content.personaId,
      body: content.publicBody,
      createdAt: content.createdAt,
    })),
  };
}
