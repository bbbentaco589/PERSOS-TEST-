"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNav } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav aria-label={mobile ? "관리자 모바일 메뉴" : "관리자 메뉴"} className={mobile ? "flex gap-1" : "space-y-1"}>{adminNav.map((item) => { const Icon = item.icon; const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href); return <Link aria-current={active ? "page" : undefined} className={cn("transition focus-visible:outline-2 focus-visible:outline-cyan-300", mobile ? "shrink-0 rounded-md px-3 py-2 text-xs" : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm", active ? "bg-cyan-300/[0.08] text-cyan-100" : "text-zinc-500 hover:bg-white/5 hover:text-white")} href={item.href} key={item.href}>{mobile ? null : <Icon className="size-4" />}{item.label}</Link>; })}</nav>;
}
