import type { Metadata } from 'next'
import Image from 'next/image'

import { BlocPhotoTexte, ContenuAVenir } from '@/components/contenu/Section'
import { aDuTexte, TexteRiche } from '@/components/contenu/TexteRiche'
import { imageDe } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = { title: 'L’Association' }

/** Section 4.2 : une seule page, trois sections atteintes par ancres depuis le menu. */
export default async function PageAssociation() {
  const payload = await getPayloadClient()
  const [page, parametres] = await Promise.all([
    payload.findGlobal({ slug: 'page-association', depth: 1 }),
    payload.findGlobal({ slug: 'parametres' }),
  ])
  const { quiSommesNous, pourquoiAdherer, equipe } = page
  const membres = equipe?.membres ?? []

  return (
    <>
      <section id="qui-sommes-nous" className="scroll-mt-28 bg-ghost">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <BlocPhotoTexte niveau="h1" titre={quiSommesNous?.titre} texte={quiSommesNous?.texte} photo={quiSommesNous?.photo}>
            {!aDuTexte(quiSommesNous?.texte) && (
              <div className="mt-5">
                <ContenuAVenir />
              </div>
            )}
          </BlocPhotoTexte>
        </div>
      </section>

      <section id="pourquoi-adherer" className="scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-titre text-3xl sm:text-4xl">Pourquoi adhérer ?</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-2xl text-cornflower">Rejoindre le réseau</h3>
              {aDuTexte(pourquoiAdherer?.texte) ? (
                <TexteRiche data={pourquoiAdherer?.texte} className="mt-3" />
              ) : (
                <div className="mt-3">
                  <ContenuAVenir />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl text-cornflower">À quoi sert la cotisation ?</h3>
              {aDuTexte(pourquoiAdherer?.cotisation) ? (
                <TexteRiche data={pourquoiAdherer?.cotisation} className="mt-3" />
              ) : (
                <div className="mt-3">
                  <ContenuAVenir />
                </div>
              )}
            </div>
          </div>
          {parametres.lienCotisation && (
            <a
              href={parametres.lienCotisation}
              className="mt-10 inline-flex h-12 items-center bg-charcoal px-8 font-sous-titre text-xl tracking-wide text-white transition-colors hover:bg-charcoal-900"
            >
              Je cotise
            </a>
          )}
        </div>
      </section>

      <section id="equipe" className="scroll-mt-28 bg-ghost">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-titre text-3xl sm:text-4xl">L’équipe</h2>
          {membres.length === 0 ? (
            <div className="mt-8">
              <ContenuAVenir>La composition du bureau sera bientôt publiée.</ContenuAVenir>
            </div>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {membres.map((m) => {
                const img = imageDe(m.photo, 'vignette')
                return (
                  <li key={m.id ?? `${m.prenom}-${m.nom}`} className="text-center">
                    <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-full border-2 border-charcoal bg-white sm:w-36">
                      {img ? (
                        <Image src={img.url} alt={img.alt || `${m.prenom} ${m.nom}`} fill sizes="144px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center font-sous-titre text-4xl text-charcoal/40" aria-hidden>
                          {m.prenom.charAt(0)}
                          {m.nom.charAt(0)}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 font-sous-titre text-lg tracking-wide text-cornflower">{m.poste}</p>
                    <p className="font-bold">
                      {m.prenom} {m.nom}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}