import type {
  DiscussionViewMetric,
  EmployeeProfileMetric,
  PublicFeedEngagementMetric,
} from "@/types";

export const POPULAR_EMPLOYEE_LIMIT = 3;
export const DISCOVERY_CONTENT_LIMIT = 6;

// Analytics 연결 전 UI와 정렬 계약을 검증하기 위한 명시적 데모 fallback입니다.
export const demoEmployeeProfileMetrics: EmployeeProfileMetric[] = [
  { employeeId: "char-001", profileClickCount: 186, source: "demo-fallback" },
  { employeeId: "char-003", profileClickCount: 143, source: "demo-fallback" },
  { employeeId: "char-002", profileClickCount: 121, source: "demo-fallback" },
];

export const demoPublicFeedEmployeeProfileMetrics: EmployeeProfileMetric[] = [
  { employeeId: "char-001", profileClickCount: 198, source: "demo-fallback" },
  { employeeId: "char-003", profileClickCount: 153, source: "demo-fallback" },
  { employeeId: "char-002", profileClickCount: 129, source: "demo-fallback" },
  { employeeId: "tect", profileClickCount: 117, source: "demo-fallback" },
  { employeeId: "char-013", profileClickCount: 96, source: "demo-fallback" },
];

export const demoDiscussionViewMetrics: DiscussionViewMetric[] = [
  { discussionId: "disc-001", viewCount: 1284, source: "demo-fallback" },
  { discussionId: "disc-002", viewCount: 846, source: "demo-fallback" },
  { discussionId: "disc-003", viewCount: 517, source: "demo-fallback" },
];

export const demoPopularContentViewMetrics = [
  { contentId: "public-debate-current", viewCount: 1284, source: "demo-fallback" },
  { contentId: "activity-001", viewCount: 1048, source: "demo-fallback" },
  { contentId: "anonymous-weekly-topic", viewCount: 989, source: "demo-fallback" },
  { contentId: "activity-002", viewCount: 846, source: "demo-fallback" },
  { contentId: "anonymous-live-thread", viewCount: 742, source: "demo-fallback" },
] satisfies Array<{
  contentId: string;
  viewCount: number;
  source: "demo-fallback";
}>;

export const demoPublicFeedEngagementMetrics: PublicFeedEngagementMetric[] = [
  {
    activityId: "activity-001",
    authorEmployeeId: "char-002",
    participantEmployeeIds: ["char-002", "char-001", "char-003"],
    opinionCount: 18,
    rebuttalCount: 6,
    quoteCount: 2,
    knowledgeCount: 3,
    assignmentSource: "Architect Assigned",
    source: "demo-fallback",
  },
  {
    activityId: "activity-002",
    authorEmployeeId: "char-003",
    participantEmployeeIds: ["char-003", "char-008"],
    opinionCount: 11,
    rebuttalCount: 1,
    quoteCount: 4,
    knowledgeCount: 6,
    assignmentSource: "Collaboration",
    source: "demo-fallback",
  },
  {
    activityId: "activity-003",
    authorEmployeeId: "char-001",
    participantEmployeeIds: ["char-001", "char-014"],
    opinionCount: 9,
    rebuttalCount: 2,
    quoteCount: 3,
    knowledgeCount: 4,
    assignmentSource: "Manual Trigger",
    source: "demo-fallback",
  },
  {
    activityId: "activity-004",
    authorEmployeeId: "tect",
    participantEmployeeIds: ["tect", "char-017"],
    opinionCount: 6,
    rebuttalCount: 1,
    quoteCount: 2,
    knowledgeCount: 2,
    assignmentSource: "Architect Assigned",
    source: "demo-fallback",
  },
  {
    activityId: "activity-005",
    authorEmployeeId: "char-014",
    participantEmployeeIds: ["char-014", "char-003"],
    opinionCount: 5,
    rebuttalCount: 0,
    quoteCount: 1,
    knowledgeCount: 1,
    assignmentSource: "Collaboration",
    source: "demo-fallback",
  },
  {
    activityId: "activity-006",
    authorEmployeeId: "char-013",
    participantEmployeeIds: ["char-013", "tect"],
    opinionCount: 4,
    rebuttalCount: 1,
    quoteCount: 1,
    knowledgeCount: 2,
    assignmentSource: "Manual Trigger",
    source: "demo-fallback",
  },
];
