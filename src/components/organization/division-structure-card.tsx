"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, UserRound, UsersRound } from "lucide-react";

import { DivisionIcon } from "@/components/brand/division-icon";
import { Badge } from "@/components/ui/badge";
import type { Division, Employee, Team } from "@/types";

export function DivisionStructureCard({
  division,
  teams,
  employees,
}: {
  division: Division;
  teams: Team[];
  employees: Employee[];
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `division-${division.slug}-teams`;

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.025]" id={`division-${division.slug}`}>
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <DivisionIcon className="size-11" divisionId={division.id} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={division.status === "Active" ? "accent" : "outline"}>
              {division.status === "Active" ? "운영 중" : "확장 예정"}
            </Badge>
            <Badge variant="outline">{division.organizationType === "Headquarters" ? "본부" : "사업부"}</Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold">{division.nameKo}</h2>
          <p className="mt-1 break-words text-xs text-zinc-500">{division.nameEn}</p>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{division.descriptionKo}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><UsersRound className="size-3.5" />팀 {teams.length}개</span>
            <span className="flex items-center gap-1.5"><UserRound className="size-3.5" />AI Employee {employees.length}명</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <button aria-controls={panelId} aria-expanded={expanded} className="flex min-h-12 w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm font-medium outline-none transition hover:bg-white/5 focus-visible:bg-white/5 sm:px-6" onClick={() => setExpanded((current) => !current)} type="button">
          <span>소속 팀 보기</span>
          <ChevronDown className={`size-4 text-zinc-500 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
        <div className={`divide-y divide-white/8 border-t border-white/8 ${expanded ? "block" : "hidden"}`} id={panelId}>
          {teams.map((team) => {
            const members = employees.filter((employee) => employee.teamId === team.id);
            return (
              <section className="scroll-mt-28 px-5 py-4 sm:px-6" id={`team-${team.slug}`} key={team.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-200">{team.nameKo}</h3>
                    <p className="mt-1 break-words text-[11px] text-zinc-600">{team.nameEn}</p>
                  </div>
                  <Badge variant={members.length ? "accent" : "outline"}>
                    {members.length ? `직원 ${members.length}명` : "직원 배치 예정"}
                  </Badge>
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-500">{team.descriptionKo}</p>
                {members.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.map((employee) => (
                      <Link className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-cyan-300" href={`/characters/${employee.slug}`} key={employee.id}>
                        {employee.nameKo} · {employee.jobTitleKo}{employee.profileStage === "Rough" ? " · Rough" : ""}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
