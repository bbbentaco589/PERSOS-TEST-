import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CircleCheck } from "lucide-react";

import { CoreCrystalBadge } from "@/components/brand/core-crystal-badge";
import { DivisionIcon } from "@/components/brand/division-icon";
import { Badge } from "@/components/ui/badge";
import { divisions, teams } from "@/data";
import type { Character } from "@/types";

const approvedProfileImageClass =
  "object-cover object-center opacity-90 transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none";
const roughProfileImageClass = "object-contain object-center p-10 opacity-45";

function getProfileImageClass(character: Character) {
  if (character.profileStage === "Rough") return roughProfileImageClass;
  return approvedProfileImageClass;
}

export function CharacterCard({ character }: { character: Character }) {
  const division = divisions.find((item) => item.id === character.divisionId);
  const team = teams.find((item) => item.id === character.teamId);
  const isActive = character.status === "Active";

  return (
    <Link
      className="group relative block h-full min-h-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0d12] shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.3)] motion-reduce:transform-none"
      href={`/characters/${character.slug}`}
    >
      <div aria-hidden="true" className="absolute left-1/2 top-2 z-20 h-1.5 w-12 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 shadow-inner" />
      <div className="relative flex min-h-14 items-end justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-5">
        <div>
          <p className="font-mono text-[8px] font-semibold tracking-[0.14em] text-cyan-100/80">PERSOS AI COMPANY</p>
          <p className="mt-1 font-mono text-[8px] tracking-[0.16em] text-zinc-700">EMPLOYEE IDENTIFICATION</p>
        </div>
        <Badge
          className={isActive ? "whitespace-nowrap border-emerald-300/25 bg-emerald-300/10 text-emerald-200" : "whitespace-nowrap border-amber-300/20 bg-amber-300/[0.07] text-amber-200"}
          variant="outline"
        >
          {isActive ? "업무 중" : "채용 중"}
        </Badge>
      </div>

      <div className="p-3">
        <div
          className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black"
          data-asset-placeholder={character.profileStage === "Rough" && character.slug !== "tect" ? "employee-profile" : undefined}
        >
          <Image
            alt={`${character.nameKo} 프로필`}
            className={getProfileImageClass(character)}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            src={character.profileImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/[0.025]" />
          <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: character.brandColor }} />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-white/10 bg-black/60 px-2 py-1.5 backdrop-blur-md">
            <DivisionIcon className="size-7" divisionId={character.divisionId} />
            <span className="max-w-32 truncate text-[9px] font-medium text-zinc-200">{division?.nameKo}</span>
          </div>
        </div>

        <div className="px-1 pb-1 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-mono text-[9px] uppercase tracking-wide text-zinc-600">{character.employeeCode}</p>
              <h2 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-white">{character.nameKo}</h2>
              <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-500">{character.nameEn}</p>
            </div>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.025] text-zinc-600 transition group-hover:border-cyan-300/25 group-hover:text-cyan-100">
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          <p className="mt-3 truncate text-xs font-medium text-cyan-200">{character.jobTitleKo}</p>
          <div className="mt-3 flex items-center gap-2 border-y border-white/8 py-3">
            <BadgeCheck className="size-3.5 shrink-0 text-cyan-200/70" />
            <p className="min-w-0 truncate text-[10px] text-zinc-500">{team?.nameKo}</p>
          </div>

          <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
            {character.specialtiesKo.slice(0, 2).map((specialty) => (
              <Badge className="max-w-full truncate" key={specialty} variant="outline">{specialty}</Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-3 text-[10px] text-zinc-500">
            <CoreCrystalBadge compact label="PERSONA CORE" />
            <span className={isActive ? "flex shrink-0 items-center gap-1 text-emerald-300" : "flex shrink-0 items-center gap-1 text-amber-200"}>
              <CircleCheck className="size-3" />{isActive ? "ACTIVE" : "CANDIDATE"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
