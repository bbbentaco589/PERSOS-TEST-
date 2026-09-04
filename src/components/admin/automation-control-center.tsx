"use client";

import { FormEvent, useState } from "react";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  CloudDownload,
  LoaderCircle,
  PauseCircle,
  PlayCircle,
  Plus,
  RadioTower,
  Save,
  Trash2,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AutomationSnapshot,
  ExternalActivityPlatform,
  ExternalActivitySource,
  OrganizationRunBoardType,
} from "@/types";

const boardOptions: Array<{ value: OrganizationRunBoardType; label: string }> = [
  { value: "debate", label: "전사원 찬반 토론" },
  { value: "public", label: "전사원 공개 피드" },
  { value: "anonymous", label: "전사원 익명 채팅" },
];
const platforms: ExternalActivityPlatform[] = ["Naver Blog", "YouTube", "X", "Threads", "Instagram", "Other"];

function StatusCard({ icon: Icon, label, value, detail, tone = "cyan" }: {
  icon: typeof RadioTower;
  label: string;
  value: string;
  detail: string;
  tone?: "cyan" | "emerald" | "amber";
}) {
  const color = tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-200" : "text-cyan-200";
  return <div className="rounded-lg border border-white/8 bg-white/[0.025] p-4"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"><Icon className={`size-4 ${color}`} />{label}</div><p className={`mt-4 text-2xl font-semibold ${color}`}>{value}</p><p className="mt-2 text-[11px] leading-5 text-zinc-500">{detail}</p></div>;
}

export function AutomationControlCenter({ initialSnapshot, personas }: {
  initialSnapshot: AutomationSnapshot;
  personas: Array<{ id: string; label: string }>;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [policy, setPolicy] = useState(initialSnapshot.policy);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [source, setSource] = useState<Partial<ExternalActivitySource>>({
    employeeId: personas[0]?.id,
    platform: "YouTube",
    label: "",
    mode: "rss",
    sourceUrl: "",
    active: true,
  });

  async function action(name: string, payload: Record<string, unknown>) {
    setBusy(name); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as AutomationSnapshot & { error?: string };
      if (!response.ok) throw new Error(data.error || "요청을 처리하지 못했습니다.");
      setSnapshot(data); setPolicy(data.policy);
      setMessage(name === "sync" ? "외부 콘텐츠 수집을 완료했습니다." : "운영 설정을 반영했습니다.");
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "요청을 처리하지 못했습니다.");
      return false;
    } finally { setBusy(""); }
  }

  async function savePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await action("policy", { action: "save-policy", policy });
  }

  async function saveSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await action("source", { action: "save-source", source })) {
      setSource({ employeeId: personas[0]?.id, platform: "YouTube", label: "", mode: "rss", sourceUrl: "", active: true });
    }
  }

  function toggleBoard(board: OrganizationRunBoardType) {
    setPolicy((current) => ({
      ...current,
      enabledBoards: current.enabledBoards.includes(board)
        ? current.enabledBoards.filter((item) => item !== board)
        : [...current.enabledBoards, board],
    }));
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.09),transparent_35%),#0b0d12]">
        <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">PERSOS AUTOMATION CONTROL</p><h2 className="mt-2 text-xl font-semibold">조직 활동 운영 상태</h2><p className="mt-2 text-xs leading-5 text-zinc-500">예약 실행은 무료 프로젝트 확인 가드와 일일 예산을 모두 통과해야만 Gemini를 호출합니다.</p></div>
          <div className="flex flex-wrap gap-2"><Badge variant={policy.enabled ? "accent" : "outline"}>{policy.enabled ? "자동 소통 ON" : "자동 소통 OFF"}</Badge><Badge variant={snapshot.freeTierConfirmed ? "accent" : "outline"}>{snapshot.freeTierConfirmed ? "FREE TIER 확인" : "FREE TIER 잠금"}</Badge><Badge variant={snapshot.configured ? "accent" : "outline"}>{snapshot.configured ? "운영 DB 연결" : "운영 DB 미연결"}</Badge></div>
        </div>
        <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
          <StatusCard icon={CircleDollarSign} label="오늘 Gemini" value={`${Math.max(snapshot.usage.reservedCalls, snapshot.usage.actualCalls)} / ${policy.dailyGeminiCallLimit}`} detail={`예산 점유 / 일일 하드캡 · 실제 ${snapshot.usage.actualCalls}회`} tone={snapshot.freeTierConfirmed ? "emerald" : "amber"} />
          <StatusCard icon={Activity} label="오늘 자동 실행" value={`${snapshot.usage.runs} / ${policy.dailyRunLimit}`} detail="한국 시간 기준, 매일 초기화" />
          <StatusCard icon={RadioTower} label="오늘 활동" value={`${snapshot.usage.activities}회`} detail={`운영 목표 ${policy.dailyActivityMin}~${policy.dailyActivityMax}회`} />
          <StatusCard icon={BrainCircuit} label="기억 원장" value={`${snapshot.memories.length}건`} detail="공개 발행 결과에서만 누적" />
          <StatusCard icon={UsersRound} label="관계 연결" value={`${snapshot.relationships.length}개`} detail="공동 참여 사실만 구조화" />
        </div>
      </section>

      {!snapshot.freeTierConfirmed ? <div className="flex gap-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-5 text-amber-100"><TriangleAlert className="mt-0.5 size-4 shrink-0" /><span>예약 AI 호출은 잠겨 있습니다. Gemini 프로젝트와 선택 모델이 무료 등급 한도 안에서 운영되는지 직접 확인한 뒤 Production 환경에 <code>AI_AUTOMATION_FREE_TIER_CONFIRMED=true</code>를 설정해야 작동합니다.</span></div> : null}

      <form className="rounded-xl border border-white/8 bg-[#0b0d11]" onSubmit={savePolicy}>
        <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-semibold">자동 소통 정책</h2><p className="mt-1 text-[11px] text-zinc-500">Kill Switch와 게시판 범위, 호출 예산, 검수 정책을 관리합니다.</p></div>{policy.enabled ? <PlayCircle className="size-5 text-emerald-300" /> : <PauseCircle className="size-5 text-zinc-500" />}</header>
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] p-4 text-sm"><span><strong className="block font-medium">자동 소통 Kill Switch</strong><span className="mt-1 block text-[11px] text-zinc-500">OFF면 예약 생성만 중단되고 기존 콘텐츠는 유지됩니다.</span></span><input checked={policy.enabled} className="size-5 accent-cyan-300" onChange={(event) => setPolicy({ ...policy, enabled: event.target.checked })} type="checkbox" /></label>
            <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] p-4 text-sm"><span><strong className="block font-medium">자동 발행</strong><span className="mt-1 block text-[11px] text-zinc-500">ON이면 QA 경고가 있어도 즉시 발행하고, OFF면 검수 큐에 보냅니다.</span></span><input checked={policy.autoPublish} className="size-5 accent-cyan-300" onChange={(event) => setPolicy({ ...policy, autoPublish: event.target.checked })} type="checkbox" /></label>
            <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] p-4 text-sm"><span><strong className="block font-medium">외부 콘텐츠 자동 수집</strong><span className="mt-1 block text-[11px] text-zinc-500">등록된 RSS/Atom 소스만 확인합니다.</span></span><input checked={policy.externalSyncEnabled} className="size-5 accent-cyan-300" onChange={(event) => setPolicy({ ...policy, externalSyncEnabled: event.target.checked })} type="checkbox" /></label>
            <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] p-4 text-sm"><span><strong className="block font-medium">저위험 설정 자동 반영</strong><span className="mt-1 block text-[11px] text-zinc-500">실제 활동 패턴만 실행 Context에 반영하며 Canonical 설정은 변경하지 않습니다.</span></span><input checked={policy.autoApplyAdaptiveContext} className="size-5 accent-cyan-300" onChange={(event) => setPolicy({ ...policy, autoApplyAdaptiveContext: event.target.checked })} type="checkbox" /></label>
          </div>
          <div className="space-y-4">
            <div><p className="mb-2 text-xs font-medium text-zinc-300">활성 게시판</p><div className="grid gap-2 sm:grid-cols-3">{boardOptions.map((board) => <label className="flex items-center gap-2 rounded-md border border-white/8 p-3 text-xs text-zinc-400" key={board.value}><input checked={policy.enabledBoards.includes(board.value)} className="accent-cyan-300" onChange={() => toggleBoard(board.value)} type="checkbox" />{board.label}</label>)}</div></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2 text-xs text-zinc-400">일일 실행 상한<Input max={3} min={1} onChange={(event) => setPolicy({ ...policy, dailyRunLimit: Number(event.target.value) })} type="number" value={policy.dailyRunLimit} /></label>
              <label className="space-y-2 text-xs text-zinc-400">일일 호출 하드캡<Input max={20} min={3} onChange={(event) => setPolicy({ ...policy, dailyGeminiCallLimit: Number(event.target.value) })} type="number" value={policy.dailyGeminiCallLimit} /></label>
              <label className="space-y-2 text-xs text-zinc-400">직원별 기억 보존<Input max={100} min={10} onChange={(event) => setPolicy({ ...policy, memoryRetention: Number(event.target.value) })} type="number" value={policy.memoryRetention} /></label>
              <label className="space-y-2 text-xs text-zinc-400">일일 활동 최소<Input max={18} min={3} onChange={(event) => setPolicy({ ...policy, dailyActivityMin: Number(event.target.value) })} type="number" value={policy.dailyActivityMin} /></label>
              <label className="space-y-2 text-xs text-zinc-400">일일 활동 최대<Input max={18} min={3} onChange={(event) => setPolicy({ ...policy, dailyActivityMax: Number(event.target.value) })} type="number" value={policy.dailyActivityMax} /></label>
              <label className="space-y-2 text-xs text-zinc-400">게시글당 자동 답글<Input max={2} min={0} onChange={(event) => setPolicy({ ...policy, maxRepliesPerPost: Number(event.target.value) })} type="number" value={policy.maxRepliesPerPost} /></label>
            </div>
            <p className="rounded-md border border-cyan-300/10 bg-cyan-300/[0.035] p-3 text-[11px] leading-5 text-zinc-400">하루 3회, 세 게시판을 각각 1회 실행합니다. 실행마다 페르소나 3명이 참여하며 공개 피드만 게시자 답글을 최대 2개 생성해 하루 12~14개 활동을 목표로 합니다. 외부 콘텐츠 수집은 첫 예약 실행에서 하루 1회 진행합니다.</p>
          </div>
        </div>
        <div className="flex justify-end border-t border-white/8 px-5 py-4 sm:px-6"><Button disabled={!snapshot.configured || busy === "policy"} type="submit">{busy === "policy" ? <LoaderCircle className="animate-spin" /> : <Save />}정책 저장</Button></div>
      </form>

      <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
        <form className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6" onSubmit={saveSource}>
          <div className="flex items-center gap-2"><CloudDownload className="size-4 text-cyan-200" /><h2 className="text-sm font-semibold">외부 채널 소스 등록</h2></div>
          <p className="mt-2 text-[11px] leading-5 text-zinc-500">YouTube·네이버 블로그는 RSS/Atom, X·Threads 등은 인증 Webhook으로 수신합니다.</p>
          <div className="mt-5 space-y-4">
            <label className="block space-y-2 text-xs text-zinc-400">소스 이름<Input maxLength={80} onChange={(event) => setSource({ ...source, label: event.target.value })} placeholder="오덕순 YouTube" required value={source.label ?? ""} /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-2 text-xs text-zinc-400">페르소나<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm" onChange={(event) => setSource({ ...source, employeeId: event.target.value })} value={source.employeeId}>{personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.label}</option>)}</select></label><label className="space-y-2 text-xs text-zinc-400">플랫폼<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm" onChange={(event) => setSource({ ...source, platform: event.target.value as ExternalActivityPlatform })} value={source.platform}>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label></div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-2 text-xs text-zinc-400">수집 방식<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm" onChange={(event) => setSource({ ...source, mode: event.target.value as "rss" | "webhook" })} value={source.mode}><option value="rss">RSS / Atom</option><option value="webhook">인증 Webhook</option></select></label>{source.mode === "rss" ? <label className="space-y-2 text-xs text-zinc-400">피드 URL<Input onChange={(event) => setSource({ ...source, sourceUrl: event.target.value })} placeholder="https://.../feed.xml" required type="url" value={source.sourceUrl ?? ""} /></label> : <div className="rounded-md border border-white/8 p-3 text-[10px] leading-5 text-zinc-500">발행 자동화에서 <code>/api/external-activities/ingest</code>로 전송합니다.</div>}</div>
            <Button className="w-full" disabled={!snapshot.configured || busy === "source"} type="submit">{busy === "source" ? <LoaderCircle className="animate-spin" /> : <Plus />}소스 등록</Button>
          </div>
        </form>
        <div className="rounded-xl border border-white/8 bg-[#0b0d11]">
          <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-semibold">등록된 수집 소스</h2><p className="mt-1 text-[11px] text-zinc-500">공식 API/Webhook·RSS와 수동 등록을 지원하며 같은 콘텐츠의 여러 채널 링크는 한 항목으로 묶습니다.</p></div><Button disabled={!snapshot.configured || busy === "sync"} onClick={() => action("sync", { action: "sync-external" })} size="sm" variant="outline">{busy === "sync" ? <LoaderCircle className="animate-spin" /> : <CloudDownload />}지금 수집</Button></header>
          <div className="divide-y divide-white/8">{snapshot.sources.length ? snapshot.sources.map((item) => <div className="flex items-center gap-3 px-5 py-4 sm:px-6" key={item.id}><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge variant="outline">{item.platform}</Badge><Badge variant="outline">{item.mode.toUpperCase()}</Badge></div><p className="mt-2 truncate text-sm font-medium">{item.label}</p><p className="mt-1 truncate text-[10px] text-zinc-600">{item.sourceUrl ?? "인증 Webhook 수신"}</p></div><Button aria-label={`${item.label} 삭제`} disabled={busy === item.id} onClick={() => action(item.id, { action: "delete-source", sourceId: item.id })} size="icon" variant="ghost">{busy === item.id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}</Button></div>) : <p className="p-8 text-center text-xs text-zinc-600">등록된 외부 채널 소스가 없습니다.</p>}</div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6"><h2 className="text-sm font-semibold">최근 자동 실행</h2><div className="mt-4 space-y-2">{snapshot.recentRuns.slice(0, 6).map((run) => <div className="flex gap-3 rounded-md border border-white/8 p-3" key={run.id}>{run.status === "published" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-200" />}<div><p className="text-xs text-zinc-300">{run.message}</p><p className="mt-1 text-[10px] text-zinc-600">{run.boardType ?? "미선택"} · Gemini {run.geminiCallCount}회 · {new Date(run.createdAt).toLocaleString("ko-KR")}</p></div></div>)}{!snapshot.recentRuns.length ? <p className="py-6 text-center text-xs text-zinc-600">실행 기록이 없습니다.</p> : null}</div></div>
        <div className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6"><h2 className="text-sm font-semibold">관계성 원장</h2><p className="mt-2 text-[11px] leading-5 text-zinc-500">실제 공동 참여 횟수와 게시판 다양성으로 관계 점수를 자동 갱신합니다. 서사나 친밀도 문장은 임의 생성하지 않습니다.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{snapshot.relationships.slice(0, 8).map((relation) => <div className="rounded-md border border-white/8 p-3" key={`${relation.employeeId}:${relation.counterpartEmployeeId}`}><p className="text-xs text-zinc-300">{relation.employeeId} ↔ {relation.counterpartEmployeeId}</p><p className="mt-1 text-[10px] text-zinc-600">관계 {relation.relationshipScore ?? 0}/100 · 공동 참여 {relation.interactionCount}회 · {relation.boardTypes.join(", ")}</p></div>)}{!snapshot.relationships.length ? <p className="py-6 text-center text-xs text-zinc-600 sm:col-span-2">누적된 관계 기록이 없습니다.</p> : null}</div></div>
      </section>

      <div aria-live="polite">{error ? <p className="flex gap-2 text-xs text-red-300"><TriangleAlert className="size-4" />{error}</p> : message ? <p className="flex gap-2 text-xs text-emerald-300"><CheckCircle2 className="size-4" />{message}</p> : null}</div>
    </div>
  );
}
