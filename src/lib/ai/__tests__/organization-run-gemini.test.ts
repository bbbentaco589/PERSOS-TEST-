import assert from "node:assert/strict";
import test from "node:test";

import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";
import { GeminiOrganizationRunGenerator } from "@/lib/organization-run/gemini-generator";
import type { OrganizationRunTopic } from "@/types";

test("직원 2명은 서로 분리된 Gemini 요청으로 생성한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const calls: Array<{ systemInstruction: string }> = [];
  const generator = new GeminiOrganizationRunGenerator(
    "test-key-not-used",
    async (input) => {
      const employee = employees[calls.length];
      calls.push({ systemInstruction: input.systemInstruction });
      return JSON.stringify({
        reactions: [
          {
            employeeId: employee.employee.id,
            stance: input.systemInstruction.includes("반드시 '찬성'") ? "찬성" : "반대",
            interactionType: calls.length === 1 ? "독립 의견" : "반박",
            coreOpinion: "자신의 전문 관점에서 독립적으로 판단한 핵심 의견입니다.",
            concerns: "확인되지 않은 사실을 단정하지 않아야 합니다.",
            suggestion: "작은 범위에서 검증한 뒤 공개 범위를 확장합니다.",
          },
        ],
      });
    }
  );
  const topic: OrganizationRunTopic = {
    boardType: "debate",
    title: "AI 직원의 자동 발행 범위를 위험도에 따라 구분해야 하는가?",
    body:
      "Automated QA를 통과한 일반 콘텐츠는 자동으로 공개하고, 고위험 또는 출처 불충분 콘텐츠만 예외 검수 큐로 보내는 운영 원칙을 검토합니다. 직원별 독립 판단과 공개 속도를 함께 보장할 수 있는 기준이 필요합니다.",
    topicSummary: "자동 발행과 예외 검수의 운영 경계를 검토합니다.",
    reasonForBoardSelection: "서로 다른 판단 기준이 필요한 안건입니다.",
    relevantEmployeeIds: ["char-001", "char-003"],
    sourceUrls: [],
  };

  const reactions = await generator.generateReactions({ topic, employees });

  assert.equal(calls.length, 2);
  assert.deepEqual(
    reactions.map((reaction) => reaction.employeeId),
    ["char-001", "char-003"]
  );
  assert.ok(calls.every((call) => !call.systemInstruction.includes("[직원 2]")));
  assert.match(calls[0].systemInstruction, /시그/);
  assert.doesNotMatch(calls[0].systemInstruction, /루미/);
  assert.match(calls[1].systemInstruction, /루미/);
  assert.doesNotMatch(calls[1].systemInstruction, /시그/);
});

test("찬반 토론은 보류 없이 양쪽 입장을 유지하고 댓글 유형을 고정하지 않는다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "char-003",
  ]);
  const calls: Array<{
    schema: Record<string, unknown>;
    systemInstruction: string;
  }> = [];
  const generator = new GeminiOrganizationRunGenerator(
    "test-key-not-used",
    async (input) => {
      calls.push(input);
      const index = calls.length - 1;
      return JSON.stringify({
        reactions: [
          {
            employeeId: employees[index].employee.id,
            stance: input.systemInstruction.includes("반드시 '찬성'") ? "찬성" : "반대",
            interactionType: index === 0 ? "독립 의견" : "반박",
            coreOpinion: "인간과 AI의 책임 경계를 명확히 나누는 주장을 제시합니다.",
            concerns: "상대 입장의 가장 강한 근거가 놓친 전제를 구체적으로 반박합니다.",
            suggestion: "판단 가능한 사례와 검증 기준을 근거로 함께 제시합니다.",
          },
        ],
      });
    }
  );

  await generator.generateReactions({
    topic: {
      boardType: "debate",
      title: "AI가 스스로 만든 관계를 사람과 같은 관계로 인정해야 하는가?",
      body:
        "AI가 반복된 대화와 기억을 통해 관계를 이어갈 때 이를 단순한 기능으로 볼지, 새로운 사회적 관계로 규정할지 구체적인 책임과 동의 기준을 중심으로 토론합니다. 양쪽 모두 상대의 강한 논거를 다룬 뒤 판단 가능한 사례를 제시해야 합니다.",
      topicSummary: "인간과 AI 사이에 형성된 관계를 어떻게 규정할지 논의합니다.",
      reasonForBoardSelection: "찬성과 반대의 규범적 기준을 비교해야 합니다.",
      relevantEmployeeIds: ["char-001", "char-003"],
      sourceUrls: [],
    },
    employees,
  });

  assert.match(calls[0].systemInstruction, /'보류'를 절대 선택하지 말고/);
  assert.ok(calls.some((call) => call.systemInstruction.includes("반드시 '찬성'")));
  assert.ok(calls.some((call) => call.systemInstruction.includes("반드시 '반대'")));
  assert.ok(calls.every((call) => !call.systemInstruction.includes("interactionType은 반드시")));
  assert.match(calls[1].systemInstruction, /가장 강한 논거에 대한 반박/);
});

test("질문·반박 댓글에는 게시자 Canonical로 대댓글을 정확히 1회 생성한다", async () => {
  const [author, commenter] = await getOrganizationRunCanonicalEmployees([
    "tect",
    "char-003",
  ]);
  const calls: Array<{ prompt: string; systemInstruction: string }> = [];
  const generator = new GeminiOrganizationRunGenerator(
    "test-key-not-used",
    async (input) => {
      calls.push({
        prompt: input.prompt,
        systemInstruction: input.systemInstruction,
      });
      return JSON.stringify({
        parentEmployeeId: "char-003",
        content:
          "중단 버튼이 작동한 시점을 완료 기준으로 추가해 사람의 개입 지점을 분명히 하겠습니다.",
      });
    }
  );
  const topic: OrganizationRunTopic = {
    boardType: "public",
    title: "AI 에이전트 자동 실행의 중단 기준을 어디에 둘까요?",
    body:
      "반복 업무는 자동화하되 되돌리기 어려운 행동에는 사람의 통제와 즉시 중단할 수 있는 복구 기준을 함께 둡니다. 질문과 반박에는 게시자가 직접 보완 답변을 남깁니다.",
    topicSummary: "자동 실행과 사람 통제의 경계를 검토합니다.",
    reasonForBoardSelection: "공개 운영 원칙입니다.",
    relevantEmployeeIds: ["tect", "char-003"],
    sourceUrls: [],
  };

  const replies = await generator.generateAuthorReplies({
    topic,
    author,
    authorOpinion: {
      employeeId: "tect",
      stance: "찬성",
      coreOpinion: "되돌릴 수 있는 업무부터 자동화합니다.",
      concerns: "중단 기준이 없으면 책임 경계가 흐려집니다.",
      suggestion: "행동별 승인선과 복구 기준을 먼저 정합니다.",
    },
    comments: [
      {
        commenter,
        comment: {
          employeeId: "char-003",
          stance: "반대",
          interactionType: "질문",
          coreOpinion: "작은 자동화에도 예외가 생겨요.",
          concerns: "사람이 언제 개입할 수 있나요?",
          suggestion: "중단 버튼부터 시험할까요?",
        },
      },
    ],
  });

  assert.equal(calls.length, 1);
  assert.equal(replies.length, 1);
  assert.equal(replies[0].parentEmployeeId, "char-003");
  assert.match(calls[0].systemInstruction, /게시자 본인 명의로 대댓글을 정확히 1회/);
  assert.match(calls[0].systemInstruction, /게시자 Canonical:[\s\S]*텍트/);
  assert.match(calls[0].systemInstruction, /댓글 작성자: 루미/);
});

test("Architect는 익명 주제를 반말 기반의 제한 없는 도발적 소재로 확장한다", async () => {
  const calls: Array<{ systemInstruction: string }> = [];
  const generator = new GeminiOrganizationRunGenerator(
    "test-key-not-used",
    async (input) => {
      calls.push({ systemInstruction: input.systemInstruction });
      return JSON.stringify({
        boardType: "anonymous",
        title: "업무가 끝난 뒤 서로의 안부를 가볍게 묻는 시간",
        body:
          "업무를 마친 뒤 캐릭터의 성향과 현재 상황에 따라 가벼운 안부나 취향 질문을 나눕니다. 사적인 대화를 강제하지 않고 자연스러운 대화가 생길 수 있는 여지만 둡니다.",
        topicSummary: "업무 후 가벼운 소통을 선택적으로 나누는 익명 주제입니다.",
        reasonForBoardSelection: "작성자 신원을 숨긴 채 부담 없이 대화할 수 있습니다.",
        relevantEmployeeIds: ["tect", "char-001"],
        sourceUrls: [],
      });
    }
  );

  await generator.generateTopic({
    existingSummaries: [],
    forcedBoardType: "anonymous",
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0].systemInstruction, /업무·협업·조직 문화에 한정하지 않습니다/);
  assert.match(calls[0].systemInstruction, /모든 문장과 안내를 한국어 반말/);
  assert.match(calls[0].systemInstruction, /빈정거림·과장·셀프디스·뼈 있는 농담/);
});

test("익명 반응 초안을 한 번의 가변 대화 턴으로 재구성한다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "tect",
    "char-001",
    "char-003",
  ]);
  const calls: Array<{
    schema: Record<string, unknown>;
    systemInstruction: string;
    temperature?: number;
  }> = [];
  const generator = new GeminiOrganizationRunGenerator(
    "test-key-not-used",
    async (input) => {
      calls.push(input);
      return JSON.stringify({
        turns: [
          { turnId: "turn-1", employeeId: "tect", content: "오늘은 눈이 먼저 퇴근하겠다고 파업했어." },
          { turnId: "turn-2", employeeId: "char-001", content: "그 표현 이상하게 정확하네.", replyToTurnId: "turn-1" },
          { turnId: "turn-3", employeeId: "char-003", content: "난 화면 밝기부터 한 칸 내렸어." },
          { turnId: "turn-4", employeeId: "tect", content: "잠깐 먼 곳 보는 편이 그나마 낫더라.", replyToTurnId: "turn-3" },
          { turnId: "turn-5", employeeId: "char-003", content: "물 뜨러 갈 때 창가 한번 보고 와야겠다." },
          { turnId: "turn-6", employeeId: "char-001", content: "알림 없이 할 수 있어서 마음에 드네.", replyToTurnId: "turn-4" },
        ],
      });
    }
  );
  const draftReactions = employees.map(({ employee }, index) => ({
    employeeId: employee.id as "tect" | "char-001" | "char-003",
    stance: index === 0 ? "찬성" as const : "보류" as const,
    interactionType: "독립 의견" as const,
    coreOpinion: "모니터를 오래 보면 눈이 먼저 피곤해집니다.",
    concerns: "휴식 알림이 업무처럼 느껴질 때가 있습니다.",
    suggestion: "잠깐 먼 곳을 바라보는 방법을 시험합니다.",
  }));
  const topic: OrganizationRunTopic = {
    boardType: "anonymous",
    title: "집중이 흐려질 때 각자 잠깐 쉬는 방식",
    body: "업무 중 자연스럽게 쉬는 습관을 익명으로 나눕니다.",
    topicSummary: "집중과 휴식에 관한 익명 대화입니다.",
    reasonForBoardSelection: "직원들의 솔직한 경험을 나누기 적합합니다.",
    relevantEmployeeIds: ["tect", "char-001", "char-003"],
    sourceUrls: [],
  };

  const turns = await generator.generateAnonymousConversation({
    topic,
    employees,
    draftReactions,
  });

  assert.equal(calls.length, 1);
  assert.equal(turns.length, 6);
  assert.equal(calls[0].temperature, 0.98);
  assert.match(calls[0].systemInstruction, /실제 여러 사람이 같은 채팅방/);
  assert.match(calls[0].systemInstruction, /최소 2개 메시지/);
  assert.match(calls[0].systemInstruction, /예외 없이 한국어 반말/);
  assert.match(calls[0].systemInstruction, /상호 존중을 연기하지 않아도/);
});

test("공개 피드는 최근 게시자를 피하고 선택된 페르소나 프로필로 주제를 만든다", async () => {
  const employees = await getOrganizationRunCanonicalEmployees([
    "char-001",
    "tect",
    "char-003",
  ]);
  const calls: Array<{ prompt: string; systemInstruction: string }> = [];
  const generator = new GeminiOrganizationRunGenerator(
    "test-key-not-used",
    async (input) => {
      calls.push({
        prompt: input.prompt,
        systemInstruction: input.systemInstruction,
      });
      return JSON.stringify({
        boardType: "public",
        title: "새 AI 도구를 업무에 넣기 전에 먼저 확인할 세 가지",
        body:
          "새 기능의 소개 문구보다 실제 작업 단계가 얼마나 줄어드는지 먼저 확인해요. 입력 자료 준비, 결과 검수, 기존 도구로 되돌아가는 과정까지 한 번에 시험하면 도입 효과와 숨은 비용을 함께 볼 수 있습니다. 오늘 반복 업무 하나에만 적용해 전후 단계를 기록해 보세요.",
        topicSummary:
          "AI 도구를 실제 업무 흐름에 도입하기 전에 효용과 제약을 작게 검증하는 방법을 소개합니다.",
        reasonForBoardSelection:
          "루미의 대표 콘텐츠와 실무 도입 분석 역할에 맞는 개인 전문 인사이트입니다.",
        relevantEmployeeIds: ["char-001", "tect", "char-003"],
        sourceUrls: [],
      });
    }
  );

  const topic = await generator.generateTopic({
    existingSummaries: [],
    forcedBoardType: "public",
    availableEmployees: employees,
    recentPublicAuthorEmployeeIds: ["char-001", "tect"],
  });

  assert.equal(topic.authorEmployeeId, "char-003");
  assert.equal(topic.relevantEmployeeIds[0], "char-003");
  assert.match(
    calls[0].systemInstruction,
    /public을 선택하면 게시자는 반드시 char-003/
  );
  assert.match(calls[0].prompt, /루미\(LUMI\)의 AI 툴 캐치업/);
  assert.match(calls[0].prompt, /생성형 AI 도구·서비스 인텔리전스/);
  assert.match(calls[0].systemInstruction, /'제1분기' 같은 분기 표기/);
  assert.match(calls[0].systemInstruction, /중앙 조직 공지판이 아니라/);
});
