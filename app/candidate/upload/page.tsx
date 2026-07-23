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

  // Live CV HTML — always Navy & Gold (best template)
  const cvHtml = useMemo(() => {
    if (!user) return '';
    const cvData = { name, email, phone, address, idNumber: user.idNumber ?? '', summary, skills, languages, experience, sector, work, education, targetRoles, certifications, photo, linkedin, portfolio };
    return generateCVHtml(cvData);
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
