import { createHmac, timingSafeEqual } from "crypto";

// Signed, HTTP-only cookie sessions for the Dossier Factory
// (IDEAMAP_DOSSIER_FACTORY_PROMPT.md §3, §7.1). Not wired into any route or
// into the Login component yet — IdeaMap's current login (client-side only,
// trusting whatever role/profile the browser already fetched from
// /api/sheets) keeps working exactly as before until a route explicitly
// starts calling createSessionToken()/verifySessionToken() below. That
// cutover needs scopes/user_scopes to actually exist in Postgres first (see
// db/migrations/0001_init.sql) — there is no coordinator "own scope" to
// enforce yet without it.
//
// Deliberately dependency-free (HMAC-SHA256 via Node's crypto) rather than a
// JWT library — the payload shape below is small and internal-only, and a
// hand-rolled verify keeps the trust boundary (one secret, one compare) easy
// to audit.

export type SessionPayload = {
  userId: string;
  role: "holder" | "coordinator" | "admin";
  scopeIds: string[]; // préfecture/promo scopes this user may act within; empty for holders/admins (admin bypasses scope checks entirely)
  issuedAt: number;
};

export const SESSION_COOKIE_NAME = "idm_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set — generate one (e.g. `openssl rand -hex 32`) " +
      "and add it to your environment before any route uses lib/ideamap/session.ts."
    );
  }
  return secret;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "issuedAt">): string {
  const full: SessionPayload = { ...payload, issuedAt: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

// Returns null for anything malformed, expired, or with a bad signature —
// callers should always treat null as "not logged in", never throw it past
// themselves into a 500.
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const expected = sign(payloadB64);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    if (Date.now() - payload.issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

// §3: "Scope = (préfecture, promo). A coordinator only ever reads/writes
// dossiers in their scopes. Enforce it in the API and in the database
// queries, not only in the UI." — call this at the top of every Dossier
// Factory route; admins bypass it, holders never call scope-gated routes.
export function assertScope(session: SessionPayload, scopeId: string): void {
  if (session.role === "admin") return;
  if (session.role === "coordinator" && session.scopeIds.includes(scopeId)) return;
  throw new Error(`Session ${session.userId} has no access to scope ${scopeId}`);
}
