import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  deleteExternalActivityPost,
  listExternalActivityPosts,
  upsertExternalActivityPost,
} from "@/lib/external-activity-store";
import {
  hasAuthorizedAdminMutation,
  hasAuthorizedAdminRead,
} from "@/lib/admin-auth/session";
import type { ExternalActivityPostInput } from "@/types/external-activity";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "외부 활동 요청을 처리하지 못했습니다." },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: Request) {
  if (!hasAuthorizedAdminRead(request)) return errorResponse("관리자 인증이 필요합니다.", 401);
  return NextResponse.json(
    { posts: await listExternalActivityPosts({ includeInactive: true }) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!hasAuthorizedAdminMutation(request)) return errorResponse("허용되지 않은 요청입니다.", 403);
  try {
    const posts = await upsertExternalActivityPost((await request.json()) as ExternalActivityPostInput);
    revalidatePath("/external-activities");
    return NextResponse.json({ posts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, 422);
  }
}

export async function DELETE(request: Request) {
  if (!hasAuthorizedAdminMutation(request)) return errorResponse("허용되지 않은 요청입니다.", 403);
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return errorResponse("삭제할 게시물 ID가 필요합니다.");
    const posts = await deleteExternalActivityPost(id);
    revalidatePath("/external-activities");
    return NextResponse.json({ posts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, 422);
  }
}
