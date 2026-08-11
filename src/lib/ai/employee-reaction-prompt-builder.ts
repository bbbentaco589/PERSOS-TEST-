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
export const EMPLOYEE_REACTION_INTERACTION_TYPES = [
  "독립 의견",
  "질문",
  "반박",
] as const;

export type EmployeeReactionCanonical = {
  employee: Employee;
  divisionName: string;
  teamName: string;
};

export type EmployeeReactionPromptInput = {
  board: EmployeeReactionBoard;
  title: string;
  body: string;
  employees: EmployeeReactionCanonical[];
  socialParticipants?: EmployeeReactionCanonical[];
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
      "AI 직원의 업무, 의견, 제작 과정과 실무 인사이트를 외부 방문자가 읽는 공개 피드다.",
    presentationRule:
      "공개 게시글에 적합한 설명형 문장으로 작성하고 확인되지 않은 내부 사실은 만들지 않는다.",
  },
  debate: {
    label: "전사원 찬반 토론",
    purpose:
      "하나의 전사 안건을 두고 직원들이 찬성, 보류, 반대 입장에서 논거를 제시하는 공개 토론이다.",
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
    "고유 Voice Direction:",
    `- 말투: ${voice.speakingStyle}`,
    `- 판단 순서: ${voice.judgmentGuide}`,
    `- 첫 문장: ${voice.openingMove}`,
    `- 문장 호흡: ${voice.sentenceRhythm}`,
    `- 고유 어휘: ${voice.signatureLanguage}`,
    `- 필드별 역할: ${voice.fieldStrategy}`,
    `- 문맥 적합성: ${voice.contextRule}`,
    `- 피할 표현: ${voice.avoid}`,
    "직원 관계: Canonical에 구조화된 관계 정보가 없으므로 추측하거나 생성하지 않는다.",
    employee.id === "tect" ? buildTectRuntimePromptContext(board) : "",
  ].filter(Boolean).join("\n");
}

export function buildEmployeeReactionSystemInstruction({
  board,
  title,
  body,
  employees,
  socialParticipants = employees,
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
    "- 찬성, 보류, 반대 중 하나를 선택한다.",
    "- interactionType은 게시글과 별개 의견이면 '독립 의견', 게시자에게 답을 요구하는 의문형이면 '질문', 게시자의 핵심 전제를 직접 뒤집으면 '반박'으로 분류한다.",
    "- 확인되지 않은 수치, 계약, 시장 사실, 과거 경력과 직원 관계를 만들지 않는다.",
    ...(board === "anonymous"
      ? [
          "- 익명 채팅 응답에는 자신의 이름, 영문명, 직책, 소속 사업부·팀 또는 이를 추정할 수 있는 표현을 절대 쓰지 않는다.",
          "- 다른 직원의 검증된 이름·외형·현재 행동을 언급할 수 있지만, 작성자 자신을 특정하는 단서로 사용하지 않는다.",
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
  employeeIds: readonly string[] = EMPLOYEE_REACTION_IDS
) {
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
              enum: [...EMPLOYEE_REACTION_STANCES],
            },
            interactionType: {
              type: "string",
              enum: [...EMPLOYEE_REACTION_INTERACTION_TYPES],
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
  employeeIds: readonly string[] = EMPLOYEE_REACTION_IDS
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
