'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import Icon, { type IconName } from '../../components/Icon';

/* ── Design tokens (TALENTMAP.md) ───────────────────────────────────────
 * Light theme per the spec's Brand Gradient / Score & Role Badge systems.
 * Token names are kept so every existing usage site below inherits the
 * correct spec value automatically — only the values changed, not the
 * shape of the file.
 */
const INK    = '#0a1f5c';   // Navy — brand accents, "Full report" tile
const COBALT = '#1d4ed8';   // Primary accent — CTAs, buttons (blue-700)
const NAVY   = '#0a1f5c';   // Heading text on cards
const BLUE   = '#2563eb';   // Secondary accent — links, active states (blue-600)
const LBLUE  = '#eff6ff';   // Blue tint — chip/badge backgrounds (blue-50)
const MIST   = '#dbeafe';   // Stronger blue tint (blue-100)
const BG     = '#f9fafb';   // Page background (gray-50)
const WHITE  = '#ffffff';   // Card/surface background
const BORDER = '#e5e7eb';   // Divider (gray-200)
const BORDER2= '#d1d5db';   // Stronger border (gray-300)
const TEXT   = '#111827';   // Primary body text (gray-900)
const TEXT2  = '#374151';   // Secondary body text (gray-700)
const MUTED  = '#6b7280';   // Muted label text (gray-500)
const FAINT  = '#9ca3af';   // Faint/placeholder text (gray-400)
const GREEN  = '#10b981';   // Success
const LGREEN = '#d1fae5';   // "Excellent" badge bg
const GTEXT  = '#065f46';   // "Excellent" badge text
const RED    = '#ef4444';   // Danger
const LRED   = '#fee2e2';   // "Poor" badge bg
const RTEXT  = '#991b1b';   // "Poor" badge text
const AMBER  = '#f59e0b';   // Warning
const LAMBER = '#fef3c7';   // Admin role badge bg
const ATEXT  = '#92400e';   // Admin role badge text
const PURPLE = '#7c3aed';   // Admin role color
const LPURP  = '#ede9fe';   // Light purple tint
const PTEXT  = '#4c1d95';   // Purple text on light purple tint

/* ── Helpers ── */
// Coordinator code shape: NAME + COR + 4 digits (e.g. BENALICOR4821) — mirrors
// the same name+role-suffix convention used for coordinator codes elsewhere.
function genCode(name: string): string {
  const base = name.trim().toUpperCase().split(/\s+/).pop()?.slice(0, 6).replace(/[^A-Z]/g, '') || 'COR';
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${base}COR${digits}`;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ── AI generator — read any file, any format ────────────────────────────
 * Images go to the AI as vision input; everything else (PDF, Word, text, or
 * any other format) goes through the shared /api/extract-text route, which
 * does real extraction for PDF/DOCX and a plain UTF-8 decode otherwise —
 * same approach already proven on the candidate and coordinator upload
 * pages, reused here instead of re-deriving it.
 */
type AIMsgContent = string | Array<{ type: string; [key: string]: unknown }>;

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function extractFileText(file: File): Promise<string> {
  try {
    const fileBase64 = await fileToBase64(file);
    const r = await fetch('/api/extract-text', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64 }),
    });
    const d = await r.json();
    return (d.text || '') as string;
  } catch { return ''; }
}

async function buildGenAiContent(file: File): Promise<AIMsgContent> {
  if (file.type.startsWith('image/')) {
    const dataUrl: string = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target?.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(',')[1];
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
    return [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
      { type: 'text', text: 'Analyse ce CV (image).' },
    ];
  }
  const text = await extractFileText(file);
  if (text.trim().length > 60) return `Analyse ce CV (contenu extrait):\n\nFichier: ${file.name}\n\n${text.slice(0, 6000)}`;
  return `[CV: "${file.name}" — contenu non lisible automatiquement]`;
}

function parseGenJ(txt: string): any {
  try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

// Both prompts share one non-negotiable rule: never fabricate a contact
// field. A CV genuinely omitting a phone number stays blank — it must
// never be "filled in" with a plausible-looking but fake one, since that
// field could end up driving real outreach to a real person.
const GEN_CV_SYSTEM = `Tu es un expert RH marocain. Analyse ce CV et extrait UNIQUEMENT les informations réellement présentes dans le document.
Retourne UNIQUEMENT ce JSON valide sans markdown:
{"name":"nom complet","age":"âge en nombre si déductible (ex: via une date de naissance), vide sinon","phone":"téléphone tel qu'écrit ou vide","email":"email tel qu'écrit ou vide","address":"ville/adresse telle qu'écrite ou vide","sector":"secteur d'activité principal","experience":"Entry-Level|Junior|Mid-Level|Senior|Lead","skills":["3 à 6 compétences clés"]}
Règle absolue : n'invente jamais une information absente du document — laisse le champ vide ("") plutôt que de deviner un téléphone, un email ou une adresse.`;

const GEN_LIST_SYSTEM = `Tu es un assistant RH marocain. L'administrateur fournit une liste brute et potentiellement mal structurée d'informations sur plusieurs personnes (CVs collés les uns après les autres, notes de recrutement, tableau informel copié-collé...).
Ta tâche : repérer chaque personne distincte dans le texte et STRUCTURER les informations réellement présentes pour chacune — jamais en inventer de nouvelles.
Règle absolue : si une information (téléphone, email, adresse, âge...) n'apparaît pas explicitement ou de façon clairement déductible dans le texte pour une personne donnée, laisse le champ correspondant vide ("") — ne génère JAMAIS un téléphone, un email ou une adresse fictif, même plausible. Une donnée de contact inventée pourrait tromper un recruteur qui s'en servirait pour contacter quelqu'un.
Retourne UNIQUEMENT ce tableau JSON valide sans markdown, sans texte autour :
[{"name":"nom complet","age":"","phone":"","email":"","address":"","sector":"","experience":"","skills":[]}]`;

type Tab = 'overview' | 'coordinators' | 'jobs' | 'candidates' | 'generator' | 'reports';

interface Coordinator {
  id: string;
  name: string;
  email: string;
  code: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  sector: string;
  experience: string;
  location: string;
  status?: string;
  skills?: string[];
  description?: string;
  createdAt?: string;
  educationLevel?: string;
  languages?: string[];
  postedBy?: { id: string; name: string; code: string };
}

interface CV {
  id: string;
  name?: string;
  fileName?: string;
  sector?: string;
  experience?: string;
  skills?: string[];
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  cin?: string;
  birthDate?: string;
  diploma?: string;
  institution?: string;
  graduationYear?: string;
  linkedin?: string;
  portfolio?: string;
  targetRoles?: string[];
  certifications?: string[];
  work?: { company?: string; title?: string }[];
  educationLevel?: string;
  languages?: string[];
  uploadedAt?: string;
}

// A profile produced by the admin's AI generator (from an uploaded CV or
// from a pasted free-text list) — a smaller, flatter shape than CV above
// since it's meant to be reviewed and exported quickly, not edited in depth.
interface GeneratedProfile {
  id: string;
  name: string;
  age?: string;
  phone?: string;
  email?: string;
  address?: string;
  sector?: string;
  experience?: string;
  skills?: string[];
  source: 'cv' | 'list';
}

/* ── Sub-components ── */
function StatCard({ label, value, accent, icon }: { label: string; value: string | number; accent: string; icon: IconName }) {
  return (
    <div style={{
      background: WHITE, borderRadius: 10,
      border: `1px solid ${BORDER}`, padding: '1.25rem 1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      borderLeft: `3px solid ${accent}`,
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, borderRadius: 6, padding: '0.18rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>
      {label}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
      title="Copy code"
      style={{
        padding: '0.2rem 0.5rem', borderRadius: 5, border: `1px solid ${BORDER}`,
        background: copied ? LGREEN : WHITE, color: copied ? GREEN : MUTED,
        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
      }}
    >{copied ? <Icon name="check" size={12}/> : <Icon name="copy" size={12}/>}</button>
  );
}

export default function AdminDashboard() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('overview');
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  /* Coordinator form */
  const [newName, setNewName]   = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving]     = useState(false);
  const [savedCode, setSavedCode] = useState('');

  /* Inline delete confirmation — click once to arm, click again to confirm,
     matching the pattern used elsewhere in the app rather than a native
     browser confirm() dialog. */
  const [delConfirmCoordId, setDelConfirmCoordId] = useState<string | null>(null);
  const [delConfirmJobId, setDelConfirmJobId]     = useState<string | null>(null);

  /* Filters */
  const [jobSearch, setJobSearch]         = useState('');
  const [cvSearch, setCvSearch]           = useState('');
  const [jobSectorFilter, setJobSector]   = useState('');
  const [cvSectorFilter, setCvSector]     = useState('');
  const [expandedCv, setExpandedCv]       = useState<string | null>(null);

  /* AI generator (new 'Générateur IA' tab) */
  const [genMode, setGenMode]       = useState<'cv' | 'list'>('cv');
  const [genQueue, setGenQueue]     = useState<{ id: string; fileName: string; status: 'processing' | 'done' | 'error' }[]>([]);
  const [genListText, setGenListText] = useState('');
  const [genResults, setGenResults] = useState<GeneratedProfile[]>([]);
  const [genBusy, setGenBusy]       = useState(false);
  const [genError, setGenError]     = useState('');
  const [savingToDb, setSavingToDb] = useState(false);
  const [savedToDb, setSavedToDb]   = useState(false);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, initialized, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheets');
      const data = await res.json();
      setCoordinators(data.coordinators || []);
      setJobs(data.jobs || []);
      setCvs(data.cvs || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.role === 'admin') fetchData(); }, [user, fetchData]);

  if (!initialized || !user || user.role !== 'admin') return null;

  /* ── Coordinator actions ── */
  async function addCoordinator() {
    if (!newName.trim()) return;
    setSaving(true);
    const code = genCode(newName);
    const coord: Coordinator = {
      id: uid(), name: newName.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@talentmap.ma`,
      code, createdAt: new Date().toISOString(),
    };
    try {
      await fetch('/api/sheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_coordinator', coordinator: coord }),
      });
      setCoordinators(p => [...p, coord]);
      setSavedCode(code);
      setNewName(''); setNewEmail('');
    } catch {}
    setSaving(false);
  }

  async function deleteCoordinator(id: string) {
    setCoordinators(p => p.filter(c => c.id !== id));
    await fetch('/api/sheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delete_coordinator', id }),
    });
  }

  async function deleteJob(id: string) {
    setJobs(p => p.filter(j => j.id !== id));
    await fetch('/api/sheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delete_job', id }),
    });
  }

  /* ── AI generator actions ── */
  async function processGenFile(file: File) {
    const id = uid();
    setGenQueue(p => [...p, { id, fileName: file.name, status: 'processing' }]);
    try {
      const content = await buildGenAiContent(file);
      const r = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content }], system: GEN_CV_SYSTEM, task: 'json', max_tokens: 500 }),
      });
      const data = await r.json();
      const parsed = parseGenJ(data.content?.[0]?.text || '');
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_.]/g, ' ').trim();
      const profile: GeneratedProfile = {
        id: `adm_${id}`,
        name: parsed?.name || baseName,
        age: parsed?.age || '',
        phone: parsed?.phone || '',
        email: parsed?.email || '',
        address: parsed?.address || '',
        sector: parsed?.sector || '',
        experience: parsed?.experience || '',
        skills: Array.isArray(parsed?.skills) ? parsed.skills.slice(0, 6) : [],
        source: 'cv',
      };
      setGenResults(p => [...p, profile]);
      setGenQueue(p => p.map(f => f.id === id ? { ...f, status: 'done' } : f));
    } catch {
      setGenQueue(p => p.map(f => f.id === id ? { ...f, status: 'error' } : f));
    }
  }

  async function handleGenFiles(fileList: FileList) {
    setGenError('');
    setGenBusy(true);
    const arr = Array.from(fileList).slice(0, 30); // secondary tool — the coordinator's bulk importer is the place for 100+ CVs
    const CONCURRENCY = 4;
    let idx = 0;
    const worker = async () => { while (idx < arr.length) await processGenFile(arr[idx++]); };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, arr.length) }, worker));
    setGenBusy(false);
  }

  async function generateFromList() {
    if (!genListText.trim() || genBusy) return;
    setGenBusy(true); setGenError('');
    try {
      const r = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Liste brute fournie par l'administrateur :\n\n${genListText.slice(0, 8000)}` }],
          system: GEN_LIST_SYSTEM, task: 'json', max_tokens: 2000,
        }),
      });
      const data = await r.json();
      const text = data.content?.[0]?.text || '';
      const m = text.match(/\[[\s\S]*\]/);
      const parsed = m ? JSON.parse(m[0]) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const profiles: GeneratedProfile[] = parsed.map((p: any, i: number) => ({
          id: `adm_list_${Date.now()}_${i}`,
          name: p.name || `Personne ${i + 1}`,
          age: p.age || '', phone: p.phone || '', email: p.email || '', address: p.address || '',
          sector: p.sector || '', experience: p.experience || '',
          skills: Array.isArray(p.skills) ? p.skills.slice(0, 6) : [],
          source: 'list',
        }));
        setGenResults(prev => [...prev, ...profiles]);
        setGenListText('');
      } else {
        setGenError("Aucun profil n'a pu être structuré à partir de ce texte.");
      }
    } catch {
      setGenError('Erreur lors de la génération — réessayez.');
    }
    setGenBusy(false);
  }

  function clearGenResults() {
    setGenResults([]); setGenQueue([]); setGenError('');
  }

  async function saveGeneratedToDb() {
    if (genResults.length === 0 || savingToDb) return;
    setSavingToDb(true);
    try {
      const toSave = genResults.map(p => ({
        id: p.id, name: p.name, email: p.email, phone: p.phone, city: p.address,
        sector: p.sector, experience: p.experience, skills: p.skills,
        status: 'done', uploadedAt: new Date().toISOString(),
      }));
      await fetch('/api/sheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_cvs', cvs: toSave }),
      });
      // Merge into the already-loaded candidate list directly, rather than
      // calling fetchData() — that flips the page-wide `loading` flag, which
      // would hide this entire tab (results table included) behind the
      // "Chargement…" screen right after the admin just finished the save.
      setCvs(p => [...p, ...toSave]);
      setSavedToDb(true);
      setTimeout(() => setSavedToDb(false), 3000);
    } catch {}
    setSavingToDb(false);
  }

  function exportGenCSV() {
    const header = 'Nom,Âge,Téléphone,Email,Adresse,Secteur,Expérience,Compétences,Source';
    const rows = genResults.map(p => [p.name, p.age || '', p.phone || '', p.email || '', p.address || '', p.sector || '', p.experience || '', (p.skills || []).join('; '), p.source === 'cv' ? 'CV' : 'Liste'].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })),
      download: `TalentMap_Profils_Generes_${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  /* ── Derived stats ── */
  const avgMatch = cvs.length
    ? Math.round(cvs.reduce((s, c: any) => s + (c.matchScore || 0), 0) / cvs.length)
    : 0;

  const jobSectors = [...new Set(jobs.map(j => j.sector).filter(Boolean))];
  const cvSectors  = [...new Set(cvs.map(c => c.sector).filter(Boolean))];

  // Generator stats — city taken as the first comma-segment of the address
  // the AI structured (e.g. "Casablanca, Maarif" → "Casablanca"), since
  // there's no separate city field in a freeform-generated profile.
  const genWithCity = genResults.map(p => ({ ...p, city: (p.address || '').split(',')[0].trim() || 'Non renseigné' }));
  const genAgeBuckets: [string, number][] = (() => {
    const buckets: Record<string, number> = { '< 25': 0, '25–34': 0, '35–44': 0, '45+': 0, 'Non renseigné': 0 };
    genResults.forEach(p => {
      const n = parseInt(p.age || '', 10);
      if (!p.age || Number.isNaN(n)) buckets['Non renseigné']++;
      else if (n < 25) buckets['< 25']++;
      else if (n < 35) buckets['25–34']++;
      else if (n < 45) buckets['35–44']++;
      else buckets['45+']++;
    });
    return Object.entries(buckets).filter(([, n]) => n > 0);
  })();

  const filteredJobs = jobs.filter(j => {
    const q = jobSearch.toLowerCase();
    const matchQ = !q || (j.title || '').toLowerCase().includes(q) || (j.company || '').toLowerCase().includes(q);
    const matchS = !jobSectorFilter || j.sector === jobSectorFilter;
    return matchQ && matchS;
  });

  const filteredCvs = cvs.filter(c => {
    const q = cvSearch.toLowerCase();
    const name = (c.name || c.fileName || '').toLowerCase();
    const matchQ = !q || name.includes(q) || (c.sector || '').toLowerCase().includes(q);
    const matchS = !cvSectorFilter || c.sector === cvSectorFilter;
    return matchQ && matchS;
  });

  /* ── Report generator ── */
  function generateReport(type: string) {
    const now = new Date().toLocaleDateString('fr-MA');
    const jobRows = jobs.map(j =>
      `<tr><td>${j.title}</td><td>${j.company}</td><td>${j.sector}</td><td>${j.experience}</td><td>${j.location}</td><td>${j.status || 'Active'}</td></tr>`
    ).join('');
    const cvRows = cvs.map((c: any) =>
      `<tr><td>${c.name || c.fileName || '—'}</td><td>${c.email || '—'}</td><td>${c.sector || '—'}</td><td>${c.experience || '—'}</td><td>${(c.skills || []).join(', ')}</td><td>${c.matchScore || '—'}%</td></tr>`
    ).join('');
    const coordRows = coordinators.map(c =>
      `<tr><td>${c.name}</td><td>${c.email}</td><td style="font-family:monospace">${c.code}</td><td>${new Date(c.createdAt).toLocaleDateString('fr-MA')}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>TalentMap — Rapport Admin</title>
<style>body{font-family:'Segoe UI',sans-serif;color:#111827;padding:2rem;max-width:1100px;margin:0 auto}
h1{color:#0a1f5c}h2{color:#2563eb;margin:2rem 0 .75rem;font-size:1.1rem}
p{color:#6b7280;margin-bottom:2rem}
table{width:100%;border-collapse:collapse;margin-bottom:2rem;font-size:.85rem}
th{background:#0a1f5c;color:white;padding:.55rem .75rem;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em}
td{padding:.55rem .75rem;border-bottom:1px solid #f3f4f6}
tr:nth-child(even) td{background:#f9fafb}
.footer{text-align:center;color:#9ca3af;font-size:.75rem;margin-top:2rem;padding-top:1rem;border-top:1px solid #f3f4f6}
</style></head><body>
<h1>TalentMap — Rapport ${type}</h1>
<p>Généré le ${now} · ${type === 'Coordinators' ? coordinators.length + ' coordinateurs' : type === 'Jobs' ? jobs.length + ' offres' : type === 'Candidates' ? cvs.length + ' candidats' : 'rapport complet'}</p>
${(type === 'Coordinators' || type === 'Full') ? `<h2>Coordinateurs (${coordinators.length})</h2>
<table><thead><tr><th>Nom</th><th>Email</th><th>Code d'accès</th><th>Créé le</th></tr></thead><tbody>${coordRows}</tbody></table>` : ''}
${(type === 'Jobs' || type === 'Full') ? `<h2>Offres d'emploi (${jobs.length})</h2>
<table><thead><tr><th>Titre</th><th>Entreprise</th><th>Secteur</th><th>Expérience</th><th>Ville</th><th>Statut</th></tr></thead><tbody>${jobRows}</tbody></table>` : ''}
${(type === 'Candidates' || type === 'Full') ? `<h2>Candidats (${cvs.length})</h2>
<table><thead><tr><th>Nom</th><th>Email</th><th>Secteur</th><th>Expérience</th><th>Compétences</th><th>Score</th></tr></thead><tbody>${cvRows}</tbody></table>` : ''}
<div class="footer">TalentMap Recruitment Platform · ${now}</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `TalentMap_${type}_${now.replace(/\//g, '-')}.html` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── CSV export ── */
  function downloadCSV(type: 'Candidates' | 'Jobs' | 'Coordinators') {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    let rows: (string | number)[][] = [];
    if (type === 'Candidates') {
      rows = [
        ['Nom', 'Email', 'Téléphone', 'Ville', 'Secteur', 'Expérience', 'Formation', 'Langues', 'Compétences', 'Score match', 'Inscrit le'],
        ...cvs.map((c: any) => [
          c.name || c.fileName || '', c.email || '', c.phone || '', c.city || '',
          c.sector || '', c.experience || '', c.educationLevel || '',
          (c.languages || []).join('; '), (c.skills || []).join('; '),
          c.matchScore != null ? `${c.matchScore}%` : '',
          c.uploadedAt ? new Date(c.uploadedAt).toLocaleDateString('fr-MA') : '',
        ]),
      ];
    } else if (type === 'Jobs') {
      rows = [
        ['Titre', 'Entreprise', 'Secteur', 'Expérience', 'Ville', 'Formation requise', 'Langues requises', 'Compétences', 'Statut', 'Publiée le'],
        ...jobs.map(j => [
          j.title, j.company, j.sector, j.experience, j.location,
          j.educationLevel || '', (j.languages || []).join('; '),
          (j.skills || []).join('; '), j.status || 'Active',
          j.createdAt ? new Date(j.createdAt).toLocaleDateString('fr-MA') : '',
        ]),
      ];
    } else {
      rows = [
        ['Nom', 'Email', 'Code', 'Créé le'],
        ...coordinators.map(c => [c.name, c.email, c.code, c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-MA') : '']),
      ];
    }
    const csv = rows.map(r => r.map(esc).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `TalentMap_${type}_${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Sidebar nav ── */
  const NAV: { id: Tab; icon: IconName; label: string }[] = [
    { id: 'overview',     icon: 'chart-bar', label: 'Vue d\'ensemble' },
    { id: 'coordinators', icon: 'users',     label: 'Coordinateurs' },
    { id: 'jobs',         icon: 'briefcase', label: 'Offres d\'emploi' },
    { id: 'candidates',   icon: 'target',    label: 'Candidats' },
    { id: 'generator',    icon: 'sparkles',  label: 'Générateur IA' },
    { id: 'reports',      icon: 'file-text', label: 'Rapports' },
  ];

  /* ── Sector bar helper ── */
  function SectorBars({ items, key_ }: { items: any[]; key_: string }) {
    const counts: Record<string, number> = {};
    items.forEach(i => { const s = i[key_] || 'Autre'; counts[s] = (counts[s] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] || 1;
    const colors = [COBALT, BLUE, PURPLE, GREEN, AMBER, '#f472b6'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(([sector, count], i) => (
          <div key={sector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: '0.78rem', color: TEXT, fontWeight: 500 }}>{sector}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY }}>{count}</span>
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: colors[i % colors.length], width: `${(count / max) * 100}%`, transition: 'width .5s' }} />
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p style={{ fontSize: '0.8rem', color: MUTED }}>Aucune donnée</p>}
      </div>
    );
  }

  /* ── Growth trend — candidates & jobs registered per week, last 8 weeks ── */
  function weekLabel(weeksBack: number): string {
    const d = new Date();
    d.setDate(d.getDate() - weeksBack * 7);
    return d.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit' });
  }

  function GrowthTrend({ candidates, jobList }: { candidates: CV[]; jobList: Job[] }) {
    const WEEKS = 8;
    const now = Date.now();
    const weekOf = (dateStr?: string): number => {
      if (!dateStr) return -1;
      const t = new Date(dateStr).getTime();
      if (Number.isNaN(t)) return -1;
      const diffWeeks = Math.floor((now - t) / (7 * 24 * 3600 * 1000));
      return diffWeeks >= 0 && diffWeeks < WEEKS ? WEEKS - 1 - diffWeeks : -1;
    };
    const candBuckets = Array(WEEKS).fill(0);
    candidates.forEach(c => { const b = weekOf(c.uploadedAt); if (b >= 0) candBuckets[b]++; });
    const jobBuckets = Array(WEEKS).fill(0);
    jobList.forEach(j => { const b = weekOf(j.createdAt); if (b >= 0) jobBuckets[b]++; });
    const max = Math.max(1, ...candBuckets, ...jobBuckets);
    const hasData = candBuckets.some(n => n > 0) || jobBuckets.some(n => n > 0);

    return (
      <div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: COBALT, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: MUTED }}>Candidats</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: AMBER, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: MUTED }}>Offres</span>
          </div>
        </div>
        {!hasData ? (
          <p style={{ fontSize: '0.8rem', color: MUTED }}>Pas encore assez de données pour une tendance.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
            {Array.from({ length: WEEKS }).map((_, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 96 }}>
                  <div title={`${candBuckets[i]} candidat(s)`} style={{ width: 9, borderRadius: 3, background: COBALT, height: `${Math.max((candBuckets[i] / max) * 100, candBuckets[i] > 0 ? 4 : 0)}%` }} />
                  <div title={`${jobBuckets[i]} offre(s)`} style={{ width: 9, borderRadius: 3, background: AMBER, height: `${Math.max((jobBuckets[i] / max) * 100, jobBuckets[i] > 0 ? 4 : 0)}%` }} />
                </div>
                <span style={{ fontSize: '0.6rem', color: FAINT }}>{weekLabel(WEEKS - 1 - i)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Activity feed (derived from jobs + cvs + coordinators) ── */
  const activity = [
    ...coordinators.slice(-4).map(c => ({ time: new Date(c.createdAt).toLocaleDateString('fr-MA'), text: `Coordinateur ajouté : ${c.name}`, color: PURPLE })),
    ...jobs.slice(-4).map(j => ({ time: j.createdAt ? new Date(j.createdAt).toLocaleDateString('fr-MA') : 'Récemment', text: `Offre publiée : ${j.title} chez ${j.company}`, color: AMBER })),
    ...cvs.slice(-4).map((c: any) => ({ time: c.uploadedAt ? new Date(c.uploadedAt).toLocaleDateString('fr-MA') : 'Récemment', text: `CV reçu : ${c.name || c.fileName || 'Candidat'}`, color: BLUE })),
  ].sort(() => -0.5 + Math.random()).slice(0, 10);

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <PageHeader label="Admin Portal" icon="settings" />

      {/* ── Tab bar ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: 0 }}>
          <div className="tab-group">
            {NAV.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} className={`tab-button${active ? ' active-admin' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Icon name={item.icon} size={15} />
                  <span>{item.label}</span>
                  {item.id === 'coordinators' && coordinators.length > 0 && (
                    <span style={{ background: active ? 'rgba(255,255,255,.25)' : LBLUE, color: active ? '#fff' : NAVY, borderRadius: 10, padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                      {coordinators.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: MUTED, fontWeight: 600 }}>{user.name || user.id}</span>
            <button onClick={fetchData} style={{ fontSize: '0.82rem', color: COBALT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="refresh" size={13}/>Actualiser</span></button>
          </div>
        </div>
      </div>

      <main style={{ background: BG }}>
        <div className="container" style={{ padding: '1.75rem 1.5rem 3rem' }}>

        {loading && tab !== 'overview' ? (
          <div style={{ textAlign: 'center', paddingTop: '6rem', color: MUTED }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="clock" size={34} color={MUTED}/></div>
            <div style={{ fontSize: '0.9rem' }}>Chargement des données…</div>
          </div>
        ) : (
          <>

            {/* ════════ OVERVIEW ════════ */}
            {tab === 'overview' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Vue d'ensemble</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>Données en temps réel · Administration TalentMap</p>

                {/* KPI grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                  <StatCard label="Coordinateurs" value={coordinators.length} accent={PURPLE} icon="users" />
                  <StatCard label="Offres d'emploi" value={jobs.length} accent={AMBER} icon="briefcase" />
                  <StatCard label="Candidats" value={cvs.length} accent={COBALT} icon="target" />
                  <StatCard label="Score moyen" value={avgMatch ? avgMatch + '%' : '—'} accent={GREEN} icon="chart-bar" />
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Offres par secteur</h2>
                    <SectorBars items={jobs} key_="sector" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Candidats par secteur</h2>
                    <SectorBars items={cvs} key_="sector" />
                  </div>
                </div>

                {/* Geography + growth trend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Offres par ville</h2>
                    <SectorBars items={jobs} key_="location" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Candidats par ville</h2>
                    <SectorBars items={cvs} key_="city" />
                  </div>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Tendance d'inscription (8 sem.)</h2>
                    <GrowthTrend candidates={cvs} jobList={jobs} />
                  </div>
                </div>

                {/* Recent coordinators + activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '.04em' }}>Coordinateurs récents</h2>
                      <button onClick={() => setTab('coordinators')} style={{ fontSize: '0.75rem', color: COBALT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Gérer →</button>
                    </div>
                    {coordinators.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: LBLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                          <Icon name="users" size={22} color={COBALT} />
                        </div>
                        <div style={{ fontSize: '0.82rem' }}>Aucun coordinateur pour l&apos;instant</div>
                        <button onClick={() => setTab('coordinators')} style={{ marginTop: 10, padding: '0.4rem 0.85rem', borderRadius: 7, border: `1.5px solid ${COBALT}`, background: LBLUE, color: NAVY, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter un coordinateur</button>
                      </div>
                    ) : coordinators.slice(-5).reverse().map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0', borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: PURPLE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#ffffff' }}>
                          {c.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: MUTED, fontFamily: 'monospace' }}>{c.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Activité récente</h2>
                    {activity.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: MUTED }}>Aucune activité enregistrée.</p>
                    ) : activity.slice(0, 8).map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0.55rem 0', borderBottom: i < 7 ? `1px solid ${BORDER}` : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 6, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '0.8rem', color: TEXT }}>{a.text}</div>
                        <span style={{ fontSize: '0.7rem', color: MUTED, flexShrink: 0 }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ COORDINATORS ════════ */}
            {tab === 'coordinators' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Coordinateurs</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  Créez des comptes coordinateurs — le code généré leur permet de se connecter.
                </p>

                {/* Add form */}
                <div style={{ background: WHITE, borderRadius: 10, padding: '1.5rem', border: `1px solid ${BORDER}`, marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                  <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Ajouter un coordinateur</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: NAVY, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom complet *</label>
                      <input
                        value={newName} onChange={e => { setNewName(e.target.value); setSavedCode(''); }}
                        placeholder="ex: Khalid Benali"
                        style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 8, border: `1.5px solid ${newName ? COBALT : BORDER}`, fontSize: '0.875rem', fontFamily: 'inherit', color: TEXT, background: newName ? LBLUE : '#f8fafc', boxSizing: 'border-box', outline: 'none', transition: 'border-color .15s' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: NAVY, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Email (optionnel)</label>
                      <input
                        value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        placeholder="khalid@entreprise.ma"
                        type="email"
                        style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: '0.875rem', fontFamily: 'inherit', color: TEXT, background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }}
                      />
                    </div>
                    <button
                      onClick={addCoordinator}
                      disabled={saving || !newName.trim()}
                      style={{
                        padding: '0.7rem 1.5rem', borderRadius: 8, border: 'none', cursor: saving || !newName.trim() ? 'not-allowed' : 'pointer',
                        background: saving || !newName.trim() ? FAINT : INK, color: '#ffffff',
                        fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
                        transition: 'background .15s',
                      }}
                    >{saving ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Icon name="refresh" size={13}/>Création…</span> : '+ Créer le compte'}</button>
                  </div>

                  {/* Success — show generated code */}
                  {savedCode && (
                    <div style={{ marginTop: '1rem', padding: '0.9rem 1.1rem', background: LGREEN, border: `1.5px solid ${GREEN}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Icon name="check-circle" size={18} color={GREEN}/>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: GREEN, marginBottom: 2 }}>Compte créé avec succès !</div>
                        <div style={{ fontSize: '0.8rem', color: TEXT }}>Code d'accès généré :</div>
                      </div>
                      <code style={{ background: WHITE, border: `1.5px solid ${GREEN}`, borderRadius: 7, padding: '0.3rem 0.85rem', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800, color: NAVY, letterSpacing: '0.1em' }}>{savedCode}</code>
                      <CopyBtn text={savedCode} />
                      <span style={{ fontSize: '0.75rem', color: MUTED, marginLeft: 'auto' }}>Transmettez ce code au coordinateur pour qu'il puisse se connecter.</span>
                    </div>
                  )}
                </div>

                {/* Coordinators table */}
                <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div style={{ padding: '1.1rem 1.4rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '.04em' }}>Comptes coordinateurs ({coordinators.length})</h2>
                    <button onClick={fetchData} style={{ fontSize: '0.78rem', color: COBALT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="refresh" size={13}/>Actualiser</span></button>
                  </div>
                  {coordinators.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="user" size={40} color={MUTED}/></div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>Aucun coordinateur</div>
                      <div style={{ fontSize: '0.85rem' }}>Créez votre premier compte coordinateur ci-dessus.</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['Coordinateur', 'Email', 'Code d\'accès', 'Créé le', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {coordinators.map((c, i) => (
                            <tr key={c.id} style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? WHITE : '#f9fafb' }}>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 9, background: PURPLE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#ffffff' }}>{c.name[0]}</div>
                                  <div style={{ fontWeight: 600, color: TEXT }}>{c.name}</div>
                                </div>
                              </td>
                              <td style={{ padding: '0.8rem 1rem', color: MUTED }}>{c.email}</td>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <code style={{ background: LBLUE, borderRadius: 5, padding: '0.2rem 0.6rem', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: NAVY, letterSpacing: '0.06em' }}>{c.code}</code>
                                  <CopyBtn text={c.code} />
                                </div>
                              </td>
                              <td style={{ padding: '0.8rem 1rem', color: MUTED, fontSize: '0.8rem' }}>
                                {new Date(c.createdAt).toLocaleDateString('fr-MA')}
                              </td>
                              <td style={{ padding: '0.8rem 1rem' }}>
                                {delConfirmCoordId === c.id ? (
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                      onClick={() => { deleteCoordinator(c.id); setDelConfirmCoordId(null); }}
                                      style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: 'none', background: RED, color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                    >Confirmer</button>
                                    <button
                                      onClick={() => setDelConfirmCoordId(null)}
                                      style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                    >Annuler</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDelConfirmCoordId(c.id)}
                                    style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: `1px solid ${RED}`, background: LRED, color: RED, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                  >Supprimer</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Login hint */}
                <div style={{ marginTop: '1rem', padding: '0.9rem 1.1rem', background: LBLUE, borderRadius: 10, border: `1px solid ${BLUE}22` }}>
                  <div style={{ fontSize: '0.8rem', color: NAVY, fontWeight: 600, marginBottom: 3 }}>ℹ️ Comment se connecter ?</div>
                  <div style={{ fontSize: '0.78rem', color: MUTED }}>
                    Le coordinateur va sur la page de connexion et saisit son code d'accès (ex: <code style={{ fontFamily: 'monospace', background: WHITE, padding: '1px 5px', borderRadius: 4 }}>BENALICOR4821</code>).
                    Il sera automatiquement redirigé vers son tableau de bord.
                  </div>
                </div>
              </div>
            )}

            {/* ════════ JOB OFFERS ════════ */}
            {tab === 'jobs' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Offres d'emploi</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  {jobs.length} offre{jobs.length > 1 ? 's' : ''} publiée{jobs.length > 1 ? 's' : ''} par les coordinateurs
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Rechercher titre, entreprise…"
                    style={{ flex: '1 1 220px', padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, background: WHITE, outline: 'none', transition: 'border-color .15s' }}
                  />
                  <select value={jobSectorFilter} onChange={e => setJobSector(e.target.value)}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${jobSectorFilter ? COBALT : BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: jobSectorFilter ? NAVY : MUTED, background: jobSectorFilter ? LBLUE : WHITE, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Tous les secteurs</option>
                    {jobSectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => { setJobSearch(''); setJobSector(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.65rem 1rem', borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: '0.8rem', cursor: 'pointer' }}><Icon name="x" size={13}/>Réinitialiser</button>
                </div>

                {filteredJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: MUTED, background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="briefcase" size={40} color={MUTED}/></div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                      {jobs.length === 0 ? 'Aucune offre publiée' : 'Aucun résultat'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {jobs.length === 0 ? 'Les coordinateurs peuvent publier des offres depuis leur tableau de bord.' : 'Modifiez vos filtres de recherche.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['Titre', 'Entreprise', 'Secteur', 'Expérience', 'Ville', 'Compétences', 'Publiée par', 'Statut', ''].map(h => (
                              <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredJobs.map((j, i) => (
                            <tr key={j.id} style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? WHITE : '#f9fafb' }}>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>{j.title}</td>
                              <td style={{ padding: '0.85rem 1rem', color: TEXT, fontWeight: 500 }}>{j.company}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <Badge label={j.sector} color={NAVY} bg={LBLUE} />
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: MUTED, fontSize: '0.82rem' }}>{j.experience}</td>
                              <td style={{ padding: '0.85rem 1rem', color: MUTED, fontSize: '0.82rem' }}>{j.location}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {(j.skills || []).slice(0, 3).map(s => (
                                    <span key={s} style={{ background: '#f3f4f6', color: MUTED, borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>
                                  ))}
                                  {(j.skills || []).length > 3 && <span style={{ color: MUTED, fontSize: '0.68rem' }}>+{(j.skills || []).length - 3}</span>}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: MUTED, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                {j.postedBy?.name || j.postedBy?.code || <span style={{ fontStyle: 'italic', color: FAINT }}>Inconnu</span>}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <Badge label={j.status || 'Active'} color={j.status === 'Fermé' ? RED : GREEN} bg={j.status === 'Fermé' ? LRED : LGREEN} />
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                {delConfirmJobId === j.id ? (
                                  <div style={{ display: 'flex', gap: 5 }}>
                                    <button
                                      onClick={() => { deleteJob(j.id); setDelConfirmJobId(null); }}
                                      style={{ padding: '0.25rem 0.65rem', borderRadius: 5, border: 'none', background: RED, color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                                    >Confirmer</button>
                                    <button
                                      onClick={() => setDelConfirmJobId(null)}
                                      style={{ padding: '0.25rem 0.65rem', borderRadius: 5, border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                                    >Annuler</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDelConfirmJobId(j.id)}
                                    title="Supprimer l'offre"
                                    style={{ padding: '0.3rem', borderRadius: 5, border: `1px solid ${BORDER}`, background: WHITE, color: RED, cursor: 'pointer', display: 'flex' }}
                                  ><Icon name="trash" size={14}/></button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${BORDER}`, background: '#f8fafc', fontSize: '0.75rem', color: MUTED }}>
                      {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} affichée{filteredJobs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════ CANDIDATES ════════ */}
            {tab === 'candidates' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Candidats</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  {cvs.length} CV{cvs.length > 1 ? 's' : ''} dans la base de données
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <input
                    value={cvSearch} onChange={e => setCvSearch(e.target.value)}
                    placeholder="Rechercher nom, secteur…"
                    style={{ flex: '1 1 220px', padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, background: WHITE, outline: 'none', transition: 'border-color .15s' }}
                  />
                  <select value={cvSectorFilter} onChange={e => setCvSector(e.target.value)}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 9, border: `1.5px solid ${cvSectorFilter ? COBALT : BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: cvSectorFilter ? NAVY : MUTED, background: cvSectorFilter ? LBLUE : WHITE, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Tous les secteurs</option>
                    {cvSectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => { setCvSearch(''); setCvSector(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.65rem 1rem', borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: '0.8rem', cursor: 'pointer' }}><Icon name="x" size={13}/>Réinitialiser</button>
                </div>

                {filteredCvs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: MUTED, background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="target" size={40} color={MUTED}/></div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                      {cvs.length === 0 ? 'Aucun candidat' : 'Aucun résultat'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {cvs.length === 0 ? 'Les candidats apparaissent ici après avoir soumis leur CV.' : 'Modifiez vos filtres.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredCvs.map((c: any) => (
                      <div key={c.id} style={{ background: WHITE, borderRadius: 12, padding: '1.1rem 1.4rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: PURPLE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#ffffff' }}>
                              {(c.name || c.fileName || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: NAVY }}>{c.name || c.fileName || 'Candidat'}</div>
                              <div style={{ fontSize: '0.75rem', color: MUTED }}>
                                {[c.email, c.phone].filter(Boolean).join(' · ')}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {c.matchScore !== undefined && c.matchScore > 0 && (
                              <span style={{ background: c.matchScore >= 70 ? LGREEN : LBLUE, color: c.matchScore >= 70 ? GREEN : BLUE, borderRadius: 9999, padding: '0.25rem 0.85rem', fontSize: '0.82rem', fontWeight: 800 }}>
                                {c.matchScore}% match
                              </span>
                            )}
                            <button onClick={() => setExpandedCv(p => p === c.id ? null : c.id)} style={{ padding: '0.3rem 0.75rem', borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, color: COBALT, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                              {expandedCv === c.id ? 'Réduire ▲' : 'Détails ▼'}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {c.sector && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Secteur</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.sector}</div></div>}
                          {c.experience && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Expérience</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.experience}</div></div>}
                          {(c.city || c.region) && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Localisation</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{[c.city, c.region].filter(Boolean).join(' · ')}</div></div>}
                        </div>
                        {c.skills?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {c.skills.map((s: string) => (
                              <span key={s} style={{ background: LBLUE, color: BLUE, borderRadius: 4, padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 600 }}>{s}</span>
                            ))}
                          </div>
                        )}

                        {expandedCv === c.id && (
                          <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: `1px solid ${BORDER}`, display: 'flex', flexWrap: 'wrap', gap: '1.5rem 2rem' }}>
                            {c.cin && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>CIN</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.cin}</div></div>}
                            {c.birthDate && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Naissance</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.birthDate}</div></div>}
                            {(c.diploma || c.institution || c.graduationYear) && (
                              <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Formation</span>
                                <div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>
                                  {[c.diploma, c.institution, c.graduationYear].filter(Boolean).join(' · ')}
                                </div>
                              </div>
                            )}
                            {c.languages?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Langues</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.languages.join(', ')}</div></div>}
                            {c.work?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Expériences pro.</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.work.length} poste{c.work.length > 1 ? 's' : ''} renseigné{c.work.length > 1 ? 's' : ''}</div></div>}
                            {c.targetRoles?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Postes visés</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.targetRoles.join(', ')}</div></div>}
                            {c.certifications?.length > 0 && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Certifications</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{c.certifications.join(', ')}</div></div>}
                            {(c.linkedin || c.portfolio) && (
                              <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Liens</span>
                                <div style={{ fontSize: '0.82rem', color: COBALT, fontWeight: 600 }}>{[c.linkedin, c.portfolio].filter(Boolean).join(' · ')}</div>
                              </div>
                            )}
                            {c.uploadedAt && <div><span style={{ fontSize: '0.68rem', color: MUTED, fontWeight: 700, textTransform: 'uppercase' }}>Dernière mise à jour</span><div style={{ fontSize: '0.82rem', color: TEXT, fontWeight: 600 }}>{new Date(c.uploadedAt).toLocaleDateString('fr-MA')}</div></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════ AI GENERATOR ════════ */}
            {tab === 'generator' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Générateur IA</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  Transformez des CVs ou une liste brute en informations structurées — nom, âge, téléphone, email, adresse — puis consultez les statistiques du lot.
                </p>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', border: `1.5px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
                  {[['cv', 'Depuis des CVs', 'folder' as IconName], ['list', 'Depuis une liste', 'file-text' as IconName]].map(([id, label, icon]) => (
                    <button key={id as string} onClick={() => setGenMode(id as 'cv' | 'list')} style={{
                      display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.4rem',
                      fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                      background: genMode === id ? INK : WHITE, color: genMode === id ? '#ffffff' : MUTED,
                    }}><Icon name={icon as IconName} size={14}/>{label as string}</button>
                  ))}
                </div>

                {genMode === 'cv' ? (
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleGenFiles(e.dataTransfer.files); }}
                    style={{ border: `2px dashed ${BORDER2}`, background: WHITE, borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                    <input id="gen-file-input" type="file" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleGenFiles(e.target.files)} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}><Icon name="folder" size={34} color={MUTED}/></div>
                    <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: '1rem' }}>Glissez des fichiers ici — tous formats acceptés, jusqu'à 30 par lot</p>
                    <label htmlFor="gen-file-input" style={{ display: 'inline-block', padding: '0.6rem 1.4rem', borderRadius: 8, background: INK, color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Choisir des fichiers</label>
                  </div>
                ) : (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <textarea
                      value={genListText} onChange={e => setGenListText(e.target.value)} rows={7}
                      placeholder={"Collez ici une liste brute (plusieurs CVs collés, notes, tableau copié...). L'IA structure uniquement les informations réellement présentes — elle n'invente jamais un téléphone, un email ou une adresse manquant."}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: '0.85rem', fontFamily: 'inherit', color: TEXT, resize: 'vertical', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={generateFromList} disabled={genBusy || !genListText.trim()}
                      style={{ marginTop: '0.75rem', padding: '0.65rem 1.4rem', borderRadius: 8, border: 'none', cursor: genBusy || !genListText.trim() ? 'not-allowed' : 'pointer', background: genBusy || !genListText.trim() ? FAINT : INK, color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {genBusy ? <><Icon name="refresh" size={13}/>Analyse en cours…</> : <><Icon name="sparkles" size={13}/>Structurer la liste</>}
                    </button>
                  </div>
                )}

                {genError && (
                  <div style={{ padding: '0.75rem 1rem', background: LRED, color: RTEXT, borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.82rem', fontWeight: 600 }}>{genError}</div>
                )}

                {genMode === 'cv' && genQueue.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {genQueue.map(f => (
                      <span key={f.id} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 999, background: f.status === 'done' ? LGREEN : f.status === 'error' ? LRED : LBLUE, color: f.status === 'done' ? GREEN : f.status === 'error' ? RTEXT : BLUE }}>
                        {f.status === 'processing' ? '⏳ ' : f.status === 'done' ? '✓ ' : '✕ '}{f.fileName}
                      </span>
                    ))}
                  </div>
                )}

                {genResults.length > 0 && (
                  <>
                    {/* Results table */}
                    <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '1.25rem' }}>
                      <div style={{ padding: '1rem 1.3rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '.04em' }}>Profils générés ({genResults.length})</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={exportGenCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', borderRadius: 7, border: `1.5px solid ${GREEN}`, background: WHITE, color: GREEN, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}><Icon name="download" size={13}/>CSV</button>
                          <button onClick={saveGeneratedToDb} disabled={savingToDb} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', borderRadius: 7, border: 'none', background: savedToDb ? GREEN : COBALT, color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: savingToDb ? 'wait' : 'pointer' }}>
                            {savingToDb ? <><Icon name="refresh" size={13}/>Enregistrement…</> : savedToDb ? <><Icon name="check" size={13}/>Enregistré</> : <><Icon name="save" size={13}/>Enregistrer dans la base candidats</>}
                          </button>
                          <button onClick={clearGenResults} style={{ padding: '0.4rem 0.85rem', borderRadius: 7, border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Vider</button>
                        </div>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              {['Nom', 'Âge', 'Téléphone', 'Email', 'Adresse', 'Secteur', 'Compétences', 'Source'].map(h => (
                                <th key={h} style={{ padding: '0.6rem 0.9rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {genResults.map((p, i) => (
                              <tr key={p.id} style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? WHITE : '#f9fafb' }}>
                                <td style={{ padding: '0.7rem 0.9rem', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>{p.name}</td>
                                <td style={{ padding: '0.7rem 0.9rem', color: p.age ? TEXT : FAINT }}>{p.age || '—'}</td>
                                <td style={{ padding: '0.7rem 0.9rem', color: p.phone ? TEXT : FAINT }}>{p.phone || '—'}</td>
                                <td style={{ padding: '0.7rem 0.9rem', color: p.email ? TEXT : FAINT }}>{p.email || '—'}</td>
                                <td style={{ padding: '0.7rem 0.9rem', color: p.address ? TEXT : FAINT }}>{p.address || '—'}</td>
                                <td style={{ padding: '0.7rem 0.9rem' }}>{p.sector ? <Badge label={p.sector} color={NAVY} bg={LBLUE} /> : <span style={{ color: FAINT }}>—</span>}</td>
                                <td style={{ padding: '0.7rem 0.9rem' }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 220 }}>
                                    {(p.skills || []).slice(0, 3).map(s => <span key={s} style={{ background: '#f3f4f6', color: MUTED, borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>)}
                                  </div>
                                </td>
                                <td style={{ padding: '0.7rem 0.9rem' }}><Badge label={p.source === 'cv' ? 'CV' : 'Liste'} color={p.source === 'cv' ? BLUE : PURPLE} bg={p.source === 'cv' ? LBLUE : LPURP} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                      <StatCard label="Profils générés" value={genResults.length} accent={COBALT} icon="sparkles" />
                      <StatCard label="Avec téléphone" value={genResults.filter(p => p.phone).length} accent={GREEN} icon="phone" />
                      <StatCard label="Avec email" value={genResults.filter(p => p.email).length} accent={AMBER} icon="mail" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Par secteur</h2>
                        <SectorBars items={genWithCity} key_="sector" />
                      </div>
                      <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Par ville</h2>
                        <SectorBars items={genWithCity} key_="city" />
                      </div>
                      <div style={{ background: WHITE, borderRadius: 10, padding: '1.25rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Par âge</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {genAgeBuckets.map(([label, count], i) => {
                            const max = Math.max(...genAgeBuckets.map(([, n]) => n), 1);
                            const colors = [COBALT, BLUE, PURPLE, GREEN, FAINT];
                            return (
                              <div key={label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                  <span style={{ fontSize: '0.78rem', color: TEXT, fontWeight: 500 }}>{label}</span>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY }}>{count}</span>
                                </div>
                                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', borderRadius: 4, background: colors[i % colors.length], width: `${(count / max) * 100}%`, transition: 'width .5s' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {genResults.length === 0 && genQueue.length === 0 && !genBusy && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: MUTED, background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="sparkles" size={36} color={MUTED}/></div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: 6 }}>Aucun profil généré pour l'instant</div>
                    <div style={{ fontSize: '0.82rem' }}>Importez des CVs ou collez une liste brute ci-dessus pour commencer.</div>
                  </div>
                )}
              </div>
            )}

            {/* ════════ REPORTS ════════ */}
            {tab === 'reports' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: 4 }}>Rapports</h2>
                <p style={{ fontSize: '0.82rem', color: MUTED, marginBottom: '1.5rem' }}>
                  Exportez les données de la plateforme en HTML téléchargeable.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {[
                    { type: 'Coordinators', icon: 'users' as IconName, title: 'Rapport coordinateurs', desc: `${coordinators.length} compte${coordinators.length > 1 ? 's' : ''} avec codes d'accès`, color: PURPLE },
                    { type: 'Jobs',         icon: 'briefcase' as IconName, title: 'Rapport offres d\'emploi', desc: `${jobs.length} offre${jobs.length > 1 ? 's' : ''} publiée${jobs.length > 1 ? 's' : ''}`, color: AMBER },
                    { type: 'Candidates',   icon: 'target' as IconName, title: 'Rapport candidats',    desc: `${cvs.length} CV en base`, color: BLUE },
                    { type: 'Full',         icon: 'document' as IconName, title: 'Rapport complet',      desc: 'Toutes les données consolidées', color: NAVY },
                  ].map(r => (
                    <div key={r.type} style={{ background: WHITE, borderRadius: 12, padding: '1.5rem', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                      <div style={{ marginBottom: '0.75rem' }}><Icon name={r.icon} size={28} color={r.color}/></div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: '0.8rem', color: MUTED, marginBottom: '1.25rem' }}>{r.desc}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => generateReport(r.type)} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                          padding: '0.65rem', borderRadius: 8, border: 'none',
                          background: r.color, color: '#ffffff', fontSize: '0.85rem', fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}><Icon name="download" size={14}/>HTML</button>
                        {r.type !== 'Full' && (
                          <button onClick={() => downloadCSV(r.type as 'Candidates' | 'Jobs' | 'Coordinators')} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                            padding: '0.65rem', borderRadius: 8, border: `1.5px solid ${r.color}`,
                            background: WHITE, color: r.color, fontSize: '0.85rem', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}><Icon name="download" size={14}/>CSV</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform summary */}
                <div style={{ background: WHITE, borderRadius: 12, padding: '1.5rem', border: `1px solid ${BORDER}`, marginTop: '1.5rem' }}>
                  <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: NAVY, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Icon name="chart-bar" size={15}/>Résumé de la plateforme</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Coordinateurs', value: coordinators.length },
                      { label: 'Offres actives', value: jobs.filter(j => j.status !== 'Fermé').length },
                      { label: 'Total candidats', value: cvs.length },
                      { label: 'Score moyen', value: avgMatch ? avgMatch + '%' : '—' },
                      { label: 'Secteurs représentés', value: cvSectors.length },
                      { label: 'Offres par secteur', value: jobSectors.length },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '0.85rem', background: '#f9fafb', borderRadius: 9, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: NAVY }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </>
        )}
        </div>
      </main>
    </div>
  );
}
