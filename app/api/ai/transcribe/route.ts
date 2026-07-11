import { NextRequest, NextResponse } from "next/server";

// Groq Whisper: free tier — 2,000 requests/day, 7,200 audio-seconds/hour.
// Supports Arabic (ar), French (fr), English (en), Darija (auto-detected).
// Model: whisper-large-v3-turbo — fastest multilingual ASR on Groq.
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const audio = form.get("audio") as Blob | null;
    const lang  = (form.get("lang") as string) || undefined; // "ar" | "fr" | "en"

    if (!audio) {
      return NextResponse.json({ error: "no audio" }, { status: 400 });
    }

    const key = process.env.GROQ_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "no GROQ_API_KEY" }, { status: 503 });
    }

    const gForm = new FormData();
    gForm.append("file", audio, "audio.webm");
    gForm.append("model", "whisper-large-v3-turbo");
    gForm.append("response_format", "json");
    // Pass detected UI language to Whisper for better accuracy.
    // Whisper auto-detects Darija (Moroccan Arabic) well even without a hint.
    if (lang && lang !== "auto") {
      gForm.append("language", lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en");
    }

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: gForm,
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
