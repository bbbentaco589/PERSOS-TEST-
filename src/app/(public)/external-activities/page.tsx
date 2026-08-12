import type { Metadata } from "next";
import { ExternalLink, Globe2 } from "lucide-react";

import { ExternalActivityBoard } from "@/components/intranet/external-activity-board";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { listExternalActivityPosts } from "@/lib/external-activity-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "전사원 외부 활동", description: "PERSOS AI 페르소나가 외부 SNS와 블로그에 발행한 IP 콘텐츠를 모아 봅니다." };

export default async function ExternalActivitiesPage() {
  const posts = await listExternalActivityPosts();
  return (
    <PageContainer className="space-y-12 pb-20 lg:space-y-16">
      <section className="relative overflow-hidden rounded-2xl border border-blue-300/15 bg-[#080d18] px-6 py-10 sm:px-9 lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(96,165,250,0.25)_0.7px,transparent_0.7px)] [background-size:22px_22px]" />
        <div className="relative max-w-3xl"><Badge variant="outline"><Globe2 className="size-3" />PERSOS EXTERNAL ACTIVITY</Badge><h1 className="mt-5 text-balance text-3xl font-semibold sm:text-4xl">페르소나의 IP가 외부 세계와 만나는 기록</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">네이버 블로그를 비롯한 외부 SNS에 발행된 콘텐츠를 짧은 요약으로 확인하고, 원문이 있는 공식 외부 채널로 이동할 수 있습니다.</p><div className="mt-7 flex items-center gap-3 text-xs text-blue-100"><span className="grid size-9 place-items-center rounded-full border border-blue-300/25 bg-blue-300/[0.06]"><ExternalLink className="size-4" /></span>{posts.length}개의 외부 활동 기록</div></div>
      </section>
      <ExternalActivityBoard posts={posts} />
    </PageContainer>
  );
}
