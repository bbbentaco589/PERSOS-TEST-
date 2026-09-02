import type { Metadata } from "next";

import { AutomationControlCenter } from "@/components/admin/automation-control-center";
import { AdminShell } from "@/components/admin/admin-shell";
import { employees } from "@/data";
import { getAutomationSnapshot } from "@/lib/automation-control-store";
import { isPublicActiveCharacter } from "@/lib/character-runtime-policy";
import { formatPersonaDisplayName } from "@/lib/persona-display";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "자동화 관제" };

export default async function AdminAutomationPage() {
  const snapshot = await getAutomationSnapshot();
  const personas = employees.filter(isPublicActiveCharacter).map((employee) => ({ id: employee.id, label: formatPersonaDisplayName(employee) }));
  return (
    <AdminShell title="자동화 관제" description="AI 직원의 자동 소통, 무료 호출 예산, 활동 기억과 관계성, 외부 콘텐츠 수집을 한 곳에서 통제합니다.">
      <AutomationControlCenter initialSnapshot={snapshot} personas={personas} />
    </AdminShell>
  );
}
