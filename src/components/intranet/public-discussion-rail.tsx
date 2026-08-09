"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Flame,
  Info,
  MessageCircleMore,
  Pin,
  Sparkles,
} from "lucide-react";

import { EmployeeProfileDialog } from "@/components/intranet/employee-profile-dialog";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import type {
  PublicArchiveDebate,
  PublicArchiveTopic,
} from "@/data/public-discussion-demo";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import { cn } from "@/lib/utils";

function formatArchiveDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  })
    .format(new Date(`${value}T00:00:00+09:00`))
    .replaceAll(". ", ".")
    .replace(".", "");
}

export function DiscussionArchivePanel({
  items,
  onSelectItem,
  title,
  variant = "light",
}: {
  items: Array<PublicArchiveDebate | PublicArchiveTopic>;
  onSelectItem?: (itemId: string) => void;
  title: "지난 토론" | "지난 주제";
  variant?: "light" | "anonymous";
}) {
  const headingId =
    title === "지난 주제" ? "anonymous-topic-archive" : "debate-archive";
  const Icon = MessageCircleMore;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden rounded-lg border shadow-sm",
        variant === "anonymous"
          ? "border-yellow-300/15 bg-[#0b121d] text-zinc-100"
          : "border-slate-200 bg-white text-slate-950"
      )}
    >
      <header
        className={cn(
          "flex min-h-14 items-center justify-between gap-3 border-b px-4",
          variant === "anonymous"
            ? "border-yellow-300/12"
            : "border-slate-200"
        )}
      >
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id={headingId}
        >
          <Icon
            className={cn(
              "size-4",
              variant === "anonymous" ? "text-yellow-300" : "text-blue-600"
            )}
          />
          {title}
        </h2>
        <span
          className={cn(
            "text-[10px]",
            variant === "anonymous" ? "text-zinc-600" : "text-slate-500"
          )}
        >
          {variant === "anonymous" ? "최근 5개" : "더 보기"}
        </span>
      </header>

      <ol
        className={cn(
          "divide-y px-4",
          variant === "anonymous"
            ? "divide-yellow-300/10"
            : "divide-slate-200"
        )}
      >
        {items.map((item) => {
          const content = (
            <>
              {variant === "anonymous" ? (
                <Pin
                  aria-hidden="true"
                  className="mt-1 size-3.5 fill-none text-yellow-300/75"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 rounded-full border-2 border-blue-500 bg-white"
                />
              )}
              <span
                className={cn(
                  "min-w-0 text-[11px] font-medium leading-5",
                  variant === "anonymous" ? "text-zinc-300" : "text-slate-700"
                )}
              >
                {item.title}
              </span>
              <span
                className={cn(
                  "pt-0.5 text-right text-[9px]",
                  variant === "anonymous" ? "text-zinc-600" : "text-slate-400"
                )}
              >
                {formatArchiveDate(item.date)}
                {"participantCount" in item ? (
                  <span className="mt-1 block">
                    참여 {item.participantCount.toLocaleString("ko-KR")}명
                  </span>
                ) : null}
              </span>
            </>
          );

          return (
            <li key={item.id}>
              {onSelectItem ? (
                <button
                  className="grid w-full grid-cols-[0.75rem_minmax(0,1fr)_auto] gap-2 py-3.5 text-left transition hover:text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300"
                  onClick={() => onSelectItem(item.id)}
                  type="button"
                >
                  {content}
                </button>
              ) : item.href ? (
                <Link
                  className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto] gap-2 py-3.5 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
                  href={item.href}
                >
                  {content}
                </Link>
              ) : (
                <div className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto] gap-2 py-3.5">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {variant === "anonymous" ? (
        <p className="border-t border-yellow-300/10 px-4 py-3 text-[9px] leading-4 text-zinc-600">
          지난 주제는 최근 5개만 표시되며, 채팅 메시지는 6주 후 자동 삭제됩니다.
        </p>
      ) : null}
    </section>
  );
}

export function DiscussionPopularEmployeePanel({
  profiles,
  onToggleFollow,
}: {
  profiles: PopularEmployeeProfile[];
  onToggleFollow: (employeeId: string) => void;
}) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const selectedProfile =
    profiles.find(
      (profile) => profile.employee.id === selectedProfileId
    ) ?? null;

  return (
    <>
      <section
        aria-labelledby="discussion-popular-employees"
        className="overflow-hidden rounded-lg border border-sky-300/15 bg-[#0b121d] text-zinc-100"
      >
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-sky-300/12 px-4">
          <h2
            className="flex items-center gap-2 text-sm font-semibold"
            id="discussion-popular-employees"
          >
            <Sparkles className="size-4 text-sky-300" />
            인기 AI 페르소나
            <Info className="size-3 text-zinc-600" />
          </h2>
          <div className="flex items-center gap-2">
            <Badge
              className="border-white/10 bg-white/[0.035] text-[8px] text-zinc-500"
              variant="outline"
            >
              DEMO
            </Badge>
            <Link
              className="flex items-center gap-1 text-[10px] text-zinc-500 transition hover:text-sky-300"
              href="/characters"
            >
              더 보기
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </header>

        <ol className="divide-y divide-sky-300/10 px-4">
          {profiles.slice(0, 5).map((profile, index) => (
            <li key={profile.employee.id}>
              <button
                className="grid min-h-16 w-full grid-cols-[1rem_2rem_minmax(0,1fr)_auto] items-center gap-2 py-3 text-left transition hover:bg-sky-300/[0.045] focus-visible:outline-2 focus-visible:outline-sky-300"
                onClick={() => setSelectedProfileId(profile.employee.id)}
                type="button"
              >
                <span className="font-mono text-[10px] text-sky-300/80">
                  {index + 1}
                </span>
                <EmployeeAvatar
                  alt={`${profile.employee.nameKo} 프로필`}
                  className="size-8 rounded-full object-center"
                  size={32}
                  src={profile.employee.profileImage}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-zinc-200">
                    {formatPersonaDisplayName(profile.employee)}
                  </span>
                  <span className="mt-1 block truncate text-[9px] text-zinc-600">
                    {profile.teamName}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[9px] text-orange-500">
                  <Flame className="size-3 fill-current" />
                  {profile.followerCount}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="border-t border-sky-300/10 px-4 py-3 text-[9px] leading-4 text-zinc-600">
          인기 지표는 현재 고정된 Demo Metric입니다.
        </p>
      </section>

      {selectedProfile ? (
        <EmployeeProfileDialog
          onClose={() => setSelectedProfileId(null)}
          onToggleFollow={() => onToggleFollow(selectedProfile.employee.id)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
