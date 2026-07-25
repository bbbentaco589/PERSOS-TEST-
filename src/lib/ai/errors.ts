export const AIErrorCode = {
  Configuration: "AI_CONFIGURATION_ERROR",
  RequestFailed: "AI_REQUEST_FAILED",
  ResponseInvalid: "AI_RESPONSE_INVALID",
  RateLimited: "AI_RATE_LIMITED",
  Timeout: "AI_TIMEOUT",
  DiscussionGenerationFailed: "DISCUSSION_GENERATION_FAILED",
} as const;

export type AIErrorCode = (typeof AIErrorCode)[keyof typeof AIErrorCode];

export class AIProviderError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly httpStatus: number,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "AIProviderError";
  }
}

export function isAIProviderError(error: unknown): error is AIProviderError {
  return error instanceof AIProviderError;
}

export function classifyAIRequestError(error: unknown): AIProviderError {
  if (isAIProviderError(error)) return error;

  const candidate = error as { name?: string; status?: number; code?: string };
  if (candidate.status === 429 || candidate.code === "rate_limit_exceeded") {
    return new AIProviderError(
      AIErrorCode.RateLimited,
      "AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
      429,
      { cause: error }
    );
  }
  if (
    candidate.name === "APIConnectionTimeoutError" ||
    candidate.name === "AbortError" ||
    candidate.code === "ETIMEDOUT"
  ) {
    return new AIProviderError(
      AIErrorCode.Timeout,
      "AI 응답 시간이 초과되었습니다. 다시 시도해주세요.",
      504,
      { cause: error }
    );
  }

  return new AIProviderError(
    AIErrorCode.RequestFailed,
    "AI 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
    502,
    { cause: error }
  );
}
