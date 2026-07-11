'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  sector: string;
  experience: string;
  location: string;
  salary: string;
  skills: string[];
  description: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

const INITIAL_JOBS: Job[] = [
  { id: 'J001', title: 'Développeur React Senior', company: 'TechCorp', sector: 'Technology', experience: 'Senior', location: 'Casablanca', salary: '15 000 – 20 000 MAD', skills: ['React', 'TypeScript', 'Node.js'], description: 'Développement d\'applications frontend scalables.', status: 'Open', createdAt: '2026-07-01' },
  { id: 'J002', title: 'Ingénieur Machine Learning', company: 'DataVentures', sector: 'Data Science', experience: 'Mid-Level', location: 'Rabat', salary: '12 000 – 16 000 MAD', skills: ['Python', 'TensorFlow', 'SQL'], description: 'Développement et déploiement de modèles ML à grande échelle.', status: 'Open', createdAt: '2026-07-03' },
  { id: 'J003', title: 'Développeur Python Backend', company: 'DataSoft Solutions', sector: 'Technology', experience: 'Mid-Level', location: 'Casablanca', salary: '10 000 – 14 000 MAD', skills: ['Python', 'Django', 'SQL'], description: 'Conception d\'APIs REST et pipelines de données.', status: 'Open', createdAt: '2026-07-05' },
];

const SKILL_SUGGESTIONS = ['JavaScript', 'TypeScript', 'React', 'Python', 'SQL', 'Java', 'Docker', 'AWS', 'Machine Learning', 'Figma', 'Node.js', 'Django', 'GraphQL', 'Kubernetes', 'AutoCAD', 'Excel avancé', 'SAP', 'HACCP', 'Power BI'];
const SECTORS = ['Technology', 'Data Science', 'Finance', 'BTP', 'Tourisme', 'Agro-alimentaire', 'Healthcare', 'Marketing', 'Design', 'Operations', 'Other'];
const EXPERIENCE_LEVELS = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];
const CITIES = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Oujda', 'Kénitra', 'Meknès', 'Autre'];

const EXP_ORDER = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

function computeMatch(cv: any, job: Job): number {
  const cvSkills: string[] = Array.isArray(cv.skills) ? cv.skills : [];
  const jobSkills: string[] = Array.isArray(job.skills) ? job.skills : [];
  const overlap = cvSkills.filter(s =>
    jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase()))
  );
  const skillScore = jobSkills.length === 0 ? 30 : Math.round((overlap.length / jobSkills.length) * 60);
  const sectorScore = cv.sector === job.sector ? 25 : 0;
  const cvI = EXP_ORDER.indexOf(cv.experience);
  const jobI = EXP_ORDER.indexOf(job.experience);
  const diff = cvI >= 0 && jobI >= 0 ? Math.abs(cvI - jobI) : 2;
  const expScore = diff === 0 ? 15 : diff === 1 ? 9 : diff === 2 ? 4 : 0;
  return Math.min(skillScore + sectorScore + expScore, 100);
}

export default function CoordinatorJobs() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('Technology');
  const [experience, setExperience] = useState('Mid-Level');
  const [location, setLocation] = useState('Casablanca');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'Closed'>('all');
  const [search, setSearch] = useState('');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [coordCvs, setCoordCvs] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'coordinator') router.push('/login');
  }, [user, router]);

  // Load imported CVs from localStorage (uploaded by coordinator)
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem('coordinator_cvs');
      if (stored) setCoordCvs(JSON.parse(stored));
    } catch {}
  }, [user]);

  // Load from localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem('coordinator_jobs');
      setJobs(stored ? JSON.parse(stored) : INITIAL_JOBS);
    } catch {
      setJobs(INITIAL_JOBS);
    }
    setLoaded(true);
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    if (loaded) localStorage.setItem('coordinator_jobs', JSON.stringify(jobs));
  }, [jobs, loaded]);

  if (!user || user.role !== 'coordinator') return null;

  function resetForm() {
    setTitle(''); setCompany(''); setSector('Technology'); setExperience('Mid-Level');
    setLocation('Casablanca'); setSalary(''); setDescription(''); setSkills([]); setSkillInput('');
    setEditId(null);
  }

  function openNewForm() { resetForm(); setShowForm(true); }

  function openEdit(job: Job) {
    setTitle(job.title); setCompany(job.company); setSector(job.sector); setExperience(job.experience);
    setLocation(job.location); setSalary(job.salary); setDescription(job.description); setSkills(job.skills);
    setSkillInput(''); setEditId(job.id); setShowForm(true);
  }

  function addSkill(s: string) {
    const sk = s.trim();
    if (sk && !skills.includes(sk)) setSkills(p => [...p, sk]);
    setSkillInput('');
  }

  function handlePost() {
    if (!title.trim() || !company.trim()) return;
    if (editId) {
      setJobs(p => p.map(j => j.id === editId ? { ...j, title, company, sector, experience, location, salary, description, skills } : j));
    } else {
      const newJob: Job = {
        id: 'J' + Date.now().toString().slice(-6),
        title, company, sector, experience, location, salary, skills, description, status: 'Open',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setJobs(p => [newJob, ...p]);
    }
    resetForm(); setShowForm(false);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  function deleteJob(id: string) { setJobs(p => p.filter(j => j.id !== id)); }
  function toggleStatus(id: string) { setJobs(p => p.map(j => j.id === id ? { ...j, status: j.status === 'Open' ? 'Closed' : 'Open' } : j)); }

  const filtered = jobs.filter(j => {
    const ms = filterStatus === 'all' || j.status === filterStatus;
    const q = search.toLowerCase();
    const mq = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.sector.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    return ms && mq;
  });

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111827', background: 'white', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' };

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Coordinator Portal" />
        <div style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{user.name}</span>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '900px', padding: '2rem 1.5rem' }}>
        <Link href="/coordinator" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
          ← Retour au tableau de bord
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>💼 Offres d'emploi</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{jobs.filter(j => j.status === 'Open').length} poste{jobs.filter(j => j.status === 'Open').length !== 1 ? 's' : ''} ouvert{jobs.filter(j => j.status === 'Open').length !== 1 ? 's' : ''} sur {jobs.length} total</p>
          </div>
          <button className="btn-primary" onClick={showForm && !editId ? () => { setShowForm(false); resetForm(); } : openNewForm}>
            {showForm && !editId ? '✕ Annuler' : '+ Publier une offre'}
          </button>
        </div>

        {saved && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.875rem' }}>
            ✓ Offre {editId ? 'modifiée' : 'publiée'} avec succès
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid #dbeafe' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>
              {editId ? '✏️ Modifier l\'offre' : '🆕 Nouvelle offre d\'emploi'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Intitulé du poste *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex. Développeur React Senior" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Entreprise *</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Nom de l'entreprise" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Secteur</label>
                <select value={sector} onChange={e => setSector(e.target.value)} style={inputStyle}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Niveau d'expérience</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} style={inputStyle}>
                  {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ville</label>
                <select value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Salaire (MAD/mois)</label>
                <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="ex. 10 000 – 14 000 MAD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description du poste</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Missions, responsabilités, environnement de travail…" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Compétences requises</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} placeholder="Ajouter une compétence" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addSkill(skillInput)} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Ajouter</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '9999px', padding: '0.3rem 0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>
                    {s}<button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.9rem' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handlePost} disabled={!title.trim() || !company.trim()} style={{ opacity: !title.trim() || !company.trim() ? 0.5 : 1 }}>
                {editId ? '💾 Enregistrer les modifications' : '📢 Publier l\'offre'}
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ padding: '0.6rem 1.2rem', background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une offre…" style={{ padding: '0.5rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', width: '240px' }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} style={{ padding: '0.5rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit' }}>
            <option value="all">Tous les statuts</option>
            <option value="Open">🟢 Ouvertes</option>
            <option value="Closed">⚫ Fermées</option>
          </select>
        </div>

        {/* Job list */}
        <div className="card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>
            Toutes les offres ({filtered.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>💼</div>
                <p style={{ fontWeight: 600, color: '#6b7280' }}>Aucune offre ne correspond</p>
              </div>
            )}
            {filtered.map(j => (
              <div key={j.id} style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '12px', borderLeft: `4px solid ${j.status === 'Open' ? '#2563eb' : '#d1d5db'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.2rem' }}>{j.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{j.company} · {j.sector} · {j.experience}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      📍 {j.location}{j.salary ? ` · 💰 ${j.salary}` : ''}{j.createdAt ? ` · 📅 ${j.createdAt}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: j.status === 'Open' ? '#d1fae5' : '#f3f4f6', color: j.status === 'Open' ? '#065f46' : '#6b7280', fontWeight: 600 }}>
                      {j.status === 'Open' ? '🟢 Ouverte' : '⚫ Fermée'}
                    </span>
                    <button onClick={() => openEdit(j)} style={{ fontSize: '0.78rem', color: '#2563eb', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => toggleStatus(j.id)} style={{ fontSize: '0.78rem', color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer' }}>
                      {j.status === 'Open' ? 'Fermer' : 'Rouvrir'}
                    </button>
                    <button onClick={() => deleteJob(j.id)} style={{ fontSize: '0.78rem', color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer' }}>🗑</button>
                  </div>
                </div>
                {j.description && <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.55 }}>{j.description}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {j.skills.map(s => <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>)}
                </div>
                {/* Ranked candidates panel */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setExpandedJob(expandedJob === j.id ? null : j.id)}
                    style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px', padding: '0.35rem 0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    🎯 {expandedJob === j.id ? 'Masquer' : `Candidats classés (${coordCvs.length})`}
                  </button>
                  {expandedJob === j.id && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {coordCvs.length === 0 ? (
                        <div style={{ padding: '0.9rem', background: '#f9fafb', borderRadius: '8px', fontSize: '0.82rem', color: '#6b7280', textAlign: 'center' }}>
                          Aucun CV importé. <Link href="/coordinator/upload" style={{ color: '#2563eb', fontWeight: 600 }}>Importer des CVs →</Link>
                        </div>
                      ) : (() => {
                        const ranked = coordCvs
                          .map(cv => ({ ...cv, score: computeMatch(cv, j) }))
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 8);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {ranked.map(cv => {
                              const scoreColor = cv.score >= 70 ? '#15803d' : cv.score >= 45 ? '#92400e' : '#6b7280';
                              const scoreBg = cv.score >= 70 ? '#f0fdf4' : cv.score >= 45 ? '#fefce8' : '#f9fafb';
                              const scoreBorder = cv.score >= 70 ? '#bbf7d0' : cv.score >= 45 ? '#fde68a' : '#e5e7eb';
                              return (
                                <div key={cv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.55rem 0.8rem', borderRadius: '8px', background: scoreBg, border: `1px solid ${scoreBorder}` }}>
                                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: cv.score >= 70 ? '#22c55e' : cv.score >= 45 ? '#eab308' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                                    {cv.score}%
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.name || cv.fileName}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{cv.sector} · {cv.experience}{cv.phone ? ` · ${cv.phone}` : ''}</div>
                                  </div>
                                  {cv.email ? (
                                    <a href={`mailto:${cv.email}?subject=Offre: ${j.title} chez ${j.company}`} style={{ fontSize: '0.73rem', color: '#2563eb', fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none', padding: '0.25rem 0.6rem', borderRadius: '5px', border: '1px solid #bfdbfe', background: 'white' }}>
                                      ✉ Contacter
                                    </a>
                                  ) : null}
                                </div>
                              );
                            })}
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                              Score: compétences (60pts) + secteur (25pts) + niveau (15pts)
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
