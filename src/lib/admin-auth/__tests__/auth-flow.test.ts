import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST as login } from "@/app/api/admin-auth/login/route";
import { POST as logout } from "@/app/api/admin-auth/logout/route";
import { createAdminLoginHandler } from "@/lib/admin-auth/login-handler";
import {
  ADMIN_LOGIN_BLOCK_SECONDS,
  ADMIN_LOGIN_FAILURE_LIMIT,
  ADMIN_LOGIN_FAILURE_WINDOW_SECONDS,
  type AdminLoginRateLimitStore,
} from "@/lib/admin-auth/rate-limit";
import {
  ADMIN_SESSION_TTL_SECONDS,
  adminSessionCookie,
  createAdminSessionToken,
  hasAuthorizedAdminMutation,
  hasAuthorizedAdminRead,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from "@/lib/admin-auth/session";
import { proxy } from "@/proxy";

const TEST_PASSWORD = "local-admin-auth-test";

function request(
  path: string,
  init?: RequestInit,
  clientIp = "203.0.113.10"
) {
  return new Request(`https://persos.test${path}`, {
    ...init,
    headers: {
      host: "persos.test",
      origin: "https://persos.test",
      "x-forwarded-for": clientIp,
      ...(init?.headers ?? {}),
    },
  });
}

class MemoryRateLimitStore implements AdminLoginRateLimitStore {
  private readonly failures = new Map<
    string,
    { count: number; expiresAt: number }
  >();
  private readonly blocks = new Map<string, number>();

  constructor(private now: () => number) {}

  async isBlocked(clientId: string) {
    const blockedUntil = this.blocks.get(clientId) ?? 0;
    if (blockedUntil <= this.now()) {
      this.blocks.delete(clientId);
      return false;
    }
    return true;
  }

  async recordFailure(clientId: string) {
    const current = this.failures.get(clientId);
    const next =
      !current || current.expiresAt <= this.now()
        ? {
            count: 1,
            expiresAt:
              this.now() + ADMIN_LOGIN_FAILURE_WINDOW_SECONDS * 1_000,
          }
        : { ...current, count: current.count + 1 };

    this.failures.set(clientId, next);
    if (next.count >= ADMIN_LOGIN_FAILURE_LIMIT) {
      this.blocks.set(
        clientId,
        this.now() + ADMIN_LOGIN_BLOCK_SECONDS * 1_000
      );
    }
    return next.count;
  }

  async reset(clientId: string) {
    this.failures.delete(clientId);
    this.blocks.delete(clientId);
  }
}

function loginRequest(password: string, clientIp = "203.0.113.10") {
  return request(
    "/api/admin-auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    },
    clientIp
  );
}

test.beforeEach(() => {
  process.env.ADMIN_PASSWORD = TEST_PASSWORD;
  delete process.env.ADMIN_SESSION_SECRET;
});

test.after(() => {
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SESSION_SECRET;
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

test("관리자 비밀번호와 별도 세션 서명 키를 사용할 수 있다", () => {
  process.env.ADMIN_SESSION_SECRET = "dedicated-session-secret";
  const token = createAdminSessionToken();
  assert.equal(verifyAdminSessionToken(token), true);

  process.env.ADMIN_SESSION_SECRET = "rotated-session-secret";
  assert.equal(verifyAdminSessionToken(token), false);
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

test("관리자 API 라우트도 프록시와 별개로 인증을 검증한다", () => {
  assert.equal(
    hasAuthorizedAdminRead(request("/api/admin/external-activities")),
    false
  );
  assert.equal(
    hasAuthorizedAdminMutation(
      request("/api/admin/lobby-events", { method: "POST" })
    ),
    false
  );

  const token = createAdminSessionToken();
  const authenticatedRequest = request("/api/admin/lobby-events", {
    method: "POST",
    headers: { cookie: `${adminSessionCookie.name}=${token}` },
  });
  assert.equal(hasAuthorizedAdminRead(authenticatedRequest), true);
  assert.equal(hasAuthorizedAdminMutation(authenticatedRequest), true);
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

test("동일 IP의 5회 이하 실패는 기존 인증 실패 응답을 유지한다", async () => {
  const now = Date.now();
  const store = new MemoryRateLimitStore(() => now);
  const limitedLogin = createAdminLoginHandler(() => store);

  for (let attempt = 1; attempt <= ADMIN_LOGIN_FAILURE_LIMIT; attempt += 1) {
    const response = await limitedLogin(loginRequest("wrong-password"));
    assert.equal(response.status, 401);
  }
});

test("실패 제한을 초과하면 15분 동안 429를 반환한다", async () => {
  const store = new MemoryRateLimitStore(() => Date.now());
  const limitedLogin = createAdminLoginHandler(() => store);

  for (let attempt = 0; attempt < ADMIN_LOGIN_FAILURE_LIMIT; attempt += 1) {
    await limitedLogin(loginRequest("wrong-password"));
  }

  const blocked = await limitedLogin(loginRequest(TEST_PASSWORD));
  assert.equal(blocked.status, 429);
  assert.equal(
    blocked.headers.get("retry-after"),
    String(ADMIN_LOGIN_BLOCK_SECONDS)
  );
  assert.deepEqual(await blocked.json(), {
    error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  });
});

test("차단 시간 만료 후 로그인을 다시 허용한다", async () => {
  let now = Date.now();
  const store = new MemoryRateLimitStore(() => now);
  const limitedLogin = createAdminLoginHandler(() => store);

  for (let attempt = 0; attempt < ADMIN_LOGIN_FAILURE_LIMIT; attempt += 1) {
    await limitedLogin(loginRequest("wrong-password"));
  }
  assert.equal(
    (await limitedLogin(loginRequest(TEST_PASSWORD))).status,
    429
  );

  now += ADMIN_LOGIN_BLOCK_SECONDS * 1_000 + 1;
  assert.equal(
    (await limitedLogin(loginRequest(TEST_PASSWORD))).status,
    200
  );
});

test("로그인 성공 시 해당 IP의 실패 기록을 초기화한다", async () => {
  const store = new MemoryRateLimitStore(() => Date.now());
  const limitedLogin = createAdminLoginHandler(() => store);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    assert.equal(
      (await limitedLogin(loginRequest("wrong-password"))).status,
      401
    );
  }
  assert.equal(
    (await limitedLogin(loginRequest(TEST_PASSWORD))).status,
    200
  );

  for (let attempt = 0; attempt < ADMIN_LOGIN_FAILURE_LIMIT; attempt += 1) {
    assert.equal(
      (await limitedLogin(loginRequest("wrong-password"))).status,
      401
    );
  }
  assert.equal(
    (await limitedLogin(loginRequest(TEST_PASSWORD))).status,
    429
  );
});

test("Rate Limit 저장소 장애 시 관리자 로그인을 fail-closed 처리한다", async () => {
  const unavailableStore: AdminLoginRateLimitStore = {
    isBlocked: async () => {
      throw new Error("store unavailable");
    },
    recordFailure: async () => {
      throw new Error("store unavailable");
    },
    reset: async () => {
      throw new Error("store unavailable");
    },
  };
  const resilientLogin = createAdminLoginHandler(() => unavailableStore);

  assert.equal(
    (await resilientLogin(loginRequest(TEST_PASSWORD))).status,
    503
  );
  assert.equal(
    (await resilientLogin(loginRequest("wrong-password"))).status,
    503
  );
});

test("Rate Limit 저장소가 없으면 관리자 로그인을 fail-closed 처리한다", async () => {
  const protectedLogin = createAdminLoginHandler(() => undefined);
  assert.equal(
    (await protectedLogin(loginRequest(TEST_PASSWORD))).status,
    503
  );
});
