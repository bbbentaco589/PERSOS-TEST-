import type { Selectable } from "kysely";
import type {
  AIResponseTable,
  CharacterTable,
  CompanyTable,
  ConsensusTable,
  ContentDraftTable,
  CrossRebuttalTable,
  DiscussionTable,
  DivisionTable,
  EmployeeShowcaseTable,
  KnowledgeEntryTable,
  SourceTable,
  TeamTable,
  TopicTable,
} from "@/lib/database";
import type {
  AIResponse,
  Character,
  Company,
  Consensus,
  ContentDraft,
  CrossRebuttal,
  Discussion,
  DiscussionParticipant,
  Division,
  EmployeeShowcase,
  KnowledgeEntry,
  PublishedContent,
  Source,
  Team,
  Topic,
} from "@/types";

export function asJson<T>(value: T | string): T {
  return typeof value === "string" ? JSON.parse(value) as T : value;
}

export function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapCompany(row: Selectable<CompanyTable>): Company {
  return {
    id: row.id,
    slug: row.slug,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    description: row.description,
    descriptionKo: row.description_ko,
    descriptionEn: row.description_en,
    divisionIds: asJson(row.division_ids),
    status: row.status as Company["status"],
  };
}

export function mapDivision(row: Selectable<DivisionTable>): Division {
  return {
    id: row.id,
    companyId: row.company_id,
    slug: row.slug,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    description: row.description,
    descriptionKo: row.description_ko,
    descriptionEn: row.description_en,
    icon: row.icon,
    displayOrder: row.display_order,
    status: row.status as Division["status"],
    organizationType: row.organization_type as Division["organizationType"],
    teamIds: asJson(row.team_ids),
    departmentIds: asJson(row.department_ids) as Division["departmentIds"],
  };
}

export function mapTeam(row: Selectable<TeamTable>): Team {
  return {
    id: row.id,
    divisionId: row.division_id,
    slug: row.slug,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    descriptionKo: row.description_ko,
    descriptionEn: row.description_en,
    displayOrder: row.display_order,
    status: row.status as Team["status"],
  };
}

export function mapCharacter(row: Selectable<CharacterTable>): Character {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    employeeCode: undefined,
    divisionId: row.division_id,
    teamId: row.team_id,
    departmentId: row.department_id as Character["departmentId"],
    jobTitle: row.job_title,
    jobTitleKo: row.job_title_ko,
    jobTitleEn: row.job_title_en,
    hook: row.hook,
    hookKo: row.hook_ko,
    hookEn: row.hook_en,
    summary: row.summary,
    summaryKo: row.summary_ko,
    summaryEn: row.summary_en,
    personality: row.personality,
    values: asJson(row.values),
    strengths: asJson(row.strengths),
    specialties: asJson(row.specialties),
    specialtiesKo: asJson(row.specialties_ko),
    specialtiesEn: asJson(row.specialties_en),
    weakness: row.weakness,
    stance: row.stance,
    contentRole: row.content_role,
    confidence: row.confidence as Character["confidence"],
    status: row.status as Character["status"],
    profileStage: row.status === "Active" ? "Approved" : "Rough",
    publicVisibility: row.status === "Active",
    personaRules: [],
    allowedTopics: asJson(row.specialties_ko),
    prohibitedTopics: [],
    preferredActivityFormats: [],
    brandColor: row.brand_color,
    profileImage: row.profile_image,
    heroImage: row.hero_image,
    socialLinks: asJson(row.social_links),
  };
}

export function mapEmployeeShowcase(
  row: Selectable<EmployeeShowcaseTable>
): EmployeeShowcase {
  return {
    id: row.id,
    employeeId: row.employee_id,
    profile: asJson(row.profile),
    specialties: asJson(row.specialties),
    recentDiscussionIds: asJson(row.recent_discussion_ids),
    knowledgeEntryIds: asJson(row.knowledge_entry_ids),
    publishedContentIds: asJson(row.published_content_ids),
    media: asJson(row.media),
    archive: asJson(row.archive),
    timeline: asJson(row.timeline),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function mapTopic(row: Selectable<TopicTable>): Topic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sourceHint: row.source_hint,
    status: row.status as Topic["status"],
    priority: row.priority as Topic["priority"],
    riskLevel: row.risk_level as Topic["riskLevel"],
    complianceCategories: asJson(row.compliance_categories) as Topic["complianceCategories"],
    createdAt: toIsoString(row.created_at),
  };
}

export function mapSource(
  row: Selectable<SourceTable>,
  topicIds: string[]
): Source {
  return {
    id: row.id,
    topicIds,
    name: row.name,
    type: row.type as Source["type"],
    trustLevel: row.trust_level as Source["trustLevel"],
    riskLevel: row.risk_level as Source["riskLevel"],
    complianceCategories: asJson(row.compliance_categories) as Source["complianceCategories"],
    usage: row.usage,
    summary: row.summary,
    url: row.url ?? undefined,
    publisher: row.publisher ?? undefined,
    lastReviewed: row.last_reviewed,
  };
}

export function mapDiscussion(
  row: Selectable<DiscussionTable>,
  participants: DiscussionParticipant[],
  sourceIds: string[],
  responseIds: string[],
  rebuttalIds: string[],
  consensusId?: string
): Discussion {
  return {
    id: row.id,
    slug: row.slug,
    topicId: row.topic_id,
    title: row.title,
    kicker: row.kicker,
    summary: row.summary,
    status: row.status as Discussion["status"],
    mode: row.mode as Discussion["mode"],
    departmentIds: [...new Set(participants.map((item) => item.departmentId))],
    participants,
    sourceIds,
    responseIds,
    crossRebuttalIds: rebuttalIds,
    consensusId,
    readingTime: row.reading_time,
    publishedAt: row.published_at ? toIsoString(row.published_at) : undefined,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapAIResponse(
  row: Selectable<AIResponseTable>,
  sourceIds: string[]
): AIResponse {
  return {
    id: row.id,
    discussionId: row.discussion_id,
    characterId: row.character_id,
    round: row.round as AIResponse["round"],
    stance: row.stance,
    content: row.content,
    confidence: row.confidence as AIResponse["confidence"],
    sourceIds,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapCrossRebuttal(row: Selectable<CrossRebuttalTable>): CrossRebuttal {
  return {
    id: row.id,
    discussionId: row.discussion_id,
    fromCharacterId: row.from_character_id,
    targetResponseId: row.target_response_id,
    content: row.content,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapConsensus(
  row: Selectable<ConsensusTable>,
  sourceIds: string[]
): Consensus {
  return {
    id: row.id,
    discussionId: row.discussion_id,
    summary: row.summary,
    keyAgreements: asJson(row.key_agreements),
    openQuestions: asJson(row.open_questions),
    disagreements: asJson(row.disagreements),
    confidence: row.confidence as Consensus["confidence"],
    riskLevel: row.risk_level as Consensus["riskLevel"],
    sourceIds,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapContentDraft(row: Selectable<ContentDraftTable>): ContentDraft {
  return {
    id: row.id,
    discussionId: row.discussion_id,
    consensusId: row.consensus_id,
    title: row.title,
    slug: row.slug,
    format: row.format as ContentDraft["format"],
    excerpt: row.excerpt,
    body: row.body,
    status: row.status as ContentDraft["status"],
    targetChannels: asJson(row.target_channels) as ContentDraft["targetChannels"],
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function mapPublishedContent(
  row: Selectable<ContentDraftTable>
): PublishedContent | undefined {
  if (!row.published_at || !row.public_url) {
    return undefined;
  }

  return {
    ...mapContentDraft(row),
    publishedAt: toIsoString(row.published_at),
    publicUrl: row.public_url,
  };
}

export function mapKnowledgeEntry(
  row: Selectable<KnowledgeEntryTable>,
  sourceIds: string[]
): KnowledgeEntry {
  return {
    id: row.id,
    slug: row.id,
    title: row.title,
    category: row.category,
    sourceType: row.source_type as KnowledgeEntry["sourceType"],
    confidence: row.confidence as KnowledgeEntry["confidence"],
    lastReviewed: row.last_reviewed,
    summary: row.summary,
    body: [row.summary],
    status: "Reviewed",
    relatedSourceIds: sourceIds,
    relatedEmployeeIds: [],
    relatedDiscussionIds: [],
    relatedContentIds: [],
    revision: "v1",
  };
}
