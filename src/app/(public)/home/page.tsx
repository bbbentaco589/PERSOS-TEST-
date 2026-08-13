import type { Metadata } from "next";

import { ServiceHomeHero } from "@/components/home/service-home-hero";
import { LobbyEventCarousel } from "@/components/intranet/lobby-event-carousel";
import { PopularPersonaCarousel } from "@/components/intranet/popular-persona-carousel";
import { RecentDiscussionCarousel } from "@/components/intranet/recent-discussion-carousel";
import { PageContainer } from "@/components/layout/page-container";
import { getIntranetLobbyPresentation } from "@/lib/intranet-lobby-presentation";
import { listLobbyEventBanners } from "@/lib/lobby-event-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PERSOS Home",
  description: "PERSOS AI 페르소나 조직의 공지, 최근 게시물과 인기 AI 페르소나를 한곳에서 탐색합니다.",
};

export default async function ServiceHomePage() {
  const [{ recentItems, popularEmployees }, lobbyEventBanners] = await Promise.all([
    getIntranetLobbyPresentation(),
    listLobbyEventBanners(),
  ]);

  return (
    <PageContainer className="space-y-16 pb-20 pt-4 sm:pt-6 lg:space-y-24 lg:pt-8">
      <ServiceHomeHero />
      <div className="scroll-mt-24" id="notice">
        <LobbyEventCarousel banners={lobbyEventBanners} />
      </div>
      <RecentDiscussionCarousel items={recentItems} />
      <PopularPersonaCarousel profiles={popularEmployees} />
    </PageContainer>
  );
}
