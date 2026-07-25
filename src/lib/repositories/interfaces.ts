import type { HumanReviewStatus } from "@/constants/discussion";
import type {
  AIResponse,
  Character,
  Company,
  Consensus,
  ContentDraft,
  CrossRebuttal,
  Discussion,
  Division,
  Employee,
  EmployeeShowcase,
  KnowledgeEntry,
  LiveDemoContentPlan,
  LiveDemoCounterDelta,
  LiveDemoGeneratedContent,
  LiveDemoGenerationRun,
  LiveDemoRepositoryFilter,
  LiveDemoState,
  LiveDemoUsageLog,
  PublishedContent,
  Source,
  Team,
  Topic,
} from "@/types";
import type {
  DiscussionEngineFlowPayload,
  StoredDiscussionFlow,
} from "@/types/api";

export type SaveDiscussionFlowOptions = {
  assignNewId?: boolean;
};

export type UpdateDiscussionReviewStatusInput = {
  discussionId: string;
  contentDraft: ContentDraft;
  status: HumanReviewStatus;
};

export interface CharactersRepository {
  listCharacters(): Promise<Character[]>;
  getCharacterById(characterId: string): Promise<Character | undefined>;
  getCharacterBySlug(slug: string): Promise<Character | undefined>;
  getCharactersByDepartmentId(departmentId: string): Promise<Character[]>;
}

export interface OrganizationRepository {
  listCompanies(): Promise<Company[]>;
  getCompanyById(companyId: string): Promise<Company | undefined>;
  listDivisions(): Promise<Division[]>;
  getDivisionById(divisionId: string): Promise<Division | undefined>;
  getDivisionBySlug(slug: string): Promise<Division | undefined>;
  getDivisionsByCompanyId(companyId: string): Promise<Division[]>;
  listTeams(): Promise<Team[]>;
  getTeamById(teamId: string): Promise<Team | undefined>;
  getTeamBySlug(slug: string): Promise<Team | undefined>;
  getTeamsByDivisionId(divisionId: string): Promise<Team[]>;
  listEmployees(): Promise<Employee[]>;
  getEmployeeById(employeeId: string): Promise<Employee | undefined>;
  getEmployeeBySlug(slug: string): Promise<Employee | undefined>;
  getEmployeesByDivisionId(divisionId: string): Promise<Employee[]>;
  getEmployeesByTeamId(teamId: string): Promise<Employee[]>;
  listEmployeeShowcases(): Promise<EmployeeShowcase[]>;
  getEmployeeShowcaseByEmployeeId(employeeId: string): Promise<EmployeeShowcase | undefined>;
}

export interface TopicsRepository {
  listTopics(): Promise<Topic[]>;
  getTopicById(topicId: string): Promise<Topic | undefined>;
  getTopicBySlug(slug: string): Promise<Topic | undefined>;
}

export interface SourcesRepository {
  listSources(): Promise<Source[]>;
  getSourceById(sourceId: string): Promise<Source | undefined>;
  getSourcesByTopicId(topicId: string): Promise<Source[]>;
  getSourcesByIds(sourceIds: string[]): Promise<Source[]>;
}

export interface DiscussionsRepository {
  listDiscussions(): Promise<Discussion[]>;
  getDiscussionById(discussionId: string): Promise<Discussion | undefined>;
  getDiscussionBySlug(slug: string): Promise<Discussion | undefined>;
  getDiscussionsByTopicId(topicId: string): Promise<Discussion[]>;
}

export interface AIResponsesRepository {
  listAIResponses(): Promise<AIResponse[]>;
  getResponsesByDiscussionId(discussionId: string): Promise<AIResponse[]>;
}

export interface CrossRebuttalsRepository {
  listCrossRebuttals(): Promise<CrossRebuttal[]>;
  getCrossRebuttalsByDiscussionId(discussionId: string): Promise<CrossRebuttal[]>;
}

export interface ConsensusRepository {
  listConsensus(): Promise<Consensus[]>;
  getConsensusByDiscussionId(discussionId: string): Promise<Consensus | undefined>;
}

export interface ContentDraftsRepository {
  listContentDrafts(): Promise<ContentDraft[]>;
  getContentDraftById(contentDraftId: string): Promise<ContentDraft | undefined>;
  getContentDraftsByDiscussionId(discussionId: string): Promise<ContentDraft[]>;
  listPublishedContent(): Promise<PublishedContent[]>;
  getPublishedContentBySlug(slug: string): Promise<PublishedContent | undefined>;
}

export interface KnowledgeEntriesRepository {
  listKnowledgeEntries(): Promise<KnowledgeEntry[]>;
  getKnowledgeEntryById(knowledgeEntryId: string): Promise<KnowledgeEntry | undefined>;
  getKnowledgeEntriesBySourceId(sourceId: string): Promise<KnowledgeEntry[]>;
}

export interface LiveDemoRepository {
  getActivePlan(): Promise<LiveDemoContentPlan | undefined>;
  savePlan(plan: LiveDemoContentPlan): Promise<LiveDemoContentPlan>;
  listGeneratedContents(
    filter?: LiveDemoRepositoryFilter
  ): Promise<LiveDemoGeneratedContent[]>;
  getGeneratedContentById(
    contentId: string
  ): Promise<LiveDemoGeneratedContent | undefined>;
  saveGeneratedContent(
    content: LiveDemoGeneratedContent
  ): Promise<LiveDemoGeneratedContent>;
  updateGeneratedContent(
    content: LiveDemoGeneratedContent
  ): Promise<LiveDemoGeneratedContent>;
  createGenerationRun(
    run: LiveDemoGenerationRun
  ): Promise<LiveDemoGenerationRun>;
  updateGenerationRun(
    run: LiveDemoGenerationRun
  ): Promise<LiveDemoGenerationRun>;
  saveUsageLog(log: LiveDemoUsageLog): Promise<LiveDemoUsageLog>;
  listUsageLogs(): Promise<LiveDemoUsageLog[]>;
  getState(): Promise<LiveDemoState>;
  setKillSwitch(enabled: boolean): Promise<LiveDemoState>;
  reserveGenerationCall(maxTotalCalls: number): Promise<LiveDemoState | null>;
  incrementCounters(delta: LiveDemoCounterDelta): Promise<LiveDemoState>;
}

export interface DiscussionPersistenceRepository {
  listGeneratedDiscussions(): Promise<Discussion[]>;
  listGeneratedDiscussionFlows(): Promise<StoredDiscussionFlow[]>;
  getGeneratedDiscussionFlowById(discussionId: string): Promise<StoredDiscussionFlow | undefined>;
  saveDiscussionFlow(
    flow: DiscussionEngineFlowPayload,
    options?: SaveDiscussionFlowOptions
  ): Promise<StoredDiscussionFlow>;
  updateReviewStatus(
    input: UpdateDiscussionReviewStatusInput
  ): Promise<StoredDiscussionFlow | null>;
  deleteGeneratedDiscussion(discussionId: string): Promise<boolean>;
  clearGeneratedDiscussions(): Promise<void>;
}

export interface RepositoryBundle {
  characters: CharactersRepository;
  organization: OrganizationRepository;
  topics: TopicsRepository;
  sources: SourcesRepository;
  discussions: DiscussionsRepository;
  aiResponses: AIResponsesRepository;
  crossRebuttals: CrossRebuttalsRepository;
  consensus: ConsensusRepository;
  contentDrafts: ContentDraftsRepository;
  knowledgeEntries: KnowledgeEntriesRepository;
  discussionPersistence: DiscussionPersistenceRepository;
  liveDemo: LiveDemoRepository;
}
