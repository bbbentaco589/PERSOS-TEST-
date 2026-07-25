import type {
  ComplianceCategory,
  HumanReviewStatus,
  RiskLevel,
} from "@/constants/discussion";

export type { HumanReviewStatus } from "@/constants/discussion";

export type AdminUser = {
  id: string;
  name: string;
  role: "Founder" | "Editor" | "Reviewer" | "Admin";
  email?: string;
};

export type HumanReview = {
  id: string;
  targetType: "Discussion" | "Consensus" | "ContentDraft";
  targetId: string;
  status: HumanReviewStatus;
  reviewerId?: string;
  riskLevel: RiskLevel;
  complianceCategories: ComplianceCategory[];
  notes?: string;
  updatedAt: string;
};
