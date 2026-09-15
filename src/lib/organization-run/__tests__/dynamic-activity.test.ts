import assert from "node:assert/strict";
import test from "node:test";
import { anonymousRunsForDate, anonymousSlotEnabled } from "../anonymous-schedule";
import { releaseReactionStage, splitInitialReactions } from "../staged-reactions";
import type { EmployeeReactionPost } from "@/types";

test("anonymous schedule is stable across cron invocations and never exceeds four slots", () => {
  const dates = Array.from({ length: 60 }, (_, index) => `2026-09-${String(index + 1).padStart(2, "0")}`);
  const choices = dates.map((date) => anonymousRunsForDate(date, "scheduler-secret"));
  assert.ok(choices.every((choice) => choice >= 1 && choice <= 4));
  assert.ok(new Set(choices).size > 1);
  for (const date of dates) {
    assert.equal(anonymousRunsForDate(date, "scheduler-secret"), anonymousRunsForDate(date, "scheduler-secret"));
    assert.equal(anonymousSlotEnabled(date, "scheduler-secret", 1), true);
    assert.equal(anonymousSlotEnabled(date, "scheduler-secret", 5), false);
  }
});

test("missed first release is recovered by the second stage without duplicate comments", () => {
  const post = {
    id: "p",
    board: "debate",
    boardLabel: "찬반 토론",
    slug: "sample",
    title: "샘플 안건",
    summary: "샘플 요약",
    body: "샘플 본문",
    publishedAt: "2026-09-15T05:00:00.000Z",
    reactions: [1, 2, 3].map((index) => ({ id: `r${index}`, postId: "p", employeeId: `e${index}`, stance: "찬성" as const, coreOpinion: "내용", concerns: "우려", suggestion: "제안", createdAt: "2026-09-15T05:00:00.000Z" })),
    replies: [],
  } satisfies EmployeeReactionPost;
  const { initial, pending } = splitInitialReactions(post);
  assert.equal(initial.reactions.length, 1);
  assert.ok(pending);
  const caughtUp = releaseReactionStage(initial, pending!, 2, "2026-09-15T14:00:00.000Z");
  assert.equal(caughtUp.post.reactions.length, 3);
  assert.equal(caughtUp.pending, undefined);
  assert.equal(new Set(caughtUp.post.reactions.map((reaction) => reaction.id)).size, 3);
});
