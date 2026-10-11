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
  // Official INDH Phase 3 "Business Plan" canvas — section headers below
  // mirror that form's own wording field for field, minus its prefecture
  // branding (no logo, no "Hay Hassani" — the form is used by every
  // coordinator/prefecture on the platform, so its title stays generic).
  programTitle: {
    fr: "Programme d'amélioration du revenu et d'insertion économique des jeunes",
    ar: "برنامج تحسين الدخل والإدماج الاقتصادي للشباب",
    en: "Youth Income Improvement and Economic Inclusion Program",
  },
  programPillar: {
    fr: "Axe « Soutien à l'entrepreneuriat des jeunes »",
    ar: "محور «دعم ريادة الأعمال لدى الشباب»",
    en: "Pillar: \"Supporting youth entrepreneurship\"",
  },
  holderInfo: { fr: "Informations sur le porteur de projet", ar: "معلومات حول صاحب المشروع", en: "Information about the project holder" },
  firstNameF: { fr: "Prénom", ar: "الاسم الشخصي", en: "First name" },
  lastNameF: { fr: "Nom de famille", ar: "الاسم العائلي", en: "Last name" },
  cinF: { fr: "N° carte d'identité nationale", ar: "رقم بطاقة التعريف الوطنية", en: "National ID number" },
  dobF: { fr: "Date de naissance", ar: "تاريخ الازدياد", en: "Date of birth" },
  phoneF: { fr: "Téléphone", ar: "رقم الهاتف", en: "Phone number" },
  emailF: { fr: "E-mail", ar: "البريد الإلكتروني", en: "E-mail" },
  eduF: { fr: "Niveau scolaire", ar: "المستوى الدراسي", en: "Education level" },
  mainTheme: { fr: "Thème principal du projet", ar: "الموضوع الرئيسي لمشروعك", en: "Main theme of your project" },
  themeHealth: { fr: "Santé", ar: "الصحة", en: "Health" },
  themeEducation: { fr: "Éducation et enseignement", ar: "التربية و التعليم", en: "Education and teaching" },
  themeAgriculture: { fr: "Agriculture", ar: "الفلاحة", en: "Agriculture" },
  themeCrafts: { fr: "Artisanat", ar: "الحرف", en: "Crafts" },
  themeServices: { fr: "Services", ar: "الخدمات", en: "Services" },
  themeIndustry: { fr: "Industrie", ar: "الصناعة", en: "Industry" },
  themeOther: { fr: "Autre", ar: "أخرى", en: "Other" },
  projectStatus: { fr: "État du projet", ar: "حالة المشروع", en: "Project status" },
  statusNotStarted: { fr: "Non démarré", ar: "لم يتم الشروع فيه", en: "Not started" },
  statusInProgress: { fr: "En cours", ar: "جاري العمل عليه", en: "In progress" },
  statusDone: { fr: "Achevé", ar: "منتهي", en: "Completed" },
  descDetailed: { fr: "Description détaillée du projet", ar: "وصف المشروع بالتدقيق", en: "Detailed project description" },
  contextInnovation: {
    fr: "Contexte du projet (innovation et créativité)",
    ar: "ما هو السياق الذي يبرز مشروعك (صف جانب الابتكار والإبداع في مشروعك)",
    en: "Project context (describe its innovative and creative angle)",
  },
  beneficiariesWho: { fr: "Qui sont les bénéficiaires de votre projet", ar: "من هم المستفيدون من مشروعك", en: "Who benefits from your project" },
  developmentDesc: { fr: "Comment comptez-vous développer votre projet", ar: "صف كيفية تطوير مشروعك", en: "Describe how you will develop your project" },
  feasibilityStudy: { fr: "Étude de faisabilité du projet", ar: "اقتراح دراسة جدوى لمشروعك", en: "Project feasibility study" },
  marketStudy: { fr: "Étude de marché", ar: "دراسة السوق", en: "Market study" },
  competitors: { fr: "Concurrents", ar: "المنافسون", en: "Competitors" },
  compName: { fr: "Noms", ar: "الأسماء", en: "Names" },
  compStrength: { fr: "Points forts", ar: "نقاط القوة", en: "Strengths" },
  compWeakness: { fr: "Points faibles", ar: "نقاط الضعف", en: "Weaknesses" },
  compPrice: { fr: "Prix", ar: "الأسعار", en: "Prices" },
  targetCustomers: { fr: "Clientèle ciblée", ar: "العملاء (الفئة المستهدفة)", en: "Customers (target segment)" },
  suppliers: { fr: "Fournisseurs", ar: "الموردون", en: "Suppliers" },
  supplierName: { fr: "Fournisseur", ar: "الموردون", en: "Supplier" },
  supplierDesc: { fr: "Description du fournisseur", ar: "وصف الموردين", en: "Supplier description" },
  supplierWhy: { fr: "Pourquoi ce fournisseur", ar: "لماذا اخترت هذا المورد", en: "Why this supplier" },
  productPricing: { fr: "Prix du produit ou du service", ar: "سعر المنتج أو الخدمة", en: "Product or service price" },
  products: { fr: "Produits", ar: "المنتجات", en: "Products" },
  services: { fr: "Services", ar: "الخدمات", en: "Services" },
  price: { fr: "Prix", ar: "السعر", en: "Price" },
  marketingStrategy: { fr: "Stratégie de commercialisation et distribution", ar: "استراتيجية التسويق والتوزيع", en: "Marketing and distribution strategy" },
  projectSupplies: { fr: "Besoins du projet", ar: "لوازم المشروع", en: "Project supplies" },
  equipmentMachinery: { fr: "Équipements et matériel", ar: "المعدات والآليات", en: "Equipment and machinery" },
  role: { fr: "Rôle", ar: "دورها", en: "Role" },
  projectPremises: { fr: "Local du projet", ar: "مقر المشروع", en: "Project premises" },
  premisesArea: { fr: "Superficie", ar: "المساحة", en: "Area" },
  rentMonthly: { fr: "Loyer mensuel (estimé)", ar: "السومة الكرائية الشهرية (أو التقديرية)", en: "Monthly rent (estimated)" },
  rentYearly: { fr: "Loyer annuel", ar: "السومة الكرائية السنوية", en: "Yearly rent" },
  repairs: { fr: "Aménagements et réparations", ar: "الإصلاحات", en: "Repairs and fittings" },
  repairCost: { fr: "Coût (MAD)", ar: "التكلفة بالدرهم", en: "Cost (MAD)" },
  operatingExpenses: { fr: "Charges et gestion", ar: "النفقات والتسيير", en: "Expenses and operations" },
  humanResources: { fr: "Ressources humaines", ar: "الموارد البشرية", en: "Human resources" },
  staffPermanent: { fr: "Personnel permanent", ar: "عمال رسميون", en: "Permanent staff" },
  staffSeasonal: { fr: "Personnel saisonnier", ar: "عمال موسميون", en: "Seasonal staff" },
  headcount: { fr: "Effectif", ar: "العدد", en: "Headcount" },
  salaryMonthly: { fr: "Salaire mensuel (par personne)", ar: "الراتب الشهري (للفرد)", en: "Monthly salary (per person)" },
  salaryMonthlyTotal: { fr: "Total salaires mensuels", ar: "مجموع الرواتب الشهرية", en: "Total monthly salaries" },
  salaryYearlyTotal: { fr: "Total salaires annuels", ar: "مجموع الرواتب السنوية", en: "Total yearly salaries" },
  rawMaterials: { fr: "Matières premières / fournitures", ar: "المواد الأولية", en: "Raw materials / supplies" },
  year1: { fr: "Année 1", ar: "السنة الأولى", en: "Year 1" },
  year2: { fr: "Année 2", ar: "السنة الثانية", en: "Year 2" },
  year3: { fr: "Année 3", ar: "السنة الثالثة", en: "Year 3" },
  financialStudy: { fr: "Étude financière", ar: "الدراسة المالية", en: "Financial study" },
  annualSales: { fr: "Chiffre d'affaires — ventes annuelles (MAD)", ar: "رقم المعاملات - المبيعات السنوية (بالدرهم)", en: "Turnover — annual sales (MAD)" },
  productService: { fr: "Produit / Service", ar: "المنتج / الخدمة", en: "Product / Service" },
  quantity: { fr: "Quantité", ar: "الكمية", en: "Quantity" },
  unitPriceF: { fr: "Prix unitaire", ar: "ثمن الوحدة", en: "Unit price" },
  annualTotal: { fr: "Total annuel", ar: "المجموع السنوي", en: "Annual total" },
  annualProfits: { fr: "Bénéfices annuels (MAD)", ar: "الأرباح السنوية (بالدرهم)", en: "Annual profits (MAD)" },
  turnoverLine: { fr: "1 - Chiffre d'affaires — ventes annuelles", ar: "1- رقم المعاملات - المبيعات السنوية", en: "1 - Turnover — annual sales" },
  expenses: { fr: "Charges", ar: "المصاريف", en: "Expenses" },
  expStaff: { fr: "Charges de personnel", ar: "مصاريف الموظفين", en: "Staff costs" },
  expUtilities: { fr: "Eau et électricité", ar: "الماء والكهرباء", en: "Water and electricity" },
  expRent: { fr: "Charges de loyer", ar: "مصاريف الكراء", en: "Rent costs" },
  expRawMaterials: { fr: "Matières premières", ar: "المواد الأولية", en: "Raw materials" },
  expensesTotal: { fr: "Total des charges (2)", ar: "مجموع المصاريف (2)", en: "Total expenses (2)" },
  profitLine: { fr: "Bénéfice (2) - (1)", ar: "الربح (2) - (1)", en: "Profit (2) - (1)" },
  totalInvestment: { fr: "Investissement global du projet (MAD)", ar: "الاستثمار الإجمالي للمشروع (بالدرهم)", en: "Total project investment (MAD)" },
  investCharacteristic: { fr: "Caractéristiques du projet", ar: "خصائص المشروع", en: "Project characteristics" },
  investCost: { fr: "Montant", ar: "التكلفة", en: "Amount" },
  fundingTotal: { fr: "Total des besoins de financement", ar: "مجموع متطلبات التمويل", en: "Total funding requirements" },
  indhFundingSupport: { fr: "Appui de l'Initiative Nationale pour le Développement Humain", ar: "دعم المبادرة الوطنية لتنمية البشرية", en: "National Initiative for Human Development support" },
  requiredContribution: { fr: "Contribution demandée", ar: "المساهمة المطلوبة", en: "Required contribution" },
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
function titleBlock(docxLib: any, titleKey: keyof typeof T, proj: ProjectProfile | null, lang: Lang, logoBytes?: Uint8Array) {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = docxLib;
  const logo = logoBytes ? [new Paragraph({
    children: [new ImageRun({ data: logoBytes, type: "png", transformation: { width: 90, height: 90 } })],
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
  })] : [];
  return [
    ...logo,
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

export async function buildFicheProjetDoc(docxLib: any, data: DossierData, lang: Lang, isAssumed: boolean, logoBytes?: Uint8Array) {
  const { Document, Packer } = docxLib;
  const { proj, profile } = data;
  const doc = new Document({ sections: [{ children: [
    ...titleBlock(docxLib, "ficheProjet", proj, lang, logoBytes),
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

export async function buildFicheTechniqueDoc(docxLib: any, data: DossierData, lang: Lang, isAssumed: boolean, logoBytes?: Uint8Array) {
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
    ...titleBlock(docxLib, "ficheTechnique", proj, lang, logoBytes),
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

// ── Business Plan canvas (official INDH Phase 3 "برنامج تحسين الدخل
// والإدماج الاقتصادي للشباب" form) ─────────────────────────────────────
//
// The holder/coordinator-facing Business Plan document now reproduces this
// canvas's own section order and tables field for field, rather than a
// generic AI-style outline. Two things are deliberately NOT carried over
// from the source form: its prefecture's crest/partner logos (a dossier may
// belong to any prefecture on the platform, so only the coordinator's own
// uploaded letterhead — logoBytes, an existing opt-in feature — appears),
// and any "Hay Hassani" wording in a title — every heading below names the
// INDH program itself, never one specific préfecture.

function spacer(docxLib: any) {
  return new docxLib.Paragraph({ text: "", spacing: { after: 160 } });
}

// A full-width single-cell navy bar, reproducing the canvas's own colored
// section-header rows (as opposed to `heading()`'s plain Word heading
// style, used by the other two generators).
function sectionBar(docxLib: any, text: string) {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = docxLib;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [new TableCell({ shading: { fill: "0F2233" },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 19 })], spacing: { before: 60, after: 60 } })] })] })],
  });
}

// Generic bordered grid: navy header row + data rows + an optional shaded
// total row. Used for every "fill-in" table the canvas defines (competitors,
// suppliers, equipment, repairs, raw materials…). When the dossier carries
// no structured data for a table, `rows` is left as a couple of blank lines
// — mirroring the source form's own empty boxes rather than fabricating
// content that was never supplied.
function gridTable(docxLib: any, headers: string[], rows: string[][], totalRow?: string[]) {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } = docxLib;
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const headerRow = new TableRow({ children: headers.map(h => new TableCell({ shading: { fill: "0F2233" },
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 17 })] })] })) });
  const dataRows = rows.map(r => new TableRow({ children: r.map(v => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: v || "", size: 17 })] })] })) }));
  const footRow = totalRow ? [new TableRow({ children: totalRow.map(v => new TableCell({ shading: { fill: "EDEDED" },
    children: [new Paragraph({ children: [new TextRun({ text: v, bold: true, size: 17 })] })] })) })] : [];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [headerRow, ...dataRows, ...footRow],
  });
}

function blankRows(cols: number, count: number): string[][] {
  return Array.from({ length: count }, () => Array.from({ length: cols }, () => ""));
}

// Checkbox-style option list (☑/☐), matching the canvas's own checkbox
// fields. `checkedKey` is null when the dossier carries no basis for ticking
// any box — left all-empty rather than guessed, exactly like the source
// form's blank state.
function checklist(docxLib: any, options: { key: string; label: string }[], checkedKey: string | null) {
  const { Paragraph, TextRun } = docxLib;
  return options.map(o => new Paragraph({
    children: [new TextRun({ text: `${o.key === checkedKey ? "☑" : "☐"}  ${o.label}`, size: 19, bold: o.key === checkedKey })],
    spacing: { after: 60 },
  }));
}

// Loose keyword match from a project's free-text sector onto the canvas's 7
// broad theme checkboxes (health/education/agriculture/crafts/industry/
// services/other) — independent from finance.ts's mapSectorToKey, which
// targets the much finer sector-benchmark keys, not this coarse grouping.
function mapToTheme(sector?: string): string {
  const s = (sector || "").toLowerCase();
  if (/sant|صحة|pharma|médic/.test(s)) return "themeHealth";
  if (/educ|enseign|formation|تربية|تعليم|تكوين/.test(s)) return "themeEducation";
  if (/agri|élevage|elevage|pêche|peche|فلاح|زراع|صيد/.test(s)) return "themeAgriculture";
  if (/artisan|couture|coiffure|حرف|خياطة|حلاقة|تطريز/.test(s)) return "themeCrafts";
  if (/industr|btp|maçon|maconnerie|صناع|بناء/.test(s)) return "themeIndustry";
  if (/service|commerce|restaur|tourisme|numéri|numeri|informati|خدم|تجار|مطعم|سياح/.test(s)) return "themeServices";
  return "themeOther";
}

// Cover page: holder/project identity fields in shaded boxes, program title
// centered above them — no external crest, no préfecture name.
function businessPlanCover(docxLib: any, data: DossierData, lang: Lang, logoBytes?: Uint8Array) {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType } = docxLib;
  const { proj, profile, name } = data;
  const holderName = `${profile?.firstName || name || ""} ${profile?.lastName || ""}`.trim();
  const logo = logoBytes ? [new Paragraph({
    children: [new ImageRun({ data: logoBytes, type: "png", transformation: { width: 90, height: 90 } })],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  })] : [];
  const fieldBox = (label: string, value: string) => [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [new TableCell({ shading: { fill: "EEF2FA" },
        children: [new Paragraph({ children: [new TextRun({ text: `${label} : ${value || ""}`, bold: true, size: 19 })] })] })] })],
    }),
    new Paragraph({ text: "", spacing: { after: 120 } }),
  ];
  return [
    ...logo,
    new Paragraph({ text: tr("businessPlan", lang), heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new TextRun({ text: tr("programTitle", lang), bold: true, size: 24, color: "2A5CE0" })],
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 } }),
    new Paragraph({ children: [new TextRun({ text: tr("programPillar", lang), italics: true, size: 20, color: "444444" })],
      alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
    ...fieldBox(tr("porteur", lang), holderName),
    ...fieldBox(tr("nomProjet", lang), proj?.projectName || ""),
    ...fieldBox(tr("secteur", lang), proj?.sector || ""),
    ...fieldBox(tr("localisation", lang), proj?.location || ""),
  ];
}

export async function buildBusinessPlanDoc(docxLib: any, data: DossierData, lang: Lang, isAssumed: boolean, logoBytes?: Uint8Array) {
  const { Document, Paragraph, TextRun, Packer } = docxLib;
  const { proj, plan, budget, profile } = data;

  // Equipment lines don't necessarily add up to the project's full funded
  // cost (salaries, raw materials, rent aren't "items") — so the funding
  // split (indh/apport) is the source of truth for the project's total
  // cost, and itemsTotal (what the equipment table actually sums) stays a
  // separate, independent figure. Deriving the investment table's total as
  // indh+apport keeps its percentages always summing to 100%, even when a
  // coordinator has manually overridden the INDH amount away from the
  // items-sum (CoordDash's "ajuster le montant INDH").
  const itemsTotal = budget?.items?.reduce((s, x) => s + (x.total || 0), 0) || 0;
  const fallbackTotal = itemsTotal || proj?.estimatedBudget || 0;
  const indh = budget?.indhContribution ?? Math.min(Math.round(fallbackTotal * 0.9), 100_000);
  const apport = budget?.beneficiaryContribution ?? (fallbackTotal - indh);
  const total = indh + apport;
  const indhPct = total ? Math.round((indh / total) * 100) : 90;
  const apportPct = total ? 100 - indhPct : 10;

  const themeOptions = [
    { key: "themeHealth", label: tr("themeHealth", lang) },
    { key: "themeEducation", label: tr("themeEducation", lang) },
    { key: "themeAgriculture", label: tr("themeAgriculture", lang) },
    { key: "themeCrafts", label: tr("themeCrafts", lang) },
    { key: "themeServices", label: tr("themeServices", lang) },
    { key: "themeIndustry", label: tr("themeIndustry", lang) },
    { key: "themeOther", label: tr("themeOther", lang) },
  ];
  const statusOptions = [
    { key: "statusNotStarted", label: tr("statusNotStarted", lang) },
    { key: "statusInProgress", label: tr("statusInProgress", lang) },
    { key: "statusDone", label: tr("statusDone", lang) },
  ];

  const descDetailedText = plan?.executiveSummary || composePresentation(proj);
  const beneficiariesText = [proj?.targetProfile, proj?.beneficiaries ? `${tr("beneficiaires", lang)}: ${proj.beneficiaries}` : ""]
    .filter(Boolean).join(" — ");
  const marketingText = [plan?.marketAnalysis, plan?.businessModel].filter(Boolean).join(" ");

  const productRows = (budget?.items || []).map(it => [it.item || "", it.category || "",
    it.unitPrice != null ? `${Number(it.unitPrice).toLocaleString()} MAD` : ""]);

  const equipHeaders = [tr("equipmentMachinery", lang), tr("qte", lang), tr("prixUnit", lang), tr("total", lang), tr("role", lang)];
  const equipRows = (budget?.items || []).map(it => [it.item || "", String(it.quantity ?? 1),
    it.unitPrice != null ? `${Number(it.unitPrice).toLocaleString()} MAD` : "", `${Number(it.total || 0).toLocaleString()} MAD`, it.category || ""]);
  const equipTotal = [tr("total", lang), "", "", `${itemsTotal.toLocaleString()} MAD`, ""];

  const professionLabel = lang === "ar" ? "المهنة" : lang === "fr" ? "Métier" : "Profession";
  const hrHeaders = [professionLabel,
    `${tr("year1", lang)} — ${tr("headcount", lang)}`, `${tr("year1", lang)} — ${tr("salaryMonthly", lang)}`,
    `${tr("year2", lang)} — ${tr("headcount", lang)}`, `${tr("year2", lang)} — ${tr("salaryMonthly", lang)}`,
    `${tr("year3", lang)} — ${tr("headcount", lang)}`, `${tr("year3", lang)} — ${tr("salaryMonthly", lang)}`];
  const hrRows = [[tr("staffPermanent", lang), "", "", "", "", "", ""], [tr("staffSeasonal", lang), "", "", "", "", "", ""]];
  const hrTotal = [tr("total", lang), "0", "", "0", "", "0", ""];

  const salesHeaders = [tr("productService", lang), `${tr("quantity", lang)} — ${tr("year1", lang)}`,
    `${tr("quantity", lang)} — ${tr("year2", lang)}`, `${tr("quantity", lang)} — ${tr("year3", lang)}`, tr("unitPriceF", lang),
    `${tr("annualTotal", lang)} — ${tr("year1", lang)}`, `${tr("annualTotal", lang)} — ${tr("year2", lang)}`, `${tr("annualTotal", lang)} — ${tr("year3", lang)}`];
  const y1 = plan?.projections?.year1, y2 = plan?.projections?.year2, y3 = plan?.projections?.year3;
  const salesTotal = [tr("total", lang), "", "", "", "",
    y1 != null ? `${Number(y1).toLocaleString()} MAD` : "", y2 != null ? `${Number(y2).toLocaleString()} MAD` : "", y3 != null ? `${Number(y3).toLocaleString()} MAD` : ""];

  const profitHeaders = ["", tr("year1", lang), tr("year2", lang), tr("year3", lang)];
  const profitRows = [
    [tr("turnoverLine", lang), y1 != null ? `${Number(y1).toLocaleString()}` : "", y2 != null ? `${Number(y2).toLocaleString()}` : "", y3 != null ? `${Number(y3).toLocaleString()}` : ""],
    [tr("expStaff", lang), "", "", ""], [tr("expUtilities", lang), "", "", ""],
    [tr("expRent", lang), "", "", ""], [tr("expRawMaterials", lang), "", "", ""],
  ];
  const profitTotal = [tr("expensesTotal", lang), "", "", ""];

  const doc = new Document({ sections: [{ children: [
    ...businessPlanCover(docxLib, data, lang, logoBytes),

    sectionBar(docxLib, tr("holderInfo", lang)),
    infoTable(docxLib, [
      [tr("firstNameF", lang), profile?.firstName || data.name || ""],
      [tr("lastNameF", lang), profile?.lastName || ""],
      [tr("cinF", lang), profile?.cin || ""],
      [tr("dobF", lang), profile?.birthDate || ""],
      [tr("phoneF", lang), profile?.phone || ""],
      [tr("emailF", lang), profile?.email || ""],
      [tr("eduF", lang), profile?.edu || ""],
    ]),
    spacer(docxLib),
    sectionBar(docxLib, tr("mainTheme", lang)),
    ...checklist(docxLib, themeOptions, proj?.sector ? mapToTheme(proj.sector) : null),
    spacer(docxLib),

    sectionBar(docxLib, tr("projectStatus", lang)),
    ...checklist(docxLib, statusOptions, null),
    spacer(docxLib),
    sectionBar(docxLib, tr("descDetailed", lang)), ...body(docxLib, descDetailedText),
    sectionBar(docxLib, tr("contextInnovation", lang)), ...body(docxLib, plan?.solution),
    sectionBar(docxLib, tr("beneficiariesWho", lang)), ...body(docxLib, beneficiariesText),
    sectionBar(docxLib, tr("developmentDesc", lang)), ...body(docxLib, plan?.operationalPlan),

    sectionBar(docxLib, tr("feasibilityStudy", lang)),
    spacer(docxLib),
    sectionBar(docxLib, tr("marketStudy", lang)),
    spacer(docxLib),
    sectionBar(docxLib, tr("competitors", lang)),
    gridTable(docxLib, [tr("compName", lang), tr("compStrength", lang), tr("compWeakness", lang), tr("compPrice", lang)], blankRows(4, 2)),
    spacer(docxLib),
    sectionBar(docxLib, tr("targetCustomers", lang)), ...body(docxLib, proj?.targetProfile),
    sectionBar(docxLib, tr("suppliers", lang)),
    gridTable(docxLib, [tr("supplierName", lang), tr("supplierDesc", lang), tr("supplierWhy", lang)], blankRows(3, 2)),
    spacer(docxLib),
    sectionBar(docxLib, tr("productPricing", lang)),
    gridTable(docxLib, [tr("products", lang), tr("services", lang), tr("price", lang)], productRows.length ? productRows : blankRows(3, 2)),
    spacer(docxLib),
    sectionBar(docxLib, tr("marketingStrategy", lang)), ...body(docxLib, marketingText),

    sectionBar(docxLib, tr("projectSupplies", lang)),
    spacer(docxLib),
    sectionBar(docxLib, tr("equipmentMachinery", lang)),
    gridTable(docxLib, equipHeaders, equipRows, equipRows.length ? equipTotal : undefined),
    spacer(docxLib),
    sectionBar(docxLib, tr("projectPremises", lang)),
    infoTable(docxLib, [
      [tr("projectPremises", lang), proj?.location || ""],
      [tr("premisesArea", lang), ""],
      [tr("rentMonthly", lang), ""],
      [tr("rentYearly", lang), ""],
    ]),
    spacer(docxLib),
    sectionBar(docxLib, tr("repairs", lang)),
    gridTable(docxLib, [tr("repairs", lang), tr("repairCost", lang)], blankRows(2, 2), [tr("total", lang), "0"]),
    spacer(docxLib),

    sectionBar(docxLib, tr("operatingExpenses", lang)),
    spacer(docxLib),
    sectionBar(docxLib, tr("humanResources", lang)),
    gridTable(docxLib, hrHeaders, hrRows, hrTotal),
    spacer(docxLib),
    sectionBar(docxLib, tr("rawMaterials", lang)),
    gridTable(docxLib, [tr("products", lang), tr("qte", lang), tr("prixUnit", lang), tr("total", lang)], blankRows(4, 2), [tr("total", lang), "", "", "0"]),
    spacer(docxLib),

    sectionBar(docxLib, tr("financialStudy", lang)),
    spacer(docxLib),
    sectionBar(docxLib, tr("annualSales", lang)),
    gridTable(docxLib, salesHeaders, blankRows(8, 1), salesTotal),
    spacer(docxLib),
    sectionBar(docxLib, tr("annualProfits", lang)),
    gridTable(docxLib, profitHeaders, profitRows, profitTotal),
    spacer(docxLib),
    sectionBar(docxLib, tr("totalInvestment", lang)),
    infoTable(docxLib, [
      [tr("fundingTotal", lang), `${total.toLocaleString()} MAD (100%)`],
      [tr("indhFundingSupport", lang), `${indh.toLocaleString()} MAD (${indhPct}%)`],
      [tr("requiredContribution", lang), `${apport.toLocaleString()} MAD (${apportPct}%)`],
    ]),

    ...(plan?.risks?.length || plan?.indh_alignment ? [
      spacer(docxLib),
      ...(plan?.indh_alignment ? [sectionBar(docxLib, tr("alignementIndh", lang)), ...body(docxLib, plan.indh_alignment)] : []),
      ...(plan?.risks?.length ? [sectionBar(docxLib, tr("risques", lang)),
        ...plan.risks.map(r => new Paragraph({ children: [new TextRun({ text: `• ${r}`, size: 20 })], spacing: { after: 100 } }))] : []),
    ] : []),
    ...assumptionNote(docxLib, lang, isAssumed),
  ] }] });
  return Packer.toBlob(doc);
}
