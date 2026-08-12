import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Every collection below is stored as a Redis Hash (id -> item), not a
 * single JSON array behind one key. A hash gives each item its own atomic
 * HSET, so two concurrent writes to two different candidates/jobs/etc. can
 * never clobber each other — unlike the previous "read the whole array,
 * splice one item in, write the whole array back" pattern, which silently
 * lost updates whenever two requests raced close together (a near-certainty
 * once dozens of candidates are saving CVs around the same time, and the
 * root cause of a real bug: a coordinator's bulk CV upload replaced the
 * *entire* candidate collection with just that one batch, deleting every
 * other candidate's CV).
 *
 * The LEGACY key for each collection holds whatever it was stored as before
 * this change (a single JSON array under the same base name). readCollection
 * merges it in so nothing written before this migration disappears; nothing
 * is ever written there again going forward.
 *
 * Every route that reads or writes one of these collections (app/api/sheets,
 * app/api/auth) must go through this module — reading straight from the
 * legacy key elsewhere is exactly the bug this file exists to prevent.
 */
export const HASH = {
  holders: "idm_holders_h",
  jobs: "tm_jobs_h",
  cvs: "tm_cvs_h",
  coordinators: "tm_coordinators_h",
  applications: "tm_applications_h",
} as const;
export const LEGACY = {
  holders: "idm_holders",
  jobs: "tm_jobs",
  cvs: "tm_cvs",
  coordinators: "tm_coordinators",
  applications: "tm_applications",
} as const;
export type CollectionKind = keyof typeof HASH;

export async function readCollection<T extends { id?: string }>(kind: CollectionKind): Promise<T[]> {
  const [hash, legacy] = await Promise.all([
    redis.hgetall<Record<string, T>>(HASH[kind]),
    redis.get<T[]>(LEGACY[kind]),
  ]);
  const merged = new Map<string, T>();
  for (const item of legacy || []) if (item?.id) merged.set(item.id, item);
  // Hash entries are the newer, authoritative source — they win on id conflicts.
  for (const item of Object.values(hash || {})) if (item?.id) merged.set(item.id, item);
  return [...merged.values()];
}

// Shallow-merges the new fields onto whatever's already stored for this id,
// matching the merge semantics the old array-splice code had (different
// call sites send different field subsets for the same record).
export async function upsertOne<T extends { id: string }>(kind: CollectionKind, item: T): Promise<void> {
  const existing = await redis.hget<T>(HASH[kind], item.id);
  await redis.hset(HASH[kind], { [item.id]: { ...(existing || {}), ...item } });
}

export async function deleteOne(kind: CollectionKind, id: string): Promise<void> {
  await redis.hdel(HASH[kind], id);
}
