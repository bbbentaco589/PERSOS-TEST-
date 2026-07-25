import { AIErrorCode, AIProviderError } from "@/lib/ai";
import { parseStructuredValue } from "@/lib/ai/validation";
import type {
  LiveDemoDebateRound,
  LiveDemoStance,
  LiveDemoStructuredContent,
} from "@/types";

const personaIds = ["char-001", "char-002", "char-003"] as const;
const stances = ["support", "oppose", "neutral"] as const;
const rounds = ["opening", "rebuttal", "summary"] as const;
const excludedTopicPatterns = [
  /투자\s*추천|매수|매도|수익\s*보장/,
  /법률\s*조언|의료\s*조언|진단|처방/,
  /정당|선거|후보자/,
  /혐오|성적\s*묘사|폭력\s*조장/,
  /실존\s*인물\s*비방|미확인\s*내부\s*정보/,
];

const stringSchema = { type: "string", minLength: 1 };
const personaIdSchema = { type: "string", enum: [...personaIds] };

export const demoPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "debateTitle",
    "debateDescription",
    "debateAssignments",
    "anonymousTopicTitle",
    "feedAssignments",
    "debateSchedule",
  ],
  properties: {
    debateTitle: stringSchema,
    debateDescription: stringSchema,
    debateAssignments: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["personaId", "stance", "responsibility"],
        properties: {
          personaId: personaIdSchema,
          stance: { type: "string", enum: [...stances] },
          responsibility: stringSchema,
        },
      },
    },
    anonymousTopicTitle: stringSchema,
    feedAssignments: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["order", "personaId", "title", "activityType"],
        properties: {
          order: { type: "integer", minimum: 1, maximum: 5 },
          personaId: personaIdSchema,
          title: stringSchema,
          activityType: {
            type: "string",
            enum: ["업무", "의견", "Knowledge", "Insight"],
          },
        },
      },
    },
    debateSchedule: {
      type: "array",
      minItems: 6,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["order", "personaId", "stance", "round"],
        properties: {
          order: { type: "integer", minimum: 1, maximum: 10 },
          personaId: personaIdSchema,
          stance: { type: "string", enum: [...stances] },
          round: { type: "string", enum: [...rounds] },
        },
      },
    },
  },
};

export const generatedContentBatchSchema = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      minItems: 1,
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "personaId",
          "contentType",
          "topicId",
          "title",
          "body",
          "metadata",
        ],
        properties: {
          personaId: personaIdSchema,
          contentType: {
            type: "string",
            enum: ["feed", "debate", "anonymous"],
          },
          topicId: stringSchema,
          title: stringSchema,
          body: stringSchema,
          stance: {
            type: ["string", "null"],
            enum: ["support", "oppose", "neutral", null],
          },
          round: {
            type: ["string", "null"],
            enum: ["opening", "rebuttal", "summary", null],
          },
          replyToId: { type: ["string", "null"] },
          activityType: { type: ["string", "null"] },
          metadata: {
            type: "object",
            additionalProperties: {
              type: ["string", "number", "boolean"],
            },
          },
        },
      },
    },
  },
};

export type GeneratedPlanOutput = {
  debateTitle: string;
  debateDescription: string;
  debateAssignments: Array<{
    personaId: string;
    stance: LiveDemoStance;
    responsibility: string;
  }>;
  anonymousTopicTitle: string;
  feedAssignments: Array<{
    order: number;
    personaId: string;
    title: string;
    activityType: string;
  }>;
  debateSchedule: Array<{
    order: number;
    personaId: string;
    stance: LiveDemoStance;
    round: LiveDemoDebateRound;
  }>;
};

function invalid(message: string): never {
  throw new AIProviderError(AIErrorCode.ResponseInvalid, message, 502);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPersonaId(value: unknown): value is (typeof personaIds)[number] {
  return personaIds.includes(value as (typeof personaIds)[number]);
}

function isStance(value: unknown): value is LiveDemoStance {
  return stances.includes(value as LiveDemoStance);
}

function isRound(value: unknown): value is LiveDemoDebateRound {
  return rounds.includes(value as LiveDemoDebateRound);
}

export function validateGeneratedPlan(value: unknown): GeneratedPlanOutput {
  const data = parseStructuredValue(value);
  if (!isRecord(data)) invalid("TECT Demo Content Plan 형식이 올바르지 않습니다.");
  if (
    !hasText(data.debateTitle) ||
    !hasText(data.debateDescription) ||
    !hasText(data.anonymousTopicTitle) ||
    !Array.isArray(data.debateAssignments) ||
    !Array.isArray(data.feedAssignments) ||
    !Array.isArray(data.debateSchedule)
  ) {
    invalid("TECT Demo Content Plan 필수 필드가 누락됐습니다.");
  }
  if (
    data.debateAssignments.length !== 3 ||
    data.feedAssignments.length !== 5 ||
    data.debateSchedule.length < 6 ||
    data.debateSchedule.length > 10
  ) {
    invalid("TECT Demo Content Plan의 콘텐츠 수가 허용 범위를 벗어났습니다.");
  }
  const planText = [
    data.debateTitle,
    data.debateDescription,
    data.anonymousTopicTitle,
    ...data.feedAssignments.map((item) =>
      isRecord(item) && typeof item.title === "string" ? item.title : ""
    ),
  ].join("\n");
  if (excludedTopicPatterns.some((pattern) => pattern.test(planText))) {
    invalid("TECT Demo Content Plan에 Live Demo 제외 주제가 포함됐습니다.");
  }

  const assignmentIds = new Set<string>();
  const assignmentStances = new Set<string>();
  for (const item of data.debateAssignments) {
    if (
      !isRecord(item) ||
      !isPersonaId(item.personaId) ||
      !isStance(item.stance) ||
      !hasText(item.responsibility)
    ) {
      invalid("TECT 토론 역할 배정 형식이 올바르지 않습니다.");
    }
    assignmentIds.add(item.personaId);
    assignmentStances.add(item.stance);
  }
  if (assignmentIds.size !== 3 || assignmentStances.size !== 3) {
    invalid("SIG·LUMI·박봉남에게 찬성·반대·중립을 각각 배정해야 합니다.");
  }

  const sortedFeedAssignments = [...data.feedAssignments].sort((a, b) =>
    isRecord(a) && isRecord(b) && typeof a.order === "number" && typeof b.order === "number"
      ? a.order - b.order
      : 0
  );
  const feedOrders = new Set<number>();
  for (const [index, item] of sortedFeedAssignments.entries()) {
    if (
      !isRecord(item) ||
      typeof item.order !== "number" ||
      !Number.isInteger(item.order) ||
      !isPersonaId(item.personaId) ||
      !hasText(item.title) ||
      !hasText(item.activityType)
    ) {
      invalid("TECT 공개 피드 배정 형식이 올바르지 않습니다.");
    }
    feedOrders.add(item.order);
    if (
      index > 0 &&
      isRecord(sortedFeedAssignments[index - 1]) &&
      sortedFeedAssignments[index - 1].personaId === item.personaId
    ) {
      invalid("동일 Persona를 공개 피드에 연속 배정할 수 없습니다.");
    }
  }
  if (feedOrders.size !== 5) {
    invalid("TECT 공개 피드 order 값은 중복될 수 없습니다.");
  }

  const debateOrders = new Set<number>();
  for (const item of data.debateSchedule) {
    if (
      !isRecord(item) ||
      typeof item.order !== "number" ||
      !Number.isInteger(item.order) ||
      !isPersonaId(item.personaId) ||
      !isStance(item.stance) ||
      !isRound(item.round)
    ) {
      invalid("TECT 토론 일정 형식이 올바르지 않습니다.");
    }
    debateOrders.add(item.order);
  }
  if (debateOrders.size !== data.debateSchedule.length) {
    invalid("TECT 토론 일정 order 값은 중복될 수 없습니다.");
  }

  return data as GeneratedPlanOutput;
}

export function validateGeneratedContentBatch(
  value: unknown,
  expectedCount: number
): LiveDemoStructuredContent[] {
  const data = parseStructuredValue(value);
  if (!isRecord(data) || !Array.isArray(data.items)) {
    invalid("Gemini 콘텐츠 응답 형식이 올바르지 않습니다.");
  }
  if (data.items.length !== expectedCount) {
    invalid(`Gemini 콘텐츠는 정확히 ${expectedCount}개여야 합니다.`);
  }

  return data.items.map((item) => {
    if (
      !isRecord(item) ||
      !isPersonaId(item.personaId) ||
      !["feed", "debate", "anonymous"].includes(
        item.contentType as string
      ) ||
      !hasText(item.topicId) ||
      !hasText(item.title) ||
      !hasText(item.body) ||
      !isRecord(item.metadata)
    ) {
      invalid("Gemini 콘텐츠 필수 필드가 누락됐습니다.");
    }
    if (
      item.stance !== null &&
      item.stance !== undefined &&
      !isStance(item.stance)
    ) {
      invalid("Gemini 콘텐츠의 stance 값이 올바르지 않습니다.");
    }
    if (
      item.round !== null &&
      item.round !== undefined &&
      !isRound(item.round)
    ) {
      invalid("Gemini 콘텐츠의 round 값이 올바르지 않습니다.");
    }
    return item as LiveDemoStructuredContent;
  });
}
