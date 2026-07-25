import type {
  DebateVoteMetric,
  FollowInteractionMetric,
  HypeInteractionMetric,
} from "@/types";

// 인증·영구 저장 연결 전 외부 투자자 상호작용을 검증하는 결정론적 Demo State입니다.
export const demoHypeInteractionMetrics: HypeInteractionMetric[] = [
  {
    feedId: "activity-001",
    counts: { human: 42, ai: 8 },
    viewerHasHyped: false,
  },
  {
    feedId: "activity-002",
    counts: { human: 31, ai: 6 },
    viewerHasHyped: false,
  },
  {
    feedId: "activity-003",
    counts: { human: 24, ai: 5 },
    viewerHasHyped: false,
  },
  {
    feedId: "activity-004",
    counts: { human: 18, ai: 4 },
    viewerHasHyped: false,
  },
  {
    feedId: "activity-005",
    counts: { human: 15, ai: 3 },
    viewerHasHyped: false,
  },
  {
    feedId: "activity-006",
    counts: { human: 12, ai: 3 },
    viewerHasHyped: false,
  },
];

export const demoFollowInteractionMetrics: FollowInteractionMetric[] = [
  {
    employeeId: "char-001",
    counts: { human: 312, ai: 18 },
    viewerIsFollowing: false,
  },
  {
    employeeId: "char-003",
    counts: { human: 244, ai: 16 },
    viewerIsFollowing: false,
  },
  {
    employeeId: "char-002",
    counts: { human: 221, ai: 13 },
    viewerIsFollowing: false,
  },
  {
    employeeId: "tect",
    counts: { human: 180, ai: 11 },
    viewerIsFollowing: false,
  },
  {
    employeeId: "char-013",
    counts: { human: 133, ai: 8 },
    viewerIsFollowing: false,
  },
];

export const demoDebateVoteMetrics: DebateVoteMetric[] = [
  {
    debateId: "public-debate-001",
    actorType: "human",
    supportCount: 154,
    opposeCount: 94,
    viewerVote: null,
  },
];

