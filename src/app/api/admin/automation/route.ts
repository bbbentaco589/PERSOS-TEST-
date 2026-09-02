import { NextResponse } from "next/server";

import {
  deleteExternalActivitySource,
  getAutomationSnapshot,
  saveAutomationPolicy,
  upsertExternalActivitySource,
} from "@/lib/automation-control-store";
import { syncExternalActivitySources } from "@/lib/external-activity-sync";
import { hasSameOrigin, hasValidAdminSession } from "@/lib/admin-auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  return hasSameOrigin(request) && hasValidAdminSession(request);
}

function errorResponse(error: unknown, status = 400) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "자동화 설정을 처리하지 못했습니다." }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  if (!hasValidAdminSession(request)) return errorResponse("관리자 인증이 필요합니다.", 401);
  return NextResponse.json(await getAutomationSnapshot(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!authorized(request)) return errorResponse("허용되지 않은 요청입니다.", 403);
  try {
    const body = await request.json() as { action?: string; policy?: unknown; source?: Record<string, unknown>; sourceId?: string };
    if (body.action === "save-policy") await saveAutomationPolicy(body.policy);
    else if (body.action === "save-source") await upsertExternalActivitySource(body.source ?? {});
    else if (body.action === "delete-source" && body.sourceId) await deleteExternalActivitySource(body.sourceId);
    else if (body.action === "sync-external") await syncExternalActivitySources();
    else return errorResponse("지원하지 않는 자동화 작업입니다.", 422);
    return NextResponse.json(await getAutomationSnapshot(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, 422);
  }
}
