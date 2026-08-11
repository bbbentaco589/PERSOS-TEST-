import assert from "node:assert/strict";

import { HumanReviewStatus } from "@/constants/discussion";
import { createMockDiscussionEngineFlow } from "@/lib/discussion-engine";
import type { RepositoryBundle } from "@/lib/repositories";
import { prepareDiscussionFlowForStorage } from "@/lib/repositories/discussion-flow-storage";

export async function verifyRepositoryContract(repositories: RepositoryBundle) {
  await repositories.discussionPersistence.clearGeneratedDiscussions();

  const [companies, divisions, teams, employees] = await Promise.all([
    repositories.organization.listCompanies(),
    repositories.organization.listDivisions(),
    repositories.organization.listTeams(),
    repositories.organization.listEmployees(),
  ]);
  assert.equal(companies.length, 1, "Ptudio Company 레코드가 필요합니다.");
  assert.equal(divisions.length, 6, "공식 Division은 6개여야 합니다.");
  assert.equal(teams.length, 19, "공식 Team은 19개여야 합니다.");
  assert.equal(employees.filter((employee) => employee.status === "Active").length, 6);
  assert.equal((await repositories.organization.getTeamBySlug("ccgg-care"))?.divisionId, "division-intelligence");
  assert.equal((await repositories.organization.getEmployeesByTeamId("team-economy-industry-analysis"))[0]?.id, "char-001");
  assert.equal((await repositories.organization.getEmployeesByTeamId("team-prediction-market"))[0]?.id, "char-002");
  assert.equal((await repositories.organization.getEmployeesByTeamId("team-ai-research-engineering"))[0]?.id, "char-003");
  assert.equal((await repositories.organization.getEmployeesByTeamId("team-content-production")).some((employee) => employee.id === "char-019"), true);
  assert.equal((await repositories.organization.getEmployeesByTeamId("team-ott-editorial"))[0]?.id, "char-020");

  const [topics, sources, characters] = await Promise.all([
    repositories.topics.listTopics(),
    repositories.sources.listSources(),
    repositories.characters.listCharacters(),
  ]);
  assert.ok(topics.length > 0, "Topic seed가 필요합니다.");
  assert.ok(sources.length > 0, "Source seed가 필요합니다.");
  assert.ok(characters.length >= 2, "Character seed가 최소 2명 필요합니다.");
  assert.equal(await repositories.topics.getTopicById("missing-topic"), undefined);

  const flow = await createMockDiscussionEngineFlow(
    topics[0].id,
    { participantIds: characters.slice(0, 3).map((item) => item.id) },
    repositories
  );
  const stored = await repositories.discussionPersistence.saveDiscussionFlow(flow, {
    assignNewId: true,
  });
  const reloaded = await repositories.discussionPersistence
    .getGeneratedDiscussionFlowById(stored.discussion.id);

  assert.ok(reloaded);
  assert.equal(reloaded.discussion.id, stored.discussion.id);
  assert.deepEqual(reloaded.discussion.participants, stored.discussion.participants);
  assert.deepEqual(reloaded.discussion.sourceIds, stored.discussion.sourceIds);
  assert.deepEqual(reloaded.responses, stored.responses);
  assert.deepEqual(reloaded.rebuttals, stored.rebuttals);
  assert.deepEqual(reloaded.consensus, stored.consensus);
  assert.deepEqual(reloaded.contentDraft, stored.contentDraft);
  assert.deepEqual(
    reloaded.responses.map((item) => item.discussionId),
    reloaded.responses.map(() => stored.discussion.id)
  );
  assert.deepEqual(
    reloaded.discussion.participants.map((item) => item.order),
    [...reloaded.discussion.participants].map((item) => item.order).sort((a, b) => a - b)
  );

  const generated = await repositories.discussionPersistence.listGeneratedDiscussionFlows();
  assert.ok(generated.some((item) => item.discussion.id === stored.discussion.id));

  assert.ok(stored.contentDraft);
  const reviewed = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: stored.contentDraft,
    status: HumanReviewStatus.Approved,
  });
  assert.equal(reviewed?.contentDraft?.status, HumanReviewStatus.Approved);
  assert.equal(reviewed?.discussion.status, HumanReviewStatus.Approved);
  assert.ok(reviewed && reviewed.updatedAt >= stored.updatedAt);

  const published = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: reviewed!.contentDraft!,
    status: HumanReviewStatus.Published,
  });
  assert.equal(published?.contentDraft?.status, HumanReviewStatus.Published);
  assert.equal(published?.discussion.status, HumanReviewStatus.Published);
  assert.ok(published?.discussion.publishedAt);

  const archived = await repositories.discussionPersistence.updateReviewStatus({
    discussionId: stored.discussion.id,
    contentDraft: published!.contentDraft!,
    status: HumanReviewStatus.Archived,
  });
  assert.equal(archived?.contentDraft?.status, HumanReviewStatus.Archived);
  assert.equal(archived?.discussion.status, HumanReviewStatus.Archived);
  assert.equal(
    await repositories.discussionPersistence.updateReviewStatus({
      discussionId: "missing-discussion",
      contentDraft: stored.contentDraft,
      status: HumanReviewStatus.Approved,
    }),
    null
  );

  const rollbackFlow = prepareDiscussionFlowForStorage(flow, true);
  rollbackFlow.sources = [{ ...sources[0], id: "missing-source-for-rollback" }];
  await assert.rejects(
    repositories.discussionPersistence.saveDiscussionFlow(rollbackFlow),
  );
  assert.equal(
    await repositories.discussionPersistence.getGeneratedDiscussionFlowById(
      rollbackFlow.discussion.id
    ),
    undefined
  );

  assert.equal(
    await repositories.discussionPersistence.deleteGeneratedDiscussion(stored.discussion.id),
    true
  );
  assert.equal(
    await repositories.discussionPersistence.getGeneratedDiscussionFlowById(stored.discussion.id),
    undefined
  );
  assert.equal(
    await repositories.discussionPersistence.deleteGeneratedDiscussion("missing-discussion"),
    false
  );
}
