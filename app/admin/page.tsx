'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

const ALL_USERS = [
  { id: 'ADMIN001', name: 'Admin User', email: 'admin@talentmap.ma', role: 'Admin', lastLogin: '2 hours ago', status: 'Active' },
  { id: 'COORD001', name: 'Sara Coordinator', email: 'sara@talentmap.ma', role: 'Coordinator', lastLogin: '30 min ago', status: 'Active' },
  { id: 'CAN001', name: 'Mohammed Ait Aissa', email: 'mohammed@email.com', role: 'Candidate', lastLogin: '1 hour ago', status: 'Active' },
  { id: 'CAN002', name: 'Sarah Benali', email: 'sarah@email.com', role: 'Candidate', lastLogin: '3 hours ago', status: 'Active' },
  { id: 'CAN003', name: 'Karim Djebbar', email: 'karim@email.com', role: 'Candidate', lastLogin: 'Yesterday', status: 'Active' },
  { id: 'CAN004', name: 'Amina Touati', email: 'amina@email.com', role: 'Candidate', lastLogin: '2 days ago', status: 'Active' },
  { id: 'CAN005', name: 'Youcef Hadj', email: 'youcef@email.com', role: 'Candidate', lastLogin: 'Yesterday', status: 'Pending' },
  { id: 'CAN006', name: 'Lina Benkhalifa', email: 'lina@email.com', role: 'Candidate', lastLogin: '1 week ago', status: 'Active' },
];

const ALL_CANDIDATES = [
  { id: 'CAN001', name: 'Mohammed Ait Aissa', email: 'mohammed@email.com', phone: '+212 6 11 22 33 44', skills: ['Python', 'Django', 'SQL', 'REST APIs'], sector: 'Technology', experience: 'Mid-Level', matchScore: 82 },
  { id: 'CAN002', name: 'Sarah Benali', email: 'sarah@email.com', phone: '+212 6 22 33 44 55', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], sector: 'Technology', experience: 'Senior', matchScore: 94 },
  { id: 'CAN003', name: 'Karim Djebbar', email: 'karim@email.com', phone: '+212 6 33 44 55 66', skills: ['Python', 'ML', 'TensorFlow', 'Data Analysis'], sector: 'Data Science', experience: 'Mid-Level', matchScore: 88 },
  { id: 'CAN004', name: 'Amina Touati', email: 'amina@email.com', phone: '+212 6 44 55 66 77', skills: ['Figma', 'UX Research', 'Prototyping', 'CSS'], sector: 'Design', experience: 'Senior', matchScore: 85 },
  { id: 'CAN005', name: 'Youcef Hadj', email: 'youcef@email.com', phone: '+212 6 55 66 77 88', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'], sector: 'Technology', experience: 'Senior', matchScore: 79 },
  { id: 'CAN006', name: 'Lina Benkhalifa', email: 'lina@email.com', phone: '+212 6 66 77 88 99', skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'], sector: 'Technology', experience: 'Mid-Level', matchScore: 73 },
];

const ACTIVITY = [
  { time: '10m ago', action: 'Login', user: 'Sara Coordinator', type: 'login' },
  { time: '30m ago', action: 'CV uploaded', user: 'Mohammed Ait Aissa', type: 'upload' },
  { time: '1h ago', action: 'Job posted', user: 'Sara Coordinator', type: 'job' },
  { time: '2h ago', action: 'Match found', user: 'Sarah Benali → React Dev 94%', type: 'match' },
  { time: '3h ago', action: 'Login', user: 'Admin User', type: 'login' },
  { time: '5h ago', action: 'CV uploaded', user: 'Karim Djebbar', type: 'upload' },
  { time: 'Yesterday', action: 'Job posted', user: 'Sara Coordinator', type: 'job' },
  { time: 'Yesterday', action: 'Profile updated', user: 'Amina Touati', type: 'upload' },
];

const typeColor: Record<string, string> = { login: '#8b5cf6', upload: '#3b82f6', job: '#f59e0b', match: '#10b981' };

function generateReport(type: string) {
  const now = new Date().toLocaleDateString('en-GB');
  const candidateRows = ALL_CANDIDATES.map(c =>
    `  <tr><td>${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.skills.join(', ')}</td><td>${c.sector}</td><td>${c.experience}</td><td>${c.matchScore}%</td></tr>`
  ).join('');
  const userRows = ALL_USERS.map(u =>
    `  <tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.lastLogin}</td><td>${u.status}</td></tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>TalentMap Report — ${type}</title>
<style>body{font-family:'Segoe UI',Arial,sans-serif;color:#111827;padding:2rem}
h1{color:#0a1f5c;margin-bottom:.25rem}p{color:#6b7280;margin-bottom:2rem}
table{width:100%;border-collapse:collapse;margin-bottom:2rem}
th{background:#0a1f5c;color:white;padding:.6rem .75rem;text-align:left;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}
td{padding:.6rem .75rem;border-bottom:1px solid #f3f4f6;font-size:.88rem}
tr:nth-child(even) td{background:#f9fafb}
.footer{text-align:center;color:#9ca3af;font-size:.75rem;margin-top:2rem;padding-top:1rem;border-top:1px solid #f3f4f6}
</style></head><body>
<h1>TalentMap — ${type} Report</h1>
<p>Generated on ${now} by Admin</p>
${type === 'Candidates' ? `<h2 style="color:#2563eb;margin-bottom:1rem">Candidate Database (${ALL_CANDIDATES.length} candidates)</h2>
<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Skills</th><th>Sector</th><th>Experience</th><th>Match Score</th></tr></thead>
<tbody>${candidateRows}</tbody></table>` : ''}
${type === 'Users' ? `<h2 style="color:#2563eb;margin-bottom:1rem">User Accounts (${ALL_USERS.length} users)</h2>
<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th></tr></thead>
<tbody>${userRows}</tbody></table>` : ''}
${type === 'Full' ? `<h2 style="color:#2563eb;margin-bottom:1rem">All Users</h2>
<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th></tr></thead>
<tbody>${userRows}</tbody></table>
<h2 style="color:#2563eb;margin-bottom:1rem">All Candidates</h2>
<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Skills</th><th>Sector</th><th>Experience</th><th>Match Score</th></tr></thead>
<tbody>${candidateRows}</tbody></table>` : ''}
<div class="footer">TalentMap Recruitment Platform &bull; ${now}</div>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `TalentMap_${type}_Report_${now.replace(/\//g, '-')}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'users' | 'candidates' | 'activity'>('overview');

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  const avgScore = Math.round(ALL_CANDIDATES.reduce((a, c) => a + c.matchScore, 0) / ALL_CANDIDATES.length);

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Admin Portal" />
        <div style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{user.name}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Users', value: ALL_USERS.length, color: '#2563eb' },
            { label: 'Candidates', value: ALL_CANDIDATES.length, color: '#0284c7' },
            { label: 'Coordinators', value: ALL_USERS.filter(u => u.role === 'Coordinator').length, color: '#8b5cf6' },
            { label: 'Avg Match Score', value: avgScore + '%', color: '#16a34a' },
            { label: 'Active Users', value: ALL_USERS.filter(u => u.status === 'Active').length, color: '#2563eb' },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Report buttons */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>📊 Download Reports</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: '⬇ Candidates Report', type: 'Candidates', color: '#2563eb' },
              { label: '⬇ Users Report', type: 'Users', color: '#0284c7' },
              { label: '⬇ Full Report', type: 'Full', color: '#0a1f5c' },
            ].map(r => (
              <button key={r.type} onClick={() => generateReport(r.type)}
                style={{ padding: '0.65rem 1.25rem', background: r.color, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
          {([['overview', '📊 Overview'], ['users', '👤 All Users'], ['candidates', '👥 Candidates'], ['activity', '⚡ Activity']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === key ? '#0a1f5c' : 'white', color: tab === key ? 'white' : '#6b7280', transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>User Breakdown</h2>
              {[
                { role: 'Admin', count: 1, color: '#0a1f5c' },
                { role: 'Coordinator', count: 1, color: '#2563eb' },
                { role: 'Candidate', count: ALL_USERS.filter(u => u.role === 'Candidate').length, color: '#38bdf8' },
              ].map(r => (
                <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>{r.role}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '100px', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                      <div style={{ width: `${(r.count / ALL_USERS.length) * 100}%`, height: '100%', background: r.color, borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: r.color }}>{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Top Matching Candidates</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[...ALL_CANDIDATES].sort((a, b) => b.matchScore - a.matchScore).slice(0, 4).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.experience} · {c.sector}</div>
                    </div>
                    <span style={{ background: c.matchScore >= 70 ? '#d1fae5' : '#dbeafe', color: c.matchScore >= 70 ? '#065f46' : '#1e40af', borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}>{c.matchScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>All Users ({ALL_USERS.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['ID', 'Name', 'Email', 'Role', 'Last Login', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_USERS.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'monospace' }}>{u.id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{u.name}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: u.role === 'Admin' ? '#fef3c7' : u.role === 'Coordinator' ? '#eff6ff' : '#f3f4f6', color: u.role === 'Admin' ? '#92400e' : u.role === 'Coordinator' ? '#1d4ed8' : '#374151', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>{u.lastLogin}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: u.status === 'Active' ? '#d1fae5' : '#fef9c3', color: u.status === 'Active' ? '#065f46' : '#92400e', borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>{u.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CANDIDATES */}
        {tab === 'candidates' && (
          <div className="card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Candidate Database with Profiling ({ALL_CANDIDATES.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ALL_CANDIDATES.map(c => (
                <div key={c.id} style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{c.email} · {c.phone} · <span style={{ fontFamily: 'monospace' }}>{c.id}</span></div>
                    </div>
                    <span style={{ background: c.matchScore >= 70 ? '#d1fae5' : '#dbeafe', color: c.matchScore >= 70 ? '#065f46' : '#1e40af', borderRadius: '9999px', padding: '0.3rem 0.85rem', fontSize: '0.82rem', fontWeight: 700 }}>{c.matchScore}% Match</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                    <div><span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Sector</span><div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>{c.sector}</div></div>
                    <div><span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Experience</span><div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>{c.experience}</div></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {c.skills.map(s => <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY */}
        {tab === 'activity' && (
          <div className="card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Platform Activity Log</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: typeColor[a.type], marginTop: '5px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>{a.action}</span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}> — {a.user}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
