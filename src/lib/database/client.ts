import { Pool } from "@neondatabase/serverless";
import { Kysely, PostgresDialect } from "kysely";
import type { PostgresPool } from "kysely";

import { assertPostgresDatabaseConfig } from "./config";
import type { PssDatabase, PssDatabaseClient } from "./types";

type GlobalDatabaseState = {
  client: PssDatabaseClient | null;
};

const globalDatabase = globalThis as typeof globalThis & {
  __pssBetaDatabase?: GlobalDatabaseState;
};

const state =
  globalDatabase.__pssBetaDatabase ??
  (globalDatabase.__pssBetaDatabase = {
    client: null,
  });

export function createDatabaseClient(databaseUrl: string): PssDatabaseClient {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  return new Kysely<PssDatabase>({
    dialect: new PostgresDialect({
      pool: pool as unknown as PostgresPool,
    }),
  });
}

function createPostgresClient(): PssDatabaseClient {
  return createDatabaseClient(assertPostgresDatabaseConfig().databaseUrl);
}

export function getDatabaseClient(): PssDatabaseClient {
  state.client ??= createPostgresClient();
  return state.client;
}

export async function disposeDatabaseClient() {
  if (!state.client) {
    return;
  }

  await state.client.destroy();
  state.client = null;
}
