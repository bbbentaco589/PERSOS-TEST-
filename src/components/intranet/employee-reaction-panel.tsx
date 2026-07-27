import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  LockKeyhole,
  MessageSquareText,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  EmployeeReactionPostView,
  EmployeeReactionStance,
  EmployeeReactionView,
} from "@/types";
import { cn } from "@/lib/utils";

const stancePresentation: Record<
  EmployeeReactionStance,
  { badge: string; line: string }
> = {
  찬성: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    line: "border-l-blue-500",
  },
  보류: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    line: "border-l-amber-500",
  },
  반대: {
    badge: "border-red-200 bg-red-50 text-red-700",
    line: "border-l-red-500",
  },
};

const anonymousAliases: Record<
  string,
  { name: string; avatar: string }
> = {
  tect: {
    name: "익명 네이비",
    avatar: "border-blue-200 bg-blue-100 text-blue-700",
  },
  "char-003": {
    name: "익명 라벤더",
    avatar: "border-violet-200 bg-violet-100 text-violet-700",
  },
  "char-002": {
    name: "익명 앰버",
    avatar: "border-amber-200 bg-amber-100 text-amber-700",
  },
};

function ReactionIdentity({
  anonymous,
  reaction,
}: {
  anonymous: boolean;
  reaction: EmployeeReactionView;
}) {
  if (anonymous) {
    const alias = anonymousAliases[reaction.employeeId] ?? {
      name: "익명 사원",
      avatar: "border-slate-200 bg-slate-100 text-slate-600",
    };

    return (
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full border",
            alias.avatar
          )}
        >
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-950">
            {alias.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">
            <LockKeyhole className="size-3" />
            Canonical 기반 · 공개 신원 비공개
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link
        aria-label={`${reaction.employee.nameKo} 프로필 보기`}
        className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        href={`/characters/${reaction.employee.slug}`}
      >
        <Image
          alt={`${reaction.employee.nameKo} 프로필`}
          className={cn(
            "size-10 rounded-full border border-slate-200 object-cover",
            reaction.employee.slug === "tect" && "object-[center_28%]"
          )}
          height={40}
          src={reaction.employee.profileImage}
          width={40}
        />
      </Link>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-950">
          <Link
            className="transition hover:text-blue-600"
            href={`/characters/${reaction.employee.slug}`}
          >
            {reaction.employee.nameKo}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-[9px] text-slate-500">
          {reaction.employee.jobTitleKo}
        </p>
      </div>
    </div>
  );
}

export function EmployeeReactionPanel({
  post,
  anonymous = false,
  showHeading = true,
}: {
  post: EmployeeReactionPostView;
  anonymous?: boolean;
  showHeading?: boolean;
}) {
  return (
    <section
      aria-labelledby={`employee-reactions-${post.id}`}
      className="bg-white text-slate-950"
    >
      {showHeading ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2
              className="flex items-center gap-2 text-sm font-semibold"
              id={`employee-reactions-${post.id}`}
            >
              <MessageSquareText className="size-4 text-violet-600" />
              AI 직원 반응
            </h2>
            <p className="mt-1 text-[9px] text-slate-400">
              Character Canonical 기반 Gemini 생성 결과 ·{" "}
              {post.id.startsWith("organization-run-")
                ? "KV 발행 콘텐츠"
                : "읽기 전용 DEMO"}
            </p>
          </div>
          <Badge
            className="border-slate-200 bg-slate-50 text-slate-500"
            variant="outline"
          >
            {post.reactions.length}명 참여
          </Badge>
        </header>
      ) : null}

      <div className="divide-y divide-slate-200">
        {post.reactions.map((reaction) => {
          const presentation = stancePresentation[reaction.stance];
          return (
            <article
              className={cn(
                "border-l-[3px] px-4 py-5 sm:px-5",
                presentation.line
              )}
              key={reaction.id}
            >
              <div className="flex items-start justify-between gap-3">
                <ReactionIdentity anonymous={anonymous} reaction={reaction} />
                <Badge
                  className={presentation.badge}
                  variant="outline"
                >
                  {reaction.stance}
                </Badge>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <section>
                  <h4 className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <CheckCircle2 className="size-3.5 text-blue-500" />
                    핵심 의견
                  </h4>
                  <p className="mt-2 text-xs leading-6 text-slate-700">
                    {reaction.coreOpinion}
                  </p>
                </section>
                <section>
                  <h4 className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    우려 사항
                  </h4>
                  <p className="mt-2 text-xs leading-6 text-slate-700">
                    {reaction.concerns}
                  </p>
                </section>
                <section>
                  <h4 className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <Lightbulb className="size-3.5 text-violet-500" />
                    제안
                  </h4>
                  <p className="mt-2 text-xs leading-6 text-slate-700">
                    {reaction.suggestion}
                  </p>
                </section>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
