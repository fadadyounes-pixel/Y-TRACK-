import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/redisCollections";

const ADMIN_CODE = "ADMIN001";
// Moroccan CIN shape: exactly 2 uppercase letters followed by 4+ digits (e.g. AB1234).
const RE_CANDIDATE = /^[A-Z]{2}\d{4,}$/;

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const normalized = (code || "").trim().toUpperCase();
    if (!normalized) return NextResponse.json({ ok: false });

    // Admin
    if (normalized === ADMIN_CODE) {
      return NextResponse.json({
        ok: true,
        user: { id: "1", idNumber: ADMIN_CODE, name: "Admin", email: "admin@talentmap.ma", role: "admin" },
      });
    }

    // Candidate — any valid CIN-style code. Checked before the coordinator
    // lookup since it's a cheap regex test with no Redis round-trip.
    if (RE_CANDIDATE.test(normalized)) {
      return NextResponse.json({
        ok: true,
        user: {
          id: normalized,
          idNumber: normalized,
          name: `Candidat ${normalized}`,
          email: `${normalized.toLowerCase()}@talentmap.ma`,
          role: "candidate",
        },
      });
    }

    // Coordinator — matched by exact stored code, whatever shape the admin
    // assigned it (current convention: NAME+COR+digits, e.g. BENALICOR4821).
    // Not gated on a hardcoded prefix, so it stays valid if the naming
    // convention changes again later.
    // Redis is queried in its own try/catch: if it's unreachable or
    // unconfigured, treat it as "no stored coordinators found" rather than
    // failing the whole request — otherwise even the hardcoded COORD001
    // demo fallback below would become unreachable during a Redis outage.
    let coordinators: any[] = [];
    try {
      coordinators = await readCollection<any>("coordinators");
    } catch (err) {
      console.error("auth: failed to read coordinators collection", err);
    }
    const found = coordinators.find((c: any) => (c.code || "").toUpperCase() === normalized);
    if (found) {
      return NextResponse.json({
        ok: true,
        user: { id: found.id, idNumber: found.code, name: found.name, email: found.email, role: "coordinator" },
      });
    }
    // Hardcoded fallback — default demo coordinator
    if (normalized === "COORD001") {
      return NextResponse.json({
        ok: true,
        user: { id: "2", idNumber: "COORD001", name: "Sara Coordinator", email: "sara@talentmap.ma", role: "coordinator" },
      });
    }

    return NextResponse.json({ ok: false });
  } catch (err) {
    console.error("auth: unexpected error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
