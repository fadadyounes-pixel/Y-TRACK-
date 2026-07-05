"use client";

import { useState, useRef, useEffect } from "react";

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
    "body{font-family:'Poppins',sans-serif;background:#0F2233;color:#1C3A5C}",
    "::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#FFB703;border-radius:4px}",
    "@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}",
    "@keyframes im-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
    "@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}",
    "@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}",
    ".fadeUp{animation:fadeUp .35s ease both}",
    ".im-rise{animation:im-rise .45s ease both}",
    ".shake{animation:shake .35s ease}",
    ".login-cont-btn:hover:not(:disabled){background:#141B45!important}",
    "button{cursor:pointer;font-family:inherit;border:none;transition:all .18s}",
    "button:active{transform:scale(.96)!important}",
    "input,select,textarea{font-family:inherit}",
    "input:focus,select:focus,textarea:focus{outline:none}",
  ].join("");
  document.head.appendChild(el);
}

/* ── BRAND ──────────────────────────────────────────── */
const Y  = "#FFB703";
const YD = "#E5A200";
const YL = "#FFF3CD";
const N  = "#1C3A5C";
const ND = "#0F2233";
const NB = "rgba(255,255,255,.07)";
const CR = "#FAF7F0";
const CD = "#EDE8DF";
const WH = "#FFFFFF";
const GR = "#6B7280";
const GN = "#22C55E";
const RE = "#EF4444";

/* ── LOGO SVG ────────────────────────────────────────── */
const Logo = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M60 10C35 10 18 28 18 52C18 68 27 80 40 87L40 95C40 98 43 100 46 100L74 100C77 100 80 98 80 95L80 87C93 80 102 68 102 52C102 28 85 10 60 10Z" fill={Y}/>
    <rect x="42" y="100" width="36" height="8" rx="4" fill={ND}/>
    <rect x="45" y="107" width="30" height="7" rx="3.5" fill={ND}/>
    <path d="M60 30C49 30 40 39 40 50C40 64 60 80 60 80C60 80 80 64 80 50C80 39 71 30 60 30Z" fill={WH}/>
    <circle cx="60" cy="50" r="9" fill={Y}/>
  </svg>
);

/* ── AUTH ────────────────────────────────────────────── */
const ADMIN_CODE = "@adminINDH";
const RE_HOLDER  = /^[A-Z]{2}\d{3,}$/;
const RE_COORD   = /^@[A-Za-z]{2,}COD$/i;

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
  "Agriculture/Élevage","Artisanat","Commerce/Services","Agro-alimentaire",
  "Tourisme rural","Numérique/TIC","Textile/Couture","BTP","Éducation/Formation","Pêche",
];
const PROJ_TYPES: Record<string, string[]> = {
  fr:["Individuel","Groupe informel","Association","Coopérative","GIE"],
  ar:["فردي","مجموعة غير رسمية","جمعية","تعاونية","مجموعة المصلحة الاقتصادية"],
  en:["Individual","Informal group","Association","Cooperative","Economic Interest Group"],
};
const MARITAL: Record<string, string[]> = {
  fr:["Célibataire","Marié(e)","Divorcé(e)","Veuf/Veuve"],
  ar:["أعزب/عزباء","متزوج/ة","مطلق/ة","أرمل/ة"],
  en:["Single","Married","Divorced","Widowed"],
};
const EDU: Record<string, string[]> = {
  fr:["Sans diplôme","Primaire","Collège","Lycée","Baccalauréat","Technicien/Diplôme","Licence (Bac+3)","Master (Bac+5)","Doctorat"],
  ar:["بدون شهادة","ابتدائي","إعدادي","ثانوي","باكالوريا","دبلوم مهني","إجازة","ماستر","دكتوراه"],
  en:["No diploma","Primary","Lower secondary","Upper secondary","Baccalaureate","Diploma/Technician","Bachelor","Master","PhD"],
};
const AGES = ["18–24","25–29","30–35","36–40","41–50","51+"];
const GENDERS: Record<string, string[]> = { fr:["Homme","Femme"], ar:["ذكر","أنثى"], en:["Male","Female"] };

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
    city:"Ville",
    region:"Région",
    sector:"Secteur d'activité envisagé",
    projType:"Type de porteur",
    create:"Créer mon compte →",
    welcome:"Bienvenue,",
    steps:["Idée","Dialogue","Profil","Plan","Budget","Conformité","Documents","Dossier"],
    ideaT:"Décrivez votre idée de projet",
    ideaH:"Secteur, zone géographique, bénéficiaires ciblés, besoins principaux.",
    ideaP:"Ex: Je veux lancer une activité de transformation de produits du terroir dans ma région...",
    sectorLabel:"Secteurs éligibles INDH",
    next:"Continuer →", loading:"Chargement...",
    dialogT:"Affinons votre projet", dialogS:"5 questions ciblées pour structurer votre dossier.",
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
    city:"المدينة",
    region:"الجهة",
    sector:"قطاع النشاط المنشود",
    projType:"نوع الحامل",
    create:"إنشاء الحساب ←",
    welcome:"مرحباً،",
    steps:["الفكرة","الحوار","الملف","الخطة","الميزانية","الامتثال","الوثائق","الدوسيي"],
    ideaT:"صف فكرة مشروعك",
    ideaH:"القطاع، المنطقة الجغرافية، المستفيدون المستهدفون، الاحتياجات الرئيسية.",
    ideaP:"مثال: أريد إطلاق نشاط لتحويل المنتجات المحلية في منطقتي...",
    sectorLabel:"القطاعات المؤهلة للمبادرة",
    next:"متابعة ←", loading:"جاري التحميل...",
    dialogT:"لنصقل مشروعك معاً", dialogS:"5 أسئلة مستهدفة لهيكلة ملفك.",
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
    city:"City",
    region:"Region",
    sector:"Target sector",
    projType:"Holder type",
    create:"Create account →",
    welcome:"Welcome,",
    steps:["Idea","Dialogue","Profile","Plan","Budget","Compliance","Documents","File"],
    ideaT:"Describe your project idea",
    ideaH:"Sector, geographic zone, target beneficiaries, main needs.",
    ideaP:"E.g. I want to launch a local product processing activity in my region...",
    sectorLabel:"Eligible INDH sectors",
    next:"Continue →", loading:"Loading...",
    dialogT:"Let's refine your project", dialogS:"5 targeted questions to structure your application.",
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

const Btn = ({children, onClick, disabled, outline, small, style = {}}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  outline?: boolean; small?: boolean; style?: React.CSSProperties;
}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: outline ? "transparent" : `linear-gradient(135deg,${Y},${YD})`,
    color: outline ? N : ND, border: outline ? `2px solid ${N}` : "none",
    borderRadius: "12px", padding: small ? "8px 16px" : "14px 24px",
    fontSize: small ? "12px" : "14px", fontWeight: "700",
    opacity: disabled ? .5 : 1, width: "100%", ...style
  }}>{children}</button>
);

const Card = ({children, style = {}, onClick}: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) => (
  <div onClick={onClick} style={{background: WH, borderRadius: "18px", padding: "24px",
    boxShadow: "0 4px 24px rgba(15,34,51,.08)", marginBottom: "14px",
    border: `1px solid rgba(28,58,92,.07)`, ...style}}>
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

const Dots = () => (
  <div style={{display: "flex", gap: "5px", padding: "6px 0"}}>
    {[0, 1, 2].map(i => <div key={i} style={{width: "8px", height: "8px", borderRadius: "50%",
      background: Y, animation: `bounce 1s ease ${i * .2}s infinite`}}/>)}
  </div>
);

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

const LangToggle = ({lang, setLang}: { lang: string; setLang: (l: string) => void }) => (
  <div style={{display: "flex", gap: "4px"}}>
    {["fr", "ar", "en"].map(k => (
      <button key={k} onClick={() => setLang(k)} style={{
        padding: "4px 10px", borderRadius: "7px", border: `1px solid ${lang === k ? Y : "rgba(255,255,255,.15)"}`,
        background: lang === k ? Y : "transparent", color: lang === k ? ND : "rgba(255,255,255,.55)",
        fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
        fontFamily: ff(lang), transition: "all .18s"
      }}>{k}</button>
    ))}
  </div>
);

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
  <div style={{background: ND, height: "58px", display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 22px",
    boxShadow: "0 2px 16px rgba(15,34,51,.3)", position: "sticky", top: 0, zIndex: 200}}>
    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
      <Logo size={30}/>
      <span style={{fontSize: "17px", fontWeight: "800", color: WH, lineHeight: 1}}>IdeaMap</span>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
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
const ProgRow = ({t, si, steps}: { lang: string; t: any; si: number; steps: string[] }) => (
  <div style={{background: WH, padding: "9px 22px", borderBottom: `1px solid ${CD}`}}>
    <div style={{maxWidth: "720px", margin: "0 auto"}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
        {steps.map((s: string, i: number) => (
          <span key={i} style={{fontSize: "9px", fontWeight: "700", textTransform: "uppercase",
            letterSpacing: ".5px", color: si >= i ? N : GR}}>{s}</span>
        ))}
      </div>
      <PBar pct={((si + 1) / steps.length) * 100} h={6}
        color={`linear-gradient(90deg,${Y},${YD})`}/>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════
   LOGIN SCREEN
════════════════════════════════════════════════════════ */
function Login({lang, setLang, t, onLogin, holders, coords}: {
  lang: string; setLang: (l: string) => void; t: any;
  onLogin: (u: any) => void; holders: any[]; coords: string[];
}) {
  const [val, setVal]         = useState("");
  const [err, setErr]         = useState(false);
  const [mode, setMode]       = useState<null | "choose" | "new" | "returning">(null);
  const [form, setForm]       = useState({firstName: "", lastName: "", email: "", phone: "", age: "", gender: "", marital: "", edu: "", city: "", region: "", sector: "", projType: ""});
  const [formErr, setFormErr] = useState(false);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const handleCheck = () => {
    const role = detectRole(val.trim().toUpperCase().replace(/^@/, "@"));
    const cleanVal = val.trim();
    const normalised = cleanVal.toUpperCase();
    if (cleanVal === ADMIN_CODE) { onLogin({id: cleanVal, name: "Admin", role: "admin"}); return; }
    if (role === "coord") {
      const exists = coords.includes(normalised);
      if (!exists) { setErr(true); return; }
      onLogin({id: normalised, name: normalised.replace("@", "").replace(/COD$/i, ""), role: "coord"}); return;
    }
    if (role === "holder") {
      const existing = holders.find((h: any) => h.id === normalised);
      if (existing) { onLogin({id: normalised, name: existing.profile.firstName, role: "holder", profile: existing.profile}); return; }
      setMode("choose"); return;
    }
    setErr(true);
  };

  const handleCreate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.region || !form.sector || !form.projType) {
      setFormErr(true); return;
    }
    const id = val.trim().toUpperCase();
    onLogin({id, name: form.firstName, role: "holder", profile: {...form, id}, isNew: true});
  };

  const inp = (field: keyof typeof form, placeholder: string) => (
    <input value={form[field]} onChange={e => {setForm(p => ({...p, [field]: e.target.value})); setFormErr(false);}}
      placeholder={placeholder} style={{width: "100%", padding: "11px 14px", borderRadius: "11px",
        border: `2px solid ${form[field] ? Y : formErr && !form[field] ? RE : CD}`,
        background: form[field] ? YL : WH, fontSize: "13px", fontFamily: ff(lang),
        color: ND, direction: dir as "rtl" | "ltr", transition: "all .2s"}}/>
  );

  return (
    <div style={{minHeight:"100vh", background:"#0A0F2C", display:"flex", alignItems:"center",
      justifyContent:"center", position:"relative", overflow:"hidden",
      padding:"24px", fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>

      {/* ── Decorative: network nodes top-right ── */}
      <svg width="960" height="960" viewBox="0 0 960 960" style={{position:"absolute",top:"-300px",right:"-320px",opacity:0.9,pointerEvents:"none"}}>
        <g fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16">
          <line x1="480" y1="210" x2="620" y2="300"/><line x1="620" y1="300" x2="760" y2="270"/>
          <line x1="620" y1="300" x2="650" y2="440"/><line x1="650" y1="440" x2="540" y2="520"/>
          <line x1="650" y1="440" x2="790" y2="500"/><line x1="540" y1="520" x2="600" y2="640"/>
        </g>
        <circle cx="480" cy="210" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="620" cy="300" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="760" cy="270" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="650" cy="440" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="790" cy="500" r="5" fill="#FFFFFF" opacity="0.35"/>
        <circle cx="540" cy="520" r="6" fill="#2A5CE0" opacity="0.9"/>
        <path d="M600 600 c0 -22 18 -34 34 -34 s34 12 34 34 c0 22 -34 56 -34 56 s-34 -34 -34 -56 z" fill="#2A5CE0" opacity="0.9"/>
      </svg>

      {/* ── Decorative: concentric circles bottom-left ── */}
      <svg width="620" height="620" viewBox="0 0 620 620" style={{position:"absolute",bottom:"-200px",left:"-200px",opacity:0.5,pointerEvents:"none"}}>
        <g fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.12">
          <circle cx="310" cy="310" r="240"/><circle cx="310" cy="310" r="180"/>
        </g>
      </svg>

      {/* Language toggle */}
      <div style={{position:"absolute", top:"22px", [dir==="rtl"?"left":"right"]:"22px", zIndex:10}}>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>

      {/* ── Content column ── */}
      <div className="im-rise" style={{width:"400px", maxWidth:"100%", position:"relative", zIndex:1}}>

        {/* Logo */}
        <div style={{display:"flex", justifyContent:"center", marginBottom:"8px"}}>
          <img src="/logo-transparent.png" alt="IdeaMap"
            style={{width:"270px", maxWidth:"100%", objectFit:"contain"}}/>
        </div>

        {/* White card */}
        <div style={{background:"#FFFFFF", borderRadius:"16px", padding:"36px 32px",
          boxShadow:"0 24px 60px rgba(0,0,0,0.35)", marginTop:"18px",
          maxHeight:"80vh", overflowY:"auto"}}>

          {/* ── Sign-in screen ── */}
          {!mode && <>
            <div style={{fontSize:"22px", fontWeight:"800", color:"#10132A", marginBottom:"6px"}}>{t.signIn}</div>
            <div style={{fontSize:"13.5px", color:"#5B6178", marginBottom:"24px"}}>{t.signInSub}</div>
            <input
              value={val}
              onChange={e => {setVal(e.target.value.toUpperCase()); setErr(false);}}
              onKeyDown={e => e.key === "Enter" && handleCheck()}
              placeholder={t.codePh as string}
              maxLength={30}
              className={err ? "shake" : ""}
              style={{width:"100%", padding:"13px 14px",
                border:`1px solid ${err ? "#C0632F" : "#DDE0E8"}`,
                borderRadius:"8px", fontSize:"15px", fontFamily:ff(lang), outline:"none",
                marginBottom:"10px", letterSpacing:"0.4px",
                background:"#F5F6F8", color:"#10132A",
                direction:dir as "rtl"|"ltr", transition:"border-color .2s"}}/>
            {err && <div style={{fontSize:"13px", color:"#C0632F", marginBottom:"10px"}}>{t.cinError}</div>}
            <button
              className="login-cont-btn"
              onClick={handleCheck}
              disabled={!val.trim()}
              style={{width:"100%", padding:"14px", background:"#0A0F2C", color:"#fff",
                border:"none", borderRadius:"8px", fontSize:"15px", fontWeight:"700",
                fontFamily:ff(lang), cursor:!val.trim()?"not-allowed":"pointer",
                marginTop:"8px", letterSpacing:"0.2px",
                boxShadow:"0 8px 20px rgba(10,15,44,0.32)",
                opacity:!val.trim()?0.45:1, transition:"background .15s, opacity .15s"}}>
              {t.cont} →
            </button>
          </>}

          {/* ── New vs returning choice ── */}
          {mode === "choose" && <>
            <div style={{fontSize:"16px", fontWeight:"700", color:"#10132A", marginBottom:"8px"}}>
              {lang==="ar"?`الرقم ${val} غير مسجل بعد.`:lang==="fr"?`Le CIN ${val} n'est pas encore enregistré.`:`CIN ${val} is not registered yet.`}
            </div>
            <p style={{fontSize:"13px", color:"#5B6178", marginBottom:"22px", lineHeight:"1.6"}}>
              {lang==="ar"?"هل تريد إنشاء حساب جديد؟":lang==="fr"?"Voulez-vous créer un nouveau compte ?":"Would you like to create a new account?"}
            </p>
            <div style={{display:"grid", gap:"10px"}}>
              <button onClick={()=>setMode("new")}
                style={{width:"100%",padding:"13px",background:"#0A0F2C",color:"#fff",border:"none",
                  borderRadius:"8px",fontSize:"14px",fontWeight:"700",fontFamily:ff(lang),
                  cursor:"pointer",boxShadow:"0 8px 20px rgba(10,15,44,0.25)"}}>
                {t.newAccount}
              </button>
              <button onClick={()=>{setErr(true);setMode(null);}}
                style={{width:"100%",padding:"13px",background:"transparent",color:"#10132A",
                  border:"2px solid #10132A",borderRadius:"8px",fontSize:"14px",fontWeight:"700",
                  fontFamily:ff(lang),cursor:"pointer"}}>
                {t.existingAccount}
              </button>
            </div>
          </>}

          {/* ── Account creation form ── */}
          {mode === "new" && <>
            <div style={{fontSize:"16px", fontWeight:"800", color:"#10132A", marginBottom:"18px"}}>{t.createTitle}</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px"}}>
              {inp("firstName", t.firstName as string)} {inp("lastName", t.lastName as string)}
            </div>
            <div style={{marginBottom:"8px", position:"relative"}}>
              {inp("email", t.email as string)}
              {form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
                <span style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",fontSize:"14px"}}>✅</span>}
            </div>
            <div style={{marginBottom:"8px"}}>{inp("phone", t.phone as string)}</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px"}}>
              <Sel value={form.age} onChange={v=>setForm(p=>({...p,age:v}))} options={AGES} placeholder={t.age as string} dir={dir}/>
              <Sel value={form.gender} onChange={v=>setForm(p=>({...p,gender:v}))} options={GENDERS[lang]} placeholder={t.gender as string} dir={dir}/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px"}}>
              <Sel value={form.marital} onChange={v=>setForm(p=>({...p,marital:v}))} options={MARITAL[lang]} placeholder={t.marital as string} dir={dir}/>
              <Sel value={form.edu} onChange={v=>setForm(p=>({...p,edu:v}))} options={EDU[lang]} placeholder={t.edu as string} dir={dir}/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px"}}>
              {inp("city", t.city as string)}
              <Sel value={form.region} onChange={v=>setForm(p=>({...p,region:v}))} options={REGIONS} placeholder={t.region as string} dir={dir}/>
            </div>
            <div style={{marginBottom:"8px"}}>
              <Sel value={form.sector} onChange={v=>setForm(p=>({...p,sector:v}))} options={SECTORS} placeholder={t.sector as string} dir={dir}/>
            </div>
            <div style={{marginBottom:"16px"}}>
              <Sel value={form.projType} onChange={v=>setForm(p=>({...p,projType:v}))} options={PROJ_TYPES[lang]} placeholder={t.projType as string} dir={dir}/>
            </div>
            {formErr && <p style={{fontSize:"12px",color:"#C0632F",textAlign:"center",marginBottom:"10px"}}>
              {lang==="ar"?"يرجى ملء جميع الحقول الإلزامية":lang==="fr"?"Veuillez remplir tous les champs obligatoires":"Please fill in all required fields"}
            </p>}
            <button onClick={handleCreate}
              style={{width:"100%",padding:"13px",background:"#0A0F2C",color:"#fff",border:"none",
                borderRadius:"8px",fontSize:"14px",fontWeight:"700",fontFamily:ff(lang),
                cursor:"pointer",boxShadow:"0 8px 20px rgba(10,15,44,0.25)"}}>
              {t.create}
            </button>
            <button onClick={()=>setMode("choose")}
              style={{width:"100%",marginTop:"10px",background:"transparent",color:"#5B6178",
                fontSize:"12px",border:"none",padding:"8px",fontFamily:ff(lang),cursor:"pointer"}}>
              ← {lang==="ar"?"رجوع":lang==="fr"?"Retour":"Back"}
            </button>
          </>}
        </div>

        {/* Footer */}
        <p style={{textAlign:"center", marginTop:"22px", fontSize:"12px", color:"rgba(255,255,255,0.4)"}}>
          © 2026 IdeaMap
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HOLDER APP
════════════════════════════════════════════════════════ */
function HolderApp({lang, setLang, user, onLogout, t, onSaveProject}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; onSaveProject: (d: any) => void;
}) {
  const [step, setStep]    = useState("idea");
  const [idea, setIdea]    = useState("");
  const [msgs, setMsgs]    = useState<any[]>([]);
  const [inp, setInp]      = useState("");
  const [busy, setBusy]    = useState(false);
  const [qN, setQN]        = useState(0);
  const [proj, setProj]    = useState<any>(null);
  const [plan, setPlan]    = useState<any>(null);
  const [budget, setBudget]= useState<any>(null);
  const [comp, setComp]    = useState<any>(null);
  const [docs, setDocs]    = useState<Record<number, boolean>>({});
  const msgEnd = useRef<HTMLDivElement>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const LL  = lang === "ar" ? "arabe" : lang === "fr" ? "français" : "anglais";
  const MAX_Q = 5;

  useEffect(() => { msgEnd.current?.scrollIntoView({behavior: "smooth"}); }, [msgs]);

  useEffect(() => {
    if (proj) onSaveProject({id: user.id, name: user.name, profile: user.profile, proj, plan, budget, comp, step, docs});
  }, [proj, plan, comp, step]);

  const ai = async (messages: any[], system: string) => {
    const r = await fetch("/api/ai", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({messages, system}),
    });
    const d = await r.json();
    return d.content?.[0]?.text || "";
  };

  const parseJ = (txt: string) => {
    try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
  };

  const startChat = async () => {
    if (!idea.trim()) return;
    setBusy(true); setStep("dialogue");
    const r = await ai([{role: "user", content: `Mon idée: ${idea}`}],
      `Expert INDH Maroc Phase 3. Pose UNE question courte pour structurer le projet (max 100 000 MAD). Réponds en ${LL}. Sois chaleureux.`);
    setMsgs([{role: "user", content: idea}, {role: "assistant", content: r}]);
    setQN(1); setBusy(false);
  };

  const sendMsg = async () => {
    if (!inp.trim() || busy) return;
    const all = [...msgs, {role: "user", content: inp}];
    setMsgs(all); setInp(""); setBusy(true);
    const last = qN >= MAX_Q;
    const r = await ai(all.map((m: any) => ({role: m.role, content: m.content})),
      `Expert INDH Maroc. Idée: "${idea}". Q ${qN}/${MAX_Q}. ${last
        ? `Dernière interaction. Retourne UNIQUEMENT JSON valide sans markdown: {"projectName":"...","sector":"...","legalStructure":"...","location":"...","beneficiaries":N,"activities":["..."],"strengths":["..."],"estimatedBudget":N,"pillar":"..."}`
        : `Pose une question courte. Réponds en ${LL}.`}`);
    if (last) {
      setMsgs((p: any[]) => [...p, {role: "assistant", content: "✅ Analyse complète !"}]);
      const p = parseJ(r); if (p) setProj(p);
      setTimeout(() => setStep("profile"), 1000);
    } else { setMsgs((p: any[]) => [...p, {role: "assistant", content: r}]); setQN((p: number) => p + 1); }
    setBusy(false);
  };

  const genPlan = async () => {
    setBusy(true); setStep("plan");
    const r = await ai([{role: "user", content: `Projet: ${JSON.stringify(proj || {idea})}`}],
      `Expert consultant INDH Maroc. Business plan en ${LL}. JSON sans markdown: {"executiveSummary":"...","problemStatement":"...","solution":"...","marketAnalysis":"...","businessModel":"...","socialImpact":"...","operationalPlan":"...","indh_alignment":"...","risks":["...","..."],"projections":{"year1":N,"year2":N,"year3":N}}`);
    const p = parseJ(r); if (p) setPlan(p);
    const r2 = await ai([{role: "user", content: `Projet: ${JSON.stringify(proj || {idea})}`}],
      `Expert financier INDH. Budget max 100 000 MAD. JSON sans markdown: {"items":[{"category":"...","item":"...","quantity":N,"unitPrice":N,"total":N}],"indhContribution":N,"beneficiaryContribution":N}`);
    const b = parseJ(r2); if (b) setBudget(b);
    setBusy(false);
  };

  const checkComp = async () => {
    setStep("compliance"); setBusy(true);
    const r = await ai([{role: "user", content: `${JSON.stringify(proj)} ${JSON.stringify(plan)}`}],
      `Expert conformité INDH Phase 3. JSON sans markdown: {"eligible":true,"score":N,"pillar":"...","strengths":["...","..."],"weaknesses":["..."],"recommendations":["...","...","..."],"juryScore":{"impact":N,"viability":N,"relevance":N,"management":N,"sustainability":N,"innovation":N}}`);
    const c = parseJ(r); if (c) setComp(c);
    setBusy(false);
  };

  const STEPS = ["idea", "dialogue", "profile", "plan", "budget", "compliance", "documents", "export"];
  const si = STEPS.indexOf(step);

  const fs: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: "12px", border: `2px solid ${CD}`,
    fontSize: "14px", fontFamily: ff(lang), color: N, background: CR,
    direction: dir as "rtl" | "ltr", transition: "border-color .2s"
  };

  const indhBtn = (label: string, onClick: () => void, style: React.CSSProperties = {}) => (
    <button onClick={onClick} style={{width: "100%", padding: "14px", borderRadius: "13px", border: "none",
      cursor: "pointer", background: `linear-gradient(135deg,${Y},${YD})`, color: ND,
      fontSize: "14px", fontWeight: "800", fontFamily: ff(lang), ...style}}>{label}</button>
  );

  const planBlock = (key: string, fr: string, ar: string, en: string, icon: string) => plan[key] && (
    <div key={key} style={{padding: "14px 16px", background: CR, borderRadius: "13px",
      borderLeft: `4px solid ${Y}`, marginBottom: "12px"}}>
      <div style={{fontSize: "10px", fontWeight: "700", color: N, textTransform: "uppercase",
        letterSpacing: ".4px", marginBottom: "7px"}}>{icon} {lang === "ar" ? ar : lang === "fr" ? fr : en}</div>
      <div style={{fontSize: "14px", color: ND, lineHeight: "1.75"}}>{plan[key]}</div>
    </div>
  );

  return (
    <div style={{minHeight: "100vh", background: CR, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
      <Header lang={lang} setLang={setLang} user={user} onLogout={onLogout} t={t}/>
      <ProgRow lang={lang} t={t} si={si} steps={t.steps as string[]}/>
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
            <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder={t.ideaP}
              style={{...fs, resize: "vertical", minHeight: "140px", lineHeight: "1.7"}}/>
            <div style={{marginTop: "10px", padding: "11px 14px", background: YL, borderRadius: "10px",
              border: `1px solid ${Y}66`, marginBottom: "16px"}}>
              <p style={{fontSize: "12px", color: ND, fontWeight: "500"}}>
                💡 {lang === "ar" ? "حدد القطاع، المنطقة، المستفيدين، ونوع الهيكل المتوقع." : lang === "fr" ? "Précisez: secteur, zone, bénéficiaires, structure juridique envisagée." : "Specify: sector, zone, beneficiaries, planned legal structure."}
              </p>
            </div>
            <p style={{fontSize: "11px", color: GR, fontWeight: "700", textTransform: "uppercase",
              letterSpacing: ".6px", marginBottom: "8px"}}>{t.sectorLabel}</p>
            <div style={{marginBottom: "20px"}}>
              {SECTORS.map(s => <span key={s} style={{display: "inline-block", padding: "4px 11px",
                borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: YL, color: ND,
                margin: "3px", border: `1px solid ${Y}55`}}>{s}</span>)}
            </div>
            {indhBtn(busy ? t.loading : t.next, startChat, {opacity: (!idea.trim() || busy) ? .5 : 1})}
          </Card>
        )}

        {/* ── DIALOGUE ── */}
        {step === "dialogue" && (
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px"}}>
              <div style={{width: "40px", height: "40px", borderRadius: "11px", background: ND,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><Logo size={24}/></div>
              <div>
                <h2 style={{fontSize: "17px", fontWeight: "700", color: ND}}>{t.dialogT}</h2>
                <p style={{fontSize: "11px", color: GR, marginTop: "2px"}}>{t.dialogS}</p>
              </div>
            </div>
            <div style={{marginBottom: "12px"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "4px"}}>
                <span style={{fontSize: "11px", color: GR, fontWeight: "600"}}>{t.q} {qN} {t.of} {MAX_Q}</span>
                <span style={{fontSize: "11px", color: N, fontWeight: "800"}}>{Math.round((qN / MAX_Q) * 100)}%</span>
              </div>
              <PBar pct={(qN / MAX_Q) * 100}/>
            </div>
            <div style={{height: "340px", overflowY: "auto", padding: "10px", background: CR,
              borderRadius: "13px", marginBottom: "12px"}}>
              {msgs.map((m: any, i: number) => (
                <div key={i} style={{display: "flex",
                  justifyContent: m.role === "user" ? (dir === "rtl" ? "flex-start" : "flex-end") : (dir === "rtl" ? "flex-end" : "flex-start"),
                  marginBottom: "10px", gap: "7px", alignItems: "flex-end"}}>
                  {m.role === "assistant" && <div style={{width: "28px", height: "28px", borderRadius: "50%",
                    background: ND, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><Logo size={17}/></div>}
                  <div style={{maxWidth: "80%", padding: "11px 15px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? `linear-gradient(135deg,${N},${ND})` : WH,
                    color: m.role === "user" ? WH : ND, fontSize: "13px", lineHeight: "1.65",
                    boxShadow: "0 2px 8px rgba(0,0,0,.06)", direction: dir as "rtl" | "ltr"}}>
                    {m.content}
                  </div>
                  {m.role === "user" && <div style={{width: "28px", height: "28px", borderRadius: "50%",
                    background: Y, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "800", color: ND, flexShrink: 0}}>{user.name[0]}</div>}
                </div>
              ))}
              {busy && <div style={{display: "flex", gap: "7px", alignItems: "center"}}>
                <div style={{width: "28px", height: "28px", borderRadius: "50%", background: ND,
                  display: "flex", alignItems: "center", justifyContent: "center"}}><Logo size={17}/></div>
                <Dots/>
              </div>}
              <div ref={msgEnd}/>
            </div>
            <div style={{display: "flex", gap: "8px"}}>
              <input value={inp} onChange={e => setInp(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()} disabled={busy}
                placeholder={t.ph} style={{...fs, flex: 1}}/>
              <button onClick={sendMsg} disabled={busy || !inp.trim()}
                style={{padding: "13px 18px", borderRadius: "12px", border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${Y},${YD})`, color: ND,
                  fontSize: "13px", fontWeight: "800", fontFamily: ff(lang),
                  opacity: busy || !inp.trim() ? .5 : 1}}>{t.send}</button>
            </div>
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
          </Card>
        )}

        {/* ── PLAN ── */}
        {step === "plan" && (<>
          {busy && <Card style={{textAlign: "center", padding: "48px 24px"}}>
            <Logo size={56}/><br/><br/>
            <h3 style={{color: ND, fontWeight: "700", marginBottom: "8px"}}>{t.genBP}</h3>
            <p style={{color: GR, fontSize: "13px", marginBottom: "18px"}}>{lang === "ar" ? "إعداد خطة الأعمال والميزانية..." : lang === "fr" ? "Préparation du business plan et budget..." : "Preparing business plan and budget..."}</p>
            <div style={{display: "flex", justifyContent: "center"}}><Dots/></div>
          </Card>}
          {plan && !busy && (<>
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px"}}>
                <div style={{width: "46px", height: "46px", borderRadius: "13px", background: ND,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><Logo size={28}/></div>
                <div><h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.planT}</h2>
                  <p style={{fontSize: "12px", color: GR, marginTop: "2px"}}>{proj?.projectName}</p></div>
              </div>
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
          </>)}
        </>)}

        {/* ── BUDGET ── */}
        {step === "budget" && (() => {
          const total = budget?.items?.reduce((s: number, x: any) => s + (x.total || 0), 0) || 0;
          const pct = (total / 100000) * 100;
          const indh = budget?.indhContribution || Math.round(total * .85);
          const bene = budget?.beneficiaryContribution || Math.round(total * .15);
          return (
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px"}}>
                <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                  border: `2px solid ${Y}`, flexShrink: 0}}>💰</div>
                <div><h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.budgetT}</h2>
                  <p style={{fontSize: "12px", color: GR, marginTop: "2px"}}>{t.maxB}</p></div>
              </div>
              <div style={{padding: "14px 16px", borderRadius: "13px", marginBottom: "18px",
                background: pct > 100 ? "#FFF0F0" : YL, border: `1px solid ${pct > 100 ? RE : Y}`}}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "7px"}}>
                  <span style={{fontSize: "15px", fontWeight: "800", color: ND}}>{total.toLocaleString()} MAD</span>
                  <span style={{fontSize: "12px", fontWeight: "700", color: pct > 100 ? RE : N}}>{pct.toFixed(0)}%</span>
                </div>
                <PBar pct={pct} h={7} color={pct > 100 ? RE : `linear-gradient(90deg,${Y},${YD})`}/>
              </div>
              {budget?.items?.length > 0 ? (<div style={{overflowX: "auto", marginBottom: "16px"}}>
                <table style={{width: "100%", borderCollapse: "collapse", fontSize: "12px"}}>
                  <thead><tr style={{background: ND, color: WH}}>
                    {["Catégorie", "Désignation", "Qté", "PU (MAD)", "Total"].map((h, i) => (
                      <th key={i} style={{padding: "9px 8px", textAlign: i < 2 ? (dir === "rtl" ? "right" : "left") : "center",
                        fontSize: "10px", fontWeight: "700", letterSpacing: ".4px"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{budget.items.map((x: any, i: number) => (
                    <tr key={i} style={{background: i % 2 === 0 ? WH : CR}}>
                      <td style={{padding: "9px 8px", color: N, fontWeight: "600"}}>{x.category}</td>
                      <td style={{padding: "9px 8px", color: ND}}>{x.item}</td>
                      <td style={{padding: "9px 8px", textAlign: "center", color: N}}>{x.quantity}</td>
                      <td style={{padding: "9px 8px", textAlign: "center", color: N}}>{Number(x.unitPrice || 0).toLocaleString()}</td>
                      <td style={{padding: "9px 8px", textAlign: "center", fontWeight: "800", color: ND}}>{Number(x.total || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{background: ND, color: WH}}>
                    <td colSpan={4} style={{padding: "10px 8px", fontWeight: "700"}}>{t.total}</td>
                    <td style={{padding: "10px 8px", textAlign: "center", fontWeight: "800", color: Y}}>{total.toLocaleString()}</td>
                  </tr></tbody>
                </table>
              </div>) : <div style={{textAlign: "center", padding: "28px", color: GR}}><Dots/></div>}
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
              {indhBtn(t.checkBtn, checkComp)}
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
          {busy && <div style={{textAlign: "center", padding: "48px"}}><Logo size={44}/>
            <p style={{color: GR, marginTop: "14px"}}>
              {lang === "ar" ? "جاري التحليل..." : lang === "fr" ? "Analyse en cours..." : "Analyzing..."}
            </p>
            <div style={{display: "flex", justifyContent: "center", marginTop: "14px"}}><Dots/></div>
          </div>}
          {comp && !busy && (<>
            <div style={{padding: "24px", borderRadius: "16px", textAlign: "center", marginBottom: "18px",
              background: comp.eligible ? ND : "#FFF0F0", border: `2px solid ${comp.eligible ? Y : RE}`}}>
              <div style={{fontSize: "44px", marginBottom: "7px"}}>{comp.eligible ? "✅" : "⚠️"}</div>
              <div style={{fontSize: "16px", fontWeight: "700", color: comp.eligible ? Y : RE, marginBottom: "5px"}}>{comp.eligible ? t.eligible : t.notElig}</div>
              <div style={{fontSize: "48px", fontWeight: "800", color: comp.eligible ? WH : RE, lineHeight: 1}}>
                {comp.score}<span style={{fontSize: "20px", fontWeight: "400"}}>/100</span>
              </div>
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
            {indhBtn(`📁 ${lang === "ar" ? "الوثائق" : lang === "fr" ? "Documents Requis" : "Required Documents"} →`, () => setStep("documents"))}
          </>)}
        </Card>)}

        {/* ── DOCUMENTS ── */}
        {step === "documents" && (() => {
          const done = Object.values(docs).filter(Boolean).length;
          return (
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px"}}>
                <div style={{width: "46px", height: "46px", borderRadius: "13px", background: YL,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                  border: `2px solid ${Y}`, flexShrink: 0}}>📁</div>
                <div><h2 style={{fontSize: "19px", fontWeight: "700", color: ND}}>{t.docsT}</h2>
                  <p style={{fontSize: "11px", color: GR, marginTop: "2px"}}>{lang === "ar" ? "تحقق مما جهزته" : lang === "fr" ? "Cochez les documents préparés" : "Check off prepared documents"}</p></div>
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
                  <div key={doc.id} onClick={() => setDocs(p => ({...p, [doc.id]: !p[doc.id]}))}
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
                      <p style={{fontSize: "11px", color: docs[doc.id] && type === "req" ? "rgba(255,255,255,.5)" : GR}}>{doc.desc}</p>
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
            </Card>
          );
        })()}

        {/* ── EXPORT ── */}
        {step === "export" && (() => {
          const done = Object.values(docs).filter(Boolean).length;
          const readiness = Math.round(((comp?.score || 0) * .5) + ((done / DOCS.length) * 50));
          return (<>
            <div style={{background: ND, borderRadius: "18px", padding: "32px 24px",
              textAlign: "center", marginBottom: "14px"}}>
              <div style={{display: "flex", justifyContent: "center", marginBottom: "14px"}}><Logo size={64}/></div>
              <h2 style={{fontSize: "22px", fontWeight: "800", color: WH, marginBottom: "5px"}}>{t.exportT}</h2>
              <p style={{color: "rgba(255,255,255,.5)", fontSize: "13px", marginBottom: "14px"}}>{proj?.projectName}</p>
              <div style={{display: "inline-block", padding: "18px 36px",
                background: "rgba(255,183,3,.15)", borderRadius: "16px", border: `2px solid ${Y}`}}>
                <div style={{fontSize: "48px", fontWeight: "800", color: Y, lineHeight: 1}}>{readiness}%</div>
                <div style={{fontSize: "11px", color: "rgba(255,255,255,.5)", marginTop: "5px"}}>{t.readiness}</div>
              </div>
            </div>
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
                <AccBar/><span style={{fontSize: "15px", fontWeight: "700", color: ND}}>📦 {t.delivT}</span>
              </div>
              {[
                {icon: "📊", l: lang === "ar" ? "خطة الأعمال" : lang === "fr" ? "Business Plan" : "Business Plan", ok: !!plan, badge: "PDF"},
                {icon: "💰", l: lang === "ar" ? "الميزانية التفصيلية" : lang === "fr" ? "Budget Prévisionnel" : "Detailed Budget", ok: !!budget?.items, badge: "XLS"},
                {icon: "✅", l: lang === "ar" ? "تقرير الامتثال" : lang === "fr" ? "Rapport de Conformité" : "Compliance Report", ok: !!comp, badge: "PDF"},
                {icon: "📋", l: lang === "ar" ? "قائمة الوثائق" : lang === "fr" ? "Checklist Documents" : "Docs Checklist", ok: true, badge: "PDF"},
                {icon: "🎯", l: lang === "ar" ? "عرض اللجنة" : lang === "fr" ? "Présentation Jury" : "Jury Presentation", ok: !!proj, badge: "PPT"},
                {icon: "📖", l: lang === "ar" ? "دليل التقديم" : lang === "fr" ? "Guide de Soumission" : "Submission Guide", ok: true, badge: "PDF"},
              ].map((x, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px",
                  borderRadius: "13px", marginBottom: "7px", background: x.ok ? ND : CR, border: `1px solid ${x.ok ? Y : CD}`}}>
                  <span style={{fontSize: "20px"}}>{x.icon}</span>
                  <span style={{flex: 1, fontSize: "12px", color: x.ok ? WH : ND, fontWeight: "500"}}>{x.l}</span>
                  <span style={{padding: "2px 7px", borderRadius: "5px", fontSize: "9px", fontWeight: "700",
                    background: x.ok ? Y : CD, color: x.ok ? ND : GR}}>{x.badge}</span>
                  <span style={{fontSize: "15px"}}>{x.ok ? "✅" : "⏳"}</span>
                </div>
              ))}
            </Card>
          </>);
        })()}

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COORDINATOR DASHBOARD
════════════════════════════════════════════════════════ */
function CoordDash({lang, setLang, user, onLogout, t, holders}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; holders: any[];
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const filtered = holders.filter(h =>
    (h.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.proj?.sector || "").toLowerCase().includes(search.toLowerCase())
  );

  const stepColors: Record<string, string> = {
    "idea": Y, "dialogue": "#F59E0B", "profile": "#3B82F6", "plan": "#8B5CF6",
    "budget": "#EC4899", "compliance": "#14B8A6", "documents": GN, "export": GN
  };

  if (detail) {
    const h = detail;
    return (
      <div style={{minHeight: "100vh", background: CR, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
        <Header lang={lang} setLang={setLang} user={user} onLogout={onLogout} t={t}/>
        <div style={{maxWidth: "700px", margin: "0 auto", padding: "24px 18px 60px"}}>
          <button onClick={() => setDetail(null)} style={{marginBottom: "16px", padding: "8px 16px",
            borderRadius: "10px", border: `1px solid ${N}`, background: "transparent",
            color: N, fontSize: "12px", fontWeight: "600", fontFamily: ff(lang)}}>
            ← {lang === "ar" ? "رجوع" : lang === "fr" ? "Retour" : "Back"}
          </button>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px"}}>
              <div style={{width: "44px", height: "44px", borderRadius: "50%", background: Y,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: "800", color: ND}}>{h.name[0]}</div>
              <div>
                <div style={{fontSize: "16px", fontWeight: "700", color: ND}}>{h.name} {h.profile?.lastName || ""}</div>
                <div style={{fontSize: "12px", color: GR}}>{h.id} · {h.profile?.region} · {h.profile?.projType}</div>
              </div>
              <Badge role="holder"/>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"}}>
              {[
                {l: "Age", v: h.profile?.age, i: "📅"},
                {l: "Genre", v: h.profile?.gender, i: "👤"},
                {l: "Région", v: h.profile?.region, i: "📍"},
                {l: "Secteur", v: h.profile?.sector, i: "🏭"},
                {l: "Téléphone", v: h.profile?.phone, i: "📞"},
                {l: "Type porteur", v: h.profile?.projType, i: "⚖️"},
              ].filter(x => x.v).map((x, i) => (
                <div key={i} style={{display: "flex", gap: "8px", alignItems: "center",
                  padding: "10px", background: CR, borderRadius: "10px", border: `1px solid ${CD}`}}>
                  <span>{x.i}</span>
                  <div><div style={{fontSize: "9px", color: GR, fontWeight: "700", textTransform: "uppercase"}}>{x.l}</div>
                    <div style={{fontSize: "13px", color: ND, fontWeight: "600"}}>{x.v}</div></div>
                </div>
              ))}
            </div>
          </Card>
          {h.proj && <Card>
            <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
              <AccBar/>
              <span style={{fontSize: "15px", fontWeight: "700", color: ND}}>📋 {lang === "ar" ? "ملف المشروع" : lang === "fr" ? "Profil du Projet" : "Project Profile"}</span>
            </div>
            {[
              {l: "Projet", v: h.proj.projectName, i: "🏢"}, {l: "Secteur", v: h.proj.sector, i: "🏭"},
              {l: "Structure", v: h.proj.legalStructure, i: "⚖️"}, {l: "Zone", v: h.proj.location, i: "📍"},
              {l: "Bénéficiaires", v: h.proj.beneficiaries, i: "👥"}, {l: "Axe INDH", v: h.proj.pillar, i: "🏛️"},
              {l: "Budget estimé", v: h.proj.estimatedBudget ? `${Number(h.proj.estimatedBudget).toLocaleString()} MAD` : null, i: "💰"},
            ].filter(x => x.v).map((x, i) => (
              <div key={i} style={{display: "flex", gap: "10px", alignItems: "center",
                padding: "10px 12px", background: CR, borderRadius: "10px",
                border: `1px solid ${CD}`, marginBottom: "7px"}}>
                <span style={{fontSize: "18px"}}>{x.i}</span>
                <div><div style={{fontSize: "9px", color: GR, fontWeight: "700", textTransform: "uppercase"}}>{x.l}</div>
                  <div style={{fontSize: "13px", color: ND, fontWeight: "600"}}>{x.v}</div></div>
              </div>
            ))}
          </Card>}
          {h.comp && <Card>
            <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
              <AccBar/>
              <span style={{fontSize: "15px", fontWeight: "700", color: ND}}>✅ {t.compT}</span>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
              <div style={{width: "72px", height: "72px", borderRadius: "50%",
                background: h.comp.eligible ? ND : "#FFF0F0",
                border: `3px solid ${h.comp.eligible ? Y : RE}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
                <span style={{fontSize: "22px", fontWeight: "800", color: h.comp.eligible ? Y : RE}}>{h.comp.score}</span>
              </div>
              <div>
                <div style={{fontSize: "14px", fontWeight: "700", color: h.comp.eligible ? GN : RE, marginBottom: "4px"}}>
                  {h.comp.eligible ? t.eligible : t.notElig}</div>
                {h.comp.pillar && <div style={{fontSize: "12px", color: GR}}>📌 {h.comp.pillar}</div>}
              </div>
            </div>
          </Card>}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: "100vh", background: CR, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
      <Header lang={lang} setLang={setLang} user={user} onLogout={onLogout} t={t}/>
      <div style={{maxWidth: "720px", margin: "0 auto", padding: "24px 18px 60px"}}>
        <Card style={{background: ND}}>
          <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px"}}>
            <div style={{width: "40px", height: "40px", borderRadius: "11px", background: Y,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><Logo size={24}/></div>
            <div>
              <div style={{fontSize: "18px", fontWeight: "800", color: WH}}>{t.coordDash}</div>
              <div style={{fontSize: "12px", color: "rgba(255,255,255,.5)"}}>{user.id}</div>
            </div>
          </div>
          <div style={{display: "flex", gap: "14px", marginTop: "16px"}}>
            {[
              {v: holders.length, l: t.totalProj, c: Y},
              {v: holders.filter((h: any) => h.comp?.eligible).length, l: lang === "ar" ? "مؤهلون" : lang === "fr" ? "Éligibles" : "Eligible", c: GN},
              {v: holders.filter((h: any) => h.step === "export").length, l: lang === "ar" ? "مكتملون" : lang === "fr" ? "Terminés" : "Completed", c: "#8B5CF6"},
            ].map((x, i) => (
              <div key={i} style={{flex: 1, padding: "14px", background: "rgba(255,255,255,.06)", borderRadius: "12px", textAlign: "center"}}>
                <div style={{fontSize: "28px", fontWeight: "800", color: x.c}}>{x.v}</div>
                <div style={{fontSize: "10px", color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".5px"}}>{x.l}</div>
              </div>
            ))}
          </div>
        </Card>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === "ar" ? "بحث..." : lang === "fr" ? "Rechercher un porteur..." : "Search holder..."}
          style={{width: "100%", padding: "11px 14px", borderRadius: "12px", border: `2px solid ${CD}`,
            fontSize: "13px", fontFamily: ff(lang), color: N, background: WH, direction: dir as "rtl" | "ltr", marginBottom: "14px"}}/>
        {filtered.length === 0 ? <p style={{textAlign: "center", color: GR, padding: "32px"}}>{t.noProjects}</p> :
          filtered.map((h: any, i: number) => (
            <Card key={i} style={{cursor: "pointer"}} onClick={() => setDetail(h)}>
              <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                <div style={{width: "40px", height: "40px", borderRadius: "50%", background: Y,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: "800", color: ND, flexShrink: 0}}>{h.name[0]}</div>
                <div style={{flex: 1}}>
                  <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px"}}>
                    <span style={{fontSize: "14px", fontWeight: "700", color: ND}}>{h.name} {h.profile?.lastName || ""}</span>
                    <span style={{fontSize: "10px", fontWeight: "600", color: GR}}>{h.id}</span>
                    {h.comp && <span style={{padding: "2px 7px", borderRadius: "5px", fontSize: "9px", fontWeight: "700",
                      background: h.comp.eligible ? GN + "22" : RE + "22", color: h.comp.eligible ? GN : RE}}>
                      {h.comp.score}/100</span>}
                  </div>
                  <div style={{fontSize: "11px", color: GR}}>{h.proj?.projectName || h.profile?.sector} · {h.profile?.region}</div>
                  <div style={{marginTop: "6px"}}>
                    <PBar pct={["idea","dialogue","profile","plan","budget","compliance","documents","export"].indexOf(h.step || "idea") / 7 * 100}
                      h={4} color={stepColors[h.step || "idea"] || Y}/>
                  </div>
                </div>
                <span style={{fontSize: "11px", fontWeight: "700", color: stepColors[h.step || "idea"] || Y,
                  background: (stepColors[h.step || "idea"] || Y) + "22", padding: "4px 10px", borderRadius: "8px",
                  flexShrink: 0}}>{h.step || "idea"}</span>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════════════════ */
function AdminDash({lang, setLang, user, onLogout, t, holders, coords, onAddCoord, onDelCoord}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; holders: any[]; coords: string[];
  onAddCoord: (c: string) => void; onDelCoord: (i: number) => void;
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [tab, setTab]         = useState("stats");
  const [newCoord, setNewCoord] = useState("");
  const [search, setSearch]   = useState("");

  const filtered = holders.filter(h =>
    (h.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.id || "").toLowerCase().includes(search.toLowerCase())
  );

  const byRegion = holders.reduce((a: Record<string, number>, h: any) => {
    const r = h.profile?.region || "N/A"; a[r] = (a[r] || 0) + 1; return a;
  }, {});
  const bySector = holders.reduce((a: Record<string, number>, h: any) => {
    const s = h.proj?.sector || h.profile?.sector || "N/A"; a[s] = (a[s] || 0) + 1; return a;
  }, {});

  const TabBtn = ({id, label}: {id: string; label: string}) => (
    <button onClick={() => setTab(id)} style={{padding: "8px 18px", borderRadius: "10px", border: "none",
      background: tab === id ? Y : "transparent", color: tab === id ? ND : "rgba(255,255,255,.5)",
      fontSize: "12px", fontWeight: "700", fontFamily: ff(lang)}}>
      {label}
    </button>
  );

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

  return (
    <div style={{minHeight: "100vh", background: CR, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
      <Header lang={lang} setLang={setLang} user={user} onLogout={onLogout} t={t}/>
      <div style={{background: ND, padding: "0 22px", borderBottom: "1px solid rgba(255,255,255,.08)"}}>
        <div style={{maxWidth: "720px", margin: "0 auto", display: "flex", gap: "4px", padding: "8px 0"}}>
          <TabBtn id="stats" label={`📊 ${t.stats}`}/>
          <TabBtn id="projects" label={`📋 ${t.projects}`}/>
          <TabBtn id="coords" label={`👥 ${lang === "ar" ? "المنسقون" : lang === "fr" ? "Coordinateurs" : "Coordinators"}`}/>
        </div>
      </div>
      <div style={{maxWidth: "720px", margin: "0 auto", padding: "24px 18px 60px"}}>

        {tab === "stats" && (<>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px"}}>
            {[
              {label: t.totalProj, val: holders.length, col: Y},
              {label: lang === "ar" ? "مؤهلون" : lang === "fr" ? "Éligibles" : "Eligible", val: holders.filter((h: any) => h.comp?.eligible).length, col: GN},
              {label: lang === "ar" ? "مكتملون" : lang === "fr" ? "Terminés" : "Completed", val: holders.filter((h: any) => h.step === "export").length, col: "#8B5CF6"},
              {label: lang === "ar" ? "منسقون" : lang === "fr" ? "Coordinateurs" : "Coordinators", val: coords.length, col: "#3B82F6"},
              {label: lang === "ar" ? "متوسط النقاط" : lang === "fr" ? "Score moyen" : "Avg score", val: holders.length ? Math.round(holders.reduce((s: number, h: any) => s + (h.comp?.score || 0), 0) / holders.length) : 0, col: "#EC4899"},
              {label: lang === "ar" ? "نسبة الاكتمال" : lang === "fr" ? "Taux complétion" : "Completion rate", val: `${holders.length ? Math.round(holders.filter((h: any) => h.step === "export").length / holders.length * 100) : 0}%`, col: "#14B8A6"},
            ].map((x, i) => (
              <div key={i} style={{background: WH, borderRadius: "14px", padding: "16px", textAlign: "center",
                boxShadow: "0 2px 12px rgba(15,34,51,.07)", border: `1px solid ${CD}`}}>
                <div style={{fontSize: "24px", fontWeight: "800", color: x.col}}>{x.val}</div>
                <div style={{fontSize: "9px", color: GR, textTransform: "uppercase", letterSpacing: ".5px", marginTop: "4px"}}>{x.label}</div>
              </div>
            ))}
          </div>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
              <AccBar/><span style={{fontSize: "14px", fontWeight: "700", color: ND}}>📍 {t.byRegion}</span>
            </div>
            {Object.entries(byRegion).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([r, n], i) => (
              <BarRow key={r} label={r} n={n as number} total={holders.length}
                col={[Y, "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444"][i % 8]}/>
            ))}
            {Object.keys(byRegion).length === 0 && <p style={{color: GR, fontSize: "13px"}}>{t.noProjects}</p>}
          </Card>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
              <AccBar/><span style={{fontSize: "14px", fontWeight: "700", color: ND}}>🏭 {t.bySector}</span>
            </div>
            {Object.entries(bySector).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([s, n], i) => (
              <BarRow key={s} label={s} n={n as number} total={holders.length}
                col={[Y, "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6"][i % 6]}/>
            ))}
            {Object.keys(bySector).length === 0 && <p style={{color: GR, fontSize: "13px"}}>{t.noProjects}</p>}
          </Card>
        </>)}

        {tab === "projects" && (<>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "بحث..." : lang === "fr" ? "Rechercher..." : "Search..."}
            style={{width: "100%", padding: "11px 14px", borderRadius: "12px", border: `2px solid ${CD}`,
              fontSize: "13px", fontFamily: ff(lang), color: N, background: WH, direction: dir as "rtl" | "ltr", marginBottom: "14px"}}/>
          {filtered.length === 0 ? <p style={{textAlign: "center", color: GR, padding: "32px"}}>{t.noProjects}</p> :
            filtered.map((h: any, i: number) => (
              <Card key={i}>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                  <div style={{width: "36px", height: "36px", borderRadius: "50%", background: Y,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "800", color: ND, flexShrink: 0}}>{h.name[0]}</div>
                  <div style={{flex: 1}}>
                    <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px"}}>
                      <span style={{fontSize: "13px", fontWeight: "700", color: ND}}>{h.name}</span>
                      <span style={{fontSize: "10px", color: GR}}>{h.id}</span>
                      {h.comp && <span style={{fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px",
                        background: h.comp.eligible ? GN + "22" : RE + "22", color: h.comp.eligible ? GN : RE}}>{h.comp.score}/100</span>}
                    </div>
                    <div style={{fontSize: "11px", color: GR}}>{h.proj?.projectName || "—"} · {h.profile?.region}</div>
                    <div style={{marginTop: "5px"}}>
                      <PBar pct={["idea","dialogue","profile","plan","budget","compliance","documents","export"].indexOf(h.step || "idea") / 7 * 100} h={4}/>
                    </div>
                  </div>
                  <span style={{fontSize: "10px", fontWeight: "700", color: Y, background: Y + "22",
                    padding: "3px 8px", borderRadius: "7px", flexShrink: 0}}>{h.step || "idea"}</span>
                </div>
              </Card>
            ))
          }
        </>)}

        {tab === "coords" && (<>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
              <AccBar/><span style={{fontSize: "14px", fontWeight: "700", color: ND}}>➕ {t.addCoord}</span>
            </div>
            <p style={{fontSize: "11px", color: GR, marginBottom: "10px"}}>
              {lang === "ar" ? "الصيغة: @NOMCOD (مثال: @KHALIDCOD)" : lang === "fr" ? "Format: @NOMCOD (ex: @KHALIDCOD)" : "Format: @LASTNAMECOD (e.g. @KHALIDCOD)"}
            </p>
            <div style={{display: "flex", gap: "8px"}}>
              <input value={newCoord} onChange={e => setNewCoord(e.target.value.toUpperCase())}
                placeholder="@KHALIDCOD"
                style={{flex: 1, padding: "11px 14px", borderRadius: "11px", border: `2px solid ${newCoord && RE_COORD.test(newCoord) ? Y : CD}`,
                  fontSize: "13px", fontFamily: ff(lang), color: N, background: CR, fontWeight: "700", letterSpacing: "1px"}}/>
              <button onClick={() => {if (RE_COORD.test(newCoord)) {onAddCoord(newCoord); setNewCoord("");}}}
                disabled={!RE_COORD.test(newCoord)}
                style={{padding: "11px 20px", borderRadius: "11px", border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${Y},${YD})`, color: ND, fontSize: "13px",
                  fontWeight: "700", fontFamily: ff(lang), opacity: RE_COORD.test(newCoord) ? 1 : .5}}>
                {t.add}
              </button>
            </div>
          </Card>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px"}}>
              <AccBar/><span style={{fontSize: "14px", fontWeight: "700", color: ND}}>👥 {t.coordList} ({coords.length})</span>
            </div>
            {coords.length === 0 ? <p style={{color: GR, fontSize: "13px"}}>{lang === "ar" ? "لا يوجد منسقون بعد" : lang === "fr" ? "Aucun coordinateur ajouté." : "No coordinators added yet."}</p> :
              coords.map((c: string, i: number) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: "10px", padding: "12px",
                  borderRadius: "12px", background: CR, border: `1px solid ${CD}`, marginBottom: "7px"}}>
                  <div style={{width: "34px", height: "34px", borderRadius: "50%",
                    background: "linear-gradient(135deg,#22C55E,#16A34A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "800", color: WH}}>{c[1]}</div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: "13px", fontWeight: "700", color: ND}}>{c}</div>
                    <Badge role="coord"/>
                  </div>
                  <button onClick={() => onDelCoord(i)}
                    style={{padding: "5px 12px", borderRadius: "8px", border: `1px solid ${RE}`,
                      background: "transparent", color: RE, fontSize: "11px", fontWeight: "600", fontFamily: ff(lang)}}>
                    {t.delete}
                  </button>
                </div>
              ))
            }
          </Card>
        </>)}
      </div>
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
  const [coords, setCoords]   = useState<string[]>([]);

  function setLangDir(l: string) {
    setLang(l);
    if (typeof document !== "undefined")
      document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
  }

  const t = TX[lang];

  function onLogin(u: any) {
    if (u.isNew) {
      setHolders(p => [...p, {id: u.id, name: u.name, profile: u.profile, step: "idea"}]);
    }
    setUser(u);
  }

  function onLogout() { setUser(null); }

  function onSaveProject(data: any) {
    setHolders(p => {
      const idx = p.findIndex(h => h.id === data.id);
      if (idx >= 0) { const updated = [...p]; updated[idx] = {...updated[idx], ...data}; return updated; }
      return [...p, data];
    });
  }

  if (!user) return <Login lang={lang} setLang={setLangDir} t={t} onLogin={onLogin} holders={holders} coords={coords}/>;

  if (user.role === "holder") return (
    <HolderApp lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} onSaveProject={onSaveProject}/>
  );

  if (user.role === "coord") return (
    <CoordDash lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} holders={holders}/>
  );

  if (user.role === "admin") return (
    <AdminDash lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} holders={holders} coords={coords}
      onAddCoord={c => setCoords(p => [...p, c])}
      onDelCoord={i => setCoords(p => p.filter((_, x) => x !== i))}/>
  );

  return null;
}
