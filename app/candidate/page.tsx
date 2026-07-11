'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

// ── Design tokens (CareerMap-aligned) ──────────────────
const BG   = '#0A0F2C';   // Dark background
const ND   = '#0F2233';   // Navy dark
const N    = '#1C3A5C';   // Navy
const Y    = '#2563EB';   // Primary blue
const YD   = '#1E40AF';   // Blue dark
const YL   = '#EFF6FF';   // Blue light
const WH   = '#FFFFFF';
const GR   = '#6B7280';
const CD   = '#DDE4F0';
const GN   = '#22C55E';
const CR   = '#F8FAFF';

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tm-cand-css')) return;
  const el = document.createElement('style');
  el.id = 'tm-cand-css';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    @keyframes tmRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .tm-rise{animation:tmRise .4s ease both}
    .tm-card{background:#fff;border-radius:16px;padding:22px;box-shadow:0 4px 24px rgba(15,34,51,.08);border:1px solid rgba(28,58,92,.07);margin-bottom:14px}
    .tm-act-btn{display:inline-flex;align-items:center;gap:6px;padding:13px 22px;border-radius:11px;border:none;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .18s;text-decoration:none}
    .tm-act-btn:hover{filter:brightness(1.1)}
  `;
  document.head.appendChild(el);
}

export default function CandidateDashboard() {
  injectCSS();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'candidate') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'candidate') return null;

  const profile = PROFILES[user.idNumber] ?? FALLBACK_PROFILE;
  const scoreColor = profile.matchScore >= 70 ? GN : profile.matchScore >= 40 ? Y : '#EF4444';

  const STEPS = [
    {
      num: '1',
      icon: '📄',
      label: 'Upload Your CV',
      desc: 'Share your CV or fill your profile',
      detail: 'Analyzed by Expert RH',
      color: Y,
    },
    {
      num: '2',
      icon: '🎯',
      label: 'Get Matched',
      desc: 'AI ranks you against open positions',
      detail: 'Score up to 100%',
      color: '#8B5CF6',
    },
    {
      num: '3',
      icon: '🚀',
      label: 'Apply & Win',
      desc: 'Adapted CV sent to your best match',
      detail: 'Real employer contacts',
      color: GN,
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: CR,
      fontFamily: "'Poppins', -apple-system, sans-serif",
    }}>
      {/* ── Sticky header ── */}
      <div style={{
        background: ND,
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 22px',
        boxShadow: '0 2px 16px rgba(15,34,51,.3)',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg,${Y},${YD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: WH,
          }}>T</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: WH, letterSpacing: '-.3px' }}>TalentMap</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 12px',
            background: 'rgba(255,255,255,.07)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,.1)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: `linear-gradient(135deg,${Y},${YD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: ND,
            }}>{user.name[0]}</div>
            <span style={{ fontSize: 12, color: WH, fontWeight: 600 }}>{user.name}</span>
            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: '#1aabaa22', color: '#1aabaa',
              border: '1px solid #1aabaa55',
            }}>Candidat</span>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '5px 12px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,.45)',
              fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Déconnexion</button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="tm-rise" style={{ maxWidth: 700, margin: '0 auto', padding: '28px 18px 60px' }}>

        {/* Welcome card */}
        <div style={{
          background: ND,
          borderRadius: 18,
          padding: '28px 24px',
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle orb */}
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(37,99,235,.18)', filter: 'blur(50px)', pointerEvents: 'none',
          }}/>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6 }}>
            Bienvenue sur TalentMap
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: WH, marginBottom: 6, letterSpacing: '-.02em' }}>
            Hello, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', marginBottom: 20, lineHeight: 1.6 }}>
            Three steps. Your complete career map.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65 }}>
            Upload your CV and let Expert RH match you with the best open positions.
            You'll receive an adapted CV and a match score to share with your advisor.
          </p>
        </div>

        {/* Three-step table (CareerMap style) */}
        <div className="tm-card">
          <p style={{
            fontSize: 10, fontWeight: 700, color: GR,
            textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 14,
          }}>
            🗺️ Your career path — 3 steps
          </p>

          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 14px',
              borderRadius: 12,
              background: i % 2 === 0 ? CR : WH,
              border: `1px solid ${CD}`,
              marginBottom: i < STEPS.length - 1 ? 8 : 0,
            }}>
              {/* Step number */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: s.color + '18',
                border: `2px solid ${s.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{s.icon}</div>

              {/* Step info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ND, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: GR }}>{s.desc}</div>
              </div>

              {/* Badge */}
              <span style={{
                padding: '4px 10px', borderRadius: 20,
                background: s.color + '18', color: s.color,
                fontSize: 10, fontWeight: 700,
                border: `1px solid ${s.color}33`,
                flexShrink: 0,
              }}>{s.detail}</span>
            </div>
          ))}

          {/* Total row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 14px', marginTop: 10,
            background: ND, borderRadius: 11,
          }}>
            <span style={{ fontSize: 12, color: WH, fontWeight: 700 }}>→ Complete all 3 steps</span>
            <span style={{ fontSize: 12, color: Y, fontWeight: 800 }}>Get your match results</span>
          </div>
        </div>

        {/* Match score card (if profile exists) */}
        {profile.matchScore > 0 && (
          <div className="tm-card" style={{ borderLeft: `4px solid ${scoreColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ fontSize: 10, color: GR, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
                  Best match
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: ND, marginBottom: 2 }}>{profile.bestMatchJob}</h3>
                <p style={{ fontSize: 13, color: GR }}>@ {profile.bestMatchCompany}</p>
              </div>
              <div style={{
                padding: '10px 18px', borderRadius: 12,
                background: scoreColor + '18', border: `2px solid ${scoreColor}44`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{profile.matchScore}%</div>
                <div style={{ fontSize: 9, color: GR, marginTop: 2 }}>match score</div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.skills.map(sk => (
                <span key={sk} style={{
                  background: YL, color: Y,
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 11, fontWeight: 600,
                }}>{sk}</span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/candidate/upload"
            className="tm-act-btn"
            style={{
              background: `linear-gradient(135deg,${Y},${YD})`,
              color: ND,
            }}
          >
            📄 Upload / Update CV →
          </Link>
          <Link
            href="/jobs"
            className="tm-act-btn"
            style={{
              background: 'transparent',
              color: N,
              border: `2px solid ${N}`,
            }}
          >
            🔍 View Job Offers
          </Link>
        </div>
      </div>
    </div>
  );
}
