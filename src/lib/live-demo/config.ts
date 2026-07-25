const DEFAULT_START_AT = "2026-07-25T20:00:00+09:00";
const DEFAULT_END_AT = "2026-07-25T23:00:00+09:00";

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function parseLimit(
  name: string,
  value: string | undefined,
  fallback: number,
  maximum: number
) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > maximum) {
    throw new LiveDemoConfigurationError(
      `${name}은 0~${maximum} 범위의 정수여야 합니다.`
    );
  }
  return parsed;
}

export class LiveDemoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveDemoConfigurationError";
  }
}

export type LiveDemoConfig = {
  modeEnabled: boolean;
  generationEnabled: boolean;
  autoPublish: boolean;
  startAt: Date;
  endAt: Date;
  triggerSecret?: string;
  maxTotalCalls: number;
  maxRetries: number;
  maxChatRuns: number;
  maxChatMessages: number;
  maxFeedPosts: number;
  maxDebateMessages: number;
};

export function getLiveDemoConfig(
  env: NodeJS.ProcessEnv = process.env
): LiveDemoConfig {
  const startAt = new Date(env.LIVE_DEMO_START_AT || DEFAULT_START_AT);
  const endAt = new Date(env.LIVE_DEMO_END_AT || DEFAULT_END_AT);
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    startAt >= endAt
  ) {
    throw new LiveDemoConfigurationError(
      "LIVE_DEMO_START_AT과 LIVE_DEMO_END_AT을 올바른 ISO 시각으로 설정해야 합니다."
    );
  }

  return {
    modeEnabled: parseBoolean(env.LIVE_DEMO_MODE, false),
    generationEnabled: parseBoolean(env.AI_GENERATION_ENABLED, false),
    autoPublish: parseBoolean(env.AI_AUTO_PUBLISH, true),
    startAt,
    endAt,
    triggerSecret: env.DEMO_TRIGGER_SECRET,
    maxTotalCalls: parseLimit(
      "AI_MAX_TOTAL_CALLS",
      env.AI_MAX_TOTAL_CALLS,
      40,
      40
    ),
    maxRetries: parseLimit("AI_MAX_RETRIES", env.AI_MAX_RETRIES, 1, 1),
    maxChatRuns: parseLimit(
      "AI_MAX_CHAT_RUNS",
      env.AI_MAX_CHAT_RUNS,
      18,
      18
    ),
    maxChatMessages: parseLimit(
      "AI_MAX_CHAT_MESSAGES",
      env.AI_MAX_CHAT_MESSAGES,
      30,
      30
    ),
    maxFeedPosts: parseLimit(
      "AI_MAX_FEED_POSTS",
      env.AI_MAX_FEED_POSTS,
      5,
      5
    ),
    maxDebateMessages: parseLimit(
      "AI_MAX_DEBATE_MESSAGES",
      env.AI_MAX_DEBATE_MESSAGES,
      10,
      10
    ),
  };
}

export function assertTriggerSecret(
  providedSecret: string | null,
  config: LiveDemoConfig
) {
  if (!config.triggerSecret || providedSecret !== config.triggerSecret) {
    throw new LiveDemoConfigurationError(
      "Live Demo Trigger 인증에 실패했습니다."
    );
  }
}

export function assertGenerationEnabled(config: LiveDemoConfig) {
  if (!config.modeEnabled || !config.generationEnabled) {
    throw new LiveDemoConfigurationError(
      "Live Demo AI 생성 Kill Switch가 비활성화되어 있습니다."
    );
  }
}

export function assertContentWindow(config: LiveDemoConfig, now = new Date()) {
  assertGenerationEnabled(config);
  if (now < config.startAt || now >= config.endAt) {
    throw new LiveDemoConfigurationError(
      "현재 시각은 Live Demo 콘텐츠 생성 허용 시간 밖입니다."
    );
  }
}

export function assertPlanWindow(config: LiveDemoConfig, now = new Date()) {
  assertGenerationEnabled(config);
  if (now >= config.endAt) {
    throw new LiveDemoConfigurationError(
      "Live Demo 종료 이후에는 TECT 계획을 생성할 수 없습니다."
    );
  }
}
