import type { GeminiConfig } from "@/lib/ai/config";
import {
  AIErrorCode,
  classifyAIRequestError,
  isAIProviderError,
} from "@/lib/ai/errors";
import {
  buildConsensusPrompt,
  buildContentDraftPrompt,
  buildCrossRebuttalPrompt,
  buildInitialResponsePrompt,
} from "@/lib/ai/prompts";
import {
  AIProviderName,
  type AIProvider,
  type StructuredOutputExecutor,
  type StructuredOutputRequest,
} from "@/lib/ai/types";
import {
  consensusSchema,
  contentDraftSchema,
  crossRebuttalSchema,
  initialResponseSchema,
  validateConsensus,
  validateContentDraft,
  validateCrossRebuttal,
  validateInitialResponse,
} from "@/lib/ai/validation";
import { createGeminiExecutor } from "./client";

type Validator<T> = (value: unknown) => T;

export class GeminiAIProvider implements AIProvider {
  readonly name = AIProviderName.Gemini;

  constructor(
    private readonly config: GeminiConfig,
    private readonly executor: StructuredOutputExecutor =
      createGeminiExecutor(config)
  ) {}

  private async request<T>(
    request: StructuredOutputRequest,
    validate: Validator<T>
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        return validate(await this.executor.execute(request));
      } catch (error) {
        if (
          isAIProviderError(error) &&
          (error.code === AIErrorCode.ResponseInvalid ||
            error.code === AIErrorCode.Configuration)
        ) {
          throw error;
        }

        const classified = classifyAIRequestError(error);
        if (attempt >= this.config.maxRetries) throw classified;
      }
    }

    throw classifyAIRequestError(
      new Error("Gemini 요청 재시도 한도를 초과했습니다.")
    );
  }

  generateInitialResponse(input: Parameters<AIProvider["generateInitialResponse"]>[0]) {
    return this.request(
      {
        schemaName: "initial_response",
        schema: initialResponseSchema,
        prompt: buildInitialResponsePrompt(input),
      },
      validateInitialResponse
    );
  }

  generateCrossRebuttal(input: Parameters<AIProvider["generateCrossRebuttal"]>[0]) {
    return this.request(
      {
        schemaName: "cross_rebuttal",
        schema: crossRebuttalSchema,
        prompt: buildCrossRebuttalPrompt(input),
      },
      validateCrossRebuttal
    );
  }

  generateConsensus(input: Parameters<AIProvider["generateConsensus"]>[0]) {
    return this.request(
      {
        schemaName: "discussion_consensus",
        schema: consensusSchema,
        prompt: buildConsensusPrompt(input),
      },
      validateConsensus
    );
  }

  generateContentDraft(input: Parameters<AIProvider["generateContentDraft"]>[0]) {
    return this.request(
      {
        schemaName: "content_draft",
        schema: contentDraftSchema,
        prompt: buildContentDraftPrompt(input),
      },
      validateContentDraft
    );
  }
}

export function createGeminiProvider(
  config: GeminiConfig,
  executor?: StructuredOutputExecutor
) {
  return new GeminiAIProvider(config, executor);
}
