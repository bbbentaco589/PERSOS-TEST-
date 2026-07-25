import { ComplianceCategory, RiskLevel } from "@/constants/discussion";
import type { Topic } from "@/types";

export const topics: Topic[] = [
  {
    id: "topic-001",
    slug: "prediction-market-odds-as-content-triggers",
    title: "예측 시장 확률을 콘텐츠 주제 신호로 활용할 수 있는가",
    description:
      "예측 시장의 변화를 확실한 결론처럼 과장하지 않으면서 편집 신호로 활용할 수 있는지 검토합니다.",
    sourceHint: "예측 시장 카테고리 관찰",
    status: "In Discussion",
    priority: "High",
    riskLevel: RiskLevel.High,
    complianceCategories: [
      ComplianceCategory.Financial,
      ComplianceCategory.Crypto,
      ComplianceCategory.PredictionMarket,
    ],
    createdAt: "2026-07-08",
  },
  {
    id: "topic-002",
    slug: "should-every-ai-employee-have-a-publishing-role",
    title: "모든 AI 직원에게 반복 가능한 콘텐츠 역할이 필요한가",
    description:
      "캐릭터를 반복 가능한 콘텐츠 책임을 가진 운영 직원으로 설계해야 하는지 정의합니다.",
    sourceHint: "PERSOS AI Company Intranet BETA HQ",
    status: "Ready for Review",
    priority: "High",
    riskLevel: RiskLevel.Low,
    complianceCategories: [ComplianceCategory.General],
    createdAt: "2026-07-08",
  },
  {
    id: "topic-003",
    slug: "character-ip-validation-through-youtube-shorts",
    title: "유튜브 쇼츠를 통한 캐릭터 IP 검증",
    description:
      "숏폼 영상으로 어떤 AI 직원이 핵심 IP가 될 만큼 기억되는지 검증합니다.",
    sourceHint: "마케팅 운영 체계",
    status: "Queued",
    priority: "Medium",
    riskLevel: RiskLevel.Medium,
    complianceCategories: [ComplianceCategory.Brand],
    createdAt: "2026-07-08",
  },
];
