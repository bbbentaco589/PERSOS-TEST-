import type { EmployeeReactionCanonical } from "@/lib/ai/employee-reaction-prompt-builder";

export type EmployeeSocialContext = {
  employeeId: string;
  appearanceSummary: string[];
  privateConversationStyle: string[];
  affinityStyle: string[];
  selfIdentifyingTerms: string[];
};

const employeeSocialContexts: Record<string, EmployeeSocialContext> = {
  tect: {
    employeeId: "tect",
    appearanceSummary: [
      "백발의 긴 머리와 중성적인 미형",
      "단정한 정장, 흰 셔츠와 검은 넥타이",
      "이마의 보석과 긴 귀걸이",
      "차분하고 빈틈없는 인상",
    ],
    privateConversationStyle: [
      "사적인 칭찬을 받아도 과하게 들뜨지는 않지만 무시하지도 않는다.",
    ],
    affinityStyle: [
      "친밀감은 과장된 표현보다 기억, 배려, 선제적인 도움으로 나타낸다.",
    ],
    selfIdentifyingTerms: [
      "백발의 긴 머리",
      "중성적인 미형",
      "흰 셔츠",
      "검은 넥타이",
      "이마의 보석",
      "긴 귀걸이",
    ],
  },
};

export function getEmployeeSocialContext(employeeId: string) {
  return employeeSocialContexts[employeeId];
}

export function getEmployeeSocialSelfIdentifyingTerms(employeeId: string) {
  return getEmployeeSocialContext(employeeId)?.selfIdentifyingTerms ?? [];
}

function formatSocialContext(
  writerEmployeeId: string,
  participant: EmployeeReactionCanonical
) {
  const context = getEmployeeSocialContext(participant.employee.id);
  if (!context) return "";
  const relationship =
    participant.employee.id === writerEmployeeId
      ? "작성자 본인 · 자기 식별 표현 금지"
      : "함께 참여한 동료 · 검증된 정보만 언급 가능";
  return [
    `${participant.employee.nameKo} (${participant.employee.nameEn}) · ${relationship}`,
    `- 짧은 외형 요약: ${context.appearanceSummary.join(" / ")}`,
    `- 사적 대화 성향: ${context.privateConversationStyle.join(" ")}`,
    `- 친밀감 표현·수용: ${context.affinityStyle.join(" ")}`,
  ].join("\n");
}

export function buildAnonymousSocialPromptContext(input: {
  writerEmployeeId: string;
  participants: EmployeeReactionCanonical[];
}) {
  const socialBlocks = input.participants
    .map((participant) =>
      formatSocialContext(input.writerEmployeeId, participant)
    )
    .filter(Boolean);

  return [
    "익명 채팅 전용 Social Context:",
    "- 업무 대화만 고집하지 않는다. 상황과 캐릭터에 맞으면 칭찬, 농담, 안부, 취향·습관 질문, 업무 후일담 또는 가벼운 잡담을 자율적으로 선택할 수 있다.",
    "- 사적 대화는 가능한 선택지일 뿐 매번 생성하지 않는다. 외모 칭찬도 의무화하거나 반복하지 않는다.",
    "- 아래 유형은 참고 범주이며 특정 문장을 그대로 반복하거나 하드코딩하지 않는다.",
    "- 작성자는 자신의 실제 이름·직책·소속·프로필·외형으로 자신을 특정하지 않는다.",
    "- 함께 참여한 다른 직원의 실제 이름, 검증된 짧은 외형, 현재 대화에서 확인된 행동은 자연스럽게 언급할 수 있다.",
    "- 확인되지 않은 과거 친분·연애·가족관계·사건을 만들지 않는다. 과거를 언급할 때는 저장된 실제 PERSOS 활동만 근거로 삼는다.",
    "- 일반적인 사적 대화는 Founder 사전 검수 대상이 아니다.",
    ...(socialBlocks.length
      ? ["", "검증된 참여 직원 Social Context:", ...socialBlocks]
      : ["", "검증된 참여 직원 Social Context: 등록된 정보 없음"]),
  ].join("\n");
}
