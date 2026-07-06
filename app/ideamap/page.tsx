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
  fr:["Collège","Bac","Bac+2","Bac+3","Bac+5","Doctorat"],
  ar:["إعدادي","باكالوريا","بكالوريا+2","إجازة","ماستر","دكتوراه"],
  en:["Lower secondary","Bac","Bac+2","Bachelor (Bac+3)","Master (Bac+5)","PhD"],
};
const OCCUPATION: Record<string, string[]> = {
  fr:["Étudiant(e)","Demandeur d'emploi","Salarié(e)","Travailleur indépendant","Retraité(e)","Sans activité"],
  ar:["طالب/ة","باحث عن عمل","موظف/ة","عامل مستقل","متقاعد/ة","بدون نشاط"],
  en:["Student","Job seeker","Employed","Self-employed","Retired","Inactive"],
};
const AGES = ["15–17","18–20","21–24","25–30","31–40","40+"];
const GENDERS: Record<string, string[]> = {
  fr:["Homme","Femme","Autre"],
  ar:["ذكر","أنثى","آخر"],
  en:["Male","Female","Other"],
};
const PREFECTURES_CS = [
  "Casablanca","Mohammedia","El Jadida","Settat","Berrechid",
  "Médiouna","Nouaceur","Benslimane","Khouribga","Sidi Bennour",
];

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
    city:"Ville",
    region:"Région",
    prefecture:"Préfecture",
    sector:"Secteur d'activité envisagé",
    projType:"Type de porteur",
    photo:"Photo (optionnelle)",
    create:"Créer mon compte →",
    welcome:"Bienvenue,",
    steps:["Idée","Dialogue","Profil","Plan","Budget","Logo","Conformité","Documents","Dossier"],
    ideaT:"Décrivez votre idée de projet",
    ideaH:"Secteur, zone géographique, bénéficiaires ciblés, besoins principaux.",
    ideaP:"Ex: Je veux lancer une activité de transformation de produits du terroir dans ma région...",
    sectorLabel:"Secteurs éligibles INDH",
    next:"Continuer →", loading:"Chargement...",
    dialogT:"Affinons votre projet", dialogS:"4 questions ciblées pour structurer votre dossier.",
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
    city:"المدينة",
    region:"الجهة",
    prefecture:"العمالة / الإقليم",
    sector:"قطاع النشاط المنشود",
    projType:"نوع الحامل",
    photo:"الصورة (اختياري)",
    create:"إنشاء الحساب ←",
    welcome:"مرحباً،",
    steps:["الفكرة","الحوار","الملف","الخطة","الميزانية","الشعار","الامتثال","الوثائق","الدوسيي"],
    ideaT:"صف فكرة مشروعك",
    ideaH:"القطاع، المنطقة الجغرافية، المستفيدون المستهدفون، الاحتياجات الرئيسية.",
    ideaP:"مثال: أريد إطلاق نشاط لتحويل المنتجات المحلية في منطقتي...",
    sectorLabel:"القطاعات المؤهلة للمبادرة",
    next:"متابعة ←", loading:"جاري التحميل...",
    dialogT:"لنصقل مشروعك معاً", dialogS:"4 أسئلة مستهدفة لهيكلة ملفك.",
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
    city:"City",
    region:"Region",
    prefecture:"Prefecture",
    sector:"Target sector",
    projType:"Holder type",
    photo:"Photo (optional)",
    create:"Create account →",
    welcome:"Welcome,",
    steps:["Idea","Dialogue","Profile","Plan","Budget","Logo","Compliance","Documents","File"],
    ideaT:"Describe your project idea",
    ideaH:"Sector, geographic zone, target beneficiaries, main needs.",
    ideaP:"E.g. I want to launch a local product processing activity in my region...",
    sectorLabel:"Eligible INDH sectors",
    next:"Continue →", loading:"Loading...",
    dialogT:"Let's refine your project", dialogS:"4 targeted questions to structure your application.",
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

const AdvisorAvatar = ({ size = 28 }: { size?: number }) => (
  <div style={{width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `linear-gradient(135deg,${Y},${YD})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: Math.round(size * 0.48), boxShadow: `0 2px 8px rgba(255,183,3,.35)`}}>🎓</div>
);

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
  const [mode, setMode]       = useState<null | "new">(null);
  const [form, setForm]       = useState({firstName: "", lastName: "", email: "", phone: "", age: "", gender: "", marital: "", edu: "", occupation: "", city: "", region: "", prefecture: "", sector: "", projType: "", photo: ""});
  const [formErr, setFormErr] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefRef   = useRef<HTMLDivElement>(null);
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
      if (!coords.includes(normalised)) { setErr(true); return; }
      onLogin({id:normalised, name:normalised.replace("@","").replace(/COD$/i,""), role:"coord"}); return;
    }
    if (role === "holder") {
      const existing = holders.find((h:any) => h.id === normalised);
      if (existing) { onLogin({id:normalised, name:existing.profile.firstName, role:"holder", profile:existing.profile}); return; }
      setMode("new"); return;
    }
    setErr(true);
  };

  const showPrefecture = form.region === "Casablanca-Settat";

  useEffect(() => {
    if (showPrefecture && prefRef.current) {
      setTimeout(() => prefRef.current?.scrollIntoView({behavior:"smooth", block:"start"}), 120);
    }
  }, [showPrefecture]);

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
  const allRequired = showPrefecture
    ? [...REQUIRED_FIELDS, {key:"prefecture" as keyof typeof form, label:{fr:"Préfecture",ar:"العمالة",en:"Prefecture"}}]
    : REQUIRED_FIELDS;
  const TOTAL_FIELDS = Object.keys(form).filter(k => k !== "photo" && k !== "prefecture").length + (showPrefecture ? 1 : 0);
  const filledCount  = Object.entries(form).filter(([k,v]) => k !== "photo" && (k !== "prefecture" || showPrefecture) && !!v).length;
  const fillPct      = Math.round((filledCount / TOTAL_FIELDS) * 100);
  const isEmailValid = (v:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleCreate = () => {
    const missing = allRequired.filter(r => !form[r.key]).map(r => r.label[lang] || r.label.fr);
    if (missing.length > 0 || (form.email && !isEmailValid(form.email))) {
      const errs = [...missing];
      if (form.email && !isEmailValid(form.email)) errs.push(lang==="ar"?"البريد الإلكتروني غير صالح":lang==="fr"?"Format e-mail invalide":"Invalid email format");
      setFormErr(errs); return;
    }
    const id = val.trim().toUpperCase();
    onLogin({id, name:form.firstName, role:"holder", profile:{...form, id}, isNew:true});
  };

  /* ── Dark field helpers (CareerMap style) ── */
  const lStyle: React.CSSProperties = {display:"block", fontSize:"9px", fontWeight:700,
    color:"rgba(255,255,255,.4)", marginBottom:"5px", letterSpacing:".8px", textTransform:"uppercase"};

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
            <Logo size={26}/><span style={{fontSize:"14px", fontWeight:"800", color:WH}}>IdeaMap</span>
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
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.firstName}</label>{dInp("firstName", t.firstName as string)}</div>
              <div><label style={lStyle}>{t.lastName}</label>{dInp("lastName", t.lastName as string)}</div>
            </div>
            <div style={{position:"relative"}}>
              <label style={lStyle}>{t.email}</label>
              {dInp("email", t.email as string)}
              {form.email && isEmailValid(form.email) &&
                <span style={{position:"absolute", right:"12px", top:"calc(50% + 8px)", transform:"translateY(-50%)", fontSize:"13px"}}>✅</span>}
            </div>
            <div><label style={lStyle}>{t.phone}</label>{dInp("phone", t.phone as string)}</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.age}</label>{dSel("age", AGES, t.age as string)}</div>
              <div><label style={lStyle}>{t.gender}</label>{dSel("gender", GENDERS[lang], t.gender as string)}</div>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.marital}</label>{dSel("marital", MARITAL[lang], t.marital as string)}</div>
              <div><label style={lStyle}>{t.edu}</label>{dSel("edu", EDU[lang], t.edu as string)}</div>
            </div>
            <div><label style={lStyle}>{t.occupation}</label>{dSel("occupation", OCCUPATION[lang], t.occupation as string)}</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
              <div><label style={lStyle}>{t.city}</label>{dInp("city", t.city as string)}</div>
              <div>
                <label style={lStyle}>{t.region}</label>
                <select value={form.region}
                  onChange={e => {setForm(p=>({...p, region:e.target.value, prefecture:""})); setFormErr([]);}}
                  style={{width:"100%", padding:"11px 14px", borderRadius:"10px",
                    border:`1.5px solid ${form.region ? Y : "rgba(28,58,92,.8)"}`,
                    background:"rgba(255,255,255,.04)", fontSize:"13px",
                    fontFamily:ff(lang), color:form.region ? WH : "rgba(255,255,255,.3)",
                    direction:dir as "rtl"|"ltr", appearance:"none", cursor:"pointer", transition:"all .2s"}}>
                  <option value="" style={{background:"#0f2233"}}>{t.region}</option>
                  {REGIONS.map(o => <option key={o} value={o} style={{background:"#0f2233"}}>{o}</option>)}
                </select>
              </div>
            </div>
            {showPrefecture && (
              <div ref={prefRef} style={{animation:"fadeUp .3s ease both"}}>
                <label style={lStyle}>{t.prefecture}</label>
                {dSel("prefecture", PREFECTURES_CS, t.prefecture as string)}
              </div>
            )}
            <div><label style={lStyle}>{t.sector}</label>{dSel("sector", SECTORS, t.sector as string)}</div>
            <div><label style={lStyle}>{t.projType}</label>{dSel("projType", PROJ_TYPES[lang], t.projType as string)}</div>
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
            <button onClick={handleCreate}
              style={{width:"100%", padding:"14px",
                background: fillPct >= 60 ? `linear-gradient(135deg,${Y},${YD})` : "rgba(255,255,255,.08)",
                color: fillPct >= 60 ? ND : "rgba(255,255,255,.3)",
                border: fillPct >= 60 ? "none" : "1px solid rgba(255,255,255,.1)",
                borderRadius:"12px", fontSize:"14px", fontWeight:"800",
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

  /* ── Main login card (CareerMap dark style) ── */
  return (
    <div style={{minHeight:"100vh", background:"#0A0F2C", display:"flex", alignItems:"center",
      justifyContent:"center", padding:20, position:"relative", overflow:"hidden",
      fontFamily:ff(lang), direction:dir as "rtl"|"ltr"}}>

      {/* Glow orbs */}
      <div style={{position:"absolute", left:-80, bottom:-80, width:300, height:300,
        borderRadius:"50%", background:"rgba(255,183,3,.12)", filter:"blur(70px)", pointerEvents:"none"}}/>
      <div style={{position:"absolute", right:-60, top:-60, width:260, height:260,
        borderRadius:"50%", background:"rgba(28,58,92,.5)", filter:"blur(70px)", pointerEvents:"none"}}/>

      {/* Lang toggle */}
      <div style={{position:"absolute", top:14, right:dir==="rtl"?undefined:14, left:dir==="rtl"?14:undefined, zIndex:10}}>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>

      <div className="fadeUp" style={{background:"rgba(15,34,51,.95)", borderRadius:22,
        padding:"34px 24px", width:"100%", maxWidth:400,
        border:"1px solid rgba(28,58,92,.8)", boxShadow:"0 0 60px rgba(0,0,0,.5)",
        position:"relative", zIndex:5}}>

        <div style={{textAlign:"center", marginBottom:10}}>
          <img src="/logo-transparent.png" alt="IdeaMap" style={{width:"200px", maxWidth:"100%", objectFit:"contain"}}/>
        </div>
        <p style={{textAlign:"center", color:"rgba(255,255,255,.35)", fontSize:11, marginBottom:28, fontFamily:ff(lang)}}>
          {t.tagline as string}
        </p>

        <label style={{display:"block", fontSize:9, fontWeight:700,
          color:"rgba(255,255,255,.4)", marginBottom:6, letterSpacing:.9,
          textTransform:"uppercase", fontFamily:ff(lang)}}>
          {t.enter as string}
        </label>

        <input
          value={val}
          onChange={e => {const v=e.target.value; setVal(v.startsWith("@")?v:v.toUpperCase()); setErr(false);}}
          onKeyDown={e => e.key === "Enter" && handleCheck()}
          placeholder=""
          maxLength={30}
          autoFocus
          className={err ? "shake" : ""}
          style={{width:"100%", padding:"13px 14px",
            background:"rgba(255,255,255,.04)",
            border:`2px solid ${inputBorder}`,
            borderRadius:11, fontSize:14, fontFamily:"monospace",
            color:WH, marginBottom:liveRole ? "8px" : "12px",
            transition:"border-color .2s", letterSpacing:1,
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

        {err && <p style={{color:RE, fontSize:11, marginBottom:10, fontFamily:ff(lang)}}>{t.cinError as string}</p>}

        <button onClick={handleCheck} disabled={!val.trim()}
          style={{width:"100%", padding:15,
            background: liveRole && liveRole!=="unknown"
              ? `linear-gradient(135deg,${roleColors[liveRole]},${roleColors[liveRole]}cc)`
              : `linear-gradient(135deg,${Y},${YD})`,
            color:ND, border:"none", borderRadius:12,
            fontFamily:ff(lang), fontSize:15, fontWeight:800,
            opacity:!val.trim() ? 0.5 : 1, transition:"all .18s"}}>
          {t.cont as string} {dir==="rtl" ? "←" : "→"}
        </button>
      </div>

      <p style={{position:"absolute", bottom:16, left:0, right:0, textAlign:"center",
        fontSize:12, color:"rgba(255,255,255,.2)"}}>
        © 2026 IdeaMap
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HOLDER APP
════════════════════════════════════════════════════════ */
function HolderApp({lang, setLang, user, onLogout, t, onSaveProject, initialState}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; onSaveProject: (d: any) => void; initialState?: any;
}) {
  const [step, setStep]    = useState(initialState?.step || "idea");
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
  const [docFiles, setDocFiles] = useState<Record<number, string>>(initialState?.docFiles || {});
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [pendingAttach, setPendingAttach]   = useState<number | null>(null);
  const [suggestions, setSuggestions]       = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgEnd = useRef<HTMLDivElement>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const LL  = lang === "ar" ? "arabe" : lang === "fr" ? "français" : "anglais";
  const MAX_Q = 4;

  useEffect(() => { msgEnd.current?.scrollIntoView({behavior: "smooth"}); }, [msgs]);

  useEffect(() => {
    if (proj || step !== "idea") onSaveProject({id: user.id, name: user.name, profile: user.profile, idea, msgs, qN, proj, plan, budget, comp, step, docs, logo, docFiles});
  }, [proj, plan, comp, step, logo]);

  const ai = async (messages: any[], system: string, task: "json" | "dialogue" = "dialogue") => {
    const r = await fetch("/api/ai", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({messages, system, task}),
    });
    const d = await r.json();
    return d.content?.[0]?.text || "";
  };

  const parseJ = (txt: string) => {
    try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
  };

  const parseQS = (raw: string): { question: string; suggs: string[] } => {
    const qMatch = raw.match(/QUESTION\s*:\s*([\s\S]*?)(?=SUGGESTIONS\s*:|$)/i);
    const sMatch = raw.match(/SUGGESTIONS\s*:\s*([\s\S]*)/i);
    const question = qMatch ? qMatch[1].trim() : raw.trim();
    const suggs = sMatch
      ? sMatch[1].split(/\|/).map((s: string) => s.trim()).filter((s: string) => s.length > 1 && s.length < 100)
      : [];
    return { question, suggs };
  };

  const dlText = (content: string, name: string) => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([content], {type: "text/plain;charset=utf-8"})),
      download: name,
    });
    a.click();
  };

  const dlPPTX = async (type: "pitch" | "jury") => {
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const prs = new (PptxGenJS as any)();
      prs.layout = "LAYOUT_16x9";
      const NAVY = "0F2233"; const YELLOW = "FFB703"; const WHITE = "FFFFFF";
      const total = budget?.items?.reduce((s: number, x: any) => s + (x.total || 0), 0) || 0;
      const indh = budget?.indhContribution || Math.round(total * 0.85);
      const bene = budget?.beneficiaryContribution || Math.round(total * 0.15);

      const isAr = lang === "ar";
      const T = {
        problem: isAr?"الإشكالية والحل":lang==="en"?"Problem & Solution":"Problème & Solution",
        model: isAr?"النموذج الاقتصادي والأثر":lang==="en"?"Business Model & Impact":"Modèle Économique & Impact",
        budget: isAr?"ميزانية المبادرة الوطنية":lang==="en"?"INDH Budget":"Budget INDH",
        steps: isAr?"الخطوات التالية":lang==="en"?"Next Steps":"Étapes Suivantes",
        summary: isAr?"الملخص التنفيذي":lang==="en"?"Executive Summary":"Résumé Exécutif",
        plan: isAr?"خطة الأعمال":lang==="en"?"Business Plan":"Plan d'Affaires",
        budgetPrev: isAr?"الميزانية التفصيلية":lang==="en"?"Detailed Budget":"Budget Prévisionnel",
        compliance: isAr?"الامتثال للمبادرة":lang==="en"?"INDH Compliance":"Conformité INDH",
        docs: isAr?"الوثائق المطلوبة":lang==="en"?"Required Documents":"Documents Requis",
        submission: isAr?"مراحل تقديم الملف":lang==="en"?"Submission Steps":"Étapes de Soumission",
        holder: isAr?"الحامل":"Porteur",
        eligible: isAr?"مؤهل للتمويل ✓":lang==="en"?"ELIGIBLE ✓":"ÉLIGIBLE ✓",
        notElig: isAr?"يحتاج تعديلات ✗":lang==="en"?"NOT ELIGIBLE ✗":"NON ÉLIGIBLE ✗",
        totalLabel: isAr?"المجموع":lang==="en"?"Total":"Total",
        indhLabel: isAr?"المبادرة (85%)":"INDH (85%)",
        holdLabel: isAr?"مساهمة الحامل (15%)":lang==="en"?"Holder (15%)":"Apport porteur (15%)",
        stepsText: isAr
          ? "1. إعداد الملف الكامل للمبادرة الوطنية\n2. جمع الوثائق المطلوبة\n3. إيداع الملف لدى مديرية العمل الاجتماعي\n4. الاستماع أمام لجنة التحكيم\n5. التوقيع على اتفاقية المبادرة الوطنية"
          : lang==="en"
            ? "1. Finalize the INDH application file\n2. Gather all required documents\n3. Submit to the Division of Social Action (DAS)\n4. Present to INDH selection jury\n5. Sign the INDH convention"
            : "1. Finaliser le dossier INDH\n2. Rassembler tous les documents requis\n3. Déposer auprès du CPDH\n4. Passage devant le jury de sélection\n5. Signature de la convention INDH",
        submissionText: isAr
          ? "1. إيداع الملف لدى مديرية العمل الاجتماعي (DAS)\n2. الحصول على وصل الإيداع\n3. دراسة الملف من طرف اللجنة الإقليمية (CPDH)\n4. المثول أمام لجنة تحكيم المبادرة الوطنية\n5. إشعار بالقرار\n6. التوقيع على الاتفاقية وانطلاق المشروع"
          : lang==="en"
            ? "1. Submit file to Division of Social Action (DAS)\n2. Receive deposit receipt\n3. Review by local CPDH committee\n4. Present before INDH jury\n5. Decision notification\n6. Sign convention and start project"
            : "1. Déposer le dossier à la Division de l'Action Sociale (DAS)\n2. Récépissé de dépôt délivré\n3. Instruction par le CPDH local\n4. Passage devant le jury INDH\n5. Notification de décision\n6. Signature de la convention et démarrage",
        catLabel: isAr?"الفئة":"Catégorie",
        itemLabel: isAr?"البند":"Désignation",
        totalCol: isAr?"المجموع (درهم)":"Total (MAD)",
        criteriaLabel: isAr?"المعيار":"Critère",
        weightLabel: isAr?"الوزن":"Poids",
        scoreLabel: isAr?"النقطة":"Score",
        docLabel: isAr?"الوثيقة":"Document",
        statusLabel: isAr?"الحالة":"Statut",
        ready: isAr?"✓ جاهز":"✓ Prêt",
        pending: isAr?"⏳ قيد الإعداد":"⏳ En attente",
        docsCount: isAr?`${Object.values(docs).filter(Boolean).length}/${DOCS.length} وثيقة جاهزة`:`${Object.values(docs).filter(Boolean).length}/${DOCS.length} documents préparés`,
      };
      const align = isAr ? "right" : "center";

      if (type === "pitch") {
        let s = prs.addSlide(); s.background = {color: NAVY};
        s.addText(proj?.projectName || "Mon Projet", {x:0.5,y:1.6,w:9,h:1.4,fontSize:34,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
        s.addText(logo?.concept?.tagline || proj?.sector || "", {x:0.5,y:3.1,w:9,h:0.6,fontSize:15,color:WHITE,align:"center",fontFace:"Arial"});
        s.addText(`${proj?.location || ""} · INDH Phase 3`, {x:0.5,y:3.9,w:9,h:0.4,fontSize:11,color:"AAAAAA",align:"center"});
        s.addText("IdeaMap", {x:0.5,y:4.5,w:9,h:0.3,fontSize:9,color:"666666",align:"center"});

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.problem, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:26,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.problemStatement) s.addText(plan.problemStatement, {x:0.4,y:1.1,w:4.3,h:3.8,fontSize:11,color:"333333",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.solution) s.addText(plan.solution, {x:5.1,y:1.1,w:4.3,h:3.8,fontSize:11,color:"333333",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.model, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:26,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.businessModel) s.addText(plan.businessModel, {x:0.4,y:1.1,w:9.1,h:2,fontSize:12,color:"222222",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.socialImpact) s.addText(plan.socialImpact, {x:0.4,y:3.3,w:9.1,h:1.8,fontSize:12,color:"1C3A5C",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});

        s = prs.addSlide(); s.background = {color:NAVY};
        s.addText(T.budget, {x:0.5,y:0.3,w:9,h:0.7,fontSize:26,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
        s.addText(`${T.totalLabel} : ${total.toLocaleString()} MAD`, {x:0.5,y:1.4,w:9,h:0.7,fontSize:22,color:WHITE,align:"center",bold:true});
        s.addText(`${T.indhLabel} : ${indh.toLocaleString()} MAD`, {x:0.5,y:2.3,w:9,h:0.6,fontSize:18,color:YELLOW,align:"center"});
        s.addText(`${T.holdLabel} : ${bene.toLocaleString()} MAD`, {x:0.5,y:3.1,w:9,h:0.6,fontSize:18,color:"CCCCCC",align:"center"});

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.steps, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:26,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        s.addText(T.stepsText, {x:0.4,y:1.1,w:9.1,h:4,fontSize:15,color:"222222",fontFace:"Arial",align:isAr?"right":"left"});
        await prs.writeFile({fileName: `PitchDeck_${proj?.projectName || "IdeaMap"}.pptx`});
      } else {
        let s = prs.addSlide(); s.background = {color:NAVY};
        s.addText(proj?.projectName || "", {x:0.5,y:1.3,w:9,h:1.4,fontSize:38,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
        s.addText(`${T.holder} : ${user.name}`, {x:0.5,y:2.9,w:9,h:0.5,fontSize:14,color:WHITE,align:"center"});
        s.addText(`INDH Phase 3 · ${proj?.pillar || ""}`, {x:0.5,y:3.6,w:9,h:0.4,fontSize:12,color:YELLOW,align:"center"});
        s.addText("IdeaMap", {x:0.5,y:4.7,w:9,h:0.3,fontSize:9,color:"666666",align:"center"});

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.summary, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:28,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.executiveSummary) s.addText(plan.executiveSummary, {x:0.4,y:1.1,w:9.1,h:4,fontSize:13,color:"222222",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.plan, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:28,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        const planBody = [plan?.problemStatement, plan?.solution, plan?.businessModel].filter(Boolean).join("\n\n");
        if (planBody) s.addText(planBody, {x:0.4,y:1.1,w:9.1,h:4,fontSize:11,color:"222222",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(isAr?"الأثر الاجتماعي والمحاذاة مع المبادرة":lang==="en"?"Social Impact & INDH Alignment":"Impact Social & Alignement INDH", {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:24,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.socialImpact) s.addText(plan.socialImpact, {x:0.4,y:1.1,w:9.1,h:2,fontSize:12,color:"222222",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (plan?.indh_alignment) s.addText(plan.indh_alignment, {x:0.4,y:3.3,w:9.1,h:1.8,fontSize:11,color:"1C3A5C",wrap:true,fontFace:"Arial",align:isAr?"right":"left"});

        s = prs.addSlide(); s.background = {color:NAVY};
        s.addText(T.budgetPrev, {x:0.5,y:0.2,w:9,h:0.7,fontSize:28,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
        if (budget?.items?.length) {
          const rows = [
            [{text:T.catLabel,options:{bold:true,color:YELLOW}},{text:T.itemLabel,options:{bold:true,color:YELLOW}},{text:T.totalCol,options:{bold:true,color:YELLOW}}],
            ...budget.items.slice(0,10).map((x: any) => [x.category||"", x.item||"", Number(x.total||0).toLocaleString()]),
            [{text:"",options:{}},{text:T.totalLabel,options:{bold:true,color:YELLOW}},{text:`${total.toLocaleString()} MAD`,options:{bold:true,color:YELLOW}}],
          ];
          s.addTable(rows, {x:0.3,y:1.1,w:9.4,colW:[2.2,5,2.2],fontSize:9,color:WHITE,border:{type:"solid",color:"444444",pt:0.5},fontFace:"Arial"});
        }

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.compliance, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:28,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        if (comp) {
          const scoreColor = comp.eligible ? "22C55E" : "EF4444";
          s.addText(`${comp.score}/100 · ${comp.eligible ? T.eligible : T.notElig}`, {x:0.4,y:1.1,w:9.1,h:0.7,fontSize:20,color:scoreColor,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
          if (comp.juryScore) {
            const juryRows = [
              [{text:T.criteriaLabel,options:{bold:true,color:NAVY}},{text:T.weightLabel,options:{bold:true,color:NAVY}},{text:T.scoreLabel,options:{bold:true,color:NAVY}}],
              ...JURY.map(j => [j.label, `/${j.w}`, String(comp.juryScore[j.key]||0)])
            ];
            s.addTable(juryRows, {x:0.3,y:2,w:9.4,fontSize:10,color:"222222",border:{type:"solid",color:"CCCCCC",pt:0.5},fontFace:"Arial"});
          }
        }

        s = prs.addSlide(); s.background = {color:"FAF7F0"};
        s.addShape((prs as any).ShapeType?.rect || "rect", {x:0,y:0,w:0.12,h:5.5,fill:{color:YELLOW}});
        s.addText(T.docs, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:28,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
        s.addText(T.docsCount, {x:0.4,y:1.1,w:9.1,h:0.4,fontSize:13,color:"333333",fontFace:"Arial"});
        const dRows = [
          [{text:T.docLabel,options:{bold:true,color:NAVY}},{text:T.statusLabel,options:{bold:true,color:NAVY}}],
          ...DOCS.map(d => [d.name, docs[d.id] ? T.ready : T.pending])
        ];
        s.addTable(dRows, {x:0.3,y:1.7,w:9.4,fontSize:8,color:"222222",border:{type:"solid",color:"DDDDDD",pt:0.5},fontFace:"Arial"});

        s = prs.addSlide(); s.background = {color:NAVY};
        s.addText(T.submission, {x:0.5,y:0.2,w:9,h:0.7,fontSize:28,color:YELLOW,bold:true,align:"center",fontFace:"Arial"});
        s.addText(T.submissionText, {x:0.5,y:1.2,w:9,h:4.5,fontSize:14,color:WHITE,fontFace:"Arial",align:isAr?"right":"left"});
        await prs.writeFile({fileName: `DossierJury_${proj?.projectName || "IdeaMap"}.pptx`});
      }
    } catch (e) { console.error("PPTX error:", e); }
  };

  const genLogo = async () => {
    setLogoGenerating(true);
    const r = await ai(
      [{role:"user", content:`Projet: ${JSON.stringify({name: proj?.projectName, sector: proj?.sector, location: proj?.location})}`}],
      `Expert logo design. JSON UNIQUEMENT sans markdown: {"initials":"2-3 lettres","color1":"#hexcode couleur principale vive","color2":"#hexcode couleur secondaire","icon":"emoji secteur","tagline":"slogan 4-5 mots max"}`,
      "json"
    );
    const concept = parseJ(r);
    if (concept) setLogo({type:"generated", concept});
    setLogoGenerating(false);
  };

  const INDH_CTX = `CONTEXTE INDH PHASE 3 MAROC:
- Plafond subvention: 100 000 MAD. INDH finance 85%, porteur apporte 15%.
- 4 axes prioritaires: Développement rural · Réduction pauvreté territoriale · Dignité humaine · Programmes horizontaux.
- Secteurs éligibles: Agriculture/Élevage, Artisanat, Commerce/Services, Agro-alimentaire, Tourisme rural, Numérique/TIC, Textile/Couture, BTP, Éducation/Formation, Pêche.
- Critères jury (100 pts): Impact social 25pts · Viabilité économique 20pts · Pertinence territoriale 20pts · Capacité gestion 15pts · Durabilité 10pts · Innovation 10pts.
- Porteurs prioritaires: femmes, jeunes 18-35 ans, zones rurales défavorisées.
- Structure juridique: association loi 1958, coopérative, GIE ou groupe informel en cours de formalisation.`;

  const startChat = async () => {
    if (!idea.trim()) return;
    setBusy(true); setSuggestions([]); setStep("dialogue");
    const arNote = lang === "ar" ? "\nمهم جداً: استخدم العربية الفصحى السليمة والبسيطة. جمل قصيرة جداً. لا دارجة مغربية." : "";
    const r = await ai([{role: "user", content: lang === "ar" ? `فكرتي: ${idea}` : `Mon idée: ${idea}`}],
      `Tu es le Conseiller — expert bienveillant de l'INDH Phase 3 Maroc.
${INDH_CTX}
Le porteur vient de partager son idée. Les porteurs ont souvent un faible niveau d'instruction — sois très simple, chaleureux, encourageant. Pose UNE seule question TRÈS courte sur: nombre de bénéficiaires, zone géographique, ou type de structure juridique envisagée.${arNote}

Format de réponse OBLIGATOIRE:
QUESTION: [question très courte et simple en ${LL}]
SUGGESTIONS: [réponse courte 1 en ${LL}] | [réponse courte 2 en ${LL}] | [réponse courte 3 en ${LL}]`,
      "dialogue");
    const { question, suggs } = parseQS(r);
    setMsgs([{role: "user", content: idea}, {role: "assistant", content: question}]);
    setSuggestions(suggs);
    setQN(1); setBusy(false);
  };

  const sendMsg = async (override?: string) => {
    const msg = override ?? inp;
    if (!msg.trim() || busy) return;
    const all = [...msgs, {role: "user", content: msg}];
    setMsgs(all); if (!override) setInp(""); setBusy(true); setSuggestions([]);
    const last = qN >= MAX_Q;
    const arNote = lang === "ar" ? "\nمهم: استخدم العربية الفصحى البسيطة السليمة، جمل قصيرة، لا دارجة." : "";
    const r = await ai(all.map((m: any) => ({role: m.role, content: m.content})),
      `Tu es le Conseiller INDH Phase 3 Maroc.
${INDH_CTX}
Idée originale: "${idea}". Question ${qN}/${MAX_Q}. Porteurs à faible niveau d'instruction — sois très simple et direct.${arNote}
${last
  ? `Analyse la conversation complète et retourne UNIQUEMENT ce JSON valide sans markdown ni texte autour:
{"projectName":"nom du projet en ${LL}","sector":"secteur INDH exact","legalStructure":"structure juridique","location":"ville ou région Maroc","beneficiaries":N,"activities":["activité 1","activité 2","activité 3"],"strengths":["force 1","force 2"],"estimatedBudget":N,"pillar":"axe INDH le plus pertinent"}`
  : `Pose UNE question TRÈS courte et simple (max 1 phrase) sur un point précis qui maximise le score jury: impact social, viabilité, pertinence territoriale, durabilité.

Format OBLIGATOIRE:
QUESTION: [question en ${LL}]
SUGGESTIONS: [option courte 1 en ${LL}] | [option courte 2 en ${LL}] | [option courte 3 en ${LL}]`}`,
      last ? "json" : "dialogue");
    if (last) {
      setMsgs((p: any[]) => [...p, {role: "assistant", content: lang === "ar" ? "✅ تم تحليل مشروعك بنجاح!" : lang === "fr" ? "✅ Analyse complète !" : "✅ Analysis complete!"}]);
      const p = parseJ(r); if (p) setProj(p);
      setTimeout(() => setStep("profile"), 1000);
    } else {
      const { question, suggs } = parseQS(r);
      setMsgs((p: any[]) => [...p, {role: "assistant", content: question}]);
      setSuggestions(suggs);
      setQN((p: number) => p + 1);
    }
    setBusy(false);
  };

  const genPlan = async () => {
    setBusy(true); setStep("plan");
    const projCtx = JSON.stringify(proj || {idea});
    const arQuality = lang === "ar"
      ? "\nمهم جداً: اكتب كل النصوص بالعربية الفصحى السليمة والواضحة. جمل كاملة ومنظمة. لا دارجة مغربية. لا حروف لاتينية داخل النصوص العربية."
      : "";
    const [r, r2] = await Promise.all([
      ai([{role: "user", content: `Projet INDH: ${projCtx}`}],
        `Tu es le Conseiller — expert en développement de projets INDH Phase 3 Maroc.
${INDH_CTX}
Génère un business plan COMPLET, RÉALISTE et CONVAINCANT pour le jury INDH. Réponds en ${LL}.${arQuality}
Les textes doivent être riches, détaillés et adaptés au contexte marocain rural/péri-urbain.
Cite des chiffres concrets: nombre de bénéficiaires, revenus mensuels estimés, emplois créés.
Retourne UNIQUEMENT ce JSON valide sans markdown:
{"executiveSummary":"résumé exécutif percutant 4-5 phrases pour jury, chiffres clés inclus","problemStatement":"problème local précis avec données chiffrées (chômage, pauvreté, manque de services)","solution":"solution innovante et concrète, étapes claires","marketAnalysis":"clientèle cible, taille du marché local, concurrents et avantage compétitif","businessModel":"sources de revenus détaillées, prix, volume, fréquence — viable dès mois 6","socialImpact":"bénéficiaires directs (nombre, femmes, jeunes), changement mesurable dans leur vie","operationalPlan":"calendrier 12 mois: mois 1-2 installation, mois 3-4 démarrage, mois 6 objectifs...","indh_alignment":"lien précis avec l axe INDH, critères jury remplis point par point","risks":["risque 1: description + solution concrète","risque 2: description + solution concrète","risque 3: description + solution concrète"],"projections":{"year1":N,"year2":N,"year3":N}}`,
        "json"),
      ai([{role: "user", content: `Projet INDH: ${projCtx}`}],
        `Tu es le Conseiller financier INDH Phase 3 Maroc.
${INDH_CTX}
Génère un budget prévisionnel RÉALISTE, détaillé et justifié pour ce projet spécifique. Total MAXIMUM 100 000 MAD.
Inclus toutes les catégories pertinentes: équipements, matières premières, formation, local/aménagement, frais administratifs, fonds de roulement, communication.
Chaque ligne doit être précise (pas générique). Quantités et prix unitaires réalistes au marché marocain.
Retourne UNIQUEMENT ce JSON valide sans markdown:
{"items":[{"category":"catégorie","item":"désignation précise en ${LL}","quantity":N,"unitPrice":N,"total":N}],"indhContribution":N,"beneficiaryContribution":N}`,
        "json"),
    ]);
    const p = parseJ(r); if (p) setPlan(p);
    const b = parseJ(r2); if (b) setBudget(b);
    setBusy(false);
  };

  const checkComp = async () => {
    setStep("compliance"); setBusy(true);
    const arQuality = lang === "ar"
      ? "\nمهم جداً: اكتب نقاط القوة والتوصيات بالعربية الفصحى البسيطة. جمل واضحة وقصيرة."
      : "";
    const r = await ai(
      [{role: "user", content: `Projet: ${JSON.stringify(proj)}\nPlan: ${JSON.stringify(plan)}`}],
      `Tu es le Conseiller en conformité INDH Phase 3 Maroc.
${INDH_CTX}
Évalue rigoureusement ce projet selon les critères officiels du jury INDH. Réponds en ${LL}.${arQuality}
Score juryScore: impact (max 25), viability (max 20), relevance (max 20), management (max 15), sustainability (max 10), innovation (max 10). Total = score global /100.
Éligible si score >= 60 ET projet dans secteur INDH ET budget <= 100 000 MAD.
Les recommandations doivent être des ACTIONS CONCRÈTES que le porteur peut faire immédiatement.
Retourne UNIQUEMENT ce JSON valide sans markdown:
{"eligible":true/false,"score":N,"pillar":"axe INDH exact en ${LL}","strengths":["force spécifique 1 en ${LL}","force spécifique 2 en ${LL}","force spécifique 3 en ${LL}"],"weaknesses":["faiblesse 1 en ${LL}"],"recommendations":["action concrète 1 en ${LL}","action concrète 2 en ${LL}","action concrète 3 en ${LL}"],"juryScore":{"impact":N,"viability":N,"relevance":N,"management":N,"sustainability":N,"innovation":N}}`,
      "json");
    const c = parseJ(r); if (c) setComp(c);
    setBusy(false);
  };

  const STEPS = ["idea", "dialogue", "profile", "plan", "budget", "logo", "compliance", "documents", "export"];
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
            {/* Quick starter templates */}
            {!idea.trim() && (() => {
              const starters: Record<string, string[]> = {
                fr: [
                  "Je veux créer une activité d'artisanat avec des femmes de mon quartier",
                  "Je veux lancer un projet d'élevage de poulets pour les jeunes de la région",
                  "Je veux ouvrir un atelier de couture pour former des femmes au chômage",
                  "Je veux créer une coopérative agricole pour les agriculteurs de ma commune",
                  "Je veux démarrer une activité de vente de produits du terroir locaux",
                ],
                ar: [
                  "أريد إنشاء نشاط للصناعة التقليدية مع نساء حيّنا",
                  "أريد إطلاق مشروع تربية الدواجن للشباب في المنطقة",
                  "أريد فتح ورشة خياطة لتكوين النساء العاطلات عن العمل",
                  "أريد إنشاء تعاونية فلاحية لفلاحي جماعتنا",
                  "أريد بيع المنتجات المحلية والتقليدية في منطقتي",
                ],
                en: [
                  "I want to create a craft activity with women from my neighborhood",
                  "I want to launch a poultry farming project for local youth",
                  "I want to open a sewing workshop to train unemployed women",
                  "I want to create an agricultural cooperative for farmers in my commune",
                  "I want to sell local traditional products in my region",
                ],
              };
              const list = starters[lang] || starters.fr;
              return (
                <div style={{marginBottom: "14px"}}>
                  <p style={{fontSize: "10px", fontWeight: "700", color: GR, textTransform: "uppercase",
                    letterSpacing: ".6px", marginBottom: "8px"}}>
                    ✨ {lang==="ar"?"اختر مثالاً للبدء:":lang==="fr"?"Exemples — cliquez pour démarrer :":"Examples — click to start:"}
                  </p>
                  <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    {list.map((s, i) => (
                      <button key={i} onClick={() => setIdea(s)}
                        style={{padding: "10px 14px", borderRadius: "11px",
                          border: `1.5px solid ${CD}`, background: WH, color: N,
                          fontSize: "12px", fontWeight: "500", textAlign: dir==="rtl"?"right":"left",
                          cursor: "pointer", fontFamily: ff(lang), direction: dir as "rtl"|"ltr",
                          transition: "all .15s"}}>
                        💡 {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder={t.ideaP as string}
              style={{...fs, resize: "vertical", minHeight: idea.trim() ? "100px" : "70px", lineHeight: "1.7"}}/>
            <p style={{fontSize: "11px", color: GR, fontWeight: "700", textTransform: "uppercase",
              letterSpacing: ".6px", margin: "14px 0 8px"}}>{t.sectorLabel}</p>
            <div style={{marginBottom: "20px"}}>
              {SECTORS.map(s => {
                const inIdea = idea.toLowerCase().includes(s.toLowerCase().split("/")[0].toLowerCase());
                return (
                  <button key={s} onClick={() => {
                    const prefix = lang==="ar"?"أريد مشروعاً في قطاع ":lang==="fr"?"Je veux un projet dans le secteur ":"I want a project in the sector ";
                    if (!idea.trim()) setIdea(prefix + s);
                    else if (!idea.includes(s)) setIdea((p: string) => p + (p.endsWith(" ")?"":". ") + (lang==="ar"?"قطاع: ":lang==="fr"?"Secteur: ":"Sector: ") + s);
                  }} style={{display: "inline-block", padding: "6px 13px",
                    borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                    background: inIdea ? Y : YL, color: ND,
                    margin: "3px", border: `2px solid ${inIdea ? YD : Y+"55"}`,
                    cursor: "pointer", fontFamily: ff(lang), transition: "all .15s"}}>
                    {s}
                  </button>
                );
              })}
            </div>
            {indhBtn(busy ? t.loading : t.next, startChat, {opacity: (!idea.trim() || busy) ? .5 : 1})}
          </Card>
        )}

        {/* ── DIALOGUE ── */}
        {step === "dialogue" && (
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px"}}>
              <AdvisorAvatar size={40}/>
              <div>
                <div style={{fontSize: "10px", color: Y, fontWeight: "700", textTransform: "uppercase",
                  letterSpacing: ".6px", marginBottom: "2px"}}>
                  {lang === "ar" ? "مستشار المبادرة الوطنية" : lang === "fr" ? "Conseiller INDH" : "INDH Advisor"}
                </div>
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
                  {m.role === "assistant" && <AdvisorAvatar size={28}/>}
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
                <AdvisorAvatar size={28}/>
                <Dots/>
              </div>}
              <div ref={msgEnd}/>
            </div>
            {/* Suggestion chips — tap to answer instantly */}
            {suggestions.length > 0 && !busy && (
              <div style={{display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px"}}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMsg(s)}
                    style={{padding: "9px 16px", borderRadius: "22px", border: `2px solid ${Y}`,
                      background: YL, color: ND, fontSize: "13px", fontWeight: "700",
                      cursor: "pointer", fontFamily: ff(lang), direction: dir as "rtl"|"ltr",
                      boxShadow: "0 2px 8px rgba(255,183,3,.2)", transition: "all .15s"}}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div style={{display: "flex", gap: "8px"}}>
              <input value={inp} onChange={e => setInp(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()} disabled={busy}
                placeholder={busy ? (lang==="ar"?"انتظر...":lang==="fr"?"En attente...":"Waiting...") : t.ph as string}
                style={{...fs, flex: 1, opacity: busy ? 0.6 : 1}}/>
              <button onClick={() => sendMsg()} disabled={busy || !inp.trim()}
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
              {indhBtn(`🎨 ${lang === "ar" ? "التالي: الشعار ←" : lang === "fr" ? "Suivant : Logo →" : "Next: Logo →"}`, () => setStep("logo"))}
            </Card>
          );
        })()}

        {/* ── LOGO ── */}
        {step === "logo" && (
          <Card>
            <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px"}}>
              <div style={{width:"46px", height:"46px", borderRadius:"13px", background:YL,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px",
                border:`2px solid ${Y}`, flexShrink:0}}>🎨</div>
              <div>
                <h2 style={{fontSize:"19px", fontWeight:"700", color:ND}}>
                  {lang==="ar"?"شعار مشروعك":lang==="fr"?"Logo de votre projet":"Your project logo"}
                </h2>
                <p style={{fontSize:"12px", color:GR, marginTop:"2px"}}>
                  {lang==="ar"?"أضف شعاراً أو أنشئه بالذكاء الاصطناعي":lang==="fr"?"Importez votre logo ou générez-en un gratuitement":"Upload your logo or generate one for free"}
                </p>
              </div>
            </div>

            {!logo && (
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px"}}>
                <label style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  padding:"28px 16px", borderRadius:"14px", border:`2px dashed ${CD}`,
                  cursor:"pointer", background:CR, gap:"8px"}}>
                  <span style={{fontSize:"28px"}}>📁</span>
                  <span style={{fontSize:"12px", fontWeight:"600", color:N}}>
                    {lang==="ar"?"تحميل شعار":lang==="fr"?"Importer mon logo":"Upload a logo"}
                  </span>
                  <span style={{fontSize:"10px", color:GR}}>PNG, JPG, SVG</span>
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const reader = new FileReader();
                      reader.onload = ev => setLogo({type:"upload", dataUrl: ev.target?.result as string});
                      reader.readAsDataURL(f);
                    }}/>
                </label>
                <button onClick={genLogo} disabled={logoGenerating}
                  style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    padding:"28px 16px", borderRadius:"14px", border:`2px dashed ${Y}`,
                    cursor:logoGenerating?"wait":"pointer", background:YL, gap:"8px",
                    opacity:logoGenerating?0.7:1}}>
                  <span style={{fontSize:"28px"}}>{logoGenerating?"⏳":"✨"}</span>
                  <span style={{fontSize:"12px", fontWeight:"600", color:ND}}>
                    {logoGenerating?(lang==="ar"?"جاري الإنشاء...":"Génération..."):(lang==="ar"?"توليد بالذكاء الاصطناعي":lang==="fr"?"Générer avec l'IA":"Generate with AI")}
                  </span>
                  <span style={{fontSize:"10px", color:N}}>
                    {lang==="ar"?"مجاني تماماً":lang==="fr"?"100% gratuit":"100% free"}
                  </span>
                </button>
              </div>
            )}

            {logo && (
              <div style={{textAlign:"center", marginBottom:"20px"}}>
                <div style={{display:"flex", justifyContent:"center", marginBottom:"12px"}}>
                  {logo.type === "upload" ? (
                    <img src={logo.dataUrl} alt="logo"
                      style={{width:"120px", height:"120px", objectFit:"contain", borderRadius:"16px",
                        border:`3px solid ${Y}`, boxShadow:`0 4px 20px rgba(255,183,3,.3)`}}/>
                  ) : logo.concept && (
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="60" fill={logo.concept.color1 || N}/>
                      <circle cx="60" cy="60" r="46" fill={logo.concept.color2 || Y} opacity="0.22"/>
                      <text x="60" y="52" textAnchor="middle" fontSize="26" fontWeight="800" fill="#FFFFFF" fontFamily="'Poppins',sans-serif">{(logo.concept.initials||"?").slice(0,3)}</text>
                      <text x="60" y="75" textAnchor="middle" fontSize="20">{logo.concept.icon||"💡"}</text>
                      <text x="60" y="96" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.8)" fontFamily="'Poppins',sans-serif">{(logo.concept.tagline||"").slice(0,24)}</text>
                    </svg>
                  )}
                </div>
                {logo.type === "generated" && logo.concept?.tagline && (
                  <p style={{fontSize:"13px", fontStyle:"italic", color:N, marginBottom:"8px"}}>"{logo.concept.tagline}"</p>
                )}
                <button onClick={() => setLogo(null)}
                  style={{padding:"5px 14px", borderRadius:"8px", border:`1px solid ${CD}`,
                    background:"transparent", fontSize:"11px", color:GR, fontFamily:ff(lang), cursor:"pointer"}}>
                  {lang==="ar"?"تغيير الشعار":lang==="fr"?"Changer le logo":"Change logo"}
                </button>
              </div>
            )}

            {(plan && budget) && (
              <div style={{padding:"14px 16px", background:ND, borderRadius:"13px", marginBottom:"14px",
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px"}}>
                <div>
                  <div style={{fontSize:"12px", fontWeight:"700", color:Y, marginBottom:"2px"}}>
                    🎯 {lang==="ar"?"عرض تقديمي (5 شرائح)":lang==="fr"?"Pitch Deck — 5 diapositives":"Pitch Deck — 5 slides"}
                  </div>
                  <div style={{fontSize:"11px", color:"rgba(255,255,255,.45)"}}>
                    {lang==="ar"?"اختياري — للتقديم قبل الملف الرسمي":lang==="fr"?"Optionnel · À partager avant le dossier":"Optional · Share before the formal file"}
                  </div>
                </div>
                <button onClick={() => dlPPTX("pitch")}
                  style={{padding:"9px 16px", borderRadius:"10px", border:`1.5px solid ${Y}`,
                    background:"transparent", color:Y, fontSize:"12px", fontWeight:"700",
                    fontFamily:ff(lang), cursor:"pointer", whiteSpace:"nowrap", flexShrink:0}}>
                  ⬇ .pptx
                </button>
              </div>
            )}

            {indhBtn(
              lang==="ar"?"← التالي: الامتثال":lang==="fr"?"Continuer → Conformité":"Continue → Compliance",
              checkComp
            )}
          </Card>
        )}

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
                {icon:"📊", l:lang==="ar"?"خطة الأعمال":lang==="fr"?"Business Plan":"Business Plan", ok:!!plan,
                  onDl:() => dlText([
                    `${proj?.projectName || "Projet"} — Business Plan`,``,
                    `RÉSUMÉ EXÉCUTIF`,plan?.executiveSummary||"",``,
                    `PROBLÉMATIQUE`,plan?.problemStatement||"",``,
                    `SOLUTION`,plan?.solution||"",``,
                    `ANALYSE DE MARCHÉ`,plan?.marketAnalysis||"",``,
                    `MODÈLE ÉCONOMIQUE`,plan?.businessModel||"",``,
                    `IMPACT SOCIAL`,plan?.socialImpact||"",``,
                    `PLAN OPÉRATIONNEL`,plan?.operationalPlan||"",``,
                    `ALIGNEMENT INDH`,plan?.indh_alignment||"",``,
                    `RISQUES`,...(plan?.risks||[]).map((r: string)=>`• ${r}`),``,
                    `PROJECTIONS`,`An 1: ${plan?.projections?.year1||0} MAD`,`An 2: ${plan?.projections?.year2||0} MAD`,`An 3: ${plan?.projections?.year3||0} MAD`,
                  ].join("\n"), `BusinessPlan_${proj?.projectName||"IdeaMap"}.txt`)},
                {icon:"💰", l:lang==="ar"?"الميزانية التفصيلية":lang==="fr"?"Budget Prévisionnel":"Detailed Budget", ok:!!budget?.items,
                  onDl:() => {
                    const total=(budget?.items||[]).reduce((s: number,x: any)=>s+(x.total||0),0);
                    dlText([
                      `${proj?.projectName||"Projet"} — Budget Prévisionnel`,``,
                      `Catégorie\tDésignation\tQuantité\tPrix Unit.\tTotal`,
                      ...(budget?.items||[]).map((x: any)=>`${x.category}\t${x.item}\t${x.quantity}\t${x.unitPrice}\t${x.total}`),``,
                      `TOTAL: ${total.toLocaleString()} MAD`,
                      `Contribution INDH (${Math.round(((budget?.indhContribution||Math.round(total*.85))/total)*100)}%): ${(budget?.indhContribution||Math.round(total*.85)).toLocaleString()} MAD`,
                      `Apport porteur (${Math.round(((budget?.beneficiaryContribution||Math.round(total*.15))/total)*100)}%): ${(budget?.beneficiaryContribution||Math.round(total*.15)).toLocaleString()} MAD`,
                    ].join("\n"), `Budget_${proj?.projectName||"IdeaMap"}.txt`)}},
                {icon:"✅", l:lang==="ar"?"تقرير الامتثال":lang==="fr"?"Rapport de Conformité":"Compliance Report", ok:!!comp,
                  onDl:() => dlText([
                    `${proj?.projectName||"Projet"} — Conformité INDH`,``,
                    `Score: ${comp?.score}/100`,`Éligible: ${comp?.eligible?"OUI":"NON"}`,`Pilier: ${comp?.pillar||""}`,``,
                    `POINTS FORTS`,...(comp?.strengths||[]).map((s: string)=>`✓ ${s}`),``,
                    `RECOMMANDATIONS`,...(comp?.recommendations||[]).map((r: string)=>`→ ${r}`),``,
                    `GRILLE JURY`,
                    ...JURY.map(j=>`${j.label}: ${comp?.juryScore?.[j.key]||0}/${j.w}`),
                  ].join("\n"), `Conformite_${proj?.projectName||"IdeaMap"}.txt`)},
                {icon:"📋", l:lang==="ar"?"قائمة الوثائق":lang==="fr"?"Checklist Documents":"Docs Checklist", ok:true,
                  onDl:() => dlText([
                    `${proj?.projectName||"Projet"} — Checklist Documents`,``,
                    `OBLIGATOIRES`,
                    ...DOCS.filter(d=>d.req).map(d=>`[${docs[d.id]?"✓":" "}] ${d.name} — ${d.desc}`),``,
                    `OPTIONNELS`,
                    ...DOCS.filter(d=>!d.req).map(d=>`[${docs[d.id]?"✓":" "}] ${d.name} — ${d.desc}`),
                  ].join("\n"), `Checklist_${proj?.projectName||"IdeaMap"}.txt`)},
                {icon:"📖", l:lang==="ar"?"دليل التقديم":lang==="fr"?"Guide de Soumission":"Submission Guide", ok:true,
                  onDl:() => dlText([
                    `GUIDE DE SOUMISSION INDH — ${proj?.projectName||""}`,``,
                    `Étape 1: Finaliser et réunir tous les documents requis`,
                    `Étape 2: Déposer le dossier complet à la Division de l'Action Sociale (DAS) de votre province`,
                    `Étape 3: Obtenir le récépissé de dépôt (conservez-le précieusement)`,
                    `Étape 4: Instruction du dossier par le CPDH local (4 à 8 semaines)`,
                    `Étape 5: Présentation devant le jury de sélection INDH`,
                    `Étape 6: Notification de la décision (financement / report / refus)`,
                    `Étape 7: Signature de la convention INDH et démarrage du projet`,``,
                    `CONTACTS UTILES`,
                    `• Division de l'Action Sociale (DAS) de votre province`,
                    `• Comité Provincial de Développement Humain (CPDH)`,
                    `• Site officiel INDH: www.indh.ma`,
                    `• Rokhsa.ma pour les autorisations réglementées`,
                  ].join("\n"), `GuideSubmission_${proj?.projectName||"IdeaMap"}.txt`)},
                {icon:"🎯", l:lang==="ar"?"عرض اللجنة (7 شرائح)":lang==="fr"?"Présentation Jury — 7 diapositives":"Jury Presentation — 7 slides", ok:!!proj,
                  onDl:() => dlPPTX("jury"), badge:"pptx"},
              ].map((x, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px",
                  borderRadius:"13px", marginBottom:"7px", background:x.ok?ND:CR, border:`1px solid ${x.ok?Y:CD}`}}>
                  <span style={{fontSize:"20px"}}>{x.icon}</span>
                  <span style={{flex:1, fontSize:"12px", color:x.ok?WH:ND, fontWeight:"500"}}>{x.l}</span>
                  {x.ok ? (
                    <button onClick={x.onDl}
                      style={{padding:"5px 12px", borderRadius:"8px", border:`1.5px solid ${Y}`,
                        background:"transparent", color:Y, fontSize:"11px", fontWeight:"700",
                        fontFamily:ff(lang), cursor:"pointer"}}>
                      ⬇ {(x as any).badge || "txt"}
                    </button>
                  ) : (
                    <span style={{padding:"2px 7px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                      background:CD, color:GR}}>⏳</span>
                  )}
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
  const [tab, setTab]           = useState("stats");
  const [newCoord, setNewCoord] = useState("");
  const [search, setSearch]     = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterStep, setFilterStep]     = useState("");
  const [detailH, setDetailH]   = useState<any>(null);

  const STEPS_LIST = ["idea","dialogue","profile","plan","budget","logo","compliance","documents","export"];

  const filtered = holders.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || (h.name||"").toLowerCase().includes(q) || (h.id||"").toLowerCase().includes(q) || (h.proj?.projectName||"").toLowerCase().includes(q);
    const matchRegion = !filterRegion || h.profile?.region === filterRegion;
    const matchSector = !filterSector || (h.proj?.sector || h.profile?.sector) === filterSector;
    const matchStep   = !filterStep   || (h.step || "idea") === filterStep;
    return matchSearch && matchRegion && matchSector && matchStep;
  });

  const byRegion = holders.reduce((a: Record<string, number>, h: any) => {
    const r = h.profile?.region || "N/A"; a[r] = (a[r] || 0) + 1; return a;
  }, {});
  const bySector = holders.reduce((a: Record<string, number>, h: any) => {
    const s = h.proj?.sector || h.profile?.sector || "N/A"; a[s] = (a[s] || 0) + 1; return a;
  }, {});

  const exportCSV = () => {
    const cols = ["ID","Nom","Prénom","Email","Téléphone","Age","Genre","Région","Secteur","Type","Projet","Structure","Bénéficiaires","Budget","Axe INDH","Score","Éligible","Étape"];
    const rows = holders.map(h => [
      h.id, h.profile?.lastName||"", h.name||"", h.profile?.email||"", h.profile?.phone||"",
      h.profile?.age||"", h.profile?.gender||"", h.profile?.region||"",
      h.proj?.sector||h.profile?.sector||"", h.profile?.projType||"",
      h.proj?.projectName||"", h.proj?.legalStructure||"", h.proj?.beneficiaries||"",
      h.proj?.estimatedBudget||"", h.proj?.pillar||"",
      h.comp?.score||"", h.comp?.eligible?"OUI":"NON", h.step||"idea",
    ].map(v => `"${String(v).replace(/"/g,'""')}"`));
    const csv = [cols.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob(["﻿"+csv], {type:"text/csv;charset=utf-8"})),
      download: "IdeaMap_Porteurs.csv",
    });
    a.click();
  };

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

  /* ── Detail modal ── */
  if (detailH) {
    const h = detailH;
    return (
      <div style={{minHeight: "100vh", background: CR, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
        <Header lang={lang} setLang={setLang} user={user} onLogout={onLogout} t={t}/>
        <div style={{maxWidth: "720px", margin: "0 auto", padding: "24px 18px 60px"}}>
          <button onClick={() => setDetailH(null)} style={{marginBottom: "16px", padding: "8px 16px",
            borderRadius: "10px", border: `1px solid ${N}`, background: "transparent",
            color: N, fontSize: "12px", fontWeight: "600", fontFamily: ff(lang)}}>
            ← {lang === "ar" ? "رجوع" : lang === "fr" ? "Retour" : "Back"}
          </button>
          <Card>
            <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px"}}>
              <div style={{width: "44px", height: "44px", borderRadius: "50%", background: Y,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: "800", color: ND}}>{(h.name||"?")[0]}</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: "16px", fontWeight: "700", color: ND}}>{h.name} {h.profile?.lastName||""}</div>
                <div style={{fontSize: "12px", color: GR}}>{h.id} · {h.profile?.region} · {h.profile?.projType}</div>
              </div>
              <div style={{display:"flex", gap:"6px", flexShrink:0}}>
                <Badge role="holder"/>
                {h.comp && <span style={{padding:"3px 8px", borderRadius:"7px", fontSize:"10px", fontWeight:"700",
                  background: h.comp.eligible ? GN+"22" : RE+"22", color: h.comp.eligible ? GN : RE}}>
                  {h.comp.score}/100
                </span>}
              </div>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"}}>
              {[
                {l:"Age", v:h.profile?.age, i:"📅"}, {l:"Genre", v:h.profile?.gender, i:"👤"},
                {l:"Région", v:h.profile?.region, i:"📍"}, {l:"Secteur", v:h.profile?.sector, i:"🏭"},
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
              <AccBar/><span style={{fontSize:"15px", fontWeight:"700", color:ND}}>📋 {lang==="ar"?"ملف المشروع":lang==="fr"?"Profil du Projet":"Project Profile"}</span>
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
              <AccBar/><span style={{fontSize:"15px", fontWeight:"700", color:ND}}>📊 {lang==="ar"?"خطة الأعمال":lang==="fr"?"Plan d'Affaires":"Business Plan"}</span>
            </div>
            {h.plan.executiveSummary && <div style={{padding:"12px 14px", background:CR, borderRadius:"12px",
              borderLeft:`4px solid ${Y}`, marginBottom:"8px", fontSize:"13px", color:ND, lineHeight:"1.7"}}>
              {h.plan.executiveSummary.slice(0, 300)}{h.plan.executiveSummary.length > 300 ? "…" : ""}
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
              <AccBar/><span style={{fontSize:"15px", fontWeight:"700", color:ND}}>✅ {t.compT}</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"16px", marginBottom:"14px"}}>
              <div style={{width:"72px", height:"72px", borderRadius:"50%",
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
          <div style={{padding:"14px 16px", background:ND, borderRadius:"14px", display:"flex",
            alignItems:"center", justifyContent:"space-between", gap:"12px"}}>
            <span style={{fontSize:"13px", color:WH, fontWeight:"600"}}>
              📄 {lang==="ar"?"تصدير بيانات هذا الحامل":lang==="fr"?"Exporter ce porteur":"Export this holder"}
            </span>
            <button onClick={() => {
              const h2 = detailH;
              const total = (h2.budget?.items||[]).reduce((s: number, x: any) => s+(x.total||0), 0);
              const rows = [
                ["ID","Nom","Prénom","Email","Téléphone","Région","Secteur","Projet","Score","Éligible","Étape"],
                [h2.id, h2.profile?.lastName||"", h2.name||"", h2.profile?.email||"",
                 h2.profile?.phone||"", h2.profile?.region||"", h2.proj?.sector||"",
                 h2.proj?.projectName||"", h2.comp?.score||"", h2.comp?.eligible?"OUI":"NON", h2.step||"idea"],
              ].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
              const a = Object.assign(document.createElement("a"), {
                href: URL.createObjectURL(new Blob(["﻿"+rows], {type:"text/csv;charset=utf-8"})),
                download: `Porteur_${h2.id}.csv`,
              });
              a.click();
            }} style={{padding:"8px 16px", borderRadius:"10px", border:`1.5px solid ${Y}`,
              background:"transparent", color:Y, fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer"}}>
              ⬇ CSV
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Search + filter row */}
          <div style={{display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap"}}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "بحث..." : lang === "fr" ? "Rechercher..." : "Search..."}
              style={{flex:"1 1 160px", minWidth:"120px", padding:"10px 13px", borderRadius:"10px", border:`2px solid ${CD}`,
                fontSize:"12px", fontFamily:ff(lang), color:N, background:WH, direction:dir as "rtl"|"ltr"}}/>
            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
              style={{flex:"1 1 130px", minWidth:"110px", padding:"10px 10px", borderRadius:"10px",
                border:`2px solid ${filterRegion ? Y : CD}`, background:filterRegion ? YL : WH,
                fontSize:"11px", fontFamily:ff(lang), color:filterRegion ? ND : GR, appearance:"none"}}>
              <option value="">{lang==="ar"?"كل الجهات":lang==="fr"?"Toutes régions":"All regions"}</option>
              {REGIONS.map(r => <option key={r} value={r}>{r.slice(0,18)}</option>)}
            </select>
            <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
              style={{flex:"1 1 120px", minWidth:"100px", padding:"10px 10px", borderRadius:"10px",
                border:`2px solid ${filterSector ? Y : CD}`, background:filterSector ? YL : WH,
                fontSize:"11px", fontFamily:ff(lang), color:filterSector ? ND : GR, appearance:"none"}}>
              <option value="">{lang==="ar"?"كل القطاعات":lang==="fr"?"Tous secteurs":"All sectors"}</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterStep} onChange={e => setFilterStep(e.target.value)}
              style={{flex:"1 1 100px", minWidth:"90px", padding:"10px 10px", borderRadius:"10px",
                border:`2px solid ${filterStep ? Y : CD}`, background:filterStep ? YL : WH,
                fontSize:"11px", fontFamily:ff(lang), color:filterStep ? ND : GR, appearance:"none"}}>
              <option value="">{lang==="ar"?"كل المراحل":lang==="fr"?"Toutes étapes":"All steps"}</option>
              {STEPS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* CSV export + count row */}
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px"}}>
            <span style={{fontSize:"11px", color:GR, fontWeight:"600"}}>
              {filtered.length} {lang==="ar"?"نتيجة":lang==="fr"?"résultat(s)":"result(s)"}
            </span>
            <button onClick={exportCSV}
              style={{padding:"7px 14px", borderRadius:"9px", border:`1.5px solid ${N}`,
                background:"transparent", color:N, fontSize:"11px", fontWeight:"700",
                fontFamily:ff(lang), cursor:"pointer"}}>
              📥 CSV
            </button>
          </div>
          {filtered.length === 0 ? <p style={{textAlign: "center", color: GR, padding: "32px"}}>{t.noProjects}</p> :
            filtered.map((h: any, i: number) => (
              <Card key={i} style={{cursor:"pointer"}} onClick={() => setDetailH(h)}>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                  <div style={{width: "36px", height: "36px", borderRadius: "50%", background: Y,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "800", color: ND, flexShrink: 0}}>{(h.name||"?")[0]}</div>
                  <div style={{flex: 1}}>
                    <div style={{display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px"}}>
                      <span style={{fontSize: "13px", fontWeight: "700", color: ND}}>{h.name}</span>
                      <span style={{fontSize: "10px", color: GR}}>{h.id}</span>
                      {h.comp && <span style={{fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px",
                        background: h.comp.eligible ? GN + "22" : RE + "22", color: h.comp.eligible ? GN : RE}}>{h.comp.score}/100</span>}
                    </div>
                    <div style={{fontSize: "11px", color: GR}}>{h.proj?.projectName || "—"} · {h.profile?.region}</div>
                    <div style={{marginTop: "5px"}}>
                      <PBar pct={STEPS_LIST.indexOf(h.step || "idea") / (STEPS_LIST.length - 1) * 100} h={4}/>
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
  const [syncing, setSyncing] = useState(false);

  /* ── Fetch live data from Google Sheets on mount ──────
     Falls back to localStorage if Sheets isn't configured */
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Load localStorage cache immediately so UI isn't empty
    try {
      const h = localStorage.getItem("idm_holders");
      if (h) setHolders(JSON.parse(h));
      const c = localStorage.getItem("idm_coords");
      if (c) setCoords(JSON.parse(c));
    } catch {}

    // Then refresh from Sheets (live source of truth)
    setSyncing(true);
    fetch("/api/sheets")
      .then(r => r.json())
      .then(data => {
        if (data.holders?.length > 0 || data.coords?.length > 0) {
          setHolders(data.holders || []);
          setCoords(data.coords || []);
          // Update localStorage cache
          try {
            localStorage.setItem("idm_holders", JSON.stringify(data.holders || []));
            localStorage.setItem("idm_coords", JSON.stringify(data.coords || []));
          } catch {}
        }
      })
      .catch(() => {/* Sheets not configured — localStorage cache stays */})
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
  async function persistCoords(list: string[]) {
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
      const newHolder = {id: u.id, name: u.name, profile: u.profile, step: "idea"};
      setHolders(p => [...p, newHolder]);
      persistHolder(newHolder);
    }
    setUser(u);
  }

  function onLogout() { setUser(null); }

  function onSaveProject(data: any) {
    setHolders(p => {
      const idx = p.findIndex(h => h.id === data.id);
      const updated = idx >= 0
        ? p.map((h, i) => i === idx ? {...h, ...data} : h)
        : [...p, data];
      return updated;
    });
    persistHolder(data);
  }

  function onAddCoord(c: string) {
    const next = [...coords, c];
    setCoords(next);
    persistCoords(next);
  }

  function onDelCoord(i: number) {
    const next = coords.filter((_, x) => x !== i);
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
    return <>
      <SyncDot/>
      <HolderApp lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
        t={t} onSaveProject={onSaveProject} initialState={saved}/>
    </>;
  }

  if (user.role === "coord") return <>
    <SyncDot/>
    <CoordDash lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} holders={holders}/>
  </>;

  if (user.role === "admin") return <>
    <SyncDot/>
    <AdminDash lang={lang} setLang={setLangDir} user={user} onLogout={onLogout}
      t={t} holders={holders} coords={coords}
      onAddCoord={onAddCoord}
      onDelCoord={onDelCoord}/>
  </>;

  return null;
}
