import { NextRequest, NextResponse } from "next/server";
import { rafiq, groq, cerebras, mistral } from "./providers";

// rafiq()'s fallback sweeps can legitimately run past Vercel's default serverless
// timeout (10s) when many providers are exhausted at once — without this, the
// platform kills the function mid-recovery regardless of the retry logic below,
// turning a recoverable rate-limit wait into a hard failure. rafiq() self-bounds
// to ~53s so this ceiling is never actually hit; this just removes the lower
// platform default as the true constraint.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, system, max_tokens = 1200, task = "dialogue", diagProviders } = await request.json() as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: any[];
      system?: string;
      max_tokens?: number;
      task?: "json" | "dialogue" | "fast";
      diagProviders?: boolean;
    };
    // Temporary, no-secrets-exposed diagnostic: bypasses rafiq()'s race/fallback so
    // each configured provider is exercised directly, confirming the just-added
    // CEREBRAS_API_KEY / MISTRAL_API_KEY actually authenticate — a normal request
    // can't show this since Groq wins nearly every race regardless of what else is
    // configured. Remove once redundancy is confirmed working.
    if (diagProviders) {
      const probe = async (fn: (m: typeof messages, s: string | undefined, t: number) => Promise<string>) => {
        try { await fn(messages, system, 20); return "ok"; }
        catch (e) { return `error: ${e instanceof Error ? e.message : String(e)}`; }
      };
      const [g, c, m] = await Promise.all([probe(groq), probe(cerebras), probe(mistral)]);
      return NextResponse.json({ diagnostics: { groq: g, cerebras: c, mistral: m } });
    }
    const text = await rafiq({ task, messages, system, max_tokens });
    return NextResponse.json({ content: [{ text }] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
