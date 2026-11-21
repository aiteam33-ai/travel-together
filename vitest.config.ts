import { defineConfig } from "vitest/config";

// lib/groups/access.test.ts is an integration test that hits the real
// database — it uses whatever DATABASE_URL is in .env (Postgres/Supabase).
export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 20000, // lib/groups/access.test.ts hits Supabase over the network — 5s default is too tight
  },
});
