import type { Metadata } from 'next'

import { ContenuAVenir, EnTetePage } from '@/components/contenu/Section'
import { TexteRiche } from '@/components/contenu/TexteRiche'
import { getPagesIpest } from '@/lib/contenu'

export const metadata: Metadata = { title: 'Concours Grandes Écoles' }

const domaine = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Section 4.3.4 : liste des concours et de leurs sites. */
export default async function PageConcours() {
  const { concours } = await getPagesIpest()
  const liste = concours?.liste ?? []

  return (
    <>
      <EnTetePage titre="Concours Grandes Écoles" rubrique="L’IPEST" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <TexteRiche data={concours?.introduction} className="text-lg" />
        {liste.length === 0 ? (
          <div className="mt-8">
            <ContenuAVenir>La liste des concours sera bientôt publiée.</ContenuAVenir>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-charcoal-100 border-y border-charcoal-100">
            {liste.map((c) => (
              <li key={c.id ?? c.nom} className="grid gap-2 py-6 md:grid-cols-[16rem_1fr_auto] md:items-baseline md:gap-8">
                <h2 className="font-sous-titre text-2xl tracking-wide">{c.nom}</h2>
                <p className="text-charcoal/80">{c.description}</p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="justify-self-start font-bold text-cornflower-700 underline underline-offset-2 hover:text-charcoal"
                >
                  {domaine(c.url)}
                  <span className="sr-only"> (site officiel de {c.nom}, nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}