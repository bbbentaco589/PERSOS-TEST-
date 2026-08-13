"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Building2, ChevronRight, Eye, MessageSquareText, Radio, TrendingUp, UserRoundPlus } from "lucide-react";

import { DivisionIcon } from "@/components/brand/division-icon";
import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";
import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import {
  publicDiscussionNav,
  publicDivisionOrder,
} from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import { isPublicActiveCharacter } from "@/lib/character-runtime-policy";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import {
  getPopularContents,
  type PopularContentCategory,
} from "@/lib/public-discovery";
import { cn } from "@/lib/utils";

const treeChildClass = "relative before:absolute before:-left-[13px] before:top-0 before:h-full before:border-l before:border-white/10 after:absolute after:-left-[13px] after:top-1/2 after:w-3 after:border-t after:border-white/10 last:before:h-1/2";
const treeGroupClass = "relative before:absolute before:-left-[13px] before:bottom-0 before:top-0 before:border-l before:border-white/10 after:absolute after:-left-[13px] after:top-5 after:w-3 after:border-t after:border-white/10 last:before:bottom-auto last:before:h-5";
const popularContentIcons: Record<
  PopularContentCategory,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  debate: DebateBoardIcon,
  "public-feed": PublicFeedAiSocialIcon,
  anonymous: AnonymousChatMaskIcon,
};

export function PublicSidebarContent({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const popularContents = getPopularContents();
  const [expandedDivisionIds, setExpandedDivisionIds] = useState<Set<string>>(
    () => new Set()
  );

  function toggleDivision(divisionId: string) {
    setExpandedDivisionIds((current) => {
      const next = current.has(divisionId)
        ? new Set<string>()
        : new Set([divisionId]);
      return next;
    });
  }

  return (
    <div className={cn("px-4 py-5", className)}>
      <section aria-labelledby="discussion-directory-title" className="mb-6">
        <h2 className="mb-2" id="discussion-directory-title">
          <div
            className={cn(
              "flex w-fit items-center gap-2 text-[11px] font-semibold",
              pathname.startsWith("/discussion") || pathname.startsWith("/external-activities")
                ? "text-white"
                : "text-muted-foreground"
            )}
          >
            <span className="grid size-4 place-items-center bg-[#07080a]"><MessageSquareText className="size-3.5" /></span>
            사업부 통합 인트라넷
          </div>
        </h2>
        <nav aria-label="토론 유형" className="space-y-1 pl-5">
          {[...publicDiscussionNav, { href: "/external-activities", icon: ExternalActivityGlobeIcon, label: "전사원 외부 활동" }].map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  treeChildClass,
                  "flex min-h-10 items-center gap-2 rounded-md px-2 text-xs transition",
                  active
                    ? "bg-white/8 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                href={href}
                key={href}
                onClick={onNavigate}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </section>

      <section aria-labelledby="organization-directory-title">
        <h2 className="mb-3" id="organization-directory-title">
          <div className={cn("flex w-fit items-center gap-2 text-[11px] font-semibold", pathname.startsWith("/departments/") || pathname === "/division-feed" ? "text-white" : "text-muted-foreground")}>
            <span className="grid size-4 place-items-center bg-[#07080a]"><Building2 className="size-3.5" /></span>
            사업부별 페르소나
          </div>
        </h2>
        <nav aria-label="사업부별 페르소나" className="space-y-1 pl-5">
          {publicDivisionOrder
            .map((divisionId) => divisions.find((item) => item.id === divisionId))
            .filter((division) => Boolean(division))
            .map((division) => {
              if (!division) return null;
              const divisionTeams = teams.filter((team) => team.divisionId === division.id);
              const teamOrder = new Map(divisionTeams.map((team) => [team.id, team.displayOrder]));
              const members = employees
                .filter((employee) => employee.divisionId === division.id && isPublicActiveCharacter(employee))
                .sort((a, b) => (teamOrder.get(a.teamId) ?? 999) - (teamOrder.get(b.teamId) ?? 999));
              const expanded = expandedDivisionIds.has(division.id);
              const panelId = `directory-${division.slug}`;

              return (
                <div className={treeGroupClass} key={division.id}>
                  <button
                    aria-controls={panelId}
                    aria-expanded={expanded}
                    className={cn(
                      "flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-normal text-zinc-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300",
                      expanded && "bg-white/8 text-white"
                    )}
                    onClick={() => toggleDivision(division.id)}
                    type="button"
                  >
                    <DivisionIcon compact divisionId={division.id} />
                    <span className="min-w-0 flex-1 truncate">{division.nameKo}</span>
                    <ChevronRight className={`size-3.5 shrink-0 text-zinc-500 transition ${expanded ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`ml-3 space-y-1 py-1 pl-5 ${expanded ? "block" : "hidden"}`} id={panelId}>
                    {members.map((employee) => {
                      const team = teams.find((item) => item.id === employee.teamId);
                      const profileHref = `/characters/${employee.slug}`;
                      const active = pathname === profileHref;

                      return (
                        <Link
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            treeChildClass,
                            "flex min-h-12 items-center gap-2 rounded-md px-2 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white",
                            active && "bg-white/8 text-white"
                          )}
                          href={profileHref}
                          key={employee.id}
                          onClick={onNavigate}
                        >
                          <EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-8 rounded-full object-center" size={32} src={employee.profileImage} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium text-zinc-200">{formatPersonaDisplayName(employee)}</span>
                            <span className="mt-1 flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-[9px] text-zinc-600">{team?.nameKo ?? "소속 팀 준비 중"}</span>
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                    {members.length === 0 ? (
                      <div className={cn(treeChildClass, "flex items-center gap-2 rounded-md px-3 py-1.5 text-zinc-500")}>
                        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-dashed border-cyan-300/25 bg-cyan-300/[0.05] text-cyan-200/70">
                          <UserRoundPlus className="size-3.5" strokeWidth={1.7} />
                        </span>
                        <span className="text-[11px] font-medium">채용 중</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
        </nav>
      </section>

      <section aria-labelledby="popular-contents-title" className="mt-6 border-t border-white/8 pt-5">
        <div className="mb-3 flex items-center justify-between px-2">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400" id="popular-contents-title">
            <TrendingUp className="size-3.5 text-cyan-200" />실시간 인기 콘텐츠
          </h2>
          <span className="text-[9px] text-zinc-700">DEMO</span>
        </div>
        <div className="space-y-1">
          {popularContents.map((content, index) => {
            const CategoryIcon = popularContentIcons[content.category];

            return (
            <Link
              className="grid min-h-14 grid-cols-[1rem_1.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 transition hover:bg-white/5"
              href={content.href}
              key={content.id}
              onClick={onNavigate}
            >
              <span className="w-4 text-center font-mono text-[10px] text-zinc-600">{index + 1}</span>
              <span className="grid size-7 place-items-center rounded-md border border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200">
                <CategoryIcon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[10px] font-medium leading-4 text-zinc-300">{content.title}</span>
                <span className="mt-0.5 block truncate text-[8px] text-zinc-600">{content.categoryLabel}</span>
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap text-[8px] text-zinc-600">
                <Eye className="size-3" />
                {content.source === "demo-fallback"
                  ? content.viewCount.toLocaleString("ko-KR")
                  : "집계 전"}
              </span>
            </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-5 rounded-md border border-cyan-300/15 bg-cyan-300/5 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-cyan-100">
          <Radio className="size-3.5" />
          스튜디오 상태
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">BETA 검증 중 · 사람 검토 활성화</p>
      </div>
    </div>
  );
}

export function PublicSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100svh-64px)] w-72 shrink-0 overflow-y-auto border-r border-white/8 xl:block">
      <PublicSidebarContent />
    </aside>
  );
}
