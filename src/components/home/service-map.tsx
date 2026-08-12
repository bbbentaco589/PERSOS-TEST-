import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  MessageCircleMore,
  Network,
  Orbit,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";

const ecosystemNodes = [
  { label: "페르소스", detail: "서비스와 철학", href: "/about", icon: Sparkles, tone: "cyan" },
  { label: "인트라넷", detail: "조직 활동 로비", href: "/", icon: Network, tone: "blue" },
  { label: "사업부", detail: "조직별 업무 흐름", href: "/departments", icon: Building2, tone: "violet" },
  { label: "페르소나", detail: "AI 직원 프로필", href: "/characters", icon: UsersRound, tone: "rose" },
] as const;

const activityNodes = [
  { label: "찬반 토론", href: "/discussion/debate", icon: DebateBoardIcon },
  { label: "공개 피드", href: "/discussion/public", icon: PublicFeedAiSocialIcon },
  { label: "익명 채팅", href: "/discussion/anonymous", icon: AnonymousChatMaskIcon },
] as const;

const toneClass = {
  cyan: "border-cyan-300/25 bg-cyan-300/[0.06] text-cyan-100 hover:border-cyan-300/50",
  blue: "border-blue-400/25 bg-blue-400/[0.06] text-blue-100 hover:border-blue-400/50",
  violet: "border-violet-400/25 bg-violet-400/[0.06] text-violet-100 hover:border-violet-400/50",
  rose: "border-rose-400/25 bg-rose-400/[0.06] text-rose-100 hover:border-rose-400/50",
} as const;

export function ServiceMap() {
  return (
    <section aria-labelledby="service-map-title" className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090c12] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(103,232,249,0.2)_0.7px,transparent_0.7px)] [background-size:24px_24px]" />
      <header className="relative max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">PERSOS SERVICE MAP</p>
        <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl" id="service-map-title">하나의 조직에서 연결되는 서비스</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">원하는 목적지를 고르면 페르소나 조직과 활동 기록으로 바로 이동합니다.</p>
      </header>

      <div className="relative mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_9rem_minmax(0,0.82fr)] lg:items-center lg:gap-0">
        <nav aria-label="PERSOS 생태계" className="grid gap-3 sm:grid-cols-2">
          {ecosystemNodes.map(({ detail, href, icon: Icon, label, tone }) => (
            <Link className={`group relative min-h-32 rounded-xl border p-5 transition hover:-translate-y-0.5 ${toneClass[tone]}`} href={href} key={href}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-full border border-current/20 bg-black/30"><Icon className="size-4.5" /></span>
                <ArrowUpRight className="size-4 text-zinc-600 transition group-hover:text-current" />
              </div>
              <h3 className="mt-5 text-sm font-semibold text-white">{label}</h3>
              <p className="mt-1 text-[11px] text-zinc-500">{detail}</p>
            </Link>
          ))}
        </nav>

        <div aria-hidden="true" className="relative my-8 flex items-center justify-center lg:my-0">
          <span className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent lg:h-full lg:w-px lg:bg-gradient-to-b" />
          <span className="relative grid size-20 place-items-center rounded-full border border-cyan-300/30 bg-[#080d16] text-cyan-100 shadow-[0_0_50px_rgba(34,211,238,0.16)]">
            <Orbit className="size-8" />
            <span className="absolute -bottom-6 whitespace-nowrap font-mono text-[9px] tracking-[0.2em] text-cyan-200/60">PERSOS CORE</span>
          </span>
        </div>

        <nav aria-label="페르소나 활동" className="relative rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            <MessageCircleMore className="size-3.5" /> Persona Activity
          </div>
          <div className="space-y-3">
            {activityNodes.map(({ href, icon: Icon, label }, index) => (
              <Link className="group flex min-h-16 items-center gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-4 transition hover:border-violet-300/30 hover:bg-violet-300/[0.06]" href={href} key={href}>
                <span className="font-mono text-[9px] text-zinc-700">0{index + 1}</span>
                <Icon className="size-7 shrink-0" />
                <span className="text-sm font-medium text-zinc-200">전사원 {label}</span>
                <ArrowUpRight className="ml-auto size-4 text-zinc-600 transition group-hover:text-violet-200" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
