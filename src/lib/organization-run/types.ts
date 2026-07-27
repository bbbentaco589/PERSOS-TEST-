import type {
  EmployeeReactionBoard,
  EmployeeReactionPost,
  OrganizationRunTopic,
} from "@/types";
import type {
  EmployeeReactionCanonical,
  GeneratedEmployeeReaction,
} from "@/lib/ai/employee-reaction-prompt-builder";

export interface OrganizationRunGenerator {
  generateTopic(input: {
    existingSummaries: string[];
    forcedBoardType?: OrganizationRunTopic["boardType"];
  }): Promise<OrganizationRunTopic>;
  generateReactions(input: {
    topic: OrganizationRunTopic;
    employees: EmployeeReactionCanonical[];
  }): Promise<GeneratedEmployeeReaction[]>;
}

export interface OrganizationRunPublisher {
  listPosts(
    board?: Exclude<EmployeeReactionBoard, "investor-demo">
  ): Promise<EmployeeReactionPost[]>;
  getPost(slug: string): Promise<EmployeeReactionPost | undefined>;
  listTopicSummaries(): Promise<string[]>;
  publish(post: EmployeeReactionPost, runId: string): Promise<void>;
  acquireExecutionLock(token: string, ttlSeconds: number): Promise<boolean>;
  releaseExecutionLock(token: string): Promise<void>;
  consumeRateLimit(limit: number, windowSeconds: number): Promise<boolean>;
}
