import type { Metadata } from "next";

import { DivisionIcon } from "@/components/brand/division-icon";
import { PersosLogoLockup } from "@/components/brand/persos-logo-lockup";
import { PageContainer } from "@/components/layout/page-container";
import { DivisionStructureCard } from "@/components/organization/division-structure-card";
import { publicDivisionOrder } from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";

const departmentHeroPositions: Record<string, string> = {
  "division-governance": "left-1/2 top-[5%] -translate-x-1/2",
  "division-strategy": "left-[8%] top-[20%]",
  "division-entertainment": "right-[7%] top-[20%]",
  "division-editorial": "bottom-[17%] left-[7%]",
  "division-studio": "bottom-[4%] left-1/2 -translate-x-1/2",
  "division-intelligence": "bottom-[17%] right-[7%]",
};

function DepartmentsHeroVisual() {
  const heroDivisions = publicDivisionOrder
    .map((divisionId) => divisions.find((division) => division.id === divisionId))
    .filter((division): division is (typeof divisions)[number] => division !== undefined);

  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[680px]" role="img" aria-label="중앙 로비를 중심으로 실제 6개 사업부 공간이 연결된 PERSOS 청사진">
      <div className="absolute inset-[2%] bg-[radial-gradient(circle_at_52%_48%,rgba(37,99,235,0.26),rgba(14,116,144,0.08)_38%,transparent_72%)] blur-xl" />
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 760 320">
        <defs>
          <filter id="departments-blueprint-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="departments-blueprint-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#60a5fa" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#e0f2fe" stopOpacity="0.86" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="departments-blueprint-hub">
            <stop offset="0" stopColor="#0b2448" stopOpacity="0.56" />
            <stop offset="0.68" stopColor="#061127" stopOpacity="0.88" />
            <stop offset="1" stopColor="#020817" stopOpacity="0.98" />
          </radialGradient>
        </defs>
        <g fill="rgba(4,16,38,0.2)" stroke="#93c5fd" strokeOpacity="0.34" strokeWidth="1">
          <path d="M30 58h218l20 18v49l-23 22H30z M38 66h204l17 15v39l-18 18H38z" />
          <path d="M279 12h202l17 17v101l-18 18H280l-18-18V29z M288 21h184l17 14v89l-14 15H285l-14-15V35z" />
          <path d="M512 58h218v89H515l-23-22V76z M521 66h201v72H519l-18-18V81z" />
          <path d="M30 173h215l23 22v49l-20 18H30z M38 182h203l18 18v39l-17 14H38z" />
          <path d="M280 173h200l18 18v100l-17 17H279l-17-17V191z M285 182h190l14 15v88l-17 14H288l-17-14v-88z" />
          <path d="M515 173h215v89H512l-20-18v-49z M519 182h203v71H521l-20-14v-39z" />
        </g>
        <g fill="none" stroke="#93c5fd" strokeOpacity="0.14" strokeWidth="0.8">
          <path d="M52 80h82v42H52z M142 80h96v42h-96z M294 43h72v71h-72z M374 43h91v71h-91z M527 80h82v42h-82z M617 80h87v42h-87z" />
          <path d="M52 198h82v39H52z M142 198h96v39h-96z M294 207h72v66h-72z M374 207h91v66h-91z M527 198h82v39h-82z M617 198h87v39h-87z" />
          <path d="M75 91h36m-18-11v42 M171 91h38m-19-11v42 M316 62h29m-14-19v71 M399 62h36m-18-19v71 M551 91h35m-17-11v42 M642 91h37m-18-11v42" strokeDasharray="3 4" />
          <path d="M75 209h36m-18-11v39 M171 209h38m-19-11v39 M316 225h29m-14-18v66 M399 225h36m-18-18v66 M551 209h35m-17-11v39 M642 209h37m-18-11v39" strokeDasharray="3 4" />
          <path d="M13 160h734 M380 0v320" strokeDasharray="2 8" strokeOpacity="0.35" />
        </g>
        <g fill="url(#departments-blueprint-hub)" stroke="url(#departments-blueprint-line)">
          <circle cx="380" cy="160" r="65" strokeOpacity="0.3" />
          <circle cx="380" cy="160" r="57" strokeOpacity="0.78" strokeWidth="1.4" />
          <circle cx="380" cy="160" r="48" strokeOpacity="0.22" />
        </g>
        <g fill="none" filter="url(#departments-blueprint-glow)" stroke="url(#departments-blueprint-line)" strokeWidth="1.5">
          <path d="M268 103h26l33 28" /><path d="M380 130V112" /><path d="M492 103h-26l-33 28" />
          <path d="M268 217h26l33-28" /><path d="M380 190v18" /><path d="M492 217h-26l-33-28" />
        </g>
        <g fill="#e0f2fe" filter="url(#departments-blueprint-glow)">
          <circle cx="268" cy="103" r="3.2" /><circle cx="327" cy="131" r="3.2" />
          <circle cx="380" cy="112" r="3.2" /><circle cx="380" cy="130" r="3.2" />
          <circle cx="492" cy="103" r="3.2" /><circle cx="433" cy="131" r="3.2" />
          <circle cx="268" cy="217" r="3.2" /><circle cx="327" cy="189" r="3.2" />
          <circle cx="380" cy="208" r="3.2" /><circle cx="380" cy="190" r="3.2" />
          <circle cx="492" cy="217" r="3.2" /><circle cx="433" cy="189" r="3.2" />
        </g>
      </svg>

      {heroDivisions.map((division) => (
        <div className={`absolute z-30 flex h-[54px] w-[130px] items-center justify-center gap-2 px-2 text-left sm:w-[170px] ${departmentHeroPositions[division.id]}`} key={division.id}>
          <DivisionIcon className="size-8 shrink-0 sm:size-9" divisionId={division.id} />
          <div className="min-w-0">
            <strong className="block whitespace-nowrap text-[8px] font-semibold text-white sm:text-[9.5px]">{division.nameKo}</strong>
            <span className="mt-1 block max-w-[102px] text-[6px] font-semibold uppercase leading-[1.35] tracking-[0.1em] text-blue-100/65 sm:text-[6.5px]">
              {division.slug.replaceAll("-", " ")}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 grid size-[82px] -translate-x-1/2 -translate-y-1/2 place-items-center sm:size-[102px]">
        <PersosLogoLockup
          className="drop-shadow-[0_0_12px_rgba(186,230,253,0.42)]"
          iconClassName="h-10 w-8 sm:h-11 sm:w-9"
          wordmarkClassName="text-[1.35rem] sm:text-[1.55rem]"
        />
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
