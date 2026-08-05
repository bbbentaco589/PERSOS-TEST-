import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, FileCheck2, Link2, MessageSquareReply, ShieldCheck } from "lucide-react";

import { CoreCrystalBadge } from "@/components/brand/core-crystal-badge";
import {
  DebateBoard,
  DebateHero,
} from "@/components/intranet/debate-board";
import {
  AnonymousChatHero,
  AnonymousChatRoom,
} from "@/components/intranet/anonymous-chat-room";
import { EmployeeReactionArticle } from "@/components/intranet/employee-reaction-article";
import { PageContainer } from "@/components/layout/page-container";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { designAssets } from "@/constants/assets";
import { getPublicDiscussionBySlug } from "@/lib/public-discussions";
import { getEmployeeReactionPostViewBySlug } from "@/lib/repositories";
import {
  presentEmployeeReactionsAsAnonymousChat,
  presentEmployeeReactionsAsDebate,
} from "@/lib/employee-reactions/presenters";
import { divisions, publicDebates, teams } from "@/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const reactionPost = await getEmployeeReactionPostViewBySlug(slug);
  if (reactionPost) {
    return {
      title: reactionPost.title,
      description: reactionPost.summary,
    };
  }
  const staticDebate = publicDebates.find((debate) => debate.slug === slug);
  if (staticDebate) {
    return {
      title: staticDebate.title,
      description: staticDebate.summary,
    };
  }
  const detail = await getPublicDiscussionBySlug(slug);
  return detail ? { title: detail.contentDraft.title, description: detail.contentDraft.excerpt } : { title: "토론을 찾을 수 없습니다" };
}

const metadataLabels: Record<string, string> = {
  "Round Table": "라운드테이블",
  "Department Review": "조직 검토",
  "Editorial Memo": "편집 메모",
  Primary: "1차 자료",
  Secondary: "2차 자료",
  Context: "참고",
  "Internal Document": "내부 문서",
  "External Primary": "외부 1차 자료",
  "Market Data": "시장 데이터",
  News: "뉴스",
  "Social Signal": "소셜 신호",
  Reference: "참고 자료",
  High: "높음",
  Medium: "보통",
  Low: "낮음",
};

export default async function DiscussionArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reactionPost = await getEmployeeReactionPostViewBySlug(slug);
  if (reactionPost) {
    if (reactionPost.board === "debate") {
      const debate = presentEmployeeReactionsAsDebate(reactionPost, [
        "직원별 판단 차이와 실행 가능성",
        "운영 책임과 사람 검토의 경계",
        "조직과 서비스에 미치는 장단기 영향",
      ]);

      return (
        <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
          <Breadcrumb
            items={[
              { label: "전사원 찬반 토론", href: "/discussion/debate" },
              { label: reactionPost.title },
            ]}
          />
          <div className="mt-5">
            <DebateHero />
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <DebateBoard debate={debate} />
          </div>
        </PageContainer>
      );
    }

    if (reactionPost.board === "anonymous") {
      const chat = presentEmployeeReactionsAsAnonymousChat(reactionPost);

      return (
        <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
          <Breadcrumb
            items={[
              { label: "전사원 익명 채팅", href: "/discussion/anonymous" },
              { label: reactionPost.title },
            ]}
          />
          <div className="mt-5">
            <AnonymousChatHero />
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <AnonymousChatRoom chat={chat} />
          </div>
        </PageContainer>
      );
    }

    return <EmployeeReactionArticle post={reactionPost} />;
  }
  const staticDebate = publicDebates.find((debate) => debate.slug === slug);
  if (staticDebate) {
    return (
      <PageContainer className="max-w-[1320px] pt-5 lg:pt-7">
        <Breadcrumb
          items={[
            { label: "전사원 찬반 토론", href: "/discussion/debate" },
            { label: staticDebate.title },
          ]}
        />
        <div className="mt-5">
          <DebateHero />
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <DebateBoard debate={staticDebate} />
        </div>
      </PageContainer>
    );
  }
  const detail = await getPublicDiscussionBySlug(slug);
  if (!detail) notFound();

  const { discussion, consensus, contentDraft, responses, rebuttals, sources, characters } = detail;
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const participants = discussion.participants.flatMap((participant) => characterById.get(participant.characterId) ?? []);

  return (
    <PageContainer className="space-y-7 pt-5 lg:pt-7">
      <Breadcrumb items={[{ label: "토론", href: "/discussion" }, { label: discussion.title }]} />
      <article className="mx-auto max-w-6xl">
        <header className="overflow-hidden border border-white/10 bg-[#081126]">
          <div className="relative aspect-video bg-[#081126]">
            <Image alt="AI 직원의 토론 과정과 합의 구조" className="object-contain" fill priority quality={90} sizes="(min-width: 1280px) 1200px, 100vw" src={designAssets.discussionPreview} unoptimized />
          </div>
          <div className="border-t border-white/10 p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-2"><Badge variant="accent">{discussion.kicker}</Badge><Badge variant="outline">사람 검토 완료</Badge><Badge variant="outline">Mock Data</Badge></div>
            <h1 className="text-balance mt-5 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{contentDraft.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">{contentDraft.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{discussion.readingTime}</span><span>{metadataLabels[discussion.mode] ?? discussion.mode}</span><span>{discussion.publishedAt ?? discussion.createdAt}</span></div>
          </div>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-cyan-300">01</span><p className="text-[10px] font-semibold uppercase text-zinc-500">주제 / Topic</p></div>
              <h2 className="text-balance mt-3 text-2xl font-semibold">{discussion.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{discussion.summary}</p>
            </section>

            <section>
              <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-cyan-300">02</span><p className="text-[10px] font-semibold uppercase text-zinc-500">출처 / Source</p></div>
              <div className="mt-4 divide-y divide-white/8 border-y border-white/8">
                {sources.map((source) => (
                  <div className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={source.id}>
                    <div><p className="text-sm font-medium">{source.name}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{source.summary}</p></div>
                    <div className="flex gap-2"><Badge variant="outline">{metadataLabels[source.type] ?? source.type}</Badge><Badge variant="outline">신뢰도 {metadataLabels[source.trustLevel] ?? source.trustLevel}</Badge></div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-cyan-300">03</span><p className="text-[10px] font-semibold uppercase text-zinc-500">초기 응답 / Initial Responses</p></div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {responses.map((response) => {
                  const employee = characterById.get(response.characterId);
                  return (
                    <section className="border border-white/10 bg-white/[0.025] p-5" key={response.id}>
                      <div className="flex items-center gap-3">
                        {employee ? <Image alt={`${employee.nameKo} 프로필`} className="size-11 rounded-full border border-white/10 bg-black object-cover" height={44} src={employee.profileImage} width={44} /> : null}
                        <div><h3 className="text-sm font-semibold">{employee?.nameKo ?? response.characterId}</h3><p className="text-xs text-zinc-500">{employee?.jobTitleKo} · {teams.find((team) => team.id === employee?.teamId)?.nameKo}</p></div>
                        <Badge className="ml-auto" variant="outline">{metadataLabels[response.confidence] ?? response.confidence}</Badge>
                      </div>
                      <p className="mt-5 text-sm font-medium text-cyan-100">{response.stance}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-400">{response.content}</p>
                    </section>
                  );
                })}
              </div>
            </section>

            {rebuttals.length ? (
              <section>
                <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-violet-300">04</span><MessageSquareReply className="size-4 text-violet-300" /><p className="text-[10px] font-semibold uppercase text-zinc-500">교차 반박 / Cross Rebuttals</p></div>
                <div className="mt-4 space-y-3">
                  {rebuttals.map((rebuttal) => {
                    const employee = characterById.get(rebuttal.fromCharacterId);
                    return <div className="grid gap-3 border-l-2 border-violet-400/50 bg-violet-400/5 p-4 sm:grid-cols-[160px_minmax(0,1fr)]" key={rebuttal.id}><div className="flex items-center gap-2">{employee ? <Image alt="" className="size-7 rounded-full object-cover" height={28} src={employee.profileImage} width={28} /> : null}<span className="text-xs font-medium">{employee?.nameKo}</span></div><p className="text-sm leading-6 text-zinc-400">{rebuttal.content}</p></div>;
                  })}
                </div>
              </section>
            ) : null}

            <section className="border border-cyan-300/20 bg-cyan-300/[0.055] p-5 sm:p-7">
              <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-cyan-300">05</span><CheckCircle2 className="size-5 text-cyan-200" /><p className="text-[10px] font-semibold uppercase text-cyan-100">합의 / Consensus</p></div>
              <h2 className="text-balance mt-4 text-xl font-semibold sm:text-2xl">{consensus.summary}</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div><p className="text-xs font-medium">핵심 합의</p><ul className="mt-3 space-y-2 text-sm text-zinc-400">{consensus.keyAgreements.map((item) => <li className="flex gap-2" key={item}><CheckCircle2 className="mt-1 size-3.5 shrink-0 text-cyan-300" />{item}</li>)}</ul></div>
                <div><p className="text-xs font-medium">남은 질문과 한계</p><ul className="mt-3 space-y-2 text-sm text-zinc-400">{consensus.openQuestions.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
            </section>

            <section className="border-t border-white/8 pt-8">
              <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-emerald-300">06</span><FileCheck2 className="size-4 text-emerald-300" /><p className="text-[10px] font-semibold uppercase text-zinc-500">게시 콘텐츠 / Published Content</p></div>
              <h2 className="mt-4 text-2xl font-semibold">검토 완료 콘텐츠</h2>
              <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-zinc-300">{contentDraft.body}</div>
              <div className="mt-7 flex items-start gap-2 border-t border-white/8 pt-5 text-xs leading-6 text-zinc-500"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-300" />이 콘텐츠는 AI 직원의 토론 결과를 바탕으로 작성되었으며 사람 검토와 게시 승인을 통과했습니다.</div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border-y border-white/8 py-5">
              <h2 className="text-sm font-semibold">참여 직원</h2>
              <div className="mt-4 space-y-4">
                {participants.map((employee) => {
                  const team = teams.find((item) => item.id === employee.teamId);
                  const division = divisions.find((item) => item.id === employee.divisionId);
                  const profileHref = `/characters/${employee.slug}`;

                  return (
                    <div className="flex items-center gap-3" key={employee.id}>
                      <Link aria-label={`${employee.nameKo} 프로필 보기`} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300" href={profileHref}>
                        <EmployeeAvatar alt={`${employee.nameKo} 프로필`} className="size-9 rounded-full" size={36} src={employee.profileImage} />
                      </Link>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-zinc-300"><Link className="hover:text-cyan-200" href={profileHref}>{employee.nameKo}</Link> <span className="text-zinc-600">{employee.nameEn}</span></p>
                        <p className="truncate text-[10px] text-zinc-500">{employee.jobTitleKo}</p>
                        <p className="truncate text-[10px] text-zinc-700">
                          {team?.nameKo}
                          {team && division ? <span className="px-1">·</span> : null}
                          {division?.nameKo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <CoreCrystalBadge label="Persona Core 연결" />
            <section className="border-t border-white/8 pt-5">
              <div className="flex items-center gap-2"><Link2 className="size-4 text-zinc-500" /><h2 className="text-sm font-semibold">검증 메타데이터</h2></div>
              <dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-zinc-600">Source</dt><dd>{sources.length}개</dd></div><div className="flex justify-between gap-3"><dt className="text-zinc-600">Response</dt><dd>{responses.length}개</dd></div><div className="flex justify-between gap-3"><dt className="text-zinc-600">Rebuttal</dt><dd>{rebuttals.length}개</dd></div><div className="flex justify-between gap-3"><dt className="text-zinc-600">Risk</dt><dd>{metadataLabels[consensus.riskLevel] ?? consensus.riskLevel}</dd></div></dl>
            </section>
          </aside>
        </div>
      </article>
    </PageContainer>
  );
}
