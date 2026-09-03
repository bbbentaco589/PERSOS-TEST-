"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, ExternalLink, LoaderCircle, Pencil, Plus, Trash2, TriangleAlert, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExternalActivityPlatform, ExternalActivityPost, ExternalActivityPostInput } from "@/types/external-activity";

const platforms: ExternalActivityPlatform[] = ["Naver Blog", "Instagram", "YouTube", "X", "Threads", "Other"];

function todayInKorea() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(new Date());
}

function emptyForm(employeeId = ""): ExternalActivityPostInput {
  return { employeeId, platform: "Naver Blog", title: "", summary: "", externalUrl: "", publishedAt: todayInKorea(), active: true };
}

export function ExternalActivityManager({ initialPosts, personas, storageConfigured }: {
  initialPosts: ExternalActivityPost[];
  personas: { id: string; label: string }[];
  storageConfigured: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState<ExternalActivityPostInput>(() => emptyForm(personas[0]?.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setForm(emptyForm(personas[0]?.id));
    setEditingId(null);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storageConfigured || busyId) return;
    setBusyId("save"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/external-activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editingId ?? undefined }) });
      const data = (await response.json()) as { posts?: ExternalActivityPost[]; error?: string };
      if (!response.ok || !data.posts) throw new Error(data.error || "외부 활동을 저장하지 못했습니다.");
      setPosts(data.posts); setMessage(editingId ? "외부 활동을 수정했습니다." : "외부 활동을 등록했습니다."); resetForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "외부 활동을 저장하지 못했습니다.");
    } finally { setBusyId(null); }
  }

  async function remove(id: string) {
    if (!storageConfigured || busyId || !window.confirm("이 외부 활동을 삭제할까요?")) return;
    setBusyId(id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/external-activities", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = (await response.json()) as { posts?: ExternalActivityPost[]; error?: string };
      if (!response.ok || !data.posts) throw new Error(data.error || "외부 활동을 삭제하지 못했습니다.");
      setPosts(data.posts); setMessage("외부 활동을 삭제했습니다."); if (editingId === id) resetForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "외부 활동을 삭제하지 못했습니다.");
    } finally { setBusyId(null); }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-blue-300/15 bg-[#0b0d11]">
      <header className="flex flex-col gap-3 border-b border-white/8 bg-blue-400/[0.035] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><div className="flex items-center gap-2 text-sm font-semibold"><ExternalLink className="size-4 text-blue-200" />전사원 외부 활동</div><p className="mt-2 text-xs leading-5 text-zinc-500">페르소나 IP로 외부 채널에 발행한 콘텐츠의 요약과 원문 링크를 관리합니다.</p></div>
        <div className="flex gap-2"><Badge variant={storageConfigured ? "accent" : "outline"}>{storageConfigured ? "KV 연결" : "저장소 미연결"}</Badge><Badge variant="outline">{posts.length} / 100</Badge></div>
      </header>
      <div className="grid gap-px bg-white/8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <div className="bg-[#0b0d11] p-5 sm:p-6">
          <h2 className="text-sm font-semibold">등록된 외부 활동</h2>
          <div className="mt-4 space-y-3">
            {posts.length === 0 ? <p className="rounded-md border border-dashed border-white/10 p-6 text-center text-xs text-zinc-600">등록된 외부 활동이 없습니다.</p> : posts.map((post) => (
              <article className="grid gap-3 rounded-md border border-white/8 bg-black/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto]" key={post.id}>
                <div className="min-w-0"><div className="flex flex-wrap gap-2">{post.channelLinks.map((channel) => <Badge key={`${channel.platform}:${channel.url}`} variant="outline">{channel.platform}</Badge>)}<Badge variant={post.active ? "accent" : "outline"}>{post.active ? "공개" : "숨김"}</Badge></div><h3 className="mt-2 line-clamp-1 text-xs font-semibold">{post.title}</h3><p className="mt-2 flex items-center gap-1 text-[9px] text-zinc-600"><CalendarDays className="size-3" />{post.publishedAt} · {post.channelLinks.length}개 채널 묶음</p></div>
                <div className="flex gap-1"><Button aria-label={`${post.title} 수정`} onClick={() => { setEditingId(post.id); setForm(post); setError(""); setMessage(""); }} size="icon" type="button" variant="outline"><Pencil /></Button><Button aria-label={`${post.title} 삭제`} disabled={busyId === post.id} onClick={() => remove(post.id)} size="icon" type="button" variant="ghost">{busyId === post.id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}</Button></div>
              </article>
            ))}
          </div>
        </div>
        <form className="space-y-5 bg-[#0b0d11] p-5 sm:p-6" onSubmit={save}>
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">{editingId ? "외부 활동 수정" : "외부 활동 등록"}</h2>{editingId ? <Button onClick={resetForm} size="sm" type="button" variant="ghost"><X />새로 작성</Button> : null}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-zinc-400">페르소나<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm text-zinc-100" onChange={(event) => setForm({ ...form, employeeId: event.target.value })} required value={form.employeeId}>{personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.label}</option>)}</select></label>
            <label className="space-y-2 text-xs text-zinc-400">플랫폼<select className="h-10 w-full rounded-md border border-white/10 bg-[#101319] px-3 text-sm text-zinc-100" onChange={(event) => setForm({ ...form, platform: event.target.value as ExternalActivityPlatform })} value={form.platform}>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
          </div>
          <label className="block space-y-2 text-xs text-zinc-400">제목<Input maxLength={120} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="외부에 발행된 콘텐츠 제목" required value={form.title} /></label>
          <label className="block space-y-2 text-xs text-zinc-400">짧은 요약<textarea className="min-h-28 w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 outline-none focus:border-blue-300/50" maxLength={300} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="게시판에서 보여 줄 핵심 내용을 1~3문장으로 작성하세요." required value={form.summary} /></label>
          <label className="block space-y-2 text-xs text-zinc-400">외부 원문 링크<Input maxLength={2000} onChange={(event) => setForm({ ...form, externalUrl: event.target.value })} placeholder="https://blog.naver.com/..." required type="url" value={form.externalUrl} /><span className="block text-[9px] text-zinc-600">보안을 위해 https:// 링크만 허용합니다.</span></label>
          <label className="block space-y-2 text-xs text-zinc-400">발행일<Input onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} required type="date" value={form.publishedAt} /></label>
          <label className="flex items-center gap-3 rounded-md border border-white/8 p-3 text-xs text-zinc-300"><input checked={form.active} className="size-4 accent-cyan-300" onChange={(event) => setForm({ ...form, active: event.target.checked })} type="checkbox" />공개 게시판에 노출</label>
          <div aria-live="polite">{error ? <p className="flex gap-2 text-xs text-red-300"><TriangleAlert className="size-4" />{error}</p> : message ? <p className="flex gap-2 text-xs text-emerald-300"><CheckCircle2 className="size-4" />{message}</p> : null}</div>
          <Button className="w-full" disabled={!storageConfigured || busyId === "save"} size="lg" type="submit">{busyId === "save" ? <LoaderCircle className="animate-spin" /> : <Plus />}{editingId ? "수정 저장" : "외부 활동 등록"}</Button>
        </form>
      </div>
    </section>
  );
}
