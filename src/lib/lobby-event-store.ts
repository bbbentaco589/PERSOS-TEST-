import "server-only";

import { randomUUID } from "node:crypto";

import { Redis } from "@upstash/redis";

import { defaultLobbyEventBanners } from "@/data/lobby-events";
import type {
  LobbyEventBanner,
  LobbyEventBannerInput,
} from "@/types/lobby-events";

const LOBBY_EVENT_KEY = "persos:lobby:event-banners:v1";
export const LOBBY_EVENT_LIMIT = 5;

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

function getRedis() {
  const config = readRedisConfig();
  return config ? new Redis(config) : undefined;
}

function isAllowedImageUrl(value: string) {
  return (
    value.startsWith("/assets/") ||
    value.startsWith("/brand/") ||
    value.startsWith("https://")
  );
}

function isAllowedActionHref(value: string) {
  return value.startsWith("/") || value.startsWith("https://");
}

function requiredText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label}을(를) 입력해 주세요.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${label}은(는) ${maxLength}자 이하여야 합니다.`);
  }
  return normalized;
}

function optionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`선택 입력값은 ${maxLength}자 이하여야 합니다.`);
  }
  return normalized;
}

export function isLobbyEventStoreConfigured() {
  return Boolean(readRedisConfig());
}

export function parseLobbyEventBannerInput(
  input: LobbyEventBannerInput
): LobbyEventBanner {
  const id = optionalText(input.id, 100) ?? `event-${randomUUID()}`;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error("배너 ID 형식이 올바르지 않습니다.");
  }
  const imageUrl = requiredText(input.imageUrl, "배너 이미지", 1_000);
  if (!isAllowedImageUrl(imageUrl)) {
    throw new Error("배너 이미지는 https:// URL 또는 내부 Asset 경로만 사용할 수 있습니다.");
  }
  const callToActionLabel = optionalText(input.callToActionLabel, 40);
  const callToActionHref = optionalText(input.callToActionHref, 1_000);
  if (callToActionHref && !isAllowedActionHref(callToActionHref)) {
    throw new Error("이동 경로는 사이트 내부 경로 또는 https:// URL이어야 합니다.");
  }
  if (Boolean(callToActionLabel) !== Boolean(callToActionHref)) {
    throw new Error("이동 버튼 문구와 경로를 함께 입력해 주세요.");
  }
  const publishedAt = requiredText(input.publishedAt, "게시일", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    throw new Error("게시일은 YYYY-MM-DD 형식이어야 합니다.");
  }

  return {
    id,
    eyebrow: requiredText(input.eyebrow, "분류", 40),
    title: requiredText(input.title, "제목", 100),
    summary: requiredText(input.summary, "요약", 180),
    body: requiredText(input.body, "팝업 본문", 3_000),
    imageUrl,
    callToActionLabel,
    callToActionHref,
    publishedAt,
    active: input.active !== false,
  };
}

async function readStoredBanners(redis: Redis) {
  const stored = await redis.get<LobbyEventBanner[]>(LOBBY_EVENT_KEY);
  return Array.isArray(stored) ? stored : defaultLobbyEventBanners;
}

export async function listLobbyEventBanners({
  includeInactive = false,
}: { includeInactive?: boolean } = {}) {
  const redis = getRedis();
  let banners = defaultLobbyEventBanners;

  if (redis) {
    try {
      banners = await readStoredBanners(redis);
    } catch (error) {
      console.error(
        "[Lobby events] KV read failed:",
        error instanceof Error ? error.message : "unknown error"
      );
    }
  }

  return banners
    .filter((banner) => includeInactive || banner.active)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, LOBBY_EVENT_LIMIT);
}

export async function upsertLobbyEventBanner(input: LobbyEventBannerInput) {
  const redis = getRedis();
  if (!redis) {
    throw new Error("로비 이벤트 배너 KV 저장소가 설정되지 않았습니다.");
  }
  const banner = parseLobbyEventBannerInput(input);
  const current = await readStoredBanners(redis);
  const next = [
    banner,
    ...current.filter((item) => item.id !== banner.id),
  ]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, LOBBY_EVENT_LIMIT);
  await redis.set(LOBBY_EVENT_KEY, next);
  return next;
}

export async function deleteLobbyEventBanner(id: string) {
  const redis = getRedis();
  if (!redis) {
    throw new Error("로비 이벤트 배너 KV 저장소가 설정되지 않았습니다.");
  }
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error("삭제할 배너 ID가 올바르지 않습니다.");
  }
  const current = await readStoredBanners(redis);
  const next = current.filter((item) => item.id !== id);
  await redis.set(LOBBY_EVENT_KEY, next);
  return next;
}
