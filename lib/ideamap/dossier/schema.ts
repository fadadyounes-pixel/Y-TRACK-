// Shared data model for the Dossier Factory (see CLAUDE_DOSSIER.md). Both the
// holder's own guided flow (HolderApp in app/ideamap/page.tsx) and the
// coordinator's bulk committee-Excel import build the SAME shapes below, so
// every downstream consumer — Plan/Budget/Compliance screens, the PPTX/DOCX
// generators, the committee Excel export — works identically regardless of
// which path produced the data.

export type TriText = { fr: string; ar: string; en: string };

// Mirrors the `proj` shape HolderApp's sendMsg() compiles via AI, and what
// CoordDash's "Import application answers" upload (parse-application route)
// already produces — this type documents that existing, shipped shape rather
// than inventing a new one.
export type ProjectProfile = {
  projectName: string;
  sector: string;
  legalStructure: string;
  location: string;
  beneficiaries: number;
  targetProfile: string;
  localProblem: string;
  revenueModel: string;
  holderExperience: string;
  activities: string[];
  strengths: string[];
  estimatedBudget: number;
  // The porteur's own words for what they want to buy (Q18 "quel équipement
  // principal...") — the committee Excel's "Équipements" column. Carried
  // through verbatim (never reworded) so the budget's first line item and the
  // generated documents both trace back to what the porteur actually asked
  // for, instead of a sector-generic guess.
  equipmentRequested: string;
  pillar: string;
};

// Mirrors `plan` as built by genPlan() in app/ideamap/page.tsx.
export type BusinessPlan = {
  executiveSummary: string;
  problemStatement: string;
  solution: string;
  marketAnalysis: string;
  businessModel: string;
  socialImpact: string;
  operationalPlan: string;
  indh_alignment: string;
  risks: string[];
  projections: Record<string, number>; // e.g. {year1, year2, year3}
};

export type BudgetItem = {
  category: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Mirrors `budget` as built by genPlan()/buildLocalBudget() — see finance.ts
// for the 90/10 split and cap this shape is always expected to satisfy.
export type Budget = {
  items: BudgetItem[];
  indhContribution: number;
  beneficiaryContribution: number;
};

// Mirrors `comp` as built by checkComp()/buildLocalCompliance().
export type JuryScore = {
  impact: number; // /25
  viability: number; // /20
  relevance: number; // /20
  management: number; // /15
  sustainability: number; // /10
  innovation: number; // /10
};

export type Compliance = {
  eligible: boolean;
  score: number; // /100
  pillar: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  juryScore: JuryScore;
};

// ── Bulk committee-Excel import (new — Dossier Factory §4) ──────────────

// One parsed row of a committee Excel import, before enrichment. Field names
// match the factory prompt's §4.2 column-mapping table; everything but the
// first few is optional because committee files vary in how much they
// capture per porteur.
export type CommitteeRow = {
  numero: string;
  porteur: string;
  prenom?: string;
  nom?: string;
  age: number | null; // null when the source cell reads "N.C."
  intitule: string;
  secteur: string;
  sectorKey: string; // mapped SectorKey, e.g. "coiffure_f" — "autre" when unrecognized
  presentation?: string;
  equipements?: string; // raw cell text, split into lines by the parser
  equipementLines?: string[];
  cout: number;
  subvention: number;
  apport: number;
  cin?: string;
  telephone?: string;
  email?: string;
  sexe?: string;
  quartier?: string;
  nomCommercial?: string;
};

export type ValidationLevel = "error" | "warning";

// One finding from the §4.3 validation pass — either tied to a specific row
// (numero set) or to the import as a whole (numero omitted, e.g. a
// Récapitulatif/Projets mismatch).
export type ValidationIssue = {
  level: ValidationLevel;
  numero?: string;
  field?: string;
  message: string;
};

export type ValidationReport = {
  issues: ValidationIssue[];
  rowCount: number;
  errorCount: number;
  warningCount: number;
  fileTotal?: { cout: number; subvention: number; apport: number };
  computedTotal: { cout: number; subvention: number; apport: number };
};

// A scope is a (préfecture, promo) pair — the unit coordinator access is
// restricted to everywhere in the API and DB queries (§3), never only in UI.
export type Scope = {
  id: string;
  prefecture: string;
  promo: string;
};

// Admin-edited per-sector assumptions used to fill the business-plan inputs a
// committee Excel never carries (§4.4). Every dossier built from a benchmark
// rather than a holder's own answers must say so (`assumptions.source`).
export type SectorBenchmark = {
  sector: string;
  panierMoyen: number; // MAD per transaction
  clientsJour: number;
  joursMois: number;
  matieresPct: number; // % of revenue spent on raw materials/supplies
  chargesFixes: Record<string, number>; // named fixed monthly charges, MAD
  croissance: Record<string, number>; // named yearly growth rates
};

export type AssumptionSource = "benchmark" | "holder" | "coordinator";

export type Assumptions = {
  source: AssumptionSource;
  fields: string[]; // which ProjectProfile/BusinessPlan/Budget fields were assumed rather than supplied
};

export type DossierStatus = "pending" | "enriching" | "ready" | "error";
export type AiState = "pending" | "ok" | "fallback";

// One project's full record — whether it originated from a holder's own
// dialogue (`holderUserId` set, `importId` null) or a coordinator's bulk
// import (`importId` set, `numero` matching its CommitteeRow). Mirrors the
// `dossiers` table in db/migrations/0001_init.sql.
export type DossierRecord = {
  id: string;
  scopeId: string;
  importId: string | null;
  holderUserId: string | null;
  numero: string | null;
  status: DossierStatus;
  row: CommitteeRow | null; // source row, when importId is set
  proj: ProjectProfile | null;
  plan: BusinessPlan | null;
  budget: Budget | null;
  comp: Compliance | null;
  contentHash: string | null;
  aiState: AiState;
  assumptions: Assumptions | null;
  updatedAt: string; // ISO timestamp
};

export type ImportStatus = "pending" | "parsing" | "validated" | "generating" | "done" | "error";

export type ImportRecord = {
  id: string;
  scopeId: string;
  uploadedBy: string;
  fileKey: string;
  status: ImportStatus;
  rows: number;
  warnings: number;
  errors: number;
  totals: { cout: number; subvention: number; apport: number } | null;
  createdAt: string;
};
