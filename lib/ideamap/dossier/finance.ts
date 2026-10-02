import type { Budget, SectorBenchmark } from "./schema";

// INDH Phase 3 rule, already enforced client-side throughout HolderApp's
// genPlan()/buildLocalBudget() in app/ideamap/page.tsx: a project's total
// cost is capped so the INDH grant (90%) never exceeds this. Centralized
// here so the bulk-import validator (§4.3 "Coût > 100 000 MAD") and the
// holder flow apply the exact same number instead of two copies drifting.
export const PLAFOND_PROJET = 100_000;

// Standard 90/10 split: INDH covers 90% of a project's cost (capped at
// PLAFOND_PROJET), the holder brings the remaining 10%. Mirrors the
// `indhContribution`/`beneficiaryContribution` math already inline at every
// call site in app/ideamap/page.tsx (genPlan, buildLocalBudget, the PPTX
// generator, the compliance checker) — those are candidates to migrate onto
// this shared function in a later pass, not part of this one.
export function computeSplit(totalCost: number): Pick<Budget, "indhContribution" | "beneficiaryContribution"> {
  const indhContribution = Math.min(Math.round(totalCost * 0.9), PLAFOND_PROJET);
  const beneficiaryContribution = totalCost - indhContribution;
  return { indhContribution, beneficiaryContribution };
}

// Loose normalization for matching a committee Excel's free-text `secteur`
// cell against this platform's known sectors — accent/case-insensitive,
// matches on the leading significant word so "Coiffure" / "coiffure hommes"
// / "COIFFURE-BEAUTE" all resolve the same way.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// §4.2: map a committee row's free-text sector (and project title, for the
// Coiffure gender split) to a stable SectorKey used throughout the Dossier
// Factory (sector_benchmarks lookups, PPTX/DOCX section selection). Returns
// "autre" plus lets the caller raise the §4.3 "Unknown sector" warning when
// nothing matches.
export function mapSectorToKey(secteur: string, intitule: string = ""): string {
  const s = normalize(secteur);
  const title = normalize(intitule);
  if (s.includes("coiffure") || s.includes("beaute") || s.includes("beauté")) {
    return title.includes("femme") || title.includes("dame") ? "coiffure_f" : "coiffure_h";
  }
  const known: [string, string][] = [
    ["agriculture", "agriculture_elevage"], ["elevage", "agriculture_elevage"],
    ["artisanat", "artisanat_traditionnel"],
    ["commerce", "commerce_epicerie"], ["epicerie", "commerce_epicerie"],
    ["agro-alimentaire", "agro_alimentaire"], ["agroalimentaire", "agro_alimentaire"],
    ["restauration", "restauration_cafe"], ["cafe", "restauration_cafe"],
    ["couture", "couture_vetement"], ["vetement", "couture_vetement"],
    ["impression", "impression_reprographie"], ["reprographie", "impression_reprographie"],
    ["design", "design_communication"], ["communication", "design_communication"],
    ["numerique", "numerique_tic"], ["tic", "numerique_tic"], ["informatique", "numerique_tic"],
    ["tourisme", "tourisme_rural"], ["guide", "tourisme_rural"],
    ["btp", "btp_maconnerie"], ["maconnerie", "btp_maconnerie"],
    ["education", "education_formation"], ["formation", "education_formation"],
    ["peche", "peche_aquaculture"], ["aquaculture", "peche_aquaculture"],
    ["transport", "transport_logistique"], ["logistique", "transport_logistique"],
    ["sante", "sante_pharmacie"], ["pharmacie", "sante_pharmacie"],
    ["reparation", "reparation_maintenance"], ["maintenance", "reparation_maintenance"],
    ["evenementiel", "evenementiel_traiteur"], ["traiteur", "evenementiel_traiteur"],
  ];
  for (const [needle, key] of known) if (s.includes(needle)) return key;
  return "autre";
}

// Seed placeholders only — the factory prompt (§4.4) is explicit that these
// are starting values the Admin must review before launch, not production
// figures. Every dossier assembled from a benchmark rather than a holder's
// own answers carries `assumptions.source === "benchmark"` and a visible
// "hypothèses" note in its generated documents (never silent).
export const DEFAULT_SECTOR_BENCHMARKS: Record<string, SectorBenchmark> = {
  coiffure_f: { sector: "coiffure_f", panierMoyen: 80, clientsJour: 6, joursMois: 24, matieresPct: 20,
    chargesFixes: { loyer: 800, electricite: 300 }, croissance: { year2: 0.15, year3: 0.1 } },
  coiffure_h: { sector: "coiffure_h", panierMoyen: 40, clientsJour: 10, joursMois: 26, matieresPct: 15,
    chargesFixes: { loyer: 600, electricite: 250 }, croissance: { year2: 0.15, year3: 0.1 } },
  restauration_cafe: { sector: "restauration_cafe", panierMoyen: 35, clientsJour: 40, joursMois: 26, matieresPct: 38,
    chargesFixes: { loyer: 1500, electricite: 500, gaz: 300 }, croissance: { year2: 0.2, year3: 0.12 } },
  agro_alimentaire: { sector: "agro_alimentaire", panierMoyen: 120, clientsJour: 8, joursMois: 22, matieresPct: 45,
    chargesFixes: { loyer: 900, electricite: 350 }, croissance: { year2: 0.18, year3: 0.1 } },
  autre: { sector: "autre", panierMoyen: 60, clientsJour: 8, joursMois: 24, matieresPct: 25,
    chargesFixes: { loyer: 700, electricite: 300 }, croissance: { year2: 0.15, year3: 0.1 } },
};

export function getSectorBenchmark(sectorKey: string): SectorBenchmark {
  return DEFAULT_SECTOR_BENCHMARKS[sectorKey] || DEFAULT_SECTOR_BENCHMARKS.autre;
}
