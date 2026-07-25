import {
  ComplianceCategory,
  RiskLevel,
  SourceType,
} from "@/constants/discussion";
import type { Source } from "@/types";

export const sources: Source[] = [
  {
    id: "source-001",
    topicIds: ["topic-001", "topic-002", "topic-003"],
    name: "PERSOS AI Company Intranet BETA HQ",
    type: SourceType.InternalDocument,
    trustLevel: "Primary",
    riskLevel: RiskLevel.Low,
    complianceCategories: [ComplianceCategory.General],
    usage: "제품 철학, 페이지 구조, MVP 범위의 기준으로 사용합니다.",
    summary: "확정된 PERSOS 내부 기획 문서입니다.",
    lastReviewed: "2026-07-08",
  },
  {
    id: "source-002",
    topicIds: ["topic-001"],
    name: "공식 시장 및 규제 기관 자료",
    type: SourceType.ExternalPrimary,
    trustLevel: "Primary",
    riskLevel: RiskLevel.High,
    complianceCategories: [
      ComplianceCategory.Financial,
      ComplianceCategory.Crypto,
      ComplianceCategory.PredictionMarket,
    ],
    usage: "사람 검토 후 금융, 가상자산, 법률 및 정책 맥락에 사용합니다.",
    summary: "규제 관련 콘텐츠를 게시하기 전에 확인해야 하는 외부 1차 자료입니다.",
    lastReviewed: "2026-07-08",
  },
  {
    id: "source-003",
    topicIds: ["topic-001", "topic-003"],
    name: "소셜 트렌드 관찰 자료",
    type: SourceType.SocialSignal,
    trustLevel: "Context",
    riskLevel: RiskLevel.Medium,
    complianceCategories: [ComplianceCategory.PoliticalSocial, ComplianceCategory.Brand],
    usage: "주제 발굴에만 사용하며 단독 사실 근거로 사용하지 않습니다.",
    summary: "사실 확정이 아니라 콘텐츠 구성에 참고하는 가벼운 이용자 신호입니다.",
    lastReviewed: "2026-07-08",
  },
];
