"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ── DATA ──────────────────────────────────────────────────────────────────────
// 8 plateformes — El Fida & Mers Sultan fusionnées sous AL BAHIA

const PLATFORMS = [
  { id:"PLT-001", name:"Al Bahia",              prefecture:"Al Bahia",        arrond:"El Fida & Mers Sultan",          sync:"online",  total:590, active:343, completed:200, coordinator:"Sarah Benali",   drive:"OneDrive"     },
  { id:"PLT-002", name:"Plateforme Anfa",        prefecture:"Anfa",            arrond:"Préfecture d'Anfa",              sync:"online",  total:245, active:138, completed:74,  coordinator:"Nadia Mouline",  drive:"OneDrive"     },
  { id:"PLT-003", name:"Plateforme Hay Mohammadi",prefecture:"Hay Mohammadi", arrond:"Préf. Arr. Hay Mohammadi",       sync:"online",  total:198, active:112, completed:67,  coordinator:"Omar Hajji",     drive:"Google Drive" },
  { id:"PLT-004", name:"Plateforme Hay Hassani", prefecture:"Hay Hassani",     arrond:"Préfecture de Hay Hassani",      sync:"online",  total:167, active:94,  completed:52,  coordinator:"Fatima Zahir",   drive:"OneDrive"     },
  { id:"PLT-005", name:"Plateforme Lissasfa",    prefecture:"Lissasfa",        arrond:"Préfecture de Hay Hassani",      sync:"online",  total:143, active:81,  completed:43,  coordinator:"Youssef Ennaji", drive:"Google Drive" },
  { id:"PLT-006", name:"Plateforme Ben Msik",    prefecture:"Ben Msik",        arrond:"Préf. Arr. Ben Msik",            sync:"online",  total:221, active:127, completed:78,  coordinator:"Amina Khalil",   drive:"OneDrive"     },
  { id:"PLT-007", name:"Plateforme Sidi Bernoussi",prefecture:"Sidi Bernoussi",arrond:"Préf. Arr. Sidi Bernoussi",     sync:"syncing", total:189, active:107, completed:59,  coordinator:"Hassan Bouazza", drive:"Google Drive" },
  { id:"PLT-008", name:"Plateforme Moulay Rachid",prefecture:"Moulay Rachid", arrond:"Préf. Arr. Moulay Rachid",       sync:"offline", total:156, active:88,  completed:51,  coordinator:"Zineb Alaoui",   drive:"OneDrive"     },
];

const BENEFICIARIES = [
  { id:"YTR-2847", firstName:"Amina",   lastName:"El Fassi",       gender:"F", age:22, city:"Al Bahia",        platform:"PLT-001", program:"Skills Training",  status:"active",      step:3, email:"amina.elfassi@example.ma", phone:"+212 6 12 34 56 78", education:"Bachelor"     },
  { id:"YTR-2848", firstName:"Karim",   lastName:"Benali",         gender:"M", age:25, city:"Al Bahia",        platform:"PLT-001", program:"Leadership",        status:"completed",   step:4, email:"karim.benali@example.ma",  phone:"+212 6 12 34 56 79", education:"Master"        },
  { id:"YTR-2849", firstName:"Fatima",  lastName:"Zahra Idrissi",  gender:"F", age:20, city:"Anfa",            platform:"PLT-002", program:"Entrepreneurship",  status:"registered",  step:1, email:"fz.idrissi@example.ma",    phone:"+212 6 12 34 56 80", education:"Baccalauréat" },
  { id:"YTR-2850", firstName:"Youssef", lastName:"Mansouri",       gender:"M", age:23, city:"Al Bahia",        platform:"PLT-001", program:"Skills Training",  status:"active",      step:3, email:"y.mansouri@example.ma",    phone:"+212 6 12 34 56 81", education:"Associate"    },
  { id:"YTR-2851", firstName:"Salma",   lastName:"Cherkaoui",      gender:"F", age:21, city:"Hay Mohammadi",   platform:"PLT-003", program:"Leadership",        status:"orientation", step:2, email:"s.cherkaoui@example.ma",   phone:"+212 6 12 34 56 82", education:"Baccalauréat" },
  { id:"YTR-2852", firstName:"Omar",    lastName:"Tahiri",         gender:"M", age:27, city:"Hay Hassani",     platform:"PLT-004", program:"Entrepreneurship",  status:"dropped",     step:2, email:"o.tahiri@example.ma",      phone:"+212 6 12 34 56 83", education:"Bachelor"     },
  { id:"YTR-2853", firstName:"Nadia",   lastName:"Benkirane",      gender:"F", age:24, city:"Lissasfa",        platform:"PLT-005", program:"Skills Training",  status:"completed",   step:4, email:"n.benkirane@example.ma",   phone:"+212 6 12 34 56 84", education:"Bachelor"     },
  { id:"YTR-2854", firstName:"Hassan",  lastName:"Bouazza",        gender:"M", age:19, city:"Ben Msik",        platform:"PLT-006", program:"Leadership",        status:"active",      step:3, email:"h.bouazza@example.ma",     phone:"+212 6 12 34 56 85", education:"Baccalauréat" },
  { id:"YTR-2855", firstName:"Zineb",   lastName:"Ait Benhaddou",  gender:"F", age:26, city:"Sidi Bernoussi",  platform:"PLT-007", program:"Entrepreneurship",  status:"referred",    step:3, email:"zineb.ab@example.ma",      phone:"+212 6 12 34 56 86", education:"Master"        },
  { id:"YTR-2856", firstName:"Mehdi",   lastName:"El Amrani",      gender:"M", age:22, city:"Moulay Rachid",   platform:"PLT-008", program:"Skills Training",  status:"registered",  step:1, email:"m.elamrani@example.ma",    phone:"+212 6 12 34 56 87", education:"Associate"    },
  { id:"YTR-2857", firstName:"Houda",   lastName:"Alaoui",         gender:"F", age:23, city:"Al Bahia",        platform:"PLT-001", program:"Leadership",        status:"active",      step:3, email:"h.alaoui@example.ma",      phone:"+212 6 12 34 56 88", education:"Bachelor"     },
  { id:"YTR-2858", firstName:"Rachid",  lastName:"El Ouazzani",    gender:"M", age:28, city:"Anfa",            platform:"PLT-002", program:"Entrepreneurship",  status:"completed",   step:4, email:"r.elouazzani@example.ma",  phone:"+212 6 12 34 56 89", education:"Master"        },
];

const TREND_DATA = [
  { month:"Jan", registrations:145, completions:67  },
  { month:"Feb", registrations:178, completions:82  },
  { month:"Mar", registrations:203, completions:95  },
  { month:"Apr", registrations:267, completions:118 },
  { month:"May", registrations:312, completions:143 },
];
const PROG_DATA = [
  { name:"Skills Training",  count:654, fill:"#2563EB" },
  { name:"Leadership",       count:542, fill:"#06B6D4" },
  { name:"Entrepreneurship", count:528, fill:"#F59E0B" },
];
const GENDER_DATA  = [{ name:"Féminin", value:58, fill:"#06B6D4" },{ name:"Masculin", value:42, fill:"#2563EB" }];
const OUTCOME_DATA = [
  { name:"Employés",        value:210, fill:"#10B981" },
  { name:"Auto-entrepreneurs",value:130,fill:"#2563EB" },
  { name:"Certifiés",       value:320, fill:"#06B6D4" },
  { name:"En formation",    value:90,  fill:"#F59E0B" },
];
const SENT_MSGS = [
  { id:1, subject:"Orientation T2 — Toutes les Plateformes", recipients:"Toutes Plateformes",        date:"2026-05-18", delivered:1909, read:1389, type:"Événement"   },
  { id:2, subject:"Module 3 — Compétences Professionnelles", recipients:"PLT-001 Al Bahia · Actifs", date:"2026-05-15", delivered:343,  read:271,  type:"Annonce"     },
  { id:3, subject:"Certificats de Complétion Disponibles",   recipients:"Bénéficiaires Diplômés",    date:"2026-05-10", delivered:624,  read:578,  type:"Info"        },
  { id:4, subject:"Rappel : Présence Obligatoire",           recipients:"PLT-003 Anfa · Actifs",     date:"2026-05-08", delivered:138,  read:109,  type:"Rappel"      },
];
const STATUS_CFG = {
  registered:  { label:"Inscrit",      color:"#94A3B8", bg:"rgba(148,163,184,.10)" },
  orientation: { label:"Orientation",  color:"#60A5FA", bg:"rgba(96,165,250,.10)"  },
  active:      { label:"Actif",        color:"#3B82F6", bg:"rgba(59,130,246,.12)"  },
  completed:   { label:"Diplômé",      color:"#10B981", bg:"rgba(16,185,129,.12)"  },
  referred:    { label:"Référencé",    color:"#F59E0B", bg:"rgba(245,158,11,.12)"  },
  dropped:     { label:"Abandonné",    color:"#EF4444", bg:"rgba(239,68,68,.12)"   },
};
const SYNC_CFG = {
  online:  { label:"En ligne",   color:"#10B981" },
  syncing: { label:"Synchro...", color:"#F59E0B" },
  offline: { label:"Hors ligne", color:"#EF4444" },
};
const JOURNEY_STEPS = [
  { step:1, label:"Inscrit"     },
  { step:2, label:"Orientation" },
  { step:3, label:"Actif"       },
  { step:4, label:"Diplômé"     },
];
const KPI = [
  { label:"Total Bénéficiaires",   value:"1 909", delta:"+12.4%", up:true,  color:"#2563EB", glow:"rgba(37,99,235,.10)",  icon:"◯" },
  { label:"Participation Féminine",value:"58%",   delta:"+3.2%",  up:true,  color:"#06B6D4", glow:"rgba(6,182,212,.10)",  icon:"♀" },
  { label:"Taux de Complétion",    value:"32.7%", delta:"+5.1%",  up:true,  color:"#10B981", glow:"rgba(16,185,129,.10)", icon:"✓" },
  { label:"Plateformes Actives",   value:"8",     delta:"Stable", up:null,  color:"#F59E0B", glow:"rgba(245,158,11,.10)", icon:"◈" },
  { label:"Résultats Atteints",    value:"624",   delta:"+18.7%", up:true,  color:"#8B5CF6", glow:"rgba(139,92,246,.10)", icon:"⊕" },
  { label:"Taux d'Abandon",        value:"6.8%",  delta:"-2.1%",  up:false, color:"#EF4444", glow:"rgba(239,68,68,.10)",  icon:"⬡" },
];
const ACTIVITY = [
  { icon:"◯", text:"Amina El Fassi — Al Bahia — statut Actif",       time:"il y a 2min",  color:"#2563EB" },
  { icon:"◈", text:"PLT-002 Anfa re-synchronisé avec OneDrive",       time:"il y a 14min", color:"#10B981" },
  { icon:"⊕", text:"Nouvelle inscription : Rachid El Ouazzani",        time:"il y a 1h",   color:"#06B6D4" },
  { icon:"⊞", text:"Rapport T2 2026 généré avec succès",              time:"il y a 3h",   color:"#F59E0B" },
  { icon:"⬡", text:"Omar Tahiri — Hay Hassani — statut Abandonné",    time:"il y a 5h",   color:"#EF4444" },
];
const NAV = [
  { id:"dashboard",     icon:"▦", label:"Tableau de Bord" },
  { id:"platforms",     icon:"◈", label:"Plateformes"     },
  { id:"beneficiaries", icon:"◯", label:"Bénéficiaires"   },
  { id:"programs",      icon:"⊕", label:"Programmes"      },
  { id:"messages",      icon:"◻", label:"Messagerie"      },
  { id:"reports",       icon:"⊞", label:"Rapports"        },
];
const PROGS = [
  { id:"P1", emoji:"🛠", name:"Formation Professionnelle & Vocatif", color:"#2563EB", total:654, active:312, completed:287, attendance:84, outcomes:267 },
  { id:"P2", emoji:"🏛", name:"Leadership & Engagement Civique",     color:"#06B6D4", total:542, active:298, completed:198, attendance:79, outcomes:189 },
  { id:"P3", emoji:"💡", name:"Entrepreneuriat & Développement",     color:"#F59E0B", total:528, active:286, completed:189, attendance:81, outcomes:154 },
];

// ── STYLES ────────────────────────────────────────────────────────────────────
function G() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px;}
      .syne{font-family:'Syne',sans-serif;} .mono{font-family:'DM Mono',monospace;}
      .ro{stroke-dasharray:440;stroke-dashoffset:440;animation:dr 1.2s ease-out forwards;}
      .ri{stroke-dasharray:314;stroke-dashoffset:314;animation:dr 1s ease-out .35s forwards;}
      .ry{stroke-dasharray:200;stroke-dashoffset:200;animation:dr .8s ease-out .9s forwards;}
      .rd{opacity:0;animation:fi .4s ease-out 1.5s forwards,pd 2.5s ease-in-out 2s infinite;}
      .rp1{opacity:0;animation:fi .3s ease-out 1.7s forwards;} .rp2{opacity:0;animation:fi .3s ease-out 1.8s forwards;}
      .rp3{opacity:0;animation:fi .3s ease-out 1.9s forwards;} .rp4{opacity:0;animation:fi .3s ease-out 2s forwards;}
      .rt{opacity:0;transform:translateY(14px);animation:su .6s ease-out 1.7s forwards;}
      .rtag{opacity:0;animation:fi .5s ease-out 2.2s forwards;}
      @keyframes dr{to{stroke-dashoffset:0;}} @keyframes fi{to{opacity:1;}} @keyframes su{to{opacity:1;transform:translateY(0);}}
      @keyframes pd{0%,100%{opacity:1;}50%{opacity:.3;}}
      @keyframes sp{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.35;transform:scale(1.5);}} .sp{animation:sp 1.8s ease-in-out infinite;}
      .pi{animation:pIn .22s ease-out;} @keyframes pIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
      .ni{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;transition:all .15s;color:#4B5563;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;border:1px solid transparent;user-select:none;}
      .ni:hover{background:rgba(37,99,235,.07);color:#CBD5E1;} .ni.act{background:rgba(37,99,235,.13);color:#93C5FD;border-color:rgba(37,99,235,.22);}
      .xc{background:#1A2540;border:1px solid rgba(255,255,255,.05);border-radius:14px;padding:20px;}
      .kc{background:#1A2540;border:1px solid rgba(255,255,255,.05);border-radius:14px;padding:20px;transition:transform .2s;} .kc:hover{transform:translateY(-2px);}
      .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
      .bp{background:#2563EB;color:#fff;} .bp:hover{background:#1D4ED8;transform:translateY(-1px);}
      .bg{background:rgba(148,163,184,.07);color:#64748B;border:1px solid rgba(148,163,184,.09);} .bg:hover{background:rgba(148,163,184,.13);color:#CBD5E1;}
      .bsm{padding:5px 10px!important;font-size:11px!important;}
      .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;font-family:'DM Mono',monospace;}
      .inp{background:#080F1D;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:9px 12px;color:#E2E8F0;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border .15s;width:100%;}
      .inp:focus{border-color:#2563EB;} .inp::placeholder{color:#1E3A5F;} textarea.inp{resize:vertical;min-height:120px;}
      select.inp{-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;cursor:pointer;}
      select.inp option{background:#1A2540;color:#E2E8F0;}
      .pb{height:4px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden;} .pf{height:100%;border-radius:2px;transition:width .7s ease-out;}
      .tr:hover{background:rgba(37,99,235,.04);}
      .mbd{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);}
      .md{background:#1A2540;border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:28px;max-width:600px;width:90%;max-height:88vh;overflow-y:auto;}
      .lc{background:rgba(26,37,64,.93);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:42px 38px;width:100%;max-width:400px;backdrop-filter:blur(24px);}
      .tab{padding:7px 16px;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:#4B5563;font-family:'DM Sans',sans-serif;transition:all .15s;} .tab.act{background:rgba(37,99,235,.13);color:#93C5FD;}
      .jc{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid;}
      .pc{transition:transform .15s,box-shadow .15s;cursor:pointer;} .pc:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,0,0,.3);}
      .rc{transition:background .15s;cursor:pointer;} .rc:hover{background:#1E2E4A!important;}
    `}</style>
  );
}

// ── LOGO ──────────────────────────────────────────────────────────────────────
function Logo({ size=60, animate=true }) {
  const a = animate;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="86" fill="rgba(37,99,235,.05)" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#2563EB" strokeWidth="3.5" className={a?"ro":""} />
      <circle cx="100" cy="100" r="50" fill="none" stroke="#06B6D4" strokeWidth="2"   className={a?"ri":""} />
      <path d="M76 65 L124 135 M124 65 L76 135"
        fill="none" stroke="#F8FAFC" strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round"
        className={a?"ry":""} />
      <circle cx="100" cy="54"  r="6"   fill="#F59E0B" className={a?"rd":""}  />
      <circle cx="100" cy="28"  r="3"   fill="#10B981" className={a?"rp1":""} />
      <circle cx="133" cy="43"  r="3"   fill="#10B981" className={a?"rp2":""} />
      <circle cx="147" cy="76"  r="3"   fill="#10B981" className={a?"rp3":""} />
      <circle cx="141" cy="110" r="3"   fill="#10B981" className={a?"rp4":""} />
    </svg>
  );
}

// ── SHARED ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.registered;
  return (
    <span className="badge" style={{ color:c.color, background:c.bg }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.color, display:"inline-block" }} />
      {c.label}
    </span>
  );
}
function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#080F1D", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"10px 14px", fontFamily:"'DM Mono',monospace", fontSize:11 }}>
      <div style={{ color:"#4B5563", marginBottom:5 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color||p.fill||"#E2E8F0", display:"flex", justifyContent:"space-between", gap:16 }}>
          <span>{p.name}</span><span style={{ fontWeight:600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}
function TopBar({ title, subtitle }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 28px", borderBottom:"1px solid rgba(255,255,255,.04)", background:"rgba(8,15,29,.7)", backdropFilter:"blur(14px)", position:"sticky", top:0, zIndex:50 }}>
      <div>
        <div className="syne" style={{ fontSize:17, fontWeight:700, color:"#F1F5F9" }}>{title}</div>
        {subtitle && <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:1.2, marginTop:3 }}>{subtitle}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span className="mono" style={{ fontSize:9, color:"#1E3A5F" }}>MAI 2026</span>
        <div style={{ width:1, height:14, background:"rgba(255,255,255,.05)" }} />
        <button className="btn bg bsm">⟳ Synchroniser</button>
        <div style={{ width:28, height:28, borderRadius:7, background:"rgba(37,99,235,.08)", border:"1px solid rgba(37,99,235,.2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:12, color:"#60A5FA" }}>🔔</div>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@xtrack.ma");
  const [pass, setPass]   = useState("xtrack2026");
  const doLogin = () => { setLoading(true); setTimeout(() => { setLoading(false); onLogin(); }, 1500); };
  return (
    <div style={{ minHeight:"100vh", background:"#080F1D", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(37,99,235,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.025) 1px,transparent 1px)", backgroundSize:"44px 44px" }} />
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,.06) 0%,transparent 68%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
      <div className="lc">
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:34 }}>
          <Logo size={88} animate />
          <div className="rt syne" style={{ marginTop:16, fontSize:30, fontWeight:800, color:"#F1F5F9", letterSpacing:4 }}>X-TRACK</div>
          <div className="rtag mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:5, marginTop:5 }}>PLATEFORMES JEUNES INDH · CASABLANCA</div>
        </div>
        <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:2, marginBottom:16 }}>CONNEXION À VOTRE COMPTE</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:1, marginBottom:5 }}>EMAIL</div>
            <input className="inp" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:1, marginBottom:5 }}>MOT DE PASSE</div>
            <input className="inp" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#4B5563", cursor:"pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor:"#2563EB" }} /> Se souvenir de moi
            </label>
            <span style={{ fontSize:12, color:"#2563EB", cursor:"pointer" }}>Mot de passe oublié ?</span>
          </div>
          <button className="btn bp" style={{ width:"100%", justifyContent:"center", marginTop:6, padding:"12px 0", fontSize:14 }} onClick={doLogin} disabled={loading}>
            {loading ? "Connexion en cours…" : "Se Connecter →"}
          </button>
        </div>
        <div style={{ marginTop:22, padding:"12px 14px", background:"rgba(37,99,235,.05)", borderRadius:9, border:"1px solid rgba(37,99,235,.12)" }}>
          <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:1 }}>ACCÈS DÉMO</div>
          <div style={{ fontSize:12, color:"#4B5563", marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>admin@xtrack.ma · xtrack2026</div>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  return (
    <div style={{ width:220, background:"#060D1A", borderRight:"1px solid rgba(255,255,255,.04)", display:"flex", flexDirection:"column", padding:"16px 10px", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, padding:"0 6px" }}>
        <Logo size={30} animate={false} />
        <div>
          <div className="syne" style={{ fontSize:15, fontWeight:800, color:"#F1F5F9", letterSpacing:2.5 }}>X-TRACK</div>
          <div className="mono" style={{ fontSize:8, color:"#1E293B", letterSpacing:2 }}>INDH · CASABLANCA</div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
        <div className="mono" style={{ fontSize:8, color:"#1E293B", letterSpacing:2, padding:"0 6px", marginBottom:6 }}>NAVIGATION</div>
        {NAV.map(n => (
          <div key={n.id} className={`ni ${active===n.id?"act":""}`} onClick={()=>setActive(n.id)}>
            <span style={{ fontSize:13, opacity:.75 }}>{n.icon}</span>
            <span>{n.label}</span>
            {n.id==="beneficiaries" && <span style={{ marginLeft:"auto", background:"rgba(37,99,235,.15)", color:"#60A5FA", borderRadius:10, padding:"1px 7px", fontSize:10, fontFamily:"'DM Mono',monospace" }}>12</span>}
          </div>
        ))}
        <div style={{ marginTop:24 }}>
          <div className="mono" style={{ fontSize:8, color:"#1E293B", letterSpacing:2, padding:"0 6px", marginBottom:8 }}>SYNC EN DIRECT</div>
          <div style={{ padding:"10px 12px", background:"rgba(16,185,129,.04)", borderRadius:9, border:"1px solid rgba(16,185,129,.09)" }}>
            {[
              {label:"6 En ligne",   color:"#10B981", pulse:true  },
              {label:"1 Synchro...", color:"#F59E0B", pulse:false },
              {label:"1 Hors ligne", color:"#EF4444", pulse:false },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:s.color, flexShrink:0 }} className={s.pulse?"sp":""} />
                <span className="mono" style={{ fontSize:10, color:s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:9, padding:"12px 6px 2px", borderTop:"1px solid rgba(255,255,255,.04)" }}>
        <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>S</div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"#E2E8F0", fontFamily:"'DM Sans',sans-serif" }}>Super Admin</div>
          <div className="mono" style={{ fontSize:8, color:"#1E293B", letterSpacing:1 }}>XTRACK · INDH</div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardPage() {
  return (
    <div className="pi">
      <TopBar title="Tableau de Bord" subtitle="PLATEFORMES JEUNES INDH · CASABLANCA · 8 PLATEFORMES · MAI 2026" />
      <div style={{ padding:28 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
          {KPI.map(k=>(
            <div key={k.label} className="kc" style={{ boxShadow:`0 0 28px ${k.glow}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:1, marginBottom:9 }}>{k.label.toUpperCase()}</div>
                  <div className="syne" style={{ fontSize:30, fontWeight:700, color:"#F1F5F9", lineHeight:1 }}>{k.value}</div>
                </div>
                <div style={{ width:36, height:36, borderRadius:9, background:k.glow, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:k.color }}>{k.icon}</div>
              </div>
              <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6 }}>
                <span className="mono" style={{ fontSize:10, fontWeight:600, color:k.up===true?"#10B981":k.up===false?"#EF4444":"#F59E0B" }}>{k.delta}</span>
                <span style={{ fontSize:11, color:"#1E3A5F", fontFamily:"'DM Sans',sans-serif" }}>vs trimestre précédent</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
          <div className="xc">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", fontFamily:"'DM Sans',sans-serif" }}>Tendances des Inscriptions</div>
                <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginTop:3 }}>JAN — MAI 2026</div>
              </div>
              <div style={{ display:"flex", gap:5 }}>{["S","M","T","A"].map(t=><button key={t} className="btn bg bsm">{t}</button>)}</div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={.15}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                <XAxis dataKey="month" tick={{ fill:"#1E3A5F", fontSize:10, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#1E3A5F", fontSize:10, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="registrations" name="Inscriptions" stroke="#2563EB" strokeWidth={2} fill="url(#gR)" dot={{ fill:"#2563EB", r:3 }} />
                <Area type="monotone" dataKey="completions"   name="Diplômés"     stroke="#10B981" strokeWidth={2} fill="url(#gC)" dot={{ fill:"#10B981", r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="xc">
            <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Répartition Genre</div>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:16 }}>TOUTES PLATEFORMES</div>
            <ResponsiveContainer width="100%" height={134}>
              <PieChart>
                <Pie data={GENDER_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={4} dataKey="value">
                  {GENDER_DATA.map((d,i)=><Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={v=>`${v}%`} contentStyle={{ background:"#080F1D", border:"1px solid rgba(255,255,255,.08)", borderRadius:8, fontFamily:"DM Mono", fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
              {GENDER_DATA.map(d=>(
                <div key={d.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:d.fill }} />
                  <span className="mono" style={{ fontSize:10, color:"#4B5563" }}>{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="xc">
            <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Inscriptions par Programme</div>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:18 }}>PAR PROGRAMME</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={PROG_DATA} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill:"#1E3A5F", fontSize:10, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill:"#64748B", fontSize:10, fontFamily:"DM Sans" }} axisLine={false} tickLine={false} width={115} />
                <Tooltip content={<CT />} />
                <Bar dataKey="count" name="Inscrits" radius={[0,4,4,0]}>{PROG_DATA.map((d,i)=><Cell key={i} fill={d.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="xc">
            <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Activité Récente</div>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:14 }}>DERNIÈRES 24H</div>
            {ACTIVITY.map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<ACTIVITY.length-1?"1px solid rgba(255,255,255,.03)":"none" }}>
                <div style={{ width:26, height:26, borderRadius:7, background:`${a.color}14`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:a.color, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11.5, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}>{a.text}</div>
                  <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginTop:2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PLATEFORMES ───────────────────────────────────────────────────────────────
function PlatformsPage() {
  const [search, setSearch] = useState("");
  const items = PLATFORMS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.prefecture.toLowerCase().includes(search.toLowerCase()) ||
    p.arrond.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="pi">
      <TopBar title="Plateformes" subtitle="8 PLATEFORMES · CASABLANCA · ONEDRIVE & GOOGLE DRIVE" />
      <div style={{ padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <input className="inp" placeholder="Rechercher une plateforme…" style={{ width:260 }} value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn bp">+ Ajouter</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {items.map(p => {
            const sc = SYNC_CFG[p.sync];
            const rate = Math.round((p.completed/p.total)*100);
            return (
              <div key={p.id} className="xc pc">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    {/* Platform name prominently */}
                    <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", letterSpacing:0.5 }}>{p.name}</div>
                    <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginTop:4 }}>{p.arrond} · {p.id}</div>
                  </div>
                  <span className="badge" style={{ color:sc.color, background:`${sc.color}18` }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:sc.color, display:"inline-block" }} className={p.sync==="syncing"?"sp":""} />
                    {sc.label}
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                  {[{label:"Total",value:p.total,color:"#E2E8F0"},{label:"Actifs",value:p.active,color:"#3B82F6"},{label:"Diplômés",value:p.completed,color:"#10B981"}].map(s=>(
                    <div key={s.label} style={{ background:"rgba(8,15,29,.6)", borderRadius:8, padding:"8px 10px" }}>
                      <div className="syne" style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
                      <div className="mono" style={{ fontSize:7, color:"#1E3A5F", marginTop:2 }}>{s.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span className="mono" style={{ fontSize:8, color:"#1E3A5F" }}>COMPLÉTION</span>
                    <span className="mono" style={{ fontSize:8, color:"#10B981" }}>{rate}%</span>
                  </div>
                  <div className="pb"><div className="pf" style={{ width:`${rate}%`, background:"linear-gradient(90deg,#2563EB,#10B981)" }} /></div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>
                      {p.coordinator.split(" ").map(w=>w[0]).join("")}
                    </div>
                    <span style={{ fontSize:11, color:"#4B5563", fontFamily:"'DM Sans',sans-serif" }}>{p.coordinator}</span>
                    <span className="mono" style={{ fontSize:8, color:"#1E293B" }}>· {p.drive}</span>
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    <button className="btn bg bsm">Voir</button>
                    <button className="btn bg bsm">⟳ Sync</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── BÉNÉFICIAIRES ─────────────────────────────────────────────────────────────
function JourneyModal({ b, onClose }) {
  const plt = PLATFORMS.find(p=>p.id===b.platform);
  return (
    <div className="mbd" onClick={onClose}>
      <div className="md" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <div className="syne" style={{ fontSize:18, fontWeight:700, color:"#F1F5F9" }}>{b.firstName} {b.lastName}</div>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginTop:3 }}>{b.id} · {plt?.name}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <StatusBadge status={b.status} />
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.05)", border:"none", borderRadius:7, width:28, height:28, cursor:"pointer", color:"#4B5563", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:22 }}>
          {[
            {label:"Genre",      value:b.gender==="F"?"Féminin":"Masculin"},
            {label:"Âge",        value:`${b.age} ans`},
            {label:"Ville",      value:b.city},
            {label:"Niveau",     value:b.education},
            {label:"Programme",  value:b.program},
            {label:"Email",      value:b.email},
            {label:"Téléphone",  value:b.phone},
            {label:"Plateforme", value:plt?.name||b.platform},
          ].map(f=>(
            <div key={f.label} style={{ background:"rgba(8,15,29,.55)", borderRadius:8, padding:"9px 12px" }}>
              <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:4 }}>{f.label.toUpperCase()}</div>
              <div style={{ fontSize:12, color:"#CBD5E1", fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:22 }}>
          <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:14, letterSpacing:1 }}>SUIVI DU PARCOURS</div>
          <div style={{ display:"flex", alignItems:"flex-start" }}>
            {JOURNEY_STEPS.map((st,i)=>{
              const done=b.step>st.step, curr=b.step===st.step;
              return (
                <div key={st.step} style={{ display:"flex", alignItems:"center", flex:1 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div className="jc" style={{ borderColor:done?"#10B981":curr?"#3B82F6":"rgba(255,255,255,.06)", background:done?"#10B981":curr?"rgba(59,130,246,.13)":"rgba(8,15,29,.6)", color:done?"#fff":curr?"#60A5FA":"#1E3A5F" }}>
                      {done?"✓":st.step}
                    </div>
                    <div className="mono" style={{ fontSize:8, color:curr?"#60A5FA":done?"#10B981":"#1E3A5F", textAlign:"center" }}>{st.label}</div>
                  </div>
                  {i<3 && <div style={{ flex:1, height:2, background:done?"#10B981":"rgba(255,255,255,.05)", margin:"0 4px 18px" }} />}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn bp" style={{ flex:1, justifyContent:"center" }}>Mettre à jour →</button>
          <button className="btn bg" style={{ flex:1, justifyContent:"center" }}>Envoyer Message</button>
          <button className="btn bg">⬡ Référencer</button>
        </div>
      </div>
    </div>
  );
}

function BeneficiariesPage() {
  const [search,setSearch]=useState(""); const [statusF,setStatusF]=useState("all"); const [programF,setProgramF]=useState("all"); const [selected,setSelected]=useState(null);
  const filtered=BENEFICIARIES.filter(b=>{
    const q=search.toLowerCase();
    return (`${b.firstName} ${b.lastName}`.toLowerCase().includes(q)||b.id.toLowerCase().includes(q))
      &&(statusF==="all"||b.status===statusF)&&(programF==="all"||b.program===programF);
  });
  return (
    <div className="pi">
      {selected&&<JourneyModal b={selected} onClose={()=>setSelected(null)} />}
      <TopBar title="Bénéficiaires" subtitle={`${BENEFICIARIES.length} INSCRITS · ${BENEFICIARIES.filter(b=>b.status==="active").length} ACTIFS`} />
      <div style={{ padding:28 }}>
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <input className="inp" placeholder="Rechercher par nom ou ID…" style={{ width:240 }} value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="inp" style={{ width:155 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="inp" style={{ width:180 }} value={programF} onChange={e=>setProgramF(e.target.value)}>
            <option value="all">Tous les programmes</option>
            <option value="Skills Training">Formation Professionnelle</option>
            <option value="Leadership">Leadership</option>
            <option value="Entrepreneurship">Entrepreneuriat</option>
          </select>
          <div style={{ marginLeft:"auto" }}><button className="btn bp">+ Inscrire</button></div>
        </div>
        <div style={{ display:"flex", gap:7, marginBottom:16, flexWrap:"wrap" }}>
          {Object.entries(STATUS_CFG).map(([k,v])=>{
            const cnt=BENEFICIARIES.filter(b=>b.status===k).length;
            return (
              <div key={k} onClick={()=>setStatusF(statusF===k?"all":k)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, background:v.bg, cursor:"pointer", border:statusF===k?`1px solid ${v.color}`:"1px solid transparent", transition:"all .15s" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:v.color, display:"inline-block" }} />
                <span className="mono" style={{ fontSize:10, color:v.color }}>{v.label}</span>
                <span className="mono" style={{ fontSize:10, color:"#1E3A5F" }}>{cnt}</span>
              </div>
            );
          })}
        </div>
        <div className="xc" style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,.05)", background:"rgba(8,15,29,.5)" }}>
                {["ID","Bénéficiaire","Genre","Âge","Plateforme","Programme","Statut","Parcours",""].map(h=>(
                  <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontFamily:"'DM Mono',monospace", fontSize:8, color:"#1E3A5F", letterSpacing:1, fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b,i)=>{
                const plt=PLATFORMS.find(p=>p.id===b.platform);
                const pc=b.program==="Skills Training"?"#2563EB":b.program==="Leadership"?"#06B6D4":"#F59E0B";
                return (
                  <tr key={b.id} className="tr" style={{ borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,.03)":"none" }}>
                    <td style={{ padding:"12px 16px" }}><span className="mono" style={{ fontSize:10, color:"#1E3A5F" }}>{b.id}</span></td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:b.gender==="F"?"rgba(6,182,212,.13)":"rgba(37,99,235,.13)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:b.gender==="F"?"#06B6D4":"#3B82F6", flexShrink:0 }}>{b.firstName[0]}</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}>{b.firstName} {b.lastName}</div>
                          <div style={{ fontSize:10, color:"#1E3A5F", fontFamily:"'DM Sans',sans-serif" }}>{b.city}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:15, color:b.gender==="F"?"#06B6D4":"#3B82F6" }}>{b.gender==="F"?"♀":"♂"}</td>
                    <td style={{ padding:"12px 16px" }}><span className="mono" style={{ fontSize:11, color:"#4B5563" }}>{b.age}</span></td>
                    <td style={{ padding:"12px 16px", fontSize:11, color:"#4B5563", fontFamily:"'DM Sans',sans-serif" }}>{plt?.name}</td>
                    <td style={{ padding:"12px 16px" }}><span style={{ fontSize:11, color:pc, fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>{b.program}</span></td>
                    <td style={{ padding:"12px 16px" }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:3 }}>
                        {[1,2,3,4].map(st=>(
                          <div key={st} style={{ width:13, height:13, borderRadius:3, background:b.step>st?"#10B981":b.step===st?"#3B82F6":"rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {b.step>st&&<span style={{ fontSize:7, color:"#fff", fontWeight:700 }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}><button className="btn bg bsm" onClick={()=>setSelected(b)}>Voir →</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{ padding:40, textAlign:"center", color:"#1E3A5F", fontFamily:"'DM Mono',monospace", fontSize:11 }}>AUCUN RÉSULTAT</div>}
        </div>
      </div>
    </div>
  );
}

// ── PROGRAMMES ────────────────────────────────────────────────────────────────
function ProgramsPage() {
  return (
    <div className="pi">
      <TopBar title="Programmes" subtitle="3 PROGRAMMES INDH · TOUTES PLATEFORMES" />
      <div style={{ padding:28, display:"flex", flexDirection:"column", gap:14 }}>
        {PROGS.map(p=>{
          const rate=Math.round((p.completed/p.total)*100);
          return (
            <div key={p.id} className="xc">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:`${p.color}12`, border:`1px solid ${p.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#E2E8F0", fontFamily:"'DM Sans',sans-serif" }}>{p.name}</div>
                    <div className="mono" style={{ fontSize:8, color:p.color, marginTop:3, letterSpacing:1 }}>PROGRAMME INDH · ACTIF</div>
                  </div>
                </div>
                <button className="btn bg bsm">Voir Détails</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
                {[{label:"Inscrits",value:p.total,color:"#E2E8F0"},{label:"Actifs",value:p.active,color:"#3B82F6"},{label:"Diplômés",value:p.completed,color:"#10B981"},{label:"Présence",value:`${p.attendance}%`,color:"#F59E0B"},{label:"Résultats",value:p.outcomes,color:"#8B5CF6"}].map(s=>(
                  <div key={s.label} style={{ background:"rgba(8,15,29,.55)", borderRadius:10, padding:"11px 14px" }}>
                    <div className="syne" style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
                    <div className="mono" style={{ fontSize:7, color:"#1E3A5F", marginTop:4 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span className="mono" style={{ fontSize:8, color:"#1E3A5F" }}>TAUX DE COMPLÉTION</span>
                  <span className="mono" style={{ fontSize:8, color:p.color }}>{rate}%</span>
                </div>
                <div className="pb"><div className="pf" style={{ width:`${rate}%`, background:p.color }} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MESSAGERIE ────────────────────────────────────────────────────────────────
function MessagesPage() {
  const [tab,setTab]=useState("compose"); const [rt,setRt]=useState("platform"); const [body,setBody]=useState(""); const [sent,setSent]=useState(false);
  const reach={all:1909,platform:590,program:654,status:936,individual:1};
  return (
    <div className="pi">
      <TopBar title="Messagerie" subtitle="DIFFUSION · CIBLÉE · PROGRAMMÉE · SMS · WHATSAPP" />
      <div style={{ padding:28 }}>
        <div style={{ display:"flex", gap:5, marginBottom:22, background:"rgba(8,15,29,.55)", padding:4, borderRadius:10, width:"fit-content" }}>
          {[["compose","Composer"],["sent","Envoyés"],["templates","Modèles"]].map(([id,lbl])=>(
            <button key={id} className={`tab ${tab===id?"act":""}`} onClick={()=>{setTab(id);setSent(false);}}>{lbl}</button>
          ))}
        </div>
        {tab==="compose"&&(
          <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:16 }}>
            <div className="xc">
              {sent?(
                <div style={{ textAlign:"center", padding:"44px 20px" }}>
                  <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
                  <div className="syne" style={{ fontSize:22, fontWeight:700, color:"#10B981", marginBottom:8 }}>Message Envoyé !</div>
                  <div style={{ fontSize:13, color:"#4B5563", marginBottom:24, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>Votre message a été transmis à tous les destinataires sélectionnés.</div>
                  <button className="btn bp" onClick={()=>setSent(false)}>Composer un Autre</button>
                </div>
              ):(
                <>
                  <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:16, letterSpacing:1 }}>COMPOSER UN MESSAGE</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:7 }}>TYPE DE DESTINATAIRES</div>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {[["all","Tous"],["platform","Plateforme"],["program","Programme"],["status","Statut"],["individual","Individuel"]].map(([id,lbl])=>(
                          <button key={id} className={`tab ${rt===id?"act":""}`} style={{ fontSize:12 }} onClick={()=>setRt(id)}>{lbl}</button>
                        ))}
                      </div>
                    </div>
                    {rt==="platform"&&<div><div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>PLATEFORME</div><select className="inp"><option>Toutes les Plateformes</option>{PLATFORMS.map(p=><option key={p.id}>{p.name}</option>)}</select></div>}
                    {rt==="program"&&<div><div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>PROGRAMME</div><select className="inp"><option>Formation Professionnelle</option><option>Leadership</option><option>Entrepreneuriat</option></select></div>}
                    {rt==="status"&&<div><div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>STATUT</div><select className="inp">{Object.entries(STATUS_CFG).map(([k,v])=><option key={k}>{v.label}</option>)}</select></div>}
                    <div><div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>TYPE DE MESSAGE</div><select className="inp">{["Annonce","Invitation Événement","Rappel","Suivi","Félicitations","Référencement"].map(t=><option key={t}>{t}</option>)}</select></div>
                    <div><div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>OBJET</div><input className="inp" placeholder="Objet du message…" /></div>
                    <div><div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>CORPS DU MESSAGE</div><textarea className="inp" placeholder="Rédigez votre message ici…" value={body} onChange={e=>setBody(e.target.value)} /></div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn bp" style={{ flex:1, justifyContent:"center" }} onClick={()=>setSent(true)}>📤 Envoyer</button>
                      <button className="btn bg">⏰ Programmer</button>
                      <button className="btn bg">💾 Brouillon</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="xc">
                <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:10 }}>PORTÉE ESTIMÉE</div>
                <div className="syne" style={{ fontSize:34, fontWeight:700, color:"#F1F5F9" }}>{(reach[rt]||1).toLocaleString()}</div>
                <div style={{ fontSize:12, color:"#4B5563", marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>bénéficiaires</div>
                <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:7 }}>
                  {[["📱 In-App","#3B82F6"],["📧 Email","#06B6D4"],["💬 WhatsApp","#10B981"],["📞 SMS","#F59E0B"]].map(([ch,col])=>(
                    <label key={ch} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#4B5563", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor:col }} />{ch}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab==="sent"&&(
          <div className="xc" style={{ padding:0, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,.05)", background:"rgba(8,15,29,.5)" }}>
                  {["Objet","Destinataires","Date","Livrés","Taux Lu","Type"].map(h=>(
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontFamily:"'DM Mono',monospace", fontSize:8, color:"#1E3A5F", letterSpacing:1, fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENT_MSGS.map((m,i)=>(
                  <tr key={m.id} className="tr" style={{ borderBottom:i<SENT_MSGS.length-1?"1px solid rgba(255,255,255,.03)":"none" }}>
                    <td style={{ padding:"13px 16px", fontSize:12.5, color:"#CBD5E1", fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>{m.subject}</td>
                    <td style={{ padding:"13px 16px", fontSize:11, color:"#4B5563", fontFamily:"'DM Sans',sans-serif" }}>{m.recipients}</td>
                    <td style={{ padding:"13px 16px" }}><span className="mono" style={{ fontSize:10, color:"#1E3A5F" }}>{m.date}</span></td>
                    <td style={{ padding:"13px 16px" }}><span className="mono" style={{ fontSize:11, color:"#10B981" }}>✓ {m.delivered.toLocaleString()}</span></td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, height:4, background:"rgba(255,255,255,.05)", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${Math.round((m.read/m.delivered)*100)}%`, background:"#3B82F6", borderRadius:2 }} />
                        </div>
                        <span className="mono" style={{ fontSize:10, color:"#3B82F6" }}>{Math.round((m.read/m.delivered)*100)}%</span>
                      </div>
                    </td>
                    <td style={{ padding:"13px 16px" }}><span className="badge" style={{ color:"#06B6D4", background:"rgba(6,182,212,.1)" }}>{m.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab==="templates"&&(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {[
              {t:"Invitation Événement",   d:"Inviter les bénéficiaires à des ateliers ou événements", col:"#2563EB"},
              {t:"Félicitations Diplôme",  d:"Célébrer les bénéficiaires ayant terminé le programme",  col:"#10B981"},
              {t:"Rappel de Séance",       d:"Rappeler les sessions ou échéances importantes",         col:"#F59E0B"},
              {t:"Notification Référence", d:"Informer d'un transfert vers une autre plateforme",       col:"#8B5CF6"},
              {t:"Collecte de Données",    d:"Demander de remplir des enquêtes ou formulaires",         col:"#06B6D4"},
              {t:"Suivi Bénéficiaire",     d:"Relancer les bénéficiaires inactifs ou abandonnés",      col:"#EF4444"},
            ].map(t=>(
              <div key={t.t} className="xc pc">
                <div style={{ fontSize:13, fontWeight:700, color:t.col, marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>{t.t}</div>
                <div style={{ fontSize:12, color:"#4B5563", marginBottom:14, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{t.d}</div>
                <button className="btn bg bsm" style={{ width:"100%", justifyContent:"center" }}>Utiliser</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RAPPORTS ──────────────────────────────────────────────────────────────────
function ReportsPage() {
  const [rType,setRType]=useState("quarterly"); const [generated,setGenerated]=useState(false);
  return (
    <div className="pi">
      <TopBar title="Rapports & Analyses" subtitle="PDF · EXCEL · POWERPOINT · CSV · M&E" />
      <div style={{ padding:28 }}>
        <div className="xc" style={{ marginBottom:16 }}>
          <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:16, letterSpacing:1 }}>GÉNÉRATEUR DE RAPPORTS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
            {[{id:"monthly",label:"Suivi Mensuel"},{id:"quarterly",label:"Performance Trim."},{id:"annual",label:"Impact Annuel"},{id:"adhoc",label:"Ad-hoc Personnalisé"}].map(r=>(
              <div key={r.id} onClick={()=>{setRType(r.id);setGenerated(false);}}
                style={{ padding:"12px 14px", borderRadius:10, border:`1px solid ${rType===r.id?"#2563EB":"rgba(255,255,255,.05)"}`, background:rType===r.id?"rgba(37,99,235,.1)":"transparent", cursor:"pointer", transition:"all .15s" }}>
                <div style={{ fontSize:12, fontWeight:600, color:rType===r.id?"#93C5FD":"#4B5563", fontFamily:"'DM Sans',sans-serif" }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[["PÉRIODE","T2 2026","T1 2026","2025"],["PLATEFORME","Toutes","",""],["PROGRAMME","Tous","Formation Pro.","Leadership"],["FORMAT","PDF","Excel","PowerPoint"]].map(([label,...opts])=>(
              <div key={label}>
                <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:5 }}>{label}</div>
                <select className="inp">{opts.filter(Boolean).map(o=><option key={o}>{o}</option>)}</select>
              </div>
            ))}
          </div>
          <button className="btn bp" style={{ marginTop:14 }} onClick={()=>setGenerated(true)}>⊞ Générer le Rapport</button>
        </div>
        {generated&&(
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div>
                <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#E2E8F0" }}>T2 2026 — Rapport de Performance</div>
                <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginTop:2 }}>GÉNÉRÉ LE 19 MAI 2026 · TOUTES PLATEFORMES · TOUS PROGRAMMES</div>
              </div>
              <div style={{ display:"flex", gap:7 }}>{["📄 PDF","📊 Excel","📑 PPT","💾 CSV"].map(f=><button key={f} className="btn bg bsm">{f}</button>)}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
              {[{label:"Nouvelles Inscriptions",value:"312",delta:"+23%"},{label:"Taux de Complétion",value:"32.7%",delta:"+5.1%"},{label:"Participation Féminine",value:"58%",delta:"+3.2%"},{label:"Taux d'Abandon",value:"6.8%",delta:"-2.1%"}].map(k=>(
                <div key={k.label} className="xc">
                  <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:8 }}>{k.label.toUpperCase()}</div>
                  <div className="syne" style={{ fontSize:26, fontWeight:700, color:"#F1F5F9" }}>{k.value}</div>
                  <div className="mono" style={{ fontSize:10, color:"#10B981", marginTop:6 }}>{k.delta} vs T1</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div className="xc">
                <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Résultats Atteints</div>
                <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:16 }}>T2 2026 · TOUS PROGRAMMES</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={OUTCOME_DATA} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill:"#1E3A5F", fontSize:9, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#1E3A5F", fontSize:10, fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="value" name="Nombre" radius={[4,4,0,0]}>{OUTCOME_DATA.map((d,i)=><Cell key={i} fill={d.fill} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="xc">
                <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Taux de Complétion par Plateforme</div>
                <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:14 }}>% COMPLÉTION</div>
                {PLATFORMS.map(p=>{
                  const rate=Math.round((p.completed/p.total)*100);
                  return (
                    <div key={p.id} style={{ marginBottom:9 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:"#94A3B8", fontFamily:"'DM Sans',sans-serif" }}>{p.name}</span>
                        <span className="mono" style={{ fontSize:10, color:"#10B981" }}>{rate}%</span>
                      </div>
                      <div className="pb"><div className="pf" style={{ width:`${rate}%`, background:"linear-gradient(90deg,#2563EB,#10B981)" }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="xc">
              <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>Bilan M&E — T2 2026</div>
              <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:18 }}>SUIVI & ÉVALUATION · PLATEFORMES INDH CASABLANCA</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                {[
                  {title:"✅ Réalisations",color:"#10B981",items:["Objectif T2 dépassé de +12%","58% participation féminine, > 55% cible","Al Bahia : 590 bénéficiaires, 1ère plateforme","624 résultats atteints","Taux d'abandon réduit de 8.9% à 6.8%"]},
                  {title:"⚠️ Risques",color:"#F59E0B",items:["PLT-008 Moulay Rachid hors ligne","PLT-007 Sidi Bernoussi en synchro","3 plateformes sous 30% de complétion","Taux d'abandon > cible 5% annuelle","Poste coordinateur PLT-007 vacant"]},
                  {title:"📋 Plan d'action",color:"#2563EB",items:["Rétablir connexion Moulay Rachid","Alertes automatiques d'abandon précoce","Étendre mentorat T3 2026","Renforcer entrepreneuriat féminin","Compléter recrutement coordinateurs"]},
                ].map(s=>(
                  <div key={s.title} style={{ background:"rgba(8,15,29,.55)", borderRadius:10, padding:14 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:s.color, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>{s.title}</div>
                    {s.items.map((item,i)=>(
                      <div key={i} style={{ display:"flex", gap:7, marginBottom:7, alignItems:"flex-start" }}>
                        <div style={{ width:4, height:4, borderRadius:"50%", background:s.color, flexShrink:0, marginTop:5 }} />
                        <span style={{ fontSize:11, color:"#64748B", lineHeight:1.45, fontFamily:"'DM Sans',sans-serif" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {!generated&&(
          <>
            <div className="mono" style={{ fontSize:8, color:"#1E3A5F", letterSpacing:1, marginBottom:12 }}>RAPPORTS PRÉCÉDENTS</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {[{t:"Mensuel — Avril 2026",date:"2026-05-01",type:"Mensuel",size:"2.1 Mo"},{t:"T1 2026 — Performance",date:"2026-04-15",type:"Trimestriel",size:"4.7 Mo"},{t:"Impact Annuel 2025",date:"2026-01-20",type:"Annuel",size:"8.3 Mo"}].map(r=>(
                <div key={r.t} className="xc rc">
                  <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{r.t}</div>
                  <div className="mono" style={{ fontSize:8, color:"#1E3A5F", marginBottom:14 }}>{r.date} · {r.type} · {r.size}</div>
                  <div style={{ display:"flex", gap:7 }}>
                    <button className="btn bp bsm">↓ Télécharger</button>
                    <button className="btn bg bsm">Aperçu</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function XTrack() {
  const [loggedIn,setLoggedIn]=useState(false);
  const [page,setPage]=useState("dashboard");
  if (!loggedIn) return <><G /><LoginPage onLogin={()=>setLoggedIn(true)} /></>;
  return (
    <div style={{ display:"flex", height:"100vh", background:"#080F1D", overflow:"hidden" }}>
      <G />
      <Sidebar active={page} setActive={setPage} />
      <main style={{ flex:1, overflow:"auto" }}>
        {page==="dashboard"     && <DashboardPage />}
        {page==="platforms"     && <PlatformsPage />}
        {page==="beneficiaries" && <BeneficiariesPage />}
        {page==="programs"      && <ProgramsPage />}
        {page==="messages"      && <MessagesPage />}
        {page==="reports"       && <ReportsPage />}
      </main>
    </div>
  );
}
