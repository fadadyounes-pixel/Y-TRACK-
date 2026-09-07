import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "../ai/providers";
import { extractRawText } from "@/lib/extractDocText";

// Mirrors /api/ai's headroom over Vercel's default serverless timeout — the AI
// extraction call below goes through the same rafiq() cascade.
export const maxDuration = 60;

type TriQuestion = { fr: string; ar: string; en: string };

// Used only if the AI extraction call fails (providers busy) or returns nothing
// usable — keeps the feature working even when AI is unavailable, same "never
// fully block on AI" principle as the rest of the app. Keeps lines that look
// like real questions: end in "?", or are numbered/bulleted list items. Unlike
// the AI path, it can't merge bilingual FR/AR duplicate lines or translate, so
// each line is used as-is for all three languages.
function heuristicExtract(text: string): TriQuestion[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const questions: TriQuestion[] = [];
  for (const line of lines) {
    const isListItem = /^\d+[.)]\s*/.test(line) || /^[-•*]\s*/.test(line);
    const cleaned = line.replace(/^\d+[.)]\s*/, "").replace(/^[-•*]\s*/, "").trim();
    if (cleaned.length >= 5 && (cleaned.endsWith("?") || isListItem)) {
      questions.push({ fr: cleaned, ar: cleaned, en: cleaned });
    }
  }
  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const { fileBase64 } = await request.json() as { fileBase64: string };
    if (!fileBase64) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const buffer = Buffer.from(fileBase64, "base64");
    let rawText: string;
    try {
      rawText = await extractRawText(buffer);
    } catch {
      return NextResponse.json({ error: "Unsupported or unreadable file — expected .docx or .pdf" }, { status: 400 });
    }
    if (!rawText || !rawText.trim()) return NextResponse.json({ error: "Empty document" }, { status: 400 });

    try {
      const r = await rafiq({
        task: "json",
        messages: [{ role: "user", content: `Document:\n${rawText.slice(0, 12000)}` }],
        system: `Tu extrais une liste de questions destinées à un porteur de projet, à partir d'un document de questionnaire (fiche de projet, formulaire de candidature...).

Le document peut être bilingue français/arabe (la même question posée en français puis traduite en arabe juste en dessous, ou l'inverse) — dans ce cas, FUSIONNE chaque paire en UNE SEULE question, en reprenant le texte français et arabe exactement tels qu'ils apparaissent dans le document (ne les retraduis pas toi-même). Si le document n'a qu'une seule langue, garde ce texte pour "fr" (ou "ar" si le document est entièrement en arabe) et traduis-le fidèlement dans l'autre langue et en anglais.

Inclus aussi bien les vraies questions (souvent terminées par "?") que les champs à renseigner formulés comme des étiquettes (ex: "Expérience professionnelle", "Niveau d'études", "Situation actuelle du projet") — tout ce que le porteur doit renseigner ou raconter sur lui-même ou son projet. Ignore les instructions générales, titres de section, ou consignes qui ne demandent rien de spécifique au porteur. Garde l'ordre d'origine du document.

Réponds UNIQUEMENT avec ce JSON valide, sans markdown ni texte autour:
{"questions":[{"fr":"texte français exact","ar":"النص العربي المطابق","en":"matching English translation"}, ...]}`,
      });
      const m = r.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const questions: TriQuestion[] = Array.isArray(parsed?.questions)
        ? parsed.questions
            .filter((q: unknown): q is Record<string, unknown> => !!q && typeof q === "object")
            .map((q: Record<string, unknown>) => ({
              fr: typeof q.fr === "string" ? q.fr.trim() : "",
              ar: typeof q.ar === "string" ? q.ar.trim() : "",
              en: typeof q.en === "string" ? q.en.trim() : "",
            }))
            .filter((q: TriQuestion) => q.fr || q.ar || q.en)
            .map((q: TriQuestion) => ({ fr: q.fr || q.ar || q.en, ar: q.ar || q.fr || q.en, en: q.en || q.fr || q.ar }))
        : [];
      if (questions.length > 0) return NextResponse.json({ questions });
    } catch {
      // Falls through to the heuristic below.
    }

    const heuristic = heuristicExtract(rawText);
    if (heuristic.length > 0) return NextResponse.json({ questions: heuristic });
    return NextResponse.json({ questions: [] });
  } catch (err) {
    console.error("parse-questionnaire: failed", err);
    return NextResponse.json({ error: "Failed to parse document" }, { status: 500 });
  }
}
