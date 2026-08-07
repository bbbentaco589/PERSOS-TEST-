import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CircleCheck } from "lucide-react";

import { CoreCrystalBadge } from "@/components/brand/core-crystal-badge";
import { DivisionIcon } from "@/components/brand/division-icon";
import { Badge } from "@/components/ui/badge";
import { divisions, teams } from "@/data";
import type { Character } from "@/types";

export function CharacterCard({ character }: { character: Character }) {
  const division = divisions.find((item) => item.id === character.divisionId);
  const team = teams.find((item) => item.id === character.teamId);
  return (
    <Link className="group block h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.04] motion-reduce:transform-none" href={`/characters/${character.slug}`}>
      <div className="relative h-44 overflow-hidden border-b border-white/8 bg-black" data-asset-placeholder={character.profileStage === "Rough" && character.slug !== "tect" ? "employee-profile" : undefined}>
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: character.brandColor }} />
        <Image alt={`${character.nameKo} 프로필`} className={character.slug === "tect" ? "absolute inset-0 size-full object-cover object-[center_24%] opacity-80 transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" : character.profileStage === "Rough" ? "absolute inset-0 size-full object-contain p-12 opacity-40" : "absolute inset-0 size-full object-cover object-[center_24%] opacity-80 transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"} fill loading="eager" sizes="(min-width: 1536px) 320px, (min-width: 768px) 50vw, 100vw" src={character.profileImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <DivisionIcon className="size-9" divisionId={character.divisionId} />
            <div>
              <p className="text-[10px] font-semibold uppercase text-cyan-100">{division?.nameKo}</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">{team?.nameKo}</p>
            </div>
          </div>
          <Badge variant={character.status === "Active" ? "accent" : "outline"}>{character.status === "Active" ? "업무 중" : "채용 중"}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase text-zinc-500">{character.employeeCode} · {character.nameEn}</p>
            <h2 className="mt-1 text-lg font-semibold">{character.nameKo}</h2>
            <p className="mt-1 text-xs text-cyan-200">{character.jobTitleKo}</p>
          </div>
          <ArrowUpRight className="size-4 text-zinc-600 transition group-hover:text-white" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{character.hook}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{character.specialtiesKo.slice(0, 3).map((specialty) => <Badge key={specialty} variant="outline">{specialty}</Badge>)}</div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-3 text-[11px] text-zinc-500">
          <CoreCrystalBadge compact label="Persona Core" />
          <span className={character.status === "Active" ? "flex shrink-0 items-center gap-1 text-emerald-300" : "flex shrink-0 items-center gap-1 text-amber-200"}><CircleCheck className="size-3" />{character.status === "Active" ? "업무 중" : "채용 중"}</span>
        </div>
      </div>
    </Link>
  );
}
