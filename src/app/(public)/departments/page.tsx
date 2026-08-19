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

const departmentHeroPositions: Record<string, string> = {
  "division-governance": "left-[4%] top-[18%]",
  "division-strategy": "left-1/2 top-[7%] -translate-x-1/2",
  "division-entertainment": "right-[4%] top-[18%]",
  "division-editorial": "bottom-[18%] left-[4%]",
  "division-studio": "bottom-[7%] left-1/2 -translate-x-1/2",
  "division-intelligence": "bottom-[18%] right-[4%]",
};

function DepartmentsHeroVisual() {
  const heroDivisions = publicDivisionOrder
    .map((divisionId) => divisions.find((division) => division.id === divisionId))
    .filter((division): division is (typeof divisions)[number] => division !== undefined);

  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[680px]" role="img" aria-label="PERSOS를 중심으로 연결된 실제 6개 사업부 청사진">
      <div className="absolute inset-[8%] bg-[radial-gradient(circle,rgba(37,99,235,0.2),rgba(14,116,144,0.07)_38%,transparent_72%)] blur-xl" />
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 720 300">
        <defs>
          <filter id="departments-blueprint-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="departments-blueprint-line" x1="0" x2="1">
            <stop offset="0" stopColor="#60a5fa" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="1" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="#93c5fd" strokeOpacity="0.28" strokeWidth="1">
          <path d="M10 36h198l17 15v62l-17 15H10z M18 44h184l14 12v52l-14 12H18z" />
          <path d="M258 10h204l15 15v88l-15 15H258l-15-15V25z M267 18h186l15 13v76l-15 13H267l-15-13V31z" />
          <path d="M512 36h198v92H512l-17-15V51z M518 44h184v76H518l-14-12V56z" />
          <path d="M10 172h198l17 15v62l-17 15H10z M18 180h184l14 12v52l-14 12H18z" />
          <path d="M258 172h204l15 15v88l-15 15H258l-15-15v-88z M267 180h186l15 13v76l-15 13H267l-15-13v-76z" />
          <path d="M512 172h198v92H512l-17-15v-62z M518 180h184v76H518l-14-12v-52z" />
          <path d="M225 68h28 M467 68h28 M225 232h28 M467 232h28 M360 128v-16 M360 188v-16" />
          <path d="M68 128v16h137 M652 128v16H515 M68 172v-16h137 M652 172v-16H515" strokeDasharray="4 5" strokeOpacity="0.16" />
        </g>
        <g fill="none" filter="url(#departments-blueprint-glow)" stroke="url(#departments-blueprint-line)" strokeWidth="1.5">
          <path d="M225 82L304 128" /><path d="M360 128V112" /><path d="M495 82L416 128" />
          <path d="M225 218L304 172" /><path d="M360 172V188" /><path d="M495 218L416 172" />
        </g>
        <g fill="#e0f2fe" filter="url(#departments-blueprint-glow)">
          <circle cx="225" cy="82" r="3" /><circle cx="304" cy="128" r="3" />
          <circle cx="360" cy="112" r="3" /><circle cx="360" cy="128" r="3" />
          <circle cx="495" cy="82" r="3" /><circle cx="416" cy="128" r="3" />
          <circle cx="225" cy="218" r="3" /><circle cx="304" cy="172" r="3" />
          <circle cx="360" cy="188" r="3" /><circle cx="360" cy="172" r="3" />
          <circle cx="495" cy="218" r="3" /><circle cx="416" cy="172" r="3" />
        </g>
      </svg>

      {heroDivisions.map((division) => (
        <div className={`absolute z-30 flex h-[58px] w-[132px] items-center justify-center gap-2 px-2 text-left sm:w-[176px] ${departmentHeroPositions[division.id]}`} key={division.id}>
          <DivisionIcon className="size-8 shrink-0 sm:size-10" divisionId={division.id} />
          <div className="min-w-0">
            <strong className="block whitespace-nowrap text-[8px] font-semibold text-white sm:text-[10px]">{division.nameKo}</strong>
            <span className="mt-1 block max-w-[102px] text-[6px] font-semibold uppercase leading-[1.35] tracking-[0.1em] text-blue-100/60 sm:text-[6.5px]">
              {division.slug.replaceAll("-", " ")}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 grid size-[94px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-50/80 bg-[radial-gradient(circle,rgba(23,51,112,0.26),rgba(3,10,27,0.99)_72%)] shadow-[inset_0_0_30px_rgba(34,211,238,0.12),0_0_20px_rgba(224,242,254,0.36),0_0_42px_rgba(37,99,235,0.28)] sm:size-[112px]">
        <span className="absolute -inset-2 rounded-full border border-cyan-300/35" />
        <span className="absolute -inset-4 rounded-full border border-blue-300/12" />
        <div className="relative h-10 w-[78px] overflow-hidden sm:h-12 sm:w-[94px]">
          <Image alt="PERSOS Persona Operating System" className="object-contain drop-shadow-[0_0_12px_rgba(186,230,253,0.38)]" fill sizes="94px" src="/assets/about/persos-logo-washed.png" />
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
