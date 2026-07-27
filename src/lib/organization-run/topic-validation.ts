import { ORGANIZATION_RUN_EMPLOYEE_IDS } from "./canonical-employees";
import type { OrganizationRunTopic } from "@/types";

const BOARD_TYPES = new Set(["public", "debate", "anonymous"]);
const PROHIBITED_PATTERNS = [
  /테스트\s*(게시글|콘텐츠|주제)?/i,
  /샘플\s*(게시글|콘텐츠|주제)?/i,
  /lorem ipsum/i,
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("ko-KR")
    .replace(/[^0-9a-z가-힣]/g, "");
}

function bigrams(value: string) {
  const normalized = normalize(value);
  if (normalized.length < 2) return new Set([normalized]);
  return new Set(
    Array.from({ length: normalized.length - 1 }, (_, index) =>
      normalized.slice(index, index + 2)
    )
  );
}

function similarity(left: string, right: string) {
  const a = bigrams(left);
  const b = bigrams(right);
  const intersection = [...a].filter((item) => b.has(item)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

export function validateOrganizationRunTopic(
  topic: OrganizationRunTopic,
  existingSummaries: string[]
) {
  const errors: string[] = [];
  if (!BOARD_TYPES.has(topic.boardType)) errors.push("허용되지 않은 게시판입니다.");
  if (topic.title.trim().length < 12 || topic.title.length > 120) {
    errors.push("제목은 12~120자여야 합니다.");
  }
  if (topic.body.trim().length < 80 || topic.body.length > 1_800) {
    errors.push("본문은 80~1,800자여야 합니다.");
  }
  if (topic.topicSummary.trim().length < 20 || topic.topicSummary.length > 300) {
    errors.push("주제 요약은 20~300자여야 합니다.");
  }
  if (
    topic.relevantEmployeeIds.length < 2 ||
    topic.relevantEmployeeIds.length > 3
  ) {
    errors.push("참여 직원은 2~3명이어야 합니다.");
  }
  if (
    new Set(topic.relevantEmployeeIds).size !==
    topic.relevantEmployeeIds.length
  ) {
    errors.push("참여 직원 ID가 중복되었습니다.");
  }
  if (
    topic.relevantEmployeeIds.some(
      (id) => !ORGANIZATION_RUN_EMPLOYEE_IDS.includes(id as never)
    )
  ) {
    errors.push("Canonical에 없거나 허용되지 않은 직원이 포함되었습니다.");
  }
  if (topic.relevantEmployeeIds.includes("architect")) {
    errors.push("Architect는 직원 반응 참여자가 아닙니다.");
  }
  if (
    PROHIBITED_PATTERNS.some((pattern) =>
      pattern.test(`${topic.title} ${topic.body}`)
    )
  ) {
    errors.push("테스트성 또는 샘플 문구는 공개 주제로 사용할 수 없습니다.");
  }
  if (
    existingSummaries.some(
      (summary) =>
        normalize(summary) === normalize(topic.topicSummary) ||
        similarity(summary, topic.topicSummary) >= 0.72
    )
  ) {
    errors.push("기존 공개 주제와 지나치게 유사합니다.");
  }

  return { valid: errors.length === 0, errors };
}
