'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

const MAX_CVS = 20;
const CONCURRENCY = 4;

const MOROCCO_HR = `Tu es un expert RH spécialisé dans le marché marocain de l'emploi.
Secteurs au Maroc: Technology/Numérique (IBM, Capgemini, CBI), Data Science, Finance/Banque (Attijariwafa, BMCE, CIH, Banque Populaire), BTP/Immobilier, Automobile (Renault-Nissan Tanger, PSA Kénitra), Textile, Tourisme/Hôtellerie, Agro-alimentaire (OCP, Centrale Danone, Cosumar), Énergie renouvelable (MASEN, NAREVA), Santé, Marketing, Design, Operations.
Diplômes courants: Bac, DUT/BTS (Bac+2), Licence (Bac+3), Master/MBA (Bac+5), Doctorat, OFPPT (TSGE/TSI/TH), Grandes écoles (EHTP, EMI, ENSAM, ENCG, ISCAE, HEM).
Villes: Casablanca, Rabat, Tanger, Marrakech, Fès, Agadir, Oujda, Kénitra, Meknès.
CVs marocains: rédigés en français, état civil (CIN, date naissance), accroche professionnelle, expériences en ordre inversé.`;

interface CvEntry {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  enhanceStatus?: 'idle' | 'enhancing' | 'enhanced' | 'error';
  name: string;
  email: string;
  phone: string;
  sector: string;
  experience: string;
  skills: string[];
  summary: string;
  enhancedHtml?: string;
  error?: string;
}

function fmtBytes(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function fileIcon(name: string) {
  if (/\.pdf$/i.test(name)) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#FEE2E2"/><text x="4" y="17" fontSize="11" fontWeight="700" fill="#991B1B">PDF</text></svg>
  );
  if (/\.(doc|docx)$/i.test(name)) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#DBEAFE"/><text x="2" y="17" fontSize="9" fontWeight="700" fill="#1E40AF">DOC</text></svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#FEF3C7"/><text x="3" y="17" fontSize="9" fontWeight="700" fill="#92400E">IMG</text></svg>
  );
}

async function readFileContent(file: File): Promise<string> {
  if (file.type === 'text/plain' || /\.txt$/i.test(file.name)) {
    try { return (await file.text()).slice(0, 3000); } catch {}
  }
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FICHIER';
  return `[CV ${ext}: "${file.name}" — ${fmtBytes(file.size)}]`;
}

function parseJ(txt: string) {
  try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

/* ── AI-enhanced CV HTML generator ── */
function generateEnhancedCvHtml(cv: CvEntry, enhanced: {
  headline: string;
  pitch: string;
  skills: string[];
  strengths: string[];
  improvements: string[];
}): string {
  const skillsHtml = (enhanced.skills || cv.skills).map(s =>
    `<span class="skill">${s}</span>`
  ).join('');
  const strengthsHtml = (enhanced.strengths || []).map(s => `<li>${s}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>CV Amélioré – ${cv.name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:#0D1B2A;background:#fff;max-width:800px;margin:0 auto}
  .header{background:linear-gradient(135deg,#0D1B2A 0%,#1B4FD8 100%);padding:40px 48px 36px;color:#fff}
  .name{font-size:28px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px}
  .headline{font-size:14px;color:rgba(255,255,255,.7);font-weight:500;margin-bottom:16px}
  .contact-row{display:flex;gap:20px;flex-wrap:wrap}
  .contact-item{font-size:12.5px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:5px}
  .badge-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
  .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700}
  .badge-sector{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.25)}
  .badge-exp{background:#E8A020;color:#0D1B2A}
  .enhanced-tag{background:#22C55E;color:#fff;font-size:10px;padding:3px 9px;border-radius:999px;font-weight:700;letter-spacing:.04em}
  .body{padding:36px 48px}
  .section{margin-bottom:28px}
  .section-label{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#1B4FD8;margin-bottom:10px;display:flex;align-items:center;gap:6px}
  .section-label::after{content:'';flex:1;height:1px;background:#E5E7EB}
  .pitch{font-size:13.5px;line-height:1.7;color:#374151;background:#F8FAFF;border-left:3px solid #1B4FD8;padding:14px 18px;border-radius:0 8px 8px 0;font-style:italic}
  .skills{display:flex;flex-wrap:wrap;gap:7px}
  .skill{padding:5px 13px;background:#EFF6FF;color:#1E40AF;border-radius:6px;font-size:12px;font-weight:600}
  .strengths{display:flex;flex-direction:column;gap:6px}
  .strengths li{font-size:13px;color:#374151;display:flex;align-items:flex-start;gap:8px;line-height:1.55}
  .strengths li::before{content:'✓';color:#16A34A;font-weight:800;flex-shrink:0}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .info-box{background:#F9FAFB;border:1px solid #F3F4F6;border-radius:8px;padding:12px 14px}
  .info-label{font-size:10px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
  .info-value{font-size:13px;color:#111827;font-weight:500}
  .footer{padding:18px 48px;border-top:1px solid #F3F4F6;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-size:11px;color:#9CA3AF;font-weight:600}
  .footer-date{font-size:11px;color:#D1D5DB}
  @media print{body{max-width:none}@page{margin:0.8cm}.header{padding:28px 36px}.body{padding:24px 36px}}
</style>
</head>
<body>
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div class="name">${cv.name}</div>
        <div class="headline">${enhanced.headline || cv.sector + ' · ' + cv.experience}</div>
      </div>
      <span class="enhanced-tag">✦ CV Amélioré</span>
    </div>
    ${(cv.email || cv.phone) ? `<div class="contact-row">
      ${cv.email ? `<span class="contact-item">✉ ${cv.email}</span>` : ''}
      ${cv.phone ? `<span class="contact-item">📱 ${cv.phone}</span>` : ''}
    </div>` : ''}
    <div class="badge-row">
      ${cv.sector ? `<span class="badge badge-sector">${cv.sector}</span>` : ''}
      ${cv.experience ? `<span class="badge badge-exp">${cv.experience}</span>` : ''}
    </div>
  </div>

  <div class="body">
    ${enhanced.pitch ? `<div class="section">
      <div class="section-label">Accroche professionnelle</div>
      <div class="pitch">${enhanced.pitch}</div>
    </div>` : ''}

    ${(enhanced.skills || cv.skills).length > 0 ? `<div class="section">
      <div class="section-label">Compétences clés</div>
      <div class="skills">${skillsHtml}</div>
    </div>` : ''}

    ${enhanced.strengths?.length > 0 ? `<div class="section">
      <div class="section-label">Points forts identifiés</div>
      <ul class="strengths">${strengthsHtml}</ul>
    </div>` : ''}

    ${(cv.email || cv.phone) ? `<div class="section">
      <div class="section-label">Coordonnées</div>
      <div class="info-grid">
        ${cv.email ? `<div class="info-box"><div class="info-label">Email</div><div class="info-value">${cv.email}</div></div>` : ''}
        ${cv.phone ? `<div class="info-box"><div class="info-label">Téléphone</div><div class="info-value">${cv.phone}</div></div>` : ''}
      </div>
    </div>` : ''}
  </div>

  <div class="footer">
    <span class="footer-brand">TalentMap · CV Amélioré par IA</span>
    <span class="footer-date">${new Date().toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
  </div>
</body>
</html>`;
}

/* ── Download enhanced CV as printable HTML ── */
function downloadEnhancedCv(cv: CvEntry) {
  if (!cv.enhancedHtml) return;
  const blob = new Blob([cv.enhancedHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CV_Amélioré_${cv.name.replace(/\s+/g, '_')}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ── Print enhanced CV ── */
function printEnhancedCv(cv: CvEntry) {
  if (!cv.enhancedHtml) return;
  const blob = new Blob([cv.enhancedHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => { win.focus(); win.print(); };
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ── Status pill ── */
function StatusPill({ status }: { status: CvEntry['status'] }) {
  const map = {
    queued: { label: 'En attente', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    processing: { label: 'Analyse…', bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
    done: { label: 'Analysé', bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
    error: { label: 'Erreur', bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', animation: status === 'processing' ? 'pulse 1.4s ease infinite' : 'none' }} />
      {s.label}
    </span>
  );
}

function EnhancePill({ status }: { status: CvEntry['enhanceStatus'] }) {
  if (!status || status === 'idle') return null;
  const map = {
    enhancing: { label: 'Amélioration…', bg: '#F5F3FF', color: '#5B21B6', dot: '#7C3AED' },
    enhanced: { label: 'CV Amélioré', bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
    error: { label: 'Échec', bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', animation: status === 'enhancing' ? 'pulse 1.4s ease infinite' : 'none' }} />
      {s.label}
    </span>
  );
}

export default function CoordinatorUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvList, setCvList] = useState<CvEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'processing' | 'queued' | 'error'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const queueRef = useRef<string[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());
  const activeRef = useRef(0);

  useEffect(() => {
    if (!user || user.role !== 'coordinator') router.push('/login');
  }, [user, router]);

  // Persist done CVs
  useEffect(() => {
    const done = cvList.filter(c => c.status === 'done');
    if (done.length === 0) return;
    try { localStorage.setItem('coordinator_cvs', JSON.stringify(done)); } catch {}
    fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'save_cvs', cvs: done }),
    }).catch(() => {});
  }, [cvList]);

  if (!user || user.role !== 'coordinator') return null;

  /* ── Process single CV (extract) ── */
  async function processOne(id: string) {
    const file = fileMapRef.current.get(id);
    if (!file) { activeRef.current--; drain(); return; }

    setCvList(p => p.map(c => c.id === id ? { ...c, status: 'processing' } : c));
    try {
      const content = await readFileContent(file);
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          system: `${MOROCCO_HR}
Analyse ce CV. Si c'est un fichier binaire (PDF/DOCX/image), déduis les informations probables du nom du fichier.
Retourne UNIQUEMENT ce JSON valide sans markdown:
{"name":"nom complet","email":"email ou vide","phone":"téléphone ou vide","sector":"Technology|Data Science|Finance|BTP|Tourisme|Agro-alimentaire|Healthcare|Marketing|Design|Operations|Other","experience":"Entry-Level|Junior|Mid-Level|Senior|Lead","skills":["3 à 5 compétences clés"],"summary":"Accroche professionnelle percutante en 1 phrase"}`,
          task: 'json',
          max_tokens: 500,
        }),
      });
      const data = await r.json();
      const parsed = parseJ(data.content?.[0]?.text || '');
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_.]/g, ' ').trim();
      setCvList(p => p.map(c => c.id === id ? {
        ...c, status: 'done', enhanceStatus: 'idle',
        name: parsed?.name || baseName,
        email: parsed?.email || '',
        phone: parsed?.phone || '',
        sector: parsed?.sector || 'Other',
        experience: parsed?.experience || 'Mid-Level',
        skills: Array.isArray(parsed?.skills) ? parsed.skills.slice(0, 6) : [],
        summary: parsed?.summary || '',
      } : c));
    } catch {
      setCvList(p => p.map(c => c.id === id ? { ...c, status: 'error', error: 'Erreur de traitement' } : c));
    }
    activeRef.current--;
    drain();
  }

  function drain() {
    while (activeRef.current < CONCURRENCY && queueRef.current.length > 0) {
      const id = queueRef.current.shift()!;
      activeRef.current++;
      processOne(id);
    }
  }

  function handleFiles(fileList: FileList) {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    const remaining = MAX_CVS - cvList.length;
    if (remaining <= 0) return;
    const toAdd = arr.slice(0, remaining);
    const newEntries: CvEntry[] = toAdd.map((f, i) => {
      const id = `cv_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`;
      fileMapRef.current.set(id, f);
      queueRef.current.push(id);
      return { id, fileName: f.name, fileSize: fmtBytes(f.size), status: 'queued' as const, enhanceStatus: 'idle', name: '', email: '', phone: '', sector: '', experience: '', skills: [], summary: '' };
    });
    setCvList(p => [...p, ...newEntries]);
    drain();
  }

  /* ── AI CV enhancement ── */
  async function enhanceCV(id: string) {
    const cv = cvList.find(c => c.id === id);
    if (!cv || cv.status !== 'done') return;

    setCvList(p => p.map(c => c.id === id ? { ...c, enhanceStatus: 'enhancing' } : c));
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Candidat: ${cv.name}
Secteur: ${cv.sector}
Niveau: ${cv.experience}
Compétences actuelles: ${cv.skills.join(', ')}
Accroche actuelle: ${cv.summary}
Email: ${cv.email || 'N/A'}
Téléphone: ${cv.phone || 'N/A'}`
          }],
          system: `${MOROCCO_HR}
Tu es un rédacteur de CV expert pour le marché marocain. Améliore et enrichis ce profil candidat.
Retourne UNIQUEMENT ce JSON valide sans markdown:
{
  "headline": "Titre professionnel percutant (ex: Développeur Full-Stack Senior | React & Node.js)",
  "pitch": "Accroche professionnelle améliorée en 2-3 phrases percutantes, orientée résultats, adaptée au marché marocain",
  "skills": ["liste améliorée et enrichie de 6-8 compétences clés pertinentes pour le secteur"],
  "strengths": ["Point fort spécifique et concret 1", "Point fort 2", "Point fort 3"],
  "improvements": ["Conseil d'amélioration du CV 1", "Conseil 2"]
}`,
          task: 'json',
          max_tokens: 700,
        }),
      });
      const data = await r.json();
      const enhanced = parseJ(data.content?.[0]?.text || '');
      if (enhanced) {
        const html = generateEnhancedCvHtml(cv, enhanced);
        setCvList(p => p.map(c => c.id === id ? { ...c, enhanceStatus: 'enhanced', enhancedHtml: html } : c));
      } else {
        setCvList(p => p.map(c => c.id === id ? { ...c, enhanceStatus: 'error' } : c));
      }
    } catch {
      setCvList(p => p.map(c => c.id === id ? { ...c, enhanceStatus: 'error' } : c));
    }
  }

  /* ── Enhance all done CVs at once ── */
  async function enhanceAll() {
    const toEnhance = cvList.filter(c => c.status === 'done' && (!c.enhanceStatus || c.enhanceStatus === 'idle' || c.enhanceStatus === 'error'));
    for (const cv of toEnhance) {
      await enhanceCV(cv.id);
    }
  }

  function clearAll() {
    setCvList([]); queueRef.current = []; fileMapRef.current.clear(); activeRef.current = 0;
  }

  function exportCSV() {
    const done = cvList.filter(c => c.status === 'done');
    const header = 'Nom,Email,Téléphone,Secteur,Expérience,Compétences,Résumé,Fichier,CV Amélioré';
    const rows = done.map(c => [c.name, c.email, c.phone, c.sector, c.experience, c.skills.join('; '), c.summary, c.fileName, c.enhanceStatus === 'enhanced' ? 'Oui' : 'Non'].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })),
      download: `Candidats_TalentMap_${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
  }

  const total = cvList.length;
  const done = cvList.filter(c => c.status === 'done').length;
  const processing = cvList.filter(c => c.status === 'processing').length;
  const queued = cvList.filter(c => c.status === 'queued').length;
  const errors = cvList.filter(c => c.status === 'error').length;
  const enhanced = cvList.filter(c => c.enhanceStatus === 'enhanced').length;
  const progressPct = total ? Math.round((done / total) * 100) : 0;
  const atLimit = total >= MAX_CVS;

  const filtered = cvList.filter(c => {
    const ms = filterStatus === 'all' || c.status === filterStatus;
    const q = search.toLowerCase();
    const mq = !q || c.fileName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q));
    return ms && mq;
  });

  const canEnhanceAll = done > 0 && cvList.some(c => c.status === 'done' && (!c.enhanceStatus || c.enhanceStatus === 'idle' || c.enhanceStatus === 'error'));

  return (
    <main style={{ minHeight: '100vh', background: '#F4F5F7', fontFamily: "'Segoe UI', system-ui, Arial, sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .cv-row:hover { background: #F8FAFF !important; }
        .enhance-btn:hover:not(:disabled) { background: #7C3AED !important; color: #fff !important; border-color: #7C3AED !important; }
        .action-btn:hover:not(:disabled) { opacity: .88; }
        .drop-zone:hover { border-color: #1B4FD8 !important; background: #F0F5FF !important; }
      `}</style>

      {/* ── Top nav ── */}
      <nav style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/coordinator" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1B4FD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>TalentMap</span>
          </Link>
          <svg width="4" height="14" viewBox="0 0 4 14" fill="none"><path d="M2 1v12" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>Import CVs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>{user.name}</span>
          <Link href="/coordinator" style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.5px', marginBottom: 5 }}>
              Import de CVs
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.5 }}>
              Chargez jusqu'à <strong style={{ color: '#0D1B2A' }}>{MAX_CVS} CVs</strong> · Analyse IA automatique · Amélioration professionnelle en un clic
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {canEnhanceAll && (
              <button
                onClick={enhanceAll}
                className="action-btn"
                style={{ padding: '8px 16px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,.25)"/></svg>
                Améliorer tout ({done})
              </button>
            )}
            {done > 0 && (
              <button onClick={exportCSV} className="action-btn" style={{ padding: '8px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                ↓ Exporter CSV
              </button>
            )}
            {total > 0 && (
              <button onClick={clearAll} className="action-btn" style={{ padding: '8px 14px', background: 'transparent', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Vider
              </button>
            )}
          </div>
        </div>

        {/* ── CV counter ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: atLimit ? '#E8A020' : '#1B4FD8', width: `${(total / MAX_CVS) * 100}%`, transition: 'width .4s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: atLimit ? '#E8A020' : '#64748B', whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>
            {total}/{MAX_CVS} CVs
          </span>
        </div>

        {/* ── Drop zone ── */}
        {!atLimit && (
          <div
            className="drop-zone"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#1B4FD8' : '#CBD5E1'}`,
              background: dragging ? '#EFF6FF' : '#fff',
              borderRadius: 14, padding: '32px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.18s', marginBottom: 20,
            }}>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
            <div style={{ width: 52, height: 52, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#1B4FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 6 }}>
              {dragging ? 'Déposez ici' : 'Glissez vos CVs ici'}
            </h3>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              Jusqu'à <strong>{MAX_CVS - total}</strong> CV{MAX_CVS - total > 1 ? 's' : ''} restant{MAX_CVS - total > 1 ? 's' : ''} · PDF, DOCX, DOC, JPG, PNG
            </p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
              {[['PDF', '#FEE2E2', '#991B1B'], ['DOCX', '#DBEAFE', '#1E40AF'], ['DOC', '#DBEAFE', '#1E40AF'], ['JPG/PNG', '#FEF3C7', '#92400E']].map(([ext, bg, color]) => (
                <span key={ext} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color }}>{ext}</span>
              ))}
            </div>
            <button
              className="action-btn"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{ padding: '10px 24px', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Sélectionner des fichiers
            </button>
          </div>
        )}

        {atLimit && (
          <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>Limite atteinte · </span>
              <span style={{ fontSize: 13, color: '#78350F' }}>Vous avez atteint le maximum de {MAX_CVS} CVs. Videz la liste pour en importer de nouveaux.</span>
            </div>
          </div>
        )}

        {/* ── Progress bar (while processing) ── */}
        {total > 0 && (queued > 0 || processing > 0) && (
          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', marginBottom: 16, border: '1px solid #E2E8F0', animation: 'slideDown .2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 18 }}>
                {[
                  { label: 'Total', value: total, color: '#0D1B2A' },
                  queued > 0 && { label: 'En attente', value: queued, color: '#F59E0B' },
                  processing > 0 && { label: 'Analyse', value: processing, color: '#1B4FD8' },
                  { label: 'Terminés', value: done, color: '#16A34A' },
                  errors > 0 && { label: 'Erreurs', value: errors, color: '#DC2626' },
                ].filter(Boolean).map((s: any) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 20, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#1B4FD8', fontVariantNumeric: 'tabular-nums' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#1B4FD8,#16A34A)', borderRadius: 3, width: `${progressPct}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}

        {/* ── Stats row (when all done) ── */}
        {done > 0 && queued === 0 && processing === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'CVs analysés', value: done, icon: '✓', color: '#16A34A', bg: '#F0FDF4' },
              { label: 'CVs améliorés', value: enhanced, icon: '✦', color: '#7C3AED', bg: '#F5F3FF' },
              ...(errors > 0 ? [{ label: 'Erreurs', value: errors, icon: '✕', color: '#DC2626', bg: '#FEF2F2' }] : []),
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.color}22` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                  <span style={{ fontSize: 14, color: s.color, opacity: .5 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginTop: 3, opacity: .8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ── */}
        {total > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: .4 }} width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#0D1B2A" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, fichier, compétence…"
                style={{ width: '100%', padding: '9px 10px 9px 30px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#0D1B2A' }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#0D1B2A', cursor: 'pointer' }}>
              <option value="all">Tous ({total})</option>
              {done > 0 && <option value="done">Analysés ({done})</option>}
              {processing > 0 && <option value="processing">En cours ({processing})</option>}
              {queued > 0 && <option value="queued">En attente ({queued})</option>}
              {errors > 0 && <option value="error">Erreurs ({errors})</option>}
            </select>
            <span style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* ── CV list ── */}
        {filtered.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A' }}>CVs importés ({filtered.length}{filtered.length !== total ? ` / ${total}` : ''})</span>
              {enhanced > 0 && <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700, background: '#F5F3FF', padding: '3px 10px', borderRadius: 999 }}>✦ {enhanced} CV{enhanced > 1 ? 's' : ''} amélioré{enhanced > 1 ? 's' : ''}</span>}
            </div>
            <div>
              {filtered.map((cv, idx) => {
                const isExpanded = expanded === cv.id;
                return (
                  <div key={cv.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    {/* Main row */}
                    <div
                      className="cv-row"
                      style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, background: '#fff', cursor: cv.status === 'done' ? 'pointer' : 'default', transition: 'background .12s' }}
                      onClick={() => cv.status === 'done' && setExpanded(isExpanded ? null : cv.id)}>

                      {/* File icon */}
                      <div style={{ flexShrink: 0 }}>{fileIcon(cv.fileName)}</div>

                      {/* Name + filename */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cv.status === 'done' && cv.name ? cv.name : cv.fileName}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {cv.status === 'done' && cv.name && <span>{cv.fileName}</span>}
                          <span>{cv.fileSize}</span>
                          {cv.sector && <span style={{ background: '#EFF6FF', color: '#1E40AF', borderRadius: 4, padding: '1px 7px', fontWeight: 600, fontSize: 10 }}>{cv.sector}</span>}
                          {cv.experience && <span style={{ background: '#F0FDF4', color: '#166534', borderRadius: 4, padding: '1px 7px', fontWeight: 600, fontSize: 10 }}>{cv.experience}</span>}
                        </div>
                        {cv.status === 'done' && cv.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                            {cv.skills.slice(0, 4).map(s => (
                              <span key={s} style={{ background: '#F1F5F9', color: '#475569', borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 600 }}>{s}</span>
                            ))}
                            {cv.skills.length > 4 && <span style={{ fontSize: 10, color: '#94A3B8' }}>+{cv.skills.length - 4}</span>}
                          </div>
                        )}
                      </div>

                      {/* Right: status + actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <StatusPill status={cv.status} />
                        {cv.enhanceStatus && cv.enhanceStatus !== 'idle' && <EnhancePill status={cv.enhanceStatus} />}

                        {cv.status === 'done' && (
                          <>
                            {/* Enhance button */}
                            {(!cv.enhanceStatus || cv.enhanceStatus === 'idle' || cv.enhanceStatus === 'error') && (
                              <button
                                className="enhance-btn"
                                onClick={e => { e.stopPropagation(); enhanceCV(cv.id); }}
                                title="Améliorer ce CV avec l'IA"
                                style={{ padding: '6px 12px', borderRadius: 7, border: '1.5px solid #7C3AED', background: 'transparent', color: '#7C3AED', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s', whiteSpace: 'nowrap' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                Améliorer
                              </button>
                            )}
                            {cv.enhanceStatus === 'enhancing' && (
                              <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="#7C3AED" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10"/></svg>
                                IA en cours…
                              </span>
                            )}
                            {/* Download enhanced */}
                            {cv.enhanceStatus === 'enhanced' && cv.enhancedHtml && (
                              <div style={{ display: 'flex', gap: 5 }}>
                                <button
                                  onClick={e => { e.stopPropagation(); printEnhancedCv(cv); }}
                                  title="Imprimer / Sauvegarder en PDF"
                                  style={{ padding: '6px 10px', borderRadius: 7, border: '1.5px solid #10B981', background: '#ECFDF5', color: '#065F46', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                  PDF
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); downloadEnhancedCv(cv); }}
                                  title="Télécharger CV amélioré"
                                  style={{ padding: '6px 10px', borderRadius: 7, border: '1.5px solid #7C3AED', background: '#F5F3FF', color: '#5B21B6', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                  ↓ HTML
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {cv.status === 'done' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#94A3B8', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && cv.status === 'done' && (
                      <div style={{ padding: '0 20px 18px', borderTop: '1px solid #F1F5F9', background: '#FAFBFD', animation: 'slideDown .18s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginTop: 14 }}>
                          {cv.email && (
                            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 13px', border: '1px solid #F1F5F9' }}>
                              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Email</div>
                              <div style={{ fontSize: 13, color: '#0D1B2A', fontWeight: 500 }}>{cv.email}</div>
                            </div>
                          )}
                          {cv.phone && (
                            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 13px', border: '1px solid #F1F5F9' }}>
                              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Téléphone</div>
                              <div style={{ fontSize: 13, color: '#0D1B2A', fontWeight: 500 }}>{cv.phone}</div>
                            </div>
                          )}
                        </div>
                        {cv.summary && (
                          <div style={{ marginTop: 10, fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 1.65, borderLeft: '3px solid #1B4FD8', paddingLeft: 12, background: '#F8FAFF', borderRadius: '0 8px 8px 0', padding: '10px 14px 10px 13px' }}>
                            {cv.summary}
                          </div>
                        )}
                        {cv.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                            {cv.skills.map(s => (
                              <span key={s} style={{ background: '#EFF6FF', color: '#1E40AF', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94A3B8' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p style={{ fontWeight: 700, color: '#475569', fontSize: 16, marginBottom: 6 }}>Aucun CV importé</p>
            <p style={{ fontSize: 14, color: '#94A3B8', maxWidth: 340, margin: '0 auto' }}>
              Glissez des fichiers dans la zone ci-dessus ou cliquez pour sélectionner jusqu'à {MAX_CVS} CVs.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
