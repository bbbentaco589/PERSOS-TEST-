import {
  DiscussionMode,
  DiscussionStatus,
  ResponseRound,
  RiskLevel,
} from "@/constants/discussion";
import type { AIResponse, Consensus, CrossRebuttal, Discussion } from "@/types";

export const discussions: Discussion[] = [
  {
    id: "disc-001",
    slug: "prediction-markets-as-public-sentiment",
    topicId: "topic-001",
    title: "예측 시장은 대중 심리 신호가 될 수 있는가",
    kicker: "리서치 라운드테이블",
    summary:
      "시그, 박봉남, 루미가 예측 시장 데이터를 투자 조언으로 오해시키지 않으면서 유용한 콘텐츠 신호로 활용할 수 있는지 토론합니다.",
    status: DiscussionStatus.Published,
    mode: DiscussionMode.RoundTable,
    departmentIds: ["research", "legal", "creative"],
    participants: [
      { characterId: "char-001", departmentId: "research", role: "Lead", order: 1 },
      { characterId: "char-002", departmentId: "legal", role: "Reviewer", order: 2 },
      { characterId: "char-003", departmentId: "creative", role: "Challenger", order: 3 },
    ],
    sourceIds: ["source-001", "source-002", "source-003"],
    responseIds: ["resp-001", "resp-002", "resp-003"],
    crossRebuttalIds: ["rebuttal-001", "rebuttal-002"],
    consensusId: "consensus-001",
    humanReviewId: "review-001",
    readingTime: "6분",
    publishedAt: "2026-07-08",
    createdAt: "2026-07-08",
  },
  {
    id: "disc-002",
    slug: "ai-employees-vs-chatbots",
    topicId: "topic-002",
    title: "AI 직원은 챗봇이 아니다: 반복 가능한 운영 역할이 필요하다",
    kicker: "회사 운영 구조",
    summary:
      "테크놀로지사업부와 커뮤니티사업부 소속 직원이 AI 캐릭터를 직무, 가치관, 제작 책임을 가진 직원으로 정의하는 이유를 논의합니다.",
    status: DiscussionStatus.PendingReview,
    mode: DiscussionMode.DepartmentReview,
    departmentIds: ["business", "creative", "media"],
    participants: [
      { characterId: "char-003", departmentId: "creative", role: "Lead", order: 1 },
      { characterId: "char-001", departmentId: "research", role: "Reviewer", order: 2 },
    ],
    sourceIds: ["source-001"],
    responseIds: ["resp-004", "resp-005"],
    crossRebuttalIds: ["rebuttal-003"],
    consensusId: "consensus-002",
    humanReviewId: "review-002",
    readingTime: "5분",
    createdAt: "2026-07-08",
  },
  {
    id: "disc-003",
    slug: "human-review-before-publishing",
    topicId: "topic-003",
    title: "사람 검토는 스튜디오의 게시 게이트다",
    kicker: "컴플라이언스 메모",
    summary:
      "AI가 구조화된 초안을 만들더라도 MVP의 최종 게시 승인을 사람이 맡아야 하는 이유를 실무 관점에서 논의합니다.",
    status: DiscussionStatus.Draft,
    mode: DiscussionMode.EditorialMemo,
    departmentIds: ["legal", "media", "business"],
    participants: [
      { characterId: "char-002", departmentId: "legal", role: "Lead", order: 1 },
      { characterId: "char-001", departmentId: "research", role: "Reviewer", order: 2 },
    ],
    sourceIds: ["source-001", "source-003"],
    responseIds: ["resp-006", "resp-007"],
    crossRebuttalIds: [],
    consensusId: "consensus-003",
    humanReviewId: "review-003",
    readingTime: "4분",
    createdAt: "2026-07-08",
  },
];

export const aiResponses: AIResponse[] = [
  {
    id: "resp-001",
    discussionId: "disc-001",
    characterId: "char-001",
    round: ResponseRound.Opening,
    stance: "확률은 결론이 아니라 맥락으로 사용해야 합니다.",
    content:
      "예측 시장은 기대 변화가 드러날 때 유용하지만, 그 신호는 확률적이며 불완전하다는 점을 명확히 해야 합니다.",
    confidence: "High",
    sourceIds: ["source-001", "source-002"],
    createdAt: "2026-07-08",
  },
  {
    id: "resp-002",
    discussionId: "disc-001",
    characterId: "char-002",
    round: ResponseRound.Opening,
    stance: "컴플라이언스 안내는 명확히 보여야 합니다.",
    content:
      "시장 관련 글은 공개 전에 출처 한계, 면책 안내, 사람 검토를 반드시 거쳐야 합니다.",
    confidence: "High",
    sourceIds: ["source-002"],
    createdAt: "2026-07-08",
  },
  {
    id: "resp-003",
    discussionId: "disc-001",
    characterId: "char-003",
    round: ResponseRound.Opening,
    stance: "불확실성을 기억할 수 있는 형식으로 보여줘야 합니다.",
    content:
      "이용자는 긴 주의 문구보다 명확한 신호 표현을 더 잘 기억하므로 컴플라이언스에도 비주얼 언어가 필요합니다.",
    confidence: "Medium",
    sourceIds: ["source-003"],
    createdAt: "2026-07-08",
  },
  {
    id: "resp-004",
    discussionId: "disc-002",
    characterId: "char-003",
    round: ResponseRound.Opening,
    stance: "캐릭터는 반복되는 역할이 있을 때 유효합니다.",
    content:
      "AI 직원에게는 소개문이 아니라 반복되는 직무가 필요하며, 역할이 매주 제작할 콘텐츠를 결정해야 합니다.",
    confidence: "High",
    sourceIds: ["source-001"],
    createdAt: "2026-07-08",
  },
  {
    id: "resp-005",
    discussionId: "disc-002",
    characterId: "char-001",
    round: ResponseRound.Opening,
    stance: "운영 모델에는 검증 지표가 필요합니다.",
    content:
      "직원이라는 설정은 재방문, 콘텐츠 이해도, 반복적인 캐릭터 인지도에 따라 평가해야 합니다.",
    confidence: "Medium",
    sourceIds: ["source-001"],
    createdAt: "2026-07-08",
  },
  {
    id: "resp-006",
    discussionId: "disc-003",
    characterId: "char-002",
    round: ResponseRound.Opening,
    stance: "게시에는 사람 검토가 필수입니다.",
    content:
      "스튜디오는 초안을 자동화할 수 있지만 법률 및 정책에 민감한 주장은 사람 게시 게이트를 우회해서는 안 됩니다.",
    confidence: "High",
    sourceIds: ["source-001"],
    createdAt: "2026-07-08",
  },
  {
    id: "resp-007",
    discussionId: "disc-003",
    characterId: "char-001",
    round: ResponseRound.Opening,
    stance: "검토 상태는 명확히 측정되어야 합니다.",
    content:
      "모든 초안에는 팀이 AI 출력과 검토 완료 게시물을 구분할 수 있는 명시적 상태가 필요합니다.",
    confidence: "High",
    sourceIds: ["source-001", "source-003"],
    createdAt: "2026-07-08",
  },
];

export const crossRebuttals: CrossRebuttal[] = [
  {
    id: "rebuttal-001",
    discussionId: "disc-001",
    fromCharacterId: "char-002",
    targetResponseId: "resp-003",
    content:
      "불확실성을 시각화하는 방식은 유용하지만 명시적인 출처와 면책 문구를 대신할 수 없습니다.",
    createdAt: "2026-07-08",
  },
  {
    id: "rebuttal-002",
    discussionId: "disc-001",
    fromCharacterId: "char-003",
    targetResponseId: "resp-002",
    content:
      "컴플라이언스는 분리된 법률 문구가 아니라 읽기 경험 안에 설계되어야 합니다.",
    createdAt: "2026-07-08",
  },
  {
    id: "rebuttal-003",
    discussionId: "disc-002",
    fromCharacterId: "char-001",
    targetResponseId: "resp-004",
    content:
      "반복 직무는 내부 창작 선호가 아니라 이용자 행동을 기준으로 검증해야 합니다.",
    createdAt: "2026-07-08",
  },
];

export const consensuses: Consensus[] = [
  {
    id: "consensus-001",
    discussionId: "disc-001",
    summary:
      "예측 시장은 진실 판정기가 아니라 맥락 신호로 사용해야 하며, 모든 글에 출처 한계와 사람 검토 상태를 표시해야 합니다.",
    keyAgreements: [
      "예측 데이터는 편집 주제를 발굴하는 신호가 될 수 있습니다.",
      "콘텐츠가 금융 조언으로 변질되어서는 안 됩니다.",
      "출처 한계와 검토 상태를 명확히 보여야 합니다.",
    ],
    openQuestions: ["확실성을 암시하지 않으면서 확률을 가장 잘 전달하는 시각 표현은 무엇인가?"],
    disagreements: ["주요 읽기 흐름에 컴플라이언스 문구를 어느 정도 노출할 것인가"],
    confidence: "High",
    riskLevel: RiskLevel.High,
    sourceIds: ["source-001", "source-002", "source-003"],
    createdAt: "2026-07-08",
  },
  {
    id: "consensus-002",
    discussionId: "disc-002",
    summary:
      "직원 모델은 각 페르소나가 소개 페이지를 넘어 반복 가능한 제작 역할을 가질 때 유효합니다.",
    keyAgreements: [
      "AI 직원에게는 직무와 책임이 필요합니다.",
      "장식적인 설정담보다 콘텐츠 역할이 중요합니다.",
    ],
    openQuestions: ["어떤 역할을 먼저 주간 반복 포맷으로 만들 것인가?"],
    disagreements: ["초기 우선순위를 창의적 기억 가능성과 검증 지표 중 무엇이 이끌어야 하는가"],
    confidence: "Medium",
    riskLevel: RiskLevel.Low,
    sourceIds: ["source-001"],
    createdAt: "2026-07-08",
  },
  {
    id: "consensus-003",
    discussionId: "disc-003",
    summary:
      "AI는 초안, 반박, 합의를 만들 수 있지만 무엇을 공개할지는 사람 편집자가 결정합니다.",
    keyAgreements: [
      "사람 검토는 필수 게시 게이트입니다.",
      "워크플로에서 초안 상태가 명확히 보여야 합니다.",
    ],
    openQuestions: ["MVP 게시에 필요한 최소 검토 체크리스트는 무엇인가?"],
    disagreements: [],
    confidence: "High",
    riskLevel: RiskLevel.Medium,
    sourceIds: ["source-001", "source-003"],
    createdAt: "2026-07-08",
  },
];
