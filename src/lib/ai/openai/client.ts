import OpenAI from "openai";

import { AIErrorCode, AIProviderError } from "../errors";
import type { OpenAIConfig } from "../config";
import type { StructuredOutputExecutor } from "../types";

export function createOpenAIExecutor(config: OpenAIConfig): StructuredOutputExecutor {
  const client = new OpenAI({
    apiKey: config.apiKey,
    timeout: config.timeoutMs,
    maxRetries: 0,
  });

  return {
    async execute(request) {
      const response = await client.responses.create({
        model: config.model,
        instructions: "Ptudio AI Company Intranet BETA의 한국어 우선 정책을 따르고 요청된 JSON Schema만 반환하세요.",
        input: request.prompt,
        text: {
          format: {
            type: "json_schema",
            name: request.schemaName,
            strict: true,
            schema: request.schema,
          },
        },
      });

      if (!response.output_text) {
        throw new AIProviderError(
          AIErrorCode.ResponseInvalid,
          "OpenAI가 비어 있는 응답을 반환했습니다.",
          502
        );
      }
      return response.output_text;
    },
  };
}
