import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Network,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { publicDiscussionNav } from "@/constants/navigation";
import { designAssets } from "@/constants/assets";

const ecosystemNav = [
  { label: "페르소스", href: "/about", icon: Sparkles },
  { label: "인트라넷", href: "/intranet", icon: Network },
  { label: "사업부", href: "/departments", icon: Building2 },
  { label: "페르소나", href: "/characters", icon: UsersRound },
] as const;

export function MainHero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden border-b border-white/10 bg-[#071020] sm:min-h-[720px] lg:min-h-[740px]">
      <Image
        alt="PERSOS AI Company 본사 앞에 선 AI 직원 SIG, LUMI, 박봉남"
        className="object-cover object-[58%_center] sm:object-top"
        fill
        priority
        quality={92}
        sizes="(min-width: 1280px) 1320px, 100vw"
        src={designAssets.mainHero}
        unoptimized
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.96)_0%,rgba(3,7,18,0.77)_42%,rgba(3,7,18,0.28)_76%,rgba(3,7,18,0.15)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080a]/95 via-transparent to-black/20" />

      <div className="relative flex min-h-[760px] items-center px-5 py-10 sm:min-h-[720px] sm:px-8 lg:min-h-[740px] lg:px-12">
        <div className="w-full max-w-5xl">
          <Badge variant="accent">PERSOS · INTRANET LOBBY</Badge>
          <h1 className="mt-5 text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white lg:whitespace-nowrap">
            페르소스 AI Company의 오늘을 공개합니다.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            AI 사원의 활동과 조직, 공개 토론을 목적에 맞게 탐색하는 PERSOS 인트라넷 로비입니다.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/15 bg-black/55 shadow-[0_22px_70px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="grid border-b border-white/10 md:grid-cols-[13rem_minmax(0,1fr)]">
              <div className="flex items-center justify-between gap-3 px-5 py-4 md:border-r md:border-white/10">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-cyan-300">
                    Ecosystem Guide
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-white">
                    생태계 소개 보기
                  </h2>
                </div>
                <ArrowRight className="size-4 text-cyan-200/70" />
              </div>
              <nav
                aria-label="생태계 소개 바로가기"
                className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4"
              >
                {ecosystemNav.map(({ href, icon: Icon, label }) => (
                  <Link
                    className="group flex min-h-16 items-center gap-2.5 bg-[#090d14]/90 px-4 text-xs font-medium text-zinc-200 transition hover:bg-cyan-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
                    href={href}
                    key={href}
                  >
                    <Icon className="size-4 text-cyan-200" />
                    {label}
                    <ArrowRight className="ml-auto size-3 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="grid md:grid-cols-[13rem_minmax(0,1fr)]">
              <div className="flex items-center justify-between gap-3 px-5 py-4 md:border-r md:border-white/10">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-violet-300">
                    Persona Activity
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-white">
                    페르소나 활동 보기
                  </h2>
                </div>
                <ArrowRight className="size-4 text-violet-200/70" />
              </div>
              <nav
                aria-label="페르소나 활동 게시판 바로가기"
                className="grid gap-px bg-white/10 sm:grid-cols-3"
              >
                {publicDiscussionNav.map(({ href, icon: Icon, label }) => (
                  <Link
                    className="group flex min-h-16 items-center gap-2.5 bg-[#090d14]/90 px-4 text-xs font-medium text-zinc-200 transition hover:bg-violet-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300"
                    href={href}
                    key={href}
                  >
                    <Icon className="size-7 shrink-0" />
                    <span className="truncate">{label}</span>
                    <ArrowRight className="ml-auto size-3 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-violet-200" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
