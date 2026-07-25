# Ptudio AI Company 조직 모델

최종 갱신: 2026-07-15

조직 정책과 공식 데이터의 원장은 Notion `14 조직 운영 백서`, `PSS - Departments`, `PSS - Characters`입니다. 이 문서는 코드 구현 경계만 요약합니다.

## Canonical Organization Model

```txt
Ptudio AI Company
→ Division (사업부·본부)
→ Team (팀)
→ AI Employee (직원)
→ Content · Project · IP
```

- 시스템 상위 레벨은 `Division`으로 통일합니다.
- 한국어 화면은 조직의 공식 명칭에 따라 `사업부` 또는 `본부`를 표시합니다.
- `사업개발본부`의 공개 영문명은 `Business Development Headquarters`입니다.
- `Department`는 Discussion Engine과 기존 DB 호환성을 위한 Legacy 필드이며 공개 조직 레벨로 사용하지 않습니다.

## 현재 원장

공식 Division 6개와 Team 18개를 `src/data/organization.ts`에 저장합니다.

| Division | Team 수 | MVP Employee |
| --- | ---: | --- |
| 커뮤니티사업부 | 2 | SIG / CCGG 케어팀 |
| 전략분석사업부 | 3 | Lo-Pay Park / 예측시장팀 |
| 테크놀로지사업부 | 3 | LUMI / AI기술연구팀 |
| 미디어콘텐츠사업부 | 3 | 없음 |
| 엔터테인먼트사업부 | 4 | 없음 |
| 사업개발본부 | 3 | 없음 |

Notion 원장 기준으로 `채널운영팀`은 미디어콘텐츠사업부, `B2B 제작운영팀`은 사업개발본부에 속합니다.

## Employee와 Character

`Employee`가 조직 관점의 정규 모델이며 `Character`는 같은 레코드의 IP·Discussion 별칭입니다. 기존 `char-001~003`, Public slug, Discussion participant `characterId`는 유지합니다.

- SIG: 커뮤니티사업부 → CCGG 케어팀 → Crypto & Macro Analyst
- Lo-Pay Park: 전략분석사업부 → 예측시장팀 → Prediction Market Manager
- LUMI: 테크놀로지사업부 → AI기술연구팀 → AI Trend Analyst

Public 화면은 `status === "Active"`인 직원만 노출합니다. TBD·Planned·Backlog·Archived 직원은 삭제하지 않고 공개 목록에서 제외합니다.

## Repository와 Persistence

Organization Repository는 Company, Division, Team, Employee, Employee Showcase 조회를 제공합니다. Mock와 Postgres Adapter가 같은 계약을 구현하며 Query Service는 Adapter 종류를 알지 않습니다.

```txt
Public/Admin UI
→ Organization Query Service
→ Organization Repository
→ Mock Data / Postgres Adapter
```

Postgres에는 추가 Migration으로 `teams`, `divisions.team_ids`, `divisions.organization_type`, `characters.team_id`를 준비했습니다. Migration은 build에서 자동 실행하지 않습니다.

## Legacy 처리

- `departmentId`, `departments`, `Department Review` enum 값은 Discussion/API/DB 호환성을 위해 유지합니다.
- Public Presentation에서는 `Department`를 현행 조직 의미로 표시하지 않습니다.
- 기존 Legal Department fixture는 `Archived`, `publicVisible: false`입니다.
- Organization write API와 전체 조직 Admin CMS는 현재 범위에 포함하지 않습니다.

## 책임 구분

- Notion: Organization Policy와 Canonical Data
- Figma: UI Specification
- Code: Domain 관계, Presentation, Repository Adapter

공개 Organization API Route는 유지하며 Team 정보는 기존 응답에 비파괴적으로 결합됩니다.
