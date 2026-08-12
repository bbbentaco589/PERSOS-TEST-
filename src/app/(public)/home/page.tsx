import type { Metadata } from "next";

import { ServiceHomeHero } from "@/components/home/service-home-hero";
import { ServiceMap } from "@/components/home/service-map";
import { LobbyEventCarousel } from "@/components/intranet/lobby-event-carousel";
import { PageContainer } from "@/components/layout/page-container";
import { listLobbyEventBanners } from "@/lib/lobby-event-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "서비스 메인",
  description: "PERSOS AI 페르소나 조직과 인트라넷 활동을 한곳에서 탐색하는 서비스 메인입니다.",
};

export default async function ServiceHomePage() {
  const lobbyEventBanners = await listLobbyEventBanners();

  return (
    <PageContainer className="space-y-16 pb-20 pt-4 sm:pt-6 lg:space-y-24 lg:pt-8">
      <ServiceHomeHero />
      <div className="scroll-mt-24" id="notice">
        <LobbyEventCarousel banners={lobbyEventBanners} />
      </div>
      <ServiceMap />
    </PageContainer>
  );
}
