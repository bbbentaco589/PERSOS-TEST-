# Ptudio MVP 3차 보정 및 Sidebar IA 검수 보고

검수일: 2026-07-21  
기준: HQ > Figma > Implementation, Korean-first, Mock Provider  
범위: Canonical Sidebar IA, `/division-feed`, 직원 SSOT, PSS 잔존 요소, UI 및 회귀 검증

## A. Sidebar IA Before / After

### Before

```text
사업부
└─ 팀
   └─ 직원
```

Team Accordion, Team 전용 행, Team 아이콘, Team Route가 Public Sidebar의 중간 계층으로 노출됐다.

### After

```text
사업부 개별 인트라넷 → /division-feed
├─ 사업개발본부 (Accordion Toggle)
│  ├─ 직원명 / 소속 팀
│  └─ 직원명 / 소속 팀
├─ 전략분석사업부 (Accordion Toggle)
│  └─ 직원명 / 소속 팀
└─ 나머지 사업부 동일
```

- 6개 사업부 행은 Route Link가 아닌 Accordion Toggle이다.
- 최초 진입 시 전부 닫히며, 한 번에 하나만 열린다. 열린 사업부를 다시 누르면 닫힌다.
- 직원은 Avatar, 이름, 소속 팀, 최소 상태만 표시하며 `/characters/[slug]`로 이동한다.
- Team은 조직 데이터로 유지하되 Sidebar에서는 직원의 보조 정보로만 표시한다.
- Desktop과 Mobile Drawer가 동일한 컴포넌트와 동작을 사용한다.

## B. Changed Files

| 파일 | 변경 목적 |
| --- | --- |
| `src/components/layout/public-sidebar.tsx` | 사업부 → 직원 2단 IA, 단일 Accordion, Mobile 동기화 |
| `src/app/(public)/page.tsx` | Home 사업부 카드의 Query 진입을 `/division-feed` Overview로 변경 |
| `src/app/(public)/characters/[slug]/page.tsx` | Breadcrumb Query 제거, 18개 직원 정적 경로 및 잘못된 slug 404 |
| `src/components/feed/organization-feed-card.tsx` | Division/Team Query Link 제거, 직원·토론 Link 유지 |
| `src/app/(public)/discussion/[slug]/page.tsx` | 참여자 Division/Team Query Link 제거 |
| `src/app/(public)/division-feed/page.tsx` | 6개 사업부 Overview, 팀·담당 직원·Knowledge 보강 |
| `README.md` | 현재 Ptudio 브랜드 및 MVP 범위 반영 |
| `docs/DEVELOPMENT STATUS.md` | 표시 IA와 조직 데이터 계층을 분리해 기록 |

SHA-256 기준 변경 기록은 [PTUDIO-MVP-THIRD-CHANGE-LEDGER.csv](./PTUDIO-MVP-THIRD-CHANGE-LEDGER.csv)에 있다. Git 실행 파일과 `.git`이 없어 Git 기반 Diff 검증은 수행하지 않았다.

## C. Removed Team-Level UI

- Canonical Sidebar의 Team Accordion, Team Row, Team 아이콘, Team → Employee Connector를 제거했다.
- 직원 클릭은 Division/Team Feed가 아닌 직원 상세로 연결한다.
- Mobile Drawer의 Team 중간 계층도 제거했다.
- Team 타입, ID, 소속 관계, Legacy Feed Route는 삭제하지 않았다.
- 동일 팀 직원이 2명 이상으로 증가한 뒤에만 Team Grouping UI 재도입을 별도 판단한다.

## D. `/division-feed` Query Dependency Analysis

| 항목 | 상태 | 처리 |
| --- | --- | --- |
| Canonical Navigation의 `?division=` / `?team=` 링크 | 미사용 | 신규 진입 링크 제거 완료 |
| `/division-feed` Query Parser | Legacy 직접 접근 가능 | 보존 |
| 잘못된 Division Query | Overview Fallback 200 | 보존 및 검증 |
| `/departments/[divisionSlug]/feed` | Legacy Route | 직접 URL 접근 보존 |
| `/departments/[divisionSlug]/teams/[teamSlug]/feed` | Legacy Route | 직접 URL 접근 보존 |

현재 Canonical UI는 `/division-feed` 전체 Overview와 `/characters/[slug]`만 사용한다. Query 처리 로직은 기존 링크, 테스트 또는 외부 북마크의 의존성을 완전히 배제할 수 없으므로 즉시 삭제하지 않는다. Redirect 또는 제거는 Analytics와 외부 링크 확인 후 별도 Migration으로 결정한다.

## E. Employee SSOT Verification

- SSOT: `src/data/characters.ts`
- 구성: Approved 3명 + Rough 15명 = Public Employee 18명
- 검증: ID 중복 0, Slug 중복 0, 필수값 누락 0, 잘못된 Division 참조 0, 잘못된 Team 참조 0
- 반영 Surface: `/characters`, `/characters/[slug]`, Public Sidebar, `/division-feed`, Related Employee, Activity, Discussion, Knowledge, Admin Characters
- `employee-showcases.ts`는 `employeeId` 기반 편집·확장 데이터이며 별도 Identity Source가 아니다.
- Activity 일부는 직원 Slug/Href를 직접 저장하므로 향후 Slug 변경 시 Migration 대상이다.
- 직원 상세는 현재 18개 Slug를 SSG한다. Mock SSOT 수정은 재빌드 후 반영되며 잘못된 Slug는 404다.

## F. PSS Residue Inventory

| 항목 | 파일 경로 | 현재 사용 | Runtime / Build / Migration 영향 | 삭제 가능 | 권장 처리 |
| --- | --- | --- | --- | --- | --- |
| 구 PSS Brand 4종 | `public/brand/pss-*.png` | 참조 없음 | 없음 / 없음 / 없음 | 승인 후 가능 | Safe to Remove |
| 구 Discussion Preview | `public/assets/ui-v1/06-discussion-preview.png` | 참조 없음 | 없음 / 없음 / 없음 | 승인 후 가능 | Safe to Remove |
| Main Feed Overview | `public/assets/ui-v1/07-main-feed-thumbnail-overview.png` | Runtime 사용 | 있음 / 삭제 시 실패 가능 / 없음 | 즉시 삭제 금지 | Replace with Ptudio |
| Core Crystal Overview | `public/assets/ui-v1/08-core-crystal-overview.png` | Runtime 사용 | 있음 / 삭제 시 실패 가능 / 없음 | 즉시 삭제 금지 | Replace with Ptudio |
| Division Icons Overview | `public/assets/ui-v1/09-division-icons-overview.png` | Runtime 사용 | 있음 / 삭제 시 실패 가능 / 없음 | 즉시 삭제 금지 | Replace with Ptudio |
| 내부 Company ID | `src/data/organization.ts`의 `company-pss` | 데이터 Key | 있음 / 있음 / 높음 | 금지 | Keep for Migration |
| 구 Provider Env Alias | `src/lib/database/env.ts`, `provider.ts` | 하위 호환 | Provider 선택 영향 / 있음 / 중간 | 즉시 삭제 금지 | Keep for Migration |
| Migration Seed의 PSS 문구 | `2026-07-15-0002_canonical_organization.ts` | Migration 재현 | DB Seed 영향 / 낮음 / 높음 | 금지 | Forward Migration 대상 |
| 과거 PSS 설계 문서 | `docs/` 일부 | 이력 근거 | Runtime 없음 / 없음 / 감사 이력 | 유지 | Legacy Only |

17개 주요 화면의 Desktop/Mobile 34개 상태를 검사한 결과, 사용자 화면에 노출되는 PSS 문구는 0건이었다. Runtime 사용 중인 07~09 이미지는 현재 Crop 영역에서 PSS가 보이지 않지만 Ptudio 전용 원본으로 교체해야 한다.

## G. UI Fixes Applied

- Team 중간 계층을 제거해 정보 반복과 3단 Tree 과밀을 줄였다.
- 직원명과 소속 팀의 시각적 위계를 분리하고 Rough 상태는 보조 라벨로 축소했다.
- 사업부 Accordion의 한 번에 하나 열기, 재클릭 닫기, 초기 닫힘을 확인했다.
- Mobile Drawer에서 직원 선택 후 Drawer가 닫히고 직원 상세로 이동한다.
- `/division-feed`에 6개 사업부의 팀과 담당 직원 관계를 직접 표시했다.
- Query 링크를 텍스트 정보로 바꿔 Canonical Navigation을 단순화했다.
- 대규모 리디자인, Admin IA 변경, Domain/API/Repository 변경은 하지 않았다.

## H. Screenshot Index

전체 인덱스: [PTUDIO-MVP-THIRD-SCREENSHOT-INDEX.md](./PTUDIO-MVP-THIRD-SCREENSHOT-INDEX.md)

- [Canonical Sidebar Desktop](./screenshots/ptd-sidebar-canonical-desktop-v3.png)
- [Canonical Sidebar Mobile Drawer](./screenshots/ptd-sidebar-canonical-mobile-v3.png)
- [Division Overview Desktop](./screenshots/ptd-division-overview-desktop-v3.png)
- [Division Overview Mobile](./screenshots/ptd-division-overview-mobile-v3.png)

## I. Verification Results

| 검증 | 결과 |
| --- | --- |
| `npm.cmd run lint` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run build` | PASS |
| `npm.cmd run test:core-flow` | PASS 2/2 |
| `npm.cmd run test:ai` | PASS 9/9 |
| `npm.cmd run test:repositories` Mock | PASS 1/1 |
| `npm.cmd run test:repositories` Postgres | SKIP, `TEST_DATABASE_URL` 미설정 |
| Canonical Public/Admin HTTP | PASS 31/31, 모두 200 |
| 잘못된 직원 Slug | PASS, Production 404 |
| 잘못된 Division Query | PASS, Overview Fallback 200 |
| Desktop/Mobile 시각 검증 | PASS, 17 Route × 2 Viewport |
| Horizontal Overflow | 0 |
| Broken Image | 0 |
| Browser Console Error | 0 |
| 화면 노출 PSS 문구 | 0 |
| Public Load 시 AI 호출 | 0 |

Mock / Draft / Placeholder / Not Connected 표기는 유지됐다. 실제 Postgres 계약은 환경변수 부재로 이번 로컬 검증에서 실행되지 않았다.

## J. Remaining Founder Decisions

1. 미사용 PSS Brand 4종과 `06-discussion-preview.png` 삭제 승인 여부
2. Runtime 사용 중인 07~09 이미지의 Ptudio 전용 원본 교체 일정
3. `company-pss`, 구 Provider Env Alias, Migration Seed PSS 문구의 Forward Migration 시점
4. Rough 15명 직원의 이름, 이미지, 역할을 Draft로 유지할지 정식 승인할지
5. Legacy Division/Team Feed Route와 Query URL의 Redirect 또는 유지 정책
6. 직원 상세 SSG 및 재빌드 반영 방식을 MVP 동안 유지할지

다음 추천 Milestone은 기존 합의대로 **직원 상세 페이지 디자인 및 콘텐츠 위계 보정**이다. 이번 보고서에서는 다음 Milestone을 자동 시작하지 않는다.
