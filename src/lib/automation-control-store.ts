import { randomUUID } from "node:crypto";

import { Redis } from "@upstash/redis";

import { employees } from "@/data";
import { isPublicActiveCharacter } from "@/lib/character-runtime-policy";
import type {
  AutomationDailyUsage,
  AutomationPolicy,
  AutomationRunRecord,
  AutomationSnapshot,
  CharacterActivityMemory,
  CharacterRelationship,
  ExternalActivitySource,
  ExternalActivitySyncRun,
  OrganizationRunBoardType,
} from "@/types";

const validExternalPlatforms = new Set([
  "Naver Blog",
  "Instagram",
  "YouTube",
  "X",
  "Threads",
  "Other",
] as const);

export const DEFAULT_AUTOMATION_POLICY: AutomationPolicy = {
  enabled: true,
  enabledBoards: ["debate", "public", "anonymous"],
  dailyRunLimit: 1,
  dailyGeminiCallLimit: 7,
  maxParticipants: 3,
  autoPublish: true,
  memoryRetention: 40,
  externalSyncEnabled: true,
};

function readRedisConfig() {
  const url = process.env.KV_REST_API_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : undefined;
}

function getRedis() {
  const config = readRedisConfig();
  return config ? new Redis(config) : undefined;
}

function normalizeNamespaceSegment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

function getAutomationPrefix() {
  if (process.env.VERCEL_ENV === "production") return "persos:org-run";
  if (process.env.VERCEL_ENV === "preview") {
    const namespace = normalizeNamespaceSegment(process.env.PERSOS_KV_NAMESPACE?.trim() || process.env.VERCEL_GIT_COMMIT_REF?.trim() || "shared");
    return `persos:preview:${namespace || "shared"}:org-run`;
  }
  const namespace = normalizeNamespaceSegment(process.env.PERSOS_KV_NAMESPACE?.trim() || "local");
  return `persos:development:${namespace || "local"}:org-run`;
}

function key(name: string) {
  return `${getAutomationPrefix()}:automation:${name}`;
}

function todayInKorea(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

const validBoards = new Set<OrganizationRunBoardType>(["debate", "public", "anonymous"]);

export function parseAutomationPolicy(value: unknown): AutomationPolicy {
  const input = value && typeof value === "object" ? value as Partial<AutomationPolicy> : {};
  const enabledBoards = Array.isArray(input.enabledBoards)
    ? input.enabledBoards.filter((board): board is OrganizationRunBoardType => validBoards.has(board))
    : DEFAULT_AUTOMATION_POLICY.enabledBoards;
  return {
    enabled: input.enabled !== false,
    enabledBoards: [...new Set(enabledBoards)],
    dailyRunLimit: clampInteger(input.dailyRunLimit, 1, 1, 3),
    dailyGeminiCallLimit: clampInteger(input.dailyGeminiCallLimit, 7, 3, 20),
    maxParticipants: 3,
    autoPublish: input.autoPublish !== false,
    memoryRetention: clampInteger(input.memoryRetention, 40, 10, 100),
    externalSyncEnabled: input.externalSyncEnabled !== false,
  };
}

export async function getAutomationPolicy() {
  const redis = getRedis();
  if (!redis) return DEFAULT_AUTOMATION_POLICY;
  return parseAutomationPolicy(await redis.get<AutomationPolicy>(key("policy")));
}

export async function saveAutomationPolicy(value: unknown) {
  const redis = getRedis();
  if (!redis) throw new Error("자동화 운영 KV 저장소가 설정되지 않았습니다.");
  const policy = parseAutomationPolicy(value);
  await redis.set(key("policy"), policy);
  return policy;
}

export function isFreeTierConfirmed() {
  return process.env.AI_AUTOMATION_FREE_TIER_CONFIRMED?.trim().toLowerCase() === "true";
}

export async function getAutomationDailyUsage(date = todayInKorea()) {
  const redis = getRedis();
  const empty: AutomationDailyUsage = { date, runs: 0, reservedCalls: 0, actualCalls: 0 };
  return redis ? (await redis.get<AutomationDailyUsage>(key(`usage:${date}`))) ?? empty : empty;
}

export async function reserveAutomationBudget(input: { policy: AutomationPolicy; expectedCalls: number }) {
  const redis = getRedis();
  if (!redis) throw new Error("자동화 운영 KV 저장소가 설정되지 않았습니다.");
  const date = todayInKorea();
  const result = await redis.eval(
    `local raw = redis.call('get', KEYS[1])
     local usage = raw and cjson.decode(raw) or {date=ARGV[1],runs=0,reservedCalls=0,actualCalls=0}
     local nextRuns = usage.runs + 1
     local nextCalls = usage.reservedCalls + tonumber(ARGV[2])
     if nextRuns > tonumber(ARGV[3]) then return {0, usage.runs, usage.reservedCalls} end
     if nextCalls > tonumber(ARGV[4]) then return {-1, usage.runs, usage.reservedCalls} end
     usage.runs = nextRuns
     usage.reservedCalls = nextCalls
     redis.call('set', KEYS[1], cjson.encode(usage), 'EX', 172800)
     return {1, nextRuns, nextCalls}`,
    [key(`usage:${date}`)],
    [date, String(input.expectedCalls), String(input.policy.dailyRunLimit), String(input.policy.dailyGeminiCallLimit)]
  ) as [number, number, number];
  return {
    allowed: result[0] === 1,
    reason: result[0] === 0 ? "daily_run_limit" : result[0] === -1 ? "daily_call_limit" : undefined,
  };
}

export async function settleAutomationBudget(input: { reservedCalls: number; actualCalls: number }) {
  const redis = getRedis();
  if (!redis) return;
  const date = todayInKorea();
  await redis.eval(
    `local raw = redis.call('get', KEYS[1]); if not raw then return 0 end
     local usage = cjson.decode(raw)
     local refund = math.max(0, tonumber(ARGV[1]) - tonumber(ARGV[2]))
     usage.reservedCalls = math.max(0, usage.reservedCalls - refund)
     usage.actualCalls = (usage.actualCalls or 0) + tonumber(ARGV[2])
     redis.call('set', KEYS[1], cjson.encode(usage), 'EX', 172800)
     return 1`,
    [key(`usage:${date}`)],
    [input.reservedCalls, input.actualCalls]
  );
}

async function prependBounded<T>(redis: Redis, storageKey: string, item: T, limit: number) {
  const current = (await redis.get<T[]>(storageKey)) ?? [];
  await redis.set(storageKey, [item, ...current].slice(0, limit));
}

export async function saveAutomationRun(record: Omit<AutomationRunRecord, "id" | "createdAt">) {
  const redis = getRedis();
  if (!redis) return;
  await prependBounded(redis, key("runs"), { ...record, id: randomUUID(), createdAt: new Date().toISOString() }, 100);
}

export async function listExternalActivitySources() {
  const redis = getRedis();
  return redis ? (await redis.get<ExternalActivitySource[]>(key("external-sources"))) ?? [] : [];
}

export async function upsertExternalActivitySource(value: Partial<ExternalActivitySource>) {
  const redis = getRedis();
  if (!redis) throw new Error("자동화 운영 KV 저장소가 설정되지 않았습니다.");
  const employee = employees.find((item) => item.id === value.employeeId);
  if (!employee || !isPublicActiveCharacter(employee)) throw new Error("공개 활동 중인 페르소나를 선택해 주세요.");
  if (!value.label?.trim()) throw new Error("소스 이름을 입력해 주세요.");
  if (value.mode !== "rss" && value.mode !== "webhook") throw new Error("지원하지 않는 수집 방식입니다.");
  if (!value.platform || !validExternalPlatforms.has(value.platform)) {
    throw new Error("지원하지 않는 외부 플랫폼입니다.");
  }
  let sourceUrl: string | undefined;
  if (value.mode === "rss") {
    try {
      const parsed = new URL(value.sourceUrl ?? "");
      if (parsed.protocol !== "https:") throw new Error();
      sourceUrl = parsed.toString();
    } catch {
      throw new Error("RSS/Atom 소스는 https:// URL이 필요합니다.");
    }
  }
  const now = new Date().toISOString();
  const current = await listExternalActivitySources();
  const previous = current.find((item) => item.id === value.id);
  const source: ExternalActivitySource = {
    id: previous?.id ?? `source-${randomUUID()}`,
    employeeId: employee.id,
    platform: value.platform,
    label: value.label.trim().slice(0, 80),
    mode: value.mode,
    sourceUrl,
    active: value.active !== false,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  await redis.set(key("external-sources"), [source, ...current.filter((item) => item.id !== source.id)].slice(0, 50));
  return source;
}

export async function deleteExternalActivitySource(id: string) {
  const redis = getRedis();
  if (!redis) throw new Error("자동화 운영 KV 저장소가 설정되지 않았습니다.");
  const current = await listExternalActivitySources();
  await redis.set(key("external-sources"), current.filter((item) => item.id !== id));
}

export async function saveExternalActivitySyncRun(run: Omit<ExternalActivitySyncRun, "id" | "createdAt">) {
  const redis = getRedis();
  if (!redis) return;
  await prependBounded(redis, key("external-sync-runs"), { ...run, id: randomUUID(), createdAt: new Date().toISOString() }, 50);
}

export async function getAutomationSnapshot(): Promise<AutomationSnapshot> {
  const redis = getRedis();
  const [policy, usage] = await Promise.all([getAutomationPolicy(), getAutomationDailyUsage()]);
  const [recentRuns, sources, recentSyncRuns, memories, relationships] = redis
    ? await Promise.all([
        redis.get<AutomationRunRecord[]>(key("runs")),
        redis.get<ExternalActivitySource[]>(key("external-sources")),
        redis.get<ExternalActivitySyncRun[]>(key("external-sync-runs")),
        redis.get<CharacterActivityMemory[]>(key("memory:all")),
        redis.get<CharacterRelationship[]>(key("relationships:all")),
      ])
    : [[], [], [], [], []];
  return {
    configured: Boolean(redis),
    providerConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    freeTierConfirmed: isFreeTierConfirmed(),
    policy,
    usage,
    recentRuns: recentRuns ?? [],
    sources: sources ?? [],
    recentSyncRuns: recentSyncRuns ?? [],
    memories: memories ?? [],
    relationships: relationships ?? [],
  };
}

export function getScheduledBoard(policy: AutomationPolicy, now = new Date()) {
  if (!policy.enabledBoards.length) return undefined;
  const date = todayInKorea(now);
  const dayNumber = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return policy.enabledBoards[Math.abs(dayNumber) % policy.enabledBoards.length];
}

export const automationStoreInternals = { todayInKorea };
