import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenText,
  BrainCircuit,
  Link2,
  MessageSquareText,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

import { CharacterContextRecords } from "@/components/admin/character-context-records";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { characters, divisions, teams } from "@/data";
import { getCharacterContext } from "@/lib/character-context";
import { formatPersonaDisplayName } from "@/lib/persona-display";

export const dynamic = "force-dynamic";

const activityLabels = {
  post: "게시글",
  comment: "댓글·발언",
  reply: "답글",
  external: "외부 활동",
} as const;

const boardTypeLabels: Record<string, string> = {
  public: "공개 피드",
  debate: "찬반 토론",
  anonymous: "익명 채팅",
};

export default async function AdminCharacterContextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCharacterContext(id);
  if (!context) notFound();
  const { employee, activities, memories, relationships, records, recentContext, storeConfigured } = context;
  const division = divisions.find((item) => item.id === employee.divisionId);
  const team = teams.find((item) => item.id === employee.teamId);

  return (
    <AdminShell
      title={`${formatPersonaDisplayName(employee)} 컨텍스트`}
      description="사이트 안에서 발생한 실제 활동과 관리자 검수 기록을 한곳에서 관리합니다. 원문은 중복 저장하지 않고 근거 링크로 연결합니다."
    >
      <Link className="inline-flex w-fit items-center gap-2 text-xs text-zinc-500 hover:text-cyan-200" href="/admin/characters"><ArrowLeft className="size-3.5" />AI 직원 목록</Link>

      <section className="grid gap-5 rounded-xl border border-white/8 bg-[radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.08),transparent_30%),#0b0d11] p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-20 rounded-xl object-cover sm:size-24" size={96} src={employee.profileImage} />
        <div><div className="flex flex-wrap gap-2"><Badge variant={employee.status === "Active" ? "accent" : "outline"}>{employee.status === "Active" ? "운영 중" : employee.status}</Badge><Badge variant="outline">{employee.profileStage}</Badge><Badge variant="outline">ADMIN ONLY</Badge></div><h2 className="mt-3 text-xl font-semibold text-zinc-100">{employee.jobTitleKo}</h2><p className="mt-2 text-sm text-zinc-400">{division?.nameKo} · {team?.nameKo}</p><p className="mt-3 max-w-3xl text-xs leading-6 text-zinc-500">{employee.summaryKo}</p></div>
        <div className="grid grid-cols-2 gap-2 text-center lg:w-72"><Metric label="전체 활동" value={activities.length} /><Metric label="관리자 기록" value={records.length} /><Metric label="검증 기억" value={memories.length} /><Metric label="관계 연결" value={relationships.length} /></div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rounded-xl border border-white/8 bg-[#0b0d11]">
          <header className="flex items-start gap-3 border-b border-white/8 px-5 py-4 sm:px-6"><MessageSquareText className="mt-0.5 size-4 text-cyan-200" /><div><h2 className="text-sm font-semibold">통합 활동 원장</h2><p className="mt-1 text-[11px] leading-5 text-zinc-500">게시글·댓글·답글·외부 활동을 시간순으로 통합했습니다. 익명 활동의 실제 작성자는 이 관리자 화면에서만 확인됩니다.</p></div></header>
          <div className="max-h-[720px] divide-y divide-white/8 overflow-y-auto">
            {activities.map((activity) => <article className="px-5 py-4 sm:px-6" key={activity.id}><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{activityLabels[activity.kind]}</Badge><span className="text-[10px] text-cyan-200/75">{activity.board}</span>{activity.anonymous ? <span className="text-[9px] text-amber-200/75">내부 신원 확인</span> : null}<time className="text-[9px] text-zinc-700">{new Date(activity.occurredAt).toLocaleString("ko-KR")}</time></div><h3 className="mt-2 text-sm font-medium text-zinc-200">{activity.title}</h3><p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">{activity.content}</p><Link className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:underline" href={activity.href} rel={activity.kind === "external" ? "noreferrer" : undefined} target={activity.kind === "external" ? "_blank" : undefined}>원문 근거 열기<ArrowUpRight className="size-3" /></Link></article>)}
            {!activities.length ? <p className="p-10 text-center text-xs text-zinc-600">아직 연결된 실제 활동이 없습니다.</p> : null}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6"><div className="flex items-center gap-2"><BrainCircuit className="size-4 text-emerald-300" /><h2 className="text-sm font-semibold">실행용 Context Pack 미리보기</h2></div><p className="mt-2 text-[11px] leading-5 text-zinc-500">자동 요약 호출 없이 Canonical·최근 활동·검증 관계·고정 기록만 조합합니다.</p><div className="mt-4 space-y-2">{recentContext.map((line) => <p className="rounded-md border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px] leading-5 text-zinc-400" key={line}>{line}</p>)}</div></section>

          <section className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6"><div className="flex items-center gap-2"><UserRoundCog className="size-4 text-violet-300" /><h2 className="text-sm font-semibold">Canonical 설정</h2></div><dl className="mt-4 grid gap-3 text-xs"><Definition label="성격" value={employee.personality} /><Definition label="핵심 가치" value={employee.values.join(" · ")} /><Definition label="강점" value={employee.strengths.join(" · ")} /><Definition label="페르소나 규칙" value={employee.personaRules.join(" · ")} /><Definition label="금지 주제" value={employee.prohibitedTopics.join(" · ") || "없음"} /></dl></section>

          <section className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6"><div className="flex items-center gap-2"><Link2 className="size-4 text-cyan-200" /><h2 className="text-sm font-semibold">관계성 원장</h2></div><div className="mt-4 space-y-2">{relationships.slice(0, 12).map((relation) => <div className="rounded-md border border-white/8 px-3 py-2.5" key={relation.counterpartEmployeeId}><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-zinc-300">{relation.counterpart ? formatPersonaDisplayName(relation.counterpart) : relation.counterpartEmployeeId}</p><span className="text-[10px] text-cyan-200">{relation.interactionCount}회</span></div><p className="mt-1 text-[10px] text-zinc-600">{relation.boardTypes.map((board) => boardTypeLabels[board] ?? board).join(" · ")} · 최근 {new Date(relation.lastInteractionAt).toLocaleDateString("ko-KR")}</p></div>)}{!relationships.length ? <p className="py-5 text-center text-xs text-zinc-600">검증된 공동 참여 관계가 없습니다.</p> : null}</div></section>
        </div>
      </section>

      <CharacterContextRecords configured={storeConfigured} employeeId={employee.id} initialRecords={records} personas={characters.map((character) => ({ id: character.id, label: formatPersonaDisplayName(character) }))} />

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/8 bg-[#0b0d11] px-5 py-4 text-[11px] text-zinc-500"><span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-300" />관리자 인증 경계 내부</span><span className="inline-flex items-center gap-2"><BookOpenText className="size-4 text-cyan-200" />원문 참조형 저장</span><span>AI 요약 호출 없음 · Public 노출 없음</span></div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-3"><p className="text-lg font-semibold text-zinc-100">{value}</p><p className="mt-1 text-[9px] text-zinc-600">{label}</p></div>;
}

function Definition({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 border-b border-white/6 pb-3 last:border-0 last:pb-0"><dt className="text-[10px] font-semibold text-cyan-200/80">{label}</dt><dd className="leading-5 text-zinc-400">{value}</dd></div>;
}
