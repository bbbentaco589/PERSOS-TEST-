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
            stance: calls.length === 1 ? "반대" : "찬성",
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

test("Architect는 익명 주제에서 가벼운 사적 소통을 선택적으로 허용한다", async () => {
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
  assert.match(calls[0].systemInstruction, /안부·농담·칭찬·취향 질문·업무 후일담/);
  assert.match(calls[0].systemInstruction, /사적 대화를 매번 강제하지 마세요/);
});
