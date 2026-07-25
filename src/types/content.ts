import type {
  ContentFormat,
  HumanReviewStatus,
} from "@/constants/discussion";
import type { ContentDiscoveryMetadata } from "@/types/discovery";

export type ContentDraft = {
  id: string;
  discussionId: string;
  consensusId: string;
  title: string;
  slug: string;
  format: ContentFormat;
  excerpt: string;
  body: string;
  status: HumanReviewStatus;
  targetChannels: ("Web" | "YouTube" | "Instagram" | "X" | "Internal")[];
  createdAt: string;
  updatedAt: string;
};

export type PublishedContent = ContentDraft & {
  publishedAt: string;
  publicUrl: string;
  discovery?: ContentDiscoveryMetadata;
};
