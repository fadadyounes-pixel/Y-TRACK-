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
    bestMatchCompany: 'AI Ventures',
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

function downloadCV(
  name: string,
  email: string,
  phone: string,
  idNumber: string,
  skills: string[],
  experience: string,
  sector: string,
  summary: string,
) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — CV</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; color: #1f2937; }
    .wrapper { max-width: 800px; margin: 2rem auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0a1f5c, #2563eb); padding: 2.5rem 2rem; color: white; }
    .header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin-top: 0.35rem; opacity: 0.75; font-size: 0.95rem; }
    .body { padding: 2rem; }
    .section { margin-bottom: 1.75rem; }
    .section-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; border-bottom: 2px solid #dbeafe; padding-bottom: 0.4rem; margin-bottom: 1rem; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .info-item label { font-size: 0.75rem; color: #6b7280; font-weight: 600; }
    .info-item p { font-size: 0.95rem; color: #111827; margin-top: 0.15rem; }
    .summary-text { color: #374151; line-height: 1.7; font-size: 0.95rem; }
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .skill-pill { background: #eff6ff; color: #1d4ed8; border-radius: 9999px; padding: 0.3rem 0.9rem; font-size: 0.82rem; font-weight: 600; }
    .exp-badge { display: inline-block; background: #f3f4f6; color: #374151; border-radius: 9999px; padding: 0.35rem 1rem; font-size: 0.85rem; font-weight: 600; }
    .footer { text-align: center; padding: 1rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${name}</h1>
      <p>${experience} &bull; ${sector}</p>
    </div>
    <div class="body">
      <div class="section">
        <div class="section-title">Personal Information</div>
        <div class="info-grid">
          <div class="info-item"><label>Full Name</label><p>${name}</p></div>
          <div class="info-item"><label>ID Number</label><p>${idNumber}</p></div>
          <div class="info-item"><label>Email</label><p>${email}</p></div>
          <div class="info-item"><label>Phone</label><p>${phone}</p></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <p class="summary-text">${summary}</p>
      </div>
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-wrap">
          ${skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Experience Level</div>
        <span class="exp-badge">${experience}</span>
      </div>
      <div class="section">
        <div class="section-title">Sector</div>
        <span class="exp-badge">${sector}</span>
      </div>
    </div>
    <div class="footer">Generated by TalentMap &bull; ${new Date().toLocaleDateString('en-GB')}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}_CV.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'candidate') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'candidate') return null;

  const profile = PROFILES[user.idNumber] ?? FALLBACK_PROFILE;
  const scoreColors = getScoreColors(profile.matchScore);

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
          padding: '2rem 2rem',
          marginBottom: '1.75rem',
          color: 'white',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Welcome back
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            {user.name}
          </h1>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
            <span>ID: <strong style={{ color: 'white' }}>{user.idNumber}</strong></span>
            <span>Email: <strong style={{ color: 'white' }}>{user.email}</strong></span>
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
                  <span style={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: scoreColors.color,
                  }}>
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
          <Link
            href="/candidate/upload"
            className="btn-primary"
          >
            Update CV
          </Link>
          <button
            className="btn-primary"
            style={{ background: '#2563eb' }}
            onClick={() =>
              downloadCV(
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
