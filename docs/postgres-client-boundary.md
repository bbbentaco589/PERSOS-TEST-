# PSS BETA Postgres Client Boundary

Status: implemented. Postgres client는 Lazy Initialization을 유지하며 Mock Mode와 build에서는 생성되지 않습니다.

## Boundary Goal

The Postgres client is owned by the database layer and consumed only by the Postgres repository adapter.

Allowed:

```txt
RepositoryFactory
-> Postgres Repository Composition Root
-> Database Client Boundary
-> Kysely
-> Neon Postgres Driver
-> Postgres
```

Disallowed:

```txt
API Route -> Database Client
Service Layer -> Database Client
UI -> Database Client
```

## Proposed Future File Structure

Do not create these files until the implementation milestone.

```txt
src/lib/database/
  postgres-client.ts
  postgres-config.ts
  postgres-types.ts
  migrations/
    YYYY-MM-DD-HHMM_create_discussion_engine_tables.ts

src/lib/repositories/postgres/
  postgres-repositories.ts
  postgres-repository-composition.ts
  mappers/
    character.mapper.ts
    topic.mapper.ts
    source.mapper.ts
    discussion.mapper.ts
    content.mapper.ts
    knowledge.mapper.ts
  queries/
    characters.queries.ts
    topics.queries.ts
    sources.queries.ts
    discussions.queries.ts
    discussion-persistence.queries.ts
```

## Ownership

### `src/lib/database/postgres-config.ts`

Owns:

- reading database environment variables
- validating required config when provider is `postgres`
- returning typed config objects

Must not:

- create a client at module scope
- throw during mock provider usage
- require `DATABASE_URL` during lint/build when mock is active

### `src/lib/database/postgres-client.ts`

Owns:

- Kysely client creation
- Neon driver setup
- lazy singleton cache
- optional test reset/dispose helper

Must not:

- be imported by API routes
- be imported by Service Layer
- initialize when provider is `mock`

### `src/lib/repositories/postgres/postgres-repository-composition.ts`

Owns:

- calling `getPostgresDb()`
- passing the db/client to Postgres repository classes
- keeping the RepositoryFactory clean

## Lazy Initialization Strategy

Initial state:

```txt
_db = null
```

First use:

```txt
getPostgresDb()
-> read env
-> validate DATABASE_URL
-> create Neon/Kysely client
-> cache client
-> return client
```

Subsequent use:

```txt
getPostgresDb()
-> return cached client
```

Mock provider behavior:

- `RepositoryFactory.getRepositories()` returns mock repositories by default.
- Mock repositories must not import `postgres-client.ts`.
- Missing `DATABASE_URL` must not affect lint, build, static pages, or mock-mode route execution.

Missing config behavior:

- If `PERSISTENCE_PROVIDER=postgres` and `DATABASE_URL` is missing, fail on first Postgres repository use with a clear configuration error.
- Do not fail during module import.

Initialization failure behavior:

- Surface a typed/categorized initialization error from the database boundary.
- Do not swallow connection errors inside repositories.
- API routes can convert adapter errors to API errors later.

Development hot reload:

- Use `globalThis` caching only if the selected Kysely/Neon client creates reusable process resources that would otherwise multiply during hot reload.
- Keep the global key private and explicit, for example `__pssBetaPostgresDb`.
- Do not use JavaScript `Proxy` wrappers for lazy initialization.

Production runtime:

- Reuse the process-local cached client within the same serverless/Fluid Compute instance.
- Assume instances can be recycled at any time.
- Do not rely on process memory for durable state.

Test behavior:

- Future tests should be able to inject a test database client into the Postgres repository composition root.
- Add a test-only reset/dispose helper only after a test framework is selected.

## Environment Configuration

Recommended variables:

| Variable | Required when | Purpose |
| --- | --- | --- |
| `PERSISTENCE_PROVIDER` | optional | Selects `mock` or `postgres`; default is `mock`. |
| `DATABASE_URL` | `postgres` runtime | Pooled/serverless application connection. |
| `DATABASE_URL_DIRECT` | migrations | Direct/admin migration connection when available. |

Not recommended yet:

| Variable | Reason |
| --- | --- |
| `DATABASE_SSL_MODE` | Neon/Vercel URLs should encode SSL behavior. Add only if a selected provider requires it. |

Environment behavior:

| Environment | Behavior |
| --- | --- |
| Local mock development | No database env vars required. |
| Local Postgres development | Set `PERSISTENCE_PROVIDER=postgres` and `DATABASE_URL`. |
| Automated tests | Contract tests can run mock-only; Postgres tests require isolated test DB env vars. |
| Vercel Preview | Use preview/branch database URL; do not point preview at production DB. |
| Vercel Production | Use production database URL and explicit migration approval. |
| Unavailable database | Mock mode continues working; postgres mode fails on first DB use. |

## Connection Handling

Selected provider:

```txt
Neon Postgres through Vercel Marketplace
```

Runtime driver:

```txt
@neondatabase/serverless
```

Transaction requirement:

- The Discussion Engine requires atomic multi-table writes.
- The implementation should use transaction-capable connection mode.
- Avoid HTTP-only patterns for `saveDiscussionFlow()` if they cannot support the required transaction semantics.

Connection exhaustion prevention:

- Prefer Neon/Vercel-provisioned pooled URLs for runtime.
- Use direct URLs only for migrations/admin operations.
- Keep client initialization lazy.
- Avoid per-request client construction where the selected driver maintains connection state.

## Transaction Boundary Exposure

The Service Layer should never see Kysely or Neon objects.

Future repository API:

```txt
DiscussionPersistenceRepository.saveDiscussionFlow(flow, options)
```

Internal adapter behavior:

```txt
db.transaction().execute(async (trx) => {
  write discussion aggregate with trx
})
```

The transaction object remains inside the Postgres adapter. Domain services and API routes continue using Repository Interfaces only.

## Runtime Placement

Future Postgres-backed API routes should use Node.js runtime.

Recommendation:

```ts
export const runtime = "nodejs";
```

Add this only when routes actually use the Postgres provider.

Reason:

- Database clients and transaction-capable drivers are Node/runtime-sensitive.
- Current mock-only routes do not need a runtime export.

## Migration Execution Design

Migration file location:

```txt
src/lib/database/migrations/
```

Migration table:

```txt
kysely_migration
kysely_migration_lock
```

Generation:

- Prefer manually authored migration files for the first MVP schema.
- Add generation helpers only after a tool convention is stable.

Apply command:

- Future proposal only:

```txt
npm run db:migrate
```

The script should load env vars explicitly and run a migration runner script. Do not add the script until dependencies are installed.

Recommended production flow:

```txt
1. Review migration PR
2. Apply migration to preview database
3. Run repository contract tests against preview database
4. Approve production migration
5. Apply production migration manually or through gated CI
6. Deploy app with postgres provider only after verification
```

Avoid:

- automatic schema-changing migrations during every Vercel build
- running migrations from API routes
- running migrations from the Next.js app startup path

Rollback strategy:

- Use forward-fix migrations for MVP.
- Backward migrations should be written only when safe and tested.

Schema drift:

- Add a future `db:status` script that checks migration table state.
- CI should fail if expected migrations are missing.

## Provider Switching

Current factory behavior:

```txt
missing PSS_REPOSITORY_PROVIDER -> mock
PSS_REPOSITORY_PROVIDER=postgres -> postgres placeholder
```

Recommended cleanup:

- Standardize future docs and implementation on `PERSISTENCE_PROVIDER`.
- Keep backward compatibility with `PSS_REPOSITORY_PROVIDER` during transition if needed.
- Do not change current provider behavior in this planning milestone.

## Implementation Checklist For Next Milestone

Do not execute now.

- Install selected dependencies.
- Add typed database table interfaces.
- Add lazy `getPostgresDb()`.
- Add config reader that does not throw in mock mode.
- Add repository composition root.
- Implement read-only repository methods first.
- Add repository contract tests.
- Keep mock as default until all tests pass.

## References

- Kysely getting started: https://kysely.dev/docs/getting-started
- Kysely migrations: https://kysely.dev/docs/migrations
- Neon serverless driver: https://neon.com/docs/serverless/serverless-driver
- Neon Kysely guide: https://neon.com/docs/guides/kysely
- Vercel Storage and Marketplace guidance: https://vercel.com/docs/storage
