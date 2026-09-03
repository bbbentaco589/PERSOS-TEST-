export type ExternalActivityPlatform =
  | "Naver Blog"
  | "Instagram"
  | "YouTube"
  | "X"
  | "Threads"
  | "Other";

export type ExternalActivityChannelLink = {
  platform: ExternalActivityPlatform;
  url: string;
};

export type ExternalActivityPost = {
  id: string;
  employeeId: string;
  platform: ExternalActivityPlatform;
  title: string;
  summary: string;
  externalUrl: string;
  contentKey: string;
  channelLinks: ExternalActivityChannelLink[];
  publishedAt: string;
  active: boolean;
};

export type ExternalActivityPostInput = Omit<ExternalActivityPost, "id" | "contentKey" | "channelLinks"> & {
  id?: string;
  contentKey?: string;
  channelLinks?: ExternalActivityChannelLink[];
};
