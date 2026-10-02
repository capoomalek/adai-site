import Image from 'next/image'
import Link from 'next/link'

import { libelleLieu, libellePrix, libellesPublic, plageHoraire } from '@/lib/evenements'
import { imageDe } from '@/lib/media'
import type { Evenement } from '@/payload-types'

/** Carte cliquable d'un événement (section 4.4). */
export function CarteEvenement({ evenement: e, passe = false }: { evenement: Evenement; passe?: boolean }) {
  const img = imageDe(e.photo, 'carte')
  return (
    <article className="group relative flex h-full flex-col border border-charcoal-100 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-charcoal">
        {img ? (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${passe ? 'grayscale-[40%]' : ''}`}
          />
        ) : (
          <span className="flex h-full items-center justify-center font-titre text-4xl text-white/15" aria-hidden>
            ADAI
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-sous-titre text-lg tracking-wide text-cornflower-700">{plageHoraire(e)}</p>
        <h3 className="mt-1 font-sous-titre text-2xl leading-tight tracking-wide">
          {/* Le lien couvre toute la carte grâce au pseudo-élément */}
          <Link href={`/activites/${e.id}`} className="after:absolute after:inset-0 group-hover:text-cornflower-700">
            {e.nom}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-charcoal/70">{libelleLieu(e)}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-relaxed text-charcoal/85">{e.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className={e.prix === 'gratuit' ? 'bg-banana px-2 py-1' : 'bg-bubblegum px-2 py-1 text-white'}>{libellePrix(e)}</span>
          <span className="bg-cornflower px-2 py-1 text-white">{libellesPublic[e.public]}</span>
        </div>
      </div>
    </article>
  )
}