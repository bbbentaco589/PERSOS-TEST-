# Prompt Library

실제 Prompt 구현은 AI Provider 입력과 함께 관리하기 위해 [`src/lib/ai/prompts`](../ai/prompts)에 있습니다.

구현된 Template:

- Initial Response
- Cross Rebuttal
- Consensus
- Content Draft

모든 Template은 한국어 출력을 기본으로 하며 Topic, Character, Source, 길이 제한, 허위 인용 금지, 사람 검토 규칙을 명시합니다. Prompt 출력은 JSON Schema와 Runtime Validator를 모두 통과해야 Domain Model로 변환됩니다.
