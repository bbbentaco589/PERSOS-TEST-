import type { Metadata } from "next";
import Image from "next/image";
import {
  BriefcaseBusiness,
  Cpu,
  PenTool,
  PlaySquare,
  Target,
  UsersRound,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { DivisionStructureCard } from "@/components/organization/division-structure-card";
import { publicDivisionOrder } from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";

const departmentHeroNodes = [
  { label: "전략기획", labelEn: "STRATEGY", icon: Target, position: "left-1/2 top-0 -translate-x-1/2" },
  { label: "기술개발", labelEn: "TECHNOLOGY", icon: Cpu, position: "left-[5%] top-[25%]" },
  { label: "미디어·콘텐츠", labelEn: "MEDIA & CONTENT", icon: PlaySquare, position: "right-[5%] top-[25%]" },
  { label: "운영관리", labelEn: "OPERATIONS", icon: UsersRound, position: "bottom-[8%] left-[5%]" },
  { label: "크리에이티브", labelEn: "CREATIVE", icon: PenTool, position: "bottom-[8%] right-[5%]" },
  { label: "비즈니스·지원", labelEn: "BUSINESS & SUPPORT", icon: BriefcaseBusiness, position: "bottom-0 left-1/2 -translate-x-1/2" },
] as const;

function DepartmentsHeroVisual() {
  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[540px]" role="img" aria-label="PERSOS를 중심으로 연결된 6개 사업부 영역">
      <div className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.2),transparent_62%)] blur-xl" />

      <div className="absolute left-1/2 top-[22%] h-[28%] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-100/30 to-cyan-100/90 shadow-[0_0_8px_rgba(103,232,249,0.65)]" />
      <div className="absolute left-[28%] top-[41%] h-px w-[16%] rotate-[18deg] bg-gradient-to-r from-cyan-100/25 to-cyan-100/90 shadow-[0_0_8px_rgba(103,232,249,0.55)]" />
      <div className="absolute right-[28%] top-[41%] h-px w-[16%] -rotate-[18deg] bg-gradient-to-l from-cyan-100/25 to-cyan-100/90 shadow-[0_0_8px_rgba(103,232,249,0.55)]" />
      <div className="absolute bottom-[24%] left-[29%] h-px w-[16%] -rotate-[31deg] bg-gradient-to-r from-cyan-100/25 to-cyan-100/90 shadow-[0_0_8px_rgba(103,232,249,0.55)]" />
      <div className="absolute bottom-[24%] right-[29%] h-px w-[16%] rotate-[31deg] bg-gradient-to-l from-cyan-100/25 to-cyan-100/90 shadow-[0_0_8px_rgba(103,232,249,0.55)]" />
      <div className="absolute bottom-[20%] left-1/2 h-[30%] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-100/90 to-cyan-100/25 shadow-[0_0_8px_rgba(103,232,249,0.55)]" />

      {departmentHeroNodes.map(({ icon: Icon, label, labelEn, position }) => (
        <div className={`absolute z-30 flex h-[64px] w-[108px] flex-col items-center justify-center rounded-xl border border-cyan-100/55 bg-[linear-gradient(145deg,rgba(8,34,66,0.98),rgba(3,12,29,0.98))] text-center shadow-[inset_0_0_22px_rgba(34,211,238,0.08),0_0_18px_rgba(14,165,233,0.16)] ${position}`} key={label}>
          <Icon className="size-5 text-cyan-200 drop-shadow-[0_0_7px_rgba(103,232,249,0.55)]" />
          <strong className="mt-1 text-[10px] font-semibold text-white">{label}</strong>
          <span className="mt-0.5 whitespace-nowrap text-[6px] font-medium tracking-[0.1em] text-blue-100/70">{labelEn}</span>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 grid size-[126px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-50/90 bg-[radial-gradient(circle,rgba(30,64,175,0.22),rgba(3,12,29,0.98)_68%)] shadow-[inset_0_0_38px_rgba(34,211,238,0.16),0_0_20px_rgba(224,242,254,0.48),0_0_48px_rgba(14,165,233,0.3)]">
        <span className="absolute -inset-2 rounded-full border border-cyan-300/35" />
        <span className="absolute -inset-4 rounded-full border border-blue-300/12" />
        <div className="relative h-14 w-[108px] overflow-hidden">
          <Image alt="PERSOS Persona Operating System" className="object-contain scale-[1.7] drop-shadow-[0_0_12px_rgba(186,230,253,0.36)]" fill sizes="108px" src="/assets/about/persos-logo.png" />
        </div>
      </div>
    </div>
  );
}

function DepartmentsHero() {
  return (
    <section aria-labelledby="departments-hero-title" className="relative min-h-[308px] overflow-hidden border border-white/8 bg-[radial-gradient(circle_at_78%_48%,rgba(14,116,144,0.24),transparent_32%),radial-gradient(circle_at_68%_16%,rgba(30,64,175,0.14),transparent_36%),linear-gradient(112deg,#020711_0%,#061225_57%,#020812_100%)] px-4 py-5 shadow-[inset_0_0_70px_rgba(2,132,199,0.05)] sm:px-6 sm:py-6">
      <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(500px,1.1fr)] lg:gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200">DEPARTMENTS INFO</p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400">BUSINESS UNIT STRUCTURE</p>
          <h1 className="mt-6 text-3xl font-semibold leading-[1.2] tracking-[-0.045em] text-white sm:text-4xl lg:text-[2rem] xl:text-[2.15rem]" id="departments-hero-title">
            <span className="block">기업 단위의 다양한</span>
            <span className="block">사업부가 존재합니다.</span>
          </h1>
          <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
            <span className="block">각 페르소나들은 담당 분야에 맞춰</span>
            <span className="block">사업부 내 하위팀으로 배정되어 활동합니다.</span>
          </p>
        </div>
        <DepartmentsHeroVisual />
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
      <section aria-label="조직 현황" className="flex items-center justify-center gap-4 rounded-lg border border-cyan-200/15 bg-[linear-gradient(90deg,rgba(6,18,35,0.96),rgba(9,28,50,0.8),rgba(6,18,35,0.96))] px-5 py-4 text-sm text-zinc-300 shadow-[inset_0_0_28px_rgba(34,211,238,0.025)] sm:gap-7 sm:text-base">
        <span className="whitespace-nowrap">사업부 <strong className="ml-1 font-semibold text-cyan-100">6</strong></span>
        <span aria-hidden="true" className="h-4 w-px bg-white/15" />
        <span className="whitespace-nowrap">팀 <strong className="ml-1 font-semibold text-cyan-100">18</strong></span>
        <span aria-hidden="true" className="h-4 w-px bg-white/15" />
        <span className="whitespace-nowrap">페르소나 <strong className="ml-1 font-semibold text-cyan-100">18</strong></span>
      </section>
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
      <div className="border-l-2 border-cyan-300/40 pl-4 text-sm leading-7 text-zinc-400">
        승인 프로필 4명은 업무 중이며, 나머지 14명은 조직·직무 검증을 위한 Rough 상태입니다. Rough 이름과 Character Lore는 최종 확정 정보가 아닙니다.
      </div>
    </PageContainer>
  );
}

export const metadata: Metadata = { title: "사업부", description: "PERSOS의 6개 사업부, 18개 팀과 AI Employee 조직 구조를 소개합니다." };
