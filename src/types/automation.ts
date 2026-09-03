import type { ExternalActivityPlatform } from "./external-activity";
import type { OrganizationRunBoardType } from "./organization-run";

export type AutomationPolicy = {
  policyVersion: number;
  enabled: boolean;
  enabledBoards: OrganizationRunBoardType[];
  dailyRunLimit: number;
  dailyGeminiCallLimit: number;
  dailyActivityMin: number;
  dailyActivityMax: number;
  maxParticipants: number;
  maxRepliesPerPost: number;
  autoPublish: boolean;
  memoryRetention: number;
  metadataRetentionDays: number;
  draftRetentionDays: number;
  autoApplyAdaptiveContext: boolean;
  externalSyncEnabled: boolean;
};

export type AutomationDailyUsage = {
  date: string;
  runs: number;
  reservedCalls: number;
  actualCalls: number;
  activities: number;
  scheduledBoards: OrganizationRunBoardType[];
};

export type AutomationRunRecord = {
  id: string;
  trigger: "scheduled" | "manual";
  boardType?: OrganizationRunBoardType;
  status: "published" | "review_pending" | "failed" | "skipped";
  geminiCallCount: number;
  activityCount: number;
  message: string;
  createdAt: string;
};

export type CharacterActivityMemory = {
  id: string;
  employeeId: string;
  boardType: OrganizationRunBoardType;
  postSlug: string;
  title: string;
  summary: string;
  stance?: string;
  participantIds: string[];
  createdAt: string;
};

export type CharacterRelationship = {
  employeeId: string;
  counterpartEmployeeId: string;
  interactionCount: number;
  relationshipScore?: number;
  boardTypes: OrganizationRunBoardType[];
  lastPostSlug: string;
  lastInteractionAt: string;
};

export type CharacterAdaptiveContext = {
  employeeId: string;
  evidenceCount: number;
  preferredBoards: OrganizationRunBoardType[];
  collaborationMode: string;
  activityPattern: string;
  updatedAt?: string;
};

export type CharacterContextRecordCategory =
  | "story"
  | "history"
  | "relationship"
  | "setting"
  | "memory";

export type CharacterContextRecord = {
  id: string;
  employeeId: string;
  category: CharacterContextRecordCategory;
  title: string;
  body: string;
  relatedEmployeeId?: string;
  evidenceUrl?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExternalActivitySource = {
  id: string;
  employeeId: string;
  platform: ExternalActivityPlatform;
  label: string;
  mode: "rss" | "webhook";
  sourceUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExternalActivitySyncRun = {
  id: string;
  status: "completed" | "partial" | "failed";
  imported: number;
  skipped: number;
  errors: string[];
  createdAt: string;
};

export type AutomationSnapshot = {
  configured: boolean;
  providerConfigured: boolean;
  freeTierConfirmed: boolean;
  policy: AutomationPolicy;
  usage: AutomationDailyUsage;
  recentRuns: AutomationRunRecord[];
  sources: ExternalActivitySource[];
  recentSyncRuns: ExternalActivitySyncRun[];
  memories: CharacterActivityMemory[];
  relationships: CharacterRelationship[];
  adaptiveContexts: CharacterAdaptiveContext[];
};
