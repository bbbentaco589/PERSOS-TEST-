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

import {
  DebateBackButton,
  DebateEmployeeProfileButton,
} from "@/components/intranet/debate-detail-interactions";
import { DiscussionCategoryHero } from "@/components/intranet/discussion-category-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { divisions, employees, teams } from "@/data";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";
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
    border: "border-blue-300/15",
    header: "border-blue-300/15 bg-blue-400/[0.055]",
    badge: "border-blue-300/20 bg-blue-400/[0.08] text-blue-200",
    statement:
      "border-blue-300/15 bg-blue-400/[0.05] hover:border-blue-300/25 hover:bg-blue-400/[0.075]",
  },
  hold: {
    label: "보류",
    heading: "AI 보류 진영",
    icon: CircleDot,
    border: "border-amber-300/15",
    header: "border-amber-300/15 bg-amber-400/[0.05]",
    badge: "border-amber-300/20 bg-amber-400/[0.07] text-amber-200",
    statement:
      "border-amber-300/15 bg-amber-400/[0.045] hover:border-amber-300/25 hover:bg-amber-400/[0.07]",
  },
  oppose: {
    label: "반대",
    heading: "AI 반대 진영",
    icon: ThumbsDown,
    border: "border-red-300/15",
    header: "border-red-300/15 bg-red-400/[0.05]",
    badge: "border-red-300/20 bg-red-400/[0.075] text-red-200",
    statement:
      "border-red-300/15 bg-red-400/[0.045] hover:border-red-300/25 hover:bg-red-400/[0.07]",
  },
} as const;

const debateEmployeeProfiles = buildPopularEmployeeProfiles(
  buildPublicFeedItems([]),
  employees.length
);

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

function getEmployeeProfile(employeeId: string) {
  return debateEmployeeProfiles.find(
    (profile) => profile.employee.id === employeeId
  );
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
        "overflow-hidden rounded-md border bg-[#0d1120]",
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
          className="flex items-center gap-2 text-xs font-semibold text-zinc-200"
          id={`debate-team-${side}`}
        >
          <Icon className="size-3.5" />
          {presentation.heading}
        </h3>
        <Badge className={presentation.badge} variant="outline">
          {presentation.label} {members.length}명
        </Badge>
      </header>
      <div className="divide-y divide-white/[0.065] px-4">
        {members.map((employee) => {
          const profile = getEmployeeProfile(employee.id);

          return (
            <div
              className="flex min-h-14 items-center gap-2 py-2.5"
              key={employee.id}
            >
              {profile ? (
                <DebateEmployeeProfileButton
                  className="min-w-0 flex-1"
                  compact
                  profile={profile}
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-zinc-200">
                  {employee.nameKo}
                </span>
              )}
              <Badge className={presentation.badge} variant="outline">
                {presentation.label}
              </Badge>
            </div>
          );
        })}
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
  const profile = getEmployeeProfile(employee.id);
  const presentation = sidePresentation[statement.side];
  const Icon = presentation.icon;

  return (
    <div
      className={cn(
        "flex",
        statement.side === "support"
          ? "justify-start"
          : statement.side === "oppose"
            ? "justify-end"
            : "justify-center"
      )}
    >
      <article
        className={cn(
          "w-full rounded-md border p-4 transition sm:w-[86%] lg:w-[78%]",
          presentation.statement
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          {profile ? (
            <DebateEmployeeProfileButton profile={profile} />
          ) : (
            <span className="text-xs font-semibold text-zinc-200">
              {employee.nameKo}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={presentation.badge} variant="outline">
              <Icon className="mr-1 size-2.5" />
              {presentation.label}
            </Badge>
            <time
              className="text-[8px] text-zinc-600"
              dateTime={statement.createdAt}
            >
              {formatStatementTime(statement.createdAt)}
            </time>
          </div>
        </div>
        <p className="mt-2 text-[9px] text-zinc-500">
          {organization.team} · {employee.jobTitleKo}
        </p>
        {replyEmployee ? (
          <p className="mt-3 flex items-center gap-1 text-[9px] text-zinc-500">
            <ArrowDownRight className="size-3" />
            {replyEmployee.nameKo}의 발언에 답변
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-6 text-zinc-300">
          {statement.content}
        </p>
        <div className="mt-3 flex items-center justify-end gap-4 text-[9px] text-zinc-600">
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
    </div>
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
      className="relative overflow-hidden border-b border-white/[0.07] bg-[#0b0e1a] text-zinc-100"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_12%_0%,rgba(177,62,77,0.12),transparent_43%),radial-gradient(circle_at_88%_0%,rgba(73,82,187,0.14),transparent_43%)]"
      />
      <header className="relative px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <DebateBackButton />
          <Badge
            className="border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200"
            variant="outline"
          >
            <CircleDot className="mr-1 size-3" />
            진행 중
          </Badge>
          <span className="flex items-center gap-1 text-[9px] text-zinc-500">
            <CalendarDays className="size-3" />
            {formatDateTime(debate.proposedAt)} 시작
          </span>
          <span className="flex items-center gap-1 text-[9px] text-zinc-500">
            <UserRound className="size-3" />
            제안자 {debate.proposer}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-zinc-400">
            <Clock3 className="size-3.5" />
            남은 시간 02일 18:34:21
          </span>
        </div>
        <h2
          className="mt-4 text-balance text-lg font-semibold leading-7 text-white sm:text-xl"
          id="active-debate-title"
        >
          {debate.title}
        </h2>
        <p className="mt-2 max-w-4xl text-xs leading-6 text-zinc-400">
          {debate.summary}
        </p>
      </header>

      <div className="relative px-5 py-5 sm:px-6">
        <section
          aria-labelledby="debate-key-points"
          className="pb-5"
        >
          <h3
            className="text-xs font-semibold text-zinc-200"
            id="debate-key-points"
          >
            핵심 쟁점
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {debate.keyPoints.map((point) => (
              <li
                className="flex gap-2 text-[10px] leading-5 text-zinc-400"
                key={point}
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-blue-300/80" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-5 grid items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)]">
          <DebateTeam debate={debate} side="support" />
          <div className="grid place-items-center">
            <span className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-zinc-400">
              VS
            </span>
          </div>
          <DebateTeam debate={debate} side="oppose" />
        </div>
      </div>

      <section
        aria-labelledby="static-investor-vote"
        className="relative border-t border-white/[0.07] bg-black/10 px-5 py-4 sm:px-6"
      >
        <div className="grid gap-4 min-[1400px]:grid-cols-[12rem_minmax(0,1fr)_8rem] min-[1400px]:items-center">
          <div>
            <h3
              className="flex items-center gap-2 text-xs font-semibold text-zinc-200"
              id="static-investor-vote"
            >
              <UsersRound className="size-3.5 text-violet-300/80" />
              외부 투자자 투표
            </h3>
            <p className="mt-1 text-[8px] text-zinc-600">
              AI 진영과 별도로 집계된 고정 Demo 비율
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-blue-200">찬성 56%</span>
              <span className="font-semibold text-red-200">반대 44%</span>
            </div>
            <div
              aria-label="찬성 56%, 반대 44%"
              className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10"
            >
              <span className="w-[56%] bg-blue-400/75" />
              <span className="w-[44%] bg-red-400/70" />
            </div>
          </div>
          <Button
            aria-disabled="true"
            className="min-h-11 border-white/10 bg-white/[0.035] text-zinc-500 disabled:opacity-70"
            disabled
            type="button"
            variant="outline"
          >
            투표 참여하기
          </Button>
        </div>
        <p className="mt-3 text-[8px] text-zinc-600">
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
      className="bg-[#090c17] text-zinc-100"
    >
      <header className="flex min-h-14 items-center justify-between border-b border-white/[0.07] bg-black/10 px-5 sm:px-6">
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id="debate-thread-title"
        >
          <MessageCircleReply className="size-4 text-violet-300/80" />
          토론 진행
        </h2>
        <span className="text-[9px] text-zinc-600">시간 순 · DEMO</span>
      </header>
      <div className="space-y-3 px-5 py-5 sm:px-6" role="feed">
        {statements.map((statement) => (
          <DebateStatementRow key={statement.id} statement={statement} />
        ))}
      </div>
      <div className="grid gap-3 border-t border-white/[0.07] bg-black/10 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center sm:px-6">
        <p className="flex items-center gap-2 text-[10px] text-zinc-500">
          <LogIn className="size-3.5" />
          토론에 참여하려면 로그인하세요.
        </p>
        <Button
          aria-disabled="true"
          className="min-h-10 bg-white/[0.07] text-zinc-500 disabled:opacity-100"
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
    <main className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[#090c17] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <DebateSummary debate={debate} />
      <DebateThread debate={debate} />
    </main>
  );
}
