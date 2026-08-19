import type { Metadata } from "next";
import Image from "next/image";

import { DivisionIcon } from "@/components/brand/division-icon";
import { PageContainer } from "@/components/layout/page-container";
import { DivisionStructureCard } from "@/components/organization/division-structure-card";
import { publicDivisionOrder } from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";

const departmentHeroPositions = [
  "left-1/2 top-0 -translate-x-1/2",
  "left-0 top-[78px] sm:top-[90px]",
  "right-0 top-[78px] sm:top-[90px]",
  "bottom-[78px] left-0 sm:bottom-[90px]",
  "bottom-[78px] right-0 sm:bottom-[90px]",
  "bottom-0 left-1/2 -translate-x-1/2",
] as const;

const departmentHeroConnections = [
  "left-1/2 top-[66px] w-[30px] -translate-x-1/2 rotate-90 sm:top-[82px] sm:w-[16px]",
  "left-[106px] top-[110px] w-[20px] rotate-[8deg] sm:left-[154px] sm:top-[132px] sm:w-[52px] sm:rotate-[10deg]",
  "right-[106px] top-[110px] w-[20px] -rotate-[8deg] sm:right-[154px] sm:top-[132px] sm:w-[52px] sm:-rotate-[10deg]",
  "left-[106px] top-[190px] w-[20px] -rotate-[8deg] sm:left-[154px] sm:top-[247px] sm:w-[52px] sm:-rotate-[10deg]",
  "right-[106px] top-[190px] w-[20px] rotate-[8deg] sm:right-[154px] sm:top-[247px] sm:w-[52px] sm:rotate-[10deg]",
  "bottom-[96px] left-1/2 w-[30px] -translate-x-1/2 rotate-90 sm:w-[16px]",
] as const;

function DepartmentsHeroVisual() {
  const heroDivisions = publicDivisionOrder
    .map((divisionId) => divisions.find((division) => division.id === divisionId))
    .filter((division): division is (typeof divisions)[number] => division !== undefined);

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[600px] sm:h-[380px]" role="img" aria-label="PERSOS를 중심으로 연결된 실제 6개 사업부">
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.24),rgba(14,116,144,0.09)_43%,transparent_70%)] blur-xl" />

      {departmentHeroConnections.map((connectionClass) => (
        <span
          aria-hidden="true"
          className={`absolute z-10 h-px origin-left bg-gradient-to-r from-cyan-100/90 via-blue-200/70 to-cyan-100/90 shadow-[0_0_8px_rgba(125,211,252,0.75)] before:absolute before:-left-1 before:top-1/2 before:size-2 before:-translate-y-1/2 before:rounded-full before:bg-cyan-50 before:shadow-[0_0_8px_2px_rgba(125,211,252,0.8)] after:absolute after:-right-1 after:top-1/2 after:size-2 after:-translate-y-1/2 after:rounded-full after:bg-cyan-50 after:shadow-[0_0_8px_2px_rgba(125,211,252,0.8)] ${connectionClass}`}
          key={connectionClass}
        />
      ))}

      {heroDivisions.map((division, index) => (
        <div className={`absolute z-30 flex h-[66px] w-[106px] flex-col items-center justify-center gap-1 rounded-xl border border-blue-200/55 bg-[linear-gradient(145deg,rgba(10,31,65,0.98),rgba(3,11,29,0.98))] px-1.5 text-center shadow-[inset_0_0_26px_rgba(96,165,250,0.09),0_0_18px_rgba(37,99,235,0.14)] sm:h-[82px] sm:w-[154px] sm:flex-row sm:justify-start sm:gap-2.5 sm:px-3 sm:text-left ${departmentHeroPositions[index]}`} key={division.id}>
          <DivisionIcon className="size-6 shrink-0 sm:size-10" divisionId={division.id} />
          <div className="min-w-0">
            <strong className="block whitespace-nowrap text-[7.5px] font-semibold text-white sm:text-[10px]">{division.nameKo}</strong>
            <span className="mt-1 hidden max-w-[82px] text-[6.5px] font-semibold uppercase leading-[1.35] tracking-[0.1em] text-blue-100/65 sm:block">
              {division.slug.replaceAll("-", " ")}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 grid size-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-50/90 bg-[radial-gradient(circle,rgba(23,51,112,0.28),rgba(3,10,27,0.99)_72%)] shadow-[inset_0_0_36px_rgba(34,211,238,0.13),0_0_20px_rgba(224,242,254,0.42),0_0_46px_rgba(37,99,235,0.3)] sm:size-[170px]">
        <span className="absolute -inset-1.5 rounded-full border border-cyan-300/40 sm:-inset-2.5" />
        <span className="absolute -inset-3 rounded-full border border-blue-300/15 sm:-inset-5" />
        <div className="relative h-[36px] w-[76px] overflow-hidden sm:h-[58px] sm:w-[132px]">
          <Image alt="PERSOS Persona Operating System" className="object-contain drop-shadow-[0_0_12px_rgba(186,230,253,0.38)]" fill sizes="132px" src="/brand/persos-horizontal-transparent.png" />
        </div>
      </div>
    </div>
  );
}

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
      {rows.map((row, rowIndex) => (
        <div className="border-b border-white/8 px-4 py-4 last:border-b-0 sm:px-5" key={row.label}>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-4 w-0.5 rounded-full bg-cyan-300/70" />
            <h2 className="text-xs font-semibold text-zinc-100 sm:text-sm">{row.label}</h2>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.06] px-2 py-0.5 text-[10px] font-semibold text-cyan-100">{row.items.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {row.items.map((item) => (
              <div className={`flex min-h-8 items-center justify-center rounded-md border px-2 text-center text-[10px] leading-4 sm:text-[11px] ${rowIndex === 0 ? "border-cyan-200/15 bg-cyan-300/[0.035] text-cyan-50" : "border-white/8 bg-slate-950/35 text-zinc-300"}`} key={item.id}>
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
