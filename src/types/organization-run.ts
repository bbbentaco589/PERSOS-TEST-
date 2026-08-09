import type { EmployeeReactionPost } from "./employee-reaction";

export type OrganizationRunBoardType = "public" | "debate" | "anonymous";

export type OrganizationRunTopic = {
  boardType: OrganizationRunBoardType;
  title: string;
  body: string;
  imageUrl?: string;
  topicSummary: string;
  reasonForBoardSelection: string;
  relevantEmployeeIds: string[];
  sourceUrls?: string[];
};

export type ManualOrganizationRunInput = {
  boardType: OrganizationRunBoardType;
  title: string;
  body: string;
  imageUrl?: string;
  employeeIds: string[];
  publish: boolean;
};

export type OrganizationRunStage =
  | "idle"
  | "topic"
  | "board"
  | "employees"
  | "reactions"
  | "validation"
  | "review"
  | "publishing"
  | "completed"
  | "failed";

export type OrganizationRunResult = {
  runId: string;
  status: "completed";
  stage: "completed";
  boardType: OrganizationRunBoardType;
  title: string;
  participantIds: string[];
  publicUrl?: string;
  geminiCallCount: number;
  post: EmployeeReactionPost;
  published: boolean;
  reviewPending: boolean;
  reviewItemId?: string;
};

export type OrganizationRunFailure = {
  status: "failed";
  stage: Exclude<OrganizationRunStage, "idle" | "completed">;
  message: string;
  retryable: boolean;
};

export type ManualOrganizationRunResult = OrganizationRunResult;

export type OrganizationRunReviewStatus =
  | "review_pending"
  | "approved"
  | "discarded";

export type OrganizationRunRiskLevel = "low" | "medium" | "high";

export type OrganizationRunReviewItem = {
  id: string;
  runId: string;
  status: OrganizationRunReviewStatus;
  boardType: OrganizationRunBoardType;
  title: string;
  post?: EmployeeReactionPost;
  reasons: string[];
  riskLevel: OrganizationRunRiskLevel;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
};
