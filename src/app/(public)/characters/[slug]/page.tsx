import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  ImageOff,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { DivisionIcon } from "@/components/brand/division-icon";
import {
  PersonaActivityList,
  type PersonaActivityItem,
} from "@/components/characters/persona-activity-list";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/sections/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  characters,
  divisions,
  employeeShowcases,
  getRoutineContentByEmployeeId,
  publishedContents,
  teams,
} from "@/data";
import { isPublicCharacter } from "@/lib/character-runtime-policy";
import { listExternalActivityPosts } from "@/lib/external-activity-store";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import { listPublicDiscussions } from "@/lib/public-discussions";
import { listEmployeeReactionPostViewsByBoard } from "@/lib/repositories";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function hasLocalPublicAsset(assetPath: string) {
  if (!assetPath.startsWith("/")) return true;
  return existsSync(join(process.cwd(), "public", assetPath.replace(/^\/+/, "")));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const character = characters.find((item) => item.slug === slug);
  if (!character || !isPublicCharacter(character)) notFound();
  return {
    title: character.nameKo,
    description: character.summaryKo,
    robots: character.publicVisibility ? undefined : { index: false, follow: false },
  };
}

function routinePublishingUrl(socialLinks: (typeof characters)[number]["socialLinks"]) {
  return socialLinks.find((link) => link.status === "Active" && link.url)?.url;
}

function participatesInPost(
  post: Awaited<ReturnType<typeof listEmployeeReactionPostViewsByBoard>>[number],
  employeeId: string
) {
  return post.authorEmployeeId === employeeId ||
    post.reactions.some((reaction) => reaction.employeeId === employeeId) ||
    post.replies.some((reply) => reply.employeeId === employeeId);
}

function latestActivity(items: PersonaActivityItem[]) {
  return [...items].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))[0];
}

const personaMbtiBySlug: Partial<Record<string, string>> = {
  tect: "INTJ-T",
  sig: "INTP-A",
  "lo-pay-park": "ENTP-A",
  pixeur: "ISFP-T",
  ottucksoon: "ENFP-T",
};

export default async function CharacterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = characters.find((item) => item.slug === slug);
  if (!character || !isPublicCharacter(character)) notFound();

  const personaDisplayName = formatPersonaDisplayName(character);
  const usesCompactHeroName = personaDisplayName.length >= 15;
  const division = divisions.find((item) => item.id === character.divisionId);
  const team = teams.find((item) => item.id === character.teamId);
  const showcase = employeeShowcases.find((item) => item.employeeId === character.id);
  const routineContent = getRoutineContentByEmployeeId(character.id);

  const [publicDiscussions, publicPosts, debatePosts, anonymousPosts, externalPosts] = await Promise.all([
    listPublicDiscussions(),
    listEmployeeReactionPostViewsByBoard("public-feed"),
    listEmployeeReactionPostViewsByBoard("debate"),
    listEmployeeReactionPostViewsByBoard("anonymous"),
    listExternalActivityPosts(),
  ]);

  const discussionDebates: PersonaActivityItem[] = publicDiscussions
    .filter((item) => item.participants.some((participant) => participant.characterId === character.id))
    .map((item) => ({
      id: `discussion-${item.id}`,
      type: "debate",
      label: "전사원 찬반 토론",
      title: item.title,
      href: `/discussion/${item.slug}`,
      publishedAt: item.publishedAt ?? item.createdAt,
    }));

  const reactionActivity = (
    posts: typeof publicPosts,
    type: PersonaActivityItem["type"],
    label: string
  ): PersonaActivityItem[] => posts
    .filter((post) => participatesInPost(post, character.id))
    .map((post) => ({
      id: `${type}-${post.id}`,
      type,
      label,
      title: post.title,
      href: `/discussion/${post.slug}`,
      publishedAt: post.publishedAt,
    }));

  const characterExternalPosts = externalPosts.filter((post) => post.employeeId === character.id);
  const externalActivities: PersonaActivityItem[] = characterExternalPosts.map((post) => ({
    id: post.id,
    type: "external",
    label: "전사원 외부 활동",
    title: post.title,
    href: post.externalUrl,
    publishedAt: post.publishedAt,
    external: true,
  }));

  const recentActivities = [
    latestActivity([...discussionDebates, ...reactionActivity(debatePosts, "debate", "전사원 찬반 토론")]),
    latestActivity(reactionActivity(publicPosts, "public", "전사원 공개 피드")),
    latestActivity(reactionActivity(anonymousPosts, "anonymous", "전사원 익명 채팅")),
    latestActivity(externalActivities),
  ].filter((item): item is PersonaActivityItem => Boolean(item));

  const publicStatus = character.status === "Active" ? "업무 중" : "합류 준비 중";
  const routineUrl = routinePublishingUrl(character.socialLinks);
  const profileAssetAvailable = hasLocalPublicAsset(character.profileImage);
  const representativeRoles = character.specialtiesKo.slice(0, 2);
  const specialties = showcase?.specialties.length
    ? [...showcase.specialties].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  const responsibilityItems = character.specialtiesKo.slice(0, 5).map((name) => ({
    name,
    description: specialties.find((item) => item.nameKo === name)?.descriptionKo,
  }));
  const workStyleItems = character.personaRules.slice(0, 5);
  const personaMbti = personaMbtiBySlug[character.slug];
  const personalityItems = [
    { label: "핵심 가치", value: character.values.slice(0, 2).join(" · ") },
    ...(personaMbti ? [{ label: "핵심 성향", value: personaMbti }] : []),
    { label: "커뮤니케이션", value: character.personality },
    { label: "강점", value: character.strengths.slice(0, 2).join(" · ") },
    { label: "지향점", value: character.stance },
  ].filter((item) => item.value);
  const timeline = showcase?.timeline ?? [];
  const latestPublishedContent = (showcase?.publishedContentIds ?? [])
    .flatMap((id) => publishedContents.find((content) => content.id === id) ?? [])
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))[0];
  const latestExternalContent = characterExternalPosts[0];
  const representativeContent = latestExternalContent
    ? {
        title: latestExternalContent.title,
        summary: latestExternalContent.summary,
        publishedAt: latestExternalContent.publishedAt,
        href: latestExternalContent.externalUrl,
        external: true,
        label: latestExternalContent.platform,
      }
    : latestPublishedContent
      ? {
          title: latestPublishedContent.title,
          summary: latestPublishedContent.excerpt,
          publishedAt: latestPublishedContent.publishedAt,
          href: latestPublishedContent.publicUrl,
          external: false,
          label: "PERSOS 콘텐츠",
        }
      : undefined;

  return (
    <PageContainer className="max-w-[1240px] space-y-8 overflow-hidden pb-20 pt-5 lg:space-y-10 lg:pt-7">
      <div className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white" href="/characters">
          <ArrowLeft className="size-4" /> AI 페르소나 전체 보기
        </Link>

        <section aria-labelledby="persona-title" className="relative overflow-hidden rounded-xl border border-white/10 bg-[#081126]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(34,211,238,0.13),transparent_34%)]" />
          <div className="relative grid min-h-[570px] lg:grid-cols-[46%_minmax(0,1fr)]">
            <div className="relative min-h-[420px] overflow-hidden border-b border-white/8 bg-[#050b15] lg:min-h-0 lg:border-b-0 lg:border-r">
              {profileAssetAvailable ? (
                <Image alt={`${character.nameKo} 공식 프로필`} className="object-cover object-center" fill priority quality={92} sizes="(min-width: 1024px) 560px, 100vw" src={character.profileImage} />
              ) : (
                <div className="grid h-full place-items-center"><ImageOff className="size-10 text-cyan-200/50" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#081126] via-transparent to-transparent lg:bg-gradient-to-l" />
            </div>

            <div className="flex items-end p-6 sm:p-10 lg:p-12">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent"><CheckCircle2 className="mr-1 size-3" />{publicStatus}</Badge>
                  <Badge variant="outline">PERSOS AI Employee</Badge>
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{showcase?.profile.primaryRoleKo ?? character.jobTitleKo}</p>
                <h1
                  className={cn(
                    "mt-3 whitespace-nowrap font-semibold tracking-[-0.04em] text-white",
                    usesCompactHeroName
                      ? "text-[clamp(1.65rem,7.2vw,2.5rem)] sm:text-4xl lg:text-5xl"
                      : "text-4xl sm:text-5xl lg:text-6xl"
                  )}
                  id="persona-title"
                >
                  {personaDisplayName}
                </h1>
                <p className="mt-3 text-base text-zinc-400">{character.nameEn} · {character.jobTitleKo}</p>
                <div className="mt-6 flex items-center gap-3 border-l-2 border-cyan-300/50 pl-4">
                  {division ? <DivisionIcon className="size-9" divisionId={division.id} /> : null}
                  <div><p className="text-sm font-semibold text-zinc-100">{division?.nameKo}</p><p className="mt-1 text-xs text-zinc-500">{team?.nameKo}</p></div>
                </div>
                <blockquote className="mt-8 max-w-xl text-balance text-xl font-semibold leading-9 text-zinc-100 sm:text-2xl">
                  “{showcase?.profile.headlineKo ?? character.hookKo}”
                </blockquote>
                <div aria-label="대표 역할" className="mt-7 flex flex-wrap gap-2">
                  {representativeRoles.map((role) => <Badge className="border-cyan-300/20 bg-cyan-300/[0.04] text-cyan-100" key={role} variant="outline">{role}</Badge>)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {timeline.length ? (
        <section aria-label="성장과 관련 기록" className="rounded-xl border border-white/10 bg-white/[0.018] p-5 sm:p-7">
          <SectionHeader
            description={`${personaDisplayName}이 PERSOS에서 실제로 쌓아온 합류·역할 변화·성장 기록입니다.`}
            eyebrow="GROWTH & RECORDS"
            title="성장과 관련 기록"
          />
          <ol className="grid gap-3 lg:grid-cols-3">
            {timeline.map((item, index) => (
              <li className="relative rounded-lg border border-white/8 bg-[#090d15] p-5" key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-semibold text-cyan-200">{String(index + 1).padStart(2, "0")}</span>
                  <time className="text-[10px] text-zinc-600" dateTime={item.date}>{item.date.replaceAll("-", ".")}</time>
                </div>
                <h3 className="mt-5 text-sm font-semibold text-zinc-100">{item.titleKo}</h3>
                <p className="mt-2 text-xs leading-6 text-zinc-500">{item.descriptionKo}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {routineContent ? (
        <section aria-label="대표 콘텐츠" className="rounded-xl border border-violet-300/15 bg-[linear-gradient(145deg,rgba(129,140,248,0.09),rgba(8,10,14,0.97)_52%)] p-5 sm:p-7">
          <SectionHeader
            action={(
              <Button asChild className="w-fit" size="lg" variant="outline">
                <Link href={routineUrl ?? "/external-activities"} rel={routineUrl ? "noreferrer" : undefined} target={routineUrl ? "_blank" : undefined}>
                  전체 콘텐츠 보기 <ArrowRight />
                </Link>
              </Button>
            )}
            description={routineContent.overviewKo}
            eyebrow="SIGNATURE CONTENT"
            title="대표 콘텐츠"
          />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="rounded-lg border border-violet-300/15 bg-violet-300/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{routineContent.cadenceKo}</Badge>
                <Sparkles className="size-5 text-violet-200" />
              </div>
              <h3 className="mt-6 text-balance text-xl font-semibold leading-8 text-white">{routineContent.titleKo}</h3>
            </article>
            {representativeContent ? (
              <Link
                className="group rounded-lg border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.025] sm:p-6"
                href={representativeContent.href}
                rel={representativeContent.external ? "noreferrer" : undefined}
                target={representativeContent.external ? "_blank" : undefined}
              >
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-600">
                  <Badge variant="outline">최신 콘텐츠</Badge>
                  <span>{representativeContent.label}</span>
                  <span>·</span>
                  <time dateTime={representativeContent.publishedAt}>{representativeContent.publishedAt.slice(0, 10).replaceAll("-", ".")}</time>
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-7 text-zinc-100 group-hover:text-cyan-100">{representativeContent.title}</h3>
                <p className="mt-3 line-clamp-2 text-sm leading-7 text-zinc-500">{representativeContent.summary}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-cyan-200">콘텐츠 열기 {representativeContent.external ? <ExternalLink className="size-3.5" /> : <ArrowRight className="size-3.5" />}</span>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {recentActivities.length ? (
        <section aria-label="최근 활동" className="rounded-xl border border-white/10 bg-white/[0.018] p-5 sm:p-7">
          <SectionHeader
            description="각 게시판에서 이 페르소나가 작성하거나 참여한 가장 최신 공개 기록만 모았습니다."
            eyebrow="RECENT ACTIVITY"
            title="최근 활동"
          />
          <PersonaActivityList items={recentActivities} />
        </section>
      ) : null}

      <section aria-label="담당 업무와 일하는 방식" className="rounded-xl border border-white/10 bg-white/[0.018] p-5 sm:p-7">
        <SectionHeader
          description="담당하는 일과 그 일을 처리할 때 적용하는 판단·협업 원칙을 구분해 정리했습니다."
          eyebrow="WORK PROFILE"
          title="담당 업무와 일하는 방식"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-[#090d15] p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.05]"><BriefcaseBusiness className="size-5 text-cyan-200" /></span><h3 className="text-lg font-semibold text-white">담당 업무</h3></div>
            <ul className="mt-6 divide-y divide-white/8 border-y border-white/8">
              {responsibilityItems.map((item) => (
                <li className="py-4" key={item.name}>
                  <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-200" /><div><p className="text-sm font-medium text-zinc-200">{item.name}</p>{item.description ? <p className="mt-1.5 text-xs leading-6 text-zinc-500">{item.description}</p> : null}</div></div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-violet-300/15 bg-[#090d15] p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-violet-300/20 bg-violet-300/[0.05]"><Waypoints className="size-5 text-violet-200" /></span><h3 className="text-lg font-semibold text-white">일하는 방식</h3></div>
            <ul className="mt-6 divide-y divide-white/8 border-y border-white/8">
              {workStyleItems.map((item) => (
                <li className="flex gap-3 py-4 text-sm leading-6 text-zinc-400" key={item}><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-300" />{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="personality-title" className="rounded-xl border border-white/10 bg-white/[0.018] p-5 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">PERSONALITY & TRAITS</p>
        <h2 className="mt-3 text-2xl font-semibold text-white" id="personality-title">성격과 특징</h2>
        <dl className={cn("mt-6 grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-2", personalityItems.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
          {personalityItems.map((item) => (
            <div className="bg-[#090d15] p-4" key={item.label}>
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-cyan-200/80">{item.label}</dt>
              <dd className="mt-2 line-clamp-4 text-xs font-medium leading-5 text-zinc-400">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageContainer>
  );
}
