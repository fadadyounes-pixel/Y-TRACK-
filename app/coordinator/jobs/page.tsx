'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import Icon from '../../../components/Icon';
import { useAuth } from '../../../contexts/AuthContext';
import { computeMatch, EDU_LEVELS, LANGUAGES as MATCH_LANGUAGES } from '@/lib/matching';

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
  educationLevel?: string;
  languages?: string[];
  postedBy?: { id: string; name: string; code: string };
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

export default function CoordinatorJobs() {
  const { user, initialized } = useAuth();
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
  const [educationLevel, setEducationLevel] = useState('');
  const [jobLanguages, setJobLanguages] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'Closed'>('all');
  const [search, setSearch] = useState('');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [coordCvs, setCoordCvs] = useState<any[]>([]);
  const [descLoading, setDescLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState<Record<string, { id: string; score: number; profilage: string }[]>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<Record<string, string>>({});

  useEffect(() => {
    // Gate on `initialized` — without it, this fires during the brief window
    // before AuthContext finishes reading the user from localStorage, bouncing
    // an already-logged-in coordinator straight back to /login on every hard
    // page load or refresh.
    if (initialized && (!user || user.role !== 'coordinator')) router.push('/login');
  }, [user, initialized, router]);

  // Load jobs + CVs from Redis on mount
  useEffect(() => {
    if (!user) return;
    fetch('/api/sheets')
      .then(r => r.json())
      .then(data => {
        setJobs(data.jobs?.length ? data.jobs : INITIAL_JOBS);
        setCoordCvs(data.cvs || []);
        setLoaded(true);
      })
      .catch(() => {
        // Fallback to localStorage cache
        try {
          const stored = localStorage.getItem('coordinator_jobs');
          setJobs(stored ? JSON.parse(stored) : INITIAL_JOBS);
        } catch { setJobs(INITIAL_JOBS); }
        try {
          const stored = localStorage.getItem('coordinator_cvs');
          if (stored) setCoordCvs(JSON.parse(stored));
        } catch {}
        setLoaded(true);
      });
  }, [user]);

  // Persist jobs to Redis (debounced via useEffect dependency)
  useEffect(() => {
    if (!loaded) return;
    // Update localStorage cache immediately
    try { localStorage.setItem('coordinator_jobs', JSON.stringify(jobs)); } catch {}
    // Persist to Redis
    fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'save_jobs', jobs }),
    }).catch(() => {});
  }, [jobs, loaded]);

  if (!initialized || !user || user.role !== 'coordinator') return null;

  function resetForm() {
    setTitle(''); setCompany(''); setSector('Technology'); setExperience('Mid-Level');
    setLocation('Casablanca'); setSalary(''); setDescription(''); setSkills([]); setSkillInput('');
    setEducationLevel(''); setJobLanguages([]);
    setEditId(null);
  }

  function openNewForm() { resetForm(); setShowForm(true); }

  function openEdit(job: Job) {
    setTitle(job.title); setCompany(job.company); setSector(job.sector); setExperience(job.experience);
    setLocation(job.location); setSalary(job.salary); setDescription(job.description); setSkills(job.skills);
    setSkillInput(''); setEducationLevel(job.educationLevel || ''); setJobLanguages(job.languages || []);
    setEditId(job.id); setShowForm(true);
  }

  function addSkill(s: string) {
    const sk = s.trim();
    if (sk && !skills.includes(sk)) setSkills(p => [...p, sk]);
    setSkillInput('');
  }

  function handlePost() {
    if (!title.trim() || !company.trim()) return;
    if (editId) {
      setJobs(p => p.map(j => j.id === editId ? { ...j, title, company, sector, experience, location, salary, description, skills, educationLevel, languages: jobLanguages } : j));
    } else {
      const newJob: Job = {
        id: 'J' + Date.now().toString().slice(-6),
        title, company, sector, experience, location, salary, skills, description, status: 'Open',
        createdAt: new Date().toISOString().slice(0, 10),
        educationLevel, languages: jobLanguages,
        postedBy: { id: user!.id, name: user!.name || user!.idNumber, code: user!.idNumber },
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

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#0f172a', background: 'white', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' };

  async function generateDescription() {
    if (!title && !sector) return;
    setDescLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Poste: ${title || 'Non précisé'}\nSecteur: ${sector}\nNiveau: ${experience}\nVille: ${location}${skills.length ? '\nCompétences: ' + skills.join(', ') : ''}` }],
          system: 'Tu es un expert en recrutement au Maroc. Rédige une description de poste professionnelle et concise (3-4 phrases) en français, adaptée aux attentes des employeurs et candidats marocains, directement utilisable dans une offre d\'emploi. Pas de titre, pas de bullet points, juste le texte de description. Maximum 120 mots.',
          task: 'dialogue',
          max_tokens: 250,
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim();
      if (text) setDescription(text);
    } catch {}
    setDescLoading(false);
  }

  // ── AI advanced search: deep candidate profiling for a job offer ──────
  // The deterministic computeMatch() score (skills/experience/education/
  // language overlap) already ranks the whole CV pool instantly and for
  // free — kept as the always-available default. This goes further: it
  // prefilters to the strongest ~30 candidates with that same deterministic
  // score (so the prompt stays bounded even with 100+ imported CVs), then
  // asks the AI to actually reason about fit — transferable skills,
  // seniority, sector relevance, anything useful in the free-text summary —
  // and write a one-line "profilage" explaining why each pick fits (or
  // doesn't fully). Results are cached per job in state; re-running is a
  // deliberate action, not an automatic re-fetch on every render.
  async function runAiProfiling(job: Job) {
    if (aiLoading[job.id]) return;
    setAiLoading(p => ({ ...p, [job.id]: true }));
    setAiError(p => ({ ...p, [job.id]: '' }));
    try {
      const shortlist = coordCvs
        .map(cv => ({ cv, score: computeMatch(cv, job).total }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 30)
        .map(({ cv }) => cv);
      if (shortlist.length === 0) {
        setAiError(p => ({ ...p, [job.id]: 'Aucun CV importé à analyser.' }));
        setAiLoading(p => ({ ...p, [job.id]: false }));
        return;
      }
      const candidateLines = shortlist.map((cv, i) =>
        `${i + 1}. id=${cv.id} | ${cv.name || cv.fileName || 'Candidat'} | Secteur: ${cv.sector || '?'} | Niveau: ${cv.experience || '?'} | Formation: ${cv.education || cv.educationLevel || '?'} | Langues: ${(cv.languages || []).join(', ') || '?'} | Compétences: ${(cv.skills || []).slice(0, 8).join(', ')} | Résumé: ${(cv.summary || '').slice(0, 160)}`
      ).join('\n');
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `OFFRE:\nPoste: ${job.title}\nEntreprise: ${job.company}\nSecteur: ${job.sector}\nNiveau requis: ${job.experience}\nCompétences requises: ${job.skills.join(', ') || 'non précisé'}\nFormation requise: ${job.educationLevel || 'non précisé'}\nLangues requises: ${(job.languages || []).join(', ') || 'non précisé'}\nDescription: ${job.description || 'non précisé'}\n\nCANDIDATS PRÉSÉLECTIONNÉS:\n${candidateLines}`,
          }],
          system: `Tu es un recruteur senior expert du marché de l'emploi marocain, spécialisé en profilage approfondi de candidats. On te donne une offre d'emploi et une liste de candidats déjà présélectionnés par mots-clés. Va au-delà du simple mot-clé : évalue la pertinence réelle de l'expérience, les compétences transférables, le niveau de séniorité, l'adéquation sectorielle, et toute information utile du résumé.
Classe les meilleurs candidats du plus pertinent au moins pertinent (maximum 8 — n'inclus pas un candidat clairement inadapté juste pour atteindre ce nombre). Pour chacun, donne un score de pertinence 0-100 et une phrase de "profilage" en français expliquant précisément pourquoi ce candidat correspond bien, ou ses limites.
Retourne UNIQUEMENT ce JSON valide sans markdown: {"matches":[{"id":"id exact du candidat tel que fourni","score":N,"profilage":"phrase d'explication concrète"}]}`,
          task: 'json',
          max_tokens: 1200,
        }),
      });
      const data = await r.json();
      const text = data.content?.[0]?.text || '';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const matches = Array.isArray(parsed?.matches)
        ? parsed.matches
            .filter((x: any) => x && typeof x.id === 'string' && shortlist.some(cv => cv.id === x.id))
            .map((x: any) => ({ id: x.id, score: Math.max(0, Math.min(100, Math.round(Number(x.score) || 0))), profilage: String(x.profilage || '').slice(0, 300) }))
            .slice(0, 8)
        : [];
      if (matches.length > 0) setAiMatches(p => ({ ...p, [job.id]: matches }));
      else setAiError(p => ({ ...p, [job.id]: "Le profilage IA n'a pas abouti — réessayez dans quelques secondes." }));
    } catch {
      setAiError(p => ({ ...p, [job.id]: "Le profilage IA n'a pas abouti — réessayez dans quelques secondes." }));
    }
    setAiLoading(p => ({ ...p, [job.id]: false }));
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader label="Job Offers" icon="briefcase" />

      <div className="container" style={{ maxWidth: '900px', padding: '2rem 1.5rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link href="/coordinator" style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>← Tableau de bord</Link>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0a1f5c', margin: '0.3rem 0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="briefcase" size={24}/>Offres d'emploi</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{jobs.filter(j => j.status === 'Open').length} poste{jobs.filter(j => j.status === 'Open').length !== 1 ? 's' : ''} ouvert{jobs.filter(j => j.status === 'Open').length !== 1 ? 's' : ''} sur {jobs.length} total</p>
          </div>
          <button className="btn-primary" onClick={showForm && !editId ? () => { setShowForm(false); resetForm(); } : openNewForm} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            {showForm && !editId ? <><Icon name="x" size={14}/>Annuler</> : <><Icon name="plus" size={14}/>Publier une offre</>}
          </button>
        </div>

        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.875rem' }}>
            <Icon name="check" size={15}/>Offre {editId ? 'modifiée' : 'publiée'} avec succès
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid #dbeafe' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a1f5c', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {editId ? <><Icon name="pencil" size={16}/>Modifier l'offre</> : <><Icon name="plus" size={16}/>Nouvelle offre d'emploi</>}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Description du poste</label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={descLoading || (!title && !sector)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none', background: descLoading ? '#e5e7eb' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: descLoading ? '#9ca3af' : 'white', fontSize: '0.75rem', fontWeight: 700, cursor: descLoading || (!title && !sector) ? 'not-allowed' : 'pointer', opacity: (!title && !sector) ? 0.5 : 1 }}>
                  {descLoading ? <><Icon name="refresh" size={13}/>Génération…</> : <><Icon name="robot" size={13}/>Générer avec l'Expert RH</>}
                </button>
              </div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Missions, responsabilités, environnement de travail… ou cliquez « Générer avec l'Expert RH »" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Compétences requises</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} placeholder="Ajouter une compétence" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addSkill(skillInput)} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Ajouter</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#EFF6FF', color: '#2563eb', borderRadius: '9999px', padding: '0.3rem 0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>
                    {s}<button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.9rem' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Niveau d'études requis (optionnel)</label>
                <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} style={inputStyle}>
                  <option value="">Aucun requis</option>
                  {EDU_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Langues requises (optionnel)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {MATCH_LANGUAGES.map(l => (
                    <button key={l} type="button"
                      onClick={() => setJobLanguages(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l])}
                      style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${jobLanguages.includes(l) ? '#2563eb' : '#e5e7eb'}`, background: jobLanguages.includes(l) ? '#EFF6FF' : 'white', color: jobLanguages.includes(l) ? '#2563eb' : '#6b7280' }}>
                      {jobLanguages.includes(l) ? '✓ ' : ''}{l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handlePost} disabled={!title.trim() || !company.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: !title.trim() || !company.trim() ? 0.5 : 1 }}>
                {editId ? <><Icon name="save" size={14}/>Enregistrer les modifications</> : <><Icon name="megaphone" size={14}/>Publier l'offre</>}
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
            <option value="Open">Ouvertes</option>
            <option value="Closed">Fermées</option>
          </select>
        </div>

        {/* Job list */}
        <div className="card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a1f5c', marginBottom: '1.25rem' }}>
            Toutes les offres ({filtered.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}><Icon name="briefcase" size={32} color="#9ca3af"/></div>
                <p style={{ fontWeight: 600, color: '#6b7280' }}>Aucune offre ne correspond</p>
              </div>
            )}
            {filtered.map(j => (
              <div key={j.id} style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '12px', borderLeft: `4px solid ${j.status === 'Open' ? '#2563eb' : '#d1d5db'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0a1f5c', marginBottom: '0.2rem' }}>{j.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{j.company} · {j.sector} · {j.experience}</div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem', fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Icon name="map-pin" size={12}/>{j.location}</span>
                      {j.salary && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>· <Icon name="wallet" size={12}/>{j.salary}</span>}
                      {j.createdAt && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>· <Icon name="calendar" size={12}/>{j.createdAt}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.76rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      <Icon name="user" size={11}/>Publiée par {j.postedBy?.name || j.postedBy?.code || 'coordinateur inconnu (offre créée avant ce suivi)'}
                    </div>
                    {(j.educationLevel || (j.languages && j.languages.length > 0)) && (
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                        {j.educationLevel && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Icon name="graduation-cap" size={12}/>{j.educationLevel}</span>}
                        {j.educationLevel && j.languages?.length ? ' · ' : ''}
                        {j.languages?.length ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Icon name="globe" size={12}/>{j.languages.join(', ')}</span> : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: j.status === 'Open' ? '#d1fae5' : '#f3f4f6', color: j.status === 'Open' ? '#065f46' : '#6b7280', fontWeight: 600 }}>
                      {j.status === 'Open' ? 'Ouverte' : 'Fermée'}
                    </span>
                    <button onClick={() => openEdit(j)} style={{ fontSize: '0.78rem', color: '#2563eb', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Icon name="pencil" size={13}/></button>
                    <button onClick={() => toggleStatus(j.id)} style={{ fontSize: '0.78rem', color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer' }}>
                      {j.status === 'Open' ? 'Fermer' : 'Rouvrir'}
                    </button>
                    <button onClick={() => deleteJob(j.id)} style={{ fontSize: '0.78rem', color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Icon name="trash" size={13}/></button>
                  </div>
                </div>
                {j.description && <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.55 }}>{j.description}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {j.skills.map(s => <span key={s} style={{ background: '#EFF6FF', color: '#2563eb', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>)}
                </div>
                {/* Ranked candidates panel */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setExpandedJob(expandedJob === j.id ? null : j.id)}
                    style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, background: '#EFF6FF', border: '1px solid #bfdbfe', borderRadius: '7px', padding: '0.35rem 0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="target" size={13}/>{expandedJob === j.id ? 'Masquer' : `Candidats classés (${coordCvs.length})`}
                  </button>
                  {expandedJob === j.id && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {coordCvs.length === 0 ? (
                        <div style={{ padding: '0.9rem', background: '#f9fafb', borderRadius: '8px', fontSize: '0.82rem', color: '#6b7280', textAlign: 'center' }}>
                          Aucun CV importé. <Link href="/coordinator/upload" style={{ color: '#2563eb', fontWeight: 600 }}>Importer des CVs →</Link>
                        </div>
                      ) : (<>
                        {/* AI advanced-search profilage */}
                        <div style={{ marginBottom: '0.9rem' }}>
                          <button
                            onClick={() => runAiProfiling(j)}
                            disabled={aiLoading[j.id]}
                            style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700, background: aiLoading[j.id] ? '#9ca3af' : 'linear-gradient(135deg,#7C3AED,#5B21B6)' as any, border: 'none', borderRadius: '7px', padding: '0.4rem 0.9rem', cursor: aiLoading[j.id] ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            {aiLoading[j.id] ? <><Icon name="refresh" size={13}/>Profilage IA en cours…</> : <><Icon name="robot" size={13}/>{aiMatches[j.id] ? 'Relancer le profilage IA' : 'Lancer le profilage IA avancé'}</>}
                          </button>
                          {aiError[j.id] && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#991b1b' }}>{aiError[j.id]}</div>
                          )}
                          {aiMatches[j.id] && aiMatches[j.id].length > 0 && (
                            <div style={{ marginTop: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {aiMatches[j.id].map(match => {
                                const cv = coordCvs.find(c => c.id === match.id);
                                if (!cv) return null;
                                const sc = match.score;
                                const scoreColor = sc >= 70 ? '#5B21B6' : sc >= 45 ? '#92400e' : '#6b7280';
                                const scoreBg = sc >= 70 ? '#F5F3FF' : sc >= 45 ? '#fefce8' : '#f9fafb';
                                const scoreBorder = sc >= 70 ? '#DDD6FE' : sc >= 45 ? '#fde68a' : '#e5e7eb';
                                return (
                                  <div key={match.id} style={{ padding: '0.65rem 0.85rem', borderRadius: '9px', background: scoreBg, border: `1px solid ${scoreBorder}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: sc >= 70 ? '#7C3AED' : sc >= 45 ? '#eab308' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                                        {sc}%
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0a1f5c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.name || cv.fileName}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{cv.sector} · {cv.experience}{cv.phone ? ` · ${cv.phone}` : ''}</div>
                                      </div>
                                      {cv.email ? (
                                        <a href={`mailto:${cv.email}?subject=Offre: ${j.title} chez ${j.company}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.73rem', color: scoreColor, fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none', padding: '0.25rem 0.6rem', borderRadius: '5px', border: `1px solid ${scoreBorder}`, background: 'white', flexShrink: 0 }}>
                                          <Icon name="mail" size={12}/>Contacter
                                        </a>
                                      ) : null}
                                    </div>
                                    {match.profilage && (
                                      <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: '#374151', lineHeight: 1.55, fontStyle: 'italic', paddingLeft: '0.1rem' }}>
                                        <Icon name="sparkles" size={11} color="#7C3AED"/> {match.profilage}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                                Profilage IA — présélection sur {Math.min(coordCvs.length, 30)} candidats, analyse approfondie au-delà des mots-clés
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '0.4rem' }}>
                          Classement rapide (mots-clés)
                        </div>
                        {(() => {
                        const ranked = coordCvs
                          .map(cv => ({ ...cv, score: computeMatch(cv, j).total }))
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
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0a1f5c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.name || cv.fileName}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{cv.sector} · {cv.experience}{cv.phone ? ` · ${cv.phone}` : ''}</div>
                                  </div>
                                  {cv.email ? (
                                    <a href={`mailto:${cv.email}?subject=Offre: ${j.title} chez ${j.company}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.73rem', color: '#2563eb', fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none', padding: '0.25rem 0.6rem', borderRadius: '5px', border: '1px solid #bfdbfe', background: 'white' }}>
                                      <Icon name="mail" size={12}/>Contacter
                                    </a>
                                  ) : null}
                                </div>
                              );
                            })}
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                              Score: compétences (40pts) + expérience (30pts) + formation (20pts) + langues (10pts)
                            </div>
                          </div>
                        );
                      })()}
                      </>)}
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
