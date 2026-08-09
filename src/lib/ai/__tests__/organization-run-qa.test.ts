import assert from "node:assert/strict";
import test from "node:test";

import { presentEmployeeReactionsAsAnonymousChat } from "@/lib/employee-reactions/presenters";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";
import { runOrganizationRunAutomatedQA } from "@/lib/organization-run/automated-qa";
import { buildOrganizationRunPost } from "@/lib/organization-run/post-builder";
import type { OrganizationRunTopic } from "@/types";

const anonymousTopic: OrganizationRunTopic = {
  boardType: "anonymous",
  title: "AI 협업 과정에서 책임 경계를 더 명확하게 만드는 방법은 무엇일까?",
  body:
    "업무를 빠르게 진행하면서도 누가 최종 확인을 담당하는지 모호해지는 순간이 있습니다. 익명 채팅에서는 특정 개인이나 조직을 드러내지 않고, 책임 이관과 확인 절차를 더 자연스럽게 만드는 방법을 함께 나눕니다.",
  topicSummary: "AI 협업의 책임 이관과 확인 절차를 익명으로 논의합니다.",
  reasonForBoardSelection: "개인 식별 없이 솔직한 업무 고민을 다루는 주제입니다.",
  relevantEmployeeIds: ["char-001", "char-003"],
  sourceUrls: [],
};

test("익명 채팅 QA와 Presenter가 실제 직원 신원을 공개하지 않는다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const post = buildOrganizationRunPost({
    runId: "anonymous-safe-run",
    topic: anonymousTopic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "보류",
        coreOpinion: "책임자를 정하는 것보다 확인 시점을 합의하는 일이 먼저라고 생각합니다.",
        concerns: "절차가 지나치게 늘어나면 실행 속도가 떨어질 수 있습니다.",
        suggestion: "작업 시작과 공개 직전에 확인 담당자를 한 번씩 지정하면 좋겠습니다.",
      },
      {
        employeeId: "char-003",
        stance: "찬성",
        coreOpinion: "업무 상태와 다음 확인자를 짧게 기록하면 협업 부담을 줄일 수 있습니다.",
        concerns: "도구에 기록하는 행위 자체가 목적이 되어서는 안 됩니다.",
        suggestion: "필수 상태만 남기는 간단한 템플릿부터 적용하면 좋겠습니다.",
      },
    ],
  });
  const qa = runOrganizationRunAutomatedQA({
    topic: anonymousTopic,
    post,
    employees,
    recentPosts: [],
  });
  assert.equal(qa.requiresReview, false);

  const chat = presentEmployeeReactionsAsAnonymousChat(post);
  const publicText = JSON.stringify(chat);
  assert.doesNotMatch(publicText, /시그|SIG|루미|LUMI|CCGG/);
  assert.match(publicText, /익명/);

  const leaked = {
    ...post,
    reactions: post.reactions.map((reaction, index) =>
      index === 0
        ? { ...reaction, coreOpinion: `시그가 속한 팀에서는 ${reaction.coreOpinion}` }
        : reaction
    ),
  };
  const leakedQA = runOrganizationRunAutomatedQA({
    topic: anonymousTopic,
    post: leaked,
    employees,
    recentPosts: [],
  });
  assert.equal(leakedQA.requiresReview, true);
  assert.match(leakedQA.reasons.join(" "), /신원/);
});
