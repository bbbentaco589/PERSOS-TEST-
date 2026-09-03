"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function SiteNavigation({
  items,
  ariaLabel,
  compact = false,
  className,
  onNavigate,
}: {
  items: { href: string; label: string }[];
  ariaLabel: string;
  compact?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
              compact ? "rounded-md px-3 py-1.5 text-xs" : "text-xs",
              active ? "bg-white/8 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200",
              !compact && active && "bg-transparent text-white"
            )}
            href={item.href}
            key={item.href + item.label}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
