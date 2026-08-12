import { NextRequest, NextResponse } from "next/server";
import { redis, HASH, readCollection, upsertOne, deleteOne } from "@/lib/redisCollections";

const RE_HOLDER = /^[A-Z]{2}\d{3,}$/;
const RE_COORD  = /^@[A-Za-z]{2,}COD$/i;

/* ── GET — read all collections ─────────────────────── */
export async function GET() {
  try {
    const [holders, coords, jobs, cvs, coordinators, applications] = await Promise.all([
      readCollection("holders"),
      redis.get<string[]>("idm_coords"),
      readCollection("jobs"),
      readCollection("cvs"),
      readCollection("coordinators"),
      readCollection("applications"),
    ]);
    return NextResponse.json({
      holders,
      coords: coords || [],
      jobs,
      cvs,
      coordinators,
      applications,
    });
  } catch (err: any) {
    return NextResponse.json({ holders: [], coords: [], jobs: [], cvs: [], coordinators: [], applications: [], error: err.message });
  }
}

/* ── POST — write / update ─────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* IdeaMap: upsert single holder */
    if (body.type === "save_holder") {
      const holder = body.holder;
      if (!holder || typeof holder.id !== "string" || !RE_HOLDER.test(holder.id)) {
        return NextResponse.json({ ok: false, error: "Invalid holder" }, { status: 400 });
      }
      await upsertOne("holders", holder);
      return NextResponse.json({ ok: true });
    }

    /* IdeaMap: replace coordinator code list — small, admin-managed, always
       meant to be set wholesale, so this stays a plain key (not a hash). */
    if (body.type === "save_coords") {
      const coords = body.coords;
      if (!Array.isArray(coords) || coords.some((c: unknown) => typeof c !== "string" || !RE_COORD.test(c))) {
        return NextResponse.json({ ok: false, error: "Invalid coords" }, { status: 400 });
      }
      await redis.set("idm_coords", coords);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: reconcile the full job list from a coordinator's local
       state (add/edit/delete/status-toggle all flow through this) — upsert
       every job in the payload, then drop any hash entries no longer
       present, so deletions still take effect. */
    if (body.type === "save_jobs") {
      const jobs: any[] = Array.isArray(body.jobs) ? body.jobs : [];
      const keepIds = new Set(jobs.map(j => j.id));
      const existingKeys = await redis.hkeys(HASH.jobs);
      const toRemove = existingKeys.filter(k => !keepIds.has(k));
      await Promise.all([
        jobs.length ? redis.hset(HASH.jobs, Object.fromEntries(jobs.map(j => [j.id, j]))) : null,
        toRemove.length ? redis.hdel(HASH.jobs, ...toRemove) : null,
      ]);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert single job */
    if (body.type === "save_job") {
      await upsertOne("jobs", body.job);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: delete a job */
    if (body.type === "delete_job") {
      await deleteOne("jobs", body.id);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert a batch of CVs (e.g. a coordinator's bulk-upload
       session) — merges each into whatever's already stored for that id
       and never touches any other candidate's record. */
    if (body.type === "save_cvs") {
      const cvs: any[] = Array.isArray(body.cvs) ? body.cvs : [];
      if (cvs.length) {
        const existingHash = (await redis.hgetall<Record<string, any>>(HASH.cvs)) || {};
        const merged: Record<string, any> = {};
        for (const cv of cvs) merged[cv.id] = { ...(existingHash[cv.id] || {}), ...cv };
        await redis.hset(HASH.cvs, merged);
      }
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert single CV */
    if (body.type === "save_cv") {
      await upsertOne("cvs", body.cv);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert single coordinator */
    if (body.type === "save_coordinator") {
      await upsertOne("coordinators", body.coordinator);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: delete a coordinator */
    if (body.type === "delete_coordinator") {
      await deleteOne("coordinators", body.id);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert single job application */
    if (body.type === "save_application") {
      await upsertOne("applications", body.application);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
