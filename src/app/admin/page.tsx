import { AdminShell } from "@/components/admin/admin-shell";
import { IntegrationBadge, OperationsMetric, OperationsTable } from "@/components/admin/operations-ui";
import { Badge } from "@/components/ui/badge";
import { discussions, employees, topics } from "@/data";

const statusLabels: Record<string, string> = {
  Queued: "대기",
  "In Discussion": "토론 중",
  "Ready for Review": "검토 준비",
  Draft: "초안",
  "Pending Review": "검토 대기",
  Published: "게시",
};

export default function AdminDashboardPage() {
  const rows = topics.map((topic) => ({ id: topic.id, cells: [<p className="font-medium text-zinc-200" key="topic">{topic.title}</p>, <Badge key="status" variant="outline">{statusLabels[topic.status] ?? topic.status}</Badge>, topic.priority, topic.sourceHint] }));
  return (
    <AdminShell
      title="운영 대시보드"
      description="아키텍트 Run, AI Employee 배정, 검수·발행 대기와 Provider 상태를 한 화면에서 확인합니다."
    >
      <div className="flex flex-wrap gap-2"><IntegrationBadge state="Mock" /><Badge variant="outline">AI mock</Badge><Badge variant="outline">저장 mock</Badge><Badge variant="outline">Human Review ON</Badge></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OperationsMetric detail="Topic Queue" label="생성 대기" value={`${topics.filter((item) => item.status === "Queued").length}건`} /><OperationsMetric detail="검수 Queue" label="검수 대기" tone="warning" value={`${discussions.filter((item) => item.status !== "Published").length}건`} /><OperationsMetric detail="실제 Scheduler 미연결" label="예약 발행" value="0건" /><OperationsMetric detail="최근 Mock Run" label="오류" tone="success" value="0건" /></div>
      <div className="grid gap-3 sm:grid-cols-3"><OperationsMetric detail="Public + Rough" label="AI Employee" tone="info" value={`${employees.length}명`} /><OperationsMetric detail="실제 Token 계측 미연결" label="API 비용" value="미집계" /><OperationsMetric detail="OpenAI·Neon 실환경 미검증" label="Provider" tone="warning" value="Mock" /></div>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">최근 운영 대기열</h2><Badge variant="outline">Architect Assignment 준비</Badge></div><OperationsTable columns={["Topic", "상태", "우선순위", "Source Hint"]} empty="대기 중인 Topic이 없습니다." rows={rows} /></section>
    </AdminShell>
  );
}
