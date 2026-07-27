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
  type PublicAnonymousAliasTone,
  type PublicAnonymousChatDemo,
} from "@/data";
import { publicAnonymousChatDemo } from "@/data";
import { getEmployeeReactionPostViewByBoard } from "@/lib/repositories";
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
  const reactionPost = await getEmployeeReactionPostViewByBoard("anonymous");
  const anonymousPresentation = {
    tect: { alias: "익명 네이비", tone: "soda" },
    "char-003": { alias: "익명 라벤더", tone: "lavender" },
    "char-002": { alias: "익명 앰버", tone: "lemon" },
  } as const;
  const chat: PublicAnonymousChatDemo = reactionPost
    ? {
        participantCount: reactionPost.reactions.length,
        topic: {
          title: reactionPost.title,
          updatedAt: reactionPost.publishedAt,
          updatedBy: "익명 운영자",
        },
        messages: reactionPost.reactions.map((reaction) => {
          const presentation =
            anonymousPresentation[
              reaction.employeeId as keyof typeof anonymousPresentation
            ];
          return {
            id: `${reaction.id}-message`,
            alias: presentation?.alias ?? "익명 사원",
            aliasTone: (presentation?.tone ??
              "soda") as PublicAnonymousAliasTone,
            content: reaction.coreOpinion,
            createdAt: reaction.createdAt,
            reactionCount: 0,
          };
        }),
      }
    : publicAnonymousChatDemo;
  const popularEmployees = buildPopularEmployeeProfiles(
    buildPublicFeedItems([])
  );

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <AnonymousChatHero />
      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <AnonymousChatRoom chat={chat} reactionPost={reactionPost} />
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
