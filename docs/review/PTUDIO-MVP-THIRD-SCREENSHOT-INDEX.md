# Ptudio MVP 3차 보정 Screenshot Index

촬영 기준: 2026-07-21, 로컬 Mock Provider, `http://localhost:3001`

| 화면 | Desktop | Mobile |
| --- | --- | --- |
| Canonical Sidebar IA | [Desktop](./screenshots/ptd-sidebar-canonical-desktop-v3.png) | [Mobile Drawer](./screenshots/ptd-sidebar-canonical-mobile-v3.png) |
| 사업부 개별 인트라넷 Overview | [Desktop](./screenshots/ptd-division-overview-desktop-v3.png) | [Mobile](./screenshots/ptd-division-overview-mobile-v3.png) |

## 확인 포인트

- 사업부 Accordion 아래에 Team 중간 행 없이 직원이 바로 노출된다.
- 직원명은 1차 정보, 소속 팀은 2차 정보로 표시된다.
- Desktop과 Mobile Drawer가 동일한 IA와 Accordion 규칙을 사용한다.
- `/division-feed`는 6개 사업부, 소속 팀, 담당 직원, 최근 활동, 주요 토론, Knowledge를 한 화면에서 구분한다.
- 이미지 깨짐, 가로 Overflow, 화면 노출 PSS 문구는 발견되지 않았다.

