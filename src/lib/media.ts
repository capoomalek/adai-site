import type { Media } from '@/payload-types'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

/**
 * Payload renvoie des URL absolues (http://localhost:3000/api/media/...).
 * On les rend relatives pour que next/image les traite comme des images locales.
 */
function relative(url: string): string {
  if (SITE && url.startsWith(SITE)) return url.slice(SITE.length) || '/'
  return url
}

/** Renvoie l'URL et le texte alternatif d'un champ upload, qu'il soit peuplé ou non. */
export function imageDe(
  champ: number | Media | null | undefined,
  taille?: 'vignette' | 'carte' | 'large',
): { url: string; alt: string } | null {
  if (!champ || typeof champ === 'number') return null
  const url = (taille && champ.sizes?.[taille]?.url) || champ.url
  if (!url) return null
  return { url: relative(url), alt: champ.alt ?? '' }
}
