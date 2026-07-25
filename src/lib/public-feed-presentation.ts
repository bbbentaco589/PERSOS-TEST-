import {
  companyActivities,
  demoFollowInteractionMetrics,
  demoHypeInteractionMetrics,
  demoPublicFeedEmployeeProfileMetrics,
  demoPublicFeedEngagementMetrics,
  divisions,
  employees,
  knowledgeEntries,
  teams,
} from "@/data";
import { isPublicCharacter } from "@/lib/character-runtime-policy";
import type {
  CompanyActivity,
  Discussion,
  DiscoveryMetricSource,
  Employee,
  FeedAssignmentSource,
  LiveDemoGeneratedContent,
} from "@/types";

export type PublicFeedCategory =
  | "전체"
  | "업무"
  | "의견·토론"
  | "콘텐츠"
  | "Knowledge";

export type PublicFeedItem = {
  id: string;
  category: Exclude<PublicFeedCategory, "전체">;
  title: string;
  summary: string;
  href: string;
  publishedAt: string;
  status: "Published" | "Preview";
  sourceLabel: string;
  assignmentSource: FeedAssignmentSource;
  metricSource: DiscoveryMetricSource;
  author: Employee;
  divisionName: string;
  teamName: string;
  runtimeStatus: "Approved" | "Rough" | "Draft";
  participants: Employee[];
  opinionCount: number;
  rebuttalCount: number;
  quoteCount: number;
  knowledgeCount: number;
  hypeCount: number;
  viewerHasHyped: boolean;
  reactionCount: number;
};

export type PopularEmployeeProfile = {
  employee: Employee;
  divisionName: string;
  teamName: string;
  profileViewCount: number;
  followerCount: number;
  viewerIsFollowing: boolean;
  metricSource: DiscoveryMetricSource;
  feedCount: number;
  receivedHypeCount: number;
  knowledgeContributionCount: number;
  latestActivityAt?: string;
  recentActivities: Array<Pick<PublicFeedItem, "id" | "title" | "href">>;
  relatedKnowledge: Array<{ id: string; title: string; href: string }>;
};

function getCategory(type: CompanyActivity["type"]): PublicFeedItem["category"] {
  if (type === "Discussion") return "의견·토론";
  if (type === "Knowledge") return "Knowledge";
  if (type === "Content" || type === "Media") return "콘텐츠";
  return "업무";
}

function getRuntimeStatus(employee: Employee): PublicFeedItem["runtimeStatus"] {
  if (employee.profileStage === "Approved") return "Approved";
  if (employee.slug === "tect") return "Draft";
  return "Rough";
}

function getOrganization(employee: Employee) {
  return {
    divisionName:
      divisions.find((division) => division.id === employee.divisionId)?.nameKo ??
      "소속 사업부 준비 중",
    teamName:
      teams.find((team) => team.id === employee.teamId)?.nameKo ??
      "소속 팀 준비 중",
  };
}

function createActivityItem(activity: CompanyActivity): PublicFeedItem | null {
  const metric = demoPublicFeedEngagementMetrics.find(
    (item) => item.activityId === activity.id
  );
  const author = employees.find(
    (employee) =>
      employee.id === (metric?.authorEmployeeId ?? activity.employeeId) &&
      isPublicCharacter(employee)
  );
  if (!author || activity.status === "Draft") return null;

  const participants = (metric?.participantEmployeeIds ?? [author.id])
    .map((employeeId) =>
      employees.find(
        (employee) =>
          employee.id === employeeId && isPublicCharacter(employee)
      )
    )
    .filter((employee): employee is Employee => Boolean(employee));
  const opinionCount = metric?.opinionCount ?? 0;
  const rebuttalCount = metric?.rebuttalCount ?? 0;
  const quoteCount = metric?.quoteCount ?? 0;
  const knowledgeCount = metric?.knowledgeCount ?? 0;
  const hypeMetric = demoHypeInteractionMetrics.find(
    (item) => item.feedId === activity.id
  );
  const hypeCount = hypeMetric
    ? hypeMetric.counts.human + hypeMetric.counts.ai
    : 0;
  const isAccessPolicyNotice = activity.id === "activity-006";

  return {
    id: activity.id,
    category: getCategory(activity.type),
    title: isAccessPolicyNotice
      ? "Public Intranet 외부 투자자 접근 안내"
      : activity.title,
    summary: isAccessPolicyNotice
      ? "외부 투자자는 공개 콘텐츠를 확인하고 Hype·Follow·찬반 투표로 관심을 표현할 수 있습니다. 콘텐츠 작성·자유 댓글·업무 지시·Admin 접근은 지원하지 않습니다."
      : activity.summary,
    href: activity.href,
    publishedAt: activity.publishedAt,
    status: activity.status,
    sourceLabel: activity.sourceLabel,
    assignmentSource: metric?.assignmentSource ?? "Manual Trigger",
    metricSource: metric?.source ?? "not-connected",
    author,
    ...getOrganization(author),
    runtimeStatus: getRuntimeStatus(author),
    participants,
    opinionCount,
    rebuttalCount,
    quoteCount,
    knowledgeCount,
    hypeCount,
    viewerHasHyped: hypeMetric?.viewerHasHyped ?? false,
    reactionCount:
      opinionCount + rebuttalCount + quoteCount + knowledgeCount + hypeCount,
  };
}

function createDiscussionItem(
  discussion: Discussion
): PublicFeedItem | null {
  const author = employees.find(
    (employee) =>
      employee.id === discussion.participants[0]?.characterId &&
      isPublicCharacter(employee)
  );
  if (!author) return null;

  const participants = discussion.participants
    .map((participant) =>
      employees.find(
        (employee) =>
          employee.id === participant.characterId &&
          isPublicCharacter(employee)
      )
    )
    .filter((employee): employee is Employee => Boolean(employee));
  const opinionCount = discussion.responseIds.length;
  const rebuttalCount = discussion.crossRebuttalIds.length;

  return {
    id: `discussion-${discussion.id}`,
    category: "의견·토론",
    title: discussion.title,
    summary: discussion.summary,
    href: `/discussion/${discussion.slug}`,
    publishedAt: discussion.publishedAt ?? discussion.createdAt,
    status: "Published",
    sourceLabel: "사람 검토 완료",
    assignmentSource: "Architect Assigned",
    metricSource: "not-connected",
    author,
    ...getOrganization(author),
    runtimeStatus: getRuntimeStatus(author),
    participants,
    opinionCount,
    rebuttalCount,
    quoteCount: 0,
    knowledgeCount: 0,
    hypeCount: 0,
    viewerHasHyped: false,
    reactionCount: opinionCount + rebuttalCount,
  };
}

function createLiveDemoFeedItem(
  content: LiveDemoGeneratedContent
): PublicFeedItem | null {
  if (content.contentType !== "feed" || content.status !== "published") {
    return null;
  }
  const author = employees.find(
    (employee) =>
      employee.id === content.personaId && isPublicCharacter(employee)
  );
  if (!author) return null;

  const activityType = content.activityType ?? "";
  const category: PublicFeedItem["category"] =
    activityType === "Knowledge"
      ? "Knowledge"
      : activityType === "의견"
        ? "의견·토론"
        : activityType === "Insight"
          ? "콘텐츠"
          : "업무";

  return {
    id: content.id,
    category,
    title: content.title,
    summary: content.publicBody,
    href: "/discussion/public",
    publishedAt: content.publishedAt ?? content.createdAt,
    status: "Published",
    sourceLabel: "Automated QA · Gemini Live Demo",
    assignmentSource: "Architect Assigned",
    metricSource: "not-connected",
    author,
    ...getOrganization(author),
    runtimeStatus: getRuntimeStatus(author),
    participants: [author],
    opinionCount: 0,
    rebuttalCount: 0,
    quoteCount: 0,
    knowledgeCount: category === "Knowledge" ? 1 : 0,
    hypeCount: 0,
    viewerHasHyped: false,
    reactionCount: category === "Knowledge" ? 1 : 0,
  };
}

export function buildPublicFeedItems(
  publishedDiscussions: Discussion[],
  liveDemoContents: LiveDemoGeneratedContent[] = []
): PublicFeedItem[] {
  const activityItems = companyActivities
    .map(createActivityItem)
    .filter((item): item is PublicFeedItem => Boolean(item));
  const representedHrefs = new Set(activityItems.map((item) => item.href));
  const discussionItems = publishedDiscussions
    .map(createDiscussionItem)
    .filter((item): item is PublicFeedItem => Boolean(item))
    .filter((item) => !representedHrefs.has(item.href));
  const liveDemoItems = liveDemoContents
    .map(createLiveDemoFeedItem)
    .filter((item): item is PublicFeedItem => Boolean(item));

  return [...liveDemoItems, ...activityItems, ...discussionItems].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function buildPopularEmployeeProfiles(
  feedItems: PublicFeedItem[],
  limit = 5
): PopularEmployeeProfile[] {
  return employees
    .filter(isPublicCharacter)
    .map((employee) => {
      const metric = demoPublicFeedEmployeeProfileMetrics.find(
        (item) => item.employeeId === employee.id
      );
      const followMetric = demoFollowInteractionMetrics.find(
        (item) => item.employeeId === employee.id
      );
      const authoredItems = feedItems.filter(
        (item) => item.author.id === employee.id
      );
      const relatedItems = feedItems.filter(
        (item) =>
          item.author.id === employee.id ||
          item.participants.some(
            (participant) => participant.id === employee.id
          )
      );
      const relatedKnowledge = knowledgeEntries
        .filter((entry) => entry.relatedEmployeeIds.includes(employee.id))
        .slice(0, 3)
        .map((entry) => ({
          id: entry.id,
          title: entry.title,
          href: `/knowledge/${entry.slug}`,
        }));

      return {
        employee,
        ...getOrganization(employee),
        profileViewCount: metric?.profileClickCount ?? 0,
        followerCount: followMetric
          ? followMetric.counts.human + followMetric.counts.ai
          : 0,
        viewerIsFollowing: followMetric?.viewerIsFollowing ?? false,
        metricSource: metric?.source ?? "not-connected",
        feedCount: authoredItems.length,
        receivedHypeCount: authoredItems.reduce(
          (total, item) => total + item.hypeCount,
          0
        ),
        knowledgeContributionCount: relatedKnowledge.length,
        latestActivityAt: relatedItems[0]?.publishedAt,
        recentActivities: relatedItems.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.title,
          href: item.href,
        })),
        relatedKnowledge,
      };
    })
    .sort((a, b) => {
      if (b.profileViewCount !== a.profileViewCount) {
        return b.profileViewCount - a.profileViewCount;
      }
      if (b.followerCount !== a.followerCount) {
        return b.followerCount - a.followerCount;
      }
      if (b.latestActivityAt !== a.latestActivityAt) {
        return (b.latestActivityAt ?? "").localeCompare(
          a.latestActivityAt ?? ""
        );
      }
      return b.employee.id.localeCompare(a.employee.id);
    })
    .slice(0, limit);
}

export function getPublicFeedEngagementScore(item: PublicFeedItem) {
  return (
    item.hypeCount +
    item.opinionCount +
    item.rebuttalCount +
    item.quoteCount +
    item.knowledgeCount
  );
}
