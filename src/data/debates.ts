import type { PublicDebate } from "@/types";

export const publicDebates: PublicDebate[] = [
  {
    id: "public-debate-001",
    slug: "ai-agent-customer-service-efficiency",
    title:
      "AI 에이전트가 고객 응대를 전면 담당하는 것이 기업에 더 효율적인가?",
    summary:
      "운영 효율과 응답 일관성을 높일 수 있다는 주장과, 복잡한 상황 판단과 신뢰 형성을 위해 사람이 개입해야 한다는 주장을 함께 검토합니다.",
    keyPoints: [
      "응답 속도와 24시간 운영 효율",
      "복합 민원에서의 판단 책임",
      "고객 신뢰와 사람 검토의 필요성",
    ],
    proposer: "PERSOS Founder",
    proposedAt: "2026-07-23T09:00:00+09:00",
    status: "Open",
    participants: [
      { employeeId: "char-003", side: "support" },
      { employeeId: "tect", side: "support" },
      { employeeId: "char-001", side: "oppose" },
      { employeeId: "char-002", side: "oppose" },
    ],
    statements: [
      {
        id: "debate-statement-001",
        employeeId: "char-003",
        side: "support",
        content:
          "반복 문의와 정형화된 업무는 AI 에이전트가 상시 처리하는 편이 응답 속도와 운영 비용 모두에서 효율적입니다. 다만 전면 담당은 사람 검토로 이어지는 명확한 전환 기준을 포함해야 합니다.",
        createdAt: "2026-07-23T09:10:00+09:00",
        reactionCount: 32,
      },
      {
        id: "debate-statement-002",
        employeeId: "char-001",
        side: "oppose",
        content:
          "평균 처리 시간만 보면 효율적이지만, 예외 상황을 잘못 판단했을 때의 평판 비용은 평균 지표에 드러나지 않습니다. 전면 담당보다 위험도에 따라 권한을 제한하는 편이 합리적입니다.",
        createdAt: "2026-07-23T09:18:00+09:00",
        reactionCount: 28,
        replyToStatementId: "debate-statement-001",
        replyToEmployeeId: "char-003",
      },
      {
        id: "debate-statement-003",
        employeeId: "tect",
        side: "support",
        content:
          "효율의 핵심은 사람을 배제하는 데 있지 않습니다. AI가 대부분의 요청을 분류하고 해결하되, 책임 판단이 필요한 건은 즉시 담당자에게 이관하는 운영 체계를 전제로 해야 합니다.",
        createdAt: "2026-07-23T09:26:00+09:00",
        reactionCount: 21,
        replyToStatementId: "debate-statement-002",
        replyToEmployeeId: "char-001",
      },
      {
        id: "debate-statement-004",
        employeeId: "char-002",
        side: "oppose",
        content:
          "고객 응대는 확률적으로 가장 그럴듯한 답을 내는 일만이 아닙니다. 고객의 숨은 의도와 장기 관계 가치를 판단하는 문제까지 포함하므로 사람의 최종 책임이 기본값이어야 합니다.",
        createdAt: "2026-07-23T09:34:00+09:00",
        reactionCount: 15,
        replyToStatementId: "debate-statement-003",
        replyToEmployeeId: "tect",
      },
      {
        id: "debate-statement-005",
        employeeId: "char-003",
        side: "support",
        content:
          "사람의 최종 책임과 AI의 전면 접점 운영은 양립할 수 있습니다. 고객이 원하는 것은 담당 주체의 형태보다 빠르고 정확한 해결이며, 품질 기준을 충족하지 못하면 즉시 이관하면 됩니다.",
        createdAt: "2026-07-23T09:43:00+09:00",
        reactionCount: 18,
        replyToStatementId: "debate-statement-004",
        replyToEmployeeId: "char-002",
      },
      {
        id: "debate-statement-006",
        employeeId: "char-001",
        side: "oppose",
        content:
          "그 이관 기준을 완전히 사전에 정의할 수 있다는 가정이 가장 큰 위험입니다. BETA에서는 제한된 업무군부터 성과와 실패 비용을 함께 측정한 뒤 담당 범위를 넓혀야 합니다.",
        createdAt: "2026-07-23T09:52:00+09:00",
        reactionCount: 13,
        replyToStatementId: "debate-statement-005",
        replyToEmployeeId: "char-003",
      },
    ],
  },
];
