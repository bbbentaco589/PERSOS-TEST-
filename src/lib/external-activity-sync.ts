import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { revalidatePath } from "next/cache";

import { listExternalActivityPosts, upsertExternalActivityPosts } from "@/lib/external-activity-store";
import {
  listExternalActivitySources,
  saveExternalActivitySyncRun,
} from "@/lib/automation-control-store";
import type { ExternalActivityPostInput, ExternalActivitySource } from "@/types";

type FeedEntry = { title: string; summary: string; url: string; publishedAt: string };

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");
}

function plainText(value: string, maxLength: number) {
  return decodeXml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function readTag(block: string, names: string[]) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match?.[1]) return match[1];
  }
  return "";
}

function readLink(block: string) {
  const atom = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  return decodeXml(atom || readTag(block, ["link", "guid"])).trim();
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

export function parseSyndicationFeed(xml: string): FeedEntry[] {
  const blocks = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  return blocks.flatMap((block) => {
    const title = plainText(readTag(block, ["title"]), 120);
    const summary = plainText(readTag(block, ["description", "summary", "content", "content:encoded"]), 300) || title;
    const url = readLink(block);
    const publishedAt = parseDate(plainText(readTag(block, ["pubDate", "published", "updated", "dc:date"]), 100));
    try {
      const parsed = new URL(url);
      if (!title || parsed.protocol !== "https:" || !publishedAt) return [];
      return [{ title, summary, url: parsed.toString(), publishedAt }];
    } catch {
      return [];
    }
  }).slice(0, 10);
}

function isPrivateHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".local")) return true;
  if (isIP(normalized)) {
    if (normalized.startsWith("10.") || normalized.startsWith("127.") || normalized.startsWith("169.254.") || normalized.startsWith("192.168.") || normalized === "::1") return true;
    const secondOctet = Number(normalized.split(".")[1]);
    return normalized.startsWith("172.") && secondOctet >= 16 && secondOctet <= 31;
  }
  return false;
}

async function fetchFeed(source: ExternalActivitySource) {
  if (!source.sourceUrl) return [];
  const parsed = new URL(source.sourceUrl);
  if (parsed.protocol !== "https:" || isPrivateHost(parsed.hostname)) throw new Error(`${source.label}: 허용되지 않는 소스 주소입니다.`);
  const response = await fetch(parsed, {
    headers: { Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml" },
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${source.label}: 피드 응답 ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("xml") && !contentType.includes("text")) throw new Error(`${source.label}: RSS/Atom 형식이 아닙니다.`);
  return parseSyndicationFeed((await response.text()).slice(0, 2_000_000));
}

function toPost(source: ExternalActivitySource, entry: FeedEntry): ExternalActivityPostInput {
  const hash = createHash("sha256").update(`${source.id}:${entry.url}`).digest("hex").slice(0, 24);
  return {
    id: `external-sync-${hash}`,
    employeeId: source.employeeId,
    platform: source.platform,
    title: entry.title,
    summary: entry.summary,
    externalUrl: entry.url,
    publishedAt: entry.publishedAt,
    active: true,
  };
}

export async function syncExternalActivitySources() {
  const sources = (await listExternalActivitySources()).filter((source) => source.active && source.mode === "rss");
  const errors: string[] = [];
  const posts: ExternalActivityPostInput[] = [];
  for (const source of sources) {
    try {
      posts.push(...(await fetchFeed(source)).map((entry) => toPost(source, entry)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${source.label}: 수집 실패`);
    }
  }
  const currentIds = new Set((await listExternalActivityPosts({ includeInactive: true })).map((post) => post.id));
  const imported = posts.filter((post) => post.id && !currentIds.has(post.id)).length;
  const skipped = posts.length - imported;
  if (posts.length) {
    await upsertExternalActivityPosts(posts);
    revalidatePath("/external-activities");
  }
  const result = {
    status: errors.length ? (posts.length ? "partial" as const : "failed" as const) : "completed" as const,
    imported,
    skipped,
    errors,
  };
  await saveExternalActivitySyncRun(result);
  return result;
}
