/**
 * Candidate profile completeness — shared gate used across TalentMap.
 *
 * New candidates must finish the "Mes Informations" page (app/candidate/info)
 * before reaching the dashboard, CV builder, or letter generator, mirroring
 * the mandatory onboarding step used in CareerMap. The same required-field
 * set defined here is what /candidate/info uses to compute its own progress
 * bar, so the gate and the form always agree on what "complete" means.
 */
export interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  sector?: string;
  experience?: string;
  diploma?: string;
  languages?: string[];
}

export function isProfileComplete(p: CandidateProfile | null | undefined): boolean {
  if (!p) return false;
  return !!(
    p.firstName && p.lastName && p.phone && p.city &&
    p.sector && p.experience && p.diploma &&
    p.languages && p.languages.length > 0
  );
}

export function profileStorageKey(idNumber: string): string {
  return `tm_info_${idNumber}`;
}

export function loadStoredProfile(idNumber: string): CandidateProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(profileStorageKey(idNumber));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
