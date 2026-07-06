import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

/* ── GET — read holders + coords ───────────────────── */
export async function GET() {
  try {
    const [holders, coords] = await Promise.all([
      kv.get<any[]>("idm_holders"),
      kv.get<string[]>("idm_coords"),
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
      const existing = await kv.get<any[]>("idm_holders") || [];
      const idx = existing.findIndex((h: any) => h.id === holder.id);
      const updated = idx >= 0
        ? existing.map((h: any, i: number) => i === idx ? { ...h, ...holder } : h)
        : [...existing, holder];
      await kv.set("idm_holders", updated);
      return NextResponse.json({ ok: true });
    }

    if (body.type === "save_coords") {
      await kv.set("idm_coords", body.coords);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
