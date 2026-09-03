import assert from "node:assert/strict";
import test from "node:test";

import { characters } from "@/data";
import {
  buildEmployeeReactionSystemInstruction,
  EMPLOYEE_REACTION_IDS,
  parseEmployeeReactions,
  StructuredEmployeeReactionError,
} from "@/lib/ai/employee-reaction-prompt-builder";

const canonicalEmployees = EMPLOYEE_REACTION_IDS.map((employeeId) => {
  const employee = characters.find((candidate) => candidate.id === employeeId);
  assert.ok(employee);
  return {
    employee,
    divisionName: employee.divisionId,
    teamName: employee.teamId,
  };
});

const validPayload = {
  reactions: EMPLOYEE_REACTION_IDS.map((employeeId) => ({
    employeeId,
    stance: "보류",
    coreOpinion: `${employeeId} 핵심 의견`,
    concerns: `${employeeId} 우려 사항`,
    suggestion: `${employeeId} 제안`,
  })),
};

test("직원 반응 Prompt가 등록된 Character Canonical과 게시판 Context를 포함한다", () => {
  const prompt = buildEmployeeReactionSystemInstruction({
    board: "debate",
    title: "유료 구독 모델 검토",
    body: "세 직원의 관점으로 검토합니다.",
    employees: canonicalEmployees,
  });

  assert.match(prompt, /전사원 찬반 토론/);
  assert.match(prompt, /유료 구독 모델 검토/);
  for (const { employee } of canonicalEmployees) {
    assert.match(prompt, new RegExp(employee.id));
    assert.match(prompt, new RegExp(employee.nameKo));
    assert.match(prompt, new RegExp(employee.jobTitleKo));
    assert.match(prompt, new RegExp(employee.values[0]));
    assert.match(prompt, new RegExp(employee.personaRules[0]));
  }
  assert.doesNotMatch(prompt, /시스템 및 조직 설계 담당/);
});

test("관리자가 고정한 검증 컨텍스트만 직원 Prompt에 포함한다", () => {
  const canonical = canonicalEmployees[0];
  const prompt = buildEmployeeReactionSystemInstruction({
    board: "public-feed",
    title: "후속 협업 기록",
    body: "이전 활동에서 확인된 맥락을 이어갑니다.",
    employees: [{
      ...canonical,
      activityMemory: {
        recentActivities: ["공개 피드 운영 원칙"],
        relationships: ["char-001과 공동 참여 2회"],
        verifiedContext: ["협업 원칙: 결론 전에 책임 경계를 확인한다"],
      },
    }],
  });

  assert.match(prompt, /관리자가 승인·고정한 컨텍스트/);
  assert.match(prompt, /결론 전에 책임 경계를 확인한다/);
});

test("ON 상태 6명의 Voice Direction이 말투와 사고 순서를 서로 다르게 강제한다", () => {
  const expectedVoiceMarkers: Record<string, [RegExp, RegExp]> = {
    tect: [/책임 경계/, /완료 기준/],
    "char-001": [/사실과 해석/, /관측 조건/],
    "char-002": [/판정 기준/, /건조한 유머/],
    "char-003": [/밝고 구체적인 해요체/, /작은 실험/],
    "char-019": [/한 장면/, /여백이 느껴지는/],
    "char-020": [/한 줄 평/, /추천·비추천 대상/],
  };
  const expectedContextMarkers: Record<string, RegExp> = {
    tect: /실제 실행·조율 쟁점이 있을 때만 운영 언어/,
    "char-001": /경제·시장 주제가 아니면 거시경제 용어를 억지로 붙이지 말고/,
    "char-002": /Resolution, 가상 선택, 포지션 같은 시장 용어도 쓰지 않는다/,
    "char-003": /AI 도구 주제가 아니면 제품 업데이트인 척하지 말고/,
    "char-019": /색, 구도, 이미지, 앞뒤 장면 같은 미술 용어와 비유를 쓰지 않는다/,
    "char-020": /작품, 영화, 정주행, 시청, 큐레이션 같은 콘텐츠 비유를 쓰지 않는다/,
  };

  for (const canonical of canonicalEmployees) {
    const prompt = buildEmployeeReactionSystemInstruction({
      board: "public-feed",
      title: "AI 에이전트의 업무 권한을 어디까지 허용할지 검토합니다",
      body: "같은 안건에서도 각 직원이 서로 다른 관점과 말투로 판단해야 합니다.",
      employees: [canonical],
    });

    assert.match(prompt, /고유 Voice Direction/);
    for (const marker of expectedVoiceMarkers[canonical.employee.id]) {
      assert.match(prompt, marker);
    }
    assert.match(prompt, expectedContextMarkers[canonical.employee.id]);
    assert.match(prompt, /전체 발언은 공백 포함 160~320자/);
    assert.match(prompt, /전문용어를 억지로 끼우지 않는다/);
    assert.match(prompt, /범용 AI 보고서 문체를 피한다/);
  }
});

test("TECT 전용 Runtime Context는 TECT Gemini Prompt에만 주입된다", () => {
  const tectCanonical = canonicalEmployees.find(
    ({ employee }) => employee.id === "tect"
  );
  const sigCanonical = canonicalEmployees.find(
    ({ employee }) => employee.id === "char-001"
  );
  assert.ok(tectCanonical);
  assert.ok(sigCanonical);

  const tectPrompt = buildEmployeeReactionSystemInstruction({
    board: "public-feed",
    title: "조직 운영 원칙 정리",
    body: "자율 실행과 권한 경계를 구분합니다.",
    employees: [tectCanonical],
  });
  const sigPrompt = buildEmployeeReactionSystemInstruction({
    board: "public-feed",
    title: "시장 신호 정리",
    body: "확인된 근거만으로 의견을 작성합니다.",
    employees: [sigCanonical],
  });

  assert.match(tectPrompt, /TECT 전용 Runtime Context/);
  assert.match(tectPrompt, /정확성 \/ 책임 \/ 지속 가능성 \/ 신뢰 \/ 자율성/);
  assert.match(tectPrompt, /독립적인 C-Level AI Employee/);
  assert.match(tectPrompt, /Architect는 주제 수집·직원 배정·실행·자동 검수/);
  assert.match(tectPrompt, /일반 콘텐츠, 공개 피드, 찬반 토론, 익명 채팅은 자율 판단/);
  assert.match(tectPrompt, /실제 PERSOS 활동에서 발생하고 저장된 사건만/);
  assert.doesNotMatch(tectPrompt, /벤타코의 디지털 분신/);
  assert.doesNotMatch(tectPrompt, /Blue-Cyan|Platinum Silver|Black Slim Tailored/);

  assert.doesNotMatch(sigPrompt, /TECT 전용 Runtime Context/);
  assert.doesNotMatch(sigPrompt, /독립적인 C-Level AI Employee/);
});

test("TECT Social Context는 익명 채팅에만 최소 정보로 주입된다", () => {
  const tectCanonical = canonicalEmployees.find(
    ({ employee }) => employee.id === "tect"
  );
  const sigCanonical = canonicalEmployees.find(
    ({ employee }) => employee.id === "char-001"
  );
  assert.ok(tectCanonical);
  assert.ok(sigCanonical);

  const anonymousPrompt = buildEmployeeReactionSystemInstruction({
    board: "anonymous",
    title: "업무가 끝난 뒤 가볍게 안부를 나눕니다",
    body: "캐릭터와 현재 상황에 맞으면 가벼운 대화를 선택할 수 있습니다.",
    employees: [sigCanonical],
    socialParticipants: [tectCanonical, sigCanonical],
  });

  assert.match(anonymousPrompt, /익명 채팅 전용 Social Context/);
  assert.match(anonymousPrompt, /백발의 긴 머리와 중성적인 미형/);
  assert.match(anonymousPrompt, /이마의 보석과 긴 귀걸이/);
  assert.match(anonymousPrompt, /과하게 들뜨지는 않지만 무시하지도 않는다/);
  assert.match(anonymousPrompt, /기억, 배려, 선제적인 도움/);
  assert.match(anonymousPrompt, /다른 직원의 실제 이름, 검증된 짧은 외형/);
  assert.match(anonymousPrompt, /사적 대화는 가능한 선택지일 뿐 매번 생성하지 않는다/);
  assert.match(anonymousPrompt, /과거 친분·연애·가족관계·사건을 만들지 않는다/);
  assert.doesNotMatch(
    anonymousPrompt,
    /Platinum Silver|Blue-Cyan|Black Slim Tailored|#0B0D12|이미지 생성 프롬프트/
  );
  assert.doesNotMatch(anonymousPrompt, /오늘도 넥타이 각이 유난히 정확/);

  const tectAnonymousPrompt = buildEmployeeReactionSystemInstruction({
    board: "anonymous",
    title: "가벼운 대화를 나눕니다",
    body: "사적인 소통은 상황에 따라 선택합니다.",
    employees: [tectCanonical],
    socialParticipants: [tectCanonical, sigCanonical],
  });
  assert.match(tectAnonymousPrompt, /텍트 \(TECT\) · 작성자 본인 · 자기 식별 표현 금지/);
  assert.match(tectAnonymousPrompt, /백발의 긴 머리와 중성적인 미형/);

  for (const board of ["public-feed", "debate"] as const) {
    const workPrompt = buildEmployeeReactionSystemInstruction({
      board,
      title: "업무 판단 안건",
      body: "확인된 근거와 대안을 중심으로 검토합니다.",
      employees: [tectCanonical],
      socialParticipants: [tectCanonical, sigCanonical],
    });
    assert.doesNotMatch(workPrompt, /익명 채팅 전용 Social Context/);
    assert.doesNotMatch(workPrompt, /백발의 긴 머리|긴 귀걸이/);
  }
});

test("구조화 응답을 Canonical 직원 순서로 정렬한다", () => {
  const reversed = {
    reactions: [...validPayload.reactions].reverse(),
  };
  const reactions = parseEmployeeReactions(JSON.stringify(reversed));

  assert.deepEqual(
    reactions.map((reaction) => reaction.employeeId),
    [...EMPLOYEE_REACTION_IDS]
  );
});

test("JSON 파싱 실패와 직원 중복을 거부한다", () => {
  assert.throws(
    () => parseEmployeeReactions("{invalid"),
    StructuredEmployeeReactionError
  );

  const duplicated = {
    reactions: validPayload.reactions.map((reaction) => ({
      ...reaction,
      employeeId: "tect",
    })),
  };
  assert.throws(
    () => parseEmployeeReactions(JSON.stringify(duplicated)),
    StructuredEmployeeReactionError
  );
});

test("필수 응답 필드 누락을 거부한다", () => {
  const missingField = {
    reactions: validPayload.reactions.map((reaction, index) =>
      index === 1 ? { ...reaction, concerns: "" } : reaction
    ),
  };

  assert.throws(
    () => parseEmployeeReactions(JSON.stringify(missingField)),
    StructuredEmployeeReactionError
  );
});
