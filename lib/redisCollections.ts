import { Redis } from "@upstash/redis";
import { put, head } from "@vercel/blob";

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

/**
 * Vercel Blob fallback store — engaged ONLY when a Redis call throws (bad/
 * expired Upstash credentials, a paused database, a network blip). Without
 * this, a Redis outage means every holder's progress only survives in their
 * own browser's localStorage: a returning holder on a different device, or
 * anyone who clears storage, would be forced to re-fill the whole
 * application with no way to resume, exactly the bug this file's callers
 * exist to prevent. Blob was already provisioned and working for this
 * project (see lib/storage.ts) before Redis was, so it's a real fallback,
 * not a second point of failure.
 *
 * One JSON blob per collection, whole-array read-modify-write — the same
 * "legacy" shape this file replaced Redis-side, and the same race-condition
 * caveat applies (two near-simultaneous writes during an outage could lose
 * one). Acceptable for a fallback path that only runs while Redis itself is
 * down; never used while Redis is healthy.
 */
const BLOB_PREFIX = "fallback-collections/";

async function blobReadAll<T>(kind: CollectionKind): Promise<T[]> {
  let info;
  try {
    info = await head(`${BLOB_PREFIX}${kind}.json`);
  } catch {
    // Nothing written to the fallback yet — legitimately empty, not a failure.
    return [];
  }
  // The blob is known to exist from here on; a failure reading it is real
  // and propagates, so readCollection() can tell "truly unavailable" apart
  // from "fallback has nothing for this collection".
  const r = await fetch(info.url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Blob fetch failed with status ${r.status}`);
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function blobWriteAll<T>(kind: CollectionKind, items: T[]): Promise<void> {
  await put(`${BLOB_PREFIX}${kind}.json`, JSON.stringify(items), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readCollection<T extends { id?: string }>(kind: CollectionKind): Promise<T[]> {
  const merged = new Map<string, T>();
  let redisOk = true;
  let blobOk = true;

  try {
    const [hash, legacy] = await Promise.all([
      redis.hgetall<Record<string, T>>(HASH[kind]),
      redis.get<T[]>(LEGACY[kind]),
    ]);
    for (const item of legacy || []) if (item?.id) merged.set(item.id, item);
    // Hash entries are the newer, authoritative source — they win on id conflicts.
    for (const item of Object.values(hash || {})) if (item?.id) merged.set(item.id, item);
  } catch (err) {
    console.error(`readCollection(${kind}): Redis unavailable, falling back to Blob`, err);
    redisOk = false;
  }

  // Always merge in the Blob fallback too — not just when Redis fails — so
  // anything saved there during a past outage is never lost once Redis
  // recovers; Hash entries above already took priority on any id conflict.
  try {
    for (const item of await blobReadAll<T>(kind)) if (item?.id && !merged.has(item.id)) merged.set(item.id, item);
  } catch (err) {
    console.error(`readCollection(${kind}): Blob fallback also unavailable`, err);
    blobOk = false;
  }

  if (!redisOk && !blobOk) {
    throw new Error(`readCollection(${kind}): both Redis and its Blob fallback are unavailable`);
  }
  return [...merged.values()];
}

// Shallow-merges the new fields onto whatever's already stored for this id,
// matching the merge semantics the old array-splice code had (different
// call sites send different field subsets for the same record).
export async function upsertOne<T extends { id: string }>(kind: CollectionKind, item: T): Promise<void> {
  try {
    const existing = await redis.hget<T>(HASH[kind], item.id);
    await redis.hset(HASH[kind], { [item.id]: { ...(existing || {}), ...item } });
  } catch (err) {
    console.error(`upsertOne(${kind}): Redis unavailable, falling back to Blob`, err);
    const all = await blobReadAll<T>(kind);
    const idx = all.findIndex((x) => x.id === item.id);
    const merged = { ...(idx >= 0 ? all[idx] : {}), ...item } as T;
    if (idx >= 0) all[idx] = merged; else all.push(merged);
    await blobWriteAll(kind, all);
  }
}

export async function deleteOne(kind: CollectionKind, id: string): Promise<void> {
  try {
    await redis.hdel(HASH[kind], id);
  } catch (err) {
    console.error(`deleteOne(${kind}): Redis unavailable, falling back to Blob`, err);
    const all = await blobReadAll<{ id: string }>(kind);
    await blobWriteAll(kind, all.filter((x) => x.id !== id));
  }
}
