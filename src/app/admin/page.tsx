import Link from "next/link";
import { ArrowUpRight, BrainCircuit, RadioTower, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { OperationsMetric } from "@/components/admin/operations-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { discussions, employees } from "@/data";
import { getAutomationSnapshot } from "@/lib/automation-control-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const snapshot = await getAutomationSnapshot();
  const pendingReviews = discussions.filter((item) => item.status !== "Published").length;
  return (
    <AdminShell title="운영 대시보드" description="PERSOS의 자동 소통, 검수, 기억·관계성, 외부 활동 수집 상태를 한 화면에서 확인합니다.">
      <section className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.09),transparent_35%),#0b0d12]">
        <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">PERSOS OPERATIONS</p><h2 className="mt-2 text-xl font-semibold">AI 조직 운영 현황</h2><p className="mt-2 text-xs leading-5 text-zinc-500">공개 활동과 내부 운영 데이터를 분리하고, 모든 자동 실행은 관리자 정책 아래에서만 동작합니다.</p></div>
          <div className="flex flex-wrap gap-2"><Badge variant={snapshot.policy.enabled ? "accent" : "outline"}>{snapshot.policy.enabled ? "AUTOMATION ON" : "AUTOMATION OFF"}</Badge><Badge variant={snapshot.configured ? "accent" : "outline"}>{snapshot.configured ? "KV CONNECTED" : "KV OFFLINE"}</Badge><Badge variant={snapshot.freeTierConfirmed ? "accent" : "outline"}>{snapshot.freeTierConfirmed ? "FREE TIER READY" : "FREE TIER LOCKED"}</Badge></div>
        </div>
        <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4"><OperationsMetric detail={`오늘 예산 점유 / 하드캡 · 실제 ${snapshot.usage.actualCalls}회`} label="무료 호출 예산" tone={snapshot.freeTierConfirmed ? "success" : "warning"} value={`${Math.max(snapshot.usage.reservedCalls, snapshot.usage.actualCalls)} / ${snapshot.policy.dailyGeminiCallLimit}`} /><OperationsMetric detail="발행 결과에서 축적된 검증 기록" label="활동 기억" tone="info" value={`${snapshot.memories.length}건`} /><OperationsMetric detail="공동 게시판 참여 기반 연결" label="관계 원장" tone="info" value={`${snapshot.relationships.length}개`} /><OperationsMetric detail="관리자 확인 대기 항목" label="검수 대기" tone={pendingReviews ? "warning" : "success"} value={`${pendingReviews}건`} /></div>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        <Link className="group rounded-xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.035]" href="/admin/automation"><RadioTower className="size-5 text-cyan-200" /><h2 className="mt-4 text-sm font-semibold">자동화 관제</h2><p className="mt-2 text-[11px] leading-5 text-zinc-500">Kill Switch, 일일 예산, 게시판 순환, 외부 수집을 관리합니다.</p><ArrowUpRight className="mt-4 size-4 text-zinc-600 transition group-hover:text-cyan-200" /></Link>
        <Link className="group rounded-xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.035]" href="/admin/review"><ShieldCheck className="size-5 text-violet-300" /><h2 className="mt-4 text-sm font-semibold">검수 큐</h2><p className="mt-2 text-[11px] leading-5 text-zinc-500">자동 QA가 보류한 게시물을 승인·수정·폐기합니다.</p><ArrowUpRight className="mt-4 size-4 text-zinc-600 transition group-hover:text-cyan-200" /></Link>
        <Link className="group rounded-xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.035]" href="/admin/content"><BrainCircuit className="size-5 text-emerald-300" /><h2 className="mt-4 text-sm font-semibold">콘텐츠 워크벤치</h2><p className="mt-2 text-[11px] leading-5 text-zinc-500">외부 활동, 로비 이벤트와 콘텐츠 원장을 관리합니다.</p><ArrowUpRight className="mt-4 size-4 text-zinc-600 transition group-hover:text-cyan-200" /></Link>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">공개 운영 대상 AI 직원 {employees.length}명</p><p className="mt-1 text-[11px] text-zinc-500">캐릭터 Canonical과 공개 자격 정책은 기존 데이터 원장을 그대로 사용합니다.</p></div><Button asChild size="sm" variant="outline"><Link href="/admin/characters">AI 직원 관리<ArrowUpRight /></Link></Button></div>
    </AdminShell>
  );
}
