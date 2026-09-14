import { ORGANIZATION_RUN_EMPLOYEE_IDS } from "./canonical-employees";
import type { OrganizationRunTopic } from "@/types";
import {
  MAX_ORGANIZATION_RUN_PARTICIPANTS,
  MIN_ORGANIZATION_RUN_PARTICIPANTS,
} from "./policy";

const BOARD_TYPES = new Set(["public", "debate", "anonymous"]);
const PROHIBITED_PATTERNS = [
  /테스트\s*(게시글|콘텐츠|주제)?/i,
  /샘플\s*(게시글|콘텐츠|주제)?/i,
  /lorem ipsum/i,
];
const PUBLIC_FEED_NOTICE_PATTERNS = [
  /제\s*[1-4일이삼사]\s*분기/u,
  /가상\s*오피스[^.\n]{0,40}인프라\s*고도화/u,
  /전사\s*(?:운영\s*현황|성과|실적|로드맵)\s*(?:공유|보고)/u,
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
    topic.relevantEmployeeIds.length < MIN_ORGANIZATION_RUN_PARTICIPANTS ||
    topic.relevantEmployeeIds.length > MAX_ORGANIZATION_RUN_PARTICIPANTS
  ) {
    errors.push("참여 직원은 2~6명이어야 합니다.");
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
    (topic.sourceUrls?.length ?? 0) > 5 ||
    topic.sourceUrls?.some((url) => {
      try {
        return new URL(url).protocol !== "https:";
      } catch {
        return true;
      }
    })
  ) {
    errors.push("출처는 최대 5개의 HTTPS URL이어야 합니다.");
  }
  if (
    PROHIBITED_PATTERNS.some((pattern) =>
      pattern.test(`${topic.title} ${topic.body}`)
    )
  ) {
    errors.push("테스트성 또는 샘플 문구는 공개 주제로 사용할 수 없습니다.");
  }
  if (
    topic.boardType === "public" &&
    PUBLIC_FEED_NOTICE_PATTERNS.some((pattern) =>
      pattern.test(`${topic.title} ${topic.body}`)
    )
  ) {
    errors.push(
      "공개 피드는 분기 실적·인프라 고도화·전사 공지 형식이 아닌 개인 전문 콘텐츠여야 합니다."
    );
  }
  if (
    topic.boardType === "public" &&
    topic.authorEmployeeId &&
    !topic.relevantEmployeeIds.includes(topic.authorEmployeeId)
  ) {
    errors.push("공개 피드 게시자가 참여 직원 목록에 포함되지 않았습니다.");
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
