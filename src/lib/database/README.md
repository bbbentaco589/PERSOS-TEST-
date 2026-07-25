# Ptudio AI Company Intranet BETA Database Layer

Kysely와 Neon을 사용하는 Postgres 경계입니다. 기본 Persistence Provider는 계속 `mock`입니다.

## 현재 구현

- Lazy Postgres Client
- Typed Kysely Schema
- Initial Core MVP Migration
- Core MVP Seed
- Postgres Repository Composition Root
- Transaction 기반 `saveDiscussionFlow()`
- Mock/Postgres 공통 Repository Contract Test

API Route, UI, Discussion Engine Service는 DB Client를 직접 import하지 않습니다.

## 환경 변수

```txt
PERSISTENCE_PROVIDER=mock | postgres
DATABASE_URL=Postgres runtime URL
DATABASE_URL_DIRECT=Migration/seed용 direct URL (선택)
TEST_DATABASE_URL=비운영 계약 테스트 DB URL (선택)
```

`PERSISTENCE_PROVIDER`가 없으면 `mock`입니다. Mock Mode에서는 DB 환경 변수가 필요 없고 DB Client도 생성되지 않습니다.

## 명시적 명령

```bash
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run test:repositories
```

- Migration과 Seed는 build 또는 애플리케이션 시작 시 자동 실행되지 않습니다.
- `db:migrate`와 `db:seed`는 `DATABASE_URL_DIRECT`를 우선 사용합니다.
- Postgres 계약 테스트는 `TEST_DATABASE_URL`이 있을 때만 실행됩니다.
- Production Migration은 수동 승인 또는 gated CI로만 실행합니다.

## 검증 상태

- Mock Repository Contract 및 Core MVP Flow: 통과
- Postgres Adapter 구현과 Type Check: 통과
- 실제 Migration/Seed/Postgres Contract/프로세스 재시작 복원: `TEST_DATABASE_URL` 미제공으로 미검증

Review 상태 변경 시 Content Draft와 Discussion 상태를 함께 갱신하며, `Published` 전환은 `published_at`과 `public_url`을 같은 Transaction에 기록합니다. Public Query는 두 상태가 모두 `Published`인 Aggregate만 반환합니다.
