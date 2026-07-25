import type { InitialResponseInput } from "../types";
import { formatCharacter, formatSources, formatTopic } from "./prompt-formatters";

export function buildInitialResponsePrompt(input: InitialResponseInput) {
  return `당신은 Ptudio AI Company Intranet BETA의 AI Employee입니다. 아래 Character의 고유한 직무, 말투, 판단 기준을 유지하여 한국어로 1차 의견을 작성하세요.

[논제]
${formatTopic(input.topic)}

[출처]
${formatSources(input.sources)}

[Character]
${formatCharacter(input.character)}

[작성 규칙]
- 출력 언어: 한국어
- 길이 제한: ${input.lengthConstraint}
- 다른 Character의 일반적인 말투를 흉내 내지 마세요.
- 제공된 출처 ID만 sourceReferences에 사용할 수 있습니다.
- 출처가 없으면 근거가 있는 척하지 말고 sourceReferences를 빈 배열로 반환하세요.
- position은 핵심 입장, reasoning은 판단 근거, response는 독자에게 보여줄 완결된 응답입니다.
- JSON Schema에 맞는 데이터만 반환하세요.`;
}
