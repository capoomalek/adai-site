import Image from 'next/image'

import { CarrouselActualites, type Diapo } from '@/components/accueil/CarrouselActualites'
import { filtreAVenir } from '@/lib/evenements'
import { imageDe } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

const QUINZE_JOURS = 15 * 24 * 60 * 60 * 1000

/**
 * Page d'accueil (section 4.1).
 * Carrousel « Actualités » = « Nos activités » + « ADAI News » (commentaire MM2) :
 *  1. les prochains événements (du plus proche au plus lointain),
 *  2. puis, du plus récent au plus ancien, les actualités et les événements terminés
 *     des 15 derniers jours.
 */
export default async function Accueil() {
  const payload = await getPayloadClient()
  const maintenant = new Date().toISOString()
  const depuis = new Date(Date.now() - QUINZE_JOURS).toISOString()

  const [enTete, actus, evenementsAVenir, evenementsRecents] = await Promise.all([
    payload.findGlobal({ slug: 'en-tete', depth: 1 }),
    payload.find({
      collection: 'actualites',
      where: { and: [{ datePublication: { greater_than_equal: depuis } }, { datePublication: { less_than_equal: maintenant } }] },
      sort: '-datePublication',
      limit: 10,
      depth: 1,
    }),
    payload.find({ collection: 'evenements', where: filtreAVenir(maintenant), sort: 'dateDebut', limit: 5, depth: 1 }),
    payload.find({
      collection: 'evenements',
      where: { and: [{ finEffective: { less_than: maintenant } }, { finEffective: { greater_than_equal: depuis } }] },
      sort: '-dateDebut',
      limit: 5,
      depth: 1,
    }),
  ])

  const diapos: Diapo[] = [
    ...evenementsAVenir.docs.map((e) => ({
      id: `e-${e.id}`,
      titre: e.nom,
      date: e.dateDebut,
      resume: e.description,
      image: imageDe(e.photo, 'carte'),
      lien: `/activites/${e.id}`,
      etiquette: 'Événement à venir',
    })),
    ...[
      ...actus.docs.map((a) => ({
        id: `a-${a.id}`,
        titre: a.titre,
        date: a.datePublication,
        resume: a.resume,
        image: imageDe(a.image, 'carte'),
        lien: a.lien || null,
        etiquette: 'Actualité',
      })),
      ...evenementsRecents.docs.map((e) => ({
        id: `e-${e.id}`,
        titre: e.nom,
        date: e.dateDebut,
        resume: e.description,
        image: imageDe(e.photo, 'carte'),
        lien: `/activites/${e.id}`,
        etiquette: 'Événement',
      })),
    ].sort((x, y) => y.date.localeCompare(x.date)),
  ]

  // Rien de récent : on garde les 3 dernières actualités plutôt qu'un carrousel vide.
  if (diapos.length === 0) {
    const anciennes = await payload.find({
      collection: 'actualites',
      where: { datePublication: { less_than_equal: maintenant } },
      sort: '-datePublication',
      limit: 3,
      depth: 1,
    })
    for (const a of anciennes.docs) {
      diapos.push({
        id: `a-${a.id}`,
        titre: a.titre,
        date: a.datePublication,
        resume: a.resume,
        image: imageDe(a.image, 'carte'),
        lien: a.lien || null,
        etiquette: 'Actualité',
      })
    }
  }

  const fond = imageDe(enTete.imageDeFond, 'large')

  return (
    <section id="actualites" className="relative isolate flex min-h-[calc(100svh-4rem)] items-center scroll-mt-28 md:min-h-[calc(100svh-6.75rem)]">
      {fond && <Image src={fond.url} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
      <div className={`absolute inset-0 -z-10 ${fond ? 'bg-charcoal/60' : 'bg-charcoal'}`} aria-hidden />

      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="sr-only">Association des Anciens de l’IPEST</h1>
        <CarrouselActualites diapos={diapos} />
      </div>
    </section>
  )
}