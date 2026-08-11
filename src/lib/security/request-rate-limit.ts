import { createHmac } from "node:crypto";

import { Redis } from "@upstash/redis";

type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowSeconds: number;
};

export type RequestRateLimitResult = {
  allowed: boolean;
  available: boolean;
  retryAfter: number;
};

function readRedisConfig() {
  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) return undefined;
  return { url, token };
}

function getSigningSecret() {
  return (
    process.env.RATE_LIMIT_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.DEMO_TRIGGER_SECRET?.trim()
  );
}

function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return address.slice(0, 128);
}

function getClientId(request: Request, scope: string, signingSecret: string) {
  return createHmac("sha256", signingSecret)
    .update(`persos-request-rate-limit-v1:${scope}:${getClientAddress(request)}`)
    .digest("hex");
}

function createRedis() {
  const config = readRedisConfig();
  return config ? new Redis(config) : undefined;
}

export async function checkRequestRateLimit(
  request: Request,
  policy: RateLimitPolicy
): Promise<RequestRateLimitResult> {
  const redis = createRedis();
  const signingSecret = getSigningSecret();
  if (!redis || !signingSecret) {
    return {
      allowed: false,
      available: false,
      retryAfter: policy.windowSeconds,
    };
  }

  const clientId = getClientId(request, policy.scope, signingSecret);
  const key = `persos:request-rate-limit:${policy.scope}:${clientId}`;

  try {
    const rawResult = (await redis.eval(
      "local n = redis.call('incr', KEYS[1]); if n == 1 then redis.call('expire', KEYS[1], ARGV[1]) end; return {n, redis.call('ttl', KEYS[1])}",
      [key],
      [policy.windowSeconds]
    )) as [number | string, number | string];
    const count = Number(rawResult[0]);
    const ttl = Number(rawResult[1]);

    return {
      allowed: Number.isFinite(count) && count <= policy.limit,
      available: true,
      retryAfter: Number.isFinite(ttl) && ttl > 0 ? ttl : policy.windowSeconds,
    };
  } catch {
    return {
      allowed: false,
      available: false,
      retryAfter: policy.windowSeconds,
    };
  }
}

export async function resetRequestRateLimit(
  request: Request,
  scope: string
) {
  const redis = createRedis();
  const signingSecret = getSigningSecret();
  if (!redis || !signingSecret) return;

  const clientId = getClientId(request, scope, signingSecret);
  try {
    await redis.del(`persos:request-rate-limit:${scope}:${clientId}`);
  } catch {
    // A successful credential check must not fail because cleanup is unavailable.
  }
}
