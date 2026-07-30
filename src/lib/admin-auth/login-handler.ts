import { NextResponse } from "next/server";

import {
  ADMIN_LOGIN_BLOCK_SECONDS,
  getAdminLoginClientId,
  getAdminLoginRateLimitStore,
  type AdminLoginRateLimitStore,
} from "@/lib/admin-auth/rate-limit";
import {
  adminSessionCookie,
  createAdminSessionToken,
  hasSameOrigin,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth/session";

type RateLimitStoreFactory = () =>
  | AdminLoginRateLimitStore
  | undefined;

export function createAdminLoginHandler(
  getRateLimitStore: RateLimitStoreFactory = getAdminLoginRateLimitStore
) {
  return async function login(request: Request) {
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

    const clientId = getAdminLoginClientId(request);
    const rateLimitStore = getRateLimitStore();
    try {
      if (await rateLimitStore?.isBlocked(clientId)) {
        return NextResponse.json(
          { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
          {
            status: 429,
            headers: {
              "Cache-Control": "no-store",
              "Retry-After": String(ADMIN_LOGIN_BLOCK_SECONDS),
            },
          }
        );
      }
    } catch {
      // Rate Limit 저장소 장애가 관리자 인증 자체를 차단하지 않게 한다.
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
      try {
        await rateLimitStore?.recordFailure(clientId);
      } catch {
        // 실패 기록 장애 시에도 일반 인증 실패 응답은 유지한다.
      }
      return NextResponse.json(
        { error: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    try {
      await rateLimitStore?.reset(clientId);
    } catch {
      // 인증 성공은 Rate Limit 저장소 가용성과 분리한다.
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
  };
}
