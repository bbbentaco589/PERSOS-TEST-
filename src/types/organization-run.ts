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

export type ManualOrganizationRunResult = Omit<
  OrganizationRunResult,
  "publicUrl"
> & {
  published: boolean;
  publicUrl?: string;
};
