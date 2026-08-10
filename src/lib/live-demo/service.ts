import {
  AIErrorCode,
  AIProviderError,
  DEFAULT_GEMINI_MODEL,
  isAIProviderError,
} from "@/lib/ai";
import { runAutomatedQA } from "@/lib/live-demo/automated-qa";
import {
  assertContentWindow,
  assertPlanWindow,
  getLiveDemoConfig,
  type LiveDemoConfig,
} from "@/lib/live-demo/config";
import {
  GeminiLiveDemoGenerator,
  type LiveDemoGenerator,
  type LiveDemoGenerationResult,
} from "@/lib/live-demo/gemini-generator";
import {
  buildPersonaContext,
  getLiveDemoCharacters,
} from "@/lib/live-demo/persona-context";
import { getRepositories } from "@/lib/repositories";
import type {
  LiveDemoRepository,
  RepositoryBundle,
} from "@/lib/repositories/interfaces";
import {
  LiveDemoContentType,
  LiveDemoGenerationStatus,
  type Character,
  type LiveDemoContentPlan,
  type LiveDemoGeneratedContent,
  type LiveDemoGenerationRun,
  type LiveDemoStructuredContent,
  type LiveDemoTrigger,
  type LiveDemoUsageLog,
} from "@/types";

const TECT_ID = "tect";
const FEED_OFFSETS_MINUTES = [5, 35, 75, 120, 155];
const DEBATE_OFFSETS_MINUTES = [15, 25, 45, 65, 85, 105, 125, 145, 165, 170];
const ANONYMOUS_ALIAS = [
  { alias: "익명 그린티", tone: "green" },
  { alias: "익명 라벤더", tone: "lavender" },
  { alias: "익명 피치", tone: "peach" },
  { alias: "익명 레몬", tone: "lemon" },
  { alias: "익명 소다", tone: "soda" },
] as const;

type LiveDemoDependencies = {
  repositories?: RepositoryBundle;
  generator?: LiveDemoGenerator;
  config?: LiveDemoConfig;
};

type GenerateSlotInput = {
  plan: LiveDemoContentPlan;
  contentType: LiveDemoGeneratedContent["contentType"];
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  personaIds: string[];
  slotKey: string;
  scheduledAt: string;
  trigger: LiveDemoTrigger;
  expectedCount?: number;
  stance?: LiveDemoGeneratedContent["stance"];
  round?: LiveDemoGeneratedContent["round"];
  replyToId?: string;
  activityType?: string;
};

function getDependencies(input: LiveDemoDependencies) {
  return {
    repositories: input.repositories ?? getRepositories(),
    generator: input.generator ?? new GeminiLiveDemoGenerator(),
    config: input.config ?? getLiveDemoConfig(),
  };
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60_000).toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류";
}

function getErrorCode(error: unknown) {
  return isAIProviderError(error) ? error.code : "LIVE_DEMO_FAILED";
}

function toUsageLog(
  runId: string,
  result: LiveDemoGenerationResult<unknown>
): LiveDemoUsageLog {
  return {
    id: createId("usage"),
    runId,
    provider: "gemini",
    model: result.model,
    promptTokens: result.usage.promptTokens,
    outputTokens: result.usage.outputTokens,
    totalTokens: result.usage.totalTokens,
    latencyMs: result.latencyMs,
    success: true,
    createdAt: new Date().toISOString(),
  };
}

async function saveFailureUsage(
  repository: LiveDemoRepository,
  runId: string,
  error: unknown
) {
  await repository.saveUsageLog({
    id: createId("usage"),
    runId,
    provider: "gemini",
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    promptTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    latencyMs: 0,
    success: false,
    errorCode: getErrorCode(error),
    createdAt: new Date().toISOString(),
  });
}

function derivePlan(
  generated: Awaited<ReturnType<LiveDemoGenerator["generatePlan"]>>["value"],
  config: LiveDemoConfig,
  now: Date
): LiveDemoContentPlan {
  const planId = `investor-demo-${config.startAt
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")}`;
  const debateTopicId = `${planId}-debate`;
  const anonymousTopicId = `${planId}-anonymous`;
  return {
    id: planId,
    status: "active",
    debateTopicId,
    debateTitle: generated.debateTitle,
    debateDescription: generated.debateDescription,
    debateAssignments: generated.debateAssignments,
    debateSchedule: [...generated.debateSchedule]
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        ...item,
        scheduledAt: addMinutes(
          config.startAt,
          DEBATE_OFFSETS_MINUTES[index] ??
            DEBATE_OFFSETS_MINUTES[DEBATE_OFFSETS_MINUTES.length - 1]
        ),
      })),
    anonymousTopicId,
    anonymousTopicTitle: generated.anonymousTopicTitle,
    feedAssignments: [...generated.feedAssignments]
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        ...item,
        scheduledAt: addMinutes(
          config.startAt,
          FEED_OFFSETS_MINUTES[index] ??
            FEED_OFFSETS_MINUTES[FEED_OFFSETS_MINUTES.length - 1]
        ),
      })),
    startsAt: config.startAt.toISOString(),
    endsAt: config.endAt.toISOString(),
    createdByPersonaId: TECT_ID,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

async function getTect(
  repositories: RepositoryBundle
): Promise<Character> {
  const tect = await repositories.characters.getCharacterById(TECT_ID);
  if (!tect) throw new Error("TECT Canonical Profile을 찾지 못했습니다.");
  return tect;
}

export async function ensureLiveDemoPlan(
  input: LiveDemoDependencies & { now?: Date } = {}
) {
  const { repositories, generator, config } = getDependencies(input);
  const existing = await repositories.liveDemo.getActivePlan();
  if (existing) return existing;

  const now = input.now ?? new Date();
  assertPlanWindow(config, now);
  const state = await repositories.liveDemo.getState();
  if (state.killSwitch) {
    throw new Error("Live Demo Kill Switch가 활성화되어 있습니다.");
  }

  const run: LiveDemoGenerationRun = {
    id: createId("run-plan"),
    trigger: "api",
    contentType: "plan",
    status: LiveDemoGenerationStatus.Generating,
    attempt: 0,
    startedAt: now.toISOString(),
    metadata: { orchestratorPersonaId: TECT_ID },
  };
  await repositories.liveDemo.createGenerationRun(run);
  const [tect, personas] = await Promise.all([
    getTect(repositories),
    getLiveDemoCharacters(repositories),
  ]);
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    let usageSaved = false;
    const reserved = await repositories.liveDemo.reserveGenerationCall(
      config.maxTotalCalls
    );
    if (!reserved) {
      lastError = new AIProviderError(
        AIErrorCode.RateLimited,
        "Live Demo Gemini 호출 Hard Cap 또는 Kill Switch에 도달했습니다.",
        429
      );
      break;
    }

    try {
      const result = await generator.generatePlan({ tect, personas });
      await repositories.liveDemo.saveUsageLog(toUsageLog(run.id, result));
      usageSaved = true;
      const plan = derivePlan(result.value, config, now);
      await repositories.liveDemo.savePlan(plan);
      await repositories.liveDemo.updateGenerationRun({
        ...run,
        planId: plan.id,
        attempt,
        status: LiveDemoGenerationStatus.Published,
        finishedAt: new Date().toISOString(),
      });
      return plan;
    } catch (error) {
      lastError = error;
      if (!usageSaved) {
        await saveFailureUsage(repositories.liveDemo, run.id, error);
      }
    }
  }

  await repositories.liveDemo.updateGenerationRun({
    ...run,
    attempt: config.maxRetries,
    status:
      isAIProviderError(lastError) &&
      lastError.code === AIErrorCode.RateLimited
        ? LiveDemoGenerationStatus.LimitReached
        : LiveDemoGenerationStatus.Failed,
    finishedAt: new Date().toISOString(),
    failureReason: getErrorMessage(lastError),
  });
  throw lastError;
}

function createDraft(
  item: LiveDemoStructuredContent,
  slot: GenerateSlotInput,
  index: number,
  now: Date
): LiveDemoGeneratedContent {
  const anonymousPresentation =
    ANONYMOUS_ALIAS[
      Math.abs(
        [...`${slot.slotKey}-${index}`].reduce(
          (total, character) => total + character.charCodeAt(0),
          0
        )
      ) % ANONYMOUS_ALIAS.length
    ];

  return {
    id: createId(`live-${slot.contentType}`),
    planId: slot.plan.id,
    contentType: slot.contentType,
    personaId: item.personaId,
    topicId: slot.topicId,
    title: item.title,
    sourceBody: item.body,
    publicBody: item.body,
    status: LiveDemoGenerationStatus.Draft,
    activityType: item.activityType ?? slot.activityType,
    stance: item.stance ?? slot.stance,
    round: item.round ?? slot.round,
    replyToId: item.replyToId ?? slot.replyToId,
    metadata: {
      ...item.metadata,
      slotKey: slot.slotKey,
      generationSource: "gemini",
      humanReview: false,
      ...(slot.contentType === LiveDemoContentType.Anonymous
        ? {
            anonymousAlias: anonymousPresentation.alias,
            anonymousAliasTone: anonymousPresentation.tone,
          }
        : {}),
    },
    scheduledAt: slot.scheduledAt,
    createdAt: now.toISOString(),
  };
}

async function generateSlot(
  slot: GenerateSlotInput,
  dependencies: ReturnType<typeof getDependencies>,
  now: Date
) {
  const { repositories, generator, config } = dependencies;
  assertContentWindow(config, now);
  const existing = await repositories.liveDemo.listGeneratedContents();
  if (
    existing.some(
      (content) =>
        content.metadata.slotKey === slot.slotKey &&
        content.status !== LiveDemoGenerationStatus.Failed &&
        content.status !== LiveDemoGenerationStatus.QARejected
    )
  ) {
    return [];
  }

  const run: LiveDemoGenerationRun = {
    id: createId(`run-${slot.contentType}`),
    planId: slot.plan.id,
    trigger: slot.trigger,
    contentType: slot.contentType,
    status: LiveDemoGenerationStatus.Generating,
    attempt: 0,
    startedAt: now.toISOString(),
    metadata: { slotKey: slot.slotKey },
  };
  await repositories.liveDemo.createGenerationRun(run);
  const expectedCount = slot.expectedCount ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    let failureUsageSaved = false;
    try {
      const contexts = await Promise.all(
        slot.personaIds.map((personaId) =>
          buildPersonaContext(
            repositories,
            personaId,
            {
              responsibility: slot.activityType ?? slot.round ?? slot.contentType,
              stance: slot.stance,
            },
            slot.contentType === LiveDemoContentType.Anonymous ? 10 : 5
          )
        )
      );
      const generatedValues: LiveDemoStructuredContent[] = [];
      for (const context of contexts.slice(0, expectedCount)) {
        const reserved = await repositories.liveDemo.reserveGenerationCall(
          config.maxTotalCalls
        );
        if (!reserved) {
          throw new AIProviderError(
            AIErrorCode.RateLimited,
            "Live Demo Gemini 호출 Hard Cap 또는 Kill Switch에 도달했습니다.",
            429
          );
        }
        try {
          const independentResult = await generator.generateContents({
            contentType: slot.contentType,
            topicId: slot.topicId,
            topicTitle: slot.topicTitle,
            topicDescription: slot.topicDescription,
            contexts: [context],
            expectedCount: 1,
            stance: slot.stance,
            round: slot.round,
            replyToId: slot.replyToId,
          });
          await repositories.liveDemo.saveUsageLog(
            toUsageLog(run.id, independentResult)
          );
          generatedValues.push(independentResult.value[0]);
        } catch (error) {
          await saveFailureUsage(repositories.liveDemo, run.id, error);
          failureUsageSaved = true;
          throw error;
        }
      }

      const candidates = generatedValues.map((item, index) =>
        createDraft(item, slot, index, now)
      );
      const recent = await repositories.liveDemo.listGeneratedContents({
        status: LiveDemoGenerationStatus.Published,
      });
      const qaResults = candidates.map((candidate, index) =>
        runAutomatedQA({
          content: generatedValues[index],
          expectedContentType: slot.contentType,
          expectedTopicId: slot.topicId,
          expectedPersonaIds: slot.personaIds,
          recentContents: [...recent, ...candidates.slice(0, index)],
        })
      );

      if (qaResults.some((qa) => !qa.passed)) {
        const reasons = qaResults.flatMap((qa) => qa.reasons);
        for (const candidate of candidates) {
          await repositories.liveDemo.saveGeneratedContent({
            ...candidate,
            publicBody: "",
            status: LiveDemoGenerationStatus.QARejected,
            failureReason: reasons.join("; "),
          });
        }
        throw new AIProviderError(
          AIErrorCode.ResponseInvalid,
          `Automated QA 실패: ${reasons.join("; ")}`,
          422
        );
      }

      const published: LiveDemoGeneratedContent[] = [];
      for (const candidate of candidates) {
        await repositories.liveDemo.saveGeneratedContent(candidate);
        const qaPassed = await repositories.liveDemo.updateGeneratedContent({
          ...candidate,
          status: LiveDemoGenerationStatus.QAPassed,
        });
        published.push(
          config.autoPublish
            ? await repositories.liveDemo.updateGeneratedContent({
                ...qaPassed,
                status: LiveDemoGenerationStatus.Published,
                publishedAt: new Date().toISOString(),
              })
            : qaPassed
        );
      }

      await repositories.liveDemo.incrementCounters(
        slot.contentType === LiveDemoContentType.Feed
          ? { feedPosts: published.length }
          : slot.contentType === LiveDemoContentType.Debate
            ? { debateMessages: published.length }
            : { chatRuns: 1, chatMessages: published.length }
      );
      await repositories.liveDemo.updateGenerationRun({
        ...run,
        attempt,
        status: config.autoPublish
          ? LiveDemoGenerationStatus.Published
          : LiveDemoGenerationStatus.QAPassed,
        finishedAt: new Date().toISOString(),
      });
      return published;
    } catch (error) {
      lastError = error;
      if (!failureUsageSaved) {
        await saveFailureUsage(repositories.liveDemo, run.id, error);
      }
      if (attempt >= config.maxRetries) break;
    }
  }

  await repositories.liveDemo.updateGenerationRun({
    ...run,
    attempt: config.maxRetries,
    status:
      isAIProviderError(lastError) &&
      lastError.code === AIErrorCode.ResponseInvalid
        ? LiveDemoGenerationStatus.QARejected
        : LiveDemoGenerationStatus.Failed,
    finishedAt: new Date().toISOString(),
    failureReason: getErrorMessage(lastError),
  });
  throw lastError;
}

function getAnonymousSlot(plan: LiveDemoContentPlan, index: number) {
  const primaryIndex = index % 3;
  const expectedCount = index % 3 === 2 ? 2 : 1;
  const personaIds = ["char-001", "char-002", "char-003"]
    .slice(primaryIndex)
    .concat(["char-001", "char-002", "char-003"].slice(0, primaryIndex))
    .slice(0, expectedCount);
  return {
    personaIds,
    expectedCount,
    scheduledAt: addMinutes(new Date(plan.startsAt), index * 10),
  };
}

export async function runLiveDemoTick(
  input: LiveDemoDependencies & {
    now?: Date;
    trigger?: LiveDemoTrigger;
  } = {}
) {
  const dependencies = getDependencies(input);
  const now = input.now ?? new Date();
  assertContentWindow(dependencies.config, now);
  const plan = await ensureLiveDemoPlan({ ...dependencies, now });
  const state = await dependencies.repositories.liveDemo.getState();
  if (state.killSwitch) {
    throw new Error("Live Demo Kill Switch가 활성화되어 있습니다.");
  }

  const created: LiveDemoGeneratedContent[] = [];
  const trigger = input.trigger ?? "runner";
  const contents =
    await dependencies.repositories.liveDemo.listGeneratedContents();
  const completedSlots = new Set(
    contents
      .filter(
        (content) =>
          content.status === LiveDemoGenerationStatus.Published ||
          content.status === LiveDemoGenerationStatus.QAPassed
      )
      .map((content) => String(content.metadata.slotKey))
  );

  for (const assignment of plan.feedAssignments) {
    const slotKey = `feed-${assignment.order}`;
    if (
      new Date(assignment.scheduledAt) <= now &&
      !completedSlots.has(slotKey) &&
      state.feedPosts + created.filter((item) => item.contentType === "feed").length <
        dependencies.config.maxFeedPosts
    ) {
      created.push(
        ...(await generateSlot(
          {
            plan,
            contentType: LiveDemoContentType.Feed,
            topicId: `${plan.id}-feed-${assignment.order}`,
            topicTitle: assignment.title,
            topicDescription: `${assignment.activityType} 공개 피드 소재`,
            personaIds: [assignment.personaId],
            slotKey,
            scheduledAt: assignment.scheduledAt,
            trigger,
            activityType: assignment.activityType,
          },
          dependencies,
          now
        ))
      );
    }
  }

  for (const schedule of plan.debateSchedule) {
    const slotKey = `debate-${schedule.order}`;
    if (
      new Date(schedule.scheduledAt) <= now &&
      !completedSlots.has(slotKey) &&
      state.debateMessages +
        created.filter((item) => item.contentType === "debate").length <
        dependencies.config.maxDebateMessages
    ) {
      created.push(
        ...(await generateSlot(
          {
            plan,
            contentType: LiveDemoContentType.Debate,
            topicId: plan.debateTopicId,
            topicTitle: plan.debateTitle,
            topicDescription: plan.debateDescription,
            personaIds: [schedule.personaId],
            slotKey,
            scheduledAt: schedule.scheduledAt,
            trigger,
            stance: schedule.stance,
            round: schedule.round,
          },
          dependencies,
          now
        ))
      );
    }
  }

  const elapsedMinutes = Math.floor(
    (now.getTime() - new Date(plan.startsAt).getTime()) / 60_000
  );
  const latestAnonymousIndex = Math.min(
    Math.floor(elapsedMinutes / 10),
    dependencies.config.maxChatRuns - 1,
    17
  );
  for (let index = 0; index <= latestAnonymousIndex; index += 1) {
    const slotKey = `anonymous-${index + 1}`;
    if (completedSlots.has(slotKey)) continue;
    const latestState = await dependencies.repositories.liveDemo.getState();
    if (
      latestState.chatRuns >= dependencies.config.maxChatRuns ||
      latestState.chatMessages >= dependencies.config.maxChatMessages
    ) {
      break;
    }
    const slot = getAnonymousSlot(plan, index);
    const remainingMessages =
      dependencies.config.maxChatMessages - latestState.chatMessages;
    const expectedCount = Math.min(slot.expectedCount, remainingMessages);
    if (expectedCount < 1) break;
    const previous = (
      await dependencies.repositories.liveDemo.listGeneratedContents({
        contentType: LiveDemoContentType.Anonymous,
        status: LiveDemoGenerationStatus.Published,
        limit: 1,
      })
    )[0];
    created.push(
      ...(await generateSlot(
        {
          plan,
          contentType: LiveDemoContentType.Anonymous,
          topicId: plan.anonymousTopicId,
          topicTitle: plan.anonymousTopicTitle,
          topicDescription:
            "PERSOS AI 사원들이 협업과 조직 문화에 대해 나누는 익명 대화",
          personaIds: slot.personaIds.slice(0, expectedCount),
          slotKey,
          scheduledAt: slot.scheduledAt,
          trigger,
          expectedCount,
          replyToId: previous?.id,
        },
        dependencies,
        now
      ))
    );
  }

  return {
    planId: plan.id,
    created,
    state: await dependencies.repositories.liveDemo.getState(),
  };
}

export async function setLiveDemoKillSwitch(
  enabled: boolean,
  repositories: RepositoryBundle = getRepositories()
) {
  return repositories.liveDemo.setKillSwitch(enabled);
}

export async function getLiveDemoStatus(
  repositories: RepositoryBundle = getRepositories()
) {
  const [plan, state, contents, usageLogs] = await Promise.all([
    repositories.liveDemo.getActivePlan(),
    repositories.liveDemo.getState(),
    repositories.liveDemo.listGeneratedContents(),
    repositories.liveDemo.listUsageLogs(),
  ]);
  return {
    plan,
    state,
    contents,
    usageLogs,
  };
}
