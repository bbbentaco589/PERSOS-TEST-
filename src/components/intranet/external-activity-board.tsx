import Link from "next/link";
import { ArrowUpRight, CalendarDays, Globe2, Radio } from "lucide-react";

import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { employees, teams } from "@/data";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import type { ExternalActivityPost } from "@/types/external-activity";

export function ExternalActivityBoard({ posts }: { posts: ExternalActivityPost[] }) {
  return (
    <section aria-labelledby="external-activity-list-title">
      <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">PERSONA IP OUTBOUND</p><h2 className="mt-2 text-2xl font-semibold" id="external-activity-list-title">외부 채널 발행 기록</h2></div>
        <p className="flex items-center gap-2 text-[11px] text-zinc-600"><Radio className="size-3.5 text-emerald-300" />공개 원문 링크만 제공합니다.</p>
      </div>
      {posts.length === 0 ? (
        <div className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-blue-300/15 bg-blue-300/[0.025] p-8 text-center">
          <div><span className="mx-auto grid size-14 place-items-center rounded-full border border-blue-300/20 bg-blue-300/[0.05]"><Globe2 className="size-6 text-blue-200" /></span><h3 className="mt-5 text-sm font-semibold text-zinc-200">아직 등록된 외부 활동이 없습니다.</h3><p className="mt-2 max-w-md text-xs leading-6 text-zinc-500">페르소나 IP 콘텐츠가 네이버 블로그나 SNS에 발행되면 짧은 요약과 원문 링크가 이곳에 게시됩니다.</p></div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {posts.map((post) => {
            const employee = employees.find((item) => item.id === post.employeeId);
            if (!employee) return null;
            const team = teams.find((item) => item.id === employee.teamId);
            return (
              <article className="group flex min-h-64 flex-col rounded-2xl border border-white/8 bg-[#0b0e14] p-5 transition hover:border-blue-300/25 hover:bg-blue-300/[0.025] sm:p-6" key={post.id}>
                <div className="flex items-start gap-3"><EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-11 rounded-full object-cover" size={44} src={employee.profileImage} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{formatPersonaDisplayName(employee)}</p><p className="mt-1 truncate text-[10px] text-zinc-600">{team?.nameKo ?? "PERSOS"}</p></div><Badge variant="outline">{post.platform}</Badge></div>
                <h3 className="mt-6 text-balance text-lg font-semibold leading-7 text-zinc-100">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-400">{post.summary}</p>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/8 pt-5"><span className="flex items-center gap-1.5 text-[10px] text-zinc-600"><CalendarDays className="size-3.5" />{post.publishedAt.replaceAll("-", ".")}</span><Link aria-label={`${post.title} 외부 원문 열기`} className="flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/[0.05] px-4 py-2 text-xs font-medium text-blue-100 transition hover:border-blue-300/40 hover:bg-blue-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300" href={post.externalUrl} rel="noopener noreferrer" target="_blank">원문 보기<ArrowUpRight className="size-3.5" /></Link></div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
