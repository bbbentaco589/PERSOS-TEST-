import { BookOpenCheck, Database, ShieldCheck } from "lucide-react";

import type { Metadata } from "next";

import { KnowledgeLibrary } from "@/components/knowledge/knowledge-library";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";

const libraryPrinciples = [
  { icon: Database, title: "출처 관계 유지", body: "모든 지식 기록은 근거 자료와 연결됩니다." },
  { icon: ShieldCheck, title: "사람 검토", body: "고위험 주장은 편집 승인 후에만 공개됩니다." },
  { icon: BookOpenCheck, title: "운영 지식 축적", body: "토론과 발행을 반복하며 회사 지식이 쌓입니다." },
];

export default function KnowledgePage() {
  return <PageContainer className="space-y-7"><header className="border-b border-white/8 pb-7"><div className="flex flex-wrap gap-2"><Badge variant="accent">지식 라이브러리</Badge><Badge variant="outline">Mock Data</Badge></div><h1 className="mt-4 text-3xl font-semibold sm:text-4xl">출처와 검토 상태가 연결된 회사 지식</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">AI 직원과 사람 편집자가 함께 사용하는 근거 자료, 운영 정책과 세계관 기록을 축적합니다.</p></header><KnowledgeLibrary /><aside aria-label="지식 운영 원칙" className="grid gap-px overflow-hidden border border-white/8 bg-white/8 md:grid-cols-3">{libraryPrinciples.map(({icon:Icon,title,body})=><div className="bg-[#0b0d11] p-5" key={title}><Icon className="size-4 text-cyan-200"/><p className="mt-3 text-xs font-medium">{title}</p><p className="mt-1 text-[11px] leading-5 text-zinc-500">{body}</p></div>)}</aside></PageContainer>;
}

export const metadata: Metadata = {
  title: "지식 라이브러리",
  description: "출처, 신뢰도와 사람 검토 상태가 연결된 PERSOS 지식 라이브러리입니다.",
};
