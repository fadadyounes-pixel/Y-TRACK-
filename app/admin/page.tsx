'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

/* ── Design tokens ── */
const NAVY   = '#0a1f5c';
const BLUE   = '#2563eb';
const LBLUE  = '#eff6ff';
const BG     = '#f4f6fa';
const WHITE  = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT   = '#111827';
const MUTED  = '#6b7280';
const GREEN  = '#16a34a';
const LGREEN = '#dcfce7';
const RED    = '#dc2626';
const LRED   = '#fee2e2';
const AMBER  = '#d97706';
const LAMBER = '#fef3c7';
const PURPLE = '#7c3aed';

/* ── Helpers ── */
function genCode(name: string): string {
  const base = name.trim().toUpperCase().split(/\s+/).pop()?.slice(0, 6).replace(/[^A-Z]/g, '') || 'COORD';
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `COORD${base}${digits}`;
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
  uploadedAt?: string;
}

/* ── Sub-components ── */
function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{
      background: WHITE, borderRadius: 12, padding: '1.25rem 1.5rem',
      border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.05)',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
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
    const colors = [NAVY, BLUE, '#0284c7', '#8b5cf6', '#059669', '#d97706'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(([sector, count], i) => (
          <div key={sector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: '0.78rem', color: TEXT, fontWeight: 500 }}>{sector}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY }}>{count}</span>
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: colors[i % colors.length], width: `${(count / max) * 100}%`, transition: 'width .5s' }} />
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p style={{ fontSize: '0.8rem', color: MUTED }}>Aucune donnée</p>}
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
    <div style={{ minHeight: '100vh', background: BG, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: WHITE, borderRight: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: NAVY, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: WHITE,
            }}>T</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>TalentMap</div>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>Administration</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.75rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.6rem 0.85rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                marginBottom: 2, background: active ? LBLUE : 'transparent', textAlign: 'left',
                fontFamily: 'inherit', transition: 'background .15s',
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500, color: active ? NAVY : MUTED }}>
                  {item.label}
                </span>
                {item.id === 'coordinators' && coordinators.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: NAVY, color: WHITE, borderRadius: 12, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>
                    {coordinators.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: NAVY, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: WHITE,
            }}>A</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: MUTED }}>Administrateur</div>
            </div>
          </div>
          <button onClick={logout} style={{
            background: 'transparent', border: 'none', padding: 0,
            fontSize: '0.75rem', fontWeight: 500, color: RED, cursor: 'pointer', fontFamily: 'inherit',
          }}>→ Déconnexion</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem 3rem' }}>

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
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Vue d'ensemble</h1>
                <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: '1.5rem' }}>Tableau de bord administrateur — données en temps réel</p>

                {/* KPI grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                  <StatCard label="Coordinateurs" value={coordinators.length} color={PURPLE} icon="👥" />
                  <StatCard label="Offres d'emploi" value={jobs.length} color={AMBER} icon="💼" />
                  <StatCard label="Candidats" value={cvs.length} color={BLUE} icon="🎯" />
                  <StatCard label="Score moyen" value={avgMatch ? avgMatch + '%' : '—'} color={GREEN} icon="⭐" />
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 12, padding: '1.25rem', border: `1px solid ${BORDER}` }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: '1rem' }}>💼 Offres par secteur</h2>
                    <SectorBars items={jobs} key_="sector" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 12, padding: '1.25rem', border: `1px solid ${BORDER}` }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: '1rem' }}>🎯 Candidats par secteur</h2>
                    <SectorBars items={cvs} key_="sector" />
                  </div>
                </div>

                {/* Recent coordinators + activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 12, padding: '1.25rem', border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY }}>👥 Coordinateurs récents</h2>
                      <button onClick={() => setTab('coordinators')} style={{ fontSize: '0.75rem', color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Gérer →</button>
                    </div>
                    {coordinators.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                        <div style={{ fontSize: '0.8rem' }}>Aucun coordinateur créé</div>
                        <button onClick={() => setTab('coordinators')} style={{ marginTop: 10, padding: '0.4rem 0.85rem', borderRadius: 7, border: `1.5px solid ${BLUE}`, background: LBLUE, color: NAVY, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>+ Ajouter</button>
                      </div>
                    ) : coordinators.slice(-5).reverse().map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0', borderBottom: `1px solid #f9fafb` }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: NAVY, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: WHITE }}>
                          {c.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: MUTED, fontFamily: 'monospace' }}>{c.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: WHITE, borderRadius: 12, padding: '1.25rem', border: `1px solid ${BORDER}` }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: '1rem' }}>⚡ Activité récente</h2>
                    {activity.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: MUTED }}>Aucune activité enregistrée.</p>
                    ) : activity.slice(0, 8).map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0.55rem 0', borderBottom: i < 7 ? `1px solid #f9fafb` : 'none' }}>
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
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Coordinateurs</h1>
                <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: '1.5rem' }}>
                  Créez des comptes coordinateurs — le code généré leur permet de se connecter.
                </p>

                {/* Add form */}
                <div style={{ background: WHITE, borderRadius: 12, padding: '1.5rem', border: `1px solid ${BORDER}`, marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: '1rem' }}>➕ Ajouter un coordinateur</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: NAVY, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom complet *</label>
                      <input
                        value={newName} onChange={e => { setNewName(e.target.value); setSavedCode(''); }}
                        placeholder="ex: Khalid Benali"
                        style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 9, border: `1.5px solid ${newName ? BLUE : BORDER}`, fontSize: '0.88rem', fontFamily: 'inherit', color: TEXT, background: newName ? LBLUE : '#f9fafb', boxSizing: 'border-box', outline: 'none', transition: 'border-color .15s' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: NAVY, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Email (optionnel)</label>
                      <input
                        value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        placeholder="khalid@entreprise.ma"
                        type="email"
                        style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.88rem', fontFamily: 'inherit', color: TEXT, background: '#f9fafb', boxSizing: 'border-box', outline: 'none' }}
                      />
                    </div>
                    <button
                      onClick={addCoordinator}
                      disabled={saving || !newName.trim()}
                      style={{
                        padding: '0.7rem 1.5rem', borderRadius: 9, border: 'none', cursor: saving || !newName.trim() ? 'not-allowed' : 'pointer',
                        background: saving || !newName.trim() ? '#9ca3af' : NAVY, color: WHITE,
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
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY }}>Comptes coordinateurs ({coordinators.length})</h2>
                    <button onClick={fetchData} style={{ fontSize: '0.78rem', color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>⟳ Actualiser</button>
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
                          <tr style={{ background: '#f9fafb' }}>
                            {['Coordinateur', 'Email', 'Code d\'accès', 'Créé le', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {coordinators.map((c, i) => (
                            <tr key={c.id} style={{ borderTop: `1px solid #f3f4f6`, background: i % 2 === 0 ? WHITE : '#fafafa' }}>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: NAVY, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: WHITE }}>{c.name[0]}</div>
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
                    Le coordinateur va sur la page de connexion et saisit son code d'accès (ex: <code style={{ fontFamily: 'monospace', background: WHITE, padding: '1px 5px', borderRadius: 4 }}>COORDBENALI1234</code>).
                    Il sera automatiquement redirigé vers son tableau de bord.
                  </div>
                </div>
              </div>
            )}

            {/* ════════ JOB OFFERS ════════ */}
            {tab === 'jobs' && (
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Offres d'emploi</h1>
                <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: '1.5rem' }}>
                  {jobs.length} offre{jobs.length > 1 ? 's' : ''} publiée{jobs.length > 1 ? 's' : ''} par les coordinateurs
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Rechercher titre, entreprise…"
                    style={{ flex: '1 1 220px', padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, background: WHITE, outline: 'none' }}
                  />
                  <select value={jobSectorFilter} onChange={e => setJobSector(e.target.value)}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${jobSectorFilter ? BLUE : BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: jobSectorFilter ? NAVY : MUTED, background: jobSectorFilter ? LBLUE : WHITE, appearance: 'none', cursor: 'pointer' }}>
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
                          <tr style={{ background: '#f9fafb' }}>
                            {['Titre', 'Entreprise', 'Secteur', 'Expérience', 'Ville', 'Compétences', 'Statut', ''].map(h => (
                              <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredJobs.map((j, i) => (
                            <tr key={j.id} style={{ borderTop: `1px solid #f3f4f6`, background: i % 2 === 0 ? WHITE : '#fafafa' }}>
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
                                    <span key={s} style={{ background: '#f3f4f6', color: MUTED, borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>
                                  ))}
                                  {(j.skills || []).length > 3 && <span style={{ color: MUTED, fontSize: '0.68rem' }}>+{(j.skills || []).length - 3}</span>}
                                </div>
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
                    <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${BORDER}`, background: '#f9fafb', fontSize: '0.75rem', color: MUTED }}>
                      {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} affichée{filteredJobs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════ CANDIDATES ════════ */}
            {tab === 'candidates' && (
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Candidats</h1>
                <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: '1.5rem' }}>
                  {cvs.length} CV{cvs.length > 1 ? 's' : ''} dans la base de données
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    value={cvSearch} onChange={e => setCvSearch(e.target.value)}
                    placeholder="Rechercher nom, secteur…"
                    style={{ flex: '1 1 220px', padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, background: WHITE, outline: 'none' }}
                  />
                  <select value={cvSectorFilter} onChange={e => setCvSector(e.target.value)}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${cvSectorFilter ? BLUE : BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: cvSectorFilter ? NAVY : MUTED, background: cvSectorFilter ? LBLUE : WHITE, appearance: 'none', cursor: 'pointer' }}>
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
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: NAVY, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: WHITE }}>
                              {(c.name || c.fileName || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: NAVY }}>{c.name || c.fileName || 'Candidat'}</div>
                              <div style={{ fontSize: '0.75rem', color: MUTED }}>
                                {[c.email, c.phone].filter(Boolean).join(' · ')}
                              </div>
                            </div>
                          </div>
                          {c.matchScore !== undefined && c.matchScore > 0 && (
                            <span style={{ background: c.matchScore >= 70 ? LGREEN : LBLUE, color: c.matchScore >= 70 ? GREEN : BLUE, borderRadius: 9999, padding: '0.25rem 0.85rem', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
                              {c.matchScore}% match
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {c.sector && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Secteur</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.sector}</div></div>}
                          {c.experience && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Expérience</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.experience}</div></div>}
                        </div>
                        {c.skills?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {c.skills.map((s: string) => (
                              <span key={s} style={{ background: LBLUE, color: BLUE, borderRadius: 4, padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 600 }}>{s}</span>
                            ))}
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
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Rapports</h1>
                <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: '1.5rem' }}>
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
                      <button onClick={() => generateReport(r.type)} style={{
                        width: '100%', padding: '0.65rem', borderRadius: 8, border: 'none',
                        background: r.color, color: WHITE, fontSize: '0.85rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>⬇ Télécharger</button>
                    </div>
                  ))}
                </div>

                {/* Platform summary */}
                <div style={{ background: WHITE, borderRadius: 12, padding: '1.5rem', border: `1px solid ${BORDER}`, marginTop: '1.5rem' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: '1rem' }}>📊 Résumé de la plateforme</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Coordinateurs', value: coordinators.length },
                      { label: 'Offres actives', value: jobs.filter(j => j.status !== 'Fermé').length },
                      { label: 'Total candidats', value: cvs.length },
                      { label: 'Score moyen', value: avgMatch ? avgMatch + '%' : '—' },
                      { label: 'Secteurs représentés', value: cvSectors.length },
                      { label: 'Offres par secteur', value: jobSectors.length },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '0.85rem', background: '#f9fafb', borderRadius: 9, border: `1px solid ${BORDER}` }}>
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
      </main>
    </div>
  );
}
