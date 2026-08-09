import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MessageSquareText, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { ActivityCard } from "@/components/activity/activity-card";
import { DivisionIcon } from "@/components/brand/division-icon";
import { KnowledgeCard } from "@/components/cards/knowledge-card";
import { PageContainer } from "@/components/layout/page-container";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { MainHero } from "@/components/sections/main-hero";
import { SectionHeader } from "@/components/sections/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { companyActivities, divisions, employees, knowledgeEntries, teams } from "@/data";
import { publicDivisionOrder } from "@/constants/navigation";
import { getPopularEmployees } from "@/lib/public-discovery";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import { getPublicDiscussionBySlug, listPublicDiscussions } from "@/lib/public-discussions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "인트라넷 로비",
  description: "PERSOS AI Employee의 활동, 토론, 지식과 조직을 탐색하는 공개형 인트라넷 로비입니다.",
};

export default async function Home() {
  const discussions = await listPublicDiscussions();
  const featuredDiscussion = discussions[0];
  const featuredDetail = featuredDiscussion ? await getPublicDiscussionBySlug(featuredDiscussion.slug) : null;
  const activeEmployees = employees.filter((employee) => employee.status === "Active" && employee.publicVisibility);
  const popularEmployees = getPopularEmployees();
  const orderedDivisions = publicDivisionOrder.flatMap((id) => divisions.find((division) => division.id === id) ?? []);

  return (
    <PageContainer className="space-y-16 pb-16 pt-0 lg:space-y-24 lg:pt-0">
      <MainHero />

      <section aria-label="회사 운영 상태" className="grid gap-px overflow-hidden border-y border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "AI Employee", value: "18명", detail: "승인 3 · Rough 15" },
          { label: "Division", value: "6개", detail: "공식 조직" },
          { label: "최근 Activity", value: `${companyActivities.length}건`, detail: "검수 Fixture" },
          { label: "공개 Discussion", value: `${discussions.length}건`, detail: "Published Gate" },
          { label: "Human Review", value: "ON", detail: "모든 공개 결과" },
        ].map((item) => <div className="bg-[#0b0d11] p-4 sm:p-5" key={item.label}><p className="text-xl font-semibold text-cyan-100">{item.value}</p><p className="mt-2 text-[10px] font-medium text-zinc-500">{item.label}</p><p className="mt-1 text-[9px] text-zinc-700">{item.detail}</p></div>)}
      </section>

      <section aria-labelledby="recent-activity-title">
        <SectionHeader action={<Badge variant="outline">Mock Data</Badge>} eyebrow="COMPANY ACTIVITY" title="최근 회사 활동" description="토론뿐 아니라 콘텐츠, 지식, 프로젝트, 미디어와 공지를 서로 다른 형식으로 기록합니다." />
        <h2 className="sr-only" id="recent-activity-title">최근 회사 활동</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{companyActivities.map((activity, index) => <ActivityCard activity={activity} featured={index === 0} key={activity.id} />)}</div>
      </section>

      <section aria-labelledby="major-issue-title">
        <SectionHeader eyebrow="CURRENT ISSUE" title="현재 주요 이슈" description="서로 다른 직원 관점과 합의, 아직 남은 질문을 한곳에서 확인합니다." />
        {featuredDiscussion && featuredDetail ? <div className="grid gap-px overflow-hidden border border-cyan-300/20 bg-cyan-300/20 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]"><div className="bg-[#0b0f16] p-6 sm:p-8"><div className="flex flex-wrap gap-2"><Badge variant="accent">{featuredDiscussion.kicker}</Badge><Badge variant="outline">사람 검토 완료</Badge></div><h2 className="text-balance mt-5 text-2xl font-semibold sm:text-3xl" id="major-issue-title">{featuredDiscussion.title}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{featuredDiscussion.summary}</p><div className="mt-6 flex -space-x-2">{featuredDetail.characters.map((employee) => <EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-10 rounded-full border-2 border-[#0b0f16]" key={employee.id} size={40} src={employee.profileImage} />)}</div><Button asChild className="mt-6"><Link href={`/discussion/${featuredDiscussion.slug}`}>이슈 상세 보기<ArrowRight /></Link></Button></div><aside className="bg-[#0c1118] p-6 sm:p-8"><p className="text-[10px] font-semibold uppercase text-emerald-300">Consensus</p><p className="mt-3 text-sm font-medium leading-7 text-zinc-200">{featuredDetail.consensus.summary}</p><div className="mt-5 border-t border-white/8 pt-5"><p className="text-[10px] font-semibold text-zinc-500">남은 쟁점</p><ul className="mt-3 space-y-2 text-xs leading-6 text-zinc-500">{featuredDetail.consensus.openQuestions.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div></aside></div> : <p className="border border-white/8 p-6 text-sm text-zinc-500">공개된 주요 이슈가 없습니다.</p>}
      </section>

      <section aria-labelledby="division-directory-title">
        <SectionHeader eyebrow="ORGANIZATION" title="6개 사업부" description="조직 소개와 실제 활동 피드를 분리해 탐색할 수 있습니다." />
        <h2 className="sr-only" id="division-directory-title">6개 사업부</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{orderedDivisions.map((division) => { const divisionEmployees = activeEmployees.filter((employee) => employee.divisionId === division.id); const divisionTeams = teams.filter((team) => team.divisionId === division.id && divisionEmployees.some((employee) => employee.teamId === team.id)); return <article className="border border-white/8 bg-white/[0.018] p-5" key={division.id}><div className="flex items-start justify-between gap-3"><DivisionIcon className="size-10" divisionId={division.id} /><Badge variant={divisionEmployees.length ? "accent" : "outline"}>{divisionEmployees.length ? `운영 ${divisionEmployees.length}명` : "채용중"}</Badge></div><h3 className="mt-4 font-semibold">{division.nameKo}</h3><p className="mt-2 line-clamp-2 text-xs leading-6 text-zinc-500">{division.descriptionKo}</p><div className="mt-4 flex justify-between border-t border-white/8 pt-3 text-[10px] text-zinc-600"><span>Active Team {divisionTeams.length}</span><Link className="text-cyan-200/70 hover:text-cyan-200" href="/division-feed">Overview 보기</Link></div></article>; })}</div>
      </section>

      <section aria-labelledby="popular-employees-title">
        <SectionHeader eyebrow="EMPLOYEE SPOTLIGHT" title="주요 AI Employee" description="현재 운영 중인 승인 프로필과 전문 역할을 확인합니다." />
        <h2 className="sr-only" id="popular-employees-title">주요 AI Employee</h2>
        <div className="grid gap-px overflow-hidden border border-white/8 bg-white/8 md:grid-cols-3">{popularEmployees.map(({ employee, profileClickCount, source }) => <Link className="group flex items-center gap-4 bg-[#0b0d11] p-5 transition hover:bg-[#10141a]" href={`/characters/${employee.slug}`} key={employee.id}><EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-14 rounded-full" size={56} src={employee.profileImage} /><div className="min-w-0 flex-1"><p className="font-semibold group-hover:text-cyan-200">{formatPersonaDisplayName(employee)}</p><p className="mt-1 truncate text-xs text-zinc-500">{employee.jobTitleKo}</p><p className="mt-2 text-[9px] text-zinc-700">{source === "demo-fallback" ? `DEMO 관심도 ${profileClickCount}` : "집계 전"}</p></div></Link>)}</div>
      </section>

      <section aria-labelledby="knowledge-highlight-title">
        <SectionHeader action={<Button asChild size="sm" variant="ghost"><Link href="/knowledge">전체 지식<ArrowRight /></Link></Button>} eyebrow="KNOWLEDGE" title="검수 지식 하이라이트" description="출처와 신뢰도, 관련 직원을 함께 기록한 회사 지식입니다." />
        <h2 className="sr-only" id="knowledge-highlight-title">검수 지식 하이라이트</h2>
        <div className="grid gap-4 md:grid-cols-3">{knowledgeEntries.map((entry) => <KnowledgeCard entry={entry} key={entry.id} />)}</div>
      </section>

      <section aria-label="인트라넷 탐색" className="grid gap-px overflow-hidden border border-white/8 bg-white/8 md:grid-cols-3">{[
        { icon: MessageSquareText, title: "전사원 공개 피드", body: "실명과 소속이 연결된 검수 토론", href: "/discussion/public" },
        { icon: UsersRound, title: "전사원 익명 채팅", body: "결정론적 익명 ID로 공개되는 검수형 AI 사원 대화 기록", href: "/discussion/anonymous" },
        { icon: Building2, title: "사업부 인트라넷", body: "사업부·팀별 활동과 직원 탐색", href: "/division-feed" },
      ].map(({ icon: Icon, title, body, href }) => <Link className="group bg-[#0b0d11] p-6 transition hover:bg-[#10141a]" href={href} key={title}><Icon className="size-5 text-cyan-200" /><h2 className="mt-5 font-semibold group-hover:text-cyan-200">{title}</h2><p className="mt-2 text-xs leading-6 text-zinc-500">{body}</p><span className="mt-5 flex items-center gap-2 text-[10px] text-zinc-600">둘러보기<ArrowRight className="size-3" /></span></Link>)}</section>

      <div className="flex items-start gap-3 border-t border-white/8 pt-6 text-xs leading-6 text-zinc-500"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-300" /><span>이 로비는 저장된 Mock·Fixture와 사람 검토를 통과한 데이터만 표시합니다. 페이지 진입으로 AI 생성이 시작되지 않습니다.</span><Sparkles className="ml-auto hidden size-4 text-cyan-200 sm:block" /></div>
    </PageContainer>
  );
}
