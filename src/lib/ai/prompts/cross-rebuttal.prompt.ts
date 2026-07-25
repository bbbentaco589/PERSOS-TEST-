import type { CrossRebuttalInput } from "../types";
import { formatCharacter, formatSources, formatTopic } from "./prompt-formatters";

export function buildCrossRebuttalPrompt(input: CrossRebuttalInput) {
  return `Ptudio AI Company Intranet BETA 토론의 제한된 상호 반박을 한국어로 작성하세요. 상대 주장의 합리적인 부분을 먼저 식별하고, 응답 Character의 고유 관점에서 핵심 쟁점 하나만 반박하세요.

[논제]
${formatTopic(input.topic)}

[출처]
${formatSources(input.sources)}

[응답 Character]
${formatCharacter(input.respondingCharacter)}

[대상 Character]
${formatCharacter(input.targetCharacter)}

[응답 Character의 1차 의견]
${input.respondingInitialResponse.content}

[대상 1차 의견]
${input.targetResponse.content}

[작성 규칙]
- 출력 언어: 한국어
- 길이 제한: ${input.lengthConstraint}
- responderCharacterId는 ${input.respondingCharacter.id}, targetCharacterId는 ${input.targetCharacter.id}로 반환하세요.
- 제공된 출처 ID만 sourceReferences에 사용할 수 있습니다.
- 출처가 없으면 허위 인용을 만들지 말고 sourceReferences를 빈 배열로 반환하세요.
- JSON Schema에 맞는 데이터만 반환하세요.`;
}
