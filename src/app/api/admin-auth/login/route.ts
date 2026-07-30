import { NextResponse } from "next/server";

import {
  adminSessionCookie,
  createAdminSessionToken,
  hasSameOrigin,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json(
      { error: "허용되지 않은 요청입니다." },
      { status: 403 }
    );
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "관리자 인증이 아직 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "올바른 요청 형식이 필요합니다." },
      { status: 400 }
    );
  }

  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(
    adminSessionCookie.name,
    createAdminSessionToken(),
    {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: adminSessionCookie.maxAge,
    }
  );
  return response;
}
