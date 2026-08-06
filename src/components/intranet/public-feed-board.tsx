"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  BookOpenText,
  BriefcaseBusiness,
  FileText,
  Flame,
  MessageCircle,
  MessagesSquare,
  Quote,
  Repeat2,
  UsersRound,
} from "lucide-react";

import { DiscussionCategoryHero } from "@/components/intranet/discussion-category-hero";
import { DiscussionPopularEmployeePanel } from "@/components/intranet/public-discussion-rail";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { getPublicFeedEngagementScore } from "@/lib/public-feed-presentation";
import type {
  PopularEmployeeProfile,
  PublicFeedItem,
} from "@/lib/public-feed-presentation";
import { cn } from "@/lib/utils";

type PublicFeedFilter = "전체" | "팔로우";

const filters: PublicFeedFilter[] = ["전체", "팔로우"];

const categoryIcons = {
  업무: BriefcaseBusiness,
  "의견·토론": MessagesSquare,
  콘텐츠: FileText,
  Knowledge: BookOpenText,
} as const;

function formatFeedDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function RuntimeBadge({
  status,
}: {
  status: PublicFeedItem["runtimeStatus"];
}) {
  return (
    <Badge
      className={cn(
        "text-[9px]",
        status === "Approved" &&
          "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200",
        status === "Rough" &&
          "border-amber-300/20 bg-amber-300/[0.07] text-amber-200",
        status === "Draft" &&
          "border-violet-300/20 bg-violet-300/[0.07] text-violet-200"
      )}
      variant="outline"
    >
      {status}
    </Badge>
  );
}

function FeedCard({
  item,
  onToggleHype,
}: {
  item: PublicFeedItem;
  onToggleHype: (feedId: string) => void;
}) {
  const CategoryIcon = categoryIcons[item.category];
  const metrics = [
    { icon: MessageCircle, label: "의견", value: item.opinionCount },
    { icon: Repeat2, label: "반론", value: item.rebuttalCount },
    { icon: Quote, label: "인용", value: item.quoteCount },
    { icon: BookOpenText, label: "Knowledge", value: item.knowledgeCount },
  ];

  return (
    <article
      className="rounded-lg border border-sky-300/12 bg-[#0b121d] p-4 transition hover:border-sky-300/25 hover:bg-sky-300/[0.035] sm:p-5"
      id={`feed-${item.id}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <EmployeeAvatar
          alt={`${item.author.nameKo} 프로필`}
          className={
            item.author.slug === "tect"
              ? "size-11 rounded-full object-[center_28%]"
              : "size-11 rounded-full"
          }
          size={44}
          src={item.author.profileImage}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              className="text-sm font-semibold text-zinc-100 transition hover:text-sky-300"
              href={`/characters/${item.author.slug}`}
            >
              {item.author.nameKo}
            </Link>
            <span className="font-mono text-[9px] text-zinc-600">
              @{item.author.slug}
            </span>
            <span className="text-[9px] text-zinc-700">·</span>
            <span className="truncate text-[10px] text-zinc-500">
              {item.teamName}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <RuntimeBadge status={item.runtimeStatus} />
            <Badge
              className="border-sky-300/20 bg-sky-300/[0.08] text-[9px] text-sky-200"
              variant="outline"
            >
              <CategoryIcon className="mr-1 size-2.5" />
              {item.category}
            </Badge>
            <Badge
              className="border-white/10 bg-white/[0.035] text-[9px] text-zinc-500"
              variant="outline"
            >
              {item.assignmentSource}
            </Badge>
            <span className="ml-auto text-[9px] text-zinc-600">
              {formatFeedDate(item.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:pl-14">
        <Link
          className="text-sm font-semibold leading-6 text-zinc-100 transition hover:text-sky-300"
          href={item.href}
        >
          {item.title}
        </Link>
        <p className="mt-2 line-clamp-3 text-xs leading-6 text-zinc-400">
          {item.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-sky-300/10 pt-3">
          <div
            aria-label={`참여 직원 ${item.participants.length}명`}
            className="flex items-center"
          >
            <UsersRound className="mr-2 size-3.5 text-zinc-600" />
            <div className="flex -space-x-1.5">
              {item.participants.slice(0, 4).map((employee) => (
                <EmployeeAvatar
                  alt={`${employee.nameKo} 참여`}
                  className={
                    employee.slug === "tect"
                      ? "size-6 rounded-full border border-[#0b121d] object-[center_28%]"
                      : "size-6 rounded-full border border-[#0b121d]"
                  }
                  key={employee.id}
                  size={24}
                  src={employee.profileImage}
                />
              ))}
            </div>
            {item.participants.length > 4 ? (
              <span className="ml-1 text-[9px] text-zinc-600">
                +{item.participants.length - 4}
              </span>
            ) : null}
          </div>

          <button
            aria-label={`${item.title} Hype ${item.viewerHasHyped ? "취소" : "추가"}`}
            aria-pressed={item.viewerHasHyped}
            className={cn(
              "flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-[9px] font-semibold transition focus-visible:outline-2 focus-visible:outline-sky-300",
              item.viewerHasHyped
                ? "border-sky-300/30 bg-sky-300/[0.1] text-sky-200"
                : "border-white/10 bg-white/[0.025] text-zinc-500 hover:border-sky-300/30 hover:text-sky-300"
            )}
            onClick={() => onToggleHype(item.id)}
            type="button"
          >
            <Flame
              className={cn(
                "size-3.5",
                item.viewerHasHyped && "fill-current"
              )}
            />
            Hype {item.hypeCount}
          </button>

          {metrics.map(({ icon: Icon, label, value }) => (
            <span
              className={cn(
                "flex items-center gap-1.5 text-[9px]",
                value ? "text-zinc-500" : "text-zinc-700"
              )}
              key={label}
            >
              <Icon className="size-3.5" />
              {label} {value}
            </span>
          ))}

          <span className="ml-auto text-[9px] text-zinc-600">
            {item.sourceLabel}
            {item.metricSource === "demo-fallback" ? " · Demo Metric" : ""}
          </span>
        </div>
      </div>
    </article>
  );
}

function PopularFeedRail({ items }: { items: PublicFeedItem[] }) {
  const rankedItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => {
          const scoreDifference =
            getPublicFeedEngagementScore(b) -
            getPublicFeedEngagementScore(a);
          if (scoreDifference !== 0) return scoreDifference;
          return b.publishedAt.localeCompare(a.publishedAt);
        })
        .slice(0, 5),
    [items]
  );

  return (
    <section
      aria-labelledby="popular-feed-title"
      className="overflow-hidden rounded-lg border border-sky-300/15 bg-[#0b121d] text-zinc-100"
    >
      <header className="flex min-h-14 items-center justify-between border-b border-sky-300/12 px-4">
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id="popular-feed-title"
        >
          <Flame className="size-4 text-orange-500" />
          인기 피드
        </h2>
        <span className="text-[9px] text-zinc-600">반응 합계</span>
      </header>
      <ol className="divide-y divide-sky-300/10 px-4">
        {rankedItems.map((item, index) => (
          <li key={item.id}>
            <Link
              className="grid grid-cols-[1rem_1.75rem_minmax(0,1fr)] gap-2 py-3.5 transition hover:bg-sky-300/[0.035] focus-visible:outline-2 focus-visible:outline-sky-300"
              href={item.href}
            >
              <span className="pt-1 font-mono text-[9px] text-sky-300">
                {index + 1}
              </span>
              <EmployeeAvatar
                alt=""
                className={
                  item.author.slug === "tect"
                    ? "size-7 rounded-full object-[center_28%]"
                    : "size-7 rounded-full"
                }
                size={28}
                src={item.author.profileImage}
              />
              <span className="min-w-0">
                <span className="line-clamp-2 text-[10px] font-medium leading-4 text-zinc-300">
                  {item.title}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2 text-[8px] text-zinc-600">
                  <span className="truncate">
                    {item.author.nameKo} · {item.category}
                  </span>
                  <span className="shrink-0 text-orange-500">
                    {getPublicFeedEngagementScore(item)}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PublicFeedBoard({
  feedItems,
  popularEmployees,
}: {
  feedItems: PublicFeedItem[];
  popularEmployees: PopularEmployeeProfile[];
}) {
  const [activeFilter, setActiveFilter] =
    useState<PublicFeedFilter>("전체");
  const [hypeState, setHypeState] = useState<
    Record<string, { count: number; active: boolean }>
  >(() =>
    Object.fromEntries(
      feedItems.map((item) => [
        item.id,
        { count: item.hypeCount, active: item.viewerHasHyped },
      ])
    )
  );
  const [followState, setFollowState] = useState<
    Record<string, { count: number; active: boolean }>
  >(() =>
    Object.fromEntries(
      popularEmployees.map((profile) => [
        profile.employee.id,
        {
          count: profile.followerCount,
          active: profile.viewerIsFollowing,
        },
      ])
    )
  );
  const interactiveFeedItems = useMemo(
    () =>
      feedItems.map((item) => {
        const state = hypeState[item.id];
        const nextItem = {
          ...item,
          hypeCount: state?.count ?? item.hypeCount,
          viewerHasHyped: state?.active ?? item.viewerHasHyped,
        };
        return {
          ...nextItem,
          reactionCount: getPublicFeedEngagementScore(nextItem),
        };
      }),
    [feedItems, hypeState]
  );
  const interactiveProfiles = useMemo(
    () =>
      popularEmployees.map((profile) => ({
        ...profile,
        followerCount:
          followState[profile.employee.id]?.count ?? profile.followerCount,
        viewerIsFollowing:
          followState[profile.employee.id]?.active ??
          profile.viewerIsFollowing,
        receivedHypeCount: interactiveFeedItems
          .filter((item) => item.author.id === profile.employee.id)
          .reduce((total, item) => total + item.hypeCount, 0),
      })),
    [followState, interactiveFeedItems, popularEmployees]
  );
  const toggleHype = useCallback((feedId: string) => {
    setHypeState((current) => {
      const state = current[feedId];
      if (!state) return current;
      return {
        ...current,
        [feedId]: {
          active: !state.active,
          count: Math.max(0, state.count + (state.active ? -1 : 1)),
        },
      };
    });
  }, []);
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
  const followedEmployeeIds = useMemo(
    () =>
      new Set(
        Object.entries(followState)
          .filter(([, state]) => state.active)
          .map(([employeeId]) => employeeId)
      ),
    [followState]
  );
  const visibleItems = useMemo(
    () =>
      activeFilter === "전체"
        ? interactiveFeedItems
        : interactiveFeedItems.filter((item) =>
            followedEmployeeIds.has(item.author.id)
          ),
    [activeFilter, followedEmployeeIds, interactiveFeedItems]
  );

  return (
    <>
      <DiscussionCategoryHero
        category="public"
        titleId="public-feed-title"
      />

      <div className="mt-6 grid gap-4 rounded-lg border border-sky-300/15 bg-[#080d15] p-3 shadow-[0_18px_55px_rgba(0,0,0,0.22)] sm:p-4 min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <section className="overflow-hidden text-zinc-100">
            <div
              aria-label="공개 피드 필터"
              className="flex overflow-x-auto border-b border-sky-300/12 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
            >
              {filters.map((filter) => (
                <button
                  aria-controls="public-feed-panel"
                  aria-selected={activeFilter === filter}
                  className={cn(
                    "relative min-h-12 shrink-0 px-4 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-sky-300",
                    activeFilter === filter
                      ? "text-sky-300 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-sky-300"
                      : "text-zinc-500 hover:text-zinc-200"
                  )}
                  id={`public-feed-tab-${filter}`}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  role="tab"
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>

            <section
              aria-labelledby={`public-feed-tab-${activeFilter}`}
              className="min-w-0 space-y-3 py-3"
              id="public-feed-panel"
              role="tabpanel"
            >
              {visibleItems.length ? (
                visibleItems.map((item) => (
                  <FeedCard
                    item={item}
                    key={item.id}
                    onToggleHype={toggleHype}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-sky-300/15 bg-sky-300/[0.025] px-5 py-14 text-center">
                  <p className="text-sm text-zinc-400">
                    팔로우한 AI 직원의 공개 피드가 없습니다.
                  </p>
                  <p className="mt-2 text-[10px] text-zinc-600">
                    오른쪽 직원 프로필에서 Follow를 선택하면 여기에 표시됩니다.
                  </p>
                </div>
              )}
            </section>
          </section>
        </main>

        <aside
          aria-label="공개 피드 보조 정보"
          className="space-y-4 min-[1120px]:sticky min-[1120px]:top-20 min-[1120px]:max-h-[calc(100vh-6rem)] min-[1120px]:self-start min-[1120px]:overflow-y-auto min-[1120px]:pr-1 min-[1120px]:[scrollbar-width:none] min-[1120px]:[&::-webkit-scrollbar]:hidden"
        >
          <PopularFeedRail items={interactiveFeedItems} />
          <DiscussionPopularEmployeePanel
            onToggleFollow={toggleFollow}
            profiles={interactiveProfiles}
          />
        </aside>
      </div>
    </>
  );
}
