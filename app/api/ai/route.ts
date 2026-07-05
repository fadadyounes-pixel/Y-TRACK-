import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "./providers";

export async function POST(request: NextRequest) {
  try {
    const { messages, system, max_tokens = 1200, task = "dialogue" } = await request.json();
    const text = await rafiq({ task, messages, system, max_tokens });
    return NextResponse.json({ content: [{ text }] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
