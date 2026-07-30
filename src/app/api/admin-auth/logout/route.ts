import { NextResponse } from "next/server";

import {
  adminSessionCookie,
  hasSameOrigin,
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

  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(adminSessionCookie.name, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
