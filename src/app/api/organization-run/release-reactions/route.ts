import { NextResponse } from "next/server";
import { getOrganizationRunPublisher } from "@/lib/organization-run/kv-publisher";
import { verifyScheduledTriggerSecret } from "@/lib/organization-run/security";
import { addAutomationActivities } from "@/lib/automation-control-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const candidate = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!verifyScheduledTriggerSecret(candidate)) {
    return NextResponse.json({ error: "Scheduler 인증에 실패했습니다." }, { status: 401 });
  }
  const stage = Number(new URL(request.url).searchParams.get("stage"));
  if (stage !== 1 && stage !== 2) {
    return NextResponse.json({ error: "잘못된 반응 공개 단계입니다." }, { status: 400 });
  }
  const publisher = getOrganizationRunPublisher();
  if (!publisher) {
    return NextResponse.json({ error: "KV 저장소가 설정되지 않았습니다." }, { status: 503 });
  }
  const released = await publisher.releaseStagedReactions(stage);
  await addAutomationActivities(released);
  return NextResponse.json({ status: "completed", stage, released }, { headers: { "Cache-Control": "no-store" } });
}
