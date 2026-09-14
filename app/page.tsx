import Link from 'next/link';
import Logo from '../components/Logo';
import Icon, { type IconName } from '../components/Icon';

const ROLES: { label: string; badgeBg: string; badgeText: string; icon: IconName; title: string; desc: string }[] = [
  {
    label: 'Candidate',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
    icon: 'graduation-cap',
    title: 'Build your CV, find your match',
    desc: 'Upload your CV, get an instant match score against open positions, and track every application in one place.',
  },
  {
    label: 'Coordinator',
    badgeBg: '#ecfdf5',
    badgeText: '#047857',
    icon: 'briefcase',
    title: 'Post jobs, screen with AI',
    desc: 'Manage job offers, review incoming CVs, and let AI-assisted matching surface your strongest candidates first.',
  },
  {
    label: 'Admin',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    icon: 'settings',
    title: 'Oversee the whole pipeline',
    desc: 'Manage coordinator accounts, monitor platform-wide stats, and keep the recruitment pipeline running smoothly.',
  },
];

const STATS = [
  { icon: 'sparkles' as IconName, label: 'AI-assisted matching' },
  { icon: 'file-text' as IconName, label: '100+ CV templates' },
  { icon: 'shield-check' as IconName, label: 'Built for the Moroccan market' },
];

function HeroGraphic() {
  return (
    <svg viewBox="0 0 380 320" width="100%" height="100%" style={{ maxWidth: '420px', display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id="hg-card1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1a3a8f" />
        </linearGradient>
      </defs>
      {/* Back card */}
      <rect x="30" y="40" width="230" height="150" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
      {/* Middle card */}
      <rect x="55" y="70" width="230" height="150" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" />
      {/* Front card — CV summary */}
      <rect x="20" y="105" width="230" height="150" rx="16" fill="#ffffff" />
      <circle cx="52" cy="137" r="14" fill="url(#hg-card1)" />
      <rect x="76" y="128" width="90" height="8" rx="4" fill="#0a1f5c" opacity="0.85" />
      <rect x="76" y="142" width="60" height="6" rx="3" fill="#9ca3af" />
      <rect x="34" y="168" width="202" height="6" rx="3" fill="#e5e7eb" />
      <rect x="34" y="182" width="202" height="6" rx="3" fill="#e5e7eb" />
      <rect x="34" y="196" width="140" height="6" rx="3" fill="#e5e7eb" />
      <rect x="34" y="216" width="52" height="18" rx="9" fill="#eff6ff" />
      <rect x="94" y="216" width="52" height="18" rx="9" fill="#eff6ff" />
      <rect x="154" y="216" width="52" height="18" rx="9" fill="#eff6ff" />
      {/* Match badge */}
      <circle cx="290" cy="90" r="42" fill="#ffffff" />
      <circle cx="290" cy="90" r="42" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 6" />
      <text x="290" y="84" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0a1f5c" fontFamily="Arial,sans-serif">96%</text>
      <text x="290" y="102" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2563eb" fontFamily="Arial,sans-serif" letterSpacing="0.5">MATCH</text>
      {/* Connector dashes */}
      <path d="M255 108 L262 100" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
        padding: '3.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '-120px', right: '-100px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container hero-grid" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
          <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 420px', minWidth: 0 }}>
            <Logo size="lg" variant="light" />
            <h1 style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              maxWidth: '560px',
              margin: 0,
              lineHeight: 1.25,
            }}>
              The AI-powered recruitment platform matching talent to opportunity
            </h1>
            <p style={{
              fontSize: '0.98rem',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '480px',
              margin: 0,
              lineHeight: 1.6,
            }}>
              CV analysis, AI-assisted candidate matching, and a full recruitment pipeline — built for candidates, coordinators, and admins alike.
            </p>
            <div>
              <Link href="/login" className="btn-white">
                Sign in to get started →
              </Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.25rem' }}>
              {STATS.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name={s.icon} size={16} color="#93c5fd" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-graphic" style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '420px' }}>
            <HeroGraphic />
          </div>
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
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: r.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Icon name={r.icon} size={22} color={r.badgeText} />
              </div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: r.badgeText,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}>
                {r.label}
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

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { flex-direction: column; }
          .hero-graphic { max-width: 280px !important; }
        }
      `}</style>
    </div>
  );
}
