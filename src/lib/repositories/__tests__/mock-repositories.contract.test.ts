import test from "node:test";

import { PersistenceProvider } from "@/lib/database";
import { RepositoryFactory } from "@/lib/repositories";
import { verifyRepositoryContract } from "./repository-contract.shared";

test("Mock Repository가 공통 계약을 만족한다", async () => {
  await verifyRepositoryContract(
    RepositoryFactory.getRepositories(PersistenceProvider.Mock)
  );
});
