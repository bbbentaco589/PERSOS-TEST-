import "server-only";

import { randomUUID } from "node:crypto";

import { Redis } from "@upstash/redis";

import { employees } from "@/data";
import { isPublicActiveCharacter } from "@/lib/character-runtime-policy";
import type {
  ExternalActivityPlatform,
  ExternalActivityPost,
  ExternalActivityPostInput,
} from "@/types/external-activity";

const EXTERNAL_ACTIVITY_KEY = "persos:external-activities:v1";
export const EXTERNAL_ACTIVITY_LIMIT = 100;
const platforms = new Set<ExternalActivityPlatform>([
  "Naver Blog",
  "Instagram",
  "YouTube",
  "X",
  "Threads",
  "Other",
]);

function readRedisConfig() {
  const url = process.env.KV_REST_API_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : undefined;
}

function getRedis() {
  const config = readRedisConfig();
  return config ? new Redis(config) : undefined;
}

function requiredText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label}을(를) 입력해 주세요.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${label}은(는) ${maxLength}자 이하여야 합니다.`);
  return normalized;
}

export function isExternalActivityStoreConfigured() {
  return Boolean(readRedisConfig());
}

export function parseExternalActivityInput(input: ExternalActivityPostInput): ExternalActivityPost {
  const id = typeof input.id === "string" && input.id.trim() ? input.id.trim() : `external-${randomUUID()}`;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error("게시물 ID 형식이 올바르지 않습니다.");

  const employeeId = requiredText(input.employeeId, "페르소나", 100);
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee || !isPublicActiveCharacter(employee)) throw new Error("공개 활동 중인 페르소나만 선택할 수 있습니다.");
  if (!platforms.has(input.platform)) throw new Error("지원하지 않는 외부 플랫폼입니다.");

  const externalUrl = requiredText(input.externalUrl, "외부 링크", 2_000);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(externalUrl);
  } catch {
    throw new Error("올바른 외부 링크를 입력해 주세요.");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("외부 링크는 https:// 주소만 사용할 수 있습니다.");

  const publishedAt = requiredText(input.publishedAt, "발행일", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) throw new Error("발행일은 YYYY-MM-DD 형식이어야 합니다.");

  return {
    id,
    employeeId,
    platform: input.platform,
    title: requiredText(input.title, "제목", 120),
    summary: requiredText(input.summary, "요약", 300),
    externalUrl: parsedUrl.toString(),
    publishedAt,
    active: input.active !== false,
  };
}

async function readStoredPosts(redis: Redis) {
  const stored = await redis.get<ExternalActivityPost[]>(EXTERNAL_ACTIVITY_KEY);
  return Array.isArray(stored) ? stored : [];
}

export async function listExternalActivityPosts({ includeInactive = false }: { includeInactive?: boolean } = {}) {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const posts = await readStoredPosts(redis);
    return posts
      .filter((post) => includeInactive || post.active)
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
      .slice(0, EXTERNAL_ACTIVITY_LIMIT);
  } catch (error) {
    console.error("[External activities] KV read failed:", error instanceof Error ? error.message : "unknown error");
    return [];
  }
}

export async function upsertExternalActivityPost(input: ExternalActivityPostInput) {
  const redis = getRedis();
  if (!redis) throw new Error("외부 활동 KV 저장소가 설정되지 않았습니다.");
  const post = parseExternalActivityInput(input);
  const current = await readStoredPosts(redis);
  const next = [post, ...current.filter((item) => item.id !== post.id)]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, EXTERNAL_ACTIVITY_LIMIT);
  await redis.set(EXTERNAL_ACTIVITY_KEY, next);
  return next;
}

export async function upsertExternalActivityPosts(inputs: ExternalActivityPostInput[]) {
  const redis = getRedis();
  if (!redis) throw new Error("외부 활동 KV 저장소가 설정되지 않았습니다.");
  const incoming = inputs.map(parseExternalActivityInput);
  const current = await readStoredPosts(redis);
  const incomingIds = new Set(incoming.map((item) => item.id));
  const next = [...incoming, ...current.filter((item) => !incomingIds.has(item.id))]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, EXTERNAL_ACTIVITY_LIMIT);
  await redis.set(EXTERNAL_ACTIVITY_KEY, next);
  return next;
}

export async function deleteExternalActivityPost(id: string) {
  const redis = getRedis();
  if (!redis) throw new Error("외부 활동 KV 저장소가 설정되지 않았습니다.");
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error("삭제할 게시물 ID가 올바르지 않습니다.");
  const current = await readStoredPosts(redis);
  const next = current.filter((item) => item.id !== id);
  await redis.set(EXTERNAL_ACTIVITY_KEY, next);
  return next;
}
