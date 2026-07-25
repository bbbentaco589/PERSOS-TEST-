# Ptudio AI Company Intranet BETA 개발 현황

최종 갱신: 2026-07-21

공통 제품·개발 기준은 [Ptudio 개발 공통 정책](./DEVELOPMENT%20POLICY.md)을 따릅니다.

## 최신 IA/UI 동기화

Notion HQ Final v3를 기준으로 공개형 인트라넷 IA와 운영 콘솔을 동기화했습니다.

- Public canonical Route 18개와 기존 Legacy Route를 함께 보존
- 전사원 통합 인트라넷과 6개 사업부 개별 인트라넷을 Sidebar에서 분리
- 사업부 아코디언은 초기 전체 닫힘, 한 번에 하나만 열림
- Sidebar 표현 계층은 `사업부 → AI 사원`이며 팀은 직원의 보조 정보로만 표시
- 조직 데이터 계층은 사업부 6개, 팀 18개, AI 사원 18명을 유지
- Approved 사원 3명의 기존 설정·에셋은 보존
- 추가 15명은 `Rough/Draft` fixture로 구분하고 임시 Ptudio 에셋 사용
- Knowledge 목록 필터와 상세 Route 연결
- Admin canonical Route를 Dashboard, Review, Architect, Characters, Content, Publishing, System으로 정리
- 기존 Admin 도구 Route는 삭제하지 않고 Legacy 직접 접근 경로로 유지
- Public 페이지 로딩 시 AI 생성 호출 없음

## Core MVP 판정

**Core MVP Complete with Known Limitations**

Mock 기반 전체 사용자 흐름과 자동 테스트는 통과했으며 현재 확인된 P0/P1 결함은 없습니다. 실제 OpenAI Key/Model과 비운영 Postgres가 제공되지 않아 외부 통합 조합은 미검증입니다.

## Portfolio & Investor Preview UI Update v1

Notion `PSS - Design Asset Inventory`의 01–09를 검토하고 Public Main, Employee Showcase/Detail, Discussion, Division, Knowledge와 핵심 Admin 화면에 적용했습니다. 02는 Notion 본문의 Overview Sheet 사용 금지에 따라 참고 전용으로 유지했고, 07–09는 개별 Export가 없어 Overview Sheet Crop 기반 Presentation Component로 임시 적용했습니다.

- Approved 직원: 시그(SIG), 박봉남(Lo-Pay Park), 루미(LUMI)
- Rough/Draft 직원: 15명
- Main과 Discussion Public Query를 Repository 기반 Published Gate로 유지
- 1440×900, 768×900, 390×844에서 핵심 화면 검증
- 390px의 Hero·Discussion Preview·직원 상세 Focal Point와 가로 Overflow 수정
- Next Image `sizes`, Hero Priority, 75/90/92 품질 설정 반영
- 상세 기록: [UI Update v1](./ui-update-v1.md)

## Organization Canonical Sync

Notion 조직 운영 백서와 `PSS - Departments`, `PSS - Characters`를 기준으로 조직 모델과 Public/Admin Presentation을 동기화했습니다.

- 공식 계층: `Ptudio AI Company → Division → Team → AI Employee → Content · Project · IP`
- 6개 Division, 18개 Team, AI Employee 18명 반영
- SIG: 커뮤니티사업부 / CCGG 케어팀 / Crypto & Macro Analyst
- Lo-Pay Park: 전략분석사업부 / 예측시장팀 / Prediction Market Manager
- LUMI: 테크놀로지사업부 / AI기술연구팀 / AI Trend Analyst
- 사업개발본부 공개 영문명: `Business Development Headquarters`
- Public 조직·직원·토론·지식 화면과 Admin Character/Generator에 Division·Team 경로 표시
- Legacy `departmentId`는 Discussion/API/DB 호환성 필드로 유지하고 Public 표기에서는 제거
- Legal Department fixture는 Archived/Public Hidden으로 유지
- Team Repository와 Postgres 추가 Migration 준비, 실제 Postgres 실행은 미검증

## Provider 검증 Matrix

| AI Provider | Persistence | 결과 |
| --- | --- | --- |
| Mock | Mock | 검증 완료 |
| OpenAI | Mock | 미검증: 실제 Key/Model 없음 |
| Mock | Postgres | 미검증: 비운영 DB URL 없음 |
| OpenAI | Postgres | 미검증: 실제 Key/Model 및 DB URL 없음 |

기본값은 `AI_PROVIDER=mock`, `PERSISTENCE_PROVIDER=mock`이며 외부 환경 변수 없이 lint, build, test, 실행이 가능합니다.

## 통과한 사용자 흐름

```txt
Admin Discussion Generator
→ 한국어 Prompt Layer
→ Mock AI Provider
→ Initial Responses
→ Cross Rebuttals
→ Consensus
→ Content Draft (Pending Review)
→ Repository / Mock Persistence
→ Approved
→ 새로고침 및 Discussion ID 재조회
→ Published
→ Public Discussion 목록
→ Public Discussion 상세
```

확인 결과:

- 선택된 AI 직원 3명의 서로 다른 한국어 응답 생성
- 3인 순환 교차 반박 생성
- 합의점·이견·한계·Source Reference 생성
- AI 생성 직후 `Pending Review` 유지
- `Pending Review → Approved → Published` 전환
- Discussion과 Content Draft 상태 동기화
- 생성 Discussion ID와 URL Query 기반 재접속
- 새로고침 후 저장 Flow 복원
- Published 콘텐츠만 Public 목록과 상세에 노출
- Pending Review와 Draft의 Public 직접 접근 차단
- 연속 생성 이벤트에서 1개 Flow만 저장
- 390px, 768px, Desktop에서 핵심 화면 가로 Overflow 없음
- Browser Console Error와 Next.js Error Overlay 없음

## 수정한 출시 결함

P0:

- 정적 Public Discussion이 `Pending Review`와 `Draft`까지 노출하던 Human Review 게이트 우회 수정
- 생성·게시된 Discussion이 Public 화면에 연결되지 않던 단절 수정

P1:

- Content Draft 게시 상태와 Discussion 상태가 불일치하던 문제 수정
- Postgres 게시 전환 시 `published_at`과 `public_url`이 기록되지 않던 문제 수정
- 새로고침 시 현재 Admin Discussion 화면이 초기화되던 문제 수정
- 생성 버튼 연속 입력 시 중복 요청 가능성을 버튼 비활성화로 차단
- 같은 Topic의 생성 Discussion Slug 충돌 방지
- 대표 Core MVP 화면과 Mock Data의 Korean-first 전환

## 자동 검증

- `npm.cmd run test:core-flow`: 2/2 통과
- `npm.cmd run test:ai`: 9/9 통과
- `npm.cmd run test:repositories`: Mock 통과, Postgres 1개 Skip
- `npm.cmd run lint`: 통과
- `npm.cmd run build`: 통과

Core Flow Test는 게시 게이트, ID 재조회, Aggregate 관계, Source 범위, 고유 Slug, 공개 조회, 실패 시 부분 저장 금지를 검증합니다.

## 실패 흐름 검증

- OpenAI 설정 누락: `AI_CONFIGURATION_ERROR`, 한국어 메시지, 비밀값 비노출
- Invalid Structured Output: 저장 전 실패, 부분 Aggregate 없음
- Timeout: `AI_TIMEOUT`, 최대 1회 재시도
- Rate Limit: `AI_RATE_LIMITED`, 최대 1회 재시도
- API Failure: `AI_REQUEST_FAILED`
- Persistence Failure: 공통 Repository Contract에서 Rollback과 부분 데이터 미생성 확인
- 존재하지 않는 Discussion ID: 정상적인 Not Found 처리

## 보안 점검

- API Key, Database URL, 전체 Prompt, 민감 Source 원문을 출력하는 Runtime Log 없음
- OpenAI SDK와 Database Client의 Client Component Import 없음
- Server 환경 변수를 `NEXT_PUBLIC_*`로 노출하지 않음
- API 오류 응답에 Stack Trace를 포함하지 않음
- Build 및 Test 중 OpenAI 호출과 Migration 실행 없음

## Known Limitations

- 실제 OpenAI 네트워크 응답 품질·지연·사용량·비용 미검증
- 실제 Postgres Migration, Seed, Contract, 재시작 복원 미검증
- Mock Persistence는 개발 서버 프로세스 재시작 시 초기화됨
- Authentication과 Production Publishing 자동화는 MVP 제외 범위
- 내부 Discussion enum과 DB 호환성 계층에는 `Department` Legacy 명칭이 남아 있음
- Mock AI 문체와 게시 후 콘텐츠 표현은 실제 모델 품질 튜닝 대상
- Next.js 내부 `postcss@8.4.31` 관련 moderate 취약점 2건이 남아 있음

## P2 Backlog

- 실제 OpenAI Character Voice 및 장문 콘텐츠 품질 튜닝
- 생성 단계별 시간과 Token Usage 관찰
- 남은 비핵심 화면 Korean-first 정리
- Loading Animation과 상세 운영 UX 개선
- 안전한 Next.js/PostCSS 패치 경로가 제공되면 의존성 갱신

## 다음 추천 Milestone

**Founder 콘텐츠 승인 및 Production Integration 검증**

15명 Rough 프로필의 이름·직무·설정, 공식 Contact 정보와 최종 브랜드 수치를 Founder가 승인한 뒤 실제 OpenAI·Postgres·Vercel 환경에서 통합 동작과 운영 비용을 검증합니다.
