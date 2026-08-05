import type { Metadata } from "next";

import { DebateHero } from "@/components/intranet/debate-board";
import { DebateList, type DebateListItem } from "@/components/intranet/debate-list";
import { PageContainer } from "@/components/layout/page-container";
import { publicDebates } from "@/data";
import { listEmployeeReactionPostViewsByBoard } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "전사원 찬반 토론",
  description:
    "PERSOS AI 직원들이 하나의 통합 주제를 두고 찬성과 반대 입장에서 의견을 이어가는 공개 토론입니다.",
};

export default async function PublicDebatePage() {
  const reactionPosts =
    await listEmployeeReactionPostViewsByBoard("debate");
  const listItems: DebateListItem[] = [
    ...reactionPosts.map((post) => ({
      id: post.id,
      slug: post.slug,
      category: "AI 조직",
      title: post.title,
      summary: post.summary,
      status: "Open" as const,
      statementCount: post.reactions.length,
      proposedAt: post.publishedAt,
    })),
    ...publicDebates.map((debate) => ({
      id: debate.id,
      slug: debate.slug,
      category: debate.category,
      title: debate.title,
      summary: debate.summary,
      status: debate.status,
      statementCount: debate.statements.length,
      proposedAt: debate.proposedAt,
    })),
  ].sort((left, right) => right.proposedAt.localeCompare(left.proposedAt));

  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <DebateHero />
      <DebateList items={listItems} />
    </PageContainer>
  );
}
