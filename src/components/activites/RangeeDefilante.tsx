'use client'

import { useRef, type ReactNode } from 'react'

/** Rangée horizontale de cartes avec flèches (maquette « Événements à venir »). */
export function RangeeDefilante({ children, libelle }: { children: ReactNode; libelle: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const defiler = (sens: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: sens * el.clientWidth * 0.9, behavior: 'smooth' })
  }
  const fleche = (sens: 1 | -1) => (
    <button
      type="button"
      onClick={() => defiler(sens)}
      aria-label={sens === 1 ? 'Événements suivants' : 'Événements précédents'}
      className="hidden h-11 w-11 shrink-0 items-center justify-center text-charcoal transition-colors hover:text-cornflower sm:flex"
    >
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
        <path d={sens === 1 ? 'M3 2l11 12L3 26' : 'M13 2L2 14l11 12'} />
      </svg>
    </button>
  )

  return (
    <div className="flex items-center gap-2">
      {fleche(-1)}
      <ul
        ref={ref}
        aria-label={libelle}
        className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {children}
      </ul>
      {fleche(1)}
    </div>
  )
}