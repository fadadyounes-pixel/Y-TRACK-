/**
 * Morocco administrative divisions used across TalentMap's candidate profile.
 *
 * REGIONS is the 12-region 2015 redistricting. Only Casablanca-Settat gets a
 * prefecture/province sub-selector for now — it's the region most candidates
 * are concentrated in, and "Casablanca" alone is too coarse for a recruiter
 * to act on.
 *
 * PREFECTURES_CASABLANCA_SETTAT is verified against official sources (HCP /
 * Ministère de l'Aménagement du Territoire): the region comprises exactly
 * 2 préfectures (Casablanca, Mohammédia) + 7 provinces (Settat, El Jadida,
 * Benslimane, Médiouna, Nouaceur, Berrechid, Sidi Bennour) — 9 subdivisions.
 */
export const REGIONS = [
  'Tanger-Tétouan-Al Hoceïma', 'Oriental', 'Fès-Meknès',
  'Rabat-Salé-Kénitra', 'Béni Mellal-Khénifra', 'Casablanca-Settat',
  'Marrakech-Safi', 'Drâa-Tafilalet', 'Souss-Massa',
  'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab',
];

export const CASABLANCA_SETTAT = 'Casablanca-Settat';

export const PREFECTURES_CASABLANCA_SETTAT = [
  'Casablanca', 'Mohammédia', 'Settat', 'El Jadida',
  'Benslimane', 'Médiouna', 'Nouaceur', 'Berrechid', 'Sidi Bennour',
];

export function prefecturesFor(region: string): string[] {
  return region === CASABLANCA_SETTAT ? PREFECTURES_CASABLANCA_SETTAT : [];
}

export function regionDisplay(region?: string, prefecture?: string): string {
  if (!region) return '';
  return prefecture ? `${region} — ${prefecture}` : region;
}
