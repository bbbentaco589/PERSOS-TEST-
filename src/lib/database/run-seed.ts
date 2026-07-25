import { createDatabaseClient } from "./client";
import { seedCoreMvpDatabase } from "./seed";

async function run() {
  const databaseUrl = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Seed 실행에는 DATABASE_URL_DIRECT 또는 DATABASE_URL이 필요합니다.");
  }

  const db = createDatabaseClient(databaseUrl);
  try {
    await seedCoreMvpDatabase(db);
    console.log("Ptudio AI Company Intranet BETA Core MVP seed가 적용되었습니다.");
  } finally {
    await db.destroy();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
