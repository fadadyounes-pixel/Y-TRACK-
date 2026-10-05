"use client";

import { useState, useRef, useEffect } from "react";
import { HOLDER_QUESTIONS } from "@/lib/ideamap/dossier/questions";
import { buildFicheProjetDoc, buildFicheTechniqueDoc, buildBusinessPlanDoc, type DossierData, type Lang as DocxLang } from "@/lib/ideamap/dossier/generators";

/* ── CSS injection ──────────────────────────────────── */
function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("idm")) return;
  const el = document.createElement("style");
  el.id = "idm";
  el.textContent = [
    "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&display=swap');",
    "*{box-sizing:border-box;margin:0;padding:0}",
    "html,body,#root{height:100%;width:100%}",
    "body{font-family:'Poppins',sans-serif;background:#0A0F2C;color:#10132A}",
    "::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2A5CE0;border-radius:4px}",
    "@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}",
    "@keyframes im-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
    "@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}",
    "@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}",
    "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}",
    "@keyframes toastIn{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}",
    ".fadeUp{animation:fadeUp .35s ease both}",
    ".im-rise{animation:im-rise .45s ease both}",
    ".shake{animation:shake .35s ease}",
    ".busy-pulse{animation:pulse 1.4s ease infinite}",
    "@media(max-width:520px){.budget-tbl{display:none!important}.budget-cards{display:flex!important}}",
    ".login-cont-btn:hover:not(:disabled){background:#141B45!important}",
    "button{cursor:pointer;font-family:inherit;border:none;transition:all .18s}",
    "button:active{transform:scale(.96)!important}",
    "input,select,textarea{font-family:inherit}",
    "input:focus,select:focus,textarea:focus{outline:none;box-shadow:0 0 0 3px rgba(42,92,224,.15);border-color:#2A5CE0!important}",
    // Primary CTA buttons — resting shadow + a small lift on hover for real depth
    "button.im-primary{box-shadow:0 4px 14px rgba(42,92,224,.22)}",
    "button.im-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 22px rgba(42,92,224,.32)}",
    "button.im-primary:active:not(:disabled){transform:translateY(0) scale(.98)!important}",
    // Cards — soft layered elevation instead of a near-invisible hairline shadow
    ".im-card{transition:box-shadow .25s ease,transform .25s ease}",
    // Print styles — hide chrome, expand content, force white background for PDF output
    "@media print{",
    "header,nav,.no-print,[data-noprint]{display:none!important}",
    "body{background:#fff!important;color:#10132A!important}",
    ".fadeUp,.im-rise{animation:none!important}",
    "*{box-shadow:none!important}",
    "a{text-decoration:none;color:#10132A}",
    "@page{margin:14mm 12mm}",
    "}",
    // Hover micro-interactions for cards and list rows
    ".im-card-row:hover{background:#F0F1F5!important}",
    ".im-holder-row:hover{background:#EFF6FF!important}",
    // Dashboard sidebar — mobile drawer (slides in from left, fixed overlay)
    "@media(max-width:768px){",
    ".dash-sidebar{position:fixed!important;z-index:300!important;top:0;left:0;height:100vh!important;transform:translateX(-260px);transition:transform .28s cubic-bezier(.4,0,.2,1)}",
    ".dash-sidebar.dsb-open{transform:translateX(0)!important;box-shadow:4px 0 32px rgba(10,15,44,.25)!important}",
    ".dash-topbar{display:flex!important}",
    "}",
    "@media(min-width:769px){.dash-topbar{display:none!important}}",
    // ProgRow — hide future step labels on small screens (keep ✓ + current step name only)
    "@media(max-width:520px){.prog-fut{visibility:hidden}}",
  ].join("");
  document.head.appendChild(el);
}

/* ── BRAND ──────────────────────────────────────────── */
const Y   = "#2A5CE0";   // Blue accent  — secondary data, links, charts
const YD  = "#1E3A8A";   // Blue dark    — gradient end
const YL  = "#EFF6FF";   // Blue light   — backgrounds, selected states
const N   = "#10132A";   // Ink          — body text
const ND  = "#0A0F2C";   // Navy primary — buttons, headings, active states
const NVH = "#141B45";   // Navy hover   — button hover state
const NB  = "rgba(255,255,255,.07)";
const CR  = "#F7F8FA";   // Page bg      — dashboard background
const IF  = "#F5F6F8";   // Input fill   — text input backgrounds
const THS = "#FAFBFC";   // Table stripe — header rows, zebra striping
const CD  = "#E4E7ED";   // Card border  — dividers, card borders
const DV  = "#DDE0E8";   // Divider      — input borders on white/cream
const WH  = "#FFFFFF";
const GR  = "#5B6178";   // Muted gray   — secondary text, labels
const GN  = "#1C7A62";   // Success      — eligible, positive indicators
const RE  = "#C0632F";   // Warning      — errors, "En cours", risk indicators

/* Logo appears only on the login page via /logo-transparent.png */

/* ── AUTH ────────────────────────────────────────────── */
const ADMIN_CODE = "@mapadmin";
const RE_HOLDER  = /^[A-Z]{2}\d{3,}$/;
const RE_COORD   = /^@[A-Za-z]{2,}COD$/i;

// Coordinator entries are stored as {code, name, region, arrondissement, createdAt}.
// Older records (or the very first save this session) may still be a bare code
// string — these helpers normalize either shape so the rest of the app never has
// to branch on it.
type CoordQuestion = {fr: string; ar: string; en: string};
type Coord = {code: string; name: string; region: string; arrondissement: string; createdAt: number | null; questionnaire?: CoordQuestion[]};
const normalizeCoord = (c: any): Coord =>
  typeof c === "string"
    ? {code: c, name: c.replace(/^@/, "").replace(/COD$/i, ""), region: "", arrondissement: "", createdAt: null}
    : {code: c.code, name: c.name || c.code.replace(/^@/, "").replace(/COD$/i, ""), region: c.region || "", arrondissement: c.arrondissement || "", createdAt: c.createdAt ?? null,
       questionnaire: Array.isArray(c.questionnaire) && c.questionnaire.length > 0 ? c.questionnaire : undefined};

// Runs async tasks with at most `limit` in flight at once, preserving each task's
// result at its original index. Used to cap how many AI calls one user's action fires
// simultaneously — each call already races ~10 providers server-side, so an unbounded
// Promise.all over N calls multiplies that fan-out by N. At high concurrent-user load
// that multiplication is what actually exhausts shared free-tier rate limits across
// everyone at once, so bounding it per-user keeps the system stable under many users
// without meaningfully slowing any single user down.
async function runLimited<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({length: Math.min(limit, tasks.length)}, worker));
  return results;
}

function detectRole(raw: string) {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (v === ADMIN_CODE) return "admin";
  if (RE_COORD.test(v))  return "coord";
  if (RE_HOLDER.test(v)) return "holder";
  return "unknown";
}

/* ── CONSTANTS ──────────────────────────────────────── */
const REGIONS = [
  "Tanger-Tétouan-Al Hoceïma","Oriental","Fès-Meknès",
  "Rabat-Salé-Kénitra","Béni Mellal-Khénifra","Casablanca-Settat",
  "Marrakech-Safi","Drâa-Tafilalet","Souss-Massa",
  "Guelmim-Oued Noun","Laâyoune-Sakia El Hamra","Dakhla-Oued Ed-Dahab",
];
const SECTORS = [
  "Agriculture/Élevage","Artisanat traditionnel","Commerce/Épicerie",
  "Agro-alimentaire","Restauration/Café","Coiffure/Beauté",
  "Couture/Vêtement traditionnel","Impression/Reprographie",
  "Design graphique/Communication","Numérique/TIC",
  "Tourisme rural/Guide","BTP/Maçonnerie",
  "Éducation/Formation","Pêche/Aquaculture",
  "Transport/Logistique","Santé/Pharmacie",
  "Réparation/Maintenance","Événementiel/Traiteur",
];
const PROJ_TYPES: Record<string, string[]> = {
  fr:["Individuel","Groupe informel"],
  ar:["فردي","مجموعة غير رسمية"],
  en:["Individual","Informal group"],
};
const MARITAL: Record<string, string[]> = {
  fr:["Célibataire","Marié(e)","Divorcé(e)","Veuf/Veuve"],
  ar:["أعزب/عزباء","متزوج/ة","مطلق/ة","أرمل/ة"],
  en:["Single","Married","Divorced","Widowed"],
};
const EDU: Record<string, string[]> = {
  fr:["Collège","Bac","Bac+2","Bac+3","Bac+5","Doctorat"],
  ar:["إعدادي","باكالوريا","بكالوريا+2","إجازة","ماستر","دكتوراه"],
  en:["Lower secondary","Bac","Bac+2","Bachelor (Bac+3)","Master (Bac+5)","PhD"],
};
const OCCUPATION: Record<string, string[]> = {
  fr:["Étudiant(e)","Demandeur d'emploi","Salarié(e)","Travailleur indépendant","Retraité(e)","Sans activité"],
  ar:["طالب/ة","باحث عن عمل","موظف/ة","عامل مستقل","متقاعد/ة","بدون نشاط"],
  en:["Student","Job seeker","Employed","Self-employed","Retired","Inactive"],
};
// An individual INDH project holder signs a funding convention themselves,
// so they must be a legal adult (18+ in Morocco) — no bracket under 18 is
// offered here, unlike a generic demographic form.
const AGES = ["18–20","21–24","25–30","31–40","40+"];
const GENDERS: Record<string, string[]> = {
  fr:["Homme","Femme","Autre"],
  ar:["ذكر","أنثى","آخر"],
  en:["Male","Female","Other"],
};
// Casablanca-Settat is further split into 8 préfectures d'arrondissements — a
// coordinator or jury needs that level of detail, and "Casablanca-Settat" alone
// is too coarse to be useful. Shown directly once that region is picked.
const ARRONDISSEMENTS_CASA = [
  "Anfa","Aïn Chock","Aïn Sebaâ-Hay Mohammadi","Al Fida-Mers Sultan",
  "Ben M'Sick","Hay Hassani","Moulay Rachid","Sidi Bernoussi",
];

// Sector-specific answer choices for the "products/services" and "main equipment"
// questions in the dialogue flow — shown instantly (no AI call) as real, tappable
// options tied to the sector the porteur already selected at registration, instead
// of a generic "use your best estimate" placeholder. Keyed by the exact SECTORS
// strings above so the lookup is a direct hit from user.profile.sector.
const SECTOR_SERVICES: Record<string, Record<"fr"|"ar"|"en", string[]>> = {
  "Agriculture/Élevage": {
    fr: ["Élevage de volailles ou de bétail pour la vente", "Culture maraîchère et vente de légumes", "Production laitière et dérivés"],
    ar: ["تربية الدواجن أو الماشية للبيع", "زراعة الخضروات وبيعها", "إنتاج الحليب ومشتقاته"],
    en: ["Poultry or livestock farming for sale", "Vegetable growing and sale", "Dairy production and derivatives"],
  },
  "Artisanat traditionnel": {
    fr: ["Poterie et céramique artisanale", "Tapis et tissage traditionnel", "Maroquinerie et cuir artisanal"],
    ar: ["الفخار والخزف التقليدي", "الزرابي والنسيج التقليدي", "صناعة الجلد التقليدية"],
    en: ["Traditional pottery and ceramics", "Traditional rugs and weaving", "Traditional leather goods"],
  },
  "Commerce/Épicerie": {
    fr: ["Épicerie de proximité (produits de base)", "Vente de produits alimentaires et boissons", "Commerce multi-produits"],
    ar: ["بقالة القرب (المنتجات الأساسية)", "بيع المواد الغذائية والمشروبات", "تجارة متعددة المنتجات"],
    en: ["Neighborhood grocery (staples)", "Food and beverage sales", "Multi-product store"],
  },
  "Agro-alimentaire": {
    fr: ["Transformation de produits du terroir (huile, miel...)", "Conserverie et confiture artisanale", "Pâtisserie ou boulangerie traditionnelle"],
    ar: ["تحويل منتجات المجال (زيت، عسل...)", "تعليب ومربى تقليدي", "حلويات أو مخبزة تقليدية"],
    en: ["Processing local produce (oil, honey...)", "Canning and artisan jam", "Traditional pastry or bakery"],
  },
  "Restauration/Café": {
    fr: ["Café populaire ou salon de thé", "Restauration rapide (snack, sandwichs)", "Restaurant traditionnel marocain"],
    ar: ["مقهى شعبي أو صالون شاي", "مطعم وجبات سريعة", "مطعم مغربي تقليدي"],
    en: ["Popular café or tea salon", "Fast food (snack, sandwiches)", "Traditional Moroccan restaurant"],
  },
  "Coiffure/Beauté": {
    fr: ["Coupe de cheveux, taille de barbe et soins", "Coiffure et esthétique pour femmes", "Salon complet (coiffure + soins + produits)"],
    ar: ["قص الشعر وتشذيب اللحية والعناية", "تصفيف الشعر والتجميل للنساء", "صالون متكامل (حلاقة + عناية + منتجات)"],
    en: ["Haircuts, beard trims and grooming", "Hairdressing and beauty for women", "Full salon (hair + skincare + products)"],
  },
  "Couture/Vêtement traditionnel": {
    fr: ["Confection de caftans et vêtements traditionnels", "Couture sur mesure et retouches", "Vente de prêt-à-porter"],
    ar: ["خياطة القفطان والملابس التقليدية", "خياطة حسب الطلب وتصليحات", "بيع الملابس الجاهزة"],
    en: ["Caftans and traditional garment making", "Custom tailoring and alterations", "Ready-to-wear clothing sales"],
  },
  "Impression/Reprographie": {
    fr: ["Impression et photocopie", "Cybercafé et services administratifs", "Impression grand format et enseignes"],
    ar: ["الطباعة والاستنساخ", "سيبر وخدمات إدارية", "طباعة كبيرة الحجم ولافتات"],
    en: ["Printing and photocopying", "Cybercafé and admin services", "Large-format printing and signage"],
  },
  "Design graphique/Communication": {
    fr: ["Création de logos et identité visuelle", "Community management et réseaux sociaux", "Impression publicitaire et flyers"],
    ar: ["تصميم الشعارات والهوية البصرية", "إدارة صفحات التواصل الاجتماعي", "طباعة إعلانية ومنشورات"],
    en: ["Logo and brand identity design", "Social media management", "Advertising print and flyers"],
  },
  "Numérique/TIC": {
    fr: ["Développement de sites web ou d'applications", "Formation en informatique", "Maintenance informatique et réseaux"],
    ar: ["تطوير مواقع أو تطبيقات إلكترونية", "تكوين في مجال المعلوميات", "صيانة معلوماتية وشبكات"],
    en: ["Website or app development", "IT training", "Computer and network maintenance"],
  },
  "Tourisme rural/Guide": {
    fr: ["Guide touristique local", "Gîte ou hébergement rural", "Circuits et randonnées organisées"],
    ar: ["دليل سياحي محلي", "بيت ضيافة أو إيواء قروي", "جولات ومسارات منظمة"],
    en: ["Local tour guiding", "Rural guesthouse or lodging", "Organized tours and hikes"],
  },
  "BTP/Maçonnerie": {
    fr: ["Travaux de maçonnerie générale", "Carrelage et revêtements", "Peinture et finitions bâtiment"],
    ar: ["أشغال البناء العامة", "البلاط والتغطية", "الصباغة وتشطيبات البناء"],
    en: ["General masonry work", "Tiling and flooring", "Painting and building finishing"],
  },
  "Éducation/Formation": {
    fr: ["Soutien scolaire à domicile", "Formation professionnelle courte", "Cours de langues ou d'informatique"],
    ar: ["الدعم المدرسي بالمنزل", "تكوين مهني قصير", "دروس اللغات أو المعلوميات"],
    en: ["Home tutoring", "Short vocational training", "Language or computer classes"],
  },
  "Pêche/Aquaculture": {
    fr: ["Pêche artisanale côtière", "Élevage aquacole (poissons, crevettes)", "Transformation et vente de produits de mer"],
    ar: ["الصيد التقليدي الساحلي", "تربية مائية (أسماك، روبيان)", "تحويل وبيع منتجات البحر"],
    en: ["Small-scale coastal fishing", "Aquaculture farming (fish, shrimp)", "Processing and selling seafood"],
  },
  "Transport/Logistique": {
    fr: ["Transport de marchandises", "Transport de personnes (taxi, navette)", "Livraison et coursier"],
    ar: ["نقل البضائع", "نقل الأشخاص (تاكسي، حافلة)", "التوصيل والسعي"],
    en: ["Goods transport", "Passenger transport (taxi, shuttle)", "Delivery and courier service"],
  },
  "Santé/Pharmacie": {
    fr: ["Parapharmacie et produits de santé", "Services de soins à domicile", "Vente de matériel médical"],
    ar: ["صيدلية شبه طبية ومنتجات صحية", "خدمات العناية بالمنزل", "بيع المعدات الطبية"],
    en: ["Parapharmacy and health products", "Home care services", "Medical equipment sales"],
  },
  "Réparation/Maintenance": {
    fr: ["Réparation d'appareils électroménagers", "Réparation de téléphones et électronique", "Mécanique et entretien automobile"],
    ar: ["إصلاح الأجهزة المنزلية", "إصلاح الهواتف والإلكترونيات", "ميكانيك وصيانة السيارات"],
    en: ["Home appliance repair", "Phone and electronics repair", "Auto mechanics and maintenance"],
  },
  "Événementiel/Traiteur": {
    fr: ["Traiteur pour événements et mariages", "Organisation et décoration d'événements", "Location de matériel événementiel"],
    ar: ["تقديم الطعام للمناسبات والأعراس", "تنظيم وتزيين المناسبات", "كراء معدات المناسبات"],
    en: ["Catering for events and weddings", "Event planning and decoration", "Event equipment rental"],
  },
};
const SECTOR_EQUIPMENT: Record<string, Record<"fr"|"ar"|"en", string[]>> = {
  "Agriculture/Élevage": {
    fr: ["Cheptel (animaux) et matériel d'élevage", "Matériel d'irrigation et outils agricoles", "Serre agricole et équipement de culture"],
    ar: ["قطيع (حيوانات) ومعدات التربية", "معدات السقي وأدوات فلاحية", "بيت بلاستيكي ومعدات الزراعة"],
    en: ["Livestock and farming equipment", "Irrigation gear and farm tools", "Greenhouse and growing equipment"],
  },
  "Artisanat traditionnel": {
    fr: ["Métier à tisser ou four de poterie", "Outillage artisanal spécialisé", "Matières premières et matériel de finition"],
    ar: ["نول للنسيج أو فرن للفخار", "أدوات حرفية متخصصة", "مواد أولية ومعدات التشطيب"],
    en: ["Loom or pottery kiln", "Specialized craft tools", "Raw materials and finishing equipment"],
  },
  "Commerce/Épicerie": {
    fr: ["Rayonnages, frigo et caisse enregistreuse", "Stock initial de marchandises", "Aménagement du local commercial"],
    ar: ["رفوف وثلاجة وصندوق تسجيل", "مخزون أولي من البضائع", "تجهيز المحل التجاري"],
    en: ["Shelving, fridge and cash register", "Initial stock of goods", "Fitting out the shop"],
  },
  "Agro-alimentaire": {
    fr: ["Matériel de transformation (presse, four...)", "Emballage et étiquetage", "Chambre froide ou conservation"],
    ar: ["معدات التحويل (معصرة، فرن...)", "التغليف ووضع الملصقات", "غرفة تبريد أو حفظ"],
    en: ["Processing equipment (press, oven...)", "Packaging and labeling", "Cold storage / preservation"],
  },
  "Restauration/Café": {
    fr: ["Cuisine équipée (four, plaques, frigo)", "Mobilier et vaisselle", "Machine à café et matériel de service"],
    ar: ["مطبخ مجهز (فرن، صفيحة، ثلاجة)", "أثاث وأواني", "آلة قهوة ومعدات الخدمة"],
    en: ["Equipped kitchen (oven, hobs, fridge)", "Furniture and tableware", "Coffee machine and service equipment"],
  },
  "Coiffure/Beauté": {
    fr: ["Fauteuils, miroirs et matériel de coiffure", "Stérilisateur UV et matériel d'hygiène", "Tondeuses, sèche-cheveux et accessoires"],
    ar: ["كراسي ومرايا ومعدات الحلاقة", "معقم بالأشعة فوق البنفسجية ومعدات النظافة", "آلات حلاقة ومجفف شعر وإكسسوارات"],
    en: ["Chairs, mirrors and salon equipment", "UV sterilizer and hygiene gear", "Clippers, hairdryers and accessories"],
  },
  "Couture/Vêtement traditionnel": {
    fr: ["Machines à coudre professionnelles", "Tissus et fournitures de couture", "Table de coupe et matériel de finition"],
    ar: ["آلات خياطة احترافية", "أقمشة ولوازم الخياطة", "طاولة قص ومعدات التشطيب"],
    en: ["Professional sewing machines", "Fabrics and sewing supplies", "Cutting table and finishing equipment"],
  },
  "Impression/Reprographie": {
    fr: ["Imprimante ou photocopieur professionnel", "Ordinateur et logiciels de conception", "Matériel de reliure et finition"],
    ar: ["طابعة أو ناسخة احترافية", "حاسوب وبرامج التصميم", "معدات التجليد والتشطيب"],
    en: ["Professional printer/copier", "Computer and design software", "Binding and finishing equipment"],
  },
  "Design graphique/Communication": {
    fr: ["Ordinateur et logiciels de design", "Appareil photo et matériel de prise de vue", "Imprimante et matériel de présentation"],
    ar: ["حاسوب وبرامج التصميم", "كاميرا ومعدات التصوير", "طابعة ومعدات العرض"],
    en: ["Computer and design software", "Camera and shooting equipment", "Printer and presentation equipment"],
  },
  "Numérique/TIC": {
    fr: ["Ordinateurs et matériel informatique", "Connexion internet et serveur", "Logiciels et licences professionnelles"],
    ar: ["حواسيب ومعدات معلوماتية", "اتصال بالأنترنت وخادوم", "برامج ورخص احترافية"],
    en: ["Computers and IT equipment", "Internet connection and server", "Professional software licenses"],
  },
  "Tourisme rural/Guide": {
    fr: ["Véhicule ou matériel de transport touristique", "Équipement d'hébergement ou de gîte", "Matériel de randonnée et sécurité"],
    ar: ["مركبة أو معدات النقل السياحي", "معدات الإيواء أو بيت الضيافة", "معدات التنزه والسلامة"],
    en: ["Vehicle or tourist transport gear", "Lodging/guesthouse equipment", "Hiking and safety equipment"],
  },
  "BTP/Maçonnerie": {
    fr: ["Outillage de maçonnerie (bétonnière...)", "Échafaudage et matériel de sécurité", "Véhicule utilitaire pour le transport"],
    ar: ["أدوات البناء (خلاطة الإسمنت...)", "سقالة ومعدات السلامة", "مركبة نفعية للنقل"],
    en: ["Masonry tools (concrete mixer...)", "Scaffolding and safety equipment", "Utility vehicle for transport"],
  },
  "Éducation/Formation": {
    fr: ["Matériel pédagogique et mobilier", "Ordinateur et supports numériques", "Aménagement d'une salle de formation"],
    ar: ["معدات تربوية وأثاث", "حاسوب وموارد رقمية", "تجهيز قاعة تكوين"],
    en: ["Teaching materials and furniture", "Computer and digital resources", "Fitting out a training room"],
  },
  "Pêche/Aquaculture": {
    fr: ["Barque et matériel de pêche", "Bassins ou cages d'élevage aquacole", "Matériel de conservation du poisson"],
    ar: ["قارب ومعدات الصيد", "أحواض أو أقفاص التربية المائية", "معدات حفظ السمك"],
    en: ["Boat and fishing gear", "Ponds or aquaculture cages", "Fish preservation equipment"],
  },
  "Transport/Logistique": {
    fr: ["Véhicule utilitaire ou taxi", "Matériel de manutention", "Système de suivi des livraisons"],
    ar: ["مركبة نفعية أو تاكسي", "معدات المناولة", "نظام تتبع التوصيل"],
    en: ["Utility vehicle or taxi", "Handling equipment", "Delivery tracking system"],
  },
  "Santé/Pharmacie": {
    fr: ["Aménagement et vitrines de vente", "Matériel médical de base", "Stock initial de produits"],
    ar: ["تجهيز وواجهات البيع", "معدات طبية أساسية", "مخزون أولي من المنتجات"],
    en: ["Fit-out and display shelving", "Basic medical equipment", "Initial product stock"],
  },
  "Réparation/Maintenance": {
    fr: ["Outillage spécialisé de réparation", "Pièces de rechange et stock", "Établi et matériel d'atelier"],
    ar: ["أدوات إصلاح متخصصة", "قطع غيار ومخزون", "منضدة عمل ومعدات الورشة"],
    en: ["Specialized repair tools", "Spare parts stock", "Workbench and workshop equipment"],
  },
  "Événementiel/Traiteur": {
    fr: ["Matériel de cuisine et service traiteur", "Tentes, chaises et décoration", "Véhicule de transport du matériel"],
    ar: ["معدات المطبخ وخدمة التقديم", "خيام وكراسي وديكور", "مركبة لنقل المعدات"],
    en: ["Catering kitchen and service equipment", "Tents, chairs and decoration", "Vehicle to transport equipment"],
  },
};

const DOCS = [
  {id:1,name:"Carte d'Identité Nationale (CIN)",desc:"Copies légalisées de tous les membres",req:true,icon:"🪪"},
  {id:2,name:"Statuts de la structure juridique",desc:"Légalisés et enregistrés",req:true,icon:"📜"},
  {id:3,name:"PV de l'AG constitutive",desc:"Signé par tous les membres",req:true,icon:"📋"},
  {id:4,name:"Récépissé / Immatriculation",desc:"Récépissé (assoc.) ou OMPIC (coopérative)",req:true,icon:"🏛️"},
  {id:5,name:"Attestation de résidence",desc:"Pour chaque membre porteur",req:true,icon:"🏠"},
  {id:6,name:"Devis estimatif détaillé",desc:"Signé et tamponné par les fournisseurs",req:true,icon:"💰"},
  {id:7,name:"Photos du site du projet",desc:"Au moins 5 photos du lieu de réalisation",req:true,icon:"📸"},
  {id:8,name:"Plan d'affaires / Business Plan",desc:"Généré automatiquement par IdeaMap ✓",req:true,icon:"📊"},
  {id:9,name:"CV des membres porteurs",desc:"Expériences et formations",req:false,icon:"👤"},
  {id:10,name:"Lettre de motivation",desc:"Impact social du projet",req:false,icon:"✉️"},
  {id:11,name:"Autorisation Rokhsa.ma",desc:"Si activité réglementée",req:false,icon:"✅"},
  {id:12,name:"Accord de partenariat",desc:"Avec partenaires locaux",req:false,icon:"🤝"},
];

const JURY = [
  {key:"impact",label:"Impact social & bénéficiaires",w:25},
  {key:"viability",label:"Viabilité économique",w:20},
  {key:"relevance",label:"Pertinence territoriale",w:20},
  {key:"management",label:"Capacité de gestion",w:15},
  {key:"sustainability",label:"Durabilité du projet",w:10},
  {key:"innovation",label:"Innovation & originalité",w:10},
];

/* ── TRANSLATIONS ────────────────────────────────────── */
const TX: Record<string, Record<string, string | string[]>> = {
  fr:{
    tagline:"De l'idée au projet financé",
    enter:"Entrez votre identifiant",
    enterHint:"Porteur: CIN (ex: AB123456) · Coordinateur: @NOMCOD · Admin: code admin",
    cinError:"Identifiant non reconnu ou compte coordinateur non créé.",
    login:"Accéder",
    newAccount:"Créer mon compte",
    existingAccount:"J'ai déjà un compte",
    createTitle:"Créer mon compte porteur",
    firstName:"Prénom",
    lastName:"Nom de famille",
    email:"Adresse e-mail",
    phone:"Téléphone",
    age:"Tranche d'âge",
    gender:"Genre",
    marital:"Situation familiale",
    edu:"Niveau d'études",
    occupation:"Situation professionnelle",
    region:"Région",
    arrondissement:"Arrondissement",
    sector:"Secteur d'activité envisagé",
    projType:"Type de porteur",
    photo:"Photo (optionnelle)",
    create:"Créer mon compte →",
    welcome:"Bienvenue,",
    steps:["Idée","Questions","Profil","Plan","Budget","Conformité","Documents","Dossier"],
    ideaT:"Décrivez votre idée de projet",
    ideaH:"Secteur, zone géographique, bénéficiaires ciblés, besoins principaux.",
    ideaP:"Ex: Je veux lancer une activité de transformation de produits du terroir dans ma région...",
    sectorLabel:"Secteurs éligibles INDH",
    next:"Continuer →", loading:"Chargement...",
    dialogT:"Affinons votre projet", dialogS:"Quelques questions ciblées pour structurer votre dossier.",
    ph:"Votre réponse...", send:"Envoyer →",
    q:"Question", of:"sur",
    profileT:"Profil du projet",
    genPlan:"📊 Générer le Plan d'Affaires →",
    planT:"Plan d'Affaires", genBP:"Génération en cours...",
    budgetT:"Budget Prévisionnel", maxB:"Plafond INDH : 100 000 MAD",
    checkBtn:"✅ Analyser la Conformité INDH →",
    compT:"Conformité INDH",
    docsT:"Documents Requis",
    req:"Obligatoires", opt:"Optionnels (recommandés)",
    exportT:"Dossier Prêt !",readiness:"Complétude",
    delivT:"Vos Livrables",processT:"Processus de Soumission",tipsT:"Conseils Jury",
    total:"Total",indhC:"Contribution INDH",benC:"Apport porteur",
    eligible:"Projet éligible au financement INDH !",notElig:"Modifications nécessaires",
    strengths:"Points forts",recs:"Recommandations",
    juryGrid:"Grille d'Évaluation du Jury",
    projected:"Projections Financières (MAD)",risks:"Risques identifiés",
    signIn:"Se connecter",signInSub:"Entrez votre code d'accès pour continuer.",codePh:"Code d'accès",cont:"Continuer",
    logout:"Déconnexion",
    coordDash:"Tableau de bord Coordinateur",
    adminDash:"Tableau de bord Administrateur",
    projects:"Projets",view:"Voir",noProjects:"Aucun projet enregistré.",
    addCoord:"Ajouter un coordinateur",coordCode:"Code coordinateur",add:"Ajouter",
    coordList:"Coordinateurs enregistrés",delete:"Supprimer",
    stats:"Statistiques",totalProj:"Total projets",byRegion:"Par région",bySector:"Par secteur",
    holderInfo:"Informations porteur",progressLabel:"Avancement",
  },
  ar:{
    tagline:"من الفكرة إلى المشروع الممول",
    enter:"أدخل معرّفك",
    enterHint:"حامل المشروع: رقم البطاقة (مثال: AB123456) · المنسق: @NOMCOD · المدير: رمز الإدارة",
    cinError:"المعرّف غير معروف أو لم يتم إنشاء حساب المنسق بعد.",
    login:"دخول",
    newAccount:"إنشاء حسابي",
    existingAccount:"لدي حساب بالفعل",
    createTitle:"إنشاء حساب حامل المشروع",
    firstName:"الاسم الشخصي",
    lastName:"الاسم العائلي",
    email:"البريد الإلكتروني",
    phone:"الهاتف",
    age:"الفئة العمرية",
    gender:"الجنس",
    marital:"الوضع العائلي",
    edu:"المستوى الدراسي",
    occupation:"الوضع المهني",
    region:"الجهة",
    arrondissement:"المقاطعة",
    sector:"قطاع النشاط المنشود",
    projType:"نوع الحامل",
    photo:"الصورة (اختياري)",
    create:"إنشاء الحساب ←",
    welcome:"مرحباً،",
    steps:["الفكرة","الأسئلة","الملف","الخطة","الميزانية","الامتثال","الوثائق","الدوسيي"],
    ideaT:"صف فكرة مشروعك",
    ideaH:"القطاع، المنطقة الجغرافية، المستفيدون المستهدفون، الاحتياجات الرئيسية.",
    ideaP:"مثال: أريد إطلاق نشاط لتحويل المنتجات المحلية في منطقتي...",
    sectorLabel:"القطاعات المؤهلة للمبادرة",
    next:"متابعة ←", loading:"جاري التحميل...",
    dialogT:"لنصقل مشروعك معاً", dialogS:"بعض الأسئلة المستهدفة لهيكلة ملفك.",
    ph:"إجابتك...", send:"← إرسال",
    q:"السؤال", of:"من",
    profileT:"ملف المشروع",
    genPlan:"📊 توليد خطة الأعمال ←",
    planT:"خطة الأعمال", genBP:"جاري الإنشاء...",
    budgetT:"الميزانية التقديرية", maxB:"السقف الأقصى: 100,000 درهم",
    checkBtn:"✅ تحليل الامتثال ←",
    compT:"الامتثال للمبادرة",
    docsT:"الوثائق المطلوبة",
    req:"إلزامية", opt:"اختيارية",
    exportT:"الملف جاهز!",readiness:"اكتمال",
    delivT:"مكونات ملفك",processT:"مسار التقديم",tipsT:"نصائح اللجنة",
    total:"المجموع",indhC:"مساهمة المبادرة",benC:"مساهمة الحامل",
    eligible:"مشروعك مؤهل للتمويل!",notElig:"يحتاج إلى تعديلات",
    strengths:"نقاط القوة",recs:"التوصيات",
    juryGrid:"معايير التحكيم",
    projected:"التوقعات المالية (درهم)",risks:"المخاطر",
    signIn:"تسجيل الدخول",signInSub:"أدخل رمز الدخول للمتابعة.",codePh:"رمز الدخول",cont:"متابعة",
    logout:"خروج",
    coordDash:"لوحة تحكم المنسق",
    adminDash:"لوحة تحكم المدير",
    projects:"المشاريع",view:"عرض",noProjects:"لا توجد مشاريع مسجلة.",
    addCoord:"إضافة منسق",coordCode:"رمز المنسق",add:"إضافة",
    coordList:"المنسقون المسجلون",delete:"حذف",
    stats:"إحصاءات",totalProj:"مجموع المشاريع",byRegion:"حسب الجهة",bySector:"حسب القطاع",
    holderInfo:"معلومات الحامل",progressLabel:"التقدم",
  },
  en:{
    tagline:"From idea to funded project",
    enter:"Enter your identifier",
    enterHint:"Holder: CIN (e.g. AB123456) · Coordinator: @LASTNAMECOD · Admin: admin code",
    cinError:"Unrecognized identifier or coordinator account not yet created.",
    login:"Sign In",
    newAccount:"Create my account",
    existingAccount:"I already have an account",
    createTitle:"Create project holder account",
    firstName:"First name",
    lastName:"Last name",
    email:"Email address",
    phone:"Phone",
    age:"Age range",
    gender:"Gender",
    marital:"Marital status",
    edu:"Education level",
    occupation:"Occupation status",
    region:"Region",
    arrondissement:"District",
    sector:"Target sector",
    projType:"Holder type",
    photo:"Photo (optional)",
    create:"Create account →",
    welcome:"Welcome,",
    steps:["Idea","Questions","Profile","Plan","Budget","Compliance","Documents","File"],
    ideaT:"Describe your project idea",
    ideaH:"Sector, geographic zone, target beneficiaries, main needs.",
    ideaP:"E.g. I want to launch a local product processing activity in my region...",
    sectorLabel:"Eligible INDH sectors",
    next:"Continue →", loading:"Loading...",
    dialogT:"Let's refine your project", dialogS:"A few targeted questions to structure your application.",
    ph:"Your answer...", send:"Send →",
    q:"Question", of:"of",
    profileT:"Project Profile",
    genPlan:"📊 Generate Business Plan →",
    planT:"Business Plan", genBP:"Generating...",
    budgetT:"Budget Forecast", maxB:"INDH ceiling: 100,000 MAD",
    checkBtn:"✅ Check INDH Compliance →",
    compT:"INDH Compliance",
    docsT:"Required Documents",
    req:"Required", opt:"Optional",
    exportT:"Application Ready!",readiness:"Completion",
    delivT:"Your Deliverables",processT:"Submission Process",tipsT:"Jury Tips",
    total:"Total",indhC:"INDH Contribution",benC:"Holder contribution",
    eligible:"Project eligible for INDH funding!",notElig:"Modifications needed",
    strengths:"Strengths",recs:"Recommendations",
    juryGrid:"Jury Evaluation Grid",
    projected:"Financial Projections (MAD)",risks:"Identified risks",
    signIn:"Sign in",signInSub:"Enter your access code to continue.",codePh:"Access code",cont:"Continue",
    logout:"Sign out",
    coordDash:"Coordinator Dashboard",
    adminDash:"Admin Dashboard",
    projects:"Projects",view:"View",noProjects:"No registered projects.",
    addCoord:"Add coordinator",coordCode:"Coordinator code",add:"Add",
    coordList:"Registered coordinators",delete:"Delete",
    stats:"Statistics",totalProj:"Total projects",byRegion:"By region",bySector:"By sector",
    holderInfo:"Holder information",progressLabel:"Progress",
  },
};

/* ── SHARED UI ───────────────────────────────────────── */
const ff = (lang: string) => lang === "ar" ? "'Tajawal',sans-serif" : "'Poppins',sans-serif";

// Casablanca-Settat is further split into 8 préfectures d'arrondissements (see
// ARRONDISSEMENTS_CASA) — "Casablanca-Settat" alone is too coarse to be useful
// for a jury or a coordinator. Show the most precise level available wherever a
// holder's location is displayed.
const regionDisplay = (profile?: {region?: string; prefecture?: string; arrondissement?: string}): string => {
  if (!profile?.region) return "";
  const parts = [profile.region, profile.prefecture, profile.arrondissement].filter(Boolean);
  return parts.join(" — ");
};

const Btn = ({children, onClick, disabled, outline, small, style = {}}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  outline?: boolean; small?: boolean; style?: React.CSSProperties;
}) => (
  <button onClick={onClick} disabled={disabled} className={outline ? "" : "im-primary"} style={{
    background: outline ? "transparent" : `linear-gradient(135deg,${Y},${YD})`,
    color: outline ? N : ND, border: outline ? `2px solid ${N}` : "none",
    borderRadius: "12px", padding: small ? "8px 16px" : "14px 24px",
    fontSize: small ? "12px" : "14px", fontWeight: "700",
    opacity: disabled ? .5 : 1, width: "100%", ...style
  }}>{children}</button>
);

const Card = ({children, style = {}, onClick}: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) => (
  <div onClick={onClick} className="im-card" style={{background: WH, borderRadius: "18px", padding: "24px",
    boxShadow: "0 1px 2px rgba(10,15,44,.04), 0 10px 30px rgba(10,15,44,.06)", marginBottom: "16px",
    border: `1px solid ${CD}`, ...style}}>
    {children}
  </div>
);

const PBar = ({pct, h = 6, color = Y}: { pct: number; h?: number; color?: string }) => (
  <div style={{height: `${h}px`, background: CD, borderRadius: "4px", overflow: "hidden"}}>
    <div style={{height: "100%", borderRadius: "4px", background: color,
      width: `${Math.min(pct, 100)}%`, transition: "width .5s ease"}}/>
  </div>
);

const AccBar = () => <div style={{width: "4px", height: "20px", background: Y, borderRadius: "2px", flexShrink: 0}}/>;

/* ── VOICE BUTTON ───────────────────────────────────── */
// Uses Groq Whisper free tier (2 000 req/day) — auto-detects Arabic, French, Darija.
// Mic button appears next to the idea textarea; tap to record, tap again to stop & transcribe.
function VoiceBtn({lang, onText, onError}: {lang: string; onText: (t: string) => void; onError: (e: string) => void}) {
  const [rec, setRec]       = useState(false);
  const [busy, setBusy]     = useState(false);
  const [secs, setSecs]     = useState(0);
  const mrRef      = useRef<MediaRecorder | null>(null);
  const chunks     = useRef<Blob[]>([]);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const MAX_SECS   = 60;

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const mr = new MediaRecorder(stream, mimeType ? {mimeType} : {});
      chunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (!mountedRef.current) return; // component unmounted — skip state updates
        setSecs(0);
        setBusy(true);
        try {
          const blob = new Blob(chunks.current, {type: mimeType || "audio/webm"});
          const fd = new FormData();
          fd.append("audio", blob);
          fd.append("lang", lang);
          const r = await fetch("/api/ai/transcribe", {method: "POST", body: fd});
          const d = await r.json();
          if (d.text) onText(d.text);
          else onError(lang==="ar"?"فشل التعرف على الكلام":lang==="fr"?"Transcription échouée":"Transcription failed");
        } catch {
          onError(lang==="ar"?"خطأ في الشبكة":lang==="fr"?"Erreur réseau":"Network error");
        }
        setBusy(false);
      };
      mr.start();
      mrRef.current = mr;
      setRec(true);
      setSecs(0);
      // Auto-stop at MAX_SECS with live countdown
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setSecs(elapsed);
        if (elapsed >= MAX_SECS) stop();
      }, 1000);
    } catch {
      onError(lang==="ar"?"يرجى السماح بالوصول إلى الميكروفون":lang==="fr"?"Autorisez l'accès au micro":"Allow microphone access");
    }
  };

  const stop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    mrRef.current?.stop(); mrRef.current = null; setRec(false);
  };

  // Cleanup on unmount: mark as unmounted first so onstop handler skips setState,
  // then stop the recording and cancel the countdown timer.
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      try { mrRef.current?.stop(); } catch {}
    };
  }, []);

  const recLabel = rec
    ? `${lang==="ar"?"⏹ إيقاف":lang==="fr"?"⏹ Arrêter":"⏹ Stop"} ${MAX_SECS - secs}s`
    : (lang==="ar"?"تحدث عن فكرتك 🎤":lang==="fr"?"Parlez votre idée 🎤":"Speak your idea 🎤");
  const label = busy
    ? (lang==="ar"?"جاري التحويل...":lang==="fr"?"Transcription...":"Transcribing...")
    : recLabel;
  const nearLimit = rec && secs >= MAX_SECS - 10;

  return (
    <button
      onClick={rec ? stop : start}
      disabled={busy}
      title={label}
      style={{
        display:"flex", alignItems:"center", gap:"6px",
        padding:"10px 14px", borderRadius:"11px",
        border:`1.5px solid ${nearLimit ? "#C0632F" : rec ? "#EF4444" : Y}`,
        background: nearLimit ? "#FFF5EC" : rec ? "#FFF0F0" : YL,
        color: nearLimit ? "#C0632F" : rec ? "#EF4444" : ND,
        fontSize:"12px", fontWeight:"700", cursor: busy ? "wait" : "pointer",
        fontFamily:"inherit", opacity: busy ? 0.7 : 1, transition:"all .2s",
        animation: rec ? "pulse 1.4s ease infinite" : "none",
      }}>
      <span style={{fontSize:"15px"}}>{busy ? "⏳" : rec ? "⏹" : "🎤"}</span>
      <span style={{whiteSpace:"nowrap"}}>{label}</span>
    </button>
  );
}

const Dots = () => (
  <div style={{display: "flex", gap: "5px", padding: "6px 0"}}>
    {[0, 1, 2].map(i => <div key={i} style={{width: "8px", height: "8px", borderRadius: "50%",
      background: Y, animation: `bounce 1s ease ${i * .2}s infinite`}}/>)}
  </div>
);

const Toast = ({msg, type, onClose}: {msg: string; type: "error"|"success"; onClose: () => void}) => (
  <div style={{position:"fixed", bottom:22, left:"50%", transform:"translateX(-50%)", zIndex:9999,
    padding:"13px 18px", borderRadius:"14px", maxWidth:"360px", width:"calc(100% - 40px)",
    background: type === "error" ? RE : GN, color:WH, fontSize:"13px", fontWeight:"600",
    boxShadow:"0 8px 32px rgba(0,0,0,.3)", display:"flex", alignItems:"center", gap:"10px",
    animation:"toastIn .3s ease"}}>
    <span style={{fontSize:"18px"}}>{type === "error" ? "⚠️" : "✅"}</span>
    <span style={{flex:1, lineHeight:1.4}}>{msg}</span>
    <button onClick={onClose} style={{background:"rgba(255,255,255,.2)", border:"none", color:WH,
      fontSize:"14px", cursor:"pointer", padding:"2px 7px", borderRadius:"6px", flexShrink:0}}>×</button>
  </div>
);

const AnimatedScore = ({score, eligible}: {score: number; eligible: boolean}) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(score / 45));
    const id = setInterval(() => {
      cur += step;
      if (cur >= score) { setDisplay(score); clearInterval(id); }
      else setDisplay(cur);
    }, 22);
    return () => clearInterval(id);
  }, [score]);
  return (
    <div style={{fontSize:"48px", fontWeight:"800", color: eligible ? WH : RE, lineHeight:1}}>
      {display}<span style={{fontSize:"20px", fontWeight:"400"}}>/100</span>
    </div>
  );
};

const Badge = ({role}: { role: string }) => {
  const map: Record<string, {c: string; l: string}> = {
    holder: {c: Y, l: "Porteur"},
    coord:  {c: "#22C55E", l: "Coord."},
    admin:  {c: "#9B59B6", l: "Admin"},
  };
  const b = map[role] || {c: GR, l: role};
  return <span style={{padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700",
    background: b.c + "22", color: b.c, border: `1px solid ${b.c}55`}}>{b.l}</span>;
};

const LangToggle = ({lang, setLang, dark = true}: { lang: string; setLang: (l: string) => void; dark?: boolean }) => (
  <div style={{display: "flex", gap: "4px"}}>
    {["fr", "ar", "en"].map(k => (
      <button key={k} onClick={() => setLang(k)} style={{
        padding: "4px 10px", borderRadius: "7px",
        border: `1px solid ${lang === k ? Y : dark ? "rgba(255,255,255,.15)" : CD}`,
        background: lang === k ? Y : "transparent",
        color: lang === k ? ND : dark ? "rgba(255,255,255,.55)" : GR,
        fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
        fontFamily: ff(lang), transition: "all .18s"
      }}>{k}</button>
    ))}
  </div>
);

/* ── HELP AGENT ─────────────────────────────────────── */
// Pure Q&A for holders. For a Coordinator/Admin session, pass `actions` —
// a small allow-list of real things this agent can DO (not just describe) —
// and the agent gains the ability to trigger them, per
// IDEAMAP_DOSSIER_FACTORY_PROMPT.md §5. The AI is asked to answer either as
// plain conversational text (the default) or, only when the user explicitly
// asks for one of the listed actions, as {"reply":"...","action":"<name>"}
// — parsed and dispatched to that action's run() below. If AI is down or
// returns something unparseable, the raw text is shown as a normal reply
// and nothing fires silently; the quick-action chip for each action is
// always available too, with no AI round-trip needed to use it.
function HelpAgent({lang, context, actions}: {
  lang: string; context: string;
  actions?: {name: string; label: string; run: () => void | Promise<void>}[];
}) {
  const [open, setOpen]   = useState(false);
  const [msgs, setMsgs]   = useState<{role:string;content:string}[]>([]);
  const [inp, setInp]     = useState("");
  const [busy, setBusy]   = useState(false);
  const [unread, setUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, busy]);

  const greet = lang === "ar"
    ? "مرحباً! أنا مساعدك الشخصي لمنصة IdeaMap. اسألني عن أي خطوة، وثيقة، أو شرط للمبادرة الوطنية."
    : lang === "fr"
    ? "Bonjour ! Je suis votre assistant IdeaMap. Posez-moi n'importe quelle question sur les étapes, documents ou critères INDH."
    : "Hi! I'm your IdeaMap assistant. Ask me anything about the steps, documents, or INDH requirements.";

  const sys = `Tu es le Superviseur IdeaMap — expert terrain INDH Phase 3 Maroc avec 10 ans d'accompagnement de porteurs.
CONTEXTE UTILISATEUR: ${context}
FAITS INDH CLÉS: contribution INDH plafonnée à 100 000 MAD maximum. INDH couvre 90% du coût total des équipements (coût total peut atteindre ~111 000 MAD), porteur apporte 10% en espèces ou nature. Jury 100pts: Impact social 25pts · Viabilité 20pts · Pertinence territoriale 20pts · Gestion 15pts · Durabilité 10pts · Innovation 10pts. Éligible si ≥60pts.
RÉALITÉS MAROC: SMIG 2 828 MAD/mois. Location petit local 800-2500 MAD/mois. Machine à coudre industrielle 3500-8000 MAD. Souk hebdomadaire = canal de vente principal zones rurales.
Quand quelqu'un demande des documents: cite les 8 documents obligatoires (CIN, statuts, PV AG, récépissé, attestation résidence, devis, photos site, business plan).
Quand quelqu'un demande comment améliorer son score: cite les critères jury précis avec les points.
Quand quelqu'un demande l'éligibilité: pose 2 questions (secteur + budget estimé) avant de répondre.
Réponds UNIQUEMENT en ${lang === "ar" ? "arabe فصحى بسيطة" : lang === "fr" ? "français simple" : "English"}.
Sois bref (2-4 phrases max), concret, basé sur les réalités marocaines. Donne des chiffres précis quand possible.${
  actions && actions.length > 0
    ? `\n\nTu peux aussi DÉCLENCHER une action réelle, mais uniquement quand c'est explicitement demandé — jamais par défaut. Actions disponibles: ${actions.map(a => a.name).join(", ")}.
Si l'utilisateur demande clairement l'une de ces actions (ex: "exporte la liste", "télécharge le fichier excel", "donne-moi le tableau des porteurs"), réponds UNIQUEMENT avec ce JSON, sans markdown ni texte autour:
{"reply":"brève phrase de confirmation dans la langue de la conversation","action":"<nom_exact_de_l_action>"}
Dans tous les autres cas (questions, discussion normale), réponds normalement en texte libre — jamais de JSON.`
    : ""
}`;

  const errReply = (attempt: number) => {
    if (attempt < 2) return null; // still retrying
    return lang === "ar"
      ? "أعتذر، خدمة المستشار مشغولة لحظياً. يرجى إعادة المحاولة خلال ثوانٍ. يمكنك في الأثناء الاطلاع على الأسئلة الشائعة أدناه."
      : lang === "fr"
      ? "Désolé, le conseiller est momentanément surchargé. Réessayez dans quelques secondes — ou consultez les questions fréquentes ci-dessus."
      : "Sorry, the advisor is momentarily busy. Please retry in a few seconds — or tap a quick question above.";
  };

  const send = async (override?: string) => {
    const msg = override ?? inp;
    if (!msg.trim() || busy) return;
    const userMsg = {role:"user", content: msg};
    const history = [...msgs, userMsg];
    setMsgs(history);
    if (!override) setInp("");
    setBusy(true);
    let replied = false;
    // See the ai() helper's comment on MAX_RETRIES for why this stays at 2, not more —
    // the server's own provider cascade already retries exhaustively within 45s.
    for (let attempt = 0; attempt < 2 && !replied; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000));
        const r = await fetch("/api/ai", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({messages: history, system: sys, task:"dialogue"}),
          signal: AbortSignal.timeout(50_000),
        });
        const d = await r.json();
        const text = d.content?.[0]?.text || "";
        if (text) {
          // Only ever attempt the {reply, action} parse when this agent was given
          // actions AND the response looks like JSON — a normal conversational
          // reply never starts with "{", so this never misfires on plain prose.
          let display = text;
          if (actions && actions.length > 0 && text.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(text.trim());
              const match = typeof parsed.action === "string" ? actions.find(a => a.name === parsed.action) : null;
              if (match) {
                display = parsed.reply || text;
                Promise.resolve(match.run()).catch(() => {});
              } else if (typeof parsed.reply === "string") {
                display = parsed.reply;
              }
            } catch { /* not valid JSON — show the raw text as-is */ }
          }
          setMsgs(p => [...p, {role:"assistant", content:display}]);
          setUnread(true);
          replied = true;
        }
      } catch { /* network error — retry */ }
    }
    if (!replied) {
      const fb = errReply(2);
      if (fb) setMsgs(p => [...p, {role:"assistant", content:fb}]);
    }
    setBusy(false);
  };

  const quickQs: Record<string, string[]> = {
    fr: ["Quels documents faut-il ?","Suis-je éligible INDH ?","Comment améliorer mon score ?","Quel est le plafond INDH ?"],
    ar: ["ما الوثائق المطلوبة؟","هل أنا مؤهل للمبادرة؟","كيف أحسّن نقاطي؟","ما هو الحد الأقصى للتمويل؟"],
    en: ["What documents do I need?","Am I INDH eligible?","How to improve my score?","What is the INDH ceiling?"],
  };

  return (
    <>
      {/* Floating button */}
      <button
        data-noprint="true"
        onClick={() => { setOpen(p => !p); setUnread(false); }}
        title={lang==="ar"?"المساعد الشخصي":lang==="fr"?"Assistant IdeaMap":"IdeaMap Assistant"}
        style={{position:"fixed", bottom:24, right:24, zIndex:1000,
          width:52, height:52, borderRadius:"50%",
          background:`linear-gradient(135deg,${Y},${YD})`,
          border:"none", cursor:"pointer",
          boxShadow:`0 4px 24px rgba(37,99,235,.45)`,
          fontSize:"22px", display:"flex", alignItems:"center", justifyContent:"center",
          transition:"transform .2s, box-shadow .2s"}}>
        {open ? "✕" : "💬"}
        {unread && !open && (
          <div style={{position:"absolute", top:1, right:1, width:12, height:12,
            borderRadius:"50%", background:RE, border:`2px solid ${WH}`}}/>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div data-noprint="true" className="fadeUp" style={{position:"fixed", bottom:88, right:24, zIndex:999,
          width:320, maxWidth:"calc(100vw - 48px)", maxHeight:460, background:WH, borderRadius:18,
          boxShadow:"0 8px 48px rgba(15,34,51,.2)", border:`1px solid ${CD}`,
          display:"flex", flexDirection:"column", fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>

          {/* Panel header */}
          <div style={{background:ND, borderRadius:"18px 18px 0 0", padding:"13px 16px",
            display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:34, height:34, borderRadius:"50%", flexShrink:0,
              background:`linear-gradient(135deg,${Y},${YD})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px"}}>🎓</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"13px", fontWeight:"700", color:WH}}>
                {lang==="ar"?"المشرف الشخصي":lang==="fr"?"Superviseur IdeaMap":"IdeaMap Supervisor"}
              </div>
              <div style={{fontSize:"10px", color:"rgba(255,255,255,.5)"}}>
                {lang==="ar"?"متاح دائماً":lang==="fr"?"Toujours disponible":"Always available"}
              </div>
            </div>
            <div style={{width:8, height:8, borderRadius:"50%", background:GN, flexShrink:0}}/>
          </div>

          {/* Messages */}
          <div style={{flex:1, overflowY:"auto", padding:"12px", display:"flex",
            flexDirection:"column", gap:"9px", maxHeight:250}}>
            <div style={{padding:"10px 13px", background:YL, borderRadius:"12px 12px 12px 4px",
              fontSize:"12px", color:ND, lineHeight:1.65}}>{greet}</div>
            {msgs.map((m, i) => {
              const isUser = m.role === "user";
              const isRtl = dir === "rtl";
              // Tail (4px corner) points toward the edge the bubble is anchored to
              const br = isUser
                ? (isRtl ? "12px 12px 12px 4px" : "12px 12px 4px 12px")
                : (isRtl ? "12px 12px 4px 12px" : "12px 12px 12px 4px");
              return (
                <div key={i} style={{padding:"10px 13px", maxWidth:"88%",
                  borderRadius: br,
                  background: isUser ? `linear-gradient(135deg,${N},${ND})` : YL,
                  color: isUser ? WH : ND, fontSize:"12px", lineHeight:1.65,
                  alignSelf: isUser ? (isRtl?"flex-start":"flex-end") : (isRtl?"flex-end":"flex-start")}}>
                  {m.content}
                </div>
              );
            })}
            {busy && <div style={{display:"flex", gap:"4px", padding:"4px 0"}}>
              {[0,1,2].map(i => <div key={i} style={{width:7, height:7, borderRadius:"50%",
                background:Y, animation:`bounce 1s ease ${i*.2}s infinite`}}/>)}
            </div>}
            <div ref={endRef}/>
          </div>

          {/* Quick actions — fire immediately, no AI round-trip needed */}
          {actions && actions.length > 0 && (
            <div style={{padding:"0 12px 10px", display:"flex", flexWrap:"wrap", gap:"6px"}}>
              {actions.map((a, i) => (
                <button key={i} onClick={() => Promise.resolve(a.run()).catch(() => {})}
                  style={{padding:"6px 11px", borderRadius:"16px", border:"none",
                    background:`linear-gradient(135deg,${Y},${YD})`, color:WH,
                    fontSize:"11px", fontWeight:"700", cursor:"pointer",
                    fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Quick questions */}
          {msgs.length === 0 && (
            <div style={{padding:"0 12px 10px", display:"flex", flexWrap:"wrap", gap:"6px"}}>
              {(quickQs[lang] || quickQs.fr).map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  style={{padding:"6px 11px", borderRadius:"16px",
                    border:`1.5px solid ${Y}`, background:YL, color:ND,
                    fontSize:"11px", fontWeight:"600", cursor:"pointer",
                    fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{padding:"10px 12px", borderTop:`1px solid ${CD}`,
            display:"flex", gap:"8px", alignItems:"center"}}>
            <input value={inp} onChange={e => setInp(e.target.value)}
              onKeyDown={e => e.key==="Enter" && send()}
              placeholder={lang==="ar"?"اسألني...":lang==="fr"?"Votre question...":"Ask me..."}
              disabled={busy}
              style={{flex:1, padding:"9px 12px", borderRadius:"10px",
                border:`1.5px solid ${CD}`, fontSize:"12px",
                fontFamily:ff(lang), color:N, background:CR,
                direction:dir as "rtl"|"ltr"}}/>
            <button onClick={() => send()} disabled={busy || !inp.trim()}
              style={{width:36, height:36, borderRadius:"10px", border:"none", flexShrink:0,
                background:`linear-gradient(135deg,${Y},${YD})`, color:WH,
                fontSize:"16px", cursor:"pointer", opacity: busy||!inp.trim()?0.5:1,
                display:"flex", alignItems:"center", justifyContent:"center"}}>
              {dir==="rtl" ? "←" : "→"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── SELECT ─────────────────────────────────────────── */
const Sel = ({value, onChange, options, placeholder, dir}: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; dir: string;
}) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    width: "100%", padding: "11px 14px", borderRadius: "11px",
    border: `2px solid ${value ? Y : CD}`, background: value ? YL : WH,
    fontSize: "13px", fontFamily: "inherit", color: value ? ND : GR,
    direction: dir as "rtl" | "ltr", appearance: "none", cursor: "pointer", transition: "all .2s"
  }}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

/* ── HEADER ─────────────────────────────────────────── */
const Header = ({lang, setLang, user, onLogout, t}: {
  lang: string; setLang: (l: string) => void;
  user: any; onLogout: () => void; t: any;
}) => (
  <div data-noprint="true" style={{background: ND, height: "58px", display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 22px",
    boxShadow: "0 2px 16px rgba(15,34,51,.3)", position: "sticky", top: 0, zIndex: 200}}>
    <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
      <div style={{width: "32px", height: "32px", borderRadius: "8px", background: NB,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
        <img src="/logo-icon.png" alt="" style={{width: "24px", height: "24px", objectFit: "contain"}}/>
      </div>
      <span style={{fontSize: "17px", fontWeight: "800", color: WH, lineHeight: 1, letterSpacing: "-.3px"}}>IdeaMap</span>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
      <LangToggle lang={lang} setLang={setLang}/>
      {user && <>
        <div style={{display: "flex", alignItems: "center", gap: "8px",
          padding: "4px 12px", background: NB, borderRadius: "10px",
          border: "1px solid rgba(255,255,255,.1)"}}>
          <div style={{width: "24px", height: "24px", borderRadius: "50%", background: Y,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: "800", color: ND}}>{(user.name || user.id)[0]}</div>
          <span style={{fontSize: "12px", color: WH, fontWeight: "600"}}>{user.name || user.id}</span>
          <Badge role={user.role}/>
        </div>
        <button onClick={onLogout} style={{padding: "5px 12px", borderRadius: "8px",
          border: "1px solid rgba(255,255,255,.15)", background: "transparent",
          color: "rgba(255,255,255,.45)", fontSize: "11px", fontWeight: "600", fontFamily: ff(lang)}}>
          {t.logout}
        </button>
      </>}
    </div>
  </div>
);

/* ── PROGRESS BAR ROW ───────────────────────────────── */
const ProgRow = ({t, si, steps, onStepClick}: { lang: string; t: any; si: number; steps: string[]; onStepClick?: (i: number) => void }) => (
  <div data-noprint="true" style={{background: WH, padding: "9px 22px", borderBottom: `1px solid ${CD}`}}>
    <div style={{maxWidth: "720px", margin: "0 auto"}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
        {steps.map((s: string, i: number) => {
          const done = i < si;
          return (
            <span key={i}
              onClick={() => done && onStepClick?.(i)}
              title={done ? s : undefined}
              className={!done && i !== si ? "prog-fut" : ""}
              style={{fontSize: "9px", fontWeight: "700", textTransform: "uppercase",
                letterSpacing: ".5px",
                color: done ? GN : i === si ? N : GR,
                cursor: done ? "pointer" : "default",
                transition: "opacity .15s",
              }}>
              {done ? "✓" : s}
            </span>
          );
        })}
      </div>
      <PBar pct={((si + 1) / steps.length) * 100} h={6}
        color={`linear-gradient(90deg,${Y},${YD})`}/>
    </div>
  </div>
);

/* ── DASHBOARD SIDEBAR ─────────────────────────────── */
const DashSidebar = ({user, navItems, activeTab, onTabChange, onLogout, lang, setLang, t, open, onClose}: {
  user: any; navItems: {id:string; label:string}[]; activeTab: string;
  onTabChange: (id:string)=>void; onLogout:()=>void; lang:string; setLang:(l:string)=>void; t:any;
  open?: boolean; onClose?: () => void;
}) => (
  <div className={`dash-sidebar${open ? " dsb-open" : ""}`}
    style={{width:240, flexShrink:0, background:WH, borderRight:`1px solid ${CD}`,
    position:"sticky", top:0, height:"100vh", display:"flex", flexDirection:"column", zIndex:50}}>
    {/* Logo area + close button (mobile) */}
    <div style={{padding:"20px 18px 16px", borderBottom:`1px solid ${CD}`,
      display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
        <div style={{width:34, height:34, borderRadius:"9px", background:ND, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center"}}>
          <img src="/logo-icon.png" alt="" style={{width:"25px", height:"25px", objectFit:"contain"}}/>
        </div>
        <div>
          <div style={{fontSize:"14.5px", fontWeight:"800", color:ND, lineHeight:1.2}}>IdeaMap</div>
          <div style={{fontSize:"10px", color:GR, fontWeight:"500"}}>
            {user.role==="admin" ? (lang==="ar"?"إدارة":lang==="fr"?"Administration":"Admin") : (lang==="ar"?"تنسيق":lang==="fr"?"Coordination":"Coordinator")}
          </div>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="dash-topbar"
          style={{background:"transparent", border:"none", fontSize:"18px", color:GR,
            cursor:"pointer", lineHeight:1, padding:"2px 4px"}}>✕</button>
      )}
    </div>
    {/* Nav items */}
    <nav style={{padding:"10px 10px", flex:1, overflowY:"auto"}}>
      {navItems.map(item => {
        const active = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => { onTabChange(item.id); onClose?.(); }}
            style={{width:"100%", display:"flex", alignItems:"center", gap:"11px",
              padding:"9px 12px", borderRadius:"8px", border:"none", cursor:"pointer", marginBottom:"2px",
              background: active ? "#F0F1F5" : "transparent", textAlign:"left", fontFamily:ff(lang)}}>
            <div style={{width:7, height:7, borderRadius:"50%", flexShrink:0, background: active ? ND : "#D0D3DC"}}/>
            <span style={{fontSize:"13.5px", fontWeight: active ? 700 : 500, color: active ? ND : GR}}>{item.label}</span>
          </button>
        );
      })}
    </nav>
    {/* Footer */}
    <div style={{padding:"14px 18px", borderTop:`1px solid ${CD}`}}>
      <div style={{display:"flex", alignItems:"center", gap:"9px", marginBottom:"8px"}}>
        <div style={{width:30, height:30, borderRadius:"50%", background:ND, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:WH}}>
          {(user.name||user.id||"?")[0]}
        </div>
        <div style={{flex:1, overflow:"hidden"}}>
          <div style={{fontSize:"12px", fontWeight:"600", color:N, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{user.name||user.id}</div>
          <div style={{fontSize:"10px", color:GR, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{user.id}</div>
        </div>
      </div>
      <div style={{marginBottom:"8px"}}>
        <LangToggle lang={lang} setLang={setLang} dark={false}/>
      </div>
      <button onClick={onLogout} style={{background:"transparent", border:"none", padding:0,
        fontSize:"11px", fontWeight:"500", color:GR, cursor:"pointer", fontFamily:ff(lang), textDecoration:"underline"}}>
        {t.logout}
      </button>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════
   LOGIN SCREEN
════════════════════════════════════════════════════════ */
function Login({lang, setLang, t, onLogin, holders, coords}: {
  lang: string; setLang: (l: string) => void; t: any;
  onLogin: (u: any) => void; holders: any[]; coords: Coord[];
}) {
  const [val, setVal]         = useState("");
  const [err, setErr]         = useState(false);
  const [mode, setMode]       = useState<null | "new">(null);
  const [form, setForm]       = useState({firstName: "", lastName: "", email: "", phone: "", age: "", gender: "", marital: "", edu: "", occupation: "", region: "", arrondissement: "", sector: "", projType: "", photo: "", coordCode: ""});
  const [formErr, setFormErr] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const arrRef    = useRef<HTMLDivElement>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";

  /* ── Live role detection ── */
  const liveRole = val.trim() ? detectRole(val.trim()) : null;
  const roleColors: Record<string, string> = { holder:"#1aabaa", coord:"#9B59B6", admin:"#1db87a", unknown:RE };
  const roleIcons:  Record<string, string> = { holder:"🎓", coord:"👔", admin:"⚙️", unknown:"❌" };
  const roleLabels: Record<string, Record<string, string>> = {
    holder:{fr:"Porteur de projet",ar:"حامل المشروع",en:"Project holder"},
    coord:{fr:"Coordinateur",ar:"المنسق",en:"Coordinator"},
    admin:{fr:"Administrateur",ar:"المدير",en:"Administrator"},
    unknown:{fr:"Code non reconnu",ar:"رمز غير معروف",en:"Unrecognized code"},
  };
  const inputBorder = liveRole ? (liveRole !== "unknown" ? roleColors[liveRole] : RE) : "rgba(255,255,255,.12)";

  const handleCheck = () => {
    const cleanVal = val.trim();
    if (cleanVal.toLowerCase() === ADMIN_CODE.toLowerCase()) { onLogin({id:ADMIN_CODE, name:"Admin", role:"admin"}); return; }
    const normalised = cleanVal.toUpperCase();
    const role = detectRole(normalised);
    if (role === "coord") {
      const match = coords.find(c => (typeof c === "string" ? c : c.code).toUpperCase() === normalised);
      if (!match) { setErr(true); return; }
      const name = typeof match === "string" ? normalised.replace("@","").replace(/COD$/i,"") : (match.name || normalised.replace("@","").replace(/COD$/i,""));
      onLogin({id:normalised, name, role:"coord"}); return;
    }
    if (role === "holder") {
      const existing = holders.find((h:any) => h.id === normalised);
      if (existing) { onLogin({id:normalised, name:existing.profile.firstName, role:"holder", profile:existing.profile}); return; }
      setMode("new"); return;
    }
    setErr(true);
  };

  // Casablanca-Settat is split into 8 préfectures d'arrondissements — shown
  // directly once that region is picked, no intermediate step.
  const showArrondissement = form.region === "Casablanca-Settat";

  useEffect(() => {
    if (!showArrondissement && form.arrondissement) { setForm(p => ({...p, arrondissement: ""})); return; }
    if (!showArrondissement || !arrRef.current) return;
    const id = setTimeout(() => arrRef.current?.scrollIntoView({behavior:"smooth", block:"start"}), 120);
    return () => clearTimeout(id);
  }, [showArrondissement]);

  const REQUIRED_FIELDS: Array<{key: keyof typeof form; label: Record<string,string>}> = [
    {key:"firstName",  label:{fr:"Prénom",ar:"الاسم الشخصي",en:"First name"}},
    {key:"lastName",   label:{fr:"Nom de famille",ar:"الاسم العائلي",en:"Last name"}},
    {key:"email",      label:{fr:"E-mail",ar:"البريد الإلكتروني",en:"Email"}},
    {key:"age",        label:{fr:"Tranche d'âge",ar:"الفئة العمرية",en:"Age range"}},
    {key:"gender",     label:{fr:"Genre",ar:"الجنس",en:"Gender"}},
    {key:"edu",        label:{fr:"Niveau d'études",ar:"المستوى الدراسي",en:"Education"}},
    {key:"occupation", label:{fr:"Situation professionnelle",ar:"الوضع المهني",en:"Occupation"}},
    {key:"region",     label:{fr:"Région",ar:"الجهة",en:"Region"}},
    {key:"sector",     label:{fr:"Secteur",ar:"القطاع",en:"Sector"}},
    {key:"projType",   label:{fr:"Type de porteur",ar:"نوع الحامل",en:"Holder type"}},
  ];
  const allRequired = [
    ...REQUIRED_FIELDS,
    ...(showArrondissement ? [{key:"arrondissement" as keyof typeof form, label:{fr:"Arrondissement",ar:"المقاطعة",en:"District"}}] : []),
  ];
  const TOTAL_FIELDS = Object.keys(form).filter(k => k !== "photo" && k !== "arrondissement" && k !== "coordCode").length
    + (showArrondissement ? 1 : 0);
  const filledCount  = Object.entries(form).filter(([k,v]) =>
    k !== "photo" && k !== "coordCode" && (k !== "arrondissement" || showArrondissement) && !!v).length;
  const fillPct      = Math.round((filledCount / TOTAL_FIELDS) * 100);
  const isEmailValid = (v:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Optional — if the holder was referred by a coordinator, their code links this
  // profile to that coordinator's own custom questionnaire (if they've uploaded
  // one). Unrecognized codes are rejected rather than silently ignored, so a typo
  // doesn't look like it worked when it didn't.
  const coordCodeValid = !form.coordCode ||
    coords.some(c => (typeof c === "string" ? c : c.code).toUpperCase() === form.coordCode.trim().toUpperCase());

  const handleCreate = () => {
    const missing = allRequired.filter(r => !form[r.key]).map(r => r.label[lang] || r.label.fr);
    if (missing.length > 0 || (form.email && !isEmailValid(form.email)) || !coordCodeValid) {
      const errs = [...missing];
      if (form.email && !isEmailValid(form.email)) errs.push(lang==="ar"?"البريد الإلكتروني غير صالح":lang==="fr"?"Format e-mail invalide":"Invalid email format");
      if (!coordCodeValid) errs.push(lang==="ar"?"رمز المنسق غير معروف":lang==="fr"?"Code coordinateur non reconnu":"Unrecognized coordinator code");
      setFormErr(errs); return;
    }
    const id = val.trim().toUpperCase();
    const coordCode = form.coordCode ? form.coordCode.trim().toUpperCase() : "";
    onLogin({id, name:form.firstName, role:"holder", profile:{...form, coordCode, id}, isNew:true});
  };

  /* ── Dark field helpers (CareerMap style) ── */
  const lStyle: React.CSSProperties = {display:"block", fontSize:"9px", fontWeight:700,
    color:"rgba(255,255,255,.4)", marginBottom:"5px", letterSpacing:".8px", textTransform:"uppercase"};

  const regSec = (icon: string, label: string) => (
    <div style={{display:"flex", alignItems:"center", gap:"8px", margin:"6px 0 2px"}}>
      <span style={{fontSize:"13px"}}>{icon}</span>
      <span style={{fontSize:"10px", fontWeight:"800", color:Y, textTransform:"uppercase", letterSpacing:".6px"}}>{label}</span>
      <div style={{flex:1, height:"1px", background:"rgba(255,255,255,.08)"}}/>
    </div>
  );
  const dBorder = (field: keyof typeof form) => {
    if (!form[field]) return formErr.length > 0 && allRequired.some(r => r.key === field) ? RE : "rgba(28,58,92,.8)";
    if (field === "email") return isEmailValid(form.email) ? "#1db87a" : RE;
    return Y;
  };
  const dInp = (field: keyof typeof form, placeholder: string) => (
    <input value={form[field]}
      onChange={e => {setForm(p => ({...p,[field]:e.target.value})); setFormErr([]);}}
      placeholder={placeholder}
      style={{width:"100%", padding:"11px 14px", borderRadius:"10px",
        border:`1.5px solid ${dBorder(field)}`,
        background:"rgba(255,255,255,.04)", fontSize:"13px",
        fontFamily:ff(lang), color:WH,
        direction:dir as "rtl"|"ltr", transition:"border-color .2s"}}/>
  );
  const dSel = (field: keyof typeof form, options: string[], placeholder: string) => (
    <select value={form[field]}
      onChange={e => {setForm(p => ({...p,[field]:e.target.value})); setFormErr([]);}}
      style={{width:"100%", padding:"11px 14px", borderRadius:"10px",
        border:`1.5px solid ${form[field] ? Y : "rgba(28,58,92,.8)"}`,
        background:"rgba(255,255,255,.04)", fontSize:"13px",
        fontFamily:ff(lang), color:form[field] ? WH : "rgba(255,255,255,.3)",
        direction:dir as "rtl"|"ltr", appearance:"none", cursor:"pointer", transition:"all .2s"}}>
      <option value="" style={{background:"#0f2233"}}>{placeholder}</option>
      {options.map(o => <option key={o} value={o} style={{background:"#0f2233"}}>{o}</option>)}
    </select>
  );

  /* ── Account creation — full-page dark (CareerMap style) ── */
  if (mode === "new") {
    return (
      <div style={{minHeight:"100vh", background:"#0A0F2C", fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>
        <div style={{background:"rgba(255,255,255,.04)", borderBottom:"1px solid rgba(255,255,255,.08)",
          padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 20px rgba(0,0,0,.3)"}}>
          <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
            <div style={{width:"28px", height:"28px", borderRadius:"7px", background:"rgba(255,255,255,.08)",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
              <img src="/logo-icon.png" alt="" style={{width:"21px", height:"21px", objectFit:"contain"}}/>
            </div>
            <span style={{fontSize:"14px", fontWeight:"800", color:WH}}>IdeaMap</span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <span style={{fontSize:"10px", color:"rgba(255,255,255,.3)", fontFamily:"monospace", letterSpacing:"1px"}}>{val.trim().toUpperCase()}</span>
            <LangToggle lang={lang} setLang={setLang}/>
          </div>
        </div>
        <div ref={scrollRef} style={{maxWidth:480, margin:"0 auto", padding:"24px 20px 80px"}}>
          <h2 style={{fontSize:"18px", fontWeight:"800", color:WH, marginBottom:"6px"}}>{t.createTitle}</h2>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
            <span style={{fontSize:"9px", color:"rgba(255,255,255,.3)", fontWeight:"600", textTransform:"uppercase", letterSpacing:".5px"}}>
              {lang==="ar"?"تعبئة الحقول":lang==="fr"?"Champs remplis":"Fields filled"}
            </span>
            <span style={{fontSize:"9px", fontWeight:"800", color:Y}}>{fillPct}%</span>
          </div>
          <div style={{height:"3px", background:"rgba(255,255,255,.07)", borderRadius:"2px", overflow:"hidden", marginBottom:"20px"}}>
            <div style={{height:"100%", borderRadius:"2px", background:`linear-gradient(90deg,${Y},${YD})`,
              width:`${fillPct}%`, transition:"width .4s ease"}}/>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
            {regSec("👤", lang==="ar"?"الهوية":lang==="fr"?"Identité":"Identity")}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.firstName}</label>{dInp("firstName", t.firstName as string)}</div>
              <div><label style={lStyle}>{t.lastName}</label>{dInp("lastName", t.lastName as string)}</div>
            </div>
            {regSec("📬", lang==="ar"?"التواصل":lang==="fr"?"Contact":"Contact")}
            <div style={{position:"relative"}}>
              <label style={lStyle}>{t.email}</label>
              {dInp("email", t.email as string)}
              {form.email && isEmailValid(form.email) &&
                <span style={{position:"absolute", right:"12px", top:"calc(50% + 8px)", transform:"translateY(-50%)", fontSize:"13px"}}>✅</span>}
            </div>
            <div><label style={lStyle}>{t.phone}</label>{dInp("phone", t.phone as string)}</div>
            {regSec("📊", lang==="ar"?"الملف الشخصي":lang==="fr"?"Profil":"Profile")}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.age}</label>{dSel("age", AGES, t.age as string)}</div>
              <div><label style={lStyle}>{t.gender}</label>{dSel("gender", GENDERS[lang], t.gender as string)}</div>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.marital}</label>{dSel("marital", MARITAL[lang], t.marital as string)}</div>
              <div><label style={lStyle}>{t.edu}</label>{dSel("edu", EDU[lang], t.edu as string)}</div>
            </div>
            <div><label style={lStyle}>{t.occupation}</label>{dSel("occupation", OCCUPATION[lang], t.occupation as string)}</div>
            {regSec("📍", lang==="ar"?"الموقع":lang==="fr"?"Localisation":"Location")}
            <div>
              <label style={lStyle}>{t.region}</label>
              <select value={form.region}
                onChange={e => {setForm(p=>({...p, region:e.target.value, arrondissement:""})); setFormErr([]);}}
                style={{width:"100%", padding:"11px 14px", borderRadius:"10px",
                  border:`1.5px solid ${form.region ? Y : "rgba(28,58,92,.8)"}`,
                  background:"rgba(255,255,255,.04)", fontSize:"13px",
                  fontFamily:ff(lang), color:form.region ? WH : "rgba(255,255,255,.3)",
                  direction:dir as "rtl"|"ltr", appearance:"none", cursor:"pointer", transition:"all .2s"}}>
                <option value="" style={{background:"#0f2233"}}>{t.region}</option>
                {REGIONS.map(o => <option key={o} value={o} style={{background:"#0f2233"}}>{o}</option>)}
              </select>
            </div>
            {showArrondissement && (
              <div ref={arrRef} style={{animation:"fadeUp .3s ease both"}}>
                <label style={lStyle}>{t.arrondissement}</label>
                {dSel("arrondissement", ARRONDISSEMENTS_CASA, t.arrondissement as string)}
              </div>
            )}
            {regSec("💼", lang==="ar"?"المشروع":lang==="fr"?"Projet":"Project")}
            <div><label style={lStyle}>{t.sector}</label>{dSel("sector", SECTORS, t.sector as string)}</div>
            <div><label style={lStyle}>{t.projType}</label>{dSel("projType", PROJ_TYPES[lang], t.projType as string)}</div>
            <div>
              <label style={{...lStyle, marginBottom:"7px"}}>
                {lang==="ar"?"رمز المنسق":lang==="fr"?"Code coordinateur":"Coordinator code"} ({lang==="ar"?"اختياري":lang==="fr"?"optionnel":"optional"})
              </label>
              <input value={form.coordCode}
                onChange={e => {setForm(p => ({...p, coordCode:e.target.value})); setFormErr([]);}}
                placeholder={lang==="ar"?"مثال: @OMARCOD":lang==="fr"?"Ex : @OMARCOD":"E.g. @OMARCOD"}
                style={{width:"100%", padding:"11px 14px", borderRadius:"10px",
                  border:`1.5px solid ${form.coordCode ? (coordCodeValid ? Y : RE) : "rgba(28,58,92,.8)"}`,
                  background:"rgba(255,255,255,.04)", fontSize:"13px",
                  fontFamily:ff(lang), color:WH,
                  direction:dir as "rtl"|"ltr", transition:"border-color .2s"}}/>
              <div style={{fontSize:"10px", color:"rgba(255,255,255,.3)", marginTop:"5px"}}>
                {lang==="ar"?"إذا وجهك منسق، أدخل رمزه هنا لاستخدام استبيانه الخاص":lang==="fr"?"Si un coordinateur vous a orienté, entrez son code pour utiliser son propre questionnaire":"If a coordinator referred you, enter their code to use their own questionnaire"}
              </div>
            </div>
            <div>
              <label style={{...lStyle, marginBottom:"7px"}}>
                {t.photo as string} ({lang==="ar"?"اختياري":lang==="fr"?"optionnel":"optional"})
              </label>
              <label style={{display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px",
                borderRadius:"10px", border:`1.5px dashed ${form.photo ? Y : "rgba(28,58,92,.8)"}`,
                background:"rgba(255,255,255,.04)", cursor:"pointer"}}>
                {form.photo
                  ? <img src={form.photo} alt="photo" style={{width:"36px",height:"36px",borderRadius:"50%",objectFit:"cover"}}/>
                  : <span style={{fontSize:"22px"}}>📷</span>}
                <div>
                  <div style={{fontSize:"12px", fontWeight:"600", color:form.photo ? Y : "rgba(255,255,255,.4)"}}>
                    {form.photo ? (lang==="ar"?"تم الرفع ✓":lang==="fr"?"Photo ajoutée ✓":"Photo added ✓") : (t.photo as string)}
                  </div>
                  <div style={{fontSize:"10px", color:"rgba(255,255,255,.25)"}}>JPG, PNG — max 2 MB</div>
                </div>
                <input type="file" accept="image/*" style={{display:"none"}}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 2*1024*1024) return;
                    const reader = new FileReader();
                    reader.onload = ev => setForm(p => ({...p, photo:ev.target?.result as string}));
                    reader.readAsDataURL(f);
                  }}/>
              </label>
            </div>
          </div>

          {formErr.length > 0 && (
            <div style={{padding:"10px 12px", background:`${RE}12`, border:`1px solid ${RE}44`,
              borderRadius:"10px", marginTop:"16px"}}>
              <div style={{fontSize:"11px", fontWeight:"700", color:RE, marginBottom:"4px"}}>
                {lang==="ar"?"الحقول المطلوبة:":lang==="fr"?"Champs manquants :":"Missing fields:"}
              </div>
              {formErr.map((e,i) => <div key={i} style={{fontSize:"11px", color:RE}}>• {e}</div>)}
            </div>
          )}

          <div style={{marginTop:"20px", display:"flex", flexDirection:"column", gap:"10px"}}>
            <button onClick={handleCreate} className={fillPct >= 60 ? "im-primary" : ""}
              style={{width:"100%", padding:"15px",
                background: fillPct >= 60 ? `linear-gradient(135deg,${Y},${YD})` : "rgba(255,255,255,.08)",
                color: fillPct >= 60 ? ND : "rgba(255,255,255,.3)",
                border: fillPct >= 60 ? "none" : "1px solid rgba(255,255,255,.1)",
                borderRadius:"14px", fontSize:"14px", fontWeight:"800",
                fontFamily:ff(lang), cursor:"pointer", transition:"all .2s"}}>
              {t.create}
            </button>
            <button onClick={() => setMode(null)}
              style={{width:"100%", background:"transparent", color:"rgba(255,255,255,.35)",
                fontSize:"12px", border:"none", padding:"8px", fontFamily:ff(lang), cursor:"pointer"}}>
              ← {lang==="ar"?"رجوع":lang==="fr"?"Retour":"Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main login (handoff design) ── */
  return (
    <div style={{minHeight:"100vh", background:ND, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden",
      fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>

      {/* SVG network diagram — top-right */}
      <svg viewBox="0 0 960 960" style={{position:"absolute", top:-300, right:-320, width:960, height:960,
        opacity:0.9, pointerEvents:"none", zIndex:1}}>
        <line x1="480" y1="480" x2="720" y2="240" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <line x1="480" y1="480" x2="800" y2="520" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <line x1="480" y1="480" x2="600" y2="700" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <line x1="480" y1="480" x2="300" y2="680" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <line x1="720" y1="240" x2="800" y2="520" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <line x1="720" y1="240" x2="560" y2="120" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <line x1="800" y1="520" x2="600" y2="700" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16"/>
        <circle cx="480" cy="480" r="6" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="720" cy="240" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="800" cy="520" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="600" cy="700" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="300" cy="680" r="4" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="560" cy="120" r="4" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="480" cy="480" r="18" fill={Y} opacity="0.9"/>
        <path d="M480 462 C469 462 460 471 460 482 C460 497 480 518 480 518 C480 518 500 497 500 482 C500 471 491 462 480 462 Z" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="480" cy="482" r="5" fill={Y} opacity="0.9"/>
      </svg>

      {/* SVG concentric circles — bottom-left */}
      <svg viewBox="0 0 620 620" style={{position:"absolute", bottom:-200, left:-200, width:620, height:620,
        opacity:0.5, pointerEvents:"none", zIndex:1}}>
        <circle cx="310" cy="310" r="240" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.12"/>
        <circle cx="310" cy="310" r="180" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.12"/>
        <circle cx="310" cy="310" r="120" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.12"/>
      </svg>

      {/* Lang toggle */}
      <div style={{position:"absolute", top:14, right:dir==="rtl"?undefined:14, left:dir==="rtl"?14:undefined, zIndex:10}}>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>

      {/* Content column */}
      <div className="im-rise" style={{width:"100%", maxWidth:400, position:"relative", zIndex:5, display:"flex",
        flexDirection:"column", alignItems:"center"}}>

        {/* Logo above card — a right-sized/compressed copy (36KB vs. the 320KB
            full-res source), since this is the single largest request on the
            whole login page and a plain <img> with no responsive sizing */}
        <img src="/logo-login.png" alt="IdeaMap"
          style={{width:270, maxWidth:"100%", objectFit:"contain", marginBottom:18}}/>

        {/* White card */}
        <div style={{background:WH, borderRadius:16, padding:"36px 32px", width:"100%",
          boxShadow:"0 24px 60px rgba(0,0,0,.35)"}}>

          <h2 style={{fontSize:22, fontWeight:800, color:N, marginBottom:6, fontFamily:ff(lang)}}>
            {lang==="ar"?"تسجيل الدخول":lang==="fr"?"Sign in":"Sign in"}
          </h2>
          <p style={{fontSize:13.5, color:GR, marginBottom:20, fontFamily:ff(lang)}}>
            {t.signInSub as string}
          </p>

          <input
            value={val}
            onChange={e => {const v=e.target.value; setVal(v.startsWith("@")?v:v.toUpperCase()); setErr(false);}}
            onKeyDown={e => e.key === "Enter" && handleCheck()}
            placeholder={t.codePh as string}
            maxLength={30}
            autoFocus
            autoComplete="off"
            className={err ? "shake" : ""}
            style={{width:"100%", padding:"13px 14px",
              background:IF, border:`1px solid ${DV}`,
              borderRadius:8, fontSize:15, fontFamily:"monospace",
              color:N, marginBottom:liveRole ? "8px" : "12px",
              transition:"border-color .2s", letterSpacing:.4,
              direction:dir as "rtl"|"ltr"}}/>

          {liveRole && !err && (
            <div style={{display:"flex", alignItems:"center", gap:"6px", marginBottom:"10px",
              padding:"5px 10px", borderRadius:"7px",
              background:roleColors[liveRole] + "18",
              border:`1px solid ${roleColors[liveRole]}30`}}>
              <span style={{fontSize:"13px"}}>{roleIcons[liveRole]}</span>
              <span style={{fontSize:"11px", fontWeight:"700", color:roleColors[liveRole]}}>
                {roleLabels[liveRole]?.[lang] || roleLabels[liveRole].fr}
              </span>
            </div>
          )}

          {err && <p style={{color:RE, fontSize:13, marginBottom:10, fontFamily:ff(lang)}}>{t.cinError as string}</p>}

          <button onClick={handleCheck} disabled={!val.trim()}
            className="login-cont-btn"
            style={{width:"100%", padding:14, marginTop:8,
              background:ND,
              color:WH, border:"none", borderRadius:8,
              fontFamily:ff(lang), fontSize:14, fontWeight:700,
              opacity:!val.trim() ? 0.5 : 1, transition:"background .18s",
              boxShadow:"0 8px 20px rgba(10,15,44,0.32)"}}>
            {t.cont as string} {dir==="rtl" ? "←" : "→"}
          </button>
        </div>
      </div>

      <p style={{position:"absolute", bottom:16, left:0, right:0, textAlign:"center",
        fontSize:12, color:"rgba(255,255,255,.4)", zIndex:5}}>
        © 2026 IdeaMap · v2
      </p>
    </div>
  );
}

// ── Real .xlsx export (admin + coordinator dashboards) ──
// Replaces the old plain-CSV export: a styled, two-sheet workbook (the
// porteur list, plus a Résumé sheet with aggregate counts) rather than a
// flat semicolon file. `role` picks the column set — admin sees the full
// platform-wide field set (budget, pillar, prefecture...), coordinator sees
// the operational subset relevant to their own porteurs — but both are real
// Excel, not a CSV dressed up with a .xlsx-sounding button label.
async function generateHoldersExcel(
  holders: any[],
  lang: string,
  role: "admin" | "coord",
  showToast: (msg: string, type?: "error" | "success") => void,
) {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "IdeaMap";
    wb.created = new Date();

    const NAVY = "0F2233";
    const T = {
      sheet: lang==="ar"?"الحاملون":lang==="fr"?"Porteurs":"Holders",
      summary: lang==="ar"?"ملخص":lang==="fr"?"Résumé":"Summary",
      total: lang==="ar"?"إجمالي الحاملين":lang==="fr"?"Total porteurs":"Total holders",
      eligible: lang==="ar"?"مؤهلون":lang==="fr"?"Éligibles":"Eligible",
      avgScore: lang==="ar"?"متوسط النقطة":lang==="fr"?"Score moyen":"Average score",
      totalBudget: lang==="ar"?"إجمالي الميزانية المطلوبة":lang==="fr"?"Budget total demandé":"Total requested budget",
      byStep: lang==="ar"?"حسب المرحلة":lang==="fr"?"Par étape":"By step",
      generated: lang==="ar"?"أُنشئ في":lang==="fr"?"Généré le":"Generated on",
    };

    const adminCols: [string, (h: any) => any][] = [
      ["ID", h => h.id], ["Nom", h => h.name||""], ["Prénom", h => h.profile?.lastName||""],
      ["Email", h => h.profile?.email||""], ["Téléphone", h => h.profile?.phone||""],
      ["Âge", h => h.profile?.age||""], ["Genre", h => h.profile?.gender||""],
      ["Région", h => h.profile?.region||""], ["Préfecture", h => h.profile?.prefecture||""],
      ["Arrondissement", h => h.profile?.arrondissement||""],
      ["Secteur", h => h.proj?.sector||h.profile?.sector||""], ["Type", h => h.profile?.projType||""],
      ["Projet", h => h.proj?.projectName||""], ["Structure", h => h.proj?.legalStructure||""],
      ["Bénéficiaires", h => h.proj?.beneficiaries||""], ["Budget (MAD)", h => h.proj?.estimatedBudget||""],
      ["Axe INDH", h => h.proj?.pillar||""], ["Score", h => h.comp?.score??""],
      ["Éligible", h => h.comp?.eligible?"OUI":"NON"], ["Étape", h => h.step||"idea"],
      ["Coordinateur", h => h.profile?.coordCode||""],
    ];
    const coordCols: [string, (h: any) => any][] = [
      ["ID", h => h.id], ["Nom", h => h.name||""], ["Région", h => h.profile?.region||""],
      ["Secteur", h => h.proj?.sector||h.profile?.sector||""], ["Projet", h => h.proj?.projectName||""],
      ["Bénéficiaires", h => h.proj?.beneficiaries||""], ["Budget (MAD)", h => h.proj?.estimatedBudget||""],
      ["Score", h => h.comp?.score??""], ["Éligible", h => h.comp?.eligible?"OUI":"NON"],
      ["Étape", h => h.step||"idea"],
    ];
    const cols = role === "admin" ? adminCols : coordCols;

    const sheet = wb.addWorksheet(T.sheet, { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = cols.map(([header]) => ({ header, key: header, width: Math.max(header.length + 4, 14) }));
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + NAVY } };
      cell.alignment = { vertical: "middle" };
    });
    for (const h of holders) {
      sheet.addRow(cols.map(([, get]) => get(h)));
    }
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };

    const summarySheet = wb.addWorksheet(T.summary);
    const eligibleCount = holders.filter(h => h.comp?.eligible).length;
    const scored = holders.filter(h => h.comp?.score != null);
    const avgScore = scored.length ? Math.round(scored.reduce((s, h) => s + h.comp.score, 0) / scored.length) : 0;
    const totalBudget = holders.reduce((s, h) => s + (h.proj?.estimatedBudget || 0), 0);
    const stepCounts: Record<string, number> = {};
    for (const h of holders) { const s = h.step || "idea"; stepCounts[s] = (stepCounts[s]||0) + 1; }

    summarySheet.addRow([T.generated, new Date().toLocaleString(lang==="ar"?"ar-MA":lang==="en"?"en-US":"fr-FR")]);
    summarySheet.addRow([]);
    summarySheet.addRow([T.total, holders.length]);
    summarySheet.addRow([T.eligible, eligibleCount]);
    summarySheet.addRow([T.avgScore, avgScore]);
    summarySheet.addRow([T.totalBudget, totalBudget]);
    summarySheet.addRow([]);
    summarySheet.addRow([T.byStep]);
    for (const [step, n] of Object.entries(stepCounts)) summarySheet.addRow([step, n]);
    summarySheet.getColumn(1).width = 28;
    summarySheet.getColumn(2).width = 20;
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(8).font = { bold: true };

    const buf = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const filename = role === "admin" ? "IdeaMap_Porteurs.xlsx" : "IdeaMap_Porteurs_Coord.xlsx";
    Object.assign(document.createElement("a"), { href: url, download: filename }).click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    console.error("Excel export error:", e);
    showToast(lang==="ar"?"فشل إنشاء ملف Excel":lang==="fr"?"Erreur lors de la création du fichier Excel":"Excel generation failed", "error");
  }
}

// ── Présentation comité (PPTX) ──
// The dossier's committee-facing deck (IDEAMAP_DOSSIER_FACTORY_PROMPT.md §1:
// "Présentation comité (PPTX, Arabic, 10 slides)") — distinct from the
// holder-facing Pitch Deck and the jury-scoring Dossier Jury generatePptxDeck
// already builds: this one is the official record shown to the INDH
// selection committee, structured like a project identification file
// (porteur → projet → équipements → marché → modèle → impact → budget →
// durabilité → recommandation) rather than a pitch. Defaults to Arabic per
// the spec, but — like every other export in this app — stays usable in
// fr/en too rather than hard-coding away the rest of CLAUDE.md's fr/ar/en
// requirement.
async function generateComitePresentation(
  exportLang: string,
  data: {proj: any; plan: any; budget: any; comp: any; profile: any; name: string; numero?: string},
  lang: string,
  showToast: (msg: string, type?: "error" | "success") => void,
) {
  const {proj, plan, budget, comp, profile, name, numero} = data;
  try {
    const PptxGenJS = (await import("pptxgenjs")).default;
    const prs = new (PptxGenJS as any)();
    prs.layout = "LAYOUT_16x9";
    const NAVY = "0F2233"; const YELLOW = "FFB703"; const WHITE = "FFFFFF";
    const isAr = exportLang === "ar"; const isEn = exportLang === "en";
    const dir2 = isAr ? "right" : "left";
    const SH = (prs as any).ShapeType?.rect || "rect";
    const total = budget?.items?.reduce((s: number, x: any) => s + (x.total || 0), 0) || 0;
    const indh = budget?.indhContribution ?? Math.min(Math.round(total * 0.9), 100_000);
    const apport = budget?.beneficiaryContribution ?? (total - indh);
    const clip = (txt: string, n: number) => !txt ? "" : (txt.length <= n ? txt : txt.slice(0, n).replace(/\s\S*$/, "…"));

    const L = {
      cover: isAr?"العرض التقديمي أمام اللجنة":isEn?"Committee Presentation":"Présentation Comité",
      identite: isAr?"هوية حامل المشروع":isEn?"Holder Identification":"Identification du Porteur",
      presentation: isAr?"تقديم المشروع":isEn?"Project Presentation":"Présentation du Projet",
      equip: isAr?"المنتجات والتجهيزات":isEn?"Products & Equipment":"Produits & Équipements",
      marche: isAr?"السوق والزبائن":isEn?"Market & Customers":"Marché & Clientèle",
      modele: isAr?"النموذج الاقتصادي":isEn?"Economic Model":"Modèle Économique",
      impact: isAr?"الأثر الاجتماعي":isEn?"Social Impact":"Impact Social",
      budgetS: isAr?"الميزانية التفصيلية":isEn?"Detailed Budget":"Budget Détaillé",
      durabilite: isAr?"الاستدامة والتطوير":isEn?"Sustainability & Growth":"Durabilité & Développement",
      recommandation: isAr?"توصية اللجنة":isEn?"Committee Recommendation":"Recommandation du Comité",
      numeroL: isAr?"رقم الملف":isEn?"File N°":"N° Dossier",
      tpeLine: isAr?"مقاولة صغيرة جداً — مدعومة من المبادرة الوطنية للتنمية البشرية (المرحلة الثالثة)":isEn?"Very small business (micro-enterprise) — supported by INDH Phase 3":"Très petite entreprise (TPE) — soutenue par l'Initiative Nationale pour le Développement Humain (INDH), Phase 3",
    };
    const headerBar = (sl: any, txt: string) => {
      sl.addShape(SH, {x:0,y:0,w:10,h:0.78,fill:{color:NAVY}});
      sl.addText(txt, {x:0.3,y:0,w:9.4,h:0.78,fontSize:19,color:YELLOW,bold:true,fontFace:"Arial",valign:"middle",align:dir2 as any});
    };

    // 1. Cover
    let s = prs.addSlide(); s.background = {color:NAVY};
    s.addShape(SH, {x:0,y:0,w:10,h:0.1,fill:{color:YELLOW}});
    s.addShape(SH, {x:0,y:5.53,w:10,h:0.1,fill:{color:YELLOW}});
    s.addText(L.cover, {x:0.5,y:0.9,w:9,h:0.5,fontSize:16,color:"AAAAAA",align:"center",fontFace:"Arial"});
    s.addText(proj?.projectName || "", {x:0.5,y:1.6,w:9,h:1.0,fontSize:30,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
    s.addText(`${proj?.sector||""} · ${proj?.location||regionDisplay(profile)||""}`, {x:0.5,y:2.7,w:9,h:0.4,fontSize:13,color:WHITE,align:"center",fontFace:"Arial"});
    s.addText(L.tpeLine, {x:0.5,y:3.1,w:9,h:0.45,fontSize:10,color:"CCCCCC",italic:true,align:"center",fontFace:"Arial",wrap:true});
    if (numero) s.addText(`${L.numeroL}: ${numero}`, {x:0.5,y:3.55,w:9,h:0.35,fontSize:11,color:"888888",align:"center",fontFace:"Arial"});
    s.addText(`${name||""} ${profile?.lastName||""}`, {x:0.5,y:4.3,w:9,h:0.4,fontSize:14,color:WHITE,align:"center",fontFace:"Arial"});
    s.addText("INDH Phase 3 · IdeaMap", {x:0.5,y:4.9,w:9,h:0.3,fontSize:10,color:"666666",align:"center"});

    // 2. Identification du porteur
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.identite);
    const idRows = [
      [isAr?"الاسم":isEn?"Name":"Nom", `${name||""} ${profile?.lastName||""}`],
      [isAr?"العمر":isEn?"Age":"Âge", String(profile?.age||"—")],
      [isAr?"الجنس":isEn?"Gender":"Genre", profile?.gender||"—"],
      [isAr?"الهاتف":isEn?"Phone":"Téléphone", profile?.phone||"—"],
      [isAr?"الجهة":isEn?"Region":"Région", regionDisplay(profile)||"—"],
      [isAr?"نوع الحامل":isEn?"Holder type":"Type de porteur", profile?.projType||"—"],
    ];
    idRows.forEach((row, i) => {
      const y = 1.1 + i*0.65;
      s.addShape(SH, {x:0.4,y,w:9.2,h:0.55,fill:{color:i%2===0?"FFFFFF":"F0EEE9"},line:{color:"CCCCCC",pt:0.5}});
      s.addText(row[0], {x:0.55,y,w:4,h:0.55,fontSize:12,color:GR,bold:true,fontFace:"Arial",valign:"middle",align:dir2 as any});
      s.addText(row[1], {x:4.6,y,w:4.9,h:0.55,fontSize:13,color:ND,fontFace:"Arial",valign:"middle",align:dir2 as any});
    });

    // 3. Présentation du projet
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.presentation);
    if (proj?.targetProfile) s.addText(clip(proj.targetProfile, 280), {x:0.4,y:1.05,w:9.2,h:1.3,fontSize:13,color:"222222",wrap:true,fontFace:"Arial",align:dir2 as any});
    if (proj?.localProblem) {
      s.addShape(SH, {x:0.4,y:2.5,w:9.2,h:0.08,fill:{color:YELLOW+"88"}});
      s.addText(clip(proj.localProblem, 200), {x:0.4,y:2.7,w:9.2,h:1.0,fontSize:12,color:"444444",wrap:true,fontFace:"Arial",italic:true,align:dir2 as any});
    }

    // 4. Produits/Services et équipements
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.equip);
    const acts = proj?.activities || [];
    acts.slice(0,4).forEach((a: string, i: number) => {
      s.addShape(SH, {x:0.4,y:1.05+i*0.5,w:9.2,h:0.44,fill:{color:i%2===0?"FFFFFF":"F0EEE9"},line:{color:"CCCCCC",pt:0.5}});
      s.addText(`• ${clip(a,100)}`, {x:0.55,y:1.05+i*0.5,w:9.0,h:0.44,fontSize:12,color:ND,fontFace:"Arial",valign:"middle",align:dir2 as any});
    });
    if (budget?.items?.length) {
      const rows = [
        [{text:isAr?"البند":isEn?"Item":"Désignation",options:{bold:true,color:WHITE}},{text:isAr?"المجموع":isEn?"Total":"Total",options:{bold:true,color:WHITE}}],
        ...budget.items.slice(0,5).map((x: any) => [clip(x.item||"",45), `${Number(x.total||0).toLocaleString()} MAD`]),
      ];
      s.addTable(rows, {x:0.4,y:3.3,w:9.2,colW:[6.6,2.6],fontSize:9.5,color:ND,border:{type:"solid",color:"CCCCCC",pt:0.5},fill:{color:WHITE},fontFace:"Arial"});
    }

    // 5. Marché et clientèle
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.marche);
    if (plan?.marketAnalysis) s.addText(clip(plan.marketAnalysis, 420), {x:0.4,y:1.1,w:9.2,h:3.8,fontSize:13,color:"222222",wrap:true,fontFace:"Arial",align:dir2 as any});

    // 6. Modèle économique
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.modele);
    if (proj?.revenueModel) s.addText(clip(proj.revenueModel, 220), {x:0.4,y:1.1,w:9.2,h:1.3,fontSize:13,color:"222222",wrap:true,fontFace:"Arial",align:dir2 as any});
    if (plan?.businessModel) s.addText(clip(plan.businessModel, 320), {x:0.4,y:2.6,w:9.2,h:2.3,fontSize:12,color:"444444",wrap:true,fontFace:"Arial",align:dir2 as any});

    // 7. Impact social
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.impact);
    s.addShape(SH, {x:0.4,y:1.1,w:2.6,h:1.3,fill:{color:"1C7A62"}});
    s.addText(String(proj?.beneficiaries||"—"), {x:0.4,y:1.15,w:2.6,h:0.75,fontSize:40,color:WHITE,bold:true,align:"center",fontFace:"Arial"});
    s.addText(isAr?"مستفيد":isEn?"beneficiaries":"bénéficiaires", {x:0.4,y:1.95,w:2.6,h:0.35,fontSize:9,color:"DDFFEE",align:"center",fontFace:"Arial"});
    if (plan?.socialImpact) s.addText(clip(plan.socialImpact, 260), {x:3.2,y:1.1,w:6.4,h:2.3,fontSize:12,color:"222222",wrap:true,fontFace:"Arial",align:dir2 as any});

    // 8. Budget détaillé
    s = prs.addSlide(); s.background = {color:NAVY};
    s.addShape(SH, {x:0,y:0,w:10,h:0.78,fill:{color:"2A5CE0"}});
    s.addText(L.budgetS, {x:0.3,y:0,w:9.4,h:0.78,fontSize:19,color:WHITE,bold:true,fontFace:"Arial",valign:"middle",align:dir2 as any});
    s.addText(`${isAr?"الكلفة الإجمالية":isEn?"Total cost":"Coût total"}: ${total.toLocaleString()} MAD`, {x:0.4,y:1.0,w:9.2,h:0.4,fontSize:14,color:WHITE,bold:true,fontFace:"Arial"});
    s.addText(`${isAr?"مساهمة المبادرة (90%)":isEn?"INDH (90%)":"INDH (90%)"}: ${indh.toLocaleString()} MAD`, {x:0.4,y:1.45,w:9.2,h:0.35,fontSize:12,color:YELLOW,fontFace:"Arial"});
    s.addText(`${isAr?"مساهمة الحامل (10%)":isEn?"Holder (10%)":"Apport porteur (10%)"}: ${apport.toLocaleString()} MAD`, {x:0.4,y:1.85,w:9.2,h:0.35,fontSize:12,color:"CCCCCC",fontFace:"Arial"});
    if (budget?.items?.length) {
      const rows = [
        [{text:isAr?"الفئة":isEn?"Category":"Catégorie",options:{bold:true,color:YELLOW}},{text:isAr?"البند":isEn?"Item":"Désignation",options:{bold:true,color:YELLOW}},{text:isAr?"المجموع":isEn?"Total":"Total",options:{bold:true,color:YELLOW}}],
        ...budget.items.slice(0,7).map((x: any) => [clip(x.category||"",18), clip(x.item||"",38), `${Number(x.total||0).toLocaleString()} MAD`]),
      ];
      s.addTable(rows, {x:0.4,y:2.4,w:9.2,colW:[2.0,5.1,2.1],fontSize:8.5,color:WHITE,border:{type:"solid",color:"334466",pt:0.5},fontFace:"Arial"});
    }

    // 9. Durabilité et plan de développement
    s = prs.addSlide(); s.background = {color:"FAF7F0"};
    headerBar(s, L.durabilite);
    if (plan?.operationalPlan) s.addText(clip(plan.operationalPlan, 320), {x:0.4,y:1.1,w:9.2,h:2.0,fontSize:12,color:"222222",wrap:true,fontFace:"Arial",align:dir2 as any});
    if (plan?.indh_alignment) {
      s.addShape(SH, {x:0.4,y:3.3,w:9.2,h:0.8,fill:{color:"0A0F2C"}});
      s.addText(`🏛️ ${clip(plan.indh_alignment, 180)}`, {x:0.55,y:3.3,w:8.9,h:0.8,fontSize:11,color:YELLOW,bold:true,fontFace:"Arial",valign:"middle",wrap:true,align:dir2 as any});
    }

    // 10. Recommandation du comité
    s = prs.addSlide(); s.background = {color: comp?.eligible ? NAVY : "2A0A0A"};
    s.addText(L.recommandation, {x:0.5,y:0.5,w:9,h:0.6,fontSize:20,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
    if (comp) {
      s.addText(`${comp.score}/100`, {x:0.5,y:1.2,w:9,h:1.0,fontSize:48,color: comp.eligible?"22C55E":"EF4444",bold:true,align:"center",fontFace:"Arial"});
      s.addText(comp.eligible
        ? (isAr?"✅ مؤهل للتمويل":isEn?"✅ Eligible for funding":"✅ Éligible au financement")
        : (isAr?"⚠️ يتطلب تعديلات":isEn?"⚠️ Requires adjustments":"⚠️ Nécessite des ajustements"),
        {x:0.5,y:2.2,w:9,h:0.5,fontSize:16,color:WHITE,bold:true,align:"center",fontFace:"Arial"});
    }
    (comp?.recommendations||[]).slice(0,3).forEach((r: string, i: number) => {
      s.addText(`• ${clip(r,110)}`, {x:0.6,y:3.0+i*0.5,w:8.8,h:0.46,fontSize:11,color:"CCCCCC",fontFace:"Arial",wrap:true,align:dir2 as any});
    });
    s.addText("IdeaMap · ideamaponline.org", {x:0.5,y:5.15,w:9,h:0.25,fontSize:8,color:"555555",align:"center",fontFace:"Arial"});

    await prs.writeFile({fileName: `PresentationComite_${proj?.projectName || "IdeaMap"}.pptx`});
  } catch (e) {
    console.error("Comité PPTX error:", e);
    showToast(lang==="ar"?"فشل إنشاء ملف PowerPoint":lang==="fr"?"Erreur lors de la création du fichier PowerPoint":"PowerPoint generation failed", "error");
  }
}

/* ════════════════════════════════════════════════════════
   HOLDER APP
════════════════════════════════════════════════════════ */
function HolderApp({lang, setLang, user, onLogout, t, onSaveProject, initialState, customQuestions}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; onSaveProject: (d: any) => void; initialState?: any;
  // A coordinator's uploaded questionnaire, if the holder registered under a
  // coordinator who has one — replaces the built-in fixed questions below.
  customQuestions?: CoordQuestion[];
}) {
  const [step, setStep]    = useState(initialState?.step || "idea");
  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; }, [step]);
  const [idea, setIdea]    = useState(initialState?.idea || "");
  const [msgs, setMsgs]    = useState<any[]>(initialState?.msgs || []);
  const [inp, setInp]      = useState("");
  const [busy, setBusy]    = useState(false);
  const [qN, setQN]        = useState(initialState?.qN || 0);
  const [proj, setProj]    = useState<any>(initialState?.proj || null);
  const [plan, setPlan]    = useState<any>(initialState?.plan || null);
  const [budget, setBudget]= useState<any>(initialState?.budget || null);
  const [comp, setComp]    = useState<any>(initialState?.comp || null);
  const [docs, setDocs]    = useState<Record<number, boolean>>(initialState?.docs || {});
  const [logo, setLogo]    = useState<any>(initialState?.logo || null);
  const [logoStyle, setLogoStyle] = useState(initialState?.logoStyle ?? 0); // 0=gradient burst, 1=moroccan star, 2=diagonal split
  const [docFiles, setDocFiles] = useState<Record<number, string>>(initialState?.docFiles || {});
  const [pendingAttach, setPendingAttach]   = useState<number | null>(null);
  const [suggestions, setSuggestions]       = useState<string[]>(initialState?.suggestions || []);
  const [qBank, setQBank]                   = useState<(string[] | undefined)[]>(initialState?.qBank || []);
  const [brief, setBrief]                   = useState(initialState?.brief || "");
  const [currentQ, setCurrentQ]             = useState(initialState?.currentQ || "");
  // True once the CURRENTLY shown question's options came from AI tailoring rather
  // than the instant generic fallback — gates the background-upgrade effect below.
  const [suggTailored, setSuggTailored]     = useState(false);
  // True once `proj` was compiled by AI rather than the instant local draft.
  const [projTailored, setProjTailored]     = useState(true);
  // Same, for `plan`/`budget` — true once AI-compiled rather than the instant
  // local draft built from SECTOR_EQUIPMENT + proj.
  const [planTailored, setPlanTailored]     = useState(true);
  // Same, for `comp` — true once AI-compiled rather than the instant local
  // rule-based estimate built from proj/budget.
  const [compTailored, setCompTailored]     = useState(true);
  const [dlLang, setDlLang]                 = useState(lang);
  const [docxBusy, setDocxBusy]             = useState<"projet" | "technique" | "plan" | null>(null);
  const [toast, setToast]                   = useState<{msg: string; type: "error"|"success"} | null>(null);
  // Keep download language in sync with the UI language unless the user has explicitly overridden it
  useEffect(() => { setDlLang(lang); }, [lang]);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const msgEnd        = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const LL  = lang === "ar" ? "arabe" : lang === "fr" ? "français" : "anglais";

  // Fixed question set — a full INDH project fiche's worth of questions (identification,
  // porteur profile, market/positioning, beneficiaries/impact, financing, sustainability),
  // in the same spirit as a real project fiche. The QUESTION TEXT is always this — never
  // AI-generated — so it can never drift into a vague paragraph. Only the tap-to-answer
  // OPTIONS are tailored to the project's nature (sector/idea), via a single upfront AI
  // call in startChat().
  const BUILTIN_FIXED_Q: {fr: string; ar: string; en: string}[] = HOLDER_QUESTIONS;
  // A coordinator's uploaded questionnaire replaces the built-in set entirely when
  // present. Each question already carries its own fr/ar/en text (the upload
  // pipeline merges bilingual FR/AR pairs in the source document, or translates
  // a single-language document) — same shape as BUILTIN_FIXED_Q, so it drops in
  // with no other change needed anywhere the fixed set is used.
  const usingCustomQ = !!customQuestions && customQuestions.length > 0;
  const FIXED_Q: {fr: string; ar: string; en: string}[] = usingCustomQ ? customQuestions! : BUILTIN_FIXED_Q;
  const MAX_Q = FIXED_Q.length;
  const fixedQText = (i: number) => FIXED_Q[i][lang as "fr"|"ar"|"en"] || FIXED_Q[i].fr;
  // Every other question is tap-only (3 concrete, always-clickable options —
  // see localOptionsFor) so answers stay structured and feed the committee
  // Excel's columns directly. These 4 are the exception: a project name, a
  // precise location, the exact equipment to buy, and the exact cost in MAD
  // genuinely can't be reduced to 3 preset choices without throwing away the
  // real figure the budget math depends on. Only applies to the built-in
  // fiche — a coordinator's own uploaded questionnaire has no fixed shape to
  // match indices against, so it keeps free text throughout.
  const FREE_TEXT_Q = new Set([0, 2, 17, 18]);
  const qAllowsFreeText = usingCustomQ || FREE_TEXT_Q.has(qN - 1);

  useEffect(() => { msgEnd.current?.scrollIntoView({behavior: "smooth"}); }, [msgs]);

  useEffect(() => {
    if (proj || step !== "idea" || msgs.length > 0) onSaveProject({id: user.id, name: user.name, profile: user.profile, idea, msgs, qN, proj, plan, budget, comp, step, docs, logo, logoStyle, docFiles, brief, currentQ, suggestions, qBank});
  }, [proj, plan, comp, step, logo, logoStyle, docs, msgs, budget, brief, currentQ]);

  // Auto-check Business Plan doc (#8) when plan is generated — matches its "Généré automatiquement ✓" label
  useEffect(() => {
    if (plan && !docs[8]) setDocs(p => ({...p, 8: true}));
  }, [plan]);

  // Scroll to top on step transitions so users see the new step header
  useEffect(() => {
    window.scrollTo({top: 0, behavior: "smooth"});
  }, [step]);

  // Silently upgrade the currently-shown question's tap options from the instant
  // generic set to AI-tailored ones, if the background batch (started in startChat)
  // delivers them before the user answers. No-op once the user has moved on.
  useEffect(() => {
    if (step !== "dialogue" || suggTailored || qN < 1) return;
    const tailored = qBank[qN - 1];
    if (tailored) { setSuggestions(tailored); setSuggTailored(true); }
  }, [qBank, qN, step, suggTailored]);

  // Cancel any pending toast timer on unmount to avoid setState-on-unmounted warning
  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const showToast = (msg: string, type: "error"|"success" = "error") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({msg, type});
    toastTimerRef.current = setTimeout(() => setToast(null), 4500);
  };

  // Auto-retries up to 5× with exponential back-off before surfacing any error.
  // The server-side cascade (providers.ts) races ~10 providers plus 2 sequential
  // sweeps, so a client retry only fires when EVERY provider was exhausted at that
  // instant — likely a shared free-tier rate-limit window (resets in tens of seconds
  // under many concurrent users, not minutes), so persisting here converts a near-miss
  // into a success instead of a user-facing "unavailable" message.
  const ai = async (messages: any[], system: string, task: "json" | "dialogue" = "dialogue", maxTokens?: number): Promise<string> => {
    // The server's own rafiq() cascade already races/retries across ~15-20 provider
    // attempts internally within a firm 45s deadline (see providers.ts) — one call
    // here already represents an exhaustive attempt. Retrying that whole cascade many
    // times client-side (previously 5x at 65s each, compounding to ~11 minutes when
    // stacked with ensureJson's own retry) just makes a stuck user stare at a spinner
    // far longer than any single call could ever plausibly need. Two attempts is
    // enough to smooth over one transient blip without multiplying the wait.
    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000));
        const r = await fetch("/api/ai", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({messages, system, task, ...(maxTokens ? {max_tokens: maxTokens} : {})}),
          signal: AbortSignal.timeout(50_000),
        });
        const d = await r.json();
        if (d.error) {
          if (attempt < MAX_RETRIES - 1) continue;
          // Every caller of ai() has its own graceful fallback (tap-option generic
          // suggestions, or the local profile compile below) — surfacing a "busy"
          // toast here would alarm the user right before that fallback quietly
          // completes the step anyway, which defeats the point of having one.
          return "";
        }
        return d.content?.[0]?.text || "";
      } catch {
        if (attempt < MAX_RETRIES - 1) continue;
        // Same reasoning as the d.error branch above: every caller already
        // recovers gracefully on its own, so this would only ever be shown
        // moments before that recovery quietly finishes the step.
        return "";
      }
    }
    return "";
  };

  const parseJ = (txt: string) => {
    try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
  };

  // Every JSON-structured generation step (plan, budget, compliance, logo) shares the
  // same risk as the dialogue step: the model occasionally ignores the "JSON only"
  // instruction. Retry once with a blunt reminder before surfacing a failure to the
  // user — this is what turns an occasional model slip into a reliably good result
  // instead of a manual "try again" click every time.
  const ensureJson = async (
    convo: {role: string; content: string}[], system: string, maxTokens?: number
  ): Promise<any> => {
    const r = await ai(convo, system, "json", maxTokens);
    let p = parseJ(r);
    if (!p) {
      const retryR = await ai(convo,
        system + `\n\nIMPORTANT: ta dernière réponse n'était pas un JSON valide. Réponds UNIQUEMENT avec le JSON demandé ci-dessus, sans aucun texte, question ou explication avant ou après.`,
        "json", maxTokens);
      p = parseJ(retryR);
    }
    return p;
  };

  // Last-resort fallback only — used when a question index has no local option set
  // below (shouldn't normally happen, all 30 are covered) and AI tailoring hasn't
  // landed yet either.
  const genericOptions = (): string[] => [
    lang === "ar" ? "استخدم أفضل تقدير" : lang === "fr" ? "Utilisez votre meilleure estimation" : "Use your best estimate",
    lang === "ar" ? "كما في فكرتي الأصلية" : lang === "fr" ? "Comme dans mon idée de départ" : "As in my original idea",
    lang === "ar" ? "سأكتب إجابتي بنفسي" : lang === "fr" ? "Je préfère écrire ma réponse" : "I'll write my own answer",
  ];

  // Tap-options are never worth blocking on a network call for — the question flow
  // shows this instantly the moment a question appears, then silently upgrades to
  // AI-tailored options if the background batch (see startChat) delivers them before
  // the user answers. This is what makes 50+ concurrent users a non-issue for this
  // step: nobody is ever waiting on AI to proceed, tailoring is a pure enhancement.
  //
  // Unlike the old genericOptions() (meta-choices like "use your best estimate" that
  // just push the user toward typing anyway), these are REAL, idea/sector-specific
  // answer choices computed instantly client-side from data already collected at
  // registration (sector, city, region) and the idea text — no AI call needed, no
  // wait, and meaningfully less typing than before even in the worst case where the
  // AI-tailored batch never lands.
  // Sector picks WHICH bundle of 3 real choices to show (18 sectors, not just
  // "Coiffure/Beauté" — every sector in SECTOR_SERVICES/SECTOR_EQUIPMENT has its
  // own set). But the sector alone can't distinguish a men's barbershop from a
  // women's beauty salon, or a bakery from a jam-maker within the same sector —
  // that distinction lives in what the porteur actually wrote as their idea.
  // reorderByIdea nudges whichever of the 3 options best matches words already
  // in the idea text to the front, so the flow adapts to the specific PROJECT,
  // not just its broad category.
  const STOPWORDS = new Set(["de","du","des","la","le","les","et","ou","en","un","une","à","au","aux","pour","dans","avec","sur","d","l","من","في","على","و","أو","إلى","and","or","for","in","with","on","the","a","an","mon","ma","mes","ce","cette"]);
  const kwFrom = (s: string): string[] => s.toLowerCase().replace(/[()"„""«»?؟]/g, " ").split(/[\s,\/]+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
  const EXTRA_HINTS: Record<string, string[][]> = {
    "Coiffure/Beauté": [
      ["homme","hommes","barbe","barber","messieurs","رجال","رجل","لحية"],
      ["femme","femmes","dame","dames","سيدات","نساء","امرأة"],
      ["complet","tous","famille","عائلة","جميع","متكامل"],
    ],
    "Restauration/Café": [
      ["thé","café","salon","قهوة","شاي"],
      ["rapide","snack","sandwich","سريع","وجبات"],
      ["traditionnel","marocain","تقليدي","مغربي"],
    ],
    "Agro-alimentaire": [
      ["huile","miel","terroir","زيت","عسل"],
      ["confiture","conserve","مربى","تعليب"],
      ["pâtisserie","boulangerie","حلويات","مخبزة","خبز"],
    ],
    "Numérique/TIC": [
      ["site","application","web","تطبيق","موقع"],
      ["formation","cours","تكوين","دروس"],
      ["maintenance","réseau","صيانة","شبكات"],
    ],
  };
  // Scores each of a sector's 3 options against the idea text (checking words
  // from ALL THREE language variants plus EXTRA_HINTS, so it works regardless of
  // which language the porteur typed their idea in or the UI is showing) and
  // returns the best-matching option's index, or -1 if nothing matched. Computed
  // ONCE per table so the same underlying option is promoted consistently across
  // fr/ar/en, instead of the display language accidentally picking a different one.
  const bestOptionIndex = (table: Record<string, Record<"fr"|"ar"|"en", string[]>>, sectorKey: string, ideaText: string): number => {
    const set = table[sectorKey];
    if (!set) return -1;
    const ideaLower = ideaText.toLowerCase();
    if (!ideaLower.trim()) return -1;
    const hints = EXTRA_HINTS[sectorKey];
    const n = set.fr.length;
    const scores = Array.from({length: n}, (_, i) => {
      const words = [...kwFrom(set.fr[i]), ...kwFrom(set.ar[i]), ...kwFrom(set.en[i]), ...(hints?.[i] || [])];
      return words.reduce((s, w) => s + (ideaLower.includes(w) ? 1 : 0), 0);
    });
    const best = scores.indexOf(Math.max(...scores));
    return scores[best] > 0 ? best : -1;
  };
  const reorderByIndex = (options: string[] | undefined, bestIdx: number): string[] | undefined => {
    if (!options || bestIdx <= 0) return options;
    return [options[bestIdx], ...options.filter((_, i) => i !== bestIdx)];
  };

  const localOptionsFor = (qIndex: number, ideaText: string): string[] => {
    // The built-in per-index sector heuristics below assume BUILTIN_FIXED_Q's own
    // question topics — meaningless against a coordinator's arbitrary custom
    // questionnaire. Generic options until the AI-tailoring batch (which reads the
    // actual question text, not its index) upgrades them moments later.
    if (usingCustomQ) return genericOptions();
    const sector = user.profile?.sector || "";
    const city = user.profile?.arrondissement || user.profile?.region || (lang === "ar" ? "منطقتي" : lang === "fr" ? "ma ville" : "my city");
    const sectorLabel = sector || (lang === "ar" ? "نشاطي" : lang === "fr" ? "mon activité" : "my activity");
    const combinedIdea = `${ideaText} ${idea}`;
    const svcBest = bestOptionIndex(SECTOR_SERVICES, sector, combinedIdea);
    const equipBest = bestOptionIndex(SECTOR_EQUIPMENT, sector, combinedIdea);
    const svc = reorderByIndex(SECTOR_SERVICES[sector]?.[lang as "fr"|"ar"|"en"], svcBest);
    const equip = reorderByIndex(SECTOR_EQUIPMENT[sector]?.[lang as "fr"|"ar"|"en"], equipBest);
    // Short-circuit here rather than threading svc/equip through the trilingual T
    // table below — they're already resolved for the current `lang`, and stuffing
    // a single-language array into a {fr,ar,en} record under the wrong key was
    // exactly the bug that made idea-based reordering silently no-op outside French.
    if (qIndex === 4 && svc) return svc;
    if (qIndex === 17 && equip) return equip;
    // A project name can't be meaningfully suggested — no genuine "choice" exists
    // between plausible names the way it does for e.g. services or equipment.
    // Suggesting fake names would be presumptuous, not helpful. This is a direct,
    // open question: no tap options, straight to the free-text input.
    if (qIndex === 0) return [];
    // Q2's answer becomes proj.sector directly (buildLocalProfile: sector: answers[1]),
    // the same canonical French key SECTOR_SERVICES/SECTOR_EQUIPMENT/mapSectorToKey
    // and the committee Excel's "Secteur" column all expect. A meta-label like "a
    // different sector" tapped as the answer would store that literal placeholder
    // text as the project's sector — every downstream lookup, and the Fiche Projet's
    // own Secteur field, would then show nonsense. These two alternates are always
    // real sector names for that reason, never a description of a choice.
    const otherSectors = SECTORS.filter(s => s !== sector);
    const altSector1 = otherSectors[0] || "Commerce/Épicerie";
    const altSector2 = otherSectors[1] || "Artisanat traditionnel";

    const T: Record<number, Record<"fr"|"ar"|"en", string[]>> = {
      1: {
        fr: [sector || "Mon secteur déclaré à l'inscription", altSector1, altSector2],
        ar: [sector || "القطاع الذي صرحت به عند التسجيل", altSector1, altSector2],
        en: [sector || "The sector I declared at registration", altSector1, altSector2],
      },
      2: {
        fr: [`${city}, centre-ville`, `${city}, quartier périphérique`, "Un autre lieu"],
        ar: [`${city}، وسط المدينة`, `${city}، حي محيطي`, "مكان آخر"],
        en: [`${city}, city center`, `${city}, outer neighborhood`, "Somewhere else"],
      },
      3: {
        fr: [`Un service de ${sectorLabel} moderne et accessible pour le quartier`, "Une activité basée sur mon expérience personnelle", "Une offre combinant qualité et prix accessible"],
        ar: [`خدمة ${sectorLabel} عصرية وفي متناول سكان الحي`, "نشاط مبني على خبرتي الشخصية", "عرض يجمع بين الجودة والسعر المناسب"],
        en: [`A modern, accessible ${sectorLabel} service for the neighborhood`, "An activity built on my personal experience", "An offer combining quality and affordable pricing"],
      },
      // Reached only when the sector isn't in SECTOR_SERVICES (svc undefined) —
      // the sector-matched case already returned above.
      4: {
        fr: ["Un service ou produit unique et ciblé", "Une gamme de 2 à 3 services complémentaires", "Des produits/services réalisés sur mesure à la demande"],
        ar: ["خدمة أو منتج واحد ومحدد", "مجموعة من 2 إلى 3 خدمات مكملة", "منتجات/خدمات مُعدّة حسب الطلب"],
        en: ["One unique, focused product or service", "A range of 2-3 complementary services", "Made-to-order products/services on request"],
      },
      5: {
        fr: ["Moins d'1 an d'expérience", "1 à 3 ans d'expérience", "Plus de 3 ans d'expérience"],
        ar: ["أقل من سنة من الخبرة", "من سنة إلى 3 سنوات من الخبرة", "أكثر من 3 سنوات من الخبرة"],
        en: ["Less than 1 year of experience", "1 to 3 years of experience", "More than 3 years of experience"],
      },
      6: {
        fr: ["Formation professionnelle diplômante", "Formation autodidacte / pratique sur le terrain", "Aucune formation formelle pour l'instant"],
        ar: ["تكوين مهني بشهادة", "تعلم ذاتي / ممارسة ميدانية", "لا يوجد تكوين رسمي حالياً"],
        en: ["Certified vocational training", "Self-taught / hands-on field practice", "No formal training yet"],
      },
      7: {
        fr: ["Oui, une base de clients fidèles", "Quelques contacts, pas encore une base solide", "Non, je pars de zéro"],
        ar: ["نعم، لدي قاعدة زبائن أوفياء", "بعض المعارف، لكن ليس بعد قاعدة قوية", "لا، أبدأ من الصفر"],
        en: ["Yes, a loyal client base", "A few contacts, not yet a solid base", "No, starting from scratch"],
      },
      8: {
        fr: ["Les jeunes et familles de mon quartier", "Le grand public local", "Les femmes et mères de famille du quartier"],
        ar: ["شباب وعائلات حيي", "عموم سكان المنطقة", "نساء وأمهات الأسر في الحي"],
        en: ["Youth and families in my neighborhood", "The general local public", "Women and mothers in the neighborhood"],
      },
      9: {
        fr: ["Moins de 50 personnes par an", "50 à 200 personnes par an", "Plus de 200 personnes par an"],
        ar: ["أقل من 50 شخصاً في السنة", "من 50 إلى 200 شخص في السنة", "أكثر من 200 شخص في السنة"],
        en: ["Fewer than 50 people per year", "50 to 200 people per year", "More than 200 people per year"],
      },
      10: {
        fr: [`Manque d'offre de qualité en ${sectorLabel} dans le quartier`, "Difficulté d'accès local à ce service/produit", "Prix trop élevés des offres existantes"],
        ar: [`نقص العرض الجيد في ${sectorLabel} بالحي`, "صعوبة الوصول محلياً لهذه الخدمة/المنتج", "أسعار مرتفعة جداً للعروض الحالية"],
        en: [`Lack of quality ${sectorLabel} options in the neighborhood`, "Difficulty accessing this service/product locally", "Existing options are priced too high"],
      },
      11: {
        fr: ["Quelques petits commerces similaires", "Peu ou pas de concurrence directe", "Plusieurs concurrents bien établis"],
        ar: ["بعض المحلات الصغيرة المشابهة", "منافسة قليلة أو منعدمة", "عدة منافسين راسخين"],
        en: ["A few similar small businesses", "Little to no direct competition", "Several well-established competitors"],
      },
      12: {
        fr: ["Meilleure qualité et hygiène", "Prix plus accessibles", "Service plus rapide et organisé (digital)"],
        ar: ["جودة ونظافة أفضل", "أسعار في متناول الجميع", "خدمة أسرع ومنظمة (رقمياً)"],
        en: ["Better quality and hygiene", "More affordable prices", "Faster, better-organized (digital) service"],
      },
      13: {
        fr: ["Prix aligné sur le marché local", "Prix légèrement en dessous pour attirer les clients", "Prix premium justifié par la qualité"],
        ar: ["سعر يتماشى مع السوق المحلي", "سعر أقل قليلاً لجذب الزبائن", "سعر مرتفع نسبياً مبرر بالجودة"],
        en: ["Priced in line with the local market", "Slightly below market to attract customers", "Premium pricing justified by quality"],
      },
      14: {
        fr: ["Bouche-à-oreille et réseaux sociaux", "Offres de lancement et fidélité", "Réservation digitale (WhatsApp) et qualité de service"],
        ar: ["التوصية الشفهية ومواقع التواصل الاجتماعي", "عروض الانطلاق والولاء", "الحجز الرقمي (واتساب) وجودة الخدمة"],
        en: ["Word of mouth and social media", "Launch offers and loyalty perks", "Digital booking (WhatsApp) and service quality"],
      },
      15: {
        fr: ["Vente directe sur place", "Vente et prestations de service combinées", "Abonnements ou packs"],
        ar: ["البيع المباشر في المكان", "الجمع بين البيع وتقديم الخدمة", "اشتراكات أو باقات"],
        en: ["Direct on-site sales", "Combined product + service sales", "Subscriptions or bundles"],
      },
      16: {
        fr: ["Moins de 20 clients/semaine", "20 à 50 clients/semaine", "Plus de 50 clients/semaine"],
        ar: ["أقل من 20 زبوناً أسبوعياً", "من 20 إلى 50 زبوناً أسبوعياً", "أكثر من 50 زبوناً أسبوعياً"],
        en: ["Fewer than 20 customers/week", "20 to 50 customers/week", "More than 50 customers/week"],
      },
      // Reached only when the sector isn't in SECTOR_EQUIPMENT (equip undefined) —
      // the sector-matched case already returned above.
      17: {
        fr: ["Équipement professionnel de base", "Aménagement et mobilier du local", "Je préfère décrire l'équipement moi-même"],
        ar: ["معدات مهنية أساسية", "تجهيز وأثاث المحل", "أفضل وصف المعدات بنفسي"],
        en: ["Basic professional equipment", "Fit-out and furniture for the premises", "I'll describe the equipment myself"],
      },
      18: {
        fr: ["Moins de 30 000 MAD", "30 000 à 70 000 MAD", "Plus de 70 000 MAD"],
        ar: ["أقل من 30.000 درهم", "من 30.000 إلى 70.000 درهم", "أكثر من 70.000 درهم"],
        en: ["Under 30,000 MAD", "30,000 to 70,000 MAD", "Over 70,000 MAD"],
      },
      19: {
        fr: ["Oui, un courrier de soutien de la commune ou d'une association locale", "Oui, l'aide de ma famille (local, main-d'œuvre, matériel)", "Pas encore, mais je vais en obtenir avant le dépôt"],
        ar: ["نعم، رسالة دعم من الجماعة أو جمعية محلية", "نعم، مساعدة من عائلتي (محل، يد عاملة، معدات)", "ليس بعد، لكنني سأحصل عليه قبل إيداع الملف"],
        en: ["Yes, a support letter from the commune or a local association", "Yes, help from my family (premises, labor, equipment)", "Not yet, but I'll get one before filing"],
      },
      20: {
        fr: ["Moins de 100 000 MAD", "100 000 à 200 000 MAD", "Plus de 200 000 MAD"],
        ar: ["أقل من 100.000 درهم", "من 100.000 إلى 200.000 درهم", "أكثر من 200.000 درهم"],
        en: ["Under 100,000 MAD", "100,000 to 200,000 MAD", "Over 200,000 MAD"],
      },
      21: {
        fr: ["1 emploi (moi-même)", "2 emplois (moi + 1 assistant)", "3 emplois ou plus"],
        ar: ["فرصة شغل واحدة (أنا)", "فرصتا شغل (أنا + مساعد)", "3 فرص شغل أو أكثر"],
        en: ["1 job (myself)", "2 jobs (myself + 1 assistant)", "3 jobs or more"],
      },
      22: {
        fr: ["Formation de jeunes du quartier", "Service de proximité utile aux familles", "Amélioration de l'hygiène ou de la qualité de vie locale"],
        ar: ["تكوين شباب الحي", "خدمة قرب مفيدة للعائلات", "تحسين النظافة أو جودة الحياة المحلية"],
        en: ["Training young people locally", "A useful neighborhood service for families", "Improved hygiene or local quality of life"],
      },
      23: {
        fr: [`Dynamiser le commerce local à ${city}`, "Créer un lieu de référence dans le quartier", "Offrir un service qui manquait localement"],
        ar: [`تنشيط التجارة المحلية في ${city}`, "خلق مكان مرجعي في الحي", "تقديم خدمة كانت تنقص محلياً"],
        en: [`Boosting local commerce in ${city}`, "Becoming a go-to place in the neighborhood", "Filling a service gap locally"],
      },
      24: {
        fr: ["Moins de 5 clients/jour", "5 à 10 clients/jour", "Plus de 10 clients/jour"],
        ar: ["أقل من 5 زبائن يومياً", "من 5 إلى 10 زبائن يومياً", "أكثر من 10 زبائن يومياً"],
        en: ["Fewer than 5 customers/day", "5 to 10 customers/day", "More than 10 customers/day"],
      },
      25: {
        fr: ["Autofinancement par les revenus générés", "Réinvestissement progressif des bénéfices", "Développement de nouveaux services/produits"],
        ar: ["التمويل الذاتي من الدخل المحقق", "إعادة استثمار تدريجي للأرباح", "تطوير خدمات/منتجات جديدة"],
        en: ["Self-financed from generated revenue", "Gradual reinvestment of profits", "Developing new products/services"],
      },
      26: {
        fr: ["Concurrence locale", "Fluctuation de la demande / saisonnalité", "Manque de trésorerie au démarrage"],
        ar: ["المنافسة المحلية", "تذبذب الطلب / الموسمية", "نقص السيولة عند الانطلاق"],
        en: ["Local competition", "Demand fluctuation / seasonality", "Cash-flow shortage at launch"],
      },
      27: {
        fr: ["Différenciation par la qualité et le prix", "Épargne de précaution et gestion rigoureuse", "Diversification des services"],
        ar: ["التميز بالجودة والسعر", "ادخار احتياطي وتسيير صارم", "تنويع الخدمات"],
        en: ["Standing out on quality and price", "Precautionary savings and tight management", "Diversifying services"],
      },
      28: {
        fr: ["Ouvrir un deuxième point de vente", "Élargir la gamme de produits/services", "Recruter et former plus d'employés"],
        ar: ["فتح نقطة بيع ثانية", "توسيع مجموعة المنتجات/الخدمات", "توظيف وتكوين موظفين إضافيين"],
        en: ["Opening a second location", "Expanding the product/service range", "Hiring and training more staff"],
      },
      29: {
        fr: ["Projet réaliste porté par une expérience solide", "Fort impact social et création d'emplois", "Rentabilité rapide et faible risque"],
        ar: ["مشروع واقعي مبني على خبرة قوية", "أثر اجتماعي كبير وخلق فرص شغل", "ربحية سريعة ومخاطرة منخفضة"],
        en: ["A realistic project backed by solid experience", "Strong social impact and job creation", "Fast profitability and low risk"],
      },
    };
    return T[qIndex]?.[lang as "fr"|"ar"|"en"] || genericOptions();
  };

  // The other 3 of the dossier's 4 files for a holder's own flow — same
  // generators CoordDash's downloadHolderDocument uses, so a holder gets
  // the exact same real PPTX/DOCX a coordinator would pull on their behalf.
  const dlComitePresentation = (exportLang: string = dlLang) =>
    generateComitePresentation(exportLang, {proj, plan, budget, comp, profile: user.profile, name: user.name, numero: user.id}, lang, showToast);

  const dlDossierDocx = async (kind: "projet" | "technique" | "plan", exportLang: string = dlLang) => {
    setDocxBusy(kind);
    try {
      const data: DossierData = {proj, plan, budget, comp, profile: user.profile, name: user.name};
      const docxLib = await import("docx");
      const docxLang = exportLang as DocxLang;
      let blob: Blob; let filename: string;
      if (kind === "projet") { blob = await buildFicheProjetDoc(docxLib, data, docxLang, false); filename = `FicheProjet_${proj?.projectName||"IdeaMap"}.docx`; }
      else if (kind === "technique") { blob = await buildFicheTechniqueDoc(docxLib, data, docxLang, false); filename = `FicheTechnique_${proj?.projectName||"IdeaMap"}.docx`; }
      else { blob = await buildBusinessPlanDoc(docxLib, data, docxLang, false); filename = `BusinessPlan_${proj?.projectName||"IdeaMap"}.docx`; }
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {href: url, download: filename}).click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error("DOCX export error:", e);
      showToast(lang==="ar"?"فشل إنشاء الملف":lang==="fr"?"Erreur lors de la création du fichier":"File generation failed", "error");
    } finally {
      setDocxBusy(null);
    }
  };

  const INDH_CTX = `CONTEXTE INDH PHASE 3 MAROC — DONNÉES TERRAIN RÉELLES:
FINANCEMENT: L'INDH contribue jusqu'à 100 000 MAD maximum (plafond absolu de la subvention INDH). L'INDH couvre 90% du coût total des équipements, le porteur apporte 10% en espèces ou en nature (matériel, local, travail valorisé). Le coût total du projet peut donc atteindre environ 111 000 MAD (dont INDH = 100 000 MAD). Pas de remboursement — c'est une subvention à fonds perdus.
NATURE DU FINANCEMENT: L'INDH finance UNIQUEMENT les biens d'équipement productifs (machines professionnelles, matériel technique, outillage de production, mobilier de travail). Il NE finance PAS: aménagement/travaux de local (rénovation, électricité, peinture, plomberie — INTERDIT même pour un petit montant), matières premières, fonds de roulement, communication/marketing, loyers courants, salaires, frais d'établissement/immatriculation. Le budget INDH = les équipements qu'on achète une seule fois pour produire, PAS les travaux ni les charges mensuelles.
AXES PHASE 3 (choisir le plus pertinent):
  • Axe 1 — Développement rural: zones enclavées, agriculture, élevage, produits du terroir, irrigation, pistes rurales.
  • Axe 2 — Réduction des inégalités territoriales: périurbain pauvre, quartiers sous-équipés, services de proximité manquants.
  • Axe 3 — Dignité humaine: personnes en situation précaire, femmes vulnérables, personnes âgées, personnes en situation de handicap.
  • Axe 4 — Programmes transversaux: jeunesse, formation professionnelle, entrepreneuriat féminin, économie numérique.
RÉALITÉS ÉCONOMIQUES MAROCAINES (utiliser ces chiffres dans les réponses):
  • SMIG 2025: 2 828 MAD/mois (soit ~94 MAD/jour). Salaire moyen secteur informel: 1 500–2 500 MAD/mois.
  • Chômage national: 13,1%. Chômage jeunes urbains 18-35 ans: 34,8%. Taux pauvreté zones rurales: 9,5%.
  • Location petit local commercial (20–40m²): 800–2 500 MAD/mois selon la ville. Caution 2–3 mois.
  • Prix équipements typiques au Maroc: machine à coudre industrielle 3 500–8 000 MAD, four pâtisserie 12 000–28 000 MAD, congélateur 2 200–4 500 MAD, broyeur épices 1 800–3 500 MAD, matériel coiffure complet 8 000–15 000 MAD, tablette Android 800–1 500 MAD.
  • Canaux de vente efficaces au Maroc: souk hebdomadaire (pas de frais fixe), WhatsApp Business (gratuit), Facebook Marketplace, commandes quartier, dépôt-vente épiceries, marchés de producteurs.
CRITÈRES JURY INDH — PONDÉRATION OFFICIELLE (100 pts):
  • Impact social & nombre de bénéficiaires: 25 pts — citer EXACTEMENT: combien de femmes/jeunes/familles, revenu supplémentaire mensuel en MAD.
  • Viabilité économique: 20 pts — CA mensuel prévisionnel réaliste, marge brute, seuil de rentabilité en mois.
  • Pertinence territoriale: 20 pts — le projet répond à un manque RÉEL dans cette zone précise (absence de concurrent, besoin chiffré).
  • Capacité de gestion: 15 pts — expérience du porteur (même informelle: "3 ans de couture à domicile"), formation envisagée.
  • Durabilité: 10 pts — plan de survie après l'INDH: stocks, clients fidèles, partenariats locaux.
  • Innovation & originalité: 10 pts — quelque chose de différent dans le produit, la méthode, ou le public cible.
CE QUI CONVAINC LE JURY: profil vulnérable du porteur + chiffres précis + ancrage territorial fort + plan de pérennité concret.
RÈGLE ABSOLUE: porteur individuel ou groupe informel uniquement. Jamais association, coopérative ou GIE — ces structures ne sont pas éligibles au programme INDH Phase 3 porteurs.`;

  const startChat = (override?: string) => {
    const ideaText = (override ?? idea).trim();
    if (!ideaText) return;
    if (override) setIdea(override);
    const ideaPreview = ideaText.replace(/\n/g, " ").slice(0, 200);

    // Show Question 1 immediately with real, idea/sector-specific tap options — no
    // network wait at all. AI tailoring happens in the background (below) and
    // silently upgrades the options in place if it lands before the user answers.
    // This is what keeps the Questions step responsive regardless of how many other
    // users are hitting the same AI provider at once: nobody is ever blocked on a
    // network call to proceed.
    setBusy(false); setSuggTailored(false); setBrief(ideaPreview); setCurrentQ(fixedQText(0));
    setQBank([]); setStep("dialogue");
    setMsgs([{role: "user", content: ideaText}, {role: "assistant", content: fixedQText(0)}]);
    setSuggestions(localOptionsFor(0, ideaText));
    setQN(1);

    const arNote = lang === "ar" ? "\nمهم جداً: استخدم العربية الفصحى السليمة والبسيطة. جمل قصيرة جداً. لا دارجة مغربية." : "";
    const ideaMsg = [{role: "user", content: lang === "ar" ? `فكرتي: ${ideaText}` : `Mon idée: ${ideaText}`}];

    // Background: fetch AI-tailored options for ALL fixed questions, specific to this
    // idea/sector. Split into small chunks so a malformed/truncated response only costs
    // one chunk's questions, not the whole bank, and update qBank progressively as each
    // chunk resolves rather than waiting for all of them. Each chunk call already races
    // ~10 providers server-side, so running all 5 chunks fully in parallel would fire
    // ~50 simultaneous provider requests from this one user alone — at 50 concurrent
    // users that's ~2 500 requests hitting the same free-tier rate limits at once.
    // Cap in-flight chunks at 2 to keep this bounded.
    const CHUNK = 6;
    const chunks: {fr: string; ar: string; en: string}[][] = [];
    for (let i = 0; i < FIXED_Q.length; i += CHUNK) chunks.push(FIXED_Q.slice(i, i + CHUNK));

    runLimited(chunks.map((chunk, ci) => async () => {
      const qLines = chunk.map((_, j) => `Q${j + 1}: "${fixedQText(ci * CHUNK + j)}"`).join("\n");
      const schema = chunk.map((_, j) => `"q${j + 1}":["réponse A en ${LL}","réponse B en ${LL}","réponse C en ${LL}"]`).join(",");
      const bank = await ensureJson(ideaMsg,
        `Tu es le Conseiller INDH Phase 3 Maroc — expert terrain qui connaît bien les réalités des porteurs marocains.
${INDH_CTX}
Le porteur a partagé son idée: "${ideaText}"
Pour CHACUNE des ${chunk.length} questions ci-dessous, propose 3 réponses courtes, réalistes et SPÉCIFIQUES à CETTE idée précise (jamais générique, jamais coopérative/GIE). Réponds en ${LL}.${arNote}
Chaque option doit être une réponse complète et sélectionnable telle quelle — ne propose JAMAIS une option du type « je préfère écrire moi-même » ou « à préciser » : la plupart de ces questions n'ont plus de champ de texte libre, seules ces 3 options sont cliquables.

${qLines}

Retourne UNIQUEMENT ce JSON valide sans markdown:
{${schema}}`, 1500);
      setQBank(prev => {
        const next = [...prev];
        chunk.forEach((_, j) => {
          const idx = ci * CHUNK + j;
          // Question 0 (project name) never gets tap options, from the AI batch
          // or otherwise — see the matching guard in localOptionsFor. A suggested
          // name is exactly as presumptuous coming from the AI as it would be
          // hardcoded, so this is skipped regardless of what the model returns.
          // Question 1 (secteur) is skipped too, but for a different reason: its
          // answer becomes proj.sector verbatim, the exact canonical string
          // SECTOR_SERVICES/SECTOR_EQUIPMENT/mapSectorToKey and the committee
          // Excel's "Secteur" column key off — the AI has no guarantee of
          // returning one of those 18 exact names (it could just as easily
          // suggest "Boulangerie artisanale"), which would silently break every
          // sector-keyed lookup downstream. localOptionsFor's own 3 options for
          // this question are always real canonical sector names; nothing should
          // replace them with AI-invented ones.
          if (idx === 0 || idx === 1) return;
          const arr = bank?.[`q${j + 1}`];
          if (Array.isArray(arr) && arr.length) {
            next[idx] = arr.filter((s: any) => typeof s === "string" && s.trim()).slice(0, 3);
          }
        });
        return next;
      });
    }), 2).catch(() => {});
  };

  // Heuristic project profile built directly from the 30 collected answers, no AI
  // call required. Used both as the instant first draft (upgraded to the AI-compiled
  // version in the background) and as the last-resort fallback if AI compile fails.
  const buildLocalProfile = (all: {role: string; content: string}[]) => {
    const answers = all.filter((m, i) => i > 0 && m.role === "user").map(m => (m.content || "").trim());
    const numFrom = (s: string | undefined, fallback: number): number => {
      const text = s || "";
      // Grouped thousands ("28 000", "100 000", "100,000") — this app's own MAD
      // amounts are written exactly this way (see "100 000 MAD" throughout), so
      // reading only the first digit run would misread "28 000" as 28, not
      // 28000. Collapse the separators before parsing.
      const grouped = text.match(/\d{1,3}(?:[\s.,]\d{3})+/);
      if (grouped) return parseInt(grouped[0].replace(/[\s.,]/g, ""), 10);
      const digits = text.match(/\d{2,}/);
      return digits ? parseInt(digits[0], 10) : fallback;
    };
    return {
      projectName: answers[0] || idea.slice(0, 40),
      sector: answers[1] || user.profile?.sector || (lang === "ar" ? "نشاط ريادي" : lang === "fr" ? "Activité entrepreneuriale" : "Entrepreneurial activity"),
      legalStructure: lang === "ar" ? "حامل مشروع فردي" : lang === "fr" ? "Porteur individuel" : "Individual holder",
      location: answers[2] || user.profile?.arrondissement || user.profile?.region || "",
      beneficiaries: numFrom(answers[9], 10),
      targetProfile: answers[8] || idea.slice(0, 120),
      localProblem: answers[10] || idea.slice(0, 120),
      revenueModel: answers[15] || answers[4] || "",
      holderExperience: answers[5] || "",
      activities: [answers[4], answers[16], answers[17]].filter(Boolean).slice(0, 3),
      strengths: [
        lang === "ar" ? "معرفة ميدانية جيدة بالمنطقة والمستفيدين" : lang === "fr" ? "Bonne connaissance du terrain et des bénéficiaires visés" : "Strong local knowledge of the area and target beneficiaries",
        lang === "ar" ? "مشروع واضح يستجيب لحاجة محلية محددة" : lang === "fr" ? "Projet clair répondant à un besoin local identifié" : "Clear project addressing an identified local need",
      ],
      estimatedBudget: numFrom(answers[18], 70000),
      equipmentRequested: answers[17] || "",
      pillar: lang === "ar" ? "تحسين الدخل والإدماج الاقتصادي للشباب" : lang === "fr" ? "Amélioration du revenu et inclusion économique des jeunes" : "Income improvement and economic inclusion of youth",
    };
  };

  // Heuristic business plan text built directly from the collected project profile,
  // no AI required — the same "instant, no dependency on AI" principle already
  // applied to the questionnaire, extended to the step that matters most: this is
  // the step that actually states the funding request. Under 100+ concurrent users
  // sharing one free-tier AI provider, genPlan()'s two AI calls can both fail at
  // once — without this, that left the applicant stuck on a bare "regenerate"
  // button with no funding numbers at all.
  const buildLocalPlan = (p: any) => {
    const name = p?.projectName || (lang === "ar" ? "المشروع" : lang === "fr" ? "le projet" : "the project");
    const loc = p?.location || (lang === "ar" ? "المنطقة" : lang === "fr" ? "la région" : "the area");
    const sector = p?.sector || "";
    const ben = p?.beneficiaries || 10;
    const budget = p?.estimatedBudget || 70000;
    if (lang === "ar") return {
      executiveSummary: `"${name}" هو مشروع في قطاع ${sector} بمنطقة ${loc}، يستجيب لحاجة محلية ملموسة ويهدف إلى الاستفادة المباشرة لـ${ben} شخصاً على الأقل.`,
      problemStatement: p?.localProblem || `نقص ملحوظ في العرض المحلي المتعلق بـ${sector} في ${loc}.`,
      solution: p?.revenueModel || `تقديم خدمات/منتجات في مجال ${sector} تستجيب مباشرة للحاجة المحددة أعلاه.`,
      marketAnalysis: `السكان المستهدفون في ${loc} يشكلون سوقاً محلياً كافياً لانطلاق النشاط، مع منافسة محدودة أو غير منظمة.`,
      businessModel: `نموذج اقتصادي بسيط ومباشر مبني على البيع المحلي، مع هامش ربح يغطي المصاريف الثابتة خلال الأشهر الأولى.`,
      socialImpact: `استفادة مباشرة لـ${ben} شخصاً على الأقل، مع دخل إضافي وفرصة عمل مستدامة للحامل.`,
      operationalPlan: `الشهر 1: اقتناء المعدات وتهيئة المكان. الشهر 2-3: الانطلاق التجريبي وأولى الزبائن. الشهر 6-12: الوصول إلى وتيرة نشاط مستقرة.`,
      indh_alignment: p?.pillar || "تحسين الدخل والإدماج الاقتصادي للشباب",
      risks: [
        "خطر تجاري: منافسة محلية → الحل: التميز بالجودة والسعر",
        "خطر مالي: تأخر الانطلاق → الحل: تسيير صارم للميزانية",
        "خطر تشغيلي: نقص الخبرة → الحل: تكوين ومواكبة ميدانية",
      ],
      projections: { year1: budget * 2.3, year2: budget * 3, year3: budget * 3.8 },
    };
    if (lang === "en") return {
      executiveSummary: `"${name}" is a ${sector} project in ${loc}, addressing a concrete local need and directly benefiting at least ${ben} people.`,
      problemStatement: p?.localProblem || `A clear local gap in ${sector} services/products in ${loc}.`,
      solution: p?.revenueModel || `Offering ${sector} products/services that directly address the need above.`,
      marketAnalysis: `${loc}'s target population forms a sufficient local market to launch the activity, with limited or informal competition.`,
      businessModel: `A simple, direct business model based on local sales, with a margin covering fixed costs from the first months.`,
      socialImpact: `Direct benefit for at least ${ben} people, with additional income and a sustainable job for the holder.`,
      operationalPlan: `Month 1: equipment purchase and setup. Month 2-3: soft launch and first customers. Month 6-12: reaching a stable pace of activity.`,
      indh_alignment: p?.pillar || "Income improvement and economic inclusion of youth",
      risks: [
        "Commercial risk: local competition → Solution: stand out on quality and price",
        "Financial risk: delayed launch → Solution: strict budget management",
        "Operational risk: limited experience → Solution: training and field support",
      ],
      projections: { year1: budget * 2.3, year2: budget * 3, year3: budget * 3.8 },
    };
    return {
      executiveSummary: `"${name}" est un projet du secteur ${sector} implanté à ${loc}, répondant à un besoin local concret et bénéficiant directement à au moins ${ben} personnes.`,
      problemStatement: p?.localProblem || `Manque local identifié en matière de ${sector} à ${loc}.`,
      solution: p?.revenueModel || `Proposer des produits/services de ${sector} répondant directement au besoin identifié.`,
      marketAnalysis: `La population cible de ${loc} constitue un marché local suffisant pour lancer l'activité, avec une concurrence limitée ou peu structurée.`,
      businessModel: `Modèle économique simple et direct basé sur la vente locale, avec une marge couvrant les charges fixes dès les premiers mois.`,
      socialImpact: `Bénéfice direct pour au moins ${ben} personnes, avec un revenu complémentaire et un emploi durable pour le porteur.`,
      operationalPlan: `Mois 1 : acquisition des équipements et aménagement. Mois 2-3 : lancement et premiers clients. Mois 6-12 : atteinte d'un rythme d'activité stable.`,
      indh_alignment: p?.pillar || "Amélioration du revenu et inclusion économique des jeunes",
      risks: [
        "Risque commercial : concurrence locale → Solution : se différencier par la qualité et le prix",
        "Risque financier : retard au démarrage → Solution : gestion budgétaire rigoureuse",
        "Risque opérationnel : expérience limitée → Solution : formation et accompagnement de terrain",
      ],
      projections: { year1: budget * 2.3, year2: budget * 3, year3: budget * 3.8 },
    };
  };

  // Heuristic budget seeded from what the porteur actually said: their own
  // equipmentRequested answer becomes the first line item (verbatim, not
  // reworded), topped up with sector-known items (SECTOR_EQUIPMENT) only to
  // round out a reasonable budget. The total is the porteur's own stated
  // cost — 100 000 MAD is the INDH contribution's ceiling, not a target the
  // total gets pushed toward: a porteur who estimates 30 000 MAD stays at
  // 30 000 MAD, not inflated to a 55 000 MAD floor.
  const buildLocalBudget = (p: any) => {
    const sector = p?.sector || "";
    const equipFr = SECTOR_EQUIPMENT[sector]?.fr;
    const catLabel = lang === "ar" ? "معدات إنتاجية" : lang === "fr" ? "Équipements productifs" : "Productive equipment";
    const sectorNames = (equipFr && SECTOR_EQUIPMENT[sector]?.[lang as "fr"|"ar"|"en"]) || (
      lang === "ar" ? ["معدات مهنية أساسية", "أثاث وتجهيز المحل", "أدوات ومستلزمات التشغيل"]
      : lang === "en" ? ["Basic professional equipment", "Fit-out and furniture", "Operating tools and supplies"]
      : ["Équipement professionnel de base", "Aménagement et mobilier du local", "Outillage et fournitures d'exploitation"]
    );
    const stated = (p?.equipmentRequested || "").trim();
    const names = stated ? [stated, ...sectorNames.filter((n: string) => n !== stated)] : sectorNames;
    // Sanity ceiling only against a garbled extraction (e.g. a date or phone
    // number picked up as "the cost") — never a floor that overrides a real,
    // smaller, legitimate answer.
    const rawTotal = Math.min(p?.estimatedBudget || 70000, 300000);
    const splits = names.length >= 3 ? [0.5, 0.35, 0.15] : names.length === 2 ? [0.65, 0.35] : [1];
    const items = names.slice(0, 3).map((item: string, i: number) => {
      const total = Math.round((rawTotal * splits[i]) / 100) * 100;
      return { category: catLabel, item, quantity: 1, unitPrice: total, total };
    });
    const total = items.reduce((s: number, x: any) => s + x.total, 0);
    const indhContribution = Math.min(Math.round(total * 0.9), 100000);
    const beneficiaryContribution = total - indhContribution;
    return { items, indhContribution, beneficiaryContribution };
  };

  // Heuristic compliance assessment computed instantly from the already-collected
  // project/plan/budget — same "never block the applicant on AI" principle as
  // buildLocalPlan/buildLocalBudget, extended to the step that gates whether they
  // can even reach the jury materials. Scores against the same rubric the AI is
  // prompted with (impact/viability/relevance/management/sustainability/innovation),
  // using conservative baseline values rather than pretending to a jury-level
  // judgment call — this is a placeholder the AI upgrade replaces when it lands,
  // not a substitute for real review.
  const buildLocalCompliance = (p: any, bud: any) => {
    const ben = p?.beneficiaries || 10;
    const indhContribution = bud?.indhContribution ?? 0;
    const withinCap = indhContribution <= 100000;
    const impact = Math.min(25, Math.round(15 + Math.min(ben, 100) / 100 * 10));
    const juryScore = { impact, viability: 13, relevance: 13, management: 9, sustainability: 6, innovation: 5 };
    const score = Object.values(juryScore).reduce((s, n) => s + n, 0);
    const eligible = withinCap && score >= 60;
    const loc = p?.location || "";
    if (lang === "ar") return {
      eligible, score, pillar: p?.pillar || "تحسين الدخل والإدماج الاقتصادي للشباب",
      strengths: [
        `مشروع في قطاع ${p?.sector || "مؤهل"} يستجيب لحاجة محلية محددة${loc ? ` في ${loc}` : ""}`,
        `يستفيد منه ${ben} شخصاً على الأقل بشكل مباشر`,
      ],
      weaknesses: withinCap ? [] : [`مساهمة المبادرة (${indhContribution.toLocaleString()} درهم) تتجاوز السقف المحدد بـ 100,000 درهم`],
      recommendations: [
        "دقّق الأرقام (عدد الزبائن، رقم المعاملات الشهري) بمعطيات ميدانية أكثر تحديداً",
        "أرفق رسالة دعم من الجماعة أو جمعية محلية إن أمكن",
      ],
      juryScore,
    };
    if (lang === "en") return {
      eligible, score, pillar: p?.pillar || "Income improvement and economic inclusion of youth",
      strengths: [
        `A ${p?.sector || "eligible"} project addressing a specific local need${loc ? ` in ${loc}` : ""}`,
        `Directly benefits at least ${ben} people`,
      ],
      weaknesses: withinCap ? [] : [`INDH contribution (${indhContribution.toLocaleString()} MAD) exceeds the 100,000 MAD cap`],
      recommendations: [
        "Sharpen the numbers (customer count, monthly turnover) with more specific field data",
        "Attach a letter of support from the local commune or an association if possible",
      ],
      juryScore,
    };
    return {
      eligible, score, pillar: p?.pillar || "Amélioration du revenu et inclusion économique des jeunes",
      strengths: [
        `Projet du secteur ${p?.sector || "éligible"} répondant à un besoin local précis${loc ? ` à ${loc}` : ""}`,
        `Bénéficie directement à au moins ${ben} personnes`,
      ],
      weaknesses: withinCap ? [] : [`La contribution INDH demandée (${indhContribution.toLocaleString()} MAD) dépasse le plafond de 100 000 MAD`],
      recommendations: [
        "Préciser les chiffres (nombre de clients, chiffre d'affaires mensuel) avec des données de terrain plus concrètes",
        "Joindre une lettre de soutien de la commune ou d'une association locale si possible",
      ],
      juryScore,
    };
  };

  const sendMsg = (override?: string) => {
    const msg = override ?? inp;
    if (!msg.trim() || busy) return;
    const all = [...msgs, {role: "user", content: msg}];
    setMsgs(all); if (!override) setInp("");
    const last = qN >= MAX_Q;

    if (!last) {
      // Next question text is fixed — never AI-generated, so it can't drift. Its
      // tap-options come from the upfront batch call if it's landed by now, or the
      // instant idea/sector-specific local set otherwise — never a live network
      // wait to advance.
      const nextQ = fixedQText(qN);
      const cached = qBank[qN];
      setCurrentQ(nextQ);
      setMsgs((p: any[]) => [...p, {role: "assistant", content: nextQ}]);
      setSuggestions(cached || localOptionsFor(qN, idea));
      setSuggTailored(!!cached);
      setQN((p: number) => p + 1);
      return;
    }

    // Last question answered — show an instant local draft immediately, then
    // upgrade to an AI-compiled profile in the background if it lands before the
    // user moves on. The user is never blocked waiting on this network call.
    const convo = all.map((m: any) => ({role: m.role, content: m.content}));
    setBrief(""); setCurrentQ(""); setSuggestions([]);
    setMsgs((prev: any[]) => [...prev, {role: "assistant", content: lang === "ar" ? "✅ تم تحليل مشروعك بنجاح!" : lang === "fr" ? "✅ Analyse complète !" : "✅ Analysis complete!"}]);
    setProj(buildLocalProfile(all)); setProjTailored(false);
    setStep("profile");

    (async () => {
      let p = await ensureJson(convo,
        `Tu es le Conseiller INDH Phase 3 Maroc. Idée originale: "${idea}".
Analyse TOUTE la conversation et construis le profil projet le plus PRÉCIS possible.
IMPORTANT sur estimatedBudget: reprends le MONTANT RÉEL que le porteur a donné dans ses réponses (question sur le coût total) — ne l'arrondis pas vers 100 000 MAD, ne l'invente pas. S'il n'a donné aucun chiffre, fais une estimation sectorielle réaliste plutôt qu'un montant proche du plafond.
Retourne UNIQUEMENT ce JSON valide sans markdown ni texte autour:
{"projectName":"nom commercial accrocheur en ${LL}","sector":"secteur INDH exact (ex: Artisanat traditionnel)","legalStructure":"porteur individuel","location":"ville/commune/douar mentionné — si non précisé: région du profil","beneficiaries":N,"targetProfile":"description précise des bénéficiaires (femmes, jeunes, agriculteurs...)","localProblem":"problème local concret résolu par le projet","revenueModel":"comment le porteur va gagner de l'argent concrètement","holderExperience":"compétence/expérience du porteur","activities":["activité clé 1","activité clé 2","activité clé 3"],"strengths":["force SPÉCIFIQUE 1 alignée jury INDH","force SPÉCIFIQUE 2"],"estimatedBudget":N,"equipmentRequested":"reprends TEXTUELLEMENT ce que le porteur a dit vouloir acheter avec l'appui INDH — ne reformule pas","pillar":"axe INDH Phase 3 le plus pertinent"}`);
      if (!p) {
        const strictR = await ai(convo,
          `Tu es le Conseiller INDH Phase 3 Maroc. Idée originale: "${idea}".
Construis le profil projet le plus précis possible à partir de la conversation ci-dessus, en utilisant ta meilleure estimation pour toute information manquante ou imprécise.
Pour estimatedBudget: reprends le montant réel donné par le porteur, sans l'arrondir vers 100 000 MAD.
NE POSE AUCUNE QUESTION. N'AJOUTE AUCUN TEXTE. Réponds UNIQUEMENT avec ce JSON valide, rien d'autre:
{"projectName":"nom commercial accrocheur en ${LL}","sector":"secteur INDH exact (ex: Artisanat traditionnel)","legalStructure":"porteur individuel","location":"ville/commune/douar mentionné — si non précisé: région du profil","beneficiaries":N,"targetProfile":"description précise des bénéficiaires (femmes, jeunes, agriculteurs...)","localProblem":"problème local concret résolu par le projet","revenueModel":"comment le porteur va gagner de l'argent concrètement","holderExperience":"compétence/expérience du porteur","activities":["activité clé 1","activité clé 2","activité clé 3"],"strengths":["force SPÉCIFIQUE 1 alignée jury INDH","force SPÉCIFIQUE 2"],"estimatedBudget":N,"equipmentRequested":"reprends TEXTUELLEMENT ce que le porteur a dit vouloir acheter","pillar":"axe INDH Phase 3 le plus pertinent"}`,
          "json");
        p = parseJ(strictR);
      }
      // Only swap the draft for the refined version if the user is still looking at
      // it — if they've already moved on to Plan/Budget, leave what's already there.
      if (p && stepRef.current === "profile") { setProj(p); setProjTailored(true); }
    })().catch(() => {});
  };

  const genPlan = async () => {
    // Instant local draft first — same principle as the questionnaire and profile
    // steps: never block the applicant on a network call, especially not for the
    // step that states their actual funding request. AI runs in the background and
    // silently upgrades the draft if it lands before the user moves past
    // plan/budget. Guards on stepRef so a slow response can't clobber content the
    // user has already moved on from.
    setPlan(buildLocalPlan(proj)); setBudget(buildLocalBudget(proj)); setPlanTailored(false);
    setStep("plan");

    const projCtx = JSON.stringify(proj || {idea});
    const arQuality = lang === "ar"
      ? "\nمهم جداً: اكتب كل النصوص بالعربية الفصحى السليمة والواضحة. جمل كاملة ومنظمة. لا دارجة مغربية. لا حروف لاتينية داخل النصوص العربية."
      : "";
    (async () => {
    const [p, b] = await Promise.all([
      ensureJson([{role: "user", content: `Projet INDH: ${projCtx}`}],
        `Tu es un expert en montage de projets INDH Phase 3 au Maroc — tu as accompagné des dizaines de porteurs qui ont obtenu leur financement.
${INDH_CTX}
Génère un business plan PERCUTANT qui convaincra le jury INDH. Réponds en ${LL}.${arQuality}

RÈGLES IMPÉRATIVES pour un business plan qui obtient ≥75/100 au jury:
1. CHIFFRES RÉELS: utilise les prix du marché marocain (SMIG 2 828 MAD, loyers locaux, prix équipements réels). Cite des montants précis en MAD, jamais des fourchettes vagues.
2. ANCRAGE TERRITORIAL: nomme la ville/région/douar, cite un problème LOCAL chiffré (ex: "dans la commune de X, 38% des femmes sont sans emploi selon HCP 2024").
3. LANGAGE JURY: les 6 critères jury doivent transparaître — impact social (25pts), viabilité (20pts), pertinence territoriale (20pts), gestion (15pts), durabilité (10pts), innovation (10pts).
4. BÉNÉFICIAIRES PRÉCIS: toujours nommer le profil exact (ex: "24 femmes au foyer âgées de 18 à 45 ans du quartier Hay Mohammadi") avec le revenu supplémentaire en MAD.
5. MODÈLE ÉCONOMIQUE RÉEL: prix de vente précis, volume de clients semaine/mois, CA mensuel réaliste, marge brute en %, seuil de rentabilité en mois.
6. PÉRENNITÉ APRÈS INDH: comment le projet survit sans subvention (clients fidèles, contrats, stocks constitués).
7. Ne jamais écrire "etc.", "et autres", ou des phrases génériques — toujours concret et local.

Retourne UNIQUEMENT ce JSON valide sans markdown:
{"executiveSummary":"3-4 phrases percutantes pour le jury: problème local chiffré + solution + bénéficiaires précis + CA mensuel attendu","problemStatement":"problème LOCAL précis avec statistiques marocaines réelles (HCP, INDH, etc.) — citation de la zone géographique","solution":"solution concrète, pas à pas, avec les équipements spécifiques achetés et leur utilisation","marketAnalysis":"clientèle cible nommée précisément, taille du marché local estimée en MAD/semaine, concurrents existants et avantage différentiel","businessModel":"prix de vente précis en MAD, volume clients/semaine, CA mensuel estimé, charges fixes mensuelles, marge nette estimée, mois de rentabilité","socialImpact":"nombre EXACT de bénéficiaires directs (femmes/jeunes/familles), revenu supplémentaire mensuel estimé en MAD par bénéficiaire, impact sur la vie quotidienne","operationalPlan":"calendrier détaillé: Mois 1 (achat équipements, aménagement local) → Mois 2 (formation, test produits) → Mois 3 (1ers clients) → Mois 6 (objectif X clients, CA Y MAD) → Mois 12 (CA cible atteint)","indh_alignment":"lien explicite avec l'axe INDH choisi + score estimé sur chaque critère jury avec justification","risks":["Risque commercial: [risque spécifique au secteur au Maroc] → Solution: [action concrète]","Risque financier: [risque précis] → Solution: [mesure préventive]","Risque opérationnel: [risque précis] → Solution: [plan B concret]"],"projections":{"year1":N,"year2":N,"year3":N}}`),
      ensureJson([{role: "user", content: `Projet INDH: ${projCtx}`}],
        `Tu es un expert financier INDH Phase 3 Maroc qui connaît les prix du marché marocain en 2025.
${INDH_CTX}
Génère un budget prévisionnel PRÉCIS et JUSTIFIÉ, construit autour de ce que le porteur a lui-même demandé (champ "equipmentRequested" du projet ci-dessus) — le premier poste du budget doit être cet équipement précis, pas une invention générique.${arQuality}

RÈGLES IMPÉRATIVES:
1. MONTANT RÉEL: le total du budget part du "estimatedBudget" fourni par le porteur — ne le gonfle pas vers 100 000/111 000 MAD et ne le ramène pas à un plancher arbitraire. Un porteur qui a chiffré son projet à 30 000 MAD obtient un budget de ~30 000 MAD, pas 55 000.
2. PRIX RÉELS DU MARCHÉ MAROCAIN 2025: utilise les vrais prix d'équipements productifs (ex: machine à coudre industrielle Singer 5 500 MAD, four professionnel 18 000 MAD, tablette Samsung 1 200 MAD, réfrigérateur vitrine 200L 3 500 MAD, mobilier de travail professionnel 4 000 MAD, générateur portable 2kW 5 000 MAD, broyeur professionnel 3 500 MAD) SEULEMENT pour compléter le montant restant une fois le premier poste (l'équipement demandé par le porteur) posé.
3. DÉSIGNATIONS PRÉCISES: jamais "équipement divers" — toujours la désignation exacte.
4. CATÉGORIES ÉLIGIBLES INDH UNIQUEMENT — l'INDH finance UNIQUEMENT les biens d'équipement productifs. Inclure SEULEMENT: Équipements productifs (machines professionnelles, outillage technique, matériel de production, mobilier de travail, équipements de stockage/présentation). FORMELLEMENT INTERDIT dans un budget INDH — ne jamais inclure ces postes: Aménagement/Travaux (rénovation local, électricité, peinture, plomberie, cloisons — JAMAIS même 1 MAD), Frais d'établissement (immatriculation, notaire), Matières premières, Fonds de roulement, Communication/Marketing, salaires, loyers.
5. QUANTITÉS RÉALISTES: basées sur un démarrage réel — pas en sous-estimant ni en gonflant.
6. La seule règle de plafond: indhContribution = Math.min(Math.round(total * 0.90), 100000) ; beneficiaryContribution = total - indhContribution. 100 000 MAD est un PLAFOND, jamais une cible par défaut.

Retourne UNIQUEMENT ce JSON valide sans markdown:
{"items":[{"category":"catégorie","item":"désignation exacte avec marque/modèle si pertinent en ${LL}","quantity":N,"unitPrice":N,"total":N}],"indhContribution":N,"beneficiaryContribution":N}`),
    ]);
    // Only swap the draft for the AI version if the user is still on plan/budget —
    // if they've already moved on to Logo, leave what's already there.
    const stillHere = stepRef.current === "plan" || stepRef.current === "budget";
    if (p && stillHere) { setPlan(p); setPlanTailored(true); }
    if (b && stillHere) setBudget(b);
    })().catch(() => {});
  };

  const checkComp = async () => {
    // Instant local estimate first — same principle as genPlan: never leave the
    // applicant staring at a spinner for a step that gates whether they can even
    // reach the jury materials. AI runs in the background and silently upgrades
    // to a real jury-style assessment if it lands before the user moves on.
    setComp(buildLocalCompliance(proj, budget)); setCompTailored(false);
    setStep("compliance");

    const arQuality = lang === "ar"
      ? "\nمهم جداً: اكتب نقاط القوة والتوصيات بالعربية الفصحى البسيطة. جمل واضحة وقصيرة."
      : "";
    (async () => {
    const c = await ensureJson(
      [{role: "user", content: `Projet: ${JSON.stringify(proj)}\nPlan: ${JSON.stringify(plan)}\nBudget: ${JSON.stringify(budget)}`}],
      `Tu es un membre expert du jury INDH Phase 3 Maroc avec 10 ans d'expérience d'évaluation de projets.
${INDH_CTX}
Évalue ce projet EXACTEMENT comme le ferait un jury INDH officiel. Réponds en ${LL}.${arQuality}

GRILLE D'ÉVALUATION JURY INDH — applique-la rigoureusement:
• Impact social (max 25): Combien de bénéficiaires? Profil vulnérable (femmes, jeunes, ruraux)? Revenu supplémentaire précis? Score 0-25.
• Viabilité économique (max 20): CA mensuel réaliste? Marge couvrant les charges? Rentabilité en moins de 12 mois? Score 0-20.
• Pertinence territoriale (max 20): Le projet répond à un vrai manque dans cette zone? Pas de doublon avec projet INDH existant? Ancrage communautaire fort? Score 0-20.
• Capacité de gestion (max 15): Porteur a de l'expérience (même informelle)? Formation prévue? Plan opérationnel réaliste? Score 0-15.
• Durabilité (max 10): Le projet survit après l'INDH? Plan de génération de revenus propres? Partenariats locaux? Score 0-10.
• Innovation (max 10): Quelque chose de nouveau dans la zone? Approche originale? Utilisation numérique? Score 0-10.

RÈGLES DE SCORING RÉALISTES:
- Un projet très bien monté avec chiffres précis: 75-85 pts.
- Un projet moyen sans ancrage local fort: 50-65 pts.
- Un projet flou sans bénéficiaires précis: 35-50 pts.
- Éligible si score ≥ 60 ET secteur INDH ET contribution INDH ≤ 100 000 MAD (coût total projet peut atteindre ~111 000 MAD).
- Ne jamais mettre 100/100 — le jury est rigoureux.

Les FORCES doivent citer des éléments SPÉCIFIQUES du dossier (pas génériques).
Les RECOMMANDATIONS doivent être des ACTIONS IMMÉDIATES que le porteur peut faire avant de déposer (ex: "Obtenir une lettre de soutien de la commune", "Préciser le nombre exact de clientes par semaine", "Renforcer le plan de formation pratique dans le dossier").

Retourne UNIQUEMENT ce JSON valide sans markdown:
{"eligible":true/false,"score":N,"pillar":"axe INDH Phase 3 exact en ${LL}","strengths":["force SPÉCIFIQUE tirée du dossier 1","force SPÉCIFIQUE 2","force SPÉCIFIQUE 3"],"weaknesses":["faiblesse précise qui coûte des points jury 1","faiblesse 2"],"recommendations":["action immédiate et concrète 1 en ${LL}","action 2","action 3"],"juryScore":{"impact":N,"viability":N,"relevance":N,"management":N,"sustainability":N,"innovation":N}}`);
    // Only swap the instant estimate for the AI-refined version if the user is
    // still on this step — if they've already moved on, leave what's there.
    if (c && stepRef.current === "compliance") { setComp(c); setCompTailored(true); }
    })().catch(() => {});
  };

  const STEPS = ["idea", "dialogue", "profile", "plan", "budget", "compliance", "documents", "export"];
  const si = STEPS.indexOf(step);

  const fs: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: "12px", border: `2px solid ${CD}`,
    fontSize: "14px", fontFamily: ff(lang), color: N, background: CR,
    direction: dir as "rtl" | "ltr", transition: "border-color .2s"
  };

  const indhBtn = (label: string, onClick: () => void, style: React.CSSProperties = {}) => (
    <button onClick={onClick} className="im-primary" style={{width: "100%", padding: "15px", borderRadius: "14px", border: "none",
      cursor: "pointer", background: `linear-gradient(135deg,${Y},${YD})`, color: ND,
      fontSize: "14px", fontWeight: "800", fontFamily: ff(lang), ...style}}>{label}</button>
  );

  const backBtn = (overrideStep?: string) => {
    const target = overrideStep || STEPS[si - 1];
    if (!target || si <= 0) return null;
    return (
      <button onClick={() => setStep(target)} style={{
        marginTop: "10px", background: "none", border: `1px solid ${CD}`,
        borderRadius: "10px", color: GR, fontSize: "12px", fontFamily: ff(lang),
        cursor: "pointer", padding: "9px", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"
      }}>
        <span style={{fontSize: "14px"}}>{dir === "rtl" ? "→" : "←"}</span>
        {lang === "ar" ? "المرحلة السابقة" : lang === "fr" ? "Étape précédente" : "Previous step"}
      </button>
    );
  };

  const planBlock = (key: string, fr: string, ar: string, en: string, icon: string) => plan[key] && (
    <div key={key} style={{padding: "14px 16px", background: CR, borderRadius: "13px",
      borderLeft: `4px solid ${Y}`, marginBottom: "12px"}}>
      <div style={{fontSize: "10px", fontWeight: "700", color: N, textTransform: "uppercase",
        letterSpacing: ".4px", marginBottom: "7px"}}>{icon} {lang === "ar" ? ar : lang === "fr" ? fr : en}</div>
      <div style={{fontSize: "14px", color: ND, lineHeight: "1.75"}}>{plan[key]}</div>
    </div>
  );

  return (
    <div style={{minHeight: "100vh", background: `linear-gradient(180deg,${YL} 0,${CR} 320px)`, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <Header lang={lang} setLang={setLang} user={user} onLogout={onLogout} t={t}/>
      <ProgRow lang={lang} t={t} si={si} steps={t.steps as string[]}
        onStepClick={i => {
          // Dialogue is a one-way step — once proj is set the Q&A is done;
          // navigating back to it would show a broken empty state.
          if (STEPS[i] === "dialogue" && proj) return;
          setStep(STEPS[i]);
        }}/>
      <div className="fadeUp" style={{maxWidth: "700px", margin: "0 auto", padding: "24px 18px 60px"}}>

        {/* ── IDEA ── */}
        {step === "idea" && (
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px"}}>
              <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                border: `2px solid ${Y}`, flexShrink: 0}}>💡</div>
              <div>
                <div style={{fontSize: "11px", color: Y, fontWeight: "700", textTransform: "uppercase",
                  letterSpacing: ".5px", marginBottom: "2px"}}>{t.welcome} {user.name}</div>
                <h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.ideaT}</h2>
                <p style={{fontSize: "12px", color: GR, marginTop: "2px"}}>{t.ideaH}</p>
              </div>
            </div>
            {/* Quick starter templates */}
            {!idea.trim() && (() => {
              const profileSector = user.profile?.sector || "";
              const profileCity   = user.profile?.arrondissement || user.profile?.region || "";
              const personalStarter = profileSector ? (
                lang === "ar"
                  ? `أريد إطلاق مشروع في قطاع ${profileSector} في ${profileCity || "منطقتي"}.\nأريد تقديم خدمات بأسعار معقولة وخلق فرصة عمل لي ولأسرتي.`
                  : lang === "en"
                  ? `I want to start a ${profileSector} project in ${profileCity || "my city"}.\nI want to offer affordable services and create employment for myself and my family.`
                  : `Je veux démarrer un projet dans le secteur "${profileSector}" à ${profileCity || "ma ville"}.\nJe veux offrir des services accessibles et créer mon propre emploi.`
              ) : null;
              const starters: Record<string, string[]> = {
                fr: [
                  "Je veux créer un atelier de couture dans mon quartier à Casablanca.\nJ'aimerais former des femmes au chômage et vendre des vêtements traditionnels.",
                  "Je veux lancer un projet d'élevage de poulets pour les jeunes de la région rurale.\nL'objectif est de créer des emplois et vendre localement au souk hebdomadaire.",
                  "Je veux ouvrir un salon de coiffure et beauté dans mon quartier à Marrakech.\nIl n'existe aucun salon abordable pour les femmes de la zone.",
                  "Je veux démarrer une activité de transformation de produits du terroir locaux.\nJe veux vendre de l'huile d'argan et des épices sur WhatsApp et au souk.",
                ],
                ar: [
                  "أريد فتح ورشة خياطة في حيّنا بالدار البيضاء.\nأريد تكوين النساء العاطلات وبيع الملابس التقليدية محلياً.",
                  "أريد إطلاق مشروع تربية الدواجن للشباب في منطقتي القروية.\nالهدف هو خلق فرص العمل والبيع في السوق الأسبوعي.",
                  "أريد فتح صالون حلاقة وتجميل في حيّي بمراكش.\nلا يوجد أي صالون بأسعار معقولة للنساء في المنطقة.",
                  "أريد بدء نشاط تحويل المنتجات المحلية في منطقتي.\nأريد بيع زيت الأركان والتوابل عبر واتساب وفي السوق.",
                ],
                en: [
                  "I want to open a sewing workshop in my neighborhood in Casablanca.\nI aim to train unemployed women and sell traditional clothes locally.",
                  "I want to launch a poultry farming project for rural youth in my region.\nThe goal is to create jobs and sell produce at the weekly market.",
                  "I want to open a hair and beauty salon in my neighborhood in Marrakech.\nThere is no affordable salon for women in this area.",
                  "I want to start a local product processing activity in my region.\nI want to sell argan oil and spices on WhatsApp and at the local souk.",
                ],
              };
              const list = starters[lang] || starters.fr;
              return (
                <div style={{marginBottom: "14px"}}>
                  {personalStarter && (
                    <div style={{marginBottom: "10px"}}>
                      <p style={{fontSize: "10px", fontWeight: "700", color: Y, textTransform: "uppercase",
                        letterSpacing: ".6px", marginBottom: "6px"}}>
                        🎯 {lang==="ar"?"مقترح بناءً على ملفك:":lang==="fr"?"Suggestion personnalisée :":"Suggested for you:"}
                      </p>
                      <button onClick={() => startChat(personalStarter)} disabled={busy}
                        style={{width:"100%", padding: "11px 14px", borderRadius: "11px",
                          border: `2px solid ${Y}`, background: YL, color: ND,
                          fontSize: "12px", fontWeight: "600", textAlign: dir==="rtl"?"right":"left",
                          cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1,
                          fontFamily: ff(lang), direction: dir as "rtl"|"ltr",
                          lineHeight: "1.6"}}>
                        ✨ {personalStarter.split("\n")[0]}
                      </button>
                    </div>
                  )}
                  <p style={{fontSize: "10px", fontWeight: "700", color: GR, textTransform: "uppercase",
                    letterSpacing: ".6px", marginBottom: "8px"}}>
                    💡 {lang==="ar"?"أمثلة للإلهام:":lang==="fr"?"Exemples — cliquez pour démarrer :":"Examples — click to start:"}
                  </p>
                  <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    {list.map((s, i) => (
                      <button key={i} onClick={() => startChat(s)} disabled={busy}
                        style={{padding: "10px 14px", borderRadius: "11px",
                          border: `1.5px solid ${CD}`, background: WH, color: N,
                          fontSize: "12px", fontWeight: "500", textAlign: dir==="rtl"?"right":"left",
                          cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1,
                          fontFamily: ff(lang), direction: dir as "rtl"|"ltr",
                          transition: "all .15s", lineHeight: "1.6"}}>
                        💡 {s.split("\n")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            {(() => {
              const wordCount = idea.trim().split(/\s+/).filter(Boolean).length;
              const enough = wordCount >= 12;
              const hint = lang === "ar"
                ? `${wordCount} كلمة${enough ? " ✓" : ` — أضف ${12 - wordCount} كلمات على الأقل`}`
                : lang === "fr"
                ? `${wordCount} mot${wordCount > 1 ? "s" : ""}${enough ? " ✓" : ` — décrivez en au moins 2 lignes`}`
                : `${wordCount} word${wordCount !== 1 ? "s" : ""}${enough ? " ✓" : ` — describe in at least 2 lines`}`;
              return (
                <>
                  {/* Voice-to-text button — Groq Whisper free tier, auto-detects Arabic/French/Darija */}
                  <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"8px"}}>
                    <VoiceBtn
                      lang={lang}
                      onText={t => setIdea((prev: string) => prev ? prev.trimEnd() + " " + t : t)}
                      onError={msg => showToast(msg, "error")}
                    />
                  </div>
                  <textarea value={idea} onChange={e => setIdea(e.target.value)}
                    placeholder={lang==="ar"
                      ? "اشرح فكرتك بسطرين على الأقل: القطاع، المنطقة، من ستستفيد، ما الذي تحتاجه..."
                      : lang==="fr"
                      ? "Décrivez votre idée en au moins 2 lignes : secteur, zone géographique, qui va bénéficier, quel besoin..."
                      : "Describe your idea in at least 2 lines: sector, area, who will benefit, what need it addresses..."}
                    style={{...fs, resize: "vertical", minHeight: "110px", lineHeight: "1.7", marginBottom: "6px"}}/>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px"}}>
                    <span style={{fontSize: "11px", color: enough ? GN : GR, fontWeight: "600",
                      fontFamily: ff(lang), direction: dir as "rtl"|"ltr"}}>{hint}</span>
                    <div style={{display: "flex", gap: "3px"}}>
                      {[4,8,12].map(n => (
                        <div key={n} style={{width: "18px", height: "4px", borderRadius: "2px",
                          background: wordCount >= n ? Y : CD, transition: "background .3s"}}/>
                      ))}
                    </div>
                  </div>
                  {indhBtn(busy ? t.loading : t.next, () => startChat(),
                    {opacity: (!enough || busy) ? .5 : 1,
                     background: enough && !busy ? `linear-gradient(135deg,${Y},${YD})` : undefined})}
                </>
              );
            })()}
          </Card>
        )}

        {/* ── QUESTIONS ── */}
        {step === "dialogue" && (
          <Card>
            {/* Header */}
            <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px"}}>
              <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                border: `2px solid ${Y}`, flexShrink: 0}}>❓</div>
              <div>
                <div style={{fontSize: "11px", color: Y, fontWeight: "700", textTransform: "uppercase",
                  letterSpacing: ".5px", marginBottom: "2px"}}>{t.q} {qN} {t.of} {MAX_Q}</div>
                <h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.dialogT}</h2>
              </div>
            </div>

            {/* Idea reminder pill */}
            {idea && <div style={{display:"flex", alignItems:"flex-start", gap:"7px", marginBottom:"16px",
              padding:"9px 12px", background:CR, borderRadius:"10px", border:`1px solid ${CD}`}}>
              <span style={{fontSize:"15px", flexShrink:0}}>💡</span>
              <p style={{fontSize:"11px", color:GR, lineHeight:"1.55", margin:0,
                direction:dir as "rtl"|"ltr", maxHeight:"2.8em", overflow:"hidden"}}>
                {idea.trim()}
              </p>
            </div>}

            {/* Progress */}
            <div style={{marginBottom: "18px"}}>
              <PBar pct={(qN / MAX_Q) * 100}/>
            </div>

            {/* Busy state — plain loading, no chat framing */}
            {busy && (
              <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: "18px", background: YL, borderRadius: "13px", marginBottom: "14px"}}>
                <Dots/>
              </div>
            )}

            {/* Current question — a plain heading, not a chat bubble */}
            {currentQ && !busy && (
              <div className="im-rise" style={{marginBottom: "18px"}}>
                <p style={{fontSize: "17px", fontWeight: "700", color: ND, lineHeight: "1.5",
                  margin: 0, direction: dir as "rtl"|"ltr"}}>{currentQ}</p>
              </div>
            )}

            {/* Full-width answer bars */}
            {suggestions.length > 0 && !busy && (() => {
              const labels = ["A", "B", "C"];
              return (
                <div style={{display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px"}}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMsg(s)}
                      style={{width: "100%", padding: "13px 16px", borderRadius: "12px",
                        border: `2px solid ${CD}`, background: WH, color: ND,
                        fontSize: "13px", fontWeight: "600", textAlign: dir === "rtl" ? "right" : "left",
                        cursor: "pointer", fontFamily: ff(lang), direction: dir as "rtl"|"ltr",
                        display: "flex", alignItems: "center", gap: "10px",
                        transition: "all .15s"}}>
                      <span style={{width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0,
                        background: YL, color: N, fontSize: "11px", fontWeight: "800",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1.5px solid ${Y}`}}>{labels[i] || i + 1}</span>
                      <span style={{flex: 1}}>{s}</span>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Text input — only for the few questions a tap option can't answer
                for real (name, location, equipment, cost). Every other question
                is tap-only, so its answer always lands as one of the 3 exact
                strings the committee Excel column expects. */}
            {qAllowsFreeText && (
              <div style={{display: "flex", gap: "8px"}}>
                <input value={inp} onChange={e => !busy && setInp(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()} disabled={busy}
                  placeholder={busy
                    ? (lang==="ar"?"جاري التحميل...":lang==="fr"?"Chargement...":"Loading...")
                    : (lang==="ar"?"اكتب إجابتك هنا...":lang==="fr"?"Écrivez votre réponse...":"Type your answer...")}
                  className={busy ? "busy-pulse" : ""}
                  style={{...fs, flex: 1, fontSize: "13px", opacity: busy ? 0.6 : 1,
                    borderColor: busy ? Y : CD, background: busy ? YL : CR}}/>
                <button onClick={() => sendMsg()} disabled={busy || !inp.trim()}
                  style={{padding: "13px 18px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg,${Y},${YD})`, color: ND,
                    fontSize: "13px", fontWeight: "800", fontFamily: ff(lang),
                    opacity: busy || !inp.trim() ? .5 : 1, flexShrink: 0}}>
                  {dir === "rtl" ? "←" : "→"}
                </button>
              </div>
            )}
            <div ref={msgEnd}/>
            {!busy && qN <= 1 && backBtn("idea")}
          </Card>
        )}

        {/* ── PROFILE ── */}
        {step === "profile" && (
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px"}}>
              <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                border: `2px solid ${Y}`, flexShrink: 0}}>📋</div>
              <h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.profileT}</h2>
            </div>
            {proj && !projTailored && (
              <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px",
                padding: "8px 12px", background: CR, borderRadius: "9px", border: `1px solid ${CD}`}}>
                <Dots/>
                <span style={{fontSize: "11px", color: GR, fontWeight: "600"}}>
                  {lang === "ar" ? "جاري تحسين التفاصيل في الخلفية..." : lang === "fr" ? "Affinement des détails en cours..." : "Refining details in the background..."}
                </span>
              </div>
            )}
            {proj ? (<>
              {[
                {l: lang === "ar" ? "اسم المشروع" : lang === "fr" ? "Nom du projet" : "Project name", v: proj.projectName, i: "🏢"},
                {l: lang === "ar" ? "القطاع" : lang === "fr" ? "Secteur" : "Sector", v: proj.sector, i: "🏭"},
                {l: lang === "ar" ? "الهيكل القانوني" : lang === "fr" ? "Structure juridique" : "Legal structure", v: proj.legalStructure, i: "⚖️"},
                {l: lang === "ar" ? "الموقع" : lang === "fr" ? "Localisation" : "Location", v: proj.location, i: "📍"},
                {l: lang === "ar" ? "المستفيدون" : lang === "fr" ? "Bénéficiaires" : "Beneficiaries", v: proj.beneficiaries, i: "👥"},
                {l: lang === "ar" ? "محور المبادرة" : lang === "fr" ? "Axe INDH" : "INDH Pillar", v: proj.pillar, i: "🏛️"},
              ].filter(x => x.v).map((x, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: "10px",
                  padding: "11px 14px", background: CR, borderRadius: "11px",
                  border: `1px solid ${CD}`, marginBottom: "7px"}}>
                  <span style={{fontSize: "20px"}}>{x.i}</span>
                  <div>
                    <div style={{fontSize: "10px", color: GR, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".4px"}}>{x.l}</div>
                    <div style={{fontSize: "14px", color: ND, fontWeight: "600", marginTop: "2px"}}>{x.v}</div>
                  </div>
                </div>
              ))}
              <div style={{padding: "12px 14px", background: YL, borderRadius: "11px",
                border: `1px solid ${Y}`, margin: "14px 0"}}>
                <span style={{fontSize: "14px", color: ND, fontWeight: "700"}}>
                  💰 {lang === "ar" ? `التقدير: ${Number(proj.estimatedBudget || 0).toLocaleString()} درهم` : lang === "fr" ? `Budget estimé : ${Number(proj.estimatedBudget || 0).toLocaleString()} MAD` : `Estimate: ${Number(proj.estimatedBudget || 0).toLocaleString()} MAD`}
                </span>
              </div>
            </>) : (<div style={{textAlign: "center", padding: "40px", color: GR}}><Dots/></div>)}
            {indhBtn(t.genPlan, genPlan)}
            {backBtn()}
          </Card>
        )}

        {/* ── PLAN ── */}
        {step === "plan" && (<>
          {busy && <Card style={{textAlign: "center", padding: "48px 24px"}}>
            <div style={{fontSize:"52px", marginBottom:"16px"}}>📊</div>
            <h3 style={{color: ND, fontWeight: "700", marginBottom: "8px"}}>{t.genBP}</h3>
            <p style={{color: GR, fontSize: "13px", marginBottom: "18px"}}>{lang === "ar" ? "إعداد خطة الأعمال والميزانية..." : lang === "fr" ? "Préparation du business plan et budget..." : "Preparing business plan and budget..."}</p>
            <div style={{display: "flex", justifyContent: "center"}}><Dots/></div>
          </Card>}
          {!busy && !plan && (
            <Card style={{textAlign:"center", padding:"40px 24px"}}>
              <div style={{fontSize:"48px", marginBottom:"14px"}}>⚠️</div>
              <div style={{fontSize:"16px", fontWeight:"700", color:ND, marginBottom:"8px"}}>
                {lang==="ar"?"فشل إنشاء الخطة":lang==="fr"?"Génération échouée":"Generation failed"}
              </div>
              <div style={{fontSize:"13px", color:GR, marginBottom:"18px", lineHeight:1.6}}>
                {lang==="ar"?"جميع خوادم الذكاء الاصطناعي مشغولة. انتظر ثوانٍ ثم حاول مجدداً.":lang==="fr"?"L'IA est temporairement surchargée. Attendez quelques secondes et réessayez.":"All AI providers are busy. Wait a few seconds and try again."}
              </div>
              {indhBtn(lang==="ar"?"🔄 إعادة المحاولة":lang==="fr"?"🔄 Réessayer":"🔄 Try again", genPlan)}
              {backBtn()}
            </Card>
          )}
          {plan && !busy && (<>
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px"}}>
                <div style={{width: "46px", height: "46px", borderRadius: "13px", background: Y,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "24px"}}>📋</div>
                <div><h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.planT}</h2>
                  <p style={{fontSize: "12px", color: GR, marginTop: "2px"}}>{proj?.projectName}</p></div>
              </div>
              {!planTailored && (
                <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "16px",
                  padding: "8px 12px", background: CR, borderRadius: "9px", border: `1px solid ${CD}`}}>
                  <Dots/>
                  <span style={{fontSize: "11px", color: GR, fontWeight: "600"}}>
                    {lang === "ar" ? "جاري تحسين التفاصيل في الخلفية..." : lang === "fr" ? "Affinement des détails en cours..." : "Refining details in the background..."}
                  </span>
                </div>
              )}
              {planBlock("executiveSummary", "Résumé Exécutif", "الملخص التنفيذي", "Executive Summary", "📝")}
              {planBlock("problemStatement", "Problématique", "إشكالية المشروع", "Problem Statement", "❓")}
              {planBlock("solution", "Solution Proposée", "الحل المقترح", "Proposed Solution", "💡")}
              {planBlock("marketAnalysis", "Analyse de Marché", "تحليل السوق", "Market Analysis", "📈")}
              {planBlock("businessModel", "Modèle Économique", "نموذج الأعمال", "Business Model", "🔄")}
              {planBlock("socialImpact", "Impact Social", "الأثر الاجتماعي", "Social Impact", "❤️")}
              {planBlock("operationalPlan", "Plan Opérationnel", "الخطة التشغيلية", "Operational Plan", "⚙️")}
              {planBlock("indh_alignment", "Alignement INDH", "التوافق مع المبادرة", "INDH Alignment", "🏛️")}
              {plan.risks?.length > 0 && <div style={{padding: "14px 16px", background: "#FFF0F0",
                borderRadius: "13px", border: "1px solid #FCA5A5", marginBottom: "12px"}}>
                <div style={{fontSize: "10px", fontWeight: "700", color: RE, textTransform: "uppercase",
                  letterSpacing: ".4px", marginBottom: "8px"}}>⚠️ {t.risks}</div>
                {plan.risks.map((r: string, i: number) => <div key={i} style={{fontSize: "13px", color: N, marginBottom: "4px"}}>• {r}</div>)}
              </div>}
              {plan.projections && <div style={{padding: "14px 16px", background: YL, borderRadius: "13px", border: `1px solid ${Y}`}}>
                <div style={{fontSize: "10px", fontWeight: "700", color: ND, textTransform: "uppercase",
                  letterSpacing: ".4px", marginBottom: "12px"}}>📈 {t.projected}</div>
                <div style={{display: "flex", gap: "10px"}}>
                  {Object.entries(plan.projections).map(([y, v]) => (
                    <div key={y} style={{flex: 1, textAlign: "center", padding: "12px", background: WH,
                      borderRadius: "11px", border: `1px solid ${Y}55`}}>
                      <div style={{fontSize: "9px", color: GR, fontWeight: "700", textTransform: "uppercase", marginBottom: "3px"}}>An {y.replace("year", "")}</div>
                      <div style={{fontSize: "20px", fontWeight: "800", color: N}}>{Number(v).toLocaleString()}</div>
                      <div style={{fontSize: "9px", color: GR, marginTop: "2px"}}>MAD</div>
                    </div>
                  ))}
                </div>
              </div>}
            </Card>
            {indhBtn(`💰 ${lang === "ar" ? "الميزانية" : lang === "fr" ? "Voir le Budget" : "View Budget"} →`, () => setStep("budget"))}
            {backBtn()}
          </>)}
        </>)}

        {/* ── BUDGET ── */}
        {step === "budget" && (() => {
          const total = budget?.items?.reduce((s: number, x: any) => s + (x.total || 0), 0) || 0;
          const indh = budget?.indhContribution || Math.min(Math.round(total * .90), 100000);
          const bene = budget?.beneficiaryContribution || (total - indh);
          const pct = (indh / 100000) * 100;

          // Equipment and the exact INDH amount requested are precisely the kind of
          // detail an AI guess shouldn't be the final word on — the porteur needs to
          // directly edit designation/quantity/price to what they actually intend to
          // buy. Every edit recomputes total, and the 90/10 INDH split off that new
          // total, matching the same formula the AI used to seed it.
          const recompute = (items: any[]) => {
            const newTotal = items.reduce((s: number, x: any) => s + (x.total || 0), 0);
            const indhContribution = Math.min(Math.round(newTotal * 0.90), 100000);
            const beneficiaryContribution = newTotal - indhContribution;
            return { indhContribution, beneficiaryContribution };
          };
          const updateItem = (i: number, field: string, value: any) => {
            setBudget((prev: any) => {
              const items = [...(prev?.items || [])];
              items[i] = { ...items[i], [field]: value };
              if (field === "quantity" || field === "unitPrice") {
                items[i].total = (Number(items[i].quantity) || 0) * (Number(items[i].unitPrice) || 0);
              }
              return { ...prev, items, ...recompute(items) };
            });
          };
          const removeItem = (i: number) => {
            setBudget((prev: any) => {
              const items = (prev?.items || []).filter((_: any, idx: number) => idx !== i);
              return { ...prev, items, ...recompute(items) };
            });
          };
          const addItem = () => {
            setBudget((prev: any) => ({
              ...prev,
              items: [...(prev?.items || []), {
                category: lang === "ar" ? "معدات إنتاجية" : lang === "fr" ? "Équipements productifs" : "Productive equipment",
                item: "", quantity: 1, unitPrice: 0, total: 0,
              }],
            }));
          };
          const cellInputSt = {padding: "6px 7px", border: `1px solid ${CD}`, borderRadius: "7px",
            fontSize: "12px", width: "100%", fontFamily: "inherit", background: WH, color: ND, boxSizing: "border-box" as const};
          return (
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px"}}>
                <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                  border: `2px solid ${Y}`, flexShrink: 0}}>💰</div>
                <div><h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.budgetT}</h2>
                  <p style={{fontSize: "12px", color: GR, marginTop: "2px"}}>{t.maxB}</p></div>
              </div>
              {!planTailored && (
                <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "16px",
                  padding: "8px 12px", background: CR, borderRadius: "9px", border: `1px solid ${CD}`}}>
                  <Dots/>
                  <span style={{fontSize: "11px", color: GR, fontWeight: "600"}}>
                    {lang === "ar" ? "جاري تحسين التفاصيل في الخلفية..." : lang === "fr" ? "Affinement des détails en cours..." : "Refining details in the background..."}
                  </span>
                </div>
              )}
              <div style={{padding: "14px 16px", borderRadius: "13px", marginBottom: "18px",
                background: pct > 100 ? "#FFF0F0" : YL, border: `1px solid ${pct > 100 ? RE : Y}`}}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "7px"}}>
                  <span style={{fontSize: "15px", fontWeight: "800", color: ND}}>{total.toLocaleString()} MAD</span>
                  <span style={{fontSize: "12px", fontWeight: "700", color: pct > 100 ? RE : N}}>{pct.toFixed(0)}%</span>
                </div>
                <PBar pct={pct} h={7} color={pct > 100 ? RE : `linear-gradient(90deg,${Y},${YD})`}/>
              </div>
              {budget?.items ? (<div style={{marginBottom: "16px"}}>
                <div style={{fontSize: "11px", color: GR, marginBottom: "8px", lineHeight: 1.5}}>
                  {lang === "ar" ? "✏️ عدّل التسمية أو الكمية أو السعر لتطابق المعدات التي تنوي شراءها بالفعل." : lang === "fr" ? "✏️ Modifiez la désignation, la quantité ou le prix pour refléter exactement l'équipement que vous comptez acheter." : "✏️ Edit the item, quantity or price to match the exact equipment you intend to buy."}
                </div>
                {/* Desktop table */}
                <div className="budget-tbl" style={{overflowX: "auto"}}>
                  <table style={{width: "100%", borderCollapse: "collapse", fontSize: "12px"}}>
                    <thead><tr style={{background: ND, color: WH}}>
                      {["Catégorie", "Désignation", "Qté", "PU (MAD)", "Total", ""].map((h, i) => (
                        <th key={i} style={{padding: "9px 8px", textAlign: i < 2 ? (dir === "rtl" ? "right" : "left") : "center",
                          fontSize: "10px", fontWeight: "700", letterSpacing: ".4px"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{budget.items.map((x: any, i: number) => (
                      <tr key={i} style={{background: i % 2 === 0 ? WH : CR}}>
                        <td style={{padding: "6px"}}><input value={x.category || ""} onChange={e => updateItem(i, "category", e.target.value)} style={cellInputSt}/></td>
                        <td style={{padding: "6px"}}><input value={x.item || ""} onChange={e => updateItem(i, "item", e.target.value)} style={cellInputSt}/></td>
                        <td style={{padding: "6px", width: "64px"}}><input type="number" min={0} value={x.quantity ?? 0} onChange={e => updateItem(i, "quantity", e.target.value === "" ? 0 : Number(e.target.value))} style={{...cellInputSt, textAlign: "center"}}/></td>
                        <td style={{padding: "6px", width: "88px"}}><input type="number" min={0} value={x.unitPrice ?? 0} onChange={e => updateItem(i, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))} style={{...cellInputSt, textAlign: "center"}}/></td>
                        <td style={{padding: "9px 8px", textAlign: "center", fontWeight: "800", color: ND, whiteSpace: "nowrap"}}>{Number(x.total || 0).toLocaleString()}</td>
                        <td style={{padding: "6px", textAlign: "center"}}>
                          <button onClick={() => removeItem(i)} aria-label="Delete" style={{background: "none", border: "none", cursor: "pointer", fontSize: "15px", opacity: .6}}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{background: ND, color: WH}}>
                      <td colSpan={4} style={{padding: "10px 8px", fontWeight: "700"}}>{t.total}</td>
                      <td colSpan={2} style={{padding: "10px 8px", textAlign: "center", fontWeight: "800", color: Y}}>{total.toLocaleString()}</td>
                    </tr></tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="budget-cards" style={{display: "none", flexDirection: "column", gap: "8px"}}>
                  {budget.items.map((x: any, i: number) => (
                    <div key={i} style={{padding: "12px 14px", background: i % 2 === 0 ? WH : CR,
                      borderRadius: "11px", border: `1px solid ${CD}`}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px"}}>
                        <input value={x.category || ""} onChange={e => updateItem(i, "category", e.target.value)}
                          style={{...cellInputSt, fontSize: "10px", fontWeight: "700", color: Y, textTransform: "uppercase", border: "none", padding: "0", background: "transparent", width: "60%"}}/>
                        <button onClick={() => removeItem(i)} aria-label="Delete" style={{background: "none", border: "none", cursor: "pointer", fontSize: "15px", opacity: .6}}>🗑️</button>
                      </div>
                      <input value={x.item || ""} onChange={e => updateItem(i, "item", e.target.value)} style={{...cellInputSt, marginBottom: "7px"}}/>
                      <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                        <input type="number" min={0} value={x.quantity ?? 0} onChange={e => updateItem(i, "quantity", e.target.value === "" ? 0 : Number(e.target.value))} style={{...cellInputSt, width: "60px", textAlign: "center"}}/>
                        <span style={{fontSize: "11px", color: GR}}>×</span>
                        <input type="number" min={0} value={x.unitPrice ?? 0} onChange={e => updateItem(i, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))} style={{...cellInputSt, width: "80px", textAlign: "center"}}/>
                        <span style={{fontSize: "11px", color: GR}}>MAD =</span>
                        <span style={{fontSize: "14px", fontWeight: "800", color: ND, marginInlineStart: "auto"}}>{Number(x.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{padding: "12px 14px", background: ND, borderRadius: "11px",
                    display: "flex", justifyContent: "space-between"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: WH}}>{t.total}</span>
                    <span style={{fontSize: "15px", fontWeight: "800", color: Y}}>{total.toLocaleString()} MAD</span>
                  </div>
                </div>
                <button onClick={addItem} style={{marginTop: "10px", width: "100%", padding: "10px", borderRadius: "10px",
                  border: `1.5px dashed ${CD}`, background: "transparent", color: N, fontSize: "12px", fontWeight: "700", cursor: "pointer"}}>
                  {lang === "ar" ? "+ إضافة معدة" : lang === "fr" ? "+ Ajouter un équipement" : "+ Add equipment"}
                </button>
              </div>) : (
                <div style={{textAlign: "center", padding: "24px 16px"}}>
                  {busy ? <><div style={{display:"flex",justifyContent:"center"}}><Dots/></div></> : <>
                    <div style={{fontSize:"36px", marginBottom:"10px"}}>⚠️</div>
                    <div style={{fontSize:"13px", color:GR, marginBottom:"14px", lineHeight:1.6}}>
                      {lang==="ar"?"فشل إنشاء الميزانية":lang==="fr"?"Génération du budget échouée":"Budget generation failed"}
                    </div>
                    {indhBtn(lang==="ar"?"🔄 إعادة التوليد":lang==="fr"?"🔄 Régénérer le budget":"🔄 Regenerate budget", genPlan)}
                  </>}
                </div>
              )}
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px"}}>
                <div style={{padding: "16px", background: ND, borderRadius: "13px", textAlign: "center"}}>
                  <div style={{fontSize: "9px", color: Y, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "5px"}}>🏛️ {t.indhC}</div>
                  <div style={{fontSize: "22px", fontWeight: "800", color: WH}}>{indh.toLocaleString()}</div>
                  <div style={{fontSize: "10px", color: "rgba(255,255,255,.4)", marginTop: "2px"}}>MAD · {Math.round((indh / (total || 1)) * 100)}%</div>
                </div>
                <div style={{padding: "16px", background: YL, borderRadius: "13px", textAlign: "center", border: `2px solid ${Y}`}}>
                  <div style={{fontSize: "9px", color: N, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "5px"}}>👥 {t.benC}</div>
                  <div style={{fontSize: "22px", fontWeight: "800", color: ND}}>{bene.toLocaleString()}</div>
                  <div style={{fontSize: "10px", color: GR, marginTop: "2px"}}>MAD · {Math.round((bene / (total || 1)) * 100)}%</div>
                </div>
              </div>
              {indhBtn(lang === "ar" ? "← التالي: الامتثال" : lang === "fr" ? "Continuer → Conformité" : "Continue → Compliance", checkComp)}
              {backBtn()}
            </Card>
          );
        })()}

        {/* ── COMPLIANCE ── */}
        {step === "compliance" && (<Card>
          <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px"}}>
            <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
              border: `2px solid ${Y}`, flexShrink: 0}}>✅</div>
            <h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.compT}</h2>
          </div>
          {/* Reachable only via direct progress-row navigation to this step before
              checkComp() has ever run (checkComp itself sets comp instantly, so
              this never shows in the normal flow) — offers a way to trigger it. */}
          {!comp && (
            <div style={{textAlign:"center", padding:"32px 20px"}}>
              <div style={{fontSize:"48px", marginBottom:"14px"}}>✅</div>
              <div style={{fontSize:"13px", color:GR, marginBottom:"18px", lineHeight:1.6}}>
                {lang==="ar"?"لم يتم تحليل الامتثال بعد":lang==="fr"?"L'analyse de conformité n'a pas encore été lancée":"Compliance hasn't been analyzed yet"}
              </div>
              {indhBtn(t.checkBtn as string, checkComp)}
              {backBtn()}
            </div>
          )}
          {comp && (<>
            {!compTailored && (
              <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "16px",
                padding: "8px 12px", background: CR, borderRadius: "9px", border: `1px solid ${CD}`}}>
                <Dots/>
                <span style={{fontSize: "11px", color: GR, fontWeight: "600"}}>
                  {lang === "ar" ? "جاري تحسين التفاصيل في الخلفية..." : lang === "fr" ? "Affinement des détails en cours..." : "Refining details in the background..."}
                </span>
              </div>
            )}
            <div style={{padding: "24px", borderRadius: "16px", textAlign: "center", marginBottom: "18px",
              background: comp.eligible ? ND : "#FFF0F0", border: `2px solid ${comp.eligible ? Y : RE}`}}>
              <div style={{fontSize: "44px", marginBottom: "7px"}}>{comp.eligible ? "✅" : "⚠️"}</div>
              <div style={{fontSize: "16px", fontWeight: "700", color: comp.eligible ? Y : RE, marginBottom: "5px"}}>{comp.eligible ? t.eligible : t.notElig}</div>
              <AnimatedScore score={comp.score} eligible={comp.eligible}/>
            </div>
            {comp.juryScore && <div style={{marginBottom: "16px"}}>
              <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px"}}>
                <AccBar/><span style={{fontSize: "13px", fontWeight: "700", color: ND}}>🏆 {t.juryGrid}</span>
              </div>
              {JURY.map(({key, label, w}) => {
                const sc = comp.juryScore[key] || 0; const p = (sc / w) * 100;
                const col = p >= 70 ? Y : p >= 50 ? "#F59E0B" : RE;
                return (<div key={key} style={{marginBottom: "9px"}}>
                  <div style={{display: "flex", justifyContent: "space-between", marginBottom: "3px"}}>
                    <span style={{fontSize: "11px", color: N, fontWeight: "500"}}>{label}</span>
                    <span style={{fontSize: "11px", fontWeight: "800", color: ND}}>{sc}/{w}</span>
                  </div>
                  <div style={{height: "6px", background: CD, borderRadius: "3px", overflow: "hidden"}}>
                    <div style={{height: "100%", borderRadius: "3px", background: col, width: `${Math.min(p, 100)}%`, transition: "width .6s"}}/>
                  </div>
                </div>);
              })}
            </div>}
            {comp.strengths?.length > 0 && <div style={{padding: "14px", background: YL, borderRadius: "13px", border: `1px solid ${Y}`, marginBottom: "10px"}}>
              <div style={{fontSize: "10px", fontWeight: "700", color: ND, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: "8px"}}>💪 {t.strengths}</div>
              {comp.strengths.map((s: string, i: number) => <div key={i} style={{display: "flex", gap: "7px", fontSize: "12px", color: N, marginBottom: "4px"}}><span style={{color: Y, fontWeight: "700"}}>✓</span>{s}</div>)}
            </div>}
            {comp.recommendations?.length > 0 && <div style={{padding: "14px", background: CR, borderRadius: "13px", border: `1px solid ${CD}`, marginBottom: "16px"}}>
              <div style={{fontSize: "10px", fontWeight: "700", color: ND, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: "8px"}}>💡 {t.recs}</div>
              {comp.recommendations.map((r: string, i: number) => <div key={i} style={{display: "flex", gap: "7px", fontSize: "12px", color: N, marginBottom: "4px"}}><span style={{color: Y, fontWeight: "700"}}>→</span>{r}</div>)}
            </div>}
            {indhBtn(`📁 ${lang === "ar" ? "الوثائق" : lang === "fr" ? "Documents Requis" : "Required Documents"} →`, () => {
              // Auto-check doc #8 (Business Plan) since IdeaMap generates it automatically
              if (plan) setDocs(p => ({...p, 8: true}));
              setStep("documents");
            })}
            {backBtn()}
          </>)}
        </Card>)}

        {/* ── DOCUMENTS ── */}
        {step === "documents" && (() => {
          const done = Object.values(docs).filter(Boolean).length;
          return (
            <Card>
              {/* hidden file input shared by all doc rows */}
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{display:"none"}}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f || pendingAttach === null) return;
                  if (f.size > 1.5 * 1024 * 1024) { alert(lang==="ar"?"الملف كبير جداً (الحد 1.5 MB)":lang==="fr"?"Fichier trop lourd (max 1.5 MB)":"File too large (max 1.5 MB)"); return; }
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const id = pendingAttach;
                    setDocFiles(p => ({...p, [id]: ev.target?.result as string}));
                    setDocs(p => ({...p, [id]: true}));
                    setPendingAttach(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  };
                  reader.readAsDataURL(f);
                }}/>
              <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px"}}>
                <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                  border: `2px solid ${Y}`, flexShrink: 0}}>📁</div>
                <div><h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.docsT}</h2>
                  <p style={{fontSize: "11px", color: GR, marginTop: "2px"}}>{lang === "ar" ? "تحقق وأرفق الملفات" : lang === "fr" ? "Cochez et joignez vos fichiers (max 1.5 MB)" : "Check off and attach files (max 1.5 MB)"}</p></div>
              </div>
              <div style={{padding: "11px 14px", background: ND, borderRadius: "11px", margin: "14px 0",
                display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <span style={{fontSize: "12px", color: WH, fontWeight: "600"}}>{done} / {DOCS.length}</span>
                <span style={{fontSize: "12px", color: Y, fontWeight: "800"}}>{Math.round((done / DOCS.length) * 100)}%</span>
              </div>
              <PBar pct={(done / DOCS.length) * 100}/>
              {["req", "opt"].map(type => (<div key={type}>
                <p style={{fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px",
                  color: type === "req" ? N : GR, margin: "16px 0 8px"}}>{type === "req" ? `⭐ ${t.req}` : `📎 ${t.opt}`}</p>
                {DOCS.filter(d => type === "req" ? d.req : !d.req).map(doc => (
                  <div key={doc.id}
                    role="checkbox"
                    aria-checked={!!docs[doc.id]}
                    tabIndex={0}
                    onClick={() => setDocs(p => ({...p, [doc.id]: !p[doc.id]}))}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDocs(p => ({...p, [doc.id]: !p[doc.id]})); } }}
                    style={{display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px",
                      borderRadius: "13px", marginBottom: "7px", cursor: "pointer",
                      background: docs[doc.id] ? (type === "req" ? ND : YL) : WH,
                      border: `2px solid ${docs[doc.id] ? Y : CD}`, transition: "all .2s"}}>
                    <div style={{width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0,
                      background: docs[doc.id] ? Y : CR, border: `2px solid ${docs[doc.id] ? Y : CD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: ND, fontSize: "12px", fontWeight: "700"}}>{docs[doc.id] ? "✓" : ""}</div>
                    <div style={{flex: 1}}>
                      <div style={{display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px"}}>
                        <span>{doc.icon}</span>
                        <span style={{fontSize: "12px", fontWeight: "600",
                          color: docs[doc.id] && type === "req" ? WH : ND}}>{doc.name}</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                        <p style={{fontSize: "11px", color: docs[doc.id] && type === "req" ? "rgba(255,255,255,.5)" : GR, flex:1}}>{doc.desc}</p>
                        {docFiles[doc.id] ? (
                          <span style={{fontSize:"10px", color:GN, fontWeight:"700", flexShrink:0}}>📎 {lang==="ar"?"مرفق":lang==="fr"?"Joint":"Attached"}</span>
                        ) : (
                          <button onClick={e => {e.stopPropagation(); setPendingAttach(doc.id); fileInputRef.current?.click();}}
                            style={{padding:"3px 9px", borderRadius:"6px", border:`1px dashed ${docs[doc.id]?"rgba(255,255,255,.3)":CD}`,
                              background:"transparent", fontSize:"10px", color:docs[doc.id]&&type==="req"?"rgba(255,255,255,.6)":GR,
                              fontFamily:ff(lang), cursor:"pointer", flexShrink:0}}>
                            📎 {lang==="ar"?"إرفاق":lang==="fr"?"Joindre":"Attach"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>))}
              <div style={{marginTop: "14px", marginBottom: "16px", padding: "13px", background: "#EFF6FF",
                borderRadius: "13px", border: "1px solid #93C5FD"}}>
                <div style={{fontSize: "12px", fontWeight: "700", color: "#1E40AF", marginBottom: "6px"}}>🌐 Rokhsa.ma</div>
                <a href="https://www.rokhsa.ma" target="_blank" rel="noopener noreferrer"
                  style={{fontSize: "12px", color: "#1E40AF", fontWeight: "600"}}>www.rokhsa.ma →</a>
              </div>
              {indhBtn(`🎉 ${lang === "ar" ? "عرض ملفي الكامل" : lang === "fr" ? "Voir Mon Dossier" : "View My Application"} →`, () => setStep("export"))}
              {backBtn()}
            </Card>
          );
        })()}

        {/* ── EXPORT ── */}
        {step === "export" && (() => {
          const done = Object.values(docs).filter(Boolean).length;
          const readiness = Math.round(((comp?.score || 0) * .5) + ((done / DOCS.length) * 50));
          const exportTotal = (budget?.items||[]).reduce((s: number, x: any) => s + (x.total||0), 0);
          const waText = encodeURIComponent([
            `🎉 ${lang==="ar"?"مشروعي INDH جاهز":lang==="fr"?"Mon projet INDH est prêt !":"My INDH project is ready!"}`,
            `📌 ${proj?.projectName||""}`,
            comp ? `✅ ${lang==="ar"?"النقطة":lang==="fr"?"Score":"Score"}: ${comp.score}/100${comp.eligible?" ✓":""}` : "",
            `📍 ${proj?.location||proj?.sector||""}`,
            exportTotal ? `💰 ${exportTotal.toLocaleString()} MAD` : "",
            ``,
            `🔗 ${lang==="ar"?"تم إنشاؤه بواسطة IdeaMap":lang==="fr"?"Généré avec IdeaMap":"Generated with IdeaMap"}`,
          ].filter(Boolean).join("\n"));
          return (<>
            <div style={{background: ND, borderRadius: "18px", padding: "32px 24px",
              textAlign: "center", marginBottom: "14px"}}>
              <div style={{fontSize: "64px", marginBottom: "10px"}}>🎉</div>
              <h2 style={{fontSize: "22px", fontWeight: "800", color: WH, marginBottom: "5px"}}>{t.exportT}</h2>
              <p style={{color: "rgba(255,255,255,.5)", fontSize: "13px", marginBottom: "14px"}}>{proj?.projectName}</p>
              <div style={{display: "inline-block", padding: "18px 36px",
                background: "rgba(37,99,235,.2)", borderRadius: "16px", border: `2px solid ${Y}`}}>
                <div style={{fontSize: "48px", fontWeight: "800", color: Y, lineHeight: 1}}>{readiness}%</div>
                <div style={{fontSize: "11px", color: "rgba(255,255,255,.5)", marginTop: "5px"}}>{t.readiness}</div>
              </div>
              {/* CIN + WhatsApp row */}
              <div style={{display:"flex", gap:"8px", marginTop:"16px", flexWrap:"wrap", justifyContent:"center"}}>
                <button onClick={() => {
                  const copied = (() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(user.id).catch(() => {});
                      return true;
                    }
                    try {
                      const ta = document.createElement("textarea");
                      ta.value = user.id;
                      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
                      document.body.appendChild(ta);
                      ta.select();
                      const ok = document.execCommand("copy");
                      document.body.removeChild(ta);
                      return ok;
                    } catch { return false; }
                  })();
                  showToast(
                    copied
                      ? (lang==="ar"?"تم نسخ رقم البطاقة":lang==="fr"?"CIN copié !":"CIN copied!")
                      : (lang==="ar"?"انسخ يدوياً: "+user.id:lang==="fr"?"Copiez manuellement: "+user.id:"Copy manually: "+user.id),
                    copied ? "success" : "error"
                  );
                }} style={{display:"flex", alignItems:"center", gap:"6px",
                  padding:"10px 16px", borderRadius:"10px",
                  background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)",
                  color:WH, fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer"}}>
                  📋 {user.id}
                </button>
                <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex", alignItems:"center", gap:"6px",
                    padding:"10px 16px", borderRadius:"10px",
                    background:"#25D366", color:WH, fontSize:"12px", fontWeight:"700",
                    textDecoration:"none", fontFamily:ff(lang)}}>
                  <span>📲</span>
                  {lang==="ar"?"واتساب":lang==="fr"?"WhatsApp":"WhatsApp"}
                </a>
              </div>
            </div>
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
                <AccBar/><span style={{fontSize: "15px", fontWeight: "700", color: ND}}>📦 {t.delivT}</span>
              </div>

              {/* ── Download language picker ── */}
              <div style={{padding:"12px 14px", background:YL, borderRadius:"12px",
                border:`1.5px solid ${Y}`, marginBottom:"14px",
                display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap"}}>
                <span style={{fontSize:"11px", fontWeight:"700", color:ND, flexShrink:0}}>
                  🌐 {lang==="ar"?"لغة التنزيل:":lang==="fr"?"Langue des téléchargements :":"Download language:"}
                </span>
                <div style={{display:"flex", gap:"6px", flexWrap:"wrap"}}>
                  {[{k:"fr",fl:"🇫🇷",lb:"Français"},{k:"ar",fl:"🇲🇦",lb:"العربية"},{k:"en",fl:"🇬🇧",lb:"English"}].map(({k,fl,lb}) => (
                    <button key={k} onClick={() => setDlLang(k)}
                      style={{padding:"6px 14px", borderRadius:"9px",
                        border:`2px solid ${dlLang===k?YD:CD}`,
                        background:dlLang===k?Y:WH, color:dlLang===k?ND:GR,
                        fontSize:"12px", fontWeight:"700", cursor:"pointer",
                        fontFamily:k==="ar"?"'Tajawal',sans-serif":"'Poppins',sans-serif",
                        transition:"all .15s"}}>
                      {fl} {lb}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const eAr = dlLang === "ar"; const eEn = dlLang === "en";
                // Only the Dossier Factory's 4 official committee pieces (§3a) are
                // offered here — the pitch deck, jury Q&A, submission guide, etc. that
                // used to clutter this list are gone per explicit request.
                const items: {icon:string;l:string;ok:boolean;onDl:()=>void;badge?:string}[] = [
                  {icon:"🏛️", l:eAr?"عرض اللجنة (10 شرائح)":eEn?"Committee Presentation — 10 slides":"Présentation Comité — 10 diapositives",
                    ok:!!proj, onDl:() => dlComitePresentation(dlLang), badge:"pptx"},
                  {icon:"📋", l:eAr?"بطاقة المشروع":eEn?"Fiche Projet":"Fiche Projet", ok:!!proj,
                    onDl:() => dlDossierDocx("projet", dlLang), badge:docxBusy==="projet"?"...":"docx"},
                  {icon:"🔧", l:eAr?"البطاقة التقنية":eEn?"Fiche Technique":"Fiche Technique", ok:!!budget?.items,
                    onDl:() => dlDossierDocx("technique", dlLang), badge:docxBusy==="technique"?"...":"docx"},
                  {icon:"📈", l:eAr?"خطة الأعمال (Word)":eEn?"Business Plan (Word)":"Business Plan (Word)", ok:!!plan,
                    onDl:() => dlDossierDocx("plan", dlLang), badge:docxBusy==="plan"?"...":"docx"},
                ];
                return items.map((x, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px",
                    borderRadius:"13px", marginBottom:"7px", background:x.ok?ND:CR, border:`1px solid ${x.ok?Y:CD}`}}>
                    <span style={{fontSize:"20px", flexShrink:0}}>{x.icon}</span>
                    <span style={{flex:1, minWidth:0, fontSize:"12px", color:x.ok?WH:ND, fontWeight:"500",
                      fontFamily:dlLang==="ar"?"'Tajawal',sans-serif":undefined,
                      direction:dlLang==="ar"?"rtl":"ltr"}}>{x.l}</span>
                    {x.ok ? (
                      <button onClick={x.onDl}
                        style={{padding:"5px 12px", borderRadius:"8px", border:`1.5px solid ${Y}`,
                          background:"transparent", color:Y, fontSize:"11px", fontWeight:"700",
                          fontFamily:ff(lang), cursor:"pointer", flexShrink:0, whiteSpace:"nowrap"}}>
                        ⬇ {x.badge || "txt"}
                      </button>
                    ) : (
                      <span style={{padding:"2px 7px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                        background:CD, color:GR, flexShrink:0}}>⏳</span>
                    )}
                  </div>
                ));
              })()}
            </Card>

            {/* Submission process steps */}
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"16px"}}>
                <AccBar/><span style={{fontSize:"15px", fontWeight:"700", color:ND}}>🗺️ {t.processT}</span>
              </div>
              {[
                {n:"1", l:lang==="ar"?"إعداد جميع الوثائق":lang==="fr"?"Finaliser et réunir les documents":"Finalize and gather all documents", d:lang==="ar"?"8 وثائق إلزامية + 4 اختيارية":lang==="fr"?"8 obligatoires + 4 recommandés":"8 required + 4 recommended"},
                {n:"2", l:lang==="ar"?"إيداع الملف لدى مديرية العمل الاجتماعي (DAS)":lang==="fr"?"Déposer le dossier à la DAS":"Submit to Division of Social Action (DAS)", d:lang==="ar"?"احصل على وصل الإيداع":lang==="fr"?"Obtenez le récépissé de dépôt":"Obtain deposit receipt"},
                {n:"3", l:lang==="ar"?"دراسة الملف من طرف اللجنة الإقليمية (CPDH)":lang==="fr"?"Instruction par le CPDH local":"Review by local CPDH committee", d:lang==="ar"?"4 إلى 8 أسابيع":lang==="fr"?"Délai: 4 à 8 semaines":"Timeline: 4 to 8 weeks"},
                {n:"4", l:lang==="ar"?"المثول أمام لجنة التحكيم":lang==="fr"?"Présentation devant le jury INDH":"Present before INDH selection jury", d:lang==="ar"?"100 نقطة — حد الأهلية 60/100":lang==="fr"?"100 pts — éligible si ≥ 60/100":"100 pts — eligible if ≥ 60/100"},
                {n:"5", l:lang==="ar"?"التوقيع على اتفاقية المبادرة وانطلاق المشروع":lang==="fr"?"Signature de la convention et démarrage":"Sign INDH convention and launch", d:lang==="ar"?"INDH 90% + مساهمة الحامل 10%":lang==="fr"?"INDH 90% + apport porteur 10%":"INDH 90% + holder 10%"},
              ].map((s, i, arr) => (
                <div key={i} style={{display:"flex", gap:"12px", paddingBottom: i < arr.length-1 ? "16px" : 0,
                  marginBottom: i < arr.length-1 ? "16px" : 0,
                  borderBottom: i < arr.length-1 ? `1px solid ${CD}` : "none"}}>
                  <div style={{width:28, height:28, borderRadius:"50%", background:ND, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"11px", fontWeight:"800", color:Y}}>{s.n}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"13px", fontWeight:"600", color:ND, marginBottom:"3px"}}>{s.l}</div>
                    <div style={{fontSize:"11px", color:GR}}>{s.d}</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Jury tips */}
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"16px"}}>
                <AccBar/><span style={{fontSize:"15px", fontWeight:"700", color:ND}}>🏆 {t.tipsT}</span>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                {[
                  {icon:"👥", tip:lang==="ar"?"اذكر عدداً دقيقاً من المستفيدين مع ملفهم (نساء، شباب، أسر...)":lang==="fr"?"Citez un nombre PRÉCIS de bénéficiaires avec leur profil (femmes, jeunes, familles...)":"Name the EXACT beneficiary count with their profile (women, youth, families...)"},
                  {icon:"💰", tip:lang==="ar"?"أعط أرقاماً واقعية: الإيراد الشهري المتوقع، هامش الربح، شهور الربحية":lang==="fr"?"Donnez des chiffres réels: CA mensuel, marge brute, mois de rentabilité":"Give real numbers: monthly revenue, gross margin, break-even in months"},
                  {icon:"📍", tip:lang==="ar"?"أبرز المشكلة المحلية بالأرقام (بطالة الشباب، غياب الخدمة...)":lang==="fr"?"Montrez le problème LOCAL avec des stats (chômage, service manquant...)":"Show the LOCAL problem with stats (unemployment, missing service...)"},
                  {icon:"📜", tip:lang==="ar"?"أضف شهادة أو رسالة دعم من الجماعة المحلية لتعزيز الانتماء الترابي":lang==="fr"?"Ajoutez un courrier de soutien de la commune pour le critère 'pertinence territoriale'":"A support letter from the local commune boosts the 'territorial relevance' criterion"},
                  {icon:"🔄", tip:lang==="ar"?"بيّن كيف سيستمر المشروع بعد انتهاء دعم المبادرة الوطنية":lang==="fr"?"Expliquez comment le projet survit APRÈS l'INDH: clients fidèles, partenariats":"Explain how the project survives AFTER INDH: repeat clients, partnerships"},
                ].map((item, i) => (
                  <div key={i} style={{display:"flex", gap:"10px", padding:"11px 13px",
                    background:YL, borderRadius:"11px", border:`1px solid ${Y}33`}}>
                    <span style={{fontSize:"18px", flexShrink:0}}>{item.icon}</span>
                    <span style={{fontSize:"12px", color:ND, lineHeight:"1.65", fontFamily:ff(lang),
                      direction:lang==="ar"?"rtl":"ltr"}}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </Card>
            {backBtn()}
          </>);
        })()}

      </div>
      <HelpAgent lang={lang} context={`Porteur: ${user.name} | Étape: ${step} | Projet: ${proj?.projectName || "en cours"} | Secteur: ${proj?.sector || user.profile?.sector || ""} | Score conformité: ${comp?.score != null ? comp.score + "/100" : "non évalué encore"}`}/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COORDINATOR DASHBOARD
════════════════════════════════════════════════════════ */
function CoordDash({lang, setLang, user, onLogout, t, holders, syncError, questionnaire, onSaveQuestionnaire, onImportApplication}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; holders: any[]; syncError?: boolean;
  questionnaire?: CoordQuestion[]; onSaveQuestionnaire: (questions: CoordQuestion[] | undefined) => void;
  onImportApplication: (holder: any) => void;
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [tab, setTab]           = useState("holders");
  const [search, setSearch]     = useState("");
  const [detail, setDetail]     = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qUploading, setQUploading]   = useState(false);
  const [qDraft, setQDraft]           = useState<CoordQuestion[] | null>(null);
  const [qErr, setQErr]               = useState("");
  const [pptxLang, setPptxLang]       = useState(lang);
  const [docxBusy, setDocxBusy]       = useState<"projet" | "technique" | "plan" | "comite" | null>(null);
  const [docxErr, setDocxErr]         = useState("");
  const [appUploading, setAppUploading] = useState(false);
  const [appErr, setAppErr]             = useState("");
  const [excelBusy, setExcelBusy]       = useState(false);
  const [toast, setToast]               = useState<{msg: string; type: "error"|"success"} | null>(null);

  // Real .xlsx (not CSV) export of the currently filtered/searched list — the
  // same data the search box already scopes. Also the HelpAgent's one
  // allow-listed action for this dashboard (§5 of the Dossier Factory
  // prompt): coordinators can type "exporte la liste" in the chat, or just
  // tap the quick-action chip, either way it runs this exact function.
  const exportExcel = async () => {
    setExcelBusy(true);
    try {
      await generateHoldersExcel(filtered, lang, "coord", (msg, type = "error") => setToast({msg, type}));
    } finally {
      setExcelBusy(false);
    }
  };

  // The dossier's 4 files (§1: Présentation comité PPTX + Fiche projet/
  // technique/Business plan DOCX) — Fiche Projet/Technique/Business Plan are
  // real .docx via the shared lib/ideamap/dossier/generators.ts module;
  // "comite" reuses generateComitePresentation above. A holder completing
  // their own dialogue is never an "assumption" (assumptions only arise from
  // a bulk
  // Excel import's sector-benchmark fallback, not yet built), so isAssumed
  // is always false here.
  const downloadHolderDocument = async (h: any, kind: "projet" | "technique" | "plan" | "comite") => {
    setDocxBusy(kind); setDocxErr("");
    try {
      const data: DossierData = {proj: h.proj, plan: h.plan, budget: h.budget, comp: h.comp, profile: h.profile, name: h.name};
      if (kind === "comite") {
        await generateComitePresentation(pptxLang, {...data, numero: h.id}, lang, (msg) => setDocxErr(msg));
        return;
      }
      const docxLib = await import("docx");
      const docxLang = pptxLang as DocxLang;
      let blob: Blob; let filename: string;
      if (kind === "projet") {
        blob = await buildFicheProjetDoc(docxLib, data, docxLang, false);
        filename = `FicheProjet_${h.proj?.projectName || h.id}.docx`;
      } else if (kind === "technique") {
        blob = await buildFicheTechniqueDoc(docxLib, data, docxLang, false);
        filename = `FicheTechnique_${h.proj?.projectName || h.id}.docx`;
      } else {
        blob = await buildBusinessPlanDoc(docxLib, data, docxLang, false);
        filename = `BusinessPlan_${h.proj?.projectName || h.id}.docx`;
      }
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {href: url, download: filename}).click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error("DOCX export error:", e);
      setDocxErr(lang==="ar"?"فشل إنشاء الملف":lang==="fr"?"Erreur lors de la création du fichier":"File generation failed");
    } finally {
      setDocxBusy(null);
    }
  };
  const qText = (q: CoordQuestion) => q[lang as "fr"|"ar"|"en"] || q.fr;

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const COORD_NAV = [
    {id:"overview", label: lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"},
    {id:"holders",  label: lang==="ar"?"حاملو مشاريعي":lang==="fr"?"Mes porteurs":"My Holders"},
    {id:"activity", label: lang==="ar"?"النشاط":lang==="fr"?"Activité":"Activity"},
    {id:"settings", label: lang==="ar"?"الإعدادات":lang==="fr"?"Paramètres":"Settings"},
  ];

  const filtered = holders.filter(h =>
    (h.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.proj?.sector || "").toLowerCase().includes(search.toLowerCase())
  );

  const stepColors: Record<string, string> = {
    "idea": Y, "dialogue": "#F59E0B", "profile": "#3B82F6", "plan": "#8B5CF6",
    "budget": "#EC4899", "compliance": "#14B8A6", "documents": GN, "export": GN
  };

  const STEPS_LIST = ["idea","dialogue","profile","plan","budget","compliance","documents","export"];

  const getStatus = (h: any) => {
    const pct = STEPS_LIST.indexOf(h.step || "idea") / (STEPS_LIST.length - 1) * 100;
    if (h.comp?.eligible) return {label:lang==="ar"?"مؤهل":lang==="fr"?"Éligible":"Eligible", bg:"#EAF3EF", fg:GN};
    if (pct >= 40) return {label:lang==="ar"?"جارٍ":lang==="fr"?"En cours":"In progress", bg:"#FBF3EC", fg:RE};
    return {label:lang==="ar"?"بداية":lang==="fr"?"Démarrage":"Starting", bg:"#F0EEE9", fg:GR};
  };

  if (detail) {
    const h = detail;
    return (
      <div style={{minHeight:"100vh", background:CR, fontFamily:ff(lang), direction:"ltr", display:"flex"}}>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:299}}/>}
        <DashSidebar user={user} navItems={COORD_NAV} activeTab={tab}
          onTabChange={id => { setTab(id); setDetail(null); setSidebarOpen(false); }}
          onLogout={onLogout} lang={lang} setLang={setLang} t={t}
          open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
          {/* Mobile top bar — hamburger + title */}
          <div className="dash-topbar" style={{background:WH, borderBottom:`1px solid ${CD}`,
            padding:"12px 16px", alignItems:"center", gap:"12px",
            position:"sticky", top:0, zIndex:100}}>
            <button onClick={() => setSidebarOpen(true)}
              style={{background:"transparent", border:`1px solid ${CD}`, borderRadius:"8px",
                padding:"6px 10px", fontSize:"16px", cursor:"pointer", color:ND}}>☰</button>
            <span style={{fontSize:"14px", fontWeight:"700", color:ND}}>IdeaMap</span>
          </div>
          <div style={{maxWidth:860, padding:"32px 40px 48px"}}>
            <button onClick={() => setDetail(null)} style={{marginBottom:"20px", padding:"8px 16px",
              borderRadius:"8px", border:`1px solid ${CD}`, background:WH,
              color:N, fontSize:"12px", fontWeight:"600", fontFamily:ff(lang), cursor:"pointer"}}>
              ← {lang==="ar"?"رجوع":lang==="fr"?"Retour":"Back"}
            </button>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px"}}>
                <div style={{width:48, height:48, borderRadius:"50%", background:ND, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"18px", fontWeight:"800", color:WH}}>{(h.name||"?")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"17px", fontWeight:"700", color:ND}}>{h.name} {h.profile?.lastName||""}</div>
                  <div style={{fontSize:"12px", color:GR}}>{h.id} · {regionDisplay(h.profile)} · {h.profile?.projType}</div>
                </div>
                <Badge role="holder"/>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {[
                  {l:"Age", v:h.profile?.age, i:"📅"}, {l:"Genre", v:h.profile?.gender, i:"👤"},
                  {l:"Région", v:regionDisplay(h.profile), i:"📍"}, {l:"Secteur", v:h.profile?.sector, i:"🏭"},
                  {l:"Téléphone", v:h.profile?.phone, i:"📞"}, {l:"Type porteur", v:h.profile?.projType, i:"⚖️"},
                ].filter(x => x.v).map((x, i) => (
                  <div key={i} style={{display:"flex", gap:"8px", alignItems:"center",
                    padding:"10px", background:CR, borderRadius:"10px", border:`1px solid ${CD}`}}>
                    <span>{x.i}</span>
                    <div><div style={{fontSize:"9px", color:GR, fontWeight:"700", textTransform:"uppercase"}}>{x.l}</div>
                      <div style={{fontSize:"13px", color:ND, fontWeight:"600"}}>{x.v}</div></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  📝 {lang==="ar"?"استيراد إجابات الترشيح":lang==="fr"?"Importer les réponses de candidature":"Import application answers"}
                </span>
              </div>
              <div style={{fontSize:12, color:GR, marginBottom:12, lineHeight:1.6}}>
                {lang==="ar"
                  ? "استورد وثيقة (Word أو PDF) تحتوي على أسئلة الترشيح وإجاباتها المكتوبة من طرف هذا الحامل — سيتم بناء ملف مشروعه تلقائياً والانتقال مباشرة إلى مرحلة الملف الشخصي."
                  : lang==="fr"
                  ? "Importez un document (Word ou PDF) contenant les questions de candidature et les réponses écrites de ce porteur — son profil de projet sera reconstruit automatiquement et il passera directement à l'étape Profil."
                  : "Upload a document (Word or PDF) containing the application questions and this holder's written answers — their project profile will be built automatically and they'll land directly on the Profile step."}
              </div>
              {appErr && (
                <div style={{padding:"10px 12px", background:`${RE}12`, border:`1px solid ${RE}44`,
                  borderRadius:8, marginBottom:12, fontSize:12, color:RE}}>{appErr}</div>
              )}
              <label style={{display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                borderRadius:10, border:`1.5px dashed ${Y}`, background:YL, cursor: appUploading ? "default" : "pointer",
                opacity: appUploading ? .6 : 1}}>
                <span style={{fontSize:20}}>{appUploading ? "⏳" : "📁"}</span>
                <div>
                  <div style={{fontSize:12, fontWeight:600, color:ND}}>
                    {appUploading
                      ? (lang==="ar"?"جارٍ التحليل...":lang==="fr"?"Analyse en cours...":"Analyzing...")
                      : (lang==="ar"?"استيراد وثيقة (Word أو PDF)":lang==="fr"?"Importer un document (Word ou PDF)":"Upload a document (Word or PDF)")}
                  </div>
                  <div style={{fontSize:10, color:GR}}>DOCX, PDF — max 5 MB</div>
                </div>
                <input type="file" accept=".docx,.pdf" disabled={appUploading} style={{display:"none"}}
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    if (f.size > 5*1024*1024) { setAppErr(lang==="ar"?"الملف كبير جداً (الحد 5 ميغابايت)":lang==="fr"?"Fichier trop volumineux (max 5 Mo)":"File too large (max 5 MB)"); return; }
                    setAppErr(""); setAppUploading(true);
                    try {
                      const buf = await f.arrayBuffer();
                      const b64 = btoa(Array.from(new Uint8Array(buf), b => String.fromCharCode(b)).join(""));
                      const r = await fetch("/api/parse-application", {
                        method: "POST", headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({fileBase64: b64, lang}),
                      });
                      const d = await r.json();
                      if (d.proj && d.msgs?.length > 0) {
                        const updated = {...h, msgs: d.msgs, qN: d.msgs.length / 2, proj: d.proj, step: "profile"};
                        onImportApplication(updated);
                        setDetail(updated);
                      } else {
                        setAppErr(d.error || (lang==="ar"?"تعذر العثور على إجابات في هذه الوثيقة":lang==="fr"?"Aucune réponse trouvée dans ce document":"No answers found in this document"));
                      }
                    } catch {
                      setAppErr(lang==="ar"?"تعذرت قراءة الملف":lang==="fr"?"Impossible de lire le fichier":"Couldn't read the file");
                    } finally {
                      setAppUploading(false);
                    }
                  }}/>
              </label>
            </Card>
            {h.proj && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>📋 {lang==="ar"?"ملف المشروع":lang==="fr"?"Profil du Projet":"Project Profile"}</span>
              </div>
              {[
                {l:"Projet", v:h.proj.projectName, i:"🏢"}, {l:"Secteur", v:h.proj.sector, i:"🏭"},
                {l:"Structure", v:h.proj.legalStructure, i:"⚖️"}, {l:"Zone", v:h.proj.location, i:"📍"},
                {l:"Bénéficiaires", v:h.proj.beneficiaries, i:"👥"}, {l:"Axe INDH", v:h.proj.pillar, i:"🏛️"},
                {l:"Budget estimé", v:h.proj.estimatedBudget ? `${Number(h.proj.estimatedBudget).toLocaleString()} MAD` : null, i:"💰"},
              ].filter(x => x.v).map((x, i) => (
                <div key={i} style={{display:"flex", gap:"10px", alignItems:"center",
                  padding:"10px 12px", background:CR, borderRadius:"10px",
                  border:`1px solid ${CD}`, marginBottom:"7px"}}>
                  <span style={{fontSize:"18px"}}>{x.i}</span>
                  <div><div style={{fontSize:"9px", color:GR, fontWeight:"700", textTransform:"uppercase"}}>{x.l}</div>
                    <div style={{fontSize:"13px", color:ND, fontWeight:"600"}}>{x.v}</div></div>
                </div>
              ))}
            </Card>}
            {h.comp && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>✅ {t.compT}</span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
                <div style={{width:72, height:72, borderRadius:"50%",
                  background: h.comp.eligible ? ND : "#FFF0F0",
                  border:`3px solid ${h.comp.eligible ? Y : RE}`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <span style={{fontSize:"22px", fontWeight:"800", color: h.comp.eligible ? Y : RE}}>{h.comp.score}</span>
                </div>
                <div>
                  <div style={{fontSize:"14px", fontWeight:"700", color: h.comp.eligible ? GN : RE, marginBottom:"4px"}}>
                    {h.comp.eligible ? t.eligible : t.notElig}</div>
                  {h.comp.pillar && <div style={{fontSize:"12px", color:GR}}>📌 {h.comp.pillar}</div>}
                </div>
              </div>
            </Card>}
            {h.plan && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  📋 {lang==="ar"?"خطة الأعمال":lang==="fr"?"Plan d'Affaires":"Business Plan"}
                </span>
              </div>
              {[
                {l:lang==="ar"?"الملخص التنفيذي":lang==="fr"?"Résumé Exécutif":"Executive Summary", v:h.plan.executiveSummary},
                {l:lang==="ar"?"الحل المقترح":lang==="fr"?"Solution Proposée":"Proposed Solution", v:h.plan.solution},
                {l:lang==="ar"?"النموذج الاقتصادي":lang==="fr"?"Modèle Économique":"Business Model", v:h.plan.businessModel},
                {l:lang==="ar"?"الأثر الاجتماعي":lang==="fr"?"Impact Social":"Social Impact", v:h.plan.socialImpact},
              ].filter(x => x.v).map((x, i) => (
                <div key={i} style={{padding:"10px 12px", background:CR, borderRadius:"10px",
                  borderLeft:`3px solid ${Y}`, marginBottom:"8px"}}>
                  <div style={{fontSize:"9px", color:GR, fontWeight:"700", textTransform:"uppercase", marginBottom:"4px"}}>{x.l}</div>
                  <div style={{fontSize:"13px", color:ND, lineHeight:"1.6"}}>{x.v}</div>
                </div>
              ))}
            </Card>}
            {(h.plan || h.budget) && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  📥 {lang==="ar"?"تنزيل الملفات":lang==="fr"?"Télécharger les documents":"Download documents"}
                </span>
              </div>
              <div style={{display:"flex", gap:"8px", marginBottom:"10px"}}>
                {["fr","ar","en"].map(l => (
                  <button key={l} onClick={() => setPptxLang(l)}
                    style={{padding:"5px 12px", borderRadius:"7px", border:`1px solid ${pptxLang===l?Y:CD}`,
                      background: pptxLang===l ? Y : WH, color: pptxLang===l ? WH : GR,
                      fontSize:"11px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer"}}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11, color:GR, fontWeight:700, textTransform:"uppercase", margin:"0 0 8px"}}>
                {lang==="ar"?"ملف المشروع الكامل (اللجنة)":lang==="fr"?"Dossier complet du projet (comité)":"Full project dossier (committee)"}
              </div>
              <div style={{display:"flex", gap:"10px", flexWrap:"wrap"}}>
                {([
                  {kind:"comite" as const, icon:"🏛️", label:{ar:"عرض اللجنة (.pptx)",fr:"Présentation Comité (.pptx)",en:"Committee Presentation (.pptx)"}},
                  {kind:"projet" as const, icon:"📋", label:{ar:"بطاقة المشروع (.docx)",fr:"Fiche Projet (.docx)",en:"Fiche Projet (.docx)"}},
                  {kind:"technique" as const, icon:"🔧", label:{ar:"البطاقة التقنية (.docx)",fr:"Fiche Technique (.docx)",en:"Fiche Technique (.docx)"}},
                  {kind:"plan" as const, icon:"📈", label:{ar:"خطة الأعمال (.docx)",fr:"Business Plan (.docx)",en:"Business Plan (.docx)"}},
                ]).map(btn => (
                  <button key={btn.kind} onClick={() => downloadHolderDocument(h, btn.kind)} disabled={docxBusy!==null}
                    style={{padding:"10px 16px", borderRadius:"10px", border:`1.5px solid ${CD}`,
                      background: docxBusy===btn.kind ? CD : WH, color: docxBusy===btn.kind ? WH : ND,
                      fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor: docxBusy!==null ? "default" : "pointer"}}>
                    {docxBusy===btn.kind
                      ? (lang==="ar"?"جارٍ الإنشاء...":lang==="fr"?"Génération...":"Generating...")
                      : `${btn.icon} ${btn.label[lang as "ar"|"fr"|"en"] || btn.label.fr}`}
                  </button>
                ))}
              </div>
              {docxErr && <div style={{marginTop:10, padding:"8px 12px", background:`${RE}12`,
                border:`1px solid ${RE}44`, borderRadius:8, fontSize:12, color:RE}}>{docxErr}</div>}
              {!h.plan && <div style={{fontSize:12, color:GR, marginTop:6}}>
                {lang==="ar"?"لم يصل الحامل بعد إلى خطوة خطة الأعمال.":lang==="fr"?"Ce porteur n'a pas encore atteint l'étape Plan d'Affaires.":"This holder hasn't reached the Business Plan step yet."}
              </div>}
            </Card>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh", background:CR, fontFamily:ff(lang), direction:"ltr", display:"flex"}}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)}
        style={{position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:299}}/>}
      <DashSidebar user={user} navItems={COORD_NAV} activeTab={tab}
        onTabChange={setTab} onLogout={onLogout} lang={lang} setLang={setLang} t={t}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
        {/* Mobile top bar */}
        <div className="dash-topbar" style={{background:WH, borderBottom:`1px solid ${CD}`,
          padding:"12px 16px", alignItems:"center", gap:"12px",
          position:"sticky", top:0, zIndex:100}}>
          <button onClick={() => setSidebarOpen(true)}
            style={{background:"transparent", border:`1px solid ${CD}`, borderRadius:"8px",
              padding:"6px 10px", fontSize:"16px", cursor:"pointer", color:ND}}>☰</button>
          <span style={{fontSize:"14px", fontWeight:"700", color:ND}}>IdeaMap</span>
        </div>
        <div style={{padding:"32px 40px 48px", maxWidth:860}}>
          {syncError && (
            <div style={{display:"flex", alignItems:"flex-start", gap:"10px", padding:"12px 16px",
              background:"#FBF3EC", border:`1px solid ${RE}66`, borderRadius:"11px", marginBottom:"20px"}}>
              <span style={{fontSize:"16px"}}>⚠️</span>
              <span style={{fontSize:"12.5px", color:ND, lineHeight:"1.5"}}>
                {lang==="ar"
                  ? "تعذّر الاتصال بقاعدة البيانات المركزية — القائمة أدناه قد لا تعكس كل التسجيلات الفعلية. أبلغ المسؤول عن هذا الخلل."
                  : lang==="fr"
                  ? "Connexion à la base de données centrale impossible — la liste ci-dessous peut ne pas refléter toutes les inscriptions réelles. Signalez ceci à l'administrateur."
                  : "Can't connect to the central database — the list below may not reflect every real registration. Report this to the administrator."}
              </span>
            </div>
          )}

          {/* ── Overview ── */}
          {tab === "overview" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>{user.id}</p>
            {(() => {
              const eligC  = holders.filter(h => h.comp?.eligible).length;
              const eligR  = holders.length ? Math.round((eligC / holders.length) * 100) : 0;
              const avgPct = holders.length
                ? Math.round(holders.reduce((s, h) => s + (STEPS_LIST.indexOf(h.step||"idea") / (STEPS_LIST.length - 1) * 100), 0) / holders.length)
                : 0;
              return (
                <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, marginBottom:20}}>
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"الحاملون المعينون":lang==="fr"?"Porteurs assignés":"Assigned holders"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:ND}}>{holders.length}</div>
                  </div>
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"متوسط التقدم":lang==="fr"?"Préparation":"Avg progress"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:ND}}>{holders.length ? avgPct + "%" : "—"}</div>
                    {holders.length > 0 && (
                      <div style={{height:4, background:CD, borderRadius:2, marginTop:8, overflow:"hidden"}}>
                        <div style={{height:"100%", borderRadius:2, background:Y, width:`${avgPct}%`, transition:"width .5s"}}/>
                      </div>
                    )}
                  </div>
                  <div style={{background: eligC > 0 ? "#EAF3EF" : WH, border:`1px solid ${eligC > 0 ? GN + "44" : CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"مشاريع مؤهلة":lang==="fr"?"Projets éligibles":"Eligible projects"}
                    </div>
                    <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                      <div style={{fontSize:28, fontWeight:800, color: eligC > 0 ? GN : ND}}>{eligC}</div>
                      {holders.length > 0 && <div style={{fontSize:12, fontWeight:700, color: eligC > 0 ? GN : GR}}>({eligR}%)</div>}
                    </div>
                  </div>
                </div>
              );
            })()}
            {holders.length === 0 ? (
              <Card style={{textAlign:"center", padding:"40px 24px"}}>
                <svg viewBox="0 0 200 140" style={{width:180, height:126, margin:"0 auto 18px", display:"block"}}>
                  <circle cx="100" cy="56" r="38" fill={YL} stroke={Y} strokeWidth="1.5"/>
                  <text x="100" y="68" textAnchor="middle" fontSize="32">🎓</text>
                  <rect x="30" y="104" width="140" height="8" rx="4" fill={CD}/>
                  <rect x="55" y="118" width="90" height="8" rx="4" fill={CD}/>
                </svg>
                <div style={{fontSize:"16px", fontWeight:"700", color:ND, marginBottom:"6px"}}>
                  {lang==="ar"?"لا يوجد حاملون بعد":lang==="fr"?"Aucun porteur assigné":"No holders assigned yet"}
                </div>
                <div style={{fontSize:"13px", color:GR, lineHeight:1.6, maxWidth:300, margin:"0 auto"}}>
                  {lang==="ar"
                    ? "سيظهر حاملو مشاريعك هنا بمجرد تسجيلهم باستخدام رمز CIN الخاص بهم."
                    : lang==="fr"
                    ? "Vos porteurs apparaîtront ici dès qu'ils se connectent avec leur CIN."
                    : "Your holders appear here once they sign in with their CIN."}
                </div>
              </Card>
            ) : (
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"توزيع المراحل":lang==="fr"?"Distribution des étapes":"Step distribution"}
                </span>
              </div>
              {["idea","dialogue","profile","plan","budget","compliance","documents","export"].map(s => {
                const count = holders.filter(h=>(h.step||"idea")===s).length;
                return (
                  <div key={s} style={{marginBottom:9}}>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                      <span style={{fontSize:11, color:N, fontWeight:500}}>{s}</span>
                      <span style={{fontSize:11, fontWeight:700, color:ND}}>{count}</span>
                    </div>
                    <div style={{height:6, background:CD, borderRadius:3, overflow:"hidden"}}>
                      <div style={{height:"100%", borderRadius:3, background:Y,
                        width:holders.length ? `${(count/holders.length)*100}%` : "0%", transition:"width .5s"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
            )}
            {holders.filter(h => STEPS_LIST.indexOf(h.step||"idea")/(STEPS_LIST.length-1)*100 < 40).length > 0 && (
              <Card>
                <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                  <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                    ⚠️ {lang==="ar"?"يحتاجون اهتمامك":lang==="fr"?"Nécessitent votre attention":"Need attention"}
                  </span>
                </div>
                {holders.filter(h => STEPS_LIST.indexOf(h.step||"idea")/(STEPS_LIST.length-1)*100 < 40).map((h,i) => (
                  <div key={i} onClick={() => setDetail(h)} style={{display:"flex", alignItems:"center",
                    gap:10, padding:"10px 12px", background:CR, borderRadius:10,
                    border:`1px solid ${CD}`, marginBottom:7, cursor:"pointer"}}>
                    <div style={{width:32, height:32, borderRadius:"50%", background:ND, flexShrink:0,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:WH}}>
                      {(h.name||"?")[0]}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13, fontWeight:600, color:ND}}>{h.name}</div>
                      <div style={{fontSize:11, color:GR}}>{h.step||"idea"}</div>
                    </div>
                    <span style={{fontSize:10, fontWeight:700, color:RE, background:"#FBF3EC", padding:"3px 8px", borderRadius:6}}>
                      {Math.round(STEPS_LIST.indexOf(h.step||"idea")/(STEPS_LIST.length-1)*100)}%
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </>)}

          {/* ── Holders ── */}
          {tab === "holders" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"حاملو مشاريعي":lang==="fr"?"Mes porteurs":"My Holders"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {holders.length} {lang==="ar"?"حامل مشروع":lang==="fr"?"porteur(s)":"holder(s)"}
            </p>
            <div style={{display:"flex", gap:8, marginBottom:12, flexWrap:"wrap"}}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang==="ar"?"بحث...":lang==="fr"?"Rechercher un porteur...":"Search holder..."}
                style={{flex:"1 1 200px", padding:"10px 13px", borderRadius:"10px", border:`1px solid ${CD}`,
                  fontSize:"13px", fontFamily:ff(lang), color:N, background:WH, direction:dir as "rtl"|"ltr"}}/>
              <button onClick={exportExcel} disabled={excelBusy} style={{padding:"10px 16px", borderRadius:10,
                border:`1px solid ${GN}`, background:"transparent", color:GN,
                fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor: excelBusy ? "default" : "pointer",
                opacity: excelBusy ? .6 : 1, flexShrink:0}}>
                📊 {excelBusy
                  ? (lang==="ar"?"جارٍ...":lang==="fr"?"Génération...":"Generating...")
                  : (lang==="ar"?"تصدير Excel":lang==="fr"?"Exporter Excel":"Export Excel")}
              </button>
            </div>
            {filtered.length === 0 ? (
              <div style={{textAlign:"center", padding:"48px 20px"}}>
                <div style={{fontSize:"56px", marginBottom:"12px"}}>📭</div>
                <div style={{fontSize:"16px", fontWeight:"700", color:ND, marginBottom:"6px"}}>{t.noProjects}</div>
                <div style={{fontSize:"13px", color:GR}}>{lang==="ar"?"لا يوجد حاملو مشاريع":lang==="fr"?"Aucun porteur correspondant":"No matching holders"}</div>
              </div>
            ) : (<>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                  <thead>
                    <tr style={{background:THS}}>
                      {[lang==="ar"?"الحامل":lang==="fr"?"Porteur":"Holder",
                        "CIN",
                        lang==="ar"?"المشروع":lang==="fr"?"Projet":"Project",
                        lang==="ar"?"المرحلة":lang==="fr"?"Étape":"Step",
                        lang==="ar"?"التقدم":lang==="fr"?"Préparation":"Progress",
                        lang==="ar"?"الحالة":lang==="fr"?"Statut":"Status",
                      ].map((h2,i) => (
                        <th key={i} style={{padding:"10px 12px", textAlign:"left", fontSize:10.5,
                          fontWeight:700, textTransform:"uppercase", letterSpacing:.4, color:GR, whiteSpace:"nowrap"}}>
                          {h2}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h,i) => {
                      const pct = Math.round(STEPS_LIST.indexOf(h.step||"idea")/(STEPS_LIST.length-1)*100);
                      const st = getStatus(h);
                      return (
                        <tr key={i} onClick={() => setDetail(h)}
                          style={{borderBottom:`1px solid ${CD}`, cursor:"pointer",
                            background: i%2===0 ? WH : THS, transition:"background .15s"}}>
                          <td style={{padding:"11px 12px", fontWeight:600, color:ND, whiteSpace:"nowrap"}}>
                            <div style={{display:"flex", alignItems:"center", gap:8}}>
                              <div style={{width:28, height:28, borderRadius:"50%", background:ND,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:10, fontWeight:800, color:WH, flexShrink:0}}>{(h.name||"?")[0]}</div>
                              {h.name} {h.profile?.lastName||""}
                            </div>
                          </td>
                          <td style={{padding:"11px 12px", color:GR, fontSize:12}}>{h.id}</td>
                          <td style={{padding:"11px 12px", color:GR}}>{h.proj?.projectName||"—"}</td>
                          <td style={{padding:"11px 12px", color:GR, fontSize:12}}>{h.step||"idea"}</td>
                          <td style={{padding:"11px 12px", minWidth:90}}>
                            <div style={{display:"flex", alignItems:"center", gap:6}}>
                              <div style={{flex:1, height:5, background:CD, borderRadius:3, overflow:"hidden"}}>
                                <div style={{height:"100%", borderRadius:3, background:Y, width:`${pct}%`}}/>
                              </div>
                              <span style={{fontSize:11, fontWeight:700, color:ND, flexShrink:0}}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{padding:"11px 12px"}}>
                            <span style={{padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                              background:st.bg, color:st.fg}}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>)}
          </>)}

          {/* ── Activity ── */}
          {tab === "activity" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"النشاط":lang==="fr"?"Activité":"Activity"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"آخر أحداث الحاملين":lang==="fr"?"Derniers événements des porteurs":"Latest holder events"}
            </p>
            <Card>
              {holders.length === 0 ? (
                <div style={{textAlign:"center", padding:"32px", color:GR}}>
                  {lang==="ar"?"لا توجد أحداث بعد":lang==="fr"?"Aucun événement encore":"No events yet"}
                </div>
              ) : holders.slice().reverse().map((h, i) => (
                <div key={i} style={{display:"flex", alignItems:"flex-start", gap:12,
                  paddingBottom:14, marginBottom:14,
                  borderBottom: i < holders.length-1 ? `1px solid ${CD}` : "none"}}>
                  <div style={{width:8, height:8, borderRadius:"50%", background:Y,
                    marginTop:5, flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13, color:ND, fontWeight:500}}>
                      <strong>{h.name}</strong> —{" "}
                      {lang==="ar"
                        ? `وصل إلى مرحلة ${h.step||"idea"}`
                        : lang==="fr"
                        ? `Avancement à l'étape "${h.step||"idea"}"`
                        : `Reached step "${h.step||"idea"}"`}
                    </div>
                    {h.proj?.projectName && (
                      <div style={{fontSize:12, color:GR, marginTop:2}}>{h.proj.projectName}</div>
                    )}
                  </div>
                  <span style={{fontSize:11, color:GR, whiteSpace:"nowrap", flexShrink:0}}>
                    {lang==="ar"?"مؤخراً":lang==="fr"?"Récemment":"Recently"}
                  </span>
                </div>
              ))}
            </Card>
          </>)}

          {/* ── Settings ── */}
          {tab === "settings" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"الإعدادات":lang==="fr"?"Paramètres":"Settings"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"إعدادات حسابك":lang==="fr"?"Paramètres de votre compte":"Your account settings"}
            </p>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"16px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"الملف الشخصي":lang==="fr"?"Profil":"Profile"}
                </span>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {[
                  {l:lang==="ar"?"الاسم":lang==="fr"?"Nom":"Name", v:user.name||user.id},
                  {l:lang==="ar"?"رمز الوصول":lang==="fr"?"Code d'accès":"Access code", v:user.id},
                ].map((f,i) => (
                  <div key={i}>
                    <div style={{fontSize:10, fontWeight:700, color:GR, textTransform:"uppercase",
                      letterSpacing:.5, marginBottom:5}}>{f.l}</div>
                    <input defaultValue={f.v} readOnly style={{width:"100%", padding:"11px 14px",
                      borderRadius:8, border:`1px solid ${DV}`, background:IF,
                      fontSize:13, fontFamily:ff(lang), color:N}}/>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"16px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"الإشعارات":lang==="fr"?"Notifications":"Notifications"}
                </span>
              </div>
              {[{l:lang==="ar"?"تنبيهات الحاملين المتوقفين":lang==="fr"?"Alertes de blocage":"Blocking alerts", on:true}].map((n,i) => (
                <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 0", borderBottom: i < 0 ? `1px solid ${CD}` : "none"}}>
                  <span style={{fontSize:13, color:N}}>{n.l}</span>
                  <div style={{position:"relative", width:40, height:22, borderRadius:11,
                    background: n.on ? ND : CD, cursor:"pointer", transition:"background .2s"}}>
                    <div style={{position:"absolute", top:3, left: n.on ? 21 : 3,
                      width:16, height:16, borderRadius:"50%", background:WH,
                      transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"10px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  📄 {lang==="ar"?"استبيان مخصص":lang==="fr"?"Questionnaire personnalisé":"Custom questionnaire"}
                </span>
              </div>
              <p style={{fontSize:12, color:GR, marginBottom:14, lineHeight:1.6}}>
                {lang==="ar"?"استوردوا وثيقة Word تحتوي على أسئلتكم الخاصة. الحاملون الذين يدخلون رمزكم عند التسجيل سيجيبون على هذه الأسئلة بدلاً من الأسئلة الافتراضية للتطبيق."
                  :lang==="fr"?"Importez un document Word contenant vos propres questions. Les porteurs qui entrent votre code à l'inscription répondront à ces questions au lieu des questions par défaut de l'application."
                  :"Upload a Word document with your own questions. Holders who enter your code at registration will answer these instead of the app's default questions."}
              </p>

              {questionnaire && !qDraft && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11, fontWeight:700, color:GN, marginBottom:8}}>
                    ✓ {questionnaire.length} {lang==="ar"?"سؤالاً نشطاً":lang==="fr"?"questions actives":"active questions"}
                  </div>
                  <div style={{maxHeight:180, overflowY:"auto", border:`1px solid ${CD}`, borderRadius:8, padding:"8px 12px"}}>
                    {questionnaire.map((q,i) => (
                      <div key={i} style={{fontSize:12, color:N, padding:"6px 0", borderBottom: i<questionnaire.length-1?`1px solid ${CD}`:"none"}}>
                        {i+1}. {qText(q)}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => onSaveQuestionnaire(undefined)}
                    style={{marginTop:10, padding:"8px 14px", borderRadius:8, border:`1px solid ${RE}`,
                      background:"transparent", color:RE, fontSize:12, fontWeight:600, fontFamily:ff(lang), cursor:"pointer"}}>
                    {lang==="ar"?"إزالة الاستبيان (العودة للأسئلة الافتراضية)":lang==="fr"?"Retirer (revenir aux questions par défaut)":"Remove (revert to default questions)"}
                  </button>
                </div>
              )}

              {qDraft && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11, fontWeight:700, color:Y, marginBottom:8}}>
                    {lang==="ar"?`تمت قراءة ${qDraft.length} سؤالاً — راجعوها قبل الحفظ`:lang==="fr"?`${qDraft.length} questions extraites — vérifiez avant d'enregistrer`:`${qDraft.length} questions extracted — review before saving`}
                  </div>
                  <div style={{maxHeight:220, overflowY:"auto", border:`1px solid ${Y}`, borderRadius:8, padding:"4px 8px"}}>
                    {qDraft.map((q,i) => (
                      <div key={i} style={{display:"flex", alignItems:"flex-start", gap:8, padding:"6px 0", borderBottom: i<qDraft.length-1?`1px solid ${CD}`:"none"}}>
                        <span style={{flex:1, fontSize:12, color:N}}>{i+1}. {qText(q)}</span>
                        <button onClick={() => setQDraft(qDraft.filter((_,x) => x!==i))}
                          style={{background:"none", border:"none", color:RE, cursor:"pointer", fontSize:14, flexShrink:0}}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:8, marginTop:10}}>
                    <button onClick={() => { onSaveQuestionnaire(qDraft); setQDraft(null); }}
                      disabled={qDraft.length===0}
                      style={{padding:"9px 16px", borderRadius:8, border:"none",
                        background: qDraft.length===0 ? CD : ND, color:WH, fontSize:12, fontWeight:700,
                        fontFamily:ff(lang), cursor: qDraft.length===0 ? "default" : "pointer"}}>
                      {lang==="ar"?"✓ حفظ الاستبيان":lang==="fr"?"✓ Enregistrer le questionnaire":"✓ Save questionnaire"}
                    </button>
                    <button onClick={() => setQDraft(null)}
                      style={{padding:"9px 16px", borderRadius:8, border:`1px solid ${CD}`,
                        background:"transparent", color:GR, fontSize:12, fontFamily:ff(lang), cursor:"pointer"}}>
                      {lang==="ar"?"إلغاء":lang==="fr"?"Annuler":"Cancel"}
                    </button>
                  </div>
                </div>
              )}

              {qErr && (
                <div style={{padding:"10px 12px", background:`${RE}12`, border:`1px solid ${RE}44`,
                  borderRadius:8, marginBottom:12, fontSize:12, color:RE}}>{qErr}</div>
              )}

              {!qDraft && (
                <label style={{display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                  borderRadius:10, border:`1.5px dashed ${Y}`, background:YL, cursor: qUploading ? "default" : "pointer",
                  opacity: qUploading ? .6 : 1}}>
                  <span style={{fontSize:20}}>{qUploading ? "⏳" : "📁"}</span>
                  <div>
                    <div style={{fontSize:12, fontWeight:600, color:ND}}>
                      {qUploading
                        ? (lang==="ar"?"جارٍ التحليل...":lang==="fr"?"Analyse en cours...":"Analyzing...")
                        : (questionnaire
                          ? (lang==="ar"?"استبدال بوثيقة أخرى":lang==="fr"?"Remplacer par un autre document":"Replace with another document")
                          : (lang==="ar"?"استيراد وثيقة (Word أو PDF)":lang==="fr"?"Importer un document (Word ou PDF)":"Upload a document (Word or PDF)"))}
                    </div>
                    <div style={{fontSize:10, color:GR}}>DOCX, PDF — max 5 MB</div>
                  </div>
                  <input type="file" accept=".docx,.pdf" disabled={qUploading} style={{display:"none"}}
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      if (f.size > 5*1024*1024) { setQErr(lang==="ar"?"الملف كبير جداً (الحد 5 ميغابايت)":lang==="fr"?"Fichier trop volumineux (max 5 Mo)":"File too large (max 5 MB)"); return; }
                      setQErr(""); setQUploading(true);
                      try {
                        const buf = await f.arrayBuffer();
                        const b64 = btoa(Array.from(new Uint8Array(buf), b => String.fromCharCode(b)).join(""));
                        const r = await fetch("/api/parse-questionnaire", {
                          method: "POST", headers: {"Content-Type": "application/json"},
                          body: JSON.stringify({fileBase64: b64}),
                        });
                        const d = await r.json();
                        if (d.questions?.length > 0) setQDraft(d.questions);
                        else setQErr(lang==="ar"?"تعذر العثور على أسئلة في هذه الوثيقة":lang==="fr"?"Aucune question trouvée dans ce document":"No questions found in this document");
                      } catch {
                        setQErr(lang==="ar"?"تعذرت قراءة الملف":lang==="fr"?"Impossible de lire le fichier":"Couldn't read the file");
                      } finally {
                        setQUploading(false);
                      }
                    }}/>
                </label>
              )}
            </Card>
          </>)}

        </div>
      </div>
      <HelpAgent lang={lang}
        context={`Coordinateur: ${user.id} | ${holders.length} porteurs suivis | ${holders.filter(h => h.comp?.eligible).length} éligibles | ${holders.filter(h => h.step === "export").length} dossiers complets`}
        actions={[{
          name: "export_excel",
          label: `📊 ${lang==="ar"?"تصدير Excel":lang==="fr"?"Exporter Excel":"Export Excel"}`,
          run: exportExcel,
        }]}/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════════════════ */
function AdminDash({lang, setLang, user, onLogout, t, holders, coords, onAddCoord, onDelCoord, onEditCoord, onDelHolder, syncError}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; holders: any[]; coords: Coord[];
  onAddCoord: (c: Coord) => void; onDelCoord: (i: number) => void;
  onEditCoord: (i: number, patch: Partial<Coord>) => void; onDelHolder: (id: string) => void;
  syncError?: boolean;
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [tab, setTab]           = useState("overview");
  const [newCoordName, setNewCoordName] = useState("");
  const [newCoordRegion, setNewCoordRegion] = useState("");
  const [newCoordArr, setNewCoordArr]       = useState("");
  const [coordEditIdx, setCoordEditIdx]     = useState<number | null>(null);
  const [coordDelConfirm, setCoordDelConfirm] = useState<number | null>(null);
  const [copiedCode, setCopiedCode]         = useState("");
  const [search, setSearch]     = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterStep, setFilterStep]     = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [sortKey, setSortKey]   = useState<"name"|"date"|"score">("date");
  const [sortDir, setSortDir]   = useState<"asc"|"desc">("desc");
  const [detailH, setDetailH]   = useState<any>(null);
  const [delConfirmId, setDelConfirmId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [excelBusy, setExcelBusy]     = useState(false);
  const [toast, setToast]             = useState<{msg: string; type: "error"|"success"} | null>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const ADMIN_NAV = [
    {id:"overview",     label: lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"},
    {id:"demographics", label: lang==="ar"?"الديموغرافيا":lang==="fr"?"Démographie":"Demographics"},
    {id:"scores",       label: lang==="ar"?"النقاط والمطابقة":lang==="fr"?"Scores & Conformité":"Scores & Compliance"},
    {id:"projects",     label: lang==="ar"?"المشاريع":lang==="fr"?"Projets":"Projects"},
    {id:"coords",       label: lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs":"Coordinators"},
    {id:"activity",     label: lang==="ar"?"النشاط":lang==="fr"?"Activité":"Activity"},
    {id:"settings",     label: lang==="ar"?"الإعدادات":lang==="fr"?"Paramètres":"Settings"},
  ];

  const STEPS_LIST = ["idea","dialogue","profile","plan","budget","compliance","documents","export"];

  // Admin creates a coordinator by name only — the actual login code is derived
  // automatically as "@{NAME}COD" (matching RE_COORD), never typed by hand. Strips
  // anything that isn't a letter (spaces, accents via NFD stripping, digits) so the
  // result always satisfies RE_COORD's [A-Za-z]{2,} requirement.
  const coordCodeFrom = (name: string): string => {
    const letters = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toUpperCase().replace(/[^A-Z]/g, "");
    return letters ? `@${letters}COD` : "";
  };
  const newCoordCode = coordCodeFrom(newCoordName);
  const newCoordValid = RE_COORD.test(newCoordCode) && !coords.some(c => c.code.toUpperCase() === newCoordCode.toUpperCase());
  const newCoordShowArr = newCoordRegion === "Casablanca-Settat";

  // Normalizes a raw stored value against a lang-keyed options record (GENDERS,
  // EDU, OCCUPATION) so holders who registered in different languages still
  // bucket together — finds which index the value matches in ANY language array,
  // then returns that index label in the currently-displayed language.
  const normOpt = (value: string, options: Record<string, string[]>): string => {
    if (!value) return "";
    for (const arr of Object.values(options)) {
      const idx = arr.indexOf(value);
      if (idx >= 0) return options[lang]?.[idx] || value;
    }
    return value;
  };

  const filtered = holders.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || (h.name||"").toLowerCase().includes(q) || (h.id||"").toLowerCase().includes(q) || (h.proj?.projectName||"").toLowerCase().includes(q);
    const matchRegion = !filterRegion || h.profile?.region === filterRegion;
    const matchSector = !filterSector || (h.proj?.sector || h.profile?.sector) === filterSector;
    const matchStep   = !filterStep   || (h.step || "idea") === filterStep;
    const matchGender = !filterGender || normOpt(h.profile?.gender, GENDERS) === filterGender;
    return matchSearch && matchRegion && matchSector && matchStep && matchGender;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = (a.name||"").localeCompare(b.name||"");
    else if (sortKey === "score") cmp = (a.comp?.score||0) - (b.comp?.score||0);
    else cmp = (a.createdAt||0) - (b.createdAt||0);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const byRegion = holders.reduce((a: Record<string, number>, h: any) => {
    const r = h.profile?.region || "N/A"; a[r] = (a[r] || 0) + 1; return a;
  }, {});
  const bySector = holders.reduce((a: Record<string, number>, h: any) => {
    const s = h.proj?.sector || h.profile?.sector || "N/A"; a[s] = (a[s] || 0) + 1; return a;
  }, {});

  // Real .xlsx (not CSV) export of the full platform-wide holder list — also
  // the HelpAgent's one allow-listed action for this dashboard (§5 of the
  // Dossier Factory prompt).
  const exportExcel = async () => {
    setExcelBusy(true);
    try {
      await generateHoldersExcel(holders, lang, "admin", (msg, type = "error") => setToast({msg, type}));
    } finally {
      setExcelBusy(false);
    }
  };

  const BarRow = ({label, n, total, col}: {label: string; n: number; total: number; col: string}) => (
    <div style={{marginBottom: "10px"}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "3px"}}>
        <span style={{fontSize: "11px", color: N, fontWeight: "500"}}>{label}</span>
        <span style={{fontSize: "11px", fontWeight: "700", color: ND}}>{n} ({total ? Math.round(n / total * 100) : 0}%)</span>
      </div>
      <div style={{height: "6px", background: CD, borderRadius: "3px", overflow: "hidden"}}>
        <div style={{height: "100%", borderRadius: "3px", background: col,
          width: total ? `${(n / total) * 100}%` : "0%", transition: "width .5s"}}/>
      </div>
    </div>
  );

  const getStatus = (h: any) => {
    if (h.comp?.eligible) return {label:lang==="ar"?"مؤهل":lang==="fr"?"Éligible":"Eligible", bg:"#EAF3EF", fg:GN};
    const pct = STEPS_LIST.indexOf(h.step||"idea") / (STEPS_LIST.length-1) * 100;
    if (pct >= 40) return {label:lang==="ar"?"جارٍ":lang==="fr"?"En cours":"In progress", bg:"#FBF3EC", fg:RE};
    return {label:lang==="ar"?"بداية":lang==="fr"?"Démarrage":"Starting", bg:"#F0EEE9", fg:GR};
  };

  /* ── Detail view with sidebar ── */
  if (detailH) {
    const h = detailH;
    return (
      <div style={{minHeight:"100vh", background:CR, fontFamily:ff(lang), direction:"ltr", display:"flex"}}>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:299}}/>}
        <DashSidebar user={user} navItems={ADMIN_NAV} activeTab={tab}
          onTabChange={id => { setTab(id); setDetailH(null); setSidebarOpen(false); }}
          onLogout={onLogout} lang={lang} setLang={setLang} t={t}
          open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
          {/* Mobile top bar */}
          <div className="dash-topbar" style={{background:WH, borderBottom:`1px solid ${CD}`,
            padding:"12px 16px", alignItems:"center", gap:"12px",
            position:"sticky", top:0, zIndex:100}}>
            <button onClick={() => setSidebarOpen(true)}
              style={{background:"transparent", border:`1px solid ${CD}`, borderRadius:"8px",
                padding:"6px 10px", fontSize:"16px", cursor:"pointer", color:ND}}>☰</button>
            <span style={{fontSize:"14px", fontWeight:"700", color:ND}}>IdeaMap</span>
          </div>
          <div style={{padding:"32px 40px 48px", maxWidth:860}}>
            <button onClick={() => setDetailH(null)} style={{marginBottom:"20px", padding:"8px 16px",
              borderRadius:"8px", border:`1px solid ${CD}`, background:WH,
              color:N, fontSize:"12px", fontWeight:"600", fontFamily:ff(lang), cursor:"pointer"}}>
              ← {lang==="ar"?"رجوع":lang==="fr"?"Retour":"Back"}
            </button>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px"}}>
                <div style={{width:48, height:48, borderRadius:"50%", background:ND, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"18px", fontWeight:"800", color:WH}}>{(h.name||"?")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"17px", fontWeight:"700", color:ND}}>{h.name} {h.profile?.lastName||""}</div>
                  <div style={{fontSize:"12px", color:GR}}>{h.id} · {regionDisplay(h.profile)} · {h.profile?.projType}</div>
                </div>
                <div style={{display:"flex", gap:"6px", flexShrink:0}}>
                  <Badge role="holder"/>
                  {h.comp && <span style={{padding:"3px 8px", borderRadius:"7px", fontSize:"10px", fontWeight:"700",
                    background: h.comp.eligible ? GN+"22" : RE+"22", color: h.comp.eligible ? GN : RE}}>
                    {h.comp.score}/100
                  </span>}
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {[
                  {l:"Age", v:h.profile?.age, i:"📅"}, {l:"Genre", v:h.profile?.gender, i:"👤"},
                  {l:"Région", v:regionDisplay(h.profile), i:"📍"}, {l:"Secteur", v:h.profile?.sector, i:"🏭"},
                  {l:"Email", v:h.profile?.email, i:"📧"}, {l:"Téléphone", v:h.profile?.phone, i:"📞"},
                  {l:"Formation", v:h.profile?.edu, i:"🎓"}, {l:"Type porteur", v:h.profile?.projType, i:"⚖️"},
                ].filter(x => x.v).map((x, i) => (
                  <div key={i} style={{display:"flex", gap:"8px", alignItems:"center",
                    padding:"10px", background:CR, borderRadius:"10px", border:`1px solid ${CD}`}}>
                    <span>{x.i}</span>
                    <div><div style={{fontSize:"9px", color:GR, fontWeight:"700", textTransform:"uppercase"}}>{x.l}</div>
                      <div style={{fontSize:"12px", color:ND, fontWeight:"600"}}>{x.v}</div></div>
                  </div>
                ))}
              </div>
            </Card>
            {h.proj && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>📋 {lang==="ar"?"ملف المشروع":lang==="fr"?"Profil du Projet":"Project Profile"}</span>
              </div>
              {[
                {l:"Projet", v:h.proj.projectName, i:"🏢"}, {l:"Secteur", v:h.proj.sector, i:"🏭"},
                {l:"Structure", v:h.proj.legalStructure, i:"⚖️"}, {l:"Zone", v:h.proj.location, i:"📍"},
                {l:"Bénéficiaires", v:h.proj.beneficiaries, i:"👥"}, {l:"Axe INDH", v:h.proj.pillar, i:"🏛️"},
                {l:"Budget estimé", v:h.proj.estimatedBudget ? `${Number(h.proj.estimatedBudget).toLocaleString()} MAD` : null, i:"💰"},
              ].filter(x => x.v).map((x, i) => (
                <div key={i} style={{display:"flex", gap:"10px", alignItems:"center",
                  padding:"10px 12px", background:CR, borderRadius:"10px", border:`1px solid ${CD}`, marginBottom:"7px"}}>
                  <span style={{fontSize:"18px"}}>{x.i}</span>
                  <div><div style={{fontSize:"9px", color:GR, fontWeight:"700", textTransform:"uppercase"}}>{x.l}</div>
                    <div style={{fontSize:"13px", color:ND, fontWeight:"600"}}>{x.v}</div></div>
                </div>
              ))}
            </Card>}
            {h.plan && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"12px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>📊 {lang==="ar"?"خطة الأعمال":lang==="fr"?"Plan d'Affaires":"Business Plan"}</span>
              </div>
              {h.plan.executiveSummary && <div style={{padding:"12px 14px", background:CR, borderRadius:"12px",
                borderLeft:`4px solid ${Y}`, marginBottom:"8px", fontSize:"13px", color:ND, lineHeight:"1.7"}}>
                {h.plan.executiveSummary.slice(0,300)}{h.plan.executiveSummary.length > 300 ? "…" : ""}
              </div>}
              {h.plan.projections && <div style={{display:"flex", gap:"8px"}}>
                {Object.entries(h.plan.projections).map(([y, v]) => (
                  <div key={y} style={{flex:1, textAlign:"center", padding:"10px", background:YL,
                    borderRadius:"10px", border:`1px solid ${Y}55`}}>
                    <div style={{fontSize:"9px", color:GR, fontWeight:"700", textTransform:"uppercase"}}>An {y.replace("year","")}</div>
                    <div style={{fontSize:"18px", fontWeight:"800", color:N}}>{Number(v).toLocaleString()}</div>
                    <div style={{fontSize:"9px", color:GR}}>MAD</div>
                  </div>
                ))}
              </div>}
            </Card>}
            {h.comp && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>✅ {t.compT}</span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"16px", marginBottom:"14px"}}>
                <div style={{width:72, height:72, borderRadius:"50%",
                  background: h.comp.eligible ? ND : "#FFF0F0",
                  border:`3px solid ${h.comp.eligible ? Y : RE}`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <span style={{fontSize:"22px", fontWeight:"800", color: h.comp.eligible ? Y : RE}}>{h.comp.score}</span>
                </div>
                <div>
                  <div style={{fontSize:"14px", fontWeight:"700", color: h.comp.eligible ? GN : RE, marginBottom:"4px"}}>
                    {h.comp.eligible ? t.eligible : t.notElig}
                  </div>
                  {h.comp.pillar && <div style={{fontSize:"12px", color:GR}}>📌 {h.comp.pillar}</div>}
                </div>
              </div>
              {h.comp.juryScore && JURY.map(({key, label, w}) => {
                const sc = h.comp.juryScore[key]||0; const p = (sc/w)*100;
                const col = p >= 70 ? Y : p >= 50 ? "#F59E0B" : RE;
                return (<div key={key} style={{marginBottom:"8px"}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:"2px"}}>
                    <span style={{fontSize:"11px", color:N}}>{label}</span>
                    <span style={{fontSize:"11px", fontWeight:"800", color:ND}}>{sc}/{w}</span>
                  </div>
                  <div style={{height:"5px", background:CD, borderRadius:"3px", overflow:"hidden"}}>
                    <div style={{height:"100%", borderRadius:"3px", background:col, width:`${Math.min(p,100)}%`}}/>
                  </div>
                </div>);
              })}
            </Card>}
            <div style={{padding:"14px 16px", background:ND, borderRadius:"12px", display:"flex",
              alignItems:"center", justifyContent:"space-between", gap:"12px"}}>
              <span style={{fontSize:"13px", color:WH, fontWeight:"600"}}>
                📄 {lang==="ar"?"تصدير بيانات هذا الحامل":lang==="fr"?"Exporter ce porteur":"Export this holder"}
              </span>
              <button onClick={() => {
                const h2 = detailH;
                const rows = [
                  ["ID","Nom","Prénom","Age","Email","Téléphone","Région","Préfecture","Arrondissement","Secteur","Projet","Score","Éligible","Étape"],
                  [h2.id, h2.profile?.lastName||"", h2.name||"", h2.profile?.age||"", h2.profile?.email||"",
                   h2.profile?.phone||"", h2.profile?.region||"", h2.profile?.prefecture||"", h2.profile?.arrondissement||"",
                   h2.proj?.sector||"", h2.proj?.projectName||"", h2.comp?.score||"", h2.comp?.eligible?"OUI":"NON", h2.step||"idea"],
                ].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
                const url = URL.createObjectURL(new Blob(["﻿"+rows], {type:"text/csv;charset=utf-8"}));
                Object.assign(document.createElement("a"), {href: url, download: `Porteur_${h2.id}.csv`}).click();
                setTimeout(() => URL.revokeObjectURL(url), 60000);
              }} style={{padding:"8px 16px", borderRadius:"8px", border:`1.5px solid ${Y}`,
                background:"transparent", color:Y, fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer"}}>
                ⬇ CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh", background:CR, fontFamily:ff(lang), direction:"ltr", display:"flex"}}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)}
        style={{position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:299}}/>}
      <DashSidebar user={user} navItems={ADMIN_NAV} activeTab={tab}
        onTabChange={setTab} onLogout={onLogout} lang={lang} setLang={setLang} t={t}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
        {/* Mobile top bar */}
        <div className="dash-topbar" style={{background:WH, borderBottom:`1px solid ${CD}`,
          padding:"12px 16px", alignItems:"center", gap:"12px",
          position:"sticky", top:0, zIndex:100}}>
          <button onClick={() => setSidebarOpen(true)}
            style={{background:"transparent", border:`1px solid ${CD}`, borderRadius:"8px",
              padding:"6px 10px", fontSize:"16px", cursor:"pointer", color:ND}}>☰</button>
          <span style={{fontSize:"14px", fontWeight:"700", color:ND}}>IdeaMap</span>
        </div>
        <div style={{padding:"32px 40px 48px", maxWidth:900}}>
          {syncError && (
            <div style={{display:"flex", alignItems:"flex-start", gap:"10px", padding:"12px 16px",
              background:"#FBF3EC", border:`1px solid ${RE}66`, borderRadius:"11px", marginBottom:"20px"}}>
              <span style={{fontSize:"16px"}}>⚠️</span>
              <span style={{fontSize:"12.5px", color:ND, lineHeight:"1.5"}}>
                {lang==="ar"
                  ? "تعذّر الاتصال بقاعدة البيانات (Upstash Redis) — تحقق من متغيرات البيئة في Vercel. القائمة أدناه لا تعكس كل التسجيلات الفعلية."
                  : lang==="fr"
                  ? "Connexion à la base de données (Upstash Redis) impossible — vérifiez les variables d'environnement dans Vercel. La liste ci-dessous ne reflète pas toutes les inscriptions réelles."
                  : "Can't connect to the database (Upstash Redis) — check the environment variables in Vercel. The list below doesn't reflect every real registration."}
              </span>
            </div>
          )}

          {/* ── Overview ── */}
          {tab === "overview" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"لوحة تحكم المدير":lang==="fr"?"Tableau de bord Administrateur":"Admin Dashboard"}
            </p>
            {(() => {
              const eligCount   = holders.filter(h => h.comp?.eligible).length;
              const eligRate    = holders.length ? Math.round((eligCount / holders.length) * 100) : 0;
              const doneCount   = holders.filter(h => h.step === "export").length;
              const avgScore    = holders.length ? Math.round(holders.reduce((s, h) => s + (h.comp?.score || 0), 0) / holders.length) : 0;
              const scoreCol    = avgScore >= 60 ? GN : avgScore >= 40 ? "#D97706" : avgScore > 0 ? RE : GR;
              return (
                <div style={{display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:14, marginBottom:20}}>
                  {/* Card 1 — total holders */}
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"الحاملون النشطون":lang==="fr"?"Porteurs actifs":"Active holders"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:ND}}>{holders.length}</div>
                  </div>
                  {/* Card 2 — eligible count + rate */}
                  <div style={{background:eligCount > 0 ? "#EAF3EF" : WH, border:`1px solid ${eligCount > 0 ? GN + "44" : CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"مشاريع مؤهلة":lang==="fr"?"Projets éligibles":"Eligible projects"}
                    </div>
                    <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                      <div style={{fontSize:28, fontWeight:800, color: eligCount > 0 ? GN : ND}}>{eligCount}</div>
                      {holders.length > 0 && <div style={{fontSize:12, fontWeight:700, color: eligCount > 0 ? GN : GR}}>({eligRate}%)</div>}
                    </div>
                  </div>
                  {/* Card 3 — coordinators */}
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs":"Coordinators"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:ND}}>{coords.length}</div>
                  </div>
                  {/* Card 4 — avg jury score with color + completed dossiers */}
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                    padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"متوسط النقاط":lang==="fr"?"Score moyen":"Avg score"}
                    </div>
                    <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                      <div style={{fontSize:28, fontWeight:800, color:scoreCol}}>{avgScore > 0 ? avgScore : "—"}</div>
                      {avgScore > 0 && <div style={{fontSize:12, fontWeight:700, color:scoreCol}}>/100</div>}
                    </div>
                    {doneCount > 0 && (
                      <div style={{fontSize:10.5, color:GN, fontWeight:600, marginTop:4}}>
                        ✓ {doneCount} {lang==="ar"?"دوسيه كامل":lang==="fr"?"dossier(s) complet(s)":"complete dossier(s)"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14}}>
              <Card style={{marginBottom:0}}>
                <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                  <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>📍 {t.byRegion}</span>
                </div>
                {Object.entries(byRegion).sort((a,b)=>(b[1] as number)-(a[1] as number)).slice(0,6).map(([r,n],i) => (
                  <BarRow key={r} label={r} n={n as number} total={holders.length}
                    col={[ND,Y,"#22C55E","#8B5CF6","#EC4899","#14B8A6"][i%6]}/>
                ))}
                {Object.keys(byRegion).length === 0 && <p style={{color:GR, fontSize:"13px"}}>{t.noProjects}</p>}
              </Card>
              <Card style={{marginBottom:0}}>
                <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                  <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>🏭 {t.bySector}</span>
                </div>
                {Object.entries(bySector).sort((a,b)=>(b[1] as number)-(a[1] as number)).slice(0,6).map(([s,n],i) => (
                  <BarRow key={s} label={s} n={n as number} total={holders.length}
                    col={[ND,Y,"#22C55E","#8B5CF6","#EC4899","#14B8A6"][i%6]}/>
                ))}
                {Object.keys(bySector).length === 0 && <p style={{color:GR, fontSize:"13px"}}>{t.noProjects}</p>}
              </Card>
            </div>
            {holders.length > 0 && (() => {
              const STEP_ORDER = ["idea","dialogue","profile","plan","budget","compliance","documents","export"];
              const stepIdx = (h: any) => STEP_ORDER.indexOf(h.step || "idea");
              const funnel = [
                {label: lang==="ar"?"مسجلون":lang==="fr"?"Inscrits":"Registered", n: holders.length},
                {label: lang==="ar"?"فكرة مقدَّمة":lang==="fr"?"Idée soumise":"Idea submitted", n: holders.filter(h => stepIdx(h) >= STEP_ORDER.indexOf("profile")).length},
                {label: lang==="ar"?"خطة منجزة":lang==="fr"?"Plan généré":"Plan generated", n: holders.filter(h => h.plan).length},
                {label: lang==="ar"?"ميزانية جاهزة":lang==="fr"?"Budget prêt":"Budget ready", n: holders.filter(h => h.budget).length},
                {label: lang==="ar"?"دوسييه كامل":lang==="fr"?"Dossier complet":"Complete dossier", n: holders.filter(h => h.step === "export" || h.comp?.eligible).length},
              ];
              const AXES = [
                {key: lang==="ar"?"المحور 1 — التنمية القروية":lang==="fr"?"Axe 1 — Développement rural":"Axis 1 — Rural development", test: (p: string) => /rural|agricole|agriculture|élevage|terroir|irrigation|piste/i.test(p)},
                {key: lang==="ar"?"المحور 2 — الحد من التفاوتات":lang==="fr"?"Axe 2 — Réduction des inégalités territoriales":"Axis 2 — Territorial inequality", test: (p: string) => /inégalité|périurbain|quartier|proximité|territoria/i.test(p)},
                {key: lang==="ar"?"المحور 3 — الكرامة الإنسانية":lang==="fr"?"Axe 3 — Dignité humaine":"Axis 3 — Human dignity", test: (p: string) => /dignité|précaire|vulnérable|handicap|âgée/i.test(p)},
                {key: lang==="ar"?"المحور 4 — برامج أفقية":lang==="fr"?"Axe 4 — Programmes transversaux":"Axis 4 — Transversal programs", test: (p: string) => /jeunesse|formation|entrepreneuriat|numérique|revenu|inclusion|économique/i.test(p)},
              ];
              const byAxis: Record<string, number> = {};
              let uncategorized = 0;
              holders.forEach(h => {
                const pillar = h.comp?.pillar || h.proj?.pillar || "";
                if (!pillar) return;
                const match = AXES.find(a => a.test(pillar));
                if (match) byAxis[match.key] = (byAxis[match.key]||0) + 1;
                else uncategorized++;
              });
              if (uncategorized > 0) byAxis[lang==="ar"?"غير مصنف":lang==="fr"?"Non catégorisé":"Uncategorized"] = uncategorized;
              const AXIS_COLS = [ND,Y,"#8B5CF6","#EC4899",GR];
              return (
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14}}>
                  <Card style={{marginBottom:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                      <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>
                        🔻 {lang==="ar"?"قمع الإنجاز":lang==="fr"?"Entonnoir de complétion":"Completion funnel"}
                      </span>
                    </div>
                    {funnel.map((f,i) => (
                      <BarRow key={f.label} label={f.label} n={f.n} total={holders.length}
                        col={[ND,Y,"#8B5CF6","#EC4899","#22C55E"][i]}/>
                    ))}
                  </Card>
                  <Card style={{marginBottom:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                      <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>
                        🏛️ {lang==="ar"?"محاور المبادرة الوطنية":lang==="fr"?"Axes INDH Phase 3":"INDH Phase 3 axes"}
                      </span>
                    </div>
                    {Object.keys(byAxis).length === 0 ? <p style={{color:GR, fontSize:"13px"}}>{t.noProjects}</p> :
                      Object.entries(byAxis).sort((a,b) => (b[1] as number)-(a[1] as number)).map(([k,n],i) => (
                        <BarRow key={k} label={k} n={n as number} total={holders.length} col={AXIS_COLS[i%AXIS_COLS.length]}/>
                      ))}
                  </Card>
                </div>
              );
            })()}
            {holders.length === 0 && (
              <Card style={{textAlign:"center", padding:"40px 24px"}}>
                <svg viewBox="0 0 200 140" style={{width:180, height:126, margin:"0 auto 18px", display:"block"}}>
                  <rect x="20" y="20" width="160" height="100" rx="14" fill={YL} stroke={Y} strokeWidth="1.5"/>
                  <rect x="36" y="38" width="64" height="8" rx="4" fill={Y} opacity=".35"/>
                  <rect x="36" y="54" width="128" height="6" rx="3" fill={CD}/>
                  <rect x="36" y="66" width="100" height="6" rx="3" fill={CD}/>
                  <rect x="36" y="78" width="116" height="6" rx="3" fill={CD}/>
                  <circle cx="152" cy="42" r="14" fill={Y} opacity=".12"/>
                  <circle cx="152" cy="42" r="8" fill={Y} opacity=".5"/>
                  <path d="M148 42 l3 3 l6-6" stroke={WH} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="36" y="96" width="44" height="14" rx="7" fill={ND} opacity=".12"/>
                  <text x="58" y="107" textAnchor="middle" fontSize="8" fill={ND} fontFamily="Arial" fontWeight="700">INDH</text>
                </svg>
                <div style={{fontSize:"16px", fontWeight:"700", color:ND, marginBottom:"6px"}}>
                  {lang==="ar"?"لا توجد مشاريع بعد":lang==="fr"?"Aucun porteur enregistré":"No holders yet"}
                </div>
                <div style={{fontSize:"13px", color:GR, lineHeight:1.6, maxWidth:320, margin:"0 auto"}}>
                  {lang==="ar"
                    ? "سيظهر حاملو المشاريع هنا بعد تسجيلهم باستخدام رمز CIN الخاص بهم."
                    : lang==="fr"
                    ? "Les porteurs apparaîtront ici dès qu'ils se connectent avec leur CIN."
                    : "Holders appear here once they sign in with their CIN."}
                </div>
              </Card>
            )}
            {holders.length > 0 && <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"أحدث المشاريع":lang==="fr"?"Derniers projets":"Latest projects"}
                </span>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
                  <thead>
                    <tr style={{background:THS}}>
                      {["Porteur","CIN","Projet","Statut"].map((h2,i) => (
                        <th key={i} style={{padding:"9px 12px", textAlign:"left", fontSize:10.5,
                          fontWeight:700, textTransform:"uppercase", letterSpacing:.4, color:GR}}>{h2}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holders.slice(-5).reverse().map((h,i) => {
                      const st = getStatus(h);
                      return (
                        <tr key={i} onClick={() => setDetailH(h)} style={{borderBottom:`1px solid ${CD}`,
                          cursor:"pointer", background: i%2===0 ? WH : THS}}>
                          <td style={{padding:"10px 12px", fontWeight:600, color:ND}}>{h.name} {h.profile?.lastName||""}</td>
                          <td style={{padding:"10px 12px", color:GR, fontSize:11}}>{h.id}</td>
                          <td style={{padding:"10px 12px", color:GR}}>{h.proj?.projectName||"—"}</td>
                          <td style={{padding:"10px 12px"}}>
                            <span style={{padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                              background:st.bg, color:st.fg}}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>}
          </>)}

          {/* ── Demographics ── */}
          {tab === "demographics" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"الديموغرافيا":lang==="fr"?"Démographie":"Demographics"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"توزيع الحاملين حسب الملف الشخصي":lang==="fr"?"Répartition des porteurs par profil":"Holder breakdown by profile"}
            </p>
            {(() => {
              const byAge = holders.reduce((a: Record<string, number>, h: any) => {
                const v = h.profile?.age; if (!v) return a; a[v] = (a[v]||0)+1; return a;
              }, {} as Record<string, number>);
              const byGender = holders.reduce((a: Record<string, number>, h: any) => {
                const v = normOpt(h.profile?.gender, GENDERS); if (!v) return a; a[v] = (a[v]||0)+1; return a;
              }, {} as Record<string, number>);
              const byEdu = holders.reduce((a: Record<string, number>, h: any) => {
                const v = normOpt(h.profile?.edu, EDU); if (!v) return a; a[v] = (a[v]||0)+1; return a;
              }, {} as Record<string, number>);
              const byOcc = holders.reduce((a: Record<string, number>, h: any) => {
                const v = normOpt(h.profile?.occupation, OCCUPATION); if (!v) return a; a[v] = (a[v]||0)+1; return a;
              }, {} as Record<string, number>);
              const byRegionFull = holders.reduce((a: Record<string, number>, h: any) => {
                const r = h.profile?.region || "N/A"; a[r] = (a[r]||0)+1; return a;
              }, {} as Record<string, number>);
              const COLS = [ND,Y,"#22C55E","#8B5CF6","#EC4899","#14B8A6","#F59E0B"];
              const panel = (title: string, icon: string, data: Record<string, number>, order?: string[]) => {
                const entries = order
                  ? order.filter(k => data[k]).map(k => [k, data[k]] as [string, number])
                  : Object.entries(data).sort((a,b) => (b[1] as number) - (a[1] as number));
                return (
                  <Card style={{marginBottom:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                      <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>{icon} {title}</span>
                    </div>
                    {entries.length === 0 ? <p style={{color:GR, fontSize:"13px"}}>{t.noProjects}</p> :
                      entries.map(([k,n],i) => (
                        <BarRow key={k} label={k} n={n as number} total={holders.length} col={COLS[i%COLS.length]}/>
                      ))}
                  </Card>
                );
              };
              return (<>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14}}>
                  {panel(lang==="ar"?"حسب الجهة":lang==="fr"?"Par région":"By region", "📍", byRegionFull)}
                  {panel(lang==="ar"?"حسب الفئة العمرية":lang==="fr"?"Par tranche d'âge":"By age bracket", "🎂", byAge, AGES)}
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14}}>
                  {panel(lang==="ar"?"حسب الجنس":lang==="fr"?"Par genre":"By gender", "🧑‍🤝‍🧑", byGender, GENDERS[lang])}
                  {panel(lang==="ar"?"حسب المستوى الدراسي":lang==="fr"?"Par niveau d'études":"By education level", "🎓", byEdu, EDU[lang])}
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr", gap:14, marginBottom:14}}>
                  {panel(lang==="ar"?"حسب الوضعية المهنية":lang==="fr"?"Par situation professionnelle":"By professional situation", "💼", byOcc, OCCUPATION[lang])}
                </div>
              </>);
            })()}
          </>)}

          {/* ── Scores & Compliance ── */}
          {tab === "scores" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"النقاط والمطابقة":lang==="fr"?"Scores & Conformité":"Scores & Compliance"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"تقييم لجنة المبادرة الوطنية للتنمية البشرية":lang==="fr"?"Évaluation du jury INDH":"INDH jury evaluation"}
            </p>
            {(() => {
              const scored = holders.filter(h => h.comp?.score != null);
              const eligCount = holders.filter(h => h.comp?.eligible).length;
              const notEligCount = scored.length - eligCount;
              const buckets = [
                {label:"0–39", min:0, max:39, col:RE},
                {label:"40–59", min:40, max:59, col:"#D97706"},
                {label:"60–79", min:60, max:79, col:Y},
                {label:"80–100", min:80, max:100, col:GN},
              ].map(b => ({...b, n: scored.filter(h => h.comp.score >= b.min && h.comp.score <= b.max).length}));
              const avgByJury = JURY.map(j => {
                const vals = scored.filter(h => h.comp?.juryScore?.[j.key] != null).map(h => h.comp.juryScore[j.key]);
                const avg = vals.length ? vals.reduce((a: number,b: number) => a+b, 0) / vals.length : 0;
                return {...j, avg};
              });
              const top5 = scored.slice().sort((a,b) => (b.comp.score||0) - (a.comp.score||0)).slice(0,5);
              return (<>
                <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, marginBottom:20}}>
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12, padding:"18px 20px"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"دوسييهات مقيّمة":lang==="fr"?"Dossiers évalués":"Evaluated dossiers"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:ND}}>{scored.length}</div>
                  </div>
                  <div style={{background:eligCount>0?"#EAF3EF":WH, border:`1px solid ${eligCount>0?GN+"44":CD}`, borderRadius:12, padding:"18px 20px"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"مؤهلون":lang==="fr"?"Éligibles":"Eligible"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:eligCount>0?GN:ND}}>{eligCount}</div>
                  </div>
                  <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12, padding:"18px 20px"}}>
                    <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                      {lang==="ar"?"غير مؤهلين":lang==="fr"?"Non éligibles":"Not eligible"}
                    </div>
                    <div style={{fontSize:28, fontWeight:800, color:notEligCount>0?RE:ND}}>{notEligCount}</div>
                  </div>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14}}>
                  <Card style={{marginBottom:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                      <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>
                        📊 {lang==="ar"?"متوسط نقاط اللجنة حسب المعيار":lang==="fr"?"Score moyen par critère jury":"Average score per jury criterion"}
                      </span>
                    </div>
                    {scored.length === 0 ? <p style={{color:GR, fontSize:"13px"}}>{t.noProjects}</p> :
                      avgByJury.map(j => {
                        const p = (j.avg / j.w) * 100;
                        const col = p >= 70 ? Y : p >= 50 ? "#F59E0B" : RE;
                        return (
                          <div key={j.key} style={{marginBottom:"10px"}}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:"3px"}}>
                              <span style={{fontSize:"11px", color:N, fontWeight:"500"}}>{j.label}</span>
                              <span style={{fontSize:"11px", fontWeight:"700", color:ND}}>{j.avg.toFixed(1)}/{j.w}</span>
                            </div>
                            <div style={{height:"6px", background:CD, borderRadius:"3px", overflow:"hidden"}}>
                              <div style={{height:"100%", borderRadius:"3px", background:col, width:`${Math.min(p,100)}%`, transition:"width .5s"}}/>
                            </div>
                          </div>
                        );
                      })}
                  </Card>
                  <Card style={{marginBottom:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                      <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>
                        📈 {lang==="ar"?"توزيع النقاط":lang==="fr"?"Distribution des scores":"Score distribution"}
                      </span>
                    </div>
                    {scored.length === 0 ? <p style={{color:GR, fontSize:"13px"}}>{t.noProjects}</p> :
                      buckets.map(b => (
                        <BarRow key={b.label} label={`${b.label} pts`} n={b.n} total={scored.length} col={b.col}/>
                      ))}
                  </Card>
                </div>
                {top5.length > 0 && <Card>
                  <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                    <AccBar/><span style={{fontSize:"13.5px", fontWeight:"700", color:ND}}>
                      🏆 {lang==="ar"?"أفضل المشاريع":lang==="fr"?"Top 5 projets":"Top 5 projects"}
                    </span>
                  </div>
                  {top5.map((h,i) => (
                    <div key={i} onClick={() => setDetailH(h)} style={{display:"flex", alignItems:"center", gap:"10px",
                      padding:"10px 12px", borderRadius:"10px", cursor:"pointer",
                      background: i%2===0 ? CR : "transparent", marginBottom:"4px"}}>
                      <div style={{width:26, height:26, borderRadius:"50%", background: i===0?Y:CD, flexShrink:0,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color: i===0?ND:GR}}>
                        {i+1}
                      </div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:"12.5px", fontWeight:"700", color:ND}}>{h.name} {h.profile?.lastName||""}</div>
                        <div style={{fontSize:"11px", color:GR}}>{h.proj?.projectName || h.proj?.sector || "—"}</div>
                      </div>
                      <span style={{fontSize:"13px", fontWeight:"800", color: h.comp.eligible?GN:RE, flexShrink:0}}>{h.comp.score}/100</span>
                    </div>
                  ))}
                </Card>}
              </>);
            })()}
          </>)}

          {/* ── Projects ── */}
          {tab === "projects" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>{t.projects}</h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {holders.length} {lang==="ar"?"مشروع مسجل":lang==="fr"?"projet(s) enregistré(s)":"registered project(s)"}
            </p>
            <div style={{display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap"}}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang==="ar"?"بحث...":lang==="fr"?"Rechercher...":"Search..."}
                style={{flex:"1 1 160px", minWidth:"120px", padding:"10px 13px", borderRadius:"10px", border:`1px solid ${CD}`,
                  fontSize:"12px", fontFamily:ff(lang), color:N, background:WH, direction:dir as "rtl"|"ltr"}}/>
              <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
                style={{flex:"1 1 130px", minWidth:"110px", padding:"10px 10px", borderRadius:"10px",
                  border:`1px solid ${filterRegion ? Y : CD}`, background:filterRegion ? YL : WH,
                  fontSize:"11px", fontFamily:ff(lang), color:filterRegion ? ND : GR, appearance:"none"}}>
                <option value="">{lang==="ar"?"كل الجهات":lang==="fr"?"Toutes régions":"All regions"}</option>
                {REGIONS.map(r => <option key={r} value={r}>{r.slice(0,18)}</option>)}
              </select>
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
                style={{flex:"1 1 120px", minWidth:"100px", padding:"10px 10px", borderRadius:"10px",
                  border:`1px solid ${filterSector ? Y : CD}`, background:filterSector ? YL : WH,
                  fontSize:"11px", fontFamily:ff(lang), color:filterSector ? ND : GR, appearance:"none"}}>
                <option value="">{lang==="ar"?"كل القطاعات":lang==="fr"?"Tous secteurs":"All sectors"}</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterStep} onChange={e => setFilterStep(e.target.value)}
                style={{flex:"1 1 100px", minWidth:"90px", padding:"10px 10px", borderRadius:"10px",
                  border:`1px solid ${filterStep ? Y : CD}`, background:filterStep ? YL : WH,
                  fontSize:"11px", fontFamily:ff(lang), color:filterStep ? ND : GR, appearance:"none"}}>
                <option value="">{lang==="ar"?"كل المراحل":lang==="fr"?"Toutes étapes":"All steps"}</option>
                {STEPS_LIST.map((s, i) => <option key={s} value={s}>{t.steps[i]}</option>)}
              </select>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                style={{flex:"1 1 100px", minWidth:"90px", padding:"10px 10px", borderRadius:"10px",
                  border:`1px solid ${filterGender ? Y : CD}`, background:filterGender ? YL : WH,
                  fontSize:"11px", fontFamily:ff(lang), color:filterGender ? ND : GR, appearance:"none"}}>
                <option value="">{lang==="ar"?"كل الأجناس":lang==="fr"?"Tous genres":"All genders"}</option>
                {GENDERS[lang].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={exportExcel} disabled={excelBusy} style={{padding:"10px 14px", borderRadius:"10px",
                border:`1px solid ${GN}`, background:"transparent", color:GN,
                fontSize:"11px", fontWeight:"700", fontFamily:ff(lang), cursor: excelBusy ? "default" : "pointer",
                opacity: excelBusy ? .6 : 1, flexShrink:0}}>
                📊 {excelBusy
                  ? (lang==="ar"?"جارٍ...":lang==="fr"?"Génération...":"Generating...")
                  : (lang==="ar"?"تصدير Excel":lang==="fr"?"Exporter Excel":"Export Excel")}
              </button>
            </div>
            {filtered.length === 0 ? (
              <div style={{textAlign:"center", padding:"48px 20px"}}>
                <div style={{fontSize:"56px", marginBottom:"12px"}}>📭</div>
                <div style={{fontSize:"16px", fontWeight:"700", color:ND, marginBottom:"6px"}}>{t.noProjects}</div>
                <div style={{fontSize:"13px", color:GR}}>{lang==="ar"?"لا توجد مشاريع تطابق معايير البحث":lang==="fr"?"Aucun projet ne correspond à vos filtres":"No projects match your search filters"}</div>
              </div>
            ) : (
              <Card style={{padding:0, overflow:"hidden"}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                    <thead>
                      <tr style={{background:THS}}>
                        {[
                          {label: lang==="ar"?"الحامل":"Porteur", key:"name" as const},
                          {label: "CIN", key: null},
                          {label: lang==="ar"?"السن":lang==="fr"?"Âge":"Age", key: null},
                          {label: lang==="ar"?"الموقع":lang==="fr"?"Localisation":"Location", key: null},
                          {label: lang==="ar"?"المشروع":"Projet", key: null},
                          {label: lang==="ar"?"المرحلة":"Étape", key: null},
                          {label: lang==="ar"?"النقطة":lang==="fr"?"Score":"Score", key:"score" as const},
                          {label: lang==="ar"?"التاريخ":lang==="fr"?"Date":"Date", key:"date" as const},
                          {label: lang==="ar"?"الحالة":"Statut", key: null},
                          {label: "", key: null},
                        ].map((h2,i) => (
                          <th key={i}
                            onClick={h2.key ? () => { if (sortKey === h2.key) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(h2.key as any); setSortDir("desc"); } } : undefined}
                            style={{padding:"10px 14px", textAlign:"left", fontSize:10.5,
                            fontWeight:700, textTransform:"uppercase", letterSpacing:.4, color:GR, whiteSpace:"nowrap",
                            cursor: h2.key ? "pointer" : "default", userSelect:"none"}}>
                            {h2.label}{h2.key && sortKey === h2.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((h,i) => {
                        const pct = Math.round(STEPS_LIST.indexOf(h.step||"idea")/(STEPS_LIST.length-1)*100);
                        const st = getStatus(h);
                        return (
                          <tr key={i} onClick={() => setDetailH(h)}
                            style={{borderBottom:`1px solid ${CD}`, cursor:"pointer",
                              background: i%2===0 ? WH : THS, transition:"background .15s"}}>
                            <td style={{padding:"11px 14px", fontWeight:600, color:ND, whiteSpace:"nowrap"}}>
                              <div style={{display:"flex", alignItems:"center", gap:8}}>
                                <div style={{width:28, height:28, borderRadius:"50%", background:ND,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:10, fontWeight:800, color:WH, flexShrink:0}}>{(h.name||"?")[0]}</div>
                                {h.name} {h.profile?.lastName||""}
                              </div>
                            </td>
                            <td style={{padding:"11px 14px", color:GR, fontSize:12}}>{h.id}</td>
                            <td style={{padding:"11px 14px", color:GR, fontSize:12, whiteSpace:"nowrap"}}>{h.profile?.age || "—"}</td>
                            <td style={{padding:"11px 14px", color:GR, fontSize:12}}>{regionDisplay(h.profile) || "—"}</td>
                            <td style={{padding:"11px 14px", color:GR}}>{h.proj?.projectName||"—"}</td>
                            <td style={{padding:"11px 14px", color:GR, fontSize:12}}>{h.step||"idea"}</td>
                            <td style={{padding:"11px 14px", fontSize:12, fontWeight:700, color: h.comp ? (h.comp.eligible?GN:RE) : GR}}>
                              {h.comp?.score != null ? `${h.comp.score}/100` : "—"}
                            </td>
                            <td style={{padding:"11px 14px", color:GR, fontSize:11.5, whiteSpace:"nowrap"}}>
                              {h.createdAt ? new Date(h.createdAt).toLocaleDateString(lang==="ar"?"ar-MA":lang==="fr"?"fr-FR":"en-GB") : "—"}
                            </td>
                            <td style={{padding:"11px 14px"}}>
                              <span style={{padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                                background:st.bg, color:st.fg}}>{st.label}</span>
                            </td>
                            <td style={{padding:"11px 14px"}} onClick={e => e.stopPropagation()}>
                              {delConfirmId === h.id ? (
                                <button onClick={() => { onDelHolder(h.id); setDelConfirmId(null); }}
                                  style={{padding:"4px 9px", borderRadius:"7px", border:`1px solid ${RE}`,
                                    background:RE, color:WH, fontSize:10.5, fontWeight:700, fontFamily:ff(lang), cursor:"pointer", whiteSpace:"nowrap"}}>
                                  {lang==="ar"?"تأكيد؟":lang==="fr"?"Confirmer ?":"Confirm?"}
                                </button>
                              ) : (
                                <button onClick={() => setDelConfirmId(h.id)}
                                  title={t.delete as string}
                                  style={{padding:"4px 9px", borderRadius:"7px", border:`1px solid ${CD}`,
                                    background:"transparent", color:RE, fontSize:12, fontFamily:ff(lang), cursor:"pointer"}}>
                                  🗑
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>)}

          {tab === "coords" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs":"Coordinators"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {coords.length} {lang==="ar"?"منسق مسجل":lang==="fr"?"coordinateur(s) enregistré(s)":"registered coordinator(s)"}
            </p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, marginBottom:20}}>
              <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12, padding:"18px 20px"}}>
                <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                  {lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs":"Coordinators"}
                </div>
                <div style={{fontSize:28, fontWeight:800, color:ND}}>{coords.length}</div>
              </div>
              <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12, padding:"18px 20px"}}>
                <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                  {lang==="ar"?"إجمالي الحاملين":lang==="fr"?"Total porteurs":"Total holders"}
                </div>
                <div style={{fontSize:28, fontWeight:800, color:ND}}>{holders.length}</div>
              </div>
              <div style={{background:WH, border:`1px solid ${CD}`, borderRadius:12, padding:"18px 20px"}}>
                <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>
                  {lang==="ar"?"متوسط الحاملين/منسق":lang==="fr"?"Moy. porteurs/coord.":"Avg holders/coord."}
                </div>
                <div style={{fontSize:28, fontWeight:800, color:ND}}>
                  {coords.length ? Math.round(holders.length / coords.length * 10) / 10 : "—"}
                </div>
              </div>
            </div>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>➕ {t.addCoord}</span>
              </div>
              <p style={{fontSize:"11px", color:GR, marginBottom:"10px"}}>
                {lang==="ar"?"أدخل اسم المنسق فقط — سيُنشأ رمز الدخول تلقائياً (مثال: \"younes\" ← @YOUNESCOD)":lang==="fr"?"Entrez juste le nom du coordinateur — le code d'accès est généré automatiquement (ex: \"younes\" → @YOUNESCOD)":"Enter just the coordinator's name — the access code is generated automatically (e.g. \"younes\" → @YOUNESCOD)"}
              </p>
              <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"8px"}}>
                <input value={newCoordName} onChange={e => setNewCoordName(e.target.value)}
                  placeholder={lang==="ar"?"اسم المنسق":lang==="fr"?"Nom du coordinateur":"Coordinator name"}
                  style={{flex:"2 1 160px", padding:"11px 14px", borderRadius:"8px", border:`1px solid ${newCoordName && newCoordValid ? Y : DV}`,
                    fontSize:"13px", fontFamily:ff(lang), color:N, background:IF, direction:dir as "rtl"|"ltr"}}/>
                <select value={newCoordRegion}
                  onChange={e => { setNewCoordRegion(e.target.value); setNewCoordArr(""); }}
                  style={{flex:"1 1 140px", padding:"11px 10px", borderRadius:"8px", border:`1px solid ${DV}`,
                    fontSize:"12px", fontFamily:ff(lang), color: newCoordRegion ? N : GR, background:IF, appearance:"none"}}>
                  <option value="">{lang==="ar"?"الجهة (اختياري)":lang==="fr"?"Région (optionnel)":"Region (optional)"}</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {newCoordShowArr && (
                  <select value={newCoordArr} onChange={e => setNewCoordArr(e.target.value)}
                    style={{flex:"1 1 140px", padding:"11px 10px", borderRadius:"8px", border:`1px solid ${DV}`,
                      fontSize:"12px", fontFamily:ff(lang), color: newCoordArr ? N : GR, background:IF, appearance:"none"}}>
                    <option value="">{lang==="ar"?"العمالة/المقاطعة":lang==="fr"?"Arrondissement":"District"}</option>
                    {ARRONDISSEMENTS_CASA.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                )}
                <button onClick={() => {if (newCoordValid) {
                    onAddCoord({code:newCoordCode, name:newCoordName.trim(), region:newCoordRegion, arrondissement: newCoordShowArr ? newCoordArr : "", createdAt: Date.now()});
                    setNewCoordName(""); setNewCoordRegion(""); setNewCoordArr("");
                  }}}
                  disabled={!newCoordValid}
                  style={{padding:"11px 20px", borderRadius:"8px", border:"none", cursor:"pointer",
                    background:ND, color:WH, fontSize:"13px",
                    fontWeight:"700", fontFamily:ff(lang), opacity: newCoordValid ? 1 : .5, flexShrink:0}}>
                  {t.add}
                </button>
              </div>
              {newCoordName && (
                <div style={{fontSize:"12px", color: newCoordValid ? GN : RE, fontWeight:700}}>
                  {newCoordCode
                    ? (coords.some(c => c.code.toUpperCase() === newCoordCode.toUpperCase())
                      ? (lang==="ar"?`⚠️ ${newCoordCode} مستخدم بالفعل`:lang==="fr"?`⚠️ ${newCoordCode} est déjà utilisé`:`⚠️ ${newCoordCode} is already in use`)
                      : (lang==="ar"?`رمز الدخول: ${newCoordCode}`:lang==="fr"?`Code d'accès : ${newCoordCode}`:`Access code: ${newCoordCode}`))
                    : (lang==="ar"?"⚠️ يجب أن يحتوي الاسم على حرفين على الأقل":lang==="fr"?"⚠️ Le nom doit contenir au moins 2 lettres":"⚠️ Name must contain at least 2 letters")}
                </div>
              )}
            </Card>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>👥 {t.coordList} ({coords.length})</span>
              </div>
              {coords.length === 0 ? <p style={{color:GR, fontSize:"13px"}}>{lang==="ar"?"لا يوجد منسقون بعد":lang==="fr"?"Aucun coordinateur ajouté.":"No coordinators added yet."}</p> :
                coords.map((c, i) => {
                  const zone = [c.arrondissement, c.region].filter(Boolean).join(" · ");
                  const editing = coordEditIdx === i;
                  return (
                  <div key={i} style={{padding:"12px", borderRadius:"10px", background:CR, border:`1px solid ${CD}`, marginBottom:"7px"}}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                      <div style={{width:34, height:34, borderRadius:"50%", background:ND, flexShrink:0,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"14px", fontWeight:"800", color:WH}}>{(c.name||c.code[1]||"?")[0].toUpperCase()}</div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:"13px", fontWeight:"700", color:ND}}>{c.name || c.code}</div>
                        <div style={{fontSize:"11px", color:GR, fontFamily:"monospace"}}>{c.code}</div>
                        <div style={{display:"flex", alignItems:"center", gap:6, marginTop:3, flexWrap:"wrap"}}>
                          <Badge role="coord"/>
                          <span style={{fontSize:"10.5px", color:GR}}>
                            {zone || (lang==="ar"?"لا توجد منطقة محددة":lang==="fr"?"Zone non assignée":"No zone assigned")}
                          </span>
                          {c.createdAt && <span style={{fontSize:"10px", color:GR}}>· {new Date(c.createdAt).toLocaleDateString(lang==="ar"?"ar-MA":lang==="fr"?"fr-FR":"en-GB")}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex", gap:"6px", flexShrink:0}}>
                        <button onClick={() => { navigator.clipboard?.writeText(c.code).catch(()=>{}); setCopiedCode(c.code); setTimeout(() => setCopiedCode(""), 1500); }}
                          title={lang==="ar"?"نسخ الرمز":lang==="fr"?"Copier le code":"Copy code"}
                          style={{padding:"5px 10px", borderRadius:"8px", border:`1px solid ${CD}`,
                            background:WH, color:ND, fontSize:"11px", fontWeight:"600", fontFamily:ff(lang), cursor:"pointer"}}>
                          {copiedCode === c.code ? "✓" : "⧉"}
                        </button>
                        <button onClick={() => setCoordEditIdx(editing ? null : i)}
                          title={lang==="ar"?"تعديل":lang==="fr"?"Modifier":"Edit"}
                          style={{padding:"5px 10px", borderRadius:"8px", border:`1px solid ${CD}`,
                            background: editing ? YL : WH, color:ND, fontSize:"11px", fontWeight:"600", fontFamily:ff(lang), cursor:"pointer"}}>
                          ✏️
                        </button>
                        {coordDelConfirm === i ? (
                          <button onClick={() => { onDelCoord(i); setCoordDelConfirm(null); }}
                            style={{padding:"5px 10px", borderRadius:"8px", border:`1px solid ${RE}`,
                              background:RE, color:WH, fontSize:"11px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer"}}>
                            {lang==="ar"?"تأكيد؟":lang==="fr"?"Confirmer ?":"Confirm?"}
                          </button>
                        ) : (
                          <button onClick={() => setCoordDelConfirm(i)}
                            style={{padding:"5px 10px", borderRadius:"8px", border:`1px solid ${RE}`,
                              background:"transparent", color:RE, fontSize:"11px", fontWeight:"600", fontFamily:ff(lang), cursor:"pointer"}}>
                            {t.delete}
                          </button>
                        )}
                      </div>
                    </div>
                    {editing && (
                      <div style={{display:"flex", gap:"8px", marginTop:"10px", paddingTop:"10px", borderTop:`1px solid ${CD}`, flexWrap:"wrap"}}>
                        <select value={c.region}
                          onChange={e => onEditCoord(i, {region: e.target.value, arrondissement: e.target.value==="Casablanca-Settat" ? c.arrondissement : ""})}
                          style={{flex:"1 1 140px", padding:"9px 10px", borderRadius:"8px", border:`1px solid ${DV}`,
                            fontSize:"12px", fontFamily:ff(lang), color:N, background:WH, appearance:"none"}}>
                          <option value="">{lang==="ar"?"بدون جهة":lang==="fr"?"Sans région":"No region"}</option>
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {c.region === "Casablanca-Settat" && (
                          <select value={c.arrondissement} onChange={e => onEditCoord(i, {arrondissement: e.target.value})}
                            style={{flex:"1 1 140px", padding:"9px 10px", borderRadius:"8px", border:`1px solid ${DV}`,
                              fontSize:"12px", fontFamily:ff(lang), color:N, background:WH, appearance:"none"}}>
                            <option value="">{lang==="ar"?"بدون مقاطعة":lang==="fr"?"Sans arrondissement":"No district"}</option>
                            {ARRONDISSEMENTS_CASA.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        )}
                        <button onClick={() => setCoordEditIdx(null)}
                          style={{padding:"9px 16px", borderRadius:"8px", border:"none", cursor:"pointer",
                            background:ND, color:WH, fontSize:"12px", fontWeight:"700", fontFamily:ff(lang)}}>
                          {lang==="ar"?"تم":lang==="fr"?"Terminé":"Done"}
                        </button>
                      </div>
                    )}
                  </div>
                );})
              }
            </Card>
          </>)}

          {/* ── Activity ── */}
          {tab === "activity" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"النشاط":lang==="fr"?"Activité":"Activity"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"آخر الأحداث":lang==="fr"?"Derniers événements":"Latest events"}
            </p>
            <Card>
              {holders.length === 0 ? (
                <div style={{textAlign:"center", padding:"32px", color:GR}}>
                  {lang==="ar"?"لا توجد أحداث بعد":lang==="fr"?"Aucun événement encore":"No events yet"}
                </div>
              ) : holders.slice().reverse().map((h, i) => (
                <div key={i} style={{display:"flex", alignItems:"flex-start", gap:12,
                  paddingBottom:14, marginBottom:14,
                  borderBottom: i < holders.length-1 ? `1px solid ${CD}` : "none"}}>
                  <div style={{width:8, height:8, borderRadius:"50%", background:ND,
                    marginTop:5, flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13, color:ND, fontWeight:500}}>
                      <strong>{h.name}</strong> —{" "}
                      {lang==="ar"
                        ? `وصل إلى مرحلة "${h.step||"idea"}"`
                        : lang==="fr"
                        ? `Avancement à l'étape "${h.step||"idea"}"`
                        : `Reached step "${h.step||"idea"}"`}
                    </div>
                    {h.proj?.projectName && (
                      <div style={{fontSize:12, color:GR, marginTop:2}}>{h.proj.projectName} · {regionDisplay(h.profile)}</div>
                    )}
                  </div>
                  <span style={{fontSize:11, color:GR, whiteSpace:"nowrap", flexShrink:0}}>
                    {lang==="ar"?"مؤخراً":lang==="fr"?"Récemment":"Recently"}
                  </span>
                </div>
              ))}
            </Card>
          </>)}

          {/* ── Settings ── */}
          {tab === "settings" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"الإعدادات":lang==="fr"?"Paramètres":"Settings"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"إعدادات حسابك":lang==="fr"?"Paramètres de votre compte":"Your account settings"}
            </p>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"16px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"الملف الشخصي":lang==="fr"?"Profil":"Profile"}
                </span>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {[
                  {l:lang==="ar"?"الاسم":lang==="fr"?"Nom":"Name", v:user.name||user.id},
                  {l:lang==="ar"?"رمز الوصول":lang==="fr"?"Code d'accès":"Access code", v:user.id},
                ].map((f,i) => (
                  <div key={i}>
                    <div style={{fontSize:10, fontWeight:700, color:GR, textTransform:"uppercase",
                      letterSpacing:.5, marginBottom:5}}>{f.l}</div>
                    <input defaultValue={f.v} readOnly style={{width:"100%", padding:"11px 14px",
                      borderRadius:8, border:`1px solid ${DV}`, background:IF,
                      fontSize:13, fontFamily:ff(lang), color:N}}/>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"16px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"الإشعارات":lang==="fr"?"Notifications":"Notifications"}
                </span>
              </div>
              {[
                {l:lang==="ar"?"إشعارات المشاريع الجديدة":lang==="fr"?"Nouveaux dossiers":"New applications", on:true},
                {l:lang==="ar"?"تنبيهات الحاملين المتوقفين":lang==="fr"?"Alertes de blocage":"Blocking alerts", on:false},
              ].map((n,i,arr) => (
                <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 0", borderBottom: i < arr.length-1 ? `1px solid ${CD}` : "none"}}>
                  <span style={{fontSize:13, color:N}}>{n.l}</span>
                  <div style={{position:"relative", width:40, height:22, borderRadius:11,
                    background: n.on ? ND : CD, cursor:"pointer", transition:"background .2s"}}>
                    <div style={{position:"absolute", top:3, left: n.on ? 21 : 3,
                      width:16, height:16, borderRadius:"50%", background:WH,
                      transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                  </div>
                </div>
              ))}
            </Card>
          </>)}

        </div>
      </div>
      <HelpAgent lang={lang}
        context={`Administrateur INDH | ${holders.length} porteurs | ${coords.length} coordinateurs | ${holders.filter(h => h.comp?.eligible).length} éligibles | Score moyen: ${holders.length ? Math.round(holders.reduce((s, h) => s + (h.comp?.score || 0), 0) / holders.length) : 0}/100`}
        actions={[{
          name: "export_excel",
          label: `📊 ${lang==="ar"?"تصدير Excel":lang==="fr"?"Exporter Excel":"Export Excel"}`,
          run: exportExcel,
        }]}/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ROOT PAGE
════════════════════════════════════════════════════════ */
export default function IdeaMapPage() {
  injectCSS();
  const [lang, setLang]       = useState("fr");
  const [user, setUser]       = useState<any>(null);
  const [holders, setHolders] = useState<any[]>([]);
  const [coords, setCoords]   = useState<Coord[]>([]);
  const [syncing, setSyncing] = useState(false);
  // True when the backing store (Redis via /api/sheets) is unreachable — distinct
  // from "genuinely zero holders yet". Without this, an admin/coordinator seeing an
  // empty list has no way to tell a real empty state apart from a broken connection
  // silently serving nothing to everyone.
  const [syncError, setSyncError] = useState(false);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch live data from Google Sheets on mount ──────
     Falls back to localStorage if Sheets isn't configured */
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Load localStorage cache immediately so UI isn't empty
    try {
      const h = localStorage.getItem("idm_holders");
      if (h) setHolders(JSON.parse(h));
      const c = localStorage.getItem("idm_coords");
      if (c) setCoords((JSON.parse(c) as any[]).map(normalizeCoord));
    } catch {}

    // Then refresh from Sheets (live source of truth)
    setSyncing(true);
    fetch("/api/sheets")
      .then(r => r.json())
      .then(data => {
        if (data.error) { setSyncError(true); return; }
        if (data.holders?.length > 0 || data.coords?.length > 0) {
          setHolders(data.holders || []);
          setCoords((data.coords || []).map(normalizeCoord));
          // Update localStorage cache
          try {
            localStorage.setItem("idm_holders", JSON.stringify(data.holders || []));
            localStorage.setItem("idm_coords", JSON.stringify(data.coords || []));
          } catch {}
        }
      })
      .catch(() => setSyncError(true))
      .finally(() => setSyncing(false));
  }, []);

  function setLangDir(l: string) {
    setLang(l);
    if (typeof document !== "undefined")
      document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
  }

  const t = TX[lang];

  /* ── Persist a holder to Sheets + localStorage cache ── */
  async function persistHolder(holder: any) {
    try { localStorage.setItem("idm_holders", JSON.stringify(
      holders.map(h => h.id === holder.id ? holder : h)
        .concat(holders.find(h => h.id === holder.id) ? [] : [holder])
    )); } catch {}
    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({type: "save_holder", holder}),
      });
    } catch {}
  }

  /* ── Persist the full coordinator list to Sheets ──── */
  async function persistCoords(list: Coord[]) {
    try { localStorage.setItem("idm_coords", JSON.stringify(list)); } catch {}
    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({type: "save_coords", coords: list}),
      });
    } catch {}
  }

  function onLogin(u: any) {
    if (u.isNew) {
      const newHolder = {id: u.id, name: u.name, profile: u.profile, step: "idea", createdAt: Date.now()};
      setHolders(p => [...p, newHolder]);
      persistHolder(newHolder);
    }
    setUser(u);
  }

  function onLogout() { setUser(null); }

  function onDelHolder(id: string) {
    setHolders(p => p.filter(h => h.id !== id));
    try {
      const cur = JSON.parse(localStorage.getItem("idm_holders") || "[]") as any[];
      localStorage.setItem("idm_holders", JSON.stringify(cur.filter(h => h.id !== id)));
    } catch {}
    fetch("/api/sheets", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({type: "delete_holder", id}),
    }).catch(() => {});
  }

  function onSaveProject(data: any) {
    setHolders(p => {
      const idx = p.findIndex(h => h.id === data.id);
      const updated = idx >= 0
        ? p.map((h, i) => i === idx ? {...h, ...data} : h)
        : [...p, data];
      return updated;
    });
    // Write localStorage immediately so offline reload never loses progress.
    try {
      const cur = JSON.parse(localStorage.getItem("idm_holders") || "[]") as any[];
      const idx = cur.findIndex(h => h.id === data.id);
      localStorage.setItem("idm_holders", JSON.stringify(
        idx >= 0 ? cur.map((h, i) => i === idx ? {...h, ...data} : h) : [...cur, data]
      ));
    } catch {}
    // Debounce Redis writes: dialogue fires this every message, batch to 2s.
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      fetch("/api/sheets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({type: "save_holder", holder: data}),
      }).catch(() => {});
    }, 2000);
  }

  /* ── Coordinator imports a holder's completed application ──
     Unlike onSaveProject (debounced, fired on every dialogue message), this is
     a one-off action — persist immediately so the coordinator sees it land. */
  function onImportApplication(holder: any) {
    setHolders(p => {
      const idx = p.findIndex(h => h.id === holder.id);
      return idx >= 0 ? p.map((h, i) => i === idx ? holder : h) : [...p, holder];
    });
    try {
      const cur = JSON.parse(localStorage.getItem("idm_holders") || "[]") as any[];
      const idx = cur.findIndex(h => h.id === holder.id);
      localStorage.setItem("idm_holders", JSON.stringify(
        idx >= 0 ? cur.map((h, i) => i === idx ? holder : h) : [...cur, holder]
      ));
    } catch {}
    persistHolder(holder);
  }

  function onAddCoord(c: Coord) {
    const next = [...coords, c];
    setCoords(next);
    persistCoords(next);
  }

  function onDelCoord(i: number) {
    const next = coords.filter((_, x) => x !== i);
    setCoords(next);
    persistCoords(next);
  }

  function onEditCoord(i: number, patch: Partial<Coord>) {
    const next = coords.map((c, x) => x === i ? {...c, ...patch} : c);
    setCoords(next);
    persistCoords(next);
  }

  /* ── Sync indicator (tiny dot in corner when writing) ── */
  const SyncDot = () => syncing ? (
    <div style={{position:"fixed", bottom:14, right:14, zIndex:999,
      width:10, height:10, borderRadius:"50%", background:GN,
      boxShadow:`0 0 8px ${GN}`, animation:"bounce 1s infinite"}}/>
  ) : null;

  if (!user) return <>
    <SyncDot/>
    <Login lang={lang} setLang={setLangDir} t={t} onLogin={onLogin} holders={holders} coords={coords}/>
  </>;

  if (user.role === "holder") {
    const saved = holders.find(h => h.id === user.id);
    const referredCoord = user.profile?.coordCode
      ? coords.find(c => c.code.toUpperCase() === user.profile.coordCode.toUpperCase())
      : undefined;
    return <>
      <SyncDot/>
      <HolderApp lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
        t={t} onSaveProject={onSaveProject} initialState={saved}
        customQuestions={referredCoord?.questionnaire}/>
    </>;
  }

  if (user.role === "coord") return <>
    <SyncDot/>
    <CoordDash lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} holders={holders} syncError={syncError}
      questionnaire={coords.find(c => c.code.toUpperCase() === user.id.toUpperCase())?.questionnaire}
      onSaveQuestionnaire={(questions: CoordQuestion[] | undefined) => {
        const next = coords.map(c => c.code.toUpperCase() === user.id.toUpperCase() ? {...c, questionnaire: questions} : c);
        setCoords(next);
        persistCoords(next);
      }}
      onImportApplication={onImportApplication}/>
  </>;

  if (user.role === "admin") return <>
    <SyncDot/>
    <AdminDash lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} holders={holders} coords={coords}
      onAddCoord={onAddCoord}
      onDelCoord={onDelCoord}
      onEditCoord={onEditCoord}
      onDelHolder={onDelHolder}
      syncError={syncError}/>
  </>;

  return null;
}
