import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST as login } from "@/app/api/admin-auth/login/route";
import { POST as logout } from "@/app/api/admin-auth/logout/route";
import {
  ADMIN_SESSION_TTL_SECONDS,
  adminSessionCookie,
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from "@/lib/admin-auth/session";
import { proxy } from "@/proxy";

const TEST_PASSWORD = "local-admin-auth-test";

function request(path: string, init?: RequestInit) {
  return new Request(`https://persos.test${path}`, {
    ...init,
    headers: {
      host: "persos.test",
      origin: "https://persos.test",
      ...(init?.headers ?? {}),
    },
  });
}

test.beforeEach(() => {
  process.env.ADMIN_PASSWORD = TEST_PASSWORD;
});

test.after(() => {
  delete process.env.ADMIN_PASSWORD;
});

test("비밀번호와 24시간 서명 세션을 검증한다", () => {
  assert.equal(verifyAdminPassword(TEST_PASSWORD), true);
  assert.equal(verifyAdminPassword("wrong-password"), false);

  const now = Date.now();
  const token = createAdminSessionToken(now);
  assert.equal(
    verifyAdminSessionToken(
      token,
      now + ADMIN_SESSION_TTL_SECONDS * 1_000 - 1_000
    ),
    true
  );
  assert.equal(
    verifyAdminSessionToken(
      token,
      now + ADMIN_SESSION_TTL_SECONDS * 1_000 + 1_000
    ),
    false
  );
});

test("로그인 실패와 성공 쿠키 속성을 반환한다", async () => {
  const failed = await login(
    request("/api/admin-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong-password" }),
    })
  );
  assert.equal(failed.status, 401);

  const succeeded = await login(
    request("/api/admin-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    })
  );
  assert.equal(succeeded.status, 200);

  const setCookie = succeeded.headers.get("set-cookie") ?? "";
  assert.match(setCookie, new RegExp(`^${adminSessionCookie.name}=`));
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=strict/i);
  assert.match(setCookie, new RegExp(`Max-Age=${ADMIN_SESSION_TTL_SECONDS}`));
});

test("미인증 직접 접근을 막고 유효한 쿠키는 통과시킨다", () => {
  const blocked = proxy(new NextRequest("https://persos.test/admin/settings"));
  assert.equal(blocked.status, 307);
  assert.equal(
    new URL(blocked.headers.get("location") ?? "").pathname,
    "/admin-login"
  );

  const blockedApi = proxy(
    new NextRequest("https://persos.test/api/admin/topics")
  );
  assert.equal(blockedApi.status, 401);

  const token = createAdminSessionToken();
  const allowed = proxy(
    new NextRequest("https://persos.test/investor-demo", {
      headers: {
        cookie: `${adminSessionCookie.name}=${token}`,
      },
    })
  );
  assert.equal(allowed.headers.get("x-middleware-next"), "1");
});

test("로그아웃은 관리자 쿠키를 즉시 만료한다", async () => {
  const response = await logout(
    request("/api/admin-auth/logout", { method: "POST" })
  );
  assert.equal(response.status, 200);

  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.match(setCookie, new RegExp(`^${adminSessionCookie.name}=`));
  assert.match(setCookie, /Max-Age=0/i);
});
