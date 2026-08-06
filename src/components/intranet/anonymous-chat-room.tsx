"use client";

import { useEffect, useRef } from "react";
import {
  Cherry,
  Flower2,
  Leaf,
  LockKeyhole,
  MessageCircleMore,
  Pin,
  Smile,
  Sun,
  ThumbsUp,
  UserRoundCheck,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { DiscussionCategoryHero } from "@/components/intranet/discussion-category-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  publicAnonymousChatDemo,
  type PublicAnonymousChatDemo,
  type PublicAnonymousAliasTone,
  type PublicAnonymousMessage,
  type PublicArchiveTopic,
} from "@/data/public-discussion-demo";
import { cn } from "@/lib/utils";

const aliasPresentation: Record<
  PublicAnonymousAliasTone,
  { icon: LucideIcon; avatar: string; name: string }
> = {
  green: {
    icon: Leaf,
    avatar: "border-lime-300/25 bg-lime-300/10 text-lime-200",
    name: "text-lime-200",
  },
  lavender: {
    icon: Flower2,
    avatar: "border-violet-300/25 bg-violet-300/10 text-violet-200",
    name: "text-violet-200",
  },
  peach: {
    icon: Cherry,
    avatar: "border-rose-300/25 bg-rose-300/10 text-rose-200",
    name: "text-rose-200",
  },
  lemon: {
    icon: Sun,
    avatar: "border-yellow-300/30 bg-yellow-300/10 text-yellow-200",
    name: "text-yellow-200",
  },
  soda: {
    icon: Waves,
    avatar: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
    name: "text-cyan-200",
  },
};

function formatChatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNoticeDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AnonymousMessageRow({
  message,
  replyTarget,
}: {
  message: PublicAnonymousMessage;
  replyTarget?: PublicAnonymousMessage;
}) {
  const presentation = aliasPresentation[message.aliasTone];
  const Icon = presentation.icon;

  return (
    <article
      className={cn(
        "relative flex items-start gap-3",
        message.replyToMessageId && "ml-4 sm:ml-10"
      )}
    >
      {message.replyToMessageId ? (
        <span
          aria-hidden="true"
          className="absolute -left-4 top-0 h-5 w-3 rounded-bl-md border-b border-l border-yellow-200/15 sm:-left-7 sm:w-6"
        />
      ) : null}
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border",
          presentation.avatar
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("text-xs font-semibold", presentation.name)}>
            {message.alias}
          </span>
          {replyTarget ? (
            <span className="text-[9px] text-zinc-600">
              → {replyTarget.alias}에게
            </span>
          ) : null}
          <time
            className="text-[9px] text-zinc-600"
            dateTime={message.createdAt}
          >
            {formatChatTime(message.createdAt)}
          </time>
        </div>
        <div className="mt-1.5 max-w-3xl rounded-lg border border-white/10 bg-white/[0.055] px-3.5 py-2.5 text-[12px] leading-6 text-zinc-300 shadow-sm">
          {replyTarget ? (
            <p className="mb-2 border-l-2 border-yellow-300/50 bg-yellow-300/[0.035] px-2 py-1 text-[9px] text-zinc-500">
              {replyTarget.content}
            </p>
          ) : null}
          <p>{message.content}</p>
        </div>
        <span className="mt-1.5 flex items-center gap-1 text-[9px] text-zinc-600">
          <ThumbsUp className="size-3" />
          {message.reactionCount}
        </span>
      </div>
    </article>
  );
}

export function AnonymousChatHero() {
  return (
    <DiscussionCategoryHero
      category="anonymous"
      titleId="anonymous-chat-page-title"
    />
  );
}

export function AnonymousChatRoom({
  archiveTopics = [],
  chat = publicAnonymousChatDemo,
}: {
  archiveTopics?: PublicArchiveTopic[];
  chat?: PublicAnonymousChatDemo;
}) {
  const { messages, participantCount, topic } = chat;
  const chronologicalArchiveTopics = [...archiveTopics].reverse();
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const currentTopicRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const viewport = chatViewportRef.current;
    const currentTopic = currentTopicRef.current;
    if (!viewport || !currentTopic) return;

    viewport.scrollTop = Math.max(
      0,
      viewport.scrollTop +
        currentTopic.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        16
    );
  }, [archiveTopics.length, topic.updatedAt]);

  return (
    <section
      aria-labelledby="anonymous-chat-room-title"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-yellow-300/15 bg-[#0a1019] text-zinc-100"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-yellow-300/12 bg-[#0d141f] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className="flex items-center gap-2 text-sm font-semibold"
            id="anonymous-chat-room-title"
          >
            <MessageCircleMore className="size-4 text-yellow-300" />
            전사원 익명 채팅방
          </h2>
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-zinc-500">
            {participantCount}명 참여 중
          </span>
          <Badge
            className="border-yellow-300/15 bg-yellow-300/[0.05] text-[8px] text-yellow-100/70"
            variant="outline"
          >
            익명 보호
          </Badge>
        </div>
        <Button
          aria-disabled="true"
          className="min-h-9 border-white/10 bg-white/[0.025] text-zinc-500 disabled:opacity-100"
          disabled
          size="sm"
          type="button"
          variant="outline"
        >
          <UserRoundCheck />
          참여자 목록
        </Button>
      </header>

      <div
        className="relative min-h-[28rem] flex-1 overflow-y-auto overscroll-contain scroll-smooth px-4 py-4 [scrollbar-color:rgba(253,224,71,0.3)_transparent] [scrollbar-width:thin] sm:max-h-[42rem] sm:px-5"
        data-testid="anonymous-chat-scroll"
        ref={chatViewportRef}
        role="log"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(253,224,71,0.2)_0.7px,transparent_0.7px)] [background-size:18px_18px]"
        />

        <div className="relative space-y-4">
          {chronologicalArchiveTopics.map((archiveTopic) => (
            <section
              aria-label={`지난 주제 ${archiveTopic.title}`}
              className="scroll-mt-4 rounded-lg border border-yellow-300/10 bg-yellow-300/[0.025] px-4 py-3"
              id={`anonymous-topic-${archiveTopic.id}`}
              key={archiveTopic.id}
            >
              <div className="flex items-center gap-2 text-[9px] font-semibold text-yellow-200/60">
                <Pin className="size-3" />
                지난 주 공지 · {archiveTopic.date}
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-zinc-500">
                {archiveTopic.title}
              </p>
            </section>
          ))}

          <aside
            className="scroll-mt-4 rounded-lg border border-yellow-300/45 bg-yellow-300/[0.14] px-4 py-3 text-yellow-50 shadow-[0_8px_28px_rgba(254,229,0,0.06)]"
            id="anonymous-topic-current"
            ref={currentTopicRef}
          >
            <div className="flex items-start gap-3">
              <Pin className="mt-0.5 size-4 shrink-0 fill-current text-yellow-300" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-yellow-300">
                  이번 주 공지
                </p>
                <p className="mt-2 text-xs font-semibold leading-6 text-yellow-50">
                  {topic.title}
                </p>
                <p className="mt-2 text-[9px] text-yellow-100/50">
                  {topic.updatedBy} · {formatNoticeDate(topic.updatedAt)}
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-4 pt-1" role="feed">
            {messages.map((message) => (
              <AnonymousMessageRow
                key={message.id}
                message={message}
                replyTarget={messages.find(
                  (candidate) => candidate.id === message.replyToMessageId
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-yellow-300/12 bg-[#0d141f] p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Button
            aria-disabled="true"
            className="hidden border-white/10 text-zinc-500 disabled:opacity-100 sm:inline-flex"
            disabled
            size="icon"
            type="button"
            variant="outline"
          >
            <Smile />
          </Button>
          <input
            aria-label="익명 메시지 입력"
            className="min-h-11 w-full rounded-md border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-500 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-100"
            disabled
            placeholder="익명으로 메시지를 입력하세요..."
            type="text"
          />
          <Button
            aria-disabled="true"
            className="min-h-11 min-w-28 bg-yellow-300 text-[#241613] disabled:opacity-55"
            disabled
            type="button"
          >
            로그인 하기
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-600">
          <LockKeyhole className="size-3" />
          메시지와 주제는 6주 후 자동 삭제되며, 참여는 사원 인증 후 가능합니다.
        </p>
      </div>
    </section>
  );
}
