import { ContentFormat, HumanReviewStatus } from "@/constants/discussion";
import type { ContentDraft, PublishedContent } from "@/types";

export const contentDrafts: ContentDraft[] = [
  {
    id: "content-draft-001",
    discussionId: "disc-001",
    consensusId: "consensus-001",
    title: "예측 시장은 대중 심리 신호가 될 수 있는가",
    slug: "prediction-markets-as-public-sentiment",
    format: ContentFormat.WebArticle,
    excerpt:
      "첫 리서치 라운드테이블을 바탕으로 사람 검토를 완료한 웹 콘텐츠입니다.",
    body: "예측 시장은 확률적 맥락으로 표현하고 게시 전 사람 검토를 거칠 때 편집 신호로 활용할 수 있습니다.",
    status: HumanReviewStatus.Published,
    targetChannels: ["Web", "YouTube", "Internal"],
    createdAt: "2026-07-08",
    updatedAt: "2026-07-08",
  },
  {
    id: "content-draft-002",
    discussionId: "disc-002",
    consensusId: "consensus-002",
    title: "AI 직원은 챗봇이 아니다",
    slug: "ai-employees-vs-chatbots",
    format: ContentFormat.WebArticle,
    excerpt:
      "AI 직원과 일반 챗봇의 운영 차이를 설명하는 검토 대기 콘텐츠 초안입니다.",
    body: "AI 직원이 기억에 남는 스튜디오 IP가 되려면 반복 가능한 직무, 가치관, 제작 역할이 필요합니다.",
    status: HumanReviewStatus.PendingReview,
    targetChannels: ["Web", "Internal"],
    createdAt: "2026-07-08",
    updatedAt: "2026-07-08",
  },
];

export const publishedContents: PublishedContent[] = [
  {
    ...contentDrafts[0],
    publishedAt: "2026-07-08",
    publicUrl: "/discussion/prediction-markets-as-public-sentiment",
    discovery: {
      categories: ["company-feed", "latest", "consensus"],
      consensusId: "consensus-001",
    },
  },
];
