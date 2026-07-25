import assert from "node:assert/strict";
import test from "node:test";

import { HumanReviewStatus } from "@/constants/discussion";
import { AIErrorCode, AIProviderError, getAIProvider, type AIProvider } from "@/lib/ai";
import { createAIDiscussionEngineFlow } from "@/lib/discussion-engine";
import { getPublicDiscussionBySlug, listPublicDiscussions } from "@/lib/public-discussions";
import { PersistenceProvider } from "@/lib/database";
import { RepositoryFactory } from "@/lib/repositories";

test("Mock Core MVP가 생성부터 게시와 공개 조회까지 연결된다", async () => {
  const repositories = RepositoryFactory.getRepositories(PersistenceProvider.Mock);
  const provider = await getAIProvider({ ...process.env, AI_PROVIDER: "mock" });
  await repositories.discussionPersistence.clearGeneratedDiscussions();

  const flow = await createAIDiscussionEngineFlow(
    "topic-001",
    { participantIds: ["char-001", "char-002", "char-003"] },
    repositories,
    provider
  );
  const stored = await repositories.discussionPersistence.saveDiscussionFlow(flow, {
    assignNewId: true,
  });
  assert.equal(stored.contentDraft?.status, HumanReviewStatus.PendingReview);
  assert.equal((await listPublicDiscussions(repositories)).some((item) => item.id === stored.discussion.id), false);

  const approved = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: stored.contentDraft!,
    status: HumanReviewStatus.Approved,
  });
  assert.equal(approved?.discussion.status, HumanReviewStatus.Approved);
  assert.equal((await listPublicDiscussions(repositories)).some((item) => item.id === stored.discussion.id), false);

  const published = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: approved!.contentDraft!,
    status: HumanReviewStatus.Published,
  });
  assert.equal(published?.discussion.status, HumanReviewStatus.Published);
  assert.equal(published?.contentDraft?.status, HumanReviewStatus.Published);
  assert.ok(published?.discussion.publishedAt);

  const byId = await repositories.discussionPersistence.getGeneratedDiscussionFlowById(
    stored.discussion.id
  );
  assert.equal(byId?.discussion.id, stored.discussion.id);
  const publicList = await listPublicDiscussions(repositories);
  assert.ok(publicList.some((item) => item.id === stored.discussion.id));
  const publicDetail = await getPublicDiscussionBySlug(stored.discussion.slug, repositories);
  assert.equal(publicDetail?.discussion.id, stored.discussion.id);
  assert.equal(publicDetail?.contentDraft.status, HumanReviewStatus.Published);

  const participantIds = new Set(stored.discussion.participants.map((item) => item.characterId));
  const sourceIds = new Set(stored.sources.map((item) => item.id));
  const responseIds = new Set(stored.responses.map((item) => item.id));
  stored.responses.forEach((response) => {
    assert.ok(participantIds.has(response.characterId));
    response.sourceIds.forEach((sourceId) => assert.ok(sourceIds.has(sourceId)));
  });
  stored.rebuttals.forEach((rebuttal) => {
    assert.ok(participantIds.has(rebuttal.fromCharacterId));
    assert.ok(responseIds.has(rebuttal.targetResponseId));
  });
  assert.equal(stored.consensus?.discussionId, stored.discussion.id);
  assert.equal(stored.contentDraft?.discussionId, stored.discussion.id);
  stored.consensus?.sourceIds.forEach((sourceId) => assert.ok(sourceIds.has(sourceId)));

  const second = await repositories.discussionPersistence.saveDiscussionFlow(flow, {
    assignNewId: true,
  });
  assert.notEqual(second.discussion.id, stored.discussion.id);
  assert.notEqual(second.discussion.slug, stored.discussion.slug);

  const archived = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: published!.discussion.id,
    contentDraft: published!.contentDraft!,
    status: HumanReviewStatus.Archived,
  });
  assert.equal(archived?.discussion.status, HumanReviewStatus.Archived);
  assert.equal(await getPublicDiscussionBySlug(stored.discussion.slug, repositories), null);

  await repositories.discussionPersistence.clearGeneratedDiscussions();
});

test("AI 생성 실패 결과는 부분 저장하지 않는다", async () => {
  const repositories = RepositoryFactory.getRepositories(PersistenceProvider.Mock);
  const provider = await getAIProvider({ ...process.env, AI_PROVIDER: "mock" });
  const failingProvider: AIProvider = {
    ...provider,
    generateInitialResponse: async () => {
      throw new AIProviderError(
        AIErrorCode.ResponseInvalid,
        "구조화된 AI 응답이 유효하지 않습니다.",
        502
      );
    },
  };
  await repositories.discussionPersistence.clearGeneratedDiscussions();

  await assert.rejects(
    createAIDiscussionEngineFlow(
      "topic-001",
      { participantIds: ["char-001", "char-002"] },
      repositories,
      failingProvider
    ),
    (error: unknown) => error instanceof AIProviderError &&
      error.code === AIErrorCode.ResponseInvalid
  );
  assert.equal((await repositories.discussionPersistence.listGeneratedDiscussionFlows()).length, 0);
});
