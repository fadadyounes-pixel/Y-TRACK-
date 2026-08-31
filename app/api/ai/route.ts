import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "./providers";

// rafiq()'s fallback sweeps can legitimately run past Vercel's default serverless
// timeout (10s) when many providers are exhausted at once — without this, the
// platform kills the function mid-recovery regardless of the retry logic below,
// turning a recoverable rate-limit wait into a hard failure. rafiq() self-bounds
// to ~45s of sweeping plus one more in-flight 8s provider call, so ~53s worst
// case; maxDuration gives it headroom instead of the lower platform default.
// The Promise.race below still applies its own tighter ceiling so a genuine
// hang returns a clean, typed error — with time to spare before the platform
// kills the function outright — instead of an opaque 504.
export const maxDuration = 60;
const HARD_TIMEOUT_MS = 57_000;

export async function POST(request: NextRequest) {
  try {
    const { messages, system, max_tokens = 1200, task = "dialogue" } = await request.json() as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: any[];
      system?: string;
      max_tokens?: number;
      task?: "json" | "dialogue" | "fast";
    };
    const text = await Promise.race([
      rafiq({ task, messages, system, max_tokens }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI providers timed out — please try again.")), HARD_TIMEOUT_MS)
      ),
    ]);
    return NextResponse.json({ content: [{ text }] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
