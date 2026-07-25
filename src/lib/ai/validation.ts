import { AIErrorCode, AIProviderError } from "./errors";
import type {
  ConsensusOutput,
  ContentDraftOutput,
  CrossRebuttalOutput,
  InitialResponseOutput,
} from "./types";

const stringSchema = { type: "string", minLength: 1 };
const stringArraySchema = { type: "array", items: stringSchema };

export const initialResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["characterId", "position", "reasoning", "response", "sourceReferences"],
  properties: {
    characterId: stringSchema,
    position: stringSchema,
    reasoning: stringSchema,
    response: stringSchema,
    sourceReferences: stringArraySchema,
  },
};

export const crossRebuttalSchema = {
  type: "object",
  additionalProperties: false,
  required: ["responderCharacterId", "targetCharacterId", "rebuttal", "acknowledgedPoint", "sourceReferences"],
  properties: {
    responderCharacterId: stringSchema,
    targetCharacterId: stringSchema,
    rebuttal: stringSchema,
    acknowledgedPoint: { type: ["string", "null"] },
    sourceReferences: stringArraySchema,
  },
};

export const consensusSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "agreements", "disagreements", "finalConsensus", "limitations", "sourceReferences"],
  properties: {
    summary: stringSchema,
    agreements: stringArraySchema,
    disagreements: stringArraySchema,
    finalConsensus: stringSchema,
    limitations: stringArraySchema,
    sourceReferences: stringArraySchema,
  },
};

export const contentDraftSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "body", "reviewNotes"],
  properties: {
    title: stringSchema,
    summary: stringSchema,
    body: stringSchema,
    reviewNotes: stringArraySchema,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string" && (value[key] as string).trim().length > 0;
}

function hasStringArray(value: Record<string, unknown>, key: string) {
  return Array.isArray(value[key]) && (value[key] as unknown[]).every((item) => typeof item === "string");
}

function invalid(message: string): never {
  throw new AIProviderError(AIErrorCode.ResponseInvalid, message, 502);
}

export function parseStructuredValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new AIProviderError(
      AIErrorCode.ResponseInvalid,
      "AI가 유효한 JSON 응답을 반환하지 않았습니다.",
      502,
      { cause: error }
    );
  }
}

export function validateInitialResponse(value: unknown): InitialResponseOutput {
  const data = parseStructuredValue(value);
  if (!isRecord(data)) invalid("AI 1차 응답 형식이 올바르지 않습니다.");
  if (!["characterId", "position", "reasoning", "response"].every((key) => hasString(data, key)) || !hasStringArray(data, "sourceReferences")) invalid("AI 1차 응답의 필수 필드가 누락됐습니다.");
  return data as InitialResponseOutput;
}

export function validateCrossRebuttal(value: unknown): CrossRebuttalOutput {
  const data = parseStructuredValue(value);
  if (!isRecord(data)) invalid("AI 상호 반박 형식이 올바르지 않습니다.");
  if (!["responderCharacterId", "targetCharacterId", "rebuttal"].every((key) => hasString(data, key)) || !hasStringArray(data, "sourceReferences")) invalid("AI 상호 반박의 필수 필드가 누락됐습니다.");
  if (data.acknowledgedPoint !== undefined && data.acknowledgedPoint !== null && typeof data.acknowledgedPoint !== "string") invalid("AI 상호 반박의 인정 항목 형식이 올바르지 않습니다.");
  return data as CrossRebuttalOutput;
}

export function validateConsensus(value: unknown): ConsensusOutput {
  const data = parseStructuredValue(value);
  if (!isRecord(data)) invalid("AI 합의 형식이 올바르지 않습니다.");
  if (!["summary", "finalConsensus"].every((key) => hasString(data, key)) || !["agreements", "disagreements", "limitations", "sourceReferences"].every((key) => hasStringArray(data, key))) invalid("AI 합의의 필수 필드가 누락됐습니다.");
  return data as ConsensusOutput;
}

export function validateContentDraft(value: unknown): ContentDraftOutput {
  const data = parseStructuredValue(value);
  if (!isRecord(data)) invalid("AI 콘텐츠 초안 형식이 올바르지 않습니다.");
  if (!["title", "summary", "body"].every((key) => hasString(data, key)) || !hasStringArray(data, "reviewNotes")) invalid("AI 콘텐츠 초안의 필수 필드가 누락됐습니다.");
  return data as ContentDraftOutput;
}
