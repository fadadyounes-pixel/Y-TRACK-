import Link from 'next/link';
import Logo from '../../components/Logo';
import Icon, { type IconName } from '../../components/Icon';

const ROLES: { label: string; badgeBg: string; badgeText: string; icon: IconName; code: string; dashboard: string }[] = [
  { label: 'Candidate', badgeBg: '#eff6ff', badgeText: '#1d4ed8', icon: 'graduation-cap', code: 'Moroccan CIN shape (e.g. AB1234)', dashboard: '/candidate — CV, score, matches' },
  { label: 'Coordinator', badgeBg: '#ecfdf5', badgeText: '#047857', icon: 'briefcase', code: 'NOMCOR#### — created by admin', dashboard: '/coordinator — jobs, CVs, matching' },
  { label: 'Admin', badgeBg: '#fef3c7', badgeText: '#92400e', icon: 'settings', code: 'ADMIN001', dashboard: '/admin — users, platform stats' },
];

const JOURNEY: { n: string; title: string; desc: string }[] = [
  { n: '01', title: 'Start', desc: 'Upload an existing CV or build one from scratch, in French, Arabic or English.' },
  { n: '02', title: 'AI Enhance', desc: 'Extracts experience, rewrites the summary and bullets, suggests skills — tuned for the Moroccan job market.' },
  { n: '03', title: 'Design', desc: 'Picks from 100 templates — 10 layouts × 10 color palettes. Arabic renders fully right-to-left.' },
  { n: '04', title: 'Match & Apply', desc: 'AI scores the CV against open coordinator job posts and applies in one click.' },
];

const ENGINE_FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'globe', title: 'Native Arabic RTL', desc: 'Logical CSS properties — no mirrored code paths, no layout forked per language.' },
  { icon: 'id-card', title: 'Moroccan-market fields', desc: 'Diploma level Bac → Bac+8, availability, mobility, driving licence — each optional, hidden when blank.' },
  { icon: 'graduation-cap', title: 'Junior mode', desc: "Fresh graduates get education placed before experience, automatically." },
  { icon: 'book-open', title: 'Trilingual sections', desc: "fr / ar / en section labels, independent of the app's own UI language." },
];

const COORD_TOOLS = [
  'Post and manage job openings',
  'Review the full candidate CV pool',
  'AI-scored candidate-to-job matching',
  'Track applications through the pipeline',
];

const ADMIN_TOOLS = [
  'User & coordinator account management',
  'Platform-wide usage statistics',
  'Candidate directory oversight',
  'Role & access control',
];

const SHIPPED = [
  '100-template CV engine with Arabic RTL',
  'Free, instant CV Health Score (0–100)',
  'AI-scored candidate-to-job matching',
  'Coordinator job posting & candidate pool',
  'Consolidated AI agent prompt, one source of truth',
  'JSON-mode consistency across the AI provider cascade',
];

const TECH = [
  { title: 'Framework', desc: 'Next.js 16, App Router, TypeScript' },
  { title: 'Styling', desc: 'CSS custom properties & inline styles — zero UI libraries' },
  { title: 'Data', desc: 'Upstash Redis — serverless key-value store' },
  { title: 'AI matching', desc: 'Free-tier provider cascade behind one proxy endpoint' },
  { title: 'Hosting', desc: 'Vercel, with Vercel Analytics' },
  { title: 'Typography', desc: "Inter — primary typeface across the whole app" },
];

const eyebrow: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af',
  textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem',
};
const h2: React.CSSProperties = {
  fontSize: '1.4rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: '0 0 0.75rem',
};
const sectionWrap: React.CSSProperties = { margin: '0 auto', maxWidth: '900px', padding: '3rem 1.5rem' };

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)', padding: '2.5rem 1.5rem 3rem' }}>
        <div style={{ margin: '0 auto', maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <Logo size="md" variant="light" />
            <Link href="/" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.6rem' }}>
            Project Details
          </p>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', maxWidth: '600px', margin: '0 0 0.75rem', lineHeight: 1.25 }}>
            TalentMap — AI recruitment for the Moroccan job market
          </h1>
          <p style={{ fontSize: '0.98rem', color: 'rgba(255,255,255,0.72)', maxWidth: '560px', margin: 0, lineHeight: 1.6 }}>
            talentmaponline.org matches candidates to job openings via AI-assisted CV analysis — candidates build and score CVs, coordinators post jobs and match talent, admins oversee the platform.
          </p>
        </div>
      </div>

      {/* ── Roles ── */}
      <div style={sectionWrap}>
        <p style={eyebrow}>Three roles, one platform</p>
        <h2 style={h2}>Who TalentMap Is Built For</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {ROLES.map(r => (
            <div key={r.label} className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: r.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon name={r.icon} size={22} color={r.badgeText} />
              </div>
              <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, color: r.badgeText, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {r.label}
              </span>
              <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 0.35rem', lineHeight: 1.5 }}>
                <b>Code:</b> {r.code}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                <b>Dashboard:</b> {r.dashboard}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Candidate journey ── */}
      <div style={{ ...sectionWrap, paddingTop: 0 }}>
        <p style={eyebrow}>Candidate journey</p>
        <h2 style={h2}>Building a Job-Ready CV</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
          {JOURNEY.map(j => (
            <div key={j.n} className="card">
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', margin: '0 0 0.5rem' }}>{j.n}</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 0.4rem' }}>{j.title}</h3>
              <p style={{ fontSize: '0.84rem', color: '#6b7280', margin: 0, lineHeight: 1.55 }}>{j.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CV engine ── */}
      <div style={{ ...sectionWrap, paddingTop: 0 }}>
        <p style={eyebrow}>The CV engine</p>
        <h2 style={h2}>100 Templates — 10 Layouts × 10 Palettes</h2>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.6, maxWidth: '680px' }}>
          Every template id is generated from the same layout/palette grid — not hand-built one by one — so new color options or layouts drop in without touching the others.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {ENGINE_FEATURES.map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '0.9rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={18} color="#1d4ed8" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '0 0 0.3rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Coordinator & Admin ── */}
      <div style={{ ...sectionWrap, paddingTop: 0 }}>
        <p style={eyebrow}>Running the program</p>
        <h2 style={h2}>Coordinator &amp; Admin Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="card" style={{ background: '#ecfdf5' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordinator</span>
            <ul style={{ margin: '0.75rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {COORD_TOOLS.map(t => (
                <li key={t} style={{ fontSize: '0.88rem', color: '#111827', paddingLeft: '1.1rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#047857' }}>•</span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ background: '#fef3c7' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</span>
            <ul style={{ margin: '0.75rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ADMIN_TOOLS.map(t => (
                <li key={t} style={{ fontSize: '0.88rem', color: '#111827', paddingLeft: '1.1rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#92400e' }}>•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Technology ── */}
      <div style={{ ...sectionWrap, paddingTop: 0 }}>
        <p style={eyebrow}>Technology</p>
        <h2 style={h2}>Built Lean, On Purpose</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {TECH.map(t => (
            <div key={t.title} className="card">
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '0 0 0.3rem' }}>{t.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status ── */}
      <div style={{ ...sectionWrap, paddingTop: 0 }}>
        <p style={eyebrow}>Where things stand</p>
        <h2 style={h2}>Shipped</h2>
        <div className="card">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {SHIPPED.map(s => (
              <li key={s} style={{ fontSize: '0.88rem', color: '#111827', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Icon name="check-circle" size={16} color="#10b981" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ textAlign: 'center', padding: '1rem 1.5rem 4rem' }}>
        <Link href="/login" className="btn-primary" style={{ display: 'inline-block' }}>
          Sign in to get started →
        </Link>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>© 2026 TalentMap</p>
      </div>
    </div>
  );
}
