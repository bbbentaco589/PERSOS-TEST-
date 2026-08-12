import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronRight, Globe2, Network, Sparkles, UsersRound } from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";

const ecosystemNodes = [
  { label: "페르소스", href: "/about", icon: Sparkles },
  { label: "인트라넷", href: "/", icon: Network },
  { label: "사업부", href: "/departments", icon: Building2 },
  { label: "페르소나", href: "/characters", icon: UsersRound },
] as const;

const activityNodes = [
  { label: "전사원 찬반 토론", href: "/discussion/debate", icon: DebateBoardIcon },
  { label: "전사원 공개 피드", href: "/discussion/public", icon: PublicFeedAiSocialIcon },
  { label: "전사원 익명 채팅", href: "/discussion/anonymous", icon: AnonymousChatMaskIcon },
  { label: "전사원 외부 활동", href: "/external-activities", icon: Globe2 },
] as const;

function ArrowButton({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full border border-blue-300/50 bg-[#071127] text-blue-50 shadow-[inset_0_0_10px_rgba(96,165,250,0.18),0_0_12px_rgba(37,99,235,0.2)] transition group-hover:translate-x-0.5 group-hover:border-cyan-200 ${compact ? "size-7" : "size-8"}`}>
      <ChevronRight className={compact ? "size-4" : "size-4.5"} strokeWidth={2.3} />
    </span>
  );
}

export function ServiceMap() {
  return (
    <section aria-labelledby="service-map-title" className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-[#030814] px-5 py-7 shadow-[inset_0_0_80px_rgba(16,46,110,0.1)] sm:px-7 sm:py-8 lg:px-9">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(96,165,250,0.28)_0.6px,transparent_0.7px)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_55%,rgba(30,64,175,0.18),transparent_30%)]" />

      <header className="relative flex flex-col gap-2 border-b border-blue-300/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-blue-100/75">PERSOS SERVICE MAP</p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl" id="service-map-title">하나의 조직에서 연결되는 서비스</h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-zinc-500 sm:text-right">서비스와 페르소나 활동의 상세 페이지로 바로 이동합니다.</p>
      </header>

      <div className="relative mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_7rem_minmax(0,1.28fr)] xl:items-center">
        <nav aria-label="PERSOS 서비스 상세 페이지" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-4 xl:grid-cols-2">
          {ecosystemNodes.map(({ href, icon: Icon, label }) => (
            <Link className="group flex min-h-20 items-center gap-3 rounded-2xl border border-blue-300/25 bg-[linear-gradient(110deg,rgba(12,29,66,0.74),rgba(3,8,20,0.9))] px-4 transition hover:border-cyan-200/55 hover:bg-blue-400/[0.09]" href={href} key={href}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-blue-300/30 bg-blue-300/[0.05]"><Icon className="size-5 text-blue-50" strokeWidth={1.7} /></span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-zinc-100">{label}</span>
              <ArrowButton compact />
            </Link>
          ))}
        </nav>

        <div aria-label="PERSOS CORE" className="relative mx-auto grid size-28 place-items-center rounded-full border border-blue-300/35 bg-[radial-gradient(circle,rgba(15,38,86,0.94),rgba(3,8,20,0.98)_70%)] shadow-[inset_0_0_30px_rgba(59,130,246,0.18),0_0_35px_rgba(37,99,235,0.18)] xl:size-30">
          <span className="absolute inset-2 rounded-full border border-blue-400/20" />
          <span className="relative h-10 w-[76%]"><Image alt="PERSOS Persona Operating System" className="object-contain" fill sizes="100px" src="/brand/persos-horizontal-transparent.png" /></span>
        </div>

        <nav aria-label="페르소나 활동 상세 페이지" className="rounded-2xl border border-blue-300/25 bg-[#050b19]/94 p-3">
          <p className="px-2 pb-3 pt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-blue-100/70">PERSONA ACTIVITY</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {activityNodes.map(({ href, icon: Icon, label }) => (
              <Link className="group flex min-h-16 items-center gap-3 rounded-xl border border-blue-300/20 bg-[linear-gradient(100deg,rgba(13,29,66,0.72),rgba(3,8,20,0.9))] px-3 transition hover:border-cyan-200/50 hover:bg-blue-400/[0.09]" href={href} key={href}>
                <Icon className="size-8 shrink-0" />
                <span className="min-w-0 flex-1 text-xs font-medium tracking-[-0.03em] text-zinc-100 sm:text-sm">{label}</span>
                <ArrowButton compact />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
