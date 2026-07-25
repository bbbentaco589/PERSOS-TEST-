export const PersistenceProvider = {
  Mock: "mock",
  Postgres: "postgres",
} as const;

export type PersistenceProvider =
  (typeof PersistenceProvider)[keyof typeof PersistenceProvider];

export const DEFAULT_PERSISTENCE_PROVIDER: PersistenceProvider =
  PersistenceProvider.Mock;

export function parsePersistenceProvider(
  value: string | undefined
): PersistenceProvider {
  if (value === PersistenceProvider.Postgres) {
    return PersistenceProvider.Postgres;
  }

  return DEFAULT_PERSISTENCE_PROVIDER;
}

export function getPersistenceProvider(env: NodeJS.ProcessEnv = process.env) {
  return parsePersistenceProvider(
    env.PERSISTENCE_PROVIDER ?? env.PSS_REPOSITORY_PROVIDER
  );
}
