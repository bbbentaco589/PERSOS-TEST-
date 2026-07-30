import type {
  ManualOrganizationRunInput,
  OrganizationRunBoardType,
  OrganizationRunTopic,
} from "@/types";

import { ORGANIZATION_RUN_EMPLOYEE_IDS } from "./canonical-employees";

const BOARD_TYPES = new Set<OrganizationRunBoardType>([
  "public",
  "debate",
  "anonymous",
]);

function normalizeImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const imageUrl = value.trim();
  if (imageUrl.length > 2_048) {
    throw new Error("이미지 URL은 2,048자 이하여야 합니다.");
  }
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
    return imageUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error("이미지 URL 형식이 올바르지 않습니다.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("외부 이미지는 HTTPS URL만 사용할 수 있습니다.");
  }
  return parsed.toString();
}

function summarizeBody(body: string) {
  const normalized = body.replace(/\s+/g, " ").trim();
  const sentence = normalized.match(/^.{20,300}?[.!?](?:\s|$)/)?.[0];
  return (sentence ?? normalized.slice(0, 300)).trim();
}

export function parseManualOrganizationRunInput(
  value: unknown
): ManualOrganizationRunInput {
  if (!value || typeof value !== "object") {
    throw new Error("수동 실행 입력이 필요합니다.");
  }

  const input = value as Record<string, unknown>;
  const boardType = input.boardType as OrganizationRunBoardType;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const employeeIds = Array.isArray(input.employeeIds)
    ? input.employeeIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!BOARD_TYPES.has(boardType)) {
    throw new Error("게시판을 선택해 주세요.");
  }
  if (title.length < 12 || title.length > 120) {
    throw new Error("제목은 12~120자로 작성해 주세요.");
  }
  if (body.length < 80 || body.length > 1_800) {
    throw new Error("본문은 80~1,800자로 작성해 주세요.");
  }
  if (employeeIds.length < 2 || employeeIds.length > 3) {
    throw new Error("참여 직원은 2~3명 선택해 주세요.");
  }
  if (new Set(employeeIds).size !== employeeIds.length) {
    throw new Error("참여 직원을 중복 선택할 수 없습니다.");
  }
  if (
    employeeIds.some(
      (id) => !ORGANIZATION_RUN_EMPLOYEE_IDS.includes(id as never)
    )
  ) {
    throw new Error("현재 반응 생성 정책에 등록되지 않은 직원입니다.");
  }

  return {
    boardType,
    title,
    body,
    imageUrl: normalizeImageUrl(input.imageUrl),
    employeeIds,
    publish: input.publish === true,
  };
}

export function createManualOrganizationRunTopic(
  input: ManualOrganizationRunInput
): OrganizationRunTopic {
  return {
    boardType: input.boardType,
    title: input.title,
    body: input.body,
    imageUrl: input.imageUrl,
    topicSummary: summarizeBody(input.body),
    reasonForBoardSelection:
      "운영자가 수동 트리거에서 게시판을 직접 선택했습니다.",
    relevantEmployeeIds: input.employeeIds,
  };
}
