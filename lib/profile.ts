/**
 * Candidate profile completeness — shared gate used across TalentMap.
 *
 * New candidates must finish the "Mes Informations" page (app/candidate/info)
 * before reaching the dashboard, CV builder, or letter generator, mirroring
 * the mandatory onboarding step used in CareerMap. The same required-field
 * set defined here is what /candidate/info uses to compute its own progress
 * bar, so the gate and the form always agree on what "complete" means.
 */
import { CASABLANCA_SETTAT } from './morocco';

export interface CandidateProfile {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  age?: string;
  region?: string;
  // One of the 8 préfectures d'arrondissements of Casablanca — only required
  // when region === Casablanca-Settat.
  prefecture?: string;
}

export function isProfileComplete(p: CandidateProfile | null | undefined): boolean {
  if (!p) return false;
  const prefectureOk = p.region === CASABLANCA_SETTAT ? !!p.prefecture : true;
  return !!(
    p.fullName && p.phone && p.email && p.age && p.region && prefectureOk
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
