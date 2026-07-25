import assert from "node:assert/strict";
import test from "node:test";

import { characters, sources, topics } from "@/data";
import { getAIConfig, type OpenAIConfig } from "@/lib/ai/config";
import { AIErrorCode, AIProviderError } from "@/lib/ai/errors";
import { OpenAIAIProvider } from "@/lib/ai/openai/openai-ai-provider";
import { AIProviderName, type StructuredOutputExecutor } from "@/lib/ai/types";

const config: OpenAIConfig = {
  provider: AIProviderName.OpenAI,
  apiKey: "test-key",
  model: "test-model",
  timeoutMs: 1_000,
  maxRetries: 1,
};
const input = {
  topic: topics[0], sources, character: characters[0], outputLanguage: "ko" as const,
  lengthConstraint: "350~550자",
};

class QueueExecutor implements StructuredOutputExecutor {
  calls = 0;
  constructor(private readonly results: Array<unknown | Error>) {}
  async execute() {
    const result = this.results[Math.min(this.calls, this.results.length - 1)];
    this.calls += 1;
    if (result instanceof Error) throw result;
    return result;
  }
}

const valid = {
  characterId: characters[0].id,
  position: "확률적 조건을 먼저 확인합니다.",
  reasoning: "근거 범위와 불확실성을 비교했습니다.",
  response: "현재는 단정 대신 조건별 시나리오가 필요합니다.",
  sourceReferences: [sources[0].id],
};

test("OpenAI Provider가 정상 Structured Response를 검증한다", async () => {
  const executor = new QueueExecutor([JSON.stringify(valid)]);
  const result = await new OpenAIAIProvider(config, executor).generateInitialResponse(input);
  assert.deepEqual(result, valid);
  assert.equal(executor.calls, 1);
});

test("Invalid JSON과 필수 필드 누락은 재시도 없이 거부한다", async () => {
  for (const invalid of ["{invalid", { characterId: characters[0].id }]) {
    const executor = new QueueExecutor([invalid]);
    await assert.rejects(
      new OpenAIAIProvider(config, executor).generateInitialResponse(input),
      (error: unknown) => error instanceof AIProviderError && error.code === AIErrorCode.ResponseInvalid
    );
    assert.equal(executor.calls, 1);
  }
});

test("Timeout, Rate Limit, API Failure를 구분하고 최대 1회 재시도한다", async () => {
  const timeout = Object.assign(new Error("timeout"), { name: "APIConnectionTimeoutError" });
  const rateLimit = Object.assign(new Error("rate"), { status: 429 });
  const apiFailure = Object.assign(new Error("failure"), { status: 500 });
  const cases = [
    { error: timeout, code: AIErrorCode.Timeout },
    { error: rateLimit, code: AIErrorCode.RateLimited },
    { error: apiFailure, code: AIErrorCode.RequestFailed },
  ];

  for (const item of cases) {
    const executor = new QueueExecutor([item.error, item.error]);
    await assert.rejects(
      new OpenAIAIProvider(config, executor).generateInitialResponse(input),
      (error: unknown) => error instanceof AIProviderError && error.code === item.code
    );
    assert.equal(executor.calls, 2);
  }
});

test("일시적 API 실패 후 1회 재시도로 성공할 수 있다", async () => {
  const executor = new QueueExecutor([Object.assign(new Error("temporary"), { status: 500 }), valid]);
  const result = await new OpenAIAIProvider(config, executor).generateInitialResponse(input);
  assert.equal(result.characterId, characters[0].id);
  assert.equal(executor.calls, 2);
});

test("OpenAI 설정 누락은 비밀값 없이 한국어 오류를 반환한다", () => {
  assert.throws(
    () => getAIConfig({ ...process.env, AI_PROVIDER: "openai", OPENAI_API_KEY: "" }),
    (error: unknown) => error instanceof AIProviderError &&
      error.code === AIErrorCode.Configuration &&
      error.message.includes("OPENAI_API_KEY")
  );
  assert.throws(
    () => getAIConfig({
      ...process.env,
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "never-print-this-secret",
      OPENAI_MODEL: "",
    }),
    (error: unknown) => error instanceof AIProviderError &&
      error.code === AIErrorCode.Configuration &&
      error.message.includes("OPENAI_MODEL") &&
      !error.message.includes("never-print-this-secret")
  );
});
