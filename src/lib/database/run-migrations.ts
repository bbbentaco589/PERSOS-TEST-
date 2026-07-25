import { Migrator, type Migration, type MigrationProvider } from "kysely/migration";

import { createDatabaseClient } from "./client";
import * as initialCoreMvp from "./migrations/2026-07-14-0001_initial_core_mvp";
import * as canonicalOrganization from "./migrations/2026-07-15-0002_canonical_organization";
import * as investorLiveDemo from "./migrations/2026-07-25-0003_investor_live_demo";

const migrations: Record<string, Migration> = {
  "2026-07-14-0001_initial_core_mvp": initialCoreMvp,
  "2026-07-15-0002_canonical_organization": canonicalOrganization,
  "2026-07-25-0003_investor_live_demo": investorLiveDemo,
};

const provider: MigrationProvider = {
  async getMigrations() {
    return migrations;
  },
};

async function run() {
  const databaseUrl = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Migration 실행에는 DATABASE_URL_DIRECT 또는 DATABASE_URL이 필요합니다.");
  }

  const db = createDatabaseClient(databaseUrl);
  try {
    const result = await new Migrator({ db, provider }).migrateToLatest();
    result.results?.forEach((item) => {
      console.log(`${item.migrationName}: ${item.status}`);
    });
    if (result.error) throw result.error;
  } finally {
    await db.destroy();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
