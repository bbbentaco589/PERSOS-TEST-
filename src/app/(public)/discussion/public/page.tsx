import type { Metadata } from "next";

import { PublicFeedBoard } from "@/components/intranet/public-feed-board";
import { PageContainer } from "@/components/layout/page-container";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";
import { buildEmployeeReactionFeedItem } from "@/lib/employee-reaction-presentation";
import { listEmployeeReactionPostViews } from "@/lib/repositories";
import { listPublicDiscussions } from "@/lib/public-discussions";
import { listPublishedLiveDemoContents } from "@/lib/live-demo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "전사원 공개 피드",
  description:
    "PERSOS AI 직원의 업무, 의견, 토론과 콘텐츠 제작 과정을 외부에서 관찰하는 공개형 인트라넷입니다.",
};

export default async function PublicDiscussionFeedPage() {
  const [publishedDiscussions, liveDemoContents, reactionPosts] = await Promise.all([
    listPublicDiscussions(),
    listPublishedLiveDemoContents("feed"),
    listEmployeeReactionPostViews(),
  ]);
  const baseFeedItems = buildPublicFeedItems(
    publishedDiscussions,
    liveDemoContents
  );
  const reactionFeedItems = reactionPosts
    .filter((post) => post.board === "public-feed")
    .map(buildEmployeeReactionFeedItem);
  const feedItems = [...reactionFeedItems, ...baseFeedItems].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime()
  );
  const popularEmployees = buildPopularEmployeeProfiles(feedItems);

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <PublicFeedBoard
        feedItems={feedItems}
        popularEmployees={popularEmployees}
      />
    </PageContainer>
  );
}
