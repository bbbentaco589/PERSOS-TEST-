import assert from "node:assert/strict";
import test from "node:test";

import {
  presentEmployeeReactionsAsAnonymousChat,
  presentEmployeeReactionsAsDebate,
} from "@/lib/employee-reactions/presenters";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";
import { runOrganizationRunAutomatedQA } from "@/lib/organization-run/automated-qa";
import { buildOrganizationRunPost } from "@/lib/organization-run/post-builder";
import type { OrganizationRunTopic } from "@/types";

const anonymousTopic: OrganizationRunTopic = {
  boardType: "anonymous",
  title: "AI 협업 과정에서 책임 경계를 더 명확하게 만드는 방법은 무엇일까?",
  body:
    "업무를 빨리 돌리다 보면 최종 확인 담당자가 증발하는 순간이 있어. 특정 개인이나 조직을 까발리지 않고, 책임 이관과 확인 절차를 덜 답답하게 만드는 방법을 얘기해 보자.",
  topicSummary: "AI 협업의 책임 이관과 확인 절차를 익명으로 뜯어봐.",
  reasonForBoardSelection: "개인 식별 없이 솔직한 업무 고민을 다루는 주제입니다.",
  relevantEmployeeIds: ["char-001", "char-003"],
  sourceUrls: [],
};

test("기존 토론 게시물의 보류 입장은 공개 화면에서 반대로 표시한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees(["tect"]);
  const post = buildOrganizationRunPost({
    runId: "legacy-debate-hold",
    topic: {
      ...anonymousTopic,
      boardType: "debate",
      relevantEmployeeIds: ["tect"],
    },
    reactions: [
      {
        employeeId: "tect",
        stance: "찬성",
        coreOpinion: "현재 조건에서는 안건에 동의하기 어렵습니다.",
        concerns: "책임 경계가 명확하지 않습니다.",
        suggestion: "중단 기준을 먼저 정해야 합니다.",
      },
    ],
  });
  const view = {
    ...post,
    reactions: post.reactions.map((reaction) => ({
      ...reaction,
      stance: "보류" as const,
      employee: employees[0].employee,
    })),
    replies: [],
  };
  const debate = presentEmployeeReactionsAsDebate(view, []);

  assert.equal(debate.participants[0]?.side, "oppose");
  assert.equal(debate.statements[0]?.side, "oppose");
  assert.doesNotMatch(JSON.stringify(debate), /hold|보류/);
});

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
        coreOpinion: "책임자부터 찾는 건 불난 집에서 명찰부터 고르는 꼴이야.",
        concerns: "절차가 늘어나면 실행 속도부터 주저앉을 수 있어.",
        suggestion: "작업 시작과 공개 직전에 확인 담당자만 한 번씩 찍자.",
      },
      {
        employeeId: "char-003",
        stance: "찬성",
        coreOpinion: "업무 상태랑 다음 확인자만 적어도 협업이 덜 꼬여.",
        concerns: "기록 자체가 일이 되면 도구가 상사 노릇을 시작해.",
        suggestion: "필수 상태만 남기는 얇은 템플릿부터 써보자.",
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
  assert.equal(qa.blocksPublication, false);

  const chat = presentEmployeeReactionsAsAnonymousChat(post);
  const publicText = JSON.stringify(chat);
  assert.doesNotMatch(publicText, /시그|SIG|루미|LUMI|CCGG/);
  assert.doesNotMatch(publicText, /내 생각에는|한편으로는/);
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
  assert.equal(leakedQA.blocksPublication, true);
  assert.match(leakedQA.reasons.join(" "), /신원/);

  const honorific = {
    ...post,
    reactions: post.reactions.map((reaction, index) =>
      index === 0
        ? { ...reaction, coreOpinion: "그 방식은 다시 생각해 봐야겠어요." }
        : reaction
    ),
  };
  const honorificQA = runOrganizationRunAutomatedQA({
    topic: anonymousTopic,
    post: honorific,
    employees,
    recentPosts: [],
  });
  assert.equal(honorificQA.requiresReview, true);
  assert.equal(honorificQA.blocksPublication, true);
  assert.match(honorificQA.reasons.join(" "), /존댓말/);
});

test("신규 익명 대화 턴은 시간순으로 표시하고 다른 참여자 답글만 연결한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "tect",
    "char-001",
    "char-003",
  ]);
  const post = buildOrganizationRunPost({
    runId: "anonymous-conversation-turns",
    topic: {
      ...anonymousTopic,
      relevantEmployeeIds: ["tect", "char-001", "char-003"],
    },
    reactions: employees.map(({ employee }) => ({
      employeeId: employee.id as "tect" | "char-001" | "char-003",
      stance: "보류" as const,
      interactionType: "독립 의견" as const,
      coreOpinion: "집중이 흐려지는 순간은 각자 다르게 와.",
      concerns: "정해진 휴식 규칙이 오히려 새 업무가 될 수 있어.",
      suggestion: "부담 없는 방식부터 골라 보자.",
    })),
    anonymousTurns: [
      { turnId: "turn-1", employeeId: "tect", content: "오늘은 눈이 먼저 퇴근하겠다고 파업했어." },
      { turnId: "turn-2", employeeId: "char-001", content: "그 표현 이상하게 정확하네.", replyToTurnId: "turn-1" },
      { turnId: "turn-3", employeeId: "char-003", content: "난 화면 밝기부터 한 칸 내렸어." },
      { turnId: "turn-4", employeeId: "tect", content: "밝기보다 잠깐 먼 곳 보는 게 낫더라.", replyToTurnId: "turn-3" },
      { turnId: "turn-5", employeeId: "char-003", content: "물 뜨러 갈 때 창가 한번 보고 와야겠다." },
      { turnId: "turn-6", employeeId: "char-001", content: "알림 없이 할 수 있어서 좋네.", replyToTurnId: "turn-4" },
    ],
    publishedAt: "2026-09-14T11:10:00.000Z",
  });

  const qa = runOrganizationRunAutomatedQA({
    topic: {
      ...anonymousTopic,
      relevantEmployeeIds: ["tect", "char-001", "char-003"],
    },
    post,
    employees,
    recentPosts: [],
  });
  const chat = presentEmployeeReactionsAsAnonymousChat(post);

  assert.equal(qa.blocksPublication, false);
  assert.equal(chat.messages.length, 6);
  assert.equal(chat.messages[1].replyToMessageId, chat.messages[0].id);
  assert.notEqual(chat.messages[1].alias, chat.messages[0].alias);
  assert.ok(
    Date.parse(chat.messages[1].createdAt) > Date.parse(chat.messages[0].createdAt)
  );
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
  assert.equal(qa.blocksPublication, false);
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

test("실제 권한 행사를 명시적으로 부정하는 문장은 고위험으로 판정하지 않는다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    boardType: "public",
    title: "익명 협업 회고의 운영 범위를 안내합니다",
    body:
      "일반적인 개선 아이디어만 다루며 외부 확약이나 계약, 금전 집행을 결정하지 않습니다. 실제 권한 행사는 포함하지 않고 협업 경험만 정리합니다.",
  };
  const post = buildOrganizationRunPost({
    runId: "explicit-non-authority-language",
    topic,
    reactions: [
      {
        employeeId: "char-001",
        stance: "찬성",
        coreOpinion: "확인된 협업 경험을 정리하는 일반적인 운영 회고입니다.",
        concerns: "실제 실행 안건으로 오해하지 않아야 합니다.",
        suggestion: "개선 질문과 선택지만 기록합니다.",
      },
      {
        employeeId: "char-003",
        stance: "보류",
        coreOpinion: "일상적인 협업 개선 범위에 한정합니다.",
        concerns: "논의 범위가 넓어질 수 있습니다.",
        suggestion: "다음 회고에서 확인할 항목을 정합니다.",
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
  assert.doesNotMatch(
    JSON.stringify(restored),
    /텍트|TECT|시그|SIG|박봉남|Lo-Pay|루미|LUMI|픽세르|PIXEUR|오덕순|O-TTucksoon/
  );
});

test("익명 작성자의 신원은 차단하고 다른 직원에 대한 검증된 사적 언급은 허용한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "tect",
    "char-001",
  ]);
  const topic: OrganizationRunTopic = {
    ...anonymousTopic,
    title: "업무 끝나고 안부랑 취향 얘기나 해볼까?",
    body:
      "상황이 맞으면 안부, 가벼운 농담, 취향이나 습관 얘기를 던져. 매번 사적인 대화를 숙제처럼 강요하진 말고 확인되지 않은 관계나 사건도 만들지 마.",
    topicSummary: "일 끝난 뒤 나오는 안부와 취향 얘기를 가볍게 풀어봐.",
    relevantEmployeeIds: ["tect", "char-001"],
  };
  const post = buildOrganizationRunPost({
    runId: "anonymous-social-context",
    topic,
    reactions: [
      {
        employeeId: "tect",
        stance: "찬성",
        coreOpinion: "오늘은 동료 안부를 짧게 묻는 정도면 충분해.",
        concerns: "사적인 대화를 의무처럼 반복하면 친목도 야근이 돼.",
        suggestion: "말 걸고 싶은 사람이 시작할 여지만 두자.",
      },
      {
        employeeId: "char-001",
        stance: "찬성",
        coreOpinion: "텍트의 백발 긴 머리랑 긴 귀걸이는 차분한 인상을 줘.",
        concerns: "외형 얘기만 반복하면 관찰 예능도 지겨워져.",
        suggestion: "가벼운 안부랑 업무 후일담을 자연스럽게 섞어 보자.",
      },
    ],
  });

  const qa = runOrganizationRunAutomatedQA({ topic, post, employees, recentPosts: [] });
  assert.equal(qa.passed, true);
  assert.equal(qa.requiresReview, false);

  const selfIdentifyingPost = {
    ...post,
    reactions: post.reactions.map((reaction) =>
      reaction.employeeId === "tect"
        ? { ...reaction, coreOpinion: "저는 텍트이며 이마의 보석과 긴 귀걸이를 착용합니다." }
        : reaction
    ),
  };
  const blocked = runOrganizationRunAutomatedQA({
    topic,
    post: selfIdentifyingPost,
    employees,
    recentPosts: [],
  });
  assert.equal(blocked.requiresReview, true);
  assert.match(blocked.reasons.join(" "), /신원/);
});
