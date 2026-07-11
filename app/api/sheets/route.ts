import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/* ── GET — read all collections ─────────────────────── */
export async function GET() {
  try {
    const [holders, coords, jobs, cvs] = await Promise.all([
      redis.get<any[]>("idm_holders"),
      redis.get<string[]>("idm_coords"),
      redis.get<any[]>("tm_jobs"),
      redis.get<any[]>("tm_cvs"),
    ]);
    return NextResponse.json({
      holders: holders || [],
      coords: coords || [],
      jobs: jobs || [],
      cvs: cvs || [],
    });
  } catch (err: any) {
    return NextResponse.json({ holders: [], coords: [], jobs: [], cvs: [], error: err.message });
  }
}

/* ── POST — write / update ─────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* IdeaMap: upsert single holder */
    if (body.type === "save_holder") {
      const holder = body.holder;
      const existing = await redis.get<any[]>("idm_holders") || [];
      const idx = existing.findIndex((h: any) => h.id === holder.id);
      const updated = idx >= 0
        ? existing.map((h: any, i: number) => i === idx ? { ...h, ...holder } : h)
        : [...existing, holder];
      await redis.set("idm_holders", updated);
      return NextResponse.json({ ok: true });
    }

    /* IdeaMap: replace coordinator list */
    if (body.type === "save_coords") {
      await redis.set("idm_coords", body.coords);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: replace full job list */
    if (body.type === "save_jobs") {
      await redis.set("tm_jobs", body.jobs);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert single job */
    if (body.type === "save_job") {
      const job = body.job;
      const existing = await redis.get<any[]>("tm_jobs") || [];
      const idx = existing.findIndex((j: any) => j.id === job.id);
      const updated = idx >= 0
        ? existing.map((j: any, i: number) => i === idx ? { ...j, ...job } : j)
        : [...existing, job];
      await redis.set("tm_jobs", updated);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: delete a job */
    if (body.type === "delete_job") {
      const existing = await redis.get<any[]>("tm_jobs") || [];
      await redis.set("tm_jobs", existing.filter((j: any) => j.id !== body.id));
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: replace full CV list */
    if (body.type === "save_cvs") {
      await redis.set("tm_cvs", body.cvs);
      return NextResponse.json({ ok: true });
    }

    /* TalentMap: upsert single CV */
    if (body.type === "save_cv") {
      const cv = body.cv;
      const existing = await redis.get<any[]>("tm_cvs") || [];
      const idx = existing.findIndex((c: any) => c.id === cv.id);
      const updated = idx >= 0
        ? existing.map((c: any, i: number) => i === idx ? { ...c, ...cv } : c)
        : [...existing, cv];
      await redis.set("tm_cvs", updated);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
