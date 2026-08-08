"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ── DATA ──────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id:"PLT-001", name:"Al Bahia",               prefecture:"Al Bahia",         arrond:"El Fida & Mers Sultan",          sync:"online",  total:590, active:343, completed:200, coordinator:"Sarah Benali",   drive:"OneDrive"     },
  { id:"PLT-002", name:"Plateforme Anfa",         prefecture:"Anfa",             arrond:"Préfecture d'Anfa",              sync:"online",  total:245, active:138, completed:74,  coordinator:"Nadia Mouline",  drive:"OneDrive"     },
  { id:"PLT-003", name:"Plateforme Hay Mohammadi",prefecture:"Hay Mohammadi",   arrond:"Préf. Arr. Hay Mohammadi",       sync:"online",  total:198, active:112, completed:67,  coordinator:"Omar Hajji",     drive:"Google Drive" },
  { id:"PLT-004", name:"Plateforme Hay Hassani",  prefecture:"Hay Hassani",      arrond:"Préfecture de Hay Hassani",      sync:"online",  total:167, active:94,  completed:52,  coordinator:"Fatima Zahir",   drive:"OneDrive"     },
  { id:"PLT-005", name:"Plateforme Lissasfa",     prefecture:"Lissasfa",         arrond:"Préfecture de Hay Hassani",      sync:"online",  total:143, active:81,  completed:43,  coordinator:"Youssef Ennaji", drive:"Google Drive" },
  { id:"PLT-006", name:"Plateforme Ben Msik",     prefecture:"Ben Msik",         arrond:"Préf. Arr. Ben Msik",            sync:"online",  total:221, active:127, completed:78,  coordinator:"Amina Khalil",   drive:"OneDrive"     },
  { id:"PLT-007", name:"Plateforme Sidi Bernoussi",prefecture:"Sidi Bernoussi", arrond:"Préf. Arr. Sidi Bernoussi",      sync:"syncing", total:189, active:107, completed:59,  coordinator:"Hassan Bouazza", drive:"Google Drive" },
  { id:"PLT-008", name:"Plateforme Moulay Rachid",prefecture:"Moulay Rachid",   arrond:"Préf. Arr. Moulay Rachid",       sync:"offline", total:156, active:88,  completed:51,  coordinator:"Zineb Alaoui",   drive:"OneDrive"     },
];

const BENEFICIARIES = [
  { id:"YTR-2847", firstName:"Amina",   lastName:"El Fassi",       gender:"F", age:22, city:"Al Bahia",       platform:"PLT-001", program:"Skills Training",  status:"active",      step:3, email:"amina.elfassi@example.ma",  phone:"+212 6 12 34 56 78", education:"Bachelor"      },
  { id:"YTR-2848", firstName:"Karim",   lastName:"Benali",         gender:"M", age:25, city:"Al Bahia",       platform:"PLT-001", program:"Leadership",        status:"completed",   step:4, email:"karim.benali@example.ma",   phone:"+212 6 12 34 56 79", education:"Master"         },
  { id:"YTR-2849", firstName:"Fatima",  lastName:"Zahra Idrissi",  gender:"F", age:20, city:"Anfa",           platform:"PLT-002", program:"Entrepreneurship",  status:"registered",  step:1, email:"fz.idrissi@example.ma",     phone:"+212 6 12 34 56 80", education:"Baccalauréat"  },
  { id:"YTR-2850", firstName:"Youssef", lastName:"Mansouri",       gender:"M", age:23, city:"Al Bahia",       platform:"PLT-001", program:"Skills Training",  status:"active",      step:3, email:"y.mansouri@example.ma",     phone:"+212 6 12 34 56 81", education:"Associate"     },
  { id:"YTR-2851", firstName:"Salma",   lastName:"Cherkaoui",      gender:"F", age:21, city:"Hay Mohammadi",  platform:"PLT-003", program:"Leadership",        status:"orientation", step:2, email:"s.cherkaoui@example.ma",    phone:"+212 6 12 34 56 82", education:"Baccalauréat"  },
  { id:"YTR-2852", firstName:"Omar",    lastName:"Tahiri",         gender:"M", age:27, city:"Hay Hassani",    platform:"PLT-004", program:"Entrepreneurship",  status:"dropped",     step:2, email:"o.tahiri@example.ma",       phone:"+212 6 12 34 56 83", education:"Bachelor"      },
  { id:"YTR-2853", firstName:"Nadia",   lastName:"Benkirane",      gender:"F", age:24, city:"Lissasfa",       platform:"PLT-005", program:"Skills Training",  status:"completed",   step:4, email:"n.benkirane@example.ma",    phone:"+212 6 12 34 56 84", education:"Bachelor"      },
  { id:"YTR-2854", firstName:"Hassan",  lastName:"Bouazza",        gender:"M", age:19, city:"Ben Msik",       platform:"PLT-006", program:"Leadership",        status:"active",      step:3, email:"h.bouazza@example.ma",      phone:"+212 6 12 34 56 85", education:"Baccalauréat"  },
  { id:"YTR-2855", firstName:"Zineb",   lastName:"Ait Benhaddou",  gender:"F", age:26, city:"Sidi Bernoussi", platform:"PLT-007", program:"Entrepreneurship",  status:"referred",    step:3, email:"zineb.ab@example.ma",       phone:"+212 6 12 34 56 86", education:"Master"         },
  { id:"YTR-2856", firstName:"Mehdi",   lastName:"El Amrani",      gender:"M", age:22, city:"Moulay Rachid",  platform:"PLT-008", program:"Skills Training",  status:"registered",  step:1, email:"m.elamrani@example.ma",     phone:"+212 6 12 34 56 87", education:"Associate"     },
  { id:"YTR-2857", firstName:"Houda",   lastName:"Alaoui",         gender:"F", age:23, city:"Al Bahia",       platform:"PLT-001", program:"Leadership",        status:"active",      step:3, email:"h.alaoui@example.ma",       phone:"+212 6 12 34 56 88", education:"Bachelor"      },
  { id:"YTR-2858", firstName:"Rachid",  lastName:"El Ouazzani",    gender:"M", age:28, city:"Anfa",           platform:"PLT-002", program:"Entrepreneurship",  status:"completed",   step:4, email:"r.elouazzani@example.ma",   phone:"+212 6 12 34 56 89", education:"Master"         },
];

const TREND_DATA = [
  { month:"Jan", registrations:145, completions:67  },
  { month:"Feb", registrations:178, completions:82  },
  { month:"Mar", registrations:203, completions:95  },
  { month:"Apr", registrations:267, completions:118 },
  { month:"May", registrations:312, completions:143 },
];
const PROG_DATA   = [
  { name:"Skills Training",  count:654, fill:"#2563EB" },
  { name:"Leadership",       count:542, fill:"#06B6D4" },
  { name:"Entrepreneurship", count:528, fill:"#F59E0B" },
];
const GENDER_DATA  = [{ name:"Féminin", value:58, fill:"#06B6D4" },{ name:"Masculin", value:42, fill:"#2563EB" }];
const OUTCOME_DATA = [
  { label:"Emploi salarié",  pct:34 },
  { label:"Auto-emploi",     pct:28 },
  { label:"Formation sup.",  pct:22 },
  { label:"Bénévolat actif", pct:16 },
];
const SENT_MSGS = [
  { to:"Al Bahia",          subject:"Rappel — atelier leadership J-3",       date:"2026-07-31", status:"Livré" },
  { to:"Tous coordinateurs",subject:"Rapport mensuel Juillet disponible",     date:"2026-07-28", status:"Livré" },
  { to:"Hay Mohammadi",     subject:"Convocation jury sélection",             date:"2026-07-25", status:"Livré" },
];
const STATUS_CFG = {
  active:      { label:"Actif",        color:"#10B981", bg:"rgba(16,185,129,.15)"  },
  completed:   { label:"Complété",     color:"#2563EB", bg:"rgba(37,99,235,.15)"   },
  registered:  { label:"Inscrit",      color:"#06B6D4", bg:"rgba(6,182,212,.15)"   },
  orientation: { label:"Orientation",  color:"#F59E0B", bg:"rgba(245,158,11,.15)"  },
  dropped:     { label:"Abandonné",    color:"#EF4444", bg:"rgba(239,68,68,.15)"   },
  referred:    { label:"Référé",       color:"#A78BFA", bg:"rgba(167,139,250,.15)" },
};
const SYNC_CFG = {
  online:  { label:"Synchronisé",      color:"#10B981", dot:"#10B981" },
  syncing: { label:"Synchronisation…", color:"#F59E0B", dot:"#F59E0B" },
  offline: { label:"Hors ligne",       color:"#EF4444", dot:"#EF4444" },
};
const JOURNEY_STEPS = ["Inscription","Orientation","Programme","Certification","Insertion"];
const KPI = [
  { label:"Bénéficiaires",  value:"1 909", delta:"+12%", icon:"👥", color:"#2563EB" },
  { label:"Actifs",         value:"1 090", delta:"+8%",  icon:"⚡", color:"#06B6D4" },
  { label:"Complétés",      value:"624",   delta:"+23%", icon:"🎓", color:"#10B981" },
  { label:"Taux réussite",  value:"67%",   delta:"+5pt", icon:"📈", color:"#F59E0B" },
  { label:"Plateformes",    value:"8",     delta:"100%", icon:"🏛️", color:"#A78BFA" },
  { label:"Partenaires",    value:"23",    delta:"+3",   icon:"🤝", color:"#F59E0B" },
];
const ACTIVITY = [
  { icon:"🎓", text:"Nadia Benkirane a complété le programme Leadership",         time:"Il y a 2h",  color:"#10B981" },
  { icon:"📋", text:"Ben Msik — 12 nouvelles inscriptions ce matin",              time:"Il y a 4h",  color:"#2563EB" },
  { icon:"⚠️", text:"Plateforme Moulay Rachid — connexion perdue",                time:"Il y a 6h",  color:"#EF4444" },
  { icon:"📊", text:"Rapport mensuel Juillet généré automatiquement",             time:"Hier",       color:"#06B6D4" },
  { icon:"🔗", text:"Zineb Ait Benhaddou référée au programme Emploi",            time:"Hier",       color:"#A78BFA" },
];
const NAV = [
  { id:"dashboard",      icon:"◈",  label:"Tableau de bord" },
  { id:"platforms",      icon:"🏛",  label:"Plateformes"     },
  { id:"beneficiaries",  icon:"👤",  label:"Bénéficiaires"   },
  { id:"programs",       icon:"📋",  label:"Programmes"      },
  { id:"messages",       icon:"✉",   label:"Messages"        },
  { id:"reports",        icon:"📊",  label:"Rapports"        },
];
const PROGS = [
  {
    name:"Skills Training", code:"SKL", color:"#2563EB",
    desc:"Renforcement des compétences professionnelles transversales pour le marché du travail moderne.",
    enrolled:654, completed:312, active:289, referrals:53,
    duration:"4 mois", certif:"Certificat INDH", start:"Mars 2026",
    outcomes:["CV & outils RH","Soft skills","Préparation entretien","Projet professionnel"],
  },
  {
    name:"Leadership", code:"LDR", color:"#06B6D4",
    desc:"Développement du leadership et de la citoyenneté active chez les jeunes 18–30 ans.",
    enrolled:542, completed:198, active:287, referrals:57,
    duration:"3 mois", certif:"Attestation Leadership INDH", start:"Janvier 2026",
    outcomes:["Gestion d'équipe","Prise de décision","Communication","Projet communautaire"],
  },
  {
    name:"Entrepreneurship", code:"ENT", color:"#F59E0B",
    desc:"Accompagnement à la création d'entreprise et développement de l'auto-emploi.",
    enrolled:528, completed:114, active:318, referrals:96,
    duration:"6 mois", certif:"Diplôme Entrepreneur INDH", start:"Avril 2026",
    outcomes:["Plan d'affaires","Financement","Marketing","Création d'entreprise"],
  },
];

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────

function G() {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg0: #060B14;
      --bg1: #0A1628;
      --bg2: #0F1E36;
      --bg3: #162440;
      --border: rgba(255,255,255,.07);
      --border-hover: rgba(255,255,255,.14);
      --text: #E2E8F0;
      --muted: #64748B;
      --blue: #2563EB;
      --cyan: #06B6D4;
      --green: #10B981;
      --amber: #F59E0B;
      --red: #EF4444;
      --purple: #A78BFA;
    }
    html, body { height: 100%; background: var(--bg0); color: var(--text); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

    @keyframes pi { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
    @keyframes fi { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes sp { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes ro { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
    @keyframes ri { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes glow { 0%,100%{opacity:.5;filter:blur(32px)} 50%{opacity:.8;filter:blur(24px)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    /* layout */
    .ni { background: var(--bg2); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .xc { display: flex; height: 100vh; overflow: hidden; }

    /* cards */
    .kc {
      background: var(--bg2); border: 1px solid var(--border); border-radius: 16px;
      padding: 22px 24px; transition: transform .2s, box-shadow .2s, border-color .2s;
      position: relative; overflow: hidden;
    }
    .kc::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background: var(--accent-strip, #2563EB); opacity:.7; border-radius:16px 16px 0 0; }
    .kc:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.4); border-color: var(--border-hover); }

    /* buttons */
    .btn {
      display:inline-flex; align-items:center; gap:8px; padding:10px 20px;
      border-radius:10px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
      font-size:13px; font-weight:500; transition:all .18s; white-space:nowrap;
    }
    .bp { background: var(--blue); color:#fff; }
    .bp:hover { background:#1d4ed8; box-shadow:0 4px 20px rgba(37,99,235,.4); }
    .bg { background: rgba(255,255,255,.06); color: var(--text); border:1px solid var(--border); }
    .bg:hover { background: rgba(255,255,255,.1); border-color: var(--border-hover); }
    .bsm { padding:7px 14px; font-size:12px; }

    /* badges */
    .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-family:'DM Mono',monospace; font-size:10.5px; font-weight:500; letter-spacing:.3px; }

    /* inputs */
    .inp { width:100%; padding:12px 16px; background:rgba(255,255,255,.05); border:1.5px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:border-color .2s; }
    .inp:focus { border-color: var(--blue); }
    .inp::placeholder { color: var(--muted); }

    /* progress */
    .pb { height:5px; background:rgba(255,255,255,.06); border-radius:4px; overflow:hidden; }
    .pf { height:100%; border-radius:4px; transition:width .6s cubic-bezier(.4,0,.2,1); }

    /* table */
    .tr:hover { background: rgba(255,255,255,.03); }

    /* modal backdrop */
    .mbd { position:fixed; inset:0; background:rgba(0,0,0,.75); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fi .2s ease; backdrop-filter:blur(4px); }
    .md  { background:var(--bg2); border:1px solid var(--border); border-radius:20px; padding:32px; max-width:520px; width:calc(100% - 40px); animation:slideUp .25s ease; }

    /* sidebar link */
    .lc { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; font-size:13.5px; font-weight:500; cursor:pointer; transition:all .15s; color:var(--muted); border:none; background:transparent; width:100%; text-align:left; font-family:'DM Sans',sans-serif; }
    .lc:hover { color:var(--text); background:rgba(255,255,255,.05); }
    .la { color:var(--text)!important; background:rgba(37,99,235,.18)!important; }
    .li { width:20px; font-size:15px; text-align:center; flex-shrink:0; }

    /* platform card */
    .pc { background:var(--bg2); border:1px solid var(--border); border-radius:14px; padding:22px; transition:border-color .2s, transform .2s; }
    .pc:hover { border-color:var(--border-hover); transform:translateY(-2px); }

    /* divider */
    .divider { height:1px; background:var(--border); margin:20px 0; }

    /* scrollbar */
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12); border-radius:4px; }

    /* animation entrance */
    .fade-in { animation: fi .35s ease both; }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function Logo({ size = 36, animate = false }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* outer ring */}
      <circle cx="24" cy="24" r="21" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 3"
        style={animate ? { animation:"sp 18s linear infinite", transformOrigin:"24px 24px" } : {}} />
      {/* inner ring */}
      <circle cx="24" cy="24" r="14" stroke="#06B6D4" strokeWidth="1" strokeDasharray="3 4"
        style={animate ? { animation:"ro 12s linear infinite", transformOrigin:"24px 24px" } : {}} />
      {/* center dot */}
      <circle cx="24" cy="24" r="5" fill="#2563EB" style={animate ? { animation:"pi 3s ease-in-out infinite" } : {}} />
      {/* orbit dots */}
      <circle cx="24" cy="3" r="2.5" fill="#06B6D4" style={animate ? { animation:"ri 18s linear infinite", transformOrigin:"24px 24px" } : {}} />
      <circle cx="45" cy="24" r="2"   fill="#F59E0B" style={animate ? { animation:"sp 12s linear infinite", transformOrigin:"24px 24px" } : {}} />
    </svg>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { label: status, color:"#64748B", bg:"rgba(100,116,139,.15)" };
  return (
    <span className="badge" style={{ background: c.bg, color: c.color }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.color, display:"inline-block" }}/>
      {c.label}
    </span>
  );
}

function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#162440", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:"#64748B", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color:"#E2E8F0", marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, display:"inline-block" }}/>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:500, letterSpacing:"1.5px", textTransform:"uppercase", color:"#64748B", marginBottom:14 }}>
      {children}
    </div>
  );
}

function TopBar({ title, subtitle }) {
  return (
    <div style={{ padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(10,22,40,.8)", backdropFilter:"blur(8px)", position:"sticky", top:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:"#E2E8F0", lineHeight:1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:12, color:"#64748B", marginTop:3 }}>{subtitle}</p>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748B", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", padding:"5px 12px", borderRadius:8 }}>
          {new Date().toLocaleDateString("fr-MA", { day:"2-digit", month:"short", year:"numeric" })}
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      if (email === "admin@xtrack.ma" && pass === "xtrack2026") {
        onLogin({ name:"Admin INDH", role:"admin" });
      } else {
        setErr("Identifiants incorrects. Vérifiez votre e-mail et mot de passe.");
      }
      setBusy(false);
    }, 600);
  };

  return (
    <div className="ni">
      <G />
      {/* grid background */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(37,99,235,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.04) 1px, transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }}/>
      {/* glow orbs */}
      <div style={{ position:"absolute", width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)", top:"10%", left:"15%", animation:"glow 5s ease-in-out infinite", filter:"blur(40px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(6,182,212,.12) 0%, transparent 70%)", bottom:"15%", right:"10%", animation:"glow 7s ease-in-out infinite 2s", filter:"blur(40px)", pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:440, padding:"0 20px", animation:"slideUp .4s ease" }}>
        {/* glass card */}
        <div style={{ background:"rgba(15,30,54,.85)", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, padding:"44px 40px", backdropFilter:"blur(20px)", boxShadow:"0 32px 80px rgba(0,0,0,.5)" }}>
          {/* logo + brand */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36 }}>
            <Logo size={56} animate />
            <div style={{ marginTop:14, textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:"#E2E8F0", letterSpacing:"-0.5px" }}>X-Track</div>
              <div style={{ fontSize:12, color:"#64748B", marginTop:3, letterSpacing:"1px", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>Suivi Plateformes Jeunesse · INDH</div>
            </div>
          </div>

          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#64748B", marginBottom:6, textTransform:"uppercase", letterSpacing:".8px", fontFamily:"'DM Mono',monospace" }}>E-mail</label>
              <input className="inp" type="email" placeholder="admin@xtrack.ma" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} required />
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#64748B", marginBottom:6, textTransform:"uppercase", letterSpacing:".8px", fontFamily:"'DM Mono',monospace" }}>Mot de passe</label>
              <input className="inp" type="password" placeholder="••••••••" value={pass} onChange={e => { setPass(e.target.value); setErr(""); }} required />
            </div>
            {err && (
              <div style={{ background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.3)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#FCA5A5" }}>
                {err}
              </div>
            )}
            <button type="submit" className="btn bp" disabled={busy} style={{ width:"100%", justifyContent:"center", padding:"13px", fontSize:14, fontWeight:600, marginTop:6 }}>
              {busy ? "Connexion…" : "Se connecter →"}
            </button>
          </form>

          <div style={{ marginTop:24, padding:"12px 14px", background:"rgba(37,99,235,.08)", border:"1px solid rgba(37,99,235,.2)", borderRadius:10, fontSize:12, color:"#64748B", lineHeight:1.6 }}>
            <span style={{ fontFamily:"'DM Mono',monospace", color:"#2563EB" }}>Demo</span> — admin@xtrack.ma / xtrack2026
          </div>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontSize:11, color:"rgba(100,116,139,.6)", fontFamily:"'DM Mono',monospace" }}>
          © 2026 INDH · Région Casablanca-Settat
        </p>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }) {
  const onlineCount = PLATFORMS.filter(p => p.sync === "online").length;
  return (
    <aside style={{ width:220, flexShrink:0, background:"#0A1628", borderRight:"1px solid rgba(255,255,255,.06)", display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
      {/* brand */}
      <div style={{ padding:"22px 18px 16px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={30} animate />
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#E2E8F0" }}>X-Track</div>
            <div style={{ fontSize:10, color:"#64748B", fontFamily:"'DM Mono',monospace", letterSpacing:".5px" }}>INDH · Casa-Settat</div>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"12px 10px" }}>
        {NAV.map(n => (
          <button key={n.id} className={`lc${active === n.id ? " la" : ""}`} onClick={() => setActive(n.id)}>
            <span className="li">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* sync status */}
      <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#64748B", marginBottom:8, letterSpacing:"1px", textTransform:"uppercase" }}>Sync status</div>
        {Object.entries(SYNC_CFG).map(([k, v]) => {
          const count = PLATFORMS.filter(p => p.sync === k).length;
          return (
            <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:v.dot, animation: k === "syncing" ? "pulse 1.4s ease infinite" : "none" }}/>
                <span style={{ fontSize:11, color: v.color }}>{v.label}</span>
              </div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748B" }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* user */}
      <div style={{ padding:"14px 14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>A</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#E2E8F0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Admin INDH</div>
            <div style={{ fontSize:10, color:"#64748B", fontFamily:"'DM Mono',monospace" }}>Coordinateur régional</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

function DashboardPage() {
  const accentColors = ["#2563EB","#06B6D4","#10B981","#F59E0B","#A78BFA","#F59E0B"];
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <TopBar title="Tableau de bord" subtitle="Région Casablanca-Settat · 8 plateformes jeunesse INDH" />
      <div style={{ padding:"24px 28px" }}>

        {/* KPI grid */}
        <SectionLabel>Indicateurs clés</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, marginBottom:28 }}>
          {KPI.map((k, i) => (
            <div key={k.label} className="kc fade-in" style={{ "--accent-strip": accentColors[i], animationDelay:`${i * 0.05}s` }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${accentColors[i]}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {k.icon}
                </div>
                <span className="badge" style={{ background:`${accentColors[i]}18`, color:accentColors[i], fontSize:10 }}>
                  {k.delta}
                </span>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:700, color:"#E2E8F0", lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:12, color:"#64748B", marginTop:5 }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14, marginBottom:28 }}>
          {/* trend chart */}
          <div className="kc" style={{ "--accent-strip":"#2563EB", paddingBottom:18 }}>
            <div style={{ marginBottom:16 }}>
              <SectionLabel>Tendance — inscriptions & certifications</SectionLabel>
              <div style={{ display:"flex", gap:20 }}>
                {[{c:"#2563EB",l:"Inscriptions"},{c:"#10B981",l:"Complétions"}].map(x => (
                  <div key={x.l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748B" }}>
                    <div style={{ width:24, height:3, borderRadius:2, background:x.c }}/>
                    {x.l}
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TREND_DATA} margin={{ top:0, right:10, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:11, fontFamily:"'DM Mono'" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#64748B", fontSize:11, fontFamily:"'DM Mono'" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>} />
                <Area type="monotone" dataKey="registrations" name="Inscriptions" stroke="#2563EB" strokeWidth={2} fill="url(#gr)" dot={false}/>
                <Area type="monotone" dataKey="completions"   name="Complétions"  stroke="#10B981" strokeWidth={2} fill="url(#gg)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* donut */}
          <div className="kc" style={{ "--accent-strip":"#06B6D4" }}>
            <SectionLabel>Genre</SectionLabel>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <PieChart width={180} height={160}>
                <Pie data={GENDER_DATA} cx={90} cy={78} innerRadius={52} outerRadius={74} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {GENDER_DATA.map((e, i) => <Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`}/>
              </PieChart>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
              {GENDER_DATA.map(g => (
                <div key={g.name}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:12, color:"#64748B", display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:g.fill, display:"inline-block" }}/>
                      {g.name}
                    </span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#E2E8F0", fontWeight:500 }}>{g.value}%</span>
                  </div>
                  <div className="pb"><div className="pf" style={{ width:`${g.value}%`, background:g.fill }}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {/* programs chart */}
          <div className="kc" style={{ "--accent-strip":"#F59E0B" }}>
            <SectionLabel>Répartition par programme</SectionLabel>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={PROG_DATA} layout="vertical" margin={{ left:20, right:20, top:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false}/>
                <XAxis type="number" tick={{ fill:"#64748B", fontSize:10, fontFamily:"'DM Mono'" }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} width={110}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="count" name="Bénéficiaires" radius={[0,6,6,0]}>
                  {PROG_DATA.map((e, i) => <Cell key={i} fill={e.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* activity */}
          <div className="kc" style={{ "--accent-strip":"#A78BFA" }}>
            <SectionLabel>Activité récente</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display:"flex", gap:12, padding:"11px 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:`${a.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12.5, color:"#E2E8F0", lineHeight:1.45 }}>{a.text}</div>
                    <div style={{ fontSize:11, color:"#64748B", marginTop:3, fontFamily:"'DM Mono',monospace" }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PLATFORMS ─────────────────────────────────────────────────────────────────

function PlatformsPage() {
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <TopBar title="Plateformes" subtitle={`${PLATFORMS.length} plateformes · Région Casablanca-Settat`} />
      <div style={{ padding:"24px 28px" }}>
        <SectionLabel>Toutes les plateformes</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:14 }}>
          {PLATFORMS.map(p => {
            const sc = SYNC_CFG[p.sync];
            const activePct   = Math.round((p.active / p.total) * 100);
            const completePct = Math.round((p.completed / p.total) * 100);
            return (
              <div key={p.id} className="pc">
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#E2E8F0" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#64748B", marginTop:3 }}>{p.arrond}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background: p.sync === "online" ? "rgba(16,185,129,.12)" : p.sync === "syncing" ? "rgba(245,158,11,.12)" : "rgba(239,68,68,.12)" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:sc.dot, animation: p.sync === "syncing" ? "pulse 1.4s ease infinite" : "none" }}/>
                    <span style={{ fontSize:10.5, fontFamily:"'DM Mono',monospace", color:sc.color }}>{sc.label}</span>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:16 }}>
                  {[
                    { label:"Total", value:p.total, color:"#E2E8F0" },
                    { label:"Actifs", value:p.active, color:"#2563EB" },
                    { label:"Certifiés", value:p.completed, color:"#10B981" },
                  ].map(s => (
                    <div key={s.label} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:8, padding:"10px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:10, color:"#64748B", marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748B", marginBottom:5 }}>
                    <span>Actifs</span><span style={{ fontFamily:"'DM Mono',monospace" }}>{activePct}%</span>
                  </div>
                  <div className="pb"><div className="pf" style={{ width:`${activePct}%`, background:"#2563EB" }}/></div>
                </div>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748B", marginBottom:5 }}>
                    <span>Complétions</span><span style={{ fontFamily:"'DM Mono',monospace" }}>{completePct}%</span>
                  </div>
                  <div className="pb"><div className="pf" style={{ width:`${completePct}%`, background:"#10B981" }}/></div>
                </div>

                <div className="divider"/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, color:"#64748B" }}>
                    <span style={{ color:"#E2E8F0" }}>{p.coordinator}</span>
                  </div>
                  <span className="badge" style={{ background:"rgba(255,255,255,.05)", color:"#64748B", fontSize:10 }}>
                    {p.drive}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── BENEFICIARIES ─────────────────────────────────────────────────────────────

function JourneyModal({ b, onClose }) {
  return (
    <div className="mbd" onClick={onClose}>
      <div className="md" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#E2E8F0" }}>
              {b.firstName} {b.lastName}
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748B", marginTop:4 }}>{b.id}</div>
          </div>
          <StatusBadge status={b.status}/>
        </div>

        {/* info grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {[
            { l:"Plateforme", v: PLATFORMS.find(p => p.id === b.platform)?.name || b.platform },
            { l:"Programme",  v: b.program  },
            { l:"Ville",      v: b.city     },
            { l:"Âge",        v: `${b.age} ans` },
            { l:"Genre",      v: b.gender === "F" ? "Féminin" : "Masculin" },
            { l:"Niveau",     v: b.education },
          ].map(x => (
            <div key={x.l} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:8, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:"#64748B", marginBottom:3 }}>{x.l}</div>
              <div style={{ fontSize:13, color:"#E2E8F0", fontWeight:500 }}>{x.v}</div>
            </div>
          ))}
        </div>

        {/* journey */}
        <div style={{ marginBottom:20 }}>
          <SectionLabel>Parcours INDH</SectionLabel>
          <div style={{ display:"flex", gap:0 }}>
            {JOURNEY_STEPS.map((s, i) => {
              const done = i < b.step;
              const curr = i === b.step - 1;
              return (
                <div key={s} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                    {i > 0 && <div style={{ flex:1, height:2, background: done ? "#2563EB" : "rgba(255,255,255,.08)" }}/>}
                    <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: done || curr ? "#2563EB" : "rgba(255,255,255,.06)", border: curr ? "2px solid #06B6D4" : "none", fontSize:11, color:"#fff", fontWeight:700, zIndex:1 }}>
                      {done ? "✓" : i + 1}
                    </div>
                    {i < JOURNEY_STEPS.length - 1 && <div style={{ flex:1, height:2, background: i < b.step - 1 ? "#2563EB" : "rgba(255,255,255,.08)" }}/>}
                  </div>
                  <div style={{ fontSize:9, color: done || curr ? "#E2E8F0" : "#64748B", marginTop:5, fontFamily:"'DM Mono',monospace" }}>{s}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* contact */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {[{ l:"📧", v:b.email }, { l:"📱", v:b.phone }].map(x => (
            <div key={x.l} style={{ flex:1, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:14 }}>{x.l}</span>
              <span style={{ fontSize:12, color:"#64748B" }}>{x.v}</span>
            </div>
          ))}
        </div>

        <button className="btn bp" onClick={onClose} style={{ width:"100%", justifyContent:"center" }}>Fermer</button>
      </div>
    </div>
  );
}

function BeneficiariesPage() {
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("all");
  const [platformF, setPlatformF] = useState("all");
  const [detail,    setDetail]    = useState(null);

  const filtered = BENEFICIARIES.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || `${b.firstName} ${b.lastName} ${b.id}`.toLowerCase().includes(q);
    const matchS = statusF === "all"   || b.status  === statusF;
    const matchP = platformF === "all" || b.platform === platformF;
    return matchQ && matchS && matchP;
  });

  const selectStyle = { padding:"8px 12px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.07)", borderRadius:8, color:"#E2E8F0", fontSize:12, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer" };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      {detail && <JourneyModal b={detail} onClose={() => setDetail(null)}/>}
      <TopBar title="Bénéficiaires" subtitle={`${BENEFICIARIES.length} bénéficiaires enregistrés`}/>
      <div style={{ padding:"24px 28px" }}>
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <input className="inp" placeholder="Rechercher par nom ou ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1, minWidth:200 }}/>
          <select style={selectStyle} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select style={selectStyle} value={platformF} onChange={e => setPlatformF(e.target.value)}>
            <option value="all">Toutes plateformes</option>
            {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ background:"var(--bg2, #0F1E36)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(255,255,255,.03)" }}>
                {["ID","Bénéficiaire","Plateforme","Programme","Statut","Parcours",""].map((h, i) => (
                  <th key={i} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase", color:"#64748B", fontWeight:500, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className="tr" style={{ borderTop:"1px solid rgba(255,255,255,.05)", cursor:"pointer" }} onClick={() => setDetail(b)}>
                  <td style={{ padding:"11px 14px", fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748B" }}>{b.id}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontWeight:500, color:"#E2E8F0", fontSize:13 }}>{b.firstName} {b.lastName}</div>
                    <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{b.age} ans · {b.gender === "F" ? "F" : "M"}</div>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#64748B" }}>
                    {PLATFORMS.find(p => p.id === b.platform)?.name || b.platform}
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#64748B" }}>{b.program}</td>
                  <td style={{ padding:"11px 14px" }}><StatusBadge status={b.status}/></td>
                  <td style={{ padding:"11px 14px", minWidth:120 }}>
                    <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                      {JOURNEY_STEPS.map((_, j) => (
                        <div key={j} style={{ width:16, height:4, borderRadius:2, background: j < b.step ? "#2563EB" : "rgba(255,255,255,.08)", transition:"background .3s" }}/>
                      ))}
                      <span style={{ fontSize:10, color:"#64748B", fontFamily:"'DM Mono',monospace", marginLeft:4 }}>{b.step}/5</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <button className="btn bg bsm" onClick={e => { e.stopPropagation(); setDetail(b); }}>Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:"40px", textAlign:"center", color:"#64748B", fontSize:14 }}>Aucun bénéficiaire trouvé</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PROGRAMS ──────────────────────────────────────────────────────────────────

function ProgramsPage() {
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <TopBar title="Programmes" subtitle="3 programmes actifs · INDH Casablanca-Settat"/>
      <div style={{ padding:"24px 28px" }}>
        <SectionLabel>Programmes INDH</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, marginBottom:28 }}>
          {PROGS.map(p => (
            <div key={p.name} style={{ background:"#0F1E36", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
              <div style={{ height:5, background:p.color }}/>
              <div style={{ padding:"20px 20px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ width:34, height:34, borderRadius:8, background:`${p.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:p.color }}>
                    {p.code}
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#E2E8F0" }}>{p.name}</div>
                </div>
                <p style={{ fontSize:12, color:"#64748B", lineHeight:1.6, marginBottom:16 }}>{p.desc}</p>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                  {[
                    { l:"Inscrits",   v:p.enrolled,  c:"#E2E8F0" },
                    { l:"Actifs",     v:p.active,    c:p.color   },
                    { l:"Certifiés",  v:p.completed, c:"#10B981" },
                    { l:"Référés",    v:p.referrals, c:"#A78BFA" },
                  ].map(s => (
                    <div key={s.l} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)", borderRadius:8, padding:"10px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:s.c }}>{s.v}</div>
                      <div style={{ fontSize:10, color:"#64748B", marginTop:1 }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748B", marginBottom:5 }}>
                    <span>Taux de complétion</span>
                    <span style={{ fontFamily:"'DM Mono',monospace" }}>{Math.round((p.completed / p.enrolled) * 100)}%</span>
                  </div>
                  <div className="pb"><div className="pf" style={{ width:`${Math.round((p.completed / p.enrolled) * 100)}%`, background:p.color }}/></div>
                </div>

                <div className="divider"/>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {[
                    { l:"⏱", v:p.duration },
                    { l:"🏅", v:p.certif.slice(0, 20) },
                  ].map(x => (
                    <span key={x.l} className="badge" style={{ background:"rgba(255,255,255,.05)", color:"#64748B", fontSize:10 }}>{x.l} {x.v}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* outcomes */}
        <SectionLabel>Résultats d&rsquo;insertion</SectionLabel>
        <div className="kc" style={{ "--accent-strip":"#10B981" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14 }}>
            {OUTCOME_DATA.map(o => (
              <div key={o.label} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:"#E2E8F0", lineHeight:1 }}>{o.pct}%</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:8, lineHeight:1.4 }}>{o.label}</div>
                <div style={{ marginTop:10 }}>
                  <div className="pb"><div className="pf" style={{ width:`${o.pct}%`, background:"#10B981" }}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MESSAGES ──────────────────────────────────────────────────────────────────

function MessagesPage() {
  const [tab, setTab]     = useState("compose");
  const [to,  setTo]      = useState("");
  const [sub, setSub]     = useState("");
  const [body, setBody]   = useState("");
  const [sent, setSent]   = useState(false);

  const templates = [
    { t:"Convocation atelier",      b:"Vous êtes convoqué(e) à l'atelier du programme le [DATE] à [LIEU]. Merci de confirmer votre présence."    },
    { t:"Rappel mensuel",           b:"Rappel : le rapport mensuel d'activité est attendu avant le [DATE]. Merci de le déposer sur le drive partagé." },
    { t:"Félicitations certification", b:"Toutes nos félicitations pour l'obtention de votre certification INDH ! Votre document est disponible sur le portail." },
  ];

  const send = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setTo(""); setSub(""); setBody(""); }, 2000);
  };

  const tabStyle = (id) => ({
    padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
    fontSize:13, fontWeight:500, transition:"all .15s",
    background: tab === id ? "#2563EB" : "rgba(255,255,255,.05)",
    color: tab === id ? "#fff" : "#64748B",
  });

  const selectStyle = { width:"100%", padding:"12px 16px", background:"rgba(255,255,255,.05)", border:"1.5px solid rgba(255,255,255,.07)", borderRadius:10, color:"#E2E8F0", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <TopBar title="Messages" subtitle="Communication avec les coordinateurs et bénéficiaires"/>
      <div style={{ padding:"24px 28px" }}>
        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {[{id:"compose",l:"Composer"},{id:"sent",l:"Envoyés"},{id:"templates",l:"Modèles"}].map(x => (
            <button key={x.id} style={tabStyle(x.id)} onClick={() => setTab(x.id)}>{x.l}</button>
          ))}
        </div>

        {tab === "compose" && (
          <div className="kc" style={{ "--accent-strip":"#2563EB", maxWidth:640 }}>
            {sent ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#10B981" }}>Message envoyé !</div>
              </div>
            ) : (
              <form onSubmit={send} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748B", marginBottom:6, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase" }}>Destinataire</label>
                  <select style={selectStyle} value={to} onChange={e => setTo(e.target.value)} required>
                    <option value="">Sélectionner…</option>
                    <option value="all">Tous les coordinateurs</option>
                    {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name} — {p.coordinator}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748B", marginBottom:6, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase" }}>Objet</label>
                  <input className="inp" placeholder="Objet du message" value={sub} onChange={e => setSub(e.target.value)} required/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748B", marginBottom:6, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase" }}>Message</label>
                  <textarea className="inp" placeholder="Rédigez votre message…" rows={6} value={body} onChange={e => setBody(e.target.value)} style={{ resize:"vertical" }} required/>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <button type="button" className="btn bg" onClick={() => { setTo(""); setSub(""); setBody(""); }}>Effacer</button>
                  <button type="submit" className="btn bp">Envoyer →</button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === "sent" && (
          <div style={{ background:"#0F1E36", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,.03)" }}>
                  {["Destinataire","Objet","Date","Statut"].map((h, i) => (
                    <th key={i} style={{ padding:"11px 16px", textAlign:"left", fontSize:10, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase", color:"#64748B" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENT_MSGS.map((m, i) => (
                  <tr key={i} className="tr" style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#E2E8F0" }}>{m.to}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#64748B" }}>{m.subject}</td>
                    <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748B" }}>{m.date}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span className="badge" style={{ background:"rgba(16,185,129,.12)", color:"#10B981" }}>✓ {m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "templates" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:640 }}>
            {templates.map((t, i) => (
              <div key={i} className="kc" style={{ "--accent-strip":"#06B6D4" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:"#E2E8F0", fontSize:14, marginBottom:8 }}>{t.t}</div>
                    <div style={{ fontSize:12, color:"#64748B", lineHeight:1.7 }}>{t.b}</div>
                  </div>
                  <button className="btn bg bsm" style={{ flexShrink:0 }} onClick={() => { setBody(t.b); setSub(t.t); setTab("compose"); }}>
                    Utiliser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────

function ReportsPage() {
  const [period,    setPeriod]    = useState("2026-Q2");
  const [platform,  setPlatform]  = useState("all");
  const [generated, setGenerated] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1200);
  };

  const selectStyle = { padding:"10px 14px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.07)", borderRadius:10, color:"#E2E8F0", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", minWidth:160 };

  const totals = PLATFORMS.reduce((a, p) => ({ total: a.total + p.total, active: a.active + p.active, completed: a.completed + p.completed }), { total:0, active:0, completed:0 });

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <TopBar title="Rapports" subtitle="Génération de rapports M&E · INDH Casablanca-Settat"/>
      <div style={{ padding:"24px 28px" }}>
        {/* generator */}
        <div className="kc" style={{ "--accent-strip":"#F59E0B", marginBottom:24 }}>
          <SectionLabel>Générer un rapport</SectionLabel>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
            <div>
              <label style={{ display:"block", fontSize:10, color:"#64748B", marginBottom:6, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase" }}>Période</label>
              <select style={selectStyle} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="2026-Q1">T1 2026 (Jan–Mar)</option>
                <option value="2026-Q2">T2 2026 (Avr–Juin)</option>
                <option value="2026-Q3">T3 2026 (Juil–Sep)</option>
                <option value="2026-annual">Annuel 2026</option>
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:10, color:"#64748B", marginBottom:6, fontFamily:"'DM Mono',monospace", letterSpacing:"1px", textTransform:"uppercase" }}>Plateforme</label>
              <select style={selectStyle} value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="all">Toutes les plateformes</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn bp" onClick={generate} disabled={loading} style={{ height:42 }}>
              {loading ? "Génération…" : "📊 Générer →"}
            </button>
          </div>
        </div>

        {generated && (
          <div style={{ animation:"slideUp .3s ease" }}>
            {/* summary KPIs */}
            <SectionLabel>Synthèse — {period} · {platform === "all" ? "Toutes plateformes" : PLATFORMS.find(p => p.id === platform)?.name}</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:24 }}>
              {[
                { l:"Total inscrits",   v:totals.total,     c:"#2563EB" },
                { l:"Actifs",           v:totals.active,    c:"#06B6D4" },
                { l:"Certifiés",        v:totals.completed, c:"#10B981" },
                { l:"Taux réussite",    v:`${Math.round(totals.completed / totals.total * 100)}%`, c:"#F59E0B" },
              ].map(s => (
                <div key={s.l} style={{ background:"#0F1E36", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"18px 20px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:5 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* M&E section */}
            <div className="kc" style={{ "--accent-strip":"#10B981", marginBottom:14 }}>
              <SectionLabel>Suivi & Évaluation (M&E)</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:14 }}>Indicateurs de performance</div>
                  {[
                    { l:"Taux de rétention",   v:83, c:"#10B981" },
                    { l:"Satisfaction (NPS)",   v:76, c:"#2563EB" },
                    { l:"Taux insertion emploi",v:62, c:"#F59E0B" },
                    { l:"Recommandation pairs", v:71, c:"#06B6D4" },
                  ].map(m => (
                    <div key={m.l} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#64748B", marginBottom:5 }}>
                        <span>{m.l}</span>
                        <span style={{ fontFamily:"'DM Mono',monospace", color:"#E2E8F0" }}>{m.v}%</span>
                      </div>
                      <div className="pb"><div className="pf" style={{ width:`${m.v}%`, background:m.c }}/></div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:14 }}>Tendance mensuelle</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={TREND_DATA} margin={{ top:0, right:0, left:-30, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
                      <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:10 }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CT/>}/>
                      <Area type="monotone" dataKey="registrations" name="Inscriptions" stroke="#2563EB" strokeWidth={2} fill="rgba(37,99,235,.15)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="btn bg">📄 Exporter PDF</button>
              <button className="btn bg">📊 Exporter Excel</button>
              <button className="btn bp">📤 Envoyer INDH</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function XTrack() {
  const [user,   setUser]   = useState(null);
  const [active, setActive] = useState("dashboard");

  if (!user) return <LoginPage onLogin={setUser}/>;

  const pages = {
    dashboard:     <DashboardPage/>,
    platforms:     <PlatformsPage/>,
    beneficiaries: <BeneficiariesPage/>,
    programs:      <ProgramsPage/>,
    messages:      <MessagesPage/>,
    reports:       <ReportsPage/>,
  };

  return (
    <>
      <G/>
      <div className="xc">
        <Sidebar active={active} setActive={setActive}/>
        {pages[active] || <DashboardPage/>}
      </div>
    </>
  );
}
