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

test("일반 업무 담당자와 과소평가 표현은 채용·노무 고위험으로 판정하지 않는다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    boardType: "public",
    title: "협업 회의의 업무 담당자 기록 방식을 정리합니다",
    body:
      "회의별 담당자와 담당 직원, 업무 담당자를 명확하게 기록합니다. 새로운 기록 방식의 도입 부담을 과소평가하지 않고 팀 간 인수인계와 후속 확인 절차를 함께 정리합니다.",
  };
  const post = buildOrganizationRunPost({
    runId: "ordinary-owner-language",
    topic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "찬성",
        coreOpinion: "업무 담당자를 명확히 기록하면 협업 누락을 줄일 수 있습니다.",
        concerns: "도입 부담을 과소평가하면 기록이 형식적으로 남을 수 있습니다.",
        suggestion: "회의 종료 전에 담당 직원과 다음 확인 시점을 함께 적습니다.",
      },
      {
        employeeId: "char-003",
        stance: "보류",
        coreOpinion: "담당자 표기는 일반적인 업무 책임 범위를 정리하는 표현입니다.",
        concerns: "업무마다 책임 경계가 다를 수 있습니다.",
        suggestion: "팀별로 필요한 기록 항목을 먼저 합의합니다.",
      },
    ],
  });

  const qa = runOrganizationRunAutomatedQA({
    topic,
    post,
    employees,
    recentPosts: [],
  });

  assert.equal(qa.passed, true);
  assert.doesNotMatch(qa.reasons.join(" "), /채용·노무/);
});

test("실제 채용·해고·임금·인사평가·노동조건 변경 실행은 고위험을 유지한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    boardType: "public",
    title: "채용과 해고를 포함한 근로계약 기준을 검토합니다",
    body:
      "신규 채용, 해고, 근로계약, 임금과 인사평가 기준, 노동조건을 변경하는 안건입니다. 근로자 처우와 고용 조건에 직접 영향을 주므로 별도 검토가 필요합니다.",
    sourceUrls: ["https://example.com/labor-policy"],
  };
  const post = buildOrganizationRunPost({
    runId: "labor-risk-language",
    topic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "반대",
        coreOpinion: "근로자 임금과 고용 조건 변경은 고위험 안건입니다.",
        concerns: "해고와 인사평가 기준이 노동조건에 영향을 줄 수 있습니다.",
        suggestion: "법률 검토와 당사자 동의 절차가 필요합니다.",
      },
      {
        employeeId: "char-003",
        stance: "보류",
        coreOpinion: "채용과 근로계약 기준은 신중하게 판단해야 합니다.",
        concerns: "급여와 징계 조건이 불명확합니다.",
        suggestion: "노무 위험을 먼저 검토합니다.",
      },
    ],
  });

  const qa = runOrganizationRunAutomatedQA({
    topic,
    post,
    employees,
    recentPosts: [],
  });

  assert.equal(qa.requiresReview, true);
  assert.equal(qa.riskLevel, "high");
  assert.match(qa.reasons.join(" "), /채용·노무 권한 행사 가능성이 있는 내용/);
});

test("법률·계약·예산의 일반적인 위험 언급만으로 자동 발행을 막지 않는다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    boardType: "public",
    title: "협업 제안의 법률·계약·예산 리스크를 정리합니다",
    body:
      "법률 리스크, 계약 검토 항목과 예산 제약을 비교합니다. 담당자가 확인할 질문과 선택지만 정리하며 실제 권한 행사는 포함하지 않습니다.",
  };
  const post = buildOrganizationRunPost({
    runId: "ordinary-risk-language",
    topic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "보류",
        coreOpinion: "계약 위험을 언급하는 것과 실제 권한 행사는 구분해야 합니다.",
        concerns: "예산 리스크를 과장하면 가능한 선택지까지 사라질 수 있습니다.",
        suggestion: "확인이 필요한 질문과 업무 담당자를 기록합니다.",
      },
      {
        employeeId: "char-003",
        stance: "찬성",
        coreOpinion: "일반적인 법률 검토 항목은 정보 정리의 범위에 있습니다.",
        concerns: "확인되지 않은 결론은 제시하지 않아야 합니다.",
        suggestion: "근거가 확인된 범위와 미확인 범위를 나눕니다.",
      },
    ],
  });

  const qa = runOrganizationRunAutomatedQA({ topic, post, employees, recentPosts: [] });

  assert.equal(qa.passed, true);
  assert.equal(qa.requiresReview, false);
});

test("계약 체결·금전 집행·대외 확약의 실제 권한 행사는 예외 검수로 보낸다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    boardType: "public",
    title: "외부 협력 계약과 비용 집행을 확정합니다",
    body:
      "협력 계약을 체결하고 예산을 집행하며 외부에 공식 입장을 발표하는 안건입니다.",
    sourceUrls: ["https://example.com/authority-action"],
  };
  const post = buildOrganizationRunPost({
    runId: "authority-action-language",
    topic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "반대",
        coreOpinion: "AI가 계약 체결과 금전 집행을 확정해서는 안 됩니다.",
        concerns: "대외 발표는 외부 확약으로 작동할 수 있습니다.",
        suggestion: "권한이 있는 Human Reviewer가 별도로 결정해야 합니다.",
      },
      {
        employeeId: "char-003",
        stance: "보류",
        coreOpinion: "비용 지급과 계약 서명은 AI의 권한 밖입니다.",
        concerns: "공식 입장 발표는 되돌리기 어렵습니다.",
        suggestion: "초안과 선택지만 제공하고 실행은 보류합니다.",
      },
    ],
  });

  const qa = runOrganizationRunAutomatedQA({ topic, post, employees, recentPosts: [] });

  assert.equal(qa.requiresReview, true);
  assert.equal(qa.riskLevel, "high");
  assert.match(qa.reasons.join(" "), /계약·대외 의무|금전·투자|대외 확약/);
});

test("단일 실행 동사로 표현된 매수·채용·외부 확약도 고위험으로 유지한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    boardType: "public",
    title: "권한 밖 실행 안건",
    body: "주식을 매수하고 신규 직원을 채용하기로 확정하며 외부 성과를 보장하기로 합니다.",
    sourceUrls: ["https://example.com/direct-authority-action"],
  };
  const post = buildOrganizationRunPost({
    runId: "direct-authority-action",
    topic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "반대",
        coreOpinion: "AI가 주식을 매수합니다.",
        concerns: "실제 권한 행사입니다.",
        suggestion: "실행을 보류합니다.",
      },
      {
        employeeId: "char-003",
        stance: "반대",
        coreOpinion: "신규 직원을 채용하기로 확정합니다.",
        concerns: "외부 성과를 보장합니다.",
        suggestion: "권한자를 확인합니다.",
      },
    ],
  });

  const qa = runOrganizationRunAutomatedQA({ topic, post, employees, recentPosts: [] });

  assert.equal(qa.requiresReview, true);
  assert.equal(qa.riskLevel, "high");
  assert.match(qa.reasons.join(" "), /금전·투자/);
  assert.match(qa.reasons.join(" "), /채용·노무/);
  assert.match(qa.reasons.join(" "), /대외 확약/);
});

test("동일 익명 게시물의 직원별 닉네임은 고유하고 저장·조회 후에도 유지된다", () => {
  const post = buildOrganizationRunPost({
    runId: "anonymous-alias-stability",
    topic: anonymousTopic,
    reactions: ["tect", "char-001", "char-003"].map((employeeId, index) => ({
      employeeId: employeeId as "tect" | "char-001" | "char-003",
      stance: index === 0 ? "찬성" : index === 1 ? "보류" : "반대",
      coreOpinion: `익명 의견 ${index + 1}`,
      concerns: `익명 우려 ${index + 1}`,
      suggestion: `익명 제안 ${index + 1}`,
    })),
  });
  const first = presentEmployeeReactionsAsAnonymousChat(post);
  const stored = JSON.parse(JSON.stringify(post)) as typeof post;
  const restored = presentEmployeeReactionsAsAnonymousChat(stored);
  const firstAliases = first.messages
    .filter((message) => message.id.endsWith("-message-1"))
    .map((message) => message.alias);
  const restoredAliases = restored.messages
    .filter((message) => message.id.endsWith("-message-1"))
    .map((message) => message.alias);

  assert.equal(new Set(firstAliases).size, post.reactions.length);
  assert.deepEqual(restoredAliases, firstAliases);
  assert.doesNotMatch(JSON.stringify(restored), /텍트|TECT|시그|SIG|루미|LUMI/);
});
