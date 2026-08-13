import { NextResponse } from "next/server";

import {
  OrganizationRunError,
  runAIOrganizationFromEnvironment,
} from "@/lib/organization-run";
import {
  hasSameOrigin,
  verifyOrganizationRunSession,
} from "@/lib/organization-run/security";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";
import type { OrganizationRunBoardType } from "@/types";
import { checkRequestRateLimit } from "@/lib/security/request-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const TRIGGER_REQUEST_LIMIT = {
  scope: "organization-run-trigger",
  limit: 8,
  windowSeconds: 60 * 60,
} as const;

const boards = new Set<OrganizationRunBoardType>([
  "public",
  "debate",
  "anonymous",
]);

export async function POST(request: Request) {
  if (!hasSameOrigin(request) || !verifyOrganizationRunSession(request)) {
    return NextResponse.json(
      { error: "운영 권한이 없거나 세션이 만료되었습니다.", stage: "auth" },
      { status: 401 }
    );
  }
  const rateLimit = await checkRequestRateLimit(request, TRIGGER_REQUEST_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "AI 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.", stage: "rate_limit" },
      { status: rateLimit.available ? 429 : 503, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // Empty bodies are valid for the one-click run.
  }
  const forcedBoardType =
    typeof body === "object" &&
    body !== null &&
    "qaBoardType" in body &&
    boards.has(body.qaBoardType as OrganizationRunBoardType)
      ? (body.qaBoardType as OrganizationRunBoardType)
      : undefined;

  try {
    const result = await runAIOrganizationFromEnvironment({ forcedBoardType });
    const canonical = await getOrganizationRunCanonicalEmployees(
      result.participantIds
    );
    return NextResponse.json({
      status: result.status,
      stage: result.stage,
      runId: result.runId,
      boardType: result.boardType,
      title: result.title,
      participants: canonical.map(({ employee }) => ({
        id: employee.id,
        name: employee.nameKo,
      })),
      publicUrl: result.publicUrl,
      published: result.published,
      reviewPending: result.reviewPending,
      reviewItemId: result.reviewItemId,
      geminiCallCount: result.geminiCallCount,
    });
  } catch (error) {
    const failure =
      error instanceof OrganizationRunError
        ? error
        : new OrganizationRunError(
            "조직 실행 중 알 수 없는 오류가 발생했습니다.",
            "failed",
            500,
            true
          );
    console.error(
      "[Organization run] failed:",
      failure.stage,
      failure.message
    );
    return NextResponse.json(
      {
        status: "failed",
        stage: failure.stage,
        error: failure.message,
        retryable: failure.retryable,
      },
      { status: failure.statusCode }
    );
  }
}
