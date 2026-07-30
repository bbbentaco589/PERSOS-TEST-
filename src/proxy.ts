import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasValidAdminSession } from "@/lib/admin-auth/session";

export function proxy(request: NextRequest) {
  if (hasValidAdminSession(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/admin/")) {
    return NextResponse.json(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/investor-demo/:path*",
    "/api/admin/:path*",
  ],
};
