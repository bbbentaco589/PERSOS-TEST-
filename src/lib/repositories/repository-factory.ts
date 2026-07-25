import {
  MockAIResponsesRepository,
  MockCharactersRepository,
  MockConsensusRepository,
  MockContentDraftsRepository,
  MockCrossRebuttalsRepository,
  MockDiscussionPersistenceRepository,
  MockDiscussionsRepository,
  MockKnowledgeEntriesRepository,
  MockOrganizationRepository,
  MockSourcesRepository,
  MockTopicsRepository,
} from "@/lib/repositories/mock/mock-repositories";
import { MockLiveDemoRepository } from "@/lib/repositories/mock/mock-live-demo.repository";
import { createPostgresRepositoryBundle } from "@/lib/repositories/postgres/postgres-repository-composition";
import {
  getPersistenceProvider,
  PersistenceProvider,
  type PersistenceProvider as PersistenceProviderValue,
} from "@/lib/database/provider";
import type { RepositoryBundle } from "@/lib/repositories/interfaces";

export type RepositoryProvider = PersistenceProviderValue;

let mockRepositories: RepositoryBundle | null = null;
let postgresRepositories: RepositoryBundle | null = null;

function createMockRepositories(): RepositoryBundle {
  return {
    characters: new MockCharactersRepository(),
    organization: new MockOrganizationRepository(),
    topics: new MockTopicsRepository(),
    sources: new MockSourcesRepository(),
    discussions: new MockDiscussionsRepository(),
    aiResponses: new MockAIResponsesRepository(),
    crossRebuttals: new MockCrossRebuttalsRepository(),
    consensus: new MockConsensusRepository(),
    contentDrafts: new MockContentDraftsRepository(),
    knowledgeEntries: new MockKnowledgeEntriesRepository(),
    discussionPersistence: new MockDiscussionPersistenceRepository(),
    liveDemo: new MockLiveDemoRepository(),
  };
}

export const RepositoryFactory = {
  getRepositories(provider: RepositoryProvider = getPersistenceProvider()) {
    if (provider === PersistenceProvider.Postgres) {
      postgresRepositories ??= createPostgresRepositoryBundle();
      return postgresRepositories;
    }

    mockRepositories ??= createMockRepositories();
    return mockRepositories;
  },
};

export function getRepositories(provider?: RepositoryProvider) {
  return RepositoryFactory.getRepositories(provider);
}
