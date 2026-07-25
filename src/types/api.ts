import type { DiscussionMode, HumanReviewStatus } from "@/constants/discussion";
import type {
  AIResponse,
  Character,
  Consensus,
  ContentDraft,
  CrossRebuttal,
  Discussion,
  Source,
  Topic,
} from "@/types";

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export type DiscussionEngineFlowPayload = {
  topicId: string;
  discussion: Discussion;
  sources: Source[];
  responses: AIResponse[];
  rebuttals: CrossRebuttal[];
  consensus: Consensus | null;
  contentDraft: ContentDraft | null;
};

export type StoredDiscussionFlow = DiscussionEngineFlowPayload & {
  topic: Topic;
  characters: Character[];
  isGenerated: true;
  createdAt: string;
  updatedAt: string;
};

export type CreateDiscussionRequest = {
  topicId: string;
  participantIds?: string[];
  mode?: DiscussionMode;
};

export type CreateDiscussionResponse = DiscussionEngineFlowPayload;

export type GenerateDiscussionStep =
  | "full"
  | "responses"
  | "rebuttals"
  | "consensus"
  | "content-draft";

export type GenerateDiscussionFlowRequest = {
  step: GenerateDiscussionStep;
  topicId?: string;
  participantIds?: string[];
  mode?: DiscussionMode;
  discussion?: Discussion;
  responses?: AIResponse[];
  rebuttals?: CrossRebuttal[];
  consensus?: Consensus;
};

export type GenerateDiscussionFlowResponse = DiscussionEngineFlowPayload;

export type GetDiscussionsResponse = {
  discussions: Discussion[];
  generatedDiscussionIds: string[];
};

export type GetDiscussionResponse = DiscussionEngineFlowPayload | StoredDiscussionFlow;

export type UpdateReviewStatusRequest = {
  contentDraft: ContentDraft;
  status: HumanReviewStatus;
};

export type UpdateReviewStatusResponse = {
  contentDraft: ContentDraft;
};
