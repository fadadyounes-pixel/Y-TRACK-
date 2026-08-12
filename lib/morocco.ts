/**
 * Morocco administrative divisions used across TalentMap's candidate profile.
 *
 * Three-level hierarchy for Casablanca-Settat, the region most candidates
 * are concentrated in (a plain city name is too coarse for a recruiter to
 * act on there):
 *
 *   Région (12, 2015 redistricting)
 *     └─ Préfecture / Province (Casablanca-Settat only — 9 subdivisions,
 *        verified against HCP / Ministère de l'Aménagement du Territoire:
 *        2 préfectures [Casablanca, Mohammédia] + 7 provinces [Settat,
 *        El Jadida, Benslimane, Médiouna, Nouaceur, Berrechid, Sidi Bennour])
 *          └─ Arrondissement (Casablanca préfecture only — the city itself
 *             is split into 8 préfectures d'arrondissements)
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

export const PREFECTURE_CASABLANCA = 'Casablanca';

export const ARRONDISSEMENTS_CASABLANCA = [
  'Aïn Chock', 'Aïn Sebaâ-Hay Mohammadi', 'Al Fida-Mers Sultan',
  "Ben M'Sick", 'Casablanca-Anfa', 'Hay Hassani', 'Moulay Rachid', 'Sidi Bernoussi',
];

export function prefecturesFor(region: string): string[] {
  return region === CASABLANCA_SETTAT ? PREFECTURES_CASABLANCA_SETTAT : [];
}

export function arrondissementsFor(prefecture: string): string[] {
  return prefecture === PREFECTURE_CASABLANCA ? ARRONDISSEMENTS_CASABLANCA : [];
}

export function regionDisplay(region?: string, prefecture?: string, arrondissement?: string): string {
  if (!region) return '';
  const parts = [region, prefecture, arrondissement].filter(Boolean);
  return parts.join(' — ');
}
