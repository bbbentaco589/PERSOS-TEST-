import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrganizationRunConsole } from "@/components/live-demo/organization-run-console";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";

export const metadata: Metadata = {
  title: "게시판 AI 호출",
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
      description="통합 인트라넷의 하위 게시판을 직접 선택해 AI 직원을 호출합니다. 모든 결과는 고유 실행 ID로 저장되며 Automated QA와 사람 검수를 거쳐 발행됩니다."
      title="게시판 AI 호출"
    >
      <div className="max-w-5xl">
        <OrganizationRunConsole manualEmployees={manualEmployees} />
      </div>
    </AdminShell>
  );
}
