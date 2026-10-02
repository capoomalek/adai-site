import type { Metadata } from 'next'
import Link from 'next/link'

import { CarteEvenement } from '@/components/activites/CarteEvenement'
import { RangeeDefilante } from '@/components/activites/RangeeDefilante'
import { ContenuAVenir } from '@/components/contenu/Section'
import { filtreAVenir, filtrePasses, filtreRecherche } from '@/lib/evenements'
import { getPayloadClient, getSession } from '@/lib/payload'

export const metadata: Metadata = { title: 'Nos activités' }

const PAR_PAGE = 9

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

/** Section 4.4 : événements à venir, événements passés et recherche. */
export default async function PageActivites({ searchParams }: Props) {
  const { q: brut, page: pageBrute } = await searchParams
  const q = brut?.trim().slice(0, 80) || ''
  const page = Math.max(1, Number.parseInt(pageBrute ?? '1', 10) || 1)
  const maintenant = new Date().toISOString()

  const payload = await getPayloadClient()
  const { acces } = await getSession()
  const recherche = q ? [filtreRecherche(q)] : []

  const [aVenir, passes] = await Promise.all([
    payload.find({
      collection: 'evenements',
      where: { and: [filtreAVenir(maintenant), ...recherche] },
      sort: 'dateDebut', // le plus proche d'abord
      limit: 30,
      depth: 1,
    }),
    payload.find({
      collection: 'evenements',
      where: { and: [filtrePasses(maintenant), ...recherche] },
      sort: '-dateDebut', // le plus récent d'abord
      limit: PAR_PAGE,
      page,
      depth: 1,
    }),
  ])

  const lienPage = (p: number) => `/activites?${new URLSearchParams({ ...(q && { q }), page: String(p) })}#passes`

  return (
    <div className="bg-ghost">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="font-titre text-4xl sm:text-5xl">Nos activités</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {acces === 'admin' && (
              <a
                href="/admin/collections/evenements/create"
                className="inline-flex h-11 items-center justify-center bg-banana px-5 font-sous-titre text-lg tracking-wide text-charcoal hover:brightness-95"
              >
                + Ajouter un événement
              </a>
            )}
            <form role="search" action="/activites" className="flex h-11 w-full border border-charcoal-100 bg-white focus-within:border-cornflower sm:w-80">
              <label htmlFor="recherche" className="sr-only">
                Rechercher une activité
              </label>
              <input
                id="recherche"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Rechercher une activité"
                className="min-w-0 flex-1 bg-transparent px-4 outline-none"
              />
              <button type="submit" className="px-4 text-charcoal hover:text-cornflower" aria-label="Lancer la recherche">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {q && (
          <p className="mt-6">
            Résultats pour « {q} » : {aVenir.totalDocs + passes.totalDocs} activité
            {aVenir.totalDocs + passes.totalDocs > 1 ? 's' : ''}.{' '}
            <Link href="/activites" className="font-bold text-cornflower-700 underline">
              Effacer la recherche
            </Link>
          </p>
        )}

        <section aria-labelledby="titre-a-venir" className="mt-12">
          <h2 id="titre-a-venir" className="font-sous-titre text-3xl tracking-wide">
            Événements à venir
          </h2>
          <div className="mt-6">
            {aVenir.docs.length === 0 ? (
              <ContenuAVenir>{q ? 'Aucun événement à venir ne correspond à votre recherche.' : 'Aucun événement programmé pour le moment. Revenez bientôt !'}</ContenuAVenir>
            ) : (
              <RangeeDefilante libelle="Événements à venir">
                {aVenir.docs.map((e) => (
                  <li key={e.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                    <CarteEvenement evenement={e} />
                  </li>
                ))}
              </RangeeDefilante>
            )}
          </div>
        </section>

        <section id="passes" aria-labelledby="titre-passes" className="mt-16 scroll-mt-32">
          <h2 id="titre-passes" className="font-sous-titre text-3xl tracking-wide">
            Événements passés
          </h2>
          <div className="mt-6">
            {passes.docs.length === 0 ? (
              <ContenuAVenir>{q ? 'Aucun événement passé ne correspond à votre recherche.' : 'Les événements terminés seront archivés ici.'}</ContenuAVenir>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {passes.docs.map((e) => (
                  <li key={e.id}>
                    <CarteEvenement evenement={e} passe />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {passes.totalPages > 1 && (
            <nav aria-label="Pages des événements passés" className="mt-10 flex items-center justify-center gap-6">
              {passes.hasPrevPage ? (
                <Link href={lienPage(page - 1)} className="font-bold text-cornflower-700 hover:underline">
                  ← Plus récents
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-charcoal/70">
                Page {passes.page} sur {passes.totalPages}
              </span>
              {passes.hasNextPage ? (
                <Link href={lienPage(page + 1)} className="font-bold text-cornflower-700 hover:underline">
                  Plus anciens →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}