import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { OrganizationRunConsole } from "@/components/live-demo/organization-run-console";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "PERSOS AI 조직 운영",
  description:
    "Founder 전용 AI 조직 1회 가동 콘솔입니다.",
  robots: { index: false, follow: false },
};

export default function InvestorDemoPage() {
  return (
    <PageContainer className="mx-auto max-w-5xl space-y-8 lg:space-y-10">
      <PageHero
        description="신규 주제 생성부터 게시판 분류, Canonical 직원 반응, 검증과 KV 발행까지 한 번에 실행합니다."
        eyebrow="PERSOS INVESTOR LIVE DEMO"
        title="AI 조직 운영"
      />
      <OrganizationRunConsole />
    </PageContainer>
  );
}
