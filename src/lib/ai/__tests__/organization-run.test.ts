import assert from "node:assert/strict";
import test from "node:test";

import type {
  EmployeeReactionPost,
  ManualOrganizationRunInput,
  OrganizationRunTopic,
} from "@/types";
import {
  runAIOrganization,
  runManualAIOrganization,
} from "@/lib/organization-run/service";
import type {
  OrganizationRunGenerator,
  OrganizationRunPublisher,
} from "@/lib/organization-run/types";
import { buildOrganizationRunPost } from "@/lib/organization-run/post-builder";
import { parseManualOrganizationRunInput } from "@/lib/organization-run/manual-input";

const validTopic: OrganizationRunTopic = {
  boardType: "debate",
  title: "AI 직원 콘텐츠의 사람 검토 범위를 사업부별로 다르게 운영해야 하는가?",
  body:
    "PERSOS의 AI 직원 콘텐츠는 사람 검토 후 공개됩니다. 콘텐츠 위험도와 사업부 전문성에 따라 검토 범위와 승인 단계를 다르게 적용하면 운영 속도를 높일 수 있지만, 전사 기준의 일관성과 책임 경계가 흔들릴 가능성도 있습니다. 각 사업부의 현실적인 운영 부담과 공개 신뢰를 함께 고려해 판단해 주세요.",
  topicSummary:
    "AI 직원 콘텐츠의 사람 검토 범위를 사업부 위험도에 따라 차등 적용할지 검토합니다.",
  reasonForBoardSelection:
    "운영 효율과 공개 신뢰 사이의 찬반 판단이 필요한 안건입니다.",
  relevantEmployeeIds: ["tect", "char-003", "char-002"],
};

class MemoryPublisher implements OrganizationRunPublisher {
  posts: EmployeeReactionPost[] = [];
  published = 0;
  locked = false;

  async listPosts() {
    return this.posts;
  }
  async getPost(slug: string) {
    return this.posts.find((post) => post.slug === slug);
  }
  async listTopicSummaries() {
    return this.posts.map((post) => post.summary);
  }
  async publish(post: EmployeeReactionPost) {
    this.posts.unshift(post);
    this.published += 1;
  }
  async acquireExecutionLock() {
    if (this.locked) return false;
    this.locked = true;
    return true;
  }
  async releaseExecutionLock() {
    this.locked = false;
  }
  async consumeRateLimit() {
    return true;
  }
}

function createGenerator(topics: OrganizationRunTopic[]) {
  let topicCalls = 0;
  const generator: OrganizationRunGenerator = {
    async generateTopic() {
      const topic = topics[Math.min(topicCalls, topics.length - 1)];
      topicCalls += 1;
      return topic;
    },
    async generateReactions({ employees }) {
      return employees.map(({ employee }, index) => ({
        employeeId: employee.id as "tect" | "char-003" | "char-002",
        stance: index === 0 ? "보류" : index === 1 ? "찬성" : "반대",
        coreOpinion: `${employee.nameKo}의 핵심 의견입니다.`,
        concerns: `${employee.nameKo}의 우려 사항입니다.`,
        suggestion: `${employee.nameKo}의 실행 제안입니다.`,
      }));
    },
  };
  return { generator, getTopicCalls: () => topicCalls };
}

test("정상 실행은 Topic과 반응을 각 1회 생성하고 한 번만 발행한다", async () => {
  const publisher = new MemoryPublisher();
  const { generator } = createGenerator([validTopic]);
  const result = await runAIOrganization({ generator, publisher });

  assert.equal(result.status, "completed");
  assert.equal(result.geminiCallCount, 2);
  assert.equal(result.participantIds.length, 3);
  assert.equal(publisher.published, 1);
  assert.equal(publisher.posts[0].reactions.length, 3);
});

test("첫 Topic이 중복이면 한 번 재생성하고 정상 Topic을 발행한다", async () => {
  const publisher = new MemoryPublisher();
  publisher.posts = [
    {
      id: "existing",
      slug: "existing",
      board: "debate",
      boardLabel: "전사원 찬반 토론",
      title: validTopic.title,
      summary: validTopic.topicSummary,
      body: validTopic.body,
      publishedAt: "2026-07-27T00:00:00.000Z",
      reactions: [],
    },
  ];
  const replacement = {
    ...validTopic,
    title: "AI 직원의 외부 협업 제안에 사전 비용 한도를 적용해야 하는가?",
    body:
      "PERSOS AI 직원이 외부 파트너와 협업 기회를 발굴할 때, 초기 검토 비용과 담당자 시간을 보호하기 위한 사전 한도를 두는 방안을 검토합니다. 빠른 실행을 제한할 수 있지만 무분별한 제휴 검토를 줄이고 책임 있는 의사결정을 만들 수 있습니다. 사업성과 현장 부담을 함께 고려해 판단해 주세요.",
    topicSummary:
      "AI 직원의 외부 협업 제안에 사전 비용과 검토 시간 한도를 적용할지 검토합니다.",
  };
  const { generator, getTopicCalls } = createGenerator([
    validTopic,
    replacement,
  ]);

  const result = await runAIOrganization({ generator, publisher });
  assert.equal(getTopicCalls(), 2);
  assert.equal(result.geminiCallCount, 3);
  assert.equal(publisher.published, 1);
  assert.equal(result.title, replacement.title);
});

test("Topic 재검증도 실패하면 아무것도 발행하지 않는다", async () => {
  const publisher = new MemoryPublisher();
  const invalid = { ...validTopic, title: "테스트 게시글" };
  const { generator } = createGenerator([invalid, invalid]);

  await assert.rejects(() => runAIOrganization({ generator, publisher }));
  assert.equal(publisher.published, 0);
  assert.equal(publisher.locked, false);
});

test("public boardType은 공개 피드 저장 값으로 정규화한다", () => {
  const post = buildOrganizationRunPost({
    runId: "12345678-test-run",
    topic: {
      ...validTopic,
      boardType: "public",
    },
    reactions: [],
    publishedAt: "2026-07-28T00:00:00.000Z",
  });

  assert.equal(post.board, "public-feed");
});

const manualInput: ManualOrganizationRunInput = {
  boardType: "public",
  title: "AI 직원 외부 협업 제안을 운영자가 수동으로 검토하는 절차",
  body:
    "PERSOS 운영자가 외부 협업 제안의 배경과 판단 기준을 직접 작성하고, 관련 AI 직원을 선택해 각자의 전문 관점으로 검토하도록 합니다. 자동 생성 주제 대신 운영자가 입력한 안건을 기준으로 반응을 생성하되, 직원 Canonical과 공개 정책 검증은 기존 자동 파이프라인을 그대로 적용해야 합니다.",
  employeeIds: ["tect", "char-003"],
  publish: false,
};

test("수동 실행은 주제를 생성하지 않고 반응과 검증만 수행한다", async () => {
  const publisher = new MemoryPublisher();
  const { generator, getTopicCalls } = createGenerator([validTopic]);
  const result = await runManualAIOrganization({
    generator,
    publisher,
    manualInput,
  });

  assert.equal(getTopicCalls(), 0);
  assert.equal(result.geminiCallCount, 1);
  assert.equal(result.published, false);
  assert.equal(result.publicUrl, undefined);
  assert.equal(result.post.reactions.length, 2);
  assert.equal(publisher.published, 0);
});

test("수동 발행 선택 시 이미지와 게시글을 함께 저장한다", async () => {
  const publisher = new MemoryPublisher();
  const { generator } = createGenerator([validTopic]);
  const result = await runManualAIOrganization({
    generator,
    publisher,
    manualInput: {
      ...manualInput,
      imageUrl: "https://assets.example.com/persos/manual-topic.png",
      publish: true,
    },
  });

  assert.equal(result.published, true);
  assert.match(result.publicUrl ?? "", /^\/discussion\//);
  assert.equal(publisher.published, 1);
  assert.equal(
    publisher.posts[0].imageUrl,
    "https://assets.example.com/persos/manual-topic.png"
  );
});

test("수동 입력은 게시판, 본문, 직원과 이미지 URL 정책을 검증한다", () => {
  assert.deepEqual(
    parseManualOrganizationRunInput({
      ...manualInput,
      imageUrl: "/assets/content/manual-topic.png",
    }),
    {
      ...manualInput,
      imageUrl: "/assets/content/manual-topic.png",
    }
  );

  assert.throws(() =>
    parseManualOrganizationRunInput({
      ...manualInput,
      employeeIds: ["tect"],
    })
  );
  assert.throws(() =>
    parseManualOrganizationRunInput({
      ...manualInput,
      imageUrl: "http://insecure.example.com/image.png",
    })
  );
});
