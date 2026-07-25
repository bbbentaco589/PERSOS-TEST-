# PSS BETA Postgres Repository Adapter Implementation Plan

Status: implemented in code. 실제 비운영 Postgres 검증은 `TEST_DATABASE_URL` 제공 전까지 대기합니다.

## 2026-07 구현 결과

- 모든 Repository Contract를 `Promise` 기반으로 전환했습니다.
- Mock Adapter와 Postgres Adapter가 동일한 비동기 Contract를 구현합니다.
- Kysely Schema Type과 Initial Migration을 구현했습니다.
- Repository Factory는 Postgres Composition Root를 통해 Adapter를 조립합니다.
- `saveDiscussionFlow()`는 전체 Discussion Aggregate를 하나의 Transaction으로 저장합니다.
- Aggregate 재조회, Review Status 변경, 미발행 Generated Discussion 삭제를 구현했습니다.
- 공통 Contract Test는 Mock에서 통과했습니다.
- Postgres Contract Test는 `TEST_DATABASE_URL`이 있을 때만 migration과 seed 후 실행합니다.
- 기본 Provider는 `mock`이며 build 중 Migration 또는 DB 연결을 수행하지 않습니다.

## Goal

Implement a future Postgres repository adapter without changing:

- Admin UI
- Client Adapter
- API route paths
- API request payloads
- API response payloads
- Discussion Engine public methods
- Mock adapter default behavior

The current default provider remains:

```txt
PSS_REPOSITORY_PROVIDER=mock
```

## Target Runtime Architecture

```txt
Admin UI
-> Client Adapter
-> API Routes
-> Discussion Engine Service
-> Repository Interfaces
-> RepositoryFactory
-> Postgres Repository Adapter
-> Database Client Boundary
-> Postgres
```

Business logic does not change because the service layer depends on repository interfaces rather than storage details.

## Repository Contract Compatibility

### CharactersRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listCharacters()` | read | `characters` | `department_id`, `slug` | no | yes |
| `getCharacterById(characterId)` | read | `characters` | PK `id` | no | yes |
| `getCharacterBySlug(slug)` | read | `characters` | unique `slug` | no | yes |
| `getCharactersByDepartmentId(departmentId)` | read | `characters` | `department_id` | no | yes |

Notes:

- Requires mapping `department_id` to `departmentId`, `job_title` to `jobTitle`, `content_role` to `contentRole`.

### TopicsRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listTopics()` | read | `topics` | `created_at`, `status` | no | yes |
| `getTopicById(topicId)` | read | `topics` | PK `id` | no | yes |
| `getTopicBySlug(slug)` | read | `topics` | unique `slug` | no | yes |

Notes:

- `compliance_categories` must map from `jsonb` to `ComplianceCategory[]`.

### SourcesRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listSources()` | read | `sources`, `topic_sources` | `type`, `risk_level` | no | yes |
| `getSourceById(sourceId)` | read | `sources`, `topic_sources` | PK `id` | no | yes |
| `getSourcesByTopicId(topicId)` | read | `sources`, `topic_sources` | `topic_sources.topic_id` | no | yes |
| `getSourcesByIds(sourceIds)` | read | `sources`, `topic_sources` | PK `id` | no | yes |

Notes:

- Adapter must reconstruct `Source.topicIds` from `topic_sources`.
- `getSourcesByIds()` should preserve input order when possible because API display ordering can matter.

### DiscussionsRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listDiscussions()` | read | `discussions`, child tables | `created_at`, `status` | no | yes |
| `getDiscussionById(discussionId)` | read | `discussions`, child tables | PK `id` | no | yes |
| `getDiscussionBySlug(slug)` | read | `discussions`, child tables | unique `slug` | no | yes |
| `getDiscussionsByTopicId(topicId)` | read | `discussions`, child tables | `topic_id` | no | yes |

Child tables required to reconstruct `Discussion`:

- `discussion_participants`
- `discussion_sources`
- `ai_responses`
- `cross_rebuttals`
- `consensuses`

Notes:

- `departmentIds`, `participants`, `sourceIds`, `responseIds`, `crossRebuttalIds`, and `consensusId` are aggregate fields reconstructed by the adapter.

### AIResponsesRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listAIResponses()` | read | `ai_responses`, `ai_response_sources` | `discussion_id` | no | yes |
| `getResponsesByDiscussionId(discussionId)` | read | `ai_responses`, `ai_response_sources` | `discussion_id` | no | yes |

Notes:

- Adapter must reconstruct `sourceIds` from `ai_response_sources`.
- Ordering should be deterministic: `created_at asc`, then `id asc`.

### CrossRebuttalsRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listCrossRebuttals()` | read | `cross_rebuttals` | `discussion_id` | no | yes |
| `getCrossRebuttalsByDiscussionId(discussionId)` | read | `cross_rebuttals` | `discussion_id` | no | yes |

Notes:

- Ordering should be deterministic: `created_at asc`, then `id asc`.

### ConsensusRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listConsensus()` | read | `consensuses`, `consensus_sources` | `discussion_id` | no | yes |
| `getConsensusByDiscussionId(discussionId)` | read | `consensuses`, `consensus_sources` | unique `discussion_id` | no | yes |

Notes:

- Adapter must map `key_agreements`, `open_questions`, and `disagreements` from `jsonb` arrays.

### ContentDraftsRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listContentDrafts()` | read | `content_drafts` | `status`, `created_at` | no | yes |
| `getContentDraftById(contentDraftId)` | read | `content_drafts` | PK `id` | no | yes |
| `getContentDraftsByDiscussionId(discussionId)` | read | `content_drafts` | `discussion_id` | no | yes |
| `listPublishedContent()` | read | `content_drafts` | `published_at`, `status` | no | yes |
| `getPublishedContentBySlug(slug)` | read | `content_drafts` | unique `slug` | no | yes |

Notes:

- `PublishedContent` can be returned from rows where `published_at` and `public_url` are not null.

### KnowledgeEntriesRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listKnowledgeEntries()` | read | `knowledge_entries`, `knowledge_entry_sources` | `category` | no | yes |
| `getKnowledgeEntryById(knowledgeEntryId)` | read | `knowledge_entries`, `knowledge_entry_sources` | PK `id` | no | yes |
| `getKnowledgeEntriesBySourceId(sourceId)` | read | `knowledge_entries`, `knowledge_entry_sources` | `source_id` | no | yes |

Notes:

- Adapter must reconstruct `relatedSourceIds`.

### DiscussionPersistenceRepository

| Method | Query type | Tables | Indexes | Transaction | Return compatible |
| --- | --- | --- | --- | --- | --- |
| `listGeneratedDiscussions()` | read | `discussions`, child tables | `created_at`, `status` | no | yes |
| `listGeneratedDiscussionFlows()` | read | all discussion aggregate tables | `discussion_id` indexes | no | yes |
| `getGeneratedDiscussionFlowById(discussionId)` | read | all discussion aggregate tables | PK/FK indexes | no | yes |
| `saveDiscussionFlow(flow, options)` | insert/update | all discussion aggregate tables | PK/FK indexes | yes | yes |
| `updateReviewStatus(input)` | update | `content_drafts` | PK `id`, `discussion_id` | yes | yes |
| `deleteGeneratedDiscussion(discussionId)` | delete | all discussion aggregate tables | PK/FK indexes | yes | yes |
| `clearGeneratedDiscussions()` | delete | all generated discussion tables | status/source marker needed | yes | yes, dev only |

Compatibility finding:

- No interface change is required now.
- `clearGeneratedDiscussions()` needs a production safety guard before any real deployment.
- The interface does not currently distinguish static seeded rows from generated rows. The Postgres adapter should add an internal marker column such as `discussions.origin text not null default 'generated'` or use environment-only seeded data. This is an implementation detail and does not require an API contract change.

## Proposed Adapter File Structure

Do not implement during this planning milestone.

```txt
src/lib/database/
  README.md
  postgres-client.ts

src/lib/repositories/postgres/
  postgres-repositories.ts
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

Client initialization rule:

- Use lazy initialization only.
- Do not initialize Postgres clients at module scope.

## Transaction Boundaries

### Full generated flow

Current flow:

```txt
create discussion
attach sources
generate responses
generate rebuttals
generate consensus
create content draft
save discussion flow
```

Recommended transaction:

```txt
BEGIN
  upsert discussions
  replace discussion_sources
  replace discussion_participants
  replace ai_responses
  replace ai_response_sources
  replace cross_rebuttals
  upsert consensuses
  replace consensus_sources
  upsert content_drafts
COMMIT
```

Rollback behavior:

- If any child write fails, roll back the entire generated flow.
- Do not leave a discussion with partial responses unless a future resumable workflow is explicitly introduced.

Status handling:

- Initial discussion from `POST /api/admin/discussions`: `Source Attached`
- After responses: `AI Generated`
- After consensus/full generation: `Pending Review`
- Content draft starts as `Pending Review`

### Step-based generation

Current flow supports individual steps:

- `responses`
- `rebuttals`
- `consensus`
- `content-draft`

Recommended transaction per step:

- Start transaction when route calls `saveDiscussionFlow()`.
- Replace only the aggregate parts supplied by the current flow payload.
- Keep operation atomic for the current step.

Important implementation detail:

- Current `saveDiscussionFlow()` receives the aggregate payload available to the route. The Postgres adapter should avoid deleting existing child records when the route sends empty arrays because the step did not include that child type intentionally.
- If this ambiguity becomes a real bug during implementation, update the interface with a `replaceScope` option. Do not change it now.

### Review update

Recommended transaction:

```txt
BEGIN
  select content_drafts by discussion_id/content_draft.id
  validate current row exists
  update content_drafts.status, updated_at
COMMIT
```

Rollback behavior:

- If invalid transition is caught in service/API before adapter, no DB write.
- If row is missing, return `null` to preserve current `409` API behavior.

## Incremental Implementation Plan

### Phase 1 - Schema and migration tool decision

Files:

- `docs/postgres-schema-plan.md`
- future migration config, not created yet

Acceptance criteria:

- Schema tables and relationships are approved.
- Migration tool is selected.

Risks:

- Choosing an ORM too early can couple domain models to DB models.

Rollback point:

- Stay on mock provider.

Dependencies:

- None.

### Phase 2 - Database client boundary

Files:

- `src/lib/database/postgres-client.ts`
- `src/lib/database/README.md`

Acceptance criteria:

- Lazy connection getter exists.
- No API route imports the DB client directly.
- Build works without `DATABASE_URL`.

Risks:

- Module-scope client initialization can break build.

Rollback point:

- Keep `PSS_REPOSITORY_PROVIDER=mock`.

Dependencies:

- Database provider selected.

### Phase 3 - Base connection and configuration

Files:

- `.env.local.example`
- Vercel env documentation
- database client file

Acceptance criteria:

- Local connection can be tested separately.
- Missing env vars fail only when postgres provider is explicitly selected.

Risks:

- Accidentally switching default provider.

Rollback point:

- Remove env var or set provider to `mock`.

Dependencies:

- Phase 2.

### Phase 4 - Read-only repository methods

Files:

- `src/lib/repositories/postgres/postgres-repositories.ts`
- mapper files
- query files

Acceptance criteria:

- `listTopics`, `getTopicById`, `listCharacters`, `getSourcesByTopicId`, and static discussion reads work.
- API response shapes match mock provider.

Risks:

- Aggregate reconstruction for `Discussion` may drift from domain model.

Rollback point:

- Keep route provider as `mock`.

Dependencies:

- Seed data loaded into local Postgres.

### Phase 5 - Write repository methods

Files:

- discussion persistence query files
- mapper files

Acceptance criteria:

- `saveDiscussionFlow()` writes a full generated flow.
- `getGeneratedDiscussionFlowById()` returns the same shape as mock.
- `updateReviewStatus()` persists status.

Risks:

- Partial writes without transaction.

Rollback point:

- Disable postgres provider.

Dependencies:

- Phase 4.

### Phase 6 - Transaction-based generation persistence

Files:

- discussion persistence repository
- optional transaction helper

Acceptance criteria:

- Full flow save is atomic.
- Step-based save is atomic.
- Failed child write rolls back the aggregate.

Risks:

- Step payload ambiguity around replacing child records.

Rollback point:

- Use full-flow save only until step semantics are hardened.

Dependencies:

- Phase 5.

### Phase 7 - Repository contract tests

Files:

- contract test files under the selected test framework
- adapter test harness

Acceptance criteria:

- Same tests run against mock and postgres adapters.
- Contract tests verify stable return shapes.

Risks:

- Test setup may become heavier than MVP needs.

Rollback point:

- Keep tests focused on repository behavior only.

Dependencies:

- Testing tool selected.

### Phase 8 - Provider switching test

Files:

- `repository-factory.ts`
- env documentation

Acceptance criteria:

- `mock` remains default.
- `postgres` can be selected explicitly.
- Main Admin Discussion Generator flow works with postgres provider.

Risks:

- Runtime env mismatch between local and Vercel.

Rollback point:

- Set provider to `mock`.

Dependencies:

- Phase 7.

### Phase 9 - Production readiness checks

Files:

- docs
- deployment checklist
- backup/restore notes

Acceptance criteria:

- No destructive reset endpoint is available in production.
- Env vars are documented.
- Migrations are repeatable.
- Query performance is acceptable for MVP scale.

Risks:

- Leaving dev-only reset behavior enabled.

Rollback point:

- Do not enable postgres provider in production.

Dependencies:

- Phase 8.

## Repository Contract Test Matrix

The same behavioral contract should run against both adapters.

| Test | Mock Adapter | Postgres Adapter | Expected behavior |
| --- | --- | --- | --- |
| List topics | required | required | Returns `Topic[]` with stable IDs and slugs. |
| Get missing topic | required | required | Returns `undefined`. |
| List sources by topic | required | required | Returns only attached sources. |
| Create discussion shell | required | required | Stores discussion, sources, participants. |
| Generate full flow | required | required | Stores discussion, responses, rebuttals, consensus, draft. |
| Retrieve generated flow by ID | required | required | Returns full `StoredDiscussionFlow`. |
| List discussions after generation | required | required | Includes generated discussion. |
| Update review status | required | required | Persists allowed status transition. |
| Reject missing discussion review | required | required | Returns `null` from repository; API returns conflict. |
| Delete generated discussion | required | required | Removes generated flow and children. |
| Clear generated discussions | required | dev/test only | Removes generated rows only. |
| Deterministic ordering | required | required | Participants, sources, responses, rebuttals are stable. |
| ID stability | required | required | Stored child rows reference rewritten generated discussion ID. |
| Timestamp handling | required | required | `createdAt` remains stable, `updatedAt` changes on update. |

Recommended test structure:

```txt
src/lib/repositories/__tests__/
  repository-contract.shared.ts
  mock-repositories.contract.test.ts
  postgres-repositories.contract.test.ts
```

Do not add the full test framework until the project selects one.

## API and UI Impact Matrix

| Area | Change required | Reason |
| --- | ---: | --- |
| Admin UI | No | It already talks to the Client Adapter and API routes. |
| Client Adapter | No | Request and response payloads remain unchanged. |
| API Contract | No | Current route paths and DTOs can be preserved. |
| Service Layer | No | It already accepts repository interfaces. |
| Repository Interface | No | Current contracts can map to proposed schema. |
| Mock Adapter | No | It remains default and already satisfies contracts. |
| Postgres Adapter | Yes | Placeholder must be implemented after schema approval. |

## Proposed Interface Changes

No required interface changes now.

Watch item:

- If step-based `saveDiscussionFlow()` needs precise child replacement semantics, add an optional field to `SaveDiscussionFlowOptions`:

```ts
replaceScope?: ("discussion" | "sources" | "participants" | "responses" | "rebuttals" | "consensus" | "contentDraft")[]
```

Do not add this until implementation proves the ambiguity is harmful.

## Unresolved Architectural Questions

- Should production delete behavior be hard delete for generated drafts or soft delete once content is published?
- Should statuses remain `text` with app validation for MVP, or should check constraints be added in the first migration?
- Should generated and seeded/static discussions share one table with an `origin` field?
- Which migration and query approach will be selected: SQL-first, query builder, or ORM?
- When auth arrives, should review status changes create immutable `human_reviews` rows?

## Recommended Next Milestone

Select the database/migration tool and create a DB client boundary plan.

Do not implement the database adapter until the schema and migration approach are approved.
