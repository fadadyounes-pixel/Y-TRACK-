import { neon } from "@neondatabase/serverless";

// Postgres access for the Dossier Factory (IDEAMAP_DOSSIER_FACTORY_PROMPT.md
// §7.1). Not imported by any route yet — adding this file changes nothing
// about the live site, which keeps running entirely on the existing
// Upstash-Redis layer in lib/redisCollections.ts until a later phase
// explicitly migrates specific reads/writes over.
//
// Setup (any standard Postgres works — Neon is the recommended default:
// free tier, serverless-friendly driver, zero infra to manage):
//   1. Create a database at https://neon.tech (or Supabase / Vercel Postgres).
//   2. Run db/migrations/0001_init.sql against it.
//   3. Set DATABASE_URL in your environment (.env.local and Vercel project
//      settings) to the connection string your provider gives you.
//
// `sql` is a tagged-template query function — e.g. `await sql\`select * from
// dossiers where scope_id = ${scopeId}\``. Call sites must still enforce
// scope/role checks themselves (§3): this module only executes queries, it
// has no opinion on who is allowed to run which one.
let cached: ReturnType<typeof neon> | null = null;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set — see lib/db.ts for setup instructions. " +
        "The Dossier Factory's bulk-import/job-queue features need it; " +
        "nothing else on the site does."
      );
    }
    cached = neon(url);
  }
  return cached(strings, ...values);
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
