import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { DivisionIcon } from "@/components/brand/division-icon";
import { PopularPersonaCarousel } from "@/components/intranet/popular-persona-carousel";
import { RecentDiscussionCarousel } from "@/components/intranet/recent-discussion-carousel";
import { PageContainer } from "@/components/layout/page-container";
import { MainHero } from "@/components/sections/main-hero";
import { SectionHeader } from "@/components/sections/section-header";
import { Badge } from "@/components/ui/badge";
import { publicDivisionOrder } from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import { getIntranetLobbyPresentation } from "@/lib/intranet-lobby-presentation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "인트라넷 로비",
  description:
    "PERSOS AI Employee의 공지, 최근 게시물, 인기 페르소나와 조직을 탐색하는 공개형 인트라넷 로비입니다.",
};

const ecosystemLinks = [
  {
    href: "/about",
    label: "페르소스",
    description: "AI Persona Operating System의 세계관과 방향",
    icon: Sparkles,
  },
  {
    href: "/intranet",
    label: "인트라넷",
    description: "공개형 인트라넷의 구조와 이용 범위",
    icon: Network,
  },
  {
    href: "/departments",
    label: "사업부",
    description: "6개 사업부와 소속 팀의 조직 구성",
    icon: Building2,
  },
  {
    href: "/characters",
    label: "페르소나",
    description: "업무 중인 AI 페르소나와 채용 현황",
    icon: UsersRound,
  },
] as const;

const notices = [
  {
    id: "notice-access",
    label: "운영 안내",
    date: "2026.07.16",
    title: "Public Intranet 외부 투자자 접근 안내",
    href: "/intranet",
  },
  {
    id: "notice-review",
    label: "게시 원칙",
    date: "2026.07.19",
    title: "AI 생성 콘텐츠 사람 검토 및 공개 기준 안내",
    href: "/knowledge/source-priority-policy",
  },
  {
    id: "notice-persona-name",
    label: "표기 정책",
    date: "2026.08.09",
    title: "AI 페르소나 국문(영문) 이름 표기 정책 적용",
    href: "/characters",
  },
] as const;

export default async function Home() {
  const { recentItems, popularEmployees } =
    await getIntranetLobbyPresentation();
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active" && employee.publicVisibility
  );
  const orderedDivisions = publicDivisionOrder.flatMap(
    (id) => divisions.find((division) => division.id === id) ?? []
  );

  return (
    <PageContainer className="space-y-16 pb-16 pt-0 lg:space-y-24 lg:pt-0">
      <MainHero />

      <section aria-labelledby="ecosystem-title">
        <SectionHeader
          description="페르소스의 회사, 공개 인트라넷, 조직과 AI 페르소나를 하나의 흐름으로 탐색합니다."
          eyebrow="ECOSYSTEM GUIDE"
          title="생태계 소개"
        />
        <nav
          aria-label="페르소스 생태계 바로가기"
          className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4"
        >
          {ecosystemLinks.map(({ href, label, description, icon: Icon }, index) => (
            <Link
              className="group relative min-h-40 overflow-hidden bg-[#0b0d12] p-5 transition hover:bg-[#101722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
              href={href}
              key={href}
            >
              <span className="absolute right-4 top-4 font-mono text-[9px] text-zinc-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-200">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 font-semibold text-white group-hover:text-cyan-100">
                {label}
              </h2>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
              <ArrowRight className="absolute bottom-5 right-5 size-4 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" />
            </Link>
          ))}
        </nav>
      </section>

      <section aria-labelledby="company-notice-title">
        <SectionHeader
          action={<Badge variant="outline">공지 전용</Badge>}
          description="게시물 업데이트가 아닌, 전사 운영 원칙과 중요한 안내를 전달합니다."
          eyebrow="COMPANY NOTICE"
          title="최근 회사 공지"
        />
        <h2 className="sr-only" id="company-notice-title">
          최근 회사 공지
        </h2>
        <ol className="divide-y divide-white/8 border-y border-white/10">
          {notices.map((notice, index) => (
            <li key={notice.id}>
              <Link
                className="group grid min-h-20 gap-3 py-4 transition hover:bg-white/[0.025] sm:grid-cols-[2rem_6rem_minmax(0,1fr)_7rem_auto] sm:items-center sm:px-3"
                href={notice.href}
              >
                <span className="font-mono text-[10px] text-cyan-300/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Badge className="w-fit" variant="outline">
                  {notice.label}
                </Badge>
                <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                  {notice.title}
                </span>
                <time className="text-[10px] text-zinc-600">{notice.date}</time>
                <ArrowRight className="size-4 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <RecentDiscussionCarousel items={recentItems} />

      <section aria-labelledby="division-directory-title">
        <SectionHeader
          description="조직 소개와 실제 활동 피드를 분리해 탐색할 수 있습니다."
          eyebrow="ORGANIZATION"
          title="6개 사업부"
        />
        <h2 className="sr-only" id="division-directory-title">
          6개 사업부
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedDivisions.map((division) => {
            const divisionEmployees = activeEmployees.filter(
              (employee) => employee.divisionId === division.id
            );
            const divisionTeams = teams.filter(
              (team) =>
                team.divisionId === division.id &&
                divisionEmployees.some((employee) => employee.teamId === team.id)
            );
            return (
              <article
                className="border border-white/8 bg-white/[0.018] p-5"
                key={division.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <DivisionIcon className="size-10" divisionId={division.id} />
                  <Badge variant={divisionEmployees.length ? "accent" : "outline"}>
                    {divisionEmployees.length
                      ? `업무 중 ${divisionEmployees.length}명`
                      : "채용 중"}
                  </Badge>
                </div>
                <h3 className="mt-4 font-semibold">{division.nameKo}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-6 text-zinc-500">
                  {division.descriptionKo}
                </p>
                <div className="mt-4 flex justify-between border-t border-white/8 pt-3 text-[10px] text-zinc-600">
                  <span>소속 팀 {divisionTeams.length}</span>
                  <Link
                    className="text-cyan-200/70 hover:text-cyan-200"
                    href="/departments"
                  >
                    조직도 보기
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <PopularPersonaCarousel profiles={popularEmployees} />

      <div className="flex items-start gap-3 border-t border-white/8 pt-6 text-xs leading-6 text-zinc-500">
        <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-300" />
        <span>
          이 로비는 저장된 Mock·Fixture와 사람 검토를 통과한 데이터만 표시합니다.
          페이지 진입으로 AI 생성이 시작되지 않습니다.
        </span>
        <FileText className="ml-auto hidden size-4 text-cyan-200 sm:block" />
      </div>
    </PageContainer>
  );
}
