import type { Metadata } from 'next'
import Link from 'next/link'

import { BlocPhotoTexte, ContenuAVenir } from '@/components/contenu/Section'
import { aDuTexte } from '@/components/contenu/TexteRiche'
import { getPagesIpest } from '@/lib/contenu'
import { onglets } from '@/lib/navigation'

export const metadata: Metadata = { title: 'L’IPEST' }

const descriptions: Record<string, string> = {
  '/ipest/histoire': 'Les origines de l’institut, ses dates clés et ses figures.',
  '/ipest/campus': 'Salles de cours, laboratoires, internat, restaurant : la vie sur place.',
  '/ipest/admission-et-cursus': 'Comment entrer à l’IPEST et comment s’organisent les filières.',
  '/ipest/concours': 'Les concours des grandes écoles et leurs sites officiels.',
  '/ipest/apres-ipest': 'Les écoles accessibles à l’issue des classes préparatoires.',
}

/** Section 4.3 : page introductive de la rubrique. */
export default async function PageIpest() {
  const { presentation } = await getPagesIpest()
  const sousPages = (onglets.find((o) => o.base === '/ipest')?.sousLiens ?? []).filter((l) => l.href !== '/ipest')

  return (
    <>
      <section className="bg-ghost">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <BlocPhotoTexte
            niveau="h1"
            titre="Institut Préparatoire aux Études Scientifiques et Techniques"
            texte={presentation?.texte}
            photo={presentation?.photo}
            inverse
          >
            {!aDuTexte(presentation?.texte) && (
              <div className="mt-5">
                <ContenuAVenir />
              </div>
            )}
          </BlocPhotoTexte>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="sr-only">Découvrir l’IPEST</h2>
        <ul className="grid gap-px overflow-hidden border border-charcoal-100 bg-charcoal-100 sm:grid-cols-2 lg:grid-cols-3">
          {sousPages.map((l) => (
            <li key={l.href} className="bg-white">
              <Link href={l.href} className="group block h-full p-6 transition-colors hover:bg-ghost">
                <span className="font-sous-titre text-2xl tracking-wide group-hover:text-cornflower">{l.libelle}</span>
                <span className="mt-2 block text-charcoal/75">{descriptions[l.href]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}