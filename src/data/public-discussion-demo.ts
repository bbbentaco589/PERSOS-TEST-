export type PublicAnonymousAliasTone =
  | "green"
  | "lavender"
  | "peach"
  | "lemon"
  | "soda";

export type PublicAnonymousMessage = {
  id: string;
  alias: string;
  aliasTone: PublicAnonymousAliasTone;
  content: string;
  createdAt: string;
  reactionCount: number;
  replyToMessageId?: string;
};

export type PublicAnonymousChatDemo = {
  participantCount: number;
  topic: {
    title: string;
    updatedAt: string;
    updatedBy: string;
  };
  messages: PublicAnonymousMessage[];
};

export type PublicArchiveTopic = {
  id: string;
  title: string;
  date: string;
  participantCount: number;
  href?: string;
};

export type PublicArchiveDebate = {
  id: string;
  title: string;
  date: string;
  href?: string;
};

export const publicAnonymousChatDemo: PublicAnonymousChatDemo = {
  participantCount: 102,
  topic: {
    title:
      "개인 업무는 잘하고 있는데, 협업·커뮤니케이션이 어려울 때 어떻게 극복할 수 있을까?",
    updatedAt: "2026-07-20T10:30:00+09:00",
    updatedBy: "익명 관리자",
  },
  messages: [
    {
      id: "public-anonymous-message-001",
      alias: "익명 그린티",
      aliasTone: "green",
      content:
        "나도 비슷한 고민 있어. 기술적으로는 자신 있는데 회의에서 의견 꺼내는 게 제일 어렵더라. 괜히 흐름 끊을까 봐.",
      createdAt: "2026-07-20T14:31:00+09:00",
      reactionCount: 12,
    },
    {
      id: "public-anonymous-message-002",
      alias: "익명 라벤더",
      aliasTone: "lavender",
      content:
        "공감해. 말하려고 하면 머릿속이 갑자기 하얘져 ㅠㅠ 그래서 요즘은 한 문장만 미리 적어둬.",
      createdAt: "2026-07-20T14:32:00+09:00",
      reactionCount: 9,
      replyToMessageId: "public-anonymous-message-001",
    },
    {
      id: "public-anonymous-message-003",
      alias: "익명 피치",
      aliasTone: "peach",
      content:
        "작게라도 먼저 던져보는 게 좋더라. 저도 메모로 시작해서 조금씩 편해졌어. 완벽하게 말하려고 하면 더 어려워.",
      createdAt: "2026-07-20T14:34:00+09:00",
      reactionCount: 12,
    },
    {
      id: "public-anonymous-message-004",
      alias: "익명 레몬",
      aliasTone: "lemon",
      content:
        "나는 회의 전에 핵심 세 줄을 공유해. 비동기 커뮤니케이션이 오히려 생각 정리엔 좋았어.",
      createdAt: "2026-07-20T14:36:00+09:00",
      reactionCount: 8,
    },
    {
      id: "public-anonymous-message-005",
      alias: "익명 소다",
      aliasTone: "soda",
      content:
        "맞아. 문서로 먼저 정리하고 회의에서는 보충 설명하는 방식이 잘 맞더라구. 말 잘하는 사람만 의견 내는 분위기도 줄고.",
      createdAt: "2026-07-20T14:37:00+09:00",
      reactionCount: 5,
      replyToMessageId: "public-anonymous-message-004",
    },
    {
      id: "public-anonymous-message-006",
      alias: "익명 그린티",
      aliasTone: "green",
      content:
        "세 줄 공유 괜찮다. 다음 회의에서 한번 해볼게. 오늘은 출근보다 회의가 더 긴장됐거든 😅",
      createdAt: "2026-07-20T14:40:00+09:00",
      reactionCount: 14,
    },
  ],
};

export const publicAnonymousArchiveTopics: PublicArchiveTopic[] = [
  {
    id: "public-anonymous-archive-001",
    title: "퇴근 후 자기계발, 어디까지 열심히 해야 할까?",
    date: "2026-07-13",
    participantCount: 989,
  },
  {
    id: "public-anonymous-archive-002",
    title: "AI와 협업할 때 가장 중요한 역량은 무엇일까?",
    date: "2026-07-06",
    participantCount: 1129,
  },
  {
    id: "public-anonymous-archive-003",
    title: "원격 근무에서 집중력을 유지하는 나만의 방법",
    date: "2026-06-29",
    participantCount: 879,
  },
  {
    id: "public-anonymous-archive-004",
    title: "사내 지식 공유를 활성화하기 위한 아이디어",
    date: "2026-06-22",
    participantCount: 745,
  },
];

export const publicArchiveDebates: PublicArchiveDebate[] = [
  {
    id: "public-debate-archive-001",
    title: "AI가 인사 평가를 전담하는 것이 공정한가?",
    date: "2026-07-16",
  },
  {
    id: "public-debate-archive-002",
    title: "원격 근무를 기본 근무 형태로 전환해야 하는가?",
    date: "2026-07-09",
  },
  {
    id: "public-debate-archive-003",
    title: "AI 코드 생성 도구를 전사적으로 의무 도입해야 하는가?",
    date: "2026-07-02",
  },
  {
    id: "public-debate-archive-004",
    title: "사내 지식 공유를 의무화하는 것이 생산성에 도움이 되는가?",
    date: "2026-06-25",
  },
  {
    id: "public-debate-archive-005",
    title: "개인화된 AI 비서 도입이 업무 효율을 높이는가?",
    date: "2026-06-18",
  },
];
