# PSS BETA Postgres Schema Plan

Status: planning only. Postgres is not connected.

## Planning Basis

This schema is derived from the current MVP domain models, repository interfaces, mock adapter behavior, and Admin Discussion Generator API flow.

Current persistence flow:

```txt
Topic
-> Sources
-> Discussion
-> Participants
-> AI Responses
-> Cross Rebuttals
-> Consensus
-> Content Draft
-> Human Review Status
```

The schema must preserve:

- Current Admin UI behavior
- Current API request and response payloads
- Current Discussion Engine service methods
- Current RepositoryFactory provider switch
- Mock provider as the default provider

## Entity Decision Summary

Include now:

- `departments`
- `characters`
- `topics`
- `sources`
- `topic_sources`
- `discussions`
- `discussion_sources`
- `discussion_participants`
- `ai_responses`
- `ai_response_sources`
- `cross_rebuttals`
- `consensuses`
- `consensus_sources`
- `content_drafts`
- `knowledge_entries`
- `knowledge_entry_sources`

Plan but defer:

- `admin_users`: needed when auth is implemented, not for the current unauthenticated mock Admin CMS.
- `human_reviews`: useful for review history, reviewer identity, and audit logs, but current MVP stores only `ContentDraft.status`.
- `published_contents`: current `PublishedContent` can be represented by nullable publish fields on `content_drafts`.
- prompt version tables: not used by current API flow.
- asset inventory tables: outside this Discussion Engine persistence milestone.

## Table Specifications

### `departments`

Purpose: Stores AI Company departments referenced by AI Employees and discussion participants.

Current model: `Department`

Repository methods: indirectly supports `CharactersRepository.getCharactersByDepartmentId()`.

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. Current values: `research`, `legal`, `creative`, `business`, `media`. |
| `name` | `text` | no | none | Unique display name. |
| `mandate` | `text` | no | none | Department mission. |
| `signal` | `text` | no | none | Current domain field. |
| `roles` | `jsonb` | no | `'[]'::jsonb` | String array; variable list. |
| `operating_mode` | `text` | no | none | Maps from `operatingMode`. |
| `accent` | `text` | no | none | UI color token/string. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |
| `updated_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `id`
- Unique: `name`

Delete behavior:

- Restrict delete while characters or discussion participants reference the department.

### `characters`

Purpose: Stores AI Employees used as discussion participants.

Current model: `Character`

Repository methods:

- `listCharacters()`
- `getCharacterById()`
- `getCharacterBySlug()`
- `getCharactersByDepartmentId()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `slug` | `text` | no | none | Unique public identifier. |
| `name` | `text` | no | none | Display name. |
| `department_id` | `text` | no | none | FK to `departments.id`. |
| `job_title` | `text` | no | none | Maps from `jobTitle`. |
| `hook` | `text` | no | none | One-line hook. |
| `personality` | `text` | no | none | MVP character bible field. |
| `values` | `jsonb` | no | `'[]'::jsonb` | String array. |
| `strengths` | `jsonb` | no | `'[]'::jsonb` | String array. |
| `weakness` | `text` | no | none | Current singular field. |
| `stance` | `text` | no | none | Discussion stance summary. |
| `content_role` | `text` | no | none | Maps from `contentRole`. |
| `confidence` | `text` | no | none | String union: `Exploratory`, `Balanced`, `High`. |
| `status` | `text` | no | none | String union: `MVP Candidate`, `Active`, `Draft`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |
| `updated_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `id`
- Unique: `slug`
- Index: `department_id`

Delete behavior:

- Restrict delete while referenced by discussion participants, AI responses, or rebuttals.

### `topics`

Purpose: Stores content/discussion topics that seed generated discussions.

Current model: `Topic`

Repository methods:

- `listTopics()`
- `getTopicById()`
- `getTopicBySlug()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `slug` | `text` | no | none | Unique. |
| `title` | `text` | no | none | Topic title. |
| `description` | `text` | no | none | Topic summary. |
| `source_hint` | `text` | no | none | Maps from `sourceHint`. |
| `status` | `text` | no | none | String union: `Queued`, `In Discussion`, `Ready for Review`. |
| `priority` | `text` | no | none | String union: `Low`, `Medium`, `High`. |
| `risk_level` | `text` | no | none | Maps from `RiskLevel`. |
| `compliance_categories` | `jsonb` | no | `'[]'::jsonb` | String array from `ComplianceCategory`. |
| `created_at` | `timestamptz` | no | `now()` | Current domain already uses `createdAt`. |
| `updated_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `id`
- Unique: `slug`
- Index: `status`
- Index: `priority`
- Index: `risk_level`

Delete behavior:

- Restrict delete while discussions reference the topic.

### `sources`

Purpose: Stores source records attached to topics, discussions, responses, and consensus.

Current model: `Source`

Repository methods:

- `listSources()`
- `getSourceById()`
- `getSourcesByTopicId()`
- `getSourcesByIds()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `name` | `text` | no | none | Display name. |
| `type` | `text` | no | none | Maps from `SourceType`. |
| `trust_level` | `text` | no | none | `Primary`, `Secondary`, `Context`. |
| `risk_level` | `text` | no | none | Maps from `RiskLevel`. |
| `compliance_categories` | `jsonb` | no | `'[]'::jsonb` | String array. |
| `usage` | `text` | no | none | How the source should be used. |
| `summary` | `text` | no | none | Short source summary. |
| `url` | `text` | yes | null | Optional in current model. |
| `publisher` | `text` | yes | null | Optional in current model. |
| `last_reviewed` | `date` | no | none | Maps from `lastReviewed`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |
| `updated_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `id`
- Index: `type`
- Index: `trust_level`
- Index: `risk_level`
- Optional unique: `url` where `url is not null`

Delete behavior:

- Restrict delete while referenced by generated/public content. Soft delete can be added later.

### `topic_sources`

Purpose: Normalizes current `Source.topicIds` array.

Current model: `Source.topicIds`

Repository methods:

- `SourcesRepository.getSourcesByTopicId()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `topic_id` | `text` | no | none | FK to `topics.id`. |
| `source_id` | `text` | no | none | FK to `sources.id`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `(topic_id, source_id)`
- Index: `source_id`

Delete behavior:

- Cascade when a topic is deleted.
- Restrict source delete unless source has no production references.

### `discussions`

Purpose: Stores the root discussion aggregate.

Current model: `Discussion`

Repository methods:

- `listDiscussions()`
- `getDiscussionById()`
- `getDiscussionBySlug()`
- `getDiscussionsByTopicId()`
- `DiscussionPersistenceRepository.listGeneratedDiscussions()`
- `DiscussionPersistenceRepository.saveDiscussionFlow()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. Generated IDs can remain string-based. |
| `slug` | `text` | no | none | Current route identifier. |
| `topic_id` | `text` | no | none | FK to `topics.id`. |
| `title` | `text` | no | none | Discussion title. |
| `kicker` | `text` | no | none | Eyebrow/category field. |
| `summary` | `text` | no | none | Discussion summary. |
| `status` | `text` | no | none | Maps from `DiscussionStatus`. |
| `mode` | `text` | no | none | Maps from `DiscussionMode`. |
| `reading_time` | `text` | no | `'Draft'` | Current model uses text, not numeric minutes. |
| `published_at` | `timestamptz` | yes | null | Optional. |
| `created_at` | `timestamptz` | no | `now()` | Maps from `createdAt`. |
| `updated_at` | `timestamptz` | no | `now()` | Audit field. |

Generated or derived fields:

- `departmentIds`: derive from `discussion_participants.department_id`.
- `participants`: load from `discussion_participants`.
- `sourceIds`: load from `discussion_sources`.
- `responseIds`: load from `ai_responses`.
- `crossRebuttalIds`: load from `cross_rebuttals`.
- `consensusId`: load from `consensuses`.
- `humanReviewId`: defer until `human_reviews` exists.

Constraints and indexes:

- Primary key: `id`
- Unique: `slug`
- Index: `topic_id`
- Index: `status`
- Index: `created_at`
- Index: `published_at`

Delete behavior:

- Cascade generated child records when deleting a generated discussion.
- Restrict or soft delete published discussions later.

### `discussion_sources`

Purpose: Normalizes current `Discussion.sourceIds`.

Current model: `Discussion.sourceIds`

Repository methods:

- `getDiscussionById()`
- `getGeneratedDiscussionFlowById()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `discussion_id` | `text` | no | none | FK to `discussions.id`. |
| `source_id` | `text` | no | none | FK to `sources.id`. |
| `order_index` | `integer` | no | `0` | Preserves API ordering. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `(discussion_id, source_id)`
- Index: `source_id`
- Index: `(discussion_id, order_index)`

Delete behavior:

- Cascade when discussion is deleted.
- Restrict source delete while referenced.

### `discussion_participants`

Purpose: Stores AI Employees selected for a discussion.

Current model: `DiscussionParticipant`

Repository methods:

- `getDiscussionById()`
- `getGeneratedDiscussionFlowById()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key, or generated deterministic composite ID. |
| `discussion_id` | `text` | no | none | FK to `discussions.id`. |
| `character_id` | `text` | no | none | FK to `characters.id`. |
| `department_id` | `text` | no | none | FK to `departments.id`; denormalized from character at generation time. |
| `role` | `text` | no | none | `Lead`, `Reviewer`, `Challenger`, `Moderator`. |
| `order_index` | `integer` | no | none | Maps from `order`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Unique: `(discussion_id, character_id)`
- Unique: `(discussion_id, order_index)`
- Index: `character_id`
- Index: `department_id`

Delete behavior:

- Cascade when discussion is deleted.
- Restrict character delete while referenced.

### `ai_responses`

Purpose: Stores first-round and future staged AI Employee responses.

Current model: `AIResponse`

Repository methods:

- `listAIResponses()`
- `getResponsesByDiscussionId()`
- `DiscussionPersistenceRepository.saveDiscussionFlow()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `discussion_id` | `text` | no | none | FK to `discussions.id`. |
| `character_id` | `text` | no | none | FK to `characters.id`. |
| `round` | `text` | no | none | Maps from `ResponseRound`. |
| `stance` | `text` | no | none | Response stance. |
| `content` | `text` | no | none | Response body. |
| `confidence` | `text` | no | none | `Low`, `Medium`, `High`. |
| `created_at` | `timestamptz` | no | `now()` | Maps from `createdAt`. |

Constraints and indexes:

- Primary key: `id`
- Index: `discussion_id`
- Index: `(discussion_id, created_at)`
- Index: `character_id`

Delete behavior:

- Cascade when discussion is deleted.
- Restrict character delete while referenced.

### `ai_response_sources`

Purpose: Normalizes current `AIResponse.sourceIds`.

Current model: `AIResponse.sourceIds`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `response_id` | `text` | no | none | FK to `ai_responses.id`. |
| `source_id` | `text` | no | none | FK to `sources.id`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `(response_id, source_id)`
- Index: `source_id`

Delete behavior:

- Cascade when response is deleted.
- Restrict source delete while referenced.

### `cross_rebuttals`

Purpose: Stores response-to-response rebuttals.

Current model: `CrossRebuttal`

Repository methods:

- `listCrossRebuttals()`
- `getCrossRebuttalsByDiscussionId()`
- `DiscussionPersistenceRepository.saveDiscussionFlow()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `discussion_id` | `text` | no | none | FK to `discussions.id`. |
| `from_character_id` | `text` | no | none | FK to `characters.id`. |
| `target_response_id` | `text` | no | none | FK to `ai_responses.id`. |
| `content` | `text` | no | none | Rebuttal body. |
| `created_at` | `timestamptz` | no | `now()` | Maps from `createdAt`. |

Constraints and indexes:

- Primary key: `id`
- Index: `discussion_id`
- Index: `target_response_id`
- Index: `from_character_id`

Delete behavior:

- Cascade when discussion or target response is deleted.
- Restrict character delete while referenced.

### `consensuses`

Purpose: Stores one consensus summary per discussion.

Current model: `Consensus`

Repository methods:

- `listConsensus()`
- `getConsensusByDiscussionId()`
- `DiscussionPersistenceRepository.saveDiscussionFlow()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `discussion_id` | `text` | no | none | FK to `discussions.id`. |
| `summary` | `text` | no | none | Consensus summary. |
| `key_agreements` | `jsonb` | no | `'[]'::jsonb` | String array; current code reads as array. |
| `open_questions` | `jsonb` | no | `'[]'::jsonb` | String array. |
| `disagreements` | `jsonb` | no | `'[]'::jsonb` | String array. |
| `confidence` | `text` | no | none | `Low`, `Medium`, `High`. |
| `risk_level` | `text` | no | none | Maps from `RiskLevel`. |
| `created_at` | `timestamptz` | no | `now()` | Maps from `createdAt`. |

Constraints and indexes:

- Primary key: `id`
- Unique: `discussion_id`
- Index: `confidence`
- Index: `risk_level`

Delete behavior:

- Cascade when discussion is deleted.

### `consensus_sources`

Purpose: Normalizes current `Consensus.sourceIds`.

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `consensus_id` | `text` | no | none | FK to `consensuses.id`. |
| `source_id` | `text` | no | none | FK to `sources.id`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `(consensus_id, source_id)`
- Index: `source_id`

Delete behavior:

- Cascade when consensus is deleted.
- Restrict source delete while referenced.

### `content_drafts`

Purpose: Stores generated and reviewed content drafts.

Current models: `ContentDraft`, `PublishedContent`

Repository methods:

- `listContentDrafts()`
- `getContentDraftById()`
- `getContentDraftsByDiscussionId()`
- `listPublishedContent()`
- `getPublishedContentBySlug()`
- `DiscussionPersistenceRepository.updateReviewStatus()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `discussion_id` | `text` | no | none | FK to `discussions.id`. |
| `consensus_id` | `text` | no | none | FK to `consensuses.id`. |
| `title` | `text` | no | none | Draft title. |
| `slug` | `text` | no | none | Public slug when published. |
| `format` | `text` | no | none | Maps from `ContentFormat`. |
| `excerpt` | `text` | no | none | Summary/excerpt. |
| `body` | `text` | no | none | Draft body. |
| `status` | `text` | no | none | Maps from `HumanReviewStatus`. |
| `target_channels` | `jsonb` | no | `'[]'::jsonb` | Current string array. |
| `published_at` | `timestamptz` | yes | null | Supports `PublishedContent`. |
| `public_url` | `text` | yes | null | Supports `PublishedContent`. |
| `created_at` | `timestamptz` | no | `now()` | Maps from `createdAt`. |
| `updated_at` | `timestamptz` | no | `now()` | Maps from `updatedAt`. |

Constraints and indexes:

- Primary key: `id`
- Unique: `slug`
- Unique: `discussion_id` for MVP, because current flow creates one draft per discussion.
- Index: `consensus_id`
- Index: `status`
- Index: `published_at`

Delete behavior:

- Cascade when generated discussion is deleted.
- Restrict or soft delete once published.

### `knowledge_entries`

Purpose: Stores Knowledge Library entries linked to sources.

Current model: `KnowledgeEntry`

Repository methods:

- `listKnowledgeEntries()`
- `getKnowledgeEntryById()`
- `getKnowledgeEntriesBySourceId()`

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` | no | none | Primary key. |
| `title` | `text` | no | none | Entry title. |
| `category` | `text` | no | none | Current category string. |
| `source_type` | `text` | no | none | `SourceType` plus internal policy values. |
| `confidence` | `text` | no | none | `Low`, `Medium`, `High`. |
| `last_reviewed` | `date` | no | none | Maps from `lastReviewed`. |
| `summary` | `text` | no | none | Entry summary. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |
| `updated_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `id`
- Index: `category`
- Index: `source_type`
- Index: `confidence`

Delete behavior:

- Restrict by default. Knowledge entries are editorial records.

### `knowledge_entry_sources`

Purpose: Normalizes current `KnowledgeEntry.relatedSourceIds`.

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `knowledge_entry_id` | `text` | no | none | FK to `knowledge_entries.id`. |
| `source_id` | `text` | no | none | FK to `sources.id`. |
| `created_at` | `timestamptz` | no | `now()` | Audit field. |

Constraints and indexes:

- Primary key: `(knowledge_entry_id, source_id)`
- Index: `source_id`

Delete behavior:

- Cascade when knowledge entry is deleted.
- Restrict source delete while referenced.

## Deferred Tables

### `admin_users`

Reason deferred: Authentication is not implemented. Current Admin CMS is local/mock mode.

Future minimum columns:

- `id`
- `email`
- `name`
- `role`
- `created_at`
- `updated_at`

### `human_reviews`

Reason deferred: Current MVP only updates `ContentDraft.status`; no reviewer identity, comments, or review history exist in the active API contract.

Future minimum columns:

- `id`
- `content_draft_id`
- `status`
- `reviewer_admin_user_id`
- `note`
- `created_at`

## Relationship Model

```txt
Department 1 -> many Characters
Department 1 -> many Discussion Participants
Topic 1 -> many Discussions
Topic many <-> many Sources through topic_sources
Discussion many <-> many Sources through discussion_sources
Discussion 1 -> many Discussion Participants
Character 1 -> many Discussion Participants
Discussion 1 -> many AI Responses
AI Response many <-> many Sources through ai_response_sources
AI Response 1 -> many Cross Rebuttals as target
Character 1 -> many Cross Rebuttals as author
Discussion 1 -> 0 or 1 Consensus
Consensus many <-> many Sources through consensus_sources
Discussion 1 -> 0 or 1 Content Draft for MVP
Knowledge Entry many <-> many Sources through knowledge_entry_sources
```

Uncertainty:

- `Knowledge Entry -> Character or Department` is not present in the current domain model. Do not add this relationship until the Knowledge Base structure requires it.
- `Content Draft -> Review Status` is currently a status field, not a separate review entity.

## Domain-to-Database Mapping Strategy

General rules:

- TypeScript camelCase maps to Postgres snake_case.
- Current string unions should initially map to `text` plus application validation.
- Use Postgres enums only after status values stabilize.
- Domain date strings map to `date` for date-only fields and `timestamptz` for event timestamps.
- Domain arrays of IDs map to join tables when they represent relationships.
- Domain arrays of strings map to `jsonb` when query needs are minimal.
- Derived aggregate IDs are reconstructed by repository adapter methods.

Key mappings:

| TypeScript field | Postgres mapping | Notes |
| --- | --- | --- |
| `Topic.complianceCategories` | `topics.compliance_categories jsonb` | Variable string array. |
| `Source.topicIds` | `topic_sources` | Relationship, not JSON. |
| `Discussion.departmentIds` | Derived from `discussion_participants` | Avoid duplicate source of truth. |
| `Discussion.participants` | `discussion_participants` | Nested object becomes relation. |
| `Discussion.sourceIds` | `discussion_sources` | Relationship, not JSON. |
| `Discussion.responseIds` | Derived from `ai_responses` | Generated field in adapter. |
| `Discussion.crossRebuttalIds` | Derived from `cross_rebuttals` | Generated field in adapter. |
| `Discussion.consensusId` | Derived from `consensuses` | Optional field. |
| `AIResponse.sourceIds` | `ai_response_sources` | Relationship. |
| `Consensus.keyAgreements` | `consensuses.key_agreements jsonb` | String array, low relational value. |
| `Consensus.openQuestions` | `consensuses.open_questions jsonb` | String array. |
| `Consensus.disagreements` | `consensuses.disagreements jsonb` | String array. |
| `Consensus.sourceIds` | `consensus_sources` | Relationship. |
| `ContentDraft.targetChannels` | `content_drafts.target_channels jsonb` | Small variable string array. |
| `KnowledgeEntry.relatedSourceIds` | `knowledge_entry_sources` | Relationship. |

## Status Field Strategy

Use `text` columns for MVP implementation:

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

Rationale:

- Current values are TypeScript constants, not database-level contracts.
- Text preserves rapid iteration.
- Validation remains in the service/API layer.

Future hardening:

- Convert to Postgres enums after MVP status values stabilize.
- Add check constraints first if enum migration feels too rigid.

## Repository Compatibility Summary

No repository interface change is required for the proposed schema.

Potential future improvement:

- `DiscussionPersistenceRepository.saveDiscussionFlow()` should eventually be documented as atomic.
- `clearGeneratedDiscussions()` is a dev/test convenience and should not be exposed in production.
- `deleteGeneratedDiscussion()` may need soft-delete semantics once published content exists.

## Schema Risks

- String IDs preserve current API stability but require disciplined ID generation.
- `text` statuses rely on application validation until DB check constraints are added.
- `jsonb` arrays are simple but less queryable than normalized tables.
- `content_drafts` assumes one draft per discussion for MVP. Multiple drafts would require relaxing the `discussion_id` unique constraint.
