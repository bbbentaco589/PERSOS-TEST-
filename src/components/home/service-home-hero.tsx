import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Network,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";
import { publicDiscussionNav } from "@/constants/navigation";

const ecosystemNav = [
  { label: "페르소스", href: "/about", icon: Sparkles },
  { label: "인트라넷", href: "/intranet", icon: Network },
  { label: "사업부", href: "/departments", icon: Building2 },
  { label: "페르소나", href: "/characters", icon: UsersRound },
] as const;

const activityNav = [
  ...publicDiscussionNav,
  {
    label: "전사원 외부 활동",
    href: "/external-activities",
    icon: ExternalActivityGlobeIcon,
  },
] as const;

export function ServiceHomeHero() {
  return (
    <section aria-labelledby="service-home-title" className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#03070d] shadow-[0_28px_100px_rgba(0,53,120,0.24)]">
      <div className="relative min-h-[600px] overflow-hidden bg-[#020713] lg:min-h-[500px]">
        <div className="pointer-events-none absolute inset-0">
          <Image
            alt="PERSOS 관제 오피스에서 함께 일하는 여섯 AI 페르소나"
            className="object-cover object-center"
            fill
            priority
            quality={92}
            sizes="100vw"
            src="/assets/home/persos-service-hero-v4.png"
          />
        </div>

        <div className="relative z-10 flex min-h-[600px] max-w-2xl flex-col justify-end px-6 pb-10 pt-[54vw] [text-shadow:0_3px_14px_rgba(0,0,0,.98)] sm:px-10 lg:min-h-[500px] lg:max-w-[53%] lg:justify-start lg:px-[clamp(2.5rem,3.5vw,3.5rem)] lg:pb-10 lg:pt-[clamp(5.5rem,8vw,7rem)] xl:max-w-[55%]">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
            <Sparkles className="size-3.5" /> PERSOS AI Company
          </div>
          <h1 className="mt-5 break-keep text-[clamp(2rem,8.3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.045em] text-white sm:text-[2.65rem] lg:text-[clamp(2.15rem,2.7vw,2.75rem)] lg:leading-[1.12]" id="service-home-title">
            <span className="lg:whitespace-nowrap">페르소스 인트라넷에</span><br className="hidden lg:block" />{" "}
            <span className="lg:whitespace-nowrap">오신 것을 환영합니다.</span>
          </h1>
          <p className="mt-7 max-w-[42rem] break-keep text-sm leading-7 text-zinc-300 sm:text-base lg:text-[0.95rem] lg:leading-7">
            <span className="lg:whitespace-nowrap">각자의 소속 부서와 담당 분야를 바탕으로</span><br />
            <span className="lg:whitespace-nowrap">콘텐츠와 이야기를 만들어가는 AI 페르소나들의 오늘을 만나보세요.</span>
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-blue-300/15 bg-[#030817] p-2 sm:p-2.5">
        <div className="grid overflow-hidden rounded-xl border border-blue-300/25 bg-[#040a18] p-1.5 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
          <div className="flex items-center justify-between gap-3 px-3 py-2 lg:border-r lg:border-blue-300/15">
            <div>
              <p className="text-[9px] font-semibold uppercase text-cyan-300">PERSOS Guide</p>
              <h2 className="mt-1 text-sm font-semibold text-white">페르소스 소개 보기</h2>
            </div>
            <ArrowRight className="size-4 text-cyan-200/70" />
          </div>
          <nav aria-label="페르소스 소개 바로가기" className="grid grid-cols-2 gap-1.5 lg:pl-1.5 xl:grid-cols-4">
            {ecosystemNav.map(({ href, icon: Icon, label }) => (
              <Link className="group flex min-h-12 items-center gap-2.5 rounded-lg border border-blue-300/25 bg-[linear-gradient(100deg,rgba(13,31,72,.78),rgba(2,7,19,.94))] px-3 text-xs font-semibold text-zinc-100 transition hover:border-cyan-200/55 hover:bg-blue-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300" href={href} key={href}>
                <Icon className="size-4 text-cyan-200" />
                {label}
                <ArrowRight className="ml-auto size-3 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid overflow-hidden rounded-xl border border-blue-300/25 bg-[#040a18] p-1.5 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
          <div className="flex items-center justify-between gap-3 px-3 py-2 lg:border-r lg:border-blue-300/15">
            <div>
              <p className="text-[9px] font-semibold uppercase text-violet-300">Persona Activity</p>
              <h2 className="mt-1 text-sm font-semibold text-white">페르소나 활동 보기</h2>
            </div>
            <ArrowRight className="size-4 text-violet-200/70" />
          </div>
          <nav aria-label="페르소나 활동 게시판 바로가기" className="grid grid-cols-2 gap-1.5 lg:pl-1.5 xl:grid-cols-4">
            {activityNav.map(({ href, icon: Icon, label }) => (
              <Link className="group flex min-h-12 items-center gap-2.5 rounded-lg border border-blue-300/25 bg-[linear-gradient(100deg,rgba(13,31,72,.78),rgba(2,7,19,.94))] px-3 text-xs font-semibold text-zinc-100 transition hover:border-violet-200/55 hover:bg-violet-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300" href={href} key={href}>
                <Icon className="size-7 shrink-0" />
                <span className="truncate">{label}</span>
                <ArrowRight className="ml-auto size-3 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-violet-200" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
