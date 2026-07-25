# Ptudio MVP 2차 검수 및 디자인 준비 보고

- 기준일: 2026-07-21
- 기준 코드: `C:\pss-beta-web-ascii`
- 검수 범위: Final v3 MVP IA, Public, Admin, 상태 UI, 데이터 SSOT, Legacy, 공용 컴포넌트
- 원칙: 신규 기능 추가 없음, Domain/API/Repository 계약 변경 없음

## A. Git Verification

### 결과

| 점검 | 결과 |
|---|---|
| `git --version` | 실행 불가. `git.exe` 미설치 또는 환경에 미존재 |
| `Get-Command git`, `where.exe git` | 결과 없음 |
| 일반 설치 경로 | Program Files, LocalAppData Programs, GitHub Desktop, Scoop, Chocolatey 경로 모두 실행 파일 없음 |
| 현재 `.git` | `C:\pss-beta-web-ascii\.git` 없음 |
| 상위 `.git` | `C:\.git` 및 원본 작업 폴더에도 없음 |
| branch / remote / status / diff | Git repository가 아니므로 확인 불가 |
| commit 여부 / untracked | Git metadata 부재로 판정 불가 |

Git PATH만의 문제가 아니라 실행 파일과 repository metadata가 모두 없다. 이번 검수에서 임의로 Git을 설치하거나 repository를 초기화하지 않았다.

### Git-less 변경 인벤토리

비교 기준은 원본 사본 `...\CODEX_AI PRSONA Studio\pss-beta-web`이며, 현재 폴더와 SHA-256으로 비교했다. `.next`, `node_modules`, 로그, `*.tsbuildinfo`, 이번 검수 산출물은 제외했다.

| 상태 | 수량 | 해석 |
|---|---:|---|
| Added | 197 | route group, 신규 Public/Admin, architecture와 MVP 구현 파일 포함 |
| Modified | 40 | 기존 파일 내용 변경 |
| DeletedCandidate | 15 | 기준 사본에는 있으나 현재 위치에는 없음 |

DeletedCandidate 15개 중 10개는 `src/app/...`에서 `src/app/(public)/...`으로 이동한 route group 전환이고, 5개는 사용하지 않는 기본 Next.js SVG(`file`, `globe`, `next`, `vercel`, `window`)다. Git이 없어 Rename으로 증명할 수는 없지만 route 동작과 대상 파일 존재를 확인했다. 전체 목록은 [baseline-change-inventory.csv](baseline-change-inventory.csv)에 있다.

현재 소스 감사에서 명백한 임시 실행 파일, 비밀값, 의도하지 않은 바이너리 삭제는 발견하지 못했다. 다만 기준 사본은 VCS commit이 아니므로 해당 비교는 Git diff의 대체 증거이지 동일한 신뢰 수준은 아니다.

## B. Screenshot Index

- Public 18개 상태 x Desktop/Mobile: 36장
- Admin 7개 x Desktop/Mobile: 14장
- 상태 전용: 10장
- 합계: 60장
- 상세 목록: [SCREENSHOT-INDEX.md](SCREENSHOT-INDEX.md)
- 캡처 폴더: `docs/review/screenshots/`

Loading은 production SSR이 즉시 완료되어 안전한 강제 지연 없이 캡처하지 않았다. Error는 검수용 오류 주입을 하지 않았으며 Public/Admin `error.tsx` 존재를 확인했다.

## C. UI Review Findings

| Route | 페이지 목적 / 주요 섹션 | 데이터 상태 | Desktop | Mobile | 텍스트·에셋·중복 | 개선 권고 |
|---|---|---|---|---|---|---|
| `/` | Lobby Hero, KPI, Activity, Issue, Division, Employee, Knowledge | 조직 Actual, Activity/Discussion Mock | 첫 화면 위계 좋음 | 사이드바 Drawer와 본문 정상 | Hero는 Ptudio, Activity는 Mock 표시 | 상세 디자인에서 KPI 상태 범례 강화 |
| `/about` | 브랜드·회사·운영 철학 소개 | Static Actual | 정보 밴드 구분 명확 | 긴 문장 줄바꿈 정상 | PageHero 패턴 반복 | 브랜드 이미지 확정 후 교체 |
| `/intranet` | 공개형 인트라넷 이용 구조 | Static Actual | 개념 설명 명확 | 카드가 세로로 자연스럽게 전환 | About과 PageHero 유사 | 사용 흐름 도식의 production asset 필요 |
| `/departments` | 정적 조직 구조와 사업부 소개 | 조직 SSOT | 6개 사업부 accordion 명확 | 닫힘 초기 상태 정상 | Division Feed와 목적 분리됨 | 사업부 대표 키비주얼 결정 필요 |
| `/characters` | 18명 직원 Directory | 직원 SSOT | 승인/Rough 필터 위계 좋음 | 긴 직무명 줄바꿈 정상 | 카드 반복은 목적상 적합 | 정렬·필터 고도화는 Core 이후 |
| `/characters/sig` | 승인 직원 상세 | 승인 데이터 + Showcase | Hero/Profile/Activity 위계 좋음 | 섹션 순서 유지 | production 이미지 사용 | 상세 Hero, 타임라인 밀도 디자인 |
| `/characters/partnership-planner` | Rough 직원 상세 | Controlled Placeholder | Draft Profile 명확 | 이미지/텍스트 겹침 없음 | 가칭·준비 중 표기 적절 | Founder 확정 필드가 채워질 때 자동 전환 |
| `/discussion` | 공개/익명 Feed 허브 | Mock Data | 두 Feed 차이가 분명함 | 카드 2개가 세로 전환 | Mock badge 보강 완료 | Feed 성과 지표는 실데이터 후 제공 |
| `/discussion/public` | 실명 기반 공개 타임라인 | Mock Data | Pinned Issue와 Timeline 명확 | 긴 제목 줄바꿈 정상 | 익명 Feed와 충분히 다름 | 실제 발행일·출처 표준 확정 필요 |
| `/discussion/anonymous` | 익명 ID 기반 읽기 전용 Feed | DEMO / Read-only | 채팅형 리듬이 공개 Feed와 다름 | 단일 열 가독성 양호 | 기능 과장 없음 | 인증·익명 쓰기 기능은 범위 밖 유지 |
| `/discussion/[slug]` | 출처부터 합의·게시까지 상세 | Mock Data | 긴 문서형 정보 위계 좋음 | 카드/표가 단일 열로 전환 | 구 PSS 대표 이미지를 Ptudio asset으로 교체 | 전용 Discussion production image 필요 |
| `/division-feed` | 사업부별 실제 활동 탐색 | Mock Activity | Overview와 Activity 구분 | 필터 chips 줄바꿈 정상 | Departments와 목적 분리됨 | 선택 scope 배지 강화 |
| division filter | 사업부 scope 결과 | Mock Activity | 선택 카드와 team nav 표시 | 정상 | 첫 viewport에서 전체와 유사 | 상단에 고정 scope label 권고 |
| team filter | 팀 scope 결과 | Mock Activity | team badge 선택 표시 | 정상 | division filter와 차이가 미세 | 선택 팀 제목을 Hero 가까이 이동 |
| `/knowledge` | 출처·검토 기반 지식 탐색 | Mock Data | 문서 Library로 Discussion과 다름 | 검색/필터 정상 | Mock badge 보강 완료 | 문서 유형 icon system 필요 |
| `/knowledge/[slug]` | 지식 본문·출처·관련 직원 | Mock Data | 문서+aside 구조 적합 | aside가 본문 뒤로 이동 | Revision은 연동 전 표기 | version history 실제 연동 후 구조 결정 |
| `/contact` | 공식 채널 예정지 | BETA Placeholder | 목적 명확 | 정상 | 기능처럼 과장하지 않음 | Founder가 링크·메일 확정 필요 |
| `/login` | 인증 예정 안내 | BETA Placeholder / Disabled | 상태 명확 | 정상 | 실제 폼 없음이 명시됨 | Auth milestone 전 유지 |
| `/admin` | 운영 대시보드 | Mixed Mock/Actual | Public과 명확히 구분 | 상단 nav 가로 스크롤 | ADMIN 브랜드 구분 좋음 | 실제 KPI 연결 후 상태 범례 통일 |
| `/admin/review` | 사람 검수 queue | Mock / 저장소 데이터 | queue hierarchy 명확 | 버튼 폭 정상 | 공개 상세와 목적 다름 | 리뷰 diff view는 차후 기능 범위 |
| `/admin/architect` | Provider·Run 관측 | Mock / Integration Ready | console tone 적합 | 표/metrics 세로 전환 | 상태 badge 명확 | API Cost 실제 집계 후 시각화 |
| `/admin/characters` | 18명 운영 목록 | 직원 SSOT | 승인/Rough 구분 명확 | 테이블이 가로 스크롤 | 이름 중복 없음 | 향후 편집은 별도 Admin 기능으로 결정 |
| `/admin/content` | 토픽·출처·생성 진입 | Mock | 작업 흐름 명확 | tab 영역 정상 | legacy 화면과 역할 일부 중복 | Topics/Sources 통합 완료 후 legacy redirect |
| `/admin/publishing` | 게시 상태 확인 | Mock / Not Connected | 상태 notice 추가 | 버튼/텍스트 정상 | 자동 배포 오해 해소 | 실제 채널 연결 전 현재 유지 |
| `/admin/system` | Provider·환경·API 상태 | Actual config + Unavailable | 운영 진단 적합 | 정상 | 비밀값 노출 없음 | production health endpoint 이후 연결 |

### 공통 판단

- 모든 페이지가 동일 카드 나열로만 보이지 않는다. Discussion Detail, Anonymous Feed, Knowledge Detail, Admin Table이 서로 다른 정보 구조를 가진다.
- Public Feed는 실명·출처·Pinned Issue 중심, Anonymous Feed는 익명 thread·read-only 중심이라 구분된다.
- Departments는 정적 조직 Directory, Division Feed는 활동 탐색 표면으로 분리되어 있다.
- Character List는 탐색, Detail은 identity·showcase·timeline 중심으로 위계가 적절하다.
- Glow와 Glass는 제한적으로 사용되고 전반은 검정·선형 경계·낮은 채도의 운영 도구 톤이다.
- 캡처 대상에서 한국어 긴 제목·직무명 잘림, horizontal overflow, broken image를 발견하지 못했다.

## D. Mock·Placeholder Matrix

| 항목 | Route | 현재 표시 | Badge | 오해 가능성 | 처리 / 권고 |
|---|---|---|---|---|---|
| Company Activity | `/` | 실제 Activity 카드처럼 표시 | `Mock Data` 추가 | 낮음 | 실 DB 연결 전 유지 |
| 운영 지표 | `/`, `/admin` | 조직 수는 SSOT, Activity/Discussion은 fixture | detail + 하단 disclosure | 중간 | production KPI 연결 시 Actual/Mock 분리 |
| Architect 상태 | `/admin/architect` | Provider 상태 카드 | Mock / Integration Ready | 낮음 | 유지 |
| Architect Run History | `/admin/architect` | 저장된 demo run | Mock | 낮음 | 실제 run 저장 후 전환 |
| Publishing Schedule | `/admin/content`, `/admin/publishing` | queue 중심, 자동 배포 없음 | Mock / Not Connected | 낮음 | 일정 기능처럼 과장하지 않음 |
| API Cost | `/admin/architect`, `/admin/system` | 미집계 또는 unavailable | Unavailable / Integration Ready | 낮음 | 실제 token ledger 필요 |
| Provider Status | `/admin/system` | env 기반 상태 | Mock / Unavailable | 낮음 | 실제 secret 없이 정확 |
| Discussion Engine 결과 | `/discussion*`, `/admin/review` | 저장 fixture 또는 Mock flow | `Mock Data` 추가 | 낮음 | AI Provider 활성 시 provenance 표시 필요 |
| Rough 직원 15명 | `/characters*`, Sidebar, Admin | 가칭, Rough, Draft Profile | 존재 | 낮음 | SSOT에서 Founder가 확정 |
| Rough 직원 이미지 | Rough detail/cards | controlled placeholder visual | Draft Profile | 낮음 | production asset 등록 시 교체 |
| Contact | `/contact` | 안내 페이지 | BETA Placeholder | 낮음 | 링크·메일 확정 전 유지 |
| Login | `/login` | 접근 준비 안내 | BETA Placeholder / Disabled | 낮음 | Auth 없음 명확 |
| Signup | `/signup` | 접근 준비 안내 | BETA Placeholder / Disabled | 낮음 | Auth 없음 명확 |
| 영어 전환 | Global Header | 선택 가능해 보였음 | `ENGLISH · 준비 중`, disabled로 수정 | 낮음 | localization 전까지 비활성 유지 |
| Anonymous Feed | `/discussion/anonymous` | demo thread | DEMO / Read-only | 낮음 | 쓰기 기능 없음 명확 |
| Knowledge | `/knowledge*` | 검수 완료 문서처럼 표시 | `Mock Data` 추가 | 낮음 | actual CMS 전까지 유지 |
| Division Activity | `/division-feed` | activity cards | `Mock Activity` 추가 | 낮음 | actual event store 전까지 유지 |

공통 상태 어휘 `Preview`, `Mock Data`, `Draft Profile`, `BETA Placeholder`, `Integration Ready`, `Read-only`, `Not Connected`는 해당 표면에서 확인했다. Public Mock badge는 현재 개별 구현이며 추후 공용 `DataStateBadge`로 통합할 수 있다.

## E. Employee Data Management

### Single Source of Truth

- Identity entry point: `src/data/characters.ts`
- Approved 3명: `approvedEmployees`
- Rough 15명: `roughEmployeeSeeds`
- Rough controlled defaults: `createRoughEmployees()`
- 최종 export: `employees`, 호환 alias `characters`
- 상세 Showcase: `src/data/employee-showcases.ts`, 승인 3명의 editorial 확장 데이터만 `employeeId`로 연결

`characters.ts`에서 이름, 영문명, slug, 사업부, 팀, 직무, 전문 영역, 요약, persona rules, status, public visibility, profile/hero image를 관리한다. Rough seed는 아직 확정되지 않은 필드를 의도적으로 controlled placeholder로 채운다.

### 자동 반영 확인

| Surface | 연결 방식 | 결과 |
|---|---|---|
| `/characters` | `employees` 직접 조회 | 자동 반영 |
| `/characters/[slug]` | slug로 SSOT 조회 | 자동 반영 |
| Sidebar | Active/public employee를 ID로 조회 | 자동 반영 |
| Division Feed | `divisionId`, `teamId`, `employeeId` | 자동 반영 |
| Related Employee | `relatedEmployeeIds`를 SSOT에서 resolve | 자동 반영 |
| Activity Card | `employeeId`를 SSOT에서 resolve | 자동 반영 |
| Admin Characters | `employees` 조회 | 자동 반영 |

Identity 중복 입력은 발견하지 못했다. `employee-showcases.ts`의 상세 소개는 identity 복제가 아니라 승인 직원의 장문 editorial content다. 단, slug 변경 시 `src/data/activities.ts`처럼 URL 문자열을 직접 저장한 activity href와 외부 공유 링크는 수동 migration이 필요할 수 있다.

## F. Legacy Route Matrix

| Legacy Route | 사용 여부 | Canonical | 내부 Link | API/Repository | 삭제 위험 | 권장 처리 |
|---|---|---|---|---|---|---|
| `/roadmap` | 직접 URL 접근만 | 없음 | canonical nav 없음 | static roadmap | 낮음 | Preserve, Founder 승인 후 Archive 또는 Redirect |
| `/early-team-finding` | 직접 URL 접근만 | `/contact` | canonical nav 없음 | static | 낮음 | Redirect 후보, 현재 Preserve |
| `/departments/[divisionSlug]/feed` | legacy OrganizationFeedView | `/division-feed?division=` | legacy component에서 사용 | discussion repository | 중간 | Requires Migration |
| `/departments/[divisionSlug]/teams/[teamSlug]/feed` | legacy team feed | `/division-feed?division=&team=` | legacy component에서 사용 | discussion repository | 중간 | Requires Migration |
| `/admin/discussion-generator` | 실제 생성 flow 진입 | `/admin/content`의 기능 하위 | content/publishing에서 링크 | API, AI, repository | 높음 | Preserve, 향후 `/admin/content`에 Merge |
| `/admin/topics` | 별도 legacy list | `/admin/content` | canonical nav 없음 | topic repository | 중간 | Merge 후보 |
| `/admin/sources` | 별도 legacy list | `/admin/content` | canonical nav 없음 | source repository | 중간 | Merge 후보 |
| `/admin/knowledge-base` | 별도 legacy list | `/admin/content` | canonical nav 없음 | knowledge repository | 중간 | Merge 후보 |
| `/admin/settings` | 별도 legacy settings | `/admin/system` | canonical nav 없음 | env/provider | 낮음 | Redirect 후보 |
| `/admin/consensus-review` | 상세 consensus review | `/admin/review` | canonical nav 없음 | discussion repository | 높음 | Merge, 기능 이관 전 Preserve |

Safe to Remove로 즉시 분류한 route는 없다. Founder 승인 전 삭제하지 않는다.

## G. Shared Component Inventory

| Component | 파일 | 주요 사용 Route | Variant / 현재 문제 | 재사용 |
|---|---|---|---|---|
| Header | `components/layout/site-header.tsx` | Public 전체 | desktop nav + controls | 높음 |
| Sidebar | `components/layout/public-sidebar.tsx` | Public desktop/mobile | tree·accordion 밀도 높음 | 높음 |
| Mobile Drawer | `components/layout/header-overflow-menu.tsx` | Public mobile | Global + Sidebar 결합 | 높음 |
| Page Header | `components/sections/page-hero.tsx` | 정보·Feed page | 단일 accent variant | 높음, variant 후보 |
| Section Header | `components/sections/section-header.tsx` | Home 등 | action 지원 | 높음 |
| Button | `components/ui/button.tsx` | 전체 | shadcn variants | 높음 |
| Card | `components/ui/card.tsx` | Public/Admin | 기본 shell | 높음 |
| Badge | `components/ui/badge.tsx` | 전체 | accent/outline/secondary | 높음 |
| Avatar | `components/organization/employee-avatar.tsx` | 직원 관련 | 원형·fallback | 높음 |
| Employee Card | `components/cards/character-card.tsx` | `/characters` | 승인/Rough | 높음 |
| Activity Card | `components/activity/activity-card.tsx` | Home/Division | featured | 높음 |
| Discussion Card | `components/cards/discussion-card.tsx` | Discussion Hub | thumbnail variants | 높음 |
| Knowledge Card | `components/cards/knowledge-card.tsx` | Home/Knowledge | entry | 높음 |
| Metric Card | `components/cards/metric-card.tsx` | 일부 Public | legacy public metric | 중간 |
| Admin Metric | `components/admin/operations-ui.tsx` | Admin | tone variants | 높음, Metric Card 통합 후보 |
| Empty State | `components/shared/empty-state.tsx` | Feed/List | title/description | 높음 |
| Error State | `app/(public)/error.tsx`, `app/admin/error.tsx` | boundary | Public/Admin 별도 | 적절 |
| Loading State | `app/(public)/loading.tsx`, `app/admin/loading.tsx` | boundary | Public/Admin 별도 | 적절 |
| Mock Badge | `components/admin/operations-ui.tsx` | Admin | IntegrationBadge | Public용 공통 variant 후보 |
| Placeholder Notice | `components/auth/access-placeholder.tsx` | login/signup | disabled action | 높음 |
| Media Placeholder | `components/content/media-placeholder.tsx` | content surface | asset 예정 | 높음 |
| Admin Table | `components/admin/operations-ui.tsx` | canonical Admin | OperationsTable | 높음 |
| Legacy Admin List | `components/admin/admin-list.tsx` | legacy Admin | canonical table과 중복 | 통합 후보 |
| Filter | `components/characters/employee-directory.tsx`, `components/knowledge/knowledge-library.tsx` | list pages | 각 domain 내장 | 공통 control 후보 |
| Search | `components/shared/search-bar.tsx` + domain 내장 | Public | 구현 중복 일부 | 통합 후보 |
| Tabs | Admin Content 내부 버튼 | `/admin/content` | 공용 component 없음 | 공용 Tabs 후보 |

이번 단계에서는 중복 후보를 삭제하거나 합치지 않았다.

## H. Detail Page Design Readiness

| 우선순위 | 현재 Section / Component / Data | Desktop / Mobile | 필요한 Production Asset | Founder 결정 | 디자인만 개선 | 구조 변경 필요 |
|---|---|---|---|---|---|---|
| 1. AI Employee Detail | Identity Hero, specialty, profile, showcase, timeline / EmployeeAvatar / employee+showcase | 2-column -> 1-column | 직원별 Hero/Profile, Core Crystal | 승인 field, tone, 공개 범위 | typography, spacing, image framing | timeline CMS 연결 |
| 2. Intranet Lobby | MainHero, KPI, Activity, Issue, Division, Spotlight, Knowledge | wide dashboard -> stacked | 최종 Lobby Hero, activity thumbnails | 첫 화면 핵심 CTA와 KPI | section rhythm, contrast | actual event feed 연결 |
| 3. AI Employee Directory | filters, approved/rough cards / CharacterCard / employees | 3-column -> 1-column | 18명 profile | Rough 공개 수준, 정렬 기준 | card density, filter visual | Admin edit 기능은 별도 |
| 4. Public Feed & Detail | Pinned Issue, Timeline, Source, Responses, Rebuttal, Consensus | article+aside -> stacked | 전용 Discussion cover | 공개 metadata와 citation rule | article rhythm, source styling | actual AI provenance 연결 |
| 5. Division Feed | overview, scope filter, activity, discussions | grid -> stacked | division key art/icon | 사업부별 대표 색/설명 | selected scope visibility | actual activity store |
| 6. Anonymous Feed | intro, status, chat thread, read-only notice | timeline -> stacked | 익명 avatar system | anonymity policy와 ID 규칙 | bubble rhythm, author distinction | 쓰기/Auth는 MVP 밖 |
| 7. Knowledge | search/filter, document cards, body, source aside | library/article -> stacked | document icon set | 문서 taxonomy, revision policy | document hierarchy | version/archive backend |
| 8. Architect & Review Admin | metrics, provider, run history, queue, actions | dense console -> stacked/table scroll | 없음 우선 | 운영 KPI, 권한, review SLA | status colors, table density | actual ledger/observability |

대규모 상세 디자인은 적용하지 않았다. 현재 구조는 Figma 디자인 검토를 시작할 수 있으며, Production Asset과 Founder 결정 항목을 먼저 잠그면 재작업을 줄일 수 있다.

## I. Fixes Applied

1. `package.json`에 `npm run typecheck` 추가.
2. Home Company Activity에 `Mock Data` 표시 추가.
3. Discussion Hub/Public/Detail에 `Mock Data` 표시 추가.
4. Knowledge List/Detail에 `Mock Data` 표시 추가.
5. Division Feed에 `Mock Activity` 표시 추가.
6. Admin Publishing에 `Mock`, `Not Connected`, 외부 채널 미연동 설명 추가.
7. 영어 선택을 `ENGLISH · 준비 중` disabled 상태로 변경.
8. Discussion Detail의 구 PSS 표기 이미지를 기존 Ptudio employee group asset으로 교체.
9. Desktop/Mobile 영향 화면 20장을 production build에서 재캡처.

이전 브랜드가 포함된 `06-discussion-preview.png`, `07-main-feed-thumbnail-overview.png` 원본 파일은 Asset Registry와 이력 보존을 위해 삭제하지 않았고, 현재 canonical UI에서는 렌더링하지 않는다.

Domain, API, Repository, Database schema, AI flow, route contract는 변경하지 않았다.

## J. Verification Results

| 검증 | 결과 |
|---|---|
| `npm.cmd run lint` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run build` | PASS, 65 static/dynamic route 생성 |
| `npm.cmd run test:core-flow` | PASS 2/2 |
| `npm.cmd run test:ai` | PASS 9/9 |
| `npm.cmd run test:repositories` | Mock PASS 1, Postgres SKIP 1 (`TEST_DATABASE_URL` 없음) |
| Browser Console | 3002 production 검수 중 error 없음. 기록에는 이전 3001 HMR info만 존재 |
| Canonical route | Public/Admin 25개 모두 HTTP 200 |
| Invalid slug | HTTP 404 |
| Invalid division query | HTTP 200 + 전체 Overview fallback |
| Mobile horizontal overflow | 390 x 844 캡처 대상에서 없음 |
| Broken image | 캡처 대상에서 없음 |
| Broken link | canonical 검수 route에서 없음 |
| Public page AI call | 코드·동작 확인상 페이지 진입만으로 AI call 없음 |
| Mock vs Actual | 주요 오해 가능 표면에 badge/notice 적용 |

### 남은 차단 요소

1. Git 설치 및 실제 repository 초기화/remote 연결이 없어 변경 추적과 rollback 근거가 약하다.
2. Postgres contract test는 테스트 DB URL 없이는 완료 판정할 수 없다.
3. Rough 직원 15명의 identity와 production asset은 Founder 확정이 필요하다.
4. Discussion 전용 cover, Division 대표 asset, Knowledge icon taxonomy가 아직 임시다.
5. Legacy route는 기능 migration/Founder 승인 전 삭제하면 안 된다.
6. 초기 Postgres migration seed 설명에 `PSS` 문구 1건이 남아 있다. 현재 Mock UI에는 노출되지 않으며 이미 적용됐을 수 있는 migration을 임의 수정하지 않았다. Production DB 전환 전 forward data migration으로 `Ptudio` 정합성을 맞춰야 한다.
7. `PSS_REPOSITORY_PROVIDER`는 과거 환경 변수 호환 alias로 내부에 남아 있다. UI 브랜드 문구가 아니며 제거 시 배포 환경 migration 검토가 필요하다.

### 다음 단계 권고

다음 작업은 신규 기능이 아니라 Founder/Figma 상세 디자인 리뷰다. 우선 `AI Employee Detail`과 `Intranet Lobby`의 production asset, 정보 우선순위, 공개 필드를 확정한 뒤 현재 component 구조 위에서 시각 고도화를 진행한다.
