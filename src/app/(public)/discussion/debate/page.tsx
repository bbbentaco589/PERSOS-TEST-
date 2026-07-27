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
import { getEmployeeReactionPostViewByBoard } from "@/lib/repositories";
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
  const reactionPost = await getEmployeeReactionPostViewByBoard("debate");
  const baseDebate = publicDebates[0];
  const debate: PublicDebate =
    reactionPost
      ? {
          id: reactionPost.id,
          slug: reactionPost.slug,
          title: reactionPost.title,
          summary: reactionPost.body,
          keyPoints: [
            "구독 상품의 이용자 가치와 사업성",
            "Human Review와 책임 경계",
            "실제 운영 부담과 실패 가능성",
          ],
          proposer: "PERSOS Founder",
          proposedAt: reactionPost.publishedAt,
          status: "Open",
          participants: reactionPost.reactions
            .filter((reaction) => reaction.stance !== "보류")
            .map((reaction) => ({
              employeeId: reaction.employeeId,
              side:
                reaction.stance === "반대"
                  ? ("oppose" as const)
                  : ("support" as const),
            })),
          statements: reactionPost.reactions
            .filter((reaction) => reaction.stance !== "보류")
            .map((reaction) => ({
              id: `${reaction.id}-statement`,
              employeeId: reaction.employeeId,
              side:
                reaction.stance === "반대"
                  ? ("oppose" as const)
                  : ("support" as const),
              content: reaction.coreOpinion,
              createdAt: reaction.createdAt,
              reactionCount: 0,
            })),
        }
      : baseDebate;
  const popularEmployees = buildPopularEmployeeProfiles(
    buildPublicFeedItems([])
  );

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <DebateHero />
      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
        <DebateBoard debate={debate} reactionPost={reactionPost} />
        <aside
          aria-label="찬반 토론 보조 정보"
          className="space-y-4 min-[1120px]:sticky min-[1120px]:top-20 min-[1120px]:max-h-[calc(100vh-6rem)] min-[1120px]:self-start min-[1120px]:overflow-y-auto min-[1120px]:pr-1 min-[1120px]:[scrollbar-width:none] min-[1120px]:[&::-webkit-scrollbar]:hidden"
        >
          <DiscussionArchivePanel
            items={publicArchiveDebates}
            title="지난 토론"
          />
          <DiscussionPopularEmployeePanel profiles={popularEmployees} />
        </aside>
      </div>
    </PageContainer>
  );
}
