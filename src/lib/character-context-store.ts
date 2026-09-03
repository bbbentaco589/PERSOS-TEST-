import { randomUUID } from "node:crypto";

import { Redis } from "@upstash/redis";

import { employees } from "@/data";
import type {
  CharacterContextRecord,
  CharacterContextRecordCategory,
} from "@/types";

const RECORD_LIMIT = 200;
const validCategories = new Set<CharacterContextRecordCategory>([
  "story",
  "history",
  "relationship",
  "setting",
  "memory",
]);

function getRedis() {
  const url = process.env.KV_REST_API_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? new Redis({ url, token }) : undefined;
}

function namespace() {
  if (process.env.VERCEL_ENV === "production") return "persos:production";
  if (process.env.VERCEL_ENV === "preview") {
    const preview = (process.env.PERSOS_KV_NAMESPACE || process.env.VERCEL_GIT_COMMIT_REF || "shared")
      .trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 64);
    return `persos:preview:${preview || "shared"}`;
  }
  return `persos:development:${(process.env.PERSOS_KV_NAMESPACE || "local").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 64)}`;
}

function storageKey(employeeId: string) {
  return `${namespace()}:admin:character-context:${employeeId}:records:v1`;
}

function requiredText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label}을(를) 입력해 주세요.`);
  return value.trim().slice(0, maxLength);
}

function optionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    return parsed.toString();
  } catch {
    throw new Error("근거 링크 형식이 올바르지 않습니다.");
  }
}

export function isCharacterContextStoreConfigured() {
  return Boolean(getRedis());
}

export async function listCharacterContextRecords(employeeId: string) {
  const redis = getRedis();
  if (!redis) return [];
  const records = await redis.get<CharacterContextRecord[]>(storageKey(employeeId));
  return Array.isArray(records)
    ? records.sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.updatedAt.localeCompare(left.updatedAt))
    : [];
}

export async function saveCharacterContextRecord(input: Partial<CharacterContextRecord>) {
  const redis = getRedis();
  if (!redis) throw new Error("캐릭터 컨텍스트 KV 저장소가 설정되지 않았습니다.");
  const employeeId = requiredText(input.employeeId, "페르소나", 100);
  if (!employees.some((employee) => employee.id === employeeId)) throw new Error("등록되지 않은 페르소나입니다.");
  if (!input.category || !validCategories.has(input.category)) throw new Error("기록 분류가 올바르지 않습니다.");
  if (input.relatedEmployeeId && !employees.some((employee) => employee.id === input.relatedEmployeeId)) {
    throw new Error("연결할 페르소나가 올바르지 않습니다.");
  }
  const now = new Date().toISOString();
  const current = await listCharacterContextRecords(employeeId);
  const previous = current.find((record) => record.id === input.id);
  const record: CharacterContextRecord = {
    id: previous?.id ?? `context-${randomUUID()}`,
    employeeId,
    category: input.category,
    title: requiredText(input.title, "제목", 100),
    body: requiredText(input.body, "기록 내용", 2_000),
    relatedEmployeeId: input.relatedEmployeeId || undefined,
    evidenceUrl: optionalUrl(input.evidenceUrl),
    pinned: input.pinned === true,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  await redis.set(storageKey(employeeId), [record, ...current.filter((item) => item.id !== record.id)].slice(0, RECORD_LIMIT));
  return listCharacterContextRecords(employeeId);
}

export async function deleteCharacterContextRecord(employeeId: string, recordId: string) {
  const redis = getRedis();
  if (!redis) throw new Error("캐릭터 컨텍스트 KV 저장소가 설정되지 않았습니다.");
  const current = await listCharacterContextRecords(employeeId);
  await redis.set(storageKey(employeeId), current.filter((record) => record.id !== recordId));
  return listCharacterContextRecords(employeeId);
}
