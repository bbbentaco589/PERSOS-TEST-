import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";

import { upsertExternalActivityPost } from "@/lib/external-activity-store";
import type { ExternalActivityPostInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearer(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const expected = process.env.EXTERNAL_ACTIVITY_INGEST_SECRET?.trim();
  if (!expected || !safeEqual(bearer(request), expected)) {
    return NextResponse.json({ error: "외부 활동 수신 인증에 실패했습니다." }, { status: 401 });
  }
  try {
    const posts = await upsertExternalActivityPost(await request.json() as ExternalActivityPostInput);
    revalidatePath("/external-activities");
    return NextResponse.json({ status: "accepted", count: posts.length }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "외부 활동을 수신하지 못했습니다." }, { status: 422 });
  }
}
