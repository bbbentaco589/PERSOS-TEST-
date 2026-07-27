import type { EmployeeReactionPost } from "./employee-reaction";

export type OrganizationRunBoardType = "public" | "debate" | "anonymous";

export type OrganizationRunTopic = {
  boardType: OrganizationRunBoardType;
  title: string;
  body: string;
  topicSummary: string;
  reasonForBoardSelection: string;
  relevantEmployeeIds: string[];
};

export type OrganizationRunStage =
  | "idle"
  | "topic"
  | "board"
  | "employees"
  | "reactions"
  | "validation"
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
  publicUrl: string;
  geminiCallCount: number;
  post: EmployeeReactionPost;
};

export type OrganizationRunFailure = {
  status: "failed";
  stage: Exclude<OrganizationRunStage, "idle" | "completed">;
  message: string;
  retryable: boolean;
};
