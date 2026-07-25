import { getDatabaseClient } from "@/lib/database";
import type { RepositoryBundle } from "@/lib/repositories/interfaces";
import {
  PostgresAIResponsesRepository,
  PostgresCharactersRepository,
  PostgresConsensusRepository,
  PostgresContentDraftsRepository,
  PostgresCrossRebuttalsRepository,
  PostgresDiscussionPersistenceRepository,
  PostgresDiscussionsRepository,
  PostgresKnowledgeEntriesRepository,
  PostgresOrganizationRepository,
  PostgresSourcesRepository,
  PostgresTopicsRepository,
  type PostgresDatabaseProvider,
} from "./postgres-repositories";
import { PostgresLiveDemoRepository } from "./postgres-live-demo.repository";

export function createPostgresRepositoryBundle(
  databaseProvider: PostgresDatabaseProvider = getDatabaseClient
): RepositoryBundle {
  return {
    characters: new PostgresCharactersRepository(databaseProvider),
    organization: new PostgresOrganizationRepository(databaseProvider),
    topics: new PostgresTopicsRepository(databaseProvider),
    sources: new PostgresSourcesRepository(databaseProvider),
    discussions: new PostgresDiscussionsRepository(databaseProvider),
    aiResponses: new PostgresAIResponsesRepository(databaseProvider),
    crossRebuttals: new PostgresCrossRebuttalsRepository(databaseProvider),
    consensus: new PostgresConsensusRepository(databaseProvider),
    contentDrafts: new PostgresContentDraftsRepository(databaseProvider),
    knowledgeEntries: new PostgresKnowledgeEntriesRepository(databaseProvider),
    discussionPersistence: new PostgresDiscussionPersistenceRepository(databaseProvider),
    liveDemo: new PostgresLiveDemoRepository(databaseProvider),
  };
}
