import assert from "node:assert/strict";
import test from "node:test";

import { POST as postChat } from "@/app/api/chat/route";
import { POST as createOrganizationRunSession } from "@/app/api/organization-run/session/route";
import { checkRequestRateLimit } from "@/lib/security/request-rate-limit";

function sameOriginHeaders(extra: HeadersInit = {}) {
  return {
    origin: "https://persos.test",
    "x-forwarded-host": "persos.test",
    "x-forwarded-proto": "https",
    ...extra,
  };
}

test("공개 AI API는 출처 없는 직접 요청을 거부한다", async () => {
  const response = await postChat(
    new Request("https://persos.test/api/chat", { method: "POST" })
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("공개 AI API는 큰 요청 본문을 AI 호출 전에 거부한다", async () => {
  const response = await postChat(
    new Request("https://persos.test/api/chat", {
      method: "POST",
      headers: sameOriginHeaders({ "content-length": "16385" }),
    })
  );

  assert.equal(response.status, 413);
});

test("조직 실행 Secret 입력은 출처 없는 직접 요청을 거부한다", async () => {
  const response = await createOrganizationRunSession(
    new Request("https://persos.test/api/organization-run/session", {
      method: "POST",
    })
  );

  assert.equal(response.status, 403);
});

test("호출 제한 설정이 없으면 비용 발생 요청을 fail-closed 처리한다", async () => {
  const names = [
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "RATE_LIMIT_SECRET",
    "ADMIN_PASSWORD",
    "DEMO_TRIGGER_SECRET",
  ] as const;
  const previous = new Map(names.map((name) => [name, process.env[name]]));

  try {
    for (const name of names) delete process.env[name];
    const result = await checkRequestRateLimit(
      new Request("https://persos.test/api/chat"),
      { scope: "test", limit: 1, windowSeconds: 60 }
    );

    assert.deepEqual(result, {
      allowed: false,
      available: false,
      retryAfter: 60,
    });
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
