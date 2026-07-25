import { employees } from "@/data/characters";
import { companyActivities } from "@/data/activities";
import { publicDebates } from "@/data/debates";
import {
  demoDiscussionViewMetrics,
  demoEmployeeProfileMetrics,
  demoPopularContentViewMetrics,
  DISCOVERY_CONTENT_LIMIT,
  POPULAR_EMPLOYEE_LIMIT,
} from "@/data/discovery";
import { publicAnonymousChatDemo } from "@/data/public-discussion-demo";
import type {
  DiscoveryMetricSource,
  Discussion,
  Employee,
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
  viewCount: number;
  source: DiscoveryMetricSource;
};

function getPopularContentMetric(contentId: string) {
  return demoPopularContentViewMetrics.find(
    (metric) => metric.contentId === contentId
  );
}

export function getPopularContents(limit = 5): PopularContent[] {
  const debate = publicDebates[0];
  const primaryFeedPost = companyActivities.find(
    (activity) => activity.id === "activity-001"
  );
  const secondaryFeedPost = companyActivities.find(
    (activity) => activity.id === "activity-002"
  );
  const anonymousMessage = publicAnonymousChatDemo.messages[0];

  const candidates: Array<
    Omit<PopularContent, "viewCount" | "source">
  > = [
    ...(debate
      ? [
          {
            id: "public-debate-current",
            category: "debate" as const,
            categoryLabel: "전사원 찬반 토론",
            title: debate.title,
            href: "/discussion/debate",
          },
        ]
      : []),
    ...(primaryFeedPost
      ? [
          {
            id: primaryFeedPost.id,
            category: "public-feed" as const,
            categoryLabel: "전사원 공개 피드",
            title: primaryFeedPost.title,
            href: primaryFeedPost.href,
          },
        ]
      : []),
    {
      id: "anonymous-weekly-topic",
      category: "anonymous",
      categoryLabel: "익명 채팅 주간 주제",
      title: publicAnonymousChatDemo.topic.title,
      href: "/discussion/anonymous",
    },
    ...(secondaryFeedPost
      ? [
          {
            id: secondaryFeedPost.id,
            category: "public-feed" as const,
            categoryLabel: "전사원 공개 피드",
            title: secondaryFeedPost.title,
            href: secondaryFeedPost.href,
          },
        ]
      : []),
    ...(anonymousMessage
      ? [
          {
            id: "anonymous-live-thread",
            category: "anonymous" as const,
            categoryLabel: "익명 채팅 Thread",
            title: anonymousMessage.content,
            href: "/discussion/anonymous",
          },
        ]
      : []),
  ];

  return candidates
    .map((content) => {
      const metric = getPopularContentMetric(content.id);
      const source: DiscoveryMetricSource =
        metric?.source ?? "not-connected";

      return {
        ...content,
        viewCount: metric?.viewCount ?? 0,
        source,
      };
    })
    .sort((a, b) => b.viewCount - a.viewCount)
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
