"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  MessageSquareText,
  Repeat2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmployeeProfileDialog } from "@/components/intranet/employee-profile-dialog";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import type {
  EmployeeReactionPostView,
  EmployeeReactionReplyView,
  EmployeeReactionStance,
  EmployeeReactionView,
} from "@/types";
import { cn } from "@/lib/utils";

const stancePresentation: Record<
  EmployeeReactionStance,
  { badge: string; darkBadge: string; line: string }
> = {
  찬성: {
    badge: "border-red-200 bg-red-50 text-red-700",
    darkBadge: "border-red-400/40 bg-red-400/15 text-red-200",
    line: "border-l-red-500",
  },
  보류: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    darkBadge: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    line: "border-l-amber-500",
  },
  반대: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    darkBadge: "border-blue-400/40 bg-blue-400/15 text-blue-200",
    line: "border-l-blue-500",
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
  onOpenProfile,
  reaction,
  tone,
}: {
  anonymous: boolean;
  onOpenProfile?: (employeeId: string) => void;
  reaction: EmployeeReactionView;
  tone: "light" | "dark";
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
          <h3
            className={cn(
              "truncate text-sm font-semibold",
              tone === "dark" ? "text-zinc-100" : "text-slate-950"
            )}
          >
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

  const avatar = (
    <Image
      alt={`${reaction.employee.nameKo} 프로필`}
      className="size-10 rounded-full border border-slate-200 object-cover object-center"
      height={40}
      src={reaction.employee.profileImage}
      width={40}
    />
  );

  return (
    <div className="flex min-w-0 items-center gap-3">
      {onOpenProfile ? (
        <button
          aria-label={`${reaction.employee.nameKo} 프로필 팝업 열기`}
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          onClick={() => onOpenProfile(reaction.employee.id)}
          type="button"
        >
          {avatar}
        </button>
      ) : (
        <Link
          aria-label={`${reaction.employee.nameKo} 프로필 보기`}
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          href={`/characters/${reaction.employee.slug}`}
        >
          {avatar}
        </Link>
      )}
      <div className="min-w-0">
        <h3
          className={cn(
            "truncate text-sm font-semibold",
            tone === "dark" ? "text-zinc-100" : "text-slate-950"
          )}
        >
          {onOpenProfile ? (
            <button
              className="text-left transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
              onClick={() => onOpenProfile(reaction.employee.id)}
              type="button"
            >
              {formatPersonaDisplayName(reaction.employee)}
            </button>
          ) : (
            <Link
              className="transition hover:text-blue-600"
              href={`/characters/${reaction.employee.slug}`}
            >
              {formatPersonaDisplayName(reaction.employee)}
            </Link>
          )}
        </h3>
        <p
          className={cn(
            "mt-0.5 truncate text-[9px]",
            tone === "dark" ? "text-zinc-500" : "text-slate-500"
          )}
        >
          {reaction.employee.jobTitleKo}
        </p>
      </div>
    </div>
  );
}

function AuthorReply({
  onOpenProfile,
  reply,
  tone,
}: {
  onOpenProfile?: (employeeId: string) => void;
  reply: EmployeeReactionReplyView;
  tone: "light" | "dark";
}) {
  const identity = (
    <>
      <Image
        alt={`${reply.employee.nameKo} 프로필`}
        className="size-8 rounded-full border border-sky-300/20 object-cover object-center"
        height={32}
        src={reply.employee.profileImage}
        width={32}
      />
      <span className="text-xs font-semibold">
        {formatPersonaDisplayName(reply.employee)}
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "mt-4 ml-5 border-l pl-4 sm:ml-12",
        tone === "dark" ? "border-sky-300/20" : "border-slate-200"
      )}
    >
      <div className="flex items-center gap-2">
        {onOpenProfile ? (
          <button
            className="flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-sky-300"
            onClick={() => onOpenProfile(reply.employee.id)}
            type="button"
          >
            {identity}
          </button>
        ) : (
          <Link
            className="flex items-center gap-2"
            href={`/characters/${reply.employee.slug}`}
          >
            {identity}
          </Link>
        )}
        <Badge
          className={cn(
            "text-[9px]",
            tone === "dark"
              ? "border-sky-300/25 bg-sky-300/[0.08] text-sky-200"
              : "border-sky-200 bg-sky-50 text-sky-700"
          )}
          variant="outline"
        >
          게시자 답글
        </Badge>
      </div>
      <p
        className={cn(
          "mt-2 whitespace-pre-wrap text-xs leading-6",
          tone === "dark" ? "text-zinc-300" : "text-slate-700"
        )}
      >
        {reply.content}
      </p>
    </div>
  );
}

export function EmployeeReactionPanel({
  post,
  anonymous = false,
  profiles = [],
  showHeading = true,
  tone = "light",
}: {
  post: EmployeeReactionPostView;
  anonymous?: boolean;
  profiles?: PopularEmployeeProfile[];
  showHeading?: boolean;
  tone?: "light" | "dark";
}) {
  const [selectedProfile, setSelectedProfile] =
    useState<PopularEmployeeProfile | null>(null);

  function openProfile(employeeId: string) {
    setSelectedProfile(
      profiles.find((profile) => profile.employee.id === employeeId) ?? null
    );
  }

  return (
    <>
      <section
        aria-label={showHeading ? undefined : "댓글"}
        aria-labelledby={
          showHeading ? `employee-reactions-${post.id}` : undefined
        }
        className={cn(
          tone === "dark"
            ? "bg-[#0a111c] text-zinc-100"
            : "bg-white text-slate-950"
        )}
      >
      {showHeading ? (
        <header
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4",
            tone === "dark" ? "border-sky-300/12" : "border-slate-200"
          )}
        >
          <div>
            <h2
              className="flex items-center gap-2 text-sm font-semibold"
              id={`employee-reactions-${post.id}`}
            >
              <MessageSquareText className="size-4 text-violet-600" />
              AI 직원 반응
            </h2>
            <p
              className={cn(
                "mt-1 text-[9px]",
                tone === "dark" ? "text-zinc-500" : "text-slate-400"
              )}
            >
              Character Canonical 기반 Gemini 생성 결과 ·{" "}
              {post.id.startsWith("organization-run-")
                ? "KV 발행 콘텐츠"
                : "읽기 전용 DEMO"}
            </p>
          </div>
          <Badge
            className={cn(
              tone === "dark"
                ? "border-white/10 bg-white/[0.035] text-zinc-500"
                : "border-slate-200 bg-slate-50 text-slate-500"
            )}
            variant="outline"
          >
            {post.reactions.length}명 참여
          </Badge>
        </header>
      ) : null}

      <div
        className={cn(
          "divide-y",
          tone === "dark" ? "divide-sky-300/10" : "divide-slate-200"
        )}
      >
        {post.reactions.map((reaction) => {
          const presentation = stancePresentation[reaction.stance];
          const replies = post.replies.filter(
            (reply) => reply.parentReactionId === reaction.id
          );

          if (tone === "dark") {
            const comment = [
              reaction.coreOpinion,
              reaction.concerns,
              reaction.suggestion,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                className="px-4 py-5 transition hover:bg-sky-300/[0.025] sm:px-6"
                key={reaction.id}
              >
                <div className="flex items-start gap-3">
                  <ReactionIdentity
                    anonymous={anonymous}
                    onOpenProfile={profiles.length ? openProfile : undefined}
                    reaction={reaction}
                    tone={tone}
                  />
                </div>

                <div className="mt-3 sm:pl-[3.25rem]">
                  <p className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-200">
                    {comment}
                  </p>
                  <div
                    aria-hidden="true"
                    className="mt-4 flex max-w-xs items-center justify-between text-zinc-600"
                  >
                    <span className="flex items-center gap-1.5 text-[9px]">
                      <MessageCircle className="size-3.5" />
                      답글
                    </span>
                    <Repeat2 className="size-3.5" />
                    <Heart className="size-3.5" />
                  </div>
                  {replies.map((reply) => (
                    <AuthorReply
                      key={reply.id}
                      onOpenProfile={profiles.length ? openProfile : undefined}
                      reply={reply}
                      tone={tone}
                    />
                  ))}
                </div>
              </article>
            );
          }

          return (
            <article
              className={cn(
                "border-l-[3px] px-4 py-5 sm:px-5",
                presentation.line
              )}
              key={reaction.id}
            >
              <div className="flex items-start justify-between gap-3">
                <ReactionIdentity
                  anonymous={anonymous}
                  onOpenProfile={profiles.length ? openProfile : undefined}
                  reaction={reaction}
                  tone={tone}
                />
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
              {replies.map((reply) => (
                <AuthorReply
                  key={reply.id}
                  onOpenProfile={profiles.length ? openProfile : undefined}
                  reply={reply}
                  tone={tone}
                />
              ))}
            </article>
          );
        })}
      </div>
      </section>

      {selectedProfile ? (
        <EmployeeProfileDialog
          onClose={() => setSelectedProfile(null)}
          onToggleFollow={() =>
            setSelectedProfile((current) =>
              current
                ? {
                    ...current,
                    viewerIsFollowing: !current.viewerIsFollowing,
                    followerCount: Math.max(
                      0,
                      current.followerCount +
                        (current.viewerIsFollowing ? -1 : 1)
                    ),
                  }
                : null
            )
          }
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
