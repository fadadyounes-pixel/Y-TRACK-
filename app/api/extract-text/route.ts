import { NextRequest, NextResponse } from "next/server";
import { extractRawText } from "@/lib/extractDocText";

// Generic "give me whatever readable text is in this file" endpoint — used by
// the candidate CV upload flow so it can genuinely accept any file format
// (not just PDF/image) rather than silently mangling binary formats client-side.
// extractRawText() gives real, structured text for PDF and DOCX (the two
// formats candidates actually use); anything else — .doc, .rtf, .txt, odt,
// or a format we don't specifically parse — falls back to a plain UTF-8
// decode, which is still a faithful read for text-based formats and at worst
// degrades gracefully (the AI prompt that consumes this already treats a
// mostly-unreadable result as a cue to return a blank profile to fill in).
export async function POST(request: NextRequest) {
  try {
    const { fileBase64 } = await request.json() as { fileBase64: string };
    if (!fileBase64) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const buffer = Buffer.from(fileBase64, "base64");
    let text: string;
    try {
      text = await extractRawText(buffer);
    } catch {
      text = buffer.toString("utf8");
    }
    return NextResponse.json({ text: text.slice(0, 20000) });
  } catch (err) {
    console.error("extract-text: failed", err);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
