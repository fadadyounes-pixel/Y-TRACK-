'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

/* ── Design tokens ──────────────────────────────────────────────────────
 * Dark dashboard layout inspired by CareerMap's admin (card structure,
 * avatar shapes, table striping) but recolored to TalentMap's own brand —
 * the cobalt blue from the logo (components/Logo.tsx: #1B4FD8 pin,
 * #3B82F6/#93C5FD for dark backgrounds) instead of CareerMap's teal.
 * No data, tabs, or behavior changed. Token NAMES are kept as-is to
 * minimize the diff; a few no longer match their literal name (WHITE/NAVY
 * now hold surface/text roles instead of literal white/navy) — see the
 * inline notes below.
 */
const INK    = '#0A0E1A';   // Page + sidebar background (was dark navy — stays dark)
const COBALT = '#3B82F6';   // Primary accent — TalentMap brand blue, dark-bg variant from the logo
const NAVY   = '#F1F5F9';   // Heading/value text on cards — near-white (was dark text)
const BLUE   = '#60A5FA';   // Secondary accent — lighter brand blue
const LBLUE  = 'rgba(59,130,246,.14)';  // Brand-blue tint — chip/badge backgrounds
const MIST   = 'rgba(59,130,246,.22)';  // Stronger brand-blue tint
const BG     = '#0A0E1A';   // Page background (was light gray)
const WHITE  = '#111827';   // Card/surface background (was literal white) — literal white text-on-accent uses '#ffffff' directly, see below
const BORDER = 'rgba(255,255,255,.08)';
const BORDER2= 'rgba(255,255,255,.16)';
const TEXT   = '#E2E8F0';   // Primary body text (was dark)
const TEXT2  = '#CBD5E1';   // Secondary body text
const MUTED  = '#8B95A8';   // Muted label text
const FAINT  = '#5B6478';   // Faint/placeholder text
const GREEN  = '#22C55E';
const LGREEN = 'rgba(34,197,94,.14)';
const GTEXT  = '#4ADE80';
const RED    = '#F87171';
const LRED   = 'rgba(248,113,113,.14)';
const RTEXT  = '#FCA5A5';
const AMBER  = '#F5B301';
const LAMBER = 'rgba(245,179,1,.14)';
const ATEXT  = '#FCD34D';
const PURPLE = '#A78BFA';
const LPURP  = 'rgba(167,139,250,.14)';
const PTEXT  = '#C4B5FD';

/* ── Helpers ── */
// Coordinator code shape: NAME + COR + 4 digits (e.g. BENALICOR4821) — mirrors
// the same name+role-suffix convention used for coordinator codes elsewhere.
function genCode(name: string): string {
  const base = name.trim().toUpperCase().split(/\s+/).pop()?.slice(0, 6).replace(/[^A-Z]/g, '') || 'COR';
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${base}COR${digits}`;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type Tab = 'overview' | 'coordinators' | 'jobs' | 'candidates' | 'reports';

interface Coordinator {
  id: string;
  name: string;
  email: string;
  code: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  sector: string;
  experience: string;
  location: string;
  status?: string;
  skills?: string[];
  description?: string;
  createdAt?: string;
  educationLevel?: string;
  languages?: string[];
  postedBy?: { id: string; name: string; code: string };
}

interface CV {
  id: string;
  name?: string;
  fileName?: string;
  sector?: string;
  experience?: string;
  skills?: string[];
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  cin?: string;
  birthDate?: string;
  diploma?: string;
  institution?: string;
  graduationYear?: string;
  linkedin?: string;
  portfolio?: string;
  targetRoles?: string[];
  certifications?: string[];
  work?: { company?: string; title?: string }[];
  educationLevel?: string;
  languages?: string[];
  uploadedAt?: string;
}

/* ── Sub-components ── */
function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div style={{
      background: WHITE, borderRadius: 10,
      border: `1px solid ${BORDER}`, padding: '1.25rem 1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, borderRadius: 6, padding: '0.18rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>
      {label}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
      title="Copy code"
      style={{
        padding: '0.2rem 0.5rem', borderRadius: 5, border: `1px solid ${BORDER}`,
        background: copied ? LGREEN : WHITE, color: copied ? GREEN : MUTED,
        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
      }}
    >{copied ? '✓' : '⎘'}</button>
  );
}

export default function AdminDashboard() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('overview');
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  /* Coordinator form */
  const [newName, setNewName]   = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving]     = useState(false);
  const [savedCode, setSavedCode] = useState('');

  /* Filters */
  const [jobSearch, setJobSearch]         = useState('');
  const [cvSearch, setCvSearch]           = useState('');
  const [jobSectorFilter, setJobSector]   = useState('');
  const [cvSectorFilter, setCvSector]     = useState('');
  const [expandedCv, setExpandedCv]       = useState<string | null>(null);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, initialized, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheets');
      const data = await res.json();
      setCoordinators(data.coordinators || []);
      setJobs(data.jobs || []);
      setCvs(data.cvs || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.role === 'admin') fetchData(); }, [user, fetchData]);

  if (!initialized || !user || user.role !== 'admin') return null;

  /* ── Coordinator actions ── */
  async function addCoordinator() {
    if (!newName.trim()) return;
    setSaving(true);
    const code = genCode(newName);
    const coord: Coordinator = {
      id: uid(), name: newName.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@talentmap.ma`,
      code, createdAt: new Date().toISOString(),
    };
    try {
      await fetch('/api/sheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_coordinator', coordinator: coord }),
      });
      setCoordinators(p => [...p, coord]);
      setSavedCode(code);
      setNewName(''); setNewEmail('');
    } catch {}
    setSaving(false);
  }

  async function deleteCoordinator(id: string) {
    setCoordinators(p => p.filter(c => c.id !== id));
    await fetch('/api/sheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delete_coordinator', id }),
    });
  }

  async function deleteJob(id: string) {
    setJobs(p => p.filter(j => j.id !== id));
    await fetch('/api/sheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delete_job', id }),
    });
  }

  /* ── Derived stats ── */
  const avgMatch = cvs.length
    ? Math.round(cvs.reduce((s, c: any) => s + (c.matchScore || 0), 0) / cvs.length)
    : 0;

  const jobSectors = [...new Set(jobs.map(j => j.sector).filter(Boolean))];
  const cvSectors  = [...new Set(cvs.map(c => c.sector).filter(Boolean))];

  const filteredJobs = jobs.filter(j => {
    const q = jobSearch.toLowerCase();
    const matchQ = !q || (j.title || '').toLowerCase().includes(q) || (j.company || '').toLowerCase().includes(q);
    const matchS = !jobSectorFilter || j.sector === jobSectorFilter;
    return matchQ && matchS;
  });

  const filteredCvs = cvs.filter(c => {
    const q = cvSearch.toLowerCase();
    const name = (c.name || c.fileName || '').toLowerCase();
    const matchQ = !q || name.includes(q) || (c.sector || '').toLowerCase().includes(q);
    const matchS = !cvSectorFilter || c.sector === cvSectorFilter;
    return matchQ && matchS;
  });

  /* ── Report generator ── */
  function generateReport(type: string) {
    const now = new Date().toLocaleDateString('fr-MA');
    const jobRows = jobs.map(j =>
      `<tr><td>${j.title}</td><td>${j.company}</td><td>${j.sector}</td><td>${j.experience}</td><td>${j.location}</td><td>${j.status || 'Active'}</td></tr>`
    ).join('');
    const cvRows = cvs.map((c: any) =>
      `<tr><td>${c.name || c.fileName || '—'}</td><td>${c.email || '—'}</td><td>${c.sector || '—'}</td><td>${c.experience || '—'}</td><td>${(c.skills || []).join(', ')}</td><td>${c.matchScore || '—'}%</td></tr>`
    ).join('');
    const coordRows = coordinators.map(c =>
      `<tr><td>${c.name}</td><td>${c.email}</td><td style="font-family:monospace">${c.code}</td><td>${new Date(c.createdAt).toLocaleDateString('fr-MA')}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>TalentMap — Rapport Admin</title>
<style>body{font-family:'Segoe UI',sans-serif;color:#111827;padding:2rem;max-width:1100px;margin:0 auto}
h1{color:#0a1f5c}h2{color:#2563eb;margin:2rem 0 .75rem;font-size:1.1rem}
p{color:#6b7280;margin-bottom:2rem}
table{width:100%;border-collapse:collapse;margin-bottom:2rem;font-size:.85rem}
th{background:#0a1f5c;color:white;padding:.55rem .75rem;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em}
td{padding:.55rem .75rem;border-bottom:1px solid #f3f4f6}
tr:nth-child(even) td{background:#f9fafb}
.footer{text-align:center;color:#9ca3af;font-size:.75rem;margin-top:2rem;padding-top:1rem;border-top:1px solid #f3f4f6}
</style></head><body>
<h1>TalentMap — Rapport ${type}</h1>
<p>Généré le ${now} · ${type === 'Coordinators' ? coordinators.length + ' coordinateurs' : type === 'Jobs' ? jobs.length + ' offres' : type === 'Candidates' ? cvs.length + ' candidats' : 'rapport complet'}</p>
${(type === 'Coordinators' || type === 'Full') ? `<h2>Coordinateurs (${coordinators.length})</h2>
<table><thead><tr><th>Nom</th><th>Email</th><th>Code d'accès</th><th>Créé le</th></tr></thead><tbody>${coordRows}</tbody></table>` : ''}
${(type === 'Jobs' || type === 'Full') ? `<h2>Offres d'emploi (${jobs.length})</h2>
<table><thead><tr><th>Titre</th><th>Entreprise</th><th>Secteur</th><th>Expérience</th><th>Ville</th><th>Statut</th></tr></thead><tbody>${jobRows}</tbody></table>` : ''}
${(type === 'Candidates' || type === 'Full') ? `<h2>Candidats (${cvs.length})</h2>
<table><thead><tr><th>Nom</th><th>Email</th><th>Secteur</th><th>Expérience</th><th>Compétences</th><th>Score</th></tr></thead><tbody>${cvRows}</tbody></table>` : ''}
<div class="footer">TalentMap Recruitment Platform · ${now}</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `TalentMap_${type}_${now.replace(/\//g, '-')}.html` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── CSV export ── */
  function downloadCSV(type: 'Candidates' | 'Jobs' | 'Coordinators') {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    let rows: (string | number)[][] = [];
    if (type === 'Candidates') {
      rows = [
        ['Nom', 'Email', 'Téléphone', 'Ville', 'Secteur', 'Expérience', 'Formation', 'Langues', 'Compétences', 'Score match', 'Inscrit le'],
        ...cvs.map((c: any) => [
          c.name || c.fileName || '', c.email || '', c.phone || '', c.city || '',
          c.sector || '', c.experience || '', c.educationLevel || '',
          (c.languages || []).join('; '), (c.skills || []).join('; '),
          c.matchScore != null ? `${c.matchScore}%` : '',
          c.uploadedAt ? new Date(c.uploadedAt).toLocaleDateString('fr-MA') : '',
        ]),
      ];
    } else if (type === 'Jobs') {
      rows = [
        ['Titre', 'Entreprise', 'Secteur', 'Expérience', 'Ville', 'Formation requise', 'Langues requises', 'Compétences', 'Statut', 'Publiée le'],
        ...jobs.map(j => [
          j.title, j.company, j.sector, j.experience, j.location,
          j.educationLevel || '', (j.languages || []).join('; '),
          (j.skills || []).join('; '), j.status || 'Active',
          j.createdAt ? new Date(j.createdAt).toLocaleDateString('fr-MA') : '',
        ]),
      ];
    } else {
      rows = [
        ['Nom', 'Email', 'Code', 'Créé le'],
        ...coordinators.map(c => [c.name, c.email, c.code, c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-MA') : '']),
      ];
    }
    const csv = rows.map(r => r.map(esc).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `TalentMap_${type}_${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Sidebar nav ── */
  const NAV: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview',     icon: '📊', label: 'Vue d\'ensemble' },
    { id: 'coordinators', icon: '👥', label: 'Coordinateurs' },
    { id: 'jobs',         icon: '💼', label: 'Offres d\'emploi' },
    { id: 'candidates',   icon: '🎯', label: 'Candidats' },
    { id: 'reports',      icon: '📋', label: 'Rapports' },
  ];

  /* ── Sector bar helper ── */
  function SectorBars({ items, key_ }: { items: any[]; key_: string }) {
    const counts: Record<string, number> = {};
    items.forEach(i => { const s = i[key_] || 'Autre'; counts[s] = (counts[s] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] || 1;
    const colors = [COBALT, BLUE, PURPLE, GREEN, AMBER, '#f472b6'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(([sector, count], i) => (
          <div key={sector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: '0.78rem', color: TEXT, fontWeight: 500 }}>{sector}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY }}>{count}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: colors[i % colors.length], width: `${(count / max) * 100}%`, transition: 'width .5s' }} />
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p style={{ fontSize: '0.8rem', color: MUTED }}>Aucune donnée</p>}
      </div>
    );
  }

  /* ── Growth trend — candidates & jobs registered per week, last 8 weeks ── */
  function weekLabel(weeksBack: number): string {
    const d = new Date();
    d.setDate(d.getDate() - weeksBack * 7);
    return d.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit' });
  }

  function GrowthTrend({ candidates, jobList }: { candidates: CV[]; jobList: Job[] }) {
    const WEEKS = 8;
    const now = Date.now();
    const weekOf = (dateStr?: string): number => {
      if (!dateStr) return -1;
      const t = new Date(dateStr).getTime();
      if (Number.isNaN(t)) return -1;
      const diffWeeks = Math.floor((now - t) / (7 * 24 * 3600 * 1000));
      return diffWeeks >= 0 && diffWeeks < WEEKS ? WEEKS - 1 - diffWeeks : -1;
    };
    const candBuckets = Array(WEEKS).fill(0);
    candidates.forEach(c => { const b = weekOf(c.uploadedAt); if (b >= 0) candBuckets[b]++; });
    const jobBuckets = Array(WEEKS).fill(0);
    jobList.forEach(j => { const b = weekOf(j.createdAt); if (b >= 0) jobBuckets[b]++; });
    const max = Math.max(1, ...candBuckets, ...jobBuckets);
    const hasData = candBuckets.some(n => n > 0) || jobBuckets.some(n => n > 0);

    return (
      <div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: COBALT, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: MUTED }}>Candidats</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: AMBER, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: MUTED }}>Offres</span>
          </div>
        </div>
        {!hasData ? (
          <p style={{ fontSize: '0.8rem', color: MUTED }}>Pas encore assez de données pour une tendance.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
            {Array.from({ length: WEEKS }).map((_, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 96 }}>
                  <div title={`${candBuckets[i]} candidat(s)`} style={{ width: 9, borderRadius: 3, background: COBALT, height: `${Math.max((candBuckets[i] / max) * 100, candBuckets[i] > 0 ? 4 : 0)}%` }} />
                  <div title={`${jobBuckets[i]} offre(s)`} style={{ width: 9, borderRadius: 3, background: AMBER, height: `${Math.max((jobBuckets[i] / max) * 100, jobBuckets[i] > 0 ? 4 : 0)}%` }} />
                </div>
                <span style={{ fontSize: '0.6rem', color: FAINT }}>{weekLabel(WEEKS - 1 - i)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Activity feed (derived from jobs + cvs + coordinators) ── */
  const activity = [
    ...coordinators.slice(-4).map(c => ({ time: new Date(c.createdAt).toLocaleDateString('fr-MA'), text: `Coordinateur ajouté : ${c.name}`, color: PURPLE })),
    ...jobs.slice(-4).map(j => ({ time: j.createdAt ? new Date(j.createdAt).toLocaleDateString('fr-MA') : 'Récemment', text: `Offre publiée : ${j.title} chez ${j.company}`, color: AMBER })),
    ...cvs.slice(-4).map((c: any) => ({ time: c.uploadedAt ? new Date(c.uploadedAt).toLocaleDateString('fr-MA') : 'Récemment', text: `CV reçu : ${c.name || c.fileName || 'Candidat'}`, color: BLUE })),
  ].sort(() => -0.5 + Math.random()).slice(0, 10);

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display: 'flex' }}>

      {/* ── Dark Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: INK,
        position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <Logo size="md" variant="light" />
        </div>

        {/* User pill */}
        <div style={{ margin: '0.75rem 0.875rem', padding: '0.6rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Administrateur</div>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.id}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.6rem 0.75rem', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(27,79,216,.85)' : 'transparent',
                color: active ? WHITE : 'rgba(255,255,255,.5)',
                fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                textAlign: 'left', fontFamily: 'inherit', transition: 'all .18s',
              }}>
                <span style={{ fontSize: '0.9rem', width: 18, flexShrink: 0, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'coordinators' && coordinators.length > 0 && (
                  <span style={{ background: 'rgba(255,255,255,.15)', color: '#ffffff', borderRadius: 10, padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                    {coordinators.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.75rem', borderRadius: 7, background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.35)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↩ Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, minWidth: 0, background: BG, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, margin: 0 }}>
            {NAV.find(n => n.id === tab)?.label ?? 'Administration'}
          </h1>
          <button onClick={fetchData} style={{ fontSize: '0.78rem', color: COBALT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>⟳ Actualiser</button>
        </div>

        <div style={{ padding: '1.75rem 2rem 3rem' }}>

        {loading && tab !== 'overview' ? (
          <div style={{ textAlign: 'center', paddingTop: '6rem', color: MUTED }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: '0.9rem' }}>Chargement des données…</div>
          </div>
        ) : (
          <>

            {/* ════════ OVERVIEW ════════ */}
            {tab === 'overview' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Vue d'ensemble</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>Données en temps réel · Administration TalentMap</p>

                {/* KPI grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                  <StatCard label="Coordinateurs" value={coordinators.length} accent={PURPLE} />
                  <StatCard label="Offres d'emploi" value={jobs.length} accent={AMBER} />
                  <StatCard label="Candidats" value={cvs.length} accent={COBALT} />
                  <StatCard label="Score moyen" value={avgMatch ? avgMatch + '%' : '—'} accent={GREEN} />
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Offres par secteur</h2>
                    <SectorBars items={jobs} key_="sector" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Candidats par secteur</h2>
                    <SectorBars items={cvs} key_="sector" />
                  </div>
                </div>

                {/* Geography + growth trend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Offres par ville</h2>
                    <SectorBars items={jobs} key_="location" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Candidats par ville</h2>
                    <SectorBars items={cvs} key_="city" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Tendance d'inscription (8 sem.)</h2>
                    <GrowthTrend candidates={cvs} jobList={jobs} />
                  </div>
                </div>

                {/* Recent coordinators + activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '.04em' }}>Coordinateurs récents</h2>
                      <button onClick={() => setTab('coordinators')} style={{ fontSize: '0.75rem', color: COBALT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Gérer →</button>
                    </div>
                    {coordinators.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                        <div style={{ fontSize: '0.82rem' }}>Aucun coordinateur créé</div>
                        <button onClick={() => setTab('coordinators')} style={{ marginTop: 10, padding: '0.4rem 0.85rem', borderRadius: 7, border: `1.5px solid ${COBALT}`, background: LBLUE, color: NAVY, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
                      </div>
                    ) : coordinators.slice(-5).reverse().map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0', borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: PURPLE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#ffffff' }}>
                          {c.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: MUTED, fontFamily: 'monospace' }}>{c.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Activité récente</h2>
                    {activity.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: MUTED }}>Aucune activité enregistrée.</p>
                    ) : activity.slice(0, 8).map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0.55rem 0', borderBottom: i < 7 ? `1px solid rgba(255,255,255,.06)` : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 6, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '0.8rem', color: TEXT }}>{a.text}</div>
                        <span style={{ fontSize: '0.7rem', color: MUTED, flexShrink: 0 }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ COORDINATORS ════════ */}
            {tab === 'coordinators' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Coordinateurs</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  Créez des comptes coordinateurs — le code généré leur permet de se connecter.
                </p>

                {/* Add form */}
                <div style={{ background: WHITE, borderRadius: 10, padding: '1.5rem', border: `1px solid ${BORDER}`, marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                  <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Ajouter un coordinateur</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: NAVY, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom complet *</label>
                      <input
                        value={newName} onChange={e => { setNewName(e.target.value); setSavedCode(''); }}
                        placeholder="ex: Khalid Benali"
                        style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 8, border: `1.5px solid ${newName ? COBALT : BORDER}`, fontSize: '0.875rem', fontFamily: 'inherit', color: TEXT, background: newName ? LBLUE : 'rgba(255,255,255,.04)', boxSizing: 'border-box', outline: 'none', transition: 'border-color .15s' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: NAVY, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Email (optionnel)</label>
                      <input
                        value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        placeholder="khalid@entreprise.ma"
                        type="email"
                        style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: '0.875rem', fontFamily: 'inherit', color: TEXT, background: 'rgba(255,255,255,.04)', boxSizing: 'border-box', outline: 'none' }}
                      />
                    </div>
                    <button
                      onClick={addCoordinator}
                      disabled={saving || !newName.trim()}
                      style={{
                        padding: '0.7rem 1.5rem', borderRadius: 8, border: 'none', cursor: saving || !newName.trim() ? 'not-allowed' : 'pointer',
                        background: saving || !newName.trim() ? FAINT : INK, color: '#ffffff',
                        fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
                        transition: 'background .15s',
                      }}
                    >{saving ? '⏳ Création…' : '+ Créer le compte'}</button>
                  </div>

                  {/* Success — show generated code */}
                  {savedCode && (
                    <div style={{ marginTop: '1rem', padding: '0.9rem 1.1rem', background: LGREEN, border: `1.5px solid ${GREEN}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1rem' }}>✅</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: GREEN, marginBottom: 2 }}>Compte créé avec succès !</div>
                        <div style={{ fontSize: '0.8rem', color: TEXT }}>Code d'accès généré :</div>
                      </div>
                      <code style={{ background: WHITE, border: `1.5px solid ${GREEN}`, borderRadius: 7, padding: '0.3rem 0.85rem', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800, color: NAVY, letterSpacing: '0.1em' }}>{savedCode}</code>
                      <CopyBtn text={savedCode} />
                      <span style={{ fontSize: '0.75rem', color: MUTED, marginLeft: 'auto' }}>Transmettez ce code au coordinateur pour qu'il puisse se connecter.</span>
                    </div>
                  )}
                </div>

                {/* Coordinators table */}
                <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div style={{ padding: '1.1rem 1.4rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '.04em' }}>Comptes coordinateurs ({coordinators.length})</h2>
                    <button onClick={fetchData} style={{ fontSize: '0.78rem', color: COBALT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>⟳ Actualiser</button>
                  </div>
                  {coordinators.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>Aucun coordinateur</div>
                      <div style={{ fontSize: '0.85rem' }}>Créez votre premier compte coordinateur ci-dessus.</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,.04)' }}>
                            {['Coordinateur', 'Email', 'Code d\'accès', 'Créé le', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {coordinators.map((c, i) => (
                            <tr key={c.id} style={{ borderTop: `1px solid rgba(255,255,255,.06)`, background: i % 2 === 0 ? WHITE : 'rgba(255,255,255,.02)' }}>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 9, background: PURPLE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#ffffff' }}>{c.name[0]}</div>
                                  <div style={{ fontWeight: 600, color: TEXT }}>{c.name}</div>
                                </div>
                              </td>
                              <td style={{ padding: '0.8rem 1rem', color: MUTED }}>{c.email}</td>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <code style={{ background: LBLUE, borderRadius: 5, padding: '0.2rem 0.6rem', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: NAVY, letterSpacing: '0.06em' }}>{c.code}</code>
                                  <CopyBtn text={c.code} />
                                </div>
                              </td>
                              <td style={{ padding: '0.8rem 1rem', color: MUTED, fontSize: '0.8rem' }}>
                                {new Date(c.createdAt).toLocaleDateString('fr-MA')}
                              </td>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                <button
                                  onClick={() => { if (confirm(`Supprimer le compte de ${c.name} ?`)) deleteCoordinator(c.id); }}
                                  style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: `1px solid ${RED}`, background: LRED, color: RED, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >Supprimer</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Login hint */}
                <div style={{ marginTop: '1rem', padding: '0.9rem 1.1rem', background: LBLUE, borderRadius: 10, border: `1px solid ${BLUE}22` }}>
                  <div style={{ fontSize: '0.8rem', color: NAVY, fontWeight: 600, marginBottom: 3 }}>ℹ️ Comment se connecter ?</div>
                  <div style={{ fontSize: '0.78rem', color: MUTED }}>
                    Le coordinateur va sur la page de connexion et saisit son code d'accès (ex: <code style={{ fontFamily: 'monospace', background: WHITE, padding: '1px 5px', borderRadius: 4 }}>BENALICOR4821</code>).
                    Il sera automatiquement redirigé vers son tableau de bord.
                  </div>
                </div>
              </div>
            )}

            {/* ════════ JOB OFFERS ════════ */}
            {tab === 'jobs' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Offres d'emploi</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  {jobs.length} offre{jobs.length > 1 ? 's' : ''} publiée{jobs.length > 1 ? 's' : ''} par les coordinateurs
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Rechercher titre, entreprise…"
                    style={{ flex: '1 1 220px', padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, background: WHITE, outline: 'none', transition: 'border-color .15s' }}
                  />
                  <select value={jobSectorFilter} onChange={e => setJobSector(e.target.value)}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${jobSectorFilter ? COBALT : BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: jobSectorFilter ? NAVY : MUTED, background: jobSectorFilter ? LBLUE : WHITE, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Tous les secteurs</option>
                    {jobSectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => { setJobSearch(''); setJobSector(''); }} style={{ padding: '0.65rem 1rem', borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: '0.8rem', cursor: 'pointer' }}>✕ Réinitialiser</button>
                </div>

                {filteredJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: MUTED, background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                      {jobs.length === 0 ? 'Aucune offre publiée' : 'Aucun résultat'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {jobs.length === 0 ? 'Les coordinateurs peuvent publier des offres depuis leur tableau de bord.' : 'Modifiez vos filtres de recherche.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,.04)' }}>
                            {['Titre', 'Entreprise', 'Secteur', 'Expérience', 'Ville', 'Compétences', 'Publiée par', 'Statut', ''].map(h => (
                              <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredJobs.map((j, i) => (
                            <tr key={j.id} style={{ borderTop: `1px solid rgba(255,255,255,.06)`, background: i % 2 === 0 ? WHITE : 'rgba(255,255,255,.02)' }}>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>{j.title}</td>
                              <td style={{ padding: '0.85rem 1rem', color: TEXT, fontWeight: 500 }}>{j.company}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <Badge label={j.sector} color={NAVY} bg={LBLUE} />
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: MUTED, fontSize: '0.82rem' }}>{j.experience}</td>
                              <td style={{ padding: '0.85rem 1rem', color: MUTED, fontSize: '0.82rem' }}>{j.location}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {(j.skills || []).slice(0, 3).map(s => (
                                    <span key={s} style={{ background: 'rgba(255,255,255,.08)', color: MUTED, borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>
                                  ))}
                                  {(j.skills || []).length > 3 && <span style={{ color: MUTED, fontSize: '0.68rem' }}>+{(j.skills || []).length - 3}</span>}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: MUTED, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                {j.postedBy?.name || j.postedBy?.code || <span style={{ fontStyle: 'italic', color: FAINT }}>Inconnu</span>}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <Badge label={j.status || 'Active'} color={j.status === 'Fermé' ? RED : GREEN} bg={j.status === 'Fermé' ? LRED : LGREEN} />
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <button
                                  onClick={() => { if (confirm(`Supprimer l'offre "${j.title}" ?`)) deleteJob(j.id); }}
                                  style={{ padding: '0.25rem 0.65rem', borderRadius: 5, border: `1px solid ${BORDER}`, background: WHITE, color: RED, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                                >✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${BORDER}`, background: 'rgba(255,255,255,.04)', fontSize: '0.75rem', color: MUTED }}>
                      {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} affichée{filteredJobs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════ CANDIDATES ════════ */}
            {tab === 'candidates' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Candidats</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  {cvs.length} CV{cvs.length > 1 ? 's' : ''} dans la base de données
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    value={cvSearch} onChange={e => setCvSearch(e.target.value)}
                    placeholder="Rechercher nom, secteur…"
                    style={{ flex: '1 1 220px', padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, background: WHITE, outline: 'none', transition: 'border-color .15s' }}
                  />
                  <select value={cvSectorFilter} onChange={e => setCvSector(e.target.value)}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${cvSectorFilter ? COBALT : BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: cvSectorFilter ? NAVY : MUTED, background: cvSectorFilter ? LBLUE : WHITE, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Tous les secteurs</option>
                    {cvSectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => { setCvSearch(''); setCvSector(''); }} style={{ padding: '0.65rem 1rem', borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: '0.8rem', cursor: 'pointer' }}>✕ Réinitialiser</button>
                </div>

                {filteredCvs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: MUTED, background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                      {cvs.length === 0 ? 'Aucun candidat' : 'Aucun résultat'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {cvs.length === 0 ? 'Les candidats apparaissent ici après avoir soumis leur CV.' : 'Modifiez vos filtres.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredCvs.map((c: any) => (
                      <div key={c.id} style={{ background: WHITE, borderRadius: 12, padding: '1.1rem 1.4rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: PURPLE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#ffffff' }}>
                              {(c.name || c.fileName || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: NAVY }}>{c.name || c.fileName || 'Candidat'}</div>
                              <div style={{ fontSize: '0.75rem', color: MUTED }}>
                                {[c.email, c.phone].filter(Boolean).join(' · ')}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {c.matchScore !== undefined && c.matchScore > 0 && (
                              <span style={{ background: c.matchScore >= 70 ? LGREEN : LBLUE, color: c.matchScore >= 70 ? GREEN : BLUE, borderRadius: 9999, padding: '0.25rem 0.85rem', fontSize: '0.82rem', fontWeight: 800 }}>
                                {c.matchScore}% match
                              </span>
                            )}
                            <button onClick={() => setExpandedCv(p => p === c.id ? null : c.id)} style={{ padding: '0.3rem 0.75rem', borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, color: COBALT, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                              {expandedCv === c.id ? 'Réduire ▲' : 'Détails ▼'}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {c.sector && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Secteur</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.sector}</div></div>}
                          {c.experience && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Expérience</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.experience}</div></div>}
                          {(c.city || c.region) && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Localisation</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{[c.city, c.region].filter(Boolean).join(' · ')}</div></div>}
                        </div>
                        {c.skills?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {c.skills.map((s: string) => (
                              <span key={s} style={{ background: LBLUE, color: BLUE, borderRadius: 4, padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 600 }}>{s}</span>
                            ))}
                          </div>
                        )}

                        {expandedCv === c.id && (
                          <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: `1px solid ${BORDER}`, display: 'flex', flexWrap: 'wrap', gap: '1.5rem 2rem' }}>
                            {c.cin && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>CIN</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.cin}</div></div>}
                            {c.birthDate && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Naissance</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.birthDate}</div></div>}
                            {(c.diploma || c.institution || c.graduationYear) && (
                              <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Formation</span>
                                <div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>
                                  {[c.diploma, c.institution, c.graduationYear].filter(Boolean).join(' · ')}
                                </div>
                              </div>
                            )}
                            {c.languages?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Langues</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.languages.join(', ')}</div></div>}
                            {c.work?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Expériences pro.</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.work.length} poste{c.work.length > 1 ? 's' : ''} renseigné{c.work.length > 1 ? 's' : ''}</div></div>}
                            {c.targetRoles?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Postes visés</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.targetRoles.join(', ')}</div></div>}
                            {c.certifications?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Certifications</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.certifications.join(', ')}</div></div>}
                            {(c.linkedin || c.portfolio) && (
                              <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Liens</span>
                                <div style={{ fontSize: '0.82rem', color: COBALT, fontWeight: 600 }}>{[c.linkedin, c.portfolio].filter(Boolean).join(' · ')}</div>
                              </div>
                            )}
                            {c.uploadedAt && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Dernière mise à jour</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{new Date(c.uploadedAt).toLocaleDateString('fr-MA')}</div></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════ REPORTS ════════ */}
            {tab === 'reports' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Rapports</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  Exportez les données de la plateforme en HTML téléchargeable.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {[
                    { type: 'Coordinators', icon: '👥', title: 'Rapport coordinateurs', desc: `${coordinators.length} compte${coordinators.length > 1 ? 's' : ''} avec codes d'accès`, color: PURPLE },
                    { type: 'Jobs',         icon: '💼', title: 'Rapport offres d\'emploi', desc: `${jobs.length} offre${jobs.length > 1 ? 's' : ''} publiée${jobs.length > 1 ? 's' : ''}`, color: AMBER },
                    { type: 'Candidates',   icon: '🎯', title: 'Rapport candidats',    desc: `${cvs.length} CV en base`, color: BLUE },
                    { type: 'Full',         icon: '📋', title: 'Rapport complet',      desc: 'Toutes les données consolidées', color: NAVY },
                  ].map(r => (
                    <div key={r.type} style={{ background: WHITE, borderRadius: 12, padding: '1.5rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                      <div style={{ fontSize: 32, marginBottom: '0.75rem' }}>{r.icon}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: '0.8rem', color: MUTED, marginBottom: '1.25rem' }}>{r.desc}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => generateReport(r.type)} style={{
                          flex: 1, padding: '0.65rem', borderRadius: 8, border: 'none',
                          background: r.color, color: '#ffffff', fontSize: '0.85rem', fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}>⬇ HTML</button>
                        {r.type !== 'Full' && (
                          <button onClick={() => downloadCSV(r.type as 'Candidates' | 'Jobs' | 'Coordinators')} style={{
                            flex: 1, padding: '0.65rem', borderRadius: 8, border: `1.5px solid ${r.color}`,
                            background: WHITE, color: r.color, fontSize: '0.85rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}>⬇ CSV</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform summary */}
                <div style={{ background: WHITE, borderRadius: 12, padding: '1.5rem', border: `1px solid ${BORDER}`, marginTop: '1.5rem' }}>
                  <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>📊 Résumé de la plateforme</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Coordinateurs', value: coordinators.length },
                      { label: 'Offres actives', value: jobs.filter(j => j.status !== 'Fermé').length },
                      { label: 'Total candidats', value: cvs.length },
                      { label: 'Score moyen', value: avgMatch ? avgMatch + '%' : '—' },
                      { label: 'Secteurs représentés', value: cvSectors.length },
                      { label: 'Offres par secteur', value: jobSectors.length },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '0.85rem', background: 'rgba(255,255,255,.04)', borderRadius: 9, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: NAVY }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </>
        )}
        </div>
      </main>
    </div>
  );
}
