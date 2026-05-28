'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import PageHeader from '../../components/PageHeader';

const candidates = [
  { id: 1, name: 'Sarah Benali', role: 'Senior React Developer', level: 'Senior', sector: 'Technology', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Redux'], score: 94, uploaded: '2 days ago', status: 'matched' },
  { id: 2, name: 'Karim Djebbar', role: 'Data Scientist', level: 'Mid', sector: 'Finance', skills: ['Python', 'ML', 'TensorFlow', 'SQL', 'Pandas'], score: 88, uploaded: '3 days ago', status: 'matched' },
  { id: 3, name: 'Amina Touati', role: 'Product Manager', level: 'Senior', sector: 'Technology', skills: ['Product', 'Agile', 'Roadmap', 'Analytics', 'Jira'], score: 85, uploaded: '4 days ago', status: 'matched' },
  { id: 4, name: 'Youcef Hadj', role: 'DevOps Engineer', level: 'Mid', sector: 'Technology', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'], score: 81, uploaded: '5 days ago', status: 'reviewing' },
  { id: 5, name: 'Lina Benkhalifa', role: 'UX Designer', level: 'Junior', sector: 'Design', skills: ['Figma', 'UX Research', 'Prototyping', 'CSS', 'Sketch'], score: 79, uploaded: '1 week ago', status: 'matched' },
  { id: 6, name: 'Nassim Chebira', role: 'Data Analyst', level: 'Mid', sector: 'Finance', skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Power BI'], score: 72, uploaded: '1 week ago', status: 'reviewing' },
  { id: 7, name: 'Rania Mekki', role: 'Frontend Developer', level: 'Mid', sector: 'Technology', skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML', 'Tailwind'], score: 65, uploaded: '1 week ago', status: 'pending' },
  { id: 8, name: 'Omar Zidane', role: 'UI Designer', level: 'Junior', sector: 'Design', skills: ['Sketch', 'Wireframing', 'UI', 'Adobe XD'], score: 52, uploaded: '2 weeks ago', status: 'pending' },
  { id: 9, name: 'Fatima Hadj Ali', role: 'Business Analyst', level: 'Junior', sector: 'Finance', skills: ['Excel', 'Presentations', 'SQL', 'Communication'], score: 45, uploaded: '2 weeks ago', status: 'pending' },
  { id: 10, name: 'Bilal Ferhat', role: 'Junior DevOps', level: 'Junior', sector: 'Technology', skills: ['Linux', 'Bash', 'Git', 'Docker'], score: 35, uploaded: '2 weeks ago', status: 'pending' },
];

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  matched: { bg: '#d1fae5', color: '#065f46', label: '✓ Matched' },
  reviewing: { bg: '#dbeafe', color: '#1e40af', label: '◷ Reviewing' },
  pending: { bg: '#f3f4f6', color: '#6b7280', label: '○ Pending' },
};

const levelColors: Record<string, string> = {
  Junior: '#9333ea',
  Mid: '#0284c7',
  Senior: '#1d4ed8',
};

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const filtered = candidates.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) &&
    (levelFilter === 'All' || c.level === levelFilter)
  );

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="TalentMap" />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Candidates
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{filtered.length} profiles · AI analyzed</p>
          </div>
          <Link href="/upload" className="btn-primary">+ Upload More CVs</Link>
        </div>

        {/* Search & filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1rem' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or skill…"
              style={{
                width: '100%', padding: '0.65rem 0.875rem 0.65rem 2.5rem',
                borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem',
                background: 'white',
              }}
            />
          </div>
          {['All', 'Junior', 'Mid', 'Senior'].map(l => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
                background: levelFilter === l ? '#1d4ed8' : 'white',
                color: levelFilter === l ? 'white' : '#374151',
                border: `1px solid ${levelFilter === l ? '#1d4ed8' : '#d1d5db'}`,
                cursor: 'pointer',
              }}
            >{l}</button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Candidate', 'Role', 'Level', 'Skills', 'Match Score', 'Status', 'Uploaded'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.1s' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${c.id * 37 + 200}, 65%, 88%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700,
                          color: `hsl(${c.id * 37 + 200}, 65%, 30%)`,
                        }}>
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.sector}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' }}>{c.role}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                        background: `${levelColors[c.level]}20`, color: levelColors[c.level],
                      }}>{c.level}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '200px' }}>
                        {c.skills.slice(0, 3).map(sk => (
                          <span key={sk} style={{
                            background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px',
                            padding: '0.15rem 0.4rem', fontSize: '0.7rem', fontWeight: 600,
                          }}>{sk}</span>
                        ))}
                        {c.skills.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af', padding: '0.15rem 0.25rem' }}>+{c.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '9999px', width: '60px' }}>
                          <div style={{
                            height: '100%', borderRadius: '9999px', width: `${c.score}%`,
                            background: c.score >= 70 ? '#10b981' : c.score >= 40 ? '#3b82f6' : '#ef4444',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: c.score >= 70 ? '#065f46' : c.score >= 40 ? '#1e40af' : '#991b1b', minWidth: '36px' }}>
                          {c.score}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                        ...statusColors[c.status],
                      }}>
                        {statusColors[c.status].label}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {c.uploaded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
