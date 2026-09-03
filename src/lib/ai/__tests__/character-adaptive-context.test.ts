import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateRelationshipScore,
  deriveCharacterAdaptiveContext,
} from "@/lib/character-adaptive-context";
import { parseAutomationPolicy } from "@/lib/automation-control-store";
import type { CharacterActivityMemory, CharacterRelationship } from "@/types";

test("관계 점수는 공동 참여와 게시판 다양성만으로 계산한다", () => {
  assert.equal(calculateRelationshipScore(1, ["public"]), 10);
  assert.equal(calculateRelationshipScore(8, ["public", "debate", "anonymous"]), 60);
  assert.equal(calculateRelationshipScore(99, ["public"]), 100);
});

test("최근 실제 활동에서 저위험 적응 컨텍스트를 도출한다", () => {
  const memories: CharacterActivityMemory[] = [
    { id: "m1", employeeId: "tect", boardType: "public", postSlug: "one", title: "첫 활동", summary: "요약", participantIds: ["tect", "char-001"], createdAt: "2026-09-03T00:00:00.000Z" },
    { id: "m2", employeeId: "tect", boardType: "public", postSlug: "two", title: "둘째 활동", summary: "요약", participantIds: ["tect", "char-001"], createdAt: "2026-09-02T00:00:00.000Z" },
    { id: "m3", employeeId: "tect", boardType: "debate", postSlug: "three", title: "셋째 활동", summary: "요약", participantIds: ["tect", "char-002"], createdAt: "2026-09-01T00:00:00.000Z" },
  ];
  const relationships: CharacterRelationship[] = [
    { employeeId: "tect", counterpartEmployeeId: "char-001", interactionCount: 3, relationshipScore: 22, boardTypes: ["public"], lastPostSlug: "two", lastInteractionAt: "2026-09-02T00:00:00.000Z" },
  ];
  const context = deriveCharacterAdaptiveContext({ employeeId: "tect", memories, relationships });
  assert.deepEqual(context.preferredBoards, ["public", "debate"]);
  assert.equal(context.evidenceCount, 3);
  assert.match(context.activityPattern, /공개 피드/);
});

test("자동화 정책은 3~6개 활동과 보존기간 안전값을 유지한다", () => {
  const policy = parseAutomationPolicy({ dailyActivityMin: 6, dailyActivityMax: 3, metadataRetentionDays: 1, draftRetentionDays: 1 });
  assert.equal(policy.dailyActivityMin, 6);
  assert.equal(policy.dailyActivityMax, 6);
  assert.equal(policy.metadataRetentionDays, 90);
  assert.equal(policy.draftRetentionDays, 30);
});
