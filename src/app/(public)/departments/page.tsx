import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { DivisionStructureCard } from "@/components/organization/division-structure-card";
import { Button } from "@/components/ui/button";
import { publicDivisionOrder } from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";

function OrganizationOverviewTable() {
  const overviewDivisions = publicDivisionOrder
    .map((divisionId) => divisions.find((division) => division.id === divisionId))
    .filter((division): division is (typeof divisions)[number] => division !== undefined);
  const overviewTeams = overviewDivisions
    .flatMap((division) => teams
      .filter((team) => team.divisionId === division.id && team.id !== "team-channel-operations")
      .sort((a, b) => a.displayOrder - b.displayOrder))
    .slice(0, 18);
  const overviewEmployees = [
    ...employees.filter((employee) => employee.profileStage === "Approved"),
    ...employees.filter((employee) => employee.profileStage !== "Approved"),
  ].slice(0, 18);

  const rows = [
    { label: "사업부", items: overviewDivisions.map((division) => ({ id: division.id, name: division.nameKo })) },
    { label: "팀", items: overviewTeams.map((team) => ({ id: team.id, name: team.nameKo })) },
    { label: "페르소나", items: overviewEmployees.map((employee) => ({ id: employee.id, name: employee.nameKo.replace(" (가칭)", "") })) },
  ];

  return (
    <section aria-labelledby="departments-overview-title" className="overflow-hidden rounded-xl border border-cyan-200/15 bg-[linear-gradient(120deg,rgba(4,13,29,0.98),rgba(8,24,45,0.88),rgba(4,13,29,0.98))] shadow-[inset_0_0_38px_rgba(34,211,238,0.035)]">
      <header className="flex flex-col gap-2 border-b border-cyan-200/12 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200" id="departments-overview-title">
          DEPARTMENTS OVERVIEW
        </p>
        <p className="text-xs leading-5 text-zinc-500">PERSOS의 사업부·팀·페르소나 조직 구성을 한눈에 확인합니다.</p>
      </header>
      {rows.map((row) => (
        <div className="border-b border-white/8 px-4 py-4 last:border-b-0 sm:px-5" key={row.label}>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-4 w-0.5 rounded-full bg-cyan-300/70" />
            <h2 className="text-xs font-semibold text-zinc-100 sm:text-sm">{row.label}</h2>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.06] px-2 py-0.5 text-[10px] font-semibold text-cyan-100">{row.items.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {row.items.map((item) => (
              <div className="flex min-h-8 items-center justify-center rounded-md border border-white/8 bg-slate-950/35 px-2 text-center text-[10px] leading-4 text-zinc-300 sm:text-[11px]" key={item.id}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function DepartmentsHero() {
  return (
    <section
      aria-labelledby="departments-hero-title"
      className="relative min-h-[308px] overflow-hidden border border-white/8 bg-[radial-gradient(circle_at_82%_46%,rgba(14,116,144,0.25),transparent_31%),radial-gradient(circle_at_70%_15%,rgba(30,64,175,0.13),transparent_36%),linear-gradient(112deg,#020711_0%,#061225_57%,#020812_100%)] px-4 py-5 shadow-[inset_0_0_70px_rgba(2,132,199,0.05)] sm:px-6 sm:py-6 lg:h-[356px]"
    >
      <div className="relative grid items-center gap-4 lg:h-full lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)] lg:gap-5">
        <div className="min-w-0 lg:flex lg:h-full lg:flex-col lg:self-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200">
            DEPARTMENTS INFO
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400">
            BUSINESS UNIT STRUCTURE
          </p>
          <h1
            className="mt-6 text-3xl font-semibold leading-[1.2] tracking-[-0.045em] text-white sm:text-4xl lg:text-[2rem] xl:text-[2.15rem]"
            id="departments-hero-title"
          >
            <span className="block">기업 단위의 다양한</span>
            <span className="block">사업부가 존재합니다.</span>
          </h1>
          <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
            <span className="block">각 페르소나들은 담당 분야에 맞춰</span>
            <span className="block">사업부 내 하위팀으로 배정되어 활동합니다.</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-auto">
            <Button asChild className="w-[11rem] justify-center">
              <Link href="/characters">
                PERSONA INFO <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div
          aria-label="전략분석사업부, 사업개발사업부, 엔터테인먼트사업부, 미디어콘텐츠사업부, 커뮤니티사업부, 테크놀로지사업부가 입주한 PERSOS 사무실 설계도"
          className="relative mx-auto h-[260px] w-full max-w-[590px] sm:h-[280px] lg:h-[300px]"
          role="img"
        >
          <span className="pointer-events-none absolute inset-[16%_8%] rounded-[48%] bg-cyan-400/[0.1] blur-3xl" />
          <Image
            alt=""
            aria-hidden="true"
            className="object-contain object-center brightness-110 mix-blend-lighten drop-shadow-[0_0_18px_rgba(56,189,248,0.16)]"
            fill
            preload
            sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 52vw, 100vw"
            src="/assets/departments-office-plan-cutout-v4.png"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}

export default function DepartmentsPage() {
  const employeeProfiles = buildPopularEmployeeProfiles(
    buildPublicFeedItems([]),
    employees.length
  );

  return (
    <PageContainer className="space-y-8">
      <DepartmentsHero />
      <section aria-label="PERSOS 사업부와 팀" className="grid items-start gap-4 2xl:grid-cols-2">
        {publicDivisionOrder.map((divisionId) => divisions.find((division) => division.id === divisionId)).filter((division) => Boolean(division)).map((division, index) => division && (
          <DivisionStructureCard
            division={division}
            employees={employees.filter((employee) => employee.publicVisibility && employee.divisionId === division.id)}
            key={division.id}
            profiles={employeeProfiles.filter((profile) => profile.employee.divisionId === division.id)}
            sequence={index + 1}
            teams={teams.filter((team) => team.divisionId === division.id).sort((a, b) => a.displayOrder - b.displayOrder)}
          />
        ))}
      </section>
      <OrganizationOverviewTable />
    </PageContainer>
  );
}

export const metadata: Metadata = { title: "사업부", description: "PERSOS의 6개 사업부, 18개 팀과 AI Employee 조직 구조를 소개합니다." };
