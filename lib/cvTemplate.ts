/**
 * Shared professional CV template system for TalentMap.
 *
 * Used by both the candidate CV builder and the coordinator's CV export, so
 * every downloaded/printed CV — regardless of who generates it — has the
 * same complete section coverage (contact, summary, experience, education,
 * skills, languages, certifications, target roles).
 *
 * Visual output is NOT a single fixed template: 5 structurally distinct
 * layouts × 11 color themes = 55 genuinely different combinations. Each
 * candidate is deterministically assigned one (stable across downloads,
 * based on their CIN) via pickStyle(), and can override it explicitly, so
 * two candidates' CVs are very unlikely to look alike.
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
  'Français': '🇫🇷', 'Anglais': '🇬🇧', 'Arabe': '🇲🇦', 'Espagnol': '🇪🇸',
  'Allemand': '🇩🇪', 'Néerlandais': '🇳🇱', 'Italien': '🇮🇹', 'Portugais': '🇵🇹',
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
  { id: 'burgundy', name: 'Bordeaux',     dark: '#450a1e', mid: '#881337', accent: '#be123c', tint: '#fff1f2', tintBorder: '#fecdd3', textOnDark: '#ffffff' },
  { id: 'violet',   name: 'Violet Royal', dark: '#2e1065', mid: '#5b21b6', accent: '#7c3aed', tint: '#f5f3ff', tintBorder: '#ddd6fe', textOnDark: '#ffffff' },
  { id: 'amber',    name: 'Ambre',        dark: '#451a03', mid: '#92400e', accent: '#d97706', tint: '#fffbeb', tintBorder: '#fde68a', textOnDark: '#ffffff' },
  { id: 'teal',     name: 'Sarcelle',     dark: '#042f2e', mid: '#115e59', accent: '#0d9488', tint: '#f0fdfa', tintBorder: '#99f6e4', textOnDark: '#ffffff' },
  { id: 'navy',     name: 'Marine',       dark: '#0f172a', mid: '#1e3a8a', accent: '#1d4ed8', tint: '#eff6ff', tintBorder: '#bfdbfe', textOnDark: '#ffffff' },
  { id: 'forest',   name: 'Forêt',        dark: '#052e16', mid: '#166534', accent: '#16a34a', tint: '#f0fdf4', tintBorder: '#bbf7d0', textOnDark: '#ffffff' },
  { id: 'graphite', name: 'Graphite',     dark: '#18181b', mid: '#3f3f46', accent: '#52525b', tint: '#fafafa', tintBorder: '#d4d4d8', textOnDark: '#ffffff' },
  { id: 'copper',   name: 'Cuivre',       dark: '#431407', mid: '#9a3412', accent: '#c2410c', tint: '#fff7ed', tintBorder: '#fed7aa', textOnDark: '#ffffff' },
];

/* ── Layouts ───────────────────────────────────────────────────────────── */
export const CV_LAYOUTS: { id: string; name: string; desc: string }[] = [
  { id: 'sidebar',   name: 'Barre latérale',  desc: 'Bandeau coloré + colonne latérale claire' },
  { id: 'executive', name: 'Exécutif centré',  desc: 'Colonne unique centrée, sobre et formelle' },
  { id: 'rail',      name: 'Rail latéral',     desc: 'Bande foncée pleine hauteur à gauche' },
  { id: 'timeline',  name: 'Chronologie',      desc: 'Expériences en frise chronologique verticale' },
  { id: 'compact',   name: 'ATS compact',      desc: 'Texte dense, sans couleur — optimisé ATS' },
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
  experience: string; sector: string;
  work: WorkEntry[]; education: Education;
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
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
  const contacts = [
    data.email && `✉ ${e(data.email)}`,
    data.phone && `📞 ${e(data.phone)}`,
    data.address && `📍 ${e(data.address)}`,
    data.idNumber && `🪪 CIN ${e(data.idNumber)}`,
    data.linkedin && `🔗 ${e(data.linkedin)}`,
    data.portfolio && `💻 ${e(data.portfolio)}`,
  ].filter(Boolean) as string[];
  return { e, data, t, today, avatarHtml, contacts };
}

const PRINT_GUARD = '.entry,.edu-entry,.tl-item,.hdr,.sec-title{break-inside:avoid;page-break-inside:avoid}';

/* ── Layout 1 — Sidebar (banner header + light side column) ────────────── */
function renderSidebar(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:840px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);overflow:hidden}
.hdr{background:linear-gradient(135deg,${t.dark} 0%,${t.mid} 50%,${t.accent} 100%);padding:2.5rem 2.75rem 2rem;color:${t.textOnDark};position:relative;overflow:hidden;display:flex;align-items:center;gap:2rem}
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
      ${data.summary ? `<div class="sec"><div class="sec-title">✦ Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
      ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">✦ Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
        <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
        <div class="meta">📅 ${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
        ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
      ${data.education.degree ? `<div class="sec"><div class="sec-title">✦ Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
      ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">✦ Postes Recherchés</div><div class="pills">${data.targetRoles.map(r => `<span class="pill role">🎯 ${e(r)}</span>`).join('')}</div></div>` : ''}
    </div>
    <div class="side">
      <div class="sec"><div class="sec-title">Niveau</div><span class="badge">⭐ ${e(data.experience)}</span></div>
      ${data.skills.length ? `<div class="sec"><div class="sec-title">Compétences</div><div class="pills">${data.skills.map(s => `<span class="pill">${e(s)}</span>`).join('')}</div></div>` : ''}
      ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div style="display:flex;flex-direction:column;gap:.4rem">${data.languages.map(l => `<span class="pill lang">${LANG_FLAGS[l] || '🌐'} ${e(l)}</span>`).join('')}</div></div>` : ''}
      ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div style="display:flex;flex-direction:column;gap:.4rem">${data.certifications.map(c => `<span class="pill cert">🏅 ${e(c)}</span>`).join('')}</div></div>` : ''}
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#f4f4f5;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
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
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div class="chips">${data.languages.map(l => `<span class="chip">${LANG_FLAGS[l] || '🌐'} ${e(l)}</span>`).join('')}</div></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div class="chips">${data.certifications.map(c => `<span class="chip">🏅 ${e(c)}</span>`).join('')}</div></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="chips">${data.targetRoles.map(r => `<span class="chip">🎯 ${e(r)}</span>`).join('')}</div></div>` : ''}
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 3 — Rail (full-height dark left rail, content on the right) ── */
function renderRail(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:880px;margin:2rem auto;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.14);display:grid;grid-template-columns:260px 1fr;overflow:hidden;min-height:900px}
.rail{background:linear-gradient(195deg,${t.dark},${t.mid});color:${t.textOnDark};padding:2.25rem 1.75rem}
.avatar{width:88px;height:88px;border-radius:50%;margin:0 auto 1rem;background:rgba(255,255,255,.12);border:3px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:1.85rem;font-weight:900;overflow:hidden}
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
    ${data.languages.length ? `<div class="rail-sec"><div class="rail-title">Langues</div>${data.languages.map(l => `<span class="rail-pill">${LANG_FLAGS[l] || '🌐'} ${e(l)}</span>`).join('')}</div>` : ''}
    ${data.certifications?.length ? `<div class="rail-sec"><div class="rail-title">Certifications</div>${data.certifications.map(c => `<span class="rail-pill">🏅 ${e(c)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="main">
    ${data.summary ? `<div class="sec"><div class="sec-title">Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
    ${data.work.some(w => w.company) ? `<div class="sec"><div class="sec-title">Expériences Professionnelles</div>${data.work.filter(w => w.company).map(w => `
      <div class="entry"><h4>${e(w.title) || 'Poste'}</h4><div class="co">${e(w.company)}</div>
      <div class="meta">📅 ${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
      ${w.description ? `<ul>${descToBulletList(w.description, e)}</ul>` : ''}</div>`).join('')}</div>` : ''}
    ${data.education.degree ? `<div class="sec"><div class="sec-title">Formation</div><div class="edu-entry"><h4>${e(data.education.degree)}</h4><div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div></div></div>` : ''}
    ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div>${data.targetRoles.map(r => `<span class="rail-pill" style="background:${t.tint};border-color:${t.tintBorder};color:${t.dark}">🎯 ${e(r)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 4 — Timeline (vertical connector line for experience) ──────── */
function renderTimeline(ctx: Ctx): string {
  const { e, data, t, today, avatarHtml, contacts } = ctx;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${e(data.name)} — CV</title><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#eef2f7;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
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
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><div class="tags">${data.languages.map(l => `<span class="tag">${LANG_FLAGS[l] || '🌐'} ${e(l)}</span>`).join('')}</div></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><div class="tags">${data.certifications.map(c => `<span class="tag">🏅 ${e(c)}</span>`).join('')}</div></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><div class="tags">${data.targetRoles.map(r => `<span class="tag">🎯 ${e(r)}</span>`).join('')}</div></div>` : ''}
  <div class="footer">Optimisé par l'Expert RH TalentMap · Marché marocain · ${today}</div>
</div>
</body></html>`;
}

/* ── Layout 5 — Compact ATS (dense, near-monochrome, no photo/icons) ───── */
function renderCompact(ctx: Ctx): string {
  const { e, data, t, today, contacts } = ctx;
  // ATS-friendly: no emoji/icons, no photo, minimal color — just a single
  // accent rule so it still reads as branded rather than default black-on-white.
  const plainContacts = [data.email, data.phone, data.address, data.idNumber ? `CIN ${data.idNumber}` : '', data.linkedin, data.portfolio]
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
  ${data.languages.length ? `<div class="sec"><div class="sec-title">Langues</div><p class="line">${data.languages.map(e).join(' · ')}</p></div>` : ''}
  ${data.certifications?.length ? `<div class="sec"><div class="sec-title">Certifications</div><p class="line">${data.certifications.map(e).join(' · ')}</p></div>` : ''}
  ${data.targetRoles?.length ? `<div class="sec"><div class="sec-title">Postes Recherchés</div><p class="line">${data.targetRoles.map(e).join(' · ')}</p></div>` : ''}
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
};

export function generateCVHtml(data: CVTemplateData, style?: Partial<CVStyle>): string {
  const auto = pickStyle(data.idNumber || data.email || data.name);
  const resolved: CVStyle = { layout: style?.layout || auto.layout, theme: style?.theme || auto.theme };
  const theme = CV_THEMES.find(th => th.id === resolved.theme) || CV_THEMES[0];
  const renderer = RENDERERS[resolved.layout] || renderSidebar;
  return renderer(buildCtx(data, theme));
}
