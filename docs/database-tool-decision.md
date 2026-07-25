# PSS BETA Database Tool Decision

Status: architectural decision only. No package installation, database connection, migration, or adapter implementation has been performed.

## Decision

Recommended approach:

```txt
Access style: Query Builder
Query tool: Kysely
Postgres provider: Neon Postgres through Vercel Marketplace
Runtime driver: @neondatabase/serverless with transaction-capable Pool/WebSocket mode
Migration mechanism: Kysely Migrator with explicit migration files
Default app provider: mock
```

This decision is reversible because the Repository Interfaces stay above the database layer. Kysely, Neon, and migration details remain inside the Postgres adapter and database boundary.

## Why This Fits PSS BETA

PSS BETA already has a clean Repository Architecture:

```txt
Admin UI
-> Client Adapter
-> API Routes
-> Discussion Engine Service
-> Repository Interfaces
-> Persistence Adapter
```

The database tool should implement repository contracts without leaking into the Service Layer or API DTOs. Kysely fits because it is a SQL query builder, not an ORM. It keeps SQL concepts explicit while providing TypeScript assistance for table and query shapes.

The current Discussion Engine needs:

- aggregate reconstruction
- explicit joins
- atomic `saveDiscussionFlow()`
- clear migrations
- low coupling to generated persistence models
- serverless-safe connection handling

## Option Comparison

| Criterion | SQL-first | Query Builder | ORM |
| --- | --- | --- | --- |
| Repository compatibility | Strong | Strong | Medium |
| Domain isolation | Strong | Strong | Medium |
| Aggregate reconstruction | Strong but verbose | Strong and structured | Convenient, but relation mapping can leak |
| Transaction support | Strong | Strong | Strong |
| Migration clarity | Strong | Strong | Medium to strong |
| Type safety | Low to medium | High | High |
| SQL visibility | Highest | High | Medium |
| Vercel compatibility | Depends on driver | Good with Neon/Kysely boundary | Depends on ORM/runtime |
| Connection management | Manual | Manual but contained | Tool-specific |
| Testing | Good | Good | Good |
| Operational complexity | Low to medium | Medium | Medium to high |
| MVP fit | Good but more manual | Best balance | Too much abstraction now |
| Future extensibility | Good | Good | Good but more lock-in |
| Lock-in | Low | Low to medium | Medium to high |

## Selected Option: Query Builder

Selected tool combination:

- `kysely`
- `@neondatabase/serverless`
- Kysely migration files

Why:

- Repository implementations can remain hand-authored and explicit.
- Domain Models do not need to import generated ORM types.
- Complex aggregate reads can be built intentionally.
- Transactions can wrap `saveDiscussionFlow()`.
- Migration files remain reviewable.
- Tooling is lighter than a full ORM.

## Driver Decision

Selected runtime driver:

```txt
@neondatabase/serverless
```

Runtime mode:

- Use transaction-capable Pool/WebSocket mode for repository operations that need transactions.
- Do not rely on stateless HTTP-only execution for `saveDiscussionFlow()`, because the Discussion Engine requires atomic multi-table writes.

Why Neon:

- It is a good fit for Vercel deployment.
- It supports serverless application patterns.
- It can be provisioned through Vercel Marketplace.
- It keeps Postgres as the underlying database.

## Migration Decision

Selected migration mechanism:

```txt
Kysely Migrator
```

Migration style:

- Explicit migration files.
- Forward-only migration workflow for MVP.
- No automatic migration during every Vercel build.

Future migration location:

```txt
src/lib/database/migrations/
```

Naming convention:

```txt
YYYY-MM-DD-HHMM_descriptive_name.ts
```

Example:

```txt
2026-07-11-2100_create_discussion_engine_tables.ts
```

## Rejected Alternatives

### SQL-first only

Why not selected:

- Excellent SQL clarity, but more manual TypeScript result mapping.
- More room for shape drift between Postgres rows and Repository return types.
- MVP still benefits from typed query composition.

Where it remains useful:

- Raw SQL fragments for complex aggregate reads.
- Performance-sensitive queries.
- Schema review and migration clarity.

### Full ORM

Why not selected:

- Adds generated client/schema conventions before the domain is fully stabilized.
- Can encourage persistence models to shape Domain Models.
- More operational and generated-code surface than this MVP needs.
- The current Repository Interfaces already give enough abstraction.

Where it may be reconsidered:

- If future Auth, billing, relational admin features, and back-office tooling become much larger than the Discussion Engine.

### Drizzle

Why not selected as the default now:

- It is a strong option, especially for schema-driven TypeScript SQL.
- But the project currently needs a minimal persistence boundary and explicit aggregate reconstruction, not a schema DSL commitment yet.
- Kysely keeps the database layer thinner and slightly less framework-shaped.

## Status Field Policy

Decision:

```txt
Use text with check constraints in the first Postgres migration.
```

Why:

- Plain `text` alone permits invalid values.
- Native Postgres enums create more migration friction while statuses are still evolving.
- Check constraints provide a good MVP middle ground.
- TypeScript constants remain the source used by the app.

Apply to:

- `topics.status`
- `topics.priority`
- `topics.risk_level`
- `sources.type`
- `sources.trust_level`
- `sources.risk_level`
- `discussions.status`
- `discussions.mode`
- `ai_responses.round`
- `content_drafts.format`
- `content_drafts.status`

## Discussion Delete Policy

Decision:

```txt
Hard delete for generated, unpublished development/test rows.
Archive/soft-delete for production or published rows.
```

MVP behavior:

- Keep `DELETE /api/admin/discussions` as dev/mock reset behavior only.
- Do not expose destructive production deletion for published content.
- Add an internal `origin` or `is_generated` marker when Postgres is implemented.

Future production policy:

- Prefer archive state over physical deletion after publication.
- Keep audit-sensitive content recoverable.

## Human Review Records

Decision:

```txt
Keep review status on content_drafts for MVP.
Defer human_reviews table until Auth exists.
```

Why:

- Current API only updates `ContentDraft.status`.
- There is no reviewer identity yet.
- A separate review table becomes valuable after Auth, reviewer roles, notes, and audit history exist.

## Environment Variable Decision

Recommended variables:

```txt
PERSISTENCE_PROVIDER
DATABASE_URL
DATABASE_URL_DIRECT
```

Not recommended for MVP:

```txt
DATABASE_SSL_MODE
```

Why:

- Neon/Vercel-provisioned URLs should encode connection/security requirements.
- Adding SSL mode early creates config surface without current need.

Provider behavior:

- Missing `PERSISTENCE_PROVIDER` means `mock`.
- `mock` requires no database variables.
- `postgres` requires `DATABASE_URL`.
- Migrations should use `DATABASE_URL_DIRECT` when available.

## Migration Execution Workflow

Recommended MVP workflow:

```txt
Local development:
  run migration command manually against local/preview DB

Preview:
  use preview branch/database
  run migrations explicitly after review

Production:
  apply migrations manually or through a gated CI job
  do not run migrations automatically during every Vercel build
```

Why:

- Schema-changing operations should be explicit.
- Vercel builds should not mutate production schema by default.
- Preview deployments can be frequent; automatic migrations can create drift and surprises.

Rollback strategy:

- Prefer forward-fix migrations.
- Avoid down migrations for production rollback unless a migration is proven reversible and safe.

Schema drift detection:

- Add a future script that checks applied migrations against the migration table.
- Run it in CI before enabling `PERSISTENCE_PROVIDER=postgres`.

## Runtime Decision

Postgres-backed API routes should run in Node.js runtime.

Recommendation:

- Add `export const runtime = "nodejs";` only when a route actually uses the Postgres provider.
- Do not add runtime exports during this planning milestone.

Why:

- The current app is mock-only and builds without DB env vars.
- The future Postgres adapter should not accidentally run in an Edge-only runtime.

## Remaining Risks

- Kysely provides compile-time query help, but row-to-domain mappers must be carefully tested.
- Neon HTTP mode is not enough for interactive transaction needs; implementation must use a transaction-capable connection mode.
- Connection handling must be lazy and provider-gated.
- Generated discussion delete/reset must be production-guarded.
- Check constraints need disciplined updates when TypeScript constants change.

## References

- Kysely documentation: https://kysely.dev/
- Kysely migrations: https://kysely.dev/docs/migrations
- Neon serverless driver: https://neon.com/docs/serverless/serverless-driver
- Neon with Kysely: https://neon.com/docs/guides/kysely
- Vercel Neon Marketplace: https://vercel.com/marketplace/neon/neon
