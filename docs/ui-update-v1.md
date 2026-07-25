# PSS BETA UI Update v1

최종 갱신: 2026-07-15

## 목적과 기준

Core MVP의 Domain, API, Repository, AI Provider, Publishing Gate를 변경하지 않고 포트폴리오 및 투자자 Preview에 사용할 수 있는 첫 번째 시각 업데이트를 적용했습니다.

```txt
Notion HQ / Design Asset Inventory
→ Figma UI Specification
→ Implementation
```

이번 버전은 최신 Figma 확정본이 없는 상태에서 Notion Asset Inventory와 기존 IA를 기준으로 만든 `UI Update v1`입니다.

## Design Asset 01–09 적용 기록

배포용 사본은 `public/assets/ui-v1`에 보관합니다. 원본과 승인 상태의 소유권은 Notion Asset Inventory에 있습니다.

| 번호 | 에셋 | 로컬 파일 | 적용 위치 | 결과 |
| --- | --- | --- | --- | --- |
| 01 | Main Hero Visual | `01-main-hero.png` | Public Main Hero | 적용 |
| 02 | AI Company Studio Background | `02-studio-background-overview.png` | 참고 전용 | 직접 적용 보류: Notion 본문에서 Overview Sheet의 Production Background 사용을 금지함 |
| 03 | MVP Employee Group Visual | `03-mvp-employee-group.png` | Main Employee Showcase | 적용 |
| 04 | Employee Hero Image Set | `04-employee-hero-1~3.png` | SIG, Lo-Pay Park, LUMI 상세 Hero | 적용 |
| 05 | Employee Profile Image Set | `05-employee-profile-1~3.png` | 카드, 상세, 토론, Admin Selector | 적용 |
| 06 | Discussion Preview Visual | `06-discussion-preview.png` | Main, Discussion 목록·상세 | 적용 |
| 07 | Main Feed Thumbnail Set | `07-main-feed-thumbnail-overview.png` | Discussion·Knowledge 카드 | Overview Sheet를 고정 Crop 컴포넌트로 임시 적용 |
| 08 | Core Crystal Graphic Set | `08-core-crystal-overview.png` | Persona Core Badge | Overview Sheet를 고정 Crop 컴포넌트로 임시 적용 |
| 09 | Division Icon Set | `09-division-icons-overview.png` | Navigation, 카드, 상세, Admin | Overview Sheet를 고정 Crop 컴포넌트로 임시 적용 |

02, 07, 08, 09는 개별 Export 파일이 제공되면 현재 Crop 기반 Presentation Component의 경로만 교체합니다. 기능 또는 Domain 변경은 필요하지 않습니다.

## 화면 적용

Public:

- Main: Hero, 회사 운영 흐름, MVP 직원 3인, Discussion Engine, Published Output
- Employee Showcase: SIG, Lo-Pay Park, LUMI의 실제 Profile과 소속·직책·상태
- Employee Detail: 직원별 Hero, Persona Core, 전문 분야, Timeline, Knowledge, Published Discussion
- Discussion: Published 전용 목록, 참여 직원, 토론 상태와 실제 Feed Thumbnail
- Discussion Article: Topic → Source → Initial Response → Cross Rebuttal → Consensus → Published Content
- Division: 정규화된 Division Icon과 현재 운영 조직
- Knowledge: 실제 카드 데이터와 Feed Thumbnail
- Navigation: 현재 경로 표시, Mobile 주요 메뉴, 회사 디렉터리 직원 이미지

Admin:

- Discussion Generator: 실제 Profile Image와 Division Icon을 사용한 참여 직원 선택
- Consensus Review: 실제 참여 직원 Profile Image
- Publishing: 기존 기능 중심 구조와 Publishing Gate 유지

## Organization Canonical Sync

- `/departments` Route는 유지하면서 Company → 6 Division → 18 Team → Active Employee 구조로 재구성했습니다.
- 좌측 Organization Directory는 Division별 Team과 배치 Employee를 탐색하는 구조로 변경했습니다.
- Employee Card/Detail, Discussion Participant, Knowledge/Content 책임 표시에 Division과 Team 관계를 연결했습니다.
- Admin Character와 Discussion Generator는 Position과 최신 조직 경로를 함께 표시합니다.
- Public UI의 현행 조직 의미에서 Department 표기를 제거했습니다.
- 사업개발본부는 `Business Development Headquarters`로 표시합니다.
- 09 Division Icon Overview Crop은 기존 구조를 유지하며 6개 Division ID 매핑을 추가했습니다. 개별 Production Export가 제공되면 교체가 필요합니다.

## Responsive 검증

| Viewport | 결과 |
| --- | --- |
| Desktop 1440×900 | Main, 직원 3인, 토론, 부서, 지식, Admin 핵심 화면 정상 |
| Tablet 768×900 | Hero와 카드 Grid 정상, 가로 Overflow 없음 |
| Mobile 390×844 | Stack, CTA, 직원 Hero Focal Point, Discussion, Admin 정상; 문서 전체 가로 Overflow 없음 |

`prefers-reduced-motion`에서 Reveal과 Transform을 비활성화합니다. 핵심 이미지에는 의미 있는 alt를 제공하고 장식 또는 중복 이미지는 빈 alt를 유지합니다.

## Publishing Gate 회귀

브라우저에서 다음 흐름을 확인했습니다.

```txt
Topic / Source / Employee
→ Mock Discussion 전체 생성
→ Pending Review
→ Approved
→ Published
→ Public 목록·상세 노출
→ Archived
→ Public 차단
```

Public Main과 Discussion은 Repository 기반 `listPublicDiscussions()`를 사용하며 정적 Mock 배열로 Gate를 우회하지 않습니다.

## Portfolio Mockup 10 제작 조건

추천 캡처는 1440×900 Desktop과 390×844 Mobile입니다.

1. Main Hero
2. MVP Employee Showcase
3. SIG Detail
4. Lo-Pay Park Detail
5. LUMI Detail
6. Discussion Preview
7. Published Discussion Article
8. Consensus Surface
9. Admin Discussion Generator의 전체 생성 완료 상태
10. Admin Review의 Approved 또는 Published 상태

실제 Route와 Repository 상태를 사용하고 목업용 데이터 하드코딩은 하지 않습니다.

## State Visual 11 제작 조건

| 상태 | 권장 크기 | Safe Area | 용도 |
| --- | --- | --- | --- |
| Empty | 640×480 | 중앙 70%, 가장자리 15% 여백 | 검색 결과, Published Output, Knowledge 없음 |
| Loading | 512×512 투명 배경 | 중앙 60% | Discussion 생성, Repository 조회 |
| Error | 640×480 | 중앙 70%, 하단 CTA 공간 유지 | API, Provider, Not Found |

문구와 CTA는 이미지에 굽지 않고 한국어 UI에서 렌더링합니다. `prefers-reduced-motion`용 정적 대체 프레임을 함께 준비합니다.

## 남은 UI Backlog

- P0: 확인된 차단 문제 없음
- P1: 02 Background와 07–09 세트의 개별 Production Export 교체
- P2: 비핵심 Admin 화면 정리, Empty·Loading·Error Illustration, 최종 Figma Token 정렬
- 외부 미검증: 실제 OpenAI, Neon Postgres, Production 배포
