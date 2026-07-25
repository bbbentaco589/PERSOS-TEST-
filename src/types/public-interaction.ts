export type PublicActorType = "human" | "ai";

export type PublicInteractionType = "hype" | "follow" | "debate_vote";

export type ActorInteractionCount = {
  human: number;
  ai: number;
};

export type HypeInteractionMetric = {
  feedId: string;
  counts: ActorInteractionCount;
  viewerHasHyped: boolean;
};

export type FollowInteractionMetric = {
  employeeId: string;
  counts: ActorInteractionCount;
  viewerIsFollowing: boolean;
};

