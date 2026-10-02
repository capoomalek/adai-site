import Image from 'next/image'
import type { ReactNode } from 'react'

import type { Media } from '@/payload-types'
import { imageDe } from '@/lib/media'

import { TexteRiche } from './TexteRiche'

/** Titre de page, sur bandeau photo si une image est fournie. */
export function EnTetePage({
  titre,
  rubrique,
  photo,
}: {
  titre: string
  rubrique?: string
  photo?: number | Media | null
}) {
  const img = imageDe(photo, 'large')
  if (img) {
    return (
      <div className="relative isolate flex min-h-56 items-end sm:min-h-72">
        <Image src={img.url} alt={img.alt} fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/85 to-charcoal/10" aria-hidden />
        <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
          {rubrique && <p className="font-sous-titre text-lg tracking-wide text-banana">{rubrique}</p>}
          <h1 className="font-titre text-4xl text-white sm:text-5xl">{titre}</h1>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-ghost">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {rubrique && <p className="font-sous-titre text-lg tracking-wide text-cornflower">{rubrique}</p>}
        <h1 className="font-titre text-4xl sm:text-5xl">{titre}</h1>
      </div>
    </div>
  )
}

/** Bloc « Photo + Texte » des maquettes (Qui sommes-nous, Histoire, Campus…). */
export function BlocPhotoTexte({
  titre,
  texte,
  photo,
  legende,
  inverse = false,
  niveau = 'h2',
  children,
}: {
  titre?: string | null
  texte?: unknown
  photo?: number | Media | null
  legende?: string | null
  inverse?: boolean
  niveau?: 'h1' | 'h2'
  children?: ReactNode
}) {
  const img = imageDe(photo, 'carte')
  const Titre = niveau
  return (
    <div className={`grid items-center gap-8 md:gap-12 ${img ? 'md:grid-cols-2' : ''}`}>
      {img && (
        <figure className={inverse ? 'md:order-2' : ''}>
          <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-100">
            <Image src={img.url} alt={img.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
          </div>
          {legende && <figcaption className="mt-2 text-sm text-charcoal/65">{legende}</figcaption>}
        </figure>
      )}
      <div className={inverse ? 'md:order-1' : ''}>
        {titre && <Titre className="font-titre text-3xl sm:text-4xl">{titre}</Titre>}
        <TexteRiche data={texte} className={titre ? 'mt-5' : ''} />
        {children}
      </div>
    </div>
  )
}

/** Message affiché tant que le bureau n'a pas rempli une section dans le back-office. */
export function ContenuAVenir({ children = 'Ce contenu sera bientôt publié.' }: { children?: ReactNode }) {
  return <p className="border-l-4 border-banana bg-ghost px-4 py-3 text-charcoal/75">{children}</p>
}

/** Tableau responsive : défile horizontalement sur petit écran. */
export function Tableau({ entetes, lignes }: { entetes: string[]; lignes: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-charcoal">
            {entetes.map((e) => (
              <th key={e} scope="col" className="px-3 py-2 font-sous-titre text-lg font-normal tracking-wide">
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i} className="border-b border-charcoal-100">
              {l.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-3 py-2.5 font-bold">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="px-3 py-2.5">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}