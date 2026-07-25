import type { OpenAIConfig } from "../config";
import { classifyAIRequestError, isAIProviderError, AIErrorCode } from "../errors";
import {
  buildConsensusPrompt,
  buildContentDraftPrompt,
  buildCrossRebuttalPrompt,
  buildInitialResponsePrompt,
} from "../prompts";
import type { AIProvider, StructuredOutputExecutor, StructuredOutputRequest } from "../types";
import { AIProviderName } from "../types";
import {
  consensusSchema,
  contentDraftSchema,
  crossRebuttalSchema,
  initialResponseSchema,
  validateConsensus,
  validateContentDraft,
  validateCrossRebuttal,
  validateInitialResponse,
} from "../validation";
import { createOpenAIExecutor } from "./client";

type Validator<T> = (value: unknown) => T;

export class OpenAIAIProvider implements AIProvider {
  readonly name = AIProviderName.OpenAI;

  constructor(
    private readonly config: OpenAIConfig,
    private readonly executor: StructuredOutputExecutor = createOpenAIExecutor(config)
  ) {}

  private async request<T>(request: StructuredOutputRequest, validate: Validator<T>): Promise<T> {
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        return validate(await this.executor.execute(request));
      } catch (error) {
        if (isAIProviderError(error) && (
          error.code === AIErrorCode.ResponseInvalid ||
          error.code === AIErrorCode.Configuration
        )) {
          throw error;
        }
        const classified = classifyAIRequestError(error);
        if (attempt >= this.config.maxRetries) throw classified;
      }
    }
    throw classifyAIRequestError(new Error("AI 요청 재시도 한도를 초과했습니다."));
  }

  generateInitialResponse(input: Parameters<AIProvider["generateInitialResponse"]>[0]) {
    return this.request(
      { schemaName: "initial_response", schema: initialResponseSchema, prompt: buildInitialResponsePrompt(input) },
      validateInitialResponse
    );
  }

  generateCrossRebuttal(input: Parameters<AIProvider["generateCrossRebuttal"]>[0]) {
    return this.request(
      { schemaName: "cross_rebuttal", schema: crossRebuttalSchema, prompt: buildCrossRebuttalPrompt(input) },
      validateCrossRebuttal
    );
  }

  generateConsensus(input: Parameters<AIProvider["generateConsensus"]>[0]) {
    return this.request(
      { schemaName: "discussion_consensus", schema: consensusSchema, prompt: buildConsensusPrompt(input) },
      validateConsensus
    );
  }

  generateContentDraft(input: Parameters<AIProvider["generateContentDraft"]>[0]) {
    return this.request(
      { schemaName: "content_draft", schema: contentDraftSchema, prompt: buildContentDraftPrompt(input) },
      validateContentDraft
    );
  }
}

export function createOpenAIProvider(
  config: OpenAIConfig,
  executor?: StructuredOutputExecutor
) {
  return new OpenAIAIProvider(config, executor);
}
