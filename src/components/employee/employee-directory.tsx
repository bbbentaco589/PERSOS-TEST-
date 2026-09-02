"use client";

import { useState } from "react";
import { LayoutGrid, Search, SlidersHorizontal } from "lucide-react";

import { CharacterCard } from "@/components/cards/character-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { publicDivisionOrder } from "@/constants/navigation";
import { characters, divisions, teams } from "@/data";
import { isPublicCharacter } from "@/lib/character-runtime-policy";

const selectClass = "h-10 min-w-0 rounded-md border border-white/10 bg-[#0d1015] px-3 text-xs text-zinc-300 outline-none focus:border-cyan-300/50";
const divisionOrder = new Map<string, number>(
  publicDivisionOrder.map((id, index) => [id, index])
);
const teamOrder = new Map(teams.map((team) => [team.id, team.displayOrder]));
const canonicalPersonaOrder = new Map(
  ["tect", "sig", "lo-pay-park", "lumi", "pixeur", "ottucksoon"].map((slug, index) => [slug, index])
);
const publicCharacters = characters
  .filter(isPublicCharacter)
  .toSorted((a, b) => {
    const canonicalDifference = (canonicalPersonaOrder.get(a.slug) ?? canonicalPersonaOrder.size)
      - (canonicalPersonaOrder.get(b.slug) ?? canonicalPersonaOrder.size);
    if (canonicalDifference !== 0) return canonicalDifference;

    const divisionDifference = (divisionOrder.get(a.divisionId) ?? Number.MAX_SAFE_INTEGER)
      - (divisionOrder.get(b.divisionId) ?? Number.MAX_SAFE_INTEGER);
    if (divisionDifference !== 0) return divisionDifference;

    const teamDifference = (teamOrder.get(a.teamId) ?? Number.MAX_SAFE_INTEGER)
      - (teamOrder.get(b.teamId) ?? Number.MAX_SAFE_INTEGER);
    if (teamDifference !== 0) return teamDifference;

    return a.nameKo.localeCompare(b.nameKo, "ko");
  });
const expertiseOptions = [...new Set(publicCharacters.flatMap((character) => character.specialtiesKo))].sort((a, b) => a.localeCompare(b, "ko"));

export function EmployeeDirectory() {
  const [query, setQuery] = useState("");
  const [divisionId, setDivisionId] = useState("all");
  const [teamId, setTeamId] = useState("all");
  const [status, setStatus] = useState("all");
  const [expertise, setExpertise] = useState("all");

  const visibleTeams = teams.filter((team) => divisionId === "all" || team.divisionId === divisionId);
  const filteredCharacters = (() => {
    const normalized = query.trim().toLocaleLowerCase("ko-KR");
    return publicCharacters.filter((character) => {
      const searchable = `${character.nameKo} ${character.nameEn} ${character.jobTitleKo} ${character.specialtiesKo.join(" ")}`.toLocaleLowerCase("ko-KR");
      return (!normalized || searchable.includes(normalized))
        && (divisionId === "all" || character.divisionId === divisionId)
        && (teamId === "all" || character.teamId === teamId)
        && (status === "all" || character.status === status)
        && (expertise === "all" || character.specialtiesKo.includes(expertise));
    });
  })();

  return (
    <>
      <section aria-label="페르소나 검색 및 필터" className="border-y border-white/8 py-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-zinc-500"><SlidersHorizontal className="size-3.5" />Employee Filter</div>
        <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-[minmax(200px,1.25fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1fr)]">
          <label className="relative col-span-2 xl:col-span-1"><span className="sr-only">직원 검색</span><Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-600" /><input className="h-10 w-full rounded-md border border-white/10 bg-[#0d1015] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-700 focus:border-cyan-300/50" onChange={(event) => setQuery(event.target.value)} placeholder="이름, 직무, 전문 분야 검색" value={query} /></label>
          <select aria-label="사업부" className={selectClass} onChange={(event) => { setDivisionId(event.target.value); setTeamId("all"); }} value={divisionId}><option value="all">전체 사업부</option>{[...divisions].sort((a, b) => a.displayOrder - b.displayOrder).map((division) => <option key={division.id} value={division.id}>{division.nameKo}</option>)}</select>
          <select aria-label="팀" className={selectClass} onChange={(event) => setTeamId(event.target.value)} value={teamId}><option value="all">전체 팀</option>{visibleTeams.map((team) => <option key={team.id} value={team.id}>{team.nameKo}</option>)}</select>
          <select aria-label="상태" className={selectClass} onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">전체 상태</option><option value="Active">업무 중</option><option value="Draft">채용 중</option></select>
          <select aria-label="전문 분야" className={selectClass} onChange={(event) => setExpertise(event.target.value)} value={expertise}><option value="all">전체 전문 분야</option>{expertiseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500"><span>공개 프로필 {filteredCharacters.length}명 / 전체 {publicCharacters.length}명</span><div className="flex gap-2"><Badge variant="accent">업무 중 {publicCharacters.filter((item) => item.status === "Active").length}</Badge><Badge variant="outline">채용 중 {publicCharacters.filter((item) => item.status === "Draft").length}</Badge><span className="grid size-6 place-items-center rounded border border-white/10" title="그리드 보기"><LayoutGrid className="size-3" /></span></div></div>
      {filteredCharacters.length ? <section aria-label="AI 직원 목록" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{filteredCharacters.map((character) => <CharacterCard character={character} key={character.id} />)}</section> : <EmptyState title="조건에 맞는 페르소나가 없습니다" description="검색어 또는 조직·상태 필터를 조정해 주세요." />}
    </>
  );
}
