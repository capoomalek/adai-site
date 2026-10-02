import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { TexteRiche } from '@/components/contenu/TexteRiche'
import { estAVenir, libelleLieu, libellePrix, libellesPublic, plageHoraire } from '@/lib/evenements'
import { imageDe } from '@/lib/media'
import { getPayloadClient, getSession } from '@/lib/payload'

type Props = { params: Promise<{ id: string }> }

const getEvenement = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) return null
  const payload = await getPayloadClient()
  return payload.findByID({ collection: 'evenements', id: Number(id), depth: 1, disableErrors: true })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEvenement((await params).id)
  if (!e) return { title: 'Événement introuvable' }
  const img = imageDe(e.photo, 'large')
  return {
    title: e.nom,
    description: e.description,
    openGraph: img ? { images: [img.url] } : undefined,
  }
}

/** Page détaillée d'un événement (commentaire MM8 : texte, galerie photos, informations pratiques). */
export default async function PageEvenement({ params }: Props) {
  const e = await getEvenement((await params).id)
  if (!e) notFound()

  const { acces } = await getSession()
  const aVenir = estAVenir(e)
  const photo = imageDe(e.photo, 'large')
  const galerie = (e.galerie ?? []).map((m) => imageDe(m, 'carte')).filter((m) => m !== null)

  const infos: [string, React.ReactNode][] = [
    ['Date', plageHoraire(e)],
    [
      'Lieu',
      e.enLigne && e.lienVisio && aVenir ? (
        <a href={e.lienVisio} target="_blank" rel="noopener noreferrer" className="text-cornflower-700 underline">
          Rejoindre la visioconférence
        </a>
      ) : (
        libelleLieu(e)
      ),
    ],
    ['Ouvert à', libellesPublic[e.public]],
    ['Prix', libellePrix(e)],
  ]

  return (
    <article>
      <div className="relative isolate flex min-h-64 items-end bg-charcoal sm:min-h-80">
        {photo && <Image src={photo.url} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/10" aria-hidden />
        <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-16 sm:px-6">
          <Link href="/activites" className="font-sous-titre text-lg tracking-wide text-white/80 hover:text-white">
            ← Nos activités
          </Link>
          <p className="mt-4">
            <span className={`px-2 py-1 text-xs font-bold ${aVenir ? 'bg-banana text-charcoal' : 'bg-white/20 text-white'}`}>
              {aVenir ? 'À venir' : 'Événement passé'}
            </span>
          </p>
          <h1 className="mt-3 max-w-4xl font-titre text-4xl text-white sm:text-5xl">{e.nom}</h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="max-w-[68ch] text-lg leading-relaxed">{e.description}</p>
          <TexteRiche data={e.contenu} className="mt-8" />

          {galerie.length > 0 && (
            <section className="mt-12">
              <h2 className="font-sous-titre text-3xl tracking-wide">Galerie</h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {galerie.map((g) => (
                  <li key={g.url}>
                    <a href={g.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden bg-charcoal-100">
                      <Image src={g.url} alt={g.alt} fill sizes="(min-width: 768px) 260px, 50vw" className="object-cover transition-transform hover:scale-[1.03]" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="self-start border-t-4 border-cornflower bg-ghost p-6 lg:sticky lg:top-32">
          <h2 className="font-sous-titre text-2xl tracking-wide">Informations pratiques</h2>
          <dl className="mt-4 space-y-4">
            {infos.map(([terme, valeur]) => (
              <div key={terme}>
                <dt className="text-sm text-charcoal/65">{terme}</dt>
                <dd className="font-bold first-letter:uppercase">{valeur}</dd>
              </div>
            ))}
          </dl>
          {aVenir && e.lienInscription && (
            <a
              href={e.lienInscription}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-12 items-center justify-center bg-charcoal font-sous-titre text-xl tracking-wide text-white hover:bg-charcoal-900"
            >
              S’inscrire
            </a>
          )}
          {acces === 'admin' && (
            <a href={`/admin/collections/evenements/${e.id}`} className="mt-4 block text-center text-sm font-bold text-cornflower-700 underline">
              Modifier dans le back-office
            </a>
          )}
        </aside>
      </div>
    </article>
  )
}