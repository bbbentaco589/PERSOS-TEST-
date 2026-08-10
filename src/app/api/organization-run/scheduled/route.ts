import { NextResponse } from "next/server";

import {
  OrganizationRunError,
  runAIOrganizationFromEnvironment,
} from "@/lib/organization-run";
import { verifyScheduledTriggerSecret } from "@/lib/organization-run/security";
import type { OrganizationRunBoardType } from "@/types";

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

  const requestedBoard = new URL(request.url).searchParams.get("board");
  const forcedBoardType = boards.has(requestedBoard as OrganizationRunBoardType)
    ? (requestedBoard as OrganizationRunBoardType)
    : undefined;

  try {
    const result = await runAIOrganizationFromEnvironment({ forcedBoardType });
    return NextResponse.json({
      status: result.status,
      runId: result.runId,
      boardType: result.boardType,
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
            "예약 조직 실행 중 알 수 없는 오류가 발생했습니다.",
            "failed",
            500,
            true
          );
    console.error("[Scheduled organization run] failed:", failure.stage, failure.message);
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

export async function GET(request: Request) {
  return trigger(request);
}

export async function POST(request: Request) {
  return trigger(request);
}
