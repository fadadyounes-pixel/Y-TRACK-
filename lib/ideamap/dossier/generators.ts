import type { ProjectProfile, BusinessPlan, Budget, Compliance } from "./schema";

// Per-dossier DOCX generators (IDEAMAP_DOSSIER_FACTORY_PROMPT.md §1: each
// dossier is 4 files — the Présentation comité PPTX lives in app/ideamap/
// page.tsx next to the existing generatePptxDeck, for the same pptxgenjs
// styling-helper reuse reasons; these three are new, so they get their own
// home here rather than growing page.tsx further).
//
// Per §2's non-negotiable — "Generators must never depend on the AI being
// up" — every one of these builds entirely from data already on the
// dossier (ProjectProfile/BusinessPlan/Budget/Compliance, the exact shapes
// HolderApp already compiles). No AI call, no network, no failure mode
// beyond "a field was empty so that line is omitted."
//
// docx's Packer.toBlob() works in the browser (webpack/Turbopack bundle),
// same "dynamic-import a heavy lib only when the download button is
// clicked" pattern already used for pptxgenjs and exceljs elsewhere in this
// app — callers should `const docx = await import("docx")` themselves and
// pass its exports in, rather than this module importing `docx` at the top
// level, so it never ends up in a server bundle or the initial client chunk.

export type DossierData = {
  proj: ProjectProfile | null;
  plan: BusinessPlan | null;
  budget: Budget | null;
  comp: Compliance | null;
  profile: any;
  name: string;
};

export type Lang = "fr" | "ar" | "en";

const T = {
  ficheProjet: { fr: "Fiche Projet", ar: "بطاقة المشروع", en: "Project Sheet" },
  ficheTechnique: { fr: "Fiche Technique", ar: "البطاقة التقنية", en: "Technical Sheet" },
  businessPlan: { fr: "Business Plan", ar: "خطة الأعمال", en: "Business Plan" },
  porteur: { fr: "Porteur de projet", ar: "حامل المشروع", en: "Project Holder" },
  projet: { fr: "Informations du projet", ar: "معلومات المشروع", en: "Project Information" },
  budgetT: { fr: "Budget", ar: "الميزانية", en: "Budget" },
  nom: { fr: "Nom", ar: "الاسم", en: "Name" },
  cin: { fr: "CIN", ar: "رقم البطاقة الوطنية", en: "National ID" },
  age: { fr: "Âge", ar: "العمر", en: "Age" },
  genre: { fr: "Genre", ar: "الجنس", en: "Gender" },
  tel: { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
  region: { fr: "Région", ar: "الجهة", en: "Region" },
  nomProjet: { fr: "Nom du projet", ar: "اسم المشروع", en: "Project name" },
  secteur: { fr: "Secteur", ar: "القطاع", en: "Sector" },
  structure: { fr: "Structure juridique", ar: "الهيكل القانوني", en: "Legal structure" },
  categorieEntreprise: { fr: "Catégorie d'entreprise", ar: "فئة المقاولة", en: "Business category" },
  tpe: {
    fr: "Très petite entreprise (TPE) — soutenue par l'Initiative Nationale pour le Développement Humain (INDH), Phase 3",
    ar: "مقاولة صغيرة جداً — مدعومة من المبادرة الوطنية للتنمية البشرية (المرحلة الثالثة)",
    en: "Very small business (micro-enterprise) — supported by the National Initiative for Human Development (INDH), Phase 3",
  },
  localisation: { fr: "Localisation", ar: "الموقع", en: "Location" },
  beneficiaires: { fr: "Bénéficiaires", ar: "المستفيدون", en: "Beneficiaries" },
  axeIndh: { fr: "Axe INDH", ar: "محور المبادرة الوطنية", en: "INDH pillar" },
  description: { fr: "Description du projet", ar: "وصف المشروع", en: "Project description" },
  coutTotal: { fr: "Coût total", ar: "الكلفة الإجمالية", en: "Total cost" },
  indh90: { fr: "Contribution INDH (90%)", ar: "مساهمة المبادرة الوطنية (90%)", en: "INDH contribution (90%)" },
  apport10: { fr: "Apport du porteur (10%)", ar: "مساهمة الحامل (10%)", en: "Holder contribution (10%)" },
  equipements: { fr: "Équipements et devis", ar: "التجهيزات والأثمان", en: "Equipment and quotation" },
  categorie: { fr: "Catégorie", ar: "الفئة", en: "Category" },
  designation: { fr: "Désignation", ar: "البيان", en: "Item" },
  qte: { fr: "Qté", ar: "الكمية", en: "Qty" },
  prixUnit: { fr: "Prix unitaire", ar: "السعر الوحدوي", en: "Unit price" },
  total: { fr: "Total", ar: "المجموع", en: "Total" },
  ficheComite: { fr: "Fiche Comité", ar: "بطاقة اللجنة", en: "Committee Record" },
  numero: { fr: "N°", ar: "رقم", en: "N°" },
  intitule: { fr: "Intitulé du projet", ar: "عنوان المشروع", en: "Project title" },
  presentation: { fr: "Présentation du projet", ar: "تقديم المشروع", en: "Project presentation" },
  equipementsLine: { fr: "Équipements à financer", ar: "التجهيزات المطلوب تمويلها", en: "Equipment to finance" },
  cout: { fr: "Coût du projet", ar: "كلفة المشروع", en: "Project cost" },
  subvention: { fr: "Subvention INDH", ar: "دعم المبادرة الوطنية", en: "INDH grant" },
  apport: { fr: "Apport du porteur", ar: "مساهمة الحامل", en: "Holder contribution" },
  detailsComplementaires: { fr: "Détails complémentaires", ar: "تفاصيل إضافية", en: "Additional details" },
  activiteCle: { fr: "Activités clés", ar: "الأنشطة الرئيسية", en: "Key activities" },
  modeleEco: { fr: "Modèle économique", ar: "النموذج الاقتصادي", en: "Revenue model" },
  experience: { fr: "Expérience du porteur", ar: "خبرة الحامل", en: "Holder experience" },
  resumeExec: { fr: "Résumé exécutif", ar: "الملخص التنفيذي", en: "Executive summary" },
  problematique: { fr: "Problématique", ar: "الإشكالية", en: "Problem statement" },
  solution: { fr: "Solution", ar: "الحل", en: "Solution" },
  marche: { fr: "Analyse de marché", ar: "تحليل السوق", en: "Market analysis" },
  impactSocial: { fr: "Impact social", ar: "الأثر الاجتماعي", en: "Social impact" },
  planOp: { fr: "Plan opérationnel", ar: "الخطة التشغيلية", en: "Operational plan" },
  alignementIndh: { fr: "Alignement INDH", ar: "الانسجام مع المبادرة الوطنية", en: "INDH alignment" },
  risques: { fr: "Risques et mesures", ar: "المخاطر والإجراءات", en: "Risks and mitigations" },
  projections: { fr: "Projections financières (MAD)", ar: "التوقعات المالية (درهم)", en: "Financial projections (MAD)" },
  assumptionNote: {
    fr: "Projections établies sur hypothèses sectorielles – à valider avec le porteur.",
    ar: "التوقعات مبنية على افتراضات قطاعية – يجب التحقق منها مع حامل المشروع.",
    en: "Projections built on sector assumptions — to be validated with the holder.",
  },
};
const tr = (key: keyof typeof T, lang: Lang) => T[key][lang] || T[key].fr;

// §4.4: any document built from assumed (not holder-supplied) figures must
// print this note — never silently present a guess as a fact.
function assumptionNote(docxLib: any, lang: Lang, isAssumed: boolean) {
  if (!isAssumed) return [];
  return [new docxLib.Paragraph({
    children: [new docxLib.TextRun({ text: `⚠ ${tr("assumptionNote", lang)}`, italics: true, color: "C0632F" })],
    spacing: { before: 200, after: 200 },
  })];
}

function infoTable(docxLib: any, rows: [string, string][]) {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } = docxLib;
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: rows.filter(([, v]) => v).map(([label, value]) => new TableRow({
      children: [
        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: "F0EEE9" },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })] }),
        new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })] }),
      ],
    })),
  });
}

function heading(docxLib: any, text: string) {
  return new docxLib.Paragraph({ text, heading: docxLib.HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}
function body(docxLib: any, text?: string) {
  if (!text) return [];
  return [new docxLib.Paragraph({ children: [new docxLib.TextRun({ text, size: 20 })], spacing: { after: 150 } })];
}

// Every INDH Phase 3 project is, by construction, a very small business —
// the program caps total project cost at PLAFOND_PROJET (100,000 MAD, see
// finance.ts) — but a document should say that plainly rather than leave
// it implied by a number elsewhere. Shared across all three generators so
// the framing (and its wording) stays identical everywhere it appears.
function titleBlock(docxLib: any, titleKey: keyof typeof T, proj: ProjectProfile | null, lang: Lang) {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType } = docxLib;
  return [
    new Paragraph({ text: tr(titleKey, lang), heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: proj?.projectName || "", bold: true, size: 28, color: "2A5CE0" })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: tr("tpe", lang), italics: true, size: 18, color: "666666" })],
      alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  ];
}

// One coherent paragraph reading like the "Présentation du projet" cell of
// a real committee Excel row — the concept, who it's for, and the problem
// it solves joined into a single dense block, rather than left as three
// separate headed sections. This is what makes a generated Fiche Projet
// read like an authentic INDH committee record instead of a generic AI
// summary with headers for every field.
function composePresentation(proj: ProjectProfile | null): string {
  if (!proj) return "";
  const parts = [
    proj.targetProfile,
    proj.localProblem ? `Problème local visé : ${proj.localProblem}.` : "",
    proj.revenueModel ? `Fonctionnement : ${proj.revenueModel}.` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

// Matches §4.2's own raw format for a committee Excel's "Équipements" cell
// — a single semicolon-joined line, not a formatted table — e.g.
// "Four professionnel ; Vitrine réfrigérée ; Mobilier de travail".
function composeEquipementsLine(budget: Budget | null): string {
  if (!budget?.items?.length) return "";
  return budget.items.map(i => i.item).filter(Boolean).join(" ; ");
}

// The dossier's record laid out in the EXACT column order of the committee
// Excel §4.2 describes (N°, Porteur, Âge, Intitulé, Secteur, Présentation,
// Équipements, Coût, Subvention, Apport) — so a Fiche Projet generated from
// a holder's own dialogue reads as the same record a bulk committee import
// would produce for the same project, field for field.
function committeeRecordTable(docxLib: any, data: DossierData, lang: Lang) {
  const { proj, budget, profile, name } = data;
  const total = budget?.items?.reduce((s, x) => s + (x.total || 0), 0) || proj?.estimatedBudget || 0;
  const indh = budget?.indhContribution ?? Math.min(Math.round(total * 0.9), 100_000);
  const apport = budget?.beneficiaryContribution ?? (total - indh);
  return infoTable(docxLib, [
    [tr("numero", lang), profile?.cin || profile?.id || ""],
    [tr("porteur", lang), `${name || ""} ${profile?.lastName || ""}`.trim()],
    [tr("age", lang), String(profile?.age || "")],
    [tr("intitule", lang), proj?.projectName || ""],
    [tr("secteur", lang), proj?.sector || ""],
    [tr("presentation", lang), composePresentation(proj)],
    [tr("equipementsLine", lang), composeEquipementsLine(budget)],
    [tr("cout", lang), total ? `${total.toLocaleString()} MAD` : ""],
    [tr("subvention", lang), total ? `${indh.toLocaleString()} MAD` : ""],
    [tr("apport", lang), total ? `${apport.toLocaleString()} MAD` : ""],
  ]);
}

export async function buildFicheProjetDoc(docxLib: any, data: DossierData, lang: Lang, isAssumed: boolean) {
  const { Document, Packer } = docxLib;
  const { proj, profile } = data;
  const doc = new Document({ sections: [{ children: [
    ...titleBlock(docxLib, "ficheProjet", proj, lang),
    heading(docxLib, tr("ficheComite", lang)),
    committeeRecordTable(docxLib, data, lang),
    heading(docxLib, tr("detailsComplementaires", lang)),
    infoTable(docxLib, [
      [tr("genre", lang), profile?.gender || ""],
      [tr("tel", lang), profile?.phone || ""],
      [tr("region", lang), profile?.region || ""],
      [tr("localisation", lang), proj?.location || ""],
      [tr("structure", lang), proj?.legalStructure || ""],
      [tr("categorieEntreprise", lang), tr("tpe", lang)],
      [tr("beneficiaires", lang), String(proj?.beneficiaries ?? "")],
      [tr("axeIndh", lang), proj?.pillar || ""],
    ]),
    ...assumptionNote(docxLib, lang, isAssumed),
  ] }] });
  return Packer.toBlob(doc);
}

export async function buildFicheTechniqueDoc(docxLib: any, data: DossierData, lang: Lang, isAssumed: boolean) {
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } = docxLib;
  const { proj, budget } = data;
  const total = budget?.items?.reduce((s, x) => s + (x.total || 0), 0) || 0;
  const indh = budget?.indhContribution ?? Math.min(Math.round(total * 0.9), 100_000);
  const apport = budget?.beneficiaryContribution ?? (total - indh);
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const itemRows = (budget?.items || []).map(it => new TableRow({ children: [
    new TableCell({ children: [new Paragraph({ text: it.category || "" })] }),
    new TableCell({ children: [new Paragraph({ text: it.item || "" })] }),
    new TableCell({ children: [new Paragraph({ text: String(it.quantity ?? 1) })] }),
    new TableCell({ children: [new Paragraph({ text: it.unitPrice != null ? `${Number(it.unitPrice).toLocaleString()} MAD` : "—" })] }),
    new TableCell({ children: [new Paragraph({ text: `${Number(it.total || 0).toLocaleString()} MAD` })] }),
  ] }));
  const doc = new Document({ sections: [{ children: [
    ...titleBlock(docxLib, "ficheTechnique", proj, lang),
    heading(docxLib, tr("equipements", lang)),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
      rows: [
        new TableRow({ children: [tr("categorie", lang), tr("designation", lang), tr("qte", lang), tr("prixUnit", lang), tr("total", lang)]
          .map(h => new TableCell({ shading: { fill: "0F2233" }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18 })] })] })) }),
        ...itemRows,
      ],
    }),
    heading(docxLib, tr("budgetT", lang)),
    infoTable(docxLib, [
      [tr("coutTotal", lang), `${total.toLocaleString()} MAD`],
      [tr("indh90", lang), `${indh.toLocaleString()} MAD`],
      [tr("apport10", lang), `${apport.toLocaleString()} MAD`],
    ]),
    heading(docxLib, tr("modeleEco", lang)),
    ...body(docxLib, proj?.revenueModel),
    ...assumptionNote(docxLib, lang, isAssumed),
  ] }] });
  return Packer.toBlob(doc);
}

export async function buildBusinessPlanDoc(docxLib: any, data: DossierData, lang: Lang, isAssumed: boolean) {
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } = docxLib;
  const { proj, plan } = data;
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const projEntries = plan?.projections ? Object.entries(plan.projections) : [];
  const doc = new Document({ sections: [{ children: [
    ...titleBlock(docxLib, "businessPlan", proj, lang),
    heading(docxLib, tr("resumeExec", lang)), ...body(docxLib, plan?.executiveSummary),
    heading(docxLib, tr("problematique", lang)), ...body(docxLib, plan?.problemStatement),
    heading(docxLib, tr("solution", lang)), ...body(docxLib, plan?.solution),
    heading(docxLib, tr("marche", lang)), ...body(docxLib, plan?.marketAnalysis),
    heading(docxLib, tr("modeleEco", lang)), ...body(docxLib, plan?.businessModel),
    heading(docxLib, tr("impactSocial", lang)), ...body(docxLib, plan?.socialImpact),
    heading(docxLib, tr("planOp", lang)), ...body(docxLib, plan?.operationalPlan),
    heading(docxLib, tr("alignementIndh", lang)), ...body(docxLib, plan?.indh_alignment),
    ...(plan?.risks?.length ? [heading(docxLib, tr("risques", lang)),
      ...plan.risks.map(r => new Paragraph({ children: [new TextRun({ text: `• ${r}`, size: 20 })], spacing: { after: 100 } }))] : []),
    ...(projEntries.length ? [heading(docxLib, tr("projections", lang)),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
        rows: [
          new TableRow({ children: projEntries.map(([yr]) => new TableCell({ shading: { fill: "0F2233" },
            children: [new Paragraph({ children: [new TextRun({ text: yr, bold: true, color: "FFFFFF", size: 18 })] })] })) }),
          new TableRow({ children: projEntries.map(([, v]) => new TableCell({
            children: [new Paragraph({ text: `${Number(v).toLocaleString()} MAD` })] })) }),
        ],
      })] : []),
    ...assumptionNote(docxLib, lang, isAssumed),
  ] }] });
  return Packer.toBlob(doc);
}
