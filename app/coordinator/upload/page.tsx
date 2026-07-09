'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

interface UploadedCV { name: string; size: string; status: 'processing' | 'done' | 'error'; candidateName?: string; score?: number; skills?: string[]; }

const SKILL_SUGGESTIONS = ['JavaScript', 'TypeScript', 'React', 'Python', 'SQL', 'Java', 'Docker', 'AWS', 'Machine Learning', 'Figma', 'Node.js', 'Django'];

export default function CoordinatorUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'template'>('upload');
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedCV[]>([]);

  // Template state
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tIdNumber, setTIdNumber] = useState('');
  const [tSummary, setTSummary] = useState('');
  const [tExperience, setTExperience] = useState('Mid-Level');
  const [tSector, setTSector] = useState('Technology');
  const [tSkills, setTSkills] = useState<string[]>([]);
  const [tSkillInput, setTSkillInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'coordinator') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'coordinator') return null;

  const mockNames = ['Alexandre Martin', 'Sofia Reyes', 'Omar Khalil', 'Nadia Petrov', 'Lucas Silva'];
  const mockSkillSets = [['React', 'TypeScript', 'Node.js'], ['Python', 'ML', 'SQL'], ['Java', 'Spring Boot', 'AWS'], ['Figma', 'UX Research', 'CSS'], ['Docker', 'K8s', 'CI/CD']];

  function formatBytes(b: number) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function handleFiles(fileList: FileList) {
    const arr = Array.from(fileList);
    const newFiles: UploadedCV[] = arr.map(f => ({ name: f.name, size: formatBytes(f.size), status: 'processing' }));
    setFiles(prev => {
      const startIdx = prev.length;
      setTimeout(() => {
        newFiles.forEach((_, i) => {
          setTimeout(() => {
            setFiles(p => p.map((f, fi) => fi === startIdx + i ? {
              ...f, status: 'done',
              candidateName: mockNames[(startIdx + i) % mockNames.length],
              score: Math.floor(Math.random() * 55) + 40,
              skills: mockSkillSets[(startIdx + i) % mockSkillSets.length],
            } : f));
          }, 1400 + i * 500);
        });
      }, 0);
      return [...prev, ...newFiles];
    });
  }

  function addSkill(s: string) {
    const sk = s.trim();
    if (sk && !tSkills.includes(sk)) setTSkills(p => [...p, sk]);
    setTSkillInput('');
  }

  function handleSaveCandidate() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111827', background: 'white', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' };

  const done = files.filter(f => f.status === 'done').length;

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Coordinator Portal" />
      </div>

      <div className="container" style={{ maxWidth: '860px', padding: '2rem 1.5rem' }}>
        <Link href="/coordinator" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Upload Candidate CVs</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Upload files in any format or manually enter candidate details using the template.</p>

        {/* Mode tabs */}
        <div style={{ display: 'flex', marginBottom: '1.75rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
          {(['upload', 'template'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: mode === m ? '#2563eb' : 'white', color: mode === m ? 'white' : '#6b7280', transition: 'all 0.15s',
            }}>{m === 'upload' ? '📁 Upload Files' : '✏️ Enter Manually'}</button>
          ))}
        </div>

        {mode === 'upload' && (
          <div>
            <div
              className="card"
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? '#2563eb' : '#d1d5db'}`, background: dragging ? '#eff6ff' : 'white', borderRadius: '14px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem' }}
            >
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📂</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>Drop CVs here or click to browse</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Bulk upload — PDF, Word, JPG, PNG supported</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {['PDF', 'DOCX', 'DOC', 'JPG', 'PNG'].map(ext => <span key={ext} style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', color: '#374151' }}>{ext}</span>)}
              </div>
              <button className="btn-primary" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>Choose Files</button>
            </div>

            {files.length > 0 && (
              <>
                <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div><span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>{files.length}</span><div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Uploaded</div></div>
                  <div><span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{done}</span><div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Processed</div></div>
                  <div><span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{files.length - done}</span><div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Processing</div></div>
                </div>
                <div className="card">
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Processed CVs</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', background: '#f9fafb', borderRadius: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.4rem' }}>{f.name.endsWith('.pdf') ? '📄' : f.name.match(/\.(jpg|jpeg|png)$/i) ? '🖼️' : '📝'}</span>
                        <div style={{ flex: 1, minWidth: '140px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{f.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{f.size}</div>
                        </div>
                        {f.status === 'processing' && <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⟳ AI Processing…</span>}
                        {f.status === 'done' && (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {f.candidateName && <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{f.candidateName}</span>}
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {f.skills?.map(sk => <span key={sk} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 600 }}>{sk}</span>)}
                            </div>
                            {f.score && <span style={{ background: f.score >= 70 ? '#d1fae5' : '#dbeafe', color: f.score >= 70 ? '#065f46' : '#1e40af', borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}>{f.score}%</span>}
                            <span style={{ color: '#10b981', fontSize: '0.85rem' }}>✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {mode === 'template' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Candidate Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Full Name', val: tName, set: setTName, placeholder: 'Candidate full name' },
                  { label: 'Email', val: tEmail, set: setTEmail, placeholder: 'candidate@email.com' },
                  { label: 'Phone', val: tPhone, set: setTPhone, placeholder: '+212 6 XX XX XX XX' },
                  { label: 'ID Number', val: tIdNumber, set: setTIdNumber, placeholder: 'e.g. CAN007' },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label}>
                    <label style={labelStyle}>{label}</label>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Professional Details</h2>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Summary</label>
                <textarea value={tSummary} onChange={e => setTSummary(e.target.value)} rows={3} placeholder="Candidate's professional background..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Experience Level</label>
                  <select value={tExperience} onChange={e => setTExperience(e.target.value)} style={inputStyle}>
                    {['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Sector</label>
                  <select value={tSector} onChange={e => setTSector(e.target.value)} style={inputStyle}>
                    {['Technology', 'Data Science', 'Finance', 'Healthcare', 'Marketing', 'Design', 'Operations', 'Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Skills</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input value={tSkillInput} onChange={e => setTSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(tSkillInput); } }}
                  placeholder="Type a skill and press Enter" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addSkill(tSkillInput)} className="btn-primary">Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {tSkills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '9999px', padding: '0.3rem 0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>
                    {s}<button onClick={() => setTSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {SKILL_SUGGESTIONS.filter(s => !tSkills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleSaveCandidate}>Save Candidate Profile</button>
              {saved && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>✓ Candidate profile saved successfully</span>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
