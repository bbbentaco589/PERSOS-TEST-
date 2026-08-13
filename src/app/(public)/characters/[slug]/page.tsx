import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, BriefcaseBusiness, CalendarDays, ImageOff, MessageSquareText, Radio, Sparkles, UserRound } from "lucide-react";

import { CoreCrystalBadge } from "@/components/brand/core-crystal-badge";
import { DivisionIcon } from "@/components/brand/division-icon";
import { DiscussionCard } from "@/components/cards/discussion-card";
import { PageContainer } from "@/components/layout/page-container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { characters, divisions, employeeShowcases, teams } from "@/data";
import { canAccessCharacterDetail } from "@/lib/character-runtime-policy";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import { listPublicDiscussions } from "@/lib/public-discussions";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return characters.filter(canAccessCharacterDetail).map((character) => ({ slug: character.slug }));
}

function hasLocalPublicAsset(assetPath: string) {
  if (!assetPath.startsWith("/")) return true;
  return existsSync(join(process.cwd(), "public", assetPath.replace(/^\/+/, "")));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const character = characters.find((item) => item.slug === slug);
  if (!character || !canAccessCharacterDetail(character)) notFound();
  return {
    title: character.nameKo,
    description: character.summaryKo,
    robots: character.publicVisibility ? undefined : { index: false, follow: false },
  };
}

export default async function CharacterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const character = characters.find((item) => item.slug === slug);
  if (!character || !canAccessCharacterDetail(character)) notFound();

  const division = divisions.find((item) => item.id === character.divisionId);
  const team = teams.find((item) => item.id === character.teamId);
  const showcase = employeeShowcases.find((item) => item.employeeId === character.id);
  const publicDiscussions = await listPublicDiscussions();
  const recentDiscussions = publicDiscussions.filter((item) =>
    item.participants.some((participant) => participant.characterId === character.id)
  );
  const employeeStats = [
    { icon: BriefcaseBusiness, label: "Company", value: "PERSOS" },
    { icon: Sparkles, label: "Division", value: division?.nameKo ?? "-" },
    { icon: Radio, label: "Team", value: team?.nameKo ?? "-" },
    { icon: BriefcaseBusiness, label: "Position", value: character.jobTitleKo },
    ...(character.gender ? [{ icon: UserRound, label: "Gender", value: character.gender === "Undisclosed" ? "알 수 없음 / 비공개" : character.gender }] : []),
    { icon: MessageSquareText, label: "게시된 토론", value: `${recentDiscussions.length}건` },
  ];
  const heroAssetAvailable = hasLocalPublicAsset(character.heroImage);
  const profileAssetAvailable = hasLocalPublicAsset(character.profileImage);
  const runtimeStatusLabel = character.publicVisibility
    ? character.status === "Active" ? "업무 중" : "채용 중"
    : "비공개";

  return (
    <PageContainer className="space-y-8 pt-5 lg:pt-7">
      <Breadcrumb items={[{ label: "PERSOS", href: "/departments" }, { label: division?.nameKo ?? "조직", href: "/division-feed" }, { label: team?.nameKo ?? "팀" }, { label: character.nameKo }]} />

      <section className="relative min-h-[560px] overflow-hidden border border-white/10 bg-[#081126] sm:min-h-[620px]" data-asset-placeholder={!heroAssetAvailable ? "canonical-asset-pending" : character.profileStage === "Rough" ? "employee-hero" : undefined}>
        {heroAssetAvailable ? character.slug === "tect" ? (
          <div className="absolute inset-y-0 right-0 w-full sm:w-[78%] lg:w-[64%]">
            <Image
              alt={`${character.nameKo}, ${character.jobTitleKo} 업무 공간 Hero`}
              className="object-cover object-center"
              fill
              priority
              quality={92}
              sizes="(min-width: 1024px) 850px, 100vw"
              src={character.heroImage}
            />
          </div>
        ) : <Image
          alt={`${character.nameKo}, ${character.jobTitleKo} 업무 공간 Hero`}
          className={character.profileStage === "Rough"
            ? "object-cover opacity-35"
            : "object-cover object-center"}
          fill
          priority
          quality={92}
          sizes="(min-width: 1280px) 1320px, 100vw"
          src={character.heroImage}
        /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%)]">
          <div className="flex flex-col items-center gap-3 text-center text-zinc-500"><ImageOff className="size-8 text-cyan-200/60" /><p className="text-xs font-medium">Canonical 원본 에셋 연결 대기</p><p className="max-w-xs text-[10px] leading-5 text-zinc-600">저해상도 Preview를 Production Asset으로 대체하지 않습니다.</p></div>
        </div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-black/15 to-transparent" />
        <div className={character.slug === "tect" ? "absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-transparent to-transparent sm:bg-gradient-to-r sm:via-[#0b0d12]/55" : "absolute inset-0 bg-gradient-to-r from-black/80 via-black/15 to-transparent"} />
        <div className="relative flex min-h-[560px] items-end p-5 sm:min-h-[620px] sm:p-8 lg:p-10">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={character.publicVisibility && character.profileStage === "Approved" ? "accent" : "outline"}><Radio className="mr-1 size-3" />{runtimeStatusLabel}</Badge>
              <Badge variant="outline">{character.employeeCode} · {character.nameEn}</Badge>
            </div>
            <p className="mt-5 text-xs font-medium uppercase text-cyan-200">{character.jobTitleEn}</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{formatPersonaDisplayName(character)}</h1>
            <p className="mt-4 text-balance text-lg leading-8 text-zinc-200">{showcase?.profile.headlineKo ?? character.hookKo}</p>
            <div className="mt-5 flex items-center gap-3">
              {division ? <DivisionIcon divisionId={division.id} /> : null}
              <div>
                <p className="text-xs font-medium">{division?.nameKo} → {team?.nameKo}</p>
                <p className="mt-1 text-[11px] text-zinc-400">{character.jobTitleEn}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-b border-white/8 pb-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div data-asset-placeholder={!profileAssetAvailable ? "canonical-asset-pending" : character.profileStage === "Rough" ? "employee-profile" : undefined}>
            {profileAssetAvailable ? <Image alt={`${character.nameKo} 프로필`} className={character.profileStage === "Rough" ? "aspect-square w-full border border-dashed border-white/10 bg-white/[0.02] object-contain p-14 opacity-60" : "aspect-square w-full border border-white/10 object-cover object-center"} height={360} src={character.profileImage} width={360} /> : <div className="grid aspect-square w-full place-items-center border border-dashed border-cyan-300/20 bg-cyan-300/[0.03] p-5 text-center"><div><ImageOff className="mx-auto size-6 text-cyan-200/60" /><p className="mt-3 text-[11px] font-medium text-zinc-400">Canonical 원본 연결 대기</p><p className="mt-2 text-[9px] leading-4 text-zinc-600">승인된 정방형 Profile Source 필요</p></div></div>}
          </div>
          <CoreCrystalBadge className="mt-4" label={character.publicVisibility && character.status === "Active" && character.profileStage === "Approved" ? "Persona Core · Identity Active" : character.publicVisibility ? "Persona Core · 설정 검토 중" : "Persona Core · Draft / Unlisted"} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase text-cyan-200">Employee Profile</p>
          <h2 className="text-balance mt-3 text-2xl font-semibold sm:text-3xl">{character.summaryKo}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{character.personality} {character.stance}</p>
          {!character.publicVisibility ? <p className="mt-4 border-l-2 border-cyan-300/40 pl-4 text-xs leading-6 text-cyan-100/70">현재 Public Directory와 Sidebar에서 제외된 Unlisted QA 프로필입니다.</p> : character.slug === "tect" ? <p className="mt-4 border-l-2 border-cyan-300/40 pl-4 text-xs leading-6 text-cyan-100/70">Canonical Identity와 공식 비주얼이 승인된 특별 페르소나로, 현재 전사 운영 조율 업무를 수행하고 있습니다.</p> : character.profileStage === "Rough" ? <p className="mt-4 border-l-2 border-amber-300/40 pl-4 text-xs leading-6 text-amber-100/70">이 프로필은 조직·직무 검증을 위한 Rough Fixture입니다. 이름, Lore와 공식 비주얼은 Founder 검토 전까지 확정 정보가 아닙니다.</p> : null}
          <div className="mt-6 grid gap-px overflow-hidden border border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
            {employeeStats.map(({ icon: Icon, label, value }) => (
              <div className="bg-[#0b0d11] p-4" key={label}>
                <Icon className="size-4 text-zinc-500" />
                <p className="mt-3 text-[10px] uppercase text-zinc-600">{label}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav aria-label="직원 상세 섹션" className="flex gap-1 overflow-x-auto border-b border-white/8 pb-2 text-xs">
        {["프로필", "전문 분야", "최근 토론", "지식", "타임라인", "미디어", "관계", "아카이브"].map((item, index) => (
          <a className={index === 0 ? "shrink-0 rounded-md bg-white/8 px-3 py-2" : "shrink-0 rounded-md px-3 py-2 text-zinc-500 hover:bg-white/5 hover:text-white"} href={`#section-${index}`} key={item}>{item}</a>
        ))}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          <section id="section-0">
            <p className="text-[10px] font-semibold uppercase text-cyan-200">Tone & Personality</p>
            <h2 className="mt-2 text-xl font-semibold">관점과 말투</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{character.personality}</p>
            <blockquote className="mt-5 border-l-2 border-cyan-300/50 pl-4 text-base leading-7 text-zinc-200">{character.stance}</blockquote>
          </section>
          <section id="section-2">
            <div className="mb-4 flex items-center gap-2"><MessageSquareText className="size-4 text-cyan-200" /><h2 className="font-semibold">최근 게시 토론</h2></div>
            <div className="space-y-3">
              {recentDiscussions.length ? recentDiscussions.map((discussion) => <DiscussionCard discussion={discussion} key={discussion.id} />) : <p className="border-y border-white/8 py-6 text-sm text-zinc-500">아직 게시된 토론이 없습니다.</p>}
            </div>
          </section>
          <section id="section-4">
            <div className="mb-4 flex items-center gap-2"><CalendarDays className="size-4 text-cyan-200" /><h2 className="font-semibold">Employee Timeline</h2></div>
            {showcase?.timeline.length ? <div className="border-l border-white/10 pl-5">
              {showcase.timeline.map((item) => (
                <div className="relative pb-6" key={item.id}>
                  <span className="absolute -left-[23px] top-1 size-1.5 rounded-full bg-cyan-300" />
                  <p className="text-[11px] text-zinc-600">{item.date}</p>
                  <p className="mt-1 text-sm font-medium">{item.titleKo}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{item.descriptionKo}</p>
                </div>
              ))}
            </div> : <EmptyState title="공개된 타임라인이 없습니다" description="활동이 사람 검토를 통과하면 이 직원의 이력에 연결됩니다." />}
          </section>
          <section id="section-5">
            <div className="mb-4 flex items-center gap-2"><Radio className="size-4 text-cyan-200" /><h2 className="font-semibold">Media</h2></div>
            {showcase?.media.length ? <div className="grid gap-3 sm:grid-cols-2">{showcase.media.map((item) => <div className="overflow-hidden border border-white/8 bg-[#0b0d11]" key={item.id}>{item.type === "Image" && item.url ? <div className="relative aspect-[3/2] bg-zinc-100"><Image alt={item.titleKo} className="object-contain" fill sizes="(min-width: 640px) 50vw, 100vw" src={item.url} /></div> : null}<div className="p-4"><Badge variant="outline">{item.type}</Badge><p className="mt-3 text-sm font-medium">{item.titleKo}</p><p className="mt-2 text-xs text-zinc-600">{item.publishedAt ? `${item.status} · ${item.publishedAt}` : item.status}</p></div></div>)}</div> : <EmptyState title="공개된 미디어가 없습니다" description="공식 이미지와 영상 에셋이 승인되면 이 영역에 연결됩니다." />}
          </section>
          <section id="section-6">
            <div className="mb-4 flex items-center gap-2"><Sparkles className="size-4 text-violet-300" /><h2 className="font-semibold">Related Employees</h2></div>
            <div className="grid gap-3 sm:grid-cols-2">{characters.filter((item) => item.id !== character.id && item.divisionId === character.divisionId && item.publicVisibility).slice(0, 4).map((item) => <Link className="flex items-center justify-between border border-white/8 p-4 text-sm text-zinc-300 transition hover:border-cyan-300/20 hover:text-cyan-200" href={`/characters/${item.slug}`} key={item.id}><span>{formatPersonaDisplayName(item)}</span><Badge variant="outline">{item.status === "Active" ? "업무 중" : "채용 중"}</Badge></Link>)}</div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="border-y border-white/8 py-5" id="section-1">
            <h2 className="text-sm font-semibold">전문 분야</h2>
            <div className="mt-4 space-y-4">
              {showcase?.specialties.length ? showcase.specialties.map((item) => (
                <div className="border-b border-white/8 pb-4 last:border-0 last:pb-0" key={item.id}>
                  <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium">{item.nameKo}</p><Badge variant="outline">{item.level}</Badge></div>
                  <p className="mt-2 text-[11px] leading-5 text-zinc-500">{item.descriptionKo}</p>
                </div>
              )) : character.specialtiesKo.map((item) => <div className="border-b border-white/8 pb-3 last:border-0" key={item}><p className="text-xs font-medium">{item}</p><p className="mt-2 text-[11px] text-zinc-600">Rough 전문 영역 · 상세 수준 미확정</p></div>)}
            </div>
          </section>
          <section id="section-7">
            <div className="flex items-center gap-2"><Archive className="size-4 text-zinc-500" /><h2 className="text-sm font-semibold">아카이브</h2></div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{showcase?.archive[0]?.summaryKo ?? "보관된 항목이 없습니다."}</p>
          </section>
          <Button asChild className="w-full" variant="outline"><Link href="/discussion">전체 토론 보기</Link></Button>
        </aside>
      </div>
    </PageContainer>
  );
}
