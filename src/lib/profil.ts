/** Listes partagées par le formulaire de profil, « Mon espace » et (bientôt) l'annuaire. */

export const DISPONIBILITES = [
  { value: 'tres_ouvert', label: 'Très ouvert', detail: 'toujours partant pour un café virtuel ou réel' },
  { value: 'ouvert', label: 'Ouvert', detail: 'volontiers pour un message' },
  { value: 'peu_ouvert', label: 'Pas très ouvert', detail: 'un peu pris en ce moment' },
] as const

export type Disponibilite = (typeof DISPONIBILITES)[number]['value']

export const SECTEURS = [
  'Ingénierie et industrie',
  'Informatique et logiciel',
  'Data et intelligence artificielle',
  'Finance et assurance',
  'Conseil',
  'Recherche et enseignement',
  'Énergie et environnement',
  'Télécommunications',
  'Santé',
  'Entrepreneuriat',
  'Secteur public',
  'Études en cours',
  'Autre',
] as const

export const libelleDisponibilite = (v?: string | null) => DISPONIBILITES.find((d) => d.value === v)

export const MAX_ENTREPRISES = 15
export const TAILLE_MAX_PHOTO = 3 * 1024 * 1024

/** URL (relative) de la vignette d'une photo de profil peuplée. */
export function urlPhotoProfil(photo: unknown): string | null {
  if (!photo || typeof photo !== 'object') return null
  const p = photo as { url?: string | null; sizes?: { avatar?: { url?: string | null } } }
  const url = p.sizes?.avatar?.url || p.url
  if (!url) return null
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  return site && url.startsWith(site) ? url.slice(site.length) : url
}