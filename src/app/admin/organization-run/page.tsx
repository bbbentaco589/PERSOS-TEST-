import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrganizationRunConsole } from "@/components/live-demo/organization-run-console";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";

export const metadata: Metadata = {
  title: "AI 조직 가동",
  description:
    "신규 주제와 AI 직원별 독립 반응을 생성하고 Automated QA 후 자동 발행하는 운영 콘솔입니다.",
};

export default async function AdminOrganizationRunPage() {
  const employees = await getOrganizationRunCanonicalEmployees();
  const manualEmployees = employees.map(({ employee }) => ({
    id: employee.id,
    name: employee.nameKo,
    jobTitle: employee.jobTitleKo,
    profileImage: employee.profileImage,
  }));

  return (
    <AdminShell
      description="신규 주제 생성부터 게시판 분류, 직원별 독립 Gemini 호출, Automated QA, 자동 발행 또는 예외 검수까지 실행합니다."
      title="AI 조직 가동"
    >
      <div className="max-w-5xl">
        <OrganizationRunConsole manualEmployees={manualEmployees} />
      </div>
    </AdminShell>
  );
}
