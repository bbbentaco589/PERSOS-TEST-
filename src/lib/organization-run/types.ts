import type {
  EmployeeReactionBoard,
  EmployeeReactionPost,
  OrganizationRunReviewItem,
  OrganizationRunReviewStatus,
  OrganizationRunTopic,
} from "@/types";
import type {
  EmployeeReactionCanonical,
  GeneratedEmployeeReply,
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
  generateAuthorReplies?(input: {
    topic: OrganizationRunTopic;
    author: EmployeeReactionCanonical;
    authorOpinion: GeneratedEmployeeReaction;
    comments: Array<{
      commenter: EmployeeReactionCanonical;
      comment: GeneratedEmployeeReaction;
    }>;
  }): Promise<GeneratedEmployeeReply[]>;
}

export interface OrganizationRunPublisher {
  listPosts(
    board?: Exclude<EmployeeReactionBoard, "investor-demo">
  ): Promise<EmployeeReactionPost[]>;
  listPostsByEmployeeId?(employeeId: string): Promise<EmployeeReactionPost[]>;
  getPost(slug: string): Promise<EmployeeReactionPost | undefined>;
  listTopicSummaries(): Promise<string[]>;
  publish(post: EmployeeReactionPost, runId: string): Promise<void>;
  listReviewItems(
    status?: OrganizationRunReviewStatus
  ): Promise<OrganizationRunReviewItem[]>;
  getReviewItem(id: string): Promise<OrganizationRunReviewItem | undefined>;
  saveReviewItem(item: OrganizationRunReviewItem): Promise<void>;
  updateReviewItem(item: OrganizationRunReviewItem): Promise<void>;
  acquireExecutionLock(token: string, ttlSeconds: number): Promise<boolean>;
  releaseExecutionLock(token: string): Promise<void>;
  consumeRateLimit(limit: number, windowSeconds: number): Promise<boolean>;
  getCharacterMemoryContexts?(employeeIds: readonly string[]): Promise<Record<string, NonNullable<EmployeeReactionCanonical["activityMemory"]>>>;
}
