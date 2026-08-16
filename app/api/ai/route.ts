import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "./providers";

// rafiq()'s fallback sweeps can legitimately run past Vercel's default serverless
// timeout (10s) when many providers are exhausted at once — without this, the
// platform kills the function mid-recovery regardless of the retry logic below,
// turning a recoverable rate-limit wait into a hard failure. rafiq() self-bounds
// to ~53s so this ceiling is never actually hit; this just removes the lower
// platform default as the true constraint.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, system, max_tokens = 1200, task = "dialogue" } = await request.json() as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: any[];
      system?: string;
      max_tokens?: number;
      task?: "json" | "dialogue" | "fast";
    };
    const text = await rafiq({ task, messages, system, max_tokens });
    return NextResponse.json({ content: [{ text }] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
