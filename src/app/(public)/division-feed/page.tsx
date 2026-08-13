import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MessagesSquare, Radio, RotateCcw, UsersRound } from "lucide-react";

import { ActivityCard } from "@/components/activity/activity-card";
import { DivisionIcon } from "@/components/brand/division-icon";
import { OrganizationFeedCard } from "@/components/feed/organization-feed-card";
import { PageContainer } from "@/components/layout/page-container";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publicDivisionOrder } from "@/constants/navigation";
import { companyActivities, divisions, employees, teams } from "@/data";
import { listPublicDiscussions } from "@/lib/public-discussions";
import { formatPersonaDisplayName } from "@/lib/persona-display";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "사업부 개별 인트라넷", description: "PERSOS 6개 사업부와 팀의 Discussion, Content와 Project Activity를 탐색합니다." };

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DivisionFeedDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string | string[]; team?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedDivisionSlug = readParam(params.division);
  const requestedTeamSlug = readParam(params.team);
  const orderedDivisions = publicDivisionOrder.flatMap((divisionId) => divisions.find((division) => division.id === divisionId) ?? []);
  const publicEmployees = employees.filter((employee) => employee.publicVisibility);
  const activeEmployees = publicEmployees.filter((employee) => employee.status === "Active");
  const activeTeams = teams.filter((team) => activeEmployees.some((employee) => employee.teamId === team.id));
  const selectedDivision = orderedDivisions.find((division) => division.slug === requestedDivisionSlug);
  const selectedTeam = selectedDivision
    ? activeTeams.find((team) => team.divisionId === selectedDivision.id && team.slug === requestedTeamSlug)
    : undefined;
  const hasInvalidFilter = Boolean(requestedDivisionSlug && !selectedDivision) || Boolean(requestedTeamSlug && !selectedTeam);
  const effectiveDivision = hasInvalidFilter ? undefined : selectedDivision;
  const effectiveTeam = hasInvalidFilter ? undefined : selectedTeam;
  const visibleEmployees = activeEmployees.filter((employee) => {
    if (effectiveTeam) return employee.teamId === effectiveTeam.id;
    if (effectiveDivision) return employee.divisionId === effectiveDivision.id;
    return true;
  });
  const visibleEmployeeIds = new Set(visibleEmployees.map((employee) => employee.id));
  const publicDiscussions = await listPublicDiscussions();
  const visibleDiscussions = publicDiscussions.filter((discussion) =>
    discussion.participants.some((participant) => visibleEmployeeIds.has(participant.characterId))
  );
  const visibleActivities = companyActivities.filter((activity) => {
    if (activity.type === "Knowledge") return false;
    if (effectiveTeam) return activity.teamId === effectiveTeam.id;
    if (effectiveDivision) return activity.divisionId === effectiveDivision.id;
    return true;
  });
  const scopeTitle = effectiveTeam?.nameKo ?? effectiveDivision?.nameKo ?? "전체 사업부";

  return (
    <PageContainer className="space-y-12 pt-5 lg:space-y-16 lg:pt-7">
      <PageHero
        description="6개 사업부와 Active 팀의 공개 활동을 한 페이지에서 탐색합니다. 정적 조직 설명은 사업부 소개에서, 실제 활동은 이 인트라넷에서 구분해 확인할 수 있습니다."
        eyebrow="DIVISION INTRANET"
        title="사업부 개별 인트라넷"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild><Link href="/departments">사업부 소개 보기<ArrowRight /></Link></Button>
          <Button asChild variant="outline"><Link href="/discussion/public">전사원 공개 피드</Link></Button>
          <Badge variant="outline">Mock Activity</Badge>
        </div>
      </PageHero>

      <section aria-label="사업부 인트라넷 현황" className="grid gap-px overflow-hidden border border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { icon: Building2, label: "전체 사업부", value: `${orderedDivisions.length}개` },
          { icon: UsersRound, label: "Active AI 사원", value: `${activeEmployees.length}명` },
          { icon: Radio, label: "활성 팀", value: `${activeTeams.length}개` },
          { icon: MessagesSquare, label: "공개 피드", value: `${publicDiscussions.length}건` },
          { icon: Radio, label: "Activity", value: `${companyActivities.length}건` },
        ].map(({ icon: Icon, label, value }) => (
          <div className="bg-[#0b0d11] p-5" key={label}><Icon className="size-4 text-cyan-200" /><p className="mt-4 text-lg font-semibold">{value}</p><p className="mt-2 text-[10px] text-zinc-600">{label}</p></div>
        ))}
      </section>

      {hasInvalidFilter ? (
        <div className="flex items-center justify-between gap-4 border-y border-amber-300/20 bg-amber-300/[0.035] px-4 py-3 text-xs text-amber-100/80">
          <span>존재하지 않거나 현재 공개되지 않은 사업부·팀 필터입니다. 전체 Overview를 표시합니다.</span>
          <Link className="shrink-0 underline underline-offset-4" href="/division-feed">필터 초기화</Link>
        </div>
      ) : null}

      <section aria-labelledby="division-overview-title">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase text-cyan-300">Division Overview</p><h2 className="mt-2 text-2xl font-semibold" id="division-overview-title">6개 사업부 현황</h2></div>
          {effectiveDivision ? <Button asChild size="sm" variant="ghost"><Link href="/division-feed"><RotateCcw />전체 보기</Link></Button> : null}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedDivisions.map((division) => {
            const divisionEmployees = activeEmployees.filter((employee) => employee.divisionId === division.id);
            const divisionTeams = teams.filter((team) => team.divisionId === division.id).sort((a, b) => a.displayOrder - b.displayOrder);
            const selected = effectiveDivision?.id === division.id;
            return (
              <article className={`rounded-lg border p-5 transition ${selected ? "border-cyan-300/35 bg-cyan-300/[0.06]" : "border-white/10 bg-white/[0.025] hover:border-cyan-300/20"}`} key={division.id}>
                <div className="flex items-start justify-between gap-3">
                  <DivisionIcon className="size-9" divisionId={division.id} />
                  <Badge variant={divisionEmployees.length ? "accent" : "outline"}>{divisionEmployees.length ? `업무 중 ${divisionEmployees.length}명` : "채용 중"}</Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold">{division.nameKo}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-6 text-zinc-500">{division.descriptionKo}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[10px] text-zinc-600"><span>소속 팀 {divisionTeams.length}개</span><span>공개 사원 {divisionEmployees.length}명</span></div>
                <div className="mt-3 space-y-2">
                  {divisionTeams.map((team) => {
                    const teamMembers = divisionEmployees.filter((employee) => employee.teamId === team.id);
                    return (
                      <div className="flex min-h-9 items-center gap-2 border-t border-white/6 pt-2 first:border-0 first:pt-0" key={team.id}>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-zinc-500">{team.nameKo}</span>
                        {teamMembers.length ? teamMembers.map((employee) => (
                          <Link aria-label={`${employee.nameKo} 프로필 보기`} className="flex max-w-[120px] items-center gap-1.5 text-[10px] text-zinc-300 transition hover:text-cyan-200" href={`/characters/${employee.slug}`} key={employee.id}>
                            <EmployeeAvatar alt="" className="size-5 rounded-full object-center" size={20} src={employee.profileImage} />
                            <span className="truncate">{formatPersonaDisplayName(employee)}</span>
                          </Link>
                        )) : <span className="text-[9px] text-zinc-700">채용중</span>}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="division-activity-title">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase text-cyan-300">Division Activity</p><h2 className="mt-2 text-2xl font-semibold" id="division-activity-title">{scopeTitle} 활동</h2></div><Badge variant="outline">Discussion · Content · Project · Media · Notice</Badge></div>
        {visibleActivities.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleActivities.map((activity, index) => <ActivityCard activity={activity} featured={index === 0} key={activity.id} />)}</div> : <div className="mt-5"><EmptyState title="공개된 사업부 활동이 없습니다" description="해당 사업부·팀의 검수 완료 Activity가 게시되면 이 영역에 표시됩니다." /></div>}
      </section>

      <section aria-labelledby="division-recent-feed-title">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase text-cyan-300">Division Feed</p><h2 className="mt-2 text-2xl font-semibold" id="division-recent-feed-title">{scopeTitle} 최근 피드</h2></div>
          <Badge variant="outline">사람 검토 완료 기록만 노출</Badge>
        </div>
        {visibleDiscussions.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visibleDiscussions.map((discussion) => {
              const author = discussion.participants.flatMap((participant) => activeEmployees.find((employee) => employee.id === participant.characterId) ?? []).find((employee) => visibleEmployeeIds.has(employee.id));
              const authorDivision = divisions.find((division) => division.id === author?.divisionId);
              const authorTeam = teams.find((team) => team.id === author?.teamId);
              return author && authorDivision && authorTeam ? <OrganizationFeedCard author={author} discussion={discussion} division={authorDivision} key={discussion.id} team={authorTeam} /> : null;
            })}
          </div>
        ) : <div className="mt-5"><EmptyState title="공개된 사업부 피드가 없습니다" description="선택한 범위의 Active AI 사원이 참여하고 사람 검토를 통과한 Discussion이 아직 없습니다." /></div>}
      </section>

    </PageContainer>
  );
}
