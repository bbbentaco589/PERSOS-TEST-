import type {
  ComplianceCategory,
  DiscussionMode,
  DiscussionStatus,
  ResponseRound,
  RiskLevel,
} from "@/constants/discussion";
import type { CharacterId, DepartmentId } from "@/types/organization";

export type Topic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sourceHint: string;
  status: "Queued" | "In Discussion" | "Ready for Review";
  priority: "Low" | "Medium" | "High";
  riskLevel: RiskLevel;
  complianceCategories: ComplianceCategory[];
  createdAt: string;
};

export type DiscussionParticipant = {
  characterId: CharacterId;
  departmentId: DepartmentId;
  role: "Lead" | "Reviewer" | "Challenger" | "Moderator";
  order: number;
};

export type AIResponse = {
  id: string;
  discussionId: string;
  characterId: CharacterId;
  round: ResponseRound;
  stance: string;
  content: string;
  confidence: "Low" | "Medium" | "High";
  sourceIds: string[];
  createdAt: string;
};

export type CrossRebuttal = {
  id: string;
  discussionId: string;
  fromCharacterId: CharacterId;
  targetResponseId: string;
  content: string;
  createdAt: string;
};

export type Consensus = {
  id: string;
  discussionId: string;
  summary: string;
  keyAgreements: string[];
  openQuestions: string[];
  disagreements: string[];
  confidence: "Low" | "Medium" | "High";
  riskLevel: RiskLevel;
  sourceIds: string[];
  createdAt: string;
};

export type Discussion = {
  id: string;
  slug: string;
  topicId: string;
  title: string;
  kicker: string;
  summary: string;
  status: DiscussionStatus;
  mode: DiscussionMode;
  departmentIds: DepartmentId[];
  participants: DiscussionParticipant[];
  sourceIds: string[];
  responseIds: string[];
  crossRebuttalIds: string[];
  consensusId?: string;
  humanReviewId?: string;
  readingTime: string;
  publishedAt?: string;
  createdAt: string;
};

export type DiscussionArticle = Discussion;
