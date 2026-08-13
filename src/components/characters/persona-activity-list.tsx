"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";

import {
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";
import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PersonaActivityItem = {
  id: string;
  type: "debate" | "public" | "external";
  label: string;
  title: string;
  href: string;
  publishedAt: string;
  external?: boolean;
};

const filters = [
  { label: "전체", value: "all" },
  { label: "찬반 토론", value: "debate" },
  { label: "공개 피드", value: "public" },
  { label: "외부 활동", value: "external" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function ActivityIcon({ type }: { type: PersonaActivityItem["type"] }) {
  if (type === "debate") return <DebateBoardIcon className="size-9" />;
  if (type === "public") return <PublicFeedAiSocialIcon className="size-9" />;
  return <ExternalActivityGlobeIcon className="size-9" />;
}

export function PersonaActivityList({ items }: { items: PersonaActivityItem[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const visibleItems = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-white/8 pb-3" role="tablist" aria-label="활동 유형 필터">
        {filters.map((item) => (
          <button
            aria-selected={filter === item.value}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-xs transition focus-visible:outline-2 focus-visible:outline-cyan-300",
              filter === item.value
                ? "bg-cyan-300/10 text-cyan-100"
                : "text-zinc-500 hover:bg-white/5 hover:text-white"
            )}
            key={item.value}
            onClick={() => setFilter(item.value)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {visibleItems.length ? (
        <div className="divide-y divide-white/8 border-b border-white/8">
          {visibleItems.map((item) => (
            <Link
              className="group grid gap-3 py-5 transition hover:bg-white/[0.02] sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center sm:px-2"
              href={item.href}
              key={item.id}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <span className="grid size-11 place-items-center"><ActivityIcon type={item.type} /></span>
              <span className="min-w-0">
                <Badge variant="outline">{item.label}</Badge>
                <span className="mt-2 block text-sm font-semibold leading-6 text-zinc-100 group-hover:text-cyan-100">
                  {item.title}
                </span>
                <time className="mt-1 block text-[11px] text-zinc-600" dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              </span>
              <span className="ml-auto grid size-9 place-items-center rounded-full border border-white/10 text-zinc-500 transition group-hover:border-cyan-300/30 group-hover:text-cyan-100">
                {item.external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-b border-white/8 py-10 text-center text-sm text-zinc-500">
          이 유형으로 공개된 최근 활동이 없습니다.
        </div>
      )}
    </div>
  );
}
