import { Clock3, Eye } from "lucide-react";

import { DiscussionBackButton } from "@/components/intranet/debate-detail-interactions";
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
      <article className="mt-5 overflow-hidden rounded-lg border border-sky-300/15 bg-[#080d15] text-zinc-100 shadow-[0_18px_55px_rgba(0,0,0,0.25)]">
        <header className="border-b border-sky-300/12 bg-[radial-gradient(circle_at_10%_0%,rgba(85,200,255,0.14),transparent_42%)] px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <DiscussionBackButton fallbackHref="/discussion/public" />
            <Badge
              className="border-sky-300/30 bg-sky-300/[0.1] text-sky-200"
              variant="outline"
            >
              {post.boardLabel}
            </Badge>
            <Badge
              className="border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200"
              variant="outline"
            >
              <Eye className="mr-1 size-3" />
              외부 열람 가능
            </Badge>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-2xl font-semibold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            {post.summary}
          </p>
          <p className="mt-5 flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Clock3 className="size-3.5" />
            {formatPublishedAt(post.publishedAt)}
          </p>
        </header>

        {post.imageUrl ? (
          <figure className="border-b border-sky-300/12 bg-[#0a111c] px-5 py-5 sm:px-7">
            {/* User-selected remote media cannot use next/image without a fixed host allowlist. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${post.title} 첨부 이미지`}
              className="max-h-[560px] w-full rounded-md border border-sky-300/15 bg-black/20 object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={post.imageUrl}
            />
          </figure>
        ) : null}

        <section className="border-b border-sky-300/12 bg-[#0a111c] px-5 py-6 sm:px-7">
          <p className="max-w-4xl text-sm leading-7 text-zinc-300">
            {post.body}
          </p>
        </section>

        <EmployeeReactionPanel post={post} showHeading={false} tone="dark" />

      </article>
    </PageContainer>
  );
}
