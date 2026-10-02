'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

export type Diapo = {
  id: string | number
  titre: string
  date: string
  resume: string
  image: { url: string; alt: string } | null
  lien: string | null
  /** « Événement à venir », « Événement », « Actualité » */
  etiquette?: string
}

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Tunis',
})

function Fleche({ sens, onClick, disabled }: { sens: 'prec' | 'suiv'; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={sens === 'prec' ? 'Actualité précédente' : 'Actualité suivante'}
      className="flex h-12 w-12 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-25"
    >
      <svg width="22" height="36" viewBox="0 0 22 36" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden>
        <path d={sens === 'prec' ? 'M18 3L4 18l14 15' : 'M4 3l14 15L4 33'} />
      </svg>
    </button>
  )
}

/**
 * Carrousel « Actualités » (maquettes 1 et 2).
 * Défilement natif (scroll-snap) : balayage tactile sur mobile, flèches et clavier sur ordinateur.
 */
export function CarrouselActualites({ diapos }: { diapos: Diapo[] }) {
  const piste = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const allerA = useCallback((i: number) => {
    const el = piste.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = piste.current
    if (!el) return
    const maj = () => setIndex(Math.round(el.scrollLeft / el.clientWidth))
    el.addEventListener('scroll', maj, { passive: true })
    return () => el.removeEventListener('scroll', maj)
  }, [])

  if (diapos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center border-2 border-white/90 bg-charcoal/85 p-8 text-center text-white sm:aspect-[16/9]">
        <div>
          <h2 className="font-titre text-3xl">Actualités</h2>
          <p className="mt-3 text-white/75">Les prochaines nouvelles de l’association s’afficheront ici.</p>
        </div>
      </div>
    )
  }

  return (
    <section aria-roledescription="carrousel" aria-label="Actualités" className="w-full">
      <div className="flex items-center gap-1 sm:gap-4">
        <div className="hidden sm:block">
          <Fleche sens="prec" onClick={() => allerA(index - 1)} disabled={index === 0} />
        </div>

        <div
          ref={piste}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') allerA(Math.min(index + 1, diapos.length - 1))
            if (e.key === 'ArrowLeft') allerA(Math.max(index - 1, 0))
          }}
          className="flex w-full snap-x snap-mandatory overflow-x-auto border-2 border-white/90 bg-charcoal [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {diapos.map((d, i) => (
            <article
              key={d.id}
              aria-roledescription="diapositive"
              aria-label={`${i + 1} sur ${diapos.length}`}
              className="grid w-full shrink-0 snap-start text-white md:grid-cols-[1.1fr_1fr]"
            >
              <div className="relative aspect-[16/9] bg-charcoal-900 md:aspect-auto md:min-h-[360px]">
                {d.image ? (
                  <Image src={d.image.url} alt={d.image.alt} fill sizes="(min-width: 768px) 460px, 100vw" className="object-cover" priority={i === 0} />
                ) : (
                  <div className="flex h-full items-center justify-center font-titre text-6xl text-white/15" aria-hidden>
                    ADAI
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                                <p className="flex flex-wrap items-center gap-3">
                  {d.etiquette && (
                    <span className="bg-white/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">{d.etiquette}</span>
                  )}
                  <time dateTime={d.date} className="font-sous-titre text-lg tracking-wide text-banana">
                    {formatDate.format(new Date(d.date))}
                  </time>
                </p>
                <h2 className="mt-2 font-titre text-2xl sm:text-3xl">{d.titre}</h2>
                <p className="mt-4 leading-relaxed text-white/80">{d.resume}</p>
                {d.lien &&
                  (d.lien.startsWith('/') ? (
                    <Link href={d.lien} className="mt-6 self-start border-b-2 border-cornflower pb-0.5 font-bold hover:text-cornflower">
                      En savoir plus
                    </Link>
                  ) : (
                    <a href={d.lien} target="_blank" rel="noopener noreferrer" className="mt-6 self-start border-b-2 border-cornflower pb-0.5 font-bold hover:text-cornflower">
                      En savoir plus
                    </a>
                  ))}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden sm:block">
          <Fleche sens="suiv" onClick={() => allerA(index + 1)} disabled={index === diapos.length - 1} />
        </div>
      </div>

      {diapos.length > 1 && (
        <div className="mt-5 flex justify-center gap-2.5">
          {diapos.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => allerA(i)}
              aria-label={`Afficher l’actualité ${i + 1}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
