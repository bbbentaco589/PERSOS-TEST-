export type DatabaseEnvironment = {
  persistenceProvider?: string;
  databaseUrl?: string;
  databaseUrlDirect?: string;
};

export function readDatabaseEnvironment(
  env: NodeJS.ProcessEnv = process.env
): DatabaseEnvironment {
  return {
    persistenceProvider: env.PERSISTENCE_PROVIDER ?? env.PSS_REPOSITORY_PROVIDER,
    databaseUrl: env.DATABASE_URL,
    databaseUrlDirect: env.DATABASE_URL_DIRECT,
  };
}
