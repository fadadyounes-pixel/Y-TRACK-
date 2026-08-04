'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../../components/Logo';
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
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.85rem;font-weight:800;color:#C49A35;font-family:'Playfair Display',Georgia,serif;letter-spacing:.02em">${initials || '?'}</span>`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Poppins:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',Arial,sans-serif;background:#d8dde6;color:#1a2438;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;display:flex;flex-direction:column;box-shadow:0 20px 64px rgba(0,0,0,.22);overflow:hidden}
/* ── Two-column layout ── */
.cv-body{display:flex;min-height:100%}
/* ── Left sidebar ── */
.sidebar{width:252px;flex-shrink:0;background:#0D1B2A;color:#e8edf3;display:flex;flex-direction:column}
.sidebar-top{padding:2.4rem 1.8rem 1.8rem;display:flex;flex-direction:column;align-items:center;text-align:center;background:#0A1520;border-bottom:1px solid rgba(196,154,53,.25)}
.avatar-ring{width:108px;height:108px;border-radius:50%;border:3px solid #C49A35;background:#1a2d42;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:1.1rem;box-shadow:0 0 0 6px rgba(196,154,53,.12)}
.sb-name{font-family:'Playfair Display',Georgia,serif;font-size:1.18rem;font-weight:700;color:#fff;line-height:1.3;letter-spacing:.01em;margin-bottom:.3rem}
.sb-role{font-size:.74rem;font-weight:500;color:#C49A35;text-transform:uppercase;letter-spacing:.12em;line-height:1.4}
.sidebar-sections{padding:1.6rem 1.8rem;flex:1}
.sb-sec{margin-bottom:1.7rem}
.sb-sec-title{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:#C49A35;margin-bottom:.9rem;padding-bottom:.45rem;border-bottom:1px solid rgba(196,154,53,.3);display:flex;align-items:center;gap:.45rem}
.sb-sec-title::before{content:'';display:inline-block;width:14px;height:2px;background:#C49A35;border-radius:1px;flex-shrink:0}
.contact-row{display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem}
.contact-icon{width:26px;height:26px;border-radius:6px;background:rgba(196,154,53,.13);border:1px solid rgba(196,154,53,.22);display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0;margin-top:.05rem}
.contact-text{font-size:.74rem;color:#b8c4d2;line-height:1.55;word-break:break-word}
.skill-tag{display:inline-block;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:4px;padding:.28rem .7rem;font-size:.7rem;font-weight:500;color:#c8d4e0;margin:.22rem .2rem .22rem 0;line-height:1.3}
.lang-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}
.lang-name{font-size:.75rem;color:#c8d4e0;font-weight:500;display:flex;align-items:center;gap:.4rem}
.lang-bar-wrap{width:78px;height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
.lang-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,#C49A35,#e8c170)}
.cert-item{display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.55rem}
.cert-dot{width:6px;height:6px;border-radius:50%;background:#C49A35;margin-top:.35rem;flex-shrink:0}
.cert-text{font-size:.72rem;color:#b8c4d2;line-height:1.5}
/* ── Right main content ── */
.main{flex:1;background:#ffffff;display:flex;flex-direction:column}
.main-inner{padding:2.4rem 2.8rem 2rem}
.main-sec{margin-bottom:2rem}
.main-sec-title{font-family:'Playfair Display',Georgia,serif;font-size:.95rem;font-weight:700;color:#0D1B2A;text-transform:uppercase;letter-spacing:.09em;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid #C49A35;display:flex;align-items:center;gap:.5rem}
.profile-text{font-size:.84rem;color:#334155;line-height:1.85;padding:.9rem 1.1rem;background:#f9fafb;border-left:3px solid #C49A35;border-radius:0 6px 6px 0;font-style:italic}
.work-entry{margin-bottom:1.3rem;padding-bottom:1.3rem;border-bottom:1px solid #f0f2f5;position:relative;padding-left:1rem}
.work-entry:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.work-entry::before{content:'';position:absolute;left:0;top:.35rem;width:3px;height:calc(100% - .7rem);background:rgba(196,154,53,.25);border-radius:2px}
.work-title{font-family:'Playfair Display',Georgia,serif;font-size:.98rem;font-weight:700;color:#0D1B2A;line-height:1.3}
.work-company{font-size:.82rem;font-weight:700;color:#C49A35;margin:.18rem 0 .12rem;letter-spacing:.01em}
.work-meta{font-size:.71rem;color:#94a3b8;font-weight:500;margin-bottom:.5rem;display:flex;align-items:center;gap:.3rem}
.work-entry ul{list-style:none;padding:0;margin:0}
.work-entry ul li{font-size:.79rem;color:#475569;line-height:1.7;padding-left:1.1rem;position:relative;margin-bottom:.2rem}
.work-entry ul li::before{content:"▸";position:absolute;left:0;color:#C49A35;font-weight:700;font-size:.8rem;top:.02rem}
.edu-block{background:#f9fafb;border-radius:8px;padding:.95rem 1.2rem;border:1px solid #e8ecf0;display:flex;gap:1rem;align-items:flex-start}
.edu-year-badge{background:#0D1B2A;color:#C49A35;font-size:.68rem;font-weight:700;padding:.3rem .65rem;border-radius:5px;white-space:nowrap;flex-shrink:0;margin-top:.15rem;letter-spacing:.04em}
.edu-degree{font-family:'Playfair Display',Georgia,serif;font-size:.92rem;font-weight:600;color:#0D1B2A;line-height:1.3}
.edu-inst{font-size:.75rem;color:#64748b;margin-top:.22rem;font-weight:500}
.roles-wrap{display:flex;flex-wrap:wrap;gap:.45rem}
.role-chip{background:#0D1B2A;color:#C49A35;border-radius:5px;padding:.35rem .9rem;font-size:.74rem;font-weight:600;letter-spacing:.02em;border:1px solid rgba(196,154,53,.35)}
.exp-badge{display:inline-flex;align-items:center;gap:.4rem;background:#0D1B2A;color:#C49A35;border-radius:6px;padding:.38rem 1rem;font-size:.75rem;font-weight:700;letter-spacing:.04em;border:1px solid rgba(196,154,53,.4)}
/* ── Footer ── */
.cv-footer{background:#0D1B2A;padding:.75rem 2.4rem;display:flex;align-items:center;justify-content:space-between}
.cv-footer-brand{font-size:.65rem;font-weight:700;color:#C49A35;text-transform:uppercase;letter-spacing:.14em}
.cv-footer-date{font-size:.63rem;color:rgba(255,255,255,.35);letter-spacing:.03em}
@media print{
  body{background:#fff}
  .page{margin:0;box-shadow:none}
  .work-entry{page-break-inside:avoid}
  .main-sec{page-break-inside:avoid}
}
</style>
</head>
<body>
<div class="page">
  <div class="cv-body">
    <!-- ══ SIDEBAR ══ -->
    <div class="sidebar">
      <div class="sidebar-top">
        <div class="avatar-ring">${avatarHtml}</div>
        <div class="sb-name">${data.name || 'Nom Prénom'}</div>
        <div class="sb-role">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>
      </div>
      <div class="sidebar-sections">
        <!-- Coordonnées -->
        <div class="sb-sec">
          <div class="sb-sec-title">Coordonnées</div>
          ${data.email ? `<div class="contact-row"><div class="contact-icon">✉</div><div class="contact-text">${data.email}</div></div>` : ''}
          ${data.phone ? `<div class="contact-row"><div class="contact-icon">☏</div><div class="contact-text">${data.phone}</div></div>` : ''}
          ${data.address ? `<div class="contact-row"><div class="contact-icon">⌖</div><div class="contact-text">${data.address}</div></div>` : ''}
          ${data.linkedin ? `<div class="contact-row"><div class="contact-icon">in</div><div class="contact-text">${data.linkedin}</div></div>` : ''}
          ${data.portfolio ? `<div class="contact-row"><div class="contact-icon">↗</div><div class="contact-text">${data.portfolio}</div></div>` : ''}
        </div>
        <!-- Compétences -->
        ${data.skills.length ? `
        <div class="sb-sec">
          <div class="sb-sec-title">Compétences</div>
          <div>${data.skills.map((s: string) => `<span class="skill-tag">${s}</span>`).join('')}</div>
        </div>` : ''}
        <!-- Langues -->
        ${data.languages.length ? `
        <div class="sb-sec">
          <div class="sb-sec-title">Langues</div>
          ${data.languages.map((l: string, i: number) => {
            const barWidth = i === 0 ? '100%' : i === 1 ? '82%' : i === 2 ? '65%' : '50%';
            return `<div class="lang-row">
              <div class="lang-name"><span>${LANG_FLAGS[l] || '🌐'}</span><span>${l}</span></div>
              <div class="lang-bar-wrap"><div class="lang-bar" style="width:${barWidth}"></div></div>
            </div>`;
          }).join('')}
        </div>` : ''}
        <!-- Certifications -->
        ${data.certifications?.length ? `
        <div class="sb-sec">
          <div class="sb-sec-title">Certifications</div>
          ${data.certifications.map((c: string) => `<div class="cert-item"><div class="cert-dot"></div><div class="cert-text">${c}</div></div>`).join('')}
        </div>` : ''}
        <!-- Niveau -->
        ${data.experience ? `
        <div class="sb-sec">
          <div class="sb-sec-title">Niveau</div>
          <span class="exp-badge">◆ ${data.experience}</span>
        </div>` : ''}
      </div>
    </div>
    <!-- ══ MAIN ══ -->
    <div class="main">
      <div class="main-inner">
        <!-- Profil professionnel -->
        ${data.summary ? `
        <div class="main-sec">
          <div class="main-sec-title">Profil Professionnel</div>
          <p class="profile-text">${data.summary}</p>
        </div>` : ''}
        <!-- Expériences -->
        ${data.work.some((w: WorkEntry) => w.company) ? `
        <div class="main-sec">
          <div class="main-sec-title">Expériences Professionnelles</div>
          ${data.work.filter((w: WorkEntry) => w.company).map((w: WorkEntry) => `
          <div class="work-entry">
            <div class="work-title">${w.title || 'Poste'}</div>
            <div class="work-company">${w.company}</div>
            <div class="work-meta">
              <span>◷</span>
              <span>${w.startDate || ''}${w.startDate || w.endDate ? ' — ' : ''}${w.endDate || (w.startDate ? 'Présent' : '')}</span>
            </div>
            ${w.description ? `<ul>${descToBullets(w.description)}</ul>` : ''}
          </div>`).join('')}
        </div>` : ''}
        <!-- Formation -->
        ${data.education.degree ? `
        <div class="main-sec">
          <div class="main-sec-title">Formation</div>
          <div class="edu-block">
            ${data.education.year ? `<div class="edu-year-badge">${data.education.year}</div>` : ''}
            <div>
              <div class="edu-degree">${data.education.degree}</div>
              ${data.education.institution ? `<div class="edu-inst">${data.education.institution}</div>` : ''}
            </div>
          </div>
        </div>` : ''}
        <!-- Postes recherchés -->
        ${data.targetRoles?.length ? `
        <div class="main-sec">
          <div class="main-sec-title">Postes Visés</div>
          <div class="roles-wrap">${data.targetRoles.map((r: string) => `<span class="role-chip">${r}</span>`).join('')}</div>
        </div>` : ''}
      </div>
    </div>
  </div>
  <!-- ══ FOOTER ══ -->
  <div class="cv-footer">
    <span class="cv-footer-brand">TalentMap · Expert RH · Maroc</span>
    <span class="cv-footer-date">${today}</span>
  </div>
</div>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════════
   TEMPLATE 2 — Modern Teal  (single column, full-width teal header)
══════════════════════════════════════════════════════════════════ */
function generateCVHtml2(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.6rem;font-weight:800;color:#0891B2;font-family:Inter,Arial,sans-serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;background:#e8edf2;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;background:#fff;box-shadow:0 20px 64px rgba(0,0,0,.18);overflow:hidden}
.t2-header{background:linear-gradient(135deg,#0891B2 0%,#0e7490 60%,#164e63 100%);padding:2.4rem 2.8rem 2rem;display:flex;align-items:center;gap:2rem;position:relative;overflow:hidden}
.t2-header::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.06)}
.t2-header::before{content:'';position:absolute;right:80px;bottom:-40px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.04)}
.t2-avatar{width:96px;height:96px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.t2-header-info{flex:1;position:relative;z-index:1}
.t2-name{font-family:'DM Serif Display',Georgia,serif;font-size:2rem;font-weight:400;color:#fff;line-height:1.15;letter-spacing:-.01em;margin-bottom:.35rem}
.t2-role{font-size:.82rem;font-weight:600;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.12em;margin-bottom:.9rem}
.t2-contacts{display:flex;flex-wrap:wrap;gap:.5rem .9rem}
.t2-contact-chip{display:flex;align-items:center;gap:.38rem;font-size:.72rem;color:rgba(255,255,255,.82);font-weight:400}
.t2-contact-chip span:first-child{font-size:.78rem}
.t2-body{padding:2.2rem 2.8rem 2.4rem;display:grid;grid-template-columns:1fr 240px;gap:2.4rem}
.t2-main{}
.t2-sidebar-right{}
.t2-sec{margin-bottom:1.8rem}
.t2-sec:last-child{margin-bottom:0}
.t2-sec-title{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.17em;color:#0891B2;margin-bottom:.9rem;padding-bottom:.45rem;border-bottom:2px solid #e0f2fe;display:flex;align-items:center;gap:.5rem}
.t2-sec-title svg{flex-shrink:0}
.t2-summary{font-size:.85rem;color:#374151;line-height:1.8;border-left:3px solid #0891B2;padding-left:1rem;font-style:italic;background:#f0f9ff;padding:.85rem 1rem;border-radius:0 8px 8px 0}
.t2-work{margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid #f1f5f9}
.t2-work:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.t2-work-title{font-size:.96rem;font-weight:700;color:#0f172a;line-height:1.3}
.t2-work-co{font-size:.82rem;font-weight:600;color:#0891B2;margin:.15rem 0 .1rem}
.t2-work-date{font-size:.7rem;color:#94a3b8;font-weight:500;margin-bottom:.45rem;display:inline-flex;align-items:center;gap:.3rem;background:#f8fafc;padding:.2rem .55rem;border-radius:5px}
.t2-work ul{list-style:none;padding:0}
.t2-work ul li{font-size:.79rem;color:#475569;line-height:1.72;padding-left:1.1rem;position:relative;margin-bottom:.18rem}
.t2-work ul li::before{content:"▸";position:absolute;left:0;color:#0891B2;font-weight:700;font-size:.82rem}
.t2-skill-grid{display:flex;flex-wrap:wrap;gap:.35rem}
.t2-skill{display:inline-flex;align-items:center;gap:.3rem;padding:.3rem .75rem;border-radius:6px;font-size:.72rem;font-weight:600;background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd}
.t2-lang-item{display:flex;align-items:center;justify-content:space-between;margin-bottom:.55rem}
.t2-lang-name{font-size:.77rem;color:#374151;font-weight:500;display:flex;align-items:center;gap:.38rem}
.t2-lang-dots{display:flex;gap:3px}
.t2-lang-dot{width:8px;height:8px;border-radius:50%}
.t2-edu{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:.9rem 1rem}
.t2-edu-degree{font-size:.88rem;font-weight:700;color:#0f172a;line-height:1.3}
.t2-edu-inst{font-size:.74rem;color:#0891B2;font-weight:600;margin-top:.18rem}
.t2-edu-year{display:inline-block;font-size:.66rem;font-weight:700;color:#fff;background:#0891B2;padding:.2rem .55rem;border-radius:5px;margin-top:.35rem}
.t2-cert{display:flex;align-items:flex-start;gap:.45rem;margin-bottom:.45rem;font-size:.74rem;color:#475569;line-height:1.55}
.t2-cert::before{content:"✦";color:#0891B2;font-size:.62rem;margin-top:.22rem;flex-shrink:0}
.t2-role-chip{display:inline-block;padding:.3rem .8rem;border-radius:20px;font-size:.71rem;font-weight:600;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;margin:.18rem .18rem 0 0}
.t2-footer{background:#0f172a;padding:.6rem 2.8rem;display:flex;align-items:center;justify-content:space-between}
.t2-footer-brand{font-size:.62rem;font-weight:700;color:#0891B2;text-transform:uppercase;letter-spacing:.14em}
.t2-footer-date{font-size:.6rem;color:rgba(255,255,255,.3)}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}.t2-work{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="page">
  <div class="t2-header">
    <div class="t2-avatar">${avatarHtml}</div>
    <div class="t2-header-info">
      <div class="t2-name">${data.name || 'Nom Prénom'}</div>
      <div class="t2-role">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>
      <div class="t2-contacts">
        ${data.email ? `<div class="t2-contact-chip"><span>✉</span><span>${data.email}</span></div>` : ''}
        ${data.phone ? `<div class="t2-contact-chip"><span>☏</span><span>${data.phone}</span></div>` : ''}
        ${data.address ? `<div class="t2-contact-chip"><span>📍</span><span>${data.address}</span></div>` : ''}
        ${data.linkedin ? `<div class="t2-contact-chip"><span>in</span><span>${data.linkedin}</span></div>` : ''}
      </div>
    </div>
  </div>
  <div class="t2-body">
    <div class="t2-main">
      ${data.summary ? `<div class="t2-sec"><div class="t2-sec-title">Profil Professionnel</div><div class="t2-summary">${data.summary}</div></div>` : ''}
      ${data.work.some((w: WorkEntry) => w.company) ? `
      <div class="t2-sec">
        <div class="t2-sec-title">Expériences Professionnelles</div>
        ${data.work.filter((w: WorkEntry) => w.company).map((w: WorkEntry) => `
        <div class="t2-work">
          <div class="t2-work-title">${w.title || 'Poste'}</div>
          <div class="t2-work-co">${w.company}</div>
          ${(w.startDate || w.endDate) ? `<div class="t2-work-date">◷ ${w.startDate || ''}${w.startDate || w.endDate ? ' — ' : ''}${w.endDate || (w.startDate ? 'Présent' : '')}</div>` : ''}
          ${w.description ? `<ul>${descToBullets(w.description)}</ul>` : ''}
        </div>`).join('')}
      </div>` : ''}
      ${data.education.degree ? `
      <div class="t2-sec">
        <div class="t2-sec-title">Formation</div>
        <div class="t2-edu">
          <div class="t2-edu-degree">${data.education.degree}</div>
          ${data.education.institution ? `<div class="t2-edu-inst">${data.education.institution}</div>` : ''}
          ${data.education.year ? `<span class="t2-edu-year">${data.education.year}</span>` : ''}
        </div>
      </div>` : ''}
    </div>
    <div class="t2-sidebar-right">
      ${data.skills.length ? `
      <div class="t2-sec">
        <div class="t2-sec-title">Compétences</div>
        <div class="t2-skill-grid">${data.skills.map((s: string) => `<span class="t2-skill">✓ ${s}</span>`).join('')}</div>
      </div>` : ''}
      ${data.languages.length ? `
      <div class="t2-sec">
        <div class="t2-sec-title">Langues</div>
        ${data.languages.map((l: string, i: number) => {
          const filled = i === 0 ? 5 : i === 1 ? 4 : i === 2 ? 3 : 2;
          return `<div class="t2-lang-item">
            <div class="t2-lang-name"><span>${LANG_FLAGS[l] || '🌐'}</span><span>${l}</span></div>
            <div class="t2-lang-dots">${[1,2,3,4,5].map(n => `<div class="t2-lang-dot" style="background:${n<=filled?'#0891B2':'#e2e8f0'}"></div>`).join('')}</div>
          </div>`;
        }).join('')}
      </div>` : ''}
      ${data.certifications?.length ? `
      <div class="t2-sec">
        <div class="t2-sec-title">Certifications</div>
        ${data.certifications.map((c: string) => `<div class="t2-cert">${c}</div>`).join('')}
      </div>` : ''}
      ${data.targetRoles?.length ? `
      <div class="t2-sec">
        <div class="t2-sec-title">Postes Visés</div>
        <div>${data.targetRoles.map((r: string) => `<span class="t2-role-chip">${r}</span>`).join('')}</div>
      </div>` : ''}
    </div>
  </div>
  <div class="t2-footer">
    <span class="t2-footer-brand">TalentMap · Expert RH · Maroc</span>
    <span class="t2-footer-date">${today}</span>
  </div>
</div>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════════
   TEMPLATE 3 — Bold Executive  (dark header, purple accent, 2-col)
══════════════════════════════════════════════════════════════════ */
function generateCVHtml3(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.55rem;font-weight:800;color:#7C3AED">${initials || '?'}</span>`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&family=Lato:wght@300;400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Lato',Arial,sans-serif;background:#dde2e8;color:#1e1b4b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;background:#fff;box-shadow:0 20px 64px rgba(0,0,0,.2);overflow:hidden}
.t3-header{background:#1e1b4b;padding:2.2rem 2.8rem 2rem;display:flex;align-items:center;gap:1.8rem;position:relative;overflow:hidden}
.t3-accent-bar{position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,#7C3AED,#4f46e5)}
.t3-avatar{width:90px;height:90px;border-radius:12px;border:2.5px solid rgba(124,58,237,.6);background:rgba(124,58,237,.1);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;margin-left:.5rem}
.t3-hd-info{flex:1}
.t3-name{font-family:'Raleway',Arial,serif;font-size:2.05rem;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-.02em;text-transform:uppercase;margin-bottom:.3rem}
.t3-role-tag{display:inline-flex;align-items:center;gap:.45rem;background:rgba(124,58,237,.25);border:1px solid rgba(124,58,237,.5);color:#c4b5fd;font-size:.74rem;font-weight:700;padding:.3rem .9rem;border-radius:20px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.85rem}
.t3-contacts{display:flex;flex-wrap:wrap;gap:.4rem .85rem}
.t3-chip{font-size:.72rem;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:.35rem}
.t3-chip-icon{color:#7C3AED;font-size:.78rem}
.t3-body{display:flex;min-height:1px}
.t3-left{width:236px;flex-shrink:0;background:#f5f3ff;padding:1.8rem 1.6rem;border-right:1px solid #ede9fe}
.t3-right{flex:1;padding:1.9rem 2.2rem}
.t3-sec{margin-bottom:1.6rem}
.t3-sec:last-child{margin-bottom:0}
.t3-sec-title{font-family:'Raleway',Arial,sans-serif;font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.2em;color:#7C3AED;margin-bottom:.85rem;padding-bottom:.4rem;border-bottom:2px solid #ede9fe;display:flex;align-items:center;gap:.4rem}
.t3-sec-title::before{content:'';width:10px;height:2px;background:#7C3AED;display:inline-block;flex-shrink:0}
.t3-skill-item{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem}
.t3-skill-dot{width:5px;height:5px;border-radius:50%;background:#7C3AED;flex-shrink:0}
.t3-skill-name{font-size:.75rem;color:#3730a3;font-weight:500}
.t3-lang-row{margin-bottom:.6rem}
.t3-lang-label{font-size:.72rem;color:#4338ca;font-weight:600;margin-bottom:.25rem;display:flex;align-items:center;gap:.3rem}
.t3-lang-bar-bg{height:3px;background:#ddd6fe;border-radius:2px;overflow:hidden}
.t3-lang-bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#7C3AED,#4f46e5)}
.t3-cert{font-size:.72rem;color:#4338ca;line-height:1.6;margin-bottom:.4rem;padding-left:.85rem;position:relative}
.t3-cert::before{content:"◆";position:absolute;left:0;font-size:.5rem;color:#7C3AED;top:.18rem}
.t3-summary{font-size:.84rem;color:#374151;line-height:1.8;border-left:4px solid #7C3AED;padding:.9rem 1rem;background:#faf5ff;border-radius:0 8px 8px 0;margin-bottom:1.8rem;font-style:italic}
.t3-work{margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px dashed #e9d5ff}
.t3-work:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.t3-work-header{display:flex;align-items:flex-start;justify-content:space-between;gap:.8rem;margin-bottom:.3rem}
.t3-work-title{font-family:'Raleway',Arial,sans-serif;font-size:.97rem;font-weight:800;color:#1e1b4b;line-height:1.25}
.t3-work-date{font-size:.68rem;color:#7C3AED;font-weight:700;background:#f5f3ff;padding:.22rem .6rem;border-radius:5px;white-space:nowrap;flex-shrink:0;border:1px solid #ddd6fe}
.t3-work-co{font-size:.81rem;font-weight:600;color:#6d28d9;margin-bottom:.45rem}
.t3-work ul{list-style:none;padding:0}
.t3-work ul li{font-size:.79rem;color:#475569;line-height:1.7;padding-left:1.15rem;position:relative;margin-bottom:.18rem}
.t3-work ul li::before{content:"▸";position:absolute;left:0;color:#7C3AED;font-weight:700;font-size:.85rem}
.t3-edu-block{background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:10px;padding:.9rem 1.1rem;display:flex;gap:.9rem;align-items:flex-start}
.t3-edu-badge{background:#7C3AED;color:#fff;font-size:.65rem;font-weight:700;padding:.25rem .6rem;border-radius:5px;white-space:nowrap;flex-shrink:0;margin-top:.1rem}
.t3-edu-degree{font-family:'Raleway',Arial,sans-serif;font-size:.9rem;font-weight:800;color:#1e1b4b}
.t3-edu-inst{font-size:.73rem;color:#7C3AED;margin-top:.2rem;font-weight:500}
.t3-roles-wrap{display:flex;flex-wrap:wrap;gap:.35rem}
.t3-role-chip{background:#1e1b4b;color:#c4b5fd;border-radius:5px;padding:.28rem .75rem;font-size:.7rem;font-weight:700;border:1px solid rgba(124,58,237,.4)}
.t3-exp-badge{display:inline-flex;align-items:center;gap:.35rem;background:#7C3AED;color:#fff;border-radius:6px;padding:.3rem .9rem;font-size:.7rem;font-weight:700;margin-bottom:.9rem}
.t3-footer{background:#1e1b4b;padding:.55rem 2.8rem;display:flex;align-items:center;justify-content:space-between}
.t3-footer-brand{font-size:.6rem;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:.14em}
.t3-footer-date{font-size:.58rem;color:rgba(255,255,255,.28)}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}.t3-work{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="page">
  <div class="t3-header">
    <div class="t3-accent-bar"></div>
    <div class="t3-avatar">${avatarHtml}</div>
    <div class="t3-hd-info">
      <div class="t3-name">${data.name || 'Nom Prénom'}</div>
      <div class="t3-role-tag">◆ ${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>
      <div class="t3-contacts">
        ${data.email ? `<div class="t3-chip"><span class="t3-chip-icon">✉</span><span>${data.email}</span></div>` : ''}
        ${data.phone ? `<div class="t3-chip"><span class="t3-chip-icon">☏</span><span>${data.phone}</span></div>` : ''}
        ${data.address ? `<div class="t3-chip"><span class="t3-chip-icon">📍</span><span>${data.address}</span></div>` : ''}
        ${data.linkedin ? `<div class="t3-chip"><span class="t3-chip-icon">in</span><span>${data.linkedin}</span></div>` : ''}
      </div>
    </div>
  </div>
  <div class="t3-body">
    <div class="t3-left">
      ${data.skills.length ? `
      <div class="t3-sec">
        <div class="t3-sec-title">Compétences</div>
        ${data.skills.map((s: string) => `<div class="t3-skill-item"><div class="t3-skill-dot"></div><span class="t3-skill-name">${s}</span></div>`).join('')}
      </div>` : ''}
      ${data.languages.length ? `
      <div class="t3-sec">
        <div class="t3-sec-title">Langues</div>
        ${data.languages.map((l: string, i: number) => {
          const pct = i === 0 ? '100%' : i === 1 ? '82%' : i === 2 ? '62%' : '45%';
          return `<div class="t3-lang-row">
            <div class="t3-lang-label">${LANG_FLAGS[l] || '🌐'} ${l}</div>
            <div class="t3-lang-bar-bg"><div class="t3-lang-bar-fill" style="width:${pct}"></div></div>
          </div>`;
        }).join('')}
      </div>` : ''}
      ${data.certifications?.length ? `
      <div class="t3-sec">
        <div class="t3-sec-title">Certifications</div>
        ${data.certifications.map((c: string) => `<div class="t3-cert">${c}</div>`).join('')}
      </div>` : ''}
      ${data.education.degree ? `
      <div class="t3-sec">
        <div class="t3-sec-title">Formation</div>
        <div class="t3-edu-block">
          ${data.education.year ? `<div class="t3-edu-badge">${data.education.year}</div>` : ''}
          <div>
            <div class="t3-edu-degree">${data.education.degree}</div>
            ${data.education.institution ? `<div class="t3-edu-inst">${data.education.institution}</div>` : ''}
          </div>
        </div>
      </div>` : ''}
    </div>
    <div class="t3-right">
      ${data.experience ? `<div class="t3-exp-badge">◆ ${data.experience}</div>` : ''}
      ${data.summary ? `<div class="t3-summary">${data.summary}</div>` : ''}
      ${data.work.some((w: WorkEntry) => w.company) ? `
      <div class="t3-sec">
        <div class="t3-sec-title">Expériences Professionnelles</div>
        ${data.work.filter((w: WorkEntry) => w.company).map((w: WorkEntry) => `
        <div class="t3-work">
          <div class="t3-work-header">
            <div class="t3-work-title">${w.title || 'Poste'}</div>
            ${(w.startDate || w.endDate) ? `<div class="t3-work-date">${w.startDate || ''}${w.startDate||w.endDate?' — ':''}${w.endDate||(w.startDate?'Présent':'')}</div>` : ''}
          </div>
          <div class="t3-work-co">${w.company}</div>
          ${w.description ? `<ul>${descToBullets(w.description)}</ul>` : ''}
        </div>`).join('')}
      </div>` : ''}
      ${data.targetRoles?.length ? `
      <div class="t3-sec">
        <div class="t3-sec-title">Postes Visés</div>
        <div class="t3-roles-wrap">${data.targetRoles.map((r: string) => `<span class="t3-role-chip">${r}</span>`).join('')}</div>
      </div>` : ''}
    </div>
  </div>
  <div class="t3-footer">
    <span class="t3-footer-brand">TalentMap · Expert RH · Maroc</span>
    <span class="t3-footer-date">${today}</span>
  </div>
</div>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════════
   TEMPLATE 4 — Classic ATS  (single column, minimal, recruiter-safe)
══════════════════════════════════════════════════════════════════ */
function generateCVHtml4(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.4rem;font-weight:700;color:#1B4FD8">${initials || '?'}</span>`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,600;8..60,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Source Sans 3',Arial,sans-serif;background:#e8e8e8;color:#1a1a2e;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:780px;margin:2rem auto;background:#fff;box-shadow:0 8px 40px rgba(0,0,0,.15);padding:2.8rem 3rem}
.t4-top{display:flex;align-items:center;gap:1.6rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:2.5px solid #1B4FD8}
.t4-avatar{width:78px;height:78px;border-radius:8px;border:2px solid #dbeafe;background:#eff6ff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.t4-hd{flex:1}
.t4-name{font-family:'Source Serif 4',Georgia,serif;font-size:2.1rem;font-weight:700;color:#0f172a;line-height:1.15;margin-bottom:.3rem;letter-spacing:-.01em}
.t4-subtitle{font-size:.82rem;font-weight:600;color:#1B4FD8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.6rem}
.t4-contacts-row{display:flex;flex-wrap:wrap;gap:.3rem .9rem}
.t4-contact{font-size:.73rem;color:#64748b;display:flex;align-items:center;gap:.3rem}
.t4-sec{margin-bottom:1.55rem}
.t4-sec-title{font-family:'Source Serif 4',Georgia,serif;font-size:.8rem;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:.12em;margin-bottom:.85rem;padding-bottom:.4rem;border-bottom:1.5px solid #1B4FD8;position:relative}
.t4-sec-title::after{content:'';position:absolute;bottom:-3px;left:0;width:40px;height:1.5px;background:#93c5fd}
.t4-summary{font-size:.85rem;color:#374151;line-height:1.82;border-left:3px solid #bfdbfe;padding-left:.9rem;color:#475569}
.t4-work{margin-bottom:1.05rem;padding-bottom:1.05rem;border-bottom:1px solid #f1f5f9}
.t4-work:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.t4-work-top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.12rem}
.t4-work-title{font-size:.94rem;font-weight:700;color:#0f172a}
.t4-work-date{font-size:.71rem;color:#94a3b8;font-weight:500}
.t4-work-co{font-size:.81rem;font-weight:600;color:#1B4FD8;margin-bottom:.42rem}
.t4-work ul{list-style:disc;padding-left:1.2rem}
.t4-work ul li{font-size:.8rem;color:#475569;line-height:1.72;margin-bottom:.15rem}
.t4-edu-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.1rem}
.t4-edu-degree{font-size:.9rem;font-weight:700;color:#0f172a}
.t4-edu-year{font-size:.71rem;color:#94a3b8;font-weight:500}
.t4-edu-inst{font-size:.78rem;color:#1B4FD8;font-weight:500;margin-top:.1rem}
.t4-skills-grid{display:flex;flex-wrap:wrap;gap:.4rem}
.t4-skill{display:inline-flex;align-items:center;gap:.28rem;padding:.26rem .75rem;border-radius:4px;font-size:.74rem;font-weight:500;background:#eff6ff;color:#1e40af;border:1px solid #dbeafe}
.t4-two-col{display:grid;grid-template-columns:1fr 1fr;gap:0 2rem}
.t4-lang-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem}
.t4-lang-label{font-size:.76rem;color:#374151;display:flex;align-items:center;gap:.35rem}
.t4-lang-level{font-size:.68rem;font-weight:600;color:#1B4FD8;background:#eff6ff;padding:.15rem .5rem;border-radius:3px}
.t4-role-chip{display:inline-block;padding:.22rem .7rem;font-size:.73rem;font-weight:600;color:#1B4FD8;border:1.5px solid #bfdbfe;border-radius:4px;margin:.15rem .15rem 0 0;background:#eff6ff}
.t4-cert{font-size:.77rem;color:#374151;line-height:1.6;margin-bottom:.38rem;padding-left:.8rem;position:relative}
.t4-cert::before{content:"·";position:absolute;left:0;color:#1B4FD8;font-size:1.1rem;line-height:.9}
.t4-footer{margin-top:1.8rem;padding-top:.7rem;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between}
.t4-footer-brand{font-size:.6rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em}
.t4-footer-date{font-size:.6rem;color:#cbd5e1}
@media print{body{background:#fff}.page{margin:0;box-shadow:none;padding:1.8rem 2rem}.t4-work{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="page">
  <div class="t4-top">
    <div class="t4-avatar">${avatarHtml}</div>
    <div class="t4-hd">
      <div class="t4-name">${data.name || 'Nom Prénom'}</div>
      <div class="t4-subtitle">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>
      <div class="t4-contacts-row">
        ${data.email ? `<div class="t4-contact"><span>✉</span>${data.email}</div>` : ''}
        ${data.phone ? `<div class="t4-contact"><span>☏</span>${data.phone}</div>` : ''}
        ${data.address ? `<div class="t4-contact"><span>📍</span>${data.address}</div>` : ''}
        ${data.linkedin ? `<div class="t4-contact"><span>in</span>${data.linkedin}</div>` : ''}
        ${data.portfolio ? `<div class="t4-contact"><span>↗</span>${data.portfolio}</div>` : ''}
      </div>
    </div>
  </div>
  ${data.summary ? `
  <div class="t4-sec">
    <div class="t4-sec-title">Profil Professionnel</div>
    <div class="t4-summary">${data.summary}</div>
  </div>` : ''}
  ${data.work.some((w: WorkEntry) => w.company) ? `
  <div class="t4-sec">
    <div class="t4-sec-title">Expériences Professionnelles</div>
    ${data.work.filter((w: WorkEntry) => w.company).map((w: WorkEntry) => `
    <div class="t4-work">
      <div class="t4-work-top">
        <div class="t4-work-title">${w.title || 'Poste'}</div>
        ${(w.startDate || w.endDate) ? `<div class="t4-work-date">${w.startDate || ''}${w.startDate||w.endDate?' – ':''}${w.endDate||(w.startDate?'Présent':'')}</div>` : ''}
      </div>
      <div class="t4-work-co">${w.company}</div>
      ${w.description ? `<ul>${descToBullets(w.description)}</ul>` : ''}
    </div>`).join('')}
  </div>` : ''}
  <div class="t4-two-col">
    <div>
      ${data.education.degree ? `
      <div class="t4-sec">
        <div class="t4-sec-title">Formation</div>
        <div class="t4-edu-row">
          <div class="t4-edu-degree">${data.education.degree}</div>
          ${data.education.year ? `<div class="t4-edu-year">${data.education.year}</div>` : ''}
        </div>
        ${data.education.institution ? `<div class="t4-edu-inst">${data.education.institution}</div>` : ''}
      </div>` : ''}
      ${data.targetRoles?.length ? `
      <div class="t4-sec">
        <div class="t4-sec-title">Postes Visés</div>
        <div>${data.targetRoles.map((r: string) => `<span class="t4-role-chip">${r}</span>`).join('')}</div>
      </div>` : ''}
    </div>
    <div>
      ${data.skills.length ? `
      <div class="t4-sec">
        <div class="t4-sec-title">Compétences</div>
        <div class="t4-skills-grid">${data.skills.map((s: string) => `<span class="t4-skill">${s}</span>`).join('')}</div>
      </div>` : ''}
      ${data.languages.length ? `
      <div class="t4-sec">
        <div class="t4-sec-title">Langues</div>
        ${data.languages.map((l: string, i: number) => {
          const levels = ['Langue maternelle', 'Courant (C1)', 'Intermédiaire (B2)', 'Notions (B1)'];
          return `<div class="t4-lang-row">
            <div class="t4-lang-label">${LANG_FLAGS[l] || '🌐'} ${l}</div>
            <span class="t4-lang-level">${levels[i] || 'Notions'}</span>
          </div>`;
        }).join('')}
      </div>` : ''}
      ${data.certifications?.length ? `
      <div class="t4-sec">
        <div class="t4-sec-title">Certifications</div>
        ${data.certifications.map((c: string) => `<div class="t4-cert">${c}</div>`).join('')}
      </div>` : ''}
    </div>
  </div>
  <div class="t4-footer">
    <span class="t4-footer-brand">TalentMap · Expert RH · Maroc</span>
    <span class="t4-footer-date">${today}</span>
  </div>
</div>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 5 — Charcoal Executive (C-suite / Senior Management)
   Charcoal #1E2336 sidebar · Amber #C7923E accent · Georgia + Open Sans
══════════════════════════════════════════════════════════════════════════════ */
function generateCVHtml5(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.9rem;font-weight:700;color:#C7923E;font-family:Georgia,serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',Arial,sans-serif;background:#c8cdd6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.28);overflow:hidden}
.cv-row{display:flex;min-height:1050px}
/* Sidebar */
.t5-side{width:230px;flex-shrink:0;background:#1E2336;color:#dce1eb;display:flex;flex-direction:column}
.t5-top{background:#151828;padding:2.2rem 1.6rem 1.8rem;display:flex;flex-direction:column;align-items:center;text-align:center;border-bottom:2px solid #C7923E}
.t5-avatar{width:100px;height:100px;border-radius:50%;border:3px solid #C7923E;background:#252b40;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:.9rem}
.t5-name{font-family:Georgia,serif;font-size:1.05rem;font-weight:700;color:#fff;line-height:1.35;letter-spacing:.02em}
.t5-role{font-size:.66rem;color:#C7923E;font-weight:600;text-transform:uppercase;letter-spacing:.12em;margin-top:.35rem}
.t5-body-side{padding:1.4rem 1.5rem;flex:1}
.t5-sh{font-size:.58rem;font-weight:700;color:#C7923E;text-transform:uppercase;letter-spacing:.14em;margin:1.2rem 0 .6rem;padding-bottom:.3rem;border-bottom:1px solid rgba(199,146,62,.3)}
.t5-info-item{display:flex;gap:.45rem;font-size:.66rem;color:#b0bac8;line-height:1.6;margin-bottom:.25rem;align-items:flex-start}
.t5-info-icon{color:#C7923E;flex-shrink:0;margin-top:.1rem}
.t5-skill{background:rgba(199,146,62,.15);color:#d4ad70;border:1px solid rgba(199,146,62,.25);padding:.18rem .6rem;border-radius:3px;font-size:.6rem;font-weight:600;display:inline-block;margin:.18rem .1rem}
.t5-lang-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem}
.t5-lang-name{font-size:.66rem;color:#c8d0dc}
.t5-lang-dot{width:7px;height:7px;border-radius:50%;background:#C7923E;display:inline-block;margin-right:2px}
/* Main */
.t5-main{flex:1;background:#fff;padding:0}
.t5-header{background:#1E2336;padding:1.8rem 2.4rem 1.5rem;border-bottom:3px solid #C7923E}
.t5-title{font-family:Georgia,serif;font-size:2rem;font-weight:700;color:#fff;letter-spacing:.02em;line-height:1.2}
.t5-sub{font-size:.75rem;color:#C7923E;font-weight:600;text-transform:uppercase;letter-spacing:.14em;margin-top:.35rem}
.t5-tags{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:.7rem}
.t5-tag{padding:.18rem .75rem;border:1px solid rgba(199,146,62,.5);border-radius:3px;font-size:.6rem;color:#dce1eb;font-weight:600}
.t5-content{padding:1.8rem 2.4rem 2rem}
.t5-mh{font-family:Georgia,serif;font-size:.7rem;font-weight:700;color:#C7923E;text-transform:uppercase;letter-spacing:.13em;border-bottom:2px solid #C7923E;padding-bottom:.3rem;margin:1.6rem 0 .9rem}
.t5-summary{font-size:.75rem;color:#374151;line-height:1.8;background:#f8f6f2;border-left:4px solid #C7923E;padding:.9rem 1.1rem;border-radius:0 4px 4px 0;font-style:italic}
.t5-job{margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid #f0ece6}
.t5-job-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.25rem}
.t5-job-title{font-size:.8rem;font-weight:700;color:#1E2336}
.t5-job-date{font-size:.63rem;color:#C7923E;font-weight:600;white-space:nowrap;margin-left:.8rem}
.t5-job-co{font-size:.7rem;color:#374151;font-weight:600;margin-bottom:.3rem}
.t5-bullets{padding-left:1.1rem;margin:.35rem 0 0}
.t5-bullets li{font-size:.7rem;color:#4B5563;line-height:1.75;margin-bottom:.18rem}
.t5-footer{background:#1E2336;padding:.7rem 2.4rem;display:flex;justify-content:space-between;align-items:center}
.t5-footer span{font-size:.6rem;color:rgba(220,225,235,.4);letter-spacing:.06em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="cv-row">
    <div class="t5-side">
      <div class="t5-top">
        <div class="t5-avatar">${avatarHtml}</div>
        <div class="t5-name">${data.name}</div>
        ${data.sector ? `<div class="t5-role">${data.sector}</div>` : ''}
      </div>
      <div class="t5-body-side">
        <div class="t5-sh">Contact</div>
        ${data.phone ? `<div class="t5-info-item"><span class="t5-info-icon">📞</span>${data.phone}</div>` : ''}
        ${data.email ? `<div class="t5-info-item"><span class="t5-info-icon">✉</span>${data.email}</div>` : ''}
        ${data.address ? `<div class="t5-info-item"><span class="t5-info-icon">📍</span>${data.address}</div>` : ''}
        ${data.linkedin ? `<div class="t5-info-item"><span class="t5-info-icon">in</span>${data.linkedin}</div>` : ''}
        ${data.idNumber ? `<div class="t5-info-item"><span class="t5-info-icon">🪪</span>CIN: ${data.idNumber}</div>` : ''}
        ${data.skills.length ? `<div class="t5-sh">Compétences clés</div>
        <div>${data.skills.map((s: string) => `<span class="t5-skill">${s}</span>`).join('')}</div>` : ''}
        ${data.languages.length ? `<div class="t5-sh">Langues</div>
        ${data.languages.map((l: string) => `<div class="t5-lang-row"><span class="t5-lang-name">${l}</span><span><span class="t5-lang-dot"></span><span class="t5-lang-dot"></span><span class="t5-lang-dot"></span></span></div>`).join('')}` : ''}
        ${data.certifications?.length ? `<div class="t5-sh">Certifications</div>
        ${data.certifications.map((c: string) => `<div class="t5-info-item"><span class="t5-info-icon">✓</span>${c}</div>`).join('')}` : ''}
      </div>
    </div>
    <div class="t5-main">
      <div class="t5-header">
        <div class="t5-title">${data.name}</div>
        ${data.experience ? `<div class="t5-sub">${data.experience} · ${data.sector || ''}</div>` : ''}
        ${(data.targetRoles||[]).length ? `<div class="t5-tags">${(data.targetRoles||[]).map((r: string) => `<span class="t5-tag">${r}</span>`).join('')}</div>` : ''}
      </div>
      <div class="t5-content">
        ${data.summary ? `<div class="t5-mh">Profil exécutif</div><div class="t5-summary">${data.summary}</div>` : ''}
        ${data.work?.length ? `<div class="t5-mh">Parcours professionnel</div>
        ${data.work.map((j: WorkEntry) => `<div class="t5-job">
          <div class="t5-job-top">
            <div class="t5-job-title">${j.title}</div>
            <div class="t5-job-date">${j.startDate}${j.endDate ? ` – ${j.endDate}` : ' – Présent'}</div>
          </div>
          <div class="t5-job-co">▸ ${j.company}</div>
          ${j.description ? `<ul class="t5-bullets">${descToBullets(j.description)}</ul>` : ''}
        </div>`).join('')}` : ''}
        ${data.education.degree ? `<div class="t5-mh">Formation</div>
        <div class="t5-job">
          <div class="t5-job-top">
            <div class="t5-job-title">${data.education.degree}</div>
            ${data.education.year ? `<div class="t5-job-date">${data.education.year}</div>` : ''}
          </div>
          ${data.education.institution ? `<div class="t5-job-co">▸ ${data.education.institution}</div>` : ''}
        </div>` : ''}
      </div>
      <div class="t5-footer">
        <span>TalentMap · Maroc</span>
        <span>${today}</span>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 6 — Emerald Healthcare (Santé / Pharma / Agro / Environnement)
   Deep emerald #065F46 · Mint #D1FAE5 · Single column · Nunito + Merriweather
══════════════════════════════════════════════════════════════════════════════ */
function generateCVHtml6(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.75rem;font-weight:800;color:#065F46;font-family:Georgia,serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',Arial,sans-serif;background:#b5c9be;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;box-shadow:0 24px 64px rgba(0,0,0,.22);overflow:hidden;background:#fff}
/* Header */
.t6-header{background:#065F46;padding:2rem 2.8rem;display:flex;align-items:center;gap:1.6rem}
.t6-avatar{width:90px;height:90px;border-radius:50%;border:3px solid #6EE7B7;background:#047857;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.t6-htext{flex:1}
.t6-name{font-family:'Merriweather',Georgia,serif;font-size:1.85rem;font-weight:700;color:#fff;line-height:1.25}
.t6-sector{font-size:.72rem;color:#6EE7B7;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-top:.35rem}
.t6-contact-bar{background:#047857;padding:.6rem 2.8rem;display:flex;gap:1.8rem;flex-wrap:wrap}
.t6-citem{font-size:.65rem;color:#A7F3D0;font-weight:600;display:flex;align-items:center;gap:.3rem}
/* Two-column body */
.t6-body{display:flex}
.t6-left{width:200px;flex-shrink:0;background:#F0FDF9;border-right:1px solid #D1FAE5;padding:1.5rem 1.3rem}
.t6-right{flex:1;padding:1.6rem 2.2rem 2rem}
.t6-sh{font-size:.6rem;font-weight:800;color:#065F46;text-transform:uppercase;letter-spacing:.14em;border-bottom:2px solid #6EE7B7;padding-bottom:.25rem;margin:1.2rem 0 .7rem}
.t6-sh:first-child{margin-top:0}
.t6-skill{background:#D1FAE5;color:#065F46;border:1px solid #6EE7B7;padding:.18rem .55rem;border-radius:12px;font-size:.6rem;font-weight:700;display:inline-block;margin:.15rem .08rem}
.t6-info{font-size:.65rem;color:#374151;line-height:1.7;margin-bottom:.2rem;display:flex;gap:.35rem;align-items:flex-start}
.t6-icon{color:#065F46;flex-shrink:0}
.t6-summary{font-family:'Merriweather',Georgia,serif;font-style:italic;font-size:.72rem;color:#374151;line-height:1.85;background:#F0FDF9;border-left:4px solid #065F46;padding:.85rem 1rem;border-radius:0 4px 4px 0;margin-bottom:.4rem}
.t6-job{margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid #ECFDF5}
.t6-job-top{display:flex;justify-content:space-between;align-items:flex-start}
.t6-job-title{font-size:.78rem;font-weight:800;color:#065F46}
.t6-job-date{font-size:.62rem;color:#059669;font-weight:700;white-space:nowrap;margin-left:.6rem}
.t6-job-co{font-size:.68rem;color:#374151;font-weight:700;margin:.15rem 0 .3rem}
.t6-bullets{padding-left:1.1rem;margin:.3rem 0 0}
.t6-bullets li{font-size:.68rem;color:#4B5563;line-height:1.75;margin-bottom:.15rem}
.t6-cert{background:#D1FAE5;color:#065F46;padding:.22rem .65rem;border-radius:4px;font-size:.62rem;font-weight:700;margin-bottom:.25rem;display:block}
.t6-footer{background:#065F46;padding:.55rem 2.8rem;display:flex;justify-content:space-between}
.t6-footer span{font-size:.58rem;color:rgba(167,243,208,.6);letter-spacing:.07em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="t6-header">
    <div class="t6-avatar">${avatarHtml}</div>
    <div class="t6-htext">
      <div class="t6-name">${data.name}</div>
      ${data.sector ? `<div class="t6-sector">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>` : ''}
      ${(data.targetRoles||[]).length ? `<div style="margin-top:.5rem;display:flex;gap:.4rem;flex-wrap:wrap">${(data.targetRoles||[]).map((r: string) => `<span style="background:rgba(110,231,183,.15);border:1px solid rgba(110,231,183,.4);color:#A7F3D0;padding:.15rem .7rem;border-radius:12px;font-size:.6rem;font-weight:600">${r}</span>`).join('')}</div>` : ''}
    </div>
  </div>
  <div class="t6-contact-bar">
    ${data.phone ? `<span class="t6-citem">📞 ${data.phone}</span>` : ''}
    ${data.email ? `<span class="t6-citem">✉ ${data.email}</span>` : ''}
    ${data.address ? `<span class="t6-citem">📍 ${data.address}</span>` : ''}
    ${data.linkedin ? `<span class="t6-citem">in ${data.linkedin}</span>` : ''}
  </div>
  <div class="t6-body">
    <div class="t6-left">
      ${data.skills.length ? `<div class="t6-sh">Compétences</div>
      <div>${data.skills.map((s: string) => `<span class="t6-skill">${s}</span>`).join('')}</div>` : ''}
      ${data.languages.length ? `<div class="t6-sh">Langues</div>
      ${data.languages.map((l: string) => `<div class="t6-info"><span class="t6-icon">🌍</span>${l}</div>`).join('')}` : ''}
      ${data.idNumber ? `<div class="t6-sh">Identité</div>
      <div class="t6-info"><span class="t6-icon">🪪</span>CIN: ${data.idNumber}</div>` : ''}
      ${data.certifications?.length ? `<div class="t6-sh">Certifications</div>
      ${data.certifications.map((c: string) => `<span class="t6-cert">✓ ${c}</span>`).join('')}` : ''}
    </div>
    <div class="t6-right">
      ${data.summary ? `<div class="t6-sh" style="margin-top:0">Profil professionnel</div><div class="t6-summary">${data.summary}</div>` : ''}
      ${data.work?.length ? `<div class="t6-sh">Expérience professionnelle</div>
      ${data.work.map((j: WorkEntry) => `<div class="t6-job">
        <div class="t6-job-top">
          <div class="t6-job-title">${j.title}</div>
          <div class="t6-job-date">${j.startDate}${j.endDate ? ` – ${j.endDate}` : ' – Présent'}</div>
        </div>
        <div class="t6-job-co">◆ ${j.company}</div>
        ${j.description ? `<ul class="t6-bullets">${descToBullets(j.description)}</ul>` : ''}
      </div>`).join('')}` : ''}
      ${data.education.degree ? `<div class="t6-sh">Formation</div>
      <div class="t6-job" style="border-bottom:none">
        <div class="t6-job-top">
          <div class="t6-job-title">${data.education.degree}</div>
          ${data.education.year ? `<div class="t6-job-date">${data.education.year}</div>` : ''}
        </div>
        ${data.education.institution ? `<div class="t6-job-co">◆ ${data.education.institution}</div>` : ''}
      </div>` : ''}
    </div>
  </div>
  <div class="t6-footer">
    <span>TalentMap · Maroc</span><span>${today}</span>
  </div>
</div>
</body></html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 7 — Scarlet Prestige (Droit / Notariat / Conseil / Finance senior)
   Bordeaux #6B1A28 sidebar · Or #D4A017 · Cormorant + EB Garamond
══════════════════════════════════════════════════════════════════════════════ */
function generateCVHtml7(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.9rem;font-weight:700;color:#D4A017;font-family:Georgia,serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'EB Garamond',Georgia,serif;background:#c2b8b0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.28);overflow:hidden}
.t7-row{display:flex;min-height:1060px}
/* Sidebar */
.t7-side{width:235px;flex-shrink:0;background:#6B1A28;color:#e8ddd5;display:flex;flex-direction:column}
.t7-side-top{background:#4E1320;padding:2.4rem 1.5rem 2rem;display:flex;flex-direction:column;align-items:center;text-align:center;border-bottom:2px solid #D4A017}
.t7-avatar{width:100px;height:100px;border-radius:50%;border:3px solid #D4A017;background:#7a2030;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:1rem;box-shadow:0 0 0 5px rgba(212,160,23,.15)}
.t7-sname{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.05rem;font-weight:700;color:#fff;line-height:1.35}
.t7-srole{font-size:.62rem;color:#D4A017;font-weight:600;text-transform:uppercase;letter-spacing:.14em;margin-top:.4rem}
.t7-sbody{padding:1.4rem 1.4rem;flex:1}
.t7-sh{font-size:.58rem;font-weight:700;color:#D4A017;text-transform:uppercase;letter-spacing:.15em;border-bottom:1px solid rgba(212,160,23,.35);padding-bottom:.25rem;margin:1.25rem 0 .65rem}
.t7-sh:first-child{margin-top:0}
.t7-info{font-size:.64rem;color:#d0c5be;line-height:1.7;margin-bottom:.25rem;display:flex;gap:.4rem;align-items:flex-start}
.t7-ico{color:#D4A017;flex-shrink:0}
.t7-skill{background:rgba(212,160,23,.12);color:#d4b87a;border:1px solid rgba(212,160,23,.22);padding:.18rem .55rem;border-radius:3px;font-size:.6rem;font-weight:600;display:inline-block;margin:.15rem .08rem}
/* Main */
.t7-main{flex:1;background:#FDFAF6;display:flex;flex-direction:column}
.t7-header{background:#FDFAF6;padding:2rem 2.5rem 1.2rem;border-bottom:3px solid #6B1A28}
.t7-htitle{font-family:'Cormorant Garamond',Georgia,serif;font-size:2.3rem;font-weight:700;color:#2D0A10;line-height:1.15;letter-spacing:.01em}
.t7-hsub{font-size:.68rem;color:#6B1A28;font-weight:600;text-transform:uppercase;letter-spacing:.13em;margin-top:.45rem}
.t7-content{padding:1.7rem 2.5rem 2rem;flex:1}
.t7-mh{font-family:'Cormorant Garamond',Georgia,serif;font-size:.85rem;font-weight:700;color:#6B1A28;text-transform:uppercase;letter-spacing:.1em;border-bottom:1.5px solid #D4A017;padding-bottom:.2rem;margin:1.5rem 0 .85rem}
.t7-summary{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:.85rem;color:#3D1218;line-height:1.9;background:#FCF4E8;border-left:4px solid #D4A017;padding:.85rem 1.1rem;border-radius:0 4px 4px 0}
.t7-job{margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid #F0E8DC}
.t7-job-top{display:flex;justify-content:space-between;align-items:flex-start}
.t7-job-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:.9rem;font-weight:700;color:#2D0A10}
.t7-job-date{font-size:.62rem;color:#8B5A2B;font-weight:600;white-space:nowrap;margin-left:.6rem;font-style:italic}
.t7-job-co{font-size:.7rem;color:#6B1A28;font-weight:600;margin:.15rem 0 .3rem}
.t7-bullets{padding-left:1.1rem;margin:.3rem 0 0}
.t7-bullets li{font-size:.71rem;color:#4B3028;line-height:1.8;margin-bottom:.15rem}
.t7-footer{background:#6B1A28;padding:.6rem 2.5rem;display:flex;justify-content:space-between;align-items:center}
.t7-footer span{font-size:.58rem;color:rgba(232,221,213,.4);letter-spacing:.07em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="t7-row">
    <div class="t7-side">
      <div class="t7-side-top">
        <div class="t7-avatar">${avatarHtml}</div>
        <div class="t7-sname">${data.name}</div>
        ${data.sector ? `<div class="t7-srole">${data.sector}</div>` : ''}
      </div>
      <div class="t7-sbody">
        <div class="t7-sh">Contact</div>
        ${data.phone ? `<div class="t7-info"><span class="t7-ico">📞</span>${data.phone}</div>` : ''}
        ${data.email ? `<div class="t7-info"><span class="t7-ico">✉</span>${data.email}</div>` : ''}
        ${data.address ? `<div class="t7-info"><span class="t7-ico">📍</span>${data.address}</div>` : ''}
        ${data.linkedin ? `<div class="t7-info"><span class="t7-ico">in</span>${data.linkedin}</div>` : ''}
        ${data.idNumber ? `<div class="t7-info"><span class="t7-ico">🪪</span>CIN: ${data.idNumber}</div>` : ''}
        ${data.skills.length ? `<div class="t7-sh">Expertise</div>
        <div>${data.skills.map((s: string) => `<span class="t7-skill">${s}</span>`).join('')}</div>` : ''}
        ${data.languages.length ? `<div class="t7-sh">Langues</div>
        ${data.languages.map((l: string) => `<div class="t7-info"><span class="t7-ico">◆</span>${l}</div>`).join('')}` : ''}
        ${data.certifications?.length ? `<div class="t7-sh">Titres & Certifications</div>
        ${data.certifications.map((c: string) => `<div class="t7-info"><span class="t7-ico">✓</span>${c}</div>`).join('')}` : ''}
      </div>
    </div>
    <div class="t7-main">
      <div class="t7-header">
        <div class="t7-htitle">${data.name}</div>
        ${data.experience ? `<div class="t7-hsub">${data.experience}${data.sector ? ' · ' + data.sector : ''}</div>` : ''}
      </div>
      <div class="t7-content">
        ${data.summary ? `<div class="t7-mh">Profil & Positionnement</div><div class="t7-summary">${data.summary}</div>` : ''}
        ${data.work?.length ? `<div class="t7-mh">Expériences professionnelles</div>
        ${data.work.map((j: WorkEntry) => `<div class="t7-job">
          <div class="t7-job-top">
            <div class="t7-job-title">${j.title}</div>
            <div class="t7-job-date">${j.startDate}${j.endDate ? ` – ${j.endDate}` : ' – Présent'}</div>
          </div>
          <div class="t7-job-co">⬦ ${j.company}</div>
          ${j.description ? `<ul class="t7-bullets">${descToBullets(j.description)}</ul>` : ''}
        </div>`).join('')}` : ''}
        ${data.education.degree ? `<div class="t7-mh">Formation académique</div>
        <div class="t7-job" style="border-bottom:none">
          <div class="t7-job-top">
            <div class="t7-job-title">${data.education.degree}</div>
            ${data.education.year ? `<div class="t7-job-date">${data.education.year}</div>` : ''}
          </div>
          ${data.education.institution ? `<div class="t7-job-co">⬦ ${data.education.institution}</div>` : ''}
        </div>` : ''}
      </div>
      <div class="t7-footer">
        <span>TalentMap · Maroc</span><span>${today}</span>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 8 — Academic Pure (R&D / Data Science / Recherche / Doctorat)
   Noir typographique · Navy #1a1a2e titres · PT Serif + Source Sans 3
══════════════════════════════════════════════════════════════════════════════ */
function generateCVHtml8(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.65rem;font-weight:700;color:#1a1a2e;font-family:Georgia,serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${data.name} — Curriculum Vitae</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Source Sans 3',Arial,sans-serif;background:#cdd2d8;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;background:#fff;box-shadow:0 24px 64px rgba(0,0,0,.22);overflow:hidden}
/* Centered editorial header */
.t8-header{background:#1a1a2e;padding:2.2rem 3rem;display:flex;gap:1.8rem;align-items:center}
.t8-avatar{width:86px;height:86px;border-radius:4px;background:#2d2d50;border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.t8-htext{flex:1}
.t8-hname{font-family:'PT Serif',Georgia,serif;font-size:2.1rem;font-weight:700;color:#fff;letter-spacing:.02em;line-height:1.2}
.t8-hrole{font-size:.68rem;color:rgba(200,205,230,.7);font-weight:400;text-transform:uppercase;letter-spacing:.15em;margin-top:.3rem}
.t8-hcontact{display:flex;gap:1.2rem;flex-wrap:wrap;margin-top:.7rem}
.t8-hc{font-size:.65rem;color:rgba(200,205,230,.8);display:flex;align-items:center;gap:.3rem}
.t8-divider{height:3px;background:linear-gradient(90deg,#1a1a2e 0%,#4B5EAA 40%,#1a1a2e 100%);margin:0}
/* Body */
.t8-body{display:flex}
.t8-main{flex:1;padding:1.8rem 2.8rem 2rem}
.t8-aside{width:200px;flex-shrink:0;background:#F8F8FA;border-left:1px solid #E5E7EB;padding:1.5rem 1.3rem}
.t8-sh{font-family:'PT Serif',Georgia,serif;font-size:.75rem;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:.12em;border-bottom:1.5px solid #1a1a2e;padding-bottom:.2rem;margin:1.5rem 0 .8rem}
.t8-sh:first-child{margin-top:0}
.t8-ash{font-size:.58rem;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:.14em;border-bottom:1px solid #d1d5db;padding-bottom:.25rem;margin:1.2rem 0 .65rem}
.t8-ash:first-child{margin-top:0}
.t8-summary{font-family:'PT Serif',Georgia,serif;font-style:italic;font-size:.78rem;color:#374151;line-height:1.9;border-left:3px solid #1a1a2e;padding:.75rem 1rem;background:#F8F8FA;margin-bottom:.4rem}
.t8-job{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px dashed #E5E7EB}
.t8-job:last-child{border-bottom:none;padding-bottom:0}
.t8-job-top{display:flex;justify-content:space-between;align-items:flex-start}
.t8-job-title{font-family:'PT Serif',Georgia,serif;font-size:.82rem;font-weight:700;color:#111827}
.t8-job-date{font-size:.62rem;color:#6B7280;white-space:nowrap;margin-left:.6rem;font-style:italic}
.t8-job-co{font-size:.68rem;color:#374151;font-weight:600;margin:.12rem 0 .3rem}
.t8-bullets{padding-left:1.1rem;margin:.3rem 0 0}
.t8-bullets li{font-size:.68rem;color:#4B5563;line-height:1.78;margin-bottom:.14rem}
.t8-skill{background:#EEF2FF;color:#3730A3;border:1px solid #C7D2FE;padding:.18rem .55rem;border-radius:3px;font-size:.6rem;font-weight:600;display:inline-block;margin:.14rem .08rem}
.t8-info{font-size:.64rem;color:#374151;line-height:1.7;margin-bottom:.22rem;display:flex;gap:.35rem;align-items:flex-start}
.t8-ico{color:#1a1a2e;flex-shrink:0}
.t8-cert{background:#F3F4F6;border-left:3px solid #4B5EAA;padding:.2rem .5rem;font-size:.62rem;color:#374151;margin-bottom:.22rem;font-style:italic}
.t8-footer{background:#F8F8FA;border-top:1px solid #E5E7EB;padding:.55rem 2.8rem;display:flex;justify-content:space-between}
.t8-footer span{font-size:.58rem;color:#9CA3AF;letter-spacing:.07em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="t8-header">
    <div class="t8-avatar">${avatarHtml}</div>
    <div class="t8-htext">
      <div class="t8-hname">${data.name}</div>
      ${data.sector ? `<div class="t8-hrole">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>` : ''}
      <div class="t8-hcontact">
        ${data.phone ? `<span class="t8-hc">📞 ${data.phone}</span>` : ''}
        ${data.email ? `<span class="t8-hc">✉ ${data.email}</span>` : ''}
        ${data.address ? `<span class="t8-hc">📍 ${data.address}</span>` : ''}
        ${data.linkedin ? `<span class="t8-hc">in ${data.linkedin}</span>` : ''}
        ${data.portfolio ? `<span class="t8-hc">🌐 ${data.portfolio}</span>` : ''}
      </div>
    </div>
  </div>
  <div class="t8-divider"></div>
  <div class="t8-body">
    <div class="t8-main">
      ${data.summary ? `<div class="t8-sh" style="margin-top:0">Résumé de recherche</div><div class="t8-summary">${data.summary}</div>` : ''}
      ${data.work?.length ? `<div class="t8-sh">Expérience & Recherche</div>
      ${data.work.map((j: WorkEntry) => `<div class="t8-job">
        <div class="t8-job-top">
          <div class="t8-job-title">${j.title}</div>
          <div class="t8-job-date">${j.startDate}${j.endDate ? ` – ${j.endDate}` : ' – Présent'}</div>
        </div>
        <div class="t8-job-co">▸ ${j.company}</div>
        ${j.description ? `<ul class="t8-bullets">${descToBullets(j.description)}</ul>` : ''}
      </div>`).join('')}` : ''}
      ${data.education.degree ? `<div class="t8-sh">Formation & Diplômes</div>
      <div class="t8-job" style="border-bottom:none">
        <div class="t8-job-top">
          <div class="t8-job-title">${data.education.degree}</div>
          ${data.education.year ? `<div class="t8-job-date">${data.education.year}</div>` : ''}
        </div>
        ${data.education.institution ? `<div class="t8-job-co">▸ ${data.education.institution}</div>` : ''}
      </div>` : ''}
    </div>
    <div class="t8-aside">
      ${data.skills.length ? `<div class="t8-ash">Compétences</div>
      <div>${data.skills.map((s: string) => `<span class="t8-skill">${s}</span>`).join('')}</div>` : ''}
      ${data.languages.length ? `<div class="t8-ash">Langues</div>
      ${data.languages.map((l: string) => `<div class="t8-info"><span class="t8-ico">◆</span>${l}</div>`).join('')}` : ''}
      ${(data.targetRoles||[]).length ? `<div class="t8-ash">Domaines visés</div>
      ${(data.targetRoles||[]).map((r: string) => `<div class="t8-info"><span class="t8-ico">→</span>${r}</div>`).join('')}` : ''}
      ${data.idNumber ? `<div class="t8-ash">Identité</div>
      <div class="t8-info"><span class="t8-ico">🪪</span>CIN: ${data.idNumber}</div>` : ''}
      ${data.certifications?.length ? `<div class="t8-ash">Publications & Cert.</div>
      ${data.certifications.map((c: string) => `<div class="t8-cert">${c}</div>`).join('')}` : ''}
    </div>
  </div>
  <div class="t8-footer">
    <span>TalentMap · Maroc</span><span>${today}</span>
  </div>
</div>
</body></html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 9 — Steel Engineering (BTP / Ingénierie / Industrie / Automobile)
   Navy steel #0F2A4A header · Blue #2563EB accents · Roboto Condensed + Roboto
══════════════════════════════════════════════════════════════════════════════ */
function generateCVHtml9(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:4px"/>`
    : `<span style="font-size:1.8rem;font-weight:700;color:#2563EB;font-family:'Roboto Condensed',Arial,sans-serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Roboto',Arial,sans-serif;background:#b8c4d0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;background:#fff;box-shadow:0 24px 64px rgba(0,0,0,.25);overflow:hidden}
/* Header stripe */
.t9-header{background:#0F2A4A;padding:1.8rem 2.6rem;display:flex;align-items:center;gap:1.5rem}
.t9-avatar{width:82px;height:82px;border-radius:4px;border:2px solid #2563EB;background:#1a3d62;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.t9-htext{flex:1}
.t9-hname{font-family:'Roboto Condensed',Arial,sans-serif;font-size:2rem;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.05em;line-height:1.15}
.t9-hsub{font-size:.66rem;color:#93C5FD;font-weight:500;text-transform:uppercase;letter-spacing:.15em;margin-top:.3rem}
/* Blue accent bar */
.t9-bar{height:5px;background:linear-gradient(90deg,#2563EB 0%,#60A5FA 60%,#0F2A4A 100%)}
/* Contact ribbon */
.t9-ribbon{background:#EFF6FF;border-bottom:1px solid #DBEAFE;padding:.55rem 2.6rem;display:flex;gap:1.6rem;flex-wrap:wrap}
.t9-rc{font-size:.63rem;color:#1E40AF;font-weight:600;display:flex;align-items:center;gap:.3rem}
/* Body */
.t9-body{display:flex}
.t9-main{flex:1;padding:1.6rem 2.4rem 2rem}
.t9-right{width:205px;flex-shrink:0;background:#F8FAFF;border-left:1px solid #DBEAFE;padding:1.4rem 1.3rem}
.t9-sh{font-family:'Roboto Condensed',Arial,sans-serif;font-size:.63rem;font-weight:700;color:#0F2A4A;text-transform:uppercase;letter-spacing:.14em;border-bottom:2px solid #2563EB;padding-bottom:.22rem;margin:1.4rem 0 .75rem}
.t9-sh:first-child{margin-top:0}
.t9-rsh{font-size:.58rem;font-weight:700;color:#1E40AF;text-transform:uppercase;letter-spacing:.13em;border-bottom:1.5px solid #BFDBFE;padding-bottom:.2rem;margin:1.2rem 0 .6rem}
.t9-rsh:first-child{margin-top:0}
.t9-summary{font-size:.72rem;color:#374151;line-height:1.78;background:#EFF6FF;border-left:4px solid #2563EB;padding:.8rem 1rem;border-radius:0 4px 4px 0}
.t9-job{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #EFF6FF}
.t9-job:last-child{border-bottom:none}
.t9-job-top{display:flex;justify-content:space-between;align-items:flex-start}
.t9-job-title{font-size:.78rem;font-weight:700;color:#0F2A4A;font-family:'Roboto Condensed',Arial,sans-serif;text-transform:uppercase;letter-spacing:.03em}
.t9-job-date{font-size:.62rem;color:#2563EB;font-weight:700;white-space:nowrap;margin-left:.6rem}
.t9-job-co{font-size:.68rem;color:#374151;font-weight:500;margin:.12rem 0 .28rem}
.t9-bullets{padding-left:1rem;margin:.28rem 0 0}
.t9-bullets li{font-size:.67rem;color:#4B5563;line-height:1.75;margin-bottom:.14rem}
.t9-skill{background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE;padding:.18rem .55rem;border-radius:3px;font-size:.6rem;font-weight:600;display:inline-block;margin:.13rem .07rem}
.t9-info{font-size:.63rem;color:#374151;line-height:1.7;margin-bottom:.22rem;display:flex;gap:.35rem;align-items:flex-start}
.t9-ico{color:#2563EB;flex-shrink:0}
.t9-cert{background:#EFF6FF;border-left:3px solid #2563EB;padding:.2rem .5rem;font-size:.62rem;color:#1E40AF;margin-bottom:.22rem;font-weight:600}
.t9-footer{background:#0F2A4A;padding:.55rem 2.6rem;display:flex;justify-content:space-between}
.t9-footer span{font-size:.58rem;color:rgba(147,197,253,.4);letter-spacing:.07em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="t9-header">
    <div class="t9-avatar">${avatarHtml}</div>
    <div class="t9-htext">
      <div class="t9-hname">${data.name}</div>
      ${data.sector ? `<div class="t9-hsub">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>` : ''}
    </div>
  </div>
  <div class="t9-bar"></div>
  <div class="t9-ribbon">
    ${data.phone ? `<span class="t9-rc">📞 ${data.phone}</span>` : ''}
    ${data.email ? `<span class="t9-rc">✉ ${data.email}</span>` : ''}
    ${data.address ? `<span class="t9-rc">📍 ${data.address}</span>` : ''}
    ${data.linkedin ? `<span class="t9-rc">in ${data.linkedin}</span>` : ''}
    ${data.idNumber ? `<span class="t9-rc">🪪 ${data.idNumber}</span>` : ''}
  </div>
  <div class="t9-body">
    <div class="t9-main">
      ${data.summary ? `<div class="t9-sh" style="margin-top:0">Profil technique</div><div class="t9-summary">${data.summary}</div>` : ''}
      ${data.work?.length ? `<div class="t9-sh">Expérience professionnelle</div>
      ${data.work.map((j: WorkEntry) => `<div class="t9-job">
        <div class="t9-job-top">
          <div class="t9-job-title">${j.title}</div>
          <div class="t9-job-date">${j.startDate}${j.endDate ? ` – ${j.endDate}` : ' – Présent'}</div>
        </div>
        <div class="t9-job-co">▸ ${j.company}</div>
        ${j.description ? `<ul class="t9-bullets">${descToBullets(j.description)}</ul>` : ''}
      </div>`).join('')}` : ''}
      ${data.education.degree ? `<div class="t9-sh">Formation</div>
      <div class="t9-job" style="border-bottom:none">
        <div class="t9-job-top">
          <div class="t9-job-title">${data.education.degree}</div>
          ${data.education.year ? `<div class="t9-job-date">${data.education.year}</div>` : ''}
        </div>
        ${data.education.institution ? `<div class="t9-job-co">▸ ${data.education.institution}</div>` : ''}
      </div>` : ''}
    </div>
    <div class="t9-right">
      ${data.skills.length ? `<div class="t9-rsh">Compétences</div>
      <div>${data.skills.map((s: string) => `<span class="t9-skill">${s}</span>`).join('')}</div>` : ''}
      ${data.languages.length ? `<div class="t9-rsh">Langues</div>
      ${data.languages.map((l: string) => `<div class="t9-info"><span class="t9-ico">◆</span>${l}</div>`).join('')}` : ''}
      ${(data.targetRoles||[]).length ? `<div class="t9-rsh">Postes visés</div>
      ${(data.targetRoles||[]).map((r: string) => `<div class="t9-info"><span class="t9-ico">→</span>${r}</div>`).join('')}` : ''}
      ${data.certifications?.length ? `<div class="t9-rsh">Certifications</div>
      ${data.certifications.map((c: string) => `<div class="t9-cert">✓ ${c}</div>`).join('')}` : ''}
    </div>
  </div>
  <div class="t9-footer">
    <span>TalentMap · Maroc</span><span>${today}</span>
  </div>
</div>
</body></html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 10 — Creative Vibrant (Design / Mode / Photo / Brand / Contenu)
   Coral #DC4C1E header · Warm ivory · Montserrat + Nunito
══════════════════════════════════════════════════════════════════════════════ */
function generateCVHtml10(data: {
  name: string; email: string; phone: string; address: string; idNumber: string;
  summary: string; skills: string[]; languages: string[];
  experience: string; sector: string;
  work: WorkEntry[]; education: { degree: string; institution: string; year: string };
  targetRoles?: string[]; certifications?: string[];
  photo?: string; linkedin?: string; portfolio?: string;
}) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
  const avatarHtml = data.photo
    ? `<img src="${data.photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.8rem;font-weight:800;color:#DC4C1E;font-family:'Montserrat',sans-serif">${initials || '?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>${data.name} — CV</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Nunito:wght@300;400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',Arial,sans-serif;background:#e8cec5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:2rem auto;background:#FDFAF8;box-shadow:0 24px 64px rgba(0,0,0,.22);overflow:hidden}
/* Full-width asymmetric header */
.t10-header{background:#DC4C1E;padding:2.2rem 2.8rem;position:relative;overflow:hidden}
.t10-header::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.06)}
.t10-header::after{content:'';position:absolute;bottom:-40px;right:80px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.05)}
.t10-hrow{display:flex;align-items:center;gap:1.6rem;position:relative;z-index:1}
.t10-avatar{width:95px;height:95px;border-radius:50%;border:3px solid rgba(255,255,255,.6);background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.t10-htext{flex:1}
.t10-hname{font-family:'Montserrat',sans-serif;font-size:2.1rem;font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.02em}
.t10-hsector{font-size:.68rem;color:rgba(255,255,255,.75);font-weight:600;text-transform:uppercase;letter-spacing:.14em;margin-top:.35rem}
.t10-htags{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.65rem}
.t10-htag{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);color:#fff;padding:.18rem .75rem;border-radius:20px;font-size:.6rem;font-weight:700}
.t10-contact-bar{background:#B23A15;padding:.55rem 2.8rem;display:flex;gap:1.5rem;flex-wrap:wrap}
.t10-citem{font-size:.63rem;color:rgba(255,220,210,.85);font-weight:600;display:flex;align-items:center;gap:.3rem}
/* Body */
.t10-body{display:flex}
.t10-left{width:210px;flex-shrink:0;background:#FFF5F2;border-right:1px solid #FECACA;padding:1.5rem 1.4rem}
.t10-right{flex:1;padding:1.7rem 2.3rem 2rem}
.t10-sh{font-family:'Montserrat',sans-serif;font-size:.58rem;font-weight:800;color:#DC4C1E;text-transform:uppercase;letter-spacing:.15em;border-bottom:2px solid #DC4C1E;padding-bottom:.22rem;margin:1.3rem 0 .7rem}
.t10-sh:first-child{margin-top:0}
.t10-skill{background:#fff;color:#DC4C1E;border:1.5px solid #FECACA;padding:.2rem .6rem;border-radius:20px;font-size:.6rem;font-weight:700;display:inline-block;margin:.15rem .08rem}
.t10-info{font-size:.65rem;color:#374151;line-height:1.7;margin-bottom:.25rem;display:flex;gap:.4rem;align-items:flex-start}
.t10-ico{color:#DC4C1E;flex-shrink:0}
.t10-summary{font-size:.75rem;color:#374151;line-height:1.82;background:#FFF5F2;border-left:4px solid #DC4C1E;padding:.85rem 1.05rem;border-radius:0 4px 4px 0;font-style:italic}
.t10-job{margin-bottom:1.05rem;padding-bottom:1.05rem;border-bottom:1px solid #FEE2E2}
.t10-job:last-child{border-bottom:none}
.t10-job-top{display:flex;justify-content:space-between;align-items:flex-start}
.t10-job-title{font-family:'Montserrat',sans-serif;font-size:.78rem;font-weight:700;color:#1C0A06}
.t10-job-date{font-size:.62rem;color:#DC4C1E;font-weight:700;white-space:nowrap;margin-left:.6rem}
.t10-job-co{font-size:.68rem;color:#374151;font-weight:600;margin:.12rem 0 .3rem}
.t10-bullets{padding-left:1.05rem;margin:.3rem 0 0}
.t10-bullets li{font-size:.68rem;color:#4B5563;line-height:1.78;margin-bottom:.14rem}
.t10-cert{background:#FFF5F2;border-left:3px solid #FCA5A5;padding:.2rem .55rem;font-size:.62rem;color:#DC4C1E;margin-bottom:.22rem;font-weight:700}
.t10-footer{background:#DC4C1E;padding:.55rem 2.8rem;display:flex;justify-content:space-between}
.t10-footer span{font-size:.58rem;color:rgba(255,220,210,.5);letter-spacing:.07em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="t10-header">
    <div class="t10-hrow">
      <div class="t10-avatar">${avatarHtml}</div>
      <div class="t10-htext">
        <div class="t10-hname">${data.name}</div>
        ${data.sector ? `<div class="t10-hsector">${data.sector}${data.experience ? ' · ' + data.experience : ''}</div>` : ''}
        ${(data.targetRoles||[]).length ? `<div class="t10-htags">${(data.targetRoles||[]).map((r: string) => `<span class="t10-htag">${r}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  </div>
  <div class="t10-contact-bar">
    ${data.phone ? `<span class="t10-citem">📞 ${data.phone}</span>` : ''}
    ${data.email ? `<span class="t10-citem">✉ ${data.email}</span>` : ''}
    ${data.address ? `<span class="t10-citem">📍 ${data.address}</span>` : ''}
    ${data.linkedin ? `<span class="t10-citem">in ${data.linkedin}</span>` : ''}
    ${data.portfolio ? `<span class="t10-citem">🌐 ${data.portfolio}</span>` : ''}
  </div>
  <div class="t10-body">
    <div class="t10-left">
      ${data.skills.length ? `<div class="t10-sh">Compétences créatives</div>
      <div>${data.skills.map((s: string) => `<span class="t10-skill">${s}</span>`).join('')}</div>` : ''}
      ${data.languages.length ? `<div class="t10-sh">Langues</div>
      ${data.languages.map((l: string) => `<div class="t10-info"><span class="t10-ico">◆</span>${l}</div>`).join('')}` : ''}
      ${data.idNumber ? `<div class="t10-sh">Identité</div>
      <div class="t10-info"><span class="t10-ico">🪪</span>CIN: ${data.idNumber}</div>` : ''}
      ${data.certifications?.length ? `<div class="t10-sh">Certifications</div>
      ${data.certifications.map((c: string) => `<div class="t10-cert">✓ ${c}</div>`).join('')}` : ''}
    </div>
    <div class="t10-right">
      ${data.summary ? `<div class="t10-sh" style="margin-top:0">À propos</div><div class="t10-summary">${data.summary}</div>` : ''}
      ${data.work?.length ? `<div class="t10-sh">Expériences</div>
      ${data.work.map((j: WorkEntry) => `<div class="t10-job">
        <div class="t10-job-top">
          <div class="t10-job-title">${j.title}</div>
          <div class="t10-job-date">${j.startDate}${j.endDate ? ` – ${j.endDate}` : ' – Présent'}</div>
        </div>
        <div class="t10-job-co">▸ ${j.company}</div>
        ${j.description ? `<ul class="t10-bullets">${descToBullets(j.description)}</ul>` : ''}
      </div>`).join('')}` : ''}
      ${data.education.degree ? `<div class="t10-sh">Formation</div>
      <div class="t10-job" style="border-bottom:none">
        <div class="t10-job-top">
          <div class="t10-job-title">${data.education.degree}</div>
          ${data.education.year ? `<div class="t10-job-date">${data.education.year}</div>` : ''}
        </div>
        ${data.education.institution ? `<div class="t10-job-co">▸ ${data.education.institution}</div>` : ''}
      </div>` : ''}
    </div>
  </div>
  <div class="t10-footer">
    <span>TalentMap · Maroc</span><span>${today}</span>
  </div>
</div>
</body></html>`;
}

// ─── T11: Terracotta Commerce ───────────────────────────────────────────────
function generateCVHtml11(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#92400e';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Georgia',serif;background:#fef3c7;color:#1c1917;min-height:100vh}
    .wrap{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 22px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.5);overflow:hidden;margin:0 auto}
    .name{font-size:1.35rem;font-weight:700;text-align:center;line-height:1.3}
    .title{font-size:.78rem;text-align:center;opacity:.8;margin-top:4px}
    .sh{font-size:.6rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.6;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px}
    .sitem{font-size:.74rem;margin-bottom:5px;line-height:1.5}
    .skill{display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:2px 9px;font-size:.68rem;margin:2px}
    .main{padding:36px 32px;background:#fffbeb}
    .mh{font-size:.65rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:14px}
    .job{margin-bottom:18px}.jtitle{font-size:.95rem;font-weight:700;color:#1c1917}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.72rem;color:#78716c}.jbul{margin:6px 0 0 16px;font-size:.76rem;color:#44403c;line-height:1.6}
    .tag{display:inline-block;background:${clr}22;color:${clr};border:1px solid ${clr}44;border-radius:4px;padding:2px 8px;font-size:.68rem;margin:2px}
    .foot{font-size:.65rem;color:#a8a29e;text-align:right;margin-top:18px;border-top:1px solid #e7e5e4;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'Commerce & Vente'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div style="margin-bottom:24px"><div class="mh">Profil</div><p style="font-size:.82rem;line-height:1.75;color:#44403c">${data.summary}</p></div>`:''}
    ${w.length?`<div style="margin-bottom:24px"><div class="mh">Expérience Professionnelle</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Objectifs Commerce</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}

// ─── T12: Royal Blue Education ───────────────────────────────────────────────
function generateCVHtml12(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#1e40af';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Palatino Linotype',Palatino,serif;background:#eff6ff;color:#1e3a8a;min-height:100vh}
    .wrap{display:grid;grid-template-columns:250px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 20px;display:flex;flex-direction:column;gap:20px}
    .av{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;border:3px solid #bfdbfe;overflow:hidden;margin:0 auto}
    .name{font-size:1.3rem;font-weight:700;text-align:center;line-height:1.3}
    .title{font-size:.76rem;text-align:center;opacity:.8;margin-top:4px;font-style:italic}
    .sh{font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.6;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.2)}
    .sitem{font-size:.73rem;margin-bottom:5px;line-height:1.5}
    .skill{display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:2px 9px;font-size:.67rem;margin:2px}
    .main{padding:36px 32px;background:#fff}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:14px;margin-top:20px}
    .mh:first-child{margin-top:0}
    .job{margin-bottom:16px;padding-left:12px;border-left:3px solid ${clr}55}
    .jtitle{font-size:.95rem;font-weight:700;color:#1e3a8a}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#6b7280}
    .jbul{margin:6px 0 0 14px;font-size:.75rem;color:#374151;line-height:1.65}
    .tag{display:inline-block;background:${clr}15;color:${clr};border:1px solid ${clr}33;border-radius:4px;padding:2px 8px;font-size:.68rem;margin:2px}
    .foot{font-size:.63rem;color:#9ca3af;text-align:right;margin-top:18px;border-top:1px solid #e5e7eb;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'Enseignant / Formateur'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Philosophie Pédagogique</div><p style="font-size:.82rem;line-height:1.75;color:#374151;font-style:italic">${data.summary}</p></div>`:''}
    ${w.length?`<div><div class="mh">Parcours Professionnel</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Domaines d'Enseignement</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}

// ─── T13: Burgundy Hospitality ───────────────────────────────────────────────
function generateCVHtml13(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#7f1d1d';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Times New Roman',serif;background:#fff5f5;color:#1c1917;min-height:100vh}
    .wrap{display:grid;grid-template-columns:255px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 22px;display:flex;flex-direction:column;gap:20px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;border:3px solid #fecaca;overflow:hidden;margin:0 auto}
    .name{font-size:1.3rem;font-weight:700;text-align:center;line-height:1.3}
    .title{font-size:.76rem;text-align:center;opacity:.8;margin-top:4px;letter-spacing:1px}
    .sh{font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.5;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.2)}
    .sitem{font-size:.73rem;margin-bottom:5px;line-height:1.5}
    .skill{display:inline-block;background:rgba(255,255,255,.12);border-radius:10px;padding:2px 9px;font-size:.67rem;margin:2px}
    .main{padding:36px 32px;background:#fff}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:14px;margin-top:22px}
    .mh:first-child{margin-top:0}
    .job{margin-bottom:16px}.jtitle{font-size:.93rem;font-weight:700;color:#1c1917}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#78716c}
    .jbul{margin:6px 0 0 14px;font-size:.75rem;color:#44403c;line-height:1.65}
    .tag{display:inline-block;background:${clr}15;color:${clr};border:1px solid ${clr}33;border-radius:4px;padding:2px 8px;font-size:.68rem;margin:2px}
    .foot{font-size:.63rem;color:#a8a29e;text-align:right;margin-top:18px;border-top:1px solid #f5f5f4;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'Hôtellerie & Restauration'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Savoir-Faire</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil</div><p style="font-size:.82rem;line-height:1.75;color:#44403c">${data.summary}</p></div>`:''}
    ${w.length?`<div><div class="mh">Expérience</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Spécialités</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}

// ─── T14: Slate Real Estate ───────────────────────────────────────────────────
function generateCVHtml14(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#1e293b';
  const gold = '#b8860b';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover"/>`
    : `<span style="font-size:2rem;font-weight:900;color:${gold}">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:${clr};min-height:100vh}
    .header{background:${clr};color:#fff;padding:40px 48px;display:flex;align-items:center;gap:28px}
    .av{width:100px;height:100px;background:${gold}22;border:3px solid ${gold};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
    .hname{font-size:1.8rem;font-weight:700;letter-spacing:.5px}
    .htitle{font-size:.85rem;color:${gold};margin-top:6px;letter-spacing:1px}
    .hcontact{margin-top:10px;font-size:.75rem;color:#94a3b8;display:flex;flex-wrap:wrap;gap:14px}
    .body{max-width:900px;margin:0 auto;padding:36px 48px}
    .sec{margin-bottom:28px}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${gold};border-bottom:2px solid ${gold};padding-bottom:5px;margin-bottom:16px}
    .summ{font-size:.84rem;line-height:1.75;color:#334155}
    .job{margin-bottom:18px;display:grid;grid-template-columns:1fr auto;gap:4px}
    .jtitle{font-size:.95rem;font-weight:700;color:${clr}}.jco{font-size:.8rem;color:${gold};font-weight:600}.jdate{font-size:.72rem;color:#64748b;text-align:right}
    .jbul{margin:6px 0 0 14px;font-size:.76rem;color:#475569;line-height:1.65;grid-column:1/-1}
    .skills{display:flex;flex-wrap:wrap;gap:8px}
    .skill{background:${clr}0d;border:1px solid ${clr}22;border-radius:4px;padding:4px 12px;font-size:.73rem;color:${clr}}
    .foot{font-size:.63rem;color:#94a3b8;text-align:right;border-top:1px solid #e2e8f0;padding-top:10px;margin-top:10px}
  </style></head><body>
  <div class="header">
    <div class="av">${av}</div>
    <div>
      <div class="hname">${data.name||'Votre Nom'}</div>
      <div class="htitle">${data.targetRoles?.join(' · ')||'Immobilier & Foncier'}</div>
      <div class="hcontact">
        ${data.email?`<span>✉ ${data.email}</span>`:''}
        ${data.phone?`<span>📞 ${data.phone}</span>`:''}
        ${data.address?`<span>📍 ${data.address}</span>`:''}
      </div>
    </div>
  </div>
  <div class="body">
    ${data.summary?`<div class="sec"><div class="mh">Profil</div><p class="summ">${data.summary}</p></div>`:''}
    ${w.length?`<div class="sec"><div class="mh">Expérience</div>${w.map((j:WorkEntry)=>`<div class="job"><div><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div></div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div class="sec"><div class="mh">Formation</div><div style="font-size:.85rem;font-weight:600;color:${clr}">${data.education.degree}</div><div style="font-size:.78rem;color:#64748b">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div class="sec"><div class="mh">Compétences</div><div class="skills">${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></body></html>`;
}

// ─── T15: Indigo Startup ──────────────────────────────────────────────────────
function generateCVHtml15(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#4338ca';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:900;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter','Helvetica Neue',sans-serif;background:#eef2ff;color:#1e1b4b;min-height:100vh}
    .wrap{display:grid;grid-template-columns:255px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 22px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.4);overflow:hidden;margin:0 auto}
    .name{font-size:1.25rem;font-weight:800;text-align:center;line-height:1.3;letter-spacing:-.3px}
    .title{font-size:.74rem;text-align:center;opacity:.75;margin-top:4px}
    .sh{font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.55;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.2)}
    .sitem{font-size:.73rem;margin-bottom:5px;line-height:1.5}
    .pill{display:inline-block;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 10px;font-size:.67rem;margin:2px;font-weight:600}
    .main{padding:36px 32px;background:#f5f3ff}
    .mh{font-size:.62rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${clr};margin-bottom:12px;display:flex;align-items:center;gap:8px}
    .mh::after{content:'';flex:1;height:1px;background:${clr}33}
    .job{margin-bottom:18px;background:#fff;border-radius:8px;padding:14px 16px;border-left:4px solid ${clr}}
    .jtitle{font-size:.93rem;font-weight:700;color:#1e1b4b}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#6d7aaa}
    .jbul{margin:6px 0 0 14px;font-size:.75rem;color:#374151;line-height:1.65}
    .tag{display:inline-block;background:${clr}15;color:${clr};border-radius:20px;padding:3px 10px;font-size:.68rem;margin:2px;font-weight:600}
    .foot{font-size:.63rem;color:#9ca3af;text-align:right;margin-top:18px;border-top:1px solid #e0e7ff;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'Startup & Innovation'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Stack & Skills</div><div>${data.skills.map((sk:string)=>`<span class="pill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div style="margin-bottom:22px"><div class="mh">À Propos</div><p style="font-size:.82rem;line-height:1.75;color:#3730a3">${data.summary}</p></div>`:''}
    ${w.length?`<div style="margin-bottom:22px"><div class="mh">Expérience</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Missions Recherchées</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}

// ─── T16: Teal NGO / Social ──────────────────────────────────────────────────
function generateCVHtml16(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0d9488';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Helvetica Neue',Helvetica,sans-serif;background:#f0fdfa;color:#134e4a;min-height:100vh}
    .wrap{display:grid;grid-template-columns:250px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 20px;display:flex;flex-direction:column;gap:20px}
    .av{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.45);overflow:hidden;margin:0 auto}
    .name{font-size:1.28rem;font-weight:700;text-align:center;line-height:1.3}
    .title{font-size:.74rem;text-align:center;opacity:.8;margin-top:4px}
    .sh{font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.55;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.2)}
    .sitem{font-size:.73rem;margin-bottom:5px;line-height:1.5}
    .skill{display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:2px 9px;font-size:.67rem;margin:2px}
    .main{padding:36px 32px;background:#ccfbf1;background:linear-gradient(180deg,#ccfbf1 0%,#f0fdfa 120px)}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:14px;margin-top:22px}
    .mh:first-child{margin-top:0}
    .job{margin-bottom:16px;padding-left:12px;border-left:3px solid ${clr}55}
    .jtitle{font-size:.93rem;font-weight:700;color:#134e4a}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#6b7280}
    .jbul{margin:6px 0 0 14px;font-size:.75rem;color:#374151;line-height:1.65}
    .tag{display:inline-block;background:${clr}18;color:${clr};border:1px solid ${clr}44;border-radius:20px;padding:3px 10px;font-size:.68rem;margin:2px}
    .foot{font-size:.63rem;color:#94a3b8;text-align:right;margin-top:18px;border-top:1px solid #99f6e4;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'ONG & Développement Social'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Engagement & Profil</div><p style="font-size:.82rem;line-height:1.75;color:#134e4a">${data.summary}</p></div>`:''}
    ${w.length?`<div><div class="mh">Expérience Terrain</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Domaines d'Action</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}

// ─── T17: Bold Red Journalism ─────────────────────────────────────────────────
function generateCVHtml17(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#dc2626';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover"/>`
    : `<span style="font-size:2rem;font-weight:900;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif;background:#fff;color:#111;min-height:100vh}
    .header{background:#111;color:#fff;padding:0}
    .hbar{background:${clr};height:8px}
    .hcontent{padding:32px 48px;display:flex;align-items:center;gap:24px}
    .av{width:90px;height:90px;background:${clr}33;border:3px solid ${clr};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
    .hname{font-size:2rem;font-weight:900;letter-spacing:-1px;text-transform:uppercase}
    .htitle{font-size:.85rem;color:${clr};margin-top:6px;letter-spacing:2px;text-transform:uppercase;font-weight:700}
    .hcontact{margin-top:10px;font-size:.74rem;color:#9ca3af;display:flex;flex-wrap:wrap;gap:16px}
    .body{max-width:900px;margin:0 auto;padding:32px 48px}
    .sec{margin-bottom:26px}
    .mh{font-size:.6rem;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#111;border-left:5px solid ${clr};padding-left:10px;margin-bottom:14px;line-height:1}
    .summ{font-size:.84rem;line-height:1.75;color:#374151;font-style:italic;border-left:3px solid #e5e7eb;padding-left:14px}
    .job{margin-bottom:16px;border-bottom:1px solid #f3f4f6;padding-bottom:14px}
    .jtitle{font-size:.95rem;font-weight:800;color:#111;text-transform:uppercase;letter-spacing:.3px}.jco{font-size:.8rem;color:${clr};font-weight:700;margin:2px 0}.jdate{font-size:.7rem;color:#6b7280}
    .jbul{margin:6px 0 0 14px;font-size:.76rem;color:#374151;line-height:1.65}
    .skill{display:inline-block;background:#f3f4f6;border-radius:3px;padding:3px 10px;font-size:.7rem;margin:2px;font-weight:600;color:#111}
    .foot{font-size:.63rem;color:#9ca3af;text-align:right;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:10px}
  </style></head><body>
  <div class="header"><div class="hbar"></div>
    <div class="hcontent">
      <div class="av">${av}</div>
      <div>
        <div class="hname">${data.name||'Votre Nom'}</div>
        <div class="htitle">${data.targetRoles?.join(' · ')||'Journalisme & Médias'}</div>
        <div class="hcontact">
          ${data.email?`<span>✉ ${data.email}</span>`:''}
          ${data.phone?`<span>📞 ${data.phone}</span>`:''}
          ${data.address?`<span>📍 ${data.address}</span>`:''}
        </div>
      </div>
    </div>
  </div>
  <div class="body">
    ${data.summary?`<div class="sec"><div class="mh">Profil</div><p class="summ">${data.summary}</p></div>`:''}
    ${w.length?`<div class="sec"><div class="mh">Parcours</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div class="sec"><div class="mh">Formation</div><div style="font-size:.85rem;font-weight:700">${data.education.degree}</div><div style="font-size:.78rem;color:#6b7280">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div class="sec"><div class="mh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></body></html>`;
}

// ─── T18: Copper Architecture ────────────────────────────────────────────────
function generateCVHtml18(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#78350f';
  const acc = '#d97706';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover"/>`
    : `<span style="font-size:2rem;font-weight:900;color:${acc}">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Georgia',serif;background:#fffbeb;color:#292524;min-height:100vh}
    .header{background:${clr};padding:40px 48px;display:flex;align-items:center;gap:28px}
    .av{width:100px;height:100px;background:rgba(255,255,255,.1);border:3px solid ${acc};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
    .hname{font-size:1.75rem;font-weight:700;color:#fff;letter-spacing:.5px}
    .htitle{font-size:.82rem;color:${acc};margin-top:6px;letter-spacing:1px}
    .hcontact{margin-top:10px;font-size:.74rem;color:#d6d3d1;display:flex;flex-wrap:wrap;gap:16px}
    .body{max-width:900px;margin:0 auto;padding:36px 48px}
    .sec{margin-bottom:26px}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};padding-bottom:5px;border-bottom:2px solid ${acc};margin-bottom:16px}
    .summ{font-size:.84rem;line-height:1.75;color:#44403c}
    .job{margin-bottom:18px;padding-left:14px;border-left:3px solid ${acc}66}
    .jtitle{font-size:.95rem;font-weight:700;color:#1c1917}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#78716c}
    .jbul{margin:6px 0 0 14px;font-size:.76rem;color:#44403c;line-height:1.65}
    .skill{display:inline-block;background:${clr}12;border:1px solid ${acc}55;border-radius:4px;padding:3px 10px;font-size:.7rem;margin:2px;color:${clr}}
    .foot{font-size:.63rem;color:#a8a29e;text-align:right;border-top:1px solid #e7e5e4;padding-top:8px;margin-top:10px}
  </style></head><body>
  <div class="header">
    <div class="av">${av}</div>
    <div>
      <div class="hname">${data.name||'Votre Nom'}</div>
      <div class="htitle">${data.targetRoles?.join(' · ')||'Architecture & Urbanisme'}</div>
      <div class="hcontact">
        ${data.email?`<span>✉ ${data.email}</span>`:''}
        ${data.phone?`<span>📞 ${data.phone}</span>`:''}
        ${data.address?`<span>📍 ${data.address}</span>`:''}
      </div>
    </div>
  </div>
  <div class="body">
    ${data.summary?`<div class="sec"><div class="mh">Vision</div><p class="summ">${data.summary}</p></div>`:''}
    ${w.length?`<div class="sec"><div class="mh">Projets & Expérience</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div class="sec"><div class="mh">Formation</div><div style="font-size:.85rem;font-weight:600;color:#1c1917">${data.education.degree}</div><div style="font-size:.78rem;color:#78716c">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div class="sec"><div class="mh">Logiciels & Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></body></html>`;
}

// ─── T19: Violet HR ──────────────────────────────────────────────────────────
function generateCVHtml19(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#7c3aed';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f3ff;color:#1e1b4b;min-height:100vh}
    .wrap{display:grid;grid-template-columns:255px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 20px;display:flex;flex-direction:column;gap:20px}
    .av{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.4);overflow:hidden;margin:0 auto}
    .name{font-size:1.25rem;font-weight:700;text-align:center;line-height:1.3}
    .title{font-size:.74rem;text-align:center;opacity:.8;margin-top:4px}
    .sh{font-size:.57rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.55;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.2)}
    .sitem{font-size:.73rem;margin-bottom:5px;line-height:1.5}
    .skill{display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:2px 9px;font-size:.67rem;margin:2px}
    .main{padding:36px 32px;background:#fff}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:14px;margin-top:22px}
    .mh:first-child{margin-top:0}
    .job{margin-bottom:16px;border-left:3px solid ${clr}44;padding-left:12px}
    .jtitle{font-size:.93rem;font-weight:700;color:#1e1b4b}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#6b7280}
    .jbul{margin:6px 0 0 14px;font-size:.75rem;color:#374151;line-height:1.65}
    .tag{display:inline-block;background:${clr}12;color:${clr};border:1px solid ${clr}33;border-radius:20px;padding:3px 10px;font-size:.68rem;margin:2px}
    .foot{font-size:.63rem;color:#9ca3af;text-align:right;margin-top:18px;border-top:1px solid #ede9fe;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'Ressources Humaines'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Compétences RH</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil RH</div><p style="font-size:.82rem;line-height:1.75;color:#374151">${data.summary}</p></div>`:''}
    ${w.length?`<div><div class="mh">Expérience</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Expertises</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}

// ─── T20: Navy Logistics ─────────────────────────────────────────────────────
function generateCVHtml20(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0c4a6e';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Arial',sans-serif;background:#f0f9ff;color:#0c2340;min-height:100vh}
    .wrap{display:grid;grid-template-columns:255px 1fr;min-height:100vh}
    .side{background:${clr};color:#fff;padding:32px 22px;display:flex;flex-direction:column;gap:20px}
    .av{width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.4);overflow:hidden;margin:0 auto}
    .name{font-size:1.28rem;font-weight:700;text-align:center;line-height:1.3}
    .title{font-size:.74rem;text-align:center;opacity:.8;margin-top:4px}
    .sh{font-size:.58rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.55;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.2)}
    .sitem{font-size:.73rem;margin-bottom:5px;line-height:1.5}
    .skill{display:inline-block;background:rgba(255,255,255,.12);border-radius:10px;padding:2px 9px;font-size:.67rem;margin:2px}
    .main{padding:36px 32px;background:#fff}
    .mh{font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:14px;margin-top:22px}
    .mh:first-child{margin-top:0}
    .job{margin-bottom:16px;padding:12px;background:#f0f9ff;border-radius:6px;border-left:4px solid ${clr}}
    .jtitle{font-size:.93rem;font-weight:700;color:#0c2340}.jco{font-size:.8rem;color:${clr};font-weight:600;margin:2px 0}.jdate{font-size:.7rem;color:#6b7280}
    .jbul{margin:6px 0 0 14px;font-size:.75rem;color:#374151;line-height:1.65}
    .tag{display:inline-block;background:${clr}12;color:${clr};border:1px solid ${clr}33;border-radius:4px;padding:2px 8px;font-size:.68rem;margin:2px}
    .foot{font-size:.63rem;color:#94a3b8;text-align:right;margin-top:18px;border-top:1px solid #e0f2fe;padding-top:8px}
  </style></head><body><div class="wrap">
  <div class="side">
    <div class="av">${av}</div>
    <div><div class="name">${data.name||'Votre Nom'}</div><div class="title">${data.targetRoles?.join(' · ')||'Logistique & Supply Chain'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
      ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
    </div>
    ${data.education?.degree?`<div><div class="sh">Formation</div><div class="sitem">${data.education.degree}</div><div class="sitem" style="opacity:.75">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div>`:''}
    ${data.skills?.length?`<div><div class="sh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="sitem">• ${l}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil</div><p style="font-size:.82rem;line-height:1.75;color:#374151">${data.summary}</p></div>`:''}
    ${w.length?`<div><div class="mh">Expérience</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jco">${j.company||''}</div><div class="jdate">${j.startDate||''} – ${j.endDate||'Présent'}</div><ul class="jbul">${descToBullets(j.description)}</ul></div>`).join('')}</div>`:''}
    ${data.targetRoles?.length?`<div><div class="mh">Spécialités</div><div>${data.targetRoles.map((r:string)=>`<span class="tag">${r}</span>`).join('')}</div></div>`:''}
    <div class="foot">TalentMap · Maroc · ${today}</div>
  </div></div></body></html>`;
}


function generateCVHtml21(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#15803d';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f4;color:#1a2e1a;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(0,0,0,.10)}
.side{width:260px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.5);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.2)}
.side h1{font-size:1.2rem;font-weight:800;text-align:center;color:#fff;margin-bottom:4px}
.side .title{font-size:.78rem;text-align:center;color:rgba(255,255,255,.8);margin-bottom:20px}
.shead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.6);border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:4px;margin:18px 0 10px}
.sitem{font-size:.78rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.skill-bar{background:rgba(255,255,255,.2);border-radius:4px;height:5px;margin-top:3px}
.skill-fill{background:#bbf7d0;height:5px;border-radius:4px;width:82%}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#f0fdf4;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 8px 8px 0}
.job{margin-bottom:14px}
.jtitle{font-size:.92rem;font-weight:700;color:#1a2e1a}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side">
  <div class="av">${av}</div>
  <h1>${data.name||'Prénom Nom'}</h1>
  <div class="title">${(data.targetRoles||[])[0]||''}</div>
  <div class="shead">Contact</div>
  ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
  ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
  ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
  ${data.linkedin?`<div class="sitem">🔗 ${data.linkedin}</div>`:''}
  <div class="shead">Formation</div>
  <div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
  <div class="shead">Compétences</div>
  ${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">${sk}<div class="skill-bar"><div class="skill-fill"></div></div></div>`).join('')}
  <div class="shead">Langues</div>
  ${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">
  ${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
  <div class="mhead">Expérience professionnelle</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
  <div class="foot">Document généré le ${today}</div>
</div></div></body></html>`;
}

function generateCVHtml22(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#1e3a5f';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:50%;border:3px solid #c0c8d4"/>`
    : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#fff;border:3px solid rgba(255,255,255,.4)">${initials||'?'}</div>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1e293b;font-size:13.5px}
.hdr{background:${clr};padding:36px 44px;color:#fff;display:flex;align-items:center;gap:28px}
.hdr-text h1{font-size:1.6rem;font-weight:900;letter-spacing:-.5px}
.hdr-text .sub{font-size:.88rem;color:#93c5fd;margin-top:3px}
.hdr-contact{margin-top:10px;display:flex;gap:18px;flex-wrap:wrap}
.hdr-contact span{font-size:.72rem;color:rgba(255,255,255,.8)}
.body{max-width:900px;margin:0 auto;background:#fff;padding:32px 44px;box-shadow:0 2px 20px rgba(0,0,0,.07)}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#eff6ff;border-left:4px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1e293b}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.tag{display:inline-block;background:#e8f0fb;color:${clr};padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:700;margin:2px 2px 2px 0}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body>
<div class="hdr">${av}<div class="hdr-text"><h1>${data.name||'Prénom Nom'}</h1><div class="sub">${(data.targetRoles||[])[0]||''}</div>
<div class="hdr-contact">${[data.email,data.phone,data.address,data.linkedin].filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div></div></div>
<div class="body">
${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expérience</div>
${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
<div class="two">
<div><div class="mhead">Formation</div><div class="job"><div class="jtitle">${data.education?.degree||''}</div><div class="jmeta">${data.education?.institution||''} — ${data.education?.year||''}</div></div></div>
<div><div class="mhead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<span class="tag">${sk}</span>`).join('')}</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

function generateCVHtml23(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#db2777';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fdf2f8;color:#1a1a2e;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(0,0,0,.10)}
.side{width:250px;background:${clr};color:#fff;padding:36px 22px;flex-shrink:0}
.av{width:86px;height:86px;border-radius:50%;border:3px solid rgba(255,255,255,.5);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.18)}
.side h1{font-size:1.1rem;font-weight:800;text-align:center;color:#fff;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:rgba(255,255,255,.8);margin-bottom:18px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.65);border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:4px;margin:16px 0 8px}
.sitem{font-size:.77rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.pill{display:inline-block;background:rgba(255,255,255,.18);border-radius:20px;padding:2px 10px;font-size:.68rem;margin:2px 2px 2px 0;color:#fff}
.main{flex:1;padding:34px 30px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#fdf2f8;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 8px 8px 0}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1a1a2e}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side">
  <div class="av">${av}</div>
  <h1>${data.name||'Prénom Nom'}</h1>
  <div class="title">${(data.targetRoles||[])[0]||''}</div>
  <div class="shead">Contact</div>
  ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
  ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
  ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
  ${data.linkedin?`<div class="sitem">🔗 ${data.linkedin}</div>`:''}
  <div class="shead">Formation</div>
  <div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
  <div class="shead">Outils & Plateformes</div>
  ${(data.skills||[]).slice(0,7).map((sk: string)=>`<span class="pill">${sk}</span>`).join('')}
  <div class="shead">Langues</div>
  ${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">
  ${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
  <div class="mhead">Expérience</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
  <div class="foot">Document généré le ${today}</div>
</div></div></body></html>`;
}

function generateCVHtml24(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0e7490';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#22d3ee">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#e2e8f0;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto}
.side{width:255px;background:#1e293b;padding:36px 22px;flex-shrink:0}
.av{width:86px;height:86px;border-radius:50%;border:2px solid #22d3ee;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#0f172a}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;color:#f1f5f9;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:#94a3b8;margin-bottom:18px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#22d3ee;border-bottom:1px solid #334155;padding-bottom:4px;margin:16px 0 8px}
.sitem{font-size:.77rem;color:#cbd5e1;margin-bottom:6px;line-height:1.5}
.code-tag{display:inline-block;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:2px 8px;font-size:.68rem;font-family:monospace;color:#22d3ee;margin:2px 2px 2px 0}
.main{flex:1;background:#1a2540;padding:34px 30px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#22d3ee;border-bottom:1px solid #334155;padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.85rem;color:#94a3b8;line-height:1.7;border-left:3px solid #22d3ee;padding:10px 14px}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#f1f5f9}
.jmeta{font-size:.72rem;color:#64748b;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#94a3b8;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#475569;text-align:right;margin-top:28px;border-top:1px solid #334155;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side">
  <div class="av">${av}</div>
  <h1>${data.name||'Prénom Nom'}</h1>
  <div class="title">${(data.targetRoles||[])[0]||''}</div>
  <div class="shead">Contact</div>
  ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
  ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
  ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
  ${data.linkedin?`<div class="sitem">🔗 ${data.linkedin}</div>`:''}
  <div class="shead">Stack Technique</div>
  ${(data.skills||[]).slice(0,10).map((sk: string)=>`<span class="code-tag">${sk}</span>`).join('')}
  <div class="shead">Formation</div>
  <div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
</div>
<div class="main">
  ${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
  <div class="mhead">Expérience</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
  <div class="foot">Document généré le ${today}</div>
</div></div></body></html>`;
}

function generateCVHtml25(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#c2410c';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:50%;border:3px solid rgba(255,255,255,.5)"/>`
    : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#fff">${initials||'?'}</div>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff7f0;color:#1c1917;font-size:13.5px}
.hdr{background:${clr};padding:36px 44px;color:#fff;display:flex;align-items:center;gap:28px}
.hdr-text h1{font-size:1.6rem;font-weight:900;letter-spacing:-.5px}
.hdr-text .sub{font-size:.88rem;color:#fed7aa;margin-top:3px}
.hdr-contact{margin-top:10px;display:flex;gap:18px;flex-wrap:wrap}
.hdr-contact span{font-size:.72rem;color:rgba(255,255,255,.85)}
.body{max-width:900px;margin:0 auto;background:#fff;padding:32px 44px;box-shadow:0 2px 20px rgba(0,0,0,.07)}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#fff7f0;border-left:4px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.two{display:grid;grid-template-columns:2fr 1fr;gap:28px;margin-top:8px}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1c1917}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.tag{display:inline-block;background:#fff7f0;color:${clr};border:1px solid #fdba74;padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:600;margin:2px 2px 2px 0}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body>
<div class="hdr">${av}<div class="hdr-text"><h1>${data.name||'Prénom Nom'}</h1><div class="sub">${(data.targetRoles||[])[0]||''}</div>
<div class="hdr-contact">${[data.email,data.phone,data.address].filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div></div></div>
<div class="body">
${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="two">
<div>
  <div class="mhead">Expérience</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
</div>
<div>
  <div class="mhead">Formation</div>
  <div class="job"><div class="jtitle">${data.education?.degree||''}</div><div class="jmeta">${data.education?.institution||''} — ${data.education?.year||''}</div></div>
  <div class="mhead">Compétences</div>
  ${(data.skills||[]).slice(0,8).map((sk: string)=>`<span class="tag">${sk}</span>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.slice(0,4).map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

function generateCVHtml26(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#059669';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0fdf4;color:#1a2e1a;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(0,0,0,.10)}
.side{width:255px;background:${clr};color:#fff;padding:36px 22px;flex-shrink:0}
.av{width:86px;height:86px;border-radius:50%;border:3px solid rgba(255,255,255,.5);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.15)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;color:#fff;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:rgba(255,255,255,.8);margin-bottom:18px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.65);border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:4px;margin:16px 0 8px}
.sitem{font-size:.77rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.kpi{background:rgba(255,255,255,.18);border-radius:8px;padding:8px 10px;margin-bottom:8px;text-align:center}
.kpi-n{font-size:1.2rem;font-weight:800;color:#fff}
.kpi-l{font-size:.65rem;color:rgba(255,255,255,.7)}
.main{flex:1;padding:34px 30px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#f0fdf4;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 8px 8px 0}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1a2e1a}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side">
  <div class="av">${av}</div>
  <h1>${data.name||'Prénom Nom'}</h1>
  <div class="title">${(data.targetRoles||[])[0]||''}</div>
  <div class="shead">Contact</div>
  ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
  ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
  ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
  ${data.linkedin?`<div class="sitem">🔗 ${data.linkedin}</div>`:''}
  <div class="shead">Formation</div>
  <div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
  <div class="shead">Compétences</div>
  ${(data.skills||[]).slice(0,7).map((sk: string)=>`<div class="sitem">▶ ${sk}</div>`).join('')}
</div>
<div class="main">
  ${data.summary?`<div class="mhead">Profil Commercial</div><div class="intro">${data.summary}</div>`:''}
  <div class="mhead">Expérience</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
  <div class="foot">Document généré le ${today}</div>
</div></div></body></html>`;
}

function generateCVHtml27(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#374151';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:2px solid rgba(255,255,255,.3)"/>`
    : `<div style="width:80px;height:80px;border-radius:6px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#e2e8f0">${initials||'?'}</div>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b;font-size:13.5px}
.hdr{background:${clr};padding:36px 44px;color:#fff;display:flex;align-items:center;gap:28px}
.hdr-text h1{font-size:1.6rem;font-weight:900;letter-spacing:-.5px}
.hdr-text .sub{font-size:.88rem;color:#9ca3af;margin-top:3px}
.hdr-contact{margin-top:10px;display:flex;gap:18px;flex-wrap:wrap}
.hdr-contact span{font-size:.72rem;color:rgba(255,255,255,.75)}
.body{max-width:900px;margin:0 auto;background:#fff;padding:32px 44px;box-shadow:0 2px 20px rgba(0,0,0,.07)}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#f8fafc;border-left:4px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1e293b}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.tag{display:inline-block;background:#f1f5f9;color:${clr};padding:3px 10px;border-radius:4px;font-size:.68rem;font-weight:600;margin:2px 2px 2px 0;border:1px solid #e2e8f0}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body>
<div class="hdr">${av}<div class="hdr-text"><h1>${data.name||'Prénom Nom'}</h1><div class="sub">${(data.targetRoles||[])[0]||''}</div>
<div class="hdr-contact">${[data.email,data.phone,data.address].filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div></div></div>
<div class="body">
${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expérience</div>
${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
<div class="two">
<div><div class="mhead">Formation</div><div class="job"><div class="jtitle">${data.education?.degree||''}</div><div class="jmeta">${data.education?.institution||''} — ${data.education?.year||''}</div></div></div>
<div><div class="mhead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<span class="tag">${sk}</span>`).join('')}</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

function generateCVHtml28(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0369a1';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:50%;border:3px solid #bae6fd"/>`
    : `<div style="width:80px;height:80px;border-radius:50%;background:#0369a1;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#fff">${initials||'?'}</div>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f9ff;color:#0c4a6e;font-size:13.5px}
.hdr{background:${clr};padding:32px 44px;color:#fff;display:flex;align-items:center;gap:28px}
.hdr-text h1{font-size:1.55rem;font-weight:900;letter-spacing:-.5px}
.hdr-text .sub{font-size:.88rem;color:#bae6fd;margin-top:3px}
.hdr-contact{margin-top:10px;display:flex;gap:18px;flex-wrap:wrap}
.hdr-contact span{font-size:.72rem;color:rgba(255,255,255,.8)}
.body{max-width:900px;margin:0 auto;background:#fff;padding:32px 44px;box-shadow:0 2px 20px rgba(0,0,0,.07)}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#f0f9ff;border-left:4px solid ${clr};padding:10px 14px}
.two{display:grid;grid-template-columns:2fr 1fr;gap:24px}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#0c4a6e}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.tag{display:inline-block;background:#e0f2fe;color:${clr};padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:600;margin:2px 2px 2px 0}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body>
<div class="hdr">${av}<div class="hdr-text"><h1>${data.name||'Prénom Nom'}</h1><div class="sub">${(data.targetRoles||[])[0]||''}</div>
<div class="hdr-contact">${[data.email,data.phone,data.address].filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div></div></div>
<div class="body">
${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="two">
<div>
  <div class="mhead">Expérience</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
</div>
<div>
  <div class="mhead">Formation</div>
  <div class="job"><div class="jtitle">${data.education?.degree||''}</div><div class="jmeta">${data.education?.institution||''} — ${data.education?.year||''}</div></div>
  <div class="mhead">Compétences</div>
  ${(data.skills||[]).slice(0,8).map((sk: string)=>`<span class="tag">${sk}</span>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.slice(0,4).map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

function generateCVHtml29(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#3d6b21';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f8ec;color:#1a2e0a;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(0,0,0,.10)}
.side{width:255px;background:${clr};color:#fff;padding:36px 22px;flex-shrink:0}
.av{width:86px;height:86px;border-radius:50%;border:3px solid rgba(255,255,255,.5);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.15)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;color:#fff;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:rgba(255,255,255,.8);margin-bottom:18px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.65);border-bottom:1px solid rgba(255,255,255,.3);padding-bottom:4px;margin:16px 0 8px}
.sitem{font-size:.77rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:34px 30px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.85rem;color:#374151;line-height:1.7;background:#f1f8ec;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 8px 8px 0}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1a2e0a}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side">
  <div class="av">${av}</div>
  <h1>${data.name||'Prénom Nom'}</h1>
  <div class="title">${(data.targetRoles||[])[0]||''}</div>
  <div class="shead">Contact</div>
  ${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}
  ${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}
  ${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}
  ${data.linkedin?`<div class="sitem">🔗 ${data.linkedin}</div>`:''}
  <div class="shead">Formation</div>
  <div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
  <div class="shead">Compétences</div>
  ${(data.skills||[]).slice(0,7).map((sk: string)=>`<div class="sitem">🌿 ${sk}</div>`).join('')}
  <div class="shead">Langues</div>
  ${(data.languages||[]).slice(0,3).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">
  ${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
  <div class="mhead">Expérience</div>
  ${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
  ${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
  <div class="foot">Document généré le ${today}</div>
</div></div></body></html>`;
}

function generateCVHtml30(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#1e3a5f';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:50%;border:3px solid #c0cfe4"/>`
    : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#c0cfe4">${initials||'?'}</div>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia',serif;background:#f8fafc;color:#1e293b;font-size:13.5px}
.hdr{background:${clr};padding:36px 44px;color:#fff;display:flex;align-items:center;gap:28px;border-bottom:4px solid #c0a060}
.hdr-text h1{font-size:1.6rem;font-weight:700;letter-spacing:.5px}
.hdr-text .sub{font-size:.88rem;color:#c0cfe4;margin-top:3px;font-style:italic}
.hdr-contact{margin-top:10px;display:flex;gap:18px;flex-wrap:wrap}
.hdr-contact span{font-size:.72rem;color:rgba(255,255,255,.8)}
.body{max-width:900px;margin:0 auto;background:#fff;padding:32px 44px;box-shadow:0 2px 20px rgba(0,0,0,.07)}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${clr};border-bottom:2px solid #c0a060;padding-bottom:4px;margin:22px 0 12px}
.intro{font-size:.88rem;color:#374151;line-height:1.8;font-style:italic;border-left:4px solid #c0a060;padding:10px 14px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}
.job{margin-bottom:14px}
.jtitle{font-size:.9rem;font-weight:700;color:#1e293b}
.jmeta{font-size:.72rem;color:#6b7280;margin:2px 0 6px;font-style:italic}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}
.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.tag{display:inline-block;background:#eff6ff;color:${clr};padding:3px 10px;border-radius:4px;font-size:.68rem;font-weight:600;margin:2px 2px 2px 0}
.foot{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:8px}
</style></head><body>
<div class="hdr">${av}<div class="hdr-text"><h1>${data.name||'Prénom Nom'}</h1><div class="sub">${(data.targetRoles||[])[0]||''}</div>
<div class="hdr-contact">${[data.email,data.phone,data.address,data.linkedin].filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div></div></div>
<div class="body">
${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expérience</div>
${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} | ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
<div class="two">
<div><div class="mhead">Formation</div><div class="job"><div class="jtitle">${data.education?.degree||''}</div><div class="jmeta">${data.education?.institution||''} — ${data.education?.year||''}</div></div></div>
<div><div class="mhead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<span class="tag">${sk}</span>`).join('')}
<div class="mhead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div style="font-size:.78rem;color:#374151;margin-bottom:3px">• ${l}</div>`).join('')}
</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

// T31: Assurance/Actuariat — Navy+Silver
function generateCVHtml31(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#1e293b';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(0,0,0,.10)}
.side{width:260px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.3);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.1)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.78rem;text-align:center;color:#94a3b8;margin-bottom:20px}
.shead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px;margin:18px 0 10px}
.sitem{font-size:.78rem;color:rgba(255,255,255,.85);margin-bottom:6px;line-height:1.5}
.chip{display:inline-block;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#e2e8f0;padding:2px 8px;border-radius:10px;font-size:.66rem;margin:2px 1px}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid #94a3b8;padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#f8fafc;border-left:3px solid #475569;padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #f1f5f9}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:${clr}}.jmeta{font-size:.72rem;color:#64748b;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#94a3b8;text-align:right;margin-top:28px;border-top:1px solid #e2e8f0;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<span class="chip">${sk}</span>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">◆ ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T32: Marketing Digital — Cyan Blue
function generateCVHtml32(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0284c7';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f9ff;color:#0c4a6e;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(2,132,199,.12)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.15)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.78rem;text-align:center;color:#bae6fd;margin-bottom:20px}
.shead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#bae6fd;border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:4px;margin:18px 0 10px}
.sitem{font-size:.78rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#f0f9ff;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #e0f2fe}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:#0c4a6e}.jmeta{font-size:.72rem;color:#0284c7;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.tag{display:inline-block;background:#e0f2fe;color:#0284c7;border:1px solid #bae6fd;padding:2px 9px;border-radius:12px;font-size:.66rem;font-weight:600;margin:2px 1px}
.foot{font-size:.68rem;color:#94a3b8;text-align:right;margin-top:28px;border-top:1px solid #e0f2fe;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}${data.portfolio?`<div class="sitem">🌐 ${data.portfolio}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Outils & Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil Digital</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Compétences</div><div style="margin-bottom:16px">${(data.skills||[]).slice(0,10).map((sk: string)=>`<span class="tag">${sk}</span>`).join('')}</div>
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T33: Recherche Clinique/Essais — Deep Navy
function generateCVHtml33(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0f2f6e';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#eff6ff;color:#1e3a8a;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(15,47,110,.12)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.35);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.1)}
.side h1{font-size:1.1rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:#93c5fd;margin-bottom:20px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#93c5fd;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px;margin:16px 0 9px}
.sitem{font-size:.77rem;color:rgba(255,255,255,.88);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.75;background:#eff6ff;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #dbeafe}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:${clr}}.jmeta{font-size:.72rem;color:#3b82f6;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#93c5fd;text-align:right;margin-top:28px;border-top:1px solid #dbeafe;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">▸ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications & Publications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T34: Sport & Coaching — Scarlet Red
function generateCVHtml34(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#991b1b';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff5f5;color:#1c1917;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(153,27,27,.12)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.12)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.78rem;text-align:center;color:#fca5a5;margin-bottom:20px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#fca5a5;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px;margin:16px 0 9px}
.sitem{font-size:.78rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#fff5f5;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #fee2e2}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:${clr}}.jmeta{font-size:.72rem;color:#b91c1c;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#fca5a5;text-align:right;margin-top:28px;border-top:1px solid #fee2e2;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Spécialités</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">▸ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications & Diplômes Sportifs</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T35: Événementiel/Mariage — Rose Magenta
function generateCVHtml35(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#9d174d';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fdf2f8;color:#831843;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(157,23,77,.12)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.12)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.78rem;text-align:center;color:#fbcfe8;margin-bottom:20px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#fbcfe8;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px;margin:16px 0 9px}
.sitem{font-size:.78rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid #f9a8d4;padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#fdf2f8;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #fce7f3}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:${clr}}.jmeta{font-size:.72rem;color:#db2777;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#f9a8d4;text-align:right;margin-top:28px;border-top:1px solid #fce7f3;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">✦ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T36: Qualité / HSE / Lean — Slate Gray
function generateCVHtml36(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#475569';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#0f172a;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(71,85,105,.10)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.3);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.1)}
.side h1{font-size:1.1rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:#cbd5e1;margin-bottom:20px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,.15);padding-bottom:4px;margin:16px 0 9px}
.sitem{font-size:.77rem;color:rgba(255,255,255,.88);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid #cbd5e1;padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#f8fafc;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #f1f5f9}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:#0f172a}.jmeta{font-size:.72rem;color:${clr};margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#94a3b8;text-align:right;margin-top:28px;border-top:1px solid #e2e8f0;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Normes & Standards</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">▸ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications & Habilitations</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T37: Achats / Procurement / Supply Chain — Deep Teal
function generateCVHtml37(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0f766e';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f0fdfa;color:#134e4a;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(15,118,110,.10)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.12)}
.side h1{font-size:1.1rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.76rem;text-align:center;color:#99f6e4;margin-bottom:20px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#5eead4;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:4px;margin:16px 0 9px}
.sitem{font-size:.77rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#f0fdfa;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #ccfbf1}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:${clr}}.jmeta{font-size:.72rem;color:#0d9488;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#5eead4;text-align:right;margin-top:28px;border-top:1px solid #ccfbf1;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">◈ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T38: Administration Publique / Fonction Publique — Navy Institutionnel
function generateCVHtml38(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#1e3a8a';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#eff6ff;color:#1e3a8a;font-size:13.5px}
.page{max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(30,58,138,.10)}
.hdr{background:${clr};padding:28px 36px;display:flex;align-items:center;gap:22px}
.av{width:80px;height:80px;border-radius:4px;border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.1);flex-shrink:0}
.hname{font-size:1.6rem;font-weight:800;color:#fff;letter-spacing:.02em}
.htitle{font-size:.82rem;color:#93c5fd;margin-top:4px;font-weight:500}
.bar{height:4px;background:linear-gradient(90deg,#3b82f6,#1d4ed8,${clr})}
.ribbon{background:#eff6ff;border-bottom:1px solid #dbeafe;padding:10px 36px;display:flex;gap:20px;flex-wrap:wrap}
.rc{font-size:.68rem;color:#1e40af;font-weight:600}
.body{display:flex;padding:28px 36px 36px;gap:28px}
.main{flex:1}
.right{width:210px;flex-shrink:0}
.mhead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid #3b82f6;padding-bottom:4px;margin:20px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.83rem;color:#374151;line-height:1.7;background:#eff6ff;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:18px}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #dbeafe}.job:last-child{border-bottom:none}
.jtitle{font-size:.88rem;font-weight:700;color:${clr}}.jmeta{font-size:.7rem;color:#3b82f6;margin:2px 0 6px}
.jdesc{font-size:.78rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:14px}.jdesc li{margin-bottom:3px}
.shead{font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1e40af;margin:14px 0 8px}
.sitem{font-size:.74rem;color:#374151;margin-bottom:5px;line-height:1.5}
.foot{font-size:.62rem;color:#93c5fd;background:${clr};padding:8px 36px;text-align:right}
</style></head><body><div class="page">
<div class="hdr"><div class="av">${av}</div><div><div class="hname">${data.name||'Prénom Nom'}</div><div class="htitle">${data.sector||''}</div></div></div>
<div class="bar"></div>
<div class="ribbon">
${data.phone?`<span class="rc">📞 ${data.phone}</span>`:''}${data.email?`<span class="rc">✉ ${data.email}</span>`:''}${data.address?`<span class="rc">📍 ${data.address}</span>`:''}${data.linkedin?`<span class="rc">in ${data.linkedin}</span>`:''}
</div>
<div class="body">
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences Professionnelles</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Formations & Habilitations</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
</div>
<div class="right">
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
<div class="shead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">▸ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

// T39: Tourisme & Voyage — Warm Orange
function generateCVHtml39(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#ea580c';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff7ed;color:#7c2d12;font-size:13.5px}
.wrap{display:flex;min-height:100vh;max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(234,88,12,.12)}
.side{width:255px;background:${clr};color:#fff;padding:36px 24px;flex-shrink:0}
.av{width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.12)}
.side h1{font-size:1.15rem;font-weight:800;text-align:center;margin-bottom:4px}
.side .title{font-size:.78rem;text-align:center;color:#fed7aa;margin-bottom:20px}
.shead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#fed7aa;border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:4px;margin:16px 0 9px}
.sitem{font-size:.78rem;color:rgba(255,255,255,.9);margin-bottom:6px;line-height:1.5}
.main{flex:1;padding:36px 32px}
.mhead{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid #fed7aa;padding-bottom:4px;margin:22px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.84rem;color:#374151;line-height:1.7;background:#fff7ed;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #ffedd5}.job:last-child{border-bottom:none}
.jtitle{font-size:.91rem;font-weight:700;color:${clr}}.jmeta{font-size:.72rem;color:#c2410c;margin:2px 0 6px}
.jdesc{font-size:.8rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:16px}.jdesc li{margin-bottom:3px}
.foot{font-size:.68rem;color:#fed7aa;text-align:right;margin-top:28px;border-top:1px solid #ffedd5;padding-top:8px}
</style></head><body><div class="wrap">
<div class="side"><div class="av">${av}</div><h1>${data.name||'Prénom Nom'}</h1><div class="title">${(data.targetRoles||[])[0]||''}</div>
<div class="shead">Contact</div>
${data.email?`<div class="sitem">✉ ${data.email}</div>`:''}${data.phone?`<div class="sitem">📞 ${data.phone}</div>`:''}${data.address?`<div class="sitem">📍 ${data.address}</div>`:''}${data.linkedin?`<div class="sitem">in ${data.linkedin}</div>`:''}
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''} ${data.education?.year||''}</div>
<div class="shead">Compétences</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">✈ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
<div class="main">${data.summary?`<div class="mhead">Profil</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Certifications</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
<div class="foot">Document généré le ${today}</div></div></div></body></html>`;
}

// T40: Médecin / Clinique — Medical Blue
function generateCVHtml40(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#0369a1';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f9ff;color:#0c4a6e;font-size:13.5px}
.page{max-width:900px;margin:0 auto;background:#fff;box-shadow:0 2px 24px rgba(3,105,161,.10)}
.hdr{background:${clr};padding:28px 36px;display:flex;align-items:center;gap:22px}
.av{width:80px;height:80px;border-radius:50%;border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.12);flex-shrink:0}
.hname{font-size:1.6rem;font-weight:800;color:#fff}
.htitle{font-size:.82rem;color:#bae6fd;margin-top:4px}
.bar{height:4px;background:linear-gradient(90deg,#38bdf8,#0369a1,#0c4a6e)}
.ribbon{background:#f0f9ff;border-bottom:1px solid #bae6fd;padding:10px 36px;display:flex;gap:20px;flex-wrap:wrap}
.rc{font-size:.68rem;color:#0284c7;font-weight:600}
.body{display:flex;padding:28px 36px 36px;gap:28px}
.main{flex:1}
.right{width:210px;flex-shrink:0}
.mhead{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${clr};border-bottom:2px solid #38bdf8;padding-bottom:4px;margin:20px 0 12px}
.mhead:first-of-type{margin-top:0}
.intro{font-size:.83rem;color:#374151;line-height:1.7;background:#f0f9ff;border-left:3px solid ${clr};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:18px}
.job{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #e0f2fe}.job:last-child{border-bottom:none}
.jtitle{font-size:.88rem;font-weight:700;color:${clr}}.jmeta{font-size:.7rem;color:#0284c7;margin:2px 0 6px}
.jdesc{font-size:.78rem;color:#374151;line-height:1.65}.jdesc ul{padding-left:14px}.jdesc li{margin-bottom:3px}
.shead{font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${clr};margin:14px 0 8px}
.sitem{font-size:.74rem;color:#374151;margin-bottom:5px;line-height:1.5}
.foot{font-size:.62rem;color:#bae6fd;background:${clr};padding:8px 36px;text-align:right}
</style></head><body><div class="page">
<div class="hdr"><div class="av">${av}</div><div><div class="hname">${data.name||'Prénom Nom'}</div><div class="htitle">${data.sector||''}</div></div></div>
<div class="bar"></div>
<div class="ribbon">
${data.phone?`<span class="rc">📞 ${data.phone}</span>`:''}${data.email?`<span class="rc">✉ ${data.email}</span>`:''}${data.address?`<span class="rc">📍 ${data.address}</span>`:''}${data.linkedin?`<span class="rc">in ${data.linkedin}</span>`:''}
</div>
<div class="body">
<div class="main">${data.summary?`<div class="mhead">Profil Médical</div><div class="intro">${data.summary}</div>`:''}
<div class="mhead">Expériences Cliniques</div>${w.map((j: WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} · ${j.startDate||''} – ${j.endDate||'Présent'}</div><div class="jdesc">${descToBullets(j.description)}</div></div>`).join('')}
${data.certifications?.length?`<div class="mhead">Formations & DU</div><div class="jdesc"><ul>${data.certifications.map((c: string)=>`<li>${c}</li>`).join('')}</ul></div>`:''}
</div>
<div class="right">
<div class="shead">Formation</div><div class="sitem"><strong>${data.education?.degree||''}</strong><br/>${data.education?.institution||''}<br/>${data.education?.year||''}</div>
<div class="shead">Spécialités</div>${(data.skills||[]).slice(0,8).map((sk: string)=>`<div class="sitem">⚕ ${sk}</div>`).join('')}
<div class="shead">Langues</div>${(data.languages||[]).slice(0,4).map((l: string)=>`<div class="sitem">• ${l}</div>`).join('')}
</div>
</div>
<div class="foot">Document généré le ${today}</div>
</div></body></html>`;
}

// T41 — Dentiste / Chirurgien-Dentiste (#047857 Mint Green, Layout A)
function generateCVHtml41(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#047857';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1c1c1c;background:#f7faf9;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:#fff;display:grid;grid-template-columns:220px 1fr;box-shadow:0 2px 20px rgba(0,0,0,.08)}
    .side{background:${clr};color:#fff;padding:28px 18px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border:3px solid rgba(255,255,255,.5)}
    .sname{font-size:16px;font-weight:700;text-align:center;line-height:1.3}
    .stitle{font-size:9.5px;text-align:center;color:rgba(255,255,255,.8);margin-top:4px;font-weight:600;letter-spacing:.8px;text-transform:uppercase}
    .sh{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.6);border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:5px;margin-bottom:8px}
    .si{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;line-height:1.5;display:flex;gap:6px;align-items:flex-start}
    .skill-chip{display:inline-block;background:rgba(255,255,255,.15);border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#fff}
    .lang{display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.9);margin-bottom:4px}
    .main{padding:32px 28px;display:flex;flex-direction:column;gap:20px}
    .mh{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:10px}
    .summary{font-size:11px;color:#444;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#111;font-size:11.5px}
    .jmeta{font-size:10px;color:${clr};font-weight:600;margin-bottom:4px}
    .jbullet{font-size:10.5px;color:#444;line-height:1.6;padding-left:12px}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'⚕';position:absolute;left:0;color:${clr};font-size:9px}
    .edu{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
    .edl{font-size:11px;color:#222;font-weight:600}.edm{font-size:10px;color:#666}
    .foot{grid-column:1/-1;background:#f0f7f4;border-top:2px solid ${clr};padding:10px 28px;font-size:9px;color:#666;text-align:right}
  </style></head><body><div class="page">
  <div class="side">
    <div><div class="av">${av}</div><div class="sname" style="margin-top:12px">${data.name}</div><div class="stitle">${data.targetRoles?.[0]||data.sector||'Dentiste'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="si">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="si">✆ ${data.phone}</div>`:''}
      ${data.address?`<div class="si">⊛ ${data.address}</div>`:''}
      ${data.linkedin?`<div class="si">in ${data.linkedin}</div>`:''}
    </div>
    ${data.skills?.length?`<div><div class="sh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="lang"><span>◆ ${l}</span></div>`).join('')}</div>`:''}
    ${data.certifications?.length?`<div><div class="sh">Certifications</div>${data.certifications.map((c:string)=>`<div class="si">✓ ${c}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil Clinique</div><div class="summary">${data.summary}</div></div>`:''}
    ${w.length?`<div><div class="mh">Expériences Cliniques</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div><div class="mh">Formation & Diplômes</div><div class="edu"><div><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''}</div></div><div class="edm">${data.education.year||''}</div></div></div>`:''}
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T42 — Pharmacien / Officine (#166534 Dark Green, Layout A)
function generateCVHtml42(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#166534';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1c1c1c;background:#f4f9f4;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:#fff;display:grid;grid-template-columns:220px 1fr;box-shadow:0 2px 20px rgba(0,0,0,.08)}
    .side{background:${clr};color:#fff;padding:28px 18px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border:3px solid rgba(255,255,255,.5)}
    .sname{font-size:16px;font-weight:700;text-align:center;line-height:1.3}
    .stitle{font-size:9.5px;text-align:center;color:rgba(255,255,255,.8);margin-top:4px;font-weight:600;letter-spacing:.8px;text-transform:uppercase}
    .sh{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.6);border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:5px;margin-bottom:8px}
    .si{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;line-height:1.5}
    .skill-chip{display:inline-block;background:rgba(255,255,255,.15);border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#fff}
    .lang{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:4px}
    .main{padding:32px 28px;display:flex;flex-direction:column;gap:20px}
    .mh{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:10px}
    .summary{font-size:11px;color:#444;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#111;font-size:11.5px}
    .jmeta{font-size:10px;color:${clr};font-weight:600;margin-bottom:4px}
    .jbullet{font-size:10.5px;color:#444;line-height:1.6;padding-left:12px}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'▸';position:absolute;left:0;color:${clr}}
    .edu{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
    .edl{font-size:11px;color:#222;font-weight:600}.edm{font-size:10px;color:#666}
    .foot{grid-column:1/-1;background:#f0f7f1;border-top:2px solid ${clr};padding:10px 28px;font-size:9px;color:#666;text-align:right}
  </style></head><body><div class="page">
  <div class="side">
    <div><div class="av">${av}</div><div class="sname" style="margin-top:12px">${data.name}</div><div class="stitle">${data.targetRoles?.[0]||data.sector||'Pharmacien'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="si">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="si">✆ ${data.phone}</div>`:''}
      ${data.address?`<div class="si">⊛ ${data.address}</div>`:''}
    </div>
    ${data.skills?.length?`<div><div class="sh">Compétences</div><div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
    ${data.certifications?.length?`<div><div class="sh">Habilitations</div>${data.certifications.map((c:string)=>`<div class="si">✓ ${c}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil Pharmaceutique</div><div class="summary">${data.summary}</div></div>`:''}
    ${w.length?`<div><div class="mh">Expériences Professionnelles</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div><div class="mh">Formation & Doctorat</div><div class="edu"><div><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''}</div></div><div class="edm">${data.education.year||''}</div></div></div>`:''}
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T43 — Chef Cuisinier / Gastronomie (#7c2d12 Dark Brown-Red, Layout A)
function generateCVHtml43(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#7c2d12';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;font-size:11px;color:#1c1c1c;background:#fdf8f5;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:#fff;display:grid;grid-template-columns:220px 1fr;box-shadow:0 2px 20px rgba(0,0,0,.1)}
    .side{background:${clr};color:#fff;padding:28px 18px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border:3px solid rgba(255,220,180,.5)}
    .sname{font-size:16px;font-weight:700;text-align:center;line-height:1.3}
    .stitle{font-size:9.5px;text-align:center;color:rgba(255,210,160,.9);margin-top:4px;font-weight:600;letter-spacing:.8px;text-transform:uppercase}
    .sh{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,210,160,.7);border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:5px;margin-bottom:8px}
    .si{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;line-height:1.5}
    .skill-chip{display:inline-block;background:rgba(255,255,255,.15);border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#fff}
    .lang{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:4px}
    .main{padding:32px 28px;display:flex;flex-direction:column;gap:20px;font-family:'Segoe UI',sans-serif}
    .mh{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:10px}
    .summary{font-size:11px;color:#444;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#111;font-size:11.5px}
    .jmeta{font-size:10px;color:${clr};font-weight:600;margin-bottom:4px}
    .jbullet{font-size:10.5px;color:#444;line-height:1.6}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:14px}
    .jbullet li:before{content:'★';position:absolute;left:0;color:${clr};font-size:8px;top:2px}
    .edu{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
    .edl{font-size:11px;color:#222;font-weight:600}.edm{font-size:10px;color:#666}
    .foot{grid-column:1/-1;background:#fef3ee;border-top:2px solid ${clr};padding:10px 28px;font-size:9px;color:#666;text-align:right}
  </style></head><body><div class="page">
  <div class="side">
    <div><div class="av">${av}</div><div class="sname" style="margin-top:12px">${data.name}</div><div class="stitle">${data.targetRoles?.[0]||data.sector||'Chef Cuisinier'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="si">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="si">✆ ${data.phone}</div>`:''}
      ${data.address?`<div class="si">⊛ ${data.address}</div>`:''}
    </div>
    ${data.skills?.length?`<div><div class="sh">Spécialités Culinaires</div><div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
    ${data.certifications?.length?`<div><div class="sh">Diplômes & Titres</div>${data.certifications.map((c:string)=>`<div class="si">★ ${c}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Philosophie Culinaire</div><div class="summary">${data.summary}</div></div>`:''}
    ${w.length?`<div><div class="mh">Parcours en Cuisine</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div><div class="mh">Formation Culinaire</div><div class="edu"><div><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''}</div></div><div class="edm">${data.education.year||''}</div></div></div>`:''}
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T44 — Enseignant / Formateur / Coach Pédagogique (#6d28d9 Purple, Layout A)
function generateCVHtml44(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#6d28d9';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1c1c1c;background:#f8f5ff;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:#fff;display:grid;grid-template-columns:220px 1fr;box-shadow:0 2px 20px rgba(0,0,0,.08)}
    .side{background:${clr};color:#fff;padding:28px 18px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border:3px solid rgba(255,255,255,.4)}
    .sname{font-size:16px;font-weight:700;text-align:center;line-height:1.3}
    .stitle{font-size:9.5px;text-align:center;color:rgba(230,210,255,.9);margin-top:4px;font-weight:600;letter-spacing:.8px;text-transform:uppercase}
    .sh{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(230,210,255,.7);border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:5px;margin-bottom:8px}
    .si{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;line-height:1.5}
    .skill-chip{display:inline-block;background:rgba(255,255,255,.15);border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#fff}
    .lang{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:4px}
    .main{padding:32px 28px;display:flex;flex-direction:column;gap:20px}
    .mh{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:10px}
    .summary{font-size:11px;color:#444;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#111;font-size:11.5px}
    .jmeta{font-size:10px;color:${clr};font-weight:600;margin-bottom:4px}
    .jbullet{font-size:10.5px;color:#444;line-height:1.6}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'▸';position:absolute;left:0;color:${clr}}
    .edu{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
    .edl{font-size:11px;color:#222;font-weight:600}.edm{font-size:10px;color:#666}
    .foot{grid-column:1/-1;background:#f3f0ff;border-top:2px solid ${clr};padding:10px 28px;font-size:9px;color:#666;text-align:right}
  </style></head><body><div class="page">
  <div class="side">
    <div><div class="av">${av}</div><div class="sname" style="margin-top:12px">${data.name}</div><div class="stitle">${data.targetRoles?.[0]||data.sector||'Enseignant / Formateur'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="si">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="si">✆ ${data.phone}</div>`:''}
      ${data.address?`<div class="si">⊛ ${data.address}</div>`:''}
      ${data.linkedin?`<div class="si">in ${data.linkedin}</div>`:''}
    </div>
    ${data.skills?.length?`<div><div class="sh">Compétences Pédagogiques</div><div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
    ${data.certifications?.length?`<div><div class="sh">Certifications</div>${data.certifications.map((c:string)=>`<div class="si">✓ ${c}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Approche Pédagogique</div><div class="summary">${data.summary}</div></div>`:''}
    ${w.length?`<div><div class="mh">Expériences d'Enseignement</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div><div class="mh">Formation Académique</div><div class="edu"><div><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''}</div></div><div class="edm">${data.education.year||''}</div></div></div>`:''}
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T45 — Traducteur / Interprète / Linguiste (#44403c Warm Slate, Layout A)
function generateCVHtml45(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#44403c';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1c1c1c;background:#f9f8f7;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:#fff;display:grid;grid-template-columns:220px 1fr;box-shadow:0 2px 20px rgba(0,0,0,.08)}
    .side{background:${clr};color:#fff;padding:28px 18px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border:3px solid rgba(255,255,255,.3)}
    .sname{font-size:16px;font-weight:700;text-align:center;line-height:1.3}
    .stitle{font-size:9.5px;text-align:center;color:rgba(220,216,210,.9);margin-top:4px;font-weight:600;letter-spacing:.8px;text-transform:uppercase}
    .sh{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(220,216,210,.6);border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:5px;margin-bottom:8px}
    .si{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;line-height:1.5}
    .skill-chip{display:inline-block;background:rgba(255,255,255,.12);border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#fff;border:1px solid rgba(255,255,255,.2)}
    .lang{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;display:flex;justify-content:space-between}
    .main{padding:32px 28px;display:flex;flex-direction:column;gap:20px}
    .mh{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:10px}
    .summary{font-size:11px;color:#444;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#111;font-size:11.5px}
    .jmeta{font-size:10px;color:${clr};font-weight:600;margin-bottom:4px}
    .jbullet{font-size:10.5px;color:#444;line-height:1.6}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'▸';position:absolute;left:0;color:${clr}}
    .edu{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
    .edl{font-size:11px;color:#222;font-weight:600}.edm{font-size:10px;color:#666}
    .foot{grid-column:1/-1;background:#f5f4f3;border-top:2px solid ${clr};padding:10px 28px;font-size:9px;color:#666;text-align:right}
  </style></head><body><div class="page">
  <div class="side">
    <div><div class="av">${av}</div><div class="sname" style="margin-top:12px">${data.name}</div><div class="stitle">${data.targetRoles?.[0]||data.sector||'Traducteur / Interprète'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="si">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="si">✆ ${data.phone}</div>`:''}
      ${data.address?`<div class="si">⊛ ${data.address}</div>`:''}
    </div>
    ${data.skills?.length?`<div><div class="sh">Domaines de Spécialité</div><div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues Maîtrisées</div>${data.languages.map((l:string)=>`<div class="lang"><span>◆ ${l}</span></div>`).join('')}</div>`:''}
    ${data.certifications?.length?`<div><div class="sh">Accréditations</div>${data.certifications.map((c:string)=>`<div class="si">✓ ${c}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil Linguistique</div><div class="summary">${data.summary}</div></div>`:''}
    ${w.length?`<div><div class="mh">Expériences de Traduction</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div><div class="mh">Formation Linguistique</div><div class="edu"><div><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''}</div></div><div class="edm">${data.education.year||''}</div></div></div>`:''}
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T46 — Graphiste / Illustrateur (#1c1917 Black+Yellow, Layout C dark)
function generateCVHtml46(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const bg = '#1c1917'; const acc = '#eab308';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:${bg}">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#e8e6e1;background:#111;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:${bg};box-shadow:0 2px 30px rgba(0,0,0,.5)}
    .hdr{padding:36px 40px 28px;border-bottom:1px solid #2d2a26;display:flex;align-items:center;gap:24px}
    .av{width:80px;height:80px;border-radius:50%;background:${acc};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
    .hname{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px}
    .htitle{font-size:10px;color:${acc};text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;font-weight:600}
    .hcontact{display:flex;gap:16px;margin-top:10px;font-size:9.5px;color:#a8a29e;flex-wrap:wrap}
    .body{display:grid;grid-template-columns:1fr 190px;gap:0;min-height:900px}
    .left{padding:28px 24px 28px 40px;display:flex;flex-direction:column;gap:20px;border-right:1px solid #2d2a26}
    .right{padding:28px 18px;display:flex;flex-direction:column;gap:18px;background:#232017}
    .mh{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${acc};margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #2d2a26}
    .summary{font-size:11px;color:#a8a29e;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#fff;font-size:11.5px}
    .jmeta{font-size:10px;color:${acc};margin-bottom:4px;font-weight:600}
    .jbullet{font-size:10.5px;color:#a8a29e;line-height:1.6}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'▸';position:absolute;left:0;color:${acc}}
    .skill-chip{display:inline-block;background:#2d2a26;border:1px solid #3d3832;border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#e8e6e1}
    .lang{font-size:10px;color:#a8a29e;margin-bottom:4px}
    .cert{font-size:10px;color:#a8a29e;margin-bottom:4px;padding-left:10px;position:relative}
    .cert:before{content:'▸';position:absolute;left:0;color:${acc};font-size:9px}
    .edu{margin-bottom:8px}.edl{font-size:11px;color:#e8e6e1;font-weight:600}.edm{font-size:10px;color:#a8a29e}
    .foot{background:#111;border-top:1px solid #2d2a26;padding:10px 40px;font-size:9px;color:#57534e;text-align:right}
  </style></head><body><div class="page">
  <div class="hdr">
    <div class="av">${av}</div>
    <div>
      <div class="hname">${data.name}</div>
      <div class="htitle">${data.targetRoles?.[0]||data.sector||'Graphiste / Illustrateur'}</div>
      <div class="hcontact">
        ${data.email?`<span>✉ ${data.email}</span>`:''}
        ${data.phone?`<span>✆ ${data.phone}</span>`:''}
        ${data.address?`<span>⊛ ${data.address}</span>`:''}
        ${data.linkedin?`<span>in ${data.linkedin}</span>`:''}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="left">
      ${data.summary?`<div><div class="mh">Identité Créative</div><div class="summary">${data.summary}</div></div>`:''}
      ${w.length?`<div><div class="mh">Expériences & Projets</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
      ${data.education?.degree?`<div><div class="mh">Formation</div><div class="edu"><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div></div>`:''}
    </div>
    <div class="right">
      ${data.skills?.length?`<div><div class="mh">Outils & Logiciels</div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div>`:''}
      ${data.languages?.length?`<div><div class="mh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
      ${data.certifications?.length?`<div><div class="mh">Formations</div>${data.certifications.map((c:string)=>`<div class="cert">${c}</div>`).join('')}</div>`:''}
    </div>
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T47 — Animateur 3D / Jeu Vidéo / VFX (#0f0f1e Purple+Neon, Layout C dark)
function generateCVHtml47(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const bg = '#0f0f1e'; const acc = '#a78bfa';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:${bg}">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#e8e6ff;background:#080812;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:${bg};box-shadow:0 2px 40px rgba(167,139,250,.15)}
    .hdr{padding:36px 40px 28px;border-bottom:1px solid #1e1a3c;display:flex;align-items:center;gap:24px;background:linear-gradient(135deg,#12123a 0%,${bg} 60%)}
    .av{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${acc},#7c3aed);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;box-shadow:0 0 20px rgba(167,139,250,.4)}
    .hname{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px}
    .htitle{font-size:10px;color:${acc};text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;font-weight:600}
    .hcontact{display:flex;gap:16px;margin-top:10px;font-size:9.5px;color:#7c74a8;flex-wrap:wrap}
    .body{display:grid;grid-template-columns:1fr 190px;gap:0;min-height:900px}
    .left{padding:28px 24px 28px 40px;display:flex;flex-direction:column;gap:20px;border-right:1px solid #1e1a3c}
    .right{padding:28px 18px;display:flex;flex-direction:column;gap:18px;background:#0c0c20}
    .mh{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${acc};margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #1e1a3c}
    .summary{font-size:11px;color:#9d97c7;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#fff;font-size:11.5px}
    .jmeta{font-size:10px;color:${acc};margin-bottom:4px;font-weight:600}
    .jbullet{font-size:10.5px;color:#9d97c7;line-height:1.6}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'▸';position:absolute;left:0;color:${acc}}
    .skill-chip{display:inline-block;background:#1a1535;border:1px solid #2d2760;border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#c4b8ff}
    .lang{font-size:10px;color:#9d97c7;margin-bottom:4px}
    .cert{font-size:10px;color:#9d97c7;margin-bottom:4px;padding-left:10px;position:relative}
    .cert:before{content:'▸';position:absolute;left:0;color:${acc};font-size:9px}
    .edu{margin-bottom:8px}.edl{font-size:11px;color:#e8e6ff;font-weight:600}.edm{font-size:10px;color:#9d97c7}
    .foot{background:#080812;border-top:1px solid #1e1a3c;padding:10px 40px;font-size:9px;color:#4a4570;text-align:right}
  </style></head><body><div class="page">
  <div class="hdr">
    <div class="av">${av}</div>
    <div>
      <div class="hname">${data.name}</div>
      <div class="htitle">${data.targetRoles?.[0]||data.sector||'Animateur 3D / Game Developer'}</div>
      <div class="hcontact">
        ${data.email?`<span>✉ ${data.email}</span>`:''}
        ${data.phone?`<span>✆ ${data.phone}</span>`:''}
        ${data.address?`<span>⊛ ${data.address}</span>`:''}
        ${data.linkedin?`<span>in ${data.linkedin}</span>`:''}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="left">
      ${data.summary?`<div><div class="mh">Profil Créatif</div><div class="summary">${data.summary}</div></div>`:''}
      ${w.length?`<div><div class="mh">Expériences & Productions</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
      ${data.education?.degree?`<div><div class="mh">Formation</div><div class="edu"><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div></div>`:''}
    </div>
    <div class="right">
      ${data.skills?.length?`<div><div class="mh">Outils & Moteurs</div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div>`:''}
      ${data.languages?.length?`<div><div class="mh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
      ${data.certifications?.length?`<div><div class="mh">Certifications</div>${data.certifications.map((c:string)=>`<div class="cert">${c}</div>`).join('')}</div>`:''}
    </div>
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T48 — Artiste / Musicien / Comédien (#0a0a0a Black+Gold, Layout C dark)
function generateCVHtml48(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const bg = '#0a0a0a'; const acc = '#d4a017';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:${bg}">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;font-size:11px;color:#e0d8c8;background:#050505;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:${bg};box-shadow:0 2px 40px rgba(212,160,23,.1)}
    .hdr{padding:40px 40px 28px;border-bottom:1px solid #2a2010;display:flex;align-items:center;gap:28px}
    .av{width:88px;height:88px;border-radius:50%;background:${acc};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:2px solid ${acc}}
    .hname{font-size:24px;font-weight:700;color:#fff;letter-spacing:1px;font-family:'Georgia',serif}
    .htitle{font-size:10px;color:${acc};text-transform:uppercase;letter-spacing:2px;margin-top:6px;font-family:'Segoe UI',sans-serif;font-weight:600}
    .hline{width:48px;height:2px;background:${acc};margin:10px 0}
    .hcontact{display:flex;gap:16px;font-size:9.5px;color:#6b5f40;flex-wrap:wrap;font-family:'Segoe UI',sans-serif}
    .body{display:grid;grid-template-columns:1fr 185px;gap:0;min-height:900px}
    .left{padding:28px 24px 28px 40px;display:flex;flex-direction:column;gap:22px;border-right:1px solid #1a1508}
    .right{padding:28px 18px;display:flex;flex-direction:column;gap:18px;background:#0e0c08}
    .mh{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${acc};margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #2a2010;font-family:'Segoe UI',sans-serif}
    .summary{font-size:11px;color:#8a7f6c;line-height:1.8;font-family:'Georgia',serif}
    .job{margin-bottom:14px}
    .jtitle{font-weight:700;color:#f5f0e8;font-size:11.5px;font-family:'Segoe UI',sans-serif}
    .jmeta{font-size:10px;color:${acc};margin-bottom:4px;font-weight:600;font-family:'Segoe UI',sans-serif}
    .jbullet{font-size:10.5px;color:#8a7f6c;line-height:1.6;font-family:'Segoe UI',sans-serif}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:14px}
    .jbullet li:before{content:'◆';position:absolute;left:0;color:${acc};font-size:7px;top:3px}
    .skill-chip{display:inline-block;background:#1a1508;border:1px solid #2a2010;border-radius:2px;padding:3px 8px;margin:2px;font-size:9px;color:#d4c89a;font-family:'Segoe UI',sans-serif}
    .lang{font-size:10px;color:#8a7f6c;margin-bottom:4px;font-family:'Segoe UI',sans-serif}
    .cert{font-size:10px;color:#8a7f6c;margin-bottom:4px;padding-left:10px;position:relative;font-family:'Segoe UI',sans-serif}
    .cert:before{content:'◆';position:absolute;left:0;color:${acc};font-size:7px;top:3px}
    .edu{margin-bottom:8px}.edl{font-size:11px;color:#e0d8c8;font-weight:600;font-family:'Segoe UI',sans-serif}.edm{font-size:10px;color:#8a7f6c;font-family:'Segoe UI',sans-serif}
    .foot{background:#050505;border-top:1px solid #2a2010;padding:10px 40px;font-size:9px;color:#3a3020;text-align:right;font-family:'Segoe UI',sans-serif}
  </style></head><body><div class="page">
  <div class="hdr">
    <div class="av">${av}</div>
    <div>
      <div class="hname">${data.name}</div>
      <div class="htitle">${data.targetRoles?.[0]||data.sector||'Artiste / Musicien'}</div>
      <div class="hline"></div>
      <div class="hcontact">
        ${data.email?`<span>✉ ${data.email}</span>`:''}
        ${data.phone?`<span>✆ ${data.phone}</span>`:''}
        ${data.address?`<span>⊛ ${data.address}</span>`:''}
        ${data.linkedin?`<span>in ${data.linkedin}</span>`:''}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="left">
      ${data.summary?`<div><div class="mh">Biographie Artistique</div><div class="summary">${data.summary}</div></div>`:''}
      ${w.length?`<div><div class="mh">Œuvres & Productions</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
      ${data.education?.degree?`<div><div class="mh">Formation Artistique</div><div class="edu"><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div></div>`:''}
    </div>
    <div class="right">
      ${data.skills?.length?`<div><div class="mh">Disciplines</div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div>`:''}
      ${data.languages?.length?`<div><div class="mh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
      ${data.certifications?.length?`<div><div class="mh">Récompenses & Titres</div>${data.certifications.map((c:string)=>`<div class="cert">${c}</div>`).join('')}</div>`:''}
    </div>
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T49 — Vétérinaire / Clinique Animale (#14532d Earth Green, Layout A)
function generateCVHtml49(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const clr = '#14532d';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:#fff">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1c1c1c;background:#f2f8f4;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:#fff;display:grid;grid-template-columns:220px 1fr;box-shadow:0 2px 20px rgba(0,0,0,.08)}
    .side{background:${clr};color:#fff;padding:28px 18px;display:flex;flex-direction:column;gap:22px}
    .av{width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border:3px solid rgba(255,255,255,.4)}
    .sname{font-size:16px;font-weight:700;text-align:center;line-height:1.3}
    .stitle{font-size:9.5px;text-align:center;color:rgba(210,240,220,.9);margin-top:4px;font-weight:600;letter-spacing:.8px;text-transform:uppercase}
    .sh{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(210,240,220,.6);border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:5px;margin-bottom:8px}
    .si{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:5px;line-height:1.5}
    .skill-chip{display:inline-block;background:rgba(255,255,255,.15);border-radius:3px;padding:3px 8px;margin:2px;font-size:9px;color:#fff}
    .lang{font-size:10px;color:rgba(255,255,255,.9);margin-bottom:4px}
    .main{padding:32px 28px;display:flex;flex-direction:column;gap:20px}
    .mh{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${clr};border-bottom:2px solid ${clr};padding-bottom:4px;margin-bottom:10px}
    .summary{font-size:11px;color:#444;line-height:1.7}
    .job{margin-bottom:12px}
    .jtitle{font-weight:700;color:#111;font-size:11.5px}
    .jmeta{font-size:10px;color:${clr};font-weight:600;margin-bottom:4px}
    .jbullet{font-size:10.5px;color:#444;line-height:1.6}
    .jbullet li{margin-bottom:2px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'▸';position:absolute;left:0;color:${clr}}
    .edu{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
    .edl{font-size:11px;color:#222;font-weight:600}.edm{font-size:10px;color:#666}
    .foot{grid-column:1/-1;background:#edf7f0;border-top:2px solid ${clr};padding:10px 28px;font-size:9px;color:#666;text-align:right}
  </style></head><body><div class="page">
  <div class="side">
    <div><div class="av">${av}</div><div class="sname" style="margin-top:12px">${data.name}</div><div class="stitle">${data.targetRoles?.[0]||data.sector||'Vétérinaire'}</div></div>
    <div><div class="sh">Contact</div>
      ${data.email?`<div class="si">✉ ${data.email}</div>`:''}
      ${data.phone?`<div class="si">✆ ${data.phone}</div>`:''}
      ${data.address?`<div class="si">⊛ ${data.address}</div>`:''}
    </div>
    ${data.skills?.length?`<div><div class="sh">Spécialités Vétérinaires</div><div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div></div>`:''}
    ${data.languages?.length?`<div><div class="sh">Langues</div>${data.languages.map((l:string)=>`<div class="lang">◆ ${l}</div>`).join('')}</div>`:''}
    ${data.certifications?.length?`<div><div class="sh">Habilitations</div>${data.certifications.map((c:string)=>`<div class="si">✓ ${c}</div>`).join('')}</div>`:''}
  </div>
  <div class="main">
    ${data.summary?`<div><div class="mh">Profil Vétérinaire</div><div class="summary">${data.summary}</div></div>`:''}
    ${w.length?`<div><div class="mh">Expériences Cliniques</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
    ${data.education?.degree?`<div><div class="mh">Formation & Doctorat Vétérinaire</div><div class="edu"><div><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''}</div></div><div class="edm">${data.education.year||''}</div></div></div>`:''}
  </div>
  <div class="foot">Généré le ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// T50 — Premium Executive Ultra-Minimal (#111827 Black+Silver, Layout C dark)
function generateCVHtml50(data: Parameters<typeof generateCVHtml>[0]) {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const initials = data.name.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
  const w = Array.isArray(data.work) ? data.work : [];
  const bg = '#111827'; const acc = '#9ca3af';
  const av = data.photo
    ? `<img src="${data.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<span style="font-size:1.5rem;font-weight:800;color:${bg}">${initials||'?'}</span>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#d1d5db;background:#0a0f1a;display:flex;justify-content:center;padding:20px}
    .page{width:794px;min-height:1123px;background:${bg};box-shadow:0 2px 40px rgba(0,0,0,.6)}
    .hdr{padding:40px 44px 30px;border-bottom:1px solid #1f2937;display:flex;align-items:center;gap:28px}
    .av{width:80px;height:80px;border-radius:50%;background:#1f2937;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:2px solid #374151}
    .hname{font-size:23px;font-weight:300;color:#f9fafb;letter-spacing:2px;text-transform:uppercase}
    .htitle{font-size:9.5px;color:${acc};text-transform:uppercase;letter-spacing:2.5px;margin-top:6px;font-weight:400}
    .hline{width:32px;height:1px;background:#374151;margin:12px 0}
    .hcontact{display:flex;gap:18px;font-size:9.5px;color:#6b7280;flex-wrap:wrap}
    .body{display:grid;grid-template-columns:1fr 195px;gap:0;min-height:900px}
    .left{padding:30px 24px 30px 44px;display:flex;flex-direction:column;gap:22px;border-right:1px solid #1f2937}
    .right{padding:30px 20px;display:flex;flex-direction:column;gap:18px;background:#0f172a}
    .mh{font-size:8.5px;font-weight:400;letter-spacing:2.5px;text-transform:uppercase;color:#6b7280;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #1f2937}
    .summary{font-size:11px;color:#9ca3af;line-height:1.8}
    .job{margin-bottom:14px}
    .jtitle{font-weight:500;color:#f3f4f6;font-size:11.5px;letter-spacing:.3px}
    .jmeta{font-size:10px;color:#6b7280;margin-bottom:5px;font-weight:400}
    .jbullet{font-size:10.5px;color:#9ca3af;line-height:1.7}
    .jbullet li{margin-bottom:3px;list-style:none;position:relative;padding-left:12px}
    .jbullet li:before{content:'—';position:absolute;left:0;color:#374151;font-size:10px}
    .skill-chip{display:inline-block;background:#1f2937;border:1px solid #374151;border-radius:2px;padding:3px 9px;margin:2px;font-size:9px;color:#9ca3af;letter-spacing:.3px}
    .lang{font-size:10px;color:#9ca3af;margin-bottom:5px}
    .cert{font-size:10px;color:#9ca3af;margin-bottom:5px;padding-left:10px;position:relative}
    .cert:before{content:'—';position:absolute;left:0;color:#374151}
    .edu{margin-bottom:10px}.edl{font-size:11px;color:#d1d5db;font-weight:500}.edm{font-size:10px;color:#6b7280}
    .foot{background:#0a0f1a;border-top:1px solid #1f2937;padding:10px 44px;font-size:9px;color:#374151;text-align:right;letter-spacing:.5px}
  </style></head><body><div class="page">
  <div class="hdr">
    <div class="av">${av}</div>
    <div>
      <div class="hname">${data.name}</div>
      <div class="htitle">${data.targetRoles?.[0]||data.sector||'Executive'}</div>
      <div class="hline"></div>
      <div class="hcontact">
        ${data.email?`<span>${data.email}</span>`:''}
        ${data.phone?`<span>${data.phone}</span>`:''}
        ${data.address?`<span>${data.address}</span>`:''}
        ${data.linkedin?`<span>${data.linkedin}</span>`:''}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="left">
      ${data.summary?`<div><div class="mh">Executive Summary</div><div class="summary">${data.summary}</div></div>`:''}
      ${w.length?`<div><div class="mh">Professional Experience</div>${w.map((j:WorkEntry)=>`<div class="job"><div class="jtitle">${j.title||''}</div><div class="jmeta">${j.company||''} ${j.startDate?'· '+j.startDate:''} ${j.endDate?' – '+j.endDate:''}</div><ul class="jbullet">${descToBullets(j.description||'')}</ul></div>`).join('')}</div>`:''}
      ${data.education?.degree?`<div><div class="mh">Education</div><div class="edu"><div class="edl">${data.education.degree}</div><div class="edm">${data.education.institution||''} ${data.education.year?'· '+data.education.year:''}</div></div></div>`:''}
    </div>
    <div class="right">
      ${data.skills?.length?`<div><div class="mh">Core Competencies</div>${data.skills.map((sk:string)=>`<span class="skill-chip">${sk}</span>`).join('')}</div>`:''}
      ${data.languages?.length?`<div><div class="mh">Languages</div>${data.languages.map((l:string)=>`<div class="lang">— ${l}</div>`).join('')}</div>`:''}
      ${data.certifications?.length?`<div><div class="mh">Certifications</div>${data.certifications.map((c:string)=>`<div class="cert">${c}</div>`).join('')}</div>`:''}
    </div>
  </div>
  <div class="foot">Generated ${today} · IdeaMap CV Builder</div>
</div></body></html>`;
}

// Smart template selector — routes to the best template per sector/profile
function selectCVTemplate(data: Parameters<typeof generateCVHtml>[0]) {
  const s = (data.sector || '').toLowerCase();
  const exp = (data.experience || '').toLowerCase();
  const roles = (data.targetRoles||[]).join(' ').toLowerCase();
  const isExecutive = /senior|lead|chief|director|manager|directeur|dg|daf|drh|pdg|vp|président|executive/i.test(exp + ' ' + roles);

  // ── Sector-specific matches (most specific first) ──

  // Dentistry → T41 Mint Green
  if (/dentiste|chirurgien.dentiste|orthodontiste|dentaire|dental|chirurgie orale/.test(s)) { return generateCVHtml41(data); }
  // Pharmacy → T42 Dark Green
  if (/pharmacien|officine|pharmacie|médicament|dispensaire/.test(s)) { return generateCVHtml42(data); }
  // Culinary / Gastronomy → T43 Dark Brown-Red
  if (/cuisinier|chef|gastronomie|pâtisserie|restauration|cuisine|traiteur|boulanger/.test(s)) { return generateCVHtml43(data); }
  // Teaching / Coaching / Pedagogy → T44 Purple
  if (/enseignant|professeur|formateur|coach pédago|pédagogie|université|lycée|collège|école|formation professionnelle/.test(s)) { return generateCVHtml44(data); }
  // Translation / Linguistics → T45 Warm Slate
  if (/traducteur|traduction|interprète|interprétation|linguistique|langues|localisat/.test(s)) { return generateCVHtml45(data); }
  // Graphic Design / Illustration → T46 Black+Yellow
  if (/graphiste|illustrateur|design graphique|identité visuelle|print|infographiste/.test(s)) { return generateCVHtml46(data); }
  // 3D / Game / VFX → T47 Purple+Neon
  if (/animateur 3d|jeu.vid[ée]o|game|animation 3d|vfx|motion design|effets sp[ée]ciaux|unreal|unity/.test(s)) { return generateCVHtml47(data); }
  // Performing Arts / Music → T48 Black+Gold
  if (/musicien|artiste|com[ée]dien|th[ée]âtre|cin[ée]ma|performing arts|acteur|danseur|chanteur/.test(s)) { return generateCVHtml48(data); }
  // Veterinary → T49 Earth Green
  if (/v[ée]t[ée]rinaire|animal|[ée]levage|zootechnie|clinique v[ée]t/.test(s)) { return generateCVHtml49(data); }

  // Insurance / Actuarial → T31 Navy+Silver
  if (/assurance|actuariat|actuaire|r[ée]assurance|sinistre|courtage assurance/.test(s)) { return generateCVHtml31(data); }
  // Digital Marketing → T32 Cyan
  if (/marketing digital|growth|seo|sea|e-commerce|inbound|campaign|r[ée]seaux sociaux/.test(s)) { return generateCVHtml32(data); }
  // Clinical Research → T33 Deep Navy
  if (/recherche clinique|essai clinique|pharmacovigilance|aem|emc|ec |biostat|regulatory affairs/.test(s)) { return generateCVHtml33(data); }
  // Sports / Coaching → T34 Scarlet
  if (/sport|coach sportif|coaching|entraîneur|fitness|performance sportive|athlète/.test(s)) { return generateCVHtml34(data); }
  // Events / Wedding → T35 Rose Magenta
  if (/[ée]v[ée]nementiel|mariage|wedding|organisation.*[ée]v[ée]n|traiteur.*[ée]v[ée]n|animation.*event/.test(s)) { return generateCVHtml35(data); }
  // QSE / HSE / Lean → T36 Slate
  if (/qualit[ée]|hse|lean|iso 9001|iso 14001|ohsas|s[ée]curit[ée].*travail|am[ée]lioration continue|six sigma/.test(s)) { return generateCVHtml36(data); }
  // Purchasing / Procurement → T37 Deep Teal
  if (/achat|procurement|sourcing|supply chain|appro|n[ée]go|fournisseur/.test(s)) { return generateCVHtml37(data); }
  // Public Administration → T38 Formal Navy
  if (/administration publique|fonction publique|collectivit[ée]|mairie|pr[ée]fecture|minist[eè]re|service public/.test(s)) { return generateCVHtml38(data); }
  // Tourism / Travel → T39 Warm Orange
  if (/tourisme|voyage|h[ôo]tellerie|accueil|guide touristique|agence de voyage|hospitality/.test(s)) { return generateCVHtml39(data); }
  // Doctor / General Medicine → T40 Medical Blue
  if (/m[ée]decin|clinique|g[ée]n[ée]raliste|sp[ée]cialiste|chirurg|urgentiste|bloc op[ée]ratoire|radiologue/.test(s)) { return generateCVHtml40(data); }

  // ── Broad sector matches ──

  // C-suite Executive (broad sector) → T5 Charcoal Executive
  if (isExecutive && /manage|direct|hr|rh|g[ée]n[ée]ral|gestion|strat[ée]gi|op[ée]ration|coord|admin|supply|logist|achat/.test(s)) { return generateCVHtml5(data); }
  // Finance / Banking / Audit → T1 Navy+Gold
  if (/finance|banque|bank|audit|comptab|fisc|tresor|invest|cfa|ifrs/.test(s)) { return generateCVHtml(data); }
  // Law / Notary / Compliance → T7 Scarlet Prestige
  if (/juridique|notaire|avocat|droit|conseil|compliance|consulting|arbitrage|r[ée]glement/.test(s)) { return generateCVHtml7(data); }
  // Tech / IT / Data / Dev → T4 Classic ATS
  if (/tech|info|digit|data|d[ée]velop|logiciel|s[ée]curit[ée] inf|syst[eè]me|r[ée]seau|cloud|ia|intelligence|web|mobile|devops|cyber|soft|hard/.test(s)) { return generateCVHtml4(data); }
  // Research / PhD / Academia → T8 Academic Pure
  if (/recherche|research|scientifique|doctorat|phd|biologie|chimie|physique|statistique|universit/.test(s)) { return generateCVHtml8(data); }
  // BTP / Engineering / Manufacturing → T9 Steel Engineering
  if (/btp|g[eé]nie|construction|chantier|industri|manufactur|automobile|m[eé]cani|[eé]lectri|travaux|ciment|produc|usine/.test(s)) { return generateCVHtml9(data); }
  // Design / Creative / UX → T10 Creative Vibrant
  if (/design|cr[ée]at|mode|fashion|art|film|photo|brand|content|social media|ui|ux|graph|motion|vid[ée]o|influenc/.test(s)) { return generateCVHtml10(data); }
  // Marketing / Media / Communication → T3 Bold Purple
  if (/market|communication|m[ée]dia|publicit[ée]|[ée]v[ée]nement|event|relations|pr /.test(s)) { return generateCVHtml3(data); }
  // Healthcare / Pharma / Environment → T6 Emerald Healthcare
  if (/sant[ée]|health|pharma|agro|aliment|biologie|environnement|nature|haccp|iso 22/.test(s)) { return generateCVHtml6(data); }
  // Remaining executives → T5
  if (isExecutive) { return generateCVHtml5(data); }

  // Ultra-minimal fallback for unknown/premium contexts → T50
  return generateCVHtml50(data);
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

/* ── CV Advisor floating chat agent ──────────────────────────────────────── */
function CVAdvisor({ sector, experience, summary, skills, step: cvStep }: {
  sector: string; experience: string; summary: string; skills: string[]; step: Step;
}) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [inp, setInp] = useState('');
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const ctx = [
    `Étape: ${cvStep}`,
    `Niveau: ${experience}`,
    `Secteur: ${sector}`,
    skills.length && `Compétences: ${skills.slice(0, 10).join(', ')}`,
    summary && `Résumé: "${summary.slice(0, 180)}"`,
  ].filter(Boolean).join('\n');

  const sys = `Tu es l'Expert RH TalentMap — conseiller carrière senior spécialisé dans le marché de l'emploi marocain, 15 ans d'expérience.
PROFIL DU CANDIDAT:\n${ctx}
RÈGLES: Réponds en français uniquement. Sois direct et concret — donne des exemples copiables immédiatement dans le CV. 2-4 phrases max (sauf si tu réécris un résumé complet). Utilise des verbes d'action forts: développé, piloté, optimisé, géré, coordonné, animé, réalisé. Adapte au marché marocain (BTP, tourisme, agro-alimentaire, tech, finance offshore). Si on demande un résumé: 3 phrases max, percutantes.`;

  const quickActions = [
    {
      label: '✨ Améliore mon résumé',
      q: `Réécris mon résumé professionnel en 3 phrases percutantes pour le marché marocain. Secteur: ${sector}, Niveau: ${experience}${summary ? `. Brouillon: "${summary.slice(0, 150)}"` : ''}. Verbes d'action forts, orienté recruteurs marocains.`,
    },
    {
      label: '⚡ Compétences manquantes',
      q: `Liste 5 compétences clés que je devrais ajouter pour un profil ${experience} en ${sector} au Maroc. Format: une compétence par ligne, sans explication.`,
    },
    {
      label: '📝 Exemple de réalisation',
      q: `Donne-moi un exemple concret de bullet point pour décrire une réalisation professionnelle en ${sector}. Utilise des chiffres, un verbe d'action et un résultat mesurable.`,
    },
    {
      label: '🇲🇦 Optimisé pour le Maroc ?',
      q: `Mon CV est-il bien positionné pour le marché marocain ? Secteur: ${sector}, Niveau: ${experience}${skills.length ? `, Compétences: ${skills.slice(0, 5).join(', ')}` : ''}. Donne 2 conseils concrets d'amélioration.`,
    },
  ];

  const send = async (override?: string) => {
    const msg = override ?? inp;
    if (!msg.trim() || busy) return;
    const history = [...msgs, { role: 'user', content: msg }];
    setMsgs(history);
    if (!override) setInp('');
    setBusy(true);

    const ctrl = new AbortController();
    const deadline = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, system: sys, task: 'fast', max_tokens: 400 }),
        signal: ctrl.signal,
      });
      clearTimeout(deadline);
      const d = await r.json();
      const text = (d.content?.[0]?.text || '').trim();
      setMsgs(p => [...p, { role: 'assistant', content: text || 'Désolé, réessayez dans un instant.' }]);
      if (!open) setUnread(true);
    } catch {
      clearTimeout(deadline);
      setMsgs(p => [...p, { role: 'assistant', content: 'Conseiller momentanément indisponible. Réessayez dans quelques secondes.' }]);
    }
    setBusy(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(p => !p); setUnread(false); }}
        title="Expert RH TalentMap — Conseiller CV"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0B1629,#1B4FD8)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(37,99,235,.5)',
          fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .2s, box-shadow .2s',
        }}>
        {open ? '✕' : '💡'}
        {unread && !open && (
          <div style={{ position: 'absolute', top: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#ef4444', border: '2px solid white' }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 999,
          width: 320, background: 'white', borderRadius: 18,
          boxShadow: '0 8px 48px rgba(10,31,92,.22)', border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          animation: 'advisorFadeUp .25s ease both',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', borderRadius: '18px 18px 0 0', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>👔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Expert RH TalentMap</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>Conseiller CV · Marché marocain</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
          </div>

          {/* Context chips */}
          <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#EFF6FF', color: '#1B4FD8', border: '1px solid #bfdbfe' }}>{experience}</span>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }}>{sector}</span>
          </div>

          {/* Messages */}
          <div style={{ overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260 }}>
            <div style={{ padding: '10px 13px', background: '#EFF6FF', borderRadius: '12px 12px 12px 4px', fontSize: 12, color: '#111827', lineHeight: 1.65 }}>
              Bonjour ! Je suis votre Expert RH. Je peux améliorer votre résumé, suggérer des compétences clés pour <strong>{sector}</strong>, ou vous montrer comment décrire vos expériences. Que puis-je faire pour vous ?
            </div>
            {msgs.map((m, i) => (
              <div key={i} style={{
                padding: '10px 13px', maxWidth: '90%',
                borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: m.role === 'user' ? 'linear-gradient(135deg,#0B1629,#1B4FD8)' : '#EFF6FF',
                color: m.role === 'user' ? 'white' : '#111827',
                fontSize: 12, lineHeight: 1.65,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {busy && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#EFF6FF', borderRadius: 12, width: 'fit-content' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#1B4FD8', animation: `advisorBounce 1s ease ${i * .2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick actions — only shown before first message */}
          {msgs.length === 0 && (
            <div style={{ padding: '4px 12px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {quickActions.map((qa, i) => (
                <button key={i} onClick={() => send(qa.q)} disabled={busy}
                  style={{ padding: '7px 11px', borderRadius: 10, border: '1.5px solid #bfdbfe', background: '#EFF6FF', color: '#1B4FD8', fontSize: 11, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background .15s' }}>
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={inp}
              onChange={e => setInp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Votre question…"
              disabled={busy}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 12, fontFamily: 'inherit', color: '#111827', background: '#f9fafb' }}
            />
            <button onClick={() => send()} disabled={busy || !inp.trim()}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0, background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', color: 'white', fontSize: 16, cursor: 'pointer', opacity: busy || !inp.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              →
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes advisorFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes advisorBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}`}</style>
    </>
  );
}

export default function CandidateUpload() {
  const { user, initialized } = useAuth();
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
  const [workImproving, setWorkImproving] = useState<Set<number>>(new Set());
  const [generatingCV, setGeneratingCV] = useState(false);

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
    if (!initialized) return;
    if (!user || user.role !== 'candidate') { router.push('/login'); return; }
    setName(user.name);
    setEmail(user.email);
    // Load info profile (photo, linkedin, portfolio, phone, address, sector, languages)
    try {
      const stored = localStorage.getItem(`tm_info_${user.idNumber}`);
      if (stored) {
        const info = JSON.parse(stored);
        if (info.photo) setPhoto(info.photo);
        if (info.linkedin) setLinkedin(info.linkedin);
        if (info.portfolio) setPortfolio(info.portfolio);
        if (info.phone) setPhone(info.phone);
        if (info.city) setAddress(info.city);
        if (info.firstName || info.lastName) setName(`${info.firstName || ''} ${info.lastName || ''}`.trim() || user.name);
        if (info.sector) setSector(info.sector.split('/')[0].trim());
        if (info.languages?.length) setLanguages(info.languages);
        if (info.diploma || info.institution || info.graduationYear) {
          setEducation(p => ({
            degree: info.diploma || p.degree,
            institution: info.institution || p.institution,
            year: info.graduationYear || p.year,
          }));
        }
      }
    } catch {}
    // Load previously saved CV data (skills, work, summary, education, certifications, targetRoles)
    try {
      const cvStored = localStorage.getItem(`tm_cv_${user.idNumber}`);
      if (cvStored) {
        const cv = JSON.parse(cvStored);
        if (cv.summary) setSummary(cv.summary);
        if (cv.skills?.length) setSkills(cv.skills);
        if (cv.work?.length) setWork(cv.work);
        if (cv.education?.degree || cv.education?.institution) setEducation(cv.education);
        if (cv.targetRoles?.length) setTargetRoles(cv.targetRoles);
        if (cv.certifications?.length) setCertifications(cv.certifications);
        if (cv.experience) setExperience(cv.experience);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user, router]);

  // Persist CV-specific fields to localStorage so they survive navigation
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`tm_cv_${user.idNumber}`, JSON.stringify({ summary, skills, work, education, targetRoles, certifications, experience }));
    } catch {}
  }, [user, summary, skills, work, education, targetRoles, certifications, experience]);

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

  // Live CV HTML — auto-selects best template per sector
  const cvHtml = useMemo(() => {
    if (!user) return '';
    const cvData = { name, email, phone, address, idNumber: user.idNumber ?? '', summary, skills, languages, experience, sector, work, education, targetRoles, certifications, photo, linkedin, portfolio };
    return selectCVTemplate(cvData);
  }, [user, name, email, phone, address, summary, skills, languages, experience, sector, work, education, targetRoles, certifications, photo, linkedin, portfolio]);

  if (!user || user.role !== 'candidate') return null;

  // ── PDF download — opens browser print dialog directly (no popup) ──────────
  function downloadPDF() {
    if (!cvHtml) return;
    // Inject a hidden iframe so the print dialog opens on the current page
    // instead of a new popup tab (avoids popup blockers, feels instant).
    const blob = new Blob([cvHtml], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    iframe.src = url;
    document.body.appendChild(iframe);
    const cleanup = () => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    };
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch { cleanup(); }
      setTimeout(cleanup, 60000);
    };
    // Safety fallback if onload never fires
    setTimeout(() => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch {}
      setTimeout(cleanup, 60000);
    }, 1500);
  }

  // ── Extract readable text from a PDF binary (no external library) ──
  // Handles both uncompressed streams and FlateDecode (zlib/deflate) compressed streams,
  // which are the standard format produced by Word, LibreOffice, and Acrobat.
  async function extractPdfText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const rawBytes = new Uint8Array(arrayBuffer);
      // Build Latin-1 binary string for regex-based stream discovery
      let binary = '';
      for (let i = 0; i < rawBytes.byteLength; i++) binary += String.fromCharCode(rawBytes[i]);

      const texts: string[] = [];

      // Extract text tokens from BT...ET operator blocks in a decoded PDF content stream
      function extractBtEt(content: string) {
        const blocks = content.match(/BT[\s\S]*?ET/g) || [];
        for (const block of blocks) {
          const parens = block.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g) || [];
          for (const p of parens) {
            const inner = p.slice(1, -1)
              .replace(/\\n/g, '\n').replace(/\\r/g, '\r')
              .replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
            const clean = inner.replace(/[^\x20-\x7E\n\rÀ-ɏ]/g, ' ').trim();
            if (clean.length > 1) texts.push(clean);
          }
        }
      }

      // Pass 1: uncompressed streams (simple/legacy PDFs)
      extractBtEt(binary);

      // Pass 2: FlateDecode compressed streams — standard in modern PDFs (Word, LibreOffice, Acrobat)
      // PDF spec: "stream" keyword → \r\n or \n → compressed bytes → \r?\n → "endstream"
      const streamRe = /stream\r?\n([\s\S]*?)(?:\r?\n)?endstream/g;
      let match;
      while ((match = streamRe.exec(binary)) !== null) {
        const data = match[1];
        if (!data || data.length < 20) continue;

        // Convert binary string slice back to Uint8Array (preserve raw byte values)
        const streamBytes = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) streamBytes[i] = data.charCodeAt(i) & 0xff;

        // Try deflate-raw (PDF default, RFC 1951) then deflate (zlib wrapper, RFC 1950)
        for (const fmt of ['deflate-raw', 'deflate'] as const) {
          try {
            const ds = new DecompressionStream(fmt);
            const writer = ds.writable.getWriter();
            const reader = ds.readable.getReader();
            writer.write(streamBytes);
            writer.close();

            const chunks: Uint8Array[] = [];
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }
            const total = chunks.reduce((a, c) => a + c.length, 0);
            const combined = new Uint8Array(total);
            let off = 0;
            for (const c of chunks) { combined.set(c, off); off += c.length; }
            extractBtEt(new TextDecoder('latin1').decode(combined));
            break; // success — skip the other format
          } catch { /* wrong format or non-deflate stream — try next */ }
        }
      }

      return texts.join(' ').replace(/\s{2,}/g, ' ').trim();
    } catch {
      return '';
    }
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
        // Try client-side text extraction first — works with all AI providers
        const pdfText = await extractPdfText(file);
        if (pdfText.length > 100) {
          // Use plain text — compatible with every provider in the cascade
          msgContent = `Analyse ce CV (PDF, contenu extrait):\n\nFichier: ${file.name}\n\n${pdfText.slice(0, 6000)}`;
        } else {
          // Safe fallback — plain text readable by ALL providers in the cascade.
          // Never send Anthropic binary format here: non-Anthropic providers strip it
          // and the AI receives no content, causing JSON parse failure → error screen.
          msgContent = `Fichier CV reçu: "${file.name}" (PDF — contenu chiffré ou non lisible automatiquement).\n\nGénère un profil vide structuré pour que l'utilisateur puisse le compléter manuellement.\nRetourne UNIQUEMENT ce JSON valide (sans markdown):\n{"name":"","email":"","phone":"","address":"","sector":"","experience":"Mid-Level","skills":[],"summary":"Profil à compléter","work":[],"education":{"degree":"","institution":"","year":""},"languages":[],"targetRoles":[],"certifications":[]}`;
        }
      } else {
        let rawText = '';
        try { rawText = await file.text(); } catch { rawText = file.name; }
        msgContent = `Analyse ce CV:\nFichier: ${file.name}\n${rawText.slice(0, 3000)}`;
      }
    } catch {
      msgContent = `Fichier: ${file.name}`;
    }

    // AI call with 3 retries — any transient API failure gets retried before giving up.
    setProcessStep('enhancing');
    let extracted: any = null;
    let enhanced: any = null;
    const SYS = `Tu es un expert en lecture de CV. Ton unique rôle est d'EXTRAIRE fidèlement les informations présentes dans ce CV — ne jamais inventer, suggérer, ni améliorer.\n\n${MOROCCO_CONTEXT}\n\nEXTRAIS UNIQUEMENT ce qui est EXPLICITEMENT écrit dans le document. Si une information est absente, laisse le champ vide ou utilise un tableau vide []. Ne génère rien.\n\nRetourne UN SEUL objet JSON valide sans markdown, sans backticks, sans texte autour — UNIQUEMENT le JSON:\n{"sector":"secteur principal détecté dans le CV parmi: BTP, Technology, Finance, Marketing, Design, Operations, Data Science, Agro-alimentaire, Tourisme, Healthcare","experience":"Entry-Level|Junior|Mid-Level|Senior|Lead (basé sur les années d'expérience trouvées)","skills":["compétences et outils EXPLICITEMENT mentionnés dans le CV — maximum 15"],"summary":"Accroche professionnelle PERCUTANTE de 3-4 phrases en français basée sur ce qui est dans le CV. Commence par une phrase d'impact. Utilise des verbes d'action forts: développé, piloté, optimisé. Inclure secteur, niveau, valeur ajoutée.","work":[{"company":"nom entreprise TEL QUE DANS LE CV","title":"poste TEL QUE DANS LE CV","startDate":"MM/AAAA tel qu'écrit","endDate":"MM/AAAA ou Présent","description":"2-3 bullets basés sur ce qui est écrit, commençant par un verbe d'action fort"}],"education":{"degree":"diplôme TEL QUE DANS LE CV","institution":"école ou université TEL QUE DANS LE CV","year":"AAAA"},"languages":["seulement les langues EXPLICITEMENT mentionnées dans le CV"],"targetRoles":["postes cibles SI MENTIONNÉS dans le CV — sinon []"],"certifications":["certifications SI PRÉSENTES dans le CV — sinon []"]}`;

    for (let attempt = 0; attempt < 3 && !extracted; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt));
      try {
        const text = await callAI([{ role: 'user', content: msgContent }], SYS, 'json', 950);
        const m = text.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          extracted = parsed;
          enhanced = { summary: parsed.summary, skills: parsed.skills, sector: parsed.sector, experience: parsed.experience, targetRoles: parsed.targetRoles, certifications: parsed.certifications };
        }
      } catch { /* retry */ }
    }

    // If all 3 AI attempts fail, build a minimal profile from extracted PDF text
    // so the user lands on a pre-filled form rather than a dead error screen.
    if (!extracted) {
      const nameGuess = file.name.replace(/\.(pdf|PDF)$/, '').replace(/[_-]/g, ' ').slice(0, 60);
      extracted = { name: nameGuess, email: '', phone: '', address: '', sector: 'Technology', experience: 'Mid-Level', skills: [], summary: '', work: [], education: { degree: '', institution: '', year: '' }, languages: [], targetRoles: [], certifications: [] };
    }

    // Apply extracted + enhanced data to form
    const finalSkills      = enhanced?.skills?.length   ? enhanced.skills   : (extracted.skills || []);
    const finalSummary     = enhanced?.summary           ? enhanced.summary  : (extracted.summary || '');
    const finalExperience  = enhanced?.experience        ? capitalize(enhanced.experience) : capitalize(extracted.experience || 'Mid-Level');
    const finalSector      = enhanced?.sector            ? mapSector(enhanced.sector)      : mapSector(extracted.sector || 'Technology');
    const finalRoles       = enhanced?.targetRoles       || [];
    const finalCerts       = enhanced?.certifications    || [];

    // Identity fields (name/email/phone/address) are NOT overwritten here —
    // they come from the verified tm_info_ profile loaded at init, not from AI extraction.
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
    // Sync candidate CV to Redis so coordinators can match against it
    fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'save_cv',
        cv: {
          id: user!.idNumber,
          status: 'done',
          name: name,
          email: email,
          phone: phone,
          sector: finalSector,
          experience: finalExperience,
          skills: finalSkills,
          summary: finalSummary,
          targetRoles: finalRoles,
          fileName: file.name,
          fileSize: `${Math.round(file.size / 1024)} KB`,
        },
      }),
    }).catch(() => {});
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

  async function improveWorkDescription(index: number) {
    if (workImproving.has(index)) return;
    const w = work[index];
    if (!w.company && !w.title && !w.description) return;
    setWorkImproving(prev => new Set([...prev, index]));
    try {
      const raw = w.description?.trim() || `a travaillé comme ${w.title || 'employé'} chez ${w.company || 'une entreprise'}`;
      const text = await callAI(
        [{ role: 'user', content: `Poste: ${w.title || '?'} chez ${w.company || '?'} (secteur: ${sector})\nDescription brute: "${raw}"\nRéécris en 2-3 bullet points professionnels avec verbes d'action forts et résultats mesurables.` }],
        `Expert RH Maroc. Réécris en 2-3 points courts commençant par un tiret (-) et un verbe d'action fort en français (développé, piloté, optimisé, géré, réalisé, animé, coordonné…). Ajoute des chiffres si possible. Retourne UNIQUEMENT les bullet points, sans titre ni introduction.\n\n${MOROCCO_CONTEXT}`,
        'fast',
        280
      );
      if (text.trim()) setWork(p => p.map((x, xi) => xi === index ? { ...x, description: text.trim() } : x));
    } catch {}
    setWorkImproving(prev => { const n = new Set(prev); n.delete(index); return n; });
  }

  async function preGenerateAndPreview() {
    const hasGoodSummary = summary.trim().length > 60;
    const hasRoles = targetRoles.length > 0;
    if (hasGoodSummary && hasRoles) {
      fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_cv', cv: { id: user!.idNumber, status: 'done', name, email, phone, sector, experience, skills, summary, targetRoles, fileName: 'Template CV', fileSize: 'N/A' } }),
      }).catch(() => {});
      setStep('preview');
      return;
    }

    setGeneratingCV(true);
    const ctx = [
      name && `Nom: ${name}`,
      `Niveau: ${experience}`, `Secteur: ${sector}`,
      skills.length && `Compétences: ${skills.slice(0, 12).join(', ')}`,
      work.some(w => w.company) && `Expériences: ${work.filter(w => w.company).map(w => `${w.title || 'Poste'} chez ${w.company}`).join('; ')}`,
      education.degree && `Formation: ${education.degree}${education.institution ? ' – ' + education.institution : ''}`,
      languages.length && `Langues: ${languages.join(', ')}`,
      !hasGoodSummary && summary.trim() && `Brouillon résumé: "${summary.slice(0, 180)}"`,
    ].filter(Boolean).join('\n');
    let resolvedSummary = summary;
    let resolvedRoles = targetRoles;
    try {
      const text = await callAI(
        [{ role: 'user', content: ctx }],
        `Expert RH senior Maroc. Génère UNIQUEMENT ce JSON valide (sans markdown):\n{"summary":${!hasGoodSummary ? '"accroche 3-4 phrases percutantes verbes action pour recruteur marocain"' : 'null'},"targetRoles":${!hasRoles ? '["poste1","poste2","poste3"]' : 'null'}}\n\n${MOROCCO_CONTEXT}`,
        'fast',
        450
      );
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const p = JSON.parse(m[0]);
        if (p.summary && !hasGoodSummary) { setSummary(p.summary); resolvedSummary = p.summary; }
        if (p.targetRoles?.length && !hasRoles) { setTargetRoles(p.targetRoles.slice(0, 3)); resolvedRoles = p.targetRoles.slice(0, 3); }
      }
    } catch {}
    // Sync to Redis for coordinator matching
    fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'save_cv', cv: { id: user!.idNumber, status: 'done', name, email, phone, sector, experience, skills, summary: resolvedSummary, targetRoles: resolvedRoles, fileName: 'Template CV', fileSize: 'N/A' } }),
    }).catch(() => {});
    setGeneratingCV(false);
    setStep('preview');
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
    <main style={{ minHeight: '100vh', background: '#F6F8FC' }}>
      <nav style={{ background: '#0B1629', height: 60, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,.06)', boxShadow: '0 2px 16px rgba(0,0,0,.35)' }}>
        <Logo size="md" variant="light" />
        <Link href="/candidate" style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

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
                    background: done ? '#10b981' : active ? '#1B4FD8' : '#f3f4f6',
                    color: done || active ? 'white' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: done ? '1rem' : '0.9rem',
                    boxShadow: active ? '0 0 0 4px #EFF6FF' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done ? '✓' : s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: active ? '#1B4FD8' : done ? '#10b981' : '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Étape {s.n}</div>
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
                  background: cvSource === m.id ? '#1B4FD8' : 'white',
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
                    <button style={{ padding: '0.7rem 1.75rem', borderRadius: '9px', background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
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
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#1B4FD8,#10b981)', borderRadius: 4, width: processStep === 'reading' ? '45%' : '80%', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
                      {[
                        { label: '📖 Extraction', done: processStep === 'enhancing' },
                        { label: '🇲🇦 Optimisation', done: false },
                        { label: '✅ CV prêt', done: false },
                      ].map((s, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', fontWeight: 600, color: s.done ? '#10b981' : (processStep === 'reading' && i === 0) || (processStep === 'enhancing' && i === 1) ? '#1B4FD8' : '#9ca3af' }}>
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {processStep === 'error' && (
                  <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '2rem', border: '1.5px solid #fecaca', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❌</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>Impossible d'analyser ce fichier</h3>
                    <p style={{ color: '#7f1d1d', fontSize: '0.85rem', marginBottom: '1rem' }}>Le fichier n'a pas pu être lu automatiquement.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => setProcessStep('idle')} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: '#1B4FD8', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        Réessayer
                      </button>
                      <button onClick={() => { setCvSource('template'); setProcessStep('idle'); }} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'white', color: '#374151', border: '1.5px solid #d1d5db', fontWeight: 600, cursor: 'pointer' }}>
                        Remplir manuellement →
                      </button>
                    </div>
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
                    <button onClick={enhanceSummary} disabled={enhancing} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: enhancing ? '#f3f4f6' : '#EFF6FF', color: enhancing ? '#9ca3af' : '#1B4FD8', border: '1.5px solid #bfdbfe', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      {enhancing ? '⟳ Rédaction…' : '✨ Générer avec l\'IA'}
                    </button>
                  </div>
                  <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Cliquez sur '✨ Générer avec l'IA' ou rédigez votre accroche…" rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                {/* Work */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>🏢 Expériences professionnelles</h2>
                    {work.length < 4 && <button onClick={() => setWork(p => [...p, { company: '', title: '', startDate: '', endDate: '', description: '' }])} style={{ fontSize: '0.8rem', color: '#1B4FD8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Ajouter</button>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {work.map((w, i) => (
                      <div key={i} style={{ padding: '1rem', background: '#F6F8FC', borderRadius: '10px', borderLeft: '3px solid #1B4FD8' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div><label style={lbl}>Entreprise</label><input value={w.company} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, company: e.target.value } : x))} placeholder="Nom de l'entreprise" style={inp} /></div>
                          <div><label style={lbl}>Poste</label><input value={w.title} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))} placeholder="Votre rôle" style={inp} /></div>
                          <div><label style={lbl}>Début</label><input value={w.startDate} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, startDate: e.target.value } : x))} placeholder="Jan 2022" style={inp} /></div>
                          <div><label style={lbl}>Fin</label><input value={w.endDate} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, endDate: e.target.value } : x))} placeholder="Présent" style={inp} /></div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <label style={lbl}>Réalisations</label>
                            <button onClick={() => improveWorkDescription(i)} disabled={workImproving.has(i)}
                              style={{ padding: '0.25rem 0.7rem', borderRadius: '7px', background: workImproving.has(i) ? '#f3f4f6' : '#EFF6FF', color: workImproving.has(i) ? '#9ca3af' : '#1B4FD8', border: '1.5px solid #bfdbfe', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}>
                              {workImproving.has(i) ? '⟳ Rédaction…' : '✨ Réécrire (IA)'}
                            </button>
                          </div>
                          <textarea value={w.description} onChange={e => setWork(p => p.map((x, xi) => xi === i ? { ...x, description: e.target.value } : x))} placeholder="Décrivez vos tâches ou réalisations — l'IA les transformera en bullet points professionnels." rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                        </div>
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
                    <button onClick={suggestSkillsAI} disabled={suggestingSkills} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: suggestingSkills ? '#f3f4f6' : '#EFF6FF', color: suggestingSkills ? '#9ca3af' : '#1B4FD8', border: '1.5px solid #bfdbfe', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      {suggestingSkills ? '⟳ Suggestions…' : '✨ Suggérer (IA)'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} placeholder="Tapez une compétence + Entrée" style={{ ...inp, flex: 1 }} />
                    <button onClick={() => addSkill(skillInput)} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#1B4FD8', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {skills.map(s => (
                      <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#EFF6FF', color: '#1B4FD8', borderRadius: '9999px', padding: '0.28rem 0.75rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                        {s}<button onClick={() => setSkills(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4FD8', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
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
                    <button onClick={() => { const el = document.getElementById('certIn') as HTMLInputElement; const v = el?.value.trim(); if (v && !certifications.includes(v)) { setCertifications(p => [...p, v]); el.value = ''; } }} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', background: '#1B4FD8', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+</button>
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
                {generatingCV ? (
                  <div style={{ background: 'white', borderRadius: '14px', padding: '2rem', border: '1.5px solid #bfdbfe', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🇲🇦</div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>Finalisation de votre CV…</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.84rem', marginBottom: '1rem' }}>L'Expert RH complète votre profil, génère une accroche et suggère des postes cibles.</p>
                    <div style={{ maxWidth: 380, margin: '0 auto', background: '#e5e7eb', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#0B1629,#1B4FD8)', borderRadius: 4, animation: 'cvBarFill 5s linear forwards' }} />
                    </div>
                    <style>{`@keyframes cvBarFill{from{width:0%}to{width:90%}}`}</style>
                  </div>
                ) : (
                  <button
                    onClick={preGenerateAndPreview}
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(37,99,235,.35)' }}>
                    🇲🇦 Générer mon CV optimisé →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 2: Preview + PDF Download
        ════════════════════════════════════════════════════ */}
        {step === 'preview' && (
          <div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={downloadPDF}
                style={{ flex: '1 1 auto', minWidth: 200, padding: '1rem 2rem', borderRadius: '10px', background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(37,99,235,.35)' }}>
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
              💡 La fenêtre d'impression s'ouvre directement. Choisissez <strong>"Enregistrer en PDF"</strong> pour télécharger votre CV.
            </p>

            {/* CV Preview */}
            <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.12)', border: '1px solid #e5e7eb' }}>
              <div style={{ background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <button onClick={() => setStep('preview')} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1.5px solid #bfdbfe', background: '#EFF6FF', color: '#1B4FD8', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>← Mon CV</button>
                <button onClick={downloadPDF} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#1B4FD8', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>⬇ PDF</button>
              </div>
            </div>

            {(() => {
              const openJobs = coordJobs.filter(j => j.status === 'Open');
              if (!openJobs.length) return (
                <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', border: '1.5px solid #e5e7eb' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Aucune offre disponible pour le moment</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Revenez bientôt — de nouvelles offres sont ajoutées régulièrement.</p>
                  <Link href="/jobs" style={{ display: 'inline-block', marginTop: '1.25rem', padding: '0.65rem 1.5rem', borderRadius: '8px', background: '#1B4FD8', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Voir toutes les offres →</Link>
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
                              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: isAdapting ? '#e5e7eb' : '#1B4FD8', color: isAdapting ? '#9ca3af' : 'white', fontWeight: 700, fontSize: '0.8rem', cursor: adaptingJob ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                              {isAdapting ? '⟳ Adaptation…' : hasAdapted ? '✓ Adapté' : '✨ Adapter mon CV'}
                            </button>
                          </div>
                        </div>

                        {j.skills?.length > 0 && (
                          <div style={{ padding: '0.6rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            {j.skills.map((s: string) => {
                              const matched = skills.some(cs => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()));
                              return <span key={s} style={{ padding: '0.12rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, background: matched ? '#EFF6FF' : '#f3f4f6', color: matched ? '#1B4FD8' : '#9ca3af', border: `1px solid ${matched ? '#bfdbfe' : '#e5e7eb'}` }}>{matched ? '✓ ' : ''}{s}</span>;
                            })}
                          </div>
                        )}

                        {hasAdapted && adaptedCV && (
                          <div style={{ padding: '1.1rem 1.25rem', background: '#f0f9ff', borderTop: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>👔 Version CV adaptée par l'Expert RH</div>
                            <p style={{ fontSize: '0.84rem', color: '#374151', lineHeight: 1.65, marginBottom: '0.65rem', fontStyle: 'italic' }}>{adaptedCV.summary}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                              {adaptedCV.skills.map(s => <span key={s} style={{ padding: '0.18rem 0.65rem', borderRadius: '9999px', background: '#EFF6FF', color: '#1B4FD8', fontSize: '0.74rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>{s}</span>)}
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
                    <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '9px', border: '1.5px solid #1B4FD8', color: '#1B4FD8', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
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
      <CVAdvisor sector={sector} experience={experience} summary={summary} skills={skills} step={step} />
    </main>
  );
}
