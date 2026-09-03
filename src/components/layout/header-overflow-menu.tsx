"use client";

import Link from "next/link";
import { Ellipsis, LogIn, Mail, UserPlus, X } from "lucide-react";
import { useState } from "react";

import { PublicSidebarContent } from "@/components/layout/public-sidebar";
import { SiteNavigation } from "@/components/layout/site-navigation";
import { headerNav } from "@/constants/navigation";

export function HeaderOverflowMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="계정 및 전체 메뉴"
        className="grid size-10 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white sm:size-8"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Ellipsis className="size-4" />
      </button>

      {open ? (
        <>
          <button
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-50 bg-black/70 xl:hidden"
            onClick={() => setOpen(false)}
            type="button"
          />
          <section
            aria-label="PERSOS 전체 메뉴"
            className="fixed inset-y-0 right-0 z-50 w-[min(88vw,360px)] overflow-y-auto border-l border-white/10 bg-[#080a0e] shadow-2xl xl:hidden"
            role="dialog"
          >
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/8 bg-[#080a0e]/95 px-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold">PERSOS Intranet</p>
                <p className="mt-1 text-[9px] text-zinc-600">Public Navigation</p>
              </div>
              <button aria-label="메뉴 닫기" className="grid size-10 place-items-center rounded-md border border-white/10 text-zinc-400" onClick={() => setOpen(false)} type="button">
                <X className="size-4" />
              </button>
            </header>
            <nav aria-label="계정 메뉴" className="grid grid-cols-2 gap-2 border-b border-white/8 px-4 py-4">
              <Link className="flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white" href="/login" onClick={() => setOpen(false)}><LogIn className="size-3.5" />로그인</Link>
              <Link className="flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white" href="/signup" onClick={() => setOpen(false)}><UserPlus className="size-3.5" />회원가입</Link>
              <Link className="col-span-2 flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white" href="/about#contact" onClick={() => setOpen(false)}><Mail className="size-3.5" />CONTACT US</Link>
            </nav>
            <SiteNavigation ariaLabel="모바일 주요 메뉴" className="flex flex-wrap gap-1 border-b border-white/8 px-4 py-4 md:hidden" compact items={headerNav} onNavigate={() => setOpen(false)} />
            <PublicSidebarContent onNavigate={() => setOpen(false)} />
          </section>

          <div className="absolute right-0 top-10 z-50 hidden w-52 rounded-md border border-white/10 bg-[#101217] p-2 shadow-2xl xl:block">
            <Link className="flex items-center gap-2 rounded px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white" href="/login" onClick={() => setOpen(false)}><LogIn className="size-3.5" />로그인</Link>
            <Link className="flex items-center gap-2 rounded px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white" href="/signup" onClick={() => setOpen(false)}><UserPlus className="size-3.5" />회원가입</Link>
            <Link className="flex items-center gap-2 rounded px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white" href="/about#contact" onClick={() => setOpen(false)}><Mail className="size-3.5" />CONTACT US</Link>
            <p className="mt-2 border-t border-white/8 px-3 pt-3 text-[10px] leading-5 text-zinc-600">인증 기능은 준비 중입니다.</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
