/**
 * Free CV Health Check for TalentMap.
 *
 * Deterministic, zero-AI-dependency scoring so every candidate gets instant,
 * reliable feedback on their CV even if the AI provider cascade is degraded —
 * this only reads the same fields already collected by the CV builder.
 *
 * Rubric (100 pts total): Contact 10 · Résumé 15 · Expérience 25 ·
 * Compétences 15 · Formation 10 · Langues 10 · Ciblage & extras 15.
 */

import type { WorkEntry, Education } from './cvTemplate';

// Common French CV action/impact verbs — a résumé or bullet point built
// around one of these reads as an achievement rather than a duty list.
const ACTION_VERBS = [
  'développé', 'développer', 'piloté', 'piloter', 'optimisé', 'optimiser',
  'géré', 'gérer', 'coordonné', 'coordonner', 'animé', 'animer', 'réalisé', 'réaliser',
  'dirigé', 'diriger', 'conçu', 'concevoir', 'augmenté', 'augmenter', 'réduit', 'réduire',
  'amélioré', 'améliorer', 'lancé', 'lancer', 'supervisé', 'superviser', 'négocié', 'négocier',
  'formé', 'former', 'encadré', 'encadrer', 'automatisé', 'automatiser', 'structuré', 'structurer',
  'généré', 'générer', 'atteint', 'atteindre', 'dépassé', 'dépasser', 'mis en place', 'créé', 'créer',
];

export interface CVScoreInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  skills: string[];
  languages: string[];
  work: WorkEntry[];
  education: Education;
  targetRoles?: string[];
  certifications?: string[];
  linkedin?: string;
  portfolio?: string;
}

export interface CVScoreCategory {
  key: string;
  label: string;
  points: number;
  max: number;
}

export interface CVScoreTip {
  id: string;
  text: string;
  impact: number; // points recoverable by acting on this tip
}

export interface CVScoreResult {
  total: number;
  band: 'excellent' | 'bon' | 'moyen' | 'faible';
  categories: CVScoreCategory[];
  tips: CVScoreTip[];
}

const hasDigit = (s: string) => /\d/.test(s);
const hasActionVerb = (s: string) => {
  const t = s.toLowerCase();
  return ACTION_VERBS.some(v => t.includes(v));
};

export function scoreCV(cv: CVScoreInput): CVScoreResult {
  const tips: CVScoreTip[] = [];
  const categories: CVScoreCategory[] = [];

  // ── Contact & identité (10) ──
  let contactPts = 0;
  if (cv.name?.trim()) contactPts += 2;
  if (cv.email?.trim()) contactPts += 2;
  if (cv.phone?.trim()) contactPts += 3; else tips.push({ id: 'phone', text: 'Ajoutez un numéro de téléphone — les recruteurs marocains appellent souvent avant d\'écrire.', impact: 3 });
  if (cv.address?.trim()) contactPts += 3; else tips.push({ id: 'address', text: 'Indiquez votre ville — de nombreux postes filtrent par proximité géographique.', impact: 3 });
  categories.push({ key: 'contact', label: 'Contact & identité', points: contactPts, max: 10 });

  // ── Résumé professionnel (15) ──
  let summaryPts = 0;
  const summary = (cv.summary || '').trim();
  if (summary) {
    summaryPts += 5;
    if (summary.length >= 60 && summary.length <= 500) summaryPts += 5;
    else tips.push({ id: 'summary-length', text: summary.length < 60 ? 'Votre résumé est trop court — visez 2 à 3 phrases percutantes (60-500 caractères).' : 'Votre résumé est trop long — condensez-le en 2-3 phrases percutantes.', impact: 5 });
    if (hasActionVerb(summary) || hasDigit(summary)) summaryPts += 5;
    else tips.push({ id: 'summary-verb', text: 'Renforcez votre résumé avec un verbe d\'action (développé, piloté, géré…) ou un chiffre clé.', impact: 5 });
  } else {
    tips.push({ id: 'summary-missing', text: 'Ajoutez un résumé professionnel en tête de CV — c\'est la première chose lue par un recruteur.', impact: 15 });
  }
  categories.push({ key: 'summary', label: 'Résumé professionnel', points: summaryPts, max: 15 });

  // ── Expérience professionnelle (25) ──
  const filledWork = (cv.work || []).filter(w => w.company?.trim() && w.title?.trim());
  let workPts = 0;
  if (filledWork.length === 0) {
    tips.push({ id: 'work-missing', text: 'Ajoutez au moins une expérience professionnelle (ou un stage/projet académique si vous débutez).', impact: 10 });
  } else {
    workPts += filledWork.length >= 3 ? 10 : filledWork.length === 2 ? 8 : 6;
    const withDesc = filledWork.filter(w => (w.description || '').trim().length >= 40);
    workPts += Math.round((withDesc.length / filledWork.length) * 8);
    if (withDesc.length < filledWork.length) tips.push({ id: 'work-desc', text: 'Détaillez chaque expérience avec 1 à 3 phrases décrivant vos missions concrètes.', impact: 8 - Math.round((withDesc.length / filledWork.length) * 8) });
    const quantified = filledWork.some(w => hasDigit(w.description || ''));
    if (quantified) workPts += 7;
    else tips.push({ id: 'work-quantify', text: 'Chiffrez au moins une réalisation (ex : "augmenté les ventes de 20%", "géré une équipe de 8 personnes").', impact: 7 });
  }
  categories.push({ key: 'work', label: 'Expérience professionnelle', points: workPts, max: 25 });

  // ── Compétences (15) ──
  const skillCount = (cv.skills || []).length;
  const skillsPts = skillCount === 0 ? 0 : skillCount <= 3 ? 6 : skillCount <= 7 ? 12 : 15;
  if (skillCount === 0) tips.push({ id: 'skills-missing', text: 'Ajoutez au moins 5 compétences clés liées à votre secteur.', impact: 15 });
  else if (skillCount < 5) tips.push({ id: 'skills-few', text: `Vous n'avez que ${skillCount} compétence${skillCount > 1 ? 's' : ''} — ajoutez-en jusqu'à 8-10 pour couvrir plus d'offres.`, impact: 15 - skillsPts });
  categories.push({ key: 'skills', label: 'Compétences', points: skillsPts, max: 15 });

  // ── Formation (10) ──
  let eduPts = 0;
  if (cv.education?.degree?.trim()) eduPts += 5; else tips.push({ id: 'edu-degree', text: 'Renseignez votre diplôme le plus élevé.', impact: 5 });
  if (cv.education?.institution?.trim()) eduPts += 3;
  if (cv.education?.year?.trim()) eduPts += 2;
  categories.push({ key: 'education', label: 'Formation', points: eduPts, max: 10 });

  // ── Langues (10) ──
  const langCount = (cv.languages || []).length;
  const langPts = langCount === 0 ? 0 : langCount === 1 ? 5 : 10;
  if (langCount < 2) tips.push({ id: 'languages', text: langCount === 0 ? 'Ajoutez les langues que vous parlez (le français et l\'anglais sont très demandés au Maroc).' : 'Ajoutez une deuxième langue si possible — l\'anglais est très valorisé dans le numérique et les multinationales.', impact: 10 - langPts });
  categories.push({ key: 'languages', label: 'Langues', points: langPts, max: 10 });

  // ── Ciblage & extras (15) ──
  let extraPts = 0;
  if ((cv.targetRoles || []).length > 0) extraPts += 5; else tips.push({ id: 'target-roles', text: 'Précisez le ou les postes que vous visez — un CV ciblé convertit mieux qu\'un CV générique.', impact: 5 });
  if ((cv.certifications || []).length > 0) extraPts += 5;
  if (cv.linkedin?.trim() || cv.portfolio?.trim()) extraPts += 5; else tips.push({ id: 'links', text: 'Ajoutez votre profil LinkedIn ou un portfolio — cela rassure les recruteurs et enrichit votre candidature.', impact: 5 });
  categories.push({ key: 'extras', label: 'Ciblage & extras', points: extraPts, max: 15 });

  const total = categories.reduce((s, c) => s + c.points, 0);
  const band: CVScoreResult['band'] = total >= 85 ? 'excellent' : total >= 65 ? 'bon' : total >= 40 ? 'moyen' : 'faible';

  tips.sort((a, b) => b.impact - a.impact);

  return { total, band, categories, tips };
}

export function scoreBandStyle(band: CVScoreResult['band']) {
  switch (band) {
    case 'excellent': return { bg: '#f0fdf4', border: '#86efac', color: '#15803d', ring: '#22c55e' };
    case 'bon':       return { bg: '#eff6ff', border: '#bfdbfe', color: '#1B4FD8', ring: '#1B4FD8' };
    case 'moyen':     return { bg: '#fefce8', border: '#fde68a', color: '#92400e', ring: '#eab308' };
    default:          return { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', ring: '#ef4444' };
  }
}
