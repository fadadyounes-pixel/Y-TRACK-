'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  Technology:         ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Docker', 'Git', 'REST APIs', 'SAP'],
  'Data Science':     ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Power BI', 'Tableau', 'Statistiques', 'NLP', 'Deep Learning'],
  Finance:            ['Excel avancé', 'Modélisation financière', 'SAP FI/CO', 'IFRS', 'Gestion des risques', 'Power BI', 'SAGE', 'Audit', 'Contrôle de gestion'],
  Marketing:          ['SEO/SEM', 'Google Analytics', 'Community management', 'Adobe Creative Suite', 'CRM Salesforce', 'Copywriting', 'Email marketing'],
  Design:             ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Prototypage', 'After Effects', 'Motion design'],
  Operations:         ['Gestion de projet', 'Lean Manufacturing', 'Supply Chain', 'ERP/SAP', 'Optimisation des processus', 'Excel', 'Power BI'],
  BTP:                ['AutoCAD', 'Revit', 'MS Project', 'Gestion de chantier', 'Béton armé', 'BIM', 'DAO/CAO', 'Normes sécurité', 'Métré'],
  Tourisme:           ['Hospitality management', 'Revenue management', 'Opera PMS', 'Langues étrangères', 'Service client', 'Yield management'],
  'Agro-alimentaire': ['Contrôle qualité', 'HACCP', 'ISO 22000', 'Production alimentaire', 'R&D', 'Traçabilité', 'GMP'],
  Healthcare:         ['Soins aux patients', 'Pharmacologie', 'Gestion hospitalière', 'Recherche clinique', 'Matériovigilance', 'HL7'],
  Other:              ['Communication', 'Leadership', 'Résolution de problèmes', 'Travail en équipe', 'Suite Microsoft Office', 'Gestion du temps'],
};

const LANGUAGES = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Néerlandais', 'Italien', 'Portugais'];
const LANG_FLAGS: Record<string, string> = {
  'Français': '🇫🇷', 'Anglais': '🇬🇧', 'Arabe': '🇲🇦', 'Espagnol': '🇪🇸',
  'Allemand': '🇩🇪', 'Néerlandais': '🇳🇱', 'Italien': '🇮🇹', 'Portugais': '🇵🇹',
};

const MOROCCO_CONTEXT = `MARCHÉ DE L'EMPLOI MAROCAIN — CONTEXTE EXPERT:
Secteurs porteurs: BTP/Immobilier, Industrie automobile (Renault-Nissan Tanger, PSA Kénitra), Textile/Habillement, Tourisme (hôtellerie 5*, guides), Agro-alimentaire (OCP, Centrale Danone, Cosumar), Numérique/TIC (CBI, IBM Maroc, Capgemini), Banque/Finance (Attijariwafa Bank, BMCE Bank, Banque Populaire, CIH, BMCI), Énergie renouvelable (MASEN, IRESEN), Santé.
Diplômes reconnus: Baccalauréat, DUT/BTS/DEUST (Bac+2), Licence professionnelle (Bac+3), Master/MBA (Bac+5), Doctorat, Diplômes OFPPT (TSGE, TSI, TH, TC, TP...), Grandes écoles (EHTP, EMI, ENSAM, ENSA, ENCG, ISCAE, HEM, ENAM, Polytechnique).
Langues: Français (langue professionnelle dominante), Arabe classique (obligatoire dans la fonction publique), Anglais (exigé dans le numérique et les multinationales), Espagnol (nord du Maroc, tourisme).
Format CV marocain idéal: sobre et professionnel, rédigé en français, 1-2 pages max, avec photo recommandée, état civil complet (CIN, situation familiale, date de naissance), accroche/objectif professionnel en entête, expériences en ordre chronologique inverse, compétences techniques et linguistiques clairement listées.`;

interface WorkEntry { company: string; title: string; startDate: string; endDate: string; description: string; }

type Step = 'cv' | 'preview' | 'jobs';

function descToBullets(text: string): string {
  if (!text.trim()) return '';
  const lines = text.split(/\n|•|·/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    const sents = text.split(/\.\s+/).map(l => l.trim()).filter(l => l.length > 10);
    if (sents.length > 1) return sents.map(s => `<li>${s.replace(/\.$/, '')}.</li>`).join('');
    return `<li>${text}</li>`;
  }
  return lines.map(l => `<li>${l}</li>`).join('');
}

function generateCVHtml(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : initials || '?';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:840px;margin:2rem auto;background:#fff;border-radius:0;box-shadow:0 12px 48px rgba(0,0,0,.14);overflow:hidden}
.hdr{background:linear-gradient(135deg,#0a1631 0%,#1a3a6b 50%,#2563eb 100%);padding:2.5rem 2.75rem 2rem;color:#fff;position:relative;overflow:hidden;display:flex;align-items:center;gap:2rem}
.hdr::before{content:'';position:absolute;top:-80px;right:-80px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.06)}
.hdr-avatar{width:90px;height:90px;border-radius:50%;border:3px solid rgba(255,255,255,.5);background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.9rem;font-weight:900;color:#fff;flex-shrink:0;position:relative;z-index:1;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.25)}
.hdr-info{flex:1;position:relative;z-index:1}
.hdr-name{font-size:1.95rem;font-weight:900;letter-spacing:-.03em;line-height:1.1}
.hdr-role{margin-top:.4rem;font-size:1rem;font-weight:600;opacity:.75}
.hdr-contacts{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;margin-top:1rem}
.hdr-contacts span{font-size:.82rem;opacity:.8;display:flex;align-items:center;gap:.3rem}
.body{display:grid;grid-template-columns:1fr 270px;gap:0}
.main{padding:2rem 2rem 2rem 2.75rem;border-right:1px solid #f0f4f8}
.side{padding:2rem 1.75rem;background:#f8fafc}
.sec-title{font-size:.67rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:#2563eb;margin-bottom:.85rem;padding-bottom:.45rem;border-bottom:2px solid #dbeafe}
.sec{margin-bottom:1.75rem}
.pills{display:flex;flex-wrap:wrap;gap:.4rem}
.pill{background:#eff6ff;color:#1d4ed8;border-radius:6px;padding:.3rem .75rem;font-size:.76rem;font-weight:700;border:1px solid #bfdbfe}
.pill.lang{background:#f0fdf4;color:#065f46;border-color:#bbf7d0}
.pill.cert{background:#fefce8;color:#713f12;border-color:#fde68a}
.pill.role{background:#fdf4ff;color:#6b21a8;border-color:#e9d5ff}
.badge{display:inline-flex;align-items:center;gap:.35rem;background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;border-radius:6px;padding:.4rem 1rem;font-size:.82rem;font-weight:700}
.entry{padding:1rem 1.1rem;background:#fff;border-radius:8px;margin-bottom:.8rem;border-left:3px solid #2563eb;box-shadow:0 1px 6px rgba(30,64,175,.08)}
.entry h4{font-size:.95rem;font-weight:800;color:#0f172a;line-height:1.3}
.entry .co{font-size:.85rem;font-weight:700;color:#2563eb;margin-top:.15rem}
.entry .meta{font-size:.75rem;color:#64748b;margin:.25rem 0 .6rem;font-weight:500}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.83rem;color:#374151;line-height:1.65;padding-left:1rem;position:relative;margin-bottom:.25rem}
.entry ul li::before{content:"›";position:absolute;left:0;color:#2563eb;font-weight:800}
.summary-text{font-size:.88rem;color:#334155;line-height:1.8;border-left:3px solid #2563eb;padding-left:1rem;font-style:italic}
.edu-entry{background:#f8fafc;border-radius:8px;padding:.85rem 1rem;border:1px solid #e2e8f0}
.edu-entry h4{font-size:.92rem;font-weight:700;color:#0f172a}
.edu-entry .meta{font-size:.75rem;color:#64748b;margin-top:.2rem}
.footer{text-align:center;padding:.9rem;font-size:.68rem;color:#94a3b8;border-top:1px solid #f0f4f8;letter-spacing:.04em;background:#f8fafc}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="hdr-avatar">${avatarHtml}</div>
    <div class="hdr-info">
      <div class="hdr-name">${data.name || 'Nom Prénom'}</div>
      <div class="hdr-role">${data.experience} · ${data.sector}</div>
      <div class="hdr-contacts">
        ${data.email ? `<span>✉ ${data.email}</span>` : ''}
        ${data.phone ? `<span>📞 ${data.phone}</span>` : ''}
        ${data.address ? `<span>📍 ${data.address}</span>` : ''}
        ${data.idNumber ? `<span>🪪 CIN ${data.idNumber}</span>` : ''}
        ${data.linkedin ? `<span>🔗 ${data.linkedin}</span>` : ''}
        ${data.portfolio ? `<span>💻 ${data.portfolio}</span>` : ''}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${data.summary ? `<div class="sec"><div class="sec-title">✦ Profil Professionnel</div><p class="summary-text">${data.summary}</p></div>` : ''}
      ${data.work.some(w => w.company) ? `
      <div class="sec">
        <div class="sec-title">✦ Expériences Professionnelles</div>
        ${data.work.filter(w => w.company).map(w => `
        <div class="entry">
          <h4>${w.title || 'Poste'}</h4>
          <div class="co">${w.company}</div>
          <div class="meta">📅 ${w.startDate || ''}${w.startDate && (w.endDate || 'Présent') ? ' – ' + (w.endDate || 'Présent') : w.endDate || ''}</div>
          ${w.description ? `<ul>${descToBullets(w.description)}</ul>` : ''}
        </div>`).join('')}
      </div>` : ''}
      ${data.education.degree ? `
      <div class="sec">
        <div class="sec-title">✦ Formation</div>
        <div class="edu-entry">
          <h4>${data.education.degree}</h4>
          <div class="meta">${data.education.institution || ''}${data.education.year ? ' · ' + data.education.year : ''}</div>
        </div>
      </div>` : ''}
      ${data.targetRoles?.length ? `
      <div class="sec">
        <div class="sec-title">✦ Postes Recherchés</div>
        <div class="pills">${data.targetRoles.map(r => `<span class="pill role">🎯 ${r}</span>`).join('')}</div>
      </div>` : ''}
    </div>
    <div class="side">
      <div class="sec"><div class="sec-title">Niveau</div><span class="badge">⭐ ${data.experience}</span></div>
      ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><div class="pills">${data.skills.map(s => `<span class="pill">${s}</span>`).join('')}</div></div>` : ''}
      ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div style="display:flex;flex-direction:column;gap:.4rem">${data.languages.map(l => `<span class="pill lang">${LANG_FLAGS[l] || '🌐'} ${l}</span>`).join('')}</div></div>` : ''}
      ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div style="display:flex;flex-direction:column;gap:.4rem">${data.certifications.map(c => `<span class="pill cert">🏅 ${c}</span>`).join('')}</div></div>` : ''}
    </div>
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body>
</html>`;
}

const EXP_ORDER = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

function computeMatch(cv: { skills: string[]; sector: string; experience: string }, job: any): number {
  const cvSkills = Array.isArray(cv.skills) ? cv.skills : [];
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

type AIMsgContent = string | Array<{ type: string; [key: string]: unknown }>;
async function callAI(messages: { role: string; content: AIMsgContent }[], system: string, task = 'fast', maxTokens = 900) {
  const r = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system, task, max_tokens: maxTokens }),
  });
  const d = await r.json();
  return (d.content?.[0]?.text || '') as string;
}

export default function CandidateUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3-step wizard
  const [step, setStep] = useState<Step>('cv');
  const [cvSource, setCvSource] = useState<'upload' | 'template'>('upload');

  // Upload AI processing state
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'idle' | 'reading' | 'enhancing' | 'done' | 'error'>('idle');

  // CV form fields
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
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  // AI template helpers
  const [enhancing, setEnhancing] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);

  // Job matching
  const [coordJobs, setCoordJobs] = useState<any[]>([]);
  const [adaptingJob, setAdaptingJob] = useState<string | null>(null);
  const [adaptedCV, setAdaptedCV] = useState<{ jobId: string; summary: string; skills: string[] } | null>(null);
  const [precomputedAdaptations, setPrecomputedAdaptations] = useState<Record<string, { summary: string; skills: string[] }>>({});
  const precomputeStarted = useRef<Set<string>>(new Set());

  // Photo + links from info profile
  const [photo, setPhoto] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'candidate') { router.push('/login'); return; }
    setName(user.name);
    setEmail(user.email);
    // Load info profile (photo, linkedin, portfolio, phone, address)
    try {
      const stored = localStorage.getItem(`tm_info_${user.idNumber}`);
      if (stored) {
        const info = JSON.parse(stored);
        if (info.photo) setPhoto(info.photo);
        if (info.linkedin) setLinkedin(info.linkedin);
        if (info.portfolio) setPortfolio(info.portfolio);
        if (info.phone && !phone) setPhone(info.phone);
        if (info.city && !address) setAddress(info.city);
        if (info.firstName || info.lastName) setName(`${info.firstName || ''} ${info.lastName || ''}`.trim() || user.name);
        if (info.sector) setSector(info.sector.split('/')[0].trim());
        if (info.languages?.length) setLanguages(info.languages);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  // Load jobs from Redis for matching
  useEffect(() => {
    fetch('/api/sheets')
      .then(r => r.json())
      .then(data => { if (data.jobs?.length) setCoordJobs(data.jobs); })
      .catch(() => {
        try {
          const stored = localStorage.getItem('coordinator_jobs');
          if (stored) setCoordJobs(JSON.parse(stored));
        } catch {}
      });
  }, []);

  // Pre-compute adaptations when entering job step
  const skillsKey = skills.join(',');
  useEffect(() => {
    if (step !== 'jobs' || coordJobs.length === 0 || skills.length < 2) return;
    const openJobs = coordJobs.filter(j => j.status === 'Open').slice(0, 6);
    openJobs.forEach(job => {
      if (precomputeStarted.current.has(job.id)) return;
      precomputeStarted.current.add(job.id);
      const ctx = `${name} | ${sector} | ${experience}\nCompétences: ${skills.slice(0, 12).join(', ')}\nProfil: ${summary.slice(0, 200)}`;
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Poste: ${job.title} (${job.sector}, ${job.experience})\nRequis: ${(job.skills || []).join(', ')}\nProfil: ${ctx}` }],
          system: `Expert RH Maroc. JSON uniquement: {"summary":"accroche 2-3 phrases avec compétences alignées et verbes d'action","skills":["8 compétences priorisées pour ce poste"]}`,
          task: 'fast', max_tokens: 350,
        }),
      })
        .then(r => r.json())
        .then(d => {
          const m = (d.content?.[0]?.text || '').match(/\{[\s\S]*\}/);
          if (m) {
            const p = JSON.parse(m[0]);
            if (p.summary) setPrecomputedAdaptations(prev => ({ ...prev, [job.id]: { summary: p.summary, skills: Array.isArray(p.skills) ? p.skills : [] } }));
          }
        })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, coordJobs, name, skillsKey]);

  // Live CV HTML
  const cvHtml = useMemo(() => {
    if (!user) return '';
    return generateCVHtml({ name, email, phone, address, idNumber: user.idNumber ?? '', summary, skills, languages, experience, sector, work, education, targetRoles, certifications, photo, linkedin, portfolio });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, phone, address, summary, skills, languages, experience, sector, work, education, targetRoles, certifications, photo, linkedin, portfolio]);

  if (!user || user.role !== 'candidate') return null;

  // ── PDF download via browser print dialog ────────────────────────────────
  function downloadPDF() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(cvHtml);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 700);
  }

  // ── AI analysis of uploaded file ─────────────────────────────────────────
  async function analyzeUpload(file: File) {
    setProcessing(true);
    setProcessStep('reading');

    // Build AI message based on file type
    const isImage = file.type.startsWith('image/');
    const isPdf   = file.type === 'application/pdf';
    let msgContent: AIMsgContent;

    try {
      if (isImage) {
        const dataUrl: string = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target?.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const base64 = dataUrl.split(',')[1];
        const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
        msgContent = [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: `Analyse ce CV (image). Extrait toutes les informations visibles: nom, email, téléphone, adresse, expériences professionnelles (entreprise, poste, dates, description), formation, compétences, langues. Retourne UNIQUEMENT ce JSON valide (sans markdown):\n{"name":"","email":"","phone":"","address":"","sector":"secteur principal","experience":"entry-level|junior|mid-level|senior|lead","skills":["competence1","competence2","competence3","competence4","competence5"],"summary":"résumé professionnel 2 phrases","work":[{"company":"","title":"","startDate":"","endDate":"","description":""}],"education":{"degree":"","institution":"","year":""},"languages":[]}` },
        ];
      } else if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        msgContent = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: `Analyse ce CV (PDF). Extrait toutes les informations: nom, email, téléphone, adresse, expériences (entreprise, poste, dates, description), formation, compétences, langues. Retourne UNIQUEMENT ce JSON valide (sans markdown):\n{"name":"","email":"","phone":"","address":"","sector":"secteur principal","experience":"entry-level|junior|mid-level|senior|lead","skills":["competence1","competence2","competence3","competence4","competence5"],"summary":"résumé professionnel 2 phrases","work":[{"company":"","title":"","startDate":"","endDate":"","description":""}],"education":{"degree":"","institution":"","year":""},"languages":[]}` },
        ];
      } else {
        let rawText = '';
        try { rawText = await file.text(); } catch { rawText = file.name; }
        msgContent = `Analyse ce CV:\nFichier: ${file.name}\n${rawText.slice(0, 3000)}`;
      }
    } catch {
      msgContent = `Fichier: ${file.name}`;
    }

    // Step 1 — Extract
    let extracted: any = null;
    try {
      const text = await callAI(
        [{ role: 'user', content: msgContent }],
        `Tu es un expert RH spécialisé dans l'analyse de CV. Extrait les informations du CV et retourne UNIQUEMENT ce JSON (sans markdown):\n{"name":"","email":"","phone":"","address":"","sector":"secteur professionnel principal","experience":"entry-level|junior|mid-level|senior|lead","skills":["competence1","competence2","competence3","competence4","competence5"],"summary":"résumé professionnel 2 phrases","work":[{"company":"","title":"","startDate":"","endDate":"","description":""}],"education":{"degree":"","institution":"","year":""},"languages":[]}`,
        'json', 1200
      );
      const m = text.match(/\{[\s\S]*\}/);
      if (m) extracted = JSON.parse(m[0]);
    } catch {}

    if (!extracted) {
      setProcessStep('error');
      setProcessing(false);
      return;
    }

    // Step 2 — Enhance for Moroccan market
    setProcessStep('enhancing');
    let enhanced: any = null;
    try {
      const rawContent = typeof msgContent === 'string' ? msgContent : `CV: ${file.name}`;
      const text = await callAI(
        [{
          role: 'user',
          content: `Données extraites du CV:\nFichier: ${file.name}\nSecteur: ${extracted.sector}\nNiveau: ${extracted.experience}\nCompétences: ${extracted.skills?.join(', ')}\nRésumé: ${extracted.summary}\n\nContenu: ${rawContent.slice(0, 1500)}`,
        }],
        `Tu es un expert en recrutement et rédaction de CV pour le marché marocain avec 15 ans d'expérience.\n\n${MOROCCO_CONTEXT}\n\nAnalyse et améliore ce CV pour le marché marocain. Retourne UNIQUEMENT ce JSON valide (sans markdown):\n{"summary":"Profil professionnel 3-4 phrases en français, orienté marché marocain, verbes d'action forts","skills":["10 compétences pertinentes pour le marché marocain dans ce secteur"],"sector":"secteur précis parmi les secteurs porteurs du Maroc","experience":"Entry-Level|Junior|Mid-Level|Senior|Lead","targetRoles":["3 postes cibles réalistes sur le marché marocain"],"certifications":["2-3 certifications recommandées pour booster l'employabilité au Maroc"]}`,
        'json', 1200
      );
      const m = text.match(/\{[\s\S]*\}/);
      if (m) enhanced = JSON.parse(m[0]);
    } catch {}

    // Apply extracted + enhanced data to form
    const finalSkills      = enhanced?.skills?.length   ? enhanced.skills   : (extracted.skills || []);
    const finalSummary     = enhanced?.summary           ? enhanced.summary  : (extracted.summary || '');
    const finalExperience  = enhanced?.experience        ? capitalize(enhanced.experience) : capitalize(extracted.experience || 'Mid-Level');
    const finalSector      = enhanced?.sector            ? mapSector(enhanced.sector)      : mapSector(extracted.sector || 'Technology');
    const finalRoles       = enhanced?.targetRoles       || [];
    const finalCerts       = enhanced?.certifications    || [];

    if (extracted.name)       setName(extracted.name);
    if (extracted.email)      setEmail(extracted.email);
    if (extracted.phone)      setPhone(extracted.phone);
    if (extracted.address)    setAddress(extracted.address);
    if (extracted.work?.length)     setWork(extracted.work.filter((w: any) => w.company || w.title));
    if (extracted.education?.degree) setEducation(extracted.education);
    if (extracted.languages?.length) setLanguages(extracted.languages.filter((l: string) => LANGUAGES.includes(l)));
    setSummary(finalSummary);
    setSkills(finalSkills);
    setExperience(finalExperience);
    setSector(finalSector);
    if (finalRoles.length)  setTargetRoles(finalRoles);
    if (finalCerts.length)  setCertifications(finalCerts);

    setProcessStep('done');
    setProcessing(false);
    // Auto-advance to preview
    setTimeout(() => setStep('preview'), 800);
  }

  function capitalize(s: string) {
    return s.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join('-');
  }

  function mapSector(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('btp') || lower.includes('construction') || lower.includes('génie civil')) return 'BTP';
    if (lower.includes('tour') || lower.includes('hôtel') || lower.includes('hospitali')) return 'Tourisme';
    if (lower.includes('agro') || lower.includes('alimentaire') || lower.includes('agriculture')) return 'Agro-alimentaire';
    if (lower.includes('tech') || lower.includes('inform') || lower.includes('numérique') || lower.includes('tic')) return 'Technology';
    if (lower.includes('data') || lower.includes('analyst') || lower.includes('bi')) return 'Data Science';
    if (lower.includes('finance') || lower.includes('banque') || lower.includes('compta') || lower.includes('audit')) return 'Finance';
    if (lower.includes('market') || lower.includes('commercial') || lower.includes('vente')) return 'Marketing';
    if (lower.includes('design') || lower.includes('graphi') || lower.includes('créatif')) return 'Design';
    if (lower.includes('opérat') || lower.includes('logistique') || lower.includes('supply')) return 'Operations';
    if (lower.includes('santé') || lower.includes('médic') || lower.includes('pharmac')) return 'Healthcare';
    return Object.keys(SKILL_SUGGESTIONS).find(k => lower.includes(k.toLowerCase())) || 'Technology';
  }

  async function enhanceSummary() {
    if (enhancing) return;
    setEnhancing(true);
    try {
      const ctx = [
        name && `Nom: ${name}`, experience && `Niveau: ${experience}`, sector && `Secteur: ${sector}`,
        skills.length && `Compétences: ${skills.join(', ')}`,
        work.some(w => w.company) && `Expériences: ${work.filter(w => w.company).map(w => `${w.title} chez ${w.company}`).join('; ')}`,
        education.degree && `Formation: ${education.degree} - ${education.institution}`,
        languages.length && `Langues: ${languages.join(', ')}`,
        summary && `Brouillon: "${summary}"`,
      ].filter(Boolean).join('\n');
      const text = await callAI(
        [{ role: 'user', content: `Rédige un profil professionnel pour ce candidat:\n${ctx}` }],
        `Tu es un expert en recrutement au Maroc. Rédige une accroche professionnelle percutante de 3-4 phrases en français pour un professionnel ${experience} dans le secteur ${sector}. Utilise des verbes d'action forts (développé, piloté, optimisé, géré, coordonné...). Retourne UNIQUEMENT le texte du profil.\n\n${MOROCCO_CONTEXT}`,
        'fast'
      );
      if (text) setSummary(text.trim());
    } catch {}
    setEnhancing(false);
  }

  async function suggestSkillsAI() {
    if (suggestingSkills) return;
    setSuggestingSkills(true);
    try {
      const text = await callAI(
        [{ role: 'user', content: `Suggère 10 compétences clés pour un professionnel ${experience} dans le secteur ${sector} au Maroc. Retourne UNIQUEMENT un tableau JSON comme ["Compétence1","Compétence2",...].` }],
        `Tu es un expert RH au Maroc. Retourne uniquement un tableau JSON de chaînes.\n\n${MOROCCO_CONTEXT}`,
        'fast'
      );
      const m = text.match(/\[[\s\S]*?\]/);
      if (m) {
        const suggested: string[] = JSON.parse(m[0]);
        setSkills(prev => [...prev, ...suggested.filter(s => !prev.includes(s))].slice(0, 16));
      }
    } catch {}
    setSuggestingSkills(false);
  }

  function instantAdapt(job: any): { summary: string; skills: string[] } {
    const jobSkills: string[] = Array.isArray(job.skills) ? job.skills : [];
    const matching = skills.filter(s => jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase())));
    const extra = jobSkills.filter(js => !skills.some(s => s.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(s.toLowerCase())));
    const adaptedSkills = [...matching, ...skills.filter(s => !matching.includes(s)), ...extra.slice(0, 3)].slice(0, 8);
    const top3 = adaptedSkills.slice(0, 3).join(', ');
    const base = summary.trim() || `Professionnel en ${sector} avec un niveau ${experience}`;
    return {
      summary: `Pour le poste de ${job.title} chez ${job.company}, je mets en avant mon expertise en ${top3}. ${base}`,
      skills: adaptedSkills,
    };
  }

  async function adaptCVForJob(job: any) {
    if (adaptingJob) return;
    if (precomputedAdaptations[job.id]) { setAdaptedCV({ jobId: job.id, ...precomputedAdaptations[job.id] }); return; }
    setAdaptingJob(job.id); setAdaptedCV(null);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    try {
      const ctx = `${name || 'Professionnel'} | ${sector} | ${experience}\nCompétences: ${skills.slice(0, 12).join(', ')}\nProfil: ${summary.slice(0, 200)}`;
      const r = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Poste: ${job.title} chez ${job.company} (${job.sector}, ${job.experience})\nRequis: ${(job.skills || []).join(', ')}\nProfil: ${ctx}` }],
          system: `Expert RH Maroc. JSON uniquement: {"summary":"accroche 2-3 phrases avec compétences alignées et verbes d'action","skills":["8 compétences priorisées pour ce poste"]}`,
          task: 'fast', max_tokens: 350,
        }),
        signal: controller.signal,
      });
      clearTimeout(tid);
      const d = await r.json();
      const m = (d.content?.[0]?.text || '').match(/\{[\s\S]*\}/);
      if (m) {
        const p = JSON.parse(m[0]);
        const result = { summary: p.summary || '', skills: Array.isArray(p.skills) ? p.skills : [] };
        setPrecomputedAdaptations(prev => ({ ...prev, [job.id]: result }));
        setAdaptedCV({ jobId: job.id, ...result });
      } else setAdaptedCV({ jobId: job.id, ...instantAdapt(job) });
    } catch {
      clearTimeout(tid);
      setAdaptedCV({ jobId: job.id, ...instantAdapt(job) });
    }
    setAdaptingJob(null);
  }

  function addSkill(sk: string) {
    const s = sk.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  }

  const inp: React.CSSProperties = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111827', background: 'white', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' };
  const skillSugs = SKILL_SUGGESTIONS[sector] || SKILL_SUGGESTIONS.Other;

  // ─── Step indicator ───────────────────────────────────────────────────────
  const STEPS = [
    { key: 'cv' as Step,      n: 1, icon: '📄', label: 'Mon CV' },
    { key: 'preview' as Step, n: 2, icon: '⬇',  label: 'Téléchargement' },
    { key: 'jobs' as Step,    n: 3, icon: '🎯', label: 'Offres d\'emploi' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="TalentMap" subtitle="Espace Candidat" />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/candidate" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
          ← Retour à mon profil
        </Link>

        {/* ── Step bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', background: 'white', borderRadius: '14px', padding: '1.25rem 2rem', border: '1.5px solid #e5e7eb' }}>
          {STEPS.map((s, i) => {
            const active = s.key === step;
            const done = STEPS.findIndex(x => x.key === step) > i;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: done ? '#10b981' : active ? '#2563eb' : '#f3f4f6',
                    color: done || active ? 'white' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: done ? '1rem' : '0.9rem',
                    boxShadow: active ? '0 0 0 4px #dbeafe' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done ? '✓' : s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: active ? '#2563eb' : done ? '#10b981' : '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Étape {s.n}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: active ? 700 : 500, color: active ? '#111827' : done ? '#374151' : '#9ca3af' }}>{s.label}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? '#10b981' : '#e5e7eb', margin: '0 1rem', borderRadius: 1, transition: 'background 0.3s' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════
            STEP 1: Build CV
        ════════════════════════════════════════════════════ */}
        {step === 'cv' && (
          <div>
            {/* Source selector */}
            <div style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
              {[
                { id: 'upload', label: '📁 Téléverser mon CV existant' },
                { id: 'template', label: '✏️ Créer mon CV' },
              ].map(m => (
                <button key={m.id} onClick={() => { setCvSource(m.id as 'upload' | 'template'); setProcessStep('idle'); }} style={{
                  padding: '0.7rem 1.6rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: cvSource === m.id ? '#2563eb' : 'white',
                  color: cvSource === m.id ? 'white' : '#6b7280',
                }}>{m.label}</button>
              ))}
            </div>

            {/* ── Upload option ── */}
            {cvSource === 'upload' && (
              <div>
                {processStep === 'idle' && (
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) analyzeUpload(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed #d1d5db', background: 'white', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) analyzeUpload(f); }} />
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📂</div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Déposez votre CV ici</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>PDF, Word, Image (JPG/PNG)</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: '#fefce8', borderRadius: '9999px', fontSize: '0.82rem', color: '#92400e', fontWeight: 600, marginBottom: '1rem', border: '1px solid #fde68a' }}>
                      🇲🇦 L'Expert RH analyse et optimise automatiquement votre CV pour le marché marocain
                    </div>
                    <br/>
                    <button style={{ padding: '0.7rem 1.75rem', borderRadius: '9px', background: 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                      Choisir un fichier →
                    </button>
                  </div>
                )}

                {/* Processing states */}
                {(processStep === 'reading' || processStep === 'enhancing') && (
                  <div style={{ background: 'white', borderRadius: '16px', padding: '3rem 2rem', border: '1.5px solid #bfdbfe', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {processStep === 'reading' ? '📖' : '🇲🇦'}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                      {processStep === 'reading' ? 'Lecture du CV en cours…' : 'Optimisation pour le marché marocain…'}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      {processStep === 'reading' ? "L'Expert RH extrait vos informations." : 'Adaptation du profil, des compétences et des postes cibles.'}
                    </p>
                    {/* Animated progress bar */}
                    <div style={{ maxWidth: 400, margin: '0 auto', background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#2563eb,#10b981)', borderRadius: 4, width: processStep === 'reading' ? '45%' : '80%', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
                      {[
                        { label: '📖 Extraction', done: processStep === 'enhancing' },
                        { label: '🇲🇦 Optimisation', done: false },
                        { label: '✅ CV prêt', done: false },
                      ].map((s, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', fontWeight: 600, color: s.done ? '#10b981' : (processStep === 'reading' && i === 0) || (processStep === 'enhancing' && i === 1) ? '#2563eb' : '#9ca3af' }}>
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {processStep === 'done' && (
                  <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '2rem', border: '1.5px solid #86efac', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d', marginBottom: '0.25rem' }}>CV analysé et optimisé !</h3>
                    <p style={{ color: '#166534', fontSize: '0.875rem' }}>Redirection vers le téléchargement…</p>
                  </div>
                )}

                {processStep === 'error' && (
                  <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '2rem', border: '1.5px solid #fecaca', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❌</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>Impossible d'analyser ce fichier</h3>
                    <button onClick={() => setProcessStep('idle')} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Template form ── */}
            {cvSource === 'template' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Personal info */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>👤 Informations personnelles</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Nom complet', val: name, set: setName, ph: 'Votre nom complet' },
                      { label: 'Email', val: email, set: setEmail, ph: 'email@exemple.com' },
                      { label: 'Téléphone', val: phone, set: setPhone, ph: '+212 6 XX XX XX XX' },
                      { label: 'Adresse / Ville', val: address, set: setAddress, ph: 'Casablanca, Maroc' },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label}><label style={lbl}>{label}</label><input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inp} /></div>
                    ))}
                    <div><label style={lbl}>Numéro CIN</label><input value={user.idNumber} readOnly style={{ ...inp, background: '#f3f4f6', color: '#6b7280' }} /></div>
                  </div>
                </div>

                {/* Experience + Sector */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>💼 Expérience & Secteur</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={lbl}>Niveau d'expérience</label>
                      <select value={experience} onChange={e => setExperience(e.target.value)} style={inp}>
                        {['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Secteur</label>
                      <select value={sector} onChange={e => setSector(e.target.value)} style={inp}>
                        {Object.keys(SKILL_SUGGESTIONS).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>📝 Profil professionnel</h2>
                    <button onClick={enhanceSummary} disabled={enhancing} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: enhancing ? '#f3f4f6' : '#eff6ff', color: enhancing ? '#9ca3af' : '#1d4ed8', border: '1.5px solid #bfdbfe', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      {enhancing ? '⟳ Rédaction…' : '✨ Générer avec l\'IA'}
                    </button>
                  </div>
                  <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Cliquez sur '✨ Générer avec l'IA' ou rédigez votre accroche…" rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                {/* Work */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>🏢 Expériences professionnelles</h2>
                    {work.length < 4 && <button onClick={() => setWork(p => [...p, { company: '', title: '', startDate: '', endDate: '', description: '' }])} style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Ajouter</button>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {work.map((w, i) => (
                      <div key={i} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #2563eb' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div><label style={lbl}>Entreprise</label><input value={w.company} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, company: e.target.value } : x))} placeholder="Nom de l'entreprise" style={inp} /></div>
                          <div><label style={lbl}>Poste</label><input value={w.title} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))} placeholder="Votre rôle" style={inp} /></div>
                          <div><label style={lbl}>Début</label><input value={w.startDate} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, startDate: e.target.value } : x))} placeholder="Jan 2022" style={inp} /></div>
                          <div><label style={lbl}>Fin</label><input value={w.endDate} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, endDate: e.target.value } : x))} placeholder="Présent" style={inp} /></div>
                        </div>
                        <div><label style={lbl}>Réalisations</label><textarea value={w.description} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, description: e.target.value } : x))} placeholder="Vos principales réalisations avec des verbes d'action et des chiffres…" rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>🎓 Formation</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div><label style={lbl}>Diplôme</label><input value={education.degree} onChange={e => setEducation(p => ({ ...p, degree: e.target.value }))} placeholder="Licence, Master, OFPPT…" style={inp} /></div>
                    <div><label style={lbl}>Établissement</label><input value={education.institution} onChange={e => setEducation(p => ({ ...p, institution: e.target.value }))} placeholder="Université, École…" style={inp} /></div>
                    <div><label style={lbl}>Année</label><input value={education.year} onChange={e => setEducation(p => ({ ...p, year: e.target.value }))} placeholder="2022" style={inp} /></div>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>⚡ Compétences</h2>
                    <button onClick={suggestSkillsAI} disabled={suggestingSkills} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: suggestingSkills ? '#f3f4f6' : '#eff6ff', color: suggestingSkills ? '#9ca3af' : '#1d4ed8', border: '1.5px solid #bfdbfe', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      {suggestingSkills ? '⟳ Suggestions…' : '✨ Suggérer (IA)'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} placeholder="Tapez une compétence + Entrée" style={{ ...inp, flex: 1 }} />
                    <button onClick={() => addSkill(skillInput)} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {skills.map(s => (
                      <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '9999px', padding: '0.28rem 0.75rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                        {s}<button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {skillSugs.filter(s => !skills.includes(s)).map(s => (
                      <button key={s} onClick={() => addSkill(s)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ {s}</button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>🌐 Langues</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {LANGUAGES.map(l => (
                      <button key={l} onClick={() => setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])} style={{ padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: languages.includes(l) ? '#065f46' : '#f0fdf4', color: languages.includes(l) ? 'white' : '#065f46', border: `1.5px solid ${languages.includes(l) ? '#065f46' : '#bbf7d0'}` }}>
                        {LANG_FLAGS[l] || ''} {languages.includes(l) ? '✓ ' : ''}{l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>🏅 Certifications <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#6b7280' }}>recommandées ou obtenues</span></h2>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <input id="certIn" placeholder="PMP, AWS, CIMA…" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const v = (e.target as HTMLInputElement).value.trim(); if (v && !certifications.includes(v)) { setCertifications(p => [...p, v]); (e.target as HTMLInputElement).value = ''; } } }} style={{ ...inp, flex: 1 }} />
                    <button onClick={() => { const el = document.getElementById('certIn') as HTMLInputElement; const v = el?.value.trim(); if (v && !certifications.includes(v)) { setCertifications(p => [...p, v]); el.value = ''; } }} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {certifications.map(c => (
                      <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fefce8', color: '#713f12', borderRadius: '9999px', padding: '0.28rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #fde68a' }}>
                        🏅 {c}<button onClick={() => setCertifications(p => p.filter(x => x !== c))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: '0.9rem' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setStep('preview')}
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Générer mon CV optimisé →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 2: Preview + PDF Download
        ════════════════════════════════════════════════════ */}
        {step === 'preview' && (
          <div>
            {/* Success banner */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.2rem' }}>🎉</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1rem', marginBottom: '0.25rem' }}>Votre CV est optimisé pour le marché marocain !</div>
                <div style={{ fontSize: '0.84rem', color: '#166534' }}>
                  {targetRoles.length > 0 && <span>Postes cibles : {targetRoles.join(', ')} · </span>}
                  {skills.length > 0 && <span>{skills.length} compétences · </span>}
                  {experience} · {sector}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={downloadPDF}
                style={{ flex: '1 1 auto', minWidth: 200, padding: '1rem 2rem', borderRadius: '10px', background: 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(37,99,235,.35)' }}>
                ⬇ Télécharger en PDF
              </button>
              <button
                onClick={() => setStep('jobs')}
                style={{ flex: '1 1 auto', minWidth: 200, padding: '1rem 2rem', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(16,185,129,.3)' }}>
                🎯 Voir les offres d'emploi →
              </button>
              <button
                onClick={() => setStep('cv')}
                style={{ padding: '1rem 1.5rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                ✏️ Modifier
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              💡 Dans la boîte de dialogue d'impression, sélectionnez <strong>"Enregistrer en PDF"</strong> comme imprimante pour obtenir le fichier PDF.
            </p>

            {/* CV Preview */}
            <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.12)', border: '1px solid #e5e7eb' }}>
              <div style={{ background: 'linear-gradient(135deg,#0a1f5c,#2563eb)', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>👁 Aperçu de votre CV</span>
                <button
                  onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(cvHtml); w.document.close(); } }}
                  style={{ padding: '0.35rem 0.9rem', borderRadius: '7px', border: '1.5px solid rgba(255,255,255,.35)', background: 'transparent', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  ↗ Plein écran
                </button>
              </div>
              <iframe srcDoc={cvHtml} title="Aperçu CV" style={{ width: '100%', height: '900px', border: 'none', display: 'block' }} sandbox="allow-same-origin" />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 3: Job matches
        ════════════════════════════════════════════════════ */}
        {step === 'jobs' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>🎯 Offres adaptées à votre profil</h1>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.2rem' }}>{experience} · {sector} · {skills.length} compétences détectées</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep('preview')} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>← Mon CV</button>
                <button onClick={downloadPDF} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>⬇ PDF</button>
              </div>
            </div>

            {(() => {
              const openJobs = coordJobs.filter(j => j.status === 'Open');
              if (!openJobs.length) return (
                <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', border: '1.5px solid #e5e7eb' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Aucune offre disponible pour le moment</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Revenez bientôt — de nouvelles offres sont ajoutées régulièrement.</p>
                  <Link href="/jobs" style={{ display: 'inline-block', marginTop: '1.25rem', padding: '0.65rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Voir toutes les offres →</Link>
                </div>
              );
              const matches = openJobs
                .map(j => ({ ...j, score: computeMatch({ skills, sector, experience }, j) }))
                .sort((a, b) => b.score - a.score);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {matches.map(j => {
                    const isAdapting = adaptingJob === j.id;
                    const hasAdapted = adaptedCV?.jobId === j.id;
                    const scoreColor = j.score >= 70 ? '#15803d' : j.score >= 45 ? '#92400e' : '#6b7280';
                    const scoreBg    = j.score >= 70 ? '#f0fdf4' : j.score >= 45 ? '#fefce8' : '#f9fafb';
                    const scoreBorder = j.score >= 70 ? '#86efac' : j.score >= 45 ? '#fde68a' : '#e5e7eb';
                    return (
                      <div key={j.id} style={{ background: 'white', borderRadius: '14px', border: `1.5px solid ${scoreBorder}`, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: scoreBg }}>
                          {/* Score circle */}
                          <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, background: j.score >= 70 ? '#22c55e' : j.score >= 45 ? '#eab308' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>
                            {j.score}%
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{j.title}</div>
                            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.15rem' }}>
                              {j.company} · {j.sector} · {j.experience}
                              {j.location ? ` · 📍 ${j.location}` : ''}
                            </div>
                            {j.salary && <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '0.15rem' }}>💰 {j.salary}</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                            <button
                              onClick={() => adaptCVForJob(j)}
                              disabled={!!adaptingJob}
                              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: isAdapting ? '#e5e7eb' : '#2563eb', color: isAdapting ? '#9ca3af' : 'white', fontWeight: 700, fontSize: '0.8rem', cursor: adaptingJob ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                              {isAdapting ? '⟳ Adaptation…' : hasAdapted ? '✓ Adapté' : '✨ Adapter mon CV'}
                            </button>
                          </div>
                        </div>

                        {j.skills?.length > 0 && (
                          <div style={{ padding: '0.6rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            {j.skills.map((s: string) => {
                              const matched = skills.some(cs => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()));
                              return <span key={s} style={{ padding: '0.12rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: matched ? '#eff6ff' : '#f3f4f6', color: matched ? '#1d4ed8' : '#9ca3af', border: `1px solid ${matched ? '#bfdbfe' : '#e5e7eb'}` }}>{matched ? '✓ ' : ''}{s}</span>;
                            })}
                          </div>
                        )}

                        {hasAdapted && adaptedCV && (
                          <div style={{ padding: '1.1rem 1.25rem', background: '#f0f9ff', borderTop: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>👔 Version CV adaptée par l'Expert RH</div>
                            <p style={{ fontSize: '0.84rem', color: '#374151', lineHeight: 1.65, marginBottom: '0.65rem', fontStyle: 'italic' }}>{adaptedCV.summary}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                              {adaptedCV.skills.map(s => <span key={s} style={{ padding: '0.18rem 0.65rem', borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>{s}</span>)}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button
                                onClick={() => { setSummary(adaptedCV.summary); setSkills(adaptedCV.skills); setAdaptedCV(null); setStep('preview'); }}
                                style={{ padding: '0.5rem 1.1rem', borderRadius: '7px', background: '#0369a1', color: 'white', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                                Appliquer & régénérer le CV →
                              </button>
                              <button onClick={() => setAdaptedCV(null)} style={{ padding: '0.5rem 1rem', borderRadius: '7px', border: '1.5px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '9px', border: '1.5px solid #2563eb', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                      Voir toutes les offres publiées →
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
