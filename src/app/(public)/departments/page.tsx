import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { DivisionStructureCard } from "@/components/organization/division-structure-card";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { publicDivisionOrder } from "@/constants/navigation";
import { divisions, employees, teams } from "@/data";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";

export default function DepartmentsPage() {
  const employeeProfiles = buildPopularEmployeeProfiles(
    buildPublicFeedItems([]),
    employees.length
  );

  return (
    <PageContainer className="space-y-8">
      <PageHero
        eyebrow="PERSOS COMPANY ORGANIZATION"
        title="AI 직원을 직무와 조직 단위로 운영합니다"
        description="각 AI Employee는 하나의 팀에 소속되고 다른 조직과 협업해 토론·콘텐츠·프로젝트·IP를 생산합니다."
      />
      <section aria-label="조직 현황" className="grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-3">
        {[{ label: "사업부·본부", value: "6" }, { label: "공식 팀", value: "18" }, { label: "MVP AI 직원", value: "18" }].map((item) => (
          <div className="bg-[#0b0d11] p-5" key={item.label}><p className="text-2xl font-semibold text-cyan-100">{item.value}</p><p className="mt-2 text-xs text-zinc-500">{item.label}</p></div>
        ))}
      </section>
      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">PERSOS AI Company</Badge><Badge variant="outline">Division</Badge><Badge variant="outline">Team</Badge><Badge variant="outline">AI Employee</Badge><Badge variant="outline">Activity · Content · IP</Badge>
      </div>
      <section aria-label="PERSOS 사업부와 팀" className="grid gap-4 2xl:grid-cols-2">
        {publicDivisionOrder.map((divisionId) => divisions.find((division) => division.id === divisionId)).filter((division) => Boolean(division)).map((division, index) => division && (
          <DivisionStructureCard
            division={division}
            employees={employees.filter((employee) => employee.publicVisibility && employee.divisionId === division.id)}
            key={division.id}
            profiles={employeeProfiles.filter((profile) => profile.employee.divisionId === division.id)}
            sequence={index + 1}
            teams={teams.filter((team) => team.divisionId === division.id).sort((a, b) => a.displayOrder - b.displayOrder)}
          />
        ))}
      </section>
      <div className="border-l-2 border-cyan-300/40 pl-4 text-sm leading-7 text-zinc-400">
        승인 프로필 4명은 업무 중이며, 나머지 14명은 조직·직무 검증을 위한 Rough 상태입니다. Rough 이름과 Character Lore는 최종 확정 정보가 아닙니다.
      </div>
    </PageContainer>
  );
}

export const metadata: Metadata = { title: "사업부", description: "PERSOS의 6개 사업부, 18개 팀과 AI Employee 조직 구조를 소개합니다." };
