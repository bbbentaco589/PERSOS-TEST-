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
import {
  selectPublicFeedAuthorEmployeeId,
  shouldGenerateAuthorReply,
} from "./public-feed-interactions";
import { validateOrganizationRunTopic } from "./topic-validation";
import type {
  OrganizationRunGenerator,
  OrganizationRunPublisher,
} from "./types";
import {
  getAutomationPolicy,
  isFreeTierConfirmed,
  reserveAutomationBudget,
  saveAutomationRun,
  settleAutomationBudget,
} from "@/lib/automation-control-store";

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

async function generatePublicFeedInteractions(input: {
  generator: OrganizationRunGenerator;
  topic: Parameters<OrganizationRunGenerator["generateReactions"]>[0]["topic"];
  employees: Parameters<OrganizationRunGenerator["generateReactions"]>[0]["employees"];
  reactions: Awaited<ReturnType<OrganizationRunGenerator["generateReactions"]>>;
}) {
  if (input.topic.boardType !== "public") {
    return { authorEmployeeId: undefined, replies: [], replyCallCount: 0 };
  }

  const authorEmployeeId = selectPublicFeedAuthorEmployeeId(
    input.topic.relevantEmployeeIds
  );
  const author = input.employees.find(
    ({ employee }) => employee.id === authorEmployeeId
  );
  const authorOpinion = input.reactions.find(
    (reaction) => reaction.employeeId === authorEmployeeId
  );
  if (!author || !authorOpinion) {
    throw new OrganizationRunError(
      "공개 피드 게시자 판단을 찾지 못했습니다.",
      "validation",
      422,
      false
    );
  }

  const comments = input.reactions.flatMap((comment) => {
    if (comment.employeeId === authorEmployeeId) return [];
    const commenter = input.employees.find(
      ({ employee }) => employee.id === comment.employeeId
    );
    if (!commenter) return [];
    const commentText = [
      comment.coreOpinion,
      comment.concerns,
      comment.suggestion,
    ].join(" ");
    return shouldGenerateAuthorReply({
      interactionType: comment.interactionType,
      commentText,
      authorStance: authorOpinion.stance,
      commentStance: comment.stance,
    })
      ? [{ commenter, comment }]
      : [];
  });

  const replies = input.generator.generateAuthorReplies && comments.length
    ? await input.generator.generateAuthorReplies({
        topic: input.topic,
        author,
        authorOpinion,
        comments,
      })
    : [];
  return {
    authorEmployeeId,
    replies,
    replyCallCount: replies.length,
  };
}

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
    const canonicalEmployees = await getOrganizationRunCanonicalEmployees(employeeIds);
    const memoryContexts = await input.publisher.getCharacterMemoryContexts?.(employeeIds);
    const employees = canonicalEmployees.map((employee) => ({
      ...employee,
      activityMemory: memoryContexts?.[employee.employee.id],
    }));

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

    const interactions = await generatePublicFeedInteractions({
      generator: input.generator,
      topic,
      employees,
      reactions,
    });
    geminiCallCount += interactions.replyCallCount;

    const post = buildOrganizationRunPost({
      runId,
      topic,
      reactions,
      authorEmployeeId: interactions.authorEmployeeId,
      replies: interactions.replies,
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
  trigger?: "scheduled" | "manual";
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
  const trigger = input?.trigger ?? "manual";
  const policy = await getAutomationPolicy();
  const reservedCalls = 2 + policy.maxParticipants * 2 - 1;
  if (trigger === "scheduled") {
    if (!policy.enabled) {
      await saveAutomationRun({ trigger, boardType: input?.forcedBoardType, status: "skipped", geminiCallCount: 0, message: "자동 소통 Kill Switch가 꺼져 있습니다." });
      throw new OrganizationRunError("자동 소통이 관리자 설정에서 중지되어 있습니다.", "topic", 409, false);
    }
    if (!isFreeTierConfirmed()) {
      await saveAutomationRun({ trigger, boardType: input?.forcedBoardType, status: "skipped", geminiCallCount: 0, message: "Gemini 무료 프로젝트 확인 가드가 설정되지 않았습니다." });
      throw new OrganizationRunError("AI_AUTOMATION_FREE_TIER_CONFIRMED=true 확인 전에는 예약 AI 호출을 실행하지 않습니다.", "topic", 412, false);
    }
    const reservation = await reserveAutomationBudget({ policy, expectedCalls: reservedCalls });
    if (!reservation.allowed) {
      const message = reservation.reason === "daily_run_limit" ? "일일 자동 실행 상한에 도달했습니다." : "일일 Gemini 호출 상한에 도달했습니다.";
      await saveAutomationRun({ trigger, boardType: input?.forcedBoardType, status: "skipped", geminiCallCount: 0, message });
      throw new OrganizationRunError(message, "topic", 429, false);
    }
  }
  try {
    const result = await runAIOrganization({
      generator: new GeminiOrganizationRunGenerator(apiKey),
      publisher,
      forcedBoardType: input?.forcedBoardType,
      fullReviewMode: trigger === "scheduled" ? !policy.autoPublish : undefined,
    });
    if (trigger === "scheduled") {
      await settleAutomationBudget({ reservedCalls, actualCalls: result.geminiCallCount });
      await saveAutomationRun({
        trigger,
        boardType: result.boardType,
        status: result.reviewPending ? "review_pending" : "published",
        geminiCallCount: result.geminiCallCount,
        message: result.reviewPending ? "자동 생성 후 검수 큐로 이동했습니다." : "자동 생성·검수·발행을 완료했습니다.",
      });
    }
    return result;
  } catch (error) {
    if (trigger === "scheduled") {
      await saveAutomationRun({
        trigger,
        boardType: input?.forcedBoardType,
        status: "failed",
        geminiCallCount: 0,
        message: error instanceof Error ? error.message : "자동 실행에 실패했습니다.",
      });
    }
    throw error;
  }
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
    const canonicalEmployees = await getOrganizationRunCanonicalEmployees(
      topic.relevantEmployeeIds
    );
    const memoryContexts = await input.publisher.getCharacterMemoryContexts?.(
      topic.relevantEmployeeIds
    );
    const employees = canonicalEmployees.map((employee) => ({
      ...employee,
      activityMemory: memoryContexts?.[employee.employee.id],
    }));

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

    const interactions = await generatePublicFeedInteractions({
      generator: input.generator,
      topic,
      employees,
      reactions,
    });

    const post = buildOrganizationRunPost({
      runId,
      topic,
      reactions,
      authorEmployeeId: interactions.authorEmployeeId,
      replies: interactions.replies,
    });
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
        geminiCallCount: employees.length + interactions.replyCallCount,
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
    } else {
      stage = "review";
      const reviewItem = createReviewItem({
        runId,
        boardType: topic.boardType,
        title: topic.title,
        post,
        reasons: ["운영자가 생성한 미발행 초안입니다."],
        riskLevel: qa.riskLevel === "high" ? "high" : "low",
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
        geminiCallCount: employees.length + interactions.replyCallCount,
        post,
        published: false,
        reviewPending: true,
        reviewItemId: reviewItem.id,
      };
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
      geminiCallCount: employees.length + interactions.replyCallCount,
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
