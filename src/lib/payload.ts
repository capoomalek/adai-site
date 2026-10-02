import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Admin, Membre } from '@/payload-types'

export const getPayloadClient = cache(() => getPayload({ config }))

export type Acces = 'visiteur' | 'en_attente' | 'membre' | 'admin'

export type Session = {
  user: ((Admin & { collection: 'admins' }) | (Membre & { collection: 'membres' })) | null
  acces: Acces
}

/**
 * Lit le cookie de session (partagé entre le site et le back-office).
 * Mis en cache pour la durée d'une requête : l'en-tête, la page et le pied de page
 * peuvent l'appeler sans multiplier les accès à la base.
 */
export const getSession = cache(async (): Promise<Session> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) return { user: null, acces: 'visiteur' }
  if (user.collection === 'admins') return { user: user as Session['user'], acces: 'admin' }

  const membre = user as Membre
  const verifie =
    membre.verification?.statut === 'verifie' && membre.compteStatut !== 'suspendu'
  return { user: user as Session['user'], acces: verifie ? 'membre' : 'en_attente' }
})

/** Les onglets réservés s'affichent pour les membres vérifiés et les admins. */
export const voitEspacesReserves = (acces: Acces) => acces === 'membre' || acces === 'admin'
