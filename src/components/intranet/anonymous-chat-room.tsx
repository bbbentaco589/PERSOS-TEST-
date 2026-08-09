"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  LockKeyhole,
  Pin,
  Smile,
  ThumbsUp,
  UserRoundCheck,
} from "lucide-react";

import { DiscussionCategoryHero } from "@/components/intranet/discussion-category-hero";
import { AnonymousChatMaskIcon } from "@/components/intranet/discussion-category-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  publicAnonymousChatDemo,
  type PublicAnonymousChatDemo,
  type PublicAnonymousAliasTone,
  type PublicAnonymousMessage,
} from "@/data/public-discussion-demo";
import { cn } from "@/lib/utils";

const aliasPresentation: Record<
  PublicAnonymousAliasTone,
  { image: string; name: string; nameClass: string }
> = {
  green: {
    image: "/assets/anonymous/mask-raccoon.jpg",
    name: "퇴근한밤의너구리",
    nameClass: "text-lime-200",
  },
  lavender: {
    image: "/assets/anonymous/mask-rabbit.jpg",
    name: "회의실유령토끼",
    nameClass: "text-violet-200",
  },
  peach: {
    image: "/assets/anonymous/mask-fox.jpg",
    name: "야근먹는여우",
    nameClass: "text-rose-200",
  },
  lemon: {
    image: "/assets/anonymous/mask-black-cat.jpg",
    name: "비밀많은검은고양이",
    nameClass: "text-yellow-200",
  },
  soda: {
    image: "/assets/anonymous/mask-owl.jpg",
    name: "정체불명올빼미",
    nameClass: "text-cyan-200",
  },
};

function getAnonymousAlias(message: PublicAnonymousMessage) {
  return aliasPresentation[message.aliasTone].name;
}

function formatChatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function formatNoticeDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
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
      <Image
        alt={`${presentation.name} 동물 가면 프로필`}
        className="size-9 shrink-0 rounded-full border border-yellow-200/20 object-cover"
        height={36}
        src={presentation.image}
        width={36}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn("text-xs font-semibold", presentation.nameClass)}
          >
            {presentation.name}
          </span>
          {replyTarget ? (
            <span className="text-[9px] text-zinc-600">
              → {getAnonymousAlias(replyTarget)}에게
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
  chat = publicAnonymousChatDemo,
  scrollRequestNonce = 0,
}: {
  chat?: PublicAnonymousChatDemo;
  scrollRequestNonce?: number;
}) {
  const { messages, participantCount, topic } = chat;
  const chatViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = chatViewportRef.current;
    if (!viewport) return;

    viewport.scrollTop = 0;
  }, [scrollRequestNonce, topic.updatedAt]);

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
            <AnonymousChatMaskIcon className="size-5" />
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

      <div className="shrink-0 border-b border-yellow-300/12 bg-[#0b111a]">
        <aside
          className="border-y border-yellow-300/55 bg-[#302d16] px-4 py-2.5 text-yellow-50 shadow-[0_6px_18px_rgba(0,0,0,0.2)] sm:px-5"
          id="anonymous-topic-current"
        >
          <div className="flex items-start gap-2.5">
            <Pin className="mt-0.5 size-4 shrink-0 fill-current text-yellow-300" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-yellow-300">
                이번 주 공지
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-yellow-50">
                {topic.title}
              </p>
              <p className="mt-1 text-[9px] leading-4 text-yellow-100/50">
                {topic.updatedBy} · {formatNoticeDate(topic.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div
        className="relative min-h-[28rem] flex-1 overflow-y-auto overscroll-contain scroll-smooth px-4 py-4 [scrollbar-color:rgba(253,224,71,0.3)_transparent] [scrollbar-width:thin] sm:max-h-[34rem] sm:px-5"
        data-testid="anonymous-chat-scroll"
        ref={chatViewportRef}
        role="log"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(253,224,71,0.2)_0.7px,transparent_0.7px)] [background-size:18px_18px]"
        />

        <div className="relative space-y-4">
          <div className="space-y-4" role="feed">
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
