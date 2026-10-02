import { imageDe } from '@/lib/media'
import { ongletsVisibles } from '@/lib/navigation'
import { getPayloadClient, getSession, voitEspacesReserves } from '@/lib/payload'

import { BarreEnTete, type UtilisateurEnTete } from './BarreEnTete'

/** En-tête fixe (section 4.1, maquettes 1 et 2), rendu côté serveur. */
export async function EnTete() {
  const payload = await getPayloadClient()
  const { user, acces } = await getSession()

  const [enTete, parametres] = await Promise.all([
    payload.findGlobal({ slug: 'en-tete', depth: 1 }),
    // overrideAccess: false => le lien WhatsApp n'est renvoyé qu'aux membres vérifiés et aux admins
    payload.findGlobal({ slug: 'parametres', overrideAccess: false, user }),
  ])

  let utilisateur: UtilisateurEnTete | null = null
  if (user) {
    const nomAffiche =
      user.collection === 'admins' ? user.nomComplet : `${user.prenom} ${user.nom}`
    utilisateur = {
      nom: nomAffiche,
      initiales: nomAffiche
        .split(/\s+/)
        .slice(0, 2)
        .map((m) => m.charAt(0).toUpperCase())
        .join(''),
      collection: user.collection,
      acces,
    }
  }

  return (
    <BarreEnTete
      onglets={ongletsVisibles(voitEspacesReserves(acces), parametres.lienWhatsApp)}
      logo={imageDe(enTete.logoBlanc, 'vignette')}
      lienCotisation={parametres.lienCotisation || null}
      lienDon={parametres.lienDon || null}
      utilisateur={utilisateur}
    />
  )
}
