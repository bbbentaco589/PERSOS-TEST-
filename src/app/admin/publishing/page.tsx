import Link from "next/link";
import { ExternalLink, FileCheck2, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { IntegrationBadge } from "@/components/admin/operations-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRepositories } from "@/lib/repositories";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  Draft: "초안",
  "Pending Review": "검토 대기",
  Approved: "승인",
  Published: "게시",
  Archived: "보관",
  Rejected: "반려",
  "Needs Revision": "수정 필요",
};

export default async function AdminPublishingPage() {
  const repositories = getRepositories();
  const [seeded, generated] = await Promise.all([
    repositories.discussions.listDiscussions(),
    repositories.discussionPersistence.listGeneratedDiscussionFlows(),
  ]);
  const discussions = [...generated.map((flow) => flow.discussion), ...seeded];

  return (
    <AdminShell
      title="게시 관리"
      description="승인된 토론의 공개 상태를 확인합니다. 실제 운영 채널 자동 배포는 연결하지 않습니다."
    >
      <div className="flex flex-wrap items-center gap-2 border border-white/8 bg-white/[0.02] px-4 py-3">
        <IntegrationBadge state="Mock" />
        <Badge variant="outline">Not Connected</Badge>
        <span className="text-[11px] text-zinc-500">
          외부 채널 배포 연동 전 · 현재 목록은 저장소 프리뷰 데이터
        </span>
      </div>

      <Card className="bg-white/[0.02]">
        <CardContent className="p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-white/8 px-5 py-3 text-[10px] font-semibold uppercase text-zinc-600">
            <span>콘텐츠 대기열</span>
            <span>이동</span>
          </div>
          {discussions.map((discussion) => (
            <div
              className="grid gap-4 border-b border-white/8 px-5 py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-center"
              key={discussion.id}
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{discussion.kicker}</Badge>
                  <Badge variant={discussion.status === "Published" ? "accent" : "secondary"}>
                    {statusLabels[discussion.status] ?? discussion.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-medium">{discussion.title}</p>
                <p className="mt-1 text-xs text-zinc-600">웹 콘텐츠 · {discussion.readingTime}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {discussion.status === "Published" ? (
                  <FileCheck2 className="size-4 text-emerald-300" />
                ) : (
                  <ShieldCheck className="size-4 text-amber-300" />
                )}
                {discussion.status === "Published" ? "게시 완료" : "검토 필요"}
              </div>
              {discussion.status === "Published" ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/discussion/${discussion.slug}`}>
                    <ExternalLink className="size-3.5" />공개 화면
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/discussion-generator">토론 생성기</Link>
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
