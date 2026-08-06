"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ListFilter,
  MessageSquareText,
} from "lucide-react";
import { useMemo, useState } from "react";

export type DebateListItem = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  status: "Open" | "Closed";
  statementCount: number;
  proposedAt: string;
};

const statusLabels = {
  Open: "진행 중",
  Closed: "종료",
} as const;
const DEBATE_PAGE_SIZE = 5;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

export function DebateList({ items }: { items: DebateListItem[] }) {
  const [status, setStatus] = useState<"all" | "Open" | "Closed">("all");
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(DEBATE_PAGE_SIZE);
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items]
  );
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (status === "all" || item.status === status) &&
          (category === "all" || item.category === category)
      ),
    [category, items, status]
  );
  const displayedItems = visibleItems.slice(0, visibleCount);
  const remainingItemCount = Math.max(0, visibleItems.length - visibleCount);

  return (
    <section aria-label="찬반 토론 목록" className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-[#0c0f1c]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div aria-label="진행 상태" className="flex items-center gap-1" role="group">
          {[
            { label: "전체", value: "all" },
            { label: "진행 중", value: "Open" },
            { label: "종료", value: "Closed" },
          ].map((item) => (
            <button
              className={`min-h-9 border-b px-3 text-[11px] transition ${
                status === item.value
                  ? "border-cyan-200 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-200"
              }`}
              key={item.value}
              onClick={() => {
                setStatus(item.value as typeof status);
                setVisibleCount(DEBATE_PAGE_SIZE);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="debate-category-filter">주제 분류</label>
          <select
            className="h-9 rounded-md border border-white/10 bg-[#0a0d18] px-3 text-[10px] text-zinc-300 outline-none focus:border-cyan-300/50"
            id="debate-category-filter"
            onChange={(event) => {
              setCategory(event.target.value);
              setVisibleCount(DEBATE_PAGE_SIZE);
            }}
            value={category}
          >
            <option value="all">전체 주제</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="sr-only" htmlFor="debate-status-filter">진행 상태</label>
          <select
            className="h-9 rounded-md border border-white/10 bg-[#0a0d18] px-3 text-[10px] text-zinc-300 outline-none focus:border-cyan-300/50"
            id="debate-status-filter"
            onChange={(event) => {
              setStatus(event.target.value as typeof status);
              setVisibleCount(DEBATE_PAGE_SIZE);
            }}
            value={status}
          >
            <option value="all">전체 상태</option>
            <option value="Open">진행 중</option>
            <option value="Closed">종료</option>
          </select>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-500">
            최신순
            <ListFilter className="size-3" />
          </span>
        </div>
      </div>

      <div className="space-y-2 p-2 sm:p-3">
        {displayedItems.map((item) => (
          <Link
            className="group grid gap-3 rounded-md border border-white/8 bg-white/[0.025] px-4 py-4 transition hover:border-cyan-300/20 hover:bg-white/[0.045] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            href={`/discussion/${item.slug}`}
            key={item.id}
          >
            <div className="min-w-0">
              <p className="text-[9px] font-semibold text-cyan-200/70">{item.category}</p>
              <h2 className="mt-1.5 text-sm font-semibold text-zinc-100 transition group-hover:text-cyan-100 sm:text-base">
                {item.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-zinc-500 sm:line-clamp-1">
                {item.summary}
              </p>
            </div>
            <div className="flex items-center gap-4 text-[9px] text-zinc-500 sm:pl-5">
              <span className={`rounded border px-2 py-1 ${item.status === "Open" ? "border-blue-400/20 bg-blue-400/10 text-blue-200" : "border-white/10 bg-white/5 text-zinc-400"}`}>
                {statusLabels[item.status]}
              </span>
              <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <MessageSquareText className="size-3.5" />
                {item.statementCount}
              </span>
              <time className="hidden border-l border-white/10 pl-4 sm:block" dateTime={item.proposedAt}>
                {formatDate(item.proposedAt)}
              </time>
              <ChevronRight className="size-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" />
            </div>
          </Link>
        ))}
        {remainingItemCount > 0 ? (
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.07] focus-visible:outline-2 focus-visible:outline-cyan-300"
            onClick={() =>
              setVisibleCount((current) => current + DEBATE_PAGE_SIZE)
            }
            type="button"
          >
            <ChevronDown className="size-4" />
            더 보기
            <span className="font-mono text-[9px] text-cyan-200/60">
              {Math.min(DEBATE_PAGE_SIZE, remainingItemCount)}개
            </span>
          </button>
        ) : null}
        {visibleItems.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-zinc-500">조건에 맞는 토론이 없습니다.</p>
        ) : null}
      </div>
    </section>
  );
}
