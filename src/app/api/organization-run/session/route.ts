import { NextResponse } from "next/server";

import {
  createOrganizationRunSession,
  hasSameOrigin,
  organizationRunSessionCookie,
  verifyOrganizationRunSession,
  verifyTriggerSecret,
} from "@/lib/organization-run/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return NextResponse.json(
    { unlocked: verifyOrganizationRunSession(request) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "올바른 JSON이 필요합니다." }, { status: 400 });
  }
  const secret =
    typeof body === "object" &&
    body !== null &&
    "secret" in body &&
    typeof body.secret === "string"
      ? body.secret
      : "";

  try {
    if (!secret || !verifyTriggerSecret(secret)) {
      return NextResponse.json(
        { error: "운영 권한을 확인할 수 없습니다." },
        { status: 401 }
      );
    }
    const response = NextResponse.json({ unlocked: true });
    response.cookies.set(
      organizationRunSessionCookie.name,
      createOrganizationRunSession(),
      {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: organizationRunSessionCookie.maxAge,
      }
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "운영 Secret이 서버에 설정되지 않았습니다." },
      { status: 503 }
    );
  }
}
