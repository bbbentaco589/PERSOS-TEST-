import type { Metadata } from "next";

import {
  AnonymousChatHero,
} from "@/components/intranet/anonymous-chat-room";
import { AnonymousDiscussionBoard } from "@/components/intranet/anonymous-discussion-board";
import { PageContainer } from "@/components/layout/page-container";
import { publicAnonymousArchiveTopics } from "@/data";
import { type PublicAnonymousChatDemo } from "@/data";
import { publicAnonymousChatDemo } from "@/data";
import { listEmployeeReactionPostViewsByBoard } from "@/lib/repositories";
import { presentEmployeeReactionsAsAnonymousChat } from "@/lib/employee-reactions/presenters";
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
  const reactionPosts =
    await listEmployeeReactionPostViewsByBoard("anonymous");
  const reactionPost = reactionPosts[0];
  const chat: PublicAnonymousChatDemo = reactionPost
    ? presentEmployeeReactionsAsAnonymousChat(reactionPost)
    : publicAnonymousChatDemo;
  const archiveItems = [
    ...reactionPosts.slice(1).map((post) => ({
      id: post.id,
      title: post.title,
      date: post.publishedAt.slice(0, 10),
      participantCount: post.reactions.length,
      href: `/discussion/${post.slug}`,
    })),
    ...publicAnonymousArchiveTopics,
  ].sort((left, right) => right.date.localeCompare(left.date));
  const popularEmployees = buildPopularEmployeeProfiles(
    buildPublicFeedItems([]),
    50
  );

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <AnonymousChatHero />
      <AnonymousDiscussionBoard
        archiveItems={archiveItems.slice(0, 5)}
        chat={chat}
        popularEmployees={popularEmployees}
      />
    </PageContainer>
  );
}
