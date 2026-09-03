import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { hasAuthorizedAdminMutation } from "@/lib/admin-auth/session";
import {
  getOrganizationRunPublisher,
  reviewOrganizationRunItem,
} from "@/lib/organization-run";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasAuthorizedAdminMutation(request)) {
    return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }
  const publisher = getOrganizationRunPublisher();
  if (!publisher) {
    return NextResponse.json(
      { error: "조직 실행 KV 저장소가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: "approve" | "edit" | "discard";
      title?: unknown;
      contentBody?: unknown;
    };
    if (!body.action || !["approve", "edit", "discard"].includes(body.action)) {
      return NextResponse.json({ error: "검수 작업이 올바르지 않습니다." }, { status: 400 });
    }
    const item = await reviewOrganizationRunItem({
      publisher,
      id,
      action: body.action,
      title: body.title,
      body: body.contentBody,
    });
    revalidatePath("/admin/review");
    revalidatePath("/discussion/public");
    revalidatePath("/discussion/debate");
    revalidatePath("/discussion/anonymous");
    return NextResponse.json({ item }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "검수 처리에 실패했습니다." },
      { status: 422, headers: { "Cache-Control": "no-store" } }
    );
  }
}
