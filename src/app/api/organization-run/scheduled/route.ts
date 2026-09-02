import { NextResponse } from "next/server";

import {
  OrganizationRunError,
  runAIOrganizationFromEnvironment,
} from "@/lib/organization-run";
import { verifyScheduledTriggerSecret } from "@/lib/organization-run/security";
import type { OrganizationRunBoardType } from "@/types";
import { getAutomationPolicy, getScheduledBoard } from "@/lib/automation-control-store";
import { syncExternalActivitySources } from "@/lib/external-activity-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const boards = new Set<OrganizationRunBoardType>([
  "public",
  "debate",
  "anonymous",
]);

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
}

async function trigger(request: Request) {
  if (!verifyScheduledTriggerSecret(getBearerToken(request))) {
    return NextResponse.json({ error: "Scheduler 인증에 실패했습니다." }, { status: 401 });
  }

  const policy = await getAutomationPolicy();
  const requestedBoard = new URL(request.url).searchParams.get("board");
  const forcedBoardType = boards.has(requestedBoard as OrganizationRunBoardType)
    ? (requestedBoard as OrganizationRunBoardType)
    : getScheduledBoard(policy);

  let organizationRun: Record<string, unknown> = { status: "skipped", reason: "활성 게시판이 없습니다." };
  if (forcedBoardType) {
    try {
      const result = await runAIOrganizationFromEnvironment({ forcedBoardType, trigger: "scheduled" });
      organizationRun = {
        status: result.status,
        runId: result.runId,
        boardType: result.boardType,
        published: result.published,
        reviewPending: result.reviewPending,
        reviewItemId: result.reviewItemId,
        geminiCallCount: result.geminiCallCount,
      };
    } catch (error) {
      const failure = error instanceof OrganizationRunError
        ? error
        : new OrganizationRunError("예약 조직 실행 중 알 수 없는 오류가 발생했습니다.", "failed", 500, true);
      console.error("[Scheduled organization run] failed:", failure.stage, failure.message);
      organizationRun = { status: failure.statusCode === 409 || failure.statusCode === 412 || failure.statusCode === 429 ? "skipped" : "failed", stage: failure.stage, error: failure.message, retryable: failure.retryable };
    }
  }

  let externalSync: Record<string, unknown> = { status: "skipped", reason: "외부 수집이 중지되어 있습니다." };
  if (policy.externalSyncEnabled) {
    try {
      externalSync = await syncExternalActivitySources();
    } catch (error) {
      externalSync = { status: "failed", error: error instanceof Error ? error.message : "외부 활동 수집에 실패했습니다." };
    }
  }
  return NextResponse.json({ status: "completed", organizationRun, externalSync }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  return trigger(request);
}

export async function POST(request: Request) {
  return trigger(request);
}
