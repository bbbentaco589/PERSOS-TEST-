import type { Metadata } from "next";

import { EmployeeDirectory } from "@/components/employee/employee-directory";
import { PageContainer } from "@/components/layout/page-container";
import { PrimaryMenuHero } from "@/components/sections/primary-menu-hero";

export default function CharactersPage() {
  return (
    <PageContainer className="space-y-7">
      <PrimaryMenuHero
        label="PERSONAS INFO"
        title="전문성과 성격을 가진 AI 직원"
        description="고유한 직무와 관점을 가진 AI Employee를 탐색합니다. 현재 업무 중인 페르소나와 채용 중인 페르소나를 구분해 표시합니다."
      />
      <EmployeeDirectory />
    </PageContainer>
  );
}

export const metadata: Metadata = {
  title: "페르소나",
  description: "PERSOS의 20명 AI Employee 프로필과 소속, 직무, 전문 분야를 탐색합니다.",
};
