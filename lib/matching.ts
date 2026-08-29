/**
 * Shared CV ↔ Job matching engine for TalentMap.
 *
 * Weighting follows the platform spec's example scoring:
 *   Skills 40% · Experience 30% · Education 20% · Language 10%
 */

export const EXP_ORDER = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];

// Ranked low → high. Job.educationLevel === '' means "no requirement".
export const EDU_LEVELS = ['Bac', 'Bac+2', 'Licence (Bac+3)', 'Master (Bac+5)', 'Doctorat'];

export const LANGUAGES = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Néerlandais', 'Italien', 'Portugais'];

// Best-effort mapping from a free-text degree (as typed/parsed on the CV) to one
// of EDU_LEVELS, so matching has something to compare against without forcing
// candidates to fill in a second, redundant "education level" dropdown.
export function inferEducationLevel(degreeText: string): string {
  const t = (degreeText || '').toLowerCase();
  if (!t) return '';
  if (/doctorat|phd|ph\.?d/.test(t)) return 'Doctorat';
  if (/master|bac\s*\+?\s*5|ingénieur|ingenieur|mba/.test(t)) return 'Master (Bac+5)';
  if (/licence|bachelor|bac\s*\+?\s*3/.test(t)) return 'Licence (Bac+3)';
  if (/bac\s*\+?\s*2|dut|bts|deug|ofppt/.test(t)) return 'Bac+2';
  if (/baccalauréat|baccalaureat|\bbac\b/.test(t)) return 'Bac';
  return '';
}

export interface MatchCandidate {
  skills: string[];
  experience: string;
  educationLevel?: string;
  languages?: string[];
}

export interface MatchJobRequirements {
  skills: string[];
  experience: string;
  educationLevel?: string;
  languages?: string[];
}

export interface MatchBreakdown {
  total: number;
  skillsPts: number;
  experiencePts: number;
  educationPts: number;
  languagePts: number;
  matchedSkills: string[];
}

export function computeMatch(cv: MatchCandidate, job: MatchJobRequirements): MatchBreakdown {
  // Skills — 40 pts, proportional to required-skill coverage. No required skills → full credit.
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const cvSkills = cv.skills || [];
  const matchedSkills = cvSkills.filter(s =>
    jobSkills.some(js => js.includes(s.toLowerCase()) || s.toLowerCase().includes(js))
  );
  const skillsPts = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 40)
    : 40;

  // Experience — 30 pts, tiered by level distance.
  const expI = EXP_ORDER.indexOf(cv.experience);
  const jobI = EXP_ORDER.indexOf(job.experience);
  const expDiff = expI >= 0 && jobI >= 0 ? Math.abs(expI - jobI) : 3;
  const experiencePts = expDiff === 0 ? 30 : expDiff === 1 ? 18 : expDiff === 2 ? 8 : 0;

  // Education — 20 pts. No requirement → full credit; meets/exceeds → full;
  // one level below → half credit; further below → 0.
  const reqEduI = job.educationLevel ? EDU_LEVELS.indexOf(job.educationLevel) : -1;
  let educationPts = 20;
  if (reqEduI >= 0) {
    const cvEduI = cv.educationLevel ? EDU_LEVELS.indexOf(cv.educationLevel) : -1;
    if (cvEduI >= reqEduI) educationPts = 20;
    else if (cvEduI === reqEduI - 1) educationPts = 10;
    else educationPts = 0;
  }

  // Language — 10 pts, proportional to required-language coverage. No requirement → full credit.
  const jobLangs = job.languages || [];
  const cvLangs = cv.languages || [];
  const langOverlap = cvLangs.filter(l => jobLangs.includes(l));
  const languagePts = jobLangs.length > 0
    ? Math.round((langOverlap.length / jobLangs.length) * 10)
    : 10;

  return {
    total: Math.min(100, skillsPts + experiencePts + educationPts + languagePts),
    skillsPts,
    experiencePts,
    educationPts,
    languagePts,
    matchedSkills,
  };
}

// Only consumed by the coordinator dashboard (app/coordinator/page.tsx),
// which uses a dark theme — values are translucent-tint/light-text pairs
// rather than the light-bg/dark-text pairs a score badge would use on a
// white page.
export function scoreColor(score: number) {
  if (score >= 70) return { bg: 'rgba(34,197,94,.14)', color: '#4ADE80' };
  if (score >= 50) return { bg: 'rgba(59,130,246,.14)', color: '#93C5FD' };
  return { bg: 'rgba(248,113,113,.14)', color: '#FCA5A5' };
}
