export type LobbyEventBanner = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  callToActionLabel?: string;
  callToActionHref?: string;
  publishedAt: string;
  active: boolean;
};

export type LobbyEventBannerInput = Omit<LobbyEventBanner, "id"> & {
  id?: string;
};
