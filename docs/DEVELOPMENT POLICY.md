# Ptudio AI Company Intranet BETA 개발 공통 정책

최종 갱신: 2026-07-21

이 문서는 2026년 7월부터 적용되는 Ptudio AI Company Intranet BETA의 공통 제품·개발 정책입니다.

## 1. 제품 거버넌스

HQ는 Product Specification의 Single Source of Truth입니다.

```txt
HQ
↓
Figma
↓
Implementation
```

- 기능 정의와 제품 범위는 HQ를 따릅니다.
- UI와 UX 표현은 Figma를 따릅니다.
- 구현은 HQ와 Figma를 모두 만족해야 합니다.
- 충돌 시 HQ의 제품 정책을 우선합니다.

## 2. 언어 정책

Ptudio는 Korean-first 정책을 적용합니다.

- 기획 및 개발의 Canonical Language는 한국어입니다.
- 기본 사이트 언어는 한국어입니다.
- 영어는 Localization 대상으로 관리합니다.
- 제품은 `한국어 ⇄ English` 언어 전환을 지원하는 방향으로 구현합니다.
- 새로운 UI를 영어 기준으로 먼저 작성하지 않습니다.

다음 항목은 반드시 한국어를 기준으로 작성합니다.

- UI / UX
- Documentation
- Prompt
- Mock Data
- Character
- Knowledge
- CMS / Admin
- Error Message / Status
- Placeholder / Demo Content

기존 영문 자료는 해당 영역을 실제로 수정하는 Milestone에서 한국어 Canonical 구조로 전환합니다. 번역만을 위한 별도 Milestone은 만들지 않습니다.

### 페르소나 이름 표기 정책

- 공개 웹 UI에서 페르소나 이름은 항상 `국문(영문)` 형식으로 표기합니다.
- 예: `텍트(TECT)`, `박봉남(Lo-Pay Park)`
- 검색·저장·프롬프트용 Canonical 필드인 `nameKo`, `nameEn`은 분리 상태를 유지하고, 화면 출력 시 공용 포매터를 사용합니다.

## 3. 개발 우선순위

```txt
1. Postgres Adapter
↓
2. Prompt Layer
↓
3. OpenAI Integration
↓
4. AI Character Discussion Vertical Slice
↓
5. Core MVP Complete
↓
6. UI Polish
↓
7. Beta Launch
```

## 4. 개발 원칙

- Architecture는 완료된 것으로 간주합니다.
- 실제 Blocker가 없는 한 Architecture-only Milestone을 추가하지 않습니다.
- 향후 개발은 설계 문서 추가보다 실제 구현을 우선합니다.
- 각 작업 완료 후 다음 Milestone을 자동으로 시작하지 않습니다.
- 완료 보고에는 현재 Milestone의 완료 여부와 다음 추천 Milestone만 포함합니다.

## 5. UI 정책

- 현재 UI 상태는 `UI Renewal v1`입니다.
- Core MVP 완료 전에는 대규모 UI 리디자인을 진행하지 않습니다.
- 현재 UI 수정은 실제 기능 구현에 필요한 최소 범위로 제한합니다.
- 전사원 통합 인트라넷의 최근 게시물은 최신순으로 왼쪽부터 누적하며 최대 5개까지만 순환 노출합니다.

## 6. MVP 범위 잠금

MVP 범위를 확장하지 않습니다. 다음 항목은 현재 MVP에서 제외합니다.

- Community
- Subscription
- RAG
- Multi-Agent
- Long-term Memory
- Auto News

새로운 아이디어는 구현하지 않고 HQ의 `13 Idea Storage`에 적립합니다.

## 7. 현재 기준 상태

- Architecture: 완료
- Discussion Engine: 완료
- UI Renewal v1: 완료
- Postgres Adapter: 구현 완료 / 실DB 검증 대기
- Prompt Layer: 완료
- OpenAI Integration: 구현 완료 / 실제 API 검증 대기
- AI Character Discussion Vertical Slice: 완료 (Mock 검증)
- Core MVP: 완료 (실제 OpenAI/Postgres 통합 검증은 Known Limitation)
- Public IA/UI: 최신 HQ Final v3 기준 반영
- AI 사원 데이터: Approved 3명 + Rough 15명, 총 18명
- Admin IA: Canonical 7개 운영 Route 반영
