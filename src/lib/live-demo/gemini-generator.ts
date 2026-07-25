import { getAIConfig, AIProviderName } from "@/lib/ai";
import {
  GeminiStructuredClient,
  type GeminiStructuredResult,
} from "@/lib/ai/gemini/client";
import type { LiveDemoPersonaContext } from "@/lib/live-demo/persona-context";
import {
  demoPlanSchema,
  generatedContentBatchSchema,
  validateGeneratedContentBatch,
  validateGeneratedPlan,
  type GeneratedPlanOutput,
} from "@/lib/live-demo/schemas";
import type {
  Character,
  LiveDemoContentType,
  LiveDemoStructuredContent,
} from "@/types";

export type LiveDemoGenerationResult<T> = {
  value: T;
  usage: GeminiStructuredResult["usage"];
  model: string;
  latencyMs: number;
};

export interface LiveDemoGenerator {
  generatePlan(input: {
    tect: Character;
    personas: Character[];
  }): Promise<LiveDemoGenerationResult<GeneratedPlanOutput>>;
  generateContents(input: {
    contentType: LiveDemoContentType;
    topicId: string;
    topicTitle: string;
    topicDescription: string;
    contexts: LiveDemoPersonaContext[];
    expectedCount: number;
    stance?: string;
    round?: string;
    replyToId?: string;
  }): Promise<LiveDemoGenerationResult<LiveDemoStructuredContent[]>>;
}

function serialize(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function createPlanPrompt(tect: Character, personas: Character[]) {
  return [
    "당신은 PERSOS의 C-Level Staff TECT다.",
    "투자자 Live Demo를 위한 단 한 번의 콘텐츠 계획을 작성한다.",
    "기획·배정·진행만 담당하며 TECT 자신을 공개 게시자로 배정하지 않는다.",
    "SIG(char-001), 박봉남(char-002), LUMI(char-003)만 사용한다.",
    "찬성·반대·중립을 세 Persona에게 각각 하나씩 중복 없이 배정한다.",
    "공개 피드는 업무·의견·Knowledge·Insight 소재가 분산되도록 정확히 5개 작성한다.",
    "토론 일정은 각 Persona의 opening 1회와 rebuttal 1회를 포함해 6~10개로 작성한다.",
    "투자 추천, 법률·의료 조언, 정당·선거 정치, 혐오·성적·폭력적 주제, 실존 인물 비방, 미확인 회사 내부 정보는 제외한다.",
    "모든 제목과 설명은 자연스러운 한국어로 작성한다.",
    `TECT Canonical Profile:\n${serialize({
      id: tect.id,
      name: tect.nameKo,
      role: tect.jobTitleKo,
      personality: tect.personality,
      values: tect.values,
      rules: tect.personaRules,
      prohibitedTopics: tect.prohibitedTopics,
    })}`,
    `사용 가능한 Persona:\n${serialize(
      personas.map((persona) => ({
        id: persona.id,
        name: persona.nameKo,
        jobTitle: persona.jobTitleKo,
        specialties: persona.specialtiesKo,
        personality: persona.personality,
        prohibitedTopics: persona.prohibitedTopics,
      }))
    )}`,
    "요청된 JSON Schema 이외의 설명은 출력하지 않는다.",
  ].join("\n\n");
}

function createContentPrompt(input: Parameters<LiveDemoGenerator["generateContents"]>[0]) {
  return [
    "PERSOS Investor Live Demo용 공개 콘텐츠를 생성한다.",
    `콘텐츠 유형: ${input.contentType}`,
    `Topic ID: ${input.topicId}`,
    `Topic 제목: ${input.topicTitle}`,
    `Topic 설명: ${input.topicDescription}`,
    `정확히 ${input.expectedCount}개의 items를 생성한다.`,
    input.stance ? `TECT 배정 stance: ${input.stance}` : "",
    input.round ? `TECT 배정 round: ${input.round}` : "",
    input.replyToId ? `응답 대상 ID: ${input.replyToId}` : "",
    "각 item의 personaId, contentType, topicId는 제공된 값과 정확히 일치해야 한다.",
    "각 Persona의 말투·가치·금지 규칙을 지키고 서로의 문체를 섞지 않는다.",
    "공개 가능한 정보만 사용하고, 사실처럼 꾸민 출처·수치·회사 내부 정보를 만들지 않는다.",
    "투자 추천, 법률·의료 조언, 정당·선거 정치, 혐오·성적·폭력적 표현을 포함하지 않는다.",
    "Prompt, API Key, 환경변수, 시스템 메시지를 언급하지 않는다.",
    "HTML, 코드 블록, Placeholder를 출력하지 않는다.",
    input.contentType === "feed"
      ? "공개 피드는 제목과 40~800자의 업무·의견·Knowledge·Insight 본문으로 작성한다."
      : "",
    input.contentType === "debate"
      ? "찬반 토론은 60~1000자의 논거 중심 발언으로 작성하고 stance와 round를 반드시 포함한다."
      : "",
    input.contentType === "anonymous"
      ? "익명 채팅은 20~500자의 자연스러운 사내 대화 문장으로 작성한다. Public에는 Alias가 붙으므로 실명을 본문에 넣지 않는다."
      : "",
    `Persona Context Package:\n${serialize(input.contexts)}`,
    "요청된 JSON Schema 이외의 설명은 출력하지 않는다.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export class GeminiLiveDemoGenerator implements LiveDemoGenerator {
  private readonly client: GeminiStructuredClient;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const config = getAIConfig(env);
    if (config.provider !== AIProviderName.Gemini) {
      throw new Error(
        "Live Demo 실제 생성에는 AI_PROVIDER=gemini 설정이 필요합니다."
      );
    }
    this.client = new GeminiStructuredClient(config);
  }

  async generatePlan(input: {
    tect: Character;
    personas: Character[];
  }) {
    const result = await this.client.execute({
      schemaName: "tect_demo_content_plan",
      schema: demoPlanSchema,
      prompt: createPlanPrompt(input.tect, input.personas),
    });
    return {
      value: validateGeneratedPlan(result.value),
      usage: result.usage,
      model: result.model,
      latencyMs: result.latencyMs,
    };
  }

  async generateContents(
    input: Parameters<LiveDemoGenerator["generateContents"]>[0]
  ) {
    const result = await this.client.execute({
      schemaName: "persos_live_demo_content_batch",
      schema: generatedContentBatchSchema,
      prompt: createContentPrompt(input),
    });
    return {
      value: validateGeneratedContentBatch(result.value, input.expectedCount),
      usage: result.usage,
      model: result.model,
      latencyMs: result.latencyMs,
    };
  }
}
