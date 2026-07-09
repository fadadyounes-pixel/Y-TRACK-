'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AIAssistant from '../components/AIAssistant';

const NAVY = '#0a1f5c';
const BLUE = '#2563eb';
const SKY  = '#38bdf8';
const WH   = '#ffffff';
const BG   = '#f0f4ff';
const GR   = '#6b7280';
const GN   = '#22c55e';
const RE   = '#ef4444';
const BORDER = '#dde4f0';

const ALL_CANDIDATES = [
  { id: 'CAN001', name: 'Mohammed Ait Aissa', sector: 'Numérique/TIC', region: 'Casablanca-Settat', score: 87, status: 'available', skills: ['JavaScript','React','Node.js'], experience: '3 ans', education: 'Bac+3', email: 'mohammed@email.com' },
  { id: 'CAN002', name: 'Sarah Benali', sector: 'Artisanat', region: 'Fès-Meknès', score: 74, status: 'available', skills: ['Broderie','Zellige'], experience: '5 ans', education: 'Arts Trad.', email: 'sarah@email.com' },
  { id: 'CAN003', name: 'Karim Djebbar', sector: 'Agriculture/Élevage', region: 'Souss-Massa', score: 91, status: 'placed', skills: ['Irrigation','Agrumes'], experience: '7 ans', education: 'Ing. Agronome', email: 'karim@email.com' },
  { id: 'CAN004', name: 'Fatima Zahra Ouali', sector: 'Commerce/Services', region: 'Marrakech-Safi', score: 68, status: 'available', skills: ['Vente','Excel'], experience: '4 ans', education: 'BTS Commerce', email: 'fatima@email.com' },
  { id: 'CAN005', name: 'Youssef El Mansouri', sector: 'BTP/Maçonnerie', region: 'Oriental', score: 82, status: 'pending', skills: ['Maçonnerie','AutoCAD'], experience: '10 ans', education: 'OFPPT', email: 'youssef@email.com' },
  { id: 'CAN006', name: 'Amina Tahiri', sector: 'Numérique/TIC', region: 'Casablanca-Settat', score: 78, status: 'available', skills: ['UX Design','Figma'], experience: '2 ans', education: 'Bac+3 Design', email: 'amina@email.com' },
];

const ALL_USERS = [
  { id: '1', name: 'Admin TalentMap', idNumber: 'ADMIN001', role: 'admin', email: 'admin@talentmap.ma', status: 'active' },
  { id: '2', name: 'Sara Moussaoui', idNumber: 'COORD001', role: 'coordinator', email: 'sara@talentmap.ma', status: 'active' },
  { id: '3', name: 'Khalid Benali', idNumber: 'COORD002', role: 'coordinator', email: 'khalid@talentmap.ma', status: 'active' },
  ...ALL_CANDIDATES.map(c => ({ id: c.id, name: c.name, idNumber: c.id, role: 'candidate', email: c.email, status: c.status })),
];

const ACTIVITY_LOG = [
  { time: '09:14', event: 'CAN001 a mis à jour son profil', type: 'update' },
  { time: '09:02', event: 'COORD001 a importé 3 nouveaux CVs', type: 'upload' },
  { time: '08:55', event: 'CAN003 a été marqué comme placé', type: 'placement' },
  { time: '08:41', event: 'COORD002 a publié une offre d\'emploi BTP', type: 'job' },
  { time: '08:30', event: 'CAN006 a rejoint la plateforme', type: 'join' },
  { time: 'Hier', event: 'Rapport mensuel généré automatiquement', type: 'report' },
];

const activityColors: Record<string, string> = {
  update: BLUE, upload: '#8b5cf6', placement: GN, job: '#f59e0b', join: SKY, report: GR,
};

function BarRow({ label, n, total, col }: { label: string; n: number; total: number; col: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{n} ({total ? Math.round(n / total * 100) : 0}%)</span>
      </div>
      <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: col,
          width: `${total ? (n / total) * 100 : 0}%`, transition: 'width .5s' }}/>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'users' | 'candidates' | 'activity'>('overview');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const byRegion = ALL_CANDIDATES.reduce((a: Record<string, number>, c) => { a[c.region] = (a[c.region] || 0) + 1; return a; }, {});
  const bySector = ALL_CANDIDATES.reduce((a: Record<string, number>, c) => { a[c.sector] = (a[c.sector] || 0) + 1; return a; }, {});
  const avgScore = Math.round(ALL_CANDIDATES.reduce((s, c) => s + c.score, 0) / ALL_CANDIDATES.length);

  function generateReport(type: 'candidates' | 'users' | 'full') {
    const date = new Date().toLocaleDateString('fr-FR');
    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Rapport TalentMap — ${date}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;color:#1a1a2e;padding:40px;background:#f8faff}
.header{background:linear-gradient(135deg,#0a1f5c,#2563eb);color:#fff;padding:28px 32px;border-radius:12px;margin-bottom:28px}
h1{font-size:24px;font-weight:800;margin-bottom:4px}
.subtitle{opacity:.7;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.stat{background:#fff;border-radius:10px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.07)}
.stat-n{font-size:28px;font-weight:800;color:#2563eb}
.stat-l{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.07)}
th{background:#0a1f5c;color:#fff;padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
td{padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px}
tr:last-child td{border-bottom:none}
.pill{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700}
</style></head><body>
<div class="header">
  <h1>Rapport TalentMap — ${type === 'full' ? 'Complet' : type === 'candidates' ? 'Candidats' : 'Utilisateurs'}</h1>
  <div class="subtitle">Généré le ${date} · ${ALL_CANDIDATES.length} candidats · Score moyen ${avgScore}/100</div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-n">${ALL_CANDIDATES.length}</div><div class="stat-l">Candidats</div></div>
  <div class="stat"><div class="stat-n">${ALL_CANDIDATES.filter(c => c.status === 'placed').length}</div><div class="stat-l">Placés</div></div>
  <div class="stat"><div class="stat-n">${avgScore}</div><div class="stat-l">Score moyen</div></div>
  <div class="stat"><div class="stat-n">${ALL_CANDIDATES.filter(c => c.score >= 80).length}</div><div class="stat-l">Score ≥ 80</div></div>
</div>
${type !== 'users' ? `<h2 style="font-size:16px;font-weight:700;color:#0a1f5c;margin-bottom:12px">Base de données candidats</h2>
<table>
  <thead><tr><th>ID</th><th>Nom</th><th>Secteur</th><th>Région</th><th>Score</th><th>Statut</th><th>Expérience</th></tr></thead>
  <tbody>
    ${ALL_CANDIDATES.map(c => `<tr>
      <td style="font-family:monospace;color:#6b7280">${c.id}</td>
      <td style="font-weight:600">${c.name}</td>
      <td>${c.sector}</td>
      <td>${c.region}</td>
      <td style="font-weight:800;color:${c.score>=80?'#22c55e':'#2563eb'}">${c.score}/100</td>
      <td><span class="pill" style="background:${c.status==='placed'?'#22c55e22':'#2563eb22'};color:${c.status==='placed'?'#22c55e':'#2563eb'}">${c.status==='placed'?'Placé':c.status==='available'?'Disponible':'En cours'}</span></td>
      <td>${c.experience}</td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}
${type !== 'candidates' ? `<h2 style="font-size:16px;font-weight:700;color:#0a1f5c;margin:24px 0 12px">Utilisateurs</h2>
<table>
  <thead><tr><th>ID</th><th>Nom</th><th>Rôle</th><th>Email</th><th>Statut</th></tr></thead>
  <tbody>
    ${ALL_USERS.map(u => `<tr>
      <td style="font-family:monospace;color:#6b7280">${u.idNumber}</td>
      <td style="font-weight:600">${u.name}</td>
      <td><span class="pill" style="background:${u.role==='admin'?'#9b59b622':u.role==='coordinator'?'#22c55e22':'#2563eb22'};color:${u.role==='admin'?'#9b59b6':u.role==='coordinator'?'#22c55e':'#2563eb'}">${u.role==='admin'?'Admin':u.role==='coordinator'?'Coordinateur':'Candidat'}</span></td>
      <td>${u.email}</td>
      <td style="color:#22c55e;font-weight:600">Actif</td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}
<p style="margin-top:28px;font-size:11px;color:#9ca3af;text-align:center">© 2026 TalentMap — Y-TRACK · Ce rapport est généré automatiquement</p>
</body></html>`;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })),
      download: `TalentMap_Rapport_${type}_${date.replace(/\//g,'-')}.html`,
    });
    a.click();
  }

  const roleColors: Record<string, { bg: string; color: string }> = {
    admin: { bg: '#9b59b622', color: '#9b59b6' },
    coordinator: { bg: GN + '22', color: GN },
    candidate: { bg: BLUE + '22', color: BLUE },
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Poppins',sans-serif" }}>
      {/* Header */}
      <div style={{ background: NAVY, height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 16px rgba(10,31,92,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},${SKY})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: WH }}>T</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: WH }}>TalentMap</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9b59b6', background: '#9b59b622',
            padding: '2px 10px', borderRadius: 12, border: '1px solid #9b59b655' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{user.name}</span>
          <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
            color: 'rgba(255,255,255,.5)', fontSize: 11, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: NAVY, padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 4 }}>
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble' },
            { id: 'users', label: '👥 Utilisateurs' },
            { id: 'candidates', label: '🎯 Candidats' },
            { id: 'activity', label: '📋 Activité' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              padding: '10px 18px', border: 'none', background: 'transparent',
              color: tab === t.id ? SKY : 'rgba(255,255,255,.5)',
              fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
              borderBottom: `2px solid ${tab === t.id ? SKY : 'transparent'}`,
              cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 18px 80px' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Candidats', value: ALL_CANDIDATES.length, icon: '👥', color: BLUE },
                { label: 'Placés', value: ALL_CANDIDATES.filter(c => c.status === 'placed').length, icon: '✅', color: GN },
                { label: 'Score moyen', value: `${avgScore}/100`, icon: '🎯', color: '#f59e0b' },
                { label: 'Coordinateurs', value: 2, icon: '👔', color: '#8b5cf6' },
                { label: 'Score ≥ 80', value: ALL_CANDIDATES.filter(c => c.score >= 80).length, icon: '⭐', color: SKY },
              ].map((s, i) => (
                <div key={i} style={{ background: WH, borderRadius: 14, padding: '18px 16px',
                  border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(10,31,92,.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: GR, textTransform: 'uppercase', letterSpacing: .5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Report buttons */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', marginBottom: 16,
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Générer des rapports</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { type: 'candidates' as const, label: '👥 Rapport Candidats', desc: 'Profils, scores, statuts' },
                  { type: 'users' as const, label: '🔐 Rapport Utilisateurs', desc: 'Comptes et rôles' },
                  { type: 'full' as const, label: '📊 Rapport Complet', desc: 'Toutes les données' },
                ].map(r => (
                  <button key={r.type} onClick={() => generateReport(r.type)} style={{
                    padding: '14px 12px', borderRadius: 12, border: `2px solid ${BORDER}`,
                    background: BG, cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: GR }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
                border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Par secteur</span>
                </div>
                {Object.entries(bySector).map(([s, n], i) => (
                  <BarRow key={s} label={s} n={n} total={ALL_CANDIDATES.length}
                    col={[BLUE, GN, '#8b5cf6', '#f59e0b', SKY, '#ec4899'][i % 6]}/>
                ))}
              </div>
              <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
                border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Par région</span>
                </div>
                {Object.entries(byRegion).map(([r, n], i) => (
                  <BarRow key={r} label={r} n={n} total={ALL_CANDIDATES.length}
                    col={[BLUE, GN, '#8b5cf6', '#f59e0b', SKY][i % 5]}/>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
            border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{ALL_USERS.length} utilisateurs</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: NAVY, color: WH }}>
                    {['ID', 'Nom', 'Rôle', 'Email', 'Statut'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: .4, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_USERS.map((u, i) => {
                    const rc = roleColors[u.role] || { bg: '#e5e7eb', color: GR };
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? WH : BG }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: GR }}>{u.idNumber}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: NAVY }}>{u.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                            background: rc.bg, color: rc.color }}>
                            {u.role === 'admin' ? 'Admin' : u.role === 'coordinator' ? 'Coordinateur' : 'Candidat'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: GR }}>{u.email}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: GN }}>● Actif</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CANDIDATES ── */}
        {tab === 'candidates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{ALL_CANDIDATES.length} candidats enregistrés</span>
              <button onClick={() => generateReport('candidates')}
                style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${BLUE}`,
                  background: BG, color: BLUE, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                📥 Exporter CSV
              </button>
            </div>
            {ALL_CANDIDATES.map((c, i) => (
              <div key={i} style={{ background: WH, borderRadius: 16, padding: '18px 20px',
                border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: WH, flexShrink: 0 }}>{c.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: GR, fontFamily: 'monospace' }}>{c.id}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 9, fontWeight: 700,
                        background: c.status === 'placed' ? GN + '22' : c.status === 'available' ? BLUE + '22' : '#f59e0b22',
                        color: c.status === 'placed' ? GN : c.status === 'available' ? BLUE : '#f59e0b' }}>
                        {c.status === 'placed' ? 'Placé' : c.status === 'available' ? 'Disponible' : 'En cours'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: GR, marginBottom: 8 }}>
                      {c.sector} · {c.region} · {c.experience} · {c.education}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {c.skills.map((s, j) => (
                        <span key={j} style={{ padding: '3px 10px', borderRadius: 14, background: BG,
                          color: NAVY, fontSize: 11, fontWeight: 600, border: `1px solid ${BORDER}` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800,
                      color: c.score >= 80 ? GN : c.score >= 60 ? BLUE : RE }}>{c.score}</div>
                    <div style={{ fontSize: 9, color: GR }}>SCORE</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {tab === 'activity' && (
          <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
            border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Journal d'activité</span>
            </div>
            {ACTIVITY_LOG.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0', borderBottom: i < ACTIVITY_LOG.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: activityColors[a.type] || GR, boxShadow: `0 0 6px ${activityColors[a.type]}66` }}/>
                <div style={{ flex: 1, fontSize: 13, color: NAVY }}>{a.event}</div>
                <div style={{ fontSize: 11, color: GR, fontWeight: 600, flexShrink: 0 }}>{a.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AIAssistant role="admin" context={`Admin: ${user.name} | ${ALL_CANDIDATES.length} candidats | Score moyen: ${avgScore}/100 | ${ALL_CANDIDATES.filter(c=>c.status==='placed').length} placés | 2 coordinateurs actifs`}/>
    </div>
  );
}
