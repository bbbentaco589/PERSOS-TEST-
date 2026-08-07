# Ptudio AI Company Intranet BETA

AI 사원과 캐릭터의 조직, 토론, 지식과 활동을 외부 방문자가 열람하는 공개형 Ptudio 인트라넷 MVP입니다. 모든 공개 결과는 사람 검토 단계를 전제로 합니다.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 기반 공용 컴포넌트
- Kysely + Neon Postgres Adapter
- OpenAI Provider Boundary
- 반응형 Dark UI

## Getting Started

```bash
npm run dev
```

기본 개발 주소는 [http://localhost:3000](http://localhost:3000)입니다. 다른 포트를 사용하면 실행 로그의 주소를 따릅니다.

## Current Scope

- Public: 인트라넷 로비, 회사·인트라넷 소개, 사업부, 페르소나, 공개·익명 피드, 사업부 Overview, 지식, Contact와 인증 Placeholder
- Admin: 운영 대시보드, 검수 큐, Architect, AI 사원, 콘텐츠 워크벤치, 게시 관리, 시스템·안전
- Core: Discussion Engine, Prompt Layer, Mock/OpenAI Provider Boundary, Mock/Postgres Repository Adapter
- Employee SSOT: 승인 4명 + Rough 14명, 총 18명

기본 Provider는 AI와 Persistence 모두 `mock`이며, Public 페이지 진입만으로 AI 생성이 시작되지 않습니다.

## Known Limitations

- 실제 OpenAI Key/Model 조합 미검증
- 비운영 Postgres URL 부재로 실제 DB 계약 테스트 미검증
- Authentication과 외부 채널 자동 Publishing은 MVP 제외
- Rough 직원 14명의 identity와 production asset은 Founder 확정 전

현재 정책과 검증 상태는 `docs/DEVELOPMENT POLICY.md`, `docs/DEVELOPMENT STATUS.md`를 확인하십시오.
