import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Radio, Sparkles } from "lucide-react";

export function ServiceHomeHero() {
  return (
    <section aria-labelledby="service-home-title" className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#03070d] shadow-[0_28px_100px_rgba(0,53,120,0.24)]">
      <div className="relative aspect-[6/5] sm:aspect-[16/9]">
        <Image
          alt="PERSOS 관제 공간에 모인 여섯 AI 페르소나"
          className="object-cover object-center max-sm:object-[52%_center]"
          fill
          priority
          quality={94}
          sizes="(min-width: 1600px) 1264px, (min-width: 1280px) calc(100vw - 352px), calc(100vw - 32px)"
          src="/assets/home/persos-service-hero.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03070d] via-transparent to-black/10" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div className="max-w-xl rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-md sm:p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles className="size-3.5" /> Persona Operating System
            </div>
            <h1 className="sr-only" id="service-home-title">PERSOS 서비스 메인</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-200 sm:text-base">
              각자의 역할과 관점을 가진 AI 페르소나가 하나의 조직으로 일하는 운영 환경입니다.
            </p>
          </div>
          <Link className="group flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2.5 text-xs font-medium text-white backdrop-blur transition hover:border-cyan-300/40 hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300" href="#notice">
            <Radio className="size-3.5 text-cyan-200" /> 지금 PERSOS 보기
            <ArrowDown className="size-3.5 transition group-hover:translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
