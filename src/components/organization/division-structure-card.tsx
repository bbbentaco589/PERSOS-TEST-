"use client";

import { useState } from "react";
import { ChevronDown, Network, UserRound, UsersRound } from "lucide-react";

import { DivisionIcon } from "@/components/brand/division-icon";
import { EmployeeProfileDialog } from "@/components/intranet/employee-profile-dialog";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import type { Division, Employee, Team } from "@/types";

const divisionAccent: Record<string, string> = {
  "division-strategy": "rgba(244, 63, 94, 0.18)",
  "division-governance": "rgba(245, 158, 11, 0.18)",
  "division-entertainment": "rgba(236, 72, 153, 0.18)",
  "division-editorial": "rgba(139, 92, 246, 0.18)",
  "division-intelligence": "rgba(45, 212, 191, 0.18)",
  "division-studio": "rgba(59, 130, 246, 0.2)",
};

export function DivisionStructureCard({
  division,
  teams,
  employees,
  profiles,
  sequence,
}: {
  division: Division;
  teams: Team[];
  employees: Employee[];
  profiles: PopularEmployeeProfile[];
  sequence: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [profileState, setProfileState] = useState(profiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const panelId = `division-${division.slug}-teams`;
  const selectedProfile =
    profileState.find((profile) => profile.employee.id === selectedProfileId) ??
    null;
  const accent = divisionAccent[division.id] ?? "rgba(34, 211, 238, 0.16)";

  return (
    <>
      <section
        className="group relative flex self-start flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080b11] shadow-[0_18px_70px_rgba(0,0,0,0.18)]"
        id={`division-${division.slug}`}
      >
        <div
          className="relative grid h-64 shrink-0 grid-cols-[5rem_minmax(0,1fr)] overflow-hidden sm:h-60 sm:grid-cols-[7rem_minmax(0,1fr)]"
          style={{
            background: `radial-gradient(circle at 9% 50%, ${accent}, transparent 38%), linear-gradient(110deg, ${accent}, rgba(8,11,17,0.9) 48%, #080b11 100%)`,
          }}
        >
          <div className="relative flex min-h-0 items-center justify-center overflow-hidden border-r border-white/[0.06]">
            <DivisionIcon
              className="relative size-16 sm:size-20"
              featured
              divisionId={division.id}
            />
          </div>
          <div className="flex min-w-0 flex-col px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.22em] text-zinc-600">
              <span>PERSOS ORGANIZATION</span>
              <span className="h-px flex-1 bg-white/8" />
              <span>{String(sequence).padStart(2, "0")}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {division.nameKo}
            </h2>
            <p className="mt-1 break-words font-mono text-[10px] tracking-wide text-zinc-500">
              {division.nameEn}
            </p>
            <p className="mt-4 line-clamp-3 h-[4.5rem] max-w-xl text-sm leading-6 text-zinc-400">
              {division.descriptionKo}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-5 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <UsersRound className="size-3.5" />팀 {teams.length}개
              </span>
              <span className="flex items-center gap-1.5">
                <UserRound className="size-3.5" />AI Employee {employees.length}명
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 shrink-0 border-t border-white/8 bg-[#080b11]">
          <button
            aria-controls={panelId}
            aria-expanded={expanded}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-6 py-3 text-left text-sm font-medium outline-none transition hover:bg-white/[0.035] focus-visible:bg-white/5 sm:px-7"
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <Network className="size-4 text-cyan-200/70" />
              소속 팀 보기
            </span>
            <ChevronDown
              className={`size-4 text-zinc-500 transition ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`relative border-t border-white/8 px-6 py-2 sm:px-7 ${expanded ? "block" : "hidden"}`}
            id={panelId}
          >
            <div aria-hidden="true" className="absolute bottom-8 left-[2.15rem] top-8 w-px bg-gradient-to-b from-cyan-300/45 via-white/10 to-transparent sm:left-[2.4rem]" />
            {teams.map((team) => {
              const members = employees.filter((employee) => employee.teamId === team.id);
              return (
                <section
                  className="relative scroll-mt-28 border-b border-white/8 py-5 pl-7 last:border-b-0 sm:pl-9"
                  id={`team-${team.slug}`}
                  key={team.id}
                >
                  <span aria-hidden="true" className="absolute left-0 top-7 size-3 rounded-full border-2 border-[#080b11] bg-cyan-300 shadow-[0_0_0_1px_rgba(103,232,249,0.35),0_0_18px_rgba(34,211,238,0.28)]" />
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-100">{team.nameKo}</h3>
                      <p className="mt-1 break-words font-mono text-[10px] text-zinc-600">{team.nameEn}</p>
                    </div>
                    <span className="font-mono text-[9px] tracking-wider text-zinc-600">
                      {members.length ? `${members.length} MEMBERS` : "OPEN POSITION"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-zinc-500">{team.descriptionKo}</p>
                  {members.length ? (
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {members.map((employee) => (
                        <button
                          aria-label={`${employee.nameKo} 프로필 팝업 열기`}
                          className="group/member flex min-h-12 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.055] focus-visible:outline-2 focus-visible:outline-cyan-300"
                          key={employee.id}
                          onClick={() => setSelectedProfileId(employee.id)}
                          type="button"
                        >
                          <EmployeeAvatar
                            alt={`${employee.nameKo} 프로필`}
                            className="size-9 rounded-full object-center ring-1 ring-white/10"
                            size={36}
                            src={employee.profileImage}
                          />
                          <span className="text-xs font-medium text-zinc-200 transition group-hover/member:text-cyan-100">
                            {formatPersonaDisplayName(employee)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      </section>

      {selectedProfile ? (
        <EmployeeProfileDialog
          onClose={() => setSelectedProfileId(null)}
          onToggleFollow={() =>
            setProfileState((current) =>
              current.map((profile) =>
                profile.employee.id === selectedProfile.employee.id
                  ? {
                      ...profile,
                      viewerIsFollowing: !profile.viewerIsFollowing,
                      followerCount:
                        profile.followerCount + (profile.viewerIsFollowing ? -1 : 1),
                    }
                  : profile
              )
            )
          }
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
