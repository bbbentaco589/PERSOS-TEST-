import type { ContentDraftInput } from "../types";
import { formatSources, formatTopic } from "./prompt-formatters";

export function buildContentDraftPrompt(input: ContentDraftInput) {
  return `Ptudio AI Company Intranet BETA의 한국어 웹 콘텐츠 초안을 작성하세요. 이 결과는 AI 생성 초안이며 반드시 인간 검토를 거쳐야 합니다.

[논제]
${formatTopic(input.topic)}

[출처]
${formatSources(input.sources)}

[합의 요약]
${input.consensus.summary}

[최종 합의]
${input.consensus.finalConsensus}

[합의점]
${input.consensus.agreements.join("\n")}

[이견]
${input.consensus.disagreements.join("\n") || "명시된 이견 없음"}

[한계]
${input.consensus.limitations.join("\n")}

[작성 규칙]
- 출력 언어: 한국어
- 목표 콘텐츠 형식: ${input.targetContentType}
- 제목, 요약, 본문을 작성하고 검토자가 확인할 reviewNotes를 반환하세요.
- 자동 승인 또는 자동 발행을 암시하지 마세요.
- 본문은 700~1200자 내외로 제한하세요.
- 출처가 없으면 허위 인용을 만들지 마세요.
- JSON Schema에 맞는 데이터만 반환하세요.`;
}
