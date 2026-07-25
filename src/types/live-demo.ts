export const LiveDemoContentType = {
  Feed: "feed",
  Debate: "debate",
  Anonymous: "anonymous",
} as const;

export type LiveDemoContentType =
  (typeof LiveDemoContentType)[keyof typeof LiveDemoContentType];

export const LiveDemoGenerationStatus = {
  Generating: "generating",
  Draft: "draft",
  QAPassed: "qa_passed",
  Published: "published",
  QARejected: "qa_rejected",
  Failed: "failed",
  LimitReached: "limit_reached",
} as const;

export type LiveDemoGenerationStatus =
  (typeof LiveDemoGenerationStatus)[keyof typeof LiveDemoGenerationStatus];

export type LiveDemoStance = "support" | "oppose" | "neutral";
export type LiveDemoDebateRound = "opening" | "rebuttal" | "summary";
export type LiveDemoTrigger = "runner" | "manual" | "api";

export type LiveDemoPersonaAssignment = {
  personaId: string;
  stance: LiveDemoStance;
  responsibility: string;
};

export type LiveDemoFeedAssignment = {
  order: number;
  personaId: string;
  title: string;
  activityType: string;
  scheduledAt: string;
};

export type LiveDemoDebateSchedule = {
  order: number;
  personaId: string;
  stance: LiveDemoStance;
  round: LiveDemoDebateRound;
  scheduledAt: string;
};

export type LiveDemoContentPlan = {
  id: string;
  status: "active" | "completed" | "cancelled";
  debateTopicId: string;
  debateTitle: string;
  debateDescription: string;
  debateAssignments: LiveDemoPersonaAssignment[];
  debateSchedule: LiveDemoDebateSchedule[];
  anonymousTopicId: string;
  anonymousTopicTitle: string;
  feedAssignments: LiveDemoFeedAssignment[];
  startsAt: string;
  endsAt: string;
  createdByPersonaId: string;
  createdAt: string;
  updatedAt: string;
};

export type LiveDemoGeneratedContent = {
  id: string;
  planId: string;
  contentType: LiveDemoContentType;
  personaId: string;
  topicId: string;
  title: string;
  sourceBody: string;
  publicBody: string;
  status: LiveDemoGenerationStatus;
  activityType?: string;
  stance?: LiveDemoStance;
  round?: LiveDemoDebateRound;
  replyToId?: string;
  metadata: Record<string, unknown>;
  scheduledAt?: string;
  createdAt: string;
  publishedAt?: string;
  failureReason?: string;
};

export type LiveDemoGenerationRun = {
  id: string;
  planId?: string;
  trigger: LiveDemoTrigger;
  contentType: LiveDemoContentType | "plan";
  status: LiveDemoGenerationStatus;
  attempt: number;
  startedAt: string;
  finishedAt?: string;
  failureReason?: string;
  metadata: Record<string, unknown>;
};

export type LiveDemoUsageLog = {
  id: string;
  runId: string;
  provider: "gemini";
  model: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  createdAt: string;
};

export type LiveDemoState = {
  id: "investor-live-demo";
  killSwitch: boolean;
  totalCalls: number;
  chatRuns: number;
  chatMessages: number;
  feedPosts: number;
  debateMessages: number;
  updatedAt: string;
};

export type LiveDemoCounterDelta = Partial<
  Pick<
    LiveDemoState,
    "chatRuns" | "chatMessages" | "feedPosts" | "debateMessages"
  >
>;

export type LiveDemoStructuredContent = {
  personaId: string;
  contentType: LiveDemoContentType;
  topicId: string;
  title: string;
  body: string;
  stance?: LiveDemoStance;
  round?: LiveDemoDebateRound;
  replyToId?: string | null;
  activityType?: string;
  metadata: Record<string, string | number | boolean>;
};

export type LiveDemoRepositoryFilter = {
  contentType?: LiveDemoContentType;
  status?: LiveDemoGenerationStatus;
  limit?: number;
};
