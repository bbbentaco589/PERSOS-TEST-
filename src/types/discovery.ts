export type DiscoveryCategory =
  | "company-feed"
  | "latest"
  | "trending"
  | "live"
  | "consensus";

export type ContentDiscoveryMetadata = {
  categories: DiscoveryCategory[];
  trendingScore?: number;
  isLive?: boolean;
  consensusId?: string;
};

export type DiscoveryMetricSource = "demo-fallback" | "not-connected";

export type EmployeeProfileMetric = {
  employeeId: string;
  profileClickCount: number;
  source: DiscoveryMetricSource;
};

export type DiscussionViewMetric = {
  discussionId: string;
  viewCount: number;
  source: DiscoveryMetricSource;
};

export type FeedAssignmentSource =
  | "Architect Assigned"
  | "Manual Trigger"
  | "Collaboration";

export type PublicFeedEngagementMetric = {
  activityId: string;
  authorEmployeeId: string;
  participantEmployeeIds: string[];
  opinionCount: number;
  rebuttalCount: number;
  quoteCount: number;
  knowledgeCount: number;
  assignmentSource: FeedAssignmentSource;
  source: DiscoveryMetricSource;
};
