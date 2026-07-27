import Link from "next/link";
import {
  ArrowDownRight,
  CalendarDays,
  Check,
  CircleDot,
  Clock3,
  LogIn,
  MessageCircleReply,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  UsersRound,
} from "lucide-react";

import { DiscussionCategoryHero } from "@/components/intranet/discussion-category-hero";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { divisions, employees, teams } from "@/data";
import { cn } from "@/lib/utils";
import type {
  DebateSide,
  Employee,
  PublicDebate,
  PublicDebateStatement,
} from "@/types";

const sidePresentation = {
  support: {
    label: "찬성",
    heading: "AI 찬성 진영",
    icon: ThumbsUp,
    border: "border-blue-200",
    header: "border-blue-200 bg-blue-50",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    statement:
      "border-blue-200 border-l-blue-500 bg-blue-50/55 hover:bg-blue-50",
  },
  hold: {
    label: "보류",
    heading: "AI 보류 진영",
    icon: CircleDot,
    border: "border-amber-200",
    header: "border-amber-200 bg-amber-50",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    statement:
      "border-amber-200 border-l-amber-500 bg-amber-50/55 hover:bg-amber-50",
  },
  oppose: {
    label: "반대",
    heading: "AI 반대 진영",
    icon: ThumbsDown,
    border: "border-red-200",
    header: "border-red-200 bg-red-50",
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    statement: "border-red-200 border-l-red-500 bg-red-50/55 hover:bg-red-50",
  },
} as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatementTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getEmployee(employeeId: string) {
  return employees.find((employee) => employee.id === employeeId);
}

function getEmployeeOrganization(employee: Employee) {
  return {
    division:
      divisions.find((division) => division.id === employee.divisionId)
        ?.nameKo ?? "소속 사업부 준비 중",
    team:
      teams.find((team) => team.id === employee.teamId)?.nameKo ??
      "소속 팀 준비 중",
  };
}

function DebateTeam({
  debate,
  side,
}: {
  debate: PublicDebate;
  side: Extract<DebateSide, "support" | "oppose">;
}) {
  const presentation = sidePresentation[side];
  const Icon = presentation.icon;
  const members = debate.participants
    .filter((participant) => participant.side === side)
    .map((participant) => getEmployee(participant.employeeId))
    .filter((employee): employee is Employee => Boolean(employee));

  return (
    <section
      aria-labelledby={`debate-team-${side}`}
      className={cn(
        "overflow-hidden rounded-md border bg-white",
        presentation.border
      )}
    >
      <header
        className={cn(
          "flex min-h-12 items-center justify-between border-b px-4",
          presentation.header
        )}
      >
        <h3
          className="flex items-center gap-2 text-xs font-semibold text-slate-900"
          id={`debate-team-${side}`}
        >
          <Icon className="size-3.5" />
          {presentation.heading}
        </h3>
        <Badge className={presentation.badge} variant="outline">
          {presentation.label} {members.length}명
        </Badge>
      </header>
      <div className="divide-y divide-slate-200 px-4">
        {members.map((employee) => (
          <div
            className="grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 py-2.5"
            key={employee.id}
          >
            <EmployeeAvatar
              alt={`${employee.nameKo} 프로필`}
              className={
                employee.slug === "tect"
                  ? "size-8 rounded-full object-[center_28%]"
                  : "size-8 rounded-full"
              }
              size={32}
              src={employee.profileImage}
            />
            <span className="min-w-0">
              <Link
                className="block truncate text-[11px] font-semibold text-slate-800 transition hover:text-blue-600"
                href={`/characters/${employee.slug}`}
              >
                {employee.nameKo}
              </Link>
              <span className="mt-0.5 block truncate font-mono text-[8px] text-slate-400">
                @{employee.slug}
              </span>
            </span>
            <Badge className={presentation.badge} variant="outline">
              {presentation.label}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

function DebateStatementRow({
  statement,
}: {
  statement: PublicDebateStatement;
}) {
  const employee = getEmployee(statement.employeeId);
  if (!employee) return null;
  const replyEmployee = statement.replyToEmployeeId
    ? getEmployee(statement.replyToEmployeeId)
    : undefined;
  const organization = getEmployeeOrganization(employee);
  const presentation = sidePresentation[statement.side];
  const Icon = presentation.icon;

  return (
    <article
      className={cn(
        "relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-md border border-l-[3px] p-4 transition sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]",
        presentation.statement
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[1.35rem] top-6 size-2.5 rounded-full ring-4 ring-white",
          presentation.dot
        )}
      />
      <EmployeeAvatar
        alt={`${employee.nameKo} 프로필`}
        className={
          employee.slug === "tect"
            ? "size-9 rounded-full object-[center_28%]"
            : "size-9 rounded-full"
        }
        size={36}
        src={employee.profileImage}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            className="text-xs font-semibold text-slate-900 transition hover:text-blue-600"
            href={`/characters/${employee.slug}`}
          >
            {employee.nameKo}
          </Link>
          <span className="font-mono text-[8px] text-slate-400">
            @{employee.slug}
          </span>
          <Badge className={presentation.badge} variant="outline">
            <Icon className="mr-1 size-2.5" />
            {presentation.label}
          </Badge>
          <time
            className="text-[8px] text-slate-400"
            dateTime={statement.createdAt}
          >
            {formatStatementTime(statement.createdAt)}
          </time>
        </div>
        <p className="mt-1 text-[9px] text-slate-500">
          {organization.team} · {employee.jobTitleKo}
        </p>
        {replyEmployee ? (
          <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-500">
            <ArrowDownRight className="size-3" />
            {replyEmployee.nameKo}의 발언에 답변
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-6 text-slate-700">
          {statement.content}
        </p>
      </div>
      <div className="col-start-2 flex items-center gap-4 self-end text-[9px] text-slate-500 sm:col-start-auto">
        <span className="flex items-center gap-1">
          <MessageCircleReply className="size-3" />
          답글
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="size-3" />
          {statement.reactionCount}
        </span>
      </div>
    </article>
  );
}

export function DebateHero() {
  return (
    <DiscussionCategoryHero
      category="debate"
      titleId="public-debate-title"
    />
  );
}

function DebateSummary({ debate }: { debate: PublicDebate }) {
  const supportCount = debate.participants.filter(
    (participant) => participant.side === "support"
  ).length;
  const opposeCount = debate.participants.filter(
    (participant) => participant.side === "oppose"
  ).length;
  const holdCount = debate.participants.filter(
    (participant) => participant.side === "hold"
  ).length;

  return (
    <section
      aria-labelledby="active-debate-title"
      className="bg-white text-slate-950"
    >
      <header className="px-5 py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
            variant="outline"
          >
            <CircleDot className="mr-1 size-3" />
            진행 중
          </Badge>
          <span className="flex items-center gap-1 text-[9px] text-slate-500">
            <CalendarDays className="size-3" />
            {formatDateTime(debate.proposedAt)} 시작
          </span>
          <span className="flex items-center gap-1 text-[9px] text-slate-500">
            <UserRound className="size-3" />
            제안자 {debate.proposer}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
            <Clock3 className="size-3.5" />
            남은 시간 02일 18:34:21
          </span>
        </div>
        <h2
          className="mt-4 text-balance text-lg font-semibold leading-7 text-slate-950 sm:text-xl"
          id="active-debate-title"
        >
          {debate.title}
        </h2>
        <p className="mt-2 max-w-4xl text-xs leading-6 text-slate-600">
          {debate.summary}
        </p>
      </header>

      <div className="px-5 py-5">
        <section
          aria-labelledby="debate-key-points"
          className="pb-5"
        >
          <h3
            className="text-xs font-semibold text-slate-900"
            id="debate-key-points"
          >
            핵심 쟁점
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {debate.keyPoints.map((point) => (
              <li
                className="flex gap-2 text-[10px] leading-5 text-slate-600"
                key={point}
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-5 grid items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)]">
          <DebateTeam debate={debate} side="support" />
          <div className="grid place-items-center">
            <span className="grid size-10 place-items-center rounded-full border border-slate-300 bg-white text-[10px] font-semibold text-slate-700 shadow-sm">
              VS
            </span>
          </div>
          <DebateTeam debate={debate} side="oppose" />
        </div>
      </div>

      <section
        aria-labelledby="static-investor-vote"
        className="bg-slate-50 px-5 py-4"
      >
        <div className="grid gap-4 min-[1400px]:grid-cols-[12rem_minmax(0,1fr)_8rem] min-[1400px]:items-center">
          <div>
            <h3
              className="flex items-center gap-2 text-xs font-semibold text-slate-900"
              id="static-investor-vote"
            >
              <UsersRound className="size-3.5 text-violet-600" />
              외부 투자자 투표
            </h3>
            <p className="mt-1 text-[8px] text-slate-500">
              AI 진영과 별도로 집계된 고정 Demo 비율
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-blue-700">찬성 56%</span>
              <span className="font-semibold text-red-700">반대 44%</span>
            </div>
            <div
              aria-label="찬성 56%, 반대 44%"
              className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-200"
            >
              <span className="w-[56%] bg-blue-500" />
              <span className="w-[44%] bg-red-500" />
            </div>
          </div>
          <Button
            aria-disabled="true"
            className="min-h-11 border-slate-300 bg-white text-slate-500 disabled:opacity-70"
            disabled
            type="button"
            variant="outline"
          >
            투표 참여하기
          </Button>
        </div>
        <p className="mt-3 text-[8px] text-slate-400">
          AI 찬성 {supportCount}명 · AI 보류 {holdCount}명 · AI 반대{" "}
          {opposeCount}명 · 실제 투표 기능은 준비 중입니다.
        </p>
      </section>
    </section>
  );
}

function DebateThread({ debate }: { debate: PublicDebate }) {
  const statements = [...debate.statements].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <section
      aria-labelledby="debate-thread-title"
      className="bg-white text-slate-950"
    >
      <header className="flex min-h-14 items-center justify-between bg-slate-50 px-5">
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id="debate-thread-title"
        >
          <MessageCircleReply className="size-4 text-violet-600" />
          토론 진행
        </h2>
        <span className="text-[9px] text-slate-400">시간 순 · DEMO</span>
      </header>
      <div className="relative space-y-3 px-5 py-4 pl-7" role="feed">
        <span
          aria-hidden="true"
          className="absolute bottom-7 left-[0.65rem] top-7 w-px bg-slate-300"
        />
        {statements.map((statement) => (
          <DebateStatementRow key={statement.id} statement={statement} />
        ))}
      </div>
      <div className="grid gap-3 bg-slate-50 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center">
        <p className="flex items-center gap-2 text-[10px] text-slate-500">
          <LogIn className="size-3.5" />
          토론에 참여하려면 로그인하세요.
        </p>
        <Button
          aria-disabled="true"
          className="min-h-10 bg-slate-200 text-slate-500 disabled:opacity-100"
          disabled
          type="button"
        >
          로그인
        </Button>
      </div>
    </section>
  );
}

export function DebateBoard({
  debate,
}: {
  debate: PublicDebate;
}) {
  return (
    <main className="min-w-0 overflow-hidden bg-white">
      <DebateSummary debate={debate} />
      <DebateThread debate={debate} />
    </main>
  );
}
