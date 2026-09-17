"use client";

import { Flame, MessageCircleMore, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { AnonymousChatRoom } from "@/components/intranet/anonymous-chat-room";
import { DiscussionArchivePanel } from "@/components/intranet/public-discussion-rail";
import type {
  PublicAnonymousChatDemo,
  PublicAnonymousMessage,
  PublicArchiveTopic,
} from "@/data/public-discussion-demo";

type ActiveAnonymousThread = {
  root: PublicAnonymousMessage;
  replyCount: number;
  participantCount: number;
  latestAt: string;
};

function buildActiveThreads(messages: PublicAnonymousMessage[]) {
  const messageById = new Map(messages.map((message) => [message.id, message]));
  const threads = new Map<string, PublicAnonymousMessage[]>();

  for (const message of messages) {
    let root = message;
    const visited = new Set<string>();
    while (root.replyToMessageId && !visited.has(root.id)) {
      visited.add(root.id);
      const parent = messageById.get(root.replyToMessageId);
      if (!parent) break;
      root = parent;
    }
    const threadMessages = threads.get(root.id) ?? [];
    threadMessages.push(message);
    threads.set(root.id, threadMessages);
  }

  return [...threads.entries()]
    .map(([rootId, threadMessages]): ActiveAnonymousThread | null => {
      const root = messageById.get(rootId);
      if (!root || threadMessages.length < 2) return null;
      return {
        root,
        replyCount: threadMessages.length - 1,
        participantCount: new Set(
          threadMessages.map((message) => message.alias)
        ).size,
        latestAt: threadMessages.reduce(
          (latest, message) =>
            message.createdAt > latest ? message.createdAt : latest,
          root.createdAt
        ),
      };
    })
    .filter((thread): thread is ActiveAnonymousThread => Boolean(thread))
    .sort(
      (left, right) =>
        right.replyCount - left.replyCount ||
        right.participantCount - left.participantCount ||
        right.latestAt.localeCompare(left.latestAt) ||
        left.root.id.localeCompare(right.root.id)
    )
    .slice(0, 3);
}

function ActiveAnonymousThreadsPanel({
  chat,
  onSelectThread,
}: {
  chat: PublicAnonymousChatDemo;
  onSelectThread: (messageId: string) => void;
}) {
  const activeThreads = useMemo(
    () => buildActiveThreads(chat.messages),
    [chat.messages]
  );
  const replyCount = chat.messages.filter(
    (message) => message.replyToMessageId
  ).length;
  const participantCount = new Set(
    chat.messages.map((message) => message.alias)
  ).size;

  return (
    <section
      aria-labelledby="active-anonymous-threads"
      className="overflow-hidden rounded-lg border border-yellow-300/15 bg-[#0b121d] text-zinc-100"
    >
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-yellow-300/12 px-4">
        <h2
          className="flex items-center gap-2 text-sm font-semibold"
          id="active-anonymous-threads"
        >
          <Flame className="size-4 text-orange-500" />
          지금 불붙은 대화
        </h2>
        <span className="text-[9px] text-zinc-600">현재 주제</span>
      </header>

      {activeThreads.length ? (
        <ol className="divide-y divide-yellow-300/10 px-4">
          {activeThreads.map((thread, index) => (
            <li key={thread.root.id}>
              <button
                className="grid w-full grid-cols-[1rem_minmax(0,1fr)] gap-2 py-3.5 text-left transition hover:text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300"
                onClick={() => onSelectThread(thread.root.id)}
                type="button"
              >
                <span className="pt-0.5 font-mono text-[9px] text-yellow-300/75">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[11px] font-medium leading-5 text-zinc-300">
                    {thread.root.content}
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-[9px] text-zinc-600">
                    <span className="flex items-center gap-1">
                      <MessageCircleMore className="size-3" />
                      답글 {thread.replyCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersRound className="size-3" />
                      익명 {thread.participantCount}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-5 text-[10px] leading-5 text-zinc-600">
          아직 답글이 이어진 대화가 없습니다.
        </p>
      )}

      <dl className="grid grid-cols-3 border-t border-yellow-300/10 px-4 py-3 text-center">
        {[
          ["메시지", chat.messages.length],
          ["답글", replyCount],
          ["익명 참여", participantCount],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[8px] text-zinc-600">{label}</dt>
            <dd className="mt-1 font-mono text-[11px] text-yellow-200">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AnonymousDiscussionBoard({
  archiveItems,
  chat,
}: {
  archiveItems: PublicArchiveTopic[];
  chat: PublicAnonymousChatDemo;
}) {
  const visibleArchiveItems = archiveItems.slice(0, 5);
  const [scrollRequestNonce, setScrollRequestNonce] = useState(0);
  const [focusedMessageId, setFocusedMessageId] = useState<string>();

  return (
    <div className="-mx-4 mt-4 grid gap-0 border-y border-yellow-300/15 bg-[#080d15] p-0 shadow-[0_18px_55px_rgba(0,0,0,0.22)] sm:mx-0 sm:mt-6 sm:gap-4 sm:rounded-lg sm:border sm:p-4 min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
      <main className="min-w-0">
        <AnonymousChatRoom
          chat={chat}
          focusMessageId={focusedMessageId}
          scrollRequestNonce={scrollRequestNonce}
        />
      </main>

      <aside
        aria-label="익명 채팅 보조 정보"
        className="space-y-4 max-md:hidden min-[1120px]:sticky min-[1120px]:top-20 min-[1120px]:max-h-[calc(100vh-6rem)] min-[1120px]:self-start min-[1120px]:overflow-y-auto min-[1120px]:pr-1 min-[1120px]:[scrollbar-width:none] min-[1120px]:[&::-webkit-scrollbar]:hidden"
      >
        <DiscussionArchivePanel
          items={visibleArchiveItems}
          onSelectItem={() => {
            setFocusedMessageId(undefined);
            setScrollRequestNonce(Date.now());
          }}
          title="지난 주제"
          variant="anonymous"
        />
        <ActiveAnonymousThreadsPanel
          chat={chat}
          onSelectThread={setFocusedMessageId}
        />
      </aside>
    </div>
  );
}
