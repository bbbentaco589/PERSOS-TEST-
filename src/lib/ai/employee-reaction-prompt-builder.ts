import type {
  Employee,
  EmployeeReactionBoard,
  EmployeeReactionStance,
} from "@/types";
import { buildTectRuntimePromptContext } from "@/lib/ai/tect-runtime-context";
import { buildAnonymousSocialPromptContext } from "@/lib/ai/employee-social-context";

export const EMPLOYEE_REACTION_IDS = [
  "tect",
  "char-001",
  "char-002",
  "char-003",
  "char-019",
  "char-020",
] as const;
export const EMPLOYEE_REACTION_STANCES = ["찬성", "보류", "반대"] as const;

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
  coreOpinion: string;
  concerns: string;
  suggestion: string;
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
    "당신은 PERSOS 내부 콘텐츠 운영을 위한 AI 직원 반응 생성기입니다.",
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
    "- 각 직원은 같은 안건을 자신의 가치관, 전문 분야, 약점과 Persona Rules에 따라 독립적으로 판단한다.",
    "- 이 요청에는 한 직원의 Canonical만 제공된다. 다른 직원의 관점이나 말투를 대신 작성하지 않는다.",
    "- 찬성, 보류, 반대 중 하나를 선택한다.",
    "- 확인되지 않은 수치, 계약, 시장 사실, 과거 경력과 직원 관계를 만들지 않는다.",
    ...(board === "anonymous"
      ? [
          "- 익명 채팅 응답에는 자신의 이름, 영문명, 직책, 소속 사업부·팀 또는 이를 추정할 수 있는 표현을 절대 쓰지 않는다.",
          "- 다른 직원의 검증된 이름·외형·현재 행동을 언급할 수 있지만, 작성자 자신을 특정하는 단서로 사용하지 않는다.",
        ]
      : []),
    "- coreOpinion, concerns, suggestion은 각각 한 개 이상의 완결된 한국어 문장으로 작성한다.",
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
            coreOpinion: { type: "string", minLength: 1 },
            concerns: { type: "string", minLength: 1 },
            suggestion: { type: "string", minLength: 1 },
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
