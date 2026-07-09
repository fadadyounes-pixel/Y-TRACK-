'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AIAssistant from '../components/AIAssistant';

const NAVY = '#0a1f5c';
const BLUE = '#2563eb';
const SKY  = '#38bdf8';
const WH   = '#ffffff';
const BG   = '#f0f4ff';
const GR   = '#6b7280';
const GN   = '#22c55e';
const BORDER = '#dde4f0';
const CD   = '#dde4f0';

interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  sector: string;
  region: string;
  skills: string[];
  experience: string;
  education: string;
  matchScore: number;
  bio: string;
  languages: string[];
  lastUpdated: string;
}

const PROFILES: Record<string, CandidateProfile> = {
  CAN001: {
    name: 'Mohammed Ait Aissa', email: 'mohammed@email.com', phone: '+212 6 11 00 11 00',
    sector: 'Numérique/TIC', region: 'Casablanca-Settat',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
    experience: '3 ans', education: 'Bac+3 Informatique — ENSAM Casablanca',
    matchScore: 87,
    bio: 'Développeur Full Stack passionné par les technologies web. Expérience en développement d\'applications e-commerce et SaaS.',
    languages: ['Arabe', 'Français', 'Anglais'],
    lastUpdated: '2026-06-15',
  },
  CAN002: {
    name: 'Sarah Benali', email: 'sarah@email.com', phone: '+212 6 22 00 22 00',
    sector: 'Artisanat', region: 'Fès-Meknès',
    skills: ['Broderie', 'Zellige', 'Design artisanal', 'Gestion atelier', 'Marketing digital'],
    experience: '5 ans', education: 'Institut des Arts Traditionnels de Fès',
    matchScore: 74,
    bio: 'Artisane spécialisée dans les arts traditionnels marocains. Expertise en production de pièces artisanales haut de gamme.',
    languages: ['Arabe', 'Français'],
    lastUpdated: '2026-05-20',
  },
  CAN003: {
    name: 'Karim Djebbar', email: 'karim@email.com', phone: '+212 6 33 00 33 00',
    sector: 'Agriculture/Élevage', region: 'Souss-Massa',
    skills: ['Irrigation goutte-à-goutte', 'Agrumes', 'Gestion exploitation', 'Coopérative'],
    experience: '7 ans', education: 'IAV Hassan II — Ingénieur Agronome',
    matchScore: 91,
    bio: 'Ingénieur agronome spécialisé en agriculture durable. Expertise en gestion d\'exploitations agrumicoles.',
    languages: ['Arabe', 'Français', 'Anglais', 'Espagnol'],
    lastUpdated: '2026-07-01',
  },
  CAN004: {
    name: 'Fatima Zahra Ouali', email: 'fatima@email.com', phone: '+212 6 44 00 44 00',
    sector: 'Commerce/Services', region: 'Marrakech-Safi',
    skills: ['Vente', 'Service client', 'Gestion stock', 'WhatsApp Business', 'Excel'],
    experience: '4 ans', education: 'BTS Commerce — Marrakech',
    matchScore: 68,
    bio: 'Commerciale dynamique avec expérience en gestion de boutiques et de plateformes de vente en ligne.',
    languages: ['Arabe', 'Français'],
    lastUpdated: '2026-04-10',
  },
  CAN005: {
    name: 'Youssef El Mansouri', email: 'youssef@email.com', phone: '+212 6 55 00 55 00',
    sector: 'BTP/Maçonnerie', region: 'Oriental',
    skills: ['Maçonnerie', 'Plomberie', 'Électricité', 'Gestion chantier', 'AutoCAD'],
    experience: '10 ans', education: 'OFPPT — Technicien BTP',
    matchScore: 82,
    bio: 'Technicien BTP expérimenté. Spécialisé dans les travaux de construction et de rénovation résidentielle.',
    languages: ['Arabe', 'Français'],
    lastUpdated: '2026-06-30',
  },
};

function ScoreRing({ score }: { score: number }) {
  const col = score >= 80 ? GN : score >= 60 ? BLUE : '#f59e0b';
  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke={BORDER} strokeWidth="6"/>
        <circle cx="40" cy="40" r="34" fill="none" stroke={col} strokeWidth="6"
          strokeDasharray={`${2 * Math.PI * 34}`}
          strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
          strokeLinecap="round" transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset .6s ease' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: col, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color: GR, fontWeight: 600 }}>SCORE</span>
      </div>
    </div>
  );
}

function generateCVHtml(profile: CandidateProfile, cv?: any): string {
  const p = cv || profile;
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<title>CV — ${p.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;color:#1a1a2e;background:#f8faff}
.container{max-width:820px;margin:0 auto;background:#fff;box-shadow:0 0 40px rgba(0,0,0,.1)}
.header{background:linear-gradient(135deg,#0a1f5c,#2563eb);padding:36px 40px;color:#fff;display:flex;gap:24px;align-items:center}
.avatar{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;flex-shrink:0}
.name{font-size:26px;font-weight:800;margin-bottom:4px}
.title{font-size:14px;opacity:.8;margin-bottom:8px}
.contact-row{display:flex;gap:16px;flex-wrap:wrap}
.contact-item{font-size:12px;opacity:.75}
.body{display:grid;grid-template-columns:1fr 280px;gap:0}
.main{padding:32px 36px}
.sidebar{background:#f0f4ff;padding:28px 24px;border-left:3px solid #2563eb}
h2{font-size:13px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid #dde4ff}
.bio{font-size:13px;line-height:1.7;color:#444;margin-bottom:24px}
.exp-item{margin-bottom:16px;padding-left:12px;border-left:3px solid #2563eb}
.exp-title{font-size:14px;font-weight:700;color:#0a1f5c}
.exp-meta{font-size:11px;color:#6b7280;margin-bottom:4px}
.exp-desc{font-size:12px;color:#444;line-height:1.6}
.skill-pill{display:inline-block;padding:4px 12px;border-radius:20px;background:#dde4ff;color:#0a1f5c;font-size:11px;font-weight:600;margin:3px 3px 3px 0}
.lang-item{font-size:12px;color:#444;margin-bottom:4px}
.score-box{background:linear-gradient(135deg,#0a1f5c,#2563eb);border-radius:12px;padding:16px;text-align:center;color:#fff;margin-bottom:16px}
.score-num{font-size:36px;font-weight:900;color:#38bdf8}
.meta-item{font-size:11px;color:#6b7280;margin-bottom:6px}
@media print{body{background:#fff}.container{box-shadow:none}}
</style></head>
<body><div class="container">
<div class="header">
  <div class="avatar">${p.name[0]}</div>
  <div>
    <div class="name">${p.name}</div>
    <div class="title">${p.sector || profile.sector}</div>
    <div class="contact-row">
      <span class="contact-item">📧 ${p.email || profile.email}</span>
      <span class="contact-item">📞 ${p.phone || profile.phone}</span>
      <span class="contact-item">📍 ${p.region || profile.region}</span>
    </div>
  </div>
</div>
<div class="body">
  <div class="main">
    <h2>Profil</h2>
    <p class="bio">${p.bio || profile.bio}</p>
    <h2>Expérience Professionnelle</h2>
    ${p.experience ? `<div class="exp-item">
      <div class="exp-title">${p.sector || profile.sector}</div>
      <div class="exp-meta">Expérience: ${p.experience}</div>
      <div class="exp-desc">${p.bio || ''}</div>
    </div>` : ''}
    <h2>Formation</h2>
    <div class="exp-item">
      <div class="exp-title">${p.education || profile.education}</div>
    </div>
  </div>
  <div class="sidebar">
    <div class="score-box">
      <div class="score-num">${profile.matchScore}</div>
      <div style="font-size:11px;opacity:.8">Score de profil</div>
    </div>
    <h2>Compétences</h2>
    <div style="margin-bottom:20px">
      ${(p.skills || profile.skills).map((s: string) => `<span class="skill-pill">${s}</span>`).join('')}
    </div>
    <h2>Langues</h2>
    ${(p.languages || profile.languages).map((l: string) => `<div class="lang-item">• ${l}</div>`).join('')}
    <div style="margin-top:20px">
      <h2>Informations</h2>
      <div class="meta-item">📍 ${p.region || profile.region}</div>
      <div class="meta-item">🏭 ${p.sector || profile.sector}</div>
      <div class="meta-item">📅 Mis à jour: ${profile.lastUpdated}</div>
    </div>
  </div>
</div>
</div></body></html>`;
}

export default function CandidatePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'jobs'>('profile');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'candidate')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const profile = PROFILES[user.idNumber] ?? PROFILES['CAN001'];

  function downloadCV() {
    const html = generateCVHtml(profile);
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })),
      download: `CV_${profile.name.replace(/\s+/g, '_')}.html`,
    });
    a.click();
  }

  const scoreColor = profile.matchScore >= 80 ? GN : profile.matchScore >= 60 ? BLUE : '#f59e0b';

  const MOCK_JOBS = [
    { id: 1, title: 'Développeur Full Stack', company: 'TechMaroc SARL', sector: 'Numérique/TIC', location: 'Casablanca', match: 89, type: 'CDI', skills: ['JavaScript', 'React', 'Node.js'] },
    { id: 2, title: 'Chef de Projet IT', company: 'InnoSoft', sector: 'Numérique/TIC', location: 'Rabat', match: 74, type: 'CDI', skills: ['Gestion de projet', 'Agile', 'SQL'] },
    { id: 3, title: 'Consultant Digital', company: 'ConsultTech', sector: 'Numérique/TIC', location: 'Casablanca', match: 66, type: 'CDD', skills: ['Digital Marketing', 'Analytics', 'Python'] },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Poppins',sans-serif" }}>
      {/* Header */}
      <div style={{ background: NAVY, height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 16px rgba(10,31,92,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},${SKY})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: WH }}>T</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: WH }}>TalentMap</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px',
            background: 'rgba(255,255,255,.07)', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: BLUE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: WH }}>{user.name[0]}</div>
            <span style={{ fontSize: 12, color: WH, fontWeight: 600 }}>{user.name}</span>
            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 9, fontWeight: 700,
              background: BLUE + '33', color: SKY }}>Candidat</span>
          </div>
          <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
            color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: WH, borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', gap: 4 }}>
          {[{ id: 'profile', label: '👤 Mon Profil' }, { id: 'jobs', label: '💼 Offres Correspondantes' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              padding: '12px 18px', border: 'none', background: 'transparent',
              color: tab === t.id ? BLUE : GR, fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              borderBottom: `2px solid ${tab === t.id ? BLUE : 'transparent'}`,
              cursor: 'pointer', transition: 'all .15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 18px 80px' }}>

        {tab === 'profile' && (
          <>
            {/* Profile hero card */}
            <div style={{ background: NAVY, borderRadius: 18, padding: '28px 28px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%',
                background: `linear-gradient(135deg,${BLUE},${SKY})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 900, color: WH, flexShrink: 0 }}>{profile.name[0]}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: WH, marginBottom: 4 }}>{profile.name}</h1>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>
                  {profile.sector} · {profile.region}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>📧 {profile.email}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>📞 {profile.phone}</span>
                </div>
              </div>
              <ScoreRing score={profile.matchScore}/>
            </div>

            {/* Info cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { icon: '🎓', label: 'Expérience', value: profile.experience },
                { icon: '📚', label: 'Formation', value: profile.education.split('—')[0].trim() },
                { icon: '🌍', label: 'Langues', value: profile.languages.join(', ') },
                { icon: '📅', label: 'Mis à jour', value: profile.lastUpdated },
              ].map((x, i) => (
                <div key={i} style={{ background: WH, borderRadius: 14, padding: '14px 16px',
                  border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(10,31,92,.05)' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{x.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: GR, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>{x.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{x.value}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', marginBottom: 16,
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Compétences</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.skills.map((s, i) => (
                  <span key={i} style={{ padding: '6px 14px', borderRadius: 20,
                    background: BG, color: NAVY, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${BLUE}33` }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', marginBottom: 16,
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>À propos</span>
              </div>
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75 }}>{profile.bio}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={downloadCV} style={{
                padding: '14px', borderRadius: 13, border: 'none',
                background: `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>⬇ Télécharger CV</button>
              <button onClick={() => router.push('/candidate/upload')} style={{
                padding: '14px', borderRadius: 13,
                border: `2px solid ${BLUE}`, background: BG, color: NAVY,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>✏️ Mettre à jour mon CV</button>
            </div>
          </>
        )}

        {tab === 'jobs' && (
          <>
            <div style={{ background: NAVY, borderRadius: 16, padding: '18px 22px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 36 }}>💼</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: WH }}>Offres pour votre profil</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                  {MOCK_JOBS.length} offres correspondent à vos compétences en {profile.sector}
                </div>
              </div>
            </div>
            {MOCK_JOBS.map(job => (
              <div key={job.id} style={{ background: WH, borderRadius: 16, padding: '18px 20px',
                marginBottom: 12, border: `1px solid ${BORDER}`,
                boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0 }}>🏢</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{job.title}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 9, fontWeight: 700,
                        background: job.match >= 80 ? GN + '22' : BLUE + '22',
                        color: job.match >= 80 ? GN : BLUE }}>
                        {job.match}% match
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: GR, marginBottom: 10 }}>
                      {job.company} · {job.location} · {job.type}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.skills.map((s, i) => (
                        <span key={i} style={{ padding: '3px 10px', borderRadius: 14,
                          background: BG, color: NAVY, fontSize: 11, fontWeight: 600,
                          border: `1px solid ${BORDER}` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    Postuler
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <AIAssistant role="candidate" context={`Candidat: ${user.name} | Secteur: ${profile.sector} | Score: ${profile.matchScore}/100 | Compétences: ${profile.skills.join(', ')}`}/>
    </div>
  );
}
