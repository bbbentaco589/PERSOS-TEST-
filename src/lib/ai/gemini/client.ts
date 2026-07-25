import { GoogleGenAI } from "@google/genai";

import type { GeminiConfig } from "@/lib/ai/config";
import { AIErrorCode, AIProviderError } from "@/lib/ai/errors";
import type {
  StructuredOutputExecutor,
  StructuredOutputRequest,
} from "@/lib/ai/types";

export type GeminiUsage = {
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type GeminiStructuredResult = {
  value: string;
  usage: GeminiUsage;
  model: string;
  latencyMs: number;
};

export class GeminiStructuredClient {
  private readonly client: GoogleGenAI;

  constructor(private readonly config: GeminiConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async execute(
    request: StructuredOutputRequest,
    systemInstruction =
      "PERSOS AI Company의 한국어 우선 정책을 따르고 요청된 JSON Schema만 반환하세요."
  ): Promise<GeminiStructuredResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const startedAt = Date.now();

    try {
      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: request.prompt,
        config: {
          abortSignal: controller.signal,
          systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: request.schema,
          temperature: 0.55,
        },
      });

      if (!response.text) {
        throw new AIProviderError(
          AIErrorCode.ResponseInvalid,
          "Gemini가 비어 있는 응답을 반환했습니다.",
          502
        );
      }

      return {
        value: response.text,
        model: response.modelVersion ?? this.config.model,
        latencyMs: Date.now() - startedAt,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
        },
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createGeminiExecutor(
  config: GeminiConfig
): StructuredOutputExecutor {
  const client = new GeminiStructuredClient(config);
  return {
    async execute(request) {
      return (await client.execute(request)).value;
    },
  };
}
