import { createHmac } from "node:crypto";

import { Redis } from "@upstash/redis";

export const ADMIN_LOGIN_FAILURE_LIMIT = 5;
export const ADMIN_LOGIN_FAILURE_WINDOW_SECONDS = 10 * 60;
export const ADMIN_LOGIN_BLOCK_SECONDS = 15 * 60;

export interface AdminLoginRateLimitStore {
  isBlocked(clientId: string): Promise<boolean>;
  recordFailure(clientId: string): Promise<number>;
  reset(clientId: string): Promise<void>;
}

const KEY = {
  failures: (clientId: string) =>
    `persos:admin-auth:login-failures:${clientId}`,
  block: (clientId: string) => `persos:admin-auth:login-block:${clientId}`,
} as const;

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

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstAddress = forwardedFor.split(",")[0]?.trim();
    if (firstAddress) return firstAddress;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getAdminLoginClientId(request: Request) {
  const signingSecret =
    process.env.RATE_LIMIT_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();
  if (!signingSecret) {
    throw new Error("관리자 인증 설정이 필요합니다.");
  }

  return createHmac("sha256", signingSecret)
    .update(`persos-admin-login-rate-limit-v1:${getClientIp(request)}`)
    .digest("hex");
}

class MemoryAdminLoginRateLimitStore implements AdminLoginRateLimitStore {
  private readonly failures = new Map<string, { count: number; expiresAt: number }>();
  private readonly blocks = new Map<string, number>();

  async isBlocked(clientId: string) {
    const now = Date.now();
    const blockedUntil = this.blocks.get(clientId) ?? 0;
    if (blockedUntil <= now) {
      this.blocks.delete(clientId);
      return false;
    }
    return true;
  }

  async recordFailure(clientId: string) {
    const now = Date.now();
    const current = this.failures.get(clientId);
    const next = !current || current.expiresAt <= now
      ? { count: 1, expiresAt: now + ADMIN_LOGIN_FAILURE_WINDOW_SECONDS * 1_000 }
      : { ...current, count: current.count + 1 };

    this.failures.set(clientId, next);
    if (next.count >= ADMIN_LOGIN_FAILURE_LIMIT) {
      this.blocks.set(clientId, now + ADMIN_LOGIN_BLOCK_SECONDS * 1_000);
    }
    return next.count;
  }

  async reset(clientId: string) {
    this.failures.delete(clientId);
    this.blocks.delete(clientId);
  }
}

export class KVAdminLoginRateLimitStore
  implements AdminLoginRateLimitStore
{
  private readonly redis: Redis;

  constructor(config = readRedisConfig()) {
    if (!config) {
      throw new Error("관리자 로그인 Rate Limit 저장소가 설정되지 않았습니다.");
    }
    this.redis = new Redis(config);
  }

  async isBlocked(clientId: string) {
    return Boolean(await this.redis.exists(KEY.block(clientId)));
  }

  async recordFailure(clientId: string) {
    const count = Number(
      await this.redis.eval(
        "local n = redis.call('incr', KEYS[1]); if n == 1 then redis.call('expire', KEYS[1], ARGV[1]) end; if n >= tonumber(ARGV[2]) then redis.call('set', KEYS[2], '1', 'EX', ARGV[3], 'NX') end; return n",
        [KEY.failures(clientId), KEY.block(clientId)],
        [
          ADMIN_LOGIN_FAILURE_WINDOW_SECONDS,
          ADMIN_LOGIN_FAILURE_LIMIT,
          ADMIN_LOGIN_BLOCK_SECONDS,
        ]
      )
    );
    return count;
  }

  async reset(clientId: string) {
    await this.redis.del(KEY.failures(clientId), KEY.block(clientId));
  }
}

let rateLimitStore: KVAdminLoginRateLimitStore | undefined;
let developmentRateLimitStore: MemoryAdminLoginRateLimitStore | undefined;

export function getAdminLoginRateLimitStore() {
  if (!readRedisConfig()) {
    if (process.env.NODE_ENV === "production") return undefined;
    developmentRateLimitStore ??= new MemoryAdminLoginRateLimitStore();
    return developmentRateLimitStore;
  }
  rateLimitStore ??= new KVAdminLoginRateLimitStore();
  return rateLimitStore;
}
