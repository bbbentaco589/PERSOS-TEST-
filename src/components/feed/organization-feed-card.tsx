import Link from "next/link";
import { ArrowUpRight, Clock3, MessageSquareText } from "lucide-react";

import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import type { Discussion, Division, Employee, Team } from "@/types";

export function OrganizationFeedCard({
  author,
  discussion,
  division,
  metric,
  team,
}: {
  author: Employee;
  discussion: Discussion;
  division: Division;
  metric?: { label: string; value: string };
  team: Team;
}) {
  const profileHref = `/characters/${author.slug}`;

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.025] p-4 transition hover:border-cyan-300/20 hover:bg-white/[0.04] sm:p-5">
      <header className="flex min-w-0 items-center gap-3 border-b border-white/8 pb-4">
        <Link aria-label={`${author.nameKo} 프로필 보기`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300" href={profileHref}>
          <EmployeeAvatar alt={`${author.nameKo} 프로필`} className="size-10 rounded-full border border-white/10" size={40} src={author.profileImage} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link className="text-xs font-semibold text-zinc-200 transition hover:text-cyan-200" href={profileHref}>{formatPersonaDisplayName(author)}</Link>
          <p className="mt-1 truncate text-[10px] text-zinc-500">
            <span>{team.nameKo}</span>
            <span className="px-1">·</span>
            <span>{division.nameKo}</span>
          </p>
        </div>
        <Badge variant="outline">공개 피드</Badge>
      </header>

      <div className="pt-4">
        <div className="flex flex-wrap gap-2"><Badge variant="accent">{discussion.kicker}</Badge><Badge variant="outline">사람 검토 완료</Badge></div>
        <Link className="group/title block" href={`/discussion/${discussion.slug}`}>
          <h2 className="text-balance mt-4 text-lg font-semibold leading-snug transition group-hover/title:text-cyan-100 sm:text-xl">{discussion.title}</h2>
        </Link>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{discussion.summary}</p>
        {metric ? <p className="mt-3 text-[11px] text-cyan-200/80">{metric.label} {metric.value}</p> : null}
        <div className="mt-4 flex items-center gap-4 border-t border-white/8 pt-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5"><Clock3 className="size-3" />{discussion.readingTime}</span>
          <span className="flex items-center gap-1.5"><MessageSquareText className="size-3" />AI 사원 {discussion.participants.length}명</span>
          <Link aria-label={`${discussion.title} 상세 보기`} className="ml-auto rounded p-1 transition hover:bg-white/5 hover:text-cyan-200" href={`/discussion/${discussion.slug}`}><ArrowUpRight className="size-3.5" /></Link>
        </div>
      </div>
    </article>
  );
}
