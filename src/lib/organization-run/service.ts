import { randomUUID } from "node:crypto";

import type {
  OrganizationRunBoardType,
  OrganizationRunResult,
  OrganizationRunStage,
} from "@/types";

import { getOrganizationRunCanonicalEmployees } from "./canonical-employees";
import { GeminiOrganizationRunGenerator } from "./gemini-generator";
import { getOrganizationRunPublisher } from "./kv-publisher";
import { buildOrganizationRunPost } from "./post-builder";
import { validateOrganizationRunTopic } from "./topic-validation";
import type {
  OrganizationRunGenerator,
  OrganizationRunPublisher,
} from "./types";

const LOCK_TTL_SECONDS = 180;
const RATE_LIMIT = 6;
const RATE_WINDOW_SECONDS = 60 * 60;

export class OrganizationRunError extends Error {
  constructor(
    message: string,
    readonly stage: Exclude<OrganizationRunStage, "idle" | "completed">,
    readonly statusCode = 500,
    readonly retryable = true
  ) {
    super(message);
    this.name = "OrganizationRunError";
  }
}

export type OrganizationRunProgress = (
  stage: Exclude<OrganizationRunStage, "idle" | "completed" | "failed">
) => void;

export async function runAIOrganization(input: {
  generator: OrganizationRunGenerator;
  publisher: OrganizationRunPublisher;
  forcedBoardType?: OrganizationRunBoardType;
  onProgress?: OrganizationRunProgress;
}): Promise<OrganizationRunResult> {
  const runId = randomUUID();
  const lockToken = randomUUID();
  let geminiCallCount = 0;
  let stage: OrganizationRunError["stage"] = "topic";

  const allowed = await input.publisher.consumeRateLimit(
    RATE_LIMIT,
    RATE_WINDOW_SECONDS
  );
  if (!allowed) {
    throw new OrganizationRunError(
      "시간당 실행 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
      "topic",
      429,
      true
    );
  }
  const locked = await input.publisher.acquireExecutionLock(
    lockToken,
    LOCK_TTL_SECONDS
  );
  if (!locked) {
    throw new OrganizationRunError(
      "다른 조직 실행이 진행 중입니다.",
      "topic",
      409,
      true
    );
  }

  try {
    const existingPosts = await input.publisher.listPosts();
    const existingSummaries = [
      ...existingPosts.map((post) => post.summary),
      ...(await input.publisher.listTopicSummaries()),
    ];

    input.onProgress?.("topic");
    let topic = await input.generator.generateTopic({
      existingSummaries,
      forcedBoardType: input.forcedBoardType,
    });
    geminiCallCount += 1;
    let validation = validateOrganizationRunTopic(topic, existingSummaries);
    if (!validation.valid) {
      topic = await input.generator.generateTopic({
        existingSummaries: [
          ...existingSummaries,
          `이전 생성 실패 사유: ${validation.errors.join(" / ")}`,
        ],
        forcedBoardType: input.forcedBoardType,
      });
      geminiCallCount += 1;
      validation = validateOrganizationRunTopic(topic, existingSummaries);
    }
    if (!validation.valid) {
      throw new OrganizationRunError(
        `주제 검증 실패: ${validation.errors.join(" ")}`,
        "validation",
        422,
        false
      );
    }

    stage = "board";
    input.onProgress?.("board");
    const employeeIds = topic.relevantEmployeeIds;
    stage = "employees";
    input.onProgress?.("employees");
    const employees = await getOrganizationRunCanonicalEmployees(employeeIds);

    stage = "reactions";
    input.onProgress?.("reactions");
    const reactions = await input.generator.generateReactions({
      topic,
      employees,
    });
    geminiCallCount += 1;

    stage = "validation";
    input.onProgress?.("validation");
    if (
      reactions.length !== employeeIds.length ||
      reactions.some((reaction) => !employeeIds.includes(reaction.employeeId))
    ) {
      throw new OrganizationRunError(
        "직원 반응 검증에 실패했습니다.",
        "validation",
        422,
        false
      );
    }

    const post = buildOrganizationRunPost({
      runId,
      topic,
      reactions,
    });
    stage = "publishing";
    input.onProgress?.("publishing");
    await input.publisher.publish(post, runId);

    return {
      runId,
      status: "completed",
      stage: "completed",
      boardType: topic.boardType,
      title: topic.title,
      participantIds: employeeIds,
      publicUrl: `/discussion/${post.slug}`,
      geminiCallCount,
      post,
    };
  } catch (error) {
    if (error instanceof OrganizationRunError) throw error;
    throw new OrganizationRunError(
      error instanceof Error ? error.message : "조직 실행에 실패했습니다.",
      stage,
      500,
      true
    );
  } finally {
    await input.publisher.releaseExecutionLock(lockToken);
  }
}

export async function runAIOrganizationFromEnvironment(input?: {
  forcedBoardType?: OrganizationRunBoardType;
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new OrganizationRunError(
      "GEMINI_API_KEY가 설정되지 않았습니다.",
      "topic",
      503,
      true
    );
  }
  const publisher = getOrganizationRunPublisher();
  if (!publisher) {
    throw new OrganizationRunError(
      "KV 저장소 환경변수가 설정되지 않았습니다.",
      "publishing",
      503,
      true
    );
  }
  return runAIOrganization({
    generator: new GeminiOrganizationRunGenerator(apiKey),
    publisher,
    forcedBoardType: input?.forcedBoardType,
  });
}

export const organizationRunPolicy = {
  lockTtlSeconds: LOCK_TTL_SECONDS,
  rateLimit: RATE_LIMIT,
  rateWindowSeconds: RATE_WINDOW_SECONDS,
};
