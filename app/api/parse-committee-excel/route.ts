import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { computeSplit, mapSectorToKey, getSectorBenchmark, PLAFOND_PROJET } from "@/lib/ideamap/dossier/finance";
import type { ProjectProfile, Budget, BusinessPlan, ValidationIssue } from "@/lib/ideamap/dossier/schema";

// §4 of CLAUDE_DOSSIER.md: a coordinator's bulk committee-Excel import.
// Builds the same ProjectProfile/Budget/BusinessPlan shapes a holder's own
// dialogue produces, so every downstream consumer (CoordDash's edit UI, the
// 4 document generators) works identically regardless of origin — no DB,
// no job queue: each row becomes a holder record through the same
// save_holder path any other holder uses.
export const maxDuration = 60;

const RE_HOLDER = /^[A-Z]{2}\d{3,}$/;

// Header text this column accepts, accent/case-insensitive, matched by
// "header includes needle" so "N° " or "Numéro de dossier" both hit.
const HEADER_MAP: Record<string, string[]> = {
  numero: ["numero", "n°", "no", "num"],
  porteur: ["porteur de projet", "porteur", "nom et prenom", "nom complet"],
  age: ["age"],
  intitule: ["intitule du projet", "intitule", "projet"],
  secteur: ["secteur"],
  presentation: ["presentation du projet", "presentation", "description"],
  equipements: ["equipements a financer", "equipements", "equipement"],
  cout: ["cout du projet", "devis ttc", "cout", "montant total"],
  subvention: ["subvention indh", "subvention"],
  apport: ["apport du porteur", "apport"],
  cin: ["cin"],
  telephone: ["telephone", "tel", "gsm"],
  email: ["e-mail", "email", "mail"],
  sexe: ["sexe", "genre"],
  quartier: ["quartier", "douar"],
  nomCommercial: ["nom commercial", "enseigne"],
};

function normalize(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function numFrom(v: unknown): number | null {
  if (typeof v === "number") return v;
  const s = normalize(v).replace(/[^\d.,]/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

export async function POST(req: NextRequest) {
  try {
    const { fileBase64, coordCode } = await req.json() as { fileBase64: string; coordCode?: string };
    if (!fileBase64) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const buffer = Buffer.from(fileBase64, "base64");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);
    // Prefer a sheet literally named "Projets" (per the reference file
    // shape in CLAUDE_DOSSIER.md §4.1); otherwise the first sheet.
    const sheet = wb.worksheets.find(s => normalize(s.name).includes("projet")) || wb.worksheets[0];
    if (!sheet) return NextResponse.json({ error: "No sheet found in file" }, { status: 400 });

    // Locate the header row (first row with at least 3 recognizable headers
    // — committee files sometimes have a title row above the real header).
    let headerRowIdx = -1;
    let colOf: Record<string, number> = {};
    for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
      const row = sheet.getRow(r);
      const found: Record<string, number> = {};
      row.eachCell((cell, col) => {
        const h = normalize(cell.value);
        if (!h) return;
        for (const [field, needles] of Object.entries(HEADER_MAP)) {
          if (found[field]) continue;
          if (needles.some(n => h.includes(n))) found[field] = col;
        }
      });
      if (Object.keys(found).length >= 3) { headerRowIdx = r; colOf = found; break; }
    }
    if (headerRowIdx === -1) {
      return NextResponse.json({ error: "Could not find a recognizable header row (porteur/secteur/coût columns)" }, { status: 400 });
    }
    if (!colOf.porteur || !colOf.intitule || !colOf.secteur || !colOf.cout) {
      return NextResponse.json({ error: "Missing required columns — need at least porteur, intitulé, secteur and coût" }, { status: 400 });
    }

    const issues: ValidationIssue[] = [];
    const holders: any[] = [];
    const seenKeys = new Set<string>();
    const baseId = Date.now().toString().slice(-6);
    let rowOut = 0;

    for (let r = headerRowIdx + 1; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const get = (field: string) => colOf[field] ? row.getCell(colOf[field]).value : undefined;
      const numero = normalize(get("numero")) || String(r - headerRowIdx);
      const porteur = String(get("porteur") || "").trim();
      const intitule = String(get("intitule") || "").trim();
      const secteur = String(get("secteur") || "").trim();
      const cout = numFrom(get("cout"));

      // A fully blank row (common as a trailing/total row) is silently skipped.
      if (!porteur && !intitule && !secteur && cout === null) continue;

      if (!porteur || !intitule || !secteur || cout === null) {
        issues.push({ level: "error", numero, message: `Ligne ${r}: porteur, intitulé, secteur et coût sont requis` });
        continue;
      }

      const dupKey = normalize(porteur) + "|" + normalize(intitule);
      if (seenKeys.has(dupKey)) {
        issues.push({ level: "warning", numero, message: `Ligne ${r}: porteur+intitulé en doublon` });
      }
      seenKeys.add(dupKey);

      if (cout > PLAFOND_PROJET * 1.2) {
        // Not a hard reject (committee files do include over-cap total costs
        // when the holder brings a larger apport) — the INDH contribution
        // itself still gets capped below.
        issues.push({ level: "warning", numero, message: `Ligne ${r}: coût (${cout} MAD) dépasse largement le plafond` });
      }

      const subventionRaw = numFrom(get("subvention"));
      const apportRaw = numFrom(get("apport"));
      const computed = computeSplit(cout);
      if (subventionRaw !== null && Math.abs(subventionRaw - computed.indhContribution) > Math.max(1, cout * 0.01)) {
        issues.push({ level: "warning", numero, message: `Ligne ${r}: subvention déclarée (${subventionRaw}) ≠ 90% du coût` });
      }

      const sectorKey = mapSectorToKey(secteur, intitule);
      if (sectorKey === "autre" && !normalize(secteur).includes("autre")) {
        issues.push({ level: "warning", numero, message: `Ligne ${r}: secteur "${secteur}" non reconnu` });
      }
      const ageVal = get("age");
      const age = normalize(ageVal) === "nc" || normalize(ageVal) === "" ? null : numFrom(ageVal);
      if (age === null) issues.push({ level: "warning", numero, message: `Ligne ${r}: âge manquant ou non communiqué` });

      const equipements = String(get("equipements") || "").trim();
      const presentation = String(get("presentation") || "").trim();
      const benchmark = getSectorBenchmark(sectorKey);

      const indhContribution = subventionRaw !== null ? Math.min(Math.round(subventionRaw), PLAFOND_PROJET) : computed.indhContribution;
      const beneficiaryContribution = apportRaw !== null ? Math.round(apportRaw) : Math.max(0, cout - indhContribution);

      const proj: ProjectProfile = {
        projectName: String(get("nomCommercial") || "").trim() || intitule,
        sector: secteur,
        legalStructure: "Porteur individuel",
        location: String(get("quartier") || "").trim(),
        beneficiaries: 1,
        targetProfile: "",
        localProblem: presentation,
        revenueModel: "",
        holderExperience: "",
        activities: equipements ? equipements.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean) : [],
        strengths: [],
        estimatedBudget: cout,
        equipmentRequested: equipements,
        pillar: "",
      };
      const budget: Budget = {
        items: [{ category: "Équipement", item: equipements || intitule, quantity: 1, unitPrice: cout, total: cout }],
        indhContribution, beneficiaryContribution,
      };
      const plan: BusinessPlan = {
        executiveSummary: presentation || `Projet "${intitule}" dans le secteur ${secteur}.`,
        problemStatement: "",
        solution: presentation,
        marketAnalysis: "",
        businessModel: `Hypothèse sectorielle: panier moyen ~${benchmark.panierMoyen} MAD, ~${benchmark.clientsJour} clients/jour.`,
        socialImpact: "",
        operationalPlan: "",
        indh_alignment: "",
        risks: [],
        projections: {},
      };

      const [firstName, ...rest] = porteur.split(/\s+/);
      rowOut++;
      holders.push({
        id: `IM${baseId}${String(rowOut).padStart(2, "0")}`,
        name: firstName || porteur,
        profile: {
          firstName: firstName || porteur, lastName: rest.join(" "),
          email: String(get("email") || "").trim(), phone: String(get("telephone") || "").trim(),
          age: age !== null ? String(age) : "", gender: normalize(get("sexe")).startsWith("f") ? "Femme" : normalize(get("sexe")).startsWith("h") || normalize(get("sexe")).startsWith("m") ? "Homme" : "",
          sector: secteur, region: "", coordCode: coordCode || "",
        },
        idea: presentation,
        step: "export",
        proj, plan, budget, comp: null,
        assumptions: { source: "benchmark", fields: ["businessModel", "socialImpact", "projections"] },
        importedFrom: "committee_excel",
        createdAt: Date.now(),
      });
    }

    const holdersValid = holders.filter(h => RE_HOLDER.test(h.id));
    return NextResponse.json({
      holders: holdersValid,
      validation: {
        issues,
        rowCount: holdersValid.length,
        errorCount: issues.filter(i => i.level === "error").length,
        warningCount: issues.filter(i => i.level === "warning").length,
      },
    });
  } catch (err) {
    console.error("parse-committee-excel: failed", err);
    return NextResponse.json({ error: "Failed to parse Excel file — check it's a valid .xlsx" }, { status: 500 });
  }
}
