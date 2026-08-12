import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "./providers";

// rafiq()'s worst case — every provider in the initial parallel race failing,
// then a sequential fallback sweep across a dozen more, each with its own
// multi-second timeout — can add up to minutes. That's fine when it's rare,
// but under concurrent load (many users hitting free-tier rate limits at
// once) more requests land in that slow path. Without a ceiling here, those
// requests would eventually hit the platform's own function timeout and get
// killed with an opaque 504 instead of the app's normal error handling.
// maxDuration keeps this route's allotted time bounded on the platform side;
// the Promise.race below returns a clean, fast error well before that, so
// the client's existing retry logic can take over immediately.
export const maxDuration = 30;
const HARD_TIMEOUT_MS = 27_000;

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
