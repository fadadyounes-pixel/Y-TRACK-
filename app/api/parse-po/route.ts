import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "../ai/providers";
import { extractRawText } from "@/lib/extractDocText";

// Same headroom as parse-application/parse-questionnaire — the AI extraction
// call below goes through the same rafiq() cascade.
export const maxDuration = 60;

// A devis/PO/proforma's total almost always sits on a line labelled "Total",
// "Total TTC", "Net à payer", "Montant total"... in MAD/DH/Dhs. Used only if
// the AI extraction call fails or returns nothing usable — same "never fully
// block on AI" principle as the rest of the app.
function heuristicAmount(text: string): number | null {
  const merged = text.replace(/(\d)[\s,](?=\d{3}\b)/g, "$1");
  const lines = merged.split(/\r?\n/);
  const totalLine = /total|net\s*à\s*payer|montant/i;
  const amountRe = /(\d{2,7}(?:[.,]\d{1,2})?)\s*(?:mad|dh|dhs|درهم)?/i;
  let best: number | null = null;
  for (const line of lines) {
    if (!totalLine.test(line)) continue;
    const m = line.match(amountRe);
    if (m) {
      const n = parseFloat(m[1].replace(",", "."));
      if (!isNaN(n) && (best === null || n > best)) best = n;
    }
  }
  if (best !== null) return Math.round(best);
  // No labelled total found — fall back to the largest plausible MAD figure
  // anywhere in the document (200 – 500 000, so stray reference numbers,
  // dates and phone numbers don't get mistaken for a price).
  const all = [...merged.matchAll(/\d{3,6}(?:[.,]\d{1,2})?/g)]
    .map(m => parseFloat(m[0].replace(",", ".")))
    .filter(n => n >= 200 && n <= 500000);
  return all.length ? Math.round(Math.max(...all)) : null;
}

export async function POST(request: NextRequest) {
  try {
    const { fileBase64, lang } = await request.json() as { fileBase64: string; lang?: string };
    if (!fileBase64) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const buffer = Buffer.from(fileBase64, "base64");
    let rawText: string;
    try {
      rawText = await extractRawText(buffer);
    } catch {
      return NextResponse.json({ error: "Unsupported or unreadable file — expected .docx or .pdf" }, { status: 400 });
    }
    if (!rawText || !rawText.trim()) return NextResponse.json({ error: "Empty document" }, { status: 400 });

    const LL = lang === "ar" ? "arabe" : lang === "en" ? "anglais" : "français";

    try {
      const r = await rafiq({
        task: "json",
        messages: [{ role: "user", content: `Document:\n${rawText.slice(0, 10000)}` }],
        system: `Tu es le Conseiller INDH Phase 3 Maroc. Le document ci-dessous est un devis, une facture pro forma ou un bon de commande (PO) fourni par un fournisseur à un porteur de projet pour l'équipement qu'il souhaite acquérir.

Lis le document EN ENTIER et extrait, en ${LL}:
1. equipmentSummary: une description courte et précise de l'équipement/des articles listés (ex: "Machine à coudre industrielle Singer x2, table de découpe professionnelle"). Reprends les désignations réelles du document, ne les invente pas.
2. totalAmount: le MONTANT TOTAL exact en MAD (le total TTC / net à payer du document — un seul nombre, sans espace ni lettre).
3. items: la liste des postes si le document les détaille, chacun avec sa désignation et son prix.

Si le document ne contient clairement ni équipement ni montant, réponds avec totalAmount à null.

Réponds UNIQUEMENT avec ce JSON valide, sans markdown ni texte autour:
{"equipmentSummary":"...","totalAmount":N,"items":[{"label":"...","amount":N}]}`,
      });
      const m = r.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const totalAmount = typeof parsed?.totalAmount === "number" && parsed.totalAmount > 0 ? Math.round(parsed.totalAmount) : null;
      const equipmentSummary = typeof parsed?.equipmentSummary === "string" ? parsed.equipmentSummary.trim() : "";
      const items = Array.isArray(parsed?.items)
        ? parsed.items
            .filter((it: unknown): it is Record<string, unknown> => !!it && typeof it === "object")
            .map((it: Record<string, unknown>) => ({
              label: typeof it.label === "string" ? it.label.trim() : "",
              amount: typeof it.amount === "number" ? it.amount : null,
            }))
            .filter((it: { label: string }) => it.label)
        : [];
      if (totalAmount && equipmentSummary) {
        return NextResponse.json({ equipmentSummary, totalAmount, items });
      }
    } catch {
      // Falls through to the heuristic below.
    }

    const amount = heuristicAmount(rawText);
    if (!amount) return NextResponse.json({ error: "No amount found in this document" }, { status: 400 });
    // Heuristic path has no reliable way to isolate an equipment description from
    // free-form invoice text, so the first non-empty line stands in — close enough
    // for the holder to review/edit before it's submitted as their answer.
    const firstLine = rawText.split(/\r?\n/).map(l => l.trim()).find(Boolean) || "";
    return NextResponse.json({ equipmentSummary: firstLine.slice(0, 200), totalAmount: amount, items: [] });
  } catch (err) {
    console.error("parse-po: failed", err);
    return NextResponse.json({ error: "Failed to parse document" }, { status: 500 });
  }
}
