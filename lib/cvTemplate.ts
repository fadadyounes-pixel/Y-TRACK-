/**
 * Shared professional CV template system for TalentMap.
 *
 * Used by both the candidate CV builder and the coordinator's CV export, so
 * every downloaded/printed CV — regardless of who generates it — has the
 * same complete section coverage (contact, summary, experience, education,
 * skills, languages, certifications, target roles).
 *
 * Visual output is NOT a single fixed template: 10 structurally distinct
 * layouts × 11 color themes = 110 genuinely different combinations (well
 * over the 100-template bar this system targets). Each candidate is
 * deterministically assigned one (stable across downloads, based on their
 * CIN) via pickStyle(), and can override it explicitly, so two candidates'
 * CVs are very unlikely to look alike.
 */

export interface WorkEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
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

/* ── Color themes ──────────────────────────────────────────────────────── */
export interface CVTheme {
  id: string;
  name: string;
  dark: string;       // deep primary — dark headers/rails
  mid: string;         // gradient end / secondary
  accent: string;       // bright accent — links, icons, section labels
  tint: string;          // very light background tint for pills/panels
  tintBorder: string;     // border color to pair with `tint`
  textOnDark: string;      // body text color when placed on `dark`/`mid`
}

export const CV_THEMES: CVTheme[] = [
  { id: 'ocean',    name: 'Océan',        dark: '#0a1631', mid: '#1a3a6b', accent: '#2563eb', tint: '#eff6ff', tintBorder: '#bfdbfe', textOnDark: '#ffffff' },
  { id: 'emerald',  name: 'Émeraude',     dark: '#022c22', mid: '#065f46', accent: '#059669', tint: '#ecfdf5', tintBorder: '#a7f3d0', textOnDark: '#ffffff' },
  { id: 'slate',    name: 'Ardoise',      dark: '#0f172a', mid: '#334155', accent: '#475569', tint: '#f1f5f9', tintBorder: '#cbd5e1', textOnDark: '#ffffff' },
  { id: 'burgundy', name: 'Bordeaux',     dark: '#450a1e', mid: '#7f1d3a', accent: '#9f1239', tint: '#fff1f2', tintBorder: '#fecdd3', textOnDark: '#ffffff' },
  { id: 'violet',   name: 'Violet Royal', dark: '#2e1065', mid: '#5b21b6', accent: '#7c3aed', tint: '#f5f3ff', tintBorder: '#ddd6fe', textOnDark: '#ffffff' },
  { id: 'amber',    name: 'Ambre',        dark: '#451a03', mid: '#7c2d12', accent: '#b45309', tint: '#fffbeb', tintBorder: '#fde68a', textOnDark: '#ffffff' },
  { id: 'teal',     name: 'Sarcelle',     dark: '#042f2e', mid: '#115e59', accent: '#0d9488', tint: '#f0fdfa', tintBorder: '#99f6e4', textOnDark: '#ffffff' },
  { id: 'navy',     name: 'Marine',       dark: '#0f172a', mid: '#1e3a8a', accent: '#1d4ed8', tint: '#eff6ff', tintBorder: '#bfdbfe', textOnDark: '#ffffff' },
  { id: 'forest',   name: 'Forêt',        dark: '#052e16', mid: '#166534', accent: '#16a34a', tint: '#f0fdf4', tintBorder: '#bbf7d0', textOnDark: '#ffffff' },
  { id: 'graphite', name: 'Graphite',     dark: '#18181b', mid: '#3f3f46', accent: '#52525b', tint: '#fafafa', tintBorder: '#d4d4d8', textOnDark: '#ffffff' },
  { id: 'copper',   name: 'Cuivre',       dark: '#431407', mid: '#7c2d12', accent: '#9a3412', tint: '#fff7ed', tintBorder: '#fed7aa', textOnDark: '#ffffff' },
];

/* ── Layouts ───────────────────────────────────────────────────────────── */
export const CV_LAYOUTS: { id: string; name: string; desc: string }[] = [
  { id: 'sidebar',   name: 'Barre latérale',  desc: 'Bandeau coloré + colonne latérale claire' },
  { id: 'executive', name: 'Exécutif centré',  desc: 'Colonne unique centrée, sobre et formelle' },
  { id: 'rail',      name: 'Rail latéral',     desc: 'Bande foncée pleine hauteur à gauche' },
  { id: 'timeline',  name: 'Chronologie',      desc: 'Expériences en frise chronologique verticale' },
  { id: 'compact',   name: 'ATS compact',      desc: 'Texte dense, sans couleur — optimisé ATS' },
  { id: 'grid',      name: 'Grille',           desc: 'Sections en cartes, compétences en tuiles' },
  { id: 'minimal',   name: 'Minimaliste',      desc: 'Typographie pure, sans couleur ni icônes' },
  { id: 'bold',      name: 'Bloc affirmé',     desc: 'Grand bandeau nominatif, séparateurs épais' },
  { id: 'split',     name: 'Duo vertical',     desc: 'Colonne foncée centrée + contenu détaillé' },
  { id: 'magazine',  name: 'Magazine',         desc: 'Texte en colonnes, bandeau de synthèse en pied' },
];

// Small, well-distributed integer hash — deterministic across runs so the
// same candidate always lands on the same style unless they explicitly
// change it, while different candidates spread across the full combo space.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface CVStyle { layout: string; theme: string; }

export function pickStyle(seed: string): CVStyle {
  const h = hashString(seed || 'talentmap');
  const layout = CV_LAYOUTS[h % CV_LAYOUTS.length].id;
  const theme = CV_THEMES[Math.floor(h / CV_LAYOUTS.length) % CV_THEMES.length].id;
  return { layout, theme };
}

export interface CVTemplateData {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  // Optional proficiency level per language (e.g. "Anglais" -> "Courant"),
  // keyed by the exact language string as it appears in `languages`. Purely
  // additive — matching (lib/matching.ts) still reads plain `languages: string[]`.
  languageLevels?: Record<string, string>;
  experience: string; sector: string;
  work: WorkEntry[]; education: Education;
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}

// Renders "Anglais — Courant" when a level is known for that language, else
// just "Anglais" — used everywhere a language pill/tag/chip is printed below.
function langLabel(data: CVTemplateData, l: string): string {
  const level = data.languageLevels?.[l];
  return level ? `${l} — ${level}` : l;
}

interface Ctx {
  e: (s: string) => string;
  data: CVTemplateData;
  t: CVTheme;
  today: string;
  avatarHtml: string;
  contacts: string[];
}

function buildCtx(data: CVTemplateData, t: CVTheme): Ctx {
  const e = escapeHtml;
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${e(data.photo)}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : e(initials) || '?';
  // idNumber (CIN) is intentionally not displayed — a national ID number is
  // sensitive PII that doesn't belong on a document sent to employers. It's
  // still accepted on CVTemplateData purely as a deterministic seed for
  // pickStyle() so each candidate's default CV style is stable.
  const contacts = [
    data.email && e(data.email),
    data.phone && e(data.phone),
    data.address && e(data.address),
    data.linkedin && e(data.linkedin),
    data.portfolio && e(data.portfolio),
  ].filter(Boolean) as string[];
  return { e, data, t, today, avatarHtml, contacts };
}

const PRINT_GUARD = '.entry,.edu-entry,.tl-item,.hdr,.sec-title{break-inside:avoid;page-break-inside:avoid}';

/* ── Layout 1 — Sidebar (banner header + light side column) ────────────── */
function renderSidebar(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:840px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);overflow:hidden}
.hdr{background:linear-gradient(135deg,${t.dark} 0%,${t.mid} 50%,${t.accent} 100%);padding:2.5rem 2.75rem 2rem;color:${t.textOnDark};position:relative;overflow:hidden;display:flex;align-items:center;gap:2rem}
.hdr-avatar{width:90px;height:90px;border-radius:50%;border:3px solid rgba(255,255,255,.5);background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.9rem;font-weight:900;color:#fff;flex-shrink:0;position:relative;z-index:1;overflow:hidden}
.hdr-info{flex:1;position:relative;z-index:1}
.hdr-name{font-size:1.95rem;font-weight:900;letter-spacing:-.03em;line-height:1.1}
.hdr-role{margin-top:.4rem;font-size:1rem;font-weight:600;opacity:.75}
.hdr-contacts{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;margin-top:1rem}
.hdr-contacts span{font-size:.82rem;opacity:.8;display:flex;align-items:center;gap:.3rem}
.body{display:grid;grid-template-columns:1fr 270px;gap:0}
.main{padding:2rem 2rem 2rem 2.75rem;border-right:1px solid #f0f4f8}
.side{padding:2rem 1.75rem;background:#f8fafc}
.sec-title{font-size:.67rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:${t.accent};margin-bottom:.85rem;padding-bottom:.45rem;border-bottom:2px solid ${t.tintBorder}}
.sec{margin-bottom:1.75rem}
.pills{display:flex;flex-wrap:wrap;gap:.4rem}
.pill{background:${t.tint};color:${t.dark};border-radius:6px;padding:.3rem .75rem;font-size:.76rem;font-weight:700;border:1px solid ${t.tintBorder}}
.pill.lang{background:#f0fdf4;color:#065f46;border-color:#bbf7d0}
.pill.cert{background:#fefce8;color:#713f12;border-color:#fde68a}
.pill.role{background:#fdf4ff;color:#6b21a8;border-color:#e9d5ff}
.badge{display:inline-flex;align-items:center;gap:.35rem;background:linear-gradient(135deg,${t.dark},${t.accent});color:#fff;border-radius:6px;padding:.4rem 1rem;font-size:.82rem;font-weight:700}
.entry{padding:1rem 1.1rem;background:#fff;border-radius:8px;margin-bottom:.8rem;border-left:3px solid ${t.accent};box-shadow:0 1px 6px rgba(0,0,0,.08)}
.entry h4{font-size:.95rem;font-weight:800;color:#0f172a;line-height:1.3}
.entry .co{font-size:.85rem;font-weight:700;color:${t.accent};margin-top:.15rem}
.entry .meta{font-size:.75rem;color:#64748b;margin:.25rem 0 .6rem;font-weight:500}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.83rem;color:#374151;line-height:1.65;padding-left:1rem;position:relative;margin-bottom:.25rem}
.entry ul li::before{content:"›";position:absolute;left:0;color:${t.accent};font-weight:800}
.summary-text{font-size:.88rem;color:#334155;line-height:1.8;border-left:3px solid ${t.accent};padding-left:1rem;font-style:italic}
.edu-entry{background:#f8fafc;border-radius:8px;padding:.85rem 1rem;border:1px solid #e2e8f0}
.edu-entry h4{font-size:.92rem;font-weight:700;color:#0f172a}
.edu-entry .meta{font-size:.75rem;color:#64748b;margin-top:.2rem}
.footer{text-align:center;padding:.9rem;font-size:.68rem;color:#94a3b8;border-top:1px solid #f0f4f8;letter-spacing:.04em;background:#f8fafc}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div class="hdr-avatar">${avatarHtml}</div>
    <div class="hdr-info">
      <div class="hdr-name">${e(data.name) || 'Nom Prénom'}</div>
      <div class="hdr-role">${e(data.experience)} · ${e(data.sector)}</div>
      <div class="hdr-contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
      ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
        <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
        <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
        ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
      ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
      ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="pills">${data.targetRoles.map(r => `<span class="pill role">${e(r)}</span>`).join('')}</div></div>` : ''}
    </div>
    <div class="side">
      <div class="sec"><div class="sec-title">Niveau</div><span class="badge">${e(data.experience)}</span></div>
      ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><div class="pills">${data.skills.map(s => `<span class="pill">${e(s)}</span>`).join('')}</div></div>` : ''}
      ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div style="display:flex;flex-direction:column;gap:.4rem">${data.languages.map(l => `<span class="pill lang">${e(langLabel(data, l))}</span>`).join('')}</div></div>` : ''}
      ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div style="display:flex;flex-direction:column;gap:.4rem">${data.certifications.map(c => `<span class="pill cert">${e(c)}</span>`).join('')}</div></div>` : ''}
    </div>
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 2 — Executive (single centered column, no color banner) ────── */
function renderExecutive(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:760px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.12);padding:3rem 3.5rem}
.hdr{text-align:center;padding-bottom:1.75rem;border-bottom:3px solid ${t.accent}}
.avatar{width:96px;height:96px;border-radius:50%;margin:0 auto 1rem;background:${t.tint};border:2px solid ${t.accent};display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:900;color:${t.dark};overflow:hidden}
.name{font-size:2.1rem;font-weight:900;letter-spacing:-.03em;color:${t.dark}}
.role{margin-top:.35rem;font-size:1.05rem;font-weight:600;color:${t.accent};text-transform:uppercase;letter-spacing:.08em}
.contacts{margin-top:1rem;display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem .9rem}
.contacts span{font-size:.8rem;color:#52525b}
.sec{margin-top:2rem}
.sec-title{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.16em;color:${t.dark};text-align:center;margin-bottom:1rem;position:relative}
.sec-title::after{content:'';display:block;width:44px;height:2px;background:${t.accent};margin:.5rem auto 0}
.summary-text{font-size:.92rem;line-height:1.85;color:#3f3f46;text-align:center;max-width:560px;margin:0 auto}
.entry{padding:.9rem 0;border-bottom:1px dashed #e4e4e7;text-align:center}
.entry:last-child{border-bottom:none}
.entry h4{font-size:1rem;font-weight:800;color:#18181b}
.entry .co{font-size:.85rem;font-weight:700;color:${t.accent};margin-top:.1rem}
.entry .meta{font-size:.75rem;color:#71717a;margin:.2rem 0 .55rem}
.entry ul{list-style:none;padding:0;margin:0 auto;max-width:520px;text-align:left}
.entry ul li{font-size:.83rem;color:#3f3f46;line-height:1.65;padding-left:1rem;position:relative;margin-bottom:.25rem}
.entry ul li::before{content:"—";position:absolute;left:0;color:${t.accent}}
.edu-entry{text-align:center}
.edu-entry h4{font-size:.95rem;font-weight:700;color:#18181b}
.edu-entry .meta{font-size:.78rem;color:#71717a;margin-top:.2rem}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem}
.chip{border:1px solid ${t.tintBorder};background:${t.tint};color:${t.dark};border-radius:9999px;padding:.3rem .85rem;font-size:.78rem;font-weight:700}
.footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e4e4e7;text-align:center;font-size:.68rem;color:#a1a1aa;letter-spacing:.04em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div class="avatar">${avatarHtml}</div>
    <div class="name">${e(data.name) || 'Nom Prénom'}</div>
    <div class="role">${e(data.experience)} · ${e(data.sector)}</div>
    <div class="contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
  </div>
  ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
  ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
    <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
    <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
    ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
  ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
  ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><div class="chips">${data.skills.map(s => `<span class="chip">${e(s)}</span>`).join('')}</div></div>` : ''}
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div class="chips">${data.languages.map(l => `<span class="chip">${e(langLabel(data, l))}</span>`).join('')}</div></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div class="chips">${data.certifications.map(c => `<span class="chip">${e(c)}</span>`).join('')}</div></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="chips">${data.targetRoles.map(r => `<span class="chip">${e(r)}</span>`).join('')}</div></div>` : ''}
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 3 — Rail (full-height dark left rail, content on the right) ── */
function renderRail(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:880px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);display:grid;grid-template-columns:260px 1fr;overflow:hidden;min-height:900px}
.rail{background:linear-gradient(195deg,${t.dark},${t.mid});color:${t.textOnDark};padding:2.25rem 1.75rem}
.avatar{width:88px;height:88px;border-radius:50%;margin:0 auto 1rem;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:1.85rem;font-weight:900;overflow:hidden}
.rail-name{text-align:center;font-size:1.25rem;font-weight:800;letter-spacing:-.02em;line-height:1.2}
.rail-role{text-align:center;font-size:.78rem;opacity:.7;margin-top:.35rem;font-weight:600}
.rail-sec{margin-top:1.9rem}
.rail-title{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;opacity:.55;margin-bottom:.7rem}
.rail-contact{font-size:.76rem;opacity:.85;margin-bottom:.4rem;word-break:break-word}
.rail-pill{display:inline-block;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:.28rem .65rem;font-size:.72rem;font-weight:600;margin:0 .3rem .3rem 0}
.main{padding:2.25rem 2.5rem}
.sec{margin-bottom:1.7rem}
.sec-title{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:${t.accent};margin-bottom:.8rem;padding-bottom:.4rem;border-bottom:2px solid ${t.tintBorder}}
.summary-text{font-size:.88rem;line-height:1.8;color:#334155}
.entry{padding:0 0 1rem 1rem;border-left:2px solid ${t.tintBorder};margin-bottom:.9rem;position:relative}
.entry::before{content:'';position:absolute;left:-5px;top:4px;width:8px;height:8px;border-radius:50%;background:${t.accent}}
.entry h4{font-size:.94rem;font-weight:800;color:#0f172a}
.entry .co{font-size:.83rem;font-weight:700;color:${t.accent};margin-top:.1rem}
.entry .meta{font-size:.74rem;color:#64748b;margin:.2rem 0 .5rem}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.82rem;color:#374151;line-height:1.6;padding-left:.95rem;position:relative;margin-bottom:.2rem}
.entry ul li::before{content:"·";position:absolute;left:0;color:${t.accent};font-weight:900}
.edu-entry h4{font-size:.9rem;font-weight:700;color:#0f172a}
.edu-entry .meta{font-size:.74rem;color:#64748b;margin-top:.15rem}
.footer{grid-column:1/-1;text-align:center;padding:.85rem;font-size:.66rem;color:#94a3b8;border-top:1px solid #f0f4f8;background:#f8fafc}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="rail">
    <div class="avatar">${avatarHtml}</div>
    <div class="rail-name">${e(data.name) || 'Nom Prénom'}</div>
    <div class="rail-role">${e(data.experience)} · ${e(data.sector)}</div>
    <div class="rail-sec"><div class="rail-title">Contact</div>${contacts.map(c => `<div class="rail-contact">${c}</div>`).join('')}</div>
    ${data.skills.length ? `<div class="rail-sec"><div class="rail-title">Compétences</div>${data.skills.map(s => `<span class="rail-pill">${e(s)}</span>`).join('')}</div>` : ''}
    ${data.languages.length ? `<div class="rail-sec"><div class="rail-title">Langues</div>${data.languages.map(l => `<span class="rail-pill">${e(langLabel(data, l))}</span>`).join('')}</div>` : ''}
    ${data.certifications?.length ? `<div class="rail-sec"><div class="rail-title">Certifications</div>${data.certifications.map(c => `<span class="rail-pill">${e(c)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="main">
    ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
    ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
      <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
      <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
      ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
    ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div>${data.targetRoles.map(r => `<span class="rail-pill" style="background:${t.tint};border-color:${t.tintBorder};color:${t.dark}">${e(r)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 4 — Timeline (vertical connector line for experience) ──────── */
function renderTimeline(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:800px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.12);padding:2.75rem 3rem}
.hdr{display:flex;align-items:center;gap:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid #e4e4e7}
.avatar{width:76px;height:76px;border-radius:14px;flex-shrink:0;background:${t.tint};border:2px solid ${t.tintBorder};display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;color:${t.dark};overflow:hidden}
.name{font-size:1.75rem;font-weight:900;letter-spacing:-.02em;color:#18181b}
.role{margin-top:.3rem;font-size:.92rem;font-weight:700;color:${t.accent}}
.contacts{margin-top:.55rem;display:flex;flex-wrap:wrap;gap:.4rem 1rem}
.contacts span{font-size:.78rem;color:#71717a}
.sec{margin-top:1.9rem}
.sec-title{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:${t.dark};margin-bottom:1rem}
.summary-text{font-size:.88rem;line-height:1.8;color:#3f3f46}
.tl{position:relative;padding-left:1.4rem}
.tl::before{content:'';position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:${t.tintBorder}}
.tl-item{position:relative;padding-bottom:1.4rem}
.tl-item:last-child{padding-bottom:0}
.tl-item::before{content:'';position:absolute;left:-1.4rem;top:3px;width:12px;height:12px;border-radius:50%;background:${t.accent};border:2px solid #fff;box-shadow:0 0 0 2px ${t.accent}}
.tl-item h4{font-size:.94rem;font-weight:800;color:#18181b}
.tl-item .co{font-size:.82rem;font-weight:700;color:${t.accent};margin-top:.1rem}
.tl-item .meta{font-size:.74rem;color:#71717a;margin:.2rem 0 .5rem}
.tl-item ul{list-style:none;padding:0;margin:0}
.tl-item ul li{font-size:.82rem;color:#3f3f46;line-height:1.6;padding-left:.9rem;position:relative;margin-bottom:.2rem}
.tl-item ul li::before{content:"–";position:absolute;left:0;color:${t.accent}}
.edu-entry h4{font-size:.9rem;font-weight:700;color:#18181b}
.edu-entry .meta{font-size:.74rem;color:#71717a;margin-top:.15rem}
.tags{display:flex;flex-wrap:wrap;gap:.4rem}
.tag{background:${t.tint};color:${t.dark};border:1px solid ${t.tintBorder};border-radius:5px;padding:.28rem .7rem;font-size:.74rem;font-weight:700}
.footer{margin-top:2.25rem;padding-top:.9rem;border-top:1px solid #e4e4e7;text-align:center;font-size:.66rem;color:#a1a1aa;letter-spacing:.04em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div class="avatar">${avatarHtml}</div>
    <div>
      <div class="name">${e(data.name) || 'Nom Prénom'}</div>
      <div class="role">${e(data.experience)} · ${e(data.sector)}</div>
      <div class="contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
    </div>
  </div>
  ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
  ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><div class="tags">${data.skills.map(s => `<span class="tag">${e(s)}</span>`).join('')}</div></div>` : ''}
  ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div><div class="tl">${data.work.filter(w => w.company).map(w => `
    <div class="tl-item"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
    <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
    ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div></div>` : ''}
  ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div class="tags">${data.languages.map(l => `<span class="tag">${e(langLabel(data, l))}</span>`).join('')}</div></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div class="tags">${data.certifications.map(c => `<span class="tag">${e(c)}</span>`).join('')}</div></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="tags">${data.targetRoles.map(r => `<span class="tag">${e(r)}</span>`).join('')}</div></div>` : ''}
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 5 — Compact ATS (dense, near-monochrome, no photo/icons) ───── */
function renderCompact(ctx: Ctx): string {
  const { e, data, t, today, contacts } = ctx;
  // ATS-friendly: no emoji/icons, no photo, minimal color — just a single
  // accent rule so it still reads as branded rather than default black-on-white.
  const plainContacts = [data.email, data.phone, data.address, data.linkedin, data.portfolio]
    .filter(Boolean).map(c => e(c as string));
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;background:#e5e5e5;color:#18181b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:760px;margin:2rem auto;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.1);padding:2.5rem 3rem}
.hdr{border-bottom:3px solid ${t.accent};padding-bottom:.9rem;margin-bottom:1.4rem}
.name{font-size:1.6rem;font-weight:700;letter-spacing:0}
.role{margin-top:.2rem;font-size:.85rem;font-weight:600;color:#3f3f46}
.contacts{margin-top:.5rem;font-size:.76rem;color:#52525b}
.sec{margin-bottom:1.3rem}
.sec-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${t.dark};border-bottom:1px solid #d4d4d8;padding-bottom:.25rem;margin-bottom:.55rem}
.summary-text{font-size:.83rem;line-height:1.7;color:#27272a}
.entry{margin-bottom:.85rem}
.entry-hd{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:.3rem}
.entry h4{font-size:.86rem;font-weight:700}
.entry .co{font-size:.8rem;color:#3f3f46}
.entry .meta{font-size:.74rem;color:#71717a;white-space:nowrap}
.entry ul{list-style:disc;padding-left:1.1rem;margin-top:.3rem}
.entry ul li{font-size:.79rem;color:#27272a;line-height:1.6;margin-bottom:.15rem}
.edu-entry h4{font-size:.83rem;font-weight:700}
.edu-entry .meta{font-size:.76rem;color:#71717a;margin-top:.1rem}
.line{font-size:.8rem;color:#27272a;line-height:1.7}
.footer{margin-top:1.6rem;padding-top:.7rem;border-top:1px solid #e4e4e7;font-size:.64rem;color:#a1a1aa}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div class="name">${e(data.name) || 'Nom Prénom'}</div>
    <div class="role">${e(data.experience)} — ${e(data.sector)}</div>
    <div class="contacts">${plainContacts.join(' · ')}</div>
  </div>
  ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
  ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expérience Professionnelle</div>${data.work.filter(w => w.company).map(w => `
    <div class="entry"><div class="entry-hd"><h4>${e(w.title) || 'Poste'} — ${e(w.company)}</h4><span class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</span></div>
    ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
  ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
  ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><p class="line">${data.skills.map(e).join(' · ')}</p></div>` : ''}
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><p class="line">${data.languages.map(l => e(langLabel(data, l))).join(' · ')}</p></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><p class="line">${data.certifications.map(e).join(' · ')}</p></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><p class="line">${data.targetRoles.map(e).join(' · ')}</p></div>` : ''}
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 6 — Grid (card-based sections, tile skills, banner header) ── */
function renderGrid(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);overflow:hidden}
.hdr{background:${t.dark};padding:1.9rem 2.5rem;color:${t.textOnDark};display:flex;align-items:center;gap:1.5rem}
.avatar{width:72px;height:72px;border-radius:16px;flex-shrink:0;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;overflow:hidden}
.name{font-size:1.85rem;font-weight:900;letter-spacing:-.02em}
.role{margin-top:.35rem;font-size:.9rem;font-weight:600;color:${t.textOnDark};opacity:.78}
.contacts{margin-top:.65rem;display:flex;flex-wrap:wrap;gap:.4rem 1.2rem}
.contacts span{font-size:.78rem;opacity:.88}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;padding:1.9rem 2.25rem}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:1.25rem 1.4rem;background:#fbfcfe}
.card.full{grid-column:1/-1}
.card-title{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:${t.accent};margin-bottom:.75rem}
.summary-text{font-size:.86rem;line-height:1.75;color:#334155}
.entry{margin-bottom:.85rem}
.entry:last-child{margin-bottom:0}
.entry h4{font-size:.92rem;font-weight:800;color:#0f172a}
.entry .co{font-size:.82rem;font-weight:700;color:${t.accent};margin-top:.1rem}
.entry .meta{font-size:.72rem;color:#64748b;margin:.2rem 0 .5rem}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.8rem;color:#374151;line-height:1.6;padding-left:.9rem;position:relative;margin-bottom:.2rem}
.entry ul li::before{content:"▪";position:absolute;left:0;color:${t.accent};font-size:.6rem;top:.3rem}
.tiles{display:flex;flex-wrap:wrap;gap:.4rem}
.tile{background:${t.tint};color:${t.dark};border:1px solid ${t.tintBorder};border-radius:8px;padding:.4rem .7rem;font-size:.75rem;font-weight:700;text-align:center}
.edu-entry h4{font-size:.88rem;font-weight:700;color:#0f172a}
.edu-entry .meta{font-size:.72rem;color:#64748b;margin-top:.15rem}
.footer{text-align:center;padding:.9rem;font-size:.66rem;color:#94a3b8;border-top:1px solid #f0f4f8;background:#f8fafc}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div class="avatar">${avatarHtml}</div>
    <div>
      <div class="name">${e(data.name) || 'Nom Prénom'}</div>
      <div class="role">${e(data.experience)} · ${e(data.sector)}</div>
      <div class="contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
    </div>
  </div>
  <div class="grid">
    ${data.summary ? `<div class="card full"><div class="card-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
    ${data.work.some(w => w.company) ? `<div class="card full"><div class="card-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
      <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
      <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
      ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${data.skills.length ? `<div class="card"><div class="card-title">Compétences</div><div class="tiles">${data.skills.map(s => `<span class="tile">${e(s)}</span>`).join('')}</div></div>` : ''}
    ${data.languages.length ? `<div class="card"><div class="card-title">Langues</div><div class="tiles">${data.languages.map(l => `<span class="tile">${e(langLabel(data, l))}</span>`).join('')}</div></div>` : ''}
    ${data.education.degree ? `<div class="card"><div class="card-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
    ${data.certifications?.length ? `<div class="card"><div class="card-title">Certifications</div><div class="tiles">${data.certifications.map(c => `<span class="tile">${e(c)}</span>`).join('')}</div></div>` : ''}
    ${data.targetRoles?.length ? `<div class="card full"><div class="card-title">Postes Recherchés</div><div class="tiles">${data.targetRoles.map(r => `<span class="tile">${e(r)}</span>`).join('')}</div></div>` : ''}
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 7 — Minimal (no color blocks, pure typography, generous whitespace) ── */
function renderMinimal(ctx: Ctx): string {
  const { e, data, t, today, contacts } = ctx;
  const nameParts = data.name.trim() ? data.name.trim().split(/\s+/) : [];
  const lastWord = nameParts.length ? nameParts[nameParts.length - 1] : 'Prénom';
  const leadWords = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts.length === 1 ? '' : 'Nom';
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;color:#18181b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:740px;margin:2.5rem auto;background:#fff;padding:3.25rem 3.75rem}
.name{font-size:1.9rem;font-weight:300;letter-spacing:.02em;color:#18181b}
.name b{font-weight:800}
.role{margin-top:.5rem;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.18em;color:${t.accent}}
.rule{height:1px;background:#e4e4e7;margin:1.1rem 0 1.6rem}
.contacts{display:flex;flex-wrap:wrap;gap:.3rem 1.3rem;margin-bottom:1.9rem}
.contacts span{font-size:.76rem;color:#71717a;letter-spacing:.02em}
.sec{margin-bottom:1.9rem}
.sec-title{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:#a1a1aa;margin-bottom:.9rem}
.summary-text{font-size:.9rem;line-height:1.9;color:#3f3f46;font-weight:300}
.entry{margin-bottom:1.2rem}
.entry:last-child{margin-bottom:0}
.entry-hd{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:.3rem}
.entry h4{font-size:.92rem;font-weight:700;color:#18181b}
.entry .meta{font-size:.72rem;color:#a1a1aa;font-weight:500}
.entry .co{font-size:.8rem;color:${t.accent};font-weight:600;margin-top:.1rem}
.entry ul{list-style:none;padding:0;margin:.5rem 0 0}
.entry ul li{font-size:.82rem;color:#3f3f46;line-height:1.7;padding-left:0;margin-bottom:.2rem;font-weight:300}
.plain-line{font-size:.84rem;color:#3f3f46;line-height:1.9;font-weight:400}
.edu-entry h4{font-size:.88rem;font-weight:700;color:#18181b}
.edu-entry .meta{font-size:.74rem;color:#a1a1aa;margin-top:.15rem}
.footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e4e4e7;font-size:.65rem;color:#d4d4d8;letter-spacing:.05em}
@media print{body{background:#fff}.page{margin:0}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="name">${leadWords ? `<b>${e(leadWords)}</b> ` : ''}${e(lastWord)}</div>
  <div class="role">${e(data.experience)} · ${e(data.sector)}</div>
  <div class="rule"></div>
  <div class="contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
  ${data.summary ? `<div class="sec"><div class="sec-title">Profil</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
  ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expérience</div>${data.work.filter(w => w.company).map(w => `
    <div class="entry"><div class="entry-hd"><h4>${e(w.title) || 'Poste'}</h4><span class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</span></div>
    <div class="co">${e(w.company)}</div>
    ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
  ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
  ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><p class="plain-line">${data.skills.map(e).join('  ·  ')}</p></div>` : ''}
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><p class="plain-line">${data.languages.map(l => `${e(langLabel(data, l))}`).join('  ·  ')}</p></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><p class="plain-line">${data.certifications.map(e).join('  ·  ')}</p></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><p class="plain-line">${data.targetRoles.map(e).join('  ·  ')}</p></div>` : ''}
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 8 — Bold Block (oversized header block, thick section dividers) ── */
function renderBold(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:820px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);overflow:hidden}
.hdr{background:${t.dark};color:${t.textOnDark};padding:3rem 2.75rem 2.25rem}
.name{font-size:3rem;font-weight:900;letter-spacing:-.04em;line-height:1}
.strip{background:${t.accent};color:${t.textOnDark};padding:.9rem 2.75rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap}
.avatar{width:52px;height:52px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:900;overflow:hidden}
.role{font-size:.85rem;font-weight:700}
.contacts{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;margin-left:auto}
.contacts span{font-size:.76rem;font-weight:600}
.body{padding:2.25rem 2.75rem}
.sec{margin-bottom:1.9rem}
.sec-title{font-size:.75rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#fff;background:${t.dark};display:inline-block;padding:.35rem 1rem;border-radius:5px;margin-bottom:1rem}
.summary-text{font-size:.9rem;line-height:1.8;color:#334155}
.entry{padding:1rem 0;border-bottom:3px solid ${t.tint}}
.entry:last-child{border-bottom:none}
.entry h4{font-size:1rem;font-weight:900;color:#0f172a}
.entry .co{font-size:.85rem;font-weight:700;color:${t.accent};margin-top:.15rem}
.entry .meta{font-size:.75rem;color:#64748b;margin:.25rem 0 .6rem;font-weight:600}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.83rem;color:#374151;line-height:1.65;padding-left:1.1rem;position:relative;margin-bottom:.25rem}
.entry ul li::before{content:"▸";position:absolute;left:0;color:${t.accent};font-weight:900}
.pills{display:flex;flex-wrap:wrap;gap:.45rem}
.pill{background:${t.dark};color:#fff;border-radius:6px;padding:.4rem .85rem;font-size:.78rem;font-weight:800}
.edu-entry h4{font-size:.94rem;font-weight:800;color:#0f172a}
.edu-entry .meta{font-size:.75rem;color:#64748b;margin-top:.2rem;font-weight:600}
.footer{text-align:center;padding:1rem;font-size:.68rem;color:#94a3b8;border-top:1px solid #f0f4f8;background:#f8fafc}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr"><div class="name">${e(data.name) || 'Nom Prénom'}</div></div>
  <div class="strip">
    <div class="avatar">${avatarHtml}</div>
    <span class="role">${e(data.experience)} · ${e(data.sector)}</span>
    <div class="contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
  </div>
  <div class="body">
    ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
    ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
      <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
      <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
      ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
    ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><div class="pills">${data.skills.map(s => `<span class="pill">${e(s)}</span>`).join('')}</div></div>` : ''}
    ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div class="pills">${data.languages.map(l => `<span class="pill">${e(langLabel(data, l))}</span>`).join('')}</div></div>` : ''}
    ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div class="pills">${data.certifications.map(c => `<span class="pill">${e(c)}</span>`).join('')}</div></div>` : ''}
    ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="pills">${data.targetRoles.map(r => `<span class="pill">${e(r)}</span>`).join('')}</div></div>` : ''}
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 9 — Split (full-height dark column with centered identity block) ── */
function renderSplit(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:880px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);display:grid;grid-template-columns:1fr 1.35fr;overflow:hidden;min-height:920px}
.left{background:linear-gradient(200deg,${t.mid},${t.dark});color:${t.textOnDark};padding:2.5rem 2rem;display:flex;flex-direction:column;align-items:center;text-align:center}
.avatar{width:104px;height:104px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:2.1rem;font-weight:900;overflow:hidden;margin-bottom:1.1rem}
.name{font-size:1.5rem;font-weight:900;letter-spacing:-.02em;line-height:1.15}
.role{margin-top:.4rem;font-size:.8rem;opacity:.7;font-weight:600}
.left-sec{margin-top:2rem;width:100%;text-align:left}
.left-title{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;opacity:.55;margin-bottom:.65rem;text-align:center}
.left-line{font-size:.76rem;opacity:.85;margin-bottom:.4rem;word-break:break-word;text-align:center}
.left-pill{display:inline-flex;align-items:center;gap:.3rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:9999px;padding:.32rem .8rem;font-size:.72rem;font-weight:600;margin:0 .25rem .35rem 0}
.left-pills{display:flex;flex-wrap:wrap;justify-content:center}
.right{padding:2.5rem 2.5rem 2rem}
.sec{margin-bottom:1.8rem}
.sec-title{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:${t.accent};margin-bottom:.85rem;padding-bottom:.4rem;border-bottom:2px solid ${t.tintBorder}}
.summary-text{font-size:.88rem;line-height:1.8;color:#334155}
.entry{margin-bottom:1rem}
.entry h4{font-size:.94rem;font-weight:800;color:#0f172a}
.entry .co{font-size:.83rem;font-weight:700;color:${t.accent};margin-top:.1rem}
.entry .meta{font-size:.74rem;color:#64748b;margin:.2rem 0 .5rem}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.82rem;color:#374151;line-height:1.6;padding-left:.95rem;position:relative;margin-bottom:.2rem}
.entry ul li::before{content:"○";position:absolute;left:0;color:${t.accent};font-size:.6rem;top:.3rem}
.edu-entry h4{font-size:.9rem;font-weight:700;color:#0f172a}
.edu-entry .meta{font-size:.74rem;color:#64748b;margin-top:.15rem}
.footer{grid-column:1/-1;text-align:center;padding:.85rem;font-size:.66rem;color:#94a3b8;border-top:1px solid #f0f4f8;background:#f8fafc}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="left">
    <div class="avatar">${avatarHtml}</div>
    <div class="name">${e(data.name) || 'Nom Prénom'}</div>
    <div class="role">${e(data.experience)} · ${e(data.sector)}</div>
    <div class="left-sec"><div class="left-title">Contact</div>${contacts.map(c => `<div class="left-line">${c}</div>`).join('')}</div>
    ${data.skills.length ? `<div class="left-sec"><div class="left-title">Compétences</div><div class="left-pills">${data.skills.map(s => `<span class="left-pill">${e(s)}</span>`).join('')}</div></div>` : ''}
    ${data.languages.length ? `<div class="left-sec"><div class="left-title">Langues</div><div class="left-pills">${data.languages.map(l => `<span class="left-pill">${e(langLabel(data, l))}</span>`).join('')}</div></div>` : ''}
    ${data.certifications?.length ? `<div class="left-sec"><div class="left-title">Certifications</div><div class="left-pills">${data.certifications.map(c => `<span class="left-pill">${e(c)}</span>`).join('')}</div></div>` : ''}
  </div>
  <div class="right">
    ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
    ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
      <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
      <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
      ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
    ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="left-pills" style="justify-content:flex-start">${data.targetRoles.map(r => `<span class="left-pill" style="background:${t.tint};border-color:${t.tintBorder};color:${t.dark}">${e(r)}</span>`).join('')}</div></div>` : ''}
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 10 — Magazine (multi-column text flow, footer strip for extras) ── */
function renderMagazine(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:840px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14)}
.hdr{padding:2.25rem 2.75rem 1.5rem;border-bottom:4px double ${t.accent};display:flex;align-items:center;gap:1.5rem}
.avatar{width:70px;height:70px;border-radius:50%;flex-shrink:0;background:${t.tint};border:2px solid ${t.tintBorder};display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:${t.dark};overflow:hidden}
.name{font-size:1.9rem;font-weight:900;letter-spacing:-.02em;color:${t.dark};font-family:Georgia,'Times New Roman',serif}
.role{margin-top:.3rem;font-size:.85rem;font-weight:700;color:${t.accent};text-transform:uppercase;letter-spacing:.06em}
.contacts{margin-top:.5rem;display:flex;flex-wrap:wrap;gap:.35rem 1rem}
.contacts span{font-size:.76rem;color:#52525b}
.cols{padding:1.75rem 2.75rem;column-count:2;column-gap:2.25rem}
.sec{break-inside:avoid;margin-bottom:1.5rem}
.sec-title{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:${t.dark};border-bottom:1px solid #e4e4e7;padding-bottom:.35rem;margin-bottom:.75rem}
.summary-text{font-size:.83rem;line-height:1.75;color:#334155}
.entry{margin-bottom:.9rem}
.entry h4{font-size:.86rem;font-weight:800;color:#0f172a}
.entry .co{font-size:.78rem;font-weight:700;color:${t.accent};margin-top:.1rem}
.entry .meta{font-size:.71rem;color:#71717a;margin:.15rem 0 .4rem}
.entry ul{list-style:none;padding:0;margin:0}
.entry ul li{font-size:.77rem;color:#3f3f46;line-height:1.55;padding-left:.85rem;position:relative;margin-bottom:.18rem}
.entry ul li::before{content:"–";position:absolute;left:0;color:${t.accent}}
.strip{display:flex;flex-wrap:wrap;gap:1.75rem;padding:1.25rem 2.75rem 1.75rem;border-top:1px solid #e4e4e7;background:#fbfcfe}
.strip-col{flex:1 1 160px}
.strip-title{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:${t.accent};margin-bottom:.5rem}
.strip-line{font-size:.78rem;color:#334155;line-height:1.7}
.edu-entry h4{font-size:.83rem;font-weight:700;color:#0f172a}
.edu-entry .meta{font-size:.72rem;color:#71717a;margin-top:.12rem}
.footer{text-align:center;padding:.85rem;font-size:.64rem;color:#94a3b8;border-top:1px solid #f0f4f8}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}.cols{column-count:2}${PRINT_GUARD}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div class="avatar">${avatarHtml}</div>
    <div>
      <div class="name">${e(data.name) || 'Nom Prénom'}</div>
      <div class="role">${e(data.experience)} · ${e(data.sector)}</div>
      <div class="contacts">${contacts.map(c => `<span>${c}</span>`).join('')}</div>
    </div>
  </div>
  <div class="cols">
    ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
    ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
      <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
      <div class="meta">${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
      ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
  </div>
  <div class="strip">
    ${data.skills.length ? `<div class="strip-col"><div class="strip-title">Compétences</div><p class="strip-line">${data.skills.map(e).join(' · ')}</p></div>` : ''}
    ${data.languages.length ? `<div class="strip-col"><div class="strip-title">Langues</div><p class="strip-line">${data.languages.map(l => `${e(langLabel(data, l))}`).join(' · ')}</p></div>` : ''}
    ${data.certifications?.length ? `<div class="strip-col"><div class="strip-title">Certifications</div><p class="strip-line">${data.certifications.map(c => `${e(c)}`).join(' · ')}</p></div>` : ''}
    ${data.targetRoles?.length ? `<div class="strip-col"><div class="strip-title">Postes Recherchés</div><p class="strip-line">${data.targetRoles.map(r => `${e(r)}`).join(' · ')}</p></div>` : ''}
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

const RENDERERS: Record<string, (ctx: Ctx) => string> = {
  sidebar: renderSidebar,
  executive: renderExecutive,
  rail: renderRail,
  timeline: renderTimeline,
  compact: renderCompact,
  grid: renderGrid,
  minimal: renderMinimal,
  bold: renderBold,
  split: renderSplit,
  magazine: renderMagazine,
};

export function generateCVHtml(data: CVTemplateData, style?: Partial<CVStyle>): string {
  const auto = pickStyle(data.idNumber || data.email || data.name);
  const resolved: CVStyle = { layout: style?.layout || auto.layout, theme: style?.theme || auto.theme };
  const theme = CV_THEMES.find(th => th.id === resolved.theme) || CV_THEMES[0];
  const renderer = RENDERERS[resolved.layout] || renderSidebar;
  return renderer(buildCtx(data, theme));
}
