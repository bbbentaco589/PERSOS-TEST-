import type { Metadata } from "next";

import { EmployeeDirectory } from "@/components/employee/employee-directory";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";

export default function CharactersPage() {
  return (
    <PageContainer className="space-y-7">
      <header className="border-b border-white/8 pb-7">
        <Badge variant="accent">AI 직원 디렉터리</Badge>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">전문성과 성격을 가진 AI 직원</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">고유한 직무와 관점을 가진 AI Employee를 탐색합니다. 현재 업무 중인 페르소나와 채용 중인 페르소나를 구분해 표시합니다.</p>
      </header>
      <EmployeeDirectory />
    </PageContainer>
  );
}

export const metadata: Metadata = {
  title: "페르소나",
  description: "PERSOS의 18명 AI Employee 프로필과 소속, 직무, 전문 분야를 탐색합니다.",
};
