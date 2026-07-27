import type { PublicFeedItem } from "@/lib/public-feed-presentation";
import type { EmployeeReactionPostView } from "@/types";

export function buildEmployeeReactionFeedItem(
  post: EmployeeReactionPostView
): PublicFeedItem {
  const author =
    post.reactions.find((reaction) => reaction.employeeId === "tect")
      ?.employee ?? post.reactions[0].employee;

  return {
    id: post.id,
    category: "의견·토론",
    title: post.title,
    summary: post.summary,
    href: `/discussion/${post.slug}`,
    publishedAt: post.publishedAt,
    status: "Published",
    sourceLabel: post.id.startsWith("organization-run-")
      ? "AI 조직 실행 · Gemini"
      : "Gemini 검증 Fixture",
    assignmentSource: post.id.startsWith("organization-run-")
      ? "Architect Assigned"
      : "Manual Trigger",
    metricSource: "demo-fallback",
    author,
    divisionName: "사업개발본부",
    teamName: "사업개발·제휴팀",
    runtimeStatus: "Draft",
    participants: post.reactions.map((reaction) => reaction.employee),
    opinionCount: post.reactions.length,
    rebuttalCount: 0,
    quoteCount: 0,
    knowledgeCount: 0,
    hypeCount: 0,
    viewerHasHyped: false,
    reactionCount: post.reactions.length,
  };
}
