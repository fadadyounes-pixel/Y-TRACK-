import { NextRequest, NextResponse } from "next/server";
import { rafiq } from "../ai/providers";
import { extractRawText } from "@/lib/extractDocText";

// Mirrors /api/parse-questionnaire's headroom over Vercel's default serverless
// timeout — the AI extraction call below goes through the same rafiq() cascade.
export const maxDuration = 60;

type QAPair = { question: string; answer: string };

// Same shape sendMsg()'s AI profile-compile call builds in app/ideamap/page.tsx —
// keeping it identical means a coordinator-imported application lands exactly
// where a holder's own completed dialogue would (Plan/Compliance/PPTX all read
// this shape from `proj`, with no branch needed for how it got there).
type ProjectProfile = {
  projectName: string; sector: string; legalStructure: string; location: string;
  beneficiaries: number; targetProfile: string; localProblem: string;
  revenueModel: string; holderExperience: string; activities: string[];
  strengths: string[]; estimatedBudget: number; pillar: string;
};

// A real INDH-style form mixes true "?" questions with directive prompts/labels
// ("Décrivez...", "Indiquez...") that end in "." rather than "?" — parse-questionnaire's
// AI prompt already accounts for this ("champs à renseigner formulés comme des
// étiquettes"); this fallback needs its own signal for the same case since it has
// no AI to lean on.
const QUESTION_STARTERS = /^(décrivez|décrire|expliquez|expliquer|précisez|préciser|indiquez|indiquer|citez|citer|présentez|présenter|donnez|donner|nommez|describe|explain|list|specify|indicate|state|name|اشرح|صف|اذكر|بين|حدد|قدم)\b/i;

// Used only if the AI extraction call fails or returns nothing usable — same
// "never fully block on AI" principle as the rest of the app. Pairs each
// question-like line (ends in "?"/"؟", is a numbered/bulleted list item, or opens
// with a directive verb per QUESTION_STARTERS) with the non-question lines that
// follow it, up to the next question.
function heuristicPairs(text: string): QAPair[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const pairs: QAPair[] = [];
  let curQ: string | null = null;
  let curA: string[] = [];
  const flush = () => {
    if (curQ && curA.length) pairs.push({ question: curQ, answer: curA.join(" ").trim() });
    curQ = null; curA = [];
  };
  for (const line of lines) {
    const isListItem = /^\d+[.)]\s*/.test(line) || /^[-•*]\s*/.test(line);
    const cleaned = line.replace(/^\d+[.)]\s*/, "").replace(/^[-•*]\s*/, "").trim();
    const looksLikeQuestion = cleaned.length >= 5 &&
      (cleaned.endsWith("?") || cleaned.endsWith("؟") || isListItem || QUESTION_STARTERS.test(cleaned));
    if (looksLikeQuestion) { flush(); curQ = cleaned; }
    else if (curQ) curA.push(cleaned);
  }
  flush();
  return pairs;
}

// Last-resort profile guess from the heuristic pairs above, when AI is also
// unavailable — a keyword match per field rather than positional indices,
// since an arbitrary paper form has no fixed question order to rely on.
function heuristicProfile(pairs: QAPair[]): ProjectProfile {
  const findAnswer = (kw: RegExp) => pairs.find(p => kw.test(p.question))?.answer || "";
  const numFrom = (s: string, fallback: number): number => {
    // Merge space/comma-grouped thousands ("95 000", "95,000") into one run of
    // digits before extracting — otherwise the first group ("95") is mistaken
    // for the whole number, off by a factor of 1000 on any MAD amount written
    // with a thousands separator (the normal Moroccan/French convention).
    const merged = s.replace(/(\d)[\s,](?=\d{3}\b)/g, "$1");
    const m = merged.replace(/[^\d]/g, " ").match(/\d{2,}/);
    return m ? parseInt(m[0], 10) : fallback;
  };
  return {
    projectName: findAnswer(/nom|projet|enseigne|اسم|name/i) || pairs[0]?.answer || "",
    sector: findAnswer(/secteur|activité|قطاع|نشاط|sector/i),
    legalStructure: "Porteur individuel",
    location: findAnswer(/ville|quartier|douar|commune|implant|مدينة|حي|دوار|location|city/i),
    beneficiaries: numFrom(findAnswer(/bénéficiaires|مستفيد|beneficiaries/i), 10),
    targetProfile: findAnswer(/bénéficiaires|مستفيد|beneficiaries/i),
    localProblem: findAnswer(/problème|مشكلة|problem/i),
    revenueModel: findAnswer(/vendre|revenus|générer|دخل|بيع|revenue|sell/i),
    holderExperience: findAnswer(/expérience|خبرة|experience/i),
    activities: pairs.slice(0, 3).map(p => p.answer).filter(Boolean),
    strengths: [],
    estimatedBudget: numFrom(findAnswer(/coût|budget|كلفة|ميزانية|cost/i) || pairs.map(p => p.answer).join(" "), 70000),
    pillar: "",
  };
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
        messages: [{ role: "user", content: `Document:\n${rawText.slice(0, 14000)}` }],
        system: `Tu es le Conseiller INDH Phase 3 Maroc. Le document ci-dessous est une candidature DÉJÀ COMPLÉTÉE par un porteur de projet — une série de questions suivies chacune de la réponse écrite du porteur.

1) Extrait la liste des paires question/réponse dans l'ordre du document. Reprends le texte de la réponse tel quel (ne le reformule pas), et le texte de la question tel qu'il apparaît (ou une version proche s'il est tronqué).
2) À partir de L'ENSEMBLE des réponses, construis le profil de projet le plus précis possible, en ${LL}, dans l'esprit d'une fiche-projet INDH.

Réponds UNIQUEMENT avec ce JSON valide, sans markdown ni texte autour:
{"answers":[{"question":"texte de la question","answer":"texte de la réponse"}],"profile":{"projectName":"nom commercial accrocheur en ${LL}","sector":"secteur INDH exact (ex: Artisanat traditionnel)","legalStructure":"porteur individuel","location":"ville/commune/douar mentionné","beneficiaries":N,"targetProfile":"description précise des bénéficiaires (femmes, jeunes, agriculteurs...)","localProblem":"problème local concret résolu par le projet","revenueModel":"comment le porteur va gagner de l'argent concrètement","holderExperience":"compétence/expérience du porteur","activities":["activité clé 1","activité clé 2","activité clé 3"],"strengths":["force SPÉCIFIQUE 1 alignée jury INDH","force SPÉCIFIQUE 2"],"estimatedBudget":N,"pillar":"axe INDH Phase 3 le plus pertinent"}}`,
      });
      const m = r.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const answers: QAPair[] = Array.isArray(parsed?.answers)
        ? parsed.answers
            .filter((a: unknown): a is Record<string, unknown> => !!a && typeof a === "object")
            .map((a: Record<string, unknown>) => ({
              question: typeof a.question === "string" ? a.question.trim() : "",
              answer: typeof a.answer === "string" ? a.answer.trim() : "",
            }))
            .filter((a: QAPair) => a.answer)
        : [];
      const profile = parsed?.profile && typeof parsed.profile === "object" ? parsed.profile as ProjectProfile : null;
      if (answers.length > 0 && profile) {
        const msgs = answers.flatMap((a: QAPair) => [
          { role: "assistant", content: a.question || "—" },
          { role: "user", content: a.answer },
        ]);
        return NextResponse.json({ msgs, proj: profile });
      }
    } catch {
      // Falls through to the heuristic below.
    }

    const pairs = heuristicPairs(rawText);
    if (pairs.length === 0) return NextResponse.json({ error: "No question/answer pairs found in document" }, { status: 400 });
    const msgs = pairs.flatMap((p: QAPair) => [
      { role: "assistant", content: p.question },
      { role: "user", content: p.answer },
    ]);
    return NextResponse.json({ msgs, proj: heuristicProfile(pairs) });
  } catch (err) {
    console.error("parse-application: failed", err);
    return NextResponse.json({ error: "Failed to parse document" }, { status: 500 });
  }
}
