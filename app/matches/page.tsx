'use client';

import { useState } from 'react';

const allMatches = [
  {
    id: 1, candidate: 'Sarah Benali', job: 'Senior React Developer', company: 'TechCorp',
    score: 94, skillsScore: 96, sectorScore: 90, experience: 95,
    topSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    sectorName: 'Technology', level: 'Senior',
  },
  {
    id: 2, candidate: 'Karim Djebbar', job: 'Data Scientist', company: 'FinanceAI',
    score: 88, skillsScore: 90, sectorScore: 85, experience: 88,
    topSkills: ['Python', 'ML', 'TensorFlow', 'SQL'],
    sectorName: 'Finance', level: 'Mid',
  },
  {
    id: 3, candidate: 'Amina Touati', job: 'Product Manager', company: 'StartupXYZ',
    score: 85, skillsScore: 87, sectorScore: 82, experience: 85,
    topSkills: ['Product', 'Agile', 'Roadmap', 'Analytics'],
    sectorName: 'Technology', level: 'Senior',
  },
  {
    id: 4, candidate: 'Youcef Hadj', job: 'DevOps Engineer', company: 'CloudCo',
    score: 81, skillsScore: 84, sectorScore: 80, experience: 78,
    topSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    sectorName: 'Technology', level: 'Mid',
  },
  {
    id: 5, candidate: 'Lina Benkhalifa', job: 'UX Designer', company: 'DesignStudio',
    score: 79, skillsScore: 80, sectorScore: 78, experience: 79,
    topSkills: ['Figma', 'Research', 'Prototyping', 'CSS'],
    sectorName: 'Design', level: 'Junior',
  },
  {
    id: 6, candidate: 'Nassim Chebira', job: 'Data Scientist', company: 'FinanceAI',
    score: 72, skillsScore: 74, sectorScore: 70, experience: 72,
    topSkills: ['Python', 'SQL', 'Tableau'],
    sectorName: 'Finance', level: 'Mid',
  },
  {
    id: 7, candidate: 'Rania Mekki', job: 'Senior React Developer', company: 'TechCorp',
    score: 65, skillsScore: 66, sectorScore: 62, experience: 68,
    topSkills: ['Vue.js', 'JavaScript', 'CSS'],
    sectorName: 'Technology', level: 'Mid',
  },
  {
    id: 8, candidate: 'Omar Zidane', job: 'UX Designer', company: 'DesignStudio',
    score: 52, skillsScore: 55, sectorScore: 48, experience: 54,
    topSkills: ['Sketch', 'Wireframing', 'UI'],
    sectorName: 'Design', level: 'Junior',
  },
  {
    id: 9, candidate: 'Fatima Hadj Ali', job: 'Product Manager', company: 'StartupXYZ',
    score: 45, skillsScore: 46, sectorScore: 43, experience: 48,
    topSkills: ['Excel', 'Presentations', 'Communication'],
    sectorName: 'Technology', level: 'Junior',
  },
  {
    id: 10, candidate: 'Bilal Ferhat', job: 'DevOps Engineer', company: 'CloudCo',
    score: 35, skillsScore: 30, sectorScore: 38, experience: 40,
    topSkills: ['Linux', 'Bash', 'Git'],
    sectorName: 'Technology', level: 'Junior',
  },
];

type FilterType = 'all' | 'excellent' | 'good' | 'poor';

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem' }}>
        <span>{label}</span><span style={{ fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '9999px' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '9999px' }} />
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'score' | 'skillsScore'>('score');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = allMatches
    .filter(m =>
      filter === 'all' ||
      (filter === 'excellent' && m.score >= 70) ||
      (filter === 'good' && m.score >= 40 && m.score < 70) ||
      (filter === 'poor' && m.score < 40)
    )
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const excellent = allMatches.filter(m => m.score >= 70).length;
  const good = allMatches.filter(m => m.score >= 40 && m.score < 70).length;
  const poor = allMatches.filter(m => m.score < 40).length;

  return (
    <main style={{ padding: '2rem 0', minHeight: '100vh', background: '#f9fafb' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Candidate Matches
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
            AI-scored matches across all active job offers
          </p>
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${allMatches.length})`, color: '#374151', bg: 'white', border: '#d1d5db' },
            { key: 'excellent', label: `Excellent (${excellent})`, color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
            { key: 'good', label: `Good (${good})`, color: '#1e40af', bg: '#dbeafe', border: '#93c5fd' },
            { key: 'poor', label: `Poor (${poor})`, color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as FilterType)}
              style={{
                padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                background: filter === f.key ? f.bg : 'white',
                color: filter === f.key ? f.color : '#6b7280',
                border: `1.5px solid ${filter === f.key ? f.border : '#e5e7eb'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{f.label}</button>
          ))}

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'score' | 'skillsScore')}
            style={{ marginLeft: 'auto', padding: '0.45rem 0.875rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem', background: 'white' }}
          >
            <option value="score">Sort by Overall Score</option>
            <option value="skillsScore">Sort by Skills Match</option>
          </select>
        </div>

        {/* Matches list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map(m => {
            const isExcellent = m.score >= 70;
            const isGood = m.score >= 40;
            const scoreColor = isExcellent ? '#065f46' : isGood ? '#1e40af' : '#991b1b';
            const scoreBg = isExcellent ? '#d1fae5' : isGood ? '#dbeafe' : '#fee2e2';
            const isOpen = expanded === m.id;

            return (
              <div
                key={m.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onClick={() => setExpanded(isOpen ? null : m.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: `hsl(${m.id * 35 + 200}, 65%, 88%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem',
                    color: `hsl(${m.id * 35 + 200}, 65%, 30%)`,
                  }}>
                    {m.candidate.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{m.candidate}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {m.job} · <span style={{ fontWeight: 600 }}>{m.company}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {m.topSkills.slice(0, 3).map(sk => (
                      <span key={sk} style={{
                        background: '#f0f9ff', color: '#0284c7', borderRadius: '4px',
                        padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                      }}>{sk}</span>
                    ))}
                  </div>

                  {/* Score badge */}
                  <div style={{ textAlign: 'center', minWidth: '64px' }}>
                    <div style={{
                      fontSize: '1.4rem', fontWeight: 900, color: scoreColor,
                      background: scoreBg, borderRadius: '10px', padding: '0.35rem 0.75rem',
                      display: 'inline-block', lineHeight: 1,
                    }}>
                      {m.score}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {isExcellent ? 'Excellent' : isGood ? 'Good' : 'Poor'}
                    </div>
                  </div>

                  <span style={{ color: '#9ca3af', fontSize: '0.875rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Expanded breakdown */}
                {isOpen && (
                  <div style={{
                    marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f3f4f6',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem',
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Score Breakdown
                      </h4>
                      <ScoreBar label="Skills Match (45%)" value={m.skillsScore} color="#1d4ed8" />
                      <ScoreBar label="Sector Match (30%)" value={m.sectorScore} color="#38bdf8" />
                      <ScoreBar label="Experience (25%)" value={m.experience} color="#facc15" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Candidate Info
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 2 }}>
                        <div><strong style={{ color: '#374151' }}>Level:</strong> {m.level}</div>
                        <div><strong style={{ color: '#374151' }}>Sector:</strong> {m.sectorName}</div>
                        <div><strong style={{ color: '#374151' }}>Skills:</strong> {m.topSkills.join(', ')}</div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Actions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Contact Candidate</button>
                        <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>View Full Profile</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
