import { NextResponse } from "next/server";

import {
  createOrganizationRunSession,
  hasSameOrigin,
  organizationRunSessionCookie,
  verifyOrganizationRunSession,
  verifyTriggerSecret,
} from "@/lib/organization-run/security";
import {
  checkRequestRateLimit,
  resetRequestRateLimit,
} from "@/lib/security/request-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_RATE_LIMIT = {
  scope: "organization-run-session",
  limit: 5,
  windowSeconds: 15 * 60,
} as const;

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

  const rateLimit = await checkRequestRateLimit(request, SESSION_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: rateLimit.available
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
          : "요청 보호 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      },
      {
        status: rateLimit.available ? 429 : 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfter),
        },
      }
    );
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
    await resetRequestRateLimit(request, SESSION_RATE_LIMIT.scope);
    const response = NextResponse.json({ unlocked: true });
    response.headers.set("Cache-Control", "no-store");
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
