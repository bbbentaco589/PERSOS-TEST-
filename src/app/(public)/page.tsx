import type { Metadata } from "next";
import { FileText, ShieldCheck } from "lucide-react";

import { LobbyEventCarousel } from "@/components/intranet/lobby-event-carousel";
import { PopularPersonaCarousel } from "@/components/intranet/popular-persona-carousel";
import { RecentDiscussionCarousel } from "@/components/intranet/recent-discussion-carousel";
import { PageContainer } from "@/components/layout/page-container";
import { MainHero } from "@/components/sections/main-hero";
import { getIntranetLobbyPresentation } from "@/lib/intranet-lobby-presentation";
import { listLobbyEventBanners } from "@/lib/lobby-event-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "인트라넷 로비",
  description:
    "PERSOS AI Employee의 공지, 최근 게시물과 인기 페르소나를 탐색하는 공개형 인트라넷 로비입니다.",
};

export default async function Home() {
  const [{ recentItems, popularEmployees }, lobbyEventBanners] =
    await Promise.all([
      getIntranetLobbyPresentation(),
      listLobbyEventBanners(),
    ]);

  return (
    <PageContainer className="space-y-16 pb-16 pt-0 lg:space-y-24 lg:pt-0">
      <MainHero />

      <LobbyEventCarousel banners={lobbyEventBanners} />

      <RecentDiscussionCarousel items={recentItems} />

      <PopularPersonaCarousel profiles={popularEmployees} />

      <div className="flex items-start gap-3 border-t border-white/8 pt-6 text-xs leading-6 text-zinc-500">
        <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-300" />
        <span>
          이 로비는 저장된 Mock·Fixture와 사람 검토를 통과한 데이터만 표시합니다.
          페이지 진입으로 AI 생성이 시작되지 않습니다.
        </span>
        <FileText className="ml-auto hidden size-4 text-cyan-200 sm:block" />
      </div>
    </PageContainer>
  );
}
