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
    "input:focus,select:focus,textarea:focus{outline:none}",
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
  <div onClick={onClick} style={{background: WH, borderRadius: "12px", padding: "22px",
    boxShadow: "0 1px 2px rgba(10,15,44,.04)", marginBottom: "14px",
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
  const [rec, setRec]   = useState(false);
  const [busy, setBusy] = useState(false);
  const mrRef  = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const mr = new MediaRecorder(stream, {mimeType: "audio/webm"});
      chunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setBusy(true);
        try {
          const blob = new Blob(chunks.current, {type: "audio/webm"});
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
    } catch {
      onError(lang==="ar"?"يرجى السماح بالوصول إلى الميكروفون":lang==="fr"?"Autorisez l'accès au micro":"Allow microphone access");
    }
  };

  const stop = () => { mrRef.current?.stop(); mrRef.current = null; setRec(false); };

  const label = busy
    ? (lang==="ar"?"جاري التحويل...":lang==="fr"?"Transcription...":"Transcribing...")
    : rec
    ? (lang==="ar"?"إيقاف التسجيل ⏹":lang==="fr"?"Arrêter ⏹":"Stop ⏹")
    : (lang==="ar"?"تحدث عن فكرتك 🎤":lang==="fr"?"Parlez votre idée 🎤":"Speak your idea 🎤");

  return (
    <button
      onClick={rec ? stop : start}
      disabled={busy}
      title={label}
      style={{
        display:"flex", alignItems:"center", gap:"6px",
        padding:"10px 14px", borderRadius:"11px", border:`1.5px solid ${rec ? "#EF4444" : Y}`,
        background: rec ? "#FFF0F0" : YL, color: rec ? "#EF4444" : ND,
        fontSize:"12px", fontWeight:"700", cursor: busy ? "wait" : "pointer",
        fontFamily:"inherit", opacity: busy ? 0.7 : 1, transition:"all .2s",
        animation: rec ? "pulse 1.4s ease infinite" : "none",
      }}>
      <span style={{fontSize:"15px"}}>{busy ? "⏳" : rec ? "⏹" : "🎤"}</span>
      <span style={{whiteSpace:"nowrap"}}>{label}</span>
    </button>
  );
}

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

/* ── HELP AGENT ─────────────────────────────────────── */
function HelpAgent({lang, context}: {lang: string; context: string}) {
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
FAITS INDH CLÉS: subvention max 100 000 MAD, INDH paie 85%, porteur apporte 15% (en espèces ou nature). Jury 100pts: Impact social 25pts · Viabilité 20pts · Pertinence territoriale 20pts · Gestion 15pts · Durabilité 10pts · Innovation 10pts. Éligible si ≥60pts.
RÉALITÉS MAROC: SMIG 2 828 MAD/mois. Location petit local 800-2500 MAD/mois. Machine à coudre industrielle 3500-8000 MAD. Souk hebdomadaire = canal de vente principal zones rurales.
Quand quelqu'un demande des documents: cite les 8 documents obligatoires (CIN, statuts, PV AG, récépissé, attestation résidence, devis, photos site, business plan).
Quand quelqu'un demande comment améliorer son score: cite les critères jury précis avec les points.
Quand quelqu'un demande l'éligibilité: pose 2 questions (secteur + budget estimé) avant de répondre.
Réponds UNIQUEMENT en ${lang === "ar" ? "arabe فصحى بسيطة" : lang === "fr" ? "français simple" : "English"}.
Sois bref (2-4 phrases max), concret, basé sur les réalités marocaines. Donne des chiffres précis quand possible.`;

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
    for (let attempt = 0; attempt < 3 && !replied; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 800 * attempt));
        const r = await fetch("/api/ai", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({messages: history, system: sys, task:"dialogue"}),
        });
        const d = await r.json();
        const text = d.content?.[0]?.text || "";
        if (text) {
          setMsgs(p => [...p, {role:"assistant", content:text}]);
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
        <div className="fadeUp" style={{position:"fixed", bottom:88, right:24, zIndex:999,
          width:320, maxHeight:460, background:WH, borderRadius:18,
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
            {msgs.map((m, i) => (
              <div key={i} style={{padding:"10px 13px", maxWidth:"88%",
                borderRadius: m.role==="user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: m.role==="user" ? `linear-gradient(135deg,${N},${ND})` : YL,
                color: m.role==="user" ? WH : ND, fontSize:"12px", lineHeight:1.65,
                alignSelf: m.role==="user" ? (dir==="rtl"?"flex-start":"flex-end") : (dir==="rtl"?"flex-end":"flex-start")}}>
                {m.content}
              </div>
            ))}
            {busy && <div style={{display:"flex", gap:"4px", padding:"4px 0"}}>
              {[0,1,2].map(i => <div key={i} style={{width:7, height:7, borderRadius:"50%",
                background:Y, animation:`bounce 1s ease ${i*.2}s infinite`}}/>)}
            </div>}
            <div ref={endRef}/>
          </div>

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
const Header = ({lang, user, onLogout, t}: {
  lang: string;
  user: any; onLogout: () => void; t: any;
}) => (
  <div style={{background: ND, height: "58px", display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 22px",
    boxShadow: "0 2px 16px rgba(15,34,51,.3)", position: "sticky", top: 0, zIndex: 200}}>
    <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
      <div style={{width: "32px", height: "32px", borderRadius: "8px", background: Y,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "900", color: WH}}>I</div>
      <span style={{fontSize: "17px", fontWeight: "800", color: WH, lineHeight: 1, letterSpacing: "-.3px"}}>IdeaMap</span>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
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
            letterSpacing: ".5px",
            color: i < si ? GN : i === si ? N : GR}}>
            {i < si ? "✓" : s}
          </span>
        ))}
      </div>
      <PBar pct={((si + 1) / steps.length) * 100} h={6}
        color={`linear-gradient(90deg,${Y},${YD})`}/>
    </div>
  </div>
);

/* ── DASHBOARD SIDEBAR ─────────────────────────────── */
const DashSidebar = ({user, navItems, activeTab, onTabChange, onLogout, lang, t}: {
  user: any; navItems: {id:string; label:string}[]; activeTab: string;
  onTabChange: (id:string)=>void; onLogout:()=>void; lang:string; t:any;
}) => (
  <div style={{width:240, flexShrink:0, background:WH, borderRight:`1px solid ${CD}`,
    position:"sticky", top:0, height:"100vh", display:"flex", flexDirection:"column", zIndex:50}}>
    {/* Logo area */}
    <div style={{padding:"20px 18px 16px", borderBottom:`1px solid ${CD}`}}>
      <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
        <div style={{width:34, height:34, borderRadius:"9px", background:ND, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:"900", color:WH}}>I</div>
        <div>
          <div style={{fontSize:"14.5px", fontWeight:"800", color:ND, lineHeight:1.2}}>IdeaMap</div>
          <div style={{fontSize:"10px", color:GR, fontWeight:"500"}}>
            {user.role==="admin" ? (lang==="ar"?"إدارة":lang==="fr"?"Administration":"Admin") : (lang==="ar"?"تنسيق":lang==="fr"?"Coordination":"Coordinator")}
          </div>
        </div>
      </div>
    </div>
    {/* Nav items */}
    <nav style={{padding:"10px 10px", flex:1, overflowY:"auto"}}>
      {navItems.map(item => {
        const active = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => onTabChange(item.id)}
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
            <div style={{width:"28px", height:"28px", borderRadius:"7px", background:Y,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"900", color:WH}}>I</div>
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

        {/* Logo above card */}
        <img src="/logo-transparent.png" alt="IdeaMap"
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
  const [suggestions, setSuggestions]       = useState<string[]>(initialState?.suggestions || []);
  const [brief, setBrief]                   = useState(initialState?.brief || "");
  const [currentQ, setCurrentQ]             = useState(initialState?.currentQ || "");
  const [dlLang, setDlLang]                 = useState(lang);
  const [toast, setToast]                   = useState<{msg: string; type: "error"|"success"} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgEnd = useRef<HTMLDivElement>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const LL  = lang === "ar" ? "arabe" : lang === "fr" ? "français" : "anglais";
  const MAX_Q = 4;

  useEffect(() => { msgEnd.current?.scrollIntoView({behavior: "smooth"}); }, [msgs]);

  useEffect(() => {
    if (proj || step !== "idea" || msgs.length > 0) onSaveProject({id: user.id, name: user.name, profile: user.profile, idea, msgs, qN, proj, plan, budget, comp, step, docs, logo, docFiles, brief, currentQ, suggestions});
  }, [proj, plan, comp, step, logo, docs, msgs, budget, brief, currentQ]);

  const showToast = (msg: string, type: "error"|"success" = "error") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 4500);
  };

  // Auto-retries up to 3× with exponential back-off before surfacing any error.
  // The server-side cascade (providers.ts) already tries 4 Groq models + Together
  // + Gemini + OpenRouter × 2 sweeps, so the client retry is a last safety net.
  const ai = async (messages: any[], system: string, task: "json" | "dialogue" = "dialogue"): Promise<string> => {
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 900 * attempt));
        const r = await fetch("/api/ai", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({messages, system, task}),
        });
        const d = await r.json();
        if (d.error) {
          if (attempt < MAX_RETRIES - 1) continue;
          showToast(lang==="ar"?"المستشار مشغول — جاري إعادة المحاولة...":lang==="fr"?"Conseiller surchargé — nouvelle tentative...":"Advisor busy — retrying automatically...", "error");
          return "";
        }
        return d.content?.[0]?.text || "";
      } catch {
        if (attempt < MAX_RETRIES - 1) continue;
        showToast(lang==="ar"?"تعذّر الاتصال — تحقق من اتصالك":lang==="fr"?"Connexion impossible — vérifiez votre réseau":"Connection failed — check your network");
        return "";
      }
    }
    return "";
  };

  const parseJ = (txt: string) => {
    try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
  };

  const parseQS = (raw: string): { brief: string; question: string; suggs: string[] } => {
    const bMatch = raw.match(/BRIEF\s*:\s*([\s\S]*?)(?=QUESTION\s*:|SUGGESTIONS\s*:|$)/i);
    const qMatch = raw.match(/QUESTION\s*:\s*([\s\S]*?)(?=SUGGESTIONS\s*:|BRIEF\s*:|$)/i);
    const sMatch = raw.match(/SUGGESTIONS\s*:\s*([\s\S]*)/i);
    const brief = bMatch ? bMatch[1].trim() : "";
    const question = qMatch ? qMatch[1].trim() : (brief ? "" : raw.replace(/SUGGESTIONS\s*:[\s\S]*/i, "").trim());
    const suggs = sMatch
      ? sMatch[1].split(/\|/).map((s: string) => s.trim()).filter((s: string) => s.length > 1 && s.length < 120)
      : [];
    return { brief, question, suggs };
  };

  const dlText = (content: string, name: string) => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([content], {type: "text/plain;charset=utf-8"})),
      download: name,
    });
    a.click();
  };

  // Opens a print-ready HTML window — browser converts to PDF via Ctrl+P / Save as PDF.
  // Uses the browser's native PDF engine (free, offline, professional output).
  const dlPDF = (exportLang: string = dlLang) => {
    const eAr = exportLang === "ar"; const eEn = exportLang === "en";
    const dir2 = eAr ? "rtl" : "ltr";
    const font = eAr ? "'Tajawal',sans-serif" : "'Poppins',sans-serif";
    const total = (budget?.items||[]).reduce((s: number, x: any) => s + (x.total||0), 0);
    const indhAmt = budget?.indhContribution || Math.round(total * 0.85);
    const holdAmt = budget?.beneficiaryContribution || Math.round(total * 0.15);
    const T = {
      title:   eAr?"خطة الأعمال":eEn?"Business Plan":"Plan d'Affaires",
      holder:  eAr?"الحامل":eEn?"Holder":"Porteur",
      exec:    eAr?"الملخص التنفيذي":eEn?"Executive Summary":"Résumé Exécutif",
      problem: eAr?"إشكالية المشروع":eEn?"Problem Statement":"Problématique",
      sol:     eAr?"الحل المقترح":eEn?"Proposed Solution":"Solution",
      market:  eAr?"تحليل السوق":eEn?"Market Analysis":"Analyse de Marché",
      biz:     eAr?"نموذج الأعمال":eEn?"Business Model":"Modèle Économique",
      impact:  eAr?"الأثر الاجتماعي":eEn?"Social Impact":"Impact Social",
      ops:     eAr?"الخطة التشغيلية":eEn?"Operational Plan":"Plan Opérationnel",
      indh:    eAr?"التوافق مع المبادرة":eEn?"INDH Alignment":"Alignement INDH",
      risks:   eAr?"المخاطر":eEn?"Risks":"Risques",
      proj:    eAr?"التوقعات المالية (درهم)":eEn?"Financial Projections (MAD)":"Projections Financières (MAD)",
      budT:    eAr?"الميزانية التفصيلية":eEn?"Detailed Budget":"Budget Prévisionnel",
      cat:     eAr?"الفئة":eEn?"Category":"Catégorie",
      item:    eAr?"البند":eEn?"Item":"Désignation",
      qty:     eAr?"الكمية":eEn?"Qty":"Qté",
      pu:      eAr?"السعر الوحدوي":eEn?"Unit Price":"Prix unit.",
      tot:     eAr?"المجموع":eEn?"Total":"Total",
      indhC:   eAr?"مساهمة المبادرة الوطنية (85%)":eEn?"INDH Contribution (85%)":"Contribution INDH (85%)",
      holdC:   eAr?"مساهمة الحامل (15%)":eEn?"Holder Contribution (15%)":"Apport porteur (15%)",
      compT:   eAr?"تقرير الامتثال":eEn?"Compliance Report":"Rapport de Conformité",
      score:   eAr?"النقطة الإجمالية":eEn?"Overall Score":"Score global",
      elig:    eAr?`مؤهل للتمويل ✓`:eEn?"ELIGIBLE ✓":"ÉLIGIBLE ✓",
      notEl:   eAr?"يحتاج تعديلات ✗":eEn?"NOT ELIGIBLE ✗":"NON ÉLIGIBLE ✗",
      str:     eAr?"نقاط القوة":eEn?"Strengths":"Points forts",
      recs:    eAr?"التوصيات":eEn?"Recommendations":"Recommandations",
      jury:    eAr?"تقييم اللجنة":eEn?"Jury Evaluation":"Grille Jury",
      ax:      eAr?"محور المبادرة":eEn?"INDH Pillar":"Axe INDH",
      yr:      eAr?"السنة":eEn?"Year":"An",
    };
    const sec = (heading: string, body: string, accent = "#2A5CE0") => body ? `
      <div class="section">
        <h3 style="color:${accent};border-bottom:2px solid ${accent};padding-bottom:6px;margin:24px 0 10px">${heading}</h3>
        <p>${body.replace(/\n/g,"<br>")}</p>
      </div>` : "";
    const html = `<!DOCTYPE html><html lang="${exportLang}" dir="${dir2}">
<head>
<meta charset="utf-8"/>
<title>${proj?.projectName||"IdeaMap"} — ${T.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${font};font-size:13px;color:#10132A;background:#fff;padding:0}
  @page{size:A4;margin:18mm 16mm 18mm 16mm}
  @media print{body{padding:0}.no-print{display:none!important}}
  .header{background:#0A0F2C;color:#fff;padding:28px 32px;margin-bottom:0}
  .header h1{font-size:22px;font-weight:800;color:#2A5CE0;margin-bottom:4px}
  .header p{font-size:12px;color:rgba(255,255,255,.6)}
  .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:18px 32px;background:#F7F8FA;border-bottom:1px solid #E4E7ED}
  .meta-item{display:flex;flex-direction:column}
  .meta-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#5B6178;margin-bottom:2px}
  .meta-value{font-size:13px;font-weight:600;color:#0A0F2C}
  .body{padding:20px 32px 32px}
  .section{margin-bottom:18px;page-break-inside:avoid}
  h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}
  p{font-size:12.5px;line-height:1.75;color:#1C3A5C}
  table{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:10px}
  th{background:#0A0F2C;color:#fff;padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;text-align:${eAr?"right":"left"}}
  td{padding:8px 10px;border-bottom:1px solid #E4E7ED;color:#10132A}
  tr:nth-child(even) td{background:#F7F8FA}
  .tfoot td{background:#0A0F2C!important;color:#fff;font-weight:700}
  .tfoot td:last-child{color:#2A5CE0}
  .score-box{display:inline-block;padding:14px 28px;border-radius:12px;text-align:center;margin-bottom:14px}
  .score-num{font-size:38px;font-weight:800}
  .jury-bar{height:6px;border-radius:3px;background:#E4E7ED;overflow:hidden;margin-top:4px}
  .jury-fill{height:100%;border-radius:3px}
  ul{padding-${eAr?"right":"left"}:16px;margin-top:6px}
  li{font-size:12px;margin-bottom:4px;color:#1C3A5C;line-height:1.6}
  .proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
  .proj-card{background:#EFF6FF;border-radius:8px;padding:14px;text-align:center;border:1px solid #2A5CE055}
  .proj-year{font-size:9px;font-weight:700;color:#5B6178;text-transform:uppercase;margin-bottom:4px}
  .proj-val{font-size:18px;font-weight:800;color:#0A0F2C}
  .btn-print{display:block;margin:20px auto 0;padding:12px 32px;background:#0A0F2C;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:${font}}
  .footer{margin-top:32px;padding-top:12px;border-top:1px solid #E4E7ED;display:flex;justify-content:space-between;align-items:center}
  .footer p{font-size:10px;color:#5B6178}
  .indh-badge{background:#0A0F2C;color:#2A5CE0;font-size:10px;font-weight:700;padding:4px 10px;border-radius:6px}
</style>
</head>
<body>
<div class="header">
  <h1>${proj?.projectName||""}</h1>
  <p>${T.holder}: ${user.name} ${user.profile?.lastName||""} · ${proj?.location||user.profile?.region||""} · INDH Phase 3</p>
</div>
<div class="meta-grid">
  <div class="meta-item"><span class="meta-label">Secteur / القطاع</span><span class="meta-value">${proj?.sector||""}</span></div>
  <div class="meta-item"><span class="meta-label">${T.ax}</span><span class="meta-value">${proj?.pillar||""}</span></div>
  <div class="meta-item"><span class="meta-label">Budget total</span><span class="meta-value">${total.toLocaleString()} MAD</span></div>
  <div class="meta-item"><span class="meta-label">${T.indhC}</span><span class="meta-value">${indhAmt.toLocaleString()} MAD</span></div>
</div>
<div class="body">
${plan ? `
${sec(T.exec, plan.executiveSummary)}
${sec(T.problem, plan.problemStatement)}
${sec(T.sol, plan.solution)}
${sec(T.market, plan.marketAnalysis)}
${sec(T.biz, plan.businessModel)}
${sec(T.impact, plan.socialImpact)}
${sec(T.ops, plan.operationalPlan)}
${sec(T.indh, plan.indh_alignment)}
${plan.risks?.length ? `<div class="section"><h3 style="color:#C0632F;border-bottom:2px solid #C0632F;padding-bottom:6px;margin:24px 0 10px">⚠️ ${T.risks}</h3><ul>${plan.risks.map((r: string)=>`<li>${r}</li>`).join("")}</ul></div>` : ""}
${plan.projections ? `<div class="section"><h3 style="color:#2A5CE0;border-bottom:2px solid #2A5CE0;padding-bottom:6px;margin:24px 0 10px">📈 ${T.proj}</h3><div class="proj-grid">${Object.entries(plan.projections).map(([y,v])=>`<div class="proj-card"><div class="proj-year">${T.yr} ${y.replace("year","")}</div><div class="proj-val">${Number(v).toLocaleString()}</div><div style="font-size:9px;color:#5B6178;margin-top:2px">MAD</div></div>`).join("")}</div></div>` : ""}
` : ""}
${budget?.items?.length ? `
<div class="section" style="page-break-before:always">
<h3 style="color:#2A5CE0;border-bottom:2px solid #2A5CE0;padding-bottom:6px;margin:24px 0 10px">💰 ${T.budT}</h3>
<table><thead><tr>
  <th>${T.cat}</th><th>${T.item}</th><th style="text-align:center">${T.qty}</th>
  <th style="text-align:center">${T.pu}</th><th style="text-align:center">${T.tot}</th>
</tr></thead><tbody>
${budget.items.map((x: any,i: number)=>`<tr><td>${x.category}</td><td>${x.item}</td><td style="text-align:center">${x.quantity}</td><td style="text-align:center">${Number(x.unitPrice||0).toLocaleString()}</td><td style="text-align:center;font-weight:700">${Number(x.total||0).toLocaleString()}</td></tr>`).join("")}
<tr class="tfoot"><td colspan="4">${T.tot}</td><td style="text-align:center">${total.toLocaleString()} MAD</td></tr>
</tbody></table>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
  <div style="background:#0A0F2C;border-radius:10px;padding:14px;text-align:center">
    <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:4px">🏛️ ${T.indhC}</div>
    <div style="font-size:20px;font-weight:800;color:#2A5CE0">${indhAmt.toLocaleString()} MAD</div>
  </div>
  <div style="background:#EFF6FF;border-radius:10px;padding:14px;text-align:center;border:2px solid #2A5CE0">
    <div style="font-size:9px;font-weight:700;color:#5B6178;text-transform:uppercase;margin-bottom:4px">👥 ${T.holdC}</div>
    <div style="font-size:20px;font-weight:800;color:#0A0F2C">${holdAmt.toLocaleString()} MAD</div>
  </div>
</div>
</div>` : ""}
${comp ? `
<div class="section" style="page-break-before:always">
<h3 style="color:#2A5CE0;border-bottom:2px solid #2A5CE0;padding-bottom:6px;margin:24px 0 10px">✅ ${T.compT}</h3>
<div class="score-box" style="background:${comp.eligible?"#0A0F2C":"#FFF0F0"};border:2px solid ${comp.eligible?"#2A5CE0":"#C0632F"}">
  <div class="score-num" style="color:${comp.eligible?"#2A5CE0":"#C0632F"}">${comp.score}</div>
  <div style="font-size:11px;color:${comp.eligible?"rgba(255,255,255,.6)":"#C0632F"};margin-top:2px">/100</div>
  <div style="font-size:12px;font-weight:700;color:${comp.eligible?"#2A5CE0":"#C0632F"};margin-top:4px">${comp.eligible?T.elig:T.notEl}</div>
</div>
${comp.pillar ? `<p style="margin-bottom:10px">📌 ${T.ax}: <strong>${comp.pillar}</strong></p>` : ""}
${comp.juryScore ? `<table><thead><tr><th>${eAr?"المعيار":eEn?"Criterion":"Critère"}</th><th style="text-align:center">${eAr?"الوزن":eEn?"Weight":"Poids"}</th><th style="text-align:center">${eAr?"النقطة":eEn?"Score":"Score"}</th></tr></thead><tbody>${[{k:"impact",l:"Impact social",w:25},{k:"viability",l:"Viabilité",w:20},{k:"relevance",l:"Pertinence territoriale",w:20},{k:"management",l:"Capacité de gestion",w:15},{k:"sustainability",l:"Durabilité",w:10},{k:"innovation",l:"Innovation",w:10}].map(j=>{const sc=comp.juryScore[j.k]||0;const p=Math.round((sc/j.w)*100);return`<tr><td>${j.l}</td><td style="text-align:center">/${j.w}</td><td style="text-align:center"><strong style="color:${p>=70?"#2A5CE0":p>=50?"#F59E0B":"#C0632F"}">${sc}</strong></td></tr>`;}).join("")}</tbody></table>` : ""}
${comp.strengths?.length ? `<div style="margin-top:14px"><h4 style="font-size:11px;font-weight:700;color:#1C7A62;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">💪 ${T.str}</h4><ul>${comp.strengths.map((s: string)=>`<li>${s}</li>`).join("")}</ul></div>` : ""}
${comp.recommendations?.length ? `<div style="margin-top:14px"><h4 style="font-size:11px;font-weight:700;color:#2A5CE0;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">💡 ${T.recs}</h4><ul>${comp.recommendations.map((r: string)=>`<li>${r}</li>`).join("")}</ul></div>` : ""}
</div>` : ""}
<div class="footer">
  <p>© IdeaMap 2026 · ideamaponline.org · ${new Date().toLocaleDateString(exportLang==="ar"?"ar-MA":exportLang==="fr"?"fr-FR":"en-GB")}</p>
  <span class="indh-badge">INDH Phase 3</span>
</div>
</div>
<button class="btn-print no-print" onclick="window.print()">
  🖨️ ${eAr?"طباعة / حفظ كـ PDF":eEn?"Print / Save as PDF":"Imprimer / Enregistrer en PDF"}
</button>
</body></html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };

  const dlPPTX = async (type: "pitch" | "jury", exportLang: string = dlLang) => {
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const prs = new (PptxGenJS as any)();
      prs.layout = "LAYOUT_16x9";
      const NAVY = "0F2233"; const YELLOW = "FFB703"; const WHITE = "FFFFFF";
      const total = budget?.items?.reduce((s: number, x: any) => s + (x.total || 0), 0) || 0;
      const indh = budget?.indhContribution || Math.round(total * 0.85);
      const bene = budget?.beneficiaryContribution || Math.round(total * 0.15);

      const isAr = exportLang === "ar";
      const isEn = exportLang === "en";
      const T = {
        problem: isAr?"الإشكالية والحل":isEn?"Problem & Solution":"Problème & Solution",
        model: isAr?"النموذج الاقتصادي والأثر":isEn?"Business Model & Impact":"Modèle Économique & Impact",
        budget: isAr?"ميزانية المبادرة الوطنية":isEn?"INDH Budget":"Budget INDH",
        steps: isAr?"الخطوات التالية":isEn?"Next Steps":"Étapes Suivantes",
        summary: isAr?"الملخص التنفيذي":isEn?"Executive Summary":"Résumé Exécutif",
        plan: isAr?"خطة الأعمال":isEn?"Business Plan":"Plan d'Affaires",
        impact: isAr?"الأثر الاجتماعي والمحاذاة":isEn?"Social Impact & INDH Alignment":"Impact Social & Alignement INDH",
        budgetPrev: isAr?"الميزانية التفصيلية":isEn?"Detailed Budget":"Budget Prévisionnel",
        compliance: isAr?"الامتثال للمبادرة":isEn?"INDH Compliance":"Conformité INDH",
        docs: isAr?"الوثائق المطلوبة":isEn?"Required Documents":"Documents Requis",
        submission: isAr?"مراحل تقديم الملف":isEn?"Submission Steps":"Étapes de Soumission",
        holder: isAr?"الحامل":isEn?"Holder":"Porteur",
        eligible: isAr?"مؤهل للتمويل ✓":isEn?"ELIGIBLE ✓":"ÉLIGIBLE ✓",
        notElig: isAr?"يحتاج تعديلات ✗":isEn?"NOT ELIGIBLE ✗":"NON ÉLIGIBLE ✗",
        totalLabel: isAr?"المجموع":"Total",
        indhLabel: isAr?"المبادرة (85%)":"INDH (85%)",
        holdLabel: isAr?"مساهمة الحامل (15%)":isEn?"Holder (15%)":"Apport porteur (15%)",
        stepsText: isAr
          ? "1. إعداد الملف الكامل للمبادرة الوطنية\n2. جمع الوثائق المطلوبة\n3. إيداع الملف لدى مديرية العمل الاجتماعي\n4. الاستماع أمام لجنة التحكيم\n5. التوقيع على اتفاقية المبادرة الوطنية"
          : isEn
            ? "1. Finalize the INDH application file\n2. Gather all required documents\n3. Submit to the Division of Social Action (DAS)\n4. Present to INDH selection jury\n5. Sign the INDH convention"
            : "1. Finaliser le dossier INDH\n2. Rassembler tous les documents requis\n3. Déposer auprès du CPDH\n4. Passage devant le jury de sélection\n5. Signature de la convention INDH",
        submissionText: isAr
          ? "1. إيداع الملف لدى مديرية العمل الاجتماعي (DAS)\n2. الحصول على وصل الإيداع\n3. دراسة الملف من طرف اللجنة الإقليمية (CPDH)\n4. المثول أمام لجنة تحكيم المبادرة الوطنية\n5. إشعار بالقرار\n6. التوقيع على الاتفاقية وانطلاق المشروع"
          : isEn
            ? "1. Submit file to Division of Social Action (DAS)\n2. Receive deposit receipt\n3. Review by local CPDH committee\n4. Present before INDH jury\n5. Decision notification\n6. Sign convention and start project"
            : "1. Déposer le dossier à la Division de l'Action Sociale (DAS)\n2. Récépissé de dépôt délivré\n3. Instruction par le CPDH local\n4. Passage devant le jury INDH\n5. Notification de décision\n6. Signature de la convention et démarrage",
        catLabel: isAr?"الفئة":isEn?"Category":"Catégorie",
        itemLabel: isAr?"البند":isEn?"Item":"Désignation",
        totalCol: isAr?"المجموع (درهم)":isEn?"Total (MAD)":"Total (MAD)",
        criteriaLabel: isAr?"المعيار":isEn?"Criteria":"Critère",
        weightLabel: isAr?"الوزن":isEn?"Weight":"Poids",
        scoreLabel: isAr?"النقطة":isEn?"Score":"Score",
        docLabel: isAr?"الوثيقة":isEn?"Document":"Document",
        statusLabel: isAr?"الحالة":isEn?"Status":"Statut",
        ready: isAr?"✓ جاهز":isEn?"✓ Ready":"✓ Prêt",
        pending: isAr?"⏳ قيد الإعداد":isEn?"⏳ Pending":"⏳ En attente",
        docsCount: isAr
          ? `${Object.values(docs).filter(Boolean).length}/${DOCS.length} وثيقة جاهزة`
          : `${Object.values(docs).filter(Boolean).length}/${DOCS.length} ${isEn?"documents ready":"documents préparés"}`,
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
        s.addText(T.impact, {x:0.4,y:0.2,w:9.1,h:0.7,fontSize:24,color:NAVY,bold:true,fontFace:"Arial",align:isAr?"right":"left"});
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

  const [logoStyle, setLogoStyle] = useState(0); // 0=circle, 1=badge, 2=shield

  const genLogo = async () => {
    setLogoGenerating(true);
    const projInfo = {
      name: proj?.projectName,
      sector: proj?.sector,
      location: proj?.location,
      beneficiaries: proj?.targetProfile || proj?.beneficiaries,
      pillar: proj?.pillar,
    };
    const r = await ai(
      [{role:"user", content:`Projet INDH Maroc: ${JSON.stringify(projInfo)}`}],
      `Tu es un directeur artistique expert en branding pour micro-entrepreneurs marocains. Tu crées des identités visuelles simples, fortes et culturellement ancrées au Maroc.

Analyse le projet et crée une identité visuelle complète. Règles:
1. INITIALES: 2-3 lettres tirées du nom du projet (initiales du nom commercial).
2. COULEURS: couleur principale chaleureuse qui évoque le secteur et le Maroc (ex: artisanat→ocre terracotta, cuisine→orange chaud, agriculture→vert olive, coiffure→violet élégant, numérique→bleu électrique). Couleur secondaire harmonieuse.
3. COULEUR TEXTE: contraste parfait avec la couleur principale (blanc #FFFFFF si couleur foncée, marine #0F2233 si couleur claire).
4. ICÔNE: emoji qui représente EXACTEMENT le secteur d'activité (ex: ✂️ pour coiffure, 🍞 pour boulangerie, 🧵 pour couture, 🌿 pour agriculture, 💻 pour numérique).
5. SLOGAN: 3-5 mots percutants en ${LL} qui résonnent au Maroc — simple, mémorable, en rapport avec le bénéfice client (ex: "La qualité à votre porte", "Savoir-faire ancestral", "Votre beauté, notre passion").
6. STYLE DESCRIPTION: courte phrase décrivant le positionnement (ex: "Artisanat traditionnel haut de gamme", "Service de proximité moderne").

JSON UNIQUEMENT sans markdown:
{"initials":"2-3 lettres","color1":"#hexcode couleur principale","color2":"#hexcode couleur secondaire","colorText":"#FFFFFF ou #0F2233 selon contraste","icon":"emoji secteur précis","tagline":"slogan 3-5 mots en ${LL}","styleDesc":"positionnement en 4-6 mots en ${LL}","accentColor":"#hexcode couleur d'accent pour détails"}`,
      "json"
    );
    const concept = parseJ(r);
    if (concept) { setLogo({type:"generated", concept}); setLogoStyle(0); }
    setLogoGenerating(false);
  };

  const dlLogo = () => {
    if (!logo?.concept) return;
    const c = logo.concept;
    const ct = c.colorText || "#FFFFFF";
    const tag = (c.tagline || "").slice(0, 24).toUpperCase();
    const ini = (c.initials || "?").slice(0, 3);
    const ico = c.icon || "💡";
    // Helper: 8-pointed star points string (300×300 canvas)
    const star = (ox: number, oy: number, R: number, r: number): string => {
      const pts: string[] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI / 8) - Math.PI / 2;
        const rad = i % 2 === 0 ? R : r;
        pts.push(`${(ox + rad * Math.cos(a)).toFixed(1)},${(oy + rad * Math.sin(a)).toFixed(1)}`);
      }
      return pts.join(" ");
    };
    const svgs = [
      // Style 0 — Gradient Burst
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="g0" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.color1}"/>
      <stop offset="100%" stop-color="${c.color2||c.color1}bb"/>
    </linearGradient>
    <clipPath id="cp0"><rect width="300" height="300" rx="54" ry="54"/></clipPath>
  </defs>
  <rect width="300" height="300" rx="54" fill="url(#g0)"/>
  ${[20,40,60,80,100,120,140].map((ang,i) => { const rad = ang*Math.PI/180; return `<line x1="300" y1="0" x2="${(300+420*Math.cos(rad)).toFixed(0)}" y2="${(420*Math.sin(rad)).toFixed(0)}" stroke="${ct}" stroke-width="7" opacity="0.07" clip-path="url(#cp0)"/>`; }).join("")}
  <ellipse cx="60" cy="262" rx="195" ry="114" fill="${ct}" opacity="0.08" clip-path="url(#cp0)"/>
  <text x="150" y="124" text-anchor="middle" font-size="78">${ico}</text>
  <rect x="60" y="141" width="180" height="5" rx="3" fill="${ct}" opacity="0.35"/>
  <text x="150" y="205" text-anchor="middle" font-size="86" font-weight="900" fill="${ct}" font-family="Arial Black,sans-serif">${ini}</text>
  <rect x="24" y="252" width="252" height="39" rx="19" fill="${ct}" opacity="0.15"/>
  <text x="150" y="278" text-anchor="middle" font-size="19" fill="${ct}" opacity="0.9" font-family="Arial,sans-serif" font-weight="700" letter-spacing="2">${tag}</text>
</svg>`,
      // Style 1 — Moroccan Geometric Star
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="${c.color2||"#F0F0F0"}" opacity="0.12"/>
  <polygon points="${star(150, 150, 138, 66)}" fill="${c.color1}"/>
  <polygon points="${star(150, 150, 132, 62)}" fill="none" stroke="${ct}" stroke-width="2" opacity="0.2"/>
  <circle cx="150" cy="150" r="69" fill="${c.color2||c.color1}"/>
  <circle cx="150" cy="150" r="66" fill="none" stroke="${ct}" stroke-width="1" opacity="0.25"/>
  <text x="150" y="133" text-anchor="middle" font-size="42">${ico}</text>
  <text x="150" y="187" text-anchor="middle" font-size="52" font-weight="900" fill="${ct}" font-family="Arial Black,sans-serif">${ini}</text>
  <circle cx="36" cy="36" r="10" fill="${c.color1}" opacity="0.55"/>
  <circle cx="264" cy="36" r="10" fill="${c.color1}" opacity="0.55"/>
  <circle cx="264" cy="264" r="10" fill="${c.color1}" opacity="0.55"/>
  <circle cx="36" cy="264" r="10" fill="${c.color1}" opacity="0.55"/>
  <text x="150" y="291" text-anchor="middle" font-size="17" fill="${c.color1}" opacity="0.85" font-family="Arial,sans-serif" font-weight="700" letter-spacing="1">${tag}</text>
</svg>`,
      // Style 2 — Dynamic Diagonal Split
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <clipPath id="cpr"><rect width="300" height="300" rx="42" ry="42"/></clipPath>
    <clipPath id="cpa"><polygon points="0,0 300,0 0,300"/></clipPath>
    <clipPath id="cpb"><polygon points="315,-15 315,315 -15,315"/></clipPath>
  </defs>
  <rect width="300" height="300" rx="42" fill="${c.color1}"/>
  <polygon points="315,-15 315,315 -15,315" fill="${c.color2||c.color1}99" clip-path="url(#cpr)"/>
  <line x1="-15" y1="315" x2="315" y2="-15" stroke="#FFFFFF" stroke-width="7" opacity="0.18" clip-path="url(#cpr)"/>
  <text x="100" y="163" text-anchor="middle" font-size="114" font-weight="900" fill="${ct}" font-family="Arial Black,sans-serif" clip-path="url(#cpa)" opacity="0.95">${ini[0]||"?"}</text>
  <text x="207" y="225" text-anchor="middle" font-size="84" clip-path="url(#cpb)">${ico}</text>
  <circle cx="150" cy="150" r="16" fill="#FFFFFF" opacity="0.9"/>
  <text x="150" y="282" text-anchor="middle" font-size="17" fill="${ct}" opacity="0.85" font-family="Arial,sans-serif" font-weight="700" letter-spacing="3" clip-path="url(#cpr)">${tag}</text>
</svg>`,
    ];
    const svg = svgs[logoStyle];
    const blob = new Blob([svg], {type:"image/svg+xml"});
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `Logo_${(proj?.projectName||"IdeaMap").replace(/\s+/g,"_")}.svg`,
    });
    a.click();
  };

  const INDH_CTX = `CONTEXTE INDH PHASE 3 MAROC — DONNÉES TERRAIN RÉELLES:
FINANCEMENT: Subvention max 100 000 MAD. INDH couvre 85% (max 85 000 MAD), le porteur apporte 15% en espèces ou en nature (matériel, local, travail valorisé). Pas de remboursement — c'est une subvention à fonds perdus.
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
RÈGLE ABSOLUE: entrepreneuriat individuel uniquement. Ne jamais suggérer coopérative ou GIE.`;

  const startChat = async () => {
    if (!idea.trim()) return;
    // Show idea text immediately as a placeholder brief so the card appears during loading
    const ideaPreview = idea.trim().replace(/\n/g, " ").slice(0, 200);
    setBusy(true); setSuggestions([]); setBrief(ideaPreview); setCurrentQ(""); setStep("dialogue");
    const arNote = lang === "ar" ? "\nمهم جداً: استخدم العربية الفصحى السليمة والبسيطة. جمل قصيرة جداً. لا دارجة مغربية." : "";
    const r = await ai([{role: "user", content: lang === "ar" ? `فكرتي: ${idea}` : `Mon idée: ${idea}`}],
      `Tu es le Conseiller INDH Phase 3 Maroc — expert terrain qui connaît bien les réalités des porteurs marocains.
${INDH_CTX}
Le porteur vient de partager son idée. Fais 2 choses:
1. BRIEF: résume en 1-2 phrases MAX ce que tu as compris du projet (secteur + zone si mentionnée). MAX 25 mots.
2. QUESTION: pose UNE question très courte sur QUI va bénéficier — critère "impact social" (25 pts jury). MAX 12 mots.
3. SUGGESTIONS: 3 profils de bénéficiaires RÉELS et SPÉCIFIQUES au Maroc. Jamais coopérative/GIE.${arNote}

Format STRICT — respecte EXACTEMENT ces 3 lignes:
BRIEF: [1-2 phrases max en ${LL} — secteur + zone]
QUESTION: [question directe en ${LL} — max 12 mots]
SUGGESTIONS: [profil A en ${LL}] | [profil B en ${LL}] | [profil C en ${LL}]`,
      "dialogue");
    const { brief: b, question, suggs } = parseQS(r);
    setBrief(b || ideaPreview); // keep idea preview as fallback if AI doesn't return a brief
    setCurrentQ(question);
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
    const questionArc: Record<number, string> = {
      2: `Q${qN} — PROBLÈME LOCAL: Pose une question TRÈS courte sur le problème concret dans cette zone (chômage, manque de service, produit introuvable). MAX 12 mots. BRIEF: rappelle ce que tu as compris des bénéficiaires. 3 SUGGESTIONS: problèmes locaux précis au Maroc (ex: "Pas de salon dans le douar", "40% jeunes sans emploi", "Aucun atelier à 30km").`,
      3: `Q${qN} — REVENU: Pose une question TRÈS courte sur le canal de vente et les prix. MAX 12 mots. BRIEF: synthèse bénéficiaires + problème. 3 SUGGESTIONS: canaux concrets marocains (ex: "Souk hebdomadaire + WhatsApp", "Commandes livraison quartier", "Épiceries en dépôt-vente").`,
      4: `Q${qN} — EXPÉRIENCE: Pose une question TRÈS courte sur la compétence/expérience du porteur. MAX 12 mots. BRIEF: synthèse projet jusqu'ici. 3 SUGGESTIONS: savoir-faire locaux valorisants (ex: "5 ans couture à domicile", "Appris avec ma mère artisane", "Formation OFPPT 6 mois").`,
    };
    const arcInstruction = questionArc[qN] || `Q${qN}: Pose une question courte sur pertinence territoriale ou durabilité après INDH. MAX 12 mots. BRIEF: ce que tu as compris. 3 SUGGESTIONS réalistes maroc.`;

    const r = await ai(all.map((m: any) => ({role: m.role, content: m.content})),
      `Tu es le Conseiller INDH Phase 3 Maroc — expert terrain, tu connais les vrais porteurs marocains.
${INDH_CTX}
Idée originale: "${idea}". ${arcInstruction}${arNote}
${last
  ? `Maintenant analyse TOUTE la conversation et construis le profil projet le plus PRÉCIS possible.
Retourne UNIQUEMENT ce JSON valide sans markdown ni texte autour:
{"projectName":"nom commercial accrocheur en ${LL}","sector":"secteur INDH exact (ex: Artisanat traditionnel)","legalStructure":"porteur individuel","location":"ville/commune/douar mentionné — si non précisé: région du profil","beneficiaries":N,"targetProfile":"description précise des bénéficiaires (femmes, jeunes, agriculteurs...)","localProblem":"problème local concret résolu par le projet","revenueModel":"comment le porteur va gagner de l'argent concrètement","holderExperience":"compétence/expérience du porteur","activities":["activité clé 1","activité clé 2","activité clé 3"],"strengths":["force SPÉCIFIQUE 1 alignée jury INDH","force SPÉCIFIQUE 2"],"estimatedBudget":N,"pillar":"axe INDH Phase 3 le plus pertinent"}`
  : `Format STRICT — respecte EXACTEMENT ces 3 lignes:
BRIEF: [1-2 phrases max en ${LL} qui synthétisent ce que tu as retenu jusqu'ici — max 25 mots]
QUESTION: [question directe en ${LL} — max 12 mots]
SUGGESTIONS: [réponse A en ${LL}] | [réponse B en ${LL}] | [réponse C en ${LL}]`}`,
      last ? "json" : "dialogue");
    if (last) {
      setBrief(""); setCurrentQ(""); setSuggestions([]);
      setMsgs((p: any[]) => [...p, {role: "assistant", content: lang === "ar" ? "✅ تم تحليل مشروعك بنجاح!" : lang === "fr" ? "✅ Analyse complète !" : "✅ Analysis complete!"}]);
      const p = parseJ(r); if (p) setProj(p);
      setTimeout(() => setStep("profile"), 1000);
    } else {
      const { brief: b, question, suggs } = parseQS(r);
      setBrief(b);
      setCurrentQ(question);
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
{"executiveSummary":"3-4 phrases percutantes pour le jury: problème local chiffré + solution + bénéficiaires précis + CA mensuel attendu","problemStatement":"problème LOCAL précis avec statistiques marocaines réelles (HCP, INDH, etc.) — citation de la zone géographique","solution":"solution concrète, pas à pas, avec les équipements spécifiques achetés et leur utilisation","marketAnalysis":"clientèle cible nommée précisément, taille du marché local estimée en MAD/semaine, concurrents existants et avantage différentiel","businessModel":"prix de vente précis en MAD, volume clients/semaine, CA mensuel estimé, charges fixes mensuelles, marge nette estimée, mois de rentabilité","socialImpact":"nombre EXACT de bénéficiaires directs (femmes/jeunes/familles), revenu supplémentaire mensuel estimé en MAD par bénéficiaire, impact sur la vie quotidienne","operationalPlan":"calendrier détaillé: Mois 1 (achat équipements, aménagement local) → Mois 2 (formation, test produits) → Mois 3 (1ers clients) → Mois 6 (objectif X clients, CA Y MAD) → Mois 12 (CA cible atteint)","indh_alignment":"lien explicite avec l'axe INDH choisi + score estimé sur chaque critère jury avec justification","risks":["Risque commercial: [risque spécifique au secteur au Maroc] → Solution: [action concrète]","Risque financier: [risque précis] → Solution: [mesure préventive]","Risque opérationnel: [risque précis] → Solution: [plan B concret]"],"projections":{"year1":N,"year2":N,"year3":N}}`,
        "json"),
      ai([{role: "user", content: `Projet INDH: ${projCtx}`}],
        `Tu es un expert financier INDH Phase 3 Maroc qui connaît les prix du marché marocain en 2025.
${INDH_CTX}
Génère un budget prévisionnel PRÉCIS et JUSTIFIÉ. Total MAXIMUM 100 000 MAD.${arQuality}

RÈGLES IMPÉRATIVES:
1. PRIX RÉELS DU MARCHÉ MAROCAIN 2025: utilise les vrais prix (ex: machine à coudre industrielle Singer 5 500 MAD, four à pain professionnel 18 000 MAD, tablette Samsung 1 200 MAD, location local aménagement 15 000 MAD, formation OFPPT 3 500 MAD).
2. DÉSIGNATIONS PRÉCISES: jamais "équipement divers" — toujours la désignation exacte (ex: "Machine à coudre industrielle Brother DB2-B737" ou "Réfrigérateur vitrine 200L Beko").
3. CATÉGORIES COMPLÈTES: inclure TOUTES les catégories nécessaires selon le secteur — Équipements, Aménagement/Mobilier, Matières premières initiales, Formation/Apprentissage, Frais d'immatriculation, Fonds de roulement (3 mois), Communication (enseigne, réseaux sociaux).
4. QUANTITÉS RÉALISTES: basées sur un démarrage réel — pas en sous-estimant ni en gonflant.
5. Assure-toi que 85% = contribution INDH et 15% = apport porteur. Total doit être entre 50 000 et 100 000 MAD.

Retourne UNIQUEMENT ce JSON valide sans markdown:
{"items":[{"category":"catégorie","item":"désignation exacte avec marque/modèle si pertinent en ${LL}","quantity":N,"unitPrice":N,"total":N}],"indhContribution":N,"beneficiaryContribution":N}`,
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
- Éligible si score ≥ 60 ET secteur INDH ET budget ≤ 100 000 MAD.
- Ne jamais mettre 100/100 — le jury est rigoureux.

Les FORCES doivent citer des éléments SPÉCIFIQUES du dossier (pas génériques).
Les RECOMMANDATIONS doivent être des ACTIONS IMMÉDIATES que le porteur peut faire avant de déposer (ex: "Obtenir une lettre de soutien de la commune", "Préciser le nombre exact de clientes par semaine", "Ajouter une formation OFPPT de 3 jours au budget").

Retourne UNIQUEMENT ce JSON valide sans markdown:
{"eligible":true/false,"score":N,"pillar":"axe INDH Phase 3 exact en ${LL}","strengths":["force SPÉCIFIQUE tirée du dossier 1","force SPÉCIFIQUE 2","force SPÉCIFIQUE 3"],"weaknesses":["faiblesse précise qui coûte des points jury 1","faiblesse 2"],"recommendations":["action immédiate et concrète 1 en ${LL}","action 2","action 3"],"juryScore":{"impact":N,"viability":N,"relevance":N,"management":N,"sustainability":N,"innovation":N}}`,
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
    <div style={{minHeight: "100vh", background: CR, fontFamily: ff(lang), direction: dir as "rtl" | "ltr"}}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <Header lang={lang} user={user} onLogout={onLogout} t={t}/>
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
                  {indhBtn(busy ? t.loading : t.next, startChat,
                    {opacity: (!enough || busy) ? .5 : 1,
                     background: enough && !busy ? `linear-gradient(135deg,${Y},${YD})` : undefined})}
                </>
              );
            })()}
          </Card>
        )}

        {/* ── DIALOGUE ── */}
        {step === "dialogue" && (
          <Card>
            {/* Header */}
            <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px"}}>
              <AdvisorAvatar size={40}/>
              <div style={{flex: 1}}>
                <div style={{fontSize: "10px", color: Y, fontWeight: "700", textTransform: "uppercase",
                  letterSpacing: ".6px", marginBottom: "2px"}}>
                  {lang === "ar" ? "مستشار المبادرة الوطنية" : lang === "fr" ? "Conseiller INDH" : "INDH Advisor"}
                </div>
                <h2 style={{fontSize: "17px", fontWeight: "700", color: ND}}>{t.dialogT}</h2>
              </div>
            </div>

            {/* Idea reminder pill */}
            {idea && <div style={{display:"flex", alignItems:"flex-start", gap:"7px", marginBottom:"14px",
              padding:"9px 12px", background:CR, borderRadius:"10px", border:`1px solid ${CD}`}}>
              <span style={{fontSize:"15px", flexShrink:0}}>💡</span>
              <p style={{fontSize:"11px", color:GR, lineHeight:"1.55", margin:0,
                direction:dir as "rtl"|"ltr", maxHeight:"2.8em", overflow:"hidden"}}>
                {idea.trim()}
              </p>
            </div>}

            {/* Progress */}
            <div style={{marginBottom: "16px"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
                <span style={{fontSize: "11px", color: GR, fontWeight: "600"}}>{t.q} {qN} {t.of} {MAX_Q}</span>
                <span style={{fontSize: "11px", color: N, fontWeight: "800"}}>{Math.round((qN / MAX_Q) * 100)}%</span>
              </div>
              <PBar pct={(qN / MAX_Q) * 100}/>
            </div>

            {/* Brief — always visible once set (shows during loading and after AI responds) */}
            {brief && (
              <div className="im-rise" style={{marginBottom: "14px", borderRadius: "14px",
                border: `2px solid ${Y}`, overflow: "hidden"}}>
                <div style={{display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", background: Y}}>
                  <AdvisorAvatar size={32}/>
                  <span style={{fontSize: "11px", fontWeight: "800", color: ND, textTransform: "uppercase",
                    letterSpacing: ".5px"}}>
                    {busy
                      ? (lang === "ar" ? "جاري تحليل مشروعك..." : lang === "fr" ? "Analyse de votre projet en cours..." : "Analyzing your project...")
                      : (lang === "ar" ? "إليك ما فهمته من مشروعك :" : lang === "fr" ? "Voici ce que j'ai compris de votre projet :" : "Here's what I understood about your project:")}
                  </span>
                </div>
                <div style={{padding: "13px 16px", background: WH}}>
                  <p style={{fontSize: "14px", color: ND, lineHeight: "1.7", margin: 0, fontWeight: "500",
                    direction: dir as "rtl"|"ltr"}}>{brief}</p>
                </div>
              </div>
            )}

            {/* Busy state */}
            {busy && (
              <div style={{display: "flex", alignItems: "center", gap: "10px",
                padding: "14px", background: YL, borderRadius: "13px", marginBottom: "14px"}}>
                <AdvisorAvatar size={28}/>
                <Dots/>
              </div>
            )}

            {/* Current question card */}
            {currentQ && !busy && (
              <div className="im-rise" style={{padding: "16px 18px", background: ND, borderRadius: "14px",
                marginBottom: "14px", border: `2px solid ${Y}44`}}>
                <p style={{fontSize: "15px", fontWeight: "700", color: WH, lineHeight: "1.55",
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

            {/* Text input for custom answer */}
            <div style={{display: "flex", gap: "8px"}}>
              <input value={inp} onChange={e => !busy && setInp(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()} disabled={busy}
                placeholder={busy
                  ? (lang==="ar"?"المستشار يفكر...":lang==="fr"?"Le conseiller réfléchit...":"Advisor is thinking...")
                  : (lang==="ar"?"أو اكتب إجابتك هنا...":lang==="fr"?"Ou écrivez votre réponse...":"Or type your own answer...")}
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
              {budget?.items?.length > 0 ? (<div style={{marginBottom: "16px"}}>
                {/* Desktop table */}
                <div className="budget-tbl" style={{overflowX: "auto"}}>
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
                </div>
                {/* Mobile cards */}
                <div className="budget-cards" style={{display: "none", flexDirection: "column", gap: "8px"}}>
                  {budget.items.map((x: any, i: number) => (
                    <div key={i} style={{padding: "12px 14px", background: i % 2 === 0 ? WH : CR,
                      borderRadius: "11px", border: `1px solid ${CD}`}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px"}}>
                        <span style={{fontSize: "10px", fontWeight: "700", color: Y, textTransform: "uppercase", letterSpacing: ".3px"}}>{x.category}</span>
                        <span style={{fontSize: "14px", fontWeight: "800", color: ND}}>{Number(x.total || 0).toLocaleString()} <span style={{fontSize: "10px", fontWeight: "500"}}>MAD</span></span>
                      </div>
                      <div style={{fontSize: "13px", color: ND, marginBottom: "4px"}}>{x.item}</div>
                      <div style={{fontSize: "11px", color: GR}}>{x.quantity} × {Number(x.unitPrice || 0).toLocaleString()} MAD</div>
                    </div>
                  ))}
                  <div style={{padding: "12px 14px", background: ND, borderRadius: "11px",
                    display: "flex", justifyContent: "space-between"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: WH}}>{t.total}</span>
                    <span style={{fontSize: "15px", fontWeight: "800", color: Y}}>{total.toLocaleString()} MAD</span>
                  </div>
                </div>
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
              {backBtn()}
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

            {/* ── Logo options: upload or AI generate ── */}
            {!logo && (
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px"}}>
                <label style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  padding:"24px 14px", borderRadius:"14px", border:`2px dashed ${CD}`,
                  cursor:"pointer", background:CR, gap:"8px", transition:"border-color .2s"}}>
                  <span style={{fontSize:"26px"}}>📁</span>
                  <span style={{fontSize:"12px", fontWeight:"600", color:N}}>
                    {lang==="ar"?"رفع شعار موجود":lang==="fr"?"Importer mon logo":"Upload existing logo"}
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
                    padding:"24px 14px", borderRadius:"14px", border:`2px dashed ${Y}`,
                    cursor:logoGenerating?"wait":"pointer", background:YL, gap:"8px",
                    opacity:logoGenerating?0.7:1, transition:"all .2s"}}>
                  <span style={{fontSize:"26px"}}>{logoGenerating?"⏳":"✨"}</span>
                  <span style={{fontSize:"12px", fontWeight:"700", color:ND}}>
                    {logoGenerating
                      ? (lang==="ar"?"جاري الإنشاء...":lang==="fr"?"Création en cours...":"Creating...")
                      : (lang==="ar"?"توليد هوية بالذكاء":lang==="fr"?"Créer avec l'IA":"Generate with AI")}
                  </span>
                  <span style={{fontSize:"10px", color:N}}>
                    {lang==="ar"?"3 تصاميم للاختيار":lang==="fr"?"3 styles au choix":"3 styles to pick"}
                  </span>
                </button>
              </div>
            )}

            {/* ── Loading state ── */}
            {logoGenerating && (
              <div style={{textAlign:"center", padding:"20px 0 10px"}}>
                <div style={{display:"flex", justifyContent:"center", marginBottom:"8px"}}><Dots/></div>
                <p style={{fontSize:"12px", color:GR}}>
                  {lang==="ar"?"الذكاء الاصطناعي يبتكر هويتك البصرية...":lang==="fr"?"L'IA crée votre identité visuelle...":"AI is designing your brand identity..."}
                </p>
              </div>
            )}

            {/* ── Generated logo: 3 innovative style variants ── */}
            {logo && logo.type === "generated" && logo.concept && !logoGenerating && (() => {
              const c = logo.concept;
              const ct = c.colorText || "#FFFFFF";
              const styleNames = lang==="ar"
                ? ["تدرج لوني","نجمة مغربية","انقسام ديناميكي"]
                : lang==="fr"
                ? ["Dégradé","Étoile Marocaine","Split Dynamique"]
                : ["Gradient Burst","Moroccan Star","Dynamic Split"];

              // Compute 8-pointed star polygon points (zellige-inspired)
              const starPoints = (ox: number, oy: number, R: number, r: number): string => {
                const pts: string[] = [];
                for (let i = 0; i < 16; i++) {
                  const angle = (i * Math.PI / 8) - Math.PI / 2;
                  const rad = i % 2 === 0 ? R : r;
                  pts.push(`${(ox + rad * Math.cos(angle)).toFixed(1)},${(oy + rad * Math.sin(angle)).toFixed(1)}`);
                }
                return pts.join(" ");
              };

              const renderVariant = (idx: number, size: number) => {
                const s = size; const cx = s/2; const cy = s/2;
                const uid = `lv${idx}${s}`; // unique id per variant+size to avoid SVG id conflicts

                // ── Style 0: Gradient Burst ──
                // Diagonal gradient background, bold icon large top, initials bottom,
                // decorative radial lines emanating from top-right like a sunburst
                if (idx === 0) return (
                  <svg key={uid} width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <defs>
                      <linearGradient id={`g${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={c.color1}/>
                        <stop offset="100%" stopColor={c.color2||c.color1+"bb"}/>
                      </linearGradient>
                      <clipPath id={`cp${uid}`}>
                        <rect width={s} height={s} rx={s*0.18} ry={s*0.18}/>
                      </clipPath>
                    </defs>
                    {/* Background */}
                    <rect width={s} height={s} rx={s*0.18} ry={s*0.18} fill={`url(#g${uid})`}/>
                    {/* Sunburst rays from top-right corner */}
                    {[20,40,60,80,100,120,140].map((angle, i) => {
                      const rad = angle * Math.PI / 180;
                      const x2 = cx*2 + s*1.4 * Math.cos(rad);
                      const y2 = -s*0.2 + s*1.4 * Math.sin(rad);
                      return <line key={i} x1={s} y1={0} x2={x2} y2={y2}
                        stroke={ct} strokeWidth={s*0.025} opacity="0.07" clipPath={`url(#cp${uid})`}/>;
                    })}
                    {/* Inner wave blob */}
                    <ellipse cx={cx*0.4} cy={cy*1.75} rx={s*0.65} ry={s*0.38}
                      fill={ct} opacity="0.08" clipPath={`url(#cp${uid})`}/>
                    {/* Large icon */}
                    <text x={cx} y={cy*0.82} textAnchor="middle" fontSize={s*0.26}>{c.icon||"💡"}</text>
                    {/* Divider line */}
                    <rect x={s*0.2} y={cy*0.94} width={s*0.6} height={s*0.018} rx={s*0.01}
                      fill={ct} opacity="0.35"/>
                    {/* Initials */}
                    <text x={cx} y={cy*1.3} textAnchor="middle" fontSize={s*0.29} fontWeight="900"
                      fill={ct} fontFamily="Arial Black,sans-serif">{(c.initials||"?").slice(0,3)}</text>
                    {/* Tagline pill */}
                    <rect x={s*0.08} y={s*0.84} width={s*0.84} height={s*0.13} rx={s*0.065}
                      fill={ct} opacity="0.15"/>
                    <text x={cx} y={s*0.937} textAnchor="middle" fontSize={s*0.065} fill={ct}
                      opacity="0.9" fontFamily="Arial,sans-serif" fontWeight="700" letterSpacing="0.8">
                      {(c.tagline||"").slice(0,20).toUpperCase()}
                    </text>
                  </svg>
                );

                // ── Style 1: Moroccan Geometric Star (zellige) ──
                // 8-pointed star as outer shape, inner circle with initials,
                // decorative corner dots echoing zellige tilework
                if (idx === 1) return (
                  <svg key={uid} width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <defs>
                      <clipPath id={`cp1${uid}`}><rect width={s} height={s}/></clipPath>
                    </defs>
                    {/* Subtle tiled background */}
                    <rect width={s} height={s} fill={c.color2||"#F0F0F0"} opacity="0.12"/>
                    {/* Outer 8-pointed star */}
                    <polygon points={starPoints(cx, cy, s*0.46, s*0.22)}
                      fill={c.color1} clipPath={`url(#cp1${uid})`}/>
                    {/* Second inner star ring (decoration) */}
                    <polygon points={starPoints(cx, cy, s*0.44, s*0.2)}
                      fill="none" stroke={ct} strokeWidth="0.8" opacity="0.2"
                      clipPath={`url(#cp1${uid})`}/>
                    {/* Inner circle */}
                    <circle cx={cx} cy={cy} r={s*0.23} fill={c.color2||c.color1}/>
                    <circle cx={cx} cy={cy} r={s*0.22} fill="none" stroke={ct} strokeWidth="1" opacity="0.25"/>
                    {/* Icon above initials */}
                    <text x={cx} y={cy*0.82} textAnchor="middle" fontSize={s*0.18}>{c.icon||"💡"}</text>
                    {/* Initials */}
                    <text x={cx} y={cy*1.24} textAnchor="middle" fontSize={s*0.22} fontWeight="900"
                      fill={ct} fontFamily="Arial Black,sans-serif">{(c.initials||"?").slice(0,3)}</text>
                    {/* Decorative corner dots (zellige accent) */}
                    {[[s*0.12,s*0.12],[s*0.88,s*0.12],[s*0.88,s*0.88],[s*0.12,s*0.88]].map(([dx,dy],i) => (
                      <circle key={i} cx={dx} cy={dy} r={s*0.035} fill={c.color1} opacity="0.55"
                        clipPath={`url(#cp1${uid})`}/>
                    ))}
                    {/* Tagline below star */}
                    <text x={cx} y={s*0.97} textAnchor="middle" fontSize={s*0.06} fill={c.color1}
                      opacity="0.85" fontFamily="Arial,sans-serif" fontWeight="700" letterSpacing="0.5">
                      {(c.tagline||"").slice(0,24).toUpperCase()}
                    </text>
                  </svg>
                );

                // ── Style 2: Dynamic Diagonal Split ──
                // Bold diagonal split: top-left color1 / bottom-right color2
                // Initial on top half, icon on bottom half, dynamic tension
                return (
                  <svg key={uid} width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <defs>
                      <clipPath id={`cp2a${uid}`}>
                        <polygon points={`0,0 ${s},0 0,${s}`}/>
                      </clipPath>
                      <clipPath id={`cp2b${uid}`}>
                        <polygon points={`${s},0 ${s},${s} 0,${s}`}/>
                      </clipPath>
                      <clipPath id={`cp2r${uid}`}>
                        <rect width={s} height={s} rx={s*0.14} ry={s*0.14}/>
                      </clipPath>
                    </defs>
                    {/* Base rounded rect */}
                    <rect width={s} height={s} rx={s*0.14} fill={c.color1}/>
                    {/* Bottom-right triangle in color2 */}
                    <polygon points={`${s*1.05},${-s*0.05} ${s*1.05},${s*1.05} ${-s*0.05},${s*1.05}`}
                      fill={c.color2||c.color1+"99"} clipPath={`url(#cp2r${uid})`}/>
                    {/* Diagonal divider glow */}
                    <line x1={-s*0.1} y1={s*1.1} x2={s*1.1} y2={-s*0.1}
                      stroke="#FFFFFF" strokeWidth={s*0.022} opacity="0.18" clipPath={`url(#cp2r${uid})`}/>
                    {/* Large initial top-left half */}
                    <text x={cx*0.68} y={cy*1.05} textAnchor="middle" fontSize={s*0.38} fontWeight="900"
                      fill={ct} fontFamily="Arial Black,sans-serif" clipPath={`url(#cp2a${uid})`}
                      opacity="0.95">{(c.initials||"?")[0]}</text>
                    {/* Icon bottom-right half */}
                    <text x={cx*1.38} y={cy*1.48} textAnchor="middle" fontSize={s*0.28}
                      clipPath={`url(#cp2b${uid})`}>{c.icon||"💡"}</text>
                    {/* Accent dot */}
                    <circle cx={cx} cy={cy} r={s*0.055} fill="#FFFFFF" opacity="0.9"/>
                    {/* Tagline at bottom */}
                    <text x={cx} y={s*0.94} textAnchor="middle" fontSize={s*0.058} fill={ct}
                      opacity="0.85" fontFamily="Arial,sans-serif" fontWeight="700" letterSpacing="1"
                      clipPath={`url(#cp2r${uid})`}>
                      {(c.tagline||"").slice(0,22).toUpperCase()}
                    </text>
                  </svg>
                );
              };

              return (
                <div style={{marginBottom:"18px"}}>
                  {/* Style picker */}
                  <p style={{fontSize:"10px", fontWeight:"700", color:GR, textTransform:"uppercase",
                    letterSpacing:".6px", marginBottom:"10px", textAlign:"center"}}>
                    {lang==="ar"?"اختر التصميم المفضل:":lang==="fr"?"Choisissez votre style :":"Choose your style:"}
                  </p>
                  <div style={{display:"flex", gap:"10px", marginBottom:"14px",
                    overflowX:"auto", paddingBottom:"4px"}}>
                    {[0,1,2].map(idx => (
                      <div key={idx} onClick={() => setLogoStyle(idx)}
                        style={{cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center",
                          gap:"6px", padding:"10px", borderRadius:"14px", flexShrink:0,
                          border:`2px solid ${logoStyle===idx ? Y : CD}`,
                          background:logoStyle===idx ? YL : WH,
                          transition:"all .2s"}}>
                        {renderVariant(idx, 80)}
                        <span style={{fontSize:"9px", fontWeight:"700", color:logoStyle===idx ? ND : GR,
                          textTransform:"uppercase", letterSpacing:".5px"}}>{styleNames[idx]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selected style large preview */}
                  <div style={{display:"flex", justifyContent:"center", marginBottom:"12px"}}>
                    {renderVariant(logoStyle, 140)}
                  </div>

                  {/* Brand info */}
                  <div style={{padding:"12px 14px", background:CR, borderRadius:"12px",
                    border:`1px solid ${CD}`, marginBottom:"12px"}}>
                    <div style={{fontSize:"10px", fontWeight:"700", color:GR, textTransform:"uppercase",
                      letterSpacing:".5px", marginBottom:"8px"}}>
                      {lang==="ar"?"هوية العلامة التجارية":lang==="fr"?"Identité de marque":"Brand identity"}
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px"}}>
                      <div style={{width:18, height:18, borderRadius:"50%", background:c.color1, border:`1px solid ${CD}`, flexShrink:0}}/>
                      <div style={{width:18, height:18, borderRadius:"50%", background:c.color2, border:`1px solid ${CD}`, flexShrink:0}}/>
                      {c.accentColor && <div style={{width:18, height:18, borderRadius:"50%", background:c.accentColor, border:`1px solid ${CD}`, flexShrink:0}}/>}
                      <span style={{fontSize:"11px", color:N, fontWeight:"500"}}>{c.color1} · {c.color2}</span>
                    </div>
                    <div style={{fontSize:"13px", fontWeight:"700", color:ND, marginBottom:"2px"}}>"{c.tagline}"</div>
                    {c.styleDesc && <div style={{fontSize:"11px", color:GR}}>{c.styleDesc}</div>}
                  </div>

                  {/* Actions */}
                  <div style={{display:"flex", gap:"8px"}}>
                    <button onClick={dlLogo}
                      style={{flex:1, padding:"11px 14px", borderRadius:"11px",
                        border:`2px solid ${Y}`, background:YL, color:ND,
                        fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer"}}>
                      ⬇ {lang==="ar"?"تحميل SVG":lang==="fr"?"Télécharger SVG":"Download SVG"}
                    </button>
                    <button onClick={genLogo} disabled={logoGenerating}
                      style={{padding:"11px 14px", borderRadius:"11px",
                        border:`1.5px solid ${CD}`, background:WH, color:GR,
                        fontSize:"12px", fontWeight:"600", fontFamily:ff(lang),
                        cursor:"pointer", whiteSpace:"nowrap"}}>
                      🔄 {lang==="ar"?"إعادة":lang==="fr"?"Relancer":"Retry"}
                    </button>
                    <button onClick={() => setLogo(null)}
                      style={{padding:"11px 12px", borderRadius:"11px",
                        border:`1px solid ${CD}`, background:"transparent", color:GR,
                        fontSize:"11px", fontFamily:ff(lang), cursor:"pointer"}}>
                      ✕
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ── Uploaded logo preview ── */}
            {logo && logo.type === "upload" && (
              <div style={{textAlign:"center", marginBottom:"18px"}}>
                <img src={logo.dataUrl} alt="logo"
                  style={{width:"120px", height:"120px", objectFit:"contain", borderRadius:"16px",
                    border:`3px solid ${Y}`, boxShadow:`0 4px 20px rgba(37,99,235,.2)`, marginBottom:"10px"}}/>
                <br/>
                <button onClick={() => setLogo(null)}
                  style={{padding:"6px 16px", borderRadius:"9px", border:`1px solid ${CD}`,
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
                <button onClick={() => dlPPTX("pitch", dlLang)}
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
            {backBtn()}
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
          {busy && <div style={{textAlign: "center", padding: "48px"}}>
            <div style={{fontSize:"52px", marginBottom:"16px"}}>✅</div>
            <p style={{color: GR, marginTop: "14px"}}>
              {lang === "ar" ? "جاري التحليل..." : lang === "fr" ? "Analyse en cours..." : "Analyzing..."}
            </p>
            <div style={{display: "flex", justifyContent: "center", marginTop: "14px"}}><Dots/></div>
          </div>}
          {!busy && !comp && (
            <div style={{textAlign:"center", padding:"32px 20px"}}>
              <div style={{fontSize:"48px", marginBottom:"14px"}}>⚠️</div>
              <div style={{fontSize:"15px", fontWeight:"700", color:ND, marginBottom:"8px"}}>
                {lang==="ar"?"فشل تحليل الامتثال":lang==="fr"?"Analyse échouée":"Analysis failed"}
              </div>
              <div style={{fontSize:"13px", color:GR, marginBottom:"18px", lineHeight:1.6}}>
                {lang==="ar"?"حاول مجدداً":lang==="fr"?"Réessayez dans quelques secondes":"Try again in a few seconds"}
              </div>
              {indhBtn(t.checkBtn as string, checkComp)}
              {backBtn()}
            </div>
          )}
          {comp && !busy && (<>
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
                  navigator.clipboard?.writeText(user.id).catch(() => {});
                  showToast(lang==="ar"?"تم نسخ رقم البطاقة":lang==="fr"?"CIN copié !":"CIN copied!", "success");
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
                <div style={{display:"flex", gap:"6px"}}>
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
                const TXT = {
                  bp: eAr?"خطة الأعمال":eEn?"Business Plan":"Business Plan",
                  bud: eAr?"الميزانية التفصيلية":eEn?"Detailed Budget":"Budget Prévisionnel",
                  comp: eAr?"تقرير الامتثال":eEn?"Compliance Report":"Rapport de Conformité",
                  chk: eAr?"قائمة الوثائق":eEn?"Docs Checklist":"Checklist Documents",
                  guide: eAr?"دليل التقديم":eEn?"Submission Guide":"Guide de Soumission",
                  jury: eAr?"عرض أمام اللجنة (7 شرائح)":eEn?"Jury Presentation — 7 slides":"Présentation Jury — 7 diapositives",
                  execSum: eAr?"الملخص التنفيذي":eEn?"EXECUTIVE SUMMARY":"RÉSUMÉ EXÉCUTIF",
                  problem: eAr?"إشكالية المشروع":eEn?"PROBLEM STATEMENT":"PROBLÉMATIQUE",
                  solution: eAr?"الحل المقترح":eEn?"SOLUTION":"SOLUTION",
                  market: eAr?"تحليل السوق":eEn?"MARKET ANALYSIS":"ANALYSE DE MARCHÉ",
                  bizModel: eAr?"نموذج الأعمال":eEn?"BUSINESS MODEL":"MODÈLE ÉCONOMIQUE",
                  impact: eAr?"الأثر الاجتماعي":eEn?"SOCIAL IMPACT":"IMPACT SOCIAL",
                  opPlan: eAr?"الخطة التشغيلية":eEn?"OPERATIONAL PLAN":"PLAN OPÉRATIONNEL",
                  indhAlign: eAr?"التوافق مع المبادرة":eEn?"INDH ALIGNMENT":"ALIGNEMENT INDH",
                  risks: eAr?"المخاطر":eEn?"RISKS":"RISQUES",
                  proj: eAr?"التوقعات":eEn?"PROJECTIONS":"PROJECTIONS",
                  yr: eAr?"السنة":eEn?"Year":"An",
                  total: eAr?"المجموع الكلي":eEn?"TOTAL":"TOTAL",
                  indhShare: eAr?"مساهمة المبادرة":eEn?"INDH Contribution":"Contribution INDH",
                  holdShare: eAr?"مساهمة الحامل":eEn?"Holder Contribution":"Apport porteur",
                  strengths: eAr?"نقاط القوة":eEn?"STRENGTHS":"POINTS FORTS",
                  recs: eAr?"التوصيات":eEn?"RECOMMENDATIONS":"RECOMMANDATIONS",
                  jury2: eAr?"تقييم اللجنة":eEn?"JURY GRID":"GRILLE JURY",
                  reqDocs: eAr?"الوثائق الإلزامية":eEn?"REQUIRED DOCUMENTS":"DOCUMENTS OBLIGATOIRES",
                  optDocs: eAr?"الوثائق الاختيارية":eEn?"OPTIONAL DOCUMENTS":"DOCUMENTS OPTIONNELS",
                  guideTitle: eAr?"دليل تقديم الملف للمبادرة الوطنية":eEn?"INDH APPLICATION SUBMISSION GUIDE":"GUIDE DE SOUMISSION INDH",
                  step1: eAr?"الخطوة 1: إعداد جميع الوثائق":eEn?"Step 1: Prepare all required documents":"Étape 1: Finaliser et réunir tous les documents requis",
                  step2: eAr?"الخطوة 2: إيداع الملف لدى مديرية العمل الاجتماعي":eEn?"Step 2: Submit file to Division of Social Action (DAS)":"Étape 2: Déposer le dossier à la DAS de votre province",
                  step3: eAr?"الخطوة 3: الحصول على وصل الإيداع":eEn?"Step 3: Obtain the deposit receipt":"Étape 3: Obtenir le récépissé de dépôt",
                  step4: eAr?"الخطوة 4: دراسة الملف (4 إلى 8 أسابيع)":eEn?"Step 4: File review by CPDH (4-8 weeks)":"Étape 4: Instruction par le CPDH local (4-8 semaines)",
                  step5: eAr?"الخطوة 5: المثول أمام لجنة التحكيم":eEn?"Step 5: Appear before INDH selection jury":"Étape 5: Présentation devant le jury de sélection INDH",
                  step6: eAr?"الخطوة 6: الإشعار بالقرار":eEn?"Step 6: Decision notification":"Étape 6: Notification de la décision",
                  step7: eAr?"الخطوة 7: التوقيع على الاتفاقية وانطلاق المشروع":eEn?"Step 7: Sign convention and launch project":"Étape 7: Signature de la convention INDH et démarrage",
                  useful: eAr?"جهات الاتصال المفيدة":eEn?"USEFUL CONTACTS":"CONTACTS UTILES",
                };
                const total=(budget?.items||[]).reduce((s: number,x: any)=>s+(x.total||0),0);
                const indhAmt = budget?.indhContribution||Math.round(total*.85);
                const holdAmt = budget?.beneficiaryContribution||Math.round(total*.15);
                const items: {icon:string;l:string;ok:boolean;onDl:()=>void;badge?:string}[] = [
                  {icon:"📄", l:eAr?"تحميل ملف PDF الكامل":eEn?"Download Full PDF Dossier":"Télécharger le Dossier PDF", ok:!!plan,
                    onDl:() => dlPDF(dlLang), badge:"pdf"},
                  {icon:"📊", l:TXT.bp, ok:!!plan,
                    onDl:() => dlText([
                      `${proj?.projectName||"Projet"} — ${TXT.bp}`,``,
                      TXT.execSum, plan?.executiveSummary||"",``,
                      TXT.problem, plan?.problemStatement||"",``,
                      TXT.solution, plan?.solution||"",``,
                      TXT.market, plan?.marketAnalysis||"",``,
                      TXT.bizModel, plan?.businessModel||"",``,
                      TXT.impact, plan?.socialImpact||"",``,
                      TXT.opPlan, plan?.operationalPlan||"",``,
                      TXT.indhAlign, plan?.indh_alignment||"",``,
                      TXT.risks, ...(plan?.risks||[]).map((r: string)=>`• ${r}`),``,
                      TXT.proj,
                      `${TXT.yr} 1: ${plan?.projections?.year1||0} MAD`,
                      `${TXT.yr} 2: ${plan?.projections?.year2||0} MAD`,
                      `${TXT.yr} 3: ${plan?.projections?.year3||0} MAD`,
                    ].join("\n"), `BusinessPlan_${proj?.projectName||"IdeaMap"}.txt`)},
                  {icon:"💰", l:TXT.bud, ok:!!budget?.items,
                    onDl:() => dlText([
                      `${proj?.projectName||"Projet"} — ${TXT.bud}`,``,
                      `${TXT.reqDocs.split(" ")[0]}\t${TXT.bizModel.slice(0,6)}\t${TXT.proj.slice(0,3)}\t${TXT.indhShare.slice(0,3)}`,
                      ...(budget?.items||[]).map((x: any)=>`${x.category}\t${x.item}\t${x.quantity}\t${x.unitPrice}\t${x.total}`),``,
                      `${TXT.total}: ${total.toLocaleString()} MAD`,
                      `${TXT.indhShare} (${Math.round((indhAmt/total)*100)}%): ${indhAmt.toLocaleString()} MAD`,
                      `${TXT.holdShare} (${Math.round((holdAmt/total)*100)}%): ${holdAmt.toLocaleString()} MAD`,
                    ].join("\n"), `Budget_${proj?.projectName||"IdeaMap"}.txt`)},
                  {icon:"✅", l:TXT.comp, ok:!!comp,
                    onDl:() => dlText([
                      `${proj?.projectName||"Projet"} — ${TXT.comp}`,``,
                      `Score: ${comp?.score}/100`,
                      eAr?`مؤهل: ${comp?.eligible?"نعم":"لا"}`:eEn?`Eligible: ${comp?.eligible?"YES":"NO"}`:`Éligible: ${comp?.eligible?"OUI":"NON"}`,
                      `${eAr?"المحور":eEn?"Pillar":"Pilier"}: ${comp?.pillar||""}`,``,
                      TXT.strengths, ...(comp?.strengths||[]).map((s: string)=>`✓ ${s}`),``,
                      TXT.recs, ...(comp?.recommendations||[]).map((r: string)=>`→ ${r}`),``,
                      TXT.jury2, ...JURY.map(j=>`${j.label}: ${comp?.juryScore?.[j.key]||0}/${j.w}`),
                    ].join("\n"), `Conformite_${proj?.projectName||"IdeaMap"}.txt`)},
                  {icon:"📋", l:TXT.chk, ok:true,
                    onDl:() => dlText([
                      `${proj?.projectName||"Projet"} — ${TXT.chk}`,``,
                      TXT.reqDocs,
                      ...DOCS.filter(d=>d.req).map(d=>`[${docs[d.id]?"✓":" "}] ${d.name} — ${d.desc}`),``,
                      TXT.optDocs,
                      ...DOCS.filter(d=>!d.req).map(d=>`[${docs[d.id]?"✓":" "}] ${d.name} — ${d.desc}`),
                    ].join("\n"), `Checklist_${proj?.projectName||"IdeaMap"}.txt`)},
                  {icon:"📖", l:TXT.guide, ok:true,
                    onDl:() => dlText([
                      `${TXT.guideTitle} — ${proj?.projectName||""}`,``,
                      TXT.step1, TXT.step2, TXT.step3, TXT.step4, TXT.step5, TXT.step6, TXT.step7,``,
                      TXT.useful,
                      eAr?"• مديرية العمل الاجتماعي (DAS) لإقليمك":"• Division de l'Action Sociale (DAS) de votre province",
                      eAr?"• اللجنة الإقليمية للتنمية البشرية (CPDH)":"• Comité Provincial de Développement Humain (CPDH)",
                      `• www.indh.ma`,
                      `• www.rokhsa.ma`,
                    ].join("\n"), `GuideSubmission_${proj?.projectName||"IdeaMap"}.txt`)},
                  {icon:"🎤", l:eAr?"عرض تقديمي للممولين (5 شرائح)":eEn?"Investor Pitch Deck — 5 slides":"Pitch Deck Investisseur — 5 diapositives", ok:!!plan,
                    onDl:() => dlPPTX("pitch", dlLang), badge:"pptx"},
                  {icon:"🏛️", l:TXT.jury, ok:!!proj, onDl:() => dlPPTX("jury", dlLang), badge:"pptx"},
                ];
                return items.map((x, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px",
                    borderRadius:"13px", marginBottom:"7px", background:x.ok?ND:CR, border:`1px solid ${x.ok?Y:CD}`}}>
                    <span style={{fontSize:"20px"}}>{x.icon}</span>
                    <span style={{flex:1, fontSize:"12px", color:x.ok?WH:ND, fontWeight:"500",
                      fontFamily:dlLang==="ar"?"'Tajawal',sans-serif":undefined,
                      direction:dlLang==="ar"?"rtl":"ltr"}}>{x.l}</span>
                    {x.ok ? (
                      <button onClick={x.onDl}
                        style={{padding:"5px 12px", borderRadius:"8px", border:`1.5px solid ${Y}`,
                          background:"transparent", color:Y, fontSize:"11px", fontWeight:"700",
                          fontFamily:ff(lang), cursor:"pointer"}}>
                        ⬇ {x.badge || "txt"}
                      </button>
                    ) : (
                      <span style={{padding:"2px 7px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                        background:CD, color:GR}}>⏳</span>
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
                {n:"5", l:lang==="ar"?"التوقيع على اتفاقية المبادرة وانطلاق المشروع":lang==="fr"?"Signature de la convention et démarrage":"Sign INDH convention and launch", d:lang==="ar"?"INDH 85% + مساهمة الحامل 15%":lang==="fr"?"INDH 85% + apport porteur 15%":"INDH 85% + holder 15%"},
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
function CoordDash({lang, setLang, user, onLogout, t, holders}: {
  lang: string; setLang: (l: string) => void; user: any;
  onLogout: () => void; t: any; holders: any[];
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [tab, setTab]       = useState("holders");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<any>(null);

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

  const STEPS_LIST = ["idea","dialogue","profile","plan","budget","logo","compliance","documents","export"];

  const exportCSV = () => {
    const cols = ["ID","Nom","Région","Secteur","Projet","Score","Éligible","Étape"];
    const rows = filtered.map(h => [
      h.id, h.name||"", h.profile?.region||"", h.proj?.sector||h.profile?.sector||"",
      h.proj?.projectName||"", h.comp?.score||"", h.comp?.eligible?"OUI":"NON", h.step||"idea",
    ].map(v => `"${String(v).replace(/"/g,'""')}"`));
    const csv = [cols.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob(["﻿"+csv], {type:"text/csv;charset=utf-8"})),
      download: "IdeaMap_Porteurs_Coord.csv",
    });
    a.click();
  };

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
        <DashSidebar user={user} navItems={COORD_NAV} activeTab={tab}
          onTabChange={id => { setTab(id); setDetail(null); }}
          onLogout={onLogout} lang={lang} t={t}/>
        <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
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
                  <div style={{fontSize:"12px", color:GR}}>{h.id} · {h.profile?.region} · {h.profile?.projType}</div>
                </div>
                <Badge role="holder"/>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {[
                  {l:"Age", v:h.profile?.age, i:"📅"}, {l:"Genre", v:h.profile?.gender, i:"👤"},
                  {l:"Région", v:h.profile?.region, i:"📍"}, {l:"Secteur", v:h.profile?.sector, i:"🏭"},
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh", background:CR, fontFamily:ff(lang), direction:"ltr", display:"flex"}}>
      <DashSidebar user={user} navItems={COORD_NAV} activeTab={tab}
        onTabChange={setTab} onLogout={onLogout} lang={lang} t={t}/>
      <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
        <div style={{padding:"32px 40px 48px", maxWidth:860}}>

          {/* ── Overview ── */}
          {tab === "overview" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>{user.id}</p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, marginBottom:20}}>
              {[
                {v:holders.length, l:lang==="ar"?"الحاملون المعينون":lang==="fr"?"Porteurs assignés":"Assigned holders"},
                {v:holders.length ? Math.round(holders.reduce((s,h)=>s+(STEPS_LIST.indexOf(h.step||"idea")/(STEPS_LIST.length-1)*100),0)/holders.length) + "%" : "—", l:lang==="ar"?"متوسط التقدم":lang==="fr"?"Préparation moyenne":"Avg progress"},
                {v:holders.filter(h=>h.comp?.eligible).length, l:lang==="ar"?"مشاريع مؤهلة":lang==="fr"?"Projets éligibles":"Eligible projects"},
              ].map((x,i) => (
                <div key={i} style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                  padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                  <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>{x.l}</div>
                  <div style={{fontSize:28, fontWeight:800, color:ND}}>{x.v}</div>
                </div>
              ))}
            </div>
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
              {["idea","dialogue","profile","plan","budget","logo","compliance","documents","export"].map(s => {
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
              <button onClick={exportCSV} style={{padding:"10px 16px", borderRadius:10,
                border:`1px solid ${GN}`, background:"transparent", color:GN,
                fontSize:"12px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer", flexShrink:0}}>
                📥 {lang==="ar"?"تصدير CSV":lang==="fr"?"Exporter CSV":"Export CSV"}
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
          </>)}

        </div>
      </div>
      <HelpAgent lang={lang} context={`Coordinateur: ${user.id} | ${holders.length} porteurs suivis | ${holders.filter(h => h.comp?.eligible).length} éligibles | ${holders.filter(h => h.step === "export").length} dossiers complets`}/>
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
  const [tab, setTab]           = useState("overview");
  const [newCoord, setNewCoord] = useState("");
  const [search, setSearch]     = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterStep, setFilterStep]     = useState("");
  const [detailH, setDetailH]   = useState<any>(null);

  const ADMIN_NAV = [
    {id:"overview",  label: lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"},
    {id:"projects",  label: lang==="ar"?"المشاريع":lang==="fr"?"Projets":"Projects"},
    {id:"coords",    label: lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs":"Coordinators"},
    {id:"activity",  label: lang==="ar"?"النشاط":lang==="fr"?"Activité":"Activity"},
    {id:"settings",  label: lang==="ar"?"الإعدادات":lang==="fr"?"Paramètres":"Settings"},
  ];

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
        <DashSidebar user={user} navItems={ADMIN_NAV} activeTab={tab}
          onTabChange={id => { setTab(id); setDetailH(null); }}
          onLogout={onLogout} lang={lang} t={t}/>
        <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
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
                  <div style={{fontSize:"12px", color:GR}}>{h.id} · {h.profile?.region} · {h.profile?.projType}</div>
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
      <DashSidebar user={user} navItems={ADMIN_NAV} activeTab={tab}
        onTabChange={setTab} onLogout={onLogout} lang={lang} t={t}/>
      <div style={{flex:1, overflowY:"auto", direction:dir as "rtl"|"ltr"}}>
        <div style={{padding:"32px 40px 48px", maxWidth:900}}>

          {/* ── Overview ── */}
          {tab === "overview" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"نظرة عامة":lang==="fr"?"Vue d'ensemble":"Overview"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {lang==="ar"?"لوحة تحكم المدير":lang==="fr"?"Tableau de bord Administrateur":"Admin Dashboard"}
            </p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:14, marginBottom:20}}>
              {[
                {label:lang==="ar"?"الحاملون النشطون":lang==="fr"?"Porteurs actifs":"Active holders", val:holders.length},
                {label:lang==="ar"?"مشاريع مؤهلة":lang==="fr"?"Projets éligibles":"Eligible projects", val:holders.filter(h=>h.comp?.eligible).length},
                {label:lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs actifs":"Active coordinators", val:coords.length},
                {label:lang==="ar"?"متوسط النقاط":lang==="fr"?"Score moyen":"Avg score", val:holders.length ? Math.round(holders.reduce((s,h)=>s+(h.comp?.score||0),0)/holders.length) : 0},
              ].map((x,i) => (
                <div key={i} style={{background:WH, border:`1px solid ${CD}`, borderRadius:12,
                  padding:"18px 20px", boxShadow:"0 1px 2px rgba(10,15,44,.04)"}}>
                  <div style={{fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:GR, marginBottom:8}}>{x.label}</div>
                  <div style={{fontSize:28, fontWeight:800, color:ND}}>{x.val}</div>
                </div>
              ))}
            </div>
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
                {STEPS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={exportCSV} style={{padding:"10px 14px", borderRadius:"10px",
                border:`1px solid ${GN}`, background:"transparent", color:GN,
                fontSize:"11px", fontWeight:"700", fontFamily:ff(lang), cursor:"pointer", flexShrink:0}}>
                📥 {lang==="ar"?"تصدير":lang==="fr"?"Exporter CSV":"Export CSV"}
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
                        {[lang==="ar"?"الحامل":"Porteur","CIN",
                          lang==="ar"?"المشروع":"Projet",
                          lang==="ar"?"المرحلة":"Étape",
                          lang==="ar"?"التقدم":"Préparation",
                          lang==="ar"?"الحالة":"Statut",
                        ].map((h2,i) => (
                          <th key={i} style={{padding:"10px 14px", textAlign:"left", fontSize:10.5,
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
                            <td style={{padding:"11px 14px", color:GR}}>{h.proj?.projectName||"—"}</td>
                            <td style={{padding:"11px 14px", color:GR, fontSize:12}}>{h.step||"idea"}</td>
                            <td style={{padding:"11px 14px", minWidth:90}}>
                              <div style={{display:"flex", alignItems:"center", gap:6}}>
                                <div style={{flex:1, height:5, background:CD, borderRadius:3, overflow:"hidden"}}>
                                  <div style={{height:"100%", borderRadius:3, background:ND, width:`${pct}%`}}/>
                                </div>
                                <span style={{fontSize:11, fontWeight:700, color:ND, flexShrink:0}}>{pct}%</span>
                              </div>
                            </td>
                            <td style={{padding:"11px 14px"}}>
                              <span style={{padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                                background:st.bg, color:st.fg}}>{st.label}</span>
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

          {/* ── Coordinators ── */}
          {tab === "coords" && (<>
            <h2 style={{fontSize:25, fontWeight:800, color:ND, marginBottom:4}}>
              {lang==="ar"?"المنسقون":lang==="fr"?"Coordinateurs":"Coordinators"}
            </h2>
            <p style={{fontSize:14, color:GR, marginBottom:24}}>
              {coords.length} {lang==="ar"?"منسق مسجل":lang==="fr"?"coordinateur(s) enregistré(s)":"registered coordinator(s)"}
            </p>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>➕ {t.addCoord}</span>
              </div>
              <p style={{fontSize:"11px", color:GR, marginBottom:"10px"}}>
                {lang==="ar"?"الصيغة: @NOMCOD (مثال: @KHALIDCOD)":lang==="fr"?"Format: @NOMCOD (ex: @KHALIDCOD)":"Format: @LASTNAMECOD (e.g. @KHALIDCOD)"}
              </p>
              <div style={{display:"flex", gap:"8px"}}>
                <input value={newCoord} onChange={e => setNewCoord(e.target.value.toUpperCase())}
                  placeholder="@KHALIDCOD"
                  style={{flex:1, padding:"11px 14px", borderRadius:"8px", border:`1px solid ${newCoord && RE_COORD.test(newCoord) ? Y : DV}`,
                    fontSize:"13px", fontFamily:ff(lang), color:N, background:IF, fontWeight:"700", letterSpacing:"1px"}}/>
                <button onClick={() => {if (RE_COORD.test(newCoord)) {onAddCoord(newCoord); setNewCoord("");}}}
                  disabled={!RE_COORD.test(newCoord)}
                  style={{padding:"11px 20px", borderRadius:"8px", border:"none", cursor:"pointer",
                    background:ND, color:WH, fontSize:"13px",
                    fontWeight:"700", fontFamily:ff(lang), opacity: RE_COORD.test(newCoord) ? 1 : .5}}>
                  {t.add}
                </button>
              </div>
            </Card>
            <Card>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"14px"}}>
                <AccBar/><span style={{fontSize:"14px", fontWeight:"700", color:ND}}>👥 {t.coordList} ({coords.length})</span>
              </div>
              {coords.length === 0 ? <p style={{color:GR, fontSize:"13px"}}>{lang==="ar"?"لا يوجد منسقون بعد":lang==="fr"?"Aucun coordinateur ajouté.":"No coordinators added yet."}</p> :
                coords.map((c: string, i: number) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:"10px", padding:"12px",
                    borderRadius:"10px", background:CR, border:`1px solid ${CD}`, marginBottom:"7px"}}>
                    <div style={{width:34, height:34, borderRadius:"50%", background:ND,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"14px", fontWeight:"800", color:WH}}>{c[1]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px", fontWeight:"700", color:ND}}>{c}</div>
                      <Badge role="coord"/>
                    </div>
                    <button onClick={() => onDelCoord(i)}
                      style={{padding:"5px 12px", borderRadius:"8px", border:`1px solid ${RE}`,
                        background:"transparent", color:RE, fontSize:"11px", fontWeight:"600", fontFamily:ff(lang), cursor:"pointer"}}>
                      {t.delete}
                    </button>
                  </div>
                ))
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
                      <div style={{fontSize:12, color:GR, marginTop:2}}>{h.proj.projectName} · {h.profile?.region||""}</div>
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
      <HelpAgent lang={lang} context={`Administrateur INDH | ${holders.length} porteurs | ${coords.length} coordinateurs | ${holders.filter(h => h.comp?.eligible).length} éligibles | Score moyen: ${holders.length ? Math.round(holders.reduce((s, h) => s + (h.comp?.score || 0), 0) / holders.length) : 0}/100`}/>
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
