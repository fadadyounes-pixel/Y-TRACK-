'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import PageHeader from '../../components/PageHeader';

const FALLBACK_JOBS = [
  {
    id: 1, title: 'Développeur React Senior', company: 'TechCorp', sector: 'Technology',
    experience: 'Senior', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    candidates: 0, topScore: 0, posted: '2026-07-01', status: 'active',
  },
  {
    id: 2, title: 'Ingénieur Machine Learning', company: 'AI Ventures', sector: 'Data Science',
    experience: 'Mid-Level', skills: ['Python', 'TensorFlow', 'SQL'],
    candidates: 0, topScore: 0, posted: '2026-07-03', status: 'active',
  },
  {
    id: 3, title: 'Développeur Python Backend', company: 'DataSoft Solutions', sector: 'Technology',
    experience: 'Mid-Level', skills: ['Python', 'Django', 'SQL'],
    candidates: 0, topScore: 0, posted: '2026-07-05', status: 'active',
  },
];

const sectors = ['All', 'Technology', 'Finance', 'Design', 'Healthcare', 'Education'];
const experiences = ['All', 'Junior (1-3 yrs)', 'Mid (3-5 yrs)', 'Senior (5+ yrs)'];

const sectorColors: Record<string, string> = {
  Technology: '#1d4ed8',
  Finance: '#16a34a',
  Design: '#9333ea',
  Healthcare: '#dc2626',
  Education: '#ea580c',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [sectorFilter, setSectorFilter] = useState('All');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('coordinator_jobs');
      if (!stored) return;
      const parsed: any[] = JSON.parse(stored);
      if (!parsed.length) return;
      setJobs(parsed.map(j => ({
        id: j.id ?? Date.now(),
        title: j.title ?? '',
        company: j.company ?? '',
        sector: j.sector ?? 'Other',
        experience: j.experience ?? 'Mid-Level',
        skills: Array.isArray(j.skills) ? j.skills : [],
        candidates: 0,
        topScore: 0,
        posted: j.createdAt ?? 'Récemment',
        status: j.status === 'Open' ? 'active' : 'closed',
      })));
    } catch {}
  }, []);
  const [expFilter, setExpFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', sector: 'Technology', experience: 'Mid (3-5 yrs)', skills: '' });

  const filtered = jobs.filter(j =>
    (sectorFilter === 'All' || j.sector === sectorFilter) &&
    (expFilter === 'All' || j.experience === expFilter)
  );

  function addJob() {
    if (!newJob.title || !newJob.company) return;
    setJobs(prev => [{
      id: Date.now(),
      ...newJob,
      skills: newJob.skills.split(',').map(s => s.trim()).filter(Boolean),
      candidates: 0,
      topScore: 0,
      posted: 'Just now',
      status: 'active',
    }, ...prev]);
    setNewJob({ title: '', company: '', sector: 'Technology', experience: 'Mid (3-5 yrs)', skills: '' });
    setShowForm(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="TalentMap" />
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Job Offers</h1>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{filtered.length} positions · AI matching active</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            + Post New Job
          </button>
        </div>

        {/* New Job Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderTop: '3px solid #1d4ed8' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>New Job Offer</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { key: 'title', label: 'Job Title', placeholder: 'e.g. Frontend Developer' },
                { key: 'company', label: 'Company', placeholder: 'e.g. TechCorp' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>{field.label}</label>
                  <input
                    value={(newJob as Record<string, string>)[field.key]}
                    onChange={e => setNewJob(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '0.6rem 0.875rem', borderRadius: '6px',
                      border: '1px solid #d1d5db', fontSize: '0.9rem',
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>Sector</label>
                <select
                  value={newJob.sector}
                  onChange={e => setNewJob(p => ({ ...p, sector: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                >
                  {sectors.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>Experience</label>
                <select
                  value={newJob.experience}
                  onChange={e => setNewJob(p => ({ ...p, experience: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                >
                  {experiences.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>Required Skills (comma-separated)</label>
              <input
                value={newJob.skills}
                onChange={e => setNewJob(p => ({ ...p, skills: e.target.value }))}
                placeholder="React, TypeScript, Node.js"
                style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={addJob}>Post Job</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {sectors.map(s => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                style={{
                  padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
                  background: sectorFilter === s ? '#1d4ed8' : 'white',
                  color: sectorFilter === s ? 'white' : '#374151',
                  border: sectorFilter === s ? '1px solid #1d4ed8' : '1px solid #d1d5db',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >{s}</button>
            ))}
          </div>
          <select
            value={expFilter}
            onChange={e => setExpFilter(e.target.value)}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem', color: '#374151', background: 'white' }}
          >
            {experiences.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        {/* Job Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(job => (
            <div key={job.id} className="card" style={{
              borderLeft: `4px solid ${sectorColors[job.sector] || '#6b7280'}`,
              opacity: job.status === 'closed' ? 0.65 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
                  background: job.status === 'active' ? '#d1fae5' : '#f3f4f6',
                  color: job.status === 'active' ? '#065f46' : '#6b7280',
                }}>
                  {job.status === 'active' ? '● Active' : '◯ Closed'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{job.posted}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{job.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                {job.company} · <span style={{ color: sectorColors[job.sector] || '#6b7280', fontWeight: 600 }}>{job.sector}</span>
              </p>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {job.skills.map(sk => (
                  <span key={sk} style={{
                    background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px',
                    padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                  }}>{sk}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{job.candidates}</span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '0.25rem' }}>candidates</span>
                  </div>
                  {job.topScore > 0 && (
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>{job.topScore}%</span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '0.25rem' }}>top match</span>
                    </div>
                  )}
                </div>
                <Link href="/matches" style={{
                  fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                  View Matches →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
