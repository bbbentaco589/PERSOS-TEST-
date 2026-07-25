import type {
  ComplianceCategory,
  RiskLevel,
  SourceType,
} from "@/constants/discussion";

export type SourceTrustLevel = "Primary" | "Secondary" | "Context";

export type Source = {
  id: string;
  topicIds: string[];
  name: string;
  type: SourceType;
  trustLevel: SourceTrustLevel;
  riskLevel: RiskLevel;
  complianceCategories: ComplianceCategory[];
  usage: string;
  summary: string;
  url?: string;
  publisher?: string;
  lastReviewed: string;
};

export type KnowledgeEntry = {
  id: string;
  slug: string;
  title: string;
  category: string;
  sourceType:
    | SourceType
    | "Internal Policy"
    | "HQ Document"
    | "Asset Inventory"
    | "내부 정책"
    | "HQ 문서"
    | "에셋 인벤토리";
  confidence: "Low" | "Medium" | "High";
  lastReviewed: string;
  summary: string;
  body: string[];
  status: "Draft" | "Reviewed" | "Archived";
  relatedSourceIds: string[];
  relatedEmployeeIds: string[];
  relatedDiscussionIds: string[];
  relatedContentIds: string[];
  revision: string;
};
