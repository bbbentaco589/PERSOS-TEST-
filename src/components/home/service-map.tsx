import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronRight, Network, Sparkles, UsersRound } from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";
import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";

const ecosystemNodes = [
  { label: "페르소스", href: "/about", icon: Sparkles, position: "lg:col-start-1 lg:row-start-1" },
  { label: "인트라넷", href: "/", icon: Network, position: "lg:col-start-3 lg:row-start-1" },
  { label: "사업부", href: "/departments", icon: Building2, position: "lg:col-start-1 lg:row-start-3" },
  { label: "페르소나", href: "/characters", icon: UsersRound, position: "lg:col-start-3 lg:row-start-3" },
] as const;

const activityNodes = [
  { label: "전사원 찬반 토론", href: "/discussion/debate", icon: DebateBoardIcon },
  { label: "전사원 공개 피드", href: "/discussion/public", icon: PublicFeedAiSocialIcon },
  { label: "전사원 익명 채팅", href: "/discussion/anonymous", icon: AnonymousChatMaskIcon },
  { label: "전사원 외부 활동", href: "/external-activities", icon: ExternalActivityGlobeIcon },
] as const;

function ArrowButton() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-blue-300/55 bg-[#061127] text-white shadow-[inset_0_0_10px_rgba(96,165,250,0.2),0_0_12px_rgba(37,99,235,0.2)] transition group-hover:translate-x-0.5 group-hover:border-cyan-200">
      <ChevronRight className="size-4.5" strokeWidth={2.3} />
    </span>
  );
}

export function ServiceMap() {
  return (
    <section aria-labelledby="service-map-title" className="relative overflow-hidden rounded-2xl border border-blue-400/25 bg-[#020713] px-5 py-8 shadow-[inset_0_0_90px_rgba(16,46,110,0.12)] sm:px-8 lg:px-10 lg:py-9">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(96,165,250,0.32)_0.65px,transparent_0.75px)] [background-size:38px_38px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_42%_58%,rgba(29,78,216,0.2),transparent_32%)]" />

      <header className="relative">
        <p className="text-[10px] font-medium uppercase tracking-[0.36em] text-blue-100/80">PERSOS SERVICE MAP</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl" id="service-map-title">하나의 조직에서 연결되는 서비스</h2>
      </header>

      <div className="relative mt-7 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.78fr)] xl:items-center xl:gap-12">
        <div className="relative mx-auto grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-[1fr_1.2fr_1fr] sm:grid-rows-[1fr_1.2fr_1fr] sm:items-center sm:gap-0">
          <div aria-hidden="true" className="pointer-events-none absolute inset-[16%_16%] hidden rounded-full border border-blue-300/20 shadow-[0_0_45px_rgba(37,99,235,0.15)] sm:block" />
          <div aria-hidden="true" className="pointer-events-none absolute left-[18%] right-[18%] top-1/2 hidden h-px bg-gradient-to-r from-blue-300/15 via-cyan-200/70 to-blue-300/15 sm:block" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[18%] left-1/2 top-[18%] hidden w-px bg-gradient-to-b from-blue-300/15 via-cyan-200/70 to-blue-300/15 sm:block" />

          {ecosystemNodes.map(({ href, icon: Icon, label, position }) => (
            <Link className={`group relative z-10 mx-auto flex size-28 flex-col items-center justify-center rounded-full border border-blue-300/45 bg-[radial-gradient(circle,rgba(17,40,88,0.86),rgba(2,7,19,0.98)_70%)] text-center shadow-[inset_0_0_25px_rgba(59,130,246,0.15),0_0_24px_rgba(37,99,235,0.12)] transition hover:-translate-y-0.5 hover:border-cyan-200/70 sm:size-32 ${position}`} href={href} key={href}>
              <Icon className="size-7 text-blue-50" strokeWidth={1.6} />
              <span className="mt-2 text-sm font-semibold text-white">{label}</span>
              <span className="absolute -right-1 top-1/2 -translate-y-1/2"><ArrowButton /></span>
            </Link>
          ))}

          <div className="relative z-20 col-span-2 mx-auto grid size-44 place-items-center rounded-full border border-blue-300/45 bg-[radial-gradient(circle,rgba(17,44,101,0.96),rgba(2,7,19,0.99)_70%)] shadow-[inset_0_0_38px_rgba(59,130,246,0.2),0_0_48px_rgba(37,99,235,0.2)] sm:col-start-2 sm:row-start-2 sm:size-48">
            <span className="absolute inset-3 rounded-full border border-blue-400/20" />
            <span className="relative h-16 w-[74%]"><Image alt="PERSOS Persona Operating System" className="object-contain" fill sizes="180px" src="/brand/persos-horizontal-transparent.png" /></span>
          </div>
        </div>

        <nav aria-label="페르소나 활동 상세 페이지" className="rounded-[1.75rem] border border-blue-300/30 bg-[#040a18]/95 p-4 shadow-[inset_0_0_35px_rgba(37,99,235,0.08)] sm:p-5">
          <p className="px-2 pb-4 pt-1 text-center text-[10px] font-medium uppercase tracking-[0.36em] text-blue-100/75">PERSONA ACTIVITY</p>
          <div className="space-y-2.5">
            {activityNodes.map(({ href, icon: Icon, label }) => (
              <Link className="group flex min-h-16 items-center gap-3 rounded-2xl border border-blue-300/25 bg-[linear-gradient(100deg,rgba(13,31,72,0.78),rgba(2,7,19,0.94))] px-4 transition hover:border-cyan-200/55 hover:bg-blue-400/[0.1]" href={href} key={href}>
                <Icon className="size-9 shrink-0" />
                <span className="min-w-0 flex-1 text-sm font-medium tracking-[-0.02em] text-zinc-100">{label}</span>
                <ArrowButton />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
