# Ptudio AI Company Intranet BETA 프로젝트 지침

모든 작업은 `docs/DEVELOPMENT POLICY.md`를 공통 정책으로 따릅니다.

## 제품 기준

- 우선순위는 `HQ > Figma > Implementation`입니다.
- 기능 정의와 제품 범위는 HQ를 따릅니다.
- UI와 UX 표현은 Figma를 따릅니다.
- 구현은 HQ와 Figma를 모두 만족해야 합니다.

## 언어

- 한국어가 Canonical Language이며 기본 사이트 언어입니다.
- UI, UX, 문서, 프롬프트, Mock Data, Character, Knowledge, CMS, Admin, 오류 메시지, 상태, Placeholder, Demo Content는 한국어를 기준으로 작성합니다.
- 영어는 Localization 대상으로 관리하며 새로운 UI를 영어로 먼저 작성하지 않습니다.

## 개발 순서

1. Postgres Adapter
2. Prompt Layer
3. OpenAI Integration
4. AI Character Discussion Vertical Slice
5. Core MVP Complete
6. UI Polish
7. Beta Launch

- Architecture는 완료된 것으로 간주합니다.
- 구체적인 Blocker가 없으면 Architecture-only Milestone을 추가하지 않습니다.
- Core MVP 전에는 실제 기능에 필요한 최소 UI 수정만 수행합니다.

## MVP 범위

- MVP 범위를 확장하지 않습니다.
- Community, Subscription, RAG, Multi-Agent, Long-term Memory, Auto News는 구현하지 않습니다.
- 새 아이디어는 구현하지 않고 HQ의 `13 Idea Storage`에 적립합니다.

## GitHub 및 배포

- 원격 저장소는 `https://github.com/bbbentaco589/PERSOS-TEST-.git`을 사용합니다.
- 사용자가 작업 완료와 배포를 요청한 경우 변경 사항을 검증하고 커밋한 뒤 GitHub에 푸시하여 연결된 배포를 진행합니다.
- 비밀값과 `.env.local`은 커밋하거나 푸시하지 않습니다.
- 푸시 후 연결된 배포 상태를 확인하고 성공 여부를 한국어로 보고합니다.
- 원격 이력 충돌, 인증 실패 또는 배포 설정 부재가 있으면 임의로 덮어쓰지 않고 원인을 보고합니다.

## 작업 종료

- 현재 Milestone을 완료한 뒤 다음 Milestone을 자동으로 시작하지 않습니다.
- 완료 보고에는 현재 Milestone의 완료 여부와 다음 추천 Milestone만 명확히 포함합니다.
