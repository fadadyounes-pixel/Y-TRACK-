import Link from 'next/link';
import Logo from '../../components/Logo';
import PageHeader from '../../components/PageHeader';

const stats = [
  { label: 'Total Candidates', value: '248', change: '+12 this week', icon: '👥', color: '#1d4ed8', bg: '#eff6ff' },
  { label: 'Active Job Offers', value: '14', change: '3 new today', icon: '💼', color: '#0284c7', bg: '#f0f9ff' },
  { label: 'Matches Made', value: '1,043', change: '+89 this week', icon: '🎯', color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Avg Match Score', value: '74%', change: '+2% vs last week', icon: '📈', color: '#ca8a04', bg: '#fefce8' },
];

const topMatches = [
  { candidate: 'Sarah Benali', job: 'Senior React Developer', score: 94, skills: ['React', 'TypeScript', 'Node.js'] },
  { candidate: 'Karim Djebbar', job: 'Data Scientist', score: 88, skills: ['Python', 'ML', 'TensorFlow'] },
  { candidate: 'Amina Touati', job: 'Product Manager', score: 85, skills: ['Agile', 'Roadmap', 'Analytics'] },
  { candidate: 'Youcef Hadj', job: 'DevOps Engineer', score: 81, skills: ['Docker', 'K8s', 'AWS'] },
  { candidate: 'Lina Benkhalifa', job: 'UX Designer', score: 79, skills: ['Figma', 'Research', 'Prototyping'] },
];

const recentActivity = [
  { time: '2m ago', action: 'CV uploaded', name: 'Mohammed Ait Aissa', type: 'upload' },
  { time: '15m ago', action: 'Job posted', name: 'Full Stack Developer @ TechCorp', type: 'job' },
  { time: '1h ago', action: 'Match found', name: '94% — Sarah Benali → React Dev', type: 'match' },
  { time: '2h ago', action: 'Bulk upload', name: '23 CVs processed', type: 'upload' },
  { time: '3h ago', action: 'Job posted', name: 'Data Engineer @ FinanceAI', type: 'job' },
];

const activityColors: Record<string, string> = {
  upload: '#3b82f6',
  job: '#8b5cf6',
  match: '#10b981',
};

function ScoreBadge({ score }: { score: number }) {
  const isExcellent = score >= 70;
  const isGood = score >= 40;
  return (
    <span style={{
      padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
      background: isExcellent ? '#d1fae5' : isGood ? '#dbeafe' : '#fee2e2',
      color: isExcellent ? '#065f46' : isGood ? '#1e40af' : '#991b1b',
    }}>
      {score}%
    </span>
  );
}

export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="TalentMap" />
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Recruitment Dashboard
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Real-time overview of your hiring pipeline</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/upload" className="btn-primary">+ Upload CVs</Link>
            <Link href="/jobs" className="btn-secondary">Post Job</Link>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>{s.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Top Matches */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>🎯 Top Matches</h2>
              <Link href="/matches" style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>View All →</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Candidate', 'Job', 'Skills', 'Score'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topMatches.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: `hsl(${i * 40 + 210}, 70%, 90%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: `hsl(${i * 40 + 210}, 70%, 30%)`,
                          flexShrink: 0,
                        }}>
                          {m.candidate.split(' ').map(n => n[0]).join('')}
                        </div>
                        {m.candidate}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.85rem' }}>{m.job}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {m.skills.slice(0, 2).map(sk => (
                          <span key={sk} style={{
                            background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px',
                            padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                          }}>{sk}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}><ScoreBadge score={m.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>⚡ Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.75rem 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: activityColors[a.type], marginTop: '6px', flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{a.action}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{a.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.1rem' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline chart placeholder */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>📊 Recruitment Pipeline</h2>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Last 7 days</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '140px' }}>
            {[
              { day: 'Mon', cvs: 8, matches: 5 },
              { day: 'Tue', cvs: 14, matches: 9 },
              { day: 'Wed', cvs: 11, matches: 7 },
              { day: 'Thu', cvs: 19, matches: 13 },
              { day: 'Fri', cvs: 16, matches: 11 },
              { day: 'Sat', cvs: 6, matches: 4 },
              { day: 'Sun', cvs: 9, matches: 6 },
            ].map(d => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '100px' }}>
                  <div style={{
                    width: '14px', height: `${d.cvs * 5}px`, background: '#1d4ed8',
                    borderRadius: '3px 3px 0 0', transition: 'height 0.3s',
                  }} />
                  <div style={{
                    width: '14px', height: `${d.matches * 5}px`, background: '#38bdf8',
                    borderRadius: '3px 3px 0 0', transition: 'height 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#1d4ed8', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>CVs Uploaded</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Matches Made</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
