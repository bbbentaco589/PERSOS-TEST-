import assert from "node:assert/strict";
import test from "node:test";

import { characters, sources, topics } from "@/data";
import {
  buildConsensusPrompt,
  buildContentDraftPrompt,
  buildCrossRebuttalPrompt,
  buildInitialResponsePrompt,
} from "@/lib/ai/prompts";
import { ResponseRound } from "@/constants/discussion";

const response = {
  id: "response-test",
  discussionId: "discussion-test",
  characterId: characters[0].id,
  round: ResponseRound.Opening,
  stance: "테스트 입장",
  content: "테스트 응답",
  confidence: "High" as const,
  sourceIds: [sources[0].id],
  createdAt: "2026-07-14",
};

test("Prompt가 Topic, Character, Source, 한국어와 길이 제한을 포함한다", () => {
  const prompt = buildInitialResponsePrompt({
    topic: topics[0], sources, character: characters[0], outputLanguage: "ko",
    lengthConstraint: "350~550자",
  });
  assert.match(prompt, new RegExp(topics[0].title));
  assert.match(prompt, new RegExp(characters[0].nameKo));
  assert.match(prompt, new RegExp(characters[0].jobTitleKo));
  assert.match(prompt, new RegExp(sources[0].id));
  assert.match(prompt, /출력 언어: 한국어/);
  assert.match(prompt, /길이 제한: 350~550자/);
});

test("Source가 없으면 허위 인용 금지 지시를 포함한다", () => {
  const prompt = buildInitialResponsePrompt({
    topic: topics[0], sources: [], character: characters[0], outputLanguage: "ko",
    lengthConstraint: "350~550자",
  });
  assert.match(prompt, /허위 인용/);
  assert.match(prompt, /빈 배열/);
});

test("반박, 합의, 콘텐츠 Prompt가 필수 정책을 포함한다", () => {
  const rebuttal = buildCrossRebuttalPrompt({
    topic: topics[0], sources, respondingCharacter: characters[0],
    targetCharacter: characters[1], respondingInitialResponse: response,
    targetResponse: { ...response, id: "response-target", characterId: characters[1].id },
    outputLanguage: "ko", lengthConstraint: "250~400자",
  });
  const consensus = buildConsensusPrompt({
    topic: topics[0], sources, responses: [response], rebuttals: [], outputLanguage: "ko",
  });
  const draft = buildContentDraftPrompt({
    topic: topics[0], sources, responses: [response], rebuttals: [], outputLanguage: "ko",
    targetContentType: "Web Article",
    consensus: {
      summary: "요약", agreements: ["합의"], disagreements: [],
      finalConsensus: "최종 합의", limitations: ["한계"], sourceReferences: [sources[0].id],
    },
  });
  assert.match(rebuttal, /길이 제한: 250~400자/);
  assert.match(consensus, /합의점, 이견, 최종 합의, 한계/);
  assert.match(draft, /반드시 인간 검토/);
  assert.match(draft, /자동 승인 또는 자동 발행/);
});
