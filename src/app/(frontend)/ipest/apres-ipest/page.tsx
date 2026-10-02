import type { Metadata } from 'next'

import { ContenuAVenir, EnTetePage } from '@/components/contenu/Section'
import { TexteRiche } from '@/components/contenu/TexteRiche'
import { getPagesIpest } from '@/lib/contenu'

export const metadata: Metadata = { title: 'Après l’IPEST' }

/** Section 4.3.5 : écoles accessibles, regroupées par concours, et écoles boursières. */
export default async function PageApresIpest() {
  const { apresIpest } = await getPagesIpest()
  const ecoles = apresIpest?.ecoles ?? []

  // Regroupement par concours, dans l'ordre de première apparition dans le back-office
  const parConcours = new Map<string, typeof ecoles>()
  for (const e of ecoles) {
    const cle = e.concours.trim()
    parConcours.set(cle, [...(parConcours.get(cle) ?? []), e])
  }
  const boursieres = ecoles.filter((e) => e.boursiere)

  return (
    <>
      <EnTetePage titre="Après l’IPEST" rubrique="L’IPEST" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <TexteRiche data={apresIpest?.introduction} className="text-lg" />

        {ecoles.length === 0 ? (
          <div className="mt-8">
            <ContenuAVenir>La liste des écoles sera bientôt publiée.</ContenuAVenir>
          </div>
        ) : (
          <div className="mt-12 grid gap-x-12 gap-y-12 md:grid-cols-2">
            {[...parConcours.entries()].map(([concours, liste]) => (
              <section key={concours}>
                <h2 className="border-b-2 border-charcoal pb-2 font-sous-titre text-2xl tracking-wide">{concours}</h2>
                <ul className="mt-3 space-y-2">
                  {liste.map((e) => (
                    <li key={e.id ?? e.nom} className="flex flex-wrap items-baseline gap-x-3">
                      {e.url ? (
                        <a href={e.url} target="_blank" rel="noopener noreferrer" className="hover:text-cornflower hover:underline">
                          {e.nom}
                        </a>
                      ) : (
                        <span>{e.nom}</span>
                      )}
                      {e.boursiere && <span className="bg-banana px-1.5 text-xs font-bold">Boursière</span>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {(boursieres.length > 0 || apresIpest?.lienListeBoursieres) && (
          <section className="mt-16 bg-ghost p-6 sm:p-8">
            <h2 className="font-titre text-3xl">Écoles boursières</h2>
            {boursieres.length > 0 && (
              <p className="mt-4 leading-relaxed">{boursieres.map((e) => e.nom).join(', ')}.</p>
            )}
            {apresIpest?.lienListeBoursieres && (
              <a
                href={apresIpest.lienListeBoursieres}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-bold text-cornflower-700 underline underline-offset-2"
              >
                Consulter la liste officielle
              </a>
            )}
          </section>
        )}
      </div>
    </>
  )
}