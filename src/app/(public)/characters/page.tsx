import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EmployeeDirectory } from "@/components/employee/employee-directory";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { employees } from "@/data";

const heroPersonaOrder = [
  "tect",
  "sig",
  "lo-pay-park",
  "lumi",
  "pixeur",
  "ottucksoon",
] as const;

const heroCardPositions: Record<string, string> = {
  tect: "left-[2%] top-[25%] -rotate-[7deg]",
  sig: "left-[27%] top-[17%] -rotate-[1deg]",
  "lo-pay-park": "left-[51%] top-[2%] rotate-[6deg]",
  lumi: "right-[1%] top-[21%] rotate-[8deg]",
  pixeur: "bottom-[1%] left-[14%] -rotate-[8deg]",
  ottucksoon: "bottom-[-1%] right-[24%] rotate-[2deg]",
};

function PersonaCardCloud() {
  const heroPersonas = heroPersonaOrder
    .map((slug) => employees.find((employee) => employee.slug === slug))
    .filter((employee): employee is (typeof employees)[number] => Boolean(employee));

  return (
    <div
      aria-label="PERSOS에서 활동 중인 여섯 AI 페르소나"
      className="relative mx-auto h-[260px] w-full max-w-[590px]"
      role="img"
    >
      <div className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.24),rgba(14,116,144,0.08)_38%,transparent_70%)] blur-xl" />
      <div className="absolute left-1/2 top-1/2 size-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10 shadow-[inset_0_0_44px_rgba(37,99,235,0.08)]" />
      <div className="absolute left-1/2 top-1/2 size-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-200/10" />

      {heroPersonas.map((persona) => (
        <Link
          className={`group absolute z-10 w-[25%] max-w-[128px] overflow-hidden rounded-lg border bg-[#050a14]/95 shadow-[0_14px_32px_rgba(0,0,0,0.48)] transition duration-300 hover:z-30 hover:-translate-y-1 hover:scale-[1.04] motion-reduce:transform-none ${heroCardPositions[persona.slug]}`}
          href={`/characters/${persona.slug}`}
          key={persona.id}
          style={{
            borderColor: `${persona.brandColor}80`,
            boxShadow: `0 14px 32px rgba(0,0,0,.48), 0 0 18px ${persona.brandColor}12`,
          }}
        >
          <div className="flex items-center justify-between gap-1 border-b border-white/8 px-2 py-1.5">
            <span className="truncate font-mono text-[5px] tracking-[0.12em] text-zinc-500">PERSOS AI COMPANY</span>
            <span className="shrink-0 rounded border border-emerald-300/25 bg-emerald-300/10 px-1 py-0.5 text-[5px] font-semibold text-emerald-200">업무 중</span>
          </div>
          <div className="relative aspect-[1.18/1] overflow-hidden bg-black">
            <Image
              alt={`${persona.nameKo} 프로필`}
              className="object-cover object-top transition duration-300 group-hover:scale-[1.03]"
              fill
              sizes="128px"
              src={persona.profileImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
          <div className="px-2 pb-2 pt-1.5">
            <strong className="block truncate text-[8px] font-semibold text-white sm:text-[9px]">
              {persona.nameKo}({persona.nameEn})
            </strong>
            <span className="mt-1 block truncate text-[5.5px] text-cyan-100/65 sm:text-[6px]">
              {persona.jobTitleKo}
            </span>
          </div>
        </Link>
      ))}

      <span className="absolute bottom-1 left-1/2 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
      <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
    </div>
  );
}

function PersonasHero() {
  return (
    <section
      aria-labelledby="personas-hero-title"
      className="relative overflow-hidden border border-white/8 bg-[radial-gradient(circle_at_82%_46%,rgba(14,116,144,0.24),transparent_31%),radial-gradient(circle_at_70%_15%,rgba(30,64,175,0.13),transparent_36%),linear-gradient(112deg,#020711_0%,#061225_57%,#020812_100%)] px-4 py-5 shadow-[inset_0_0_70px_rgba(2,132,199,0.05)] sm:px-6 sm:py-6"
    >
      <div className="relative grid items-center gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(430px,0.8fr)] lg:gap-0">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200">
            PERSONAS INFO
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400">
            PERSONA OPERATING SYSTEM
          </p>
          <h1
            className="mt-6 text-3xl font-semibold leading-[1.2] tracking-[-0.045em] text-white sm:text-4xl lg:text-[1.85rem] xl:text-[2rem]"
            id="personas-hero-title"
          >
            <span className="block">페르소스의 페르소나는</span>
            <span className="mt-1 block lg:whitespace-nowrap">
              역할을 넘어 <span className="text-cyan-200">하나의 존재</span>로
              <br className="sm:hidden" /> 설계됩니다.
            </span>
          </h1>
          <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
            <span className="block">각자의 정체성, 기억, 성격과 전문성을 바탕으로</span>
            <span className="block lg:whitespace-nowrap">
              조직 안에서 관계를 맺고 활동하는<br className="sm:hidden" /> AI 페르소나들을 만나보세요.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="w-[9.75rem] justify-center">
              <Link href="/contact">CONTACT US <ArrowRight /></Link>
            </Button>
            <Button asChild className="w-[9.75rem] justify-center">
              <Link href="/intranet">INTRANET INFO <ArrowRight /></Link>
            </Button>
          </div>
        </div>
        <PersonaCardCloud />
      </div>
    </section>
  );
}

export default function CharactersPage() {
  return (
    <PageContainer className="space-y-7">
      <PersonasHero />
      <EmployeeDirectory />
    </PageContainer>
  );
}

export const metadata: Metadata = {
  title: "페르소나",
  description: "PERSOS의 20명 AI Employee 프로필과 소속, 직무, 전문 분야를 탐색합니다.",
};
