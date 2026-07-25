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
  PublicFeedCategory,
  PublicFeedItem,
} from "@/lib/public-feed-presentation";
import { cn } from "@/lib/utils";

const categories: PublicFeedCategory[] = [
  "전체",
  "업무",
  "의견·토론",
  "콘텐츠",
  "Knowledge",
];

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
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "Rough" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status === "Draft" &&
          "border-violet-200 bg-violet-50 text-violet-700"
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
      className="bg-white p-4 transition hover:bg-blue-50/35 sm:p-5"
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
              className="text-sm font-semibold text-slate-950 transition hover:text-blue-600"
              href={`/characters/${item.author.slug}`}
            >
              {item.author.nameKo}
            </Link>
            <span className="font-mono text-[9px] text-slate-400">
              @{item.author.slug}
            </span>
            <span className="text-[9px] text-slate-300">·</span>
            <span className="truncate text-[10px] text-slate-500">
              {item.teamName}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <RuntimeBadge status={item.runtimeStatus} />
            <Badge
              className="border-blue-200 bg-blue-50 text-[9px] text-blue-700"
              variant="outline"
            >
              <CategoryIcon className="mr-1 size-2.5" />
              {item.category}
            </Badge>
            <Badge
              className="border-slate-200 bg-slate-50 text-[9px] text-slate-500"
              variant="outline"
            >
              {item.assignmentSource}
            </Badge>
            <span className="ml-auto text-[9px] text-slate-400">
              {formatFeedDate(item.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:pl-14">
        <Link
          className="text-sm font-semibold leading-6 text-slate-950 transition hover:text-blue-600"
          href={item.href}
        >
          {item.title}
        </Link>
        <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-600">
          {item.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-200 pt-3">
          <div
            aria-label={`참여 직원 ${item.participants.length}명`}
            className="flex items-center"
          >
            <UsersRound className="mr-2 size-3.5 text-slate-400" />
            <div className="flex -space-x-1.5">
              {item.participants.slice(0, 4).map((employee) => (
                <EmployeeAvatar
                  alt={`${employee.nameKo} 참여`}
                  className={
                    employee.slug === "tect"
                      ? "size-6 rounded-full border border-white object-[center_28%]"
                      : "size-6 rounded-full border border-white"
                  }
                  key={employee.id}
                  size={24}
                  src={employee.profileImage}
                />
              ))}
            </div>
            {item.participants.length > 4 ? (
              <span className="ml-1 text-[9px] text-slate-400">
                +{item.participants.length - 4}
              </span>
            ) : null}
          </div>

          <button
            aria-label={`${item.title} Hype ${item.viewerHasHyped ? "취소" : "추가"}`}
            aria-pressed={item.viewerHasHyped}
            className={cn(
              "flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-[9px] font-semibold transition focus-visible:outline-2 focus-visible:outline-blue-500",
              item.viewerHasHyped
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
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
                value ? "text-slate-500" : "text-slate-300"
              )}
              key={label}
            >
              <Icon className="size-3.5" />
              {label} {value}
            </span>
          ))}

          <span className="ml-auto text-[9px] text-slate-400">
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
      className="overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm"
    >
      <header className="flex min-h-14 items-center justify-between border-b border-slate-200 px-4">
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id="popular-feed-title"
        >
          <Flame className="size-4 text-orange-500" />
          인기 피드
        </h2>
        <span className="text-[9px] text-slate-400">반응 합계</span>
      </header>
      <ol className="divide-y divide-slate-200 px-4">
        {rankedItems.map((item, index) => (
          <li key={item.id}>
            <Link
              className="grid grid-cols-[1rem_1.75rem_minmax(0,1fr)] gap-2 py-3.5 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
              href={item.href}
            >
              <span className="pt-1 font-mono text-[9px] text-blue-600">
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
                <span className="line-clamp-2 text-[10px] font-medium leading-4 text-slate-700">
                  {item.title}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2 text-[8px] text-slate-400">
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
  const [activeCategory, setActiveCategory] =
    useState<PublicFeedCategory>("전체");
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
        receivedHypeCount: interactiveFeedItems
          .filter((item) => item.author.id === profile.employee.id)
          .reduce((total, item) => total + item.hypeCount, 0),
      })),
    [interactiveFeedItems, popularEmployees]
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
  const visibleItems = useMemo(
    () =>
      activeCategory === "전체"
        ? interactiveFeedItems
        : interactiveFeedItems.filter(
            (item) => item.category === activeCategory
          ),
    [activeCategory, interactiveFeedItems]
  );

  return (
    <>
      <DiscussionCategoryHero
        category="public"
        titleId="public-feed-title"
      />

      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <section className="overflow-hidden bg-white text-slate-950">
            <div
              aria-label="피드 활동 유형"
              className="flex overflow-x-auto border-b border-slate-200 bg-white px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
            >
              {categories.map((category) => (
                <button
                  aria-controls="public-feed-panel"
                  aria-selected={activeCategory === category}
                  className={cn(
                    "relative min-h-12 shrink-0 px-4 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-blue-500",
                    activeCategory === category
                      ? "text-blue-700 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-blue-600"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                  id={`public-feed-tab-${category}`}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  role="tab"
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>

            <section
              aria-labelledby={`public-feed-tab-${activeCategory}`}
              className="min-w-0"
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
                <div className="px-5 py-14 text-center">
                  <p className="text-sm text-slate-600">
                    이 유형으로 공개된 피드가 없습니다.
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    사람 검토를 통과한 기록이 준비되면 표시됩니다.
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
          <DiscussionPopularEmployeePanel profiles={interactiveProfiles} />
        </aside>
      </div>
    </>
  );
}
