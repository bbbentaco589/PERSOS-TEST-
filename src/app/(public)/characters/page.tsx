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
      className="relative mx-auto h-[230px] w-full max-w-[590px] sm:h-[260px]"
      role="img"
    >
      {heroPersonas.map((persona) => (
        <article
          className={`absolute z-10 w-[25%] max-w-[128px] overflow-hidden rounded-lg border bg-[#050a14]/95 shadow-[0_14px_32px_rgba(0,0,0,0.48)] ${heroCardPositions[persona.slug]}`}
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
              className="object-cover object-top"
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
        </article>
      ))}
    </div>
  );
}

function PersonasHero() {
  return (
    <section
      aria-labelledby="personas-hero-title"
      className="relative min-h-[308px] overflow-hidden border border-white/8 bg-[radial-gradient(circle_at_82%_46%,rgba(14,116,144,0.24),transparent_31%),radial-gradient(circle_at_70%_15%,rgba(30,64,175,0.13),transparent_36%),linear-gradient(112deg,#020711_0%,#061225_57%,#020812_100%)] px-4 py-5 shadow-[inset_0_0_70px_rgba(2,132,199,0.05)] sm:px-6 sm:py-6 lg:h-[356px]"
    >
      <div className="relative grid items-center gap-4 lg:h-full lg:grid-cols-[minmax(0,1.1fr)_minmax(410px,0.9fr)] lg:gap-0">
        <div className="min-w-0 lg:flex lg:h-full lg:flex-col lg:self-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200">
            PERSONAS INFO
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400">
            PERSONA OPERATING SYSTEM
          </p>
          <h1
            className="mt-5 break-keep text-[1.75rem] font-semibold leading-[1.22] tracking-[-0.045em] text-white sm:mt-6 sm:text-4xl lg:text-[2rem] xl:text-[2.15rem]"
            id="personas-hero-title"
          >
            <span className="block">페르소스의 페르소나는</span>
            <span className="mt-1 block sm:hidden">역할을 넘어</span>
            <span className="block sm:hidden">
              <span className="text-cyan-200">하나의 존재</span>로 설계됩니다.
            </span>
            <span className="mt-1 hidden sm:block">
              역할을 넘어 <span className="text-cyan-200">하나의 존재</span>로 설계됩니다.
            </span>
          </h1>
          <p className="mt-5 break-keep text-sm leading-7 text-zinc-300 sm:text-base">
            <span className="block">각자의 정체성, 기억, 성격과 전문성을 바탕으로</span>
            <span className="block lg:whitespace-nowrap">
              조직 안에서 관계를 맺고 활동하는 AI 페르소나들을 만나보세요.
            </span>
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3 lg:mt-auto">
            <Button asChild className="w-full justify-center sm:w-[11rem]">
              <Link href="/home">PERSOS LOBBY <ArrowRight /></Link>
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
  description: "PERSOS AI Employee의 프로필과 소속, 직무, 전문 분야를 탐색합니다.",
};
