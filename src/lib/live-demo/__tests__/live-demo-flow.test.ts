import assert from "node:assert/strict";
import test from "node:test";

import type { LiveDemoConfig } from "@/lib/live-demo/config";
import { runAutomatedQA } from "@/lib/live-demo/automated-qa";
import type {
  LiveDemoGenerationResult,
  LiveDemoGenerator,
} from "@/lib/live-demo/gemini-generator";
import { validateGeneratedPlan } from "@/lib/live-demo/schemas";
import {
  runLiveDemoTick,
  setLiveDemoKillSwitch,
} from "@/lib/live-demo/service";
import { buildPublicFeedItems } from "@/lib/public-feed-presentation";
import { resetMockLiveDemoStore } from "@/lib/repositories/mock/mock-live-demo.repository";
import { RepositoryFactory } from "@/lib/repositories/repository-factory";
import type {
  LiveDemoStructuredContent,
} from "@/types";

const startAt = new Date("2026-07-25T20:00:00+09:00");
const endAt = new Date("2026-07-25T23:00:00+09:00");
const config: LiveDemoConfig = {
  modeEnabled: true,
  generationEnabled: true,
  autoPublish: true,
  startAt,
  endAt,
  maxTotalCalls: 40,
  maxRetries: 1,
  maxChatRuns: 18,
  maxChatMessages: 30,
  maxFeedPosts: 5,
  maxDebateMessages: 10,
};

function result<T>(value: T): LiveDemoGenerationResult<T> {
  return {
    value,
    usage: { promptTokens: 100, outputTokens: 50, totalTokens: 150 },
    model: "gemini-test",
    latencyMs: 12,
  };
}

class TestLiveDemoGenerator implements LiveDemoGenerator {
  private sequence = 0;

  async generatePlan() {
    return result({
      debateTitle: "AI 자동화는 사람의 최종 책임을 전제로 확대해야 하는가?",
      debateDescription:
        "운영 효율과 책임 경계를 세 Persona의 관점에서 검토합니다.",
      debateAssignments: [
        {
          personaId: "char-001",
          stance: "oppose" as const,
          responsibility: "시장 위험과 조건 검토",
        },
        {
          personaId: "char-002",
          stance: "neutral" as const,
          responsibility: "현실적인 운영 경계 검토",
        },
        {
          personaId: "char-003",
          stance: "support" as const,
          responsibility: "기술 효용과 도입 조건 검토",
        },
      ],
      anonymousTopicTitle:
        "AI와 함께 일할 때 사람의 강점을 어떻게 지킬 수 있을까?",
      feedAssignments: [
        { order: 1, personaId: "char-001", title: "자동화 도입의 판단 조건", activityType: "Insight" },
        { order: 2, personaId: "char-003", title: "AI 도구 적용 체크리스트", activityType: "Knowledge" },
        { order: 3, personaId: "char-002", title: "운영 현장에서 놓치기 쉬운 비용", activityType: "의견" },
        { order: 4, personaId: "char-001", title: "시장 신호와 제품 판단", activityType: "업무" },
        { order: 5, personaId: "char-003", title: "사람 검토가 필요한 순간", activityType: "Insight" },
      ],
      debateSchedule: [
        { order: 1, personaId: "char-001", stance: "oppose" as const, round: "opening" as const },
        { order: 2, personaId: "char-002", stance: "neutral" as const, round: "opening" as const },
        { order: 3, personaId: "char-003", stance: "support" as const, round: "opening" as const },
        { order: 4, personaId: "char-001", stance: "oppose" as const, round: "rebuttal" as const },
        { order: 5, personaId: "char-002", stance: "neutral" as const, round: "rebuttal" as const },
        { order: 6, personaId: "char-003", stance: "support" as const, round: "rebuttal" as const },
      ],
    });
  }

  async generateContents(
    input: Parameters<LiveDemoGenerator["generateContents"]>[0]
  ) {
    this.sequence += 1;
    const observations = [
      "도입 전에는 실패 비용과 중단 조건을 수치로 합의해야 합니다.",
      "회의에서는 결론보다 서로 다른 업무 맥락을 먼저 공유하는 편이 좋습니다.",
      "작은 범위에서 관찰한 결과를 문서화한 뒤 다음 단계로 확장해야 합니다.",
      "이용자가 이해할 수 있는 언어와 책임 있는 이관 기준이 함께 필요합니다.",
    ];
    const items: LiveDemoStructuredContent[] = input.contexts
      .slice(0, input.expectedCount)
      .map((context, index) => ({
        personaId: context.persona.id,
        contentType: input.contentType,
        topicId: input.topicId,
        title: `${input.topicTitle} · ${context.persona.name}`,
        body:
          `${context.persona.name}은 ${input.topicTitle}을 자신의 업무 기준으로 검토합니다. ` +
          `${observations[(this.sequence + index) % observations.length]} ` +
          `기록 번호 ${this.sequence}-${index + 1}에서는 사람 검토가 필요한 경계도 함께 남깁니다.`,
        stance: input.stance as LiveDemoStructuredContent["stance"],
        round: input.round as LiveDemoStructuredContent["round"],
        replyToId: input.replyToId ?? null,
        activityType: input.contentType === "feed" ? "Insight" : undefined,
        metadata: { fixture: true, sequence: this.sequence },
      }));
    return result(items);
  }
}

test("TECT 계획부터 Published Public Feed까지 결정론적으로 연결한다", async () => {
  resetMockLiveDemoStore();
  const repositories = RepositoryFactory.getRepositories("mock");
  const generator = new TestLiveDemoGenerator();
  const now = new Date("2026-07-25T20:10:00+09:00");

  const first = await runLiveDemoTick({
    repositories,
    generator,
    config,
    now,
  });
  assert.equal(first.created.filter((item) => item.contentType === "feed").length, 1);
  assert.equal(
    first.created.filter((item) => item.contentType === "anonymous").length,
    2
  );
  assert.ok(first.created.every((item) => item.status === "published"));
  assert.equal(first.state.totalCalls, 4);

  const second = await runLiveDemoTick({
    repositories,
    generator,
    config,
    now,
  });
  assert.equal(second.created.length, 0);

  const usageLogs = await repositories.liveDemo.listUsageLogs();
  assert.equal(usageLogs.length, 4);
  assert.ok(usageLogs.every((log) => log.totalTokens === 150));

  const feedItems = buildPublicFeedItems([], first.created);
  assert.equal(feedItems.filter((item) => item.id.startsWith("live-feed")).length, 1);
});

test("Kill Switch와 종료 시각 이후 호출을 차단한다", async () => {
  resetMockLiveDemoStore();
  const repositories = RepositoryFactory.getRepositories("mock");
  const generator = new TestLiveDemoGenerator();

  await setLiveDemoKillSwitch(true, repositories);
  await assert.rejects(
    runLiveDemoTick({
      repositories,
      generator,
      config,
      now: new Date("2026-07-25T20:10:00+09:00"),
    }),
    /Kill Switch/
  );
  await setLiveDemoKillSwitch(false, repositories);
  await assert.rejects(
    runLiveDemoTick({
      repositories,
      generator,
      config,
      now: new Date("2026-07-25T23:00:00+09:00"),
    }),
    /허용 시간 밖/
  );
  assert.equal((await repositories.liveDemo.getState()).totalCalls, 0);
});

test("Hard Cap과 TECT 제외 주제를 생성 전에 차단한다", async () => {
  resetMockLiveDemoStore();
  const repositories = RepositoryFactory.getRepositories("mock");
  const generator = new TestLiveDemoGenerator();

  await assert.rejects(
    runLiveDemoTick({
      repositories,
      generator,
      config: { ...config, maxTotalCalls: 0 },
      now: new Date("2026-07-25T20:10:00+09:00"),
    }),
    /Hard Cap/
  );
  assert.equal((await repositories.liveDemo.getState()).totalCalls, 0);

  const validPlan = (await generator.generatePlan()).value;
  assert.throws(
    () =>
      validateGeneratedPlan({
        ...validPlan,
        debateTitle: "특정 종목 매수 추천",
      }),
    /제외 주제/
  );
});

test("Automated QA가 Secret·개인정보·불일치 콘텐츠를 거절한다", () => {
  const qa = runAutomatedQA({
    content: {
      personaId: "char-001",
      contentType: "feed",
      topicId: "wrong-topic",
      title: "내부 설정 공유",
      body:
        "GEMINI_API_KEY와 test@example.com을 확인해 주세요. " +
        "이 문장은 공개 콘텐츠 최소 길이를 충족하기 위한 테스트 문장입니다.",
      metadata: {},
    },
    expectedContentType: "feed",
    expectedTopicId: "expected-topic",
    expectedPersonaIds: ["char-003"],
    recentContents: [],
  });

  assert.equal(qa.passed, false);
  assert.match(qa.reasons.join(" "), /Persona 불일치/);
  assert.match(qa.reasons.join(" "), /Topic/);
  assert.match(qa.reasons.join(" "), /Secret/);
  assert.match(qa.reasons.join(" "), /이메일/);
});
