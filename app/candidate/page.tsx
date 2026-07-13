'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

interface CandidateProfile {
  phone: string;
  skills: string[];
  sector: string;
  experience: string;
  matchScore: number;
  summary: string;
  bestMatchJob: string;
  bestMatchCompany: string;
}

const PROFILES: Record<string, CandidateProfile> = {
  CAN001: {
    phone: '+212 6 11 22 33 44',
    skills: ['Python', 'Django', 'SQL', 'REST APIs'],
    sector: 'Technology',
    experience: 'Mid-Level',
    matchScore: 82,
    summary:
      'Backend developer with strong expertise in Python ecosystems and scalable REST API design. Passionate about clean architecture and data-driven solutions.',
    bestMatchJob: 'Backend Python Developer',
    bestMatchCompany: 'DataSoft Solutions',
  },
  CAN002: {
    phone: '+212 6 22 33 44 55',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    sector: 'Technology',
    experience: 'Senior',
    matchScore: 94,
    summary:
      'Senior full-stack engineer specializing in React and TypeScript frontends paired with Node.js/GraphQL backends. Proven track record shipping production apps at scale.',
    bestMatchJob: 'Senior React Developer',
    bestMatchCompany: 'TechCorp',
  },
  CAN003: {
    phone: '+212 6 33 44 55 66',
    skills: ['Python', 'ML', 'TensorFlow', 'Data Analysis'],
    sector: 'Data Science',
    experience: 'Mid-Level',
    matchScore: 88,
    summary:
      'Data scientist with hands-on ML experience using TensorFlow and Python. Focused on building predictive models and delivering actionable insights from complex datasets.',
    bestMatchJob: 'Machine Learning Engineer',
    bestMatchCompany: 'DataVentures',
  },
};

const FALLBACK_PROFILE: CandidateProfile = {
  phone: '+212 6 00 00 00 00',
  skills: ['Communication', 'Problem Solving'],
  sector: 'General',
  experience: 'Entry-Level',
  matchScore: 50,
  summary: 'Motivated professional eager to contribute and grow within a dynamic organization.',
  bestMatchJob: 'Junior Associate',
  bestMatchCompany: 'TalentMap Corp',
};

function getScoreColors(score: number): { bg: string; color: string; label: string } {
  if (score >= 70) return { bg: '#d1fae5', color: '#065f46', label: 'Excellent' };
  if (score >= 40) return { bg: '#dbeafe', color: '#1e40af', label: 'Good' };
  return { bg: '#fee2e2', color: '#991b1b', label: 'Poor' };
}

function downloadCVasPDF(
  name: string,
  email: string,
  phone: string,
  idNumber: string,
  skills: string[],
  experience: string,
  sector: string,
  summary: string,
) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials2 = name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  const skillsHtml = skills.map(s =>
    `<span style="display:inline-block;padding:4px 12px;margin:3px 3px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;border:1px solid #bfdbfe;">${s}</span>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>${name} — CV</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:760px;margin:0 auto;background:#fff}
.hdr{background:linear-gradient(135deg,#0a1631 0%,#1a3a6b 50%,#2563eb 100%);padding:2.5rem 2.75rem 2rem;color:#fff;display:flex;align-items:center;gap:2rem}
.avatar{width:80px;height:80px;border-radius:50%;border:3px solid rgba(255,255,255,.45);background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.75rem;font-weight:900;color:#fff;flex-shrink:0}
.hdr-info{flex:1}
.hdr-name{font-size:1.85rem;font-weight:900;letter-spacing:-.03em;line-height:1.1}
.hdr-role{margin-top:.4rem;font-size:.95rem;font-weight:600;opacity:.75}
.contacts{display:flex;flex-wrap:wrap;gap:.4rem 1.5rem;margin-top:1rem}
.contacts span{font-size:.8rem;opacity:.8}
.body{padding:2rem 2.75rem}
.section{margin-bottom:1.75rem}
.sec-title{font-size:.67rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:#2563eb;margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:2px solid #dbeafe}
.summary-text{font-size:.9rem;color:#334155;line-height:1.8;border-left:3px solid #2563eb;padding-left:1rem;font-style:italic;background:#f8faff;padding:12px 12px 12px 16px;border-radius:0 8px 8px 0}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.info-box{background:#f9fafb;border:1px solid #f0f4f8;border-radius:8px;padding:10px 12px}
.info-box .lbl{font-size:10px;color:#9ca3af;font-weight:700;margin-bottom:2px}
.info-box .val{font-size:13px;color:#111;font-weight:500}
.footer{text-align:center;padding:.9rem;font-size:.68rem;color:#94a3b8;border-top:1px solid #f0f4f8;background:#f8fafc;letter-spacing:.04em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}@page{margin:1cm}}
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="avatar">${initials2}</div>
    <div class="hdr-info">
      <div class="hdr-name">${name}</div>
      <div class="hdr-role">${experience} · ${sector}</div>
      <div class="contacts">
        ${email ? `<span>✉ ${email}</span>` : ''}
        ${phone ? `<span>📞 ${phone}</span>` : ''}
        ${idNumber ? `<span>🪪 CIN ${idNumber}</span>` : ''}
      </div>
    </div>
  </div>
  <div class="body">
    ${summary ? `<div class="section"><div class="sec-title">✦ Profil Professionnel</div><div class="summary-text">${summary}</div></div>` : ''}
    ${(email || phone) ? `
    <div class="section">
      <div class="sec-title">✦ Contact</div>
      <div class="info-grid">
        ${email ? `<div class="info-box"><div class="lbl">Email</div><div class="val">${email}</div></div>` : ''}
        ${phone ? `<div class="info-box"><div class="lbl">Téléphone</div><div class="val">${phone}</div></div>` : ''}
        ${idNumber ? `<div class="info-box"><div class="lbl">CIN</div><div class="val">${idNumber}</div></div>` : ''}
      </div>
    </div>` : ''}
    ${skills.length ? `<div class="section"><div class="sec-title">✦ Compétences</div><div style="margin-top:4px">${skillsHtml}</div></div>` : ''}
  </div>
  <div class="footer">Généré par TalentMap · ${today}</div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

export default function CandidateDashboard() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && (!user || user.role !== 'candidate')) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  if (!initialized || !user || user.role !== 'candidate') return null;

  const profile = PROFILES[user.idNumber] ?? FALLBACK_PROFILE;
  const scoreColors = getScoreColors(profile.matchScore);

  const STEPS = [
    { num: '1', icon: '📄', label: 'Upload Your CV', desc: 'Share your CV to get analysed by Expert RH', duration: '~2 min' },
    { num: '2', icon: '🎯', label: 'Match Jobs', desc: 'Expert RH ranks you against open positions', duration: '~instant' },
    { num: '3', icon: '🚀', label: 'Apply', desc: 'Receive an adapted CV for your best match', duration: '~5 min' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header row with logout */}
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Candidate Portal" />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '1.5rem',
          transform: 'translateY(-50%)',
          zIndex: 10,
        }}>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: '8px',
              padding: '0.5rem 1.1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ maxWidth: '900px', padding: '2.5rem 1.5rem' }}>

        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1f5c 0%, #2563eb 100%)',
          borderRadius: '14px',
          padding: '2rem',
          marginBottom: '1.75rem',
          color: 'white',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Welcome to TalentMap
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Hello, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
            Three steps. Your complete career map.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Complete all 3 steps to receive your match score to share with your advisor.
          </p>
        </div>

        {/* Three-step info table */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>
            How it works
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['#', 'Step', 'Description', 'Time'].map((h, i) => (
                  <th key={h} style={{
                    padding: '0.65rem 0.875rem',
                    textAlign: i === 0 ? 'center' : 'left',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderBottom: '2px solid #e5e7eb',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STEPS.map((s, i) => (
                <tr key={i} style={{ borderBottom: i < STEPS.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '0.875rem', textAlign: 'center', fontSize: '1.1rem' }}>{s.icon}</td>
                  <td style={{ padding: '0.875rem', fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{s.label}</td>
                  <td style={{ padding: '0.875rem', color: '#6b7280', fontSize: '0.875rem' }}>{s.desc}</td>
                  <td style={{ padding: '0.875rem', color: '#9ca3af', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{s.duration}</td>
                </tr>
              ))}
              <tr style={{ background: '#f8fafc', borderTop: '2px solid #e5e7eb' }}>
                <td colSpan={2} style={{ padding: '0.875rem', fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                  Total
                </td>
                <td style={{ padding: '0.875rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  3 steps · Your career map
                </td>
                <td style={{ padding: '0.875rem', color: '#2563eb', fontWeight: 700, fontSize: '0.82rem' }}>
                  ~10 min
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '1.25rem' }}>
            <Link href="/candidate/upload" className="btn-primary">
              Begin — Upload my CV →
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Profile card */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                  My Profile
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Your current candidate profile on TalentMap</p>
              </div>
              <span style={{
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                background: scoreColors.bg,
                color: scoreColors.color,
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {scoreColors.label} Match
              </span>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'ID Number', value: user.idNumber },
                { label: 'Phone', value: profile.phone },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: 500 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.skills.map(skill => (
                  <span key={skill} style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience + Score row */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  Experience
                </p>
                <span style={{
                  display: 'inline-block',
                  background: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '9999px',
                  padding: '0.35rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  {profile.experience}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  Current Match Score
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '160px', height: '10px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${profile.matchScore}%`,
                      height: '100%',
                      background: scoreColors.color,
                      borderRadius: '9999px',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: scoreColors.color }}>
                    {profile.matchScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best match job card */}
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Best Match Job
              </p>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                {profile.bestMatchJob}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                @ {profile.bestMatchCompany}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                background: scoreColors.bg,
                color: scoreColors.color,
                fontSize: '1rem',
                fontWeight: 800,
              }}>
                {profile.matchScore}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/candidate/info" className="btn-primary" style={{ background: '#0a1f5c' }}>
            👤 Mes Informations
          </Link>
          <Link href="/candidate/upload" className="btn-primary">
            Update CV
          </Link>
          <button
            className="btn-primary"
            style={{ background: '#2563eb' }}
            onClick={() =>
              downloadCVasPDF(
                user.name,
                user.email,
                profile.phone,
                user.idNumber,
                profile.skills,
                profile.experience,
                profile.sector,
                profile.summary,
              )
            }
          >
            Download CV
          </button>
        </div>
      </div>
    </main>
  );
}
