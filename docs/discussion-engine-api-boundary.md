# Discussion Engine API Boundary v0

## Current Mock Architecture

The Admin Discussion Generator now talks to a local API/client boundary instead of importing the internal mock engine directly. Generated flows are stored in a lightweight server-side module-memory mock store.

Flow:

`Admin UI -> Client Adapter -> Next.js Route Handlers -> Discussion Engine Service -> Repository Interfaces -> Persistence Adapter -> In-Memory Mock Store / Mock Data`

No OpenAI, Postgres, authentication, or durable persistence is connected. Stored generated flows reset when the dev server restarts.

## Current Endpoints

- `GET /api/admin/discussions`
  - Returns seeded mock discussions plus generated in-memory discussions.
- `POST /api/admin/discussions`
  - Creates a mock discussion from a topic, selected participants, and discussion mode, then stores it in memory.
- `DELETE /api/admin/discussions`
  - Dev-only reset endpoint that clears generated in-memory flows.
- `POST /api/admin/discussions/generate`
  - Generates mock flow steps: `full`, `responses`, `rebuttals`, `consensus`, `content-draft`.
  - Full generation creates a new stored discussion ID.
  - Step generation updates the stored flow for the current discussion ID.
- `GET /api/admin/discussions/[discussionId]`
  - Looks up generated in-memory flows first.
  - Falls back to one seeded discussion with related mock sources, responses, rebuttals, consensus, and draft if available.
- `PATCH /api/admin/discussions/[discussionId]/review`
  - Updates a generated content draft review status through the human review state machine.
  - Static seeded discussions are read-only for this endpoint.

## Client Adapter

The Admin UI uses `src/lib/api/admin-discussions.client.ts`:

- `fetchDiscussions()`
- `fetchDiscussionById()`
- `createDiscussion()`
- `generateDiscussionFlow()`
- `updateDiscussionReviewStatus()`
- `clearGeneratedDiscussions()`

## In-Memory Store

The temporary store lives in `src/lib/mock-store/discussions.store.ts`.

Each stored generated flow includes:

- `Discussion`
- `Topic`
- `Source[]`
- selected `Character[]`
- `AIResponse[]`
- `CrossRebuttal[]`
- `Consensus | null`
- `ContentDraft | null`
- `createdAt`
- `updatedAt`

The store is intentionally module-scoped so the Admin UI can test retrieval, review updates, and API boundaries before Postgres is connected.

## Future OpenAI Integration Point

OpenAI calls should attach behind `src/lib/discussion-engine/*` generation functions or a dedicated AI provider module. The API DTOs should remain stable so the Admin UI does not depend on provider-specific details.

## Future Postgres Integration Point

Postgres should be added by implementing the repository contracts in `src/lib/repositories/interfaces.ts` and replacing the factory-selected adapter. Route handlers should continue calling repository/service functions instead of accessing storage directly.

## Current Limitations

- Generated results are stored only in server memory and reset on dev server restart.
- Admin endpoints are unauthenticated.
- Review updates are only supported for generated in-memory flows.
- Validation is intentionally lightweight until real persistence and auth are introduced.
