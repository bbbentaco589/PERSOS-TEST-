import {
  Bot,
  Gem,
  Ghost,
  Orbit,
  Radio,
  Sparkles,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AnonymousTopicSeed } from "@/data/anonymous-intranet";
import { createAnonymousIdentityMap } from "@/lib/anonymous-identity";
import { cn } from "@/lib/utils";

const anonymousAvatarIcons: LucideIcon[] = [Gem, Orbit, Sparkles, Radio, Bot, Ghost];
const anonymousAvatarStyles = [
  "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  "border-indigo-300/25 bg-indigo-300/10 text-indigo-200",
  "border-violet-300/25 bg-violet-300/10 text-violet-200",
  "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  "border-sky-300/25 bg-sky-300/10 text-sky-200",
  "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-200",
];

function AnonymousAvatar({ avatarIndex }: { avatarIndex: number }) {
  const Icon = anonymousAvatarIcons[avatarIndex] ?? Sparkles;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border",
        anonymousAvatarStyles[avatarIndex] ?? anonymousAvatarStyles[0]
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function AnonymousFeedTimeline({ topic }: { topic: AnonymousTopicSeed }) {
  const identities = createAnonymousIdentityMap(
    topic.id,
    topic.messages.map((message) => message.employeeId)
  );

  return (
    <section aria-labelledby="anonymous-chat-title">
      <div className="border-b border-white/8 pb-5">
        <p className="text-[10px] font-semibold uppercase text-cyan-300">Anonymous Chat Timeline</p>
        <h2 className="mt-2 text-2xl font-semibold" id="anonymous-chat-title">익명 대화</h2>
        <p className="mt-2 text-sm text-zinc-500">검수된 데모 메시지를 시간순으로 표시합니다. 외부 사용자는 대화에 참여할 수 없습니다.</p>
      </div>

      <div className="space-y-5 border-b border-white/8 py-6">
        {topic.messages.map((message, index) => {
          const identity = identities.get(message.employeeId);
          if (!identity) return null;
          const isOffset = index % 2 === 1;

          return (
            <article className={cn("flex max-w-2xl items-start gap-3", isOffset && "ml-auto flex-row-reverse")} key={message.id}>
              <AnonymousAvatar avatarIndex={identity.avatarIndex} />
              <div className={cn("min-w-0 max-w-[calc(100%-52px)]", isOffset && "text-right")}>
                <div className={cn("flex flex-wrap items-center gap-2", isOffset && "justify-end")}>
                  <span className="text-xs font-semibold text-zinc-300">{identity.nickname}</span>
                  <span className="text-[9px] text-zinc-700">{formatMessageTime(message.createdAt)}</span>
                </div>
                <div className={cn(
                  "mt-2 rounded-lg border px-4 py-3 text-left text-sm leading-6",
                  isOffset
                    ? "border-cyan-300/20 bg-cyan-300/[0.07] text-zinc-300"
                    : "border-white/10 bg-white/[0.035] text-zinc-300"
                )}>
                  {message.replyToMessageId ? <p className="mb-2 border-l border-white/15 pl-2 text-[10px] text-zinc-600">앞선 메시지에 대한 답글</p> : null}
                  <p className="break-words">{message.content}</p>
                </div>
                <div className={cn("mt-2 flex items-center gap-1.5 text-[10px] text-zinc-600", isOffset && "justify-end")}>
                  <ThumbsUp className="size-3" />반응 {message.reactionCount}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-zinc-600">
        <Badge variant="outline">읽기 전용</Badge>
        <span>닉네임과 아바타는 같은 익명 주제 안에서만 고정됩니다.</span>
      </div>
    </section>
  );
}
