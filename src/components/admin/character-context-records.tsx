"use client";

import { useState } from "react";
import { Bookmark, LoaderCircle, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CharacterContextRecord,
  CharacterContextRecordCategory,
} from "@/types";

const categories: Array<{ value: CharacterContextRecordCategory; label: string }> = [
  { value: "story", label: "스토리" },
  { value: "history", label: "히스토리" },
  { value: "relationship", label: "관계성" },
  { value: "setting", label: "설정·콘셉트" },
  { value: "memory", label: "소통 기억" },
];

function categoryLabel(category: CharacterContextRecordCategory) {
  return categories.find((item) => item.value === category)?.label ?? category;
}

export function CharacterContextRecords({
  employeeId,
  initialRecords,
  personas,
  configured,
}: {
  employeeId: string;
  initialRecords: CharacterContextRecord[];
  personas: Array<{ id: string; label: string }>;
  configured: boolean;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  const [form, setForm] = useState({
    category: "memory" as CharacterContextRecordCategory,
    title: "",
    body: "",
    relatedEmployeeId: "",
    evidenceUrl: "",
    pinned: false,
  });

  async function request(payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/characters/${employeeId}/context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json() as { records?: CharacterContextRecord[]; error?: string };
    if (!response.ok || !result.records) throw new Error(result.error || "기록을 저장하지 못했습니다.");
    setRecords(result.records);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy("save");
    setError(undefined);
    try {
      await request(form);
      setForm({ category: "memory", title: "", body: "", relatedEmployeeId: "", evidenceUrl: "", pinned: false });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "기록을 저장하지 못했습니다.");
    } finally {
      setBusy(undefined);
    }
  }

  async function remove(recordId: string) {
    setBusy(recordId);
    setError(undefined);
    try {
      await request({ action: "delete", recordId });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "기록을 삭제하지 못했습니다.");
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
      <form className="rounded-xl border border-white/8 bg-[#0b0d11] p-5 sm:p-6" onSubmit={submit}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-sm font-semibold">관리자 컨텍스트 기록</h2><p className="mt-1 text-[11px] leading-5 text-zinc-500">사실·해석·설정 변경을 분류해 누적합니다. AI 호출은 발생하지 않습니다.</p></div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-2 py-1 text-[9px] font-semibold text-cyan-200">ADMIN ONLY</span>
        </div>
        <div className="mt-5 grid gap-3">
          <label className="space-y-2 text-xs text-zinc-400">분류<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm text-zinc-200" onChange={(event) => setForm({ ...form, category: event.target.value as CharacterContextRecordCategory })} value={form.category}>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
          <label className="space-y-2 text-xs text-zinc-400">제목<Input maxLength={100} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="예: 공개 피드에서 드러난 판단 방식" required value={form.title} /></label>
          <label className="space-y-2 text-xs text-zinc-400">기록 내용<textarea className="min-h-28 w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-cyan-300/50 focus:ring-3 focus:ring-cyan-300/15" maxLength={2000} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="관찰한 사실과 해석을 구분해 작성하세요." required value={form.body} /></label>
          <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-2 text-xs text-zinc-400">연결 페르소나<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm text-zinc-200" onChange={(event) => setForm({ ...form, relatedEmployeeId: event.target.value })} value={form.relatedEmployeeId}><option value="">없음</option>{personas.filter((persona) => persona.id !== employeeId).map((persona) => <option key={persona.id} value={persona.id}>{persona.label}</option>)}</select></label><label className="space-y-2 text-xs text-zinc-400">근거 링크<Input onChange={(event) => setForm({ ...form, evidenceUrl: event.target.value })} placeholder="https://..." type="url" value={form.evidenceUrl} /></label></div>
          <label className="flex items-center gap-2 text-xs text-zinc-400"><input checked={form.pinned} onChange={(event) => setForm({ ...form, pinned: event.target.checked })} type="checkbox" />실행 컨텍스트 미리보기에 고정</label>
          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
          <Button className="mt-1 w-full" disabled={!configured || busy === "save"} type="submit">{busy === "save" ? <LoaderCircle className="animate-spin" /> : <Plus />}기록 추가</Button>
          {!configured ? <p className="text-[10px] leading-4 text-amber-200/80">운영 KV가 연결되면 기록 저장이 활성화됩니다.</p> : null}
        </div>
      </form>

      <div className="rounded-xl border border-white/8 bg-[#0b0d11]">
        <header className="border-b border-white/8 px-5 py-4 sm:px-6"><h2 className="text-sm font-semibold">누적 기록 {records.length}건</h2><p className="mt-1 text-[11px] text-zinc-500">고정 기록이 먼저 표시되며 모든 항목은 관리자 화면에만 노출됩니다.</p></header>
        <div className="max-h-[580px] divide-y divide-white/8 overflow-y-auto">
          {records.map((record) => (
            <article className="px-5 py-4 sm:px-6" key={record.id}>
              <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded border border-white/10 px-2 py-0.5 text-[9px] font-semibold text-cyan-200">{categoryLabel(record.category)}</span>{record.pinned ? <span className="inline-flex items-center gap-1 text-[9px] text-amber-200"><Bookmark className="size-3" />고정</span> : null}<time className="text-[9px] text-zinc-700">{new Date(record.updatedAt).toLocaleString("ko-KR")}</time></div><h3 className="mt-2 text-sm font-medium text-zinc-200">{record.title}</h3><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-500">{record.body}</p>{record.evidenceUrl ? <a className="mt-2 inline-block text-[10px] text-cyan-300 hover:underline" href={record.evidenceUrl} rel="noreferrer" target="_blank">근거 열기 →</a> : null}</div><Button aria-label={`${record.title} 삭제`} disabled={busy === record.id} onClick={() => remove(record.id)} size="icon-sm" type="button" variant="ghost">{busy === record.id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}</Button></div>
            </article>
          ))}
          {!records.length ? <p className="p-10 text-center text-xs text-zinc-600">아직 관리자 기록이 없습니다.</p> : null}
        </div>
      </div>
    </section>
  );
}
