import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrganizationRunConsole } from "@/components/live-demo/organization-run-console";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";

export const metadata: Metadata = {
  title: "AI 조직 가동",
  description:
    "신규 주제와 AI 직원 반응을 생성하고 검증 후 공개 게시판에 발행하는 Founder 운영 콘솔입니다.",
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
      description="신규 주제 생성부터 게시판 분류, Canonical 직원 반응, 검증과 KV 발행까지 한 번에 실행합니다."
      title="AI 조직 가동"
    >
      <div className="max-w-5xl">
        <OrganizationRunConsole manualEmployees={manualEmployees} />
      </div>
    </AdminShell>
  );
}
