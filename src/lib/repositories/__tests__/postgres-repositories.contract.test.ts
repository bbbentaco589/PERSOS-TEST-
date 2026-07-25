import test from "node:test";
import { Migrator, type Migration, type MigrationProvider } from "kysely/migration";

import { createDatabaseClient, seedCoreMvpDatabase } from "@/lib/database";
import * as initialCoreMvp from "@/lib/database/migrations/2026-07-14-0001_initial_core_mvp";
import { createPostgresRepositoryBundle } from "@/lib/repositories/postgres/postgres-repository-composition";
import { verifyRepositoryContract } from "./repository-contract.shared";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test(
  "Postgres Repository가 공통 계약을 만족한다",
  { skip: testDatabaseUrl ? false : "TEST_DATABASE_URL이 없어 Postgres 계약 테스트를 건너뜁니다." },
  async () => {
    const db = createDatabaseClient(testDatabaseUrl!);
    const provider: MigrationProvider = {
      async getMigrations(): Promise<Record<string, Migration>> {
        return { "2026-07-14-0001_initial_core_mvp": initialCoreMvp };
      },
    };

    try {
      const migration = await new Migrator({ db, provider }).migrateToLatest();
      if (migration.error) throw migration.error;
      await seedCoreMvpDatabase(db);
      await verifyRepositoryContract(createPostgresRepositoryBundle(() => db));
    } finally {
      await db.destroy();
    }
  }
);
