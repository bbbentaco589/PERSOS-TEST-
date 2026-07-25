import type { ConsensusInput } from "../types";
import { formatSources, formatTopic } from "./prompt-formatters";

export function buildConsensusPrompt(input: ConsensusInput) {
  const responses = input.responses.map((item) =>
    `[${item.characterId}] 입장: ${item.stance}\n응답: ${item.content}`
  ).join("\n\n");
  const rebuttals = input.rebuttals.length
    ? input.rebuttals.map((item) => `[${item.fromCharacterId}] ${item.content}`).join("\n\n")
    : "상호 반박 없음";

  return `Ptudio AI Company Intranet BETA의 Moderator로서 전체 토론을 한국어로 종합하세요. 다수 의견을 사실처럼 만들지 말고 합의점, 이견, 최종 합의, 한계를 분리하세요.

[논제]
${formatTopic(input.topic)}

[출처]
${formatSources(input.sources)}

[1차 응답]
${responses}

[상호 반박]
${rebuttals}

[작성 규칙]
- 출력 언어: 한국어
- summary는 2~3문장, finalConsensus는 실행 가능한 결론 1~2문장으로 제한하세요.
- agreements와 disagreements를 명확히 구분하세요.
- limitations에는 미해결 질문과 근거 한계를 포함하세요.
- 제공된 출처 ID만 sourceReferences에 사용할 수 있습니다.
- 출처가 없으면 허위 인용을 만들지 말고 sourceReferences를 빈 배열로 반환하세요.
- JSON Schema에 맞는 데이터만 반환하세요.`;
}
