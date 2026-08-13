import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { knowledgeEntries } from "@/data";

export default function AdminKnowledgeBasePage() {
  return (
    <AdminShell
      title="검수 지식 관리"
      description="외부에 공개하지 않는 내부 검수 지식, 출처 관계, 신뢰도와 페르소나 컨텍스트 연결을 관리합니다."
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">ADMIN ONLY</Badge>
        <Badge variant="outline">{knowledgeEntries.length} records</Badge>
        <Badge variant="outline">Public exposure OFF</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {knowledgeEntries.map((entry) => (
          <article className="rounded-lg border border-white/8 bg-white/[0.02] p-5" key={entry.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{entry.category}</Badge>
              <Badge variant={entry.confidence === "High" ? "accent" : "outline"}>
                신뢰도 {entry.confidence === "High" ? "높음" : "보통"}
              </Badge>
              <Badge variant="outline">{entry.status === "Reviewed" ? "검수 완료" : entry.status}</Badge>
            </div>
            <h2 className="mt-4 text-base font-semibold text-zinc-100">{entry.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{entry.summary}</p>
            <dl className="mt-4 grid gap-2 border-t border-white/8 pt-4 text-xs sm:grid-cols-3">
              <div><dt className="text-zinc-600">최종 검토</dt><dd className="mt-1 text-zinc-300">{entry.lastReviewed}</dd></div>
              <div><dt className="text-zinc-600">Revision</dt><dd className="mt-1 text-zinc-300">{entry.revision}</dd></div>
              <div><dt className="text-zinc-600">연결 직원</dt><dd className="mt-1 text-zinc-300">{entry.relatedEmployeeIds.length}명</dd></div>
            </dl>
            <details className="mt-4 border-t border-white/8 pt-4">
              <summary className="cursor-pointer text-xs font-semibold text-cyan-200">내부 본문 보기</summary>
              <div className="mt-3 space-y-3 text-xs leading-6 text-zinc-400">
                {entry.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </details>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
