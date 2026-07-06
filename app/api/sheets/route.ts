import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/* ── GET — read holders + coords ───────────────────── */
export async function GET() {
  try {
    const [holders, coords] = await Promise.all([
      redis.get<any[]>("idm_holders"),
      redis.get<string[]>("idm_coords"),
    ]);
    return NextResponse.json({ holders: holders || [], coords: coords || [] });
  } catch (err: any) {
    return NextResponse.json({ holders: [], coords: [], error: err.message });
  }
}

/* ── POST — write / update ─────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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

    if (body.type === "save_coords") {
      await redis.set("idm_coords", body.coords);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
