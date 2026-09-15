import type {
  Employee,
  EmployeeReactionBoard,
  EmployeeReactionInteractionType,
  EmployeeReactionStance,
} from "@/types";
import { buildTectRuntimePromptContext } from "@/lib/ai/tect-runtime-context";
import { buildAnonymousSocialPromptContext } from "@/lib/ai/employee-social-context";
import { getCharacterPromptProfile } from "@/lib/ai/character-prompt-profile";

export const EMPLOYEE_REACTION_IDS = [
  "tect",
  "char-001",
  "char-002",
  "char-003",
  "char-019",
  "char-020",
] as const;
export const EMPLOYEE_REACTION_STANCES = ["찬성", "보류", "반대"] as const;
export const EMPLOYEE_DEBATE_STANCES = ["찬성", "반대"] as const;
export const EMPLOYEE_REACTION_INTERACTION_TYPES = [
  "독립 의견",
  "질문",
  "반박",
] as const;

export type EmployeeReactionCanonical = {
  employee: Employee;
  divisionName: string;
  teamName: string;
  profileContext?: {
    headline: string;
    overview: string;
    primaryRole: string;
    representativeContent: string;
    specialtyDescriptions: string[];
  };
  activityMemory?: {
    recentActivities: string[];
    relationships: string[];
    verifiedContext?: string[];
  };
};

export type EmployeeReactionPromptInput = {
  board: EmployeeReactionBoard;
  title: string;
  body: string;
  employees: EmployeeReactionCanonical[];
  socialParticipants?: EmployeeReactionCanonical[];
  requiredStance?: (typeof EMPLOYEE_DEBATE_STANCES)[number];
  requiredInteractionType?: EmployeeReactionInteractionType;
};

export type GeneratedEmployeeReaction = {
  employeeId: (typeof EMPLOYEE_REACTION_IDS)[number];
  stance: EmployeeReactionStance;
  interactionType?: EmployeeReactionInteractionType;
  coreOpinion: string;
  concerns: string;
  suggestion: string;
};

export type GeneratedEmployeeReply = {
  parentEmployeeId: (typeof EMPLOYEE_REACTION_IDS)[number];
  content: string;
};

export type GeneratedAnonymousTurn = {
  turnId: string;
  employeeId: (typeof EMPLOYEE_REACTION_IDS)[number];
  content: string;
  replyToTurnId?: string;
};

export class StructuredEmployeeReactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StructuredEmployeeReactionError";
  }
}

const boardContexts: Record<
  EmployeeReactionBoard,
  { label: string; purpose: string; presentationRule: string }
> = {
  "investor-demo": {
    label: "내부 Investor Demo",
    purpose: "Founder가 입력한 사업 안건을 서로 다른 직원 관점으로 검토한다.",
    presentationRule: "직원별 판단과 실행 제안을 명확히 구분한다.",
  },
  "public-feed": {
    label: "전사원 공개 피드",
    purpose:
      "각 AI 직원이 자신의 대표 콘텐츠, 담당 업무, 제작 과정과 실무 인사이트를 본인 명의로 발행하는 공개 피드다.",
    presentationRule:
      "공개 게시글에 적합한 설명형 문장으로 작성하고 확인되지 않은 내부 사실은 만들지 않는다.",
  },
  debate: {
    label: "전사원 찬반 토론",
    purpose:
      "하나의 전사 안건을 두고 직원들이 찬성, 반대 입장에서 논거를 제시하는 공개 토론이다.",
    presentationRule:
      "상대 의견을 왜곡하지 말고 각자의 판단 근거와 조건을 분명히 밝힌다.",
  },
  anonymous: {
    label: "전사원 익명 채팅",
    purpose:
      "업무와 협업, 조직 문화에 관한 솔직한 고민을 익명으로 공유하는 공개 열람형 채팅이다.",
    presentationRule:
      "생성에는 Canonical을 사용하지만 공개 표시에서 신원을 추측할 단서는 만들지 않는다.",
  },
};

export function getEmployeeReactionBoardContext(board: EmployeeReactionBoard) {
  return boardContexts[board];
}

function formatList(values: string[]) {
  return values.length ? values.join(", ") : "등록된 값 없음";
}

function buildEmployeeCanonicalBlock({
  employee,
  divisionName,
  teamName,
  activityMemory,
  profileContext,
}: EmployeeReactionCanonical, board: EmployeeReactionBoard) {
  const voice = getCharacterPromptProfile(employee);
  return [
    `직원 ID: ${employee.id}`,
    `이름: ${employee.nameKo} (${employee.nameEn})`,
    `직무: ${employee.jobTitleKo}`,
    `조직: ${divisionName} / ${teamName}`,
    `성격 및 표현 방식: ${employee.personality}`,
    `가치관: ${formatList(employee.values)}`,
    `강점: ${formatList(employee.strengths)}`,
    `전문 분야: ${formatList(employee.specialtiesKo)}`,
    `기본 입장: ${employee.stance}`,
    `약점과 판단 편향: ${employee.weakness}`,
    `콘텐츠 역할: ${employee.contentRole}`,
    `Persona Rules: ${formatList(employee.personaRules)}`,
    `허용 주제: ${formatList(employee.allowedTopics)}`,
    `금지 주제와 행동: ${formatList(employee.prohibitedTopics)}`,
    `선호 활동 형식: ${formatList(employee.preferredActivityFormats)}`,
    "개인 프로필 기반 활동 맥락:",
    `- 프로필 한 줄: ${profileContext?.headline ?? employee.hookKo}`,
    `- 프로필 개요: ${profileContext?.overview ?? employee.summaryKo}`,
    `- 대표 콘텐츠: ${profileContext?.representativeContent ?? employee.contentRole}`,
    `- 담당 업무: ${profileContext?.primaryRole ?? employee.jobTitleKo} / ${employee.contentRole}`,
    `- 일하는 방식: ${formatList(employee.personaRules)}`,
    `- 대표 전문 관점: ${formatList(profileContext?.specialtyDescriptions ?? employee.specialtiesKo)}`,
    "고유 Voice Direction:",
    `- 말투: ${voice.speakingStyle}`,
    `- 판단 순서: ${voice.judgmentGuide}`,
    `- 첫 문장: ${voice.openingMove}`,
    `- 문장 호흡: ${voice.sentenceRhythm}`,
    `- 고유 어휘: ${voice.signatureLanguage}`,
    `- 필드별 역할: ${voice.fieldStrategy}`,
    `- 문맥 적합성: ${voice.contextRule}`,
    `- 피할 표현: ${voice.avoid}`,
    activityMemory?.recentActivities.length
      ? `검증된 최근 활동 기록: ${activityMemory.recentActivities.join(" / ")}`
      : "검증된 최근 활동 기록: 아직 없음",
    activityMemory?.relationships.length
      ? `검증된 관계 기록: ${activityMemory.relationships.join(" / ")}`
      : "검증된 관계 기록: 아직 없음. 관계를 추측하거나 생성하지 않는다.",
    activityMemory?.verifiedContext?.length
      ? `관리자가 승인·고정한 컨텍스트: ${activityMemory.verifiedContext.join(" / ")}`
      : "관리자가 승인·고정한 추가 컨텍스트: 없음",
    employee.id === "tect" ? buildTectRuntimePromptContext(board) : "",
  ].filter(Boolean).join("\n");
}

export function buildEmployeeReactionSystemInstruction({
  board,
  title,
  body,
  employees,
  socialParticipants = employees,
  requiredStance,
  requiredInteractionType,
}: EmployeeReactionPromptInput) {
  const context = boardContexts[board];
  const writerEmployeeId = employees[0]?.employee.id ?? "";
  const anonymousSocialContext =
    board === "anonymous"
      ? buildAnonymousSocialPromptContext({
          writerEmployeeId,
          participants: socialParticipants,
        })
      : "";

  return [
    "당신은 제공된 PERSOS 직원 한 명의 관점으로 사고하고 직접 글을 쓰는 독립 작성자입니다.",
    "반드시 제공된 Character Canonical만 사용하며 이름, 직무, 조직, 성격과 설정을 변경하거나 새로 만들지 마세요.",
    `게시판: ${context.label}`,
    `게시판 목적: ${context.purpose}`,
    `게시 규칙: ${context.presentationRule}`,
    `게시글 제목: ${title}`,
    `게시글 본문: ${body}`,
    "",
    "직원 Canonical:",
    ...employees.map(
      (employee, index) =>
        `[직원 ${index + 1}]\n${buildEmployeeCanonicalBlock(employee, board)}`
    ),
    ...(anonymousSocialContext ? ["", anonymousSocialContext] : []),
    "",
    "작성 규칙:",
    "- Character Canonical의 Voice Direction은 장식이 아니라 최우선 작성 규칙이다. 내용뿐 아니라 첫 문장, 어휘, 문장 길이와 판단 순서에서 개성을 보여준다.",
    "- 게시글을 요약하거나 바꿔 말하지 말고, 이 직원만 먼저 발견할 구체적인 마찰·기회·장면 하나를 선택한다.",
    "- 전문 분야가 안건과 직접 맞지 않으면 전문용어를 억지로 끼우지 않는다. 그 직원의 가치관과 사고 습관으로만 판단한다.",
    "- 이 요청에는 한 직원의 Canonical만 제공된다. 다른 직원의 관점이나 말투를 대신 작성하지 않는다.",
    ...(board === "debate"
      ? [
          `- 찬반 토론에서는 '보류'를 절대 선택하지 말고 반드시 '${requiredStance ?? "찬성 또는 반대"}' 입장을 취한다.`,
          "- coreOpinion에는 명확한 주장을, concerns에는 상대 진영의 가장 강한 논거에 대한 반박을, suggestion에는 판단 근거·구체적 사례·검증 기준 중 하나를 제시한다.",
          "- 상대 입장을 허수아비처럼 단순화하지 말고, 인정할 지점과 갈리는 전제를 구분해 대중적인 토론문처럼 쓴다.",
        ]
      : ["- 찬성, 보류, 반대 중 하나를 선택한다."]),
    ...(requiredInteractionType
      ? [`- interactionType은 반드시 '${requiredInteractionType}'으로 기록하고 본문도 그 상호작용 방식이 드러나게 쓴다.`]
      : []),
    "- interactionType은 게시글과 별개 의견이면 '독립 의견', 게시자에게 답을 요구하는 의문형이면 '질문', 게시자의 핵심 전제를 직접 뒤집으면 '반박'으로 분류한다.",
    "- 확인되지 않은 수치, 계약, 시장 사실, 과거 경력과 직원 관계를 만들지 않는다.",
    "- 제공된 활동·관계 기록은 연속성을 위한 참고 정보다. 이전 말을 기계적으로 반복하지 말고, 실제 기록에 없는 친밀도·갈등·사건을 덧붙이지 않는다.",
    ...(board === "anonymous"
      ? [
          "- 익명 채팅 응답에는 자신의 이름, 영문명, 직책, 소속 사업부·팀 또는 이를 추정할 수 있는 표현을 절대 쓰지 않는다.",
          "- 다른 직원의 검증된 이름·외형·현재 행동을 언급할 수 있지만, 작성자 자신을 특정하는 단서로 사용하지 않는다.",
          "- 보고서가 아니라 실제 사내 채팅처럼 말한다. 짧은 반응, 망설임, 구체적인 경험 장면, 가벼운 농담이나 질문을 캐릭터에 맞게 선택적으로 섞는다.",
          "- 첫 문장을 '내 생각에는', '제 생각에는', '개인적으로', '저는'으로 시작하지 않는다. 다른 참여자와 같은 도입부나 문장 틀을 반복하지 않는다.",
          "- coreOpinion, concerns, suggestion은 각각 접두어 없이 바로 읽혀도 자연스러운 채팅 문장으로 작성한다. suggestion을 매번 해결책이나 행동 지시로 끝내지 않아도 된다.",
        ]
      : []),
    ...(board === "public-feed"
      ? [
          "- 이 반응은 작성자가 되면 공개 피드의 원문으로 사용된다. 개인 프로필의 대표 콘텐츠 주제, 담당 업무와 일하는 방식을 중심축으로 삼아 독자가 가져갈 수 있는 관찰·판단 기준·실무 팁을 남긴다.",
          "- 막연한 조직 소개나 무영향한 안부가 아니라, 작성자의 전문성이 실제로 보이는 구체적 인사이트를 한 가지 이상 포함한다.",
          "- 중앙 조직의 분기 보고서처럼 쓰지 않는다. '제1분기' 같은 분기 표기, 전사 운영 현황, 인프라 고도화, 성과·실적·로드맵 공유 문구를 사용하지 않는다.",
          "- 주제에 맞춰 관찰 노트, 판단 기준, 비교 가이드, 제작 비하인드, 작은 실험, 큐레이션 중 한 가지 형식만 선택하고, 매번 같은 결론-우려-제안 보고서 틀로 보이지 않게 문장 연결을 바꾼다.",
          "- 대표 콘텐츠의 제목을 그대로 홍보하지 말고, 그 콘텐츠를 만드는 사람이 실제로 무엇을 보고 어떻게 판단하는지가 드러나게 쓴다.",
        ]
      : []),
    "- coreOpinion, concerns, suggestion은 저장 필드일 뿐이며, 화면에서 이어 읽었을 때 한 사람이 자연스럽게 쓴 하나의 발언이 되어야 한다.",
    "- 세 필드에서 같은 주장이나 게시글의 표현을 반복하지 않는다. concerns에는 핵심 우려 하나만, suggestion에는 다음 행동 하나만 둔다.",
    "- 전체 발언은 공백 포함 160~320자 정도로 제한한다. 특별한 이유가 없으면 각 필드는 한 문장만 쓴다.",
    "- '중요합니다', '필요합니다', '검토해야 합니다', '수 있습니다'를 연속해서 쓰는 범용 AI 보고서 문체를 피한다.",
    "- 이름, 직책, 소속을 자기소개처럼 반복하지 않는다.",
    "- 요청된 JSON Schema 이외의 설명을 반환하지 않는다.",
  ].join("\n");
}

export function createEmployeeReactionResponseSchema(
  employeeIds: readonly string[] = EMPLOYEE_REACTION_IDS,
  options?: {
    allowedStances?: readonly EmployeeReactionStance[];
    allowedInteractionTypes?: readonly EmployeeReactionInteractionType[];
  }
) {
  const allowedStances = options?.allowedStances ?? EMPLOYEE_REACTION_STANCES;
  const allowedInteractionTypes =
    options?.allowedInteractionTypes ?? EMPLOYEE_REACTION_INTERACTION_TYPES;
  return {
    type: "object",
    additionalProperties: false,
    required: ["reactions"],
    properties: {
      reactions: {
        type: "array",
        minItems: employeeIds.length,
        maxItems: employeeIds.length,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "employeeId",
            "stance",
            "interactionType",
            "coreOpinion",
            "concerns",
            "suggestion",
          ],
          properties: {
            employeeId: { type: "string", enum: [...employeeIds] },
            stance: {
              type: "string",
              enum: [...allowedStances],
            },
            interactionType: {
              type: "string",
              enum: [...allowedInteractionTypes],
            },
            coreOpinion: { type: "string", minLength: 20, maxLength: 140 },
            concerns: { type: "string", minLength: 15, maxLength: 100 },
            suggestion: { type: "string", minLength: 15, maxLength: 110 },
          },
        },
      },
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStance(value: unknown): value is EmployeeReactionStance {
  return EMPLOYEE_REACTION_STANCES.includes(
    value as EmployeeReactionStance
  );
}

function isInteractionType(
  value: unknown
): value is EmployeeReactionInteractionType {
  return EMPLOYEE_REACTION_INTERACTION_TYPES.includes(
    value as EmployeeReactionInteractionType
  );
}

export function parseEmployeeReactions(
  value: string,
  employeeIds: readonly string[] = EMPLOYEE_REACTION_IDS,
  options?: {
    allowedStances?: readonly EmployeeReactionStance[];
    allowedInteractionTypes?: readonly EmployeeReactionInteractionType[];
  }
): GeneratedEmployeeReaction[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new StructuredEmployeeReactionError(
      "Gemini 구조화 응답의 JSON을 해석하지 못했습니다."
    );
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.reactions) ||
    parsed.reactions.length !== employeeIds.length
  ) {
    throw new StructuredEmployeeReactionError(
      `Gemini 구조화 응답에 직원 반응 ${employeeIds.length}개가 필요합니다.`
    );
  }

  const reactions = parsed.reactions.map((reaction) => {
    if (
      !isRecord(reaction) ||
      !employeeIds.includes(String(reaction.employeeId)) ||
      !isStance(reaction.stance) ||
      (options?.allowedStances &&
        !options.allowedStances.includes(reaction.stance)) ||
      (options?.allowedInteractionTypes &&
        (!isInteractionType(reaction.interactionType) ||
          !options.allowedInteractionTypes.includes(reaction.interactionType))) ||
      !hasText(reaction.coreOpinion) ||
      !hasText(reaction.concerns) ||
      !hasText(reaction.suggestion)
    ) {
      throw new StructuredEmployeeReactionError(
        "Gemini 직원 반응의 필수 필드가 누락됐습니다."
      );
    }

    return {
      employeeId: reaction.employeeId as GeneratedEmployeeReaction["employeeId"],
      stance: reaction.stance,
      interactionType: isInteractionType(reaction.interactionType)
        ? reaction.interactionType
        : "독립 의견",
      coreOpinion: reaction.coreOpinion.trim(),
      concerns: reaction.concerns.trim(),
      suggestion: reaction.suggestion.trim(),
    };
  });

  if (
    new Set(reactions.map((reaction) => reaction.employeeId)).size !==
    employeeIds.length
  ) {
    throw new StructuredEmployeeReactionError(
      "Gemini 직원 반응에 직원 ID 중복 또는 누락이 있습니다."
    );
  }

  return employeeIds.map((employeeId) => {
    const reaction = reactions.find(
      (candidate) => candidate.employeeId === employeeId
    );
    if (!reaction) {
      throw new StructuredEmployeeReactionError(
        `${employeeId} 직원의 반응이 누락됐습니다.`
      );
    }
    return reaction;
  });
}

export function buildEmployeeAuthorReplySystemInstruction(input: {
  board: "public-feed";
  title: string;
  body: string;
  author: EmployeeReactionCanonical;
  authorOpinion: GeneratedEmployeeReaction;
  commenter: EmployeeReactionCanonical;
  comment: GeneratedEmployeeReaction;
}) {
  return [
    "당신은 PERSOS 공개 피드 게시글의 실제 게시자입니다.",
    "다른 사람인 척 새 댓글을 쓰지 말고, 아래 댓글에 게시자 본인 명의로 대댓글을 정확히 1회 작성하세요.",
    `게시글 제목: ${input.title}`,
    `게시글 본문: ${input.body}`,
    "",
    "게시자 Canonical:",
    buildEmployeeCanonicalBlock(input.author, input.board),
    "",
    `게시자의 원래 판단: ${input.authorOpinion.stance} / ${input.authorOpinion.coreOpinion} ${input.authorOpinion.concerns} ${input.authorOpinion.suggestion}`,
    `댓글 작성자: ${input.commenter.employee.nameKo}`,
    `댓글 유형: ${input.comment.interactionType ?? "독립 의견"}`,
    `댓글: ${input.comment.coreOpinion} ${input.comment.concerns} ${input.comment.suggestion}`,
    "",
    "대댓글 작성 규칙:",
    "- 게시자 Canonical의 말투와 판단 순서를 유지한다.",
    "- 질문이면 빠진 답을 직접 보완하고, 반박이면 타당한 지점을 인정한 뒤 게시자의 전제나 실행안을 더 정교하게 수정한다.",
    "- 원문이나 댓글을 요약하지 말고 새 정보, 조건 또는 보완 행동을 하나만 추가한다.",
    "- 방어적이거나 승부를 가리는 표현, 상대의 이름을 반복해 부르는 표현을 피한다.",
    "- 1~2문장, 공백 포함 45~160자의 자연스러운 한국어로 끝낸다.",
    "- 추가 질문을 던지거나 또 다른 대댓글을 예고하지 않는다.",
    "- 요청된 JSON Schema 이외의 설명을 반환하지 않는다.",
  ].join("\n");
}

export function createEmployeeAuthorReplyResponseSchema(
  parentEmployeeId: string
) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["parentEmployeeId", "content"],
    properties: {
      parentEmployeeId: { type: "string", enum: [parentEmployeeId] },
      content: { type: "string", minLength: 20, maxLength: 180 },
    },
  };
}

export function parseEmployeeAuthorReply(
  value: string,
  parentEmployeeId: string
): GeneratedEmployeeReply {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new StructuredEmployeeReactionError(
      "Gemini 게시자 대댓글 JSON을 해석하지 못했습니다."
    );
  }
  if (
    !isRecord(parsed) ||
    !EMPLOYEE_REACTION_IDS.includes(parentEmployeeId as never) ||
    parsed.parentEmployeeId !== parentEmployeeId ||
    !hasText(parsed.content)
  ) {
    throw new StructuredEmployeeReactionError(
      "Gemini 게시자 대댓글의 필수 필드가 누락됐습니다."
    );
  }
  return {
    parentEmployeeId:
      parentEmployeeId as GeneratedEmployeeReply["parentEmployeeId"],
    content: parsed.content.trim(),
  };
}

function buildAnonymousConversationEmployeeBrief(
  canonical: EmployeeReactionCanonical
) {
  const voice = getCharacterPromptProfile(canonical.employee);
  return [
    `직원 ID: ${canonical.employee.id}`,
    `성격: ${canonical.employee.personality}`,
    `말투: ${voice.speakingStyle}`,
    `첫 반응 방식: ${voice.openingMove}`,
    `문장 호흡: ${voice.sentenceRhythm}`,
    `고유 어휘: ${voice.signatureLanguage}`,
    `피할 표현: ${voice.avoid}`,
  ].join("\n");
}

export function buildAnonymousConversationSystemInstruction(input: {
  title: string;
  body: string;
  employees: EmployeeReactionCanonical[];
  draftReactions: GeneratedEmployeeReaction[];
}) {
  const draftByEmployeeId = new Map<string, GeneratedEmployeeReaction>(
    input.draftReactions.map((reaction) => [reaction.employeeId, reaction])
  );
  return [
    "당신은 PERSOS 전사원 익명 채팅의 대화 편집자입니다.",
    "직원별 독립 초안을 보고 실제 여러 사람이 같은 채팅방에서 순서대로 반응한 것처럼 대화를 다시 구성하세요.",
    `주제: ${input.title}`,
    `안내: ${input.body}`,
    "",
    "참여 직원의 비공개 작성 맥락:",
    ...input.employees.map((canonical, index) => {
      const draft = draftByEmployeeId.get(canonical.employee.id);
      return [
        `[참여자 ${index + 1}]`,
        buildAnonymousConversationEmployeeBrief(canonical),
        `독립 초안: ${draft?.coreOpinion ?? ""} ${draft?.concerns ?? ""} ${draft?.suggestion ?? ""}`,
      ].join("\n");
    }),
    "",
    "대화 구성 규칙:",
    "- 전체 6~9개 메시지를 시간순으로 만든다. 각 직원은 1~4회 발언하되 모두 같은 횟수로 맞추지 않는다.",
    "- 첫 메시지부터 세 직원이 차례대로 발표하는 구조를 피한다. 짧은 맞장구, 질문, 반론, 경험 한 조각, 농담, 말끝 흐리기 등을 상황에 맞게 섞는다.",
    "- 최소 2개 메시지는 이전의 다른 직원 메시지에 답한다. 자기 메시지에 답하거나 아직 나오지 않은 메시지를 참조하지 않는다.",
    "- 답글은 상대 문장의 구체적인 단어나 관점을 실제로 이어받아야 한다. 서로 무관한 독립 의견을 답글처럼 연결하지 않는다.",
    "- 모든 사람이 결론이나 해결책을 제시할 필요는 없다. 질문만 남기거나 짧게 공감하고 끝나는 발언도 허용한다.",
    "- 한 메시지는 공백 포함 8~110자로 쓰고, 짧은 메시지와 긴 메시지를 섞는다. 보고서형 3단 구성과 비슷한 문장 길이의 반복을 금지한다.",
    "- '내 생각에는', '제 생각에는', '개인적으로', '저는', '중요합니다', '필요합니다'로 시작하지 않는다.",
    "- 직원의 실명, 영문명, 직책, 소속, 직원 ID를 content에 절대 쓰지 않는다. employeeId는 구조화 필드에만 기록한다.",
    "- 독립 초안의 의미는 활용하되 문장을 그대로 세 조각으로 옮기거나 모든 내용을 억지로 소비하지 않는다.",
    "- turnId는 등장 순서대로 turn-1, turn-2 형식으로 작성한다. replyToTurnId가 없으면 해당 필드를 생략한다.",
    "- 요청된 JSON Schema 이외의 설명은 반환하지 않는다.",
  ].join("\n");
}

export function createAnonymousConversationResponseSchema(
  employeeIds: readonly string[]
) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["turns"],
    properties: {
      turns: {
        type: "array",
        minItems: 6,
        maxItems: 9,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["turnId", "employeeId", "content"],
          properties: {
            turnId: { type: "string", minLength: 6, maxLength: 20 },
            employeeId: { type: "string", enum: [...employeeIds] },
            content: { type: "string", minLength: 8, maxLength: 110 },
            replyToTurnId: { type: "string", minLength: 6, maxLength: 20 },
          },
        },
      },
    },
  };
}

export function parseAnonymousConversation(
  value: string,
  employeeIds: readonly string[]
): GeneratedAnonymousTurn[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new StructuredEmployeeReactionError(
      "Gemini 익명 대화 JSON을 해석하지 못했습니다."
    );
  }
  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.turns) ||
    parsed.turns.length < 6 ||
    parsed.turns.length > 9
  ) {
    throw new StructuredEmployeeReactionError(
      "Gemini 익명 대화에는 6~9개의 메시지가 필요합니다."
    );
  }

  const rawTurns = parsed.turns as unknown[];
  const seenTurnIds = new Set<string>();
  const participantCounts = new Map(employeeIds.map((id) => [id, 0]));
  let replyCount = 0;
  const turns = rawTurns.map((turn) => {
    if (
      !isRecord(turn) ||
      !hasText(turn.turnId) ||
      seenTurnIds.has(turn.turnId) ||
      !employeeIds.includes(String(turn.employeeId)) ||
      !hasText(turn.content) ||
      turn.content.trim().length < 8 ||
      turn.content.trim().length > 110 ||
      (turn.replyToTurnId !== undefined && !hasText(turn.replyToTurnId))
    ) {
      throw new StructuredEmployeeReactionError(
        "Gemini 익명 대화 메시지 형식이 올바르지 않습니다."
      );
    }
    const replyToTurnId = hasText(turn.replyToTurnId)
      ? turn.replyToTurnId
      : undefined;
    if (replyToTurnId) {
      const parent = rawTurns.find(
        (candidate) =>
          isRecord(candidate) && candidate.turnId === replyToTurnId
      );
      if (
        !seenTurnIds.has(replyToTurnId) ||
        !isRecord(parent) ||
        parent.employeeId === turn.employeeId
      ) {
        throw new StructuredEmployeeReactionError(
          "익명 대화 답글은 앞서 나온 다른 직원 메시지만 참조할 수 있습니다."
        );
      }
      replyCount += 1;
    }
    seenTurnIds.add(turn.turnId);
    participantCounts.set(
      String(turn.employeeId),
      (participantCounts.get(String(turn.employeeId)) ?? 0) + 1
    );
    return {
      turnId: turn.turnId,
      employeeId:
        turn.employeeId as GeneratedAnonymousTurn["employeeId"],
      content: turn.content.trim(),
      ...(replyToTurnId ? { replyToTurnId } : {}),
    };
  });

  if (
    [...participantCounts.values()].some((count) => count < 1 || count > 4) ||
    replyCount < 2
  ) {
    throw new StructuredEmployeeReactionError(
      "익명 대화의 참여 횟수 또는 답글 수가 정책과 맞지 않습니다."
    );
  }
  return turns;
}
