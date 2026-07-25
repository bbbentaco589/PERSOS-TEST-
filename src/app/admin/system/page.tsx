import { AlertTriangle, Database, Gauge, KeyRound, ShieldAlert } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { IntegrationBadge, OperationsMetric, OperationsTable } from "@/components/admin/operations-ui";
import { Button } from "@/components/ui/button";

const settings = [
  { id: "provider", cells: ["AI Provider", "mock", <IntegrationBadge key="state" state="Mock" />, "실제 OpenAI 환경 미검증"] },
  { id: "database", cells: ["Persistence", "mock", <IntegrationBadge key="state" state="Mock" />, "Neon Adapter 구현·실DB 미검증"] },
  { id: "retry", cells: ["Retry Policy", "최대 1회", <IntegrationBadge key="state" state="Verified" />, "Mock 실패 흐름 검증"] },
  { id: "budget", cells: ["API Budget", "미설정", <IntegrationBadge key="state" state="Unavailable" />, "Founder 결정 필요"] },
];

export default function AdminSystemPage() {
  return <AdminShell title="시스템·안전" description="Provider, 예산, 실패 정책, 민감 주제와 Audit 상태를 확인합니다. 비밀 환경 변수 값은 화면에 표시하지 않습니다."><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OperationsMetric detail="기본 Provider" label="AI" value="Mock" /><OperationsMetric detail="기본 저장소" label="Database" value="Mock" /><OperationsMetric detail="실제 비용 계측 전" label="Budget" tone="warning" value="미설정" /><OperationsMetric detail="최근 Mock 검증" label="오류" tone="success" value="0" /></div><section className="grid gap-3 md:grid-cols-3" aria-label="시스템 경계"><div className="border border-white/8 p-4"><KeyRound className="size-4 text-cyan-200" /><p className="mt-3 text-sm font-medium">Environment</p><p className="mt-2 text-xs leading-5 text-zinc-500">서버 전용 환경 변수 경계. 실제 값 비노출.</p></div><div className="border border-white/8 p-4"><Database className="size-4 text-violet-300" /><p className="mt-3 text-sm font-medium">Database</p><p className="mt-2 text-xs leading-5 text-zinc-500">Kysely + Neon Adapter. 실DB 검증 대기.</p></div><div className="border border-white/8 p-4"><Gauge className="size-4 text-emerald-300" /><p className="mt-3 text-sm font-medium">Safety</p><p className="mt-2 text-xs leading-5 text-zinc-500">고위험 주제는 Human Review 필수.</p></div></section><OperationsTable columns={["설정", "현재 값", "상태", "메모"]} empty="시스템 설정이 없습니다." rows={settings} /><section className="flex flex-col gap-4 border border-rose-400/20 bg-rose-400/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 size-5 text-rose-300" /><div><h2 className="text-sm font-semibold">Global Kill Switch</h2><p className="mt-2 text-xs leading-5 text-zinc-500">실제 Orchestrator 연결 전이며 현재 조작할 수 없습니다.</p></div></div><Button disabled variant="destructive">전체 생성 중단</Button></section><div className="flex items-start gap-2 text-[11px] leading-5 text-amber-100/70"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />실제 OpenAI·Neon·Vercel 환경은 아직 검증되지 않았습니다. 구현 상태와 운영 검증 상태를 구분합니다.</div></AdminShell>;
}
