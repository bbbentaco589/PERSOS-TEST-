import type { PublicFeedItem } from "@/lib/public-feed-presentation";
import type { EmployeeReactionPostView } from "@/types";
import { divisions, teams } from "@/data";

export function buildEmployeeReactionFeedItem(
  post: EmployeeReactionPostView
): PublicFeedItem {
  const author =
    post.author ??
    post.reactions.find((reaction) => reaction.employeeId === "tect")
      ?.employee ??
    post.reactions[0]?.employee;
  if (!author) {
    throw new Error(`${post.id} 게시자의 Character Canonical을 찾지 못했습니다.`);
  }
  const divisionName =
    divisions.find((division) => division.id === author.divisionId)?.nameKo ??
    author.divisionId;
  const teamName =
    teams.find((team) => team.id === author.teamId)?.nameKo ?? author.teamId;

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
    divisionName,
    teamName,
    runtimeStatus: "Draft",
    participants: [
      author,
      ...post.reactions
        .map((reaction) => reaction.employee)
        .filter((employee) => employee.id !== author.id),
    ],
    opinionCount: post.reactions.length,
    rebuttalCount: 0,
    quoteCount: 0,
    knowledgeCount: 0,
    hypeCount: 0,
    viewerHasHyped: false,
    reactionCount: post.reactions.length,
  };
}
