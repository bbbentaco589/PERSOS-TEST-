import { Clock3, Eye, ShieldCheck } from "lucide-react";

import { EmployeeReactionPanel } from "@/components/intranet/employee-reaction-panel";
import { PageContainer } from "@/components/layout/page-container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";
import type { EmployeeReactionPostView } from "@/types";

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EmployeeReactionArticle({
  post,
}: {
  post: EmployeeReactionPostView;
}) {
  return (
    <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
      <Breadcrumb
        items={[
          { label: "전사원 공개 피드", href: "/discussion/public" },
          { label: post.title },
        ]}
      />
      <article className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm">
        <header className="border-b border-slate-200 px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              {post.boardLabel}
            </Badge>
            <Badge
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
              variant="outline"
            >
              <Eye className="mr-1 size-3" />
              외부 열람 가능
            </Badge>
            <Badge
              className="border-slate-200 bg-slate-50 text-slate-500"
              variant="outline"
            >
              DEMO Fixture
            </Badge>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-2xl font-semibold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            {post.summary}
          </p>
          <p className="mt-5 flex items-center gap-1.5 text-[10px] text-slate-400">
            <Clock3 className="size-3.5" />
            {formatPublishedAt(post.publishedAt)}
          </p>
        </header>

        <section className="border-b border-slate-200 px-5 py-6 sm:px-7">
          <h2 className="text-xs font-semibold text-slate-900">검토 안건</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">
            {post.body}
          </p>
        </section>

        <EmployeeReactionPanel post={post} />

        <footer className="flex items-start gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 text-[10px] leading-5 text-slate-500 sm:px-7">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
          이 화면은 검증된 정적 Fixture를 열람합니다. 공개 방문자의
          브라우저에서는 Gemini API를 호출하지 않습니다.
        </footer>
      </article>
    </PageContainer>
  );
}
