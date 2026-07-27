import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE_LENGTH = 4_000;
const STANCES = ["찬성", "보류", "반대"] as const;
const EMPLOYEES = [
  {
    id: "tect",
    name: "TECT",
    role: "사업개발 및 제휴 담당",
    direction:
      "현실적이며 사업성, 실행 가능성, 수익 구조와 외부 협력 조건을 중심으로 판단한다.",
  },
  {
    id: "architect",
    name: "Architect",
    role: "시스템 및 조직 설계 담당",
    direction:
      "구조적이며 장기 확장성, 정책 일관성, 시스템 경계와 아키텍처 영향을 중심으로 판단한다.",
  },
  {
    id: "park-bongnam",
    name: "박봉남",
    role: "일반 직원 관점의 실무 피드백 담당",
    direction:
      "직설적이며 실제 사용성, 현장 업무 부담, 반복되는 불편과 운영 현실을 중심으로 판단한다.",
  },
] as const;

type EmployeeId = (typeof EMPLOYEES)[number]["id"];
type Stance = (typeof STANCES)[number];
type GeneratedReaction = {
  employeeId: EmployeeId;
  stance: Stance;
  coreOpinion: string;
  concerns: string;
  suggestion: string;
};

class StructuredResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StructuredResponseError";
  }
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reactions"],
  properties: {
    reactions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
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
          employeeId: {
            type: "string",
            enum: EMPLOYEES.map((employee) => employee.id),
          },
          stance: { type: "string", enum: [...STANCES] },
          coreOpinion: { type: "string", minLength: 1 },
          concerns: { type: "string", minLength: 1 },
          suggestion: { type: "string", minLength: 1 },
        },
      },
    },
  },
};

function getTimeoutMs() {
  const value = Number(process.env.GEMINI_TIMEOUT_MS ?? 30_000);
  return Number.isFinite(value) && value >= 1_000 && value <= 120_000
    ? value
    : 30_000;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmployeeId(value: unknown): value is EmployeeId {
  return EMPLOYEES.some((employee) => employee.id === value);
}

function isStance(value: unknown): value is Stance {
  return STANCES.includes(value as Stance);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseReactions(value: string): GeneratedReaction[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new StructuredResponseError(
      "Gemini 구조화 응답의 JSON을 해석하지 못했습니다."
    );
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.reactions) ||
    parsed.reactions.length !== EMPLOYEES.length
  ) {
    throw new StructuredResponseError(
      "Gemini 구조화 응답에 직원 반응 3개가 필요합니다."
    );
  }

  const reactions = parsed.reactions.map((reaction): GeneratedReaction => {
    if (
      !isRecord(reaction) ||
      !isEmployeeId(reaction.employeeId) ||
      !isStance(reaction.stance) ||
      !hasText(reaction.coreOpinion) ||
      !hasText(reaction.concerns) ||
      !hasText(reaction.suggestion)
    ) {
      throw new StructuredResponseError(
        "Gemini 직원 반응의 필수 필드가 누락됐습니다."
      );
    }

    return {
      employeeId: reaction.employeeId,
      stance: reaction.stance,
      coreOpinion: reaction.coreOpinion.trim(),
      concerns: reaction.concerns.trim(),
      suggestion: reaction.suggestion.trim(),
    };
  });

  if (new Set(reactions.map((reaction) => reaction.employeeId)).size !== EMPLOYEES.length) {
    throw new StructuredResponseError(
      "Gemini 직원 반응에 직원 ID 중복 또는 누락이 있습니다."
    );
  }

  return EMPLOYEES.map((employee) => {
    const reaction = reactions.find((item) => item.employeeId === employee.id);
    if (!reaction) {
      throw new StructuredResponseError(
        `${employee.name}의 반응이 누락됐습니다.`
      );
    }
    return reaction;
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문은 올바른 JSON이어야 합니다." },
      { status: 400 }
    );
  }

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return NextResponse.json(
      { error: "메시지를 입력해 주세요." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `메시지는 ${MAX_MESSAGE_LENGTH.toLocaleString("ko-KR")}자 이하여야 합니다.` },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const client = new GoogleGenAI({ apiKey });
    const result = await client.models.generateContent({
      model,
      contents: `검토 안건:\n${message}`,
      config: {
        abortSignal: controller.signal,
        systemInstruction: [
          "당신은 PERSOS Investor Live Demo의 직원 반응 생성기입니다.",
          "입력된 하나의 안건을 아래 세 직원이 각자의 직무와 성향에 따라 독립적으로 검토하게 하세요.",
          ...EMPLOYEES.map(
            (employee) =>
              `- ${employee.id} / ${employee.name} / ${employee.role}: ${employee.direction}`
          ),
          "세 반응은 서로 다른 관점과 어조를 보여야 합니다.",
          "확인되지 않은 수치나 실제 계약·시장 사실을 만들어내지 마세요.",
          "각 직원에 대해 찬성·보류·반대 중 하나, 핵심 의견, 우려 사항, 실행 가능한 제안을 간결한 한국어로 작성하세요.",
          "요청된 JSON Schema 이외의 설명은 반환하지 마세요.",
        ].join("\n"),
        responseMimeType: "application/json",
        responseJsonSchema: responseSchema,
        temperature: 0.65,
        maxOutputTokens: 1_800,
      },
    });
    const responseText = result.text?.trim();

    if (!responseText) {
      return NextResponse.json(
        { error: "Gemini가 비어 있는 응답을 반환했습니다." },
        { status: 502 }
      );
    }

    const reactions = parseReactions(responseText).map((reaction) => {
      const employee = EMPLOYEES.find(
        (item) => item.id === reaction.employeeId
      );
      if (!employee) {
        throw new StructuredResponseError(
          "직원 Canonical 정보를 찾지 못했습니다."
        );
      }
      return {
        ...reaction,
        name: employee.name,
        role: employee.role,
      };
    });

    return NextResponse.json({ reactions });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || /abort|timeout/i.test(error.message));

    const isStructuredResponseError = error instanceof StructuredResponseError;

    console.error(
      "[Gemini chat] request failed:",
      isTimeout
        ? "request timeout"
        : isStructuredResponseError
          ? "invalid structured response"
          : error instanceof Error
            ? error.message
            : "unknown error"
    );

    return NextResponse.json(
      {
        error: isTimeout
          ? "Gemini 응답 시간이 초과되었습니다."
          : isStructuredResponseError
            ? error.message
          : "Gemini 응답을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
