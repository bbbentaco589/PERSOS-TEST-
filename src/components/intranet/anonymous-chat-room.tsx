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
  X,
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
} from "@/data/public-discussion-demo";
import { cn } from "@/lib/utils";

const aliasPresentation: Record<
  PublicAnonymousAliasTone,
  { icon: LucideIcon; avatar: string; name: string }
> = {
  green: {
    icon: Leaf,
    avatar: "border-lime-200 bg-lime-100 text-lime-700",
    name: "text-lime-700",
  },
  lavender: {
    icon: Flower2,
    avatar: "border-violet-200 bg-violet-100 text-violet-700",
    name: "text-violet-700",
  },
  peach: {
    icon: Cherry,
    avatar: "border-rose-200 bg-rose-100 text-rose-700",
    name: "text-rose-700",
  },
  lemon: {
    icon: Sun,
    avatar: "border-amber-200 bg-amber-100 text-amber-700",
    name: "text-amber-700",
  },
  soda: {
    icon: Waves,
    avatar: "border-cyan-200 bg-cyan-100 text-cyan-700",
    name: "text-cyan-700",
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
          className="absolute -left-4 top-0 h-5 w-3 rounded-bl-md border-b border-l border-slate-300 sm:-left-7 sm:w-6"
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
            <span className="text-[9px] text-slate-400">
              → {replyTarget.alias}에게
            </span>
          ) : null}
          <time
            className="text-[9px] text-slate-400"
            dateTime={message.createdAt}
          >
            {formatChatTime(message.createdAt)}
          </time>
        </div>
        <div className="mt-1.5 max-w-3xl rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] leading-6 text-slate-700 shadow-sm">
          {replyTarget ? (
            <p className="mb-2 border-l-2 border-violet-300 bg-slate-50 px-2 py-1 text-[9px] text-slate-500">
              {replyTarget.content}
            </p>
          ) : null}
          <p>{message.content}</p>
        </div>
        <span className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-400">
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
}: {
  chat?: PublicAnonymousChatDemo;
}) {
  const { messages, participantCount, topic } = chat;

  return (
    <section
      aria-labelledby="anonymous-chat-room-title"
      className="overflow-hidden bg-slate-50 text-slate-950"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className="flex items-center gap-2 text-sm font-semibold"
            id="anonymous-chat-room-title"
          >
            <MessageCircleMore className="size-4 text-violet-600" />
            전사원 익명 채팅
          </h2>
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-500">
            {participantCount}명 참여 중
          </span>
          <Badge
            className="border-slate-200 bg-slate-50 text-[8px] text-slate-500"
            variant="outline"
          >
            DEMO
          </Badge>
        </div>
        <Button
          aria-disabled="true"
          className="min-h-9 border-slate-200 bg-white text-slate-400 disabled:opacity-100"
          disabled
          size="sm"
          type="button"
          variant="outline"
        >
          <UserRoundCheck />
          참여자 목록
        </Button>
      </header>

      <div className="relative px-4 py-4 sm:px-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(100,116,139,0.18)_0.7px,transparent_0.7px)] [background-size:16px_16px]"
        />
        <aside className="relative rounded-md border border-amber-300 bg-[#fff0a6] px-4 py-3 text-amber-950 shadow-sm">
          <div className="flex items-start gap-3">
            <Pin className="mt-0.5 size-4 shrink-0 fill-current" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold">이번 주 주제</p>
              <p className="mt-2 text-xs font-semibold leading-6">
                {topic.title}
              </p>
              <p className="mt-2 text-[9px] text-amber-800">
                {topic.updatedBy} · {formatNoticeDate(topic.updatedAt)}
              </p>
            </div>
            <X aria-hidden="true" className="size-4 shrink-0 text-amber-800" />
          </div>
        </aside>

        <div className="relative mt-5 space-y-4" role="feed">
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

      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Button
            aria-disabled="true"
            className="hidden border-slate-200 text-slate-400 disabled:opacity-100 sm:inline-flex"
            disabled
            size="icon"
            type="button"
            variant="outline"
          >
            <Smile />
          </Button>
          <input
            aria-label="익명 메시지 입력"
            className="min-h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-100"
            disabled
            placeholder="익명으로 메시지를 입력하세요..."
            type="text"
          />
          <Button
            aria-disabled="true"
            className="min-h-11 min-w-28 bg-slate-200 text-slate-500 disabled:opacity-100"
            disabled
            type="button"
          >
            로그인 하기
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-400">
          <LockKeyhole className="size-3" />
          참여는 로그인 후 가능하며, 사원 인증(레벨 1+)이 필요합니다.
        </p>
      </div>
    </section>
  );
}
