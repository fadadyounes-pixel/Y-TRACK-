import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "./providers";

// Tell Vercel to allow up to 60s for the multi-provider cascade.
// Without this, Vercel kills the function after 10s (Hobby/Pro default),
// which would abort long AI calls even before the fallback chain finishes.
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
