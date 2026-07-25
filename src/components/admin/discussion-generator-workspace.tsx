"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, FileText, RefreshCcw, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { DivisionIcon } from "@/components/brand/division-icon";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DiscussionMode,
  HumanReviewStatus,
} from "@/constants/discussion";
import {
  characters,
  divisions,
  sources,
  teams,
  topics,
} from "@/data";
import {
  humanReviewTransitions,
} from "@/lib/discussion-engine";
import { isDefaultAssignmentCharacter } from "@/lib/character-runtime-policy";
import {
  createDiscussion,
  fetchDiscussionById,
  generateDiscussionFlow,
  updateDiscussionReviewStatus,
} from "@/lib/api/admin-discussions.client";
import type { AIProviderName } from "@/lib/ai";
import type {
  AIResponse,
  Consensus,
  ContentDraft,
  CrossRebuttal,
  Discussion,
  HumanReviewStatus as HumanReviewStatusValue,
} from "@/types";

const defaultTopicId = topics[0]?.id ?? "";
const defaultParticipantIds = characters
  .filter(isDefaultAssignmentCharacter)
  .slice(0, 3)
  .map((character) => character.id);

const actionLabels: Record<string, string> = {
  "Generate discussion": "토론 생성",
  "Reload stored flow": "저장 흐름 재조회",
  "Generate AI responses": "AI 응답 생성",
  "Generate cross rebuttal": "교차 반박 생성",
  "Generate consensus": "합의안 생성",
  "Create content draft": "콘텐츠 초안 생성",
  "Run full AI flow": "전체 AI 토론 생성",
  "Update review status": "검토 상태 변경",
};

const reviewStatusLabels: Record<HumanReviewStatusValue, string> = {
  Draft: "초안",
  "AI Generated": "AI 생성",
  "Pending Review": "검토 대기",
  Approved: "승인",
  Published: "게시",
  Archived: "보관",
  Rejected: "반려",
  "Needs Revision": "수정 필요",
};

const discussionModeLabels: Record<DiscussionMode, string> = {
  "Round Table": "라운드테이블",
  "Department Review": "조직 검토",
  "Editorial Memo": "편집 메모",
};

const discussionStatusLabels: Record<string, string> = {
  Draft: "초안",
  "Source Attached": "출처 연결",
  "AI Generated": "AI 생성",
  "Pending Review": "검토 대기",
  Approved: "승인",
  Published: "게시",
  Archived: "보관",
  Rejected: "반려",
  "Needs Revision": "수정 필요",
};

const metadataLabels: Record<string, string> = {
  High: "높음",
  Medium: "보통",
  Low: "낮음",
  Restricted: "제한",
  Primary: "1차 자료",
  Secondary: "2차 자료",
  Context: "참고",
  "Internal Document": "내부 문서",
  "External Primary": "외부 1차 자료",
  "Market Data": "시장 데이터",
  News: "뉴스",
  "Social Signal": "소셜 신호",
  Reference: "참고 자료",
  "Web Article": "웹 콘텐츠",
};

function getCharacterName(characterId: string) {
  return characters.find((character) => character.id === characterId)?.name ?? characterId;
}

function getOrganizationPath(characterId: string) {
  const character = characters.find((item) => item.id === characterId);
  const division = divisions.find((item) => item.id === character?.divisionId);
  const team = teams.find((item) => item.id === character?.teamId);
  return `${division?.nameKo ?? "소속 미정"} → ${team?.nameKo ?? "팀 미정"}`;
}

export function DiscussionGeneratorWorkspace({
  aiProvider,
}: {
  aiProvider: AIProviderName;
}) {
  const [topicId, setTopicId] = useState(defaultTopicId);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState(defaultParticipantIds);
  const [mode, setMode] = useState<DiscussionMode>(DiscussionMode.RoundTable);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [rebuttals, setRebuttals] = useState<CrossRebuttal[]>([]);
  const [consensus, setConsensus] = useState<Consensus | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentDraft | null>(null);
  const [storedDiscussionId, setStoredDiscussionId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTopic = topics.find((topic) => topic.id === topicId);
  const topicSources = useMemo(() => {
    return sources.filter((source) => source.topicIds.includes(topicId));
  }, [topicId]);

  useEffect(() => {
    const discussionId = new URLSearchParams(window.location.search).get("discussionId");
    if (!discussionId) return;
    let cancelled = false;

    fetchDiscussionById(discussionId)
      .then((flow) => {
        if (cancelled) return;
        setDiscussion(flow.discussion);
        setResponses(flow.responses);
        setRebuttals(flow.rebuttals);
        setConsensus(flow.consensus);
        setContentDraft(flow.contentDraft);
        setStoredDiscussionId(flow.discussion.id);
        setSuccessMessage("저장 흐름 재조회 완료");
      })
      .catch((caughtError) => {
        if (cancelled) return;
        const message = caughtError instanceof Error
          ? caughtError.message
          : "저장된 토론을 불러오지 못했습니다.";
        setError(`저장 흐름 재조회 실패: ${message}`);
      })
      .finally(() => {
        if (!cancelled) setLoadingAction(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function runAction(actionName: string, action: () => Promise<void>) {
    setLoadingAction(actionName);
    setError(null);
    setSuccessMessage(null);

    try {
      await action();
      setSuccessMessage(`${actionLabels[actionName] ?? actionName} 완료`);
    } catch (caughtError) {
      const actionLabel = actionLabels[actionName] ?? actionName;
      const message = caughtError instanceof Error
        ? caughtError.message
        : "요청을 처리하지 못했습니다.";
      setError(`${actionLabel} 실패: ${message} 같은 단계 버튼으로 다시 시도할 수 있습니다.`);
    } finally {
      setLoadingAction(null);
    }
  }

  function resetGeneratedState() {
    setDiscussion(null);
    setResponses([]);
    setRebuttals([]);
    setConsensus(null);
    setContentDraft(null);
    setStoredDiscussionId(null);
    setSuccessMessage(null);
    setError(null);
    window.history.replaceState({}, "", window.location.pathname);
  }

  function handleTopicChange(nextTopicId: string) {
    setTopicId(nextTopicId);
    resetGeneratedState();
  }

  function toggleParticipant(characterId: string) {
    setSelectedParticipantIds((current) => {
      if (current.includes(characterId)) {
        return current.length === 1 ? current : current.filter((id) => id !== characterId);
      }

      return [...current, characterId];
    });
    resetGeneratedState();
  }

  function applyFlowResult(flow: {
    discussion: Discussion;
    responses: AIResponse[];
    rebuttals: CrossRebuttal[];
    consensus: Consensus | null;
    contentDraft: ContentDraft | null;
  }) {
    setDiscussion(flow.discussion);
    setResponses(flow.responses);
    setRebuttals(flow.rebuttals);
    setConsensus(flow.consensus);
    setContentDraft(flow.contentDraft);
    setStoredDiscussionId(flow.discussion.id);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?discussionId=${encodeURIComponent(flow.discussion.id)}`
    );
  }

  function handleGenerateDiscussion() {
    void runAction("Generate discussion", async () => {
      const flow = await createDiscussion({
        topicId,
        participantIds: selectedParticipantIds,
        mode,
      });

      setDiscussion(flow.discussion);
      setResponses([]);
      setRebuttals([]);
      setConsensus(null);
      setContentDraft(null);
      setStoredDiscussionId(flow.discussion.id);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?discussionId=${encodeURIComponent(flow.discussion.id)}`
      );
    });
  }

  function handleFetchStoredFlow() {
    if (!storedDiscussionId) return;

    void runAction("Reload stored flow", async () => {
      applyFlowResult(await fetchDiscussionById(storedDiscussionId));
    });
  }

  function handleGenerateResponses() {
    if (!discussion) return;

    void runAction("Generate AI responses", async () => {
      applyFlowResult(
        await generateDiscussionFlow({
          step: "responses",
          discussion,
          responses,
          rebuttals,
          consensus: consensus ?? undefined,
        })
      );
    });
  }

  function handleGenerateRebuttals() {
    if (!discussion) return;

    void runAction("Generate cross rebuttal", async () => {
      applyFlowResult(
        await generateDiscussionFlow({
          step: "rebuttals",
          discussion,
          responses,
          rebuttals,
          consensus: consensus ?? undefined,
        })
      );
    });
  }

  function handleGenerateConsensus() {
    if (!discussion) return;

    void runAction("Generate consensus", async () => {
      applyFlowResult(
        await generateDiscussionFlow({
          step: "consensus",
          discussion,
          responses,
          rebuttals,
          consensus: consensus ?? undefined,
        })
      );
    });
  }

  function handleCreateContentDraft() {
    if (!discussion || !consensus) return;

    void runAction("Create content draft", async () => {
      applyFlowResult(
        await generateDiscussionFlow({
          step: "content-draft",
          discussion,
          responses,
          rebuttals,
          consensus,
        })
      );
    });
  }

  function handleGenerateFullFlow() {
    void runAction("Run full AI flow", async () => {
      applyFlowResult(
        await generateDiscussionFlow({
          step: "full",
          topicId,
          participantIds: selectedParticipantIds,
          mode,
        })
      );
    });
  }

  function handleReviewStatusChange(nextStatus: HumanReviewStatusValue) {
    if (!contentDraft) return;

    void runAction("Update review status", async () => {
      const response = await updateDiscussionReviewStatus({
        discussionId: contentDraft.discussionId,
        contentDraft,
        status: nextStatus,
      });

      setContentDraft(response.contentDraft);
    });
  }

  const reviewOptions = contentDraft ? humanReviewTransitions[contentDraft.status] : [];
  const flowSteps = [
    { label: "주제", complete: Boolean(topicId) },
    { label: "출처", complete: topicSources.length > 0 },
    { label: "토론", complete: Boolean(discussion) },
    { label: "응답", complete: responses.length > 0 },
    { label: "반박", complete: rebuttals.length > 0 },
    { label: "합의", complete: Boolean(consensus) },
    { label: "초안", complete: Boolean(contentDraft) },
    { label: "검토", complete: contentDraft?.status === HumanReviewStatus.Approved || contentDraft?.status === HumanReviewStatus.Published },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-white/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4"><CardTitle className="text-base">토론 엔진 흐름</CardTitle><span className="text-[10px] uppercase text-zinc-600">AI Provider: {aiProvider}</span></div>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-white/8 bg-white/8 p-0 lg:grid-cols-8">
          {flowSteps.map((step, index) => (
            <div className="bg-[#0d0f13] p-3" key={step.label}>
              <div className={`mb-2 grid size-5 place-items-center rounded-full border text-[10px] ${step.complete ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-zinc-600"}`}>{step.complete ? <CheckCircle2 className="size-3" /> : index + 1}</div>
              <span className={step.complete ? "text-xs text-zinc-200" : "text-xs text-zinc-600"}>{step.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
          {successMessage}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1. 주제 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="sr-only" htmlFor="discussion-topic">토론 주제</label>
              <select
                id="discussion-topic"
                className="h-10 min-w-0 max-w-full rounded-lg border border-white/10 bg-black px-3 text-sm text-foreground outline-none"
                onChange={(event) => handleTopicChange(event.target.value)}
                value={topicId}
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
              <p className="text-sm leading-6 text-muted-foreground">{selectedTopic?.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">우선순위 {metadataLabels[selectedTopic?.priority ?? ""] ?? selectedTopic?.priority}</Badge>
                <Badge variant="outline">위험도 {metadataLabels[selectedTopic?.riskLevel ?? ""] ?? selectedTopic?.riskLevel}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. 출처 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topicSources.map((source) => (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4" key={source.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{metadataLabels[source.trustLevel] ?? source.trustLevel}</Badge>
                    <Badge variant="outline">{metadataLabels[source.type] ?? source.type}</Badge>
                    <Badge variant="outline">{metadataLabels[source.riskLevel] ?? source.riskLevel}</Badge>
                  </div>
                  <p className="mt-3 font-medium">{source.name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{source.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. 참여 직원 / 토론 모드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid min-w-0 gap-2">
                {characters.map((character) => {
                  const isSelected = selectedParticipantIds.includes(character.id);

                  return (
                    <button
                      className={`w-full min-w-0 max-w-full overflow-hidden rounded-lg border p-3 text-left transition ${
                        isSelected
                          ? "border-cyan-300/40 bg-cyan-300/10"
                          : "border-white/10 bg-white/5 hover:bg-white/7"
                      }`}
                      key={character.id}
                      onClick={() => toggleParticipant(character.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar alt={`${character.nameKo} 프로필`} className="size-12 rounded-md border border-white/10" size={48} src={character.profileImage} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{character.nameKo} <span className="text-xs font-normal text-zinc-500">{character.nameEn}</span>{!character.publicVisibility ? <Badge className="ml-2" variant="outline">Draft · Unlisted</Badge> : null}</p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {character.jobTitleKo} / {getOrganizationPath(character.id)}
                          </p>
                        </div>
                        <DivisionIcon className="hidden size-9 sm:block" divisionId={character.divisionId} />
                        {isSelected ? <CheckCircle2 className="size-4 text-cyan-200" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  토론 모드
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(DiscussionMode).map((discussionMode) => (
                    <Button
                      key={discussionMode}
                      onClick={() => {
                        setMode(discussionMode);
                        resetGeneratedState();
                      }}
                      size="sm"
                      type="button"
                      variant={mode === discussionMode ? "default" : "outline"}
                    >
                      {discussionModeLabels[discussionMode]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>4. 토론 생성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button disabled={loadingAction !== null} onClick={handleGenerateDiscussion} type="button">
                  <Sparkles className="size-4" />
                  {loadingAction === "Generate discussion" ? "생성 중..." : "토론 생성"}
                </Button>
                <Button disabled={loadingAction !== null} onClick={handleGenerateFullFlow} type="button" variant="outline">
                  <RefreshCcw className="size-4" />
                  {loadingAction === "Run full AI flow" ? "실행 중..." : "전체 AI 토론 생성"}
                </Button>
                <Button
                  disabled={!storedDiscussionId || loadingAction !== null}
                  onClick={handleFetchStoredFlow}
                  type="button"
                  variant="outline"
                >
                  {loadingAction === "Reload stored flow" ? "불러오는 중..." : "저장 흐름 재조회"}
                </Button>
              </div>
              {discussion ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{discussionStatusLabels[discussion.status] ?? discussion.status}</Badge>
                    <Badge variant="outline">{discussionModeLabels[discussion.mode]}</Badge>
                  </div>
                  <p className="mt-3 font-medium">{discussion.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{discussion.summary}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    참여 직원:{" "}
                    {discussion.participants
                      .map((participant) => getCharacterName(participant.characterId))
                      .join(", ")}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    ID: {discussion.id}
                  </p>
                </div>
              ) : (
                <EmptyState
                  title="생성된 토론이 없습니다"
                  description="주제, 참여 직원, 토론 모드를 선택한 뒤 토론을 생성하세요."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. AI 직원 응답</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                disabled={!discussion || loadingAction !== null}
                onClick={handleGenerateResponses}
                type="button"
                variant="outline"
              >
                {loadingAction === "Generate AI responses"
                  ? "생성 중..."
                  : "AI 응답 생성"}
              </Button>
              {responses.map((response) => (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4" key={response.id}>
                  <p className="font-medium">{getCharacterName(response.characterId)}</p>
                  <p className="mt-1 text-sm text-cyan-100">{response.stance}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{response.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. 교차 반박</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                disabled={!discussion || responses.length === 0 || loadingAction !== null}
                onClick={handleGenerateRebuttals}
                type="button"
                variant="outline"
              >
                {loadingAction === "Generate cross rebuttal"
                  ? "생성 중..."
                  : "교차 반박 생성"}
              </Button>
              {rebuttals.length ? (
                rebuttals.map((rebuttal) => (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4" key={rebuttal.id}>
                    <p className="font-medium">{getCharacterName(rebuttal.fromCharacterId)}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{rebuttal.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  교차 반박에는 최소 2개의 AI 응답이 필요합니다.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. 합의안</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                disabled={!discussion || responses.length === 0 || loadingAction !== null}
                onClick={handleGenerateConsensus}
                type="button"
                variant="outline"
              >
                {loadingAction === "Generate consensus"
                  ? "생성 중..."
                  : "합의안 생성"}
              </Button>
              {consensus ? (
                <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <Badge variant="accent">신뢰도 {consensus.confidence}</Badge>
                  <p className="mt-3 text-sm leading-6 text-cyan-50">{consensus.summary}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. 콘텐츠 초안 / 9. 사람 검토</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                disabled={!discussion || !consensus || loadingAction !== null}
                onClick={handleCreateContentDraft}
                type="button"
                variant="outline"
              >
                <FileText className="size-4" />
                {loadingAction === "Create content draft" ? "생성 중..." : "콘텐츠 초안 생성"}
              </Button>
              {contentDraft ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{reviewStatusLabels[contentDraft.status]}</Badge>
                    <Badge variant="outline">{metadataLabels[contentDraft.format] ?? contentDraft.format}</Badge>
                  </div>
                  <p className="mt-3 font-medium">{contentDraft.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{contentDraft.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.values(HumanReviewStatus).map((status) => {
                      const isCurrent = contentDraft.status === status;
                      const isAllowed = reviewOptions.includes(status);

                      return (
                        <Button
                          disabled={isCurrent || !isAllowed}
                          key={status}
                          onClick={() => handleReviewStatusChange(status)}
                          size="sm"
                          type="button"
                          variant={isCurrent ? "default" : "outline"}
                        >
                          {reviewStatusLabels[status]}
                        </Button>
                      );
                    })}
                    {contentDraft.status === HumanReviewStatus.Published ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/discussion/${contentDraft.slug}`}>
                          <ExternalLink className="size-3.5" />
                          공개 화면 보기
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  합의안을 먼저 생성한 뒤 검토할 콘텐츠 초안을 만드세요.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
