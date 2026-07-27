import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { EmployeeReactionTest } from "@/components/live-demo/employee-reaction-test";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "PERSOS 직원 반응 테스트",
  description:
    "하나의 안건에 대한 PERSOS 직원 3명의 구조화된 Gemini 반응을 확인합니다.",
  robots: { index: false, follow: false },
};

export default function InvestorDemoPage() {
  return (
    <PageContainer className="mx-auto max-w-5xl space-y-8 lg:space-y-10">
      <PageHero
        description="하나의 안건을 입력하면 TECT, Architect, 박봉남이 각자의 직무와 성향에 따라 찬성·보류·반대 의견과 실행 제안을 제시합니다."
        eyebrow="PERSOS INVESTOR LIVE DEMO"
        title="PERSOS 직원 반응 테스트"
      />
      <EmployeeReactionTest />
    </PageContainer>
  );
}
