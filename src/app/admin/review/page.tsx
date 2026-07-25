import { AlertTriangle, Check, RotateCcw, X } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { IntegrationBadge, OperationsMetric, OperationsTable } from "@/components/admin/operations-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contentDrafts, discussions, employees } from "@/data";

export default function AdminReviewPage() {
  const pending = contentDrafts.filter((item) => item.status === "Pending Review");
  const rows = discussions.map((discussion) => {
    const participantNames = discussion.participants.map((participant) => employees.find((employee) => employee.id === participant.characterId)?.nameKo).filter(Boolean).join(" · ");
    return { id: discussion.id, cells: [<div key="item"><p className="font-medium text-zinc-200">{discussion.title}</p><p className="mt-1 text-[10px] text-zinc-600">Discussion · {participantNames}</p></div>, <Badge key="status" variant="outline">{discussion.status}</Badge>, <Badge key="risk" variant="outline">중간</Badge>, <span key="source">출처 {discussion.sourceIds.length}개</span>, <div className="flex gap-1" key="actions"><Button disabled size="icon-sm" title="승인"><Check /></Button><Button disabled size="icon-sm" title="반려" variant="outline"><X /></Button><Button disabled size="icon-sm" title="재생성" variant="ghost"><RotateCcw /></Button></div>] };
  });

  return <AdminShell title="검수 큐" description="Discussion Response, Rebuttal, Consensus, Knowledge와 Content를 한곳에서 검토합니다. 현재 버튼은 Integration Ready 상태입니다."><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><IntegrationBadge state="Mock" /><IntegrationBadge state="Integration Ready" /></div><span className="flex items-center gap-2 text-xs text-amber-200"><AlertTriangle className="size-4" />Public 발행 전 사람 검토 필수</span></div><div className="grid gap-3 sm:grid-cols-3"><OperationsMetric detail="콘텐츠 초안 기준" label="검수 대기" tone="warning" value={`${pending.length}건`} /><OperationsMetric detail="Mock 데이터 위험 분류" label="고위험" tone="danger" value="0건" /><OperationsMetric detail="실제 Diff 저장 미연결" label="오늘 처리" value="0건" /></div><div className="flex flex-wrap gap-2"><Badge variant="accent">전체 유형</Badge>{["Discussion", "Consensus", "Knowledge", "Content"].map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div><OperationsTable columns={["검수 대상", "상태", "위험도", "근거", "작업"]} empty="검수 대기 항목이 없습니다." rows={rows} /><p className="text-[11px] leading-5 text-zinc-600">수정 Diff, Review Note, 승인·반려·재생성 API 연결은 후속 운영 통합 항목입니다. 현재 데이터는 Mock이며 실제 처리를 가장하지 않습니다.</p></AdminShell>;
}
