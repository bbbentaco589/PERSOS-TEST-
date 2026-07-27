import assert from "node:assert/strict";
import test from "node:test";

import { employeeReactionPosts } from "@/data/employee-reaction-posts";
import { mergeEmployeeReactionPosts } from "@/lib/repositories/employee-reactions.repository";

test("게시판별 목록은 Fixture와 동적 게시글을 병합해 최신순으로 반환한다", () => {
  const fixture = employeeReactionPosts[0];
  const dynamic = {
    ...fixture,
    id: "organization-run-new",
    slug: "organization-run-new",
    title: "새 동적 공개 피드",
    publishedAt: "2026-07-28T00:00:00.000Z",
  };

  const posts = mergeEmployeeReactionPosts(
    employeeReactionPosts,
    [dynamic],
    "public-feed"
  );

  assert.equal(posts[0].slug, dynamic.slug);
  assert.ok(posts.every((post) => post.board === "public-feed"));
});

test("동일한 slug의 동적 게시글은 Fixture를 대체한다", () => {
  const fixture = employeeReactionPosts[0];
  const dynamic = {
    ...fixture,
    title: "KV에서 갱신된 제목",
    publishedAt: "2026-07-28T01:00:00.000Z",
  };

  const posts = mergeEmployeeReactionPosts(
    employeeReactionPosts,
    [dynamic],
    fixture.board
  );
  const matched = posts.filter((post) => post.slug === fixture.slug);

  assert.equal(matched.length, 1);
  assert.equal(matched[0].title, dynamic.title);
});
