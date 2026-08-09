import Link from "next/link";
import { Bell, BookOpenCheck, Clapperboard, FileText, Megaphone, MessagesSquare } from "lucide-react";

import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { divisions, employees, teams } from "@/data";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import type { ActivityType, CompanyActivity } from "@/types";

const typeMeta: Record<ActivityType, { icon: typeof Bell; label: string; color: string }> = {
  Discussion: { icon: MessagesSquare, label: "토론", color: "text-cyan-200" },
  Content: { icon: FileText, label: "콘텐츠", color: "text-blue-200" },
  Knowledge: { icon: BookOpenCheck, label: "지식", color: "text-emerald-200" },
  "Project Update": { icon: Megaphone, label: "프로젝트", color: "text-amber-200" },
  Media: { icon: Clapperboard, label: "미디어", color: "text-violet-200" },
  Notice: { icon: Bell, label: "공지", color: "text-rose-200" },
};

export function ActivityCard({ activity, featured = false }: { activity: CompanyActivity; featured?: boolean }) {
  const meta = typeMeta[activity.type];
  const Icon = meta.icon;
  const employee = employees.find((item) => item.id === activity.employeeId);
  const division = divisions.find((item) => item.id === activity.divisionId);
  const team = teams.find((item) => item.id === activity.teamId);
  return (
    <article className={featured ? "border border-cyan-300/20 bg-cyan-300/[0.035] p-5 sm:p-6" : "border border-white/8 bg-white/[0.018] p-5"}>
      <div className="flex items-center justify-between gap-3"><span className={`flex items-center gap-2 text-[10px] font-semibold ${meta.color}`}><Icon className="size-3.5" />{meta.label}</span><Badge variant={activity.status === "Published" ? "outline" : "secondary"}>{activity.status === "Published" ? "게시" : activity.status}</Badge></div>
      <Link className="mt-4 block text-base font-semibold leading-6 text-zinc-100 transition hover:text-cyan-200" href={activity.href}>{activity.title}</Link>
      <p className="mt-3 line-clamp-3 text-xs leading-6 text-zinc-500">{activity.summary}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
        {employee ? <div className="flex min-w-0 items-center gap-2"><EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-7 rounded-full" size={28} src={employee.profileImage} /><div className="min-w-0"><p className="truncate text-[11px] text-zinc-300">{formatPersonaDisplayName(employee)}</p><p className="truncate text-[9px] text-zinc-600">{team?.nameKo} · {division?.nameKo}</p></div></div> : <p className="truncate text-[10px] text-zinc-600">{team?.nameKo ?? division?.nameKo ?? "PERSOS 운영"}</p>}
        <div className="shrink-0 text-right"><p className="text-[10px] text-zinc-600">{activity.publishedAt}</p><p className="mt-1 text-[9px] text-zinc-700">{activity.sourceLabel}</p></div>
      </div>
    </article>
  );
}
