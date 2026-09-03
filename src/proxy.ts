import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasValidAdminSession } from "@/lib/admin-auth/session";

const mobileUserAgentPattern = /Android|iPhone|iPad|iPod|Mobile/i;

export function proxy(request: NextRequest) {
  const isMobileDirectIntranetEntry =
    request.method === "GET" &&
    request.nextUrl.pathname === "/intranet" &&
    mobileUserAgentPattern.test(request.headers.get("user-agent") ?? "") &&
    !request.headers.get("referer") &&
    [null, "navigate"].includes(request.headers.get("sec-fetch-mode"));

  if (isMobileDirectIntranetEntry) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (request.nextUrl.pathname === "/intranet") {
    return NextResponse.next();
  }

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
    "/intranet",
    "/admin/:path*",
    "/investor-demo/:path*",
    "/api/admin/:path*",
  ],
};
