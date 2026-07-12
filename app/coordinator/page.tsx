'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

const ALL_CANDIDATES = [
  { id: 'CAN001', name: 'Mohammed Ait Aissa', email: 'mohammed@email.com', phone: '+212 6 11 22 33 44', skills: ['Python', 'Django', 'SQL', 'REST APIs'], sector: 'Technology', experience: 'Mid-Level', matchScore: 82, bestJob: 'Backend Python Developer', company: 'DataSoft Solutions', status: 'Active' },
  { id: 'CAN002', name: 'Sarah Benali', email: 'sarah@email.com', phone: '+212 6 22 33 44 55', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], sector: 'Technology', experience: 'Senior', matchScore: 94, bestJob: 'Senior React Developer', company: 'TechCorp', status: 'Active' },
  { id: 'CAN003', name: 'Karim Djebbar', email: 'karim@email.com', phone: '+212 6 33 44 55 66', skills: ['Python', 'ML', 'TensorFlow', 'Data Analysis'], sector: 'Data Science', experience: 'Mid-Level', matchScore: 88, bestJob: 'Machine Learning Engineer', company: 'AI Ventures', status: 'Active' },
  { id: 'CAN004', name: 'Amina Touati', email: 'amina@email.com', phone: '+212 6 44 55 66 77', skills: ['Figma', 'UX Research', 'Prototyping', 'CSS'], sector: 'Design', experience: 'Senior', matchScore: 85, bestJob: 'UX Designer', company: 'CreativeStudio', status: 'Active' },
  { id: 'CAN005', name: 'Youcef Hadj', email: 'youcef@email.com', phone: '+212 6 55 66 77 88', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'], sector: 'Technology', experience: 'Senior', matchScore: 79, bestJob: 'DevOps Engineer', company: 'CloudTech', status: 'Pending' },
  { id: 'CAN006', name: 'Lina Benkhalifa', email: 'lina@email.com', phone: '+212 6 66 77 88 99', skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'], sector: 'Technology', experience: 'Mid-Level', matchScore: 73, bestJob: 'Java Backend Developer', company: 'FinanceAI', status: 'Active' },
];

const DEFAULT_JOBS = [
  { id: 'J001', title: 'Senior React Developer', company: 'TechCorp', sector: 'Technology', experience: 'Senior', location: 'Casablanca', matches: 3, status: 'Open' },
  { id: 'J002', title: 'Machine Learning Engineer', company: 'AI Ventures', sector: 'Data Science', experience: 'Mid-Level', location: 'Rabat', matches: 2, status: 'Open' },
  { id: 'J003', title: 'Backend Python Developer', company: 'DataSoft Solutions', sector: 'Technology', experience: 'Mid-Level', location: 'Casablanca', matches: 2, status: 'Open' },
  { id: 'J004', title: 'DevOps Engineer', company: 'CloudTech', sector: 'Technology', experience: 'Senior', location: 'Tanger', matches: 1, status: 'Closed' },
];

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 70 ? '#d1fae5' : score >= 40 ? '#dbeafe' : '#fee2e2';
  const color = score >= 70 ? '#065f46' : score >= 40 ? '#1e40af' : '#991b1b';
  return <span style={{ background: bg, color, borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>{score}%</span>;
}

export default function CoordinatorDashboard() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'candidates' | 'jobs'>('overview');
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('All');
  const [JOB_OFFERS, setJobOffers] = useState(DEFAULT_JOBS);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'coordinator')) router.push('/login');
  }, [user, initialized, router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('coordinator_jobs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setJobOffers(parsed.map((j: any) => ({ ...j, matches: j.matches ?? 0 })));
      }
    } catch {}
  }, []);

  if (!initialized || !user || user.role !== 'coordinator') return null;

  const filtered = ALL_CANDIDATES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchSector = filterSector === 'All' || c.sector === filterSector;
    return matchSearch && matchSector;
  });

  const sectors = ['All', ...Array.from(new Set(ALL_CANDIDATES.map(c => c.sector)))];
  const avgScore = Math.round(ALL_CANDIDATES.reduce((a, c) => a + c.matchScore, 0) / ALL_CANDIDATES.length);

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Coordinator Portal" />
        <div style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{user.name}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Candidates', value: ALL_CANDIDATES.length, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Active Jobs', value: JOB_OFFERS.filter(j => j.status === 'Open').length, color: '#0284c7', bg: '#f0f9ff' },
            { label: 'Total Matches', value: JOB_OFFERS.reduce((a, j) => a + j.matches, 0), color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Avg Match Score', value: avgScore + '%', color: '#2563eb', bg: '#eff6ff' },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
          {([['overview', '📊 Overview'], ['candidates', '👥 All Candidates'], ['jobs', '💼 Job Offers']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '0.6rem 1.4rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === key ? '#2563eb' : 'white', color: tab === key ? 'white' : '#6b7280', transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* Upload actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/coordinator/upload" className="btn-primary">+ Upload CVs</Link>
          <Link href="/coordinator/jobs" className="btn-primary" style={{ background: '#0284c7' }}>+ Post Job Offer</Link>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>🎯 Top Matching Candidates</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Candidate', 'Best Match Job', 'Skills', 'Score'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...ALL_CANDIDATES].sort((a, b) => b.matchScore - a.matchScore).map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '0.7rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `hsl(${i * 40 + 210}, 70%, 90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: `hsl(${i * 40 + 210}, 70%, 30%)`, flexShrink: 0 }}>
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{c.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>{c.bestJob}</td>
                      <td style={{ padding: '0.7rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {c.skills.slice(0, 2).map(sk => <span key={sk} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 600 }}>{sk}</span>)}
                        </div>
                      </td>
                      <td style={{ padding: '0.7rem 0.75rem' }}><ScoreBadge score={c.matchScore} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>💼 Active Job Offers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {JOB_OFFERS.map(j => (
                  <div key={j.id} style={{ padding: '0.85rem', background: j.status === 'Open' ? '#f0f9ff' : '#f9fafb', borderRadius: '8px', borderLeft: `3px solid ${j.status === 'Open' ? '#2563eb' : '#d1d5db'}` }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', marginBottom: '0.2rem' }}>{j.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.4rem' }}>{j.company} · {j.sector}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{j.matches} match{j.matches !== 1 ? 'es' : ''}</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.6rem', borderRadius: '9999px', background: j.status === 'Open' ? '#d1fae5' : '#f3f4f6', color: j.status === 'Open' ? '#065f46' : '#6b7280', fontWeight: 600 }}>{j.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {tab === 'candidates' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or skill..." style={{ padding: '0.6rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', width: '260px', fontFamily: 'inherit' }} />
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ padding: '0.6rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                {sectors.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>All Candidates ({filtered.length})</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {filtered.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '10px', flexWrap: 'wrap' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8', flexShrink: 0 }}>
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{c.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{c.email} · {c.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.id}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {c.skills.map(sk => <span key={sk} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600 }}>{sk}</span>)}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <ScoreBadge score={c.matchScore} />
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.25rem' }}>{c.experience}</div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No candidates match your search.</p>}
              </div>
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {tab === 'jobs' && (
          <div>
            <div className="card">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>All Job Offers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {JOB_OFFERS.map(j => (
                  <div key={j.id} style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '10px', borderLeft: `4px solid ${j.status === 'Open' ? '#2563eb' : '#d1d5db'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.25rem' }}>{j.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{j.company} · {j.sector} · {j.experience}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 700 }}>{j.matches} matches</span>
                      <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: j.status === 'Open' ? '#d1fae5' : '#f3f4f6', color: j.status === 'Open' ? '#065f46' : '#6b7280', fontWeight: 600 }}>{j.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
