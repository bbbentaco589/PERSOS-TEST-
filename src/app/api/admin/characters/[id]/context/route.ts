import { NextResponse } from "next/server";

import { hasSameOrigin, hasValidAdminSession } from "@/lib/admin-auth/session";
import {
  deleteCharacterContextRecord,
  saveCharacterContextRecord,
} from "@/lib/character-context-store";
import type { CharacterContextRecordCategory } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "컨텍스트 기록을 처리하지 못했습니다." },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request) || !hasValidAdminSession(request)) return errorResponse("허용되지 않은 요청입니다.", 403);
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    if (body.action === "delete" && typeof body.recordId === "string") {
      const records = await deleteCharacterContextRecord(id, body.recordId);
      return NextResponse.json({ records }, { headers: { "Cache-Control": "no-store" } });
    }
    const records = await saveCharacterContextRecord({
      employeeId: id,
      category: body.category as CharacterContextRecordCategory,
      title: body.title as string,
      body: body.body as string,
      relatedEmployeeId: body.relatedEmployeeId as string | undefined,
      evidenceUrl: body.evidenceUrl as string | undefined,
      pinned: body.pinned === true,
    });
    return NextResponse.json({ records }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, 422);
  }
}
