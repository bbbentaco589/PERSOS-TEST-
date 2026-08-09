import { AIProviderError, AIErrorCode } from "./errors";
import { readAIEnvironment } from "./env";
import { AIProviderName, type AIProviderName as AIProviderNameValue } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

export type MockAIConfig = { provider: typeof AIProviderName.Mock };
export type OpenAIConfig = {
  provider: typeof AIProviderName.OpenAI;
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: 1;
};
export type GeminiConfig = {
  provider: typeof AIProviderName.Gemini;
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: 1;
};
export type AIConfig = MockAIConfig | OpenAIConfig | GeminiConfig;

export function getAIProviderName(env: NodeJS.ProcessEnv = process.env): AIProviderNameValue {
  const value = readAIEnvironment(env).provider;
  if (!value || value === AIProviderName.Mock) return AIProviderName.Mock;
  if (value === AIProviderName.OpenAI) return AIProviderName.OpenAI;
  if (value === AIProviderName.Gemini) return AIProviderName.Gemini;

  throw new AIProviderError(
    AIErrorCode.Configuration,
    `지원하지 않는 AI_PROVIDER 값입니다: ${value}`,
    500
  );
}

export function getAIConfig(env: NodeJS.ProcessEnv = process.env): AIConfig {
  const provider = getAIProviderName(env);
  if (provider === AIProviderName.Mock) return { provider };

  const values = readAIEnvironment(env);
  if (provider === AIProviderName.Gemini) {
    if (!values.geminiApiKey) {
      throw new AIProviderError(
        AIErrorCode.Configuration,
        "Gemini Provider를 사용하려면 GEMINI_API_KEY가 필요합니다.",
        500
      );
    }

    const timeoutMs = values.geminiTimeoutMs
      ? Number(values.geminiTimeoutMs)
      : DEFAULT_TIMEOUT_MS;
    if (!Number.isFinite(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 120_000) {
      throw new AIProviderError(
        AIErrorCode.Configuration,
        "GEMINI_TIMEOUT_MS는 1000~120000 범위의 숫자여야 합니다.",
        500
      );
    }

    return {
      provider,
      apiKey: values.geminiApiKey,
      model: values.geminiModel || DEFAULT_GEMINI_MODEL,
      timeoutMs,
      maxRetries: 1,
    };
  }

  if (!values.openAIApiKey) {
    throw new AIProviderError(
      AIErrorCode.Configuration,
      "OpenAI Provider를 사용하려면 OPENAI_API_KEY가 필요합니다.",
      500
    );
  }
  if (!values.openAIModel) {
    throw new AIProviderError(
      AIErrorCode.Configuration,
      "OpenAI Provider를 사용하려면 OPENAI_MODEL이 필요합니다.",
      500
    );
  }

  const timeoutMs = values.openAITimeoutMs
    ? Number(values.openAITimeoutMs)
    : DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 120_000) {
    throw new AIProviderError(
      AIErrorCode.Configuration,
      "OPENAI_TIMEOUT_MS는 1000~120000 범위의 숫자여야 합니다.",
      500
    );
  }

  return {
    provider,
    apiKey: values.openAIApiKey,
    model: values.openAIModel,
    timeoutMs,
    maxRetries: 1,
  };
}
