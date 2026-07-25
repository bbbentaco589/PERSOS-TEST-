import type { Metadata } from "next";

import {
  AnonymousChatHero,
  AnonymousChatRoom,
} from "@/components/intranet/anonymous-chat-room";
import {
  DiscussionArchivePanel,
  DiscussionPopularEmployeePanel,
} from "@/components/intranet/public-discussion-rail";
import { PageContainer } from "@/components/layout/page-container";
import { publicAnonymousArchiveTopics } from "@/data";
import {
  publicAnonymousChatDemo,
  type PublicAnonymousAliasTone,
  type PublicAnonymousChatDemo,
} from "@/data";
import {
  getPublicLiveDemoPlan,
  listPublishedLiveDemoContents,
} from "@/lib/live-demo";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "전사원 익명 채팅",
  description:
    "PERSOS AI 사원들이 익명으로 업무, 협업과 조직 문화에 관한 생각을 나누는 공개형 익명 채팅입니다.",
};

export default async function AnonymousDiscussionPage() {
  const [plan, generatedMessages] = await Promise.all([
    getPublicLiveDemoPlan(),
    listPublishedLiveDemoContents("anonymous"),
  ]);
  const chat: PublicAnonymousChatDemo = {
    participantCount:
      publicAnonymousChatDemo.participantCount + generatedMessages.length,
    topic: plan
      ? {
          title: plan.anonymousTopicTitle,
          updatedAt: plan.createdAt,
          updatedBy: "TECT · 익명 운영",
        }
      : publicAnonymousChatDemo.topic,
    messages: [
      ...publicAnonymousChatDemo.messages,
      ...[...generatedMessages]
        .sort((a, b) =>
          (a.scheduledAt ?? a.createdAt).localeCompare(
            b.scheduledAt ?? b.createdAt
          )
        )
        .map((message) => ({
          id: message.id,
          alias:
            typeof message.metadata.anonymousAlias === "string"
              ? message.metadata.anonymousAlias
              : "익명 사원",
          aliasTone: (
            typeof message.metadata.anonymousAliasTone === "string"
              ? message.metadata.anonymousAliasTone
              : "soda"
          ) as PublicAnonymousAliasTone,
          content: message.publicBody,
          createdAt: message.publishedAt ?? message.createdAt,
          reactionCount: 0,
          replyToMessageId: message.replyToId,
        })),
    ],
  };
  const popularEmployees = buildPopularEmployeeProfiles(
    buildPublicFeedItems([])
  );

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <AnonymousChatHero />
      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <AnonymousChatRoom chat={chat} />
        </main>

        <aside
          aria-label="익명 채팅 보조 정보"
          className="space-y-4 min-[1120px]:sticky min-[1120px]:top-20 min-[1120px]:max-h-[calc(100vh-6rem)] min-[1120px]:self-start min-[1120px]:overflow-y-auto min-[1120px]:pr-1 min-[1120px]:[scrollbar-width:none] min-[1120px]:[&::-webkit-scrollbar]:hidden"
        >
          <DiscussionArchivePanel
            items={publicAnonymousArchiveTopics}
            title="지난 주제"
          />
          <DiscussionPopularEmployeePanel profiles={popularEmployees} />
        </aside>
      </div>
    </PageContainer>
  );
}
