"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
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
  title,
}: {
  items: Array<PublicArchiveDebate | PublicArchiveTopic>;
  title: "지난 토론" | "지난 주제";
}) {
  const headingId =
    title === "지난 주제" ? "anonymous-topic-archive" : "debate-archive";
  const Icon = title === "지난 주제" ? Pin : MessageCircleMore;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm"
    >
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 px-4">
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id={headingId}
        >
          <Icon className="size-4 text-blue-600" />
          {title}
        </h2>
        <span className="text-[10px] text-slate-500">더 보기</span>
      </header>

      <ol className="divide-y divide-slate-200 px-4">
        {items.map((item) => {
          const content = (
            <>
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 rounded-full border-2 border-blue-500 bg-white"
              />
              <span className="min-w-0 text-[11px] font-medium leading-5 text-slate-700">
                {item.title}
              </span>
              <span className="pt-0.5 text-right text-[9px] text-slate-400">
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
              {item.href ? (
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
    </section>
  );
}

export function DiscussionPopularEmployeePanel({
  profiles,
}: {
  profiles: PopularEmployeeProfile[];
}) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [followState, setFollowState] = useState<
    Record<string, { count: number; active: boolean }>
  >(() =>
    Object.fromEntries(
      profiles.map((profile) => [
        profile.employee.id,
        {
          count: profile.followerCount,
          active: profile.viewerIsFollowing,
        },
      ])
    )
  );
  const interactiveProfiles = useMemo(
    () =>
      profiles.map((profile) => {
        const state = followState[profile.employee.id];
        return {
          ...profile,
          followerCount: state?.count ?? profile.followerCount,
          viewerIsFollowing: state?.active ?? profile.viewerIsFollowing,
        };
      }),
    [followState, profiles]
  );
  const selectedProfile =
    interactiveProfiles.find(
      (profile) => profile.employee.id === selectedProfileId
    ) ?? null;
  const closeProfile = useCallback(() => setSelectedProfileId(null), []);
  const toggleFollow = useCallback((employeeId: string) => {
    setFollowState((current) => {
      const state = current[employeeId];
      if (!state) return current;
      return {
        ...current,
        [employeeId]: {
          active: !state.active,
          count: Math.max(0, state.count + (state.active ? -1 : 1)),
        },
      };
    });
  }, []);

  return (
    <>
      <section
        aria-labelledby="discussion-popular-employees"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm"
      >
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 px-4">
          <h2
            className="flex items-center gap-2 text-sm font-semibold"
            id="discussion-popular-employees"
          >
            <Sparkles className="size-4 text-blue-600" />
            실시간 인기 사원
            <Info className="size-3 text-slate-400" />
          </h2>
          <div className="flex items-center gap-2">
            <Badge
              className="border-slate-200 bg-slate-50 text-[8px] text-slate-500"
              variant="outline"
            >
              DEMO
            </Badge>
            <Link
              className="flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-blue-600"
              href="/characters"
            >
              더 보기
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </header>

        <ol className="divide-y divide-slate-200 px-4">
          {interactiveProfiles.slice(0, 5).map((profile, index) => (
            <li key={profile.employee.id}>
              <button
                className="grid min-h-16 w-full grid-cols-[1rem_2rem_minmax(0,1fr)_auto] items-center gap-2 py-3 text-left transition hover:bg-blue-50/70 focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => setSelectedProfileId(profile.employee.id)}
                type="button"
              >
                <span className="font-mono text-[10px] text-slate-400">
                  {index + 1}
                </span>
                <EmployeeAvatar
                  alt={`${profile.employee.nameKo} 프로필`}
                  className={
                    profile.employee.slug === "tect"
                      ? "size-8 rounded-full object-[center_28%]"
                      : "size-8 rounded-full"
                  }
                  size={32}
                  src={profile.employee.profileImage}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-slate-800">
                    {profile.employee.nameKo}
                  </span>
                  <span className="mt-1 block truncate text-[9px] text-slate-500">
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
        <p className="border-t border-slate-200 px-4 py-3 text-[9px] leading-4 text-slate-400">
          인기 지표는 현재 고정된 Demo Metric입니다.
        </p>
      </section>

      {selectedProfile ? (
        <EmployeeProfileDialog
          onClose={closeProfile}
          onToggleFollow={() => toggleFollow(selectedProfile.employee.id)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
