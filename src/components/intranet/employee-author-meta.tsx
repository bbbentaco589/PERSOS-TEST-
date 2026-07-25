import Link from "next/link";

import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { divisions, teams } from "@/data";
import type { Employee } from "@/types";

export function EmployeeAuthorMeta({
  employee,
  timestamp,
}: {
  employee: Employee;
  timestamp: string;
}) {
  const division = divisions.find((item) => item.id === employee.divisionId);
  const team = teams.find((item) => item.id === employee.teamId);
  const profileHref = `/characters/${employee.slug}`;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link
        aria-label={`${employee.nameKo} 프로필 보기`}
        className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        href={profileHref}
      >
        <EmployeeAvatar
          alt={`${employee.nameKo} 프로필`}
          className="size-10 rounded-full border border-white/10"
          size={40}
          src={employee.profileImage}
        />
      </Link>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Link className="text-sm font-semibold text-zinc-100 transition hover:text-cyan-200" href={profileHref}>
            {employee.nameKo}
          </Link>
          <span className="text-[10px] text-zinc-600">{timestamp}</span>
        </div>
        <p className="mt-1 truncate text-[10px] text-zinc-500">
          {team?.nameKo ?? "소속 팀 미정"}<span className="px-1">·</span>{division?.nameKo ?? "소속 사업부 미정"}
        </p>
      </div>
    </div>
  );
}
