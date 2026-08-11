import assert from "node:assert/strict";
import test from "node:test";

import type {
  EmployeeReactionPost,
  ManualOrganizationRunInput,
  OrganizationRunReviewItem,
  OrganizationRunReviewStatus,
  OrganizationRunTopic,
} from "@/types";
import {
  runAIOrganization,
  runManualAIOrganization,
} from "@/lib/organization-run/service";
import { reviewOrganizationRunItem } from "@/lib/organization-run/review-service";
import type {
  OrganizationRunGenerator,
  OrganizationRunPublisher,
} from "@/lib/organization-run/types";
import { buildOrganizationRunPost } from "@/lib/organization-run/post-builder";
import { parseManualOrganizationRunInput } from "@/lib/organization-run/manual-input";
import { ORGANIZATION_RUN_EMPLOYEE_IDS } from "@/lib/organization-run/canonical-employees";
import { validateOrganizationRunTopic } from "@/lib/organization-run/topic-validation";
import {
  normalizePublicFeedAuthorship,
  shouldGenerateAuthorReply,
} from "@/lib/organization-run/public-feed-interactions";

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
  reviews: OrganizationRunReviewItem[] = [];

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
  async listReviewItems(status?: OrganizationRunReviewStatus) {
    return this.reviews.filter((item) => !status || item.status === status);
  }
  async getReviewItem(id: string) {
    return this.reviews.find((item) => item.id === id);
  }
  async saveReviewItem(item: OrganizationRunReviewItem) {
    this.reviews.unshift(item);
  }
  async updateReviewItem(item: OrganizationRunReviewItem) {
    this.reviews = this.reviews.map((current) => current.id === item.id ? item : current);
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
        employeeId:
          employee.id as (typeof ORGANIZATION_RUN_EMPLOYEE_IDS)[number],
        stance: index === 0 ? "보류" : index === 1 ? "찬성" : "반대",
        interactionType: index === 1 ? "질문" as const : "독립 의견" as const,
        coreOpinion: `${employee.nameKo}의 핵심 의견입니다.`,
        concerns: `${employee.nameKo}의 우려 사항입니다.`,
        suggestion:
          index === 1
            ? `${employee.nameKo}은 어떤 기준으로 보완할까요?`
            : `${employee.nameKo}의 실행 제안입니다.`,
      }));
    },
    async generateAuthorReplies({ comments }) {
      return comments.map(({ commenter }) => ({
        parentEmployeeId:
          commenter.employee.id as (typeof ORGANIZATION_RUN_EMPLOYEE_IDS)[number],
        content:
          "질문의 전제를 반영해 실행 범위와 중단 기준을 게시 원칙에 보완하겠습니다.",
      }));
    },
  };
  return { generator, getTopicCalls: () => topicCalls };
}

test("정상 실행은 Topic 1회와 직원별 독립 호출 후 자동 발행한다", async () => {
  const publisher = new MemoryPublisher();
  const { generator } = createGenerator([validTopic]);
  const result = await runAIOrganization({ generator, publisher });

  assert.equal(result.status, "completed");
  assert.equal(result.geminiCallCount, 4);
  assert.equal(result.participantIds.length, 3);
  assert.equal(publisher.published, 1);
  assert.equal(publisher.posts[0].reactions.length, 3);
  assert.equal(result.reviewPending, false);
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
  assert.equal(result.geminiCallCount, 5);
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

test("기존 공개 글은 게시자를 댓글에서 제거하고 질문·반박에만 1회 답글 대상으로 분류한다", () => {
  const legacyPost = buildOrganizationRunPost({
    runId: "legacy-public-author",
    topic: { ...validTopic, boardType: "debate" },
    reactions: [
      {
        employeeId: "tect",
        stance: "찬성",
        coreOpinion: "게시자의 판단입니다.",
        concerns: "책임 경계를 확인합니다.",
        suggestion: "중단 기준을 둡니다.",
      },
      {
        employeeId: "char-003",
        stance: "반대",
        coreOpinion: "다른 관점입니다.",
        concerns: "예외가 남습니다.",
        suggestion: "어디에서 멈출까요?",
      },
    ],
  });
  const normalized = normalizePublicFeedAuthorship({
    ...legacyPost,
    board: "public-feed",
  });

  assert.equal(normalized.authorEmployeeId, "tect");
  assert.deepEqual(
    normalized.reactions.map((reaction) => reaction.employeeId),
    ["char-003"]
  );
  assert.equal(
    shouldGenerateAuthorReply({
      commentText: "어디에서 멈출까요?",
      authorStance: "찬성",
      commentStance: "반대",
    }),
    true
  );
  assert.equal(
    shouldGenerateAuthorReply({
      commentText: "별도의 관찰 의견입니다.",
      authorStance: "보류",
      commentStance: "보류",
    }),
    false
  );
});

test("ON 상태인 6명을 반응 후보군에 포함하고 TECT 없이도 2명 배정이 가능하다", () => {
  assert.deepEqual(ORGANIZATION_RUN_EMPLOYEE_IDS, [
    "tect",
    "char-001",
    "char-002",
    "char-003",
    "char-019",
    "char-020",
  ]);
  const validation = validateOrganizationRunTopic(
    {
      ...validTopic,
      relevantEmployeeIds: ["char-001", "char-003"],
    },
    []
  );
  assert.equal(validation.valid, true);
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
  assert.equal(result.geminiCallCount, 3);
  assert.equal(result.published, false);
  assert.equal(result.publicUrl, undefined);
  assert.equal(result.post.authorEmployeeId, "tect");
  assert.equal(result.post.reactions.length, 1);
  assert.equal(result.post.reactions[0].employeeId, "char-003");
  assert.equal(result.post.replies?.length, 1);
  assert.equal(
    result.post.replies?.[0].parentReactionId,
    result.post.reactions[0].id
  );
  assert.equal(publisher.published, 0);
});

test("수동 발행 선택 시 ON 상태인 6명의 반응과 이미지·게시글을 함께 저장한다", async () => {
  const publisher = new MemoryPublisher();
  const { generator } = createGenerator([validTopic]);
  const result = await runManualAIOrganization({
    generator,
    publisher,
    manualInput: {
      ...manualInput,
      employeeIds: [...ORGANIZATION_RUN_EMPLOYEE_IDS],
      imageUrl: "https://assets.example.com/persos/manual-topic.png",
      publish: true,
    },
  });

  assert.equal(result.published, true);
  assert.equal(result.geminiCallCount, 7);
  assert.equal(result.post.authorEmployeeId, "tect");
  assert.equal(result.post.reactions.length, 5);
  assert.equal(
    result.post.reactions.some((reaction) => reaction.employeeId === "tect"),
    false
  );
  assert.equal(result.post.replies?.length, 1);
  assert.match(result.publicUrl ?? "", /^\/discussion\//);
  assert.equal(publisher.published, 1);
  assert.equal(
    publisher.posts[0].imageUrl,
    "https://assets.example.com/persos/manual-topic.png"
  );
});

test("고위험 콘텐츠는 자동 발행하지 않고 예외 검수 큐로 보낸다", async () => {
  const publisher = new MemoryPublisher();
  const highRiskTopic: OrganizationRunTopic = {
    ...validTopic,
    title: "AI 직원 채용 계약과 급여 조건을 확정해 외부에 공식 발표합니다",
    body:
      "PERSOS의 AI 직원 근로 계약을 체결하고 급여 조건을 확정하며 외부에 공식 입장을 발표하는 실행 안건입니다. 계약 책임과 채용·노무 권한 행사가 발생하므로 자동 공개하지 않습니다.",
    topicSummary: "채용 계약 체결과 급여 확정, 대외 발표 실행을 다룹니다.",
    sourceUrls: ["https://example.com/high-risk-authority-action"],
  };
  const { generator } = createGenerator([highRiskTopic]);
  const result = await runAIOrganization({ generator, publisher });

  assert.equal(result.published, false);
  assert.equal(result.reviewPending, true);
  assert.equal(publisher.published, 0);
  assert.equal(publisher.reviews.length, 1);
  assert.equal(publisher.reviews[0].status, "review_pending");
  assert.equal(publisher.reviews[0].riskLevel, "high");

  const approved = await reviewOrganizationRunItem({
    publisher,
    id: publisher.reviews[0].id,
    action: "approve",
  });
  assert.equal(approved.status, "approved");
  assert.equal(publisher.published, 1);
});

test("선택적 전건 검수 모드는 QA 통과 건도 자동 발행하지 않는다", async () => {
  const publisher = new MemoryPublisher();
  const { generator } = createGenerator([validTopic]);
  const result = await runAIOrganization({
    generator,
    publisher,
    fullReviewMode: true,
  });

  assert.equal(result.published, false);
  assert.equal(result.reviewPending, true);
  assert.match(publisher.reviews[0].reasons.join(" "), /전건 검수/);
});

test("저장 오류가 발생하면 생성 결과를 잃지 않고 예외 검수 큐에 보존한다", async () => {
  class FailingPublisher extends MemoryPublisher {
    override async publish() {
      throw new Error("isolated storage failure");
    }
  }
  const publisher = new FailingPublisher();
  const { generator } = createGenerator([validTopic]);

  await assert.rejects(() => runAIOrganization({ generator, publisher }));
  assert.equal(publisher.reviews.length, 1);
  assert.equal(publisher.reviews[0].status, "review_pending");
  assert.equal(publisher.reviews[0].post?.reactions.length, 3);
  assert.match(publisher.reviews[0].reasons.join(" "), /시스템 오류/);
});

test("예외 검수 큐에서 보류 콘텐츠를 수정하거나 폐기할 수 있다", async () => {
  const publisher = new MemoryPublisher();
  const { generator } = createGenerator([validTopic]);
  await runAIOrganization({ generator, publisher, fullReviewMode: true });
  const item = publisher.reviews[0];
  const edited = await reviewOrganizationRunItem({
    publisher,
    id: item.id,
    action: "edit",
    title: "수정된 AI 직원 콘텐츠 검수 범위와 자동 발행 운영 원칙",
    body:
      "Automated QA를 통과한 일반 콘텐츠는 자동 공개하고, 출처 불충분 또는 고위험 예외만 Founder 검수 큐에서 처리하는 운영 원칙으로 수정합니다.",
  });
  assert.equal(edited.status, "review_pending");
  assert.match(edited.post?.title ?? "", /수정된/);

  const discarded = await reviewOrganizationRunItem({
    publisher,
    id: item.id,
    action: "discard",
  });
  assert.equal(discarded.status, "discarded");
  assert.equal(publisher.published, 0);
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
