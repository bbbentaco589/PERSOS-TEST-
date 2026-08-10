import { randomUUID } from "node:crypto";

import type {
  EmployeeReactionPost,
  ManualOrganizationRunInput,
  ManualOrganizationRunResult,
  OrganizationRunBoardType,
  OrganizationRunReviewItem,
  OrganizationRunResult,
  OrganizationRunStage,
} from "@/types";

import { getOrganizationRunCanonicalEmployees } from "./canonical-employees";
import { runOrganizationRunAutomatedQA } from "./automated-qa";
import { GeminiOrganizationRunGenerator } from "./gemini-generator";
import { getOrganizationRunPublisher } from "./kv-publisher";
import { createManualOrganizationRunTopic } from "./manual-input";
import { buildOrganizationRunPost } from "./post-builder";
import { validateOrganizationRunTopic } from "./topic-validation";
import type {
  OrganizationRunGenerator,
  OrganizationRunPublisher,
} from "./types";

const LOCK_TTL_SECONDS = 180;
const RATE_LIMIT = 6;
const RATE_WINDOW_SECONDS = 60 * 60;

function requiresFounderReview(env: NodeJS.ProcessEnv = process.env) {
  return env.AI_REQUIRE_FOUNDER_REVIEW?.trim().toLowerCase() === "true";
}

function createReviewItem(input: {
  runId: string;
  boardType: OrganizationRunBoardType;
  title: string;
  reasons: string[];
  riskLevel: OrganizationRunReviewItem["riskLevel"];
  post?: OrganizationRunReviewItem["post"];
}) {
  const now = new Date().toISOString();
  return {
    id: `review-${input.runId}`,
    runId: input.runId,
    status: "review_pending" as const,
    boardType: input.boardType,
    title: input.title,
    post: input.post,
    reasons: input.reasons,
    riskLevel: input.riskLevel,
    createdAt: now,
    updatedAt: now,
  } satisfies OrganizationRunReviewItem;
}

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
  fullReviewMode?: boolean;
  onProgress?: OrganizationRunProgress;
}): Promise<OrganizationRunResult> {
  const runId = randomUUID();
  const lockToken = randomUUID();
  let geminiCallCount = 0;
  let stage: OrganizationRunError["stage"] = "topic";
  let queuedForReview = false;
  let topicForFailure: { boardType: OrganizationRunBoardType; title: string } | undefined;
  let postForFailure: EmployeeReactionPost | undefined;

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
    topicForFailure = { boardType: topic.boardType, title: topic.title };
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
      topicForFailure = { boardType: topic.boardType, title: topic.title };
      validation = validateOrganizationRunTopic(topic, existingSummaries);
    }
    if (!validation.valid) {
      await input.publisher.saveReviewItem(
        createReviewItem({
          runId,
          boardType: topic.boardType,
          title: topic.title,
          reasons: validation.errors,
          riskLevel: "medium",
        })
      );
      queuedForReview = true;
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
    geminiCallCount += employees.length;

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
    postForFailure = post;
    const qa = runOrganizationRunAutomatedQA({
      topic,
      post,
      employees,
      recentPosts: existingPosts,
    });
    const fullReviewMode = input.fullReviewMode ?? requiresFounderReview();
    if (qa.requiresReview || fullReviewMode) {
      stage = "review";
      const reviewItem = createReviewItem({
        runId,
        boardType: topic.boardType,
        title: topic.title,
        post,
        reasons: fullReviewMode
          ? [...qa.reasons, "초기 테스트 전건 검수 모드"]
          : qa.reasons,
        riskLevel: fullReviewMode && qa.riskLevel === "low" ? "medium" : qa.riskLevel,
      });
      await input.publisher.saveReviewItem(reviewItem);
      queuedForReview = true;
      return {
        runId,
        status: "completed",
        stage: "completed",
        boardType: topic.boardType,
        title: topic.title,
        participantIds: employeeIds,
        geminiCallCount,
        post,
        published: false,
        reviewPending: true,
        reviewItemId: reviewItem.id,
      };
    }

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
      published: true,
      reviewPending: false,
    };
  } catch (error) {
    if (!queuedForReview && topicForFailure) {
      try {
        await input.publisher.saveReviewItem(
          createReviewItem({
            runId,
            boardType: topicForFailure.boardType,
            title: topicForFailure.title,
            reasons: ["Runtime 시스템 오류로 자동 공개를 보류함"],
            riskLevel: "high",
            post: postForFailure,
          })
        );
      } catch {
        // Preserve the original runtime error when the exception queue is unavailable.
      }
    }
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

export async function runManualAIOrganization(input: {
  generator: OrganizationRunGenerator;
  publisher: OrganizationRunPublisher;
  manualInput: ManualOrganizationRunInput;
  fullReviewMode?: boolean;
  onProgress?: OrganizationRunProgress;
}): Promise<ManualOrganizationRunResult> {
  const runId = randomUUID();
  const lockToken = randomUUID();
  let stage: OrganizationRunError["stage"] = "topic";
  let queuedForReview = false;
  let postForFailure: EmployeeReactionPost | undefined;

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
    const topic = createManualOrganizationRunTopic(input.manualInput);
    const validation = validateOrganizationRunTopic(topic, existingSummaries);
    if (!validation.valid) {
      throw new OrganizationRunError(
        `주제 검증 실패: ${validation.errors.join(" ")}`,
        "validation",
        422,
        false
      );
    }

    stage = "employees";
    input.onProgress?.("employees");
    const employees = await getOrganizationRunCanonicalEmployees(
      topic.relevantEmployeeIds
    );

    stage = "reactions";
    input.onProgress?.("reactions");
    const reactions = await input.generator.generateReactions({
      topic,
      employees,
    });

    stage = "validation";
    input.onProgress?.("validation");
    if (
      reactions.length !== topic.relevantEmployeeIds.length ||
      reactions.some(
        (reaction) =>
          !topic.relevantEmployeeIds.includes(reaction.employeeId)
      )
    ) {
      throw new OrganizationRunError(
        "직원 반응 검증에 실패했습니다.",
        "validation",
        422,
        false
      );
    }

    const post = buildOrganizationRunPost({ runId, topic, reactions });
    postForFailure = post;
    const qa = runOrganizationRunAutomatedQA({
      topic,
      post,
      employees,
      recentPosts: existingPosts,
    });
    const fullReviewMode = input.fullReviewMode ?? requiresFounderReview();
    if (input.manualInput.publish && (qa.requiresReview || fullReviewMode)) {
      stage = "review";
      const reviewItem = createReviewItem({
        runId,
        boardType: topic.boardType,
        title: topic.title,
        post,
        reasons: fullReviewMode
          ? [...qa.reasons, "초기 테스트 전건 검수 모드"]
          : qa.reasons,
        riskLevel: fullReviewMode && qa.riskLevel === "low" ? "medium" : qa.riskLevel,
      });
      await input.publisher.saveReviewItem(reviewItem);
      queuedForReview = true;
      return {
        runId,
        status: "completed",
        stage: "completed",
        boardType: topic.boardType,
        title: topic.title,
        participantIds: topic.relevantEmployeeIds,
        geminiCallCount: employees.length,
        post,
        published: false,
        reviewPending: true,
        reviewItemId: reviewItem.id,
      };
    }
    if (input.manualInput.publish) {
      stage = "publishing";
      input.onProgress?.("publishing");
      await input.publisher.publish(post, runId);
    }

    return {
      runId,
      status: "completed",
      stage: "completed",
      boardType: topic.boardType,
      title: topic.title,
      participantIds: topic.relevantEmployeeIds,
      publicUrl: input.manualInput.publish
        ? `/discussion/${post.slug}`
        : undefined,
      geminiCallCount: employees.length,
      post,
      published: input.manualInput.publish,
      reviewPending: false,
    };
  } catch (error) {
    if (!queuedForReview) {
      try {
        await input.publisher.saveReviewItem(
          createReviewItem({
            runId,
            boardType: input.manualInput.boardType,
            title: input.manualInput.title,
            reasons: ["Runtime 시스템 오류로 자동 공개를 보류함"],
            riskLevel: "high",
            post: postForFailure,
          })
        );
      } catch {
        // Preserve the original runtime error when the exception queue is unavailable.
      }
    }
    if (error instanceof OrganizationRunError) throw error;
    throw new OrganizationRunError(
      error instanceof Error ? error.message : "수동 조직 실행에 실패했습니다.",
      stage,
      500,
      true
    );
  } finally {
    await input.publisher.releaseExecutionLock(lockToken);
  }
}

export async function runManualAIOrganizationFromEnvironment(
  manualInput: ManualOrganizationRunInput
) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new OrganizationRunError(
      "GEMINI_API_KEY가 설정되지 않았습니다.",
      "reactions",
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
  return runManualAIOrganization({
    generator: new GeminiOrganizationRunGenerator(apiKey),
    publisher,
    manualInput,
  });
}

export const organizationRunPolicy = {
  lockTtlSeconds: LOCK_TTL_SECONDS,
  rateLimit: RATE_LIMIT,
  rateWindowSeconds: RATE_WINDOW_SECONDS,
};
