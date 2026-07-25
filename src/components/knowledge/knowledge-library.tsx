"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { KnowledgeCard } from "@/components/cards/knowledge-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { divisions, employeeShowcases, employees, knowledgeEntries, teams } from "@/data";

const selectClass = "h-10 rounded-md border border-white/10 bg-[#0d1015] px-3 text-xs text-zinc-300 outline-none focus:border-cyan-300/50";

export function KnowledgeLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [employeeId, setEmployeeId] = useState("all");

  const entries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko-KR");
    return [...knowledgeEntries]
      .filter((entry) => !normalized || `${entry.title} ${entry.summary} ${entry.category}`.toLocaleLowerCase("ko-KR").includes(normalized))
      .filter((entry) => category === "all" || entry.category === category)
      .filter((entry) => confidence === "all" || entry.confidence === confidence)
      .filter((entry) => employeeId === "all" || entry.relatedEmployeeIds.includes(employeeId))
      .sort((a, b) => b.lastReviewed.localeCompare(a.lastReviewed));
  }, [category, confidence, employeeId, query]);

  return (
    <>
      <section aria-label="지식 검색 및 필터" className="border-y border-white/8 py-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-zinc-500"><SlidersHorizontal className="size-3.5" />Library Filter</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_150px_200px]">
          <label className="relative">
            <span className="sr-only">지식 검색</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-600" />
            <input className="h-10 w-full rounded-md border border-white/10 bg-[#0d1015] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-700 focus:border-cyan-300/50" onChange={(event) => setQuery(event.target.value)} placeholder="정책, 출처, 지식 검색" value={query} />
          </label>
          <select aria-label="카테고리" className={selectClass} onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="all">전체 카테고리</option>
            {[...new Set(knowledgeEntries.map((entry) => entry.category))].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select aria-label="신뢰도" className={selectClass} onChange={(event) => setConfidence(event.target.value)} value={confidence}>
            <option value="all">전체 신뢰도</option>
            <option value="High">높음</option>
            <option value="Medium">보통</option>
            <option value="Low">낮음</option>
          </select>
          <select aria-label="관련 직원" className={selectClass} onChange={(event) => setEmployeeId(event.target.value)} value={employeeId}>
            <option value="all">전체 관련 직원</option>
            {employees.filter((employee) => employee.publicVisibility).map((employee) => <option key={employee.id} value={employee.id}>{employee.nameKo}</option>)}
          </select>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>검색 결과 {entries.length}건</span>
        <Badge variant="outline">최근 검토일 순</Badge>
      </div>

      {entries.length ? (
        <section aria-label="지식 목록" className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => {
            const showcase = employeeShowcases.find((item) => item.knowledgeEntryIds.includes(entry.id));
            const employee = employees.find((item) => item.id === showcase?.employeeId);
            const team = teams.find((item) => item.id === employee?.teamId);
            const division = divisions.find((item) => item.id === employee?.divisionId);
            return <KnowledgeCard author={employee && team && division ? { name: employee.nameKo, team: team.nameKo, division: division.nameKo } : undefined} entry={entry} key={entry.id} />;
          })}
        </section>
      ) : <EmptyState title="조건에 맞는 지식이 없습니다" description="검색어 또는 필터를 조정해 다시 확인해 주세요." />}
    </>
  );
}
