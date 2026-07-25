import { readDatabaseEnvironment } from "./env";
import {
  DEFAULT_PERSISTENCE_PROVIDER,
  parsePersistenceProvider,
  PersistenceProvider,
  type PersistenceProvider as PersistenceProviderValue,
} from "./provider";

export type MockDatabaseConfig = {
  provider: typeof PersistenceProvider.Mock;
};

export type PostgresDatabaseConfig = {
  provider: typeof PersistenceProvider.Postgres;
  databaseUrl: string;
  databaseUrlDirect?: string;
};

export type DatabaseConfig = MockDatabaseConfig | PostgresDatabaseConfig;

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function getDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env
): DatabaseConfig {
  const databaseEnv = readDatabaseEnvironment(env);
  const provider =
    parsePersistenceProvider(databaseEnv.persistenceProvider) ??
    DEFAULT_PERSISTENCE_PROVIDER;

  if (provider === PersistenceProvider.Mock) {
    return { provider };
  }

  if (!databaseEnv.databaseUrl) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL is required when PERSISTENCE_PROVIDER=postgres."
    );
  }

  return {
    provider,
    databaseUrl: databaseEnv.databaseUrl,
    databaseUrlDirect: databaseEnv.databaseUrlDirect,
  };
}

export function assertPostgresDatabaseConfig(
  config: DatabaseConfig = getDatabaseConfig()
): PostgresDatabaseConfig {
  if (config.provider !== PersistenceProvider.Postgres) {
    throw new DatabaseConfigurationError(
      "Postgres database client was requested while persistence provider is mock."
    );
  }

  return config;
}

export function isPostgresProvider(provider: PersistenceProviderValue) {
  return provider === PersistenceProvider.Postgres;
}
