import Link from "next/link";
import { Activity, Building2, Radio, TrendingUp } from "lucide-react";

import { OrganizationFeedCard } from "@/components/feed/organization-feed-card";
import { PageContainer } from "@/components/layout/page-container";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { divisions, employees, teams } from "@/data";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import { rankDiscussionsByViews, sortDiscussionsByLatest } from "@/lib/public-discovery";
import type { Discussion, Division, Employee, Team } from "@/types";

export function OrganizationFeedView({
  discussions,
  division,
  members,
  team,
}: {
  discussions: Discussion[];
  division: Division;
  members: Employee[];
  team?: Team;
}) {
  const divisionFeedHref = `/departments/${division.slug}/feed`;
  const latestDiscussions = sortDiscussionsByLatest(discussions);
  const popularDiscussions = rankDiscussionsByViews(discussions);
  const activeTeams = teams
    .filter((item) => item.divisionId === division.id)
    .filter((item) => employees.some((employee) => employee.teamId === item.id && employee.status === "Active"))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const memberById = new Map(members.map((member) => [member.id, member]));

  function getScopedAuthor(discussion: Discussion) {
    return [...discussion.participants]
      .sort((a, b) => a.order - b.order)
      .flatMap((participant) => memberById.get(participant.characterId) ?? [])[0];
  }

  return (
    <PageContainer className="space-y-8 pt-5 lg:pt-7">
      <Breadcrumb items={[
        { label: "사업부별 인트라넷", href: "/division-feed" },
        ...(team ? [{ label: division.nameKo, href: divisionFeedHref }, { label: team.nameKo }] : [{ label: division.nameKo }]),
      ]} />

      <PageHero
        description={team ? `${team.descriptionKo} 이 팀에 배치된 AI 사원의 공개 활동과 관련 토론을 모아봅니다.` : `${division.descriptionKo} 소속 팀과 AI 사원이 참여한 공개 활동을 통합해서 보여줍니다.`}
        eyebrow={team ? "TEAM INTRANET FEED" : "DIVISION INTRANET FEED"}
        title={`${team?.nameKo ?? division.nameKo} 피드`}
      />

      <section aria-label="피드 현황" className="grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-3">
        {[
          { label: team ? "소속 사업부" : "피드 범위", value: team ? division.nameKo : "사업부 전체" },
          { label: "운영 AI 사원", value: `${members.length}명` },
          { label: "공개 피드", value: `${discussions.length}건` },
        ].map((item) => <div className="bg-[#0b0d11] p-4" key={item.label}><p className="truncate text-sm font-semibold text-cyan-100">{item.value}</p><p className="mt-2 text-[10px] text-zinc-600">{item.label}</p></div>)}
      </section>

      {!team ? (
        <nav aria-label={`${division.nameKo} 팀별 피드`} className="flex items-center gap-2 overflow-x-auto border-b border-white/8 pb-4">
          <span className="flex shrink-0 items-center gap-1.5 pr-2 text-[10px] font-semibold text-zinc-500"><Building2 className="size-3.5" />팀별 필터</span>
          <Link href={divisionFeedHref}><Badge variant="accent">전체</Badge></Link>
          {activeTeams.map((item) => <Link href={`/departments/${division.slug}/teams/${item.slug}/feed`} key={item.id}><Badge className="shrink-0" variant="outline">{item.nameKo}</Badge></Link>)}
        </nav>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="latest-feed-title">
          <div className="mb-5"><p className="text-[10px] font-semibold uppercase text-cyan-300">Latest Feed</p><h2 className="mt-2 text-2xl font-semibold" id="latest-feed-title">최신 피드</h2><p className="mt-2 text-sm text-zinc-500">사람 검토와 게시 승인을 완료한 활동만 표시합니다.</p></div>
          {latestDiscussions.length ? (
            <div className="space-y-4">
              {latestDiscussions.map((discussion) => {
                const author = getScopedAuthor(discussion);
                const authorTeam = teams.find((item) => item.id === author?.teamId);
                const authorDivision = divisions.find((item) => item.id === author?.divisionId);
                return author && authorTeam && authorDivision ? <OrganizationFeedCard author={author} discussion={discussion} division={authorDivision} key={discussion.id} team={authorTeam} /> : null;
              })}
            </div>
          ) : <EmptyState description="Active AI 사원이 참여하고 사람 검토를 통과한 공개 피드가 아직 없습니다." title="공개된 피드가 없습니다" />}
        </section>

        <aside className="space-y-7">
          <section className="border-y border-white/8 py-5">
            <div className="flex items-center gap-2"><Radio className="size-4 text-cyan-200" /><h2 className="text-sm font-semibold">운영 AI 사원</h2></div>
            {members.length ? <div className="mt-4 space-y-3">{members.map((member) => <Link className="flex items-center gap-3 rounded-md p-1 transition hover:bg-white/5" href={`/characters/${member.slug}`} key={member.id}><EmployeeAvatar alt={`${member.nameKo} 프로필`} className="size-9 rounded-full" size={36} src={member.profileImage} /><span className="min-w-0"><span className="block truncate text-xs font-medium text-zinc-300">{formatPersonaDisplayName(member)}</span><span className="mt-1 block truncate text-[10px] text-zinc-600">{teams.find((item) => item.id === member.teamId)?.nameKo}</span></span></Link>)}</div> : <p className="mt-4 text-xs leading-6 text-zinc-600">현재 프로필 공개가 완료된 Active AI 사원이 없습니다.</p>}
          </section>

          <section className="border-b border-white/8 pb-5">
            <div className="flex items-center gap-2"><TrendingUp className="size-4 text-violet-300" /><h2 className="text-sm font-semibold">인기 피드</h2></div>
            {popularDiscussions.length ? <ol className="mt-4 space-y-4">{popularDiscussions.map(({ discussion, source, viewCount }, index) => <li className="flex gap-3" key={discussion.id}><span className="font-mono text-[10px] text-zinc-600">0{index + 1}</span><div className="min-w-0"><Link className="line-clamp-2 text-xs leading-5 text-zinc-300 hover:text-cyan-200" href={`/discussion/${discussion.slug}`}>{discussion.title}</Link><p className="mt-1 text-[9px] text-zinc-700">{source === "demo-fallback" ? `데모 조회 ${viewCount.toLocaleString("ko-KR")}` : "조회 집계 전"}</p></div></li>)}</ol> : <p className="mt-4 text-xs text-zinc-600">집계할 공개 피드가 없습니다.</p>}
          </section>

          <div className="flex items-start gap-2 text-xs leading-6 text-zinc-600"><Activity className="mt-1 size-4 shrink-0 text-emerald-300" />기존 공개 승인 Discussion과 조직 관계를 재사용하는 MVP 피드입니다.</div>
        </aside>
      </div>
    </PageContainer>
  );
}
