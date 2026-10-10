/**
 * TalentMap CV template engine — 100 templates (10 layouts × 10 palettes),
 * ported from the TalentMap Build Spec's reference implementation (Appendix A).
 *
 * Used by both the candidate CV builder and the coordinator's CV export, so
 * every downloaded/printed CV — regardless of who generates it — looks the
 * same. A template id is `tm-<layout>-<palette>` (e.g. `tm-colonne-ocean`),
 * stable across downloads for a given candidate via pickStyle().
 *
 * RTL: when the CV's own content language (cvLang, independent of the app's
 * French UI) is Arabic, the root gets dir="rtl" and every layout uses logical
 * CSS properties so it mirrors automatically, with no letter-spacing/uppercase.
 */

export interface WorkEntry {
  company: string;
  title: string;
  city?: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  // Additive — Moroccan diploma level (Bac | Bac+2 | Bac+3 | Bac+5 | Bac+8),
  // shown as a pill next to the degree. Auto-derived if not set explicitly.
  level?: string;
  startYear?: string;
  note?: string;
}

export const LANG_FLAGS: Record<string, string> = {
  'Français': '', 'Anglais': '', 'Arabe': '', 'Espagnol': '',
  'Allemand': '', 'Néerlandais': '', 'Italien': '', 'Portugais': '',
};

// All CV fields are user-typed or AI-generated free text — escape before
// interpolating into HTML so stray `<`, `&`, `"` never break the layout
// (or, worse, inject markup) in the exported/printed document.
export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// AI-generated CV text occasionally leaks markdown syntax (**bold**, # headers)
// or a redundant leading bullet marker ("- ") even when explicitly told to
// return plain text — both look broken in a printed CV. Strip them before the
// text ever reaches a template.
export function cleanAIText(s: string): string {
  return String(s ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-•*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function descToBulletList(text: string, e: (s: string) => string): string {
  if (!text.trim()) return '';
  const lines = text.split(/\n|•|·/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    const sents = text.split(/\.\s+/).map(l => l.trim()).filter(l => l.length > 10);
    if (sents.length > 1) return sents.map(s => `<li>${e(s.replace(/\.$/, ''))}.</li>`).join('');
    return `<li>${e(text)}</li>`;
  }
  return lines.map(l => `<li>${e(l)}</li>`).join('');
}

// Kept for callers that only need bullet markup with default escaping.
export function descToBullets(text: string): string {
  return descToBulletList(text, escapeHtml);
}

/* ── Moroccan diploma-level mapping (spec §3/§6) ─────────────────────────
   Intentionally separate from lib/matching.ts's inferEducationLevel(), which
   returns a DIFFERENT label vocabulary ("Licence (Bac+3)", "Doctorat"...) for
   job-matching — that function and its EDU_LEVELS enum are left untouched so
   matching scores never change. This one is purely for CV display. */
export function inferDiplomaLevel(degree: string): string {
  const d = (degree || '').toLowerCase();
  if (/doctorat|phd|ph\.?d/.test(d)) return 'Bac+8';
  if (/master|ingénieur|ingenieur d'[ée]tat|encg|iscae|bac\s*\+?\s*5/.test(d)) return 'Bac+5';
  if (/licence|bac\s*\+?\s*3/.test(d)) return 'Bac+3';
  if (/bts|dut|deug|technicien sp[ée]cialis[ée]|ofppt|bac\s*\+?\s*2/.test(d)) return 'Bac+2';
  if (/baccalaur[ée]at|^bac\b/.test(d)) return 'Bac';
  return '';
}
export const DIPLOMA_LEVELS = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Bac+8'] as const;

/* ── Palettes (spec §5) ───────────────────────────────────────────────── */
export interface CVPalette { id: string; name: string; hex: string; }
export const CV_PALETTES: CVPalette[] = [
  { id: 'marine',    name: 'Marine',    hex: '#1E3A5F' },
  { id: 'majorelle', name: 'Majorelle', hex: '#2E4FD8' },
  { id: 'emeraude',  name: 'Émeraude',  hex: '#0F766E' },
  { id: 'bordeaux',  name: 'Bordeaux',  hex: '#8B1E2D' },
  { id: 'foret',     name: 'Forêt',     hex: '#1F6B3A' },
  { id: 'graphite',  name: 'Graphite',  hex: '#3A4250' },
  { id: 'sienne',    name: 'Sienne',    hex: '#9A3B12' },
  { id: 'prune',     name: 'Prune',     hex: '#5E2B5C' },
  { id: 'ocean',     name: 'Océan',     hex: '#0B6E8A' },
  { id: 'ardoise',   name: 'Ardoise',   hex: '#3E5A73' },
];

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const mixWhite = (hex: string, t: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * t));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
};

/* ── Layouts (spec §5) ────────────────────────────────────────────────── */
export interface CVLayoutPhoto { shape: 'rect' | 'circle' | 'rounded' | 'id'; w: number; h: number; }
export interface CVLayout {
  id: string; cls: string; name: string; sector: string;
  font: string; headingFont?: string; arabicFont: string;
  photo: CVLayoutPhoto | null; // null = never (ats)
  structure: string;
  sectionOrder: string[];
}
export const CV_LAYOUTS: CVLayout[] = [
  { id: 'classique', cls: 'L1', name: 'Classique', sector: 'Banque & Finance',
    font: "'Source Sans 3',Arial,sans-serif", arabicFont: "'Tajawal',Tahoma,sans-serif",
    photo: { shape: 'rect', w: 96, h: 114 }, structure: '1 colonne + bas en 2 colonnes',
    sectionOrder: ['profile', 'experience', 'education', 'skills', 'languages', 'certifications'] },
  { id: 'colonne', cls: 'L2', name: 'Colonne', sector: 'Tech & Digital',
    font: "'IBM Plex Sans',Arial,sans-serif", arabicFont: "'Cairo',Tahoma,sans-serif",
    photo: { shape: 'circle', w: 122, h: 122 }, structure: 'barre latérale 262px + contenu',
    sectionOrder: ['contact', 'skills', 'languages', 'availability', 'profile', 'experience', 'education', 'certifications', 'interests'] },
  { id: 'bandeau', cls: 'L3', name: 'Bandeau', sector: 'Commercial & Vente',
    font: "'Lato',Arial,sans-serif", arabicFont: "'Tajawal',Tahoma,sans-serif",
    photo: { shape: 'circle', w: 106, h: 106 }, structure: 'bandeau + 2 colonnes',
    sectionOrder: ['profile', 'experience', 'education', 'skills', 'languages', 'certifications', 'availability', 'interests'] },
  { id: 'ats', cls: 'L4', name: 'ATS Pur', sector: 'Multinationales',
    font: "'Arimo',Arial,sans-serif", arabicFont: "'Noto Sans Arabic',Tahoma,sans-serif",
    photo: null, structure: '1 colonne, sans icônes',
    sectionOrder: ['profile', 'experience', 'education', 'skills', 'languages', 'certifications'] },
  { id: 'executif', cls: 'L5', name: 'Exécutif', sector: 'Direction & Management',
    font: "'Inter',Arial,sans-serif", headingFont: "'Source Serif 4',Georgia,serif", arabicFont: "'Noto Naskh Arabic',serif",
    photo: { shape: 'circle', w: 86, h: 86 }, structure: 'titres en marge 148px + contenu',
    sectionOrder: ['profile', 'experience', 'education', 'skills', 'languages', 'certifications'] },
  { id: 'chronologie', cls: 'L6', name: 'Chronologie', sector: 'Ingénierie & Industrie',
    font: "'Barlow',Arial,sans-serif", arabicFont: "'Cairo',Tahoma,sans-serif",
    photo: { shape: 'rounded', w: 98, h: 98 }, structure: '1 colonne + bas en 3 colonnes',
    sectionOrder: ['profile', 'experience', 'education', 'skills', 'languages', 'certifications', 'interests'] },
  { id: 'duo', cls: 'L7', name: 'Duo', sector: 'Relation client & BPO',
    font: "'Nunito Sans',Arial,sans-serif", arabicFont: "'Tajawal',Tahoma,sans-serif",
    photo: { shape: 'circle', w: 94, h: 94 }, structure: '2 colonnes',
    sectionOrder: ['profile', 'experience', 'languages', 'skills', 'education', 'availability'] },
  { id: 'premier-pas', cls: 'L8', name: 'Premier pas', sector: 'Jeunes diplômés & Stages',
    font: "'DM Sans',Arial,sans-serif", arabicFont: "'Cairo',Tahoma,sans-serif",
    photo: { shape: 'circle', w: 106, h: 106 }, structure: 'centré + bas en 2 colonnes',
    sectionOrder: ['profile', 'education', 'experience', 'skills', 'languages', 'interests', 'certifications'] },
  { id: 'institution', cls: 'L9', name: 'Institution', sector: 'Fonction publique & ONG',
    font: "'Source Sans 3',Arial,sans-serif", headingFont: "'Libre Baskerville',Georgia,serif", arabicFont: "'Noto Naskh Arabic',serif",
    photo: { shape: 'id', w: 90, h: 112 }, structure: '1 colonne + infos personnelles',
    sectionOrder: ['personal', 'profile', 'experience', 'education', 'skills', 'languages', 'certifications'] },
  { id: 'accueil', cls: 'L10', name: 'Accueil', sector: 'Tourisme, Santé & Éducation',
    font: "'Karla',Arial,sans-serif", arabicFont: "'Tajawal',Tahoma,sans-serif",
    photo: { shape: 'rounded', w: 150, h: 170 }, structure: 'contenu + barre latérale claire 252px',
    sectionOrder: ['profile', 'experience', 'education', 'certifications', 'contact', 'languages', 'skills', 'availability', 'interests'] },
];

const LAYOUT_BY_ID: Record<string, CVLayout> = Object.fromEntries(CV_LAYOUTS.map(l => [l.id, l]));
const PALETTE_BY_ID: Record<string, CVPalette> = Object.fromEntries(CV_PALETTES.map(p => [p.id, p]));

/* ── Template id ("tm-<layout>-<palette>") ───────────────────────────────── */
export function templateId(layout: string, palette: string): string { return `tm-${layout}-${palette}`; }

export interface CVStyle { templateId: string; }

// Small, well-distributed integer hash — deterministic across runs so the
// same candidate always lands on the same style unless they explicitly
// change it, while different candidates spread across the full combo space.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickStyle(seed: string): CVStyle {
  const h = hashString(seed || 'talentmap');
  const layout = CV_LAYOUTS[h % CV_LAYOUTS.length].id;
  const palette = CV_PALETTES[Math.floor(h / CV_LAYOUTS.length) % CV_PALETTES.length].id;
  return { templateId: templateId(layout, palette) };
}

export function parseTemplateId(id: string | undefined): { layout: CVLayout; palette: CVPalette } {
  for (const p of CV_PALETTES) {
    const suffix = `-${p.id}`;
    if (id && id.endsWith(suffix) && id.startsWith('tm-')) {
      const layoutId = id.slice(3, -suffix.length);
      const layout = LAYOUT_BY_ID[layoutId];
      if (layout) return { layout, palette: p };
    }
  }
  const auto = pickStyle('talentmap');
  return parseTemplateId(auto.templateId);
}

// Sector → best-matching layout, used to seed the "5 best design suggestions"
// shown right after a CV is generated (upload or template flow). Candidates
// are never limited to these 5 — the full 100-combo gallery stays available
// on the preview step — this is just a fast, sensible starting shortlist.
const SECTOR_LAYOUT_PREFERENCE: Record<string, string> = {
  Technology: 'colonne', 'Data Science': 'colonne', Finance: 'classique', Marketing: 'bandeau',
  Design: 'colonne', Operations: 'chronologie', BTP: 'chronologie', Tourisme: 'accueil',
  'Agro-alimentaire': 'chronologie', Healthcare: 'accueil', Other: 'classique',
};

// Picks 5 distinct, well-distributed layout/palette combos: the candidate's
// deterministic auto-pick first (sector-matched layout + their stable
// auto-assigned palette), then 4 more diverse combos with palettes varied
// deterministically from the seed so the same candidate always sees the
// same 5 options until they explicitly change sector.
export function suggestTopTemplates(sector: string, seed: string): { layout: string; palette: string }[] {
  const preferred = SECTOR_LAYOUT_PREFERENCE[sector] || 'classique';
  const auto = parseTemplateId(pickStyle(seed).templateId);
  const candidateLayouts = [preferred, 'ats', 'executif', 'duo', 'institution', ...CV_LAYOUTS.map(l => l.id)];
  const uniqueLayouts: string[] = [];
  for (const id of candidateLayouts) {
    if (uniqueLayouts.includes(id) || !LAYOUT_BY_ID[id]) continue;
    uniqueLayouts.push(id);
    if (uniqueLayouts.length >= 5) break;
  }
  return uniqueLayouts.map((layoutId, i) => {
    if (i === 0) return { layout: layoutId, palette: auto.palette.id };
    const palette = CV_PALETTES[hashString(`${seed}:${layoutId}`) % CV_PALETTES.length].id;
    return { layout: layoutId, palette };
  });
}

/* ── Trilingual section labels (CV content language ≠ app UI language) ──── */
interface Labels {
  profile: string; exp: string; intern: string; edu: string; skills: string; langs: string;
  certs: string; interests: string; contact: string; personal: string; avT: string; av: string;
  mob: string; birth: string; marital: string; nat: string; lic: string; sep: string; list: string;
}
const LBL: Record<'fr' | 'ar' | 'en', Labels> = {
  fr: { profile: 'Profil', exp: 'Expérience professionnelle', intern: 'Stages et expériences', edu: 'Formation',
    skills: 'Compétences', langs: 'Langues', certs: 'Certifications', interests: "Centres d'intérêt",
    contact: 'Contact', personal: 'Informations personnelles', avT: 'Disponibilité et mobilité',
    av: 'Disponibilité', mob: 'Mobilité', birth: 'Date de naissance', marital: 'Situation familiale',
    nat: 'Nationalité', lic: 'Permis', sep: ' : ', list: ', ' },
  en: { profile: 'Profile', exp: 'Professional experience', intern: 'Internships and experience', edu: 'Education',
    skills: 'Skills', langs: 'Languages', certs: 'Certifications', interests: 'Interests',
    contact: 'Contact', personal: 'Personal details', avT: 'Availability and mobility',
    av: 'Availability', mob: 'Mobility', birth: 'Date of birth', marital: 'Marital status',
    nat: 'Nationality', lic: 'Driving licence', sep: ': ', list: ', ' },
  ar: { profile: 'الملف الشخصي', exp: 'الخبرة المهنية', intern: 'التداريب والخبرات', edu: 'التكوين',
    skills: 'المهارات', langs: 'اللغات', certs: 'الشهادات', interests: 'الاهتمامات',
    contact: 'التواصل', personal: 'معلومات شخصية', avT: 'التوفر والتنقل',
    av: 'التوفر', mob: 'التنقل', birth: 'تاريخ الازدياد', marital: 'الحالة العائلية',
    nat: 'الجنسية', lic: 'رخصة السياقة', sep: ': ', list: '، ' },
};

/* ── CV data contract ─────────────────────────────────────────────────── */
export interface CVTemplateData {
  name: string; email: string; phone: string; address: string; idNumber: string;
  // Target job title / professional headline, shown under the name in every
  // layout (e.g. "Chargée de marketing digital"). Falls back to targetRoles[0]
  // or sector if not set.
  title?: string;
  summary: string; skills: string[]; languages: string[];
  // Optional proficiency level per language (e.g. "Anglais" -> "Courant"),
  // keyed by the exact language string as it appears in `languages`. Purely
  // additive — matching (lib/matching.ts) still reads plain `languages: string[]`.
  languageLevels?: Record<string, string>;
  experience: string; sector: string;
  work: WorkEntry[]; education: Education[];
  targetRoles?: string[]; certifications?: string[]; interests?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
  // Moroccan-market optional personal fields (spec §3) — rendered only when
  // provided; never collected/shown for CIN, CNSS, passport, salary, religion,
  // health or political views (not fields on this type at all).
  birthDate?: string; maritalStatus?: string; nationality?: string; drivingLicense?: string;
  availability?: string; mobility?: string;
  // CV content language — independent of the (French-only) app UI.
  cvLang?: 'fr' | 'ar' | 'en';
  // When true: experience section titled "Stages et expériences"; in
  // premier-pas, education is shown before experience (spec §5 behaviour rule).
  isJunior?: boolean;
}

/* ── Render helpers (ported from Appendix A) ─────────────────────────── */
const E = <T,>(a: T[] | undefined, f: (x: T) => string): string => (a || []).map(f).join('');

function dates(s: string, e: string): string { return s ? `${s} – ${e}` : e; }

function sec(title: string, body: string, extraClass = ''): string {
  if (!body) return '';
  return `<section class="s ${extraClass}"><h3>${title}</h3><div class="sb">${body}</div></section>`;
}

const ICON = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
};

function expTitle(d: CVTemplateData, L: Labels): string { return d.isJunior ? L.intern : L.exp; }

function expHtml(d: CVTemplateData, e: (s: string) => string): string {
  return E(d.work, w => `<div class="it"><div class="row"><div><div class="role">${e(w.title)}</div><div class="org">${e(w.company)}${w.city ? `, ${e(w.city)}` : ''}</div></div><div class="date">${dates(e(w.startDate), e(w.endDate))}</div></div><ul>${descToBullets(w.description)}</ul></div>`);
}
function eduHtml(d: CVTemplateData, e: (s: string) => string): string {
  return E(d.education, x => `<div class="it"><div class="row"><div><div class="role">${e(x.degree)}${x.level ? `<span class="lvl">${e(x.level)}</span>` : ''}</div><div class="org">${e(x.institution)}</div>${x.note ? `<div class="note">${e(x.note)}</div>` : ''}</div><div class="date">${dates(e(x.startYear || ''), e(x.year))}</div></div></div>`);
}
function pillsHtml(d: CVTemplateData, e: (s: string) => string): string {
  return `<div class="pills">${E(d.skills, s => `<span>${e(s)}</span>`)}</div>`;
}
function tagsHtml(d: CVTemplateData, e: (s: string) => string): string {
  return `<div class="tags">${E(d.skills, s => `<span>${e(s)}</span>`)}</div>`;
}
const LEVEL_DOTS: Record<string, number> = {
  'Débutant': 1, 'Intermédiaire': 2, 'Avancé': 3, 'Courant': 4, 'Langue maternelle': 5,
};
function dotsHtml(v: number): string {
  return `<span class="dots">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= v ? 'on' : ''}"></i>`).join('')}</span>`;
}
function langDots(d: CVTemplateData, e: (s: string) => string): string {
  return E(d.languages, name => {
    const level = d.languageLevels?.[name];
    const v = level ? (LEVEL_DOTS[level] || 0) : 0;
    return `<div class="lang"><span>${e(name)}</span>${dotsHtml(v)}</div>`;
  });
}
function langText(d: CVTemplateData, e: (s: string) => string): string {
  return E(d.languages, name => {
    const level = d.languageLevels?.[name];
    return `<div class="lang"><span>${e(name)}</span>${level ? `<span class="note">${e(level)}</span>` : ''}</div>`;
  });
}
function certHtml(d: CVTemplateData, e: (s: string) => string): string {
  if (!d.certifications?.length) return '';
  return `<ul class="plain">${E(d.certifications, c => `<li>${e(c)}</li>`)}</ul>`;
}
function intHtml(d: CVTemplateData, L: Labels, e: (s: string) => string): string {
  if (!d.interests?.length) return '';
  return `<p>${d.interests.map(e).join(L.list)}</p>`;
}
function ctsHtml(d: CVTemplateData, e: (s: string) => string): string {
  return [
    d.email && `<span class="ct">${ICON.mail}<span dir="ltr">${e(d.email)}</span></span>`,
    d.phone && `<span class="ct">${ICON.phone}<span dir="ltr">${e(d.phone)}</span></span>`,
    d.address && `<span class="ct">${ICON.pin}${e(d.address)}</span>`,
    d.linkedin && `<span class="ct">${ICON.link}<span dir="ltr">${e(d.linkedin)}</span></span>`,
    d.portfolio && `<span class="ct">${ICON.link}<span dir="ltr">${e(d.portfolio)}</span></span>`,
  ].filter(Boolean).join('');
}
function avHtml(d: CVTemplateData, L: Labels, e: (s: string) => string): string {
  if (!d.availability && !d.mobility) return '';
  return [
    d.availability && `<span>${L.av}${L.sep}${e(d.availability)}</span>`,
    d.mobility && `<span>${L.mob}${L.sep}${e(d.mobility)}</span>`,
  ].filter(Boolean).join('');
}
function personalKv(d: CVTemplateData, L: Labels, e: (s: string) => string): string {
  const kv = ([
    [L.birth, d.birthDate], [L.marital, d.maritalStatus], [L.nat, d.nationality], [L.lic, d.drivingLicense],
    [L.av, d.availability], [L.mob, d.mobility],
  ] as [string, string | undefined][]).filter((pair): pair is [string, string] => !!pair[1]);
  if (!kv.length) return '';
  return `<div class="kv">${E(kv, ([k, v]) => `<div><b>${k}</b><span>${e(v)}</span></div>`)}</div>`;
}

// Photo: real candidate photo (object-fit crops it to the layout's frame via
// CSS), or an initials placeholder when none was provided. Never rendered at
// all for the `ats` layout (spec: "never" a photo, regardless of showPhoto).
function photoHtml(d: CVTemplateData, accentHex: string, layout: CVLayout, showPhoto: boolean): string {
  if (!layout.photo || !showPhoto) return '';
  const e = escapeHtml;
  if (d.photo) return `<img class="ph" alt="" src="${e(d.photo)}">`;
  const initials = (d.name || '').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  const bg = mixWhite(accentHex, .86);
  return `<div class="ph" style="background:${bg};color:${accentHex};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${Math.round(layout.photo.h * .32)}px">${e(initials)}</div>`;
}

/* ── Layout render functions (R.L1 .. R.L10), ported from Appendix A ────── */
type Renderer = (d: CVTemplateData, L: Labels, ph: string, e: (s: string) => string) => string;

const R: Record<string, Renderer> = {
  L1: (d, L, ph, e) => `<header><div><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div><div class="cts">${ctsHtml(d, e)}</div><div class="av">${avHtml(d, L, e)}</div></div>${ph}</header>
${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}
<div class="g2">${sec(L.skills, pillsHtml(d, e))}<div>${sec(L.langs, langText(d, e))}${sec(L.certs, certHtml(d, e))}</div></div>`,

  L2: (d, L, ph, e) => `<aside>${ph}<h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div>${sec(L.contact, ctsHtml(d, e))}${sec(L.skills, pillsHtml(d, e))}${sec(L.langs, langDots(d, e))}${sec(L.avT, avHtml(d, L, e) ? `<div class="av">${avHtml(d, L, e)}</div>` : '')}</aside>
<main>${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}${sec(L.certs, certHtml(d, e))}${sec(L.interests, intHtml(d, L, e))}</main>`,

  L3: (d, L, ph, e) => `<header>${ph}<div><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div><div class="cts">${ctsHtml(d, e)}</div></div></header>
<div class="body"><div>${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}</div>
<div class="side">${sec(L.skills, pillsHtml(d, e))}${sec(L.langs, langText(d, e))}${sec(L.certs, certHtml(d, e))}${sec(L.avT, avHtml(d, L, e) ? `<div class="av">${avHtml(d, L, e)}</div>` : '')}${sec(L.interests, intHtml(d, L, e))}</div></div>`,

  L4: (d, L, _ph, e) => `<h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div>
<div class="cts">${[d.email && `<span dir="ltr">${e(d.email)}</span>`, d.phone && `<span dir="ltr">${e(d.phone)}</span>`, d.address && e(d.address), d.linkedin && `<span dir="ltr">${e(d.linkedin)}</span>`].filter(Boolean).join(' | ')}</div>
${(d.availability || d.mobility) ? `<div class="cts">${[d.availability && `${L.av}${L.sep}${e(d.availability)}`, d.mobility && `${L.mob}${L.sep}${e(d.mobility)}`].filter(Boolean).join(' | ')}</div>` : ''}
${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}${sec(L.skills, d.skills.length ? `<p>${d.skills.map(e).join(L.list)}</p>` : '')}
${sec(L.langs, d.languages.length ? `<p>${d.languages.map(n => `${e(n)}${d.languageLevels?.[n] ? L.sep + e(d.languageLevels[n]) : ''}`).join(L.list)}</p>` : '')}${sec(L.certs, d.certifications?.length ? `<p>${d.certifications.map(e).join(L.list)}</p>` : '')}`,

  L5: (d, L, ph, e) => `<header><div class="hl">${ph}<div><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div></div></div><div class="cts">${ctsHtml(d, e)}${d.mobility ? `<span>${e(d.mobility)}</span>` : ''}</div></header>
${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}${sec(L.skills, tagsHtml(d, e))}${sec(L.langs, langText(d, e))}${sec(L.certs, certHtml(d, e))}`,

  L6: (d, L, ph, e) => `<header>${ph}<div><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div><div class="cts">${ctsHtml(d, e)}</div><div class="av">${avHtml(d, L, e)}</div></div></header>
${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e), 'tl')}${sec(L.edu, eduHtml(d, e), 'tl')}
<div class="g3">${sec(L.skills, tagsHtml(d, e))}${sec(L.langs, langText(d, e))}<div>${sec(L.certs, certHtml(d, e))}${sec(L.interests, intHtml(d, L, e))}</div></div>`,

  L7: (d, L, ph, e) => `<header><div><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div><div class="cts">${ctsHtml(d, e)}</div></div>${ph}</header>
<div class="cols"><div>${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}</div>
<div>${sec(L.langs, langDots(d, e), 'lb')}${sec(L.skills, pillsHtml(d, e))}${sec(L.edu, eduHtml(d, e))}${avHtml(d, L, e) ? `<div class="box">${avHtml(d, L, e)}</div>` : ''}</div></div>`,

  L8: (d, L, ph, e) => `<header>${ph}<h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div><div class="cts">${ctsHtml(d, e)}</div><div class="av">${avHtml(d, L, e)}</div></header>
${d.summary ? `<p class="sum">${e(d.summary)}</p>` : ''}${sec(L.edu, eduHtml(d, e))}${sec(expTitle(d, L), expHtml(d, e))}
<div class="cols">${sec(L.skills, pillsHtml(d, e))}<div>${sec(L.langs, langDots(d, e))}${sec(L.certs, certHtml(d, e))}${sec(L.interests, intHtml(d, L, e))}</div></div>`,

  L9: (d, L, ph, e) => `<header><div><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div><div class="cts">${ctsHtml(d, e)}</div></div>${ph}</header>
${sec(L.personal, personalKv(d, L, e))}
${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}
<div class="g2">${sec(L.skills, pillsHtml(d, e))}<div>${sec(L.langs, langText(d, e))}${sec(L.certs, certHtml(d, e))}</div></div>`,

  L10: (d, L, ph, e) => `<main><h1>${e(d.name)}</h1><div class="tt">${e(d.title || '')}</div>${sec(L.profile, d.summary ? `<p>${e(d.summary)}</p>` : '')}${sec(expTitle(d, L), expHtml(d, e))}${sec(L.edu, eduHtml(d, e))}${sec(L.certs, certHtml(d, e))}</main>
<aside>${ph}${sec(L.contact, ctsHtml(d, e))}${sec(L.langs, langDots(d, e))}${sec(L.skills, pillsHtml(d, e))}${sec(L.avT, avHtml(d, L, e) ? `<div class="av">${avHtml(d, L, e)}</div>` : '')}${sec(L.interests, intHtml(d, L, e))}</aside>`,
};

/* ── Base CSS (ported verbatim from Appendix A's `.cv` + `.L1`-`.L10`) ──── */
const BASE_CSS = `
.cv{width:794px;min-height:1123px;background:#fff;color:#1F2937;font-family:var(--f);font-size:12.5px;line-height:1.42;position:relative;text-align:start;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cv[dir="rtl"]{font-family:var(--fa);font-size:13px;line-height:1.62}
.cv[dir="rtl"] *{letter-spacing:0!important;text-transform:none!important}
.cv[dir="rtl"] h1,.cv[dir="rtl"] h3{font-family:var(--fa)!important;font-style:normal!important}
.cv *{box-sizing:border-box;margin:0;padding:0}
.cv h1,.cv h3{font-family:var(--h,var(--f))}
.cv p{margin:0}
.cv ul{padding-inline-start:16px;margin-top:4px}
.cv li{margin-bottom:2px}
.cv li::marker{color:var(--acc)}
.cv .row{display:flex;justify-content:space-between;align-items:baseline;gap:14px}
.cv .role{font-weight:700;color:#111827}
.cv .org{color:#4B5563;font-size:12px}
.cv .date{white-space:nowrap;color:#6B7280;font-size:11.5px;flex-shrink:0}
.cv .it{margin-bottom:10px;break-inside:avoid;page-break-inside:avoid}
.cv .it:last-child{margin-bottom:0}
.cv .note{font-size:11.5px;color:#6B7280}
.cv .lvl{font-size:10.5px;font-weight:700;color:var(--acc);background:var(--soft);padding:1px 6px;border-radius:3px;margin-inline-start:7px;white-space:nowrap;display:inline-block;line-height:1.5;vertical-align:1px}
.cv .pills{display:flex;flex-wrap:wrap;gap:5px}
.cv .pills span{font-size:11.5px;padding:3px 9px;border-radius:999px;background:var(--soft);color:var(--acc);font-weight:600;line-height:1.4}
.cv .tags{display:flex;flex-wrap:wrap;gap:5px}
.cv .tags span{border:1px solid #D1D5DB;border-radius:4px;padding:2px 7px;font-size:11.5px;color:#374151}
.cv .lang{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:5px}
.cv .dots{display:inline-flex;gap:3px;flex-shrink:0}
.cv .dots i{width:7px;height:7px;border-radius:50%;background:var(--mid)}
.cv .dots i.on{background:var(--acc)}
.cv .ct{display:inline-flex;align-items:center;gap:6px}
.cv .ct svg{width:12px;height:12px;flex-shrink:0;color:var(--acc)}
.cv .ph{display:block;object-fit:cover;flex-shrink:0}
.cv .plain{list-style:none;padding:0}
.cv .plain li{margin-bottom:3px}
.cv .s{break-inside:avoid-page}
.cv .s:empty,.cv section.s:has(.sb:empty){display:none}
/* 1 Classique */
.L1{padding:48px 56px}
.L1 header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding-bottom:16px;border-bottom:2px solid var(--acc);margin-bottom:18px}
.L1 h1{font-size:31px;font-weight:700;color:var(--acc);letter-spacing:-.01em;line-height:1.1}
.L1 .tt{font-size:15px;color:#374151;margin:5px 0 10px;font-weight:600}
.L1 .cts,.L1 .av{display:flex;flex-wrap:wrap;gap:4px 18px;font-size:11.5px;color:#4B5563}
.L1 .av{margin-top:5px}
.L1 .ph{width:96px;height:114px;border-radius:4px}
.L1 h3{font-size:12.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--acc);font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #E5E7EB}
.L1 .s{margin-bottom:16px}
.L1 .g2{display:grid;grid-template-columns:1fr 1fr;gap:28px}
/* 2 Colonne */
.L2{display:grid;grid-template-columns:262px 1fr}
.L2 aside{background:var(--acc);color:#fff;padding:42px 26px}
.L2 aside .ph{width:122px;height:122px;border-radius:50%;margin:0 auto 20px;border:3px solid rgba(255,255,255,.35)}
.L2 aside h1{font-size:25px;line-height:1.15;font-weight:700}
.L2 aside .tt{font-size:13px;opacity:.85;margin:6px 0 4px}
.L2 aside h3{font-size:11.5px;text-transform:uppercase;letter-spacing:.12em;opacity:.72;margin:22px 0 9px;font-weight:600}
.L2 aside .ct{display:flex;font-size:11.5px;margin-bottom:6px;word-break:break-word}
.L2 aside .ct svg{color:#fff;opacity:.8}
.L2 aside .pills span{background:rgba(255,255,255,.14);color:#fff}
.L2 aside .dots i{background:rgba(255,255,255,.25)}.L2 aside .dots i.on{background:#fff}
.L2 aside .av span{display:block;font-size:11.5px;opacity:.9;margin-bottom:3px}
.L2 main{padding:46px 40px}
.L2 main h3{font-size:15px;color:var(--acc);font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:10px}
.L2 main h3::after{content:"";flex:1;height:1px;background:#E5E7EB}
.L2 main .s{margin-bottom:18px}
/* 3 Bandeau */
.L3 header{background:var(--acc);color:#fff;padding:38px 52px 34px;display:flex;align-items:center;gap:26px}
.L3 .ph{width:106px;height:106px;border-radius:50%;border:4px solid rgba(255,255,255,.9)}
.L3 h1{font-size:31px;font-weight:900;letter-spacing:-.01em;line-height:1.1}
.L3 .tt{font-size:15px;opacity:.9;margin:3px 0 12px}
.L3 .cts{display:flex;flex-wrap:wrap;gap:4px 18px;font-size:11.5px}
.L3 .cts svg{color:#fff;opacity:.85}
.L3 .body{display:grid;grid-template-columns:1fr 232px;gap:32px;padding:30px 52px}
.L3 h3{font-size:12.5px;font-weight:900;color:var(--acc);margin-bottom:8px;text-transform:uppercase;letter-spacing:.07em}
.L3 .s{margin-bottom:18px}
.L3 .side{border-inline-start:1px solid #E5E7EB;padding-inline-start:24px}
.L3 .side .pills span{background:transparent;border:1px solid var(--acc)}
.L3 .av span{display:block;margin-bottom:3px}
/* 4 ATS */
.L4{padding:50px 62px}
.L4 h1{font-size:26px;font-weight:700;color:#111827;line-height:1.15}
.L4 .tt{font-size:14px;color:var(--acc);font-weight:700;margin:3px 0 6px}
.L4 .cts{font-size:12px;color:#374151}
.L4 h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#111827;border-bottom:1.5px solid var(--acc);padding-bottom:3px;margin:16px 0 8px}
/* 5 Exécutif */
.L5{padding:58px 62px}
.L5 header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:26px}
.L5 .hl{display:flex;align-items:center;gap:20px}
.L5 .ph{width:86px;height:86px;border-radius:50%}
.L5 h1{font-size:38px;font-weight:600;line-height:1.05;color:#111827;letter-spacing:-.015em}
.L5 .tt{font-size:12px;color:var(--acc);font-weight:700;margin-top:9px;text-transform:uppercase;letter-spacing:.14em}
.L5 .cts{display:flex;flex-direction:column;align-items:flex-end;gap:3px;font-size:11.5px;color:#4B5563}
.L5 .s{display:grid;grid-template-columns:148px 1fr;gap:24px;padding:15px 0;border-top:1px solid #E5E7EB}
.L5 h3{font-size:16px;font-weight:600;color:var(--acc);font-style:italic;line-height:1.3}
/* 6 Chronologie */
.L6{padding:46px 54px}
.L6 header{display:flex;gap:22px;align-items:center;margin-bottom:22px}
.L6 .ph{width:98px;height:98px;border-radius:14px}
.L6 h1{font-size:31px;font-weight:700;color:#111827;line-height:1.1}
.L6 .tt{font-size:15px;color:var(--acc);font-weight:600;margin:3px 0 8px}
.L6 .cts,.L6 .av{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:11.5px;color:#4B5563}
.L6 .av{margin-top:4px}
.L6 h3{font-size:14.5px;font-weight:700;color:var(--acc);margin-bottom:10px;display:flex;align-items:center;gap:9px}
.L6 h3::before{content:"";width:18px;height:3px;background:var(--acc);border-radius:2px}
.L6 .tl .it{position:relative;padding-inline-start:24px;margin-bottom:12px}
.L6 .tl .it::before{content:"";position:absolute;inset-inline-start:4px;top:9px;bottom:-16px;width:2px;background:var(--mid)}
.L6 .tl .it::after{content:"";position:absolute;inset-inline-start:0;top:4px;width:10px;height:10px;border-radius:50%;background:#fff;border:2.5px solid var(--acc)}
.L6 .tl .it:last-child::before{display:none}
.L6 .s{margin-bottom:16px}
.L6 .g3{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:24px}
/* 7 Duo */
.L7{padding:44px 50px}
.L7 header{border-inline-start:6px solid var(--acc);padding-inline-start:18px;display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px}
.L7 h1{font-size:29px;font-weight:800;color:#111827;line-height:1.1}
.L7 .tt{font-size:14px;color:var(--acc);font-weight:700;margin-top:3px}
.L7 .cts{display:grid;grid-template-columns:auto auto;justify-content:start;gap:3px 20px;font-size:11.5px;color:#4B5563;margin-top:9px}
.L7 .ph{width:94px;height:94px;border-radius:50%}
.L7 .cols{display:grid;grid-template-columns:1.45fr 1fr;gap:30px}
.L7 h3{font-size:13.5px;font-weight:800;color:#111827;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid var(--mid)}
.L7 .s{margin-bottom:16px}
.L7 .lb .lang{font-size:13px;padding:5px 0;border-bottom:1px dashed #E5E7EB;margin:0}
.L7 .box{background:var(--soft);border-radius:8px;padding:12px 14px;font-size:12px}
.L7 .box span{display:block;margin-bottom:3px}
/* 8 Premier pas */
.L8{padding:42px 56px}
.L8 header{text-align:center;margin-bottom:18px}
.L8 .ph{width:106px;height:106px;border-radius:50%;margin:0 auto 12px;border:3px solid var(--mid)}
.L8 h1{font-size:31px;font-weight:700;color:#111827;line-height:1.1}
.L8 .tt{display:inline-block;margin:8px 0 10px;font-size:13.5px;color:var(--acc);background:var(--soft);padding:3px 14px;border-radius:999px;font-weight:700}
.L8 .cts,.L8 .av{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 16px;font-size:11.5px;color:#4B5563}
.L8 .av{margin-top:4px}
.L8 .sum{text-align:center;max-width:610px;margin:0 auto 20px;color:#374151}
.L8 h3{font-size:14.5px;font-weight:700;color:var(--acc);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--soft)}
.L8 .s{margin-bottom:16px}
.L8 .cols{display:grid;grid-template-columns:1fr 1fr;gap:30px}
/* 9 Institution */
.L9{padding:46px 58px}
.L9 header{border-top:4px solid var(--acc);border-bottom:1px solid var(--acc);padding:18px 0;display:flex;justify-content:space-between;gap:22px;align-items:center;margin-bottom:18px}
.L9 h1{font-size:25px;color:#111827;font-weight:700;line-height:1.2}
.L9 .tt{font-size:14px;color:var(--acc);margin:5px 0 8px;font-weight:700}
.L9 .cts{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:11.5px;color:#4B5563}
.L9 .ph{width:90px;height:112px;border:1px solid #D1D5DB;padding:3px;background:#fff}
.L9 h3{font-family:var(--f);font-size:12px;font-weight:700;color:var(--acc);background:var(--soft);padding:5px 10px;margin-bottom:9px;text-transform:uppercase;letter-spacing:.07em}
.L9 .kv{display:grid;grid-template-columns:1fr 1fr;gap:4px 28px;font-size:12px}
.L9 .kv div{display:flex;gap:8px}
.L9 .kv b{color:#6B7280;font-weight:400;min-width:118px}
.L9 .s{margin-bottom:14px}
.L9 .g2{display:grid;grid-template-columns:1fr 1fr;gap:28px}
/* 10 Accueil */
.L10{display:grid;grid-template-columns:1fr 252px}
.L10 main{padding-block:48px 40px;padding-inline:52px 34px}
.L10 aside{background:var(--soft);padding:48px 26px}
.L10 aside .ph{width:150px;height:170px;border-radius:12px;margin-bottom:22px}
.L10 h1{font-size:33px;font-weight:700;color:var(--acc);line-height:1.08;letter-spacing:-.01em}
.L10 .tt{font-size:15px;color:#374151;margin:7px 0 20px;font-weight:600}
.L10 h3{font-size:13.5px;font-weight:700;color:var(--acc);margin-bottom:8px}
.L10 main h3{border-bottom:1px solid var(--mid);padding-bottom:4px}
.L10 .s{margin-bottom:17px}
.L10 aside .ct{display:flex;font-size:11.5px;margin-bottom:6px;word-break:break-word}
.L10 aside .pills span{background:#fff}
.L10 .av span{display:block;font-size:11.5px;margin-bottom:3px}
@media print{body{background:#fff}.cv{box-shadow:none!important}@page{size:A4;margin:0}}
`;

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=IBM+Plex+Sans:wght@400;600;700&family=Lato:wght@400;700;900&family=Arimo:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,600;1,600&family=Barlow:wght@400;600;700&family=Nunito+Sans:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=Libre+Baskerville:wght@400;700&family=Karla:wght@400;600;700&family=Tajawal:wght@400;500;700&family=Cairo:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap";

/** Suggested filename for the exported PDF, per spec: CV_Prenom_Nom_Poste.pdf */
export function cvFileName(d: CVTemplateData): string {
  const parts = (d.name || 'CV').trim().split(/\s+/).join('_');
  const role = (d.title || d.targetRoles?.[0] || '').trim().replace(/\s+/g, '_');
  // Strip diacritics (é→e, ô→o…) before dropping non-ASCII-word characters, so
  // accented French names/titles keep their letters instead of losing them
  // outright (e.g. "Développeur" → "Developpeur", not "Dveloppeur").
  const ascii = `CV_${parts}${role ? `_${role}` : ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return ascii.replace(/[^\w-]/g, '');
}

export function generateCVHtml(data: CVTemplateData, style?: Partial<CVStyle>): string {
  const { layout, palette } = parseTemplateId(style?.templateId);
  const L = LBL[data.cvLang || 'fr'];
  const e = escapeHtml;
  const acc = palette.hex;
  const showPhoto = !!data.photo || layout.photo !== null; // spec: optional per CV, but still render an initials placeholder when the layout wants a photo slot and none was uploaded
  const ph = photoHtml(data, acc, layout, showPhoto);
  const renderer = R[layout.cls] || R.L1;
  const body = renderer(data, L, ph, e);
  const dir = data.cvLang === 'ar' ? 'rtl' : 'ltr';
  const style_ = `--acc:${acc};--soft:${rgba(acc, .1)};--mid:${rgba(acc, .28)};--f:${layout.font};--fa:${layout.arabicFont};${layout.headingFont ? `--h:${layout.headingFont};` : ''}`;
  const title = cvFileName(data).replace(/_/g, ' ');
  return `<!DOCTYPE html><html lang="${data.cvLang || 'fr'}" dir="${dir}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS_LINK}" rel="stylesheet">
<style>*{box-sizing:border-box}body{margin:0;background:#eef2f7;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:840px;margin:2rem auto;box-shadow:0 12px 48px rgba(0,0,0,.14)}@media print{body{background:#fff}.page{margin:0;box-shadow:none}}${BASE_CSS}</style>
</head><body><div class="page"><div class="cv ${layout.cls}" dir="${dir}" lang="${data.cvLang || 'fr'}" style="${style_}">${body}</div></div></body></html>`;
}
