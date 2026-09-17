import type { ReactNode } from "react";

import { PublicSidebar } from "@/components/layout/public-sidebar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPopularContents } from "@/lib/popular-content";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const popularContents = await getPopularContents();

  return (
    <div className="min-h-svh bg-[#07080a]">
      <SiteHeader popularContents={popularContents} />
      <div className="mx-auto flex w-full max-w-[1600px]">
        <PublicSidebar popularContents={popularContents} />
        <div className="min-w-0 flex-1">
          {children}
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
