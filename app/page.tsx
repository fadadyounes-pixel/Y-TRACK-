import Link from 'next/link';
import Logo from '../components/Logo';

const ROLES = [
  {
    label: 'Candidate',
    badgeBg: '#f3f4f6',
    badgeText: '#374151',
    icon: '🎓',
    title: 'Build your CV, find your match',
    desc: 'Upload your CV, get an instant match score against open positions, and track every application in one place.',
  },
  {
    label: 'Coordinator',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
    icon: '👔',
    title: 'Post jobs, screen with AI',
    desc: 'Manage job offers, review incoming CVs, and let AI-assisted matching surface your strongest candidates first.',
  },
  {
    label: 'Admin',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    icon: '⚙',
    title: 'Oversee the whole pipeline',
    desc: 'Manage coordinator accounts, monitor platform-wide stats, and keep the recruitment pipeline running smoothly.',
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
        padding: '3.5rem 1.5rem 4.5rem',
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
          <Logo size="lg" variant="light" />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            maxWidth: '620px',
            margin: 0,
            lineHeight: 1.25,
          }}>
            The AI-powered recruitment platform matching talent to opportunity
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '480px',
            margin: 0,
            lineHeight: 1.6,
          }}>
            CV analysis, AI-assisted candidate matching, and a full recruitment pipeline — built for candidates, coordinators, and admins alike.
          </p>
          <Link href="/login" className="btn-white" style={{ marginTop: '0.5rem' }}>
            Sign in to get started →
          </Link>
        </div>
      </div>

      {/* ── Role explainer ── */}
      <div className="container" style={{ padding: '3rem 1.5rem 4rem' }}>
        <p style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textAlign: 'center',
          margin: '0 0 0.5rem',
        }}>
          Three roles, one platform
        </p>
        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#111827',
          letterSpacing: '-0.02em',
          textAlign: 'center',
          margin: '0 0 2.5rem',
        }}>
          Built for every step of the hiring journey
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {ROLES.map(r => (
            <div key={r.label} className="card">
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: r.badgeBg,
                color: r.badgeText,
                marginBottom: '1rem',
              }}>
                {r.icon} {r.label}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
                {r.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/login" className="btn-primary">
            Sign in →
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
          © 2026 TalentMap
        </p>
      </div>
    </div>
  );
}
