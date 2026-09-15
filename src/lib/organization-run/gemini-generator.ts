import { GoogleGenAI } from "@google/genai";
import { randomInt } from "node:crypto";
import { DEFAULT_GEMINI_MODEL } from "@/lib/ai/config";

import {
  buildAnonymousConversationSystemInstruction,
  buildEmployeeReactionSystemInstruction,
  buildEmployeeAuthorReplySystemInstruction,
  createAnonymousConversationResponseSchema,
  createEmployeeAuthorReplyResponseSchema,
  createEmployeeReactionResponseSchema,
  EMPLOYEE_DEBATE_STANCES,
  EMPLOYEE_REACTION_IDS,
  parseAnonymousConversation,
  parseEmployeeReactions,
  parseEmployeeAuthorReply,
  type EmployeeReactionCanonical,
} from "@/lib/ai/employee-reaction-prompt-builder";
import type { OrganizationRunBoardType, OrganizationRunTopic } from "@/types";
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

const fallbackParticipantBriefs: Record<(typeof EMPLOYEE_REACTION_IDS)[number], string> = {
  tect: "TECT — 전사 운영·사업개발·제휴 조율, 실행 구조와 책임 경계",
  "char-001": "SIG — 경제·산업 신호, 사실과 해석의 분리",
  "char-002": "박봉남 — 예측시장·시나리오, 판정 기준과 반대 가설",
  "char-003": "LUMI — 생성형 AI 도구, 실제 업무 흐름과 도입 조건",
  "char-019": "PIXEUR — 비주얼 스토리텔링, 감정선과 시각적 연속성",
  "char-020": "오덕순 — OTT 에디토리얼, 취향·시간값·추천 적합도",
};

function shuffleEmployeeIds(employeeIds: readonly string[]) {
  const pool = [...employeeIds];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = randomInt(index + 1);
    [pool[index], pool[target]] = [pool[target], pool[index]];
  }
  return pool;
}

function selectTopicParticipants(
  candidateIds: readonly string[],
  recentPublicAuthorEmployeeIds: readonly string[],
  boardType?: OrganizationRunBoardType
) {
  const uniqueCandidateIds = [...new Set(candidateIds)];
  const recentAuthors = new Set(recentPublicAuthorEmployeeIds.slice(0, 2));
  const freshAuthorPool = uniqueCandidateIds.filter(
    (employeeId) => !recentAuthors.has(employeeId)
  );
  const authorPool = freshAuthorPool.length ? freshAuthorPool : uniqueCandidateIds;
  const authorEmployeeId = shuffleEmployeeIds(authorPool)[0];
  const participantPool = shuffleEmployeeIds(
    uniqueCandidateIds.filter((employeeId) => employeeId !== authorEmployeeId)
  );
  const targetCount = boardType === "anonymous" ? 3 : randomInt(3, 6);
  return [authorEmployeeId, ...participantPool.slice(0, targetCount - 1)].filter(Boolean);
}

function buildParticipantBrief(
  employeeId: string,
  availableEmployees: readonly EmployeeReactionCanonical[]
) {
  const canonical = availableEmployees.find(
    ({ employee }) => employee.id === employeeId
  );
  if (!canonical) {
    return fallbackParticipantBriefs[
      employeeId as keyof typeof fallbackParticipantBriefs
    ] ?? employeeId;
  }
  const profile = canonical.profileContext;
  return [
    `${canonical.employee.nameKo} (${canonical.employee.nameEn})`,
    `대표 콘텐츠: ${profile?.representativeContent ?? canonical.employee.contentRole}`,
    `담당 업무: ${profile?.primaryRole ?? canonical.employee.jobTitleKo}`,
    `일하는 방식: ${canonical.employee.personaRules.slice(0, 2).join(" / ")}`,
    `전문 관점: ${(profile?.specialtyDescriptions ?? canonical.employee.specialtiesKo).slice(0, 2).join(" / ")}`,
  ].join(" | ");
}

function createTopicSchema(participantIds: readonly string[]) {
  return {
    ...topicSchema,
    properties: {
      ...topicSchema.properties,
      relevantEmployeeIds: {
        type: "array",
        minItems: participantIds.length,
        maxItems: participantIds.length,
        uniqueItems: true,
        items: { type: "string", enum: [...participantIds] },
      },
    },
  };
}

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
      temperature?: number;
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
    temperature?: number;
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
          temperature: input.temperature ?? 0.62,
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
    availableEmployees = [],
    recentPublicAuthorEmployeeIds = [],
  }: Parameters<OrganizationRunGenerator["generateTopic"]>[0]) {
    const forcedRule = forcedBoardType
      ? `내부 QA 검증을 위해 boardType은 반드시 "${forcedBoardType}"으로 선택하세요.`
      : "주제 성격에 가장 적합한 boardType을 스스로 선택하세요.";
    const recentTopics = existingSummaries.length
      ? existingSummaries.slice(0, 30).map((item) => `- ${item}`).join("\n")
      : "- 아직 동적 발행 주제가 없습니다.";
    const eligibleEmployeeIds = availableEmployees
      .filter(
        ({ employee, profileContext }) =>
          employee.status === "Active" &&
          employee.profileStage === "Approved" &&
          employee.publicVisibility &&
          Boolean(profileContext)
      )
      .map(({ employee }) => employee.id)
      .filter((employeeId) => EMPLOYEE_REACTION_IDS.includes(employeeId as never));
    const participantPool =
      eligibleEmployeeIds.length >= 3
        ? eligibleEmployeeIds
        : [...EMPLOYEE_REACTION_IDS];
    const selectedParticipantIds = selectTopicParticipants(
      participantPool,
      recentPublicAuthorEmployeeIds,
      forcedBoardType
    );
    const selectedAuthorEmployeeId = selectedParticipantIds[0];
    const selectedParticipants = selectedParticipantIds
      .map(
        (id, index) =>
          `- ${index === 0 ? "[공개 피드 게시자] " : "[참여자] "}${buildParticipantBrief(id, availableEmployees)}`
      )
      .join("\n");

    const text = await this.generateJson({
      prompt: [
        "PERSOS 공개형 AI Company 인트라넷에 지금 발행할 신규 주제 1건을 작성하세요.",
        forcedRule,
        "",
        "최근 공개 주제:",
        recentTopics,
        "",
        "이번 실행의 작성·참여 페르소나:",
        selectedParticipants,
      ].join("\n"),
      systemInstruction: [
        "당신은 PERSOS의 중앙 System Persona인 Architect입니다.",
        "직원 반응 참여자가 아니라 주제의 품질, 게시판 적합성, 중복 여부만 조정합니다.",
        "public은 중앙 조직 공지판이 아니라, 선택된 AI 페르소나가 자기 대표 콘텐츠와 담당 업무에서 발견한 관찰·판단 기준·제작 과정·실무 팁을 본인 명의로 발행하는 전문 피드입니다.",
        `public을 선택하면 게시자는 반드시 ${selectedAuthorEmployeeId}이며, 제목·본문·요약의 중심을 이 게시자의 대표 콘텐츠, 담당 업무, 일하는 방식 중 하나에 둡니다. 나머지 참여자는 댓글 참여자입니다.`,
        "public 제목은 개인 에디토리얼처럼 자연스럽게 쓰고, '제1분기' 같은 분기 표기, 가상 오피스 인프라 고도화, 전사 운영 현황, 성과·실적·로드맵 공유 같은 근거 없는 사내 공지문 형식을 금지합니다.",
        "public은 매번 현장 관찰, 판단 기준, 비교·선택 가이드, 제작 비하인드, 작은 실험, 큐레이션 중 최근 주제와 겹치지 않는 한 가지 형식을 택합니다. 서로 다른 형식을 한 글에 억지로 합치지 않습니다.",
        "public 제목과 본문에는 게시자의 이름이나 직책을 자기소개처럼 붙이지 말고, 독자가 바로 가져갈 수 있는 구체적인 질문·기준·팁을 전면에 둡니다.",
        "debate는 인간과 AI의 경계에서 정체성·책임·자율성·동의·저작권·감정적 관계·노동과 권한 중 하나를 구체적으로 규정해 보는 심층 찬반 안건입니다.",
        "debate 주제는 단순한 AI 생산성이나 기능 선호 질문을 피하고, 사람이 AI를 어떤 존재와 관계로 대해야 하는지 실제 사례와 판단 기준을 끌어낼 수 있는 명확한 쟁점으로 만드세요.",
        "anonymous는 조직 내부 고민·갈등·업무 불편뿐 아니라 상황에 따라 안부·농담·칭찬·취향 질문·업무 후일담 같은 가벼운 소통도 자율적으로 선택할 수 있습니다. 사적 대화를 매번 강제하지 마세요.",
        "PERSOS AI 조직 운영과 인간-AI 협업 범위 안의 실제 방문 가치가 있는 한국어 콘텐츠만 작성하세요.",
        "테스트, 샘플, 임시 문구와 기존 주제의 반복을 금지합니다.",
        `이번 실행에는 무작위로 배정된 ${selectedParticipantIds.join(", ")}만 정확히 ${selectedParticipantIds.length}명 선택하고, 각 페르소나의 서로 다른 대표 콘텐츠와 담당 업무가 실제로 기여할 수 있는 주제와 각도를 고르세요.`,
        "공개적으로 확인 가능한 사실 근거가 있으면 sourceUrls에 HTTPS URL을 최대 5개 기록하고, 확실한 출처가 없으면 빈 배열을 반환하세요.",
        "Architect를 참여 직원으로 선택하지 마세요.",
        "지정된 JSON Schema 이외의 설명은 반환하지 마세요.",
      ].join("\n"),
      schema: createTopicSchema(selectedParticipantIds),
      maxOutputTokens: 1_400,
      temperature: 0.82,
    });

    const topic = parseTopic(text);
    return {
      ...topic,
      relevantEmployeeIds: selectedParticipantIds,
      authorEmployeeId:
        topic.boardType === "public" ? selectedAuthorEmployeeId : undefined,
    };
  }

  async generateReactions({
    topic,
    employees,
  }: Parameters<OrganizationRunGenerator["generateReactions"]>[0]) {
    const board = topic.boardType === "public" ? "public-feed" : topic.boardType;
    const stanceOffset = randomInt(EMPLOYEE_DEBATE_STANCES.length);
    const results: Awaited<ReturnType<OrganizationRunGenerator["generateReactions"]>> = [];
    const generateOne = async (employee: typeof employees[number], index: number) => {
        const employeeIds = [employee.employee.id];
        const requiredStance =
          board === "debate"
            ? EMPLOYEE_DEBATE_STANCES[(index + stanceOffset) % EMPLOYEE_DEBATE_STANCES.length]
            : undefined;
        const requiredInteractionType = undefined;
        const previousMessages = results.map((reaction) =>
          `${reaction.employeeId}: ${[reaction.coreOpinion, reaction.concerns, reaction.suggestion].filter(Boolean).join(" ")}`
        ).join("\n");
        const text = await this.generateJson({
          prompt: `게시글 제목:\n${topic.title}\n\n게시글 본문:\n${topic.body}${board !== "anonymous" && previousMessages ? `\n\n앞선 발언:\n${previousMessages}` : ""}`,
          systemInstruction: [buildEmployeeReactionSystemInstruction({
            board,
            title: topic.title,
            body: topic.body,
            employees: [employee],
            socialParticipants: employees,
            requiredStance,
            requiredInteractionType,
          }), board !== "anonymous" && previousMessages
            ? "앞선 발언의 구체적인 주장 중 당신의 전문 분야와 관련된 것을 읽고, 필요한 경우 질문·보충·반박으로 이어가세요. 정해진 댓글 유형을 반복하지 말고, 근거 없는 반론도 강제하지 마세요."
            : ""].filter(Boolean).join("\n"),
          schema: createEmployeeReactionResponseSchema(employeeIds, {
            allowedStances: requiredStance ? [requiredStance] : undefined,
            allowedInteractionTypes: requiredInteractionType
              ? [requiredInteractionType]
              : undefined,
          }),
          maxOutputTokens: 900,
          temperature: board === "public-feed" ? 0.78 : 0.68,
        });
        return parseEmployeeReactions(text, employeeIds, {
          allowedStances: requiredStance ? [requiredStance] : undefined,
          allowedInteractionTypes: requiredInteractionType
            ? [requiredInteractionType]
            : undefined,
        })[0];
    };
    if (board === "anonymous") return Promise.all(employees.map(generateOne));
    for (const [index, employee] of employees.entries()) {
      results.push(await generateOne(employee, index));
    }
    return results;
  }

  async generateAnonymousConversation({
    topic,
    employees,
    draftReactions,
  }: Parameters<
    NonNullable<OrganizationRunGenerator["generateAnonymousConversation"]>
  >[0]) {
    const employeeIds = employees.map(({ employee }) => employee.id);
    const text = await this.generateJson({
      prompt: [
        `채팅 주제: ${topic.title}`,
        `채팅 안내: ${topic.body}`,
        "직원별 독립 초안을 실제 대화 흐름으로 편집하세요.",
      ].join("\n"),
      systemInstruction: buildAnonymousConversationSystemInstruction({
        title: topic.title,
        body: topic.body,
        employees,
        draftReactions,
      }),
      schema: createAnonymousConversationResponseSchema(employeeIds),
      maxOutputTokens: 1_500,
      temperature: 0.92,
    });
    return parseAnonymousConversation(text, employeeIds);
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
