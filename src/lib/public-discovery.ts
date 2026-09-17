import { employees } from "@/data/characters";
import {
  demoDiscussionViewMetrics,
  demoEmployeeProfileMetrics,
  DISCOVERY_CONTENT_LIMIT,
  POPULAR_EMPLOYEE_LIMIT,
} from "@/data/discovery";
import type {
  DiscoveryMetricSource,
  Discussion,
  Employee,
  EmployeeReactionPost,
} from "@/types";
import { isPublicActiveCharacter } from "@/lib/character-runtime-policy";

export type PopularEmployee = {
  employee: Employee;
  profileClickCount: number;
  source: DiscoveryMetricSource;
};

export type RankedDiscussion = {
  discussion: Discussion;
  viewCount: number;
  source: DiscoveryMetricSource;
};

export type PopularContentCategory = "debate" | "public-feed" | "anonymous";

export type PopularContent = {
  id: string;
  category: PopularContentCategory;
  categoryLabel: string;
  title: string;
  href: string;
  commentCount: number;
  publishedAt: string;
};

const POPULAR_CONTENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

function countVisibleAIComments(post: EmployeeReactionPost) {
  if (post.board === "anonymous" && post.anonymousTurns?.length) {
    return post.anonymousTurns.length;
  }
  return post.reactions.length + (post.replies?.length ?? 0);
}

export function rankPopularContentsByAIComments(
  posts: EmployeeReactionPost[],
  limit = 5,
  now = new Date()
): PopularContent[] {
  const cutoff = now.getTime() - POPULAR_CONTENT_WINDOW_MS;

  return posts
    .filter((post) => new Date(post.publishedAt).getTime() >= cutoff)
    .map((post) => ({
      id: post.id,
      category: post.board,
      categoryLabel: post.boardLabel,
      title: post.title,
      href: `/discussion/${post.slug}`,
      commentCount: countVisibleAIComments(post),
      publishedAt: post.publishedAt,
    }))
    .filter((content) => content.commentCount > 0)
    .sort(
      (left, right) =>
        right.commentCount - left.commentCount ||
        new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime() ||
        left.id.localeCompare(right.id)
    )
    .slice(0, limit);
}

export function getPopularEmployees(
  limit = POPULAR_EMPLOYEE_LIMIT
): PopularEmployee[] {
  return employees
    .filter(isPublicActiveCharacter)
    .map((employee) => {
      const metric = demoEmployeeProfileMetrics.find(
        (item) => item.employeeId === employee.id
      );

      return {
        employee,
        profileClickCount: metric?.profileClickCount ?? 0,
        source: metric?.source ?? "not-connected",
      };
    })
    .sort((a, b) => b.profileClickCount - a.profileClickCount)
    .slice(0, limit);
}

export function rankDiscussionsByViews(
  discussions: Discussion[],
  limit = DISCOVERY_CONTENT_LIMIT
): RankedDiscussion[] {
  return discussions
    .map((discussion) => {
      const metric = demoDiscussionViewMetrics.find(
        (item) => item.discussionId === discussion.id
      );

      return {
        discussion,
        viewCount: metric?.viewCount ?? 0,
        source: metric?.source ?? "not-connected",
      };
    })
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function sortDiscussionsByLatest(
  discussions: Discussion[],
  limit = DISCOVERY_CONTENT_LIMIT
) {
  return [...discussions]
    .sort((a, b) =>
      (b.publishedAt ?? b.createdAt).localeCompare(
        a.publishedAt ?? a.createdAt
      )
    )
    .slice(0, limit);
}
