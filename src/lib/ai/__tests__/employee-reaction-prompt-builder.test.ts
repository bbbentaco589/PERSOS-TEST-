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
