'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

interface Job { id: string; title: string; company: string; sector: string; experience: string; skills: string[]; description: string; status: 'Open' | 'Closed'; }

const INITIAL_JOBS: Job[] = [
  { id: 'J001', title: 'Senior React Developer', company: 'TechCorp', sector: 'Technology', experience: 'Senior', skills: ['React', 'TypeScript', 'Node.js'], description: 'Build scalable frontend applications.', status: 'Open' },
  { id: 'J002', title: 'Machine Learning Engineer', company: 'AI Ventures', sector: 'Data Science', experience: 'Mid-Level', skills: ['Python', 'TensorFlow', 'ML'], description: 'Develop and deploy ML models at scale.', status: 'Open' },
  { id: 'J003', title: 'Backend Python Developer', company: 'DataSoft Solutions', sector: 'Technology', experience: 'Mid-Level', skills: ['Python', 'Django', 'SQL'], description: 'Design REST APIs and data pipelines.', status: 'Open' },
];

const SKILL_SUGGESTIONS = ['JavaScript', 'TypeScript', 'React', 'Python', 'SQL', 'Java', 'Docker', 'AWS', 'Machine Learning', 'Figma', 'Node.js', 'Django', 'GraphQL', 'Kubernetes'];

export default function CoordinatorJobs() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('Technology');
  const [experience, setExperience] = useState('Mid-Level');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'coordinator') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'coordinator') return null;

  function addSkill(s: string) {
    const sk = s.trim();
    if (sk && !skills.includes(sk)) setSkills(p => [...p, sk]);
    setSkillInput('');
  }

  function handlePost() {
    if (!title || !company) return;
    const newJob: Job = { id: 'J' + (jobs.length + 1).toString().padStart(3, '0'), title, company, sector, experience, skills, description, status: 'Open' };
    setJobs(p => [newJob, ...p]);
    setTitle(''); setCompany(''); setDescription(''); setSkills([]); setSector('Technology'); setExperience('Mid-Level');
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111827', background: 'white', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' };

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Coordinator Portal" />
      </div>

      <div className="container" style={{ maxWidth: '860px', padding: '2rem 1.5rem' }}>
        <Link href="/coordinator" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
          ← Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>Job Offers</h1>
            <p style={{ color: '#6b7280' }}>{jobs.filter(j => j.status === 'Open').length} open positions</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(p => !p)}>{showForm ? '✕ Cancel' : '+ Post Job Offer'}</button>
        </div>

        {saved && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.875rem' }}>✓ Job offer posted successfully</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid #dbeafe' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>New Job Offer</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={labelStyle}>Job Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior React Developer" style={inputStyle} /></div>
              <div><label style={labelStyle}>Company *</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Sector</label>
                <select value={sector} onChange={e => setSector(e.target.value)} style={inputStyle}>
                  {['Technology', 'Data Science', 'Finance', 'Healthcare', 'Marketing', 'Design', 'Operations', 'Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Experience Level</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} style={inputStyle}>
                  {['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Job description and responsibilities..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Required Skills</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} placeholder="Add required skill" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addSkill(skillInput)} className="btn-primary">Add</button>
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
            <button className="btn-primary" onClick={handlePost} disabled={!title || !company} style={{ opacity: !title || !company ? 0.5 : 1 }}>Post Job Offer</button>
          </div>
        )}

        <div className="card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>All Job Offers ({jobs.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map(j => (
              <div key={j.id} style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '10px', borderLeft: `4px solid ${j.status === 'Open' ? '#2563eb' : '#d1d5db'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{j.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.2rem' }}>{j.company} · {j.sector} · {j.experience}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: j.status === 'Open' ? '#d1fae5' : '#f3f4f6', color: j.status === 'Open' ? '#065f46' : '#6b7280', fontWeight: 600 }}>{j.status}</span>
                    <button onClick={() => setJobs(p => p.map(x => x.id === j.id ? { ...x, status: x.status === 'Open' ? 'Closed' : 'Open' } : x))}
                      style={{ fontSize: '0.78rem', color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer' }}>
                      {j.status === 'Open' ? 'Close' : 'Reopen'}
                    </button>
                  </div>
                </div>
                {j.description && <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>{j.description}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {j.skills.map(s => <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
