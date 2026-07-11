import Link from 'next/link';
import Logo from '../components/Logo';

const features = [
  {
    icon: '📄',
    title: 'Smart CV Upload',
    desc: 'Upload PDF, Word, or image CVs in bulk. AI reads, improves, and creates structured candidate profiles automatically.',
    color: '#eff6ff',
    accent: '#1d4ed8',
  },
  {
    icon: '🤖',
    title: 'Expert RH Analysis',
    desc: 'Expert RH processes each CV, enhances content quality, extracts skills and experience, and standardizes profiles.',
    color: '#f0f9ff',
    accent: '#0284c7',
  },
  {
    icon: '🎯',
    title: 'Precision Matching',
    desc: 'Weighted algorithm: 45% skills, 30% sector, 25% experience. Scores candidates 0–100% against every job offer.',
    color: '#eff6ff',
    accent: '#2563eb',
  },
  {
    icon: '📊',
    title: 'Real-time Dashboard',
    desc: 'Live statistics, top matches per job, recruitment trends, and advanced search with filters across all data.',
    color: '#f0fdf4',
    accent: '#16a34a',
  },
  {
    icon: '👥',
    title: 'Role-Based Access',
    desc: 'Three roles: Admin (full access), Coordinator (upload & manage), Candidate (apply & view). Secure by default.',
    color: '#fdf4ff',
    accent: '#9333ea',
  },
  {
    icon: '📈',
    title: 'Recruitment Analytics',
    desc: 'Track hiring trends, pipeline velocity, candidate quality scores, and time-to-fill across all open positions.',
    color: '#f0f9ff',
    accent: '#0284c7',
  },
];

const steps = [
  { n: '01', title: 'Upload CVs', desc: 'Select 20+ files at once — PDF, Word, or images.' },
  { n: '02', title: 'Expert RH Processes', desc: 'Expert RH reads, improves, and extracts structured data from each CV.' },
  { n: '03', title: 'Post a Job', desc: 'Create a job offer with required skills, sector, and experience level.' },
  { n: '04', title: 'Get Matches', desc: 'Candidates are scored and ranked automatically. Excellent (70–100%), Good (40–69%).' },
];

const stats = [
  { value: '10x', label: 'Faster Screening' },
  { value: '45%', label: 'Skills Weight' },
  { value: '20+', label: 'Bulk Upload' },
  { value: '3', label: 'User Roles' },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1f5c 0%, #2563eb 100%)',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Nav bar */}
        <div style={{ padding: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo size="md" variant="light" />
            <Link href="/login" style={{
              background: '#ffffff',
              color: '#1d4ed8',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}>
              Sign in
            </Link>
          </div>
        </div>

        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'rgba(56,189,248,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'rgba(147,197,253,0.07)', pointerEvents: 'none',
        }} />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '3rem 1.5rem 5rem' }}>
          <div style={{ maxWidth: '700px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: '9999px', padding: '0.4rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <span style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ✦ Smart Recruitment Platform
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}>
              TalentMap —<br />
              <span style={{ color: '#93c5fd' }}>Find Your Best Talent</span>
            </h1>

            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: '2.5rem',
              maxWidth: '560px',
              lineHeight: 1.7,
            }}>
              TalentMap automates CV screening, matches candidates to jobs with precision scoring, and gives your team a real-time recruitment command center.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn-white" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
                Sign In →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '4rem', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#93c5fd' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              display: 'inline-block',
              background: '#eff6ff', color: '#1d4ed8',
              padding: '0.35rem 1rem', borderRadius: '9999px',
              fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              Core Features
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Everything you need to hire smarter
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6b7280', marginTop: '1rem', maxWidth: '540px', margin: '1rem auto 0' }}>
              From CV upload to final hire — TalentMap handles the entire pipeline.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ borderTop: `3px solid ${f.accent}`, transition: 'all 0.2s' }}>
                <div style={{
                  width: '48px', height: '48px', background: f.color,
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '1rem',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '6rem 0', background: '#f0f9ff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              display: 'inline-block',
              background: '#e0f2fe', color: '#0284c7',
              padding: '0.35rem 1rem', borderRadius: '9999px',
              fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              How It Works
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              4 steps to smarter hiring
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
            {steps.map((step) => (
              <div key={step.n} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px',
                  background: 'linear-gradient(135deg, #1a3a8f, #2563eb)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '1rem' }}>{step.n}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matching algorithm */}
      <section style={{ padding: '6rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: '#eff6ff', color: '#1d4ed8',
                padding: '0.35rem 1rem', borderRadius: '9999px',
                fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: '1rem',
              }}>
                Matching Algorithm
              </span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                Precision scoring, not guesswork
              </h2>
              <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '2rem' }}>
                Our weighted algorithm evaluates candidates on three key dimensions. Every match gets a transparent score you can trust.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/login" className="btn-primary">Get Started</Link>
              </div>
            </div>
            <div>
              {[
                { label: 'Skills Match', weight: 45, color: '#1d4ed8' },
                { label: 'Sector Match', weight: 30, color: '#38bdf8' },
                { label: 'Experience Level', weight: 25, color: '#60a5fa' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color, fontSize: '1.1rem' }}>{item.weight}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${item.weight}%`,
                      background: item.color, borderRadius: '9999px',
                    }} />
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: '2rem', padding: '1.25rem', background: '#f9fafb', borderRadius: '10px',
                display: 'flex', gap: '1.5rem', justifyContent: 'space-around',
              }}>
                {[
                  { label: 'Excellent', range: '70–100%', color: '#065f46', bg: '#d1fae5' },
                  { label: 'Good', range: '40–69%', color: '#1e40af', bg: '#dbeafe' },
                  { label: 'Poor', range: '0–39%', color: '#991b1b', bg: '#fee2e2' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '0.25rem 0.75rem',
                      borderRadius: '9999px', background: s.bg, color: s.color,
                      fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem',
                    }}>
                      {s.label}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 60%, #1d4ed8 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'rgba(56,189,248,0.07)', pointerEvents: 'none',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Logo size="lg" variant="light" />
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white',
            margin: '1.5rem 0 1rem', letterSpacing: '-0.03em',
          }}>
            Ready to find the right talent?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Start uploading CVs today and let Expert RH do the heavy lifting.
          </p>
          <Link href="/login" className="btn-white" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
            Get Started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a1f5c', color: 'rgba(255,255,255,0.6)', padding: '2rem 0',
        textAlign: 'center', fontSize: '0.875rem',
      }}>
        <div className="container">
          <Logo size="sm" variant="light" showText={true} />
          <p style={{ marginTop: '1rem' }}>© 2025 TalentMap. Recruitment Platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
