import assert from "node:assert/strict";
import test from "node:test";

import { HumanReviewStatus } from "@/constants/discussion";
import { getAIProvider } from "@/lib/ai";
import { createAIDiscussionEngineFlow } from "@/lib/discussion-engine";
import { PersistenceProvider } from "@/lib/database";
import { RepositoryFactory } from "@/lib/repositories";

test("Mock AI + Mock Repository가 전체 Discussion Flow를 저장한다", async () => {
  const repositories = RepositoryFactory.getRepositories(PersistenceProvider.Mock);
  await repositories.discussionPersistence.clearGeneratedDiscussions();
  const provider = await getAIProvider({ ...process.env, AI_PROVIDER: "mock" });
  const flow = await createAIDiscussionEngineFlow(
    "topic-001",
    { participantIds: ["char-001", "char-002", "char-003"] },
    repositories,
    provider
  );

  assert.equal(flow.responses.length, 3);
  assert.equal(new Set(flow.responses.map((item) => item.content)).size, 3);
  assert.equal(flow.rebuttals.length, 3);
  assert.ok(flow.consensus);
  assert.equal(flow.contentDraft.status, HumanReviewStatus.PendingReview);

  const stored = await repositories.discussionPersistence.saveDiscussionFlow(flow, { assignNewId: true });
  const reloaded = await repositories.discussionPersistence.getGeneratedDiscussionFlowById(stored.discussion.id);
  assert.equal(reloaded?.discussion.id, stored.discussion.id);
  assert.equal(reloaded?.responses.length, 3);
  assert.equal(reloaded?.contentDraft?.status, HumanReviewStatus.PendingReview);

  const approved = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: stored.contentDraft!,
    status: HumanReviewStatus.Approved,
  });
  assert.equal(approved?.contentDraft?.status, HumanReviewStatus.Approved);
  const published = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: approved!.contentDraft!,
    status: HumanReviewStatus.Published,
  });
  assert.equal(published?.contentDraft?.status, HumanReviewStatus.Published);
  await repositories.discussionPersistence.clearGeneratedDiscussions();
});
