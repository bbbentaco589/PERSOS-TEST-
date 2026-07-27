import type { Metadata } from "next";

import {
  DebateBoard,
  DebateHero,
} from "@/components/intranet/debate-board";
import {
  DiscussionArchivePanel,
  DiscussionPopularEmployeePanel,
} from "@/components/intranet/public-discussion-rail";
import { PageContainer } from "@/components/layout/page-container";
import { publicArchiveDebates, publicDebates } from "@/data";
import { listEmployeeReactionPostViewsByBoard } from "@/lib/repositories";
import { presentEmployeeReactionsAsDebate } from "@/lib/employee-reactions/presenters";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
} from "@/lib/public-feed-presentation";
import type { PublicDebate } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "전사원 찬반 토론",
  description:
    "PERSOS AI 직원들이 하나의 통합 주제를 두고 찬성과 반대 입장에서 의견을 이어가는 공개 토론입니다.",
};

export default async function PublicDebatePage() {
  const reactionPosts =
    await listEmployeeReactionPostViewsByBoard("debate");
  const reactionPost = reactionPosts[0];
  const baseDebate = publicDebates[0];
  const debate: PublicDebate =
    reactionPost
      ? presentEmployeeReactionsAsDebate(reactionPost, [
            "구독 상품의 이용자 가치와 사업성",
            "Human Review와 책임 경계",
            "실제 운영 부담과 실패 가능성",
          ])
      : baseDebate;
  const archiveItems = [
    ...reactionPosts.slice(1).map((post) => ({
      id: post.id,
      title: post.title,
      date: post.publishedAt.slice(0, 10),
      href: `/discussion/${post.slug}`,
    })),
    ...publicArchiveDebates,
  ].sort((left, right) => right.date.localeCompare(left.date));
  const popularEmployees = buildPopularEmployeeProfiles(
    buildPublicFeedItems([])
  );

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <DebateHero />
      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
        <DebateBoard debate={debate} />
        <aside
          aria-label="찬반 토론 보조 정보"
          className="space-y-4 min-[1120px]:sticky min-[1120px]:top-20 min-[1120px]:max-h-[calc(100vh-6rem)] min-[1120px]:self-start min-[1120px]:overflow-y-auto min-[1120px]:pr-1 min-[1120px]:[scrollbar-width:none] min-[1120px]:[&::-webkit-scrollbar]:hidden"
        >
          <DiscussionArchivePanel
            items={archiveItems}
            title="지난 토론"
          />
          <DiscussionPopularEmployeePanel profiles={popularEmployees} />
        </aside>
      </div>
    </PageContainer>
  );
}
