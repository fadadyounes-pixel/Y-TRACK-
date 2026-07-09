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

interface Candidate {
  id: string; name: string; email: string; phone: string;
  sector: string; region: string; skills: string[]; experience: string;
  matchScore: number; education: string; status: 'available' | 'placed' | 'pending';
}

const ALL_CANDIDATES: Candidate[] = [
  { id: 'CAN001', name: 'Mohammed Ait Aissa', email: 'mohammed@email.com', phone: '+212 6 11 00 11 00', sector: 'Numérique/TIC', region: 'Casablanca-Settat', skills: ['JavaScript', 'React', 'Node.js', 'Python'], experience: '3 ans', matchScore: 87, education: 'Bac+3 Informatique', status: 'available' },
  { id: 'CAN002', name: 'Sarah Benali', email: 'sarah@email.com', phone: '+212 6 22 00 22 00', sector: 'Artisanat', region: 'Fès-Meknès', skills: ['Broderie', 'Zellige', 'Design'], experience: '5 ans', matchScore: 74, education: 'Arts Traditionnels', status: 'available' },
  { id: 'CAN003', name: 'Karim Djebbar', email: 'karim@email.com', phone: '+212 6 33 00 33 00', sector: 'Agriculture/Élevage', region: 'Souss-Massa', skills: ['Irrigation', 'Agrumes', 'Gestion'], experience: '7 ans', matchScore: 91, education: 'Ingénieur Agronome', status: 'placed' },
  { id: 'CAN004', name: 'Fatima Zahra Ouali', email: 'fatima@email.com', phone: '+212 6 44 00 44 00', sector: 'Commerce/Services', region: 'Marrakech-Safi', skills: ['Vente', 'Service client', 'Excel'], experience: '4 ans', matchScore: 68, education: 'BTS Commerce', status: 'available' },
  { id: 'CAN005', name: 'Youssef El Mansouri', email: 'youssef@email.com', phone: '+212 6 55 00 55 00', sector: 'BTP/Maçonnerie', region: 'Oriental', skills: ['Maçonnerie', 'Plomberie', 'AutoCAD'], experience: '10 ans', matchScore: 82, education: 'OFPPT BTP', status: 'pending' },
  { id: 'CAN006', name: 'Amina Tahiri', email: 'amina@email.com', phone: '+212 6 66 00 66 00', sector: 'Numérique/TIC', region: 'Casablanca-Settat', skills: ['UX Design', 'Figma', 'HTML/CSS', 'Marketing'], experience: '2 ans', matchScore: 78, education: 'Bac+3 Design', status: 'available' },
];

const INITIAL_JOBS = [
  { id: 1, title: 'Développeur Full Stack', company: 'TechMaroc SARL', sector: 'Numérique/TIC', location: 'Casablanca', type: 'CDI', skills: ['JavaScript', 'React', 'Node.js'], open: true, matches: 3 },
  { id: 2, title: 'Technicien BTP Senior', company: 'BuildCo Maroc', sector: 'BTP/Maçonnerie', location: 'Rabat', type: 'CDI', skills: ['Maçonnerie', 'AutoCAD', 'Gestion'], open: true, matches: 2 },
  { id: 3, title: 'Responsable Commerce', company: 'MarketPro', sector: 'Commerce/Services', location: 'Marrakech', type: 'CDD', skills: ['Vente', 'Leadership', 'Excel'], open: false, matches: 1 },
];

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: GN + '22', color: GN, label: 'Disponible' },
  placed:    { bg: BLUE + '22', color: BLUE, label: 'Placé' },
  pending:   { bg: '#f59e0b22', color: '#f59e0b', label: 'En cours' },
};

export default function CoordinatorPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'candidates' | 'jobs'>('overview');
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [aiMatch, setAiMatch] = useState<Record<string, string>>({});
  const [matchLoading, setMatchLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'coordinator')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const filtered = ALL_CANDIDATES.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)))
      && (!filterSector || c.sector === filterSector);
  });

  const sectors = [...new Set(ALL_CANDIDATES.map(c => c.sector))];

  async function getAiMatch(candidateId: string, jobId: number) {
    const key = `${candidateId}-${jobId}`;
    setMatchLoading(key);
    const cand = ALL_CANDIDATES.find(c => c.id === candidateId);
    const job  = jobs.find(j => j.id === jobId);
    if (!cand || !job) { setMatchLoading(null); return; }
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Candidat: ${cand.name} | Compétences: ${cand.skills.join(', ')} | Expérience: ${cand.experience}\nPoste: ${job.title} | Compétences requises: ${job.skills.join(', ')}\nExplique en 2 phrases pourquoi ce candidat correspond (ou pas) à ce poste.` }],
          system: 'Tu es un expert RH. Réponds en français, 2 phrases max, concrètes et directes.',
          task: 'dialogue',
        }),
      });
      const d = await r.json();
      setAiMatch(p => ({ ...p, [key]: d.content?.[0]?.text || 'Analyse indisponible.' }));
    } catch {
      setAiMatch(p => ({ ...p, [key]: 'Analyse temporairement indisponible.' }));
    }
    setMatchLoading(null);
  }

  const stats = [
    { label: 'Candidats', value: ALL_CANDIDATES.length, icon: '👥', color: BLUE },
    { label: 'Disponibles', value: ALL_CANDIDATES.filter(c => c.status === 'available').length, icon: '✅', color: GN },
    { label: 'Placés', value: ALL_CANDIDATES.filter(c => c.status === 'placed').length, icon: '🎯', color: '#8b5cf6' },
    { label: 'Offres actives', value: jobs.filter(j => j.open).length, icon: '💼', color: '#f59e0b' },
  ];

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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px',
            background: 'rgba(255,255,255,.07)', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: GN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: WH }}>{user.name[0]}</div>
            <span style={{ fontSize: 12, color: WH, fontWeight: 600 }}>{user.name}</span>
            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 9, fontWeight: 700,
              background: GN + '33', color: GN }}>Coordinateur</span>
          </div>
          <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
            color: 'rgba(255,255,255,.5)', fontSize: 11, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: NAVY, padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 4 }}>
          {[{ id: 'overview', label: '📊 Vue d\'ensemble' }, { id: 'candidates', label: '👥 Candidats' }, { id: 'jobs', label: '💼 Offres d\'emploi' }].map(t => (
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 18px 80px' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: WH, borderRadius: 14, padding: '18px 16px',
                  border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(10,31,92,.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: GR, textTransform: 'uppercase', letterSpacing: .5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <button onClick={() => router.push('/coordinator/upload')} style={{
                padding: '16px 20px', borderRadius: 14, border: `2px solid ${BLUE}`,
                background: BG, color: NAVY, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>📁 Importer des CVs</button>
              <button onClick={() => router.push('/coordinator/jobs')} style={{
                padding: '16px 20px', borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>+ Publier une offre</button>
            </div>

            {/* Top matches */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Meilleurs profils disponibles</span>
              </div>
              {ALL_CANDIDATES.filter(c => c.status === 'available').sort((a, b) => b.matchScore - a.matchScore).slice(0, 4).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: i < 3 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%',
                    background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: WH, flexShrink: 0 }}>{c.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: GR }}>{c.sector} · {c.experience}</div>
                    <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                      {c.skills.slice(0, 3).map((s, j) => (
                        <span key={j} style={{ padding: '2px 8px', borderRadius: 12, background: BG,
                          color: NAVY, fontSize: 10, fontWeight: 600, border: `1px solid ${BORDER}` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c.matchScore >= 80 ? GN : BLUE }}>{c.matchScore}</div>
                    <div style={{ fontSize: 9, color: GR }}>SCORE</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CANDIDATES ── */}
        {tab === 'candidates' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un candidat ou une compétence..."
                style={{ flex: '1 1 200px', padding: '11px 14px', borderRadius: 11,
                  border: `2px solid ${BORDER}`, fontSize: 13, color: NAVY, background: WH, boxSizing: 'border-box' }}/>
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
                style={{ padding: '11px 14px', borderRadius: 11, border: `2px solid ${filterSector ? BLUE : BORDER}`,
                  background: filterSector ? BG : WH, fontSize: 12, color: filterSector ? NAVY : GR, appearance: 'none' }}>
                <option value="">Tous secteurs</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12, fontSize: 11, color: GR, fontWeight: 600 }}>
              {filtered.length} candidat(s) trouvé(s)
            </div>
            {filtered.map((c, i) => {
              const st = statusColors[c.status];
              return (
                <div key={i} style={{ background: WH, borderRadius: 16, padding: '18px 20px',
                  marginBottom: 12, border: `1px solid ${BORDER}`,
                  boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%',
                      background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800, color: WH, flexShrink: 0 }}>{c.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{c.name}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 9, fontWeight: 700,
                          background: st.bg, color: st.color }}>{st.label}</span>
                        <span style={{ fontSize: 11, color: GR }}>· {c.id}</span>
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
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: c.matchScore >= 80 ? GN : c.matchScore >= 60 ? BLUE : '#f59e0b' }}>
                        {c.matchScore}
                      </div>
                      <div style={{ fontSize: 9, color: GR, marginBottom: 6 }}>SCORE</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 10, color: GR }}>📧 {c.email}</span>
                        <span style={{ fontSize: 10, color: GR }}>📞 {c.phone}</span>
                      </div>
                    </div>
                  </div>
                  {/* AI Match button for first job */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    {(() => {
                      const key = `${c.id}-1`;
                      return aiMatch[key] ? (
                        <div style={{ padding: '10px 14px', background: BG, borderRadius: 10,
                          border: `1px solid ${BLUE}22`, fontSize: 12, color: NAVY, lineHeight: 1.65 }}>
                          🤖 <strong>Analyse IA:</strong> {aiMatch[key]}
                        </div>
                      ) : (
                        <button onClick={() => getAiMatch(c.id, 1)} disabled={matchLoading === key}
                          style={{ padding: '7px 16px', borderRadius: 10, border: `1.5px solid ${BLUE}`,
                            background: matchLoading === key ? BG : 'transparent', color: BLUE,
                            fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          {matchLoading === key ? '⏳ Analyse IA en cours...' : '🤖 Analyser la compatibilité IA'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── JOBS ── */}
        {tab === 'jobs' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{jobs.length} offres d'emploi</span>
              <button onClick={() => router.push('/coordinator/jobs')} style={{
                padding: '10px 20px', borderRadius: 11, border: 'none',
                background: `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>+ Nouvelle offre</button>
            </div>
            {jobs.map((job, i) => (
              <div key={i} style={{ background: WH, borderRadius: 16, padding: '18px 20px',
                marginBottom: 12, border: `1px solid ${BORDER}`,
                boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12,
                    background: job.open ? `linear-gradient(135deg,${BLUE},${NAVY})` : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💼</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{job.title}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 9, fontWeight: 700,
                        background: job.open ? GN + '22' : '#e5e7eb', color: job.open ? GN : GR }}>
                        {job.open ? 'Ouverte' : 'Fermée'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: GR, marginBottom: 8 }}>
                      {job.company} · {job.location} · {job.type}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {job.skills.map((s, j) => (
                        <span key={j} style={{ padding: '3px 10px', borderRadius: 14, background: BG,
                          color: NAVY, fontSize: 11, fontWeight: 600, border: `1px solid ${BORDER}` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: BLUE }}>{job.matches}</div>
                    <div style={{ fontSize: 9, color: GR, marginBottom: 8 }}>MATCHS</div>
                    <button onClick={() => setJobs(p => p.map((j, idx) => idx === i ? { ...j, open: !j.open } : j))}
                      style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${BORDER}`,
                        background: 'transparent', color: GR, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                      {job.open ? 'Fermer' : 'Rouvrir'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <AIAssistant role="coordinator" context={`Coordinateur: ${user.name} | ${ALL_CANDIDATES.length} candidats | ${jobs.filter(j => j.open).length} offres actives | Secteurs: ${sectors.join(', ')}`}/>
    </div>
  );
}
