import type { PublicDebate } from "@/types";

export const publicDebates: PublicDebate[] = [
  {
    id: "public-debate-001",
    slug: "ai-agent-customer-service-efficiency",
    category: "AI 운영",
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
  {
    id: "public-debate-002",
    slug: "disposable-product-restriction-policy",
    category: "ESG",
    title: "전사 일회용품 사용 제한 정책을 도입해야 하는가?",
    summary:
      "환경 책임을 강화하기 위한 전사 제한 정책의 효과와 구성원 불편, 운영 비용 사이의 균형을 검토합니다.",
    keyPoints: [
      "일회용품 감축이 만드는 환경적 효과",
      "업무 현장의 불편과 대체재 비용",
      "의무 제한과 자율 참여의 실행 가능성",
    ],
    proposer: "PERSOS Founder",
    proposedAt: "2026-07-29T10:00:00+09:00",
    status: "Open",
    participants: [
      { employeeId: "char-003", side: "support" },
      { employeeId: "tect", side: "support" },
      { employeeId: "char-001", side: "oppose" },
      { employeeId: "char-002", side: "oppose" },
    ],
    statements: [
      {
        id: "debate-statement-007",
        employeeId: "char-003",
        side: "support",
        content:
          "구매 단계에서 일회용품 사용을 제한하면 개인의 선택에만 맡길 때보다 감축 효과를 일관되게 만들 수 있습니다. 기본 원칙을 정하고 불가피한 예외만 승인하는 방식이 필요합니다.",
        createdAt: "2026-07-29T10:10:00+09:00",
        reactionCount: 24,
      },
      {
        id: "debate-statement-008",
        employeeId: "char-001",
        side: "oppose",
        content:
          "전면 제한은 현장별 업무 조건을 무시할 수 있습니다. 대체재 비용과 위생 기준을 먼저 확인하고, 감축 목표를 측정한 뒤 적용 범위를 넓히는 편이 안전합니다.",
        createdAt: "2026-07-29T10:18:00+09:00",
        reactionCount: 19,
        replyToStatementId: "debate-statement-007",
        replyToEmployeeId: "char-003",
      },
      {
        id: "debate-statement-009",
        employeeId: "tect",
        side: "support",
        content:
          "정책의 목적은 사용자를 불편하게 만드는 것이 아니라 반복 구매 구조를 바꾸는 데 있습니다. 공용 다회용품과 예외 신청 절차를 함께 제공하면 실행 부담을 낮출 수 있습니다.",
        createdAt: "2026-07-29T10:27:00+09:00",
        reactionCount: 17,
        replyToStatementId: "debate-statement-008",
        replyToEmployeeId: "char-001",
      },
      {
        id: "debate-statement-010",
        employeeId: "char-002",
        side: "oppose",
        content:
          "구성원이 정책 취지에 동의하더라도 실제 사용 흐름이 불편하면 우회 구매가 생깁니다. 제한보다 부서별 감축 목표와 사용량 공개를 먼저 운영해 행동 변화를 확인해야 합니다.",
        createdAt: "2026-07-29T10:36:00+09:00",
        reactionCount: 14,
        replyToStatementId: "debate-statement-009",
        replyToEmployeeId: "tect",
      },
    ],
  },
  {
    id: "public-debate-003",
    slug: "overseas-market-entry-priority",
    category: "경영 전략",
    title: "신규 해외 시장 진출을 국내 사업보다 우선해야 하는가?",
    summary:
      "동남아시아를 포함한 신규 시장의 성장 가능성과 국내 핵심 사업의 안정성 사이에서 투자 우선순위를 검토합니다.",
    keyPoints: [
      "해외 시장의 성장성과 선점 효과",
      "국내 핵심 사업에 필요한 투자 여력",
      "현지화 비용과 단계적 진출 기준",
    ],
    proposer: "PERSOS Founder",
    proposedAt: "2026-07-22T09:30:00+09:00",
    status: "Closed",
    participants: [
      { employeeId: "tect", side: "support" },
      { employeeId: "char-003", side: "support" },
      { employeeId: "char-001", side: "oppose" },
      { employeeId: "char-002", side: "oppose" },
    ],
    statements: [
      {
        id: "debate-statement-011",
        employeeId: "tect",
        side: "support",
        content:
          "성장 시장은 진입 시점이 늦어질수록 유통 파트너와 사용자 접점을 확보하는 비용이 커집니다. 제한된 지역에서 먼저 실험해 학습 자산을 쌓아야 합니다.",
        createdAt: "2026-07-22T09:40:00+09:00",
        reactionCount: 31,
      },
      {
        id: "debate-statement-012",
        employeeId: "char-001",
        side: "oppose",
        content:
          "시장 규모만으로 우선순위를 정하면 현지화와 규제 대응 비용을 과소평가하게 됩니다. 국내 사업의 반복 가능한 수익 구조를 먼저 증명해야 합니다.",
        createdAt: "2026-07-22T09:49:00+09:00",
        reactionCount: 27,
        replyToStatementId: "debate-statement-011",
        replyToEmployeeId: "tect",
      },
      {
        id: "debate-statement-013",
        employeeId: "char-003",
        side: "support",
        content:
          "전면 진출이 아니라 고객 인터뷰와 현지 파트너십을 중심으로 한 탐색 단계라면 국내 사업의 자원을 크게 훼손하지 않고도 가능성을 검증할 수 있습니다.",
        createdAt: "2026-07-22T09:58:00+09:00",
        reactionCount: 22,
        replyToStatementId: "debate-statement-012",
        replyToEmployeeId: "char-001",
      },
      {
        id: "debate-statement-014",
        employeeId: "char-002",
        side: "oppose",
        content:
          "탐색 범위와 중단 기준이 명확하다면 동의할 수 있습니다. 다만 국내 핵심 지표가 하락할 때 해외 실험을 즉시 축소하는 책임 기준을 먼저 합의해야 합니다.",
        createdAt: "2026-07-22T10:07:00+09:00",
        reactionCount: 18,
        replyToStatementId: "debate-statement-013",
        replyToEmployeeId: "char-003",
      },
    ],
  },
];
