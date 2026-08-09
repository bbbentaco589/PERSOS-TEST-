import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, CalendarCheck, FileSearch, ShieldCheck, UsersRound } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { knowledgeEntries, sources, employees } from "@/data";
import { formatPersonaDisplayName } from "@/lib/persona-display";

export function generateStaticParams() {
  return knowledgeEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = knowledgeEntries.find((item) => item.slug === slug);
  return entry ? { title: entry.title, description: entry.summary } : { title: "지식을 찾을 수 없습니다" };
}

export default async function KnowledgeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = knowledgeEntries.find((item) => item.slug === slug);
  if (!entry) notFound();

  const relatedSources = sources.filter((source) => entry.relatedSourceIds.includes(source.id));
  const relatedEmployees = employees.filter((employee) => entry.relatedEmployeeIds.includes(employee.id));
  const relatedEntries = knowledgeEntries.filter((item) => item.id !== entry.id && item.category === entry.category);

  return (
    <PageContainer className="space-y-7 pt-5 lg:pt-7">
      <Breadcrumb items={[{ label: "지식 라이브러리", href: "/knowledge" }, { label: entry.title }]} />
      <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <header className="border-b border-white/8 pb-7">
            <div className="flex flex-wrap gap-2"><Badge variant="accent">{entry.category}</Badge><Badge variant="outline">신뢰도 {entry.confidence === "High" ? "높음" : "보통"}</Badge><Badge variant="outline">{entry.status === "Reviewed" ? "검수 완료" : entry.status}</Badge><Badge variant="outline">Mock Data</Badge></div>
            <h1 className="text-balance mt-5 text-3xl font-semibold leading-tight sm:text-4xl">{entry.title}</h1>
            <p className="mt-4 text-base leading-8 text-zinc-300">{entry.summary}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-zinc-500"><span className="flex items-center gap-1.5"><CalendarCheck className="size-3.5" />최종 검토 {entry.lastReviewed}</span><span>{entry.revision}</span></div>
          </header>
          <section aria-labelledby="knowledge-body-title" className="py-8">
            <h2 className="sr-only" id="knowledge-body-title">지식 본문</h2>
            <div className="space-y-5 text-[15px] leading-8 text-zinc-300">{entry.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>
          <section aria-labelledby="knowledge-sources-title" className="border-t border-white/8 pt-7">
            <div className="flex items-center gap-2"><FileSearch className="size-4 text-cyan-200" /><h2 className="font-semibold" id="knowledge-sources-title">연결된 출처</h2></div>
            <div className="mt-4 divide-y divide-white/8 border-y border-white/8">{relatedSources.length ? relatedSources.map((source) => <div className="py-4" key={source.id}><p className="text-sm font-medium">{source.name}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{source.summary}</p><p className="mt-2 text-[10px] text-zinc-600">{source.trustLevel} · 검토 {source.lastReviewed}</p></div>) : <p className="py-5 text-sm text-zinc-500">공개 가능한 출처 메타데이터가 없습니다.</p>}</div>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="border-y border-white/8 py-5"><div className="flex items-center gap-2"><UsersRound className="size-4 text-cyan-200" /><h2 className="text-sm font-semibold">관련 직원</h2></div><div className="mt-4 space-y-3">{relatedEmployees.map((employee) => <Link className="flex items-center gap-3 rounded-md p-2 transition hover:bg-white/5" href={`/characters/${employee.slug}`} key={employee.id}><EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-9 rounded-full" size={36} src={employee.profileImage} /><div><p className="text-xs font-medium">{formatPersonaDisplayName(employee)}</p><p className="mt-1 text-[10px] text-zinc-600">{employee.jobTitleKo}</p></div></Link>)}</div></section>
          <section><div className="flex items-center gap-2"><Archive className="size-4 text-zinc-500" /><h2 className="text-sm font-semibold">Revision</h2></div><p className="mt-3 text-xs leading-6 text-zinc-500">현재 버전 {entry.revision}. 이전 버전 Archive는 운영 데이터 연결 전입니다.</p></section>
          <section className="border-t border-white/8 pt-5"><div className="flex items-start gap-2 text-xs leading-6 text-zinc-500"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-300" />이 기록은 사람 검토를 통과한 저장 데이터이며 페이지 진입 시 AI를 호출하지 않습니다.</div></section>
          {relatedEntries.length ? <section><h2 className="text-sm font-semibold">관련 지식</h2><div className="mt-3 space-y-2">{relatedEntries.map((item) => <Link className="block border border-white/8 p-3 text-xs text-zinc-400 hover:text-cyan-200" href={`/knowledge/${item.slug}`} key={item.id}>{item.title}</Link>)}</div></section> : null}
        </aside>
      </article>
    </PageContainer>
  );
}
