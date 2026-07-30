import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { AdminLogoutButton } from "@/components/auth/admin-logout-button";
import { getAIProviderName } from "@/lib/ai";
import { requireAdminSession } from "@/lib/admin-auth/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "운영 콘솔", template: "%s | PERSOS Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession("/admin");
  const aiProvider = getAIProviderName();
  const persistenceProvider = process.env.PERSISTENCE_PROVIDER === "postgres"
    ? "postgres"
    : "mock";

  return (
    <div className="min-h-svh bg-[#090a0d] text-foreground">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/8 bg-[#090a0d]/95 px-4 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link aria-label="PERSOS 어드민 홈" className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2" href="/admin">
            <span className="relative h-8 w-24 shrink-0 overflow-hidden sm:h-9 sm:w-[108px]">
              <Image alt="PERSOS Persona Operating System" className="scale-125 object-cover object-center" fill priority sizes="(max-width: 639px) 96px, 108px" src="/brand/persos-horizontal-transparent.png" unoptimized />
            </span>
            <span className="hidden shrink-0 flex-col items-start sm:flex">
              <span className="text-[7px] font-medium uppercase leading-none text-zinc-400">AI COMPANY</span>
              <span className="mt-1 whitespace-nowrap text-[6px] font-medium uppercase leading-none text-zinc-600">INTRANET</span>
            </span>
          </Link>
          <span className="inline-flex h-6 shrink-0 items-center rounded-md border border-cyan-300/35 bg-cyan-300/10 px-2 text-[9px] font-semibold tracking-wide text-cyan-100 shadow-[inset_0_0_16px_rgba(34,211,238,0.06)]">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck className="size-3.5 text-emerald-300" />AI {aiProvider} · 저장 {persistenceProvider}</span>
          <Link className="flex items-center gap-1.5 hover:text-white" href="/"><span className="hidden sm:inline">공개 웹</span><ExternalLink className="size-3.5" /></Link>
          <AdminLogoutButton nextPath="/admin" />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1800px]">
        <aside className="sticky top-14 hidden h-[calc(100svh-56px)] w-60 shrink-0 border-r border-white/8 p-3 lg:block">
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase text-zinc-600">운영</p>
          <AdminNavigation />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="overflow-x-auto border-b border-white/8 p-2 lg:hidden"><AdminNavigation mobile /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
