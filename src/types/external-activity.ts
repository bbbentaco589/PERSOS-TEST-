export type ExternalActivityPlatform =
  | "Naver Blog"
  | "Instagram"
  | "YouTube"
  | "X"
  | "Other";

export type ExternalActivityPost = {
  id: string;
  employeeId: string;
  platform: ExternalActivityPlatform;
  title: string;
  summary: string;
  externalUrl: string;
  publishedAt: string;
  active: boolean;
};

export type ExternalActivityPostInput = Omit<ExternalActivityPost, "id"> & {
  id?: string;
};
