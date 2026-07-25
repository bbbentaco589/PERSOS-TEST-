import type { ColumnType, Generated, Kysely } from "kysely";
import type {
  EmployeeArchiveItem,
  EmployeeMediaItem,
  EmployeeShowcaseProfile,
  EmployeeShowcaseSpecialty,
  EmployeeSocialLink,
  EmployeeTimelineEntry,
  LiveDemoContentPlan,
} from "@/types";

type Timestamp = ColumnType<Date, string | Date, string | Date>;
type GeneratedTimestamp = ColumnType<Date, string | Date | undefined, string | Date>;
type DateString = ColumnType<string, string, string>;
type JsonValue<T> = ColumnType<T, T | string, T | string>;

export interface CompanyTable {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  description: string;
  description_ko: string;
  description_en: string;
  division_ids: JsonValue<string[]>;
  status: string;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface DepartmentTable {
  id: string;
  name: string;
  mandate: string;
  signal: string;
  roles: JsonValue<string[]>;
  operating_mode: string;
  accent: string;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface DivisionTable {
  id: string;
  company_id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  description: string;
  description_ko: string;
  description_en: string;
  icon: string;
  display_order: number;
  status: string;
  organization_type: string;
  team_ids: JsonValue<string[]>;
  department_ids: JsonValue<string[]>;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface TeamTable {
  id: string;
  division_id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  description_ko: string;
  description_en: string;
  display_order: number;
  status: string;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface CharacterTable {
  id: string;
  slug: string;
  name: string;
  name_ko: string;
  name_en: string;
  division_id: string;
  team_id: string;
  department_id: string;
  job_title: string;
  job_title_ko: string;
  job_title_en: string;
  hook: string;
  hook_ko: string;
  hook_en: string;
  summary: string;
  summary_ko: string;
  summary_en: string;
  personality: string;
  values: JsonValue<string[]>;
  strengths: JsonValue<string[]>;
  specialties: JsonValue<string[]>;
  specialties_ko: JsonValue<string[]>;
  specialties_en: JsonValue<string[]>;
  weakness: string;
  stance: string;
  content_role: string;
  confidence: string;
  status: string;
  brand_color: string;
  profile_image: string;
  hero_image: string;
  social_links: JsonValue<EmployeeSocialLink[]>;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface EmployeeShowcaseTable {
  id: string;
  employee_id: string;
  profile: JsonValue<EmployeeShowcaseProfile>;
  specialties: JsonValue<EmployeeShowcaseSpecialty[]>;
  recent_discussion_ids: JsonValue<string[]>;
  knowledge_entry_ids: JsonValue<string[]>;
  published_content_ids: JsonValue<string[]>;
  media: JsonValue<EmployeeMediaItem[]>;
  archive: JsonValue<EmployeeArchiveItem[]>;
  timeline: JsonValue<EmployeeTimelineEntry[]>;
  updated_at: Timestamp;
}

export interface TopicTable {
  id: string;
  slug: string;
  title: string;
  description: string;
  source_hint: string;
  status: string;
  priority: string;
  risk_level: string;
  compliance_categories: JsonValue<string[]>;
  created_at: Timestamp;
  updated_at: GeneratedTimestamp;
}

export interface SourceTable {
  id: string;
  name: string;
  type: string;
  trust_level: string;
  risk_level: string;
  compliance_categories: JsonValue<string[]>;
  usage: string;
  summary: string;
  url: string | null;
  publisher: string | null;
  last_reviewed: DateString;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface TopicSourceTable {
  topic_id: string;
  source_id: string;
  created_at: GeneratedTimestamp;
}

export interface DiscussionTable {
  id: string;
  slug: string;
  topic_id: string;
  title: string;
  kicker: string;
  summary: string;
  status: string;
  mode: string;
  reading_time: string;
  published_at: Timestamp | null;
  origin: Generated<"seeded" | "generated">;
  created_at: Timestamp;
  updated_at: GeneratedTimestamp;
}

export interface DiscussionSourceTable {
  discussion_id: string;
  source_id: string;
  order_index: number;
  created_at: GeneratedTimestamp;
}

export interface DiscussionParticipantTable {
  id: string;
  discussion_id: string;
  character_id: string;
  department_id: string;
  role: string;
  order_index: number;
  created_at: GeneratedTimestamp;
}

export interface AIResponseTable {
  id: string;
  discussion_id: string;
  character_id: string;
  round: string;
  stance: string;
  content: string;
  confidence: string;
  created_at: Timestamp;
}

export interface AIResponseSourceTable {
  response_id: string;
  source_id: string;
  order_index: number;
  created_at: GeneratedTimestamp;
}

export interface CrossRebuttalTable {
  id: string;
  discussion_id: string;
  from_character_id: string;
  target_response_id: string;
  content: string;
  created_at: Timestamp;
}

export interface ConsensusTable {
  id: string;
  discussion_id: string;
  summary: string;
  key_agreements: JsonValue<string[]>;
  open_questions: JsonValue<string[]>;
  disagreements: JsonValue<string[]>;
  confidence: string;
  risk_level: string;
  created_at: Timestamp;
}

export interface ConsensusSourceTable {
  consensus_id: string;
  source_id: string;
  order_index: number;
  created_at: GeneratedTimestamp;
}

export interface ContentDraftTable {
  id: string;
  discussion_id: string;
  consensus_id: string;
  title: string;
  slug: string;
  format: string;
  excerpt: string;
  body: string;
  status: string;
  target_channels: JsonValue<string[]>;
  published_at: Timestamp | null;
  public_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface KnowledgeEntryTable {
  id: string;
  title: string;
  category: string;
  source_type: string;
  confidence: string;
  last_reviewed: DateString;
  summary: string;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface KnowledgeEntrySourceTable {
  knowledge_entry_id: string;
  source_id: string;
  order_index: number;
  created_at: GeneratedTimestamp;
}

export interface LiveDemoPlanTable {
  id: string;
  status: "active" | "completed" | "cancelled";
  plan_json: JsonValue<LiveDemoContentPlan>;
  starts_at: Timestamp;
  ends_at: Timestamp;
  created_by_persona_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface LiveDemoGeneratedContentTable {
  id: string;
  plan_id: string;
  content_type: "feed" | "debate" | "anonymous";
  persona_id: string;
  topic_id: string;
  title: string;
  source_body: string;
  public_body: string;
  status:
    | "generating"
    | "draft"
    | "qa_passed"
    | "published"
    | "qa_rejected"
    | "failed"
    | "limit_reached";
  activity_type: string | null;
  stance: "support" | "oppose" | "neutral" | null;
  round: "opening" | "rebuttal" | "summary" | null;
  reply_to_id: string | null;
  metadata: JsonValue<Record<string, unknown>>;
  scheduled_at: Timestamp | null;
  created_at: Timestamp;
  published_at: Timestamp | null;
  failure_reason: string | null;
}

export interface LiveDemoGenerationRunTable {
  id: string;
  plan_id: string | null;
  trigger: "runner" | "manual" | "api";
  content_type: "feed" | "debate" | "anonymous" | "plan";
  status:
    | "generating"
    | "draft"
    | "qa_passed"
    | "published"
    | "qa_rejected"
    | "failed"
    | "limit_reached";
  attempt: number;
  started_at: Timestamp;
  finished_at: Timestamp | null;
  failure_reason: string | null;
  metadata: JsonValue<Record<string, unknown>>;
}

export interface LiveDemoUsageLogTable {
  id: string;
  run_id: string;
  provider: "gemini";
  model: string;
  prompt_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  success: boolean;
  error_code: string | null;
  created_at: Timestamp;
}

export interface LiveDemoStateTable {
  id: "investor-live-demo";
  kill_switch: boolean;
  total_calls: number;
  chat_runs: number;
  chat_messages: number;
  feed_posts: number;
  debate_messages: number;
  updated_at: Timestamp;
}

export interface PssDatabase {
  companies: CompanyTable;
  departments: DepartmentTable;
  divisions: DivisionTable;
  teams: TeamTable;
  characters: CharacterTable;
  employee_showcases: EmployeeShowcaseTable;
  topics: TopicTable;
  sources: SourceTable;
  topic_sources: TopicSourceTable;
  discussions: DiscussionTable;
  discussion_sources: DiscussionSourceTable;
  discussion_participants: DiscussionParticipantTable;
  ai_responses: AIResponseTable;
  ai_response_sources: AIResponseSourceTable;
  cross_rebuttals: CrossRebuttalTable;
  consensuses: ConsensusTable;
  consensus_sources: ConsensusSourceTable;
  content_drafts: ContentDraftTable;
  knowledge_entries: KnowledgeEntryTable;
  knowledge_entry_sources: KnowledgeEntrySourceTable;
  live_demo_plans: LiveDemoPlanTable;
  live_demo_generated_contents: LiveDemoGeneratedContentTable;
  live_demo_generation_runs: LiveDemoGenerationRunTable;
  live_demo_usage_logs: LiveDemoUsageLogTable;
  live_demo_state: LiveDemoStateTable;
}

export type PssDatabaseClient = Kysely<PssDatabase>;
