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
  "division-governance": "left-1/2 top-[3%] -translate-x-1/2",
  "division-strategy": "left-[2.5%] top-[16%]",
  "division-entertainment": "right-[2.5%] top-[16%]",
  "division-editorial": "bottom-[12%] left-[2.5%]",
  "division-studio": "bottom-[2%] left-1/2 -translate-x-1/2",
  "division-intelligence": "bottom-[12%] right-[2.5%]",
};

function DepartmentsHeroVisual() {
  const heroDivisions = publicDivisionOrder
    .map((divisionId) => divisions.find((division) => division.id === divisionId))
    .filter((division): division is (typeof divisions)[number] => division !== undefined);

  return (
    <div className="relative mx-auto h-[268px] w-full max-w-[760px] sm:h-[292px]" role="img" aria-label="중앙 로비와 복도를 중심으로 실제 6개 사업부가 입주한 PERSOS 사무실 평면도">
      <div className="absolute inset-[1%] bg-[radial-gradient(circle_at_52%_50%,rgba(37,99,235,0.3),rgba(14,116,144,0.1)_40%,transparent_76%)] blur-xl" />
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 780 360">
        <defs>
          <pattern id="departments-blueprint-grid" height="18" patternUnits="userSpaceOnUse" width="18">
            <path d="M18 0H0V18" fill="none" stroke="#93c5fd" strokeOpacity="0.095" strokeWidth="0.7" />
          </pattern>
          <filter id="departments-blueprint-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="departments-blueprint-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#60a5fa" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#e0f2fe" stopOpacity="0.86" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect fill="url(#departments-blueprint-grid)" height="344" rx="8" width="756" x="12" y="8" />
        <g fill="rgba(3,14,34,0.34)" stroke="#bfdbfe" strokeOpacity="0.46" strokeWidth="1.25">
          <path d="M18 38h226V20h292v18h226v126H540v32h222v126H536v20H244v-20H18V196h222v-32H18z" />
          <path d="M27 47h226V29h274v18h226v108H531v50h222v108H527v20H253v-20H27V205h222v-50H27z" strokeOpacity="0.22" />
        </g>
        <g fill="rgba(8,30,61,0.2)" stroke="#93c5fd" strokeOpacity="0.62" strokeWidth="1.2">
          <rect height="100" rx="2" width="214" x="30" y="52" />
          <rect height="118" rx="2" width="268" x="256" y="32" />
          <rect height="100" rx="2" width="214" x="536" y="52" />
          <rect height="100" rx="2" width="214" x="30" y="208" />
          <rect height="118" rx="2" width="268" x="256" y="210" />
          <rect height="100" rx="2" width="214" x="536" y="208" />
        </g>
        <g fill="none" stroke="#bae6fd" strokeOpacity="0.24" strokeWidth="0.85">
          <path d="M44 66h54v28H44zM108 66h56v28h-56zM174 66h56v28h-56zM280 49h58v30h-58zM348 49h58v30h-58zM416 49h82v30h-82zM550 66h54v28h-54zM614 66h56v28h-56zM680 66h56v28h-56z" />
          <path d="M44 266h54v28H44zM108 266h56v28h-56zM174 266h56v28h-56zM280 278h58v30h-58zM348 278h58v30h-58zM416 278h82v30h-82zM550 266h54v28h-54zM614 266h56v28h-56zM680 266h56v28h-56z" />
          <path d="M56 101h38v24H56zM116 101h38v24h-38zM176 101h38v24h-38zM292 91h44v26h-44zM358 91h44v26h-44zM424 91h62v26h-62zM562 101h38v24h-38zM622 101h38v24h-38zM682 101h38v24h-38z" />
          <path d="M56 235h38v24H56zM116 235h38v24h-38zM176 235h38v24h-38zM292 241h44v26h-44zM358 241h44v26h-44zM424 241h62v26h-62zM562 235h38v24h-38zM622 235h38v24h-38zM682 235h38v24h-38z" />
          <path d="M71 66v-9h18v9M135 66v-9h18v9M201 66v-9h18v9M305 49v-9h18v9M373 49v-9h18v9M451 49v-9h18v9M577 66v-9h18v9M641 66v-9h18v9M707 66v-9h18v9" />
          <path d="M71 294v9h18v-9M135 294v9h18v-9M201 294v9h18v-9M305 308v9h18v-9M373 308v9h18v-9M451 308v9h18v-9M577 294v9h18v-9M641 294v9h18v-9M707 294v9h18v-9" />
        </g>
        <g fill="none" stroke="#dbeafe" strokeOpacity="0.38" strokeWidth="1">
          <path d="M244 122h18v30M518 122h18v30M244 238h18v-30M518 238h18v-30" />
          <path d="M322 150v15h-26M458 150v15h26M322 210v-15h-26M458 210v-15h26" />
          <path d="M244 122a22 22 0 0 1-22 22M536 122a22 22 0 0 0 22 22M244 238a22 22 0 0 0-22-22M536 238a22 22 0 0 1 22-22" />
        </g>
        <g fill="rgba(7,27,56,0.62)" stroke="#7dd3fc" strokeOpacity="0.5">
          <path d="M248 151h72v58h-72zM460 151h72v58h-72z" />
          <circle cx="390" cy="180" r="61" />
          <circle cx="390" cy="180" r="52" strokeOpacity="0.78" strokeWidth="1.4" />
          <circle cx="390" cy="180" r="43" strokeOpacity="0.24" />
        </g>
        <g fill="none" stroke="#93c5fd" strokeOpacity="0.23" strokeWidth="0.8">
          <path d="M266 161h38v38h-38zM476 161h38v38h-38zM367 159h46v42h-46z" strokeDasharray="3 3" />
          <path d="M12 180h18m720 0h18M390 8v20m0 304v20" strokeDasharray="2 5" />
          <path d="M31 333h118m482 0h118M31 329v8m118-8v8m482-8v8m118-8v8" />
        </g>
        <g fill="none" filter="url(#departments-blueprint-glow)" stroke="url(#departments-blueprint-line)" strokeWidth="1.5">
          <path d="M244 142h42l52 9" /><path d="M390 150v-22" /><path d="M536 142h-42l-52 9" />
          <path d="M244 218h42l52-9" /><path d="M390 210v22" /><path d="M536 218h-42l-52-9" />
        </g>
        <g fill="#e0f2fe" filter="url(#departments-blueprint-glow)">
          <circle cx="244" cy="142" r="3" /><circle cx="338" cy="151" r="3" />
          <circle cx="390" cy="128" r="3" /><circle cx="390" cy="150" r="3" />
          <circle cx="536" cy="142" r="3" /><circle cx="442" cy="151" r="3" />
          <circle cx="244" cy="218" r="3" /><circle cx="338" cy="209" r="3" />
          <circle cx="390" cy="232" r="3" /><circle cx="390" cy="210" r="3" />
          <circle cx="536" cy="218" r="3" /><circle cx="442" cy="209" r="3" />
        </g>
        <g fill="#bae6fd" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="600" letterSpacing="1.8" opacity="0.46">
          <text x="31" y="347">PERSOS OFFICE PLAN</text>
          <text textAnchor="end" x="749" y="347">LEVEL 01 · 6 DIVISIONS</text>
        </g>
      </svg>

      {heroDivisions.map((division, index) => (
        <div className={`absolute z-30 flex h-[64px] w-[138px] items-center justify-center gap-2 px-2 text-left sm:w-[178px] ${departmentHeroPositions[division.id]}`} key={division.id}>
          <DivisionIcon className="size-9 shrink-0 sm:size-11" divisionId={division.id} />
          <div className="min-w-0">
            <span className="mb-1 block text-[6px] font-semibold uppercase tracking-[0.2em] text-cyan-200/60 sm:text-[7px]">ROOM {String(index + 1).padStart(2, "0")}</span>
            <strong className="block whitespace-nowrap text-[9px] font-semibold text-white sm:text-[11px]">{division.nameKo}</strong>
            <span className="mt-1 block max-w-[112px] text-[5.5px] font-semibold uppercase leading-[1.25] tracking-[0.08em] text-blue-100/60 sm:text-[6.5px]">
              {division.slug.replaceAll("-", " ")}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 grid size-[76px] -translate-x-1/2 -translate-y-1/2 place-items-center sm:size-[92px]">
        <PersosLogoLockup
          className="drop-shadow-[0_0_12px_rgba(186,230,253,0.42)]"
          iconClassName="h-8 w-7 sm:h-9 sm:w-8"
          wordmarkClassName="text-[1.15rem] sm:text-[1.35rem]"
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
    <section aria-labelledby="departments-hero-title" className="relative min-h-[308px] overflow-hidden border border-white/8 bg-[radial-gradient(circle_at_78%_48%,rgba(14,116,144,0.24),transparent_32%),radial-gradient(circle_at_68%_16%,rgba(30,64,175,0.14),transparent_36%),linear-gradient(112deg,#020711_0%,#061225_57%,#020812_100%)] px-4 py-5 shadow-[inset_0_0_70px_rgba(2,132,199,0.05)] sm:px-6 sm:py-6 lg:h-[356px]">
      <div className="relative grid items-center gap-4 lg:h-full lg:grid-cols-[minmax(0,0.72fr)_minmax(560px,1.28fr)] lg:gap-0">
        <div className="min-w-0 lg:self-start">
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
