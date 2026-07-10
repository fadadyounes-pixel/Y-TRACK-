'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  Technology:    ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Docker', 'AWS', 'Git', 'REST APIs'],
  'Data Science':['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Tableau', 'Statistics', 'NLP', 'Deep Learning'],
  Finance:       ['Excel', 'Financial Modeling', 'Bloomberg', 'SAP', 'IFRS', 'Risk Management', 'SQL', 'Python', 'PowerBI'],
  Healthcare:    ['Patient Care', 'EMR Systems', 'Medical Coding', 'Clinical Research', 'HIPAA', 'Pharmacology'],
  Marketing:     ['SEO/SEM', 'Google Analytics', 'Social Media', 'Content Strategy', 'Adobe Creative Suite', 'CRM', 'Copywriting'],
  Design:        ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Prototyping', 'Typography', 'Motion Graphics'],
  Operations:    ['Project Management', 'Lean/Six Sigma', 'Supply Chain', 'ERP', 'Process Optimization', 'Excel', 'PowerBI'],
  Other:         ['Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Microsoft Office', 'Time Management'],
};

const LANGUAGES = ['Arabic', 'French', 'English', 'Spanish', 'German', 'Dutch', 'Italian', 'Portuguese', 'Darija'];

interface WorkEntry { company: string; title: string; startDate: string; endDate: string; description: string; }
interface AnalyzedFile { name: string; skills: string[]; experience: string; summary: string; sector: string; }

function generateCVHtml(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
}) {
  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#f1f5f9;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:820px;margin:2rem auto;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.12);overflow:hidden}
.hdr{background:linear-gradient(135deg,#0a1f5c 0%,#1e40af 60%,#2563eb 100%);padding:2.75rem 2.5rem 2.25rem;color:#fff;position:relative;overflow:hidden}
.hdr::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.07)}
.hdr::after{content:'';position:absolute;bottom:-30px;left:40%;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.05)}
.hdr-name{font-size:2.1rem;font-weight:800;letter-spacing:-.03em;position:relative}
.hdr-sub{margin-top:.5rem;opacity:.7;font-size:1rem;position:relative}
.hdr-contacts{display:flex;flex-wrap:wrap;gap:.75rem 1.5rem;margin-top:1.25rem;position:relative}
.hdr-contacts span{font-size:.875rem;opacity:.85}
.body{display:grid;grid-template-columns:1fr 280px;gap:0}
.main{padding:2.25rem 2rem 2.25rem 2.5rem;border-right:1px solid #f1f5f9}
.side{padding:2.25rem 2rem;background:#f8fafc}
.sec-title{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#2563eb;margin-bottom:.9rem;display:flex;align-items:center;gap:.5rem}
.sec-title::after{content:'';flex:1;height:2px;background:#dbeafe;border-radius:1px}
.sec{margin-bottom:2rem}
.item label{font-size:.7rem;color:#94a3b8;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
.item p{font-size:.9rem;color:#1e293b;margin-top:.2rem;font-weight:500}
.pills{display:flex;flex-wrap:wrap;gap:.4rem}
.pill{background:#eff6ff;color:#1d4ed8;border-radius:9999px;padding:.28rem .85rem;font-size:.78rem;font-weight:600;border:1px solid #bfdbfe}
.pill.lang{background:#f0fdf4;color:#065f46;border-color:#bbf7d0}
.badge{display:inline-flex;align-items:center;background:#f8fafc;color:#475569;border-radius:9999px;padding:.35rem 1rem;font-size:.85rem;font-weight:600;border:1px solid #e2e8f0}
.entry{padding:.9rem 1rem;background:#fff;border-radius:10px;margin-bottom:.85rem;border-left:3px solid #2563eb;box-shadow:0 1px 4px rgba(30,64,175,.07)}
.entry h4{font-size:.95rem;font-weight:700;color:#0f172a}
.entry .meta{font-size:.78rem;color:#64748b;margin:.3rem 0 .5rem;font-weight:500}
.entry p{font-size:.85rem;color:#475569;line-height:1.65}
.summary-text{font-size:.9rem;color:#334155;line-height:1.75}
.footer{text-align:center;padding:1.1rem;font-size:.72rem;color:#94a3b8;border-top:1px solid #f1f5f9;letter-spacing:.03em}
@media print{body{background:#fff}.page{margin:0;border-radius:0;box-shadow:none}}
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="hdr-name">${data.name}</div>
    <div class="hdr-sub">${data.experience} &bull; ${data.sector}</div>
    <div class="hdr-contacts">
      ${data.email ? `<span>✉ ${data.email}</span>` : ''}
      ${data.phone ? `<span>📞 ${data.phone}</span>` : ''}
      ${data.address ? `<span>📍 ${data.address}</span>` : ''}
      ${data.idNumber ? `<span>🪪 ${data.idNumber}</span>` : ''}
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${data.summary ? `<div class="sec"><div class="sec-title">Professional Summary</div><p class="summary-text">${data.summary}</p></div>` : ''}
      ${data.work.some(w => w.company) ? `
      <div class="sec">
        <div class="sec-title">Work Experience</div>
        ${data.work.filter(w => w.company).map(w => `
        <div class="entry">
          <h4>${w.title || 'Role'}</h4>
          <div class="meta">${w.company}${w.startDate ? ' &bull; ' + w.startDate : ''}${w.endDate ? ' – ' + w.endDate : w.startDate ? ' – Present' : ''}</div>
          ${w.description ? `<p>${w.description}</p>` : ''}
        </div>`).join('')}
      </div>` : ''}
      ${data.education.degree ? `
      <div class="sec">
        <div class="sec-title">Education</div>
        <div class="entry">
          <h4>${data.education.degree}</h4>
          <div class="meta">${data.education.institution}${data.education.year ? ' &bull; ' + data.education.year : ''}</div>
        </div>
      </div>` : ''}
    </div>
    <div class="side">
      ${data.skills.length ? `
      <div class="sec">
        <div class="sec-title">Skills</div>
        <div class="pills">${data.skills.map(s => `<span class="pill">${s}</span>`).join('')}</div>
      </div>` : ''}
      ${data.languages.length ? `
      <div class="sec">
        <div class="sec-title">Languages</div>
        <div class="pills">${data.languages.map(l => `<span class="pill lang">${l}</span>`).join('')}</div>
      </div>` : ''}
      <div class="sec">
        <div class="sec-title">Experience Level</div>
        <span class="badge">${data.experience}</span>
      </div>
    </div>
  </div>
  <div class="footer">Generated by TalentMap AI &bull; ${today}</div>
</div>
</body>
</html>`;
}

async function callAI(messages: { role: string; content: string }[], system: string, task = 'fast') {
  const r = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system, task, max_tokens: 700 }),
  });
  const d = await r.json();
  return (d.content?.[0]?.text || '') as string;
}

export default function CandidateUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'template'>('template');

  // Upload state
  const [analyzedFiles, setAnalyzedFiles] = useState<(AnalyzedFile & { status: 'analyzing' | 'done' | 'error' })[]>([]);

  // Template form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState('Mid-Level');
  const [sector, setSector] = useState('Technology');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [work, setWork] = useState<WorkEntry[]>([{ company: '', title: '', startDate: '', endDate: '', description: '' }]);
  const [education, setEducation] = useState({ degree: '', institution: '', year: '' });

  // AI state
  const [enhancing, setEnhancing] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'candidate') { router.push('/login'); return; }
    setName(user.name);
    setEmail(user.email);
  }, [user, router]);

  if (!user || user.role !== 'candidate') return null;

  // ── AI: enhance summary ───────────────────────────────────────
  async function enhanceSummary() {
    if (enhancing) return;
    setEnhancing(true);
    try {
      const ctx = [
        name && `Name: ${name}`,
        experience && `Level: ${experience}`,
        sector && `Sector: ${sector}`,
        skills.length && `Skills: ${skills.join(', ')}`,
        work.some(w => w.company) && `Experience: ${work.filter(w => w.company).map(w => `${w.title} at ${w.company}`).join('; ')}`,
        education.degree && `Education: ${education.degree} from ${education.institution}`,
        languages.length && `Languages: ${languages.join(', ')}`,
        summary && `Current summary draft: "${summary}"`,
      ].filter(Boolean).join('\n');

      const text = await callAI(
        [{ role: 'user', content: `Write a professional CV summary for this candidate:\n${ctx}` }],
        `You are an expert CV writer. Write a compelling 3-4 sentence professional summary in first person for a ${experience} ${sector} professional. Be specific, results-oriented, and concise. Return ONLY the summary text, no labels or quotes.`,
        'fast'
      );
      if (text) setSummary(text.trim());
    } catch {}
    setEnhancing(false);
  }

  // ── AI: suggest skills ────────────────────────────────────────
  async function suggestSkillsAI() {
    if (suggestingSkills) return;
    setSuggestingSkills(true);
    try {
      const text = await callAI(
        [{ role: 'user', content: `Suggest 8 key skills for a ${experience} professional in ${sector}. Return ONLY a JSON array like ["Skill1","Skill2",...]. No explanation.` }],
        'You are a career coach. Return a JSON array of skill strings only.',
        'fast'
      );
      const m = text.match(/\[[\s\S]*?\]/);
      if (m) {
        const suggested: string[] = JSON.parse(m[0]);
        setSkills(prev => {
          const merged = [...prev];
          suggested.forEach(s => { if (!merged.includes(s)) merged.push(s); });
          return merged.slice(0, 16);
        });
      }
    } catch {}
    setSuggestingSkills(false);
  }

  // ── AI: analyze uploaded file ────────────────────────────────
  async function analyzeFile(file: File) {
    const entry = { name: file.name, skills: [], experience: '', summary: '', sector: '', status: 'analyzing' as const };
    setAnalyzedFiles(prev => [...prev, entry]);

    let content = '';
    try {
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        // For binary files, pass filename + size as context
        content = `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }
    } catch {
      content = file.name;
    }

    try {
      const text = await callAI(
        [{ role: 'user', content: `Analyze this CV file and extract information:\nFilename: ${file.name}\n${content.slice(0, 2000)}` }],
        `You are an expert HR analyst. Extract CV information and return ONLY this JSON (no markdown):\n{"sector":"primary professional sector","experience":"entry-level|junior|mid-level|senior|lead","skills":["skill1","skill2","skill3","skill4","skill5"],"summary":"2-sentence professional summary of the candidate"}\nIf the file is binary or unreadable, make educated guesses based on the filename.`,
        'json'
      );
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        setAnalyzedFiles(prev => prev.map(f =>
          f.name === file.name
            ? { ...f, ...parsed, status: 'done' }
            : f
        ));
        // Pre-fill form if this is the first file and template is empty
        if (!summary && parsed.summary) setSummary(parsed.summary);
        if (!skills.length && parsed.skills?.length) setSkills(parsed.skills);
        if (parsed.experience) setExperience(capitalize(parsed.experience));
        if (parsed.sector) setSector(parsed.sector);
        return;
      }
    } catch {}

    setAnalyzedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error' } : f));
  }

  function handleFiles(files: FileList) {
    Array.from(files).forEach(f => analyzeFile(f));
  }

  function capitalize(s: string) {
    return s.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join('-');
  }

  function addSkill(sk: string) {
    const s = sk.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  }

  function toggleLanguage(l: string) {
    setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  }

  function updateWork(i: number, field: keyof WorkEntry, val: string) {
    setWork(prev => prev.map((w, wi) => wi === i ? { ...w, [field]: val } : w));
  }

  function handleDownload() {
    const html = generateCVHtml({
      name, email, phone, address, idNumber: user?.idNumber ?? '',
      summary, skills, languages, experience, sector, work, education,
    });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'CV').replace(/\s+/g, '_')}_TalentMap.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '0.9rem', color: '#111827', background: 'white', fontFamily: 'inherit',
  };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' };

  const suggestions = SKILL_SUGGESTIONS[sector] || SKILL_SUGGESTIONS.Other;

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="TalentMap" subtitle="Candidate Portal" />

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/candidate" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
          ← Back to My Profile
        </Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Build Your CV</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Fill the template or upload an existing file — AI will enhance it instantly.</p>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
          {[{ id: 'template', label: '✏️ Fill Template' }, { id: 'upload', label: '📁 Upload File' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as 'upload' | 'template')} style={{
              padding: '0.65rem 1.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: mode === m.id ? '#2563eb' : 'white',
              color: mode === m.id ? 'white' : '#6b7280',
              transition: 'all 0.15s',
            }}>{m.label}</button>
          ))}
        </div>

        {/* ── UPLOAD MODE ── */}
        {mode === 'upload' && (
          <div>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #d1d5db', background: 'white',
                borderRadius: '14px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                marginBottom: '1.5rem', transition: 'all 0.2s',
              }}
            >
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📂</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>Drop your CV here or click to browse</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>PDF, Word, TXT, JPG, PNG — AI analyzes instantly</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: '#eff6ff', borderRadius: '9999px', fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 600, marginBottom: '1.25rem' }}>
                🤖 Powered by Groq llama-3.1-8b-instant — results in ~1 second
              </div>
              <br/>
              <button style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Choose File</button>
            </div>

            {analyzedFiles.length > 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                  {analyzedFiles.length} File{analyzedFiles.length > 1 ? 's' : ''} — AI Analysis
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analyzedFiles.map((f, i) => (
                    <div key={i} style={{
                      padding: '1rem 1.25rem', borderRadius: '12px',
                      background: f.status === 'done' ? '#f0fdf4' : f.status === 'error' ? '#fef2f2' : '#f8fafc',
                      border: `1.5px solid ${f.status === 'done' ? '#bbf7d0' : f.status === 'error' ? '#fecaca' : '#e5e7eb'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: f.status === 'done' ? '0.75rem' : 0 }}>
                        <span style={{ fontSize: '1.4rem' }}>
                          {f.status === 'analyzing' ? '⏳' : f.status === 'done' ? '✅' : '❌'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{f.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {f.status === 'analyzing' ? '🤖 AI is reading your CV...' : f.status === 'error' ? 'Could not analyze file' : `${f.sector} · ${f.experience}`}
                          </div>
                        </div>
                        {f.status === 'done' && (
                          <button
                            onClick={() => {
                              if (f.summary) setSummary(f.summary);
                              if (f.skills?.length) setSkills(f.skills);
                              if (f.experience) setExperience(capitalize(f.experience));
                              if (f.sector) setSector(f.sector);
                              setMode('template');
                            }}
                            style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Use in Template →
                          </button>
                        )}
                      </div>
                      {f.status === 'done' && (
                        <>
                          {f.summary && <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, marginBottom: '0.5rem', fontStyle: 'italic' }}>{f.summary}</p>}
                          {f.skills?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {f.skills.map(s => (
                                <span key={s} style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>{s}</span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TEMPLATE MODE ── */}
        {mode === 'template' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Personal Info */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Full Name', val: name, set: setName, ph: 'Your full name' },
                  { label: 'Email', val: email, set: setEmail, ph: 'email@example.com' },
                  { label: 'Phone', val: phone, set: setPhone, ph: '+212 6 XX XX XX XX' },
                  { label: 'Address', val: address, set: setAddress, ph: 'City, Country' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={lbl}>{label}</label>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inp} />
                  </div>
                ))}
                <div>
                  <label style={lbl}>ID Number</label>
                  <input value={user.idNumber} readOnly style={{ ...inp, background: '#f3f4f6', color: '#6b7280' }} />
                </div>
              </div>
            </div>

            {/* Experience + Sector */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Experience & Sector</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Experience Level</label>
                  <select value={experience} onChange={e => setExperience(e.target.value)} style={inp}>
                    {['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Sector</label>
                  <select value={sector} onChange={e => setSector(e.target.value)} style={inp}>
                    {Object.keys(SKILL_SUGGESTIONS).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary with AI enhance */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Professional Summary</h2>
                <button
                  onClick={enhanceSummary}
                  disabled={enhancing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 1rem', borderRadius: '8px',
                    background: enhancing ? '#f3f4f6' : '#eff6ff',
                    color: enhancing ? '#9ca3af' : '#1d4ed8',
                    border: '1.5px solid #bfdbfe', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {enhancing
                    ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Writing…</>
                    : '✨ AI Write'}
                </button>
              </div>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Click '✨ AI Write' to generate a professional summary instantly, or type your own..."
                rows={4}
                style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                🤖 AI uses Groq llama-3.1-8b-instant — result in ~1 second
              </p>
            </div>

            {/* Work Experience */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Work Experience</h2>
                {work.length < 4 && (
                  <button
                    onClick={() => setWork(p => [...p, { company: '', title: '', startDate: '', endDate: '', description: '' }])}
                    style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    + Add Entry
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {work.map((w, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #2563eb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div><label style={lbl}>Company</label><input value={w.company} onChange={e => updateWork(i, 'company', e.target.value)} placeholder="Company name" style={inp} /></div>
                      <div><label style={lbl}>Job Title</label><input value={w.title} onChange={e => updateWork(i, 'title', e.target.value)} placeholder="Your role" style={inp} /></div>
                      <div><label style={lbl}>Start</label><input value={w.startDate} onChange={e => updateWork(i, 'startDate', e.target.value)} placeholder="Jan 2022" style={inp} /></div>
                      <div><label style={lbl}>End</label><input value={w.endDate} onChange={e => updateWork(i, 'endDate', e.target.value)} placeholder="Present" style={inp} /></div>
                    </div>
                    <div>
                      <label style={lbl}>Key Responsibilities</label>
                      <textarea value={w.description} onChange={e => updateWork(i, 'description', e.target.value)} placeholder="Describe your main achievements and responsibilities..." rows={2} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Education</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><label style={lbl}>Degree / Diploma</label><input value={education.degree} onChange={e => setEducation(p => ({ ...p, degree: e.target.value }))} placeholder="Bachelor's in Computer Science" style={inp} /></div>
                <div><label style={lbl}>Institution</label><input value={education.institution} onChange={e => setEducation(p => ({ ...p, institution: e.target.value }))} placeholder="University name" style={inp} /></div>
                <div><label style={lbl}>Year</label><input value={education.year} onChange={e => setEducation(p => ({ ...p, year: e.target.value }))} placeholder="2020" style={inp} /></div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Skills</h2>
                <button
                  onClick={suggestSkillsAI}
                  disabled={suggestingSkills}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 1rem', borderRadius: '8px',
                    background: suggestingSkills ? '#f3f4f6' : '#eff6ff',
                    color: suggestingSkills ? '#9ca3af' : '#1d4ed8',
                    border: '1.5px solid #bfdbfe', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                  }}>
                  {suggestingSkills ? '⟳ Suggesting…' : '🤖 AI Suggest'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                  placeholder="Type a skill and press Enter" style={{ ...inp, flex: 1 }} />
                <button onClick={() => addSkill(skillInput)} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '9999px', padding: '0.28rem 0.75rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                    {s}
                    <button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Quick add:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {suggestions.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Languages</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleLanguage(l)}
                    style={{
                      padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: languages.includes(l) ? '#065f46' : '#f0fdf4',
                      color: languages.includes(l) ? 'white' : '#065f46',
                      border: `1.5px solid ${languages.includes(l) ? '#065f46' : '#bbf7d0'}`,
                    }}>
                    {languages.includes(l) ? '✓ ' : ''}{l}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'white', borderRadius: '14px', border: '1.5px solid #e5e7eb' }}>
              <button
                onClick={handleDownload}
                style={{ padding: '0.75rem 1.75rem', borderRadius: '9px', background: 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⬇ Download CV (HTML)
              </button>
              <button
                onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '9px', border: '1.5px solid #2563eb', background: 'white', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                💾 Save Profile
              </button>
              {saved && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>✓ Profile saved!</span>}
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#9ca3af' }}>
                Open the downloaded .html file in your browser, then Ctrl+P → Save as PDF
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
