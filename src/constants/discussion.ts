export const DiscussionStatus = {
  Draft: "Draft",
  SourceAttached: "Source Attached",
  AIGenerated: "AI Generated",
  PendingReview: "Pending Review",
  Approved: "Approved",
  Published: "Published",
  Archived: "Archived",
  Rejected: "Rejected",
  NeedsRevision: "Needs Revision",
} as const;

export type DiscussionStatus = (typeof DiscussionStatus)[keyof typeof DiscussionStatus];

export const DiscussionMode = {
  RoundTable: "Round Table",
  DepartmentReview: "Department Review",
  EditorialMemo: "Editorial Memo",
} as const;

export type DiscussionMode = (typeof DiscussionMode)[keyof typeof DiscussionMode];

export const ResponseRound = {
  Opening: "Opening",
  CrossRebuttal: "Cross Rebuttal",
  FinalPosition: "Final Position",
} as const;

export type ResponseRound = (typeof ResponseRound)[keyof typeof ResponseRound];

export const HumanReviewStatus = {
  Draft: "Draft",
  AIGenerated: "AI Generated",
  PendingReview: "Pending Review",
  Approved: "Approved",
  Published: "Published",
  Archived: "Archived",
  Rejected: "Rejected",
  NeedsRevision: "Needs Revision",
} as const;

export type HumanReviewStatus =
  (typeof HumanReviewStatus)[keyof typeof HumanReviewStatus];

export const ContentFormat = {
  WebArticle: "Web Article",
  YouTubeScript: "YouTube Script",
  ShortFormScript: "Short-form Script",
  SocialPost: "Social Post",
  InternalMemo: "Internal Memo",
} as const;

export type ContentFormat = (typeof ContentFormat)[keyof typeof ContentFormat];

export const SourceType = {
  InternalDocument: "Internal Document",
  ExternalPrimary: "External Primary",
  MarketData: "Market Data",
  News: "News",
  SocialSignal: "Social Signal",
  Reference: "Reference",
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const RiskLevel = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Restricted: "Restricted",
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const ComplianceCategory = {
  General: "General",
  Financial: "Financial",
  Crypto: "Crypto",
  PredictionMarket: "Prediction Market",
  Legal: "Legal",
  Medical: "Medical",
  PoliticalSocial: "Political / Social",
  Brand: "Brand",
} as const;

export type ComplianceCategory =
  (typeof ComplianceCategory)[keyof typeof ComplianceCategory];
