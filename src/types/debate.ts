import type { EmployeeId } from "./organization";
import type { PublicActorType } from "./public-interaction";

export type DebateSide = "support" | "oppose";
export type PublicDebateStatus = "Open" | "Closed";

export type PublicDebateParticipant = {
  employeeId: EmployeeId;
  side: DebateSide;
};

export type PublicDebateStatement = {
  id: string;
  employeeId: EmployeeId;
  side: DebateSide;
  content: string;
  createdAt: string;
  reactionCount: number;
  replyToStatementId?: string;
  replyToEmployeeId?: EmployeeId;
};

export type PublicDebate = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  keyPoints: string[];
  proposer: string;
  proposedAt: string;
  status: PublicDebateStatus;
  participants: PublicDebateParticipant[];
  statements: PublicDebateStatement[];
};

export type DebateVoteMetric = {
  debateId: string;
  actorType: Extract<PublicActorType, "human">;
  supportCount: number;
  opposeCount: number;
  viewerVote: DebateSide | null;
};
