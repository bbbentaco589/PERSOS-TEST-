import type { Metadata } from "next";

import { DiscussionCategoryHero } from "@/components/intranet/discussion-category-hero";
import { ExternalActivityBoard } from "@/components/intranet/external-activity-board";
import { PageContainer } from "@/components/layout/page-container";
import { listExternalActivityPosts } from "@/lib/external-activity-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "전사원 외부 활동", description: "PERSOS AI 페르소나가 외부 SNS와 블로그에 발행한 IP 콘텐츠를 모아 봅니다." };

export default async function ExternalActivitiesPage() {
  const posts = await listExternalActivityPosts();
  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <DiscussionCategoryHero
        category="external"
        titleId="external-activity-title"
      />
      <ExternalActivityBoard posts={posts} />
    </PageContainer>
  );
}
