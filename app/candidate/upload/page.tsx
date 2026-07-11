'use client';

import { useState, useRef, useEffect } from 'react';
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

const LANGUAGES = ['Arabe', 'Français', 'Anglais', 'Espagnol', 'Allemand', 'Néerlandais', 'Italien', 'Darija', 'Portugais'];

const MOROCCO_CONTEXT = `MARCHÉ DE L'EMPLOI MAROCAIN — CONTEXTE EXPERT:
Secteurs porteurs: BTP/Immobilier, Industrie automobile (Renault-Nissan Tanger, PSA Kénitra), Textile/Habillement (Inditex, H&M sous-traitance), Tourisme (hôtellerie 5*, guides), Agro-alimentaire (OCP, Centrale Danone, Cosumar), Numérique/TIC (CBI, IBM Maroc, Capgemini), Banque/Finance (Attijariwafa Bank, BMCE Bank, Banque Populaire, CIH, BMCI), Énergie renouvelable (MASEN, IRESEN, Nareva), Santé.
Diplômes reconnus au Maroc: Baccalauréat, DUT/BTS/DEUST (Bac+2), Licence professionnelle (Bac+3), Master/MBA (Bac+5), Doctorat, Diplômes OFPPT (TSGE, TSI, TH, TC, TP...), Grandes écoles (EHTP, EMI, ENSAM, ENSA, ENCG, ISCAE, HEM, ENAM, Polytechnique).
Langues: Français (langue professionnelle dominante), Arabe classique (obligatoire dans la fonction publique), Anglais (exigé dans le numérique et les multinationales), Darija (communication informelle), Espagnol (nord du Maroc, tourisme).
Compétences transversales recherchées: Suite Office (Excel avancé, PowerPoint), ERP (SAP/SAGE/Microsoft Dynamics), langues étrangères, certifications sectorielles (PMP, CIMA, CFA, CISCO, Microsoft...).
Format CV marocain idéal: sobre et professionnel, rédigé en français, 1-2 pages max, avec photo recommandée, état civil complet (CIN, situation familiale, date de naissance), accroche/objectif professionnel en entête, expériences en ordre chronologique inverse, compétences techniques et linguistiques clairement listées.
Villes principales: Casablanca (hub économique), Rabat (administration/institutions), Marrakech (tourisme/immobilier), Fès/Meknès (industrie), Tanger/Tétouan (industrie automobile/textile), Agadir (tourisme/pêche), Oujda (Oriental).`;

interface WorkEntry { company: string; title: string; startDate: string; endDate: string; description: string; }
interface AnalyzedFile {
  name: string; skills: string[]; experience: string; summary: string; sector: string;
  status: 'analyzing' | 'enhancing' | 'done' | 'error';
  targetRoles?: string[]; certifications?: string[];
}

function generateCVHtml(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[];
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html>
<html lang="fr">
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
.pill.role{background:#fefce8;color:#854d0e;border-color:#fef08a}
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
      ${data.idNumber ? `<span>🪪 CIN: ${data.idNumber}</span>` : ''}
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${data.summary}</p></div>` : ''}
      ${data.work.some(w => w.company) ? `
      <div class="sec">
        <div class="sec-title">Expériences Professionnelles</div>
        ${data.work.filter(w => w.company).map(w => `
        <div class="entry">
          <h4>${w.title || 'Poste'}</h4>
          <div class="meta">${w.company}${w.startDate ? ' &bull; ' + w.startDate : ''}${w.endDate ? ' – ' + w.endDate : w.startDate ? ' – Présent' : ''}</div>
          ${w.description ? `<p>${w.description}</p>` : ''}
        </div>`).join('')}
      </div>` : ''}
      ${data.education.degree ? `
      <div class="sec">
        <div class="sec-title">Formation</div>
        <div class="entry">
          <h4>${data.education.degree}</h4>
          <div class="meta">${data.education.institution}${data.education.year ? ' &bull; ' + data.education.year : ''}</div>
        </div>
      </div>` : ''}
      ${data.targetRoles?.length ? `
      <div class="sec">
        <div class="sec-title">Postes Recherchés</div>
        <div class="pills">${data.targetRoles.map(r => `<span class="pill role">${r}</span>`).join('')}</div>
      </div>` : ''}
    </div>
    <div class="side">
      ${data.skills.length ? `
      <div class="sec">
        <div class="sec-title">Compétences</div>
        <div class="pills">${data.skills.map(s => `<span class="pill">${s}</span>`).join('')}</div>
      </div>` : ''}
      ${data.languages.length ? `
      <div class="sec">
        <div class="sec-title">Langues</div>
        <div class="pills">${data.languages.map(l => `<span class="pill lang">${l}</span>`).join('')}</div>
      </div>` : ''}
      <div class="sec">
        <div class="sec-title">Niveau d'Expérience</div>
        <span class="badge">${data.experience}</span>
      </div>
    </div>
  </div>
  <div class="footer">Généré par TalentMap AI — Optimisé marché marocain &bull; ${today}</div>
</div>
</body>
</html>`;
}

async function callAI(messages: { role: string; content: string }[], system: string, task = 'fast', maxTokens = 900) {
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
  const [mode, setMode] = useState<'upload' | 'template'>('template');

  // Upload state
  const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);

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
  const [targetRoles, setTargetRoles] = useState<string[]>([]);

  // AI state
  const [enhancing, setEnhancing] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoEnhanced, setAutoEnhanced] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'candidate') { router.push('/login'); return; }
    setName(user.name);
    setEmail(user.email);
  }, [user, router]);

  if (!user || user.role !== 'candidate') return null;

  // ── AI: enhance summary (Morocco-aware) ──────────────────────
  async function enhanceSummary() {
    if (enhancing) return;
    setEnhancing(true);
    try {
      const ctx = [
        name && `Nom: ${name}`,
        experience && `Niveau: ${experience}`,
        sector && `Secteur: ${sector}`,
        skills.length && `Compétences: ${skills.join(', ')}`,
        work.some(w => w.company) && `Expériences: ${work.filter(w => w.company).map(w => `${w.title} chez ${w.company}`).join('; ')}`,
        education.degree && `Formation: ${education.degree} - ${education.institution}`,
        languages.length && `Langues: ${languages.join(', ')}`,
        summary && `Brouillon actuel: "${summary}"`,
      ].filter(Boolean).join('\n');

      const text = await callAI(
        [{ role: 'user', content: `Rédige un profil professionnel pour ce candidat:\n${ctx}` }],
        `Tu es un expert en recrutement au Maroc. Rédige un accroche professionnelle percutante de 3-4 phrases en français pour un professionnel ${experience} dans le secteur ${sector}, adapté au marché marocain. Utilise des verbes d'action forts (développé, piloté, optimisé, géré, coordonné...). Sois spécifique et orienté résultats. Retourne UNIQUEMENT le texte du profil, sans guillemets ni labels.\n\n${MOROCCO_CONTEXT}`,
        'fast'
      );
      if (text) setSummary(text.trim());
    } catch {}
    setEnhancing(false);
  }

  // ── AI: suggest skills (Morocco-aware) ──────────────────────
  async function suggestSkillsAI() {
    if (suggestingSkills) return;
    setSuggestingSkills(true);
    try {
      const text = await callAI(
        [{ role: 'user', content: `Suggère 10 compétences clés pour un professionnel ${experience} dans le secteur ${sector} au Maroc. Retourne UNIQUEMENT un tableau JSON comme ["Compétence1","Compétence2",...]. Aucune explication.` }],
        `Tu es un expert RH au Maroc. Fournis des compétences pertinentes pour le marché marocain. Retourne uniquement un tableau JSON de chaînes de caractères.\n\n${MOROCCO_CONTEXT}`,
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

  // ── AI: full Morocco-market enhancement (auto-triggered after upload) ──
  async function enhanceCVForMorocco(
    extracted: { sector: string; experience: string; skills: string[]; summary: string },
    rawContent: string,
    fileName: string
  ) {
    try {
      const text = await callAI(
        [{
          role: 'user',
          content: `Données extraites du CV:\nFichier: ${fileName}\nSecteur: ${extracted.sector}\nNiveau: ${extracted.experience}\nCompétences: ${extracted.skills.join(', ')}\nRésumé: ${extracted.summary}\n\nContenu brut: ${rawContent.slice(0, 1500)}`,
        }],
        `Tu es un expert en recrutement et rédaction de CV pour le marché marocain avec 15 ans d'expérience.

${MOROCCO_CONTEXT}

Analyse et améliore ce CV pour le rendre compétitif sur le marché de l'emploi marocain. Retourne UNIQUEMENT ce JSON valide (sans markdown):
{
  "summary": "Profil professionnel 3-4 phrases en français, orienté marché marocain, verbes d'action forts, chiffres si possible",
  "skills": ["10 compétences pertinentes pour le marché marocain dans ce secteur"],
  "sector": "secteur précis parmi les secteurs porteurs du Maroc",
  "experience": "entry-level|junior|mid-level|senior|lead",
  "targetRoles": ["3 postes cibles réalistes sur le marché marocain"],
  "certifications": ["2-3 certifications recommandées pour booster l'employabilité au Maroc"],
  "workEnhancement": "Suggestion d'une phrase pour améliorer la description des expériences professionnelles (verbes d'action, résultats chiffrés)"
}`,
        'json',
        1200
      );

      const m = text.match(/\{[\s\S]*\}/);
      if (!m) return null;
      return JSON.parse(m[0]) as {
        summary: string; skills: string[]; sector: string; experience: string;
        targetRoles: string[]; certifications: string[]; workEnhancement: string;
      };
    } catch {
      return null;
    }
  }

  // ── AI: analyze uploaded file + auto-enhance for Morocco ────
  async function analyzeFile(file: File) {
    const entry: AnalyzedFile = { name: file.name, skills: [], experience: '', summary: '', sector: '', status: 'analyzing' };
    setAnalyzedFiles(prev => [...prev, entry]);

    // Read content (text files only; binary files pass filename + size)
    let rawContent = '';
    try {
      if (file.type === 'text/plain') {
        rawContent = await file.text();
      } else {
        rawContent = `Fichier: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }
    } catch {
      rawContent = file.name;
    }

    // Step 1 — Extract basic info
    let extracted: { sector: string; experience: string; skills: string[]; summary: string } | null = null;
    try {
      const text = await callAI(
        [{ role: 'user', content: `Analyse ce CV et extrait les informations:\nFichier: ${file.name}\n${rawContent.slice(0, 2000)}` }],
        `Tu es un expert RH. Extrait les informations du CV et retourne UNIQUEMENT ce JSON (sans markdown):\n{"sector":"secteur professionnel principal","experience":"entry-level|junior|mid-level|senior|lead","skills":["competence1","competence2","competence3","competence4","competence5"],"summary":"résumé professionnel 2 phrases"}\nSi le fichier est binaire ou illisible, fais des estimations intelligentes basées sur le nom du fichier.`,
        'json'
      );
      const m = text.match(/\{[\s\S]*\}/);
      if (m) extracted = JSON.parse(m[0]);
    } catch {}

    if (!extracted) {
      setAnalyzedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error' } : f));
      return;
    }

    // Update UI: extraction done, now enhancing
    setAnalyzedFiles(prev => prev.map(f =>
      f.name === file.name ? { ...f, ...extracted, status: 'enhancing' } : f
    ));

    // Step 2 — Enhance for Moroccan market
    const enhanced = await enhanceCVForMorocco(extracted, rawContent, file.name);

    const finalSkills   = enhanced?.skills?.length   ? enhanced.skills   : extracted.skills;
    const finalSummary  = enhanced?.summary           ? enhanced.summary  : extracted.summary;
    const finalExperience = enhanced?.experience      ? enhanced.experience : extracted.experience;
    const finalSector   = enhanced?.sector            ? enhanced.sector   : extracted.sector;
    const finalRoles    = enhanced?.targetRoles       || [];
    const finalCerts    = enhanced?.certifications    || [];

    // Mark file as done with full enhanced data
    setAnalyzedFiles(prev => prev.map(f =>
      f.name === file.name
        ? { ...f, skills: finalSkills, summary: finalSummary, experience: finalExperience, sector: finalSector, targetRoles: finalRoles, certifications: finalCerts, status: 'done' }
        : f
    ));

    // Step 3 — Auto-populate template form and switch to it
    setSummary(finalSummary);
    setSkills(finalSkills);
    setExperience(capitalize(finalExperience));
    setSector(mapSector(finalSector));
    if (finalRoles.length) setTargetRoles(finalRoles);
    setAutoEnhanced(true);
    setMode('template');
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
    const sectorKeys = Object.keys(SKILL_SUGGESTIONS);
    const match = sectorKeys.find(k => lower.includes(k.toLowerCase()));
    return match || 'Other';
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
      summary, skills, languages, experience, sector, work, education, targetRoles,
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

  const statusLabel: Record<AnalyzedFile['status'], string> = {
    analyzing: '🤖 Lecture du CV en cours…',
    enhancing: '🇲🇦 Optimisation pour le marché marocain…',
    done: 'CV amélioré et prêt',
    error: 'Analyse impossible',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PageHeader title="TalentMap" subtitle="Espace Candidat" />

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/candidate" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
          ← Retour à mon profil
        </Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Construire votre CV</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Déposez votre CV existant — l'IA l'améliore automatiquement pour le marché marocain, ou remplissez le formulaire.</p>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content' }}>
          {[{ id: 'upload', label: '📁 Déposer mon CV' }, { id: 'template', label: '✏️ Remplir le formulaire' }].map(m => (
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>Déposez votre CV ici ou cliquez pour parcourir</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>PDF, Word, TXT, JPG, PNG</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: '#fefce8', borderRadius: '9999px', fontSize: '0.82rem', color: '#92400e', fontWeight: 600, marginBottom: '0.75rem', border: '1px solid #fde68a' }}>
                🇲🇦 IA optimisée pour le marché marocain — extraction + amélioration automatique
              </div>
              <br/>
              <button style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Choisir un fichier</button>
            </div>

            {analyzedFiles.length > 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                  {analyzedFiles.length} fichier{analyzedFiles.length > 1 ? 's' : ''} — Traitement IA en cours
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analyzedFiles.map((f, i) => (
                    <div key={i} style={{
                      padding: '1rem 1.25rem', borderRadius: '12px',
                      background: f.status === 'done' ? '#f0fdf4' : f.status === 'error' ? '#fef2f2' : f.status === 'enhancing' ? '#fefce8' : '#f8fafc',
                      border: `1.5px solid ${f.status === 'done' ? '#bbf7d0' : f.status === 'error' ? '#fecaca' : f.status === 'enhancing' ? '#fde68a' : '#e5e7eb'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: f.status === 'done' ? '0.75rem' : 0 }}>
                        <span style={{ fontSize: '1.4rem' }}>
                          {f.status === 'analyzing' ? '⏳' : f.status === 'enhancing' ? '🇲🇦' : f.status === 'done' ? '✅' : '❌'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{f.name}</div>
                          <div style={{ fontSize: '0.75rem', color: f.status === 'enhancing' ? '#92400e' : '#6b7280', fontWeight: f.status === 'enhancing' ? 600 : 400 }}>
                            {f.status === 'done'
                              ? `${f.sector} · ${f.experience} — CV professionnel prêt ✨`
                              : statusLabel[f.status]}
                          </div>
                        </div>
                        {f.status === 'done' && (
                          <button
                            onClick={() => setMode('template')}
                            style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Voir le CV →
                          </button>
                        )}
                      </div>

                      {/* Steps progress */}
                      {(f.status === 'analyzing' || f.status === 'enhancing') && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                          {[
                            { label: 'Extraction', done: f.status !== 'analyzing' },
                            { label: 'Optimisation Maroc', done: f.status === 'done' },
                            { label: 'CV prêt', done: f.status === 'done' },
                          ].map((step, si) => (
                            <div key={si} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: step.done ? '#22c55e' : (si === 0 && f.status === 'enhancing') || (si === 1 && f.status === 'enhancing') ? '#2563eb' : '#e5e7eb' }}/>
                              <span style={{ fontSize: '0.65rem', color: step.done ? '#15803d' : '#9ca3af', fontWeight: step.done ? 600 : 400 }}>{step.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {f.status === 'done' && (
                        <>
                          {f.summary && <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, marginBottom: '0.5rem', fontStyle: 'italic' }}>{f.summary}</p>}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: f.targetRoles?.length ? '0.5rem' : 0 }}>
                            {f.skills?.map(s => (
                              <span key={s} style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>{s}</span>
                            ))}
                          </div>
                          {f.targetRoles?.length ? (
                            <div style={{ marginTop: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Postes cibles identifiés: </span>
                              {f.targetRoles.map(r => (
                                <span key={r} style={{ marginLeft: '0.35rem', padding: '0.15rem 0.6rem', borderRadius: '9999px', background: '#fefce8', color: '#854d0e', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #fef08a' }}>{r}</span>
                              ))}
                            </div>
                          ) : null}
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

            {/* Auto-enhanced banner */}
            {autoEnhanced && (
              <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#f0fdf4', border: '1.5px solid #86efac', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🇲🇦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem', marginBottom: '0.2rem' }}>CV amélioré automatiquement pour le marché marocain ✅</div>
                  <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                    Résumé professionnel, compétences et postes cibles ont été optimisés. Complétez vos informations personnelles et expériences ci-dessous.
                  </div>
                  {targetRoles.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>Postes cibles: </span>
                      {targetRoles.map(r => <span key={r} style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', background: 'white', color: '#854d0e', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #fde68a' }}>{r}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => setAutoEnhanced(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1.1rem', cursor: 'pointer', flexShrink: 0 }}>×</button>
              </div>
            )}

            {/* Personal Info */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Informations personnelles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Nom complet', val: name, set: setName, ph: 'Votre nom complet' },
                  { label: 'Email', val: email, set: setEmail, ph: 'email@exemple.com' },
                  { label: 'Téléphone', val: phone, set: setPhone, ph: '+212 6 XX XX XX XX' },
                  { label: 'Adresse', val: address, set: setAddress, ph: 'Ville, Maroc' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={lbl}>{label}</label>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inp} />
                  </div>
                ))}
                <div>
                  <label style={lbl}>Numéro CIN</label>
                  <input value={user.idNumber} readOnly style={{ ...inp, background: '#f3f4f6', color: '#6b7280' }} />
                </div>
              </div>
            </div>

            {/* Experience + Sector */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Expérience & Secteur</h2>
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

            {/* Summary with AI enhance */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Profil professionnel</h2>
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
                    ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Rédaction…</>
                    : '✨ Améliorer avec l\'IA'}
                </button>
              </div>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Cliquez sur '✨ Améliorer avec l'IA' pour générer un profil professionnel adapté au marché marocain, ou saisissez le vôtre…"
                rows={4}
                style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>

            {/* Work Experience */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Expériences professionnelles</h2>
                {work.length < 4 && (
                  <button
                    onClick={() => setWork(p => [...p, { company: '', title: '', startDate: '', endDate: '', description: '' }])}
                    style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    + Ajouter une expérience
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {work.map((w, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #2563eb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div><label style={lbl}>Entreprise</label><input value={w.company} onChange={e => updateWork(i, 'company', e.target.value)} placeholder="Nom de l'entreprise" style={inp} /></div>
                      <div><label style={lbl}>Poste</label><input value={w.title} onChange={e => updateWork(i, 'title', e.target.value)} placeholder="Votre rôle" style={inp} /></div>
                      <div><label style={lbl}>Début</label><input value={w.startDate} onChange={e => updateWork(i, 'startDate', e.target.value)} placeholder="Jan 2022" style={inp} /></div>
                      <div><label style={lbl}>Fin</label><input value={w.endDate} onChange={e => updateWork(i, 'endDate', e.target.value)} placeholder="Présent" style={inp} /></div>
                    </div>
                    <div>
                      <label style={lbl}>Réalisations & responsabilités</label>
                      <textarea value={w.description} onChange={e => updateWork(i, 'description', e.target.value)} placeholder="Décrivez vos principales réalisations avec des verbes d'action et des chiffres (ex: Piloté une équipe de 5 personnes, optimisé les coûts de 20%…)" rows={2} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Formation</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><label style={lbl}>Diplôme</label><input value={education.degree} onChange={e => setEducation(p => ({ ...p, degree: e.target.value }))} placeholder="Licence en Informatique, Master…" style={inp} /></div>
                <div><label style={lbl}>Établissement</label><input value={education.institution} onChange={e => setEducation(p => ({ ...p, institution: e.target.value }))} placeholder="Université, École…" style={inp} /></div>
                <div><label style={lbl}>Année</label><input value={education.year} onChange={e => setEducation(p => ({ ...p, year: e.target.value }))} placeholder="2020" style={inp} /></div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Compétences</h2>
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
                  {suggestingSkills ? '⟳ Suggestions…' : '🤖 Suggérer (Maroc)'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                  placeholder="Tapez une compétence et appuyez sur Entrée" style={{ ...inp, flex: 1 }} />
                <button onClick={() => addSkill(skillInput)} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Ajouter</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '9999px', padding: '0.28rem 0.75rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                    {s}
                    <button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Ajout rapide:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {suggestions.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Langues</h2>
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
                ⬇ Télécharger le CV (HTML)
              </button>
              <button
                onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '9px', border: '1.5px solid #2563eb', background: 'white', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                💾 Sauvegarder
              </button>
              {saved && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>✓ Profil sauvegardé !</span>}
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#9ca3af' }}>
                Ouvrez le fichier .html dans votre navigateur, puis Ctrl+P → Enregistrer en PDF
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
