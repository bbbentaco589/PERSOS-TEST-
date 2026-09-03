import { Clock3, Eye, MessageCircle } from "lucide-react";

import { DiscussionBackButton } from "@/components/intranet/debate-detail-interactions";
import { EmployeeReactionPanel } from "@/components/intranet/employee-reaction-panel";
import { PageContainer } from "@/components/layout/page-container";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { buildEmployeeReactionFeedItem } from "@/lib/employee-reaction-presentation";
import { buildPopularEmployeeProfiles } from "@/lib/public-feed-presentation";
import { formatPersonaDisplayName } from "@/lib/persona-display";
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
  const feedItem = buildEmployeeReactionFeedItem(post);
  const reactionEmployeeIds = new Set(
    post.reactions.map((reaction) => reaction.employee.id)
  );
  if (post.author) reactionEmployeeIds.add(post.author.id);
  const reactionProfiles = buildPopularEmployeeProfiles([feedItem], 50).filter(
    (profile) => reactionEmployeeIds.has(profile.employee.id)
  );

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
          <div className="mt-5 flex min-w-0 items-center gap-3">
            <EmployeeAvatar
              alt={`${feedItem.author.nameKo} 프로필`}
              className="size-10 rounded-full border border-sky-300/20 object-center"
              size={40}
              src={feedItem.author.profileImage}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {formatPersonaDisplayName(feedItem.author)}
                <span className="ml-2 font-mono text-[9px] font-normal text-zinc-600">
                  {feedItem.author.nameEn}
                </span>
              </p>
              <p className="mt-1 truncate text-[10px] text-zinc-500">
                {feedItem.divisionName} · {feedItem.teamName}
              </p>
            </div>
          </div>
          <h1 className="mt-4 max-w-4xl text-balance text-2xl font-semibold leading-tight sm:text-4xl">
            {post.title}
          </h1>
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
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200 sm:hidden">
            <span className="h-px w-5 bg-sky-300/60" /> 원문
          </div>
          <p className="max-w-4xl text-sm leading-7 text-zinc-300">
            {post.body}
          </p>
        </section>

        <div className="border-t-[10px] border-[#04070c] bg-[#101a28] sm:contents">
          <div className="flex items-center justify-between border-b border-sky-300/15 px-5 py-4 sm:hidden">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-sky-100">
              <MessageCircle className="size-4 text-sky-300" /> 댓글
            </h2>
            <span className="rounded-full border border-sky-300/20 bg-sky-300/[0.08] px-2 py-1 text-[9px] text-sky-200">
              {post.reactions.length}개
            </span>
          </div>
          <EmployeeReactionPanel
            post={post}
            profiles={reactionProfiles}
            showHeading={false}
            tone="dark"
          />
        </div>

      </article>
    </PageContainer>
  );
}
