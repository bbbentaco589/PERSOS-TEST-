import type { AIProvider, ConsensusOutput } from "../types";
import { AIProviderName } from "../types";

function sourceIds(sources: { id: string }[]) {
  return sources.map((source) => source.id);
}

export class MockAIProvider implements AIProvider {
  readonly name = AIProviderName.Mock;

  async generateInitialResponse(input: Parameters<AIProvider["generateInitialResponse"]>[0]) {
    const voice = input.character.id === "char-001"
      ? "현재 근거는 하나의 결론보다 조건별 가능성을 비교하는 데 적합합니다. 전망을 바꿀 신호를 계속 확인해야 합니다."
      : input.character.id === "char-002"
        ? "공개 가능한 주장과 내부 가설을 구분해야 합니다. 출처 범위와 인간 검토 상태가 명확하지 않으면 단정해서는 안 됩니다."
        : "결론이 기억되려면 불확실성과 핵심 차이를 한눈에 이해할 수 있는 형식으로 바꿔야 합니다.";

    return {
      characterId: input.character.id,
      position: `${input.character.jobTitleKo} 관점에서 근거와 역할을 먼저 확인합니다.`,
      reasoning: `${input.character.specialtiesKo.join(", ")} 전문성과 ${input.character.stance} 판단 기준을 적용했습니다.`,
      response: `${input.topic.title}에 대해 ${voice}`,
      sourceReferences: sourceIds(input.sources),
    };
  }

  async generateCrossRebuttal(input: Parameters<AIProvider["generateCrossRebuttal"]>[0]) {
    return {
      responderCharacterId: input.respondingCharacter.id,
      targetCharacterId: input.targetCharacter.id,
      acknowledgedPoint: "상대 의견이 핵심 위험 또는 기회를 짚었다는 점은 타당합니다.",
      rebuttal: `${input.respondingCharacter.jobTitleKo} 관점에서는 ${input.targetCharacter.nameKo}의 결론보다 근거 범위와 실행 조건을 더 명확히 해야 합니다.`,
      sourceReferences: sourceIds(input.sources),
    };
  }

  async generateConsensus(input: Parameters<AIProvider["generateConsensus"]>[0]): Promise<ConsensusOutput> {
    return {
      summary: `참여 AI Employee들은 '${input.topic.title}'을 구조화된 콘텐츠 논제로 다룰 수 있다는 데 합의했습니다. 다만 출처 한계와 인간 검토 상태를 공개 전에 확인해야 합니다.`,
      agreements: [
        "논제는 각 직무 관점에서 검토할 가치가 있습니다.",
        "제공된 출처의 범위를 넘어 단정하지 않습니다.",
        "인간 검토를 최종 발행 관문으로 유지합니다.",
      ],
      disagreements: input.rebuttals.length
        ? ["핵심 메시지의 단순화 수준과 위험 고지의 비중에는 차이가 있습니다."]
        : [],
      finalConsensus: "근거, 이견, 한계를 함께 제시하는 검토 대기 콘텐츠 초안을 제작합니다.",
      limitations: ["현재 제공된 Source 요약만 사용했으며 외부 원문 검증은 수행하지 않았습니다."],
      sourceReferences: sourceIds(input.sources),
    };
  }

  async generateContentDraft(input: Parameters<AIProvider["generateContentDraft"]>[0]) {
    const agreements = input.consensus.agreements.map((item) => `- ${item}`).join("\n");
    const limitations = input.consensus.limitations.map((item) => `- ${item}`).join("\n");
    return {
      title: input.topic.title,
      summary: input.consensus.summary,
      body: `${input.consensus.summary}\n\n## 합의된 관점\n${agreements}\n\n## 최종 합의\n${input.consensus.finalConsensus}\n\n## 한계\n${limitations}`,
      reviewNotes: ["AI 생성 초안이며 출처와 표현을 인간 편집자가 확인해야 합니다."],
    };
  }
}
