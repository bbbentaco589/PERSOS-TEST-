import type { OrganizationRunReviewItem } from "@/types";

import type { OrganizationRunPublisher } from "./types";

function normalizeEdit(value: unknown, label: string, minimum: number, maximum: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new Error(`${label}은(는) ${minimum}~${maximum}자로 작성해 주세요.`);
  }
  return normalized;
}

export async function reviewOrganizationRunItem(input: {
  publisher: OrganizationRunPublisher;
  id: string;
  action: "approve" | "edit" | "discard";
  title?: unknown;
  body?: unknown;
}) {
  const current = await input.publisher.getReviewItem(input.id);
  if (!current) throw new Error("검수 항목을 찾지 못했습니다.");
  if (current.status !== "review_pending") {
    throw new Error("이미 처리된 검수 항목입니다.");
  }

  const now = new Date().toISOString();
  if (input.action === "discard") {
    const discarded: OrganizationRunReviewItem = {
      ...current,
      status: "discarded",
      updatedAt: now,
      reviewedAt: now,
    };
    await input.publisher.updateReviewItem(discarded);
    return discarded;
  }

  if (!current.post) {
    throw new Error("생성 결과가 없는 시스템 오류 항목은 폐기 후 재실행해 주세요.");
  }

  const title = normalizeEdit(input.title, "제목", 12, 120);
  const body = normalizeEdit(input.body, "본문", 20, 1_800);
  const post = {
    ...current.post,
    title: title ?? current.post.title,
    body: body ?? current.post.body,
    summary: body ? body.slice(0, 300) : current.post.summary,
  };

  if (input.action === "edit") {
    const edited: OrganizationRunReviewItem = {
      ...current,
      title: post.title,
      post,
      updatedAt: now,
    };
    await input.publisher.updateReviewItem(edited);
    return edited;
  }

  await input.publisher.publish(post, current.runId);
  const approved: OrganizationRunReviewItem = {
    ...current,
    title: post.title,
    post,
    status: "approved",
    updatedAt: now,
    reviewedAt: now,
  };
  await input.publisher.updateReviewItem(approved);
  return approved;
}
