# Ptudio AI Company Intranet BETA AI Layer

Discussion Engine의 AI 생성 경계입니다. 기본 Provider는 `mock`이며 `AI_PROVIDER=openai`일 때만 OpenAI SDK와 환경 설정을 읽습니다.

## 구성

- `factory.ts`: AI Provider 선택 및 지연 초기화
- `mock/`: 결정론적 Mock AI Provider
- `openai/`: OpenAI Responses API Provider와 지연 Client
- `prompts/`: 한국어 Canonical Prompt Template
- `validation.ts`: Structured Output JSON Schema와 Runtime Validator
- `errors.ts`: AI 오류 코드, 분류, 한국어 사용자 메시지

## 환경 변수

```env
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_TIMEOUT_MS=30000
```

Mock 모드에서는 API Key를 요구하지 않고 SDK Client를 생성하지 않습니다. OpenAI 모드는 Key와 Model이 모두 있을 때만 요청 시점에 초기화됩니다. SDK 자동 재시도는 끄고 Provider가 일시적 오류에 한해 최대 1회 재시도합니다.

현재 범위에는 RAG, Tool Calling, Multi-Agent, 장기 기억, 자동 게시가 없습니다. 모든 콘텐츠 초안은 `Pending Review`로 생성되어 사람 검토를 거칩니다.

## 검증 상태

- Mock AI + Mock Persistence 전체 생성·검토·게시·Public 조회: 통과
- OpenAI SDK Mock 기반 Structured Output/Error/Retry Test: 통과
- 실제 OpenAI 네트워크 호출: 환경 변수 미제공으로 미검증

실제 검증은 비운영 환경에서 `AI_PROVIDER=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL`을 설정해 최소 1개 Discussion으로 수행합니다. Key, 전체 Prompt, Source 원문은 로그에 출력하지 않습니다.
