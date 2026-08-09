import assert from "node:assert/strict";
import test from "node:test";

import { getOrganizationRunKVKeyPrefix } from "@/lib/organization-run/kv-publisher";

test("Production은 기존 Organization Run KV Key를 그대로 유지한다", () => {
  assert.equal(
    getOrganizationRunKVKeyPrefix({ VERCEL_ENV: "production" }),
    "persos:org-run"
  );
});

test("Preview는 동일 Upstash를 사용해도 Production Key를 생성할 수 없다", () => {
  const automatic = getOrganizationRunKVKeyPrefix({
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_REF: "agent/tect-canonical-runtime",
  });
  const configured = getOrganizationRunKVKeyPrefix({
    VERCEL_ENV: "preview",
    PERSOS_KV_NAMESPACE: "production",
  });

  assert.equal(
    automatic,
    "persos:preview:agent-tect-canonical-runtime:org-run"
  );
  assert.equal(configured, "persos:preview:production:org-run");
  assert.notEqual(automatic, "persos:org-run");
  assert.notEqual(configured, "persos:org-run");
});

test("Vercel 환경값이 없으면 Local 전용 Key로 fail-safe 처리한다", () => {
  assert.equal(
    getOrganizationRunKVKeyPrefix({}),
    "persos:development:local:org-run"
  );
});
