import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_MODEL } from "@/lib/ai/config";

import {
  buildEmployeeReactionSystemInstruction,
  buildEmployeeAuthorReplySystemInstruction,
  createEmployeeAuthorReplyResponseSchema,
  createEmployeeReactionResponseSchema,
  EMPLOYEE_REACTION_IDS,
  parseEmployeeReactions,
  parseEmployeeAuthorReply,
} from "@/lib/ai/employee-reaction-prompt-builder";
import type { OrganizationRunTopic } from "@/types";
import {
  MAX_AUTOMATED_ORGANIZATION_RUN_PARTICIPANTS,
  MIN_AUTOMATED_ORGANIZATION_RUN_PARTICIPANTS,
} from "./policy";

import type { OrganizationRunGenerator } from "./types";

const BOARD_TYPES = ["public", "debate", "anonymous"] as const;

const topicSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "boardType",
    "title",
    "body",
    "topicSummary",
    "reasonForBoardSelection",
    "relevantEmployeeIds",
    "sourceUrls",
  ],
  properties: {
    boardType: { type: "string", enum: [...BOARD_TYPES] },
    title: { type: "string", minLength: 12, maxLength: 120 },
    body: { type: "string", minLength: 80, maxLength: 1800 },
    topicSummary: { type: "string", minLength: 20, maxLength: 300 },
    reasonForBoardSelection: { type: "string", minLength: 10, maxLength: 300 },
    relevantEmployeeIds: {
      type: "array",
      minItems: MIN_AUTOMATED_ORGANIZATION_RUN_PARTICIPANTS,
      maxItems: MAX_AUTOMATED_ORGANIZATION_RUN_PARTICIPANTS,
      uniqueItems: true,
      items: {
        type: "string",
        enum: [...EMPLOYEE_REACTION_IDS],
      },
    },
    sourceUrls: {
      type: "array",
      minItems: 0,
      maxItems: 5,
      uniqueItems: true,
      items: { type: "string" },
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTopic(value: string): OrganizationRunTopic {
  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    !BOARD_TYPES.includes(parsed.boardType as never) ||
    typeof parsed.title !== "string" ||
    typeof parsed.body !== "string" ||
    typeof parsed.topicSummary !== "string" ||
    typeof parsed.reasonForBoardSelection !== "string" ||
    !Array.isArray(parsed.relevantEmployeeIds) ||
    !parsed.relevantEmployeeIds.every((id) => typeof id === "string") ||
    !Array.isArray(parsed.sourceUrls) ||
    !parsed.sourceUrls.every((url) => typeof url === "string")
  ) {
    throw new Error("Gemini Topic 응답 구조가 올바르지 않습니다.");
  }
  return {
    boardType: parsed.boardType as OrganizationRunTopic["boardType"],
    title: parsed.title.trim(),
    body: parsed.body.trim(),
    topicSummary: parsed.topicSummary.trim(),
    reasonForBoardSelection: parsed.reasonForBoardSelection.trim(),
    relevantEmployeeIds: parsed.relevantEmployeeIds,
    sourceUrls: parsed.sourceUrls.map((url) => url.trim()).filter(Boolean),
  };
}

function getTimeoutMs() {
  const value = Number(process.env.GEMINI_TIMEOUT_MS ?? 30_000);
  return Number.isFinite(value) && value >= 1_000 && value <= 120_000
    ? value
    : 30_000;
}

export class GeminiOrganizationRunGenerator
  implements OrganizationRunGenerator
{
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(
    apiKey: string,
    private readonly jsonExecutor?: (input: {
      prompt: string;
      systemInstruction: string;
      schema: Record<string, unknown>;
      maxOutputTokens: number;
    }) => Promise<string>
  ) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  }

  private async generateJson(input: {
    prompt: string;
    systemInstruction: string;
    schema: Record<string, unknown>;
    maxOutputTokens: number;
  }) {
    if (this.jsonExecutor) return this.jsonExecutor(input);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: input.prompt,
        config: {
          abortSignal: controller.signal,
          systemInstruction: input.systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: input.schema,
          temperature: 0.62,
          maxOutputTokens: input.maxOutputTokens,
        },
      });
      const text = result.text?.trim();
      if (!text) throw new Error("Gemini가 빈 응답을 반환했습니다.");
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateTopic({
    existingSummaries,
    forcedBoardType,
  }: Parameters<OrganizationRunGenerator["generateTopic"]>[0]) {
    const forcedRule = forcedBoardType
      ? `내부 QA 검증을 위해 boardType은 반드시 "${forcedBoardType}"으로 선택하세요.`
      : "주제 성격에 가장 적합한 boardType을 스스로 선택하세요.";
    const recentTopics = existingSummaries.length
      ? existingSummaries.slice(0, 30).map((item) => `- ${item}`).join("\n")
      : "- 아직 동적 발행 주제가 없습니다.";

    const text = await this.generateJson({
      prompt: [
        "PERSOS 공개형 AI Company 인트라넷에 지금 발행할 신규 주제 1건을 작성하세요.",
        forcedRule,
        "",
        "최근 공개 주제:",
        recentTopics,
      ].join("\n"),
      systemInstruction: [
        "당신은 PERSOS의 중앙 System Persona인 Architect입니다.",
        "직원 반응 참여자가 아니라 주제의 품질, 게시판 적합성, 중복 여부만 조정합니다.",
        "public은 조직 정책·운영 현황·투명성·서비스 방향의 전사 공유 콘텐츠입니다.",
        "debate는 찬반 또는 판단 차이가 가치 있는 의사결정 안건입니다.",
        "anonymous는 조직 내부 고민·갈등·업무 불편뿐 아니라 상황에 따라 안부·농담·칭찬·취향 질문·업무 후일담 같은 가벼운 소통도 자율적으로 선택할 수 있습니다. 사적 대화를 매번 강제하지 마세요.",
        "PERSOS AI 조직 운영과 인간-AI 협업 범위 안의 실제 방문 가치가 있는 한국어 콘텐츠만 작성하세요.",
        "테스트, 샘플, 임시 문구와 기존 주제의 반복을 금지합니다.",
        "참여 직원은 tect, char-001(SIG), char-002(박봉남), char-003(LUMI), char-019(PIXEUR), char-020(오덕순) 중 주제와 관련된 2~3명을 선택하세요.",
        "TECT는 기본 참여자가 아니다. 직무 관련성이 명확할 때만 선택하고 모든 주제에 강제 배정하지 마세요.",
        "공개적으로 확인 가능한 사실 근거가 있으면 sourceUrls에 HTTPS URL을 최대 5개 기록하고, 확실한 출처가 없으면 빈 배열을 반환하세요.",
        "Architect를 참여 직원으로 선택하지 마세요.",
        "지정된 JSON Schema 이외의 설명은 반환하지 마세요.",
      ].join("\n"),
      schema: topicSchema,
      maxOutputTokens: 1_400,
    });

    return parseTopic(text);
  }

  async generateReactions({
    topic,
    employees,
  }: Parameters<OrganizationRunGenerator["generateReactions"]>[0]) {
    const board = topic.boardType === "public" ? "public-feed" : topic.boardType;
    const independentResults = await Promise.all(
      employees.map(async (employee) => {
        const employeeIds = [employee.employee.id];
        const text = await this.generateJson({
          prompt: `게시글 제목:\n${topic.title}\n\n게시글 본문:\n${topic.body}`,
          systemInstruction: buildEmployeeReactionSystemInstruction({
            board,
            title: topic.title,
            body: topic.body,
            employees: [employee],
            socialParticipants: employees,
          }),
          schema: createEmployeeReactionResponseSchema(employeeIds),
          maxOutputTokens: 900,
        });
        return parseEmployeeReactions(text, employeeIds)[0];
      })
    );
    return independentResults;
  }

  async generateAuthorReplies({
    topic,
    author,
    authorOpinion,
    comments,
  }: Parameters<NonNullable<OrganizationRunGenerator["generateAuthorReplies"]>>[0]) {
    return Promise.all(
      comments.map(async ({ commenter, comment }) => {
        const text = await this.generateJson({
          prompt: `댓글 작성자 ID: ${commenter.employee.id}\n댓글 유형: ${comment.interactionType ?? "독립 의견"}`,
          systemInstruction: buildEmployeeAuthorReplySystemInstruction({
            board: "public-feed",
            title: topic.title,
            body: topic.body,
            author,
            authorOpinion,
            commenter,
            comment,
          }),
          schema: createEmployeeAuthorReplyResponseSchema(
            commenter.employee.id
          ),
          maxOutputTokens: 320,
        });
        return parseEmployeeAuthorReply(text, commenter.employee.id);
      })
    );
  }
}
