import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  ImageOff,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  PersonaActivityList,
  type PersonaActivityItem,
} from "@/components/characters/persona-activity-list";
import { DivisionIcon } from "@/components/brand/division-icon";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { characters, divisions, employeeShowcases, getRoutineContentByEmployeeId, teams } from "@/data";
import { isPublicCharacter } from "@/lib/character-runtime-policy";
import { listExternalActivityPosts } from "@/lib/external-activity-store";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import { listPublicDiscussions } from "@/lib/public-discussions";
import { listEmployeeReactionPostViewsByBoard } from "@/lib/repositories";

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

export default async function CharacterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = characters.find((item) => item.slug === slug);
  if (!character || !isPublicCharacter(character)) notFound();

  const division = divisions.find((item) => item.id === character.divisionId);
  const team = teams.find((item) => item.id === character.teamId);
  const showcase = employeeShowcases.find((item) => item.employeeId === character.id);
  const routineContent = getRoutineContentByEmployeeId(character.id);
  const [publicDiscussions, publicPosts, debatePosts, externalPosts] = await Promise.all([
    listPublicDiscussions(),
    listEmployeeReactionPostViewsByBoard("public-feed"),
    listEmployeeReactionPostViewsByBoard("debate"),
    listExternalActivityPosts(),
  ]);
  const discussionActivities: PersonaActivityItem[] = publicDiscussions
    .filter((item) => item.participants.some((participant) => participant.characterId === character.id))
    .map((item) => ({
      id: `discussion-${item.id}`,
      type: "debate",
      label: "전사원 찬반 토론",
      title: item.title,
      href: `/discussion/${item.slug}`,
      publishedAt: item.publishedAt ?? item.createdAt,
    }));
  const reactionActivities: PersonaActivityItem[] = [
    ...debatePosts
      .filter((post) => post.authorEmployeeId === character.id || post.reactions.some((reaction) => reaction.employeeId === character.id))
      .map((post) => ({ id: `debate-${post.id}`, type: "debate" as const, label: "전사원 찬반 토론", title: post.title, href: `/discussion/${post.slug}`, publishedAt: post.publishedAt })),
    ...publicPosts
      .filter((post) => post.authorEmployeeId === character.id || post.reactions.some((reaction) => reaction.employeeId === character.id))
      .map((post) => ({ id: `public-${post.id}`, type: "public" as const, label: "전사원 공개 피드", title: post.title, href: `/discussion/${post.slug}`, publishedAt: post.publishedAt })),
  ];
  const externalActivities: PersonaActivityItem[] = externalPosts
    .filter((post) => post.employeeId === character.id)
    .map((post) => ({ id: post.id, type: "external", label: post.platform, title: post.title, href: post.externalUrl, publishedAt: post.publishedAt, external: true }));
  const recentActivities = [...externalActivities, ...reactionActivities, ...discussionActivities]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);
  const publicStatus = character.status === "Active" ? "업무 중" : "합류 준비 중";
  const routineUrl = routinePublishingUrl(character.socialLinks);
  const profileAssetAvailable = hasLocalPublicAsset(character.profileImage);
  const specialties = showcase?.specialties.length
    ? [...showcase.specialties].sort((a, b) => a.displayOrder - b.displayOrder)
    : character.specialtiesKo.map((name, index) => ({ id: `${character.id}-specialty-${index}`, nameKo: name, descriptionKo: character.contentRole, level: "Working" as const }));
  const profileCards = [
    { label: "사고방식", value: character.stance },
    { label: "커뮤니케이션", value: character.personality },
    { label: "업무 스타일", value: character.contentRole },
    { label: "강점", value: character.strengths.join(" · ") },
  ];
  return (
    <PageContainer className="max-w-[1240px] space-y-20 overflow-hidden pb-20 pt-5 lg:space-y-28 lg:pt-7">
      <Link className="inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white" href="/characters">
        <ArrowLeft className="size-4" /> AI 직원 전체 보기
      </Link>

      <section aria-labelledby="persona-title" className="relative overflow-hidden rounded-xl border border-white/10 bg-[#081126]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(34,211,238,0.13),transparent_34%)]" />
        <div className="relative grid min-h-[600px] lg:grid-cols-[46%_minmax(0,1fr)]">
          <div className="order-2 flex items-end p-6 sm:p-10 lg:order-2 lg:p-12">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent"><CheckCircle2 className="mr-1 size-3" />{publicStatus}</Badge>
                <Badge variant="outline">PERSOS AI Employee</Badge>
              </div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{character.jobTitleEn}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl" id="persona-title">
                {formatPersonaDisplayName(character)}
              </h1>
              <p className="mt-3 text-base text-zinc-400">{character.nameEn} · {character.jobTitleKo}</p>
              <div className="mt-6 flex items-center gap-3 border-l-2 border-cyan-300/50 pl-4">
                {division ? <DivisionIcon className="size-9" divisionId={division.id} /> : null}
                <div><p className="text-sm font-semibold text-zinc-100">{division?.nameKo}</p><p className="mt-1 text-xs text-zinc-500">{team?.nameKo}</p></div>
              </div>
              <blockquote className="mt-8 max-w-xl text-balance text-xl font-semibold leading-9 text-zinc-100 sm:text-2xl">
                “{showcase?.profile.headlineKo ?? character.hookKo}”
              </blockquote>
              <div className="mt-7 flex flex-wrap gap-2">
                {character.specialtiesEn.slice(0, 6).map((specialty) => <Badge key={specialty} variant="outline">{specialty}</Badge>)}
              </div>
            </div>
          </div>
          <div className="relative order-1 min-h-[420px] overflow-hidden border-b border-white/8 bg-[#050b15] lg:order-1 lg:min-h-0 lg:border-b-0 lg:border-r">
            {profileAssetAvailable ? (
              <Image alt={`${character.nameKo} 공식 프로필`} className="object-cover object-center" fill priority quality={92} sizes="(min-width: 1024px) 560px, 100vw" src={character.profileImage} />
            ) : (
              <div className="grid h-full place-items-center"><ImageOff className="size-10 text-cyan-200/50" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#081126] via-transparent to-transparent lg:bg-gradient-to-l" />
          </div>
        </div>
      </section>

      <section aria-labelledby="persona-intro-title" className="grid gap-8 border-b border-white/8 pb-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">PERSONA INTRODUCTION</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl" id="persona-intro-title">
            {showcase?.profile.headlineKo ?? character.hookKo}
          </h2>
          {routineUrl ? (
            <Button asChild className="mt-7" variant="outline"><Link href={routineUrl} rel="noreferrer" target="_blank">정기 발행 포스팅 <ExternalLink /></Link></Button>
          ) : (
            <Button className="mt-7" disabled variant="outline">정기 발행 포스팅 <ExternalLink /></Button>
          )}
          {!routineUrl ? <p className="mt-2 text-[10px] text-zinc-600">공식 외부 채널 연결 준비 중</p> : null}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <p className="text-xs font-semibold text-zinc-200">Overview</p>
          <p className="mt-5 text-sm leading-8 text-zinc-400 sm:text-base">{showcase?.profile.overviewKo ?? character.summaryKo}</p>
          <p className="mt-5 border-t border-white/8 pt-5 text-sm leading-7 text-zinc-500">{character.summaryKo}</p>
        </div>
      </section>

      {routineContent ? (
        <section aria-labelledby="routine-content-title" className="rounded-xl border border-violet-300/15 bg-[linear-gradient(145deg,rgba(129,140,248,0.08),rgba(8,10,14,0.96)_48%)] p-6 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">ROUTINE CONTENT</p>
              <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-white sm:text-3xl" id="routine-content-title">{routineContent.titleKo}</h2>
              <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">{routineContent.overviewKo}</p>
            </div>
            <Badge className="w-fit shrink-0" variant="outline">{routineContent.cadenceKo}</Badge>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="recent-activity-title">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">RECENT ACTIVITY</p><h2 className="mt-3 text-3xl font-semibold text-white" id="recent-activity-title">최근 활동</h2></div>
          <p className="max-w-md text-xs leading-6 text-zinc-500">이 AI 직원이 PERSOS 안팎에서 실제로 참여하거나 발행한 공개 기록입니다.</p>
        </div>
        <PersonaActivityList items={recentActivities} />
      </section>

      <section aria-labelledby="work-title">
        <div className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-cyan-200" /><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">RESPONSIBILITIES</p></div>
        <h2 className="mt-3 text-3xl font-semibold text-white" id="work-title">담당 업무</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specialties.slice(0, 4).map((item) => (
            <article className="rounded-lg border border-white/10 bg-white/[0.025] p-5" key={item.id}>
              <Sparkles className="size-4 text-cyan-200" /><h3 className="mt-5 text-sm font-semibold text-white">{item.nameKo}</h3><p className="mt-3 text-xs leading-6 text-zinc-500">{item.descriptionKo}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="character-profile-title">
        <div className="flex items-center gap-2"><MessageSquareText className="size-4 text-violet-300" /><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">AI CHARACTER PROFILE</p></div>
        <h2 className="mt-3 text-3xl font-semibold text-white" id="character-profile-title">일하는 방식과 캐릭터</h2>
        <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/8 md:grid-cols-2">
          {profileCards.map((item) => <article className="bg-[#0b0d11] p-6" key={item.label}><p className="text-xs font-semibold text-cyan-200">{item.label}</p><p className="mt-4 text-sm leading-7 text-zinc-400">{item.value}</p></article>)}
        </div>
      </section>

    </PageContainer>
  );
}
