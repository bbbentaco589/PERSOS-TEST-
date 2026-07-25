import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { HeaderOverflowMenu } from "@/components/layout/header-overflow-menu";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { headerNav } from "@/constants/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07080a]/95">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-3 sm:gap-4 sm:px-6">
        <Link aria-label="PERSOS 회사 소개" className="flex min-w-0 shrink-0 items-end gap-1.5 sm:gap-2" href="/about">
          <span className="relative h-8 w-16 shrink-0 sm:h-10 sm:w-20">
            <Image alt="PERSOS" className="object-contain" fill priority sizes="(max-width: 639px) 64px, 80px" src="/brand/ptudio-wordmark-header.png" unoptimized />
          </span>
          <span className="flex shrink-0 flex-col items-start pb-0.5">
            <span className="text-[7px] font-medium uppercase leading-none text-zinc-400">AI COMPANY</span>
            <span className="mt-1 whitespace-nowrap text-[6px] font-medium uppercase leading-none text-zinc-600">AI PERSONA OPERATING SYSTEM · INTRANET</span>
          </span>
        </Link>
        <SiteNavigation ariaLabel="주요 메뉴" className="ml-auto hidden items-center gap-4 text-xs text-zinc-400 md:flex lg:gap-5" items={headerNav} />
        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-2 sm:gap-2">
          <HeaderOverflowMenu />
          <LanguageSwitch />
          <Link aria-label="어드민 화면 열기" className="grid size-8 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white" href="/admin" title="어드민"><LayoutDashboard className="size-3.5" /></Link>
        </div>
      </div>
    </header>
  );
}
