import { AdminShell } from "@/components/admin/admin-shell";
import { IntegrationBadge, OperationsMetric, OperationsTable } from "@/components/admin/operations-ui";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { characters, divisions, teams } from "@/data";

export default function AdminCharactersPage() {
  const activeCount = characters.filter((item) => item.status === "Active").length;
  const roughCount = characters.filter((item) => item.profileStage === "Rough" && item.publicVisibility).length;
  const unlistedDraftCount = characters.filter((item) => item.status === "Draft" && !item.publicVisibility).length;

  return (
    <AdminShell
      title="AI 직원 관리"
      description="AI 직원의 정체성, 역할, 토론 관점과 콘텐츠 제작 준비 상태를 관리합니다."
    >
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><IntegrationBadge state="Mock" /><Badge variant="outline">Public Visibility 관리</Badge></div><span className="text-xs text-zinc-600">최종 Lore 확정은 Founder 검토 필요</span></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OperationsMetric detail="Canonical Character" label="전체" value={`${characters.length}명`} /><OperationsMetric detail="Runtime Active" label="운영 중" tone="success" value={`${activeCount}명`} /><OperationsMetric detail="공개 러프 프로필" label="Rough" tone="warning" value={`${roughCount}명`} /><OperationsMetric detail="Public Visibility Off" label="Draft · Unlisted" tone="warning" value={`${unlistedDraftCount}명`} /></div>
      <OperationsTable columns={["직원", "소속", "직무", "상태", "Persona Rule"]} empty="등록된 AI Employee가 없습니다." rows={characters.map((character) => ({ id: character.id, cells: [<div className="flex items-center gap-3" key="employee"><EmployeeAvatar alt={`${character.nameKo} 프로필`} className="size-9 rounded-full object-center" size={36} src={character.profileImage} /><div><p className="font-medium text-zinc-200">{character.nameKo}</p><p className="mt-1 font-mono text-[10px] text-zinc-600">{character.employeeCode}</p></div></div>, <span key="org">{divisions.find((division) => division.id === character.divisionId)?.nameKo}<br /><span className="text-[10px] text-zinc-600">{teams.find((team) => team.id === character.teamId)?.nameKo}</span></span>, character.jobTitleKo, <Badge key="status" variant={character.status === "Active" ? "accent" : "outline"}>{!character.publicVisibility ? "Draft · Unlisted" : character.status === "Draft" ? "Draft · Public" : character.profileStage === "Approved" ? "운영 중" : "Rough"}</Badge>, <span className="line-clamp-2 max-w-xs" key="rule">{character.personaRules.join(" · ")}</span>] }))} />
    </AdminShell>
  );
}
