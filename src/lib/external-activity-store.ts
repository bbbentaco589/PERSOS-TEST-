import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { Redis } from "@upstash/redis";

import { employees } from "@/data";
import { isPublicActiveCharacter } from "@/lib/character-runtime-policy";
import type {
  ExternalActivityPlatform,
  ExternalActivityChannelLink,
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

function validatedExternalUrl(value: unknown) {
  const externalUrl = requiredText(value, "외부 링크", 2_000);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(externalUrl);
  } catch {
    throw new Error("올바른 외부 링크를 입력해 주세요.");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("외부 링크는 https:// 주소만 사용할 수 있습니다.");
  parsedUrl.hash = "";
  for (const key of [...parsedUrl.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|ref$|source$)/i.test(key)) parsedUrl.searchParams.delete(key);
  }
  return parsedUrl.toString();
}

function normalizeTitle(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[^a-z0-9가-힣]+/g, " ").trim().replace(/\s+/g, " ");
}

export function createExternalActivityContentKey(input: {
  employeeId: string;
  title: string;
  publishedAt: string;
}) {
  const hash = createHash("sha256")
    .update(`${input.employeeId}:${normalizeTitle(input.title)}:${input.publishedAt}`)
    .digest("hex")
    .slice(0, 24);
  return `external-content-${hash}`;
}

function uniqueChannelLinks(links: ExternalActivityChannelLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.platform}:${link.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function normalizeStoredPost(post: ExternalActivityPost): ExternalActivityPost {
  const contentKey = post.contentKey || createExternalActivityContentKey(post);
  const channelLinks = post.channelLinks?.length
    ? post.channelLinks
    : [{ platform: post.platform, url: post.externalUrl }];
  return { ...post, contentKey, channelLinks: uniqueChannelLinks(channelLinks) };
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

  const externalUrl = validatedExternalUrl(input.externalUrl);

  const publishedAt = requiredText(input.publishedAt, "발행일", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) throw new Error("발행일은 YYYY-MM-DD 형식이어야 합니다.");

  const title = requiredText(input.title, "제목", 120);
  const contentKey = typeof input.contentKey === "string" && input.contentKey.trim()
    ? input.contentKey.trim().slice(0, 120)
    : createExternalActivityContentKey({ employeeId, title, publishedAt });
  if (!/^[a-zA-Z0-9:_-]+$/.test(contentKey)) throw new Error("콘텐츠 묶음 키 형식이 올바르지 않습니다.");
  const suppliedLinks = Array.isArray(input.channelLinks)
    ? input.channelLinks.flatMap((link) =>
        platforms.has(link.platform)
          ? [{ platform: link.platform, url: validatedExternalUrl(link.url) }]
          : []
      )
    : [];

  return {
    id,
    employeeId,
    platform: input.platform,
    title,
    summary: requiredText(input.summary, "요약", 300),
    externalUrl,
    contentKey,
    channelLinks: uniqueChannelLinks([{ platform: input.platform, url: externalUrl }, ...suppliedLinks]),
    publishedAt,
    active: input.active !== false,
  };
}

async function readStoredPosts(redis: Redis) {
  const stored = await redis.get<ExternalActivityPost[]>(EXTERNAL_ACTIVITY_KEY);
  return Array.isArray(stored) ? stored.map(normalizeStoredPost) : [];
}

function mergePosts(existing: ExternalActivityPost, incoming: ExternalActivityPost): ExternalActivityPost {
  return {
    ...incoming,
    id: existing.id,
    channelLinks: uniqueChannelLinks([...incoming.channelLinks, ...existing.channelLinks]),
  };
}

function mergePostLists(current: ExternalActivityPost[], incoming: ExternalActivityPost[]) {
  const withoutEditedIds = current.filter((item) => !incoming.some((candidate) => candidate.id === item.id));
  const byContentKey = new Map(withoutEditedIds.map((item) => [item.contentKey, item]));
  for (const post of incoming) {
    const existing = byContentKey.get(post.contentKey);
    byContentKey.set(post.contentKey, existing ? mergePosts(existing, post) : post);
  }
  return [...byContentKey.values()]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, EXTERNAL_ACTIVITY_LIMIT);
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
  const next = mergePostLists(current, [post]);
  await redis.set(EXTERNAL_ACTIVITY_KEY, next);
  return next;
}

export async function upsertExternalActivityPosts(inputs: ExternalActivityPostInput[]) {
  const redis = getRedis();
  if (!redis) throw new Error("외부 활동 KV 저장소가 설정되지 않았습니다.");
  const incoming = inputs.map(parseExternalActivityInput);
  const current = await readStoredPosts(redis);
  const next = mergePostLists(current, incoming);
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
