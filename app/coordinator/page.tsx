'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';

/* ── Types ─────────────────────────────────────────── */
interface CV {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  name: string;
  email: string;
  phone: string;
  sector: string;
  experience: string;
  skills: string[];
  summary: string;
  error?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  sector: string;
  experience: string;
  location: string;
  salary?: string;
  skills: string[];
  description?: string;
  status: string;
  createdAt?: string;
}

interface MatchResult {
  total: number;
  skillsPts: number;
  sectorPts: number;
  expPts: number;
  matchedSkills: string[];
}

/* ── Match Algorithm ───────────────────────────────── */
const EXP_ORDER = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

function computeMatch(cv: CV, job: Job): MatchResult {
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const cvSkills = cv.skills || [];
  const matchedSkills = cvSkills.filter(s =>
    jobSkills.some(js => js.includes(s.toLowerCase()) || s.toLowerCase().includes(js))
  );
  const skillsPts = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 60) : 0;
  const sectorPts = cv.sector === job.sector ? 25 : 0;
  const expI = EXP_ORDER.indexOf(cv.experience);
  const jobI = EXP_ORDER.indexOf(job.experience);
  const diff = expI >= 0 && jobI >= 0 ? Math.abs(expI - jobI) : 3;
  const expPts = diff === 0 ? 15 : diff === 1 ? 9 : diff === 2 ? 4 : 0;
  return { total: Math.min(100, skillsPts + sectorPts + expPts), skillsPts, sectorPts, expPts, matchedSkills };
}

/* ── Color helpers ──────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 70) return { bg: '#d1fae5', color: '#065f46' };
  if (score >= 50) return { bg: '#dbeafe', color: '#1e40af' };
  return { bg: '#fee2e2', color: '#991b1b' };
}

function initials(name: string) {
  return name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}

function avatarColor(name: string) {
  const hues = [210, 245, 175, 30, 280, 145, 0, 55];
  const h = hues[(name.charCodeAt(0) || 0) % hues.length];
  return { bg: `hsl(${h},70%,90%)`, color: `hsl(${h},65%,30%)` };
}

/* ── Mini score bar ─────────────────────────────────── */
function ScoreBar({ label, pts, max, color }: { label: string; pts: number; max: number; color: string }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px' }}>
        <span style={{ color: '#9ca3af' }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#374151' }}>{pts}/{max}</span>
      </div>
      <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '2px', background: color, width: `${(pts / max) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

/* ── PDF Download ───────────────────────────────────── */
function downloadCvPDF(cv: CV) {
  const skillsHtml = cv.skills.map(s =>
    `<span style="display:inline-block;padding:3px 10px;margin:3px;border-radius:5px;background:#dbeafe;color:#1e40af;font-size:12px;font-weight:600;">${s}</span>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>CV – ${cv.name || cv.fileName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;padding:40px 48px;max-width:760px;margin:0 auto}
  h1{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:4px}
  .sub{font-size:13px;color:#6b7280;margin-bottom:16px}
  .badge{display:inline-block;padding:3px 12px;border-radius:999px;font-size:11px;font-weight:700;margin-right:6px}
  .badge-blue{background:#eff6ff;color:#1d4ed8}
  .badge-green{background:#f0fdf4;color:#166534}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:20px 0}
  .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;margin-bottom:10px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px}
  .info-box{background:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:10px 12px}
  .info-box .lbl{font-size:10px;color:#9ca3af;font-weight:700;margin-bottom:2px}
  .info-box .val{font-size:13px;color:#111;font-weight:500}
  .summary{border-left:3px solid #2563eb;padding:10px 14px;background:#f8faff;border-radius:0 8px 8px 0;font-size:13px;color:#374151;line-height:1.7;font-style:italic}
  .skills{margin-top:4px}
  .footer{margin-top:32px;font-size:10px;color:#d1d5db;text-align:center}
  @media print{body{padding:28px 36px}@page{margin:1cm}}
</style>
</head>
<body>
  <h1>${cv.name || cv.fileName}</h1>
  <div class="sub">${cv.fileName}${cv.fileSize ? ' · ' + cv.fileSize : ''}</div>
  <div>
    ${cv.sector ? `<span class="badge badge-blue">${cv.sector}</span>` : ''}
    ${cv.experience ? `<span class="badge badge-green">${cv.experience}</span>` : ''}
  </div>
  <hr class="divider"/>
  ${(cv.email || cv.phone) ? `
  <div class="section-label">Contact</div>
  <div class="info-grid">
    ${cv.email ? `<div class="info-box"><div class="lbl">Email</div><div class="val">${cv.email}</div></div>` : ''}
    ${cv.phone ? `<div class="info-box"><div class="lbl">Téléphone</div><div class="val">${cv.phone}</div></div>` : ''}
  </div>
  <hr class="divider"/>` : ''}
  ${cv.summary ? `
  <div class="section-label">Accroche professionnelle</div>
  <div class="summary">${cv.summary}</div>
  <hr class="divider"/>` : ''}
  ${cv.skills.length > 0 ? `
  <div class="section-label">Compétences</div>
  <div class="skills">${skillsHtml}</div>` : ''}
  <div class="footer">Généré par TalentMap · ${new Date().toLocaleDateString('fr-MA')}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
  iframe.src = url;
  document.body.appendChild(iframe);
  const cleanup = () => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    URL.revokeObjectURL(url);
  };
  iframe.onload = () => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch { cleanup(); }
    setTimeout(cleanup, 60000);
  };
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch {}
    setTimeout(cleanup, 60000);
  }, 1500);
}

/* ── CV Panel (slide-in drawer) ─────────────────────── */
function CVPanel({ cv, jobs, onClose }: { cv: CV; jobs: Job[]; onClose: () => void }) {
  const av = avatarColor(cv.name || cv.fileName);
  const topMatches = useMemo(() => {
    return jobs
      .filter(j => j.status === 'Open' || j.status === 'open')
      .map(j => ({ job: j, match: computeMatch(cv, j) }))
      .sort((a, b) => b.match.total - a.match.total)
      .slice(0, 5);
  }, [cv, jobs]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }} />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100vw',
        background: 'white', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)',
        zIndex: 50, overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1.25rem', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, flexShrink: 0 }}>
              {initials(cv.name || cv.fileName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', marginBottom: '0.2rem' }}>{cv.name || cv.fileName}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>{cv.fileName} · {cv.fileSize}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {cv.sector && <span style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8' }}>{cv.sector}</span>}
                {cv.experience && <span style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, background: '#f0fdf4', color: '#166534' }}>{cv.experience}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                onClick={() => downloadCvPDF(cv)}
                title="Télécharger PDF"
                style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '8px', padding: '0 12px', height: '32px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
              >
                ⬇ PDF
              </button>
              <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
          {/* Contact */}
          {(cv.email || cv.phone) && (
            <section style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Contact</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {cv.email && (
                  <div style={{ padding: '0.65rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700 }}>Email</div>
                    <div style={{ fontSize: '0.82rem', color: '#111827', fontWeight: 500, marginTop: '2px', wordBreak: 'break-all' }}>{cv.email}</div>
                  </div>
                )}
                {cv.phone && (
                  <div style={{ padding: '0.65rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700 }}>Téléphone</div>
                    <div style={{ fontSize: '0.82rem', color: '#111827', fontWeight: 500, marginTop: '2px' }}>{cv.phone}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Summary */}
          {cv.summary && (
            <section style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Accroche</div>
              <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65, fontStyle: 'italic', borderLeft: '3px solid #2563eb', paddingLeft: '0.75rem', background: '#f8faff', borderRadius: '0 8px 8px 0', padding: '0.75rem 0.75rem 0.75rem 1rem' }}>
                {cv.summary}
              </div>
            </section>
          )}

          {/* Skills */}
          {cv.skills.length > 0 && (
            <section style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Compétences</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cv.skills.map(s => (
                  <span key={s} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: '#dbeafe', color: '#1e40af' }}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Best matching jobs */}
          <section>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              🎯 Meilleures offres ({topMatches.length})
            </div>
            {topMatches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                Aucune offre ouverte pour le moment
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {topMatches.map(({ job, match }) => {
                  const sc = scoreColor(match.total);
                  return (
                    <div key={job.id} style={{ padding: '0.9rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>{job.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{job.company} · {job.location}</div>
                        </div>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: '0.5rem' }}>
                          {match.total}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <ScoreBar label="Compétences" pts={match.skillsPts} max={60} color="#2563eb" />
                        <ScoreBar label="Secteur" pts={match.sectorPts} max={25} color="#0284c7" />
                        <ScoreBar label="Expérience" pts={match.expPts} max={15} color="#16a34a" />
                      </div>
                      {match.matchedSkills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                          {match.matchedSkills.map(s => (
                            <span key={s} style={{ padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

/* ── Job Match Panel (inline) ───────────────────────── */
function JobMatchPanel({ job, cvs, onSelectCV }: { job: Job; cvs: CV[]; onSelectCV: (cv: CV) => void }) {
  const ranked = useMemo(() => {
    return cvs
      .filter(cv => cv.status === 'done')
      .map(cv => ({ cv, match: computeMatch(cv, job) }))
      .sort((a, b) => b.match.total - a.match.total);
  }, [job, cvs]);

  if (ranked.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
        Aucun candidat disponible — <Link href="/coordinator/upload" style={{ color: '#2563eb', fontWeight: 600 }}>Importer des CVs</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
        🎯 {ranked.length} candidat{ranked.length !== 1 ? 's' : ''} classés par pertinence
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {ranked.map(({ cv, match }, i) => {
          const sc = scoreColor(match.total);
          const av = avatarColor(cv.name || cv.fileName);
          return (
            <div key={cv.id}
              onClick={() => onSelectCV(cv)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', background: 'white', borderRadius: '8px', border: `1.5px solid ${i < 3 && match.total >= 50 ? '#bfdbfe' : '#f3f4f6'}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                {initials(cv.name || cv.fileName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.name || cv.fileName}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                  {match.matchedSkills.slice(0, 3).map(s => (
                    <span key={s} style={{ padding: '0.05rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>{s}</span>
                  ))}
                  {cv.skills.filter(s => !match.matchedSkills.includes(s)).slice(0, 2).map(s => (
                    <span key={s} style={{ padding: '0.05rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, background: sc.bg, color: sc.color }}>{match.total}%</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px' }}>Voir CV →</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────── */
export default function CoordinatorDashboard() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'overview' | 'candidates' | 'jobs' | 'matching'>('overview');
  const [cvs, setCvs] = useState<CV[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Candidates tab state
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('All');
  const [filterExp, setFilterExp] = useState('All');

  // CV panel state
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);

  // Jobs tab state
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  // Matching tab state
  const [matchJob, setMatchJob] = useState<string>('');
  const [aiInsights, setAiInsights] = useState<{ topPick: string; rationale: string; gaps: string[]; questions: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'coordinator')) router.push('/login');
  }, [user, initialized, router]);

  // Load real data from Redis
  useEffect(() => {
    if (!user || user.role !== 'coordinator') return;
    setLoading(true);
    fetch('/api/sheets')
      .then(r => r.json())
      .then(data => {
        if (data.cvs?.length) setCvs(data.cvs.filter((c: CV) => c.status === 'done'));
        if (data.jobs?.length) setJobs(data.jobs);
        // Fallback to localStorage cache
        if (!data.cvs?.length) {
          try {
            const cached = localStorage.getItem('coordinator_cvs');
            if (cached) setCvs(JSON.parse(cached).filter((c: CV) => c.status === 'done'));
          } catch {}
        }
        if (!data.jobs?.length) {
          try {
            const cached = localStorage.getItem('coordinator_jobs');
            if (cached) setJobs(JSON.parse(cached));
          } catch {}
        }
      })
      .catch(() => {
        try {
          const cv = localStorage.getItem('coordinator_cvs');
          if (cv) setCvs(JSON.parse(cv).filter((c: CV) => c.status === 'done'));
          const jb = localStorage.getItem('coordinator_jobs');
          if (jb) setJobs(JSON.parse(jb));
        } catch {}
      })
      .finally(() => setLoading(false));
  }, [user]);

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const doneCvs = cvs.filter(c => c.status === 'done');
    const openJobs = jobs.filter(j => j.status === 'Open' || j.status === 'open');
    let totalMatchScore = 0, matchCount = 0;
    doneCvs.forEach(cv => {
      openJobs.forEach(job => {
        const m = computeMatch(cv, job);
        if (m.total >= 50) { totalMatchScore += m.total; matchCount++; }
      });
    });
    const avgScore = matchCount > 0 ? Math.round(totalMatchScore / matchCount) : 0;
    const excellentMatches = (() => {
      let count = 0;
      doneCvs.forEach(cv => {
        const best = openJobs.reduce((max, job) => Math.max(max, computeMatch(cv, job).total), 0);
        if (best >= 70) count++;
      });
      return count;
    })();
    return { totalCvs: doneCvs.length, openJobs: openJobs.length, avgScore, excellentMatches };
  }, [cvs, jobs]);

  /* ── Top matches for overview ── */
  const topMatches = useMemo(() => {
    const openJobs = jobs.filter(j => j.status === 'Open' || j.status === 'open');
    const result: { cv: CV; bestJob: Job; bestMatch: MatchResult; bestScore: number }[] = [];
    cvs.filter(c => c.status === 'done').forEach(cv => {
      let bestScore = 0, bestJob: Job | null = null, bestMatch: MatchResult | null = null;
      openJobs.forEach(job => {
        const m = computeMatch(cv, job);
        if (m.total > bestScore) { bestScore = m.total; bestJob = job; bestMatch = m; }
      });
      if (bestJob && bestMatch) result.push({ cv, bestJob, bestMatch, bestScore });
    });
    return result.sort((a, b) => b.bestScore - a.bestScore).slice(0, 8);
  }, [cvs, jobs]);

  /* ── Candidates filters ── */
  const sectors = useMemo(() => ['All', ...Array.from(new Set(cvs.map(c => c.sector).filter(Boolean)))], [cvs]);
  const filteredCvs = useMemo(() => {
    return cvs.filter(cv => {
      const q = search.toLowerCase();
      const matchQ = !q || (cv.name || '').toLowerCase().includes(q) ||
        cv.skills.some(s => s.toLowerCase().includes(q)) ||
        (cv.sector || '').toLowerCase().includes(q);
      const matchS = filterSector === 'All' || cv.sector === filterSector;
      const matchE = filterExp === 'All' || cv.experience === filterExp;
      return matchQ && matchS && matchE;
    });
  }, [cvs, search, filterSector, filterExp]);

  if (!initialized || !user || user.role !== 'coordinator') return null;

  /* ── Matching tab job ── */
  const activeMatchJob = matchJob ? jobs.find(j => j.id === matchJob) : jobs[0];
  const matchRanked = useMemo(() => {
    if (!activeMatchJob) return [];
    return cvs
      .filter(c => c.status === 'done')
      .map(cv => ({ cv, match: computeMatch(cv, activeMatchJob) }))
      .sort((a, b) => b.match.total - a.match.total);
  }, [cvs, activeMatchJob]);

  /* ── AI Insights generator ── */
  const generateAiInsights = async () => {
    if (!activeMatchJob) return;
    setAiLoading(true);
    setAiInsights(null);
    const top5 = matchRanked.slice(0, 5).map(({ cv, match }) => ({
      name: cv.name || cv.fileName,
      sector: cv.sector,
      experience: cv.experience,
      skills: cv.skills,
      score: match.total,
      matchedSkills: match.matchedSkills,
    }));
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Offre: ${activeMatchJob.title} chez ${activeMatchJob.company}\nSecteur: ${activeMatchJob.sector} | Expérience: ${activeMatchJob.experience}\nCompétences requises: ${activeMatchJob.skills.join(', ')}\n\nTop candidats (par score):\n${top5.map((c, i) => `${i + 1}. ${c.name} — ${c.sector} / ${c.experience} — Score: ${c.score}% — Skills correspondantes: ${c.matchedSkills.join(', ') || 'aucune'}`).join('\n')}` }],
          system: 'Analyse ces candidats pour ce poste. Réponds UNIQUEMENT avec ce JSON valide sans markdown:\n{"topPick":"nom du meilleur candidat + 1 phrase courte expliquant pourquoi il est le meilleur fit","rationale":"2-3 phrases synthétisant le classement global et les forces communes","gaps":["lacune ou besoin de formation identifié 1","lacune 2","lacune 3"],"questions":["Question entretien ciblée au poste 1","Question 2","Question 3"]}',
          task: 'json',
          max_tokens: 700,
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const m = text.match(/\{[\s\S]*\}/);
      if (m) setAiInsights(JSON.parse(m[0]));
    } catch {}
    setAiLoading(false);
  };

  const excellent = matchRanked.filter(x => x.match.total >= 70);
  const good = matchRanked.filter(x => x.match.total >= 50 && x.match.total < 70);
  const others = matchRanked.filter(x => x.match.total < 50);

  /* ── Styles ── */
  const inp: React.CSSProperties = { padding: '0.55rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', background: 'white' };
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '0.55rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: 'none',
    background: active ? '#2563eb' : 'white', color: active ? 'white' : '#6b7280', transition: 'all 0.15s',
  });

  /* ── Sidebar nav items ── */
  const NAV: { key: typeof tab; icon: string; label: string }[] = [
    { key: 'overview',   icon: '⊞',  label: 'Vue d\'ensemble' },
    { key: 'candidates', icon: '👥', label: `Candidats${cvs.length > 0 ? ` (${cvs.length})` : ''}` },
    { key: 'jobs',       icon: '💼', label: `Offres${jobs.length > 0 ? ` (${jobs.length})` : ''}` },
    { key: 'matching',   icon: '✦',  label: 'Matching IA' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Dark sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#0B1629',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo area */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <Logo size="md" variant="light" />
        </div>

        {/* User pill */}
        <div style={{ margin: '0.75rem 0.875rem', padding: '0.6rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '2px' }}>Coordinateur</div>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.id}</div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(n => {
            const active = tab === n.key;
            return (
              <button key={n.key} onClick={() => setTab(n.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 0.75rem', borderRadius: '7px', border: 'none',
                  background: active ? 'rgba(27,79,216,.85)' : 'transparent',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,.5)',
                  fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', textAlign: 'left', transition: 'all .18s',
                  fontFamily: 'inherit',
                }}>
                <span style={{ fontSize: '0.9rem', width: '18px', flexShrink: 0, textAlign: 'center' }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Action buttons */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Link href="/coordinator/upload" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 0.75rem', borderRadius: '7px', background: '#1B4FD8', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
            📁 Importer CVs
          </Link>
          <Link href="/coordinator/jobs" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 0.75rem', borderRadius: '7px', background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)' }}>
            ➕ Nouvelle offre
          </Link>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0.75rem', borderRadius: '7px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.35)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: '2px' }}>
            ↩ Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, background: '#F6F8FC', overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <div>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0B1629', margin: 0 }}>
              { NAV.find(n => n.key === tab)?.label ?? 'Dashboard' }
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!loading && cvs.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginRight: '0.5rem' }}>Aucun CV — commencez par en importer</span>
            )}
          </div>
        </div>

        {/* CV Panel */}
        {selectedCV && <CVPanel cv={selectedCV} jobs={jobs} onClose={() => setSelectedCV(null)} />}

        <div style={{ padding: '1.75rem 2rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'CVs importés',        value: loading ? '…' : stats.totalCvs,         accent: '#1B4FD8' },
            { label: 'Offres ouvertes',      value: loading ? '…' : stats.openJobs,         accent: '#0284C7' },
            { label: 'Profils excellents',   value: loading ? '…' : stats.excellentMatches, accent: '#059669' },
            { label: 'Score moy. matching',  value: loading ? '…' : (stats.avgScore > 0 ? stats.avgScore + '%' : '—'), accent: '#7C3AED' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#FFFFFF', borderRadius: '10px',
              border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,.04)',
              borderLeft: `3px solid ${s.accent}`,
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1629', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '0.4rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════ OVERVIEW ══════════════════════════ */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '1.5rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>🎯 Top profils / offres</h2>
              {topMatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
                  <p style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>Le matching IA attend vos données</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Importez des CVs et créez des offres pour voir les matches automatiques.</p>
                  <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/coordinator/upload" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>📁 Importer CVs</Link>
                    <Link href="/coordinator/jobs" className="btn-primary" style={{ background: '#0284c7', fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>➕ Créer offre</Link>
                  </div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {['Candidat', 'Meilleure offre', 'Compétences clés', 'Score'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topMatches.map(({ cv, bestJob, bestMatch, bestScore }, i) => {
                      const sc = scoreColor(bestScore);
                      const av = avatarColor(cv.name || cv.fileName);
                      return (
                        <tr key={cv.id} onClick={() => setSelectedCV(cv)} style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}>
                          <td style={{ padding: '0.7rem 0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>
                                {initials(cv.name || cv.fileName)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{cv.name || cv.fileName}</div>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{cv.experience}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.82rem', color: '#6b7280' }}>
                            {bestJob?.title}<br /><span style={{ fontSize: '0.7rem' }}>{bestJob?.company}</span>
                          </td>
                          <td style={{ padding: '0.7rem 0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {(bestMatch?.matchedSkills || []).slice(0, 2).map(s => (
                                <span key={s} style={{ background: '#d1fae5', color: '#065f46', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>{s}</span>
                              ))}
                              {cv.skills.filter(s => !(bestMatch?.matchedSkills || []).includes(s)).slice(0, 1).map(s => (
                                <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 600 }}>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '0.7rem 0.75rem' }}>
                            <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, background: sc.bg, color: sc.color }}>{bestScore}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Active jobs sidebar */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>💼 Offres actives</h2>
                <Link href="/coordinator/jobs" style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Gérer →</Link>
              </div>
              {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                  <p>Aucune offre — <Link href="/coordinator/jobs" style={{ color: '#2563eb', fontWeight: 600 }}>créer une offre</Link></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {jobs.map(j => {
                    const isOpen = j.status === 'Open' || j.status === 'open';
                    const matchCount = cvs.filter(cv => computeMatch(cv, j).total >= 50).length;
                    return (
                      <div key={j.id}
                        onClick={() => { setTab('matching'); setMatchJob(j.id); }}
                        style={{ padding: '0.85rem', background: isOpen ? '#f0f9ff' : '#f9fafb', borderRadius: '8px', borderLeft: `3px solid ${isOpen ? '#2563eb' : '#d1d5db'}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', marginBottom: '0.2rem' }}>{j.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.4rem' }}>{j.company} · {j.sector}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
                            {matchCount} profil{matchCount !== 1 ? 's' : ''} ≥50%
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: '9999px', background: isOpen ? '#d1fae5' : '#f3f4f6', color: isOpen ? '#065f46' : '#6b7280', fontWeight: 700 }}>{j.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════ CANDIDATES ══════════════════════════ */}
        {tab === 'candidates' && (
          <div>
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, compétence, secteur…" style={{ ...inp, width: '240px' }} />
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={inp}>
                {sectors.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterExp} onChange={e => setFilterExp(e.target.value)} style={inp}>
                {['All', ...EXP_ORDER].map(e => <option key={e}>{e}</option>)}
              </select>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{filteredCvs.length} résultat{filteredCvs.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <p>Chargement des candidats…</p>
              </div>
            ) : cvs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Aucun CV importé</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Importez des CVs pour les voir apparaître ici avec leurs profils extraits par l'IA.
                </p>
                <Link href="/coordinator/upload" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  📁 Importer des CVs (20+ en simultané)
                </Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>Candidats ({filteredCvs.length})</h2>
                  <Link href="/coordinator/upload" style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>+ Importer</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredCvs.map((cv, i) => {
                    const av = avatarColor(cv.name || cv.fileName);
                    const openJobs = jobs.filter(j => j.status === 'Open' || j.status === 'open');
                    const bestScore = openJobs.length > 0
                      ? Math.max(...openJobs.map(j => computeMatch(cv, j).total))
                      : null;
                    const sc = bestScore !== null ? scoreColor(bestScore) : null;
                    return (
                      <div key={cv.id}
                        onClick={() => setSelectedCV(cv)}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < filteredCvs.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer', transition: 'background 0.15s', background: 'white' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
                          {initials(cv.name || cv.fileName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.15rem' }}>{cv.name || cv.fileName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.35rem' }}>
                            {cv.sector && <span style={{ marginRight: '0.5rem' }}>{cv.sector}</span>}
                            {cv.experience && <span style={{ color: '#9ca3af' }}>{cv.experience}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {cv.skills.slice(0, 4).map(s => <span key={s} style={{ background: '#dbeafe', color: '#1e40af', borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>)}
                            {cv.skills.length > 4 && <span style={{ fontSize: '0.68rem', color: '#9ca3af', alignSelf: 'center' }}>+{cv.skills.length - 4}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                          {sc && bestScore !== null ? (
                            <span style={{ padding: '0.25rem 0.7rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, background: sc.bg, color: sc.color }}>{bestScore}%</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>—</span>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); downloadCvPDF(cv); }}
                            style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ⬇ PDF
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filteredCvs.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Aucun candidat ne correspond à votre recherche.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════ JOBS ══════════════════════════ */}
        {tab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Toutes les offres ({jobs.length})</h2>
              <Link href="/coordinator/jobs" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>➕ Nouvelle offre</Link>
            </div>

            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <p>Chargement des offres…</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
                <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Aucune offre d'emploi</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Créez des offres pour permettre à l'IA de matcher les candidats.</p>
                <Link href="/coordinator/jobs" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  ➕ Créer une offre
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {jobs.map(j => {
                  const isOpen = j.status === 'Open' || j.status === 'open';
                  const isExpanded = expandedJob === j.id;
                  const matchCount = cvs.filter(cv => computeMatch(cv, j).total >= 50).length;
                  return (
                    <div key={j.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${isOpen ? '#2563eb' : '#d1d5db'}` }}>
                      <div
                        onClick={() => setExpandedJob(isExpanded ? null : j.id)}
                        style={{ padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.25rem' }}>{j.title}</div>
                          <div style={{ fontSize: '0.825rem', color: '#6b7280' }}>
                            {j.company} · {j.sector} · {j.experience} · {j.location}
                          </div>
                          {j.skills?.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              {j.skills.slice(0, 5).map(s => <span key={s} style={{ background: '#f3f4f6', color: '#374151', borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>)}
                              {j.skills.length > 5 && <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>+{j.skills.length - 5}</span>}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexShrink: 0 }}>
                          <button
                            onClick={e => { e.stopPropagation(); setTab('matching'); setMatchJob(j.id); }}
                            style={{ padding: '0.4rem 0.85rem', borderRadius: '7px', border: '1.5px solid #2563eb', background: 'transparent', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                            🎯 {matchCount} match{matchCount !== 1 ? 'es' : ''}
                          </button>
                          <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: isOpen ? '#d1fae5' : '#f3f4f6', color: isOpen ? '#065f46' : '#6b7280', fontWeight: 700 }}>{j.status}</span>
                          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <JobMatchPanel job={j} cvs={cvs} onSelectCV={cv => setSelectedCV(cv)} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════ MATCHING IA ══════════════════════════ */}
        {tab === 'matching' && (
          <div>
            {/* Job selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sélectionner une offre</label>
                <select
                  value={matchJob || (jobs[0]?.id ?? '')}
                  onChange={e => { setMatchJob(e.target.value); setAiInsights(null); }}
                  style={{ ...inp, minWidth: '300px', fontWeight: 600, color: '#111827' }}>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                  ))}
                </select>
              </div>
              {activeMatchJob && (
                <div style={{ padding: '0.65rem 1rem', background: '#f0f9ff', borderRadius: '8px', border: '1.5px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700, marginBottom: '0.2rem' }}>{activeMatchJob.sector} · {activeMatchJob.experience}</div>
                  <div style={{ fontSize: '0.78rem', color: '#374151' }}>{activeMatchJob.location}</div>
                </div>
              )}
            </div>

            {!activeMatchJob || jobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
                <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Aucune offre disponible</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Créez une offre d'emploi pour lancer le matching IA.</p>
                <Link href="/coordinator/jobs" className="btn-primary" style={{ textDecoration: 'none' }}>➕ Créer une offre</Link>
              </div>
            ) : cvs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Aucun CV importé</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Importez des CVs pour démarrer le matching automatique.</p>
                <Link href="/coordinator/upload" className="btn-primary" style={{ textDecoration: 'none' }}>📁 Importer des CVs</Link>
              </div>
            ) : (
              <>
                {/* Job info card */}
                {activeMatchJob && (
                  <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #2563eb', padding: '1.1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: '0.3rem' }}>{activeMatchJob.title}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{activeMatchJob.company} · {activeMatchJob.sector} · {activeMatchJob.experience} · {activeMatchJob.location}</div>
                        {activeMatchJob.skills?.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {activeMatchJob.skills.map(s => <span key={s} style={{ background: '#f3f4f6', color: '#374151', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'center', padding: '0.6rem 1rem', background: '#d1fae5', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#065f46' }}>{excellent.length}</div>
                          <div style={{ fontSize: '0.68rem', color: '#065f46', fontWeight: 700 }}>Excellent</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.6rem 1rem', background: '#dbeafe', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e40af' }}>{good.length}</div>
                          <div style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700 }}>Bon match</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.6rem 1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#6b7280' }}>{others.length}</div>
                          <div style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 700 }}>Autres</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: aiInsights ? '1rem' : '0' }}>
                    <button
                      onClick={generateAiInsights}
                      disabled={aiLoading || matchRanked.length === 0}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: aiLoading ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: aiLoading ? '#9ca3af' : 'white', fontSize: '0.85rem', fontWeight: 700, cursor: aiLoading || matchRanked.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: matchRanked.length === 0 ? 0.5 : 1 }}>
                      {aiLoading ? '⏳ Analyse en cours…' : '🤖 Générer analyse IA'}
                    </button>
                    {aiInsights && !aiLoading && (
                      <button onClick={() => setAiInsights(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer' }}>✕ Effacer</button>
                    )}
                  </div>
                  {aiInsights && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #dbeafe', overflow: 'hidden' }}>
                      <div style={{ padding: '0.85rem 1.1rem', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>🤖</span>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e40af' }}>Analyse IA — {activeMatchJob?.title}</span>
                      </div>
                      <div style={{ padding: '1rem 1.1rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>⭐ Meilleur candidat</div>
                          <div style={{ fontSize: '0.875rem', color: '#111827', lineHeight: 1.55 }}>{aiInsights.topPick}</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.85rem', marginBottom: '0.4rem' }}>📋 Synthèse du classement</div>
                          <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 }}>{aiInsights.rationale}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>⚠️ Lacunes identifiées</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                            {(aiInsights.gaps || []).map((g, i) => (
                              <div key={i} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', color: '#374151' }}>
                                <span style={{ color: '#dc2626', fontWeight: 700, flexShrink: 0 }}>•</span>{g}
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>💬 Questions d'entretien suggérées</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {(aiInsights.questions || []).map((q, i) => (
                              <div key={i} style={{ padding: '0.45rem 0.75rem', background: '#f5f3ff', borderRadius: '6px', fontSize: '0.78rem', color: '#4c1d95', borderLeft: '2px solid #7c3aed' }}>
                                {i + 1}. {q}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Two-column candidate grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
                  {/* Left: Excellent + Bon */}
                  <div>
                    {excellent.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                          Excellent match ≥70% ({excellent.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          {excellent.map(({ cv, match }) => {
                            const av = avatarColor(cv.name || cv.fileName);
                            return (
                              <div key={cv.id}
                                onClick={() => setSelectedCV(cv)}
                                style={{ padding: '0.9rem', background: 'white', borderRadius: '10px', border: '1.5px solid #bbf7d0', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}>{initials(cv.name || cv.fileName)}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>{cv.name || cv.fileName}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{cv.sector} · {cv.experience}</div>
                                  </div>
                                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800, background: '#d1fae5', color: '#065f46', flexShrink: 0 }}>{match.total}%</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <ScoreBar label="Compétences" pts={match.skillsPts} max={60} color="#2563eb" />
                                  <ScoreBar label="Secteur" pts={match.sectorPts} max={25} color="#0284c7" />
                                  <ScoreBar label="Expérience" pts={match.expPts} max={15} color="#16a34a" />
                                </div>
                                {match.matchedSkills.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {match.matchedSkills.map(s => <span key={s} style={{ padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>{s}</span>)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {good.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                          Bon match 50–69% ({good.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {good.map(({ cv, match }) => {
                            const av = avatarColor(cv.name || cv.fileName);
                            return (
                              <div key={cv.id}
                                onClick={() => setSelectedCV(cv)}
                                style={{ padding: '0.9rem', background: 'white', borderRadius: '10px', border: '1.5px solid #bfdbfe', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>{initials(cv.name || cv.fileName)}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{cv.name || cv.fileName}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{cv.sector} · {cv.experience}</div>
                                  </div>
                                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', flexShrink: 0 }}>{match.total}%</span>
                                </div>
                                <div>
                                  <ScoreBar label="Compétences" pts={match.skillsPts} max={60} color="#2563eb" />
                                  <ScoreBar label="Secteur" pts={match.sectorPts} max={25} color="#0284c7" />
                                  <ScoreBar label="Expérience" pts={match.expPts} max={15} color="#16a34a" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Others */}
                  <div>
                    {others.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
                          Autres &lt;50% ({others.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {others.map(({ cv, match }) => {
                            const av = avatarColor(cv.name || cv.fileName);
                            return (
                              <div key={cv.id}
                                onClick={() => setSelectedCV(cv)}
                                style={{ padding: '0.75rem 0.9rem', background: 'white', borderRadius: '9px', border: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>{initials(cv.name || cv.fileName)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.name || cv.fileName}</div>
                                  <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{cv.sector} · {cv.experience}</div>
                                </div>
                                <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', flexShrink: 0 }}>{match.total}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {others.length === 0 && excellent.length === 0 && good.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.85rem' }}>Aucun candidat disponible</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        </div>
      </main>
    </div>
  );
}
