import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Globe2,
  Network,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";

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
  { label: "전사원 외부 활동", href: "/external-activities", icon: Globe2 },
] as const;

function ArrowButton() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-blue-300/55 bg-[#071127] text-blue-50 shadow-[inset_0_0_12px_rgba(96,165,250,0.2),0_0_16px_rgba(37,99,235,0.25)] transition group-hover:translate-x-0.5 group-hover:border-cyan-200 group-hover:text-cyan-100 sm:size-10">
      <ChevronRight className="size-5" strokeWidth={2.3} />
    </span>
  );
}

export function ServiceMap() {
  return (
    <section
      aria-labelledby="service-map-title"
      className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-[#030814] px-5 py-9 shadow-[inset_0_0_100px_rgba(16,46,110,0.12)] sm:px-8 sm:py-12 lg:px-10 lg:py-14"
    >
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(rgba(96,165,250,0.32)_0.7px,transparent_0.8px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_52%,rgba(30,64,175,0.2),transparent_34%),linear-gradient(115deg,transparent_20%,rgba(37,99,235,0.04)_50%,transparent_78%)]" />

      <header className="relative">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-blue-100/80 sm:text-xs">
          PERSOS SERVICE MAP
        </p>
        <h2
          className="mt-4 text-balance text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-white"
          id="service-map-title"
        >
          하나의 조직에서 연결되는 서비스
        </h2>
      </header>

      <div className="relative mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.82fr)] xl:items-center xl:gap-14">
        <div className="relative mx-auto grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-12 sm:gap-y-12 lg:grid-cols-[1fr_1.25fr_1fr] lg:grid-rows-[1fr_1.15fr_1fr] lg:items-center lg:gap-x-10 lg:gap-y-0">
          <div aria-hidden="true" className="pointer-events-none absolute inset-[14%_14%] hidden rounded-full border border-blue-400/20 shadow-[0_0_70px_rgba(37,99,235,0.14)] lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute left-[20%] right-[20%] top-1/2 hidden h-px bg-gradient-to-r from-blue-400/20 via-cyan-200/70 to-blue-400/20 lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[20%] left-1/2 top-[20%] hidden w-px bg-gradient-to-b from-blue-400/20 via-cyan-200/70 to-blue-400/20 lg:block" />

          {ecosystemNodes.map(({ href, icon: Icon, label, position }) => (
            <Link
              aria-label={`${label} 상세 페이지로 이동`}
              className={`group relative z-10 flex min-h-36 flex-col items-center justify-center rounded-full border border-blue-300/40 bg-[radial-gradient(circle,rgba(18,40,89,0.85),rgba(3,8,20,0.96)_68%)] px-3 text-center shadow-[inset_0_0_30px_rgba(59,130,246,0.16),0_0_30px_rgba(37,99,235,0.12)] transition hover:-translate-y-1 hover:border-cyan-200/70 hover:shadow-[inset_0_0_34px_rgba(34,211,238,0.18),0_0_35px_rgba(37,99,235,0.2)] sm:min-h-44 lg:aspect-square lg:min-h-0 ${position}`}
              href={href}
              key={href}
            >
              <Icon className="size-8 text-blue-50 sm:size-10" strokeWidth={1.65} />
              <span className="mt-3 text-sm font-semibold tracking-[-0.02em] text-white sm:text-lg">{label}</span>
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 sm:right-0"><ArrowButton /></span>
            </Link>
          ))}

          <div className="relative z-20 col-span-2 mx-auto grid aspect-square w-[min(68vw,15rem)] place-items-center rounded-full border border-blue-300/40 bg-[radial-gradient(circle,rgba(15,38,86,0.94),rgba(3,8,20,0.98)_68%)] shadow-[inset_0_0_45px_rgba(59,130,246,0.2),0_0_60px_rgba(37,99,235,0.22)] lg:col-start-2 lg:row-start-2 lg:w-full">
            <span className="absolute inset-3 rounded-full border border-blue-400/20" />
            <span className="relative h-16 w-[72%] sm:h-20">
              <Image alt="PERSOS Persona Operating System" className="object-contain" fill sizes="240px" src="/brand/persos-horizontal-transparent.png" />
            </span>
          </div>
        </div>

        <nav aria-label="페르소나 활동 상세 페이지" className="relative rounded-[2rem] border border-blue-300/30 bg-[#050b19]/95 p-4 shadow-[inset_0_0_45px_rgba(37,99,235,0.08),0_0_55px_rgba(0,0,0,0.3)] sm:p-6">
          <p className="px-3 pb-5 pt-1 text-center text-[10px] font-medium uppercase tracking-[0.38em] text-blue-100/80 sm:text-xs">PERSONA ACTIVITY</p>
          <div className="space-y-3">
            {activityNodes.map(({ href, icon: Icon, label }) => (
              <Link
                className="group flex min-h-20 items-center gap-4 rounded-2xl border border-blue-300/25 bg-[linear-gradient(100deg,rgba(13,29,66,0.76),rgba(3,8,20,0.9))] px-4 shadow-[inset_0_0_22px_rgba(37,99,235,0.07)] transition hover:border-cyan-200/55 hover:bg-blue-400/[0.09] sm:min-h-24 sm:px-5"
                href={href}
                key={href}
              >
                <Icon className="size-10 shrink-0 sm:size-12" />
                <span className="min-w-0 flex-1 text-sm font-medium tracking-[-0.02em] text-zinc-100 sm:text-base">{label}</span>
                <ArrowButton />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
