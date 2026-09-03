import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  hasAuthorizedAdminMutation,
  hasAuthorizedAdminRead,
} from "@/lib/admin-auth/session";

import {
  deleteLobbyEventBanner,
  listLobbyEventBanners,
  upsertLobbyEventBanner,
} from "@/lib/lobby-event-store";
import type { LobbyEventBannerInput } from "@/types/lobby-events";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown, status = 400) {
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "이벤트 배너 요청을 처리하지 못했습니다.",
    },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: Request) {
  if (!hasAuthorizedAdminRead(request)) return errorResponse("관리자 인증이 필요합니다.", 401);
  return NextResponse.json(
    { banners: await listLobbyEventBanners({ includeInactive: true }) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!hasAuthorizedAdminMutation(request)) return errorResponse("허용되지 않은 요청입니다.", 403);
  try {
    const banners = await upsertLobbyEventBanner(
      (await request.json()) as LobbyEventBannerInput
    );
    revalidatePath("/");
    return NextResponse.json(
      { banners },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return errorResponse(error, 422);
  }
}

export async function DELETE(request: Request) {
  if (!hasAuthorizedAdminMutation(request)) return errorResponse("허용되지 않은 요청입니다.", 403);
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return errorResponse("삭제할 배너 ID가 필요합니다.", 400);
    const banners = await deleteLobbyEventBanner(id);
    revalidatePath("/");
    return NextResponse.json(
      { banners },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return errorResponse(error, 422);
  }
}
