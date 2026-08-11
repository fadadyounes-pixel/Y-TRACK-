/**
 * Shared professional CV template for TalentMap.
 *
 * Used by both the candidate CV builder and the coordinator's CV export, so
 * every downloaded/printed CV — regardless of who generates it — has the
 * same complete, professional layout and the same section coverage
 * (contact, summary, experience, education, skills, languages,
 * certifications, target roles).
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

export function descToBullets(text: string): string {
  if (!text.trim()) return '';
  const lines = text.split(/\n|•|·/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    const sents = text.split(/\.\s+/).map(l => l.trim()).filter(l => l.length > 10);
    if (sents.length > 1) return sents.map(s => `<li>${escapeHtml(s.replace(/\.$/, ''))}.</li>`).join('');
    return `<li>${escapeHtml(text)}</li>`;
  }
  return lines.map(l => `<li>${escapeHtml(l)}</li>`).join('');
}

export interface CVTemplateData {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: Education;
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}

export function generateCVHtml(data: CVTemplateData): string {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${escapeHtml(data.photo)}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : escapeHtml(initials) || '?';
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${e(data.name)} — CV</title>
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
      <div class="hdr-name">${e(data.name) || 'Nom Prénom'}</div>
      <div class="hdr-role">${e(data.experience)} · ${e(data.sector)}</div>
      <div class="hdr-contacts">
        ${data.email ? `<span>✉ ${e(data.email)}</span>` : ''}
        ${data.phone ? `<span>📞 ${e(data.phone)}</span>` : ''}
        ${data.address ? `<span>📍 ${e(data.address)}</span>` : ''}
        ${data.idNumber ? `<span>🪪 CIN ${e(data.idNumber)}</span>` : ''}
        ${data.linkedin ? `<span>🔗 ${e(data.linkedin)}</span>` : ''}
        ${data.portfolio ? `<span>💻 ${e(data.portfolio)}</span>` : ''}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="main">
      ${data.summary ? `<div class="sec"><div class="sec-title">✦ Profil Professionnel</div><p class="summary-text">${e(data.summary)}</p></div>` : ''}
      ${data.work.some(w => w.company) ? `
      <div class="sec">
        <div class="sec-title">✦ Expériences Professionnelles</div>
        ${data.work.filter(w => w.company).map(w => `
        <div class="entry">
          <h4>${e(w.title) || 'Poste'}</h4>
          <div class="co">${e(w.company)}</div>
          <div class="meta">📅 ${e(w.startDate)}${w.startDate && (w.endDate || 'Présent') ? ' – ' + e(w.endDate || 'Présent') : e(w.endDate) || ''}</div>
          ${w.description ? `<ul>${descToBullets(w.description)}</ul>` : ''}
        </div>`).join('')}
      </div>` : ''}
      ${data.education.degree ? `
      <div class="sec">
        <div class="sec-title">✦ Formation</div>
        <div class="edu-entry">
          <h4>${e(data.education.degree)}</h4>
          <div class="meta">${e(data.education.institution) || ''}${data.education.year ? ' · ' + e(data.education.year) : ''}</div>
        </div>
      </div>` : ''}
      ${data.targetRoles?.length ? `
      <div class="sec">
        <div class="sec-title">✦ Postes Recherchés</div>
        <div class="pills">${data.targetRoles.map(r => `<span class="pill role">🎯 ${e(r)}</span>`).join('')}</div>
      </div>` : ''}
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
</body>
</html>`;
}
