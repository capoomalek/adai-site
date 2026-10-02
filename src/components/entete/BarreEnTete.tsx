'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { Acces } from '@/lib/payload'
import type { Lien, Onglet } from '@/lib/navigation'

import { MenuUtilisateur } from './MenuUtilisateur'

export type UtilisateurEnTete = {
  nom: string
  initiales: string
  collection: 'admins' | 'membres'
  acces: Acces
}

type Props = {
  onglets: Onglet[]
  logo: { url: string; alt: string } | null
  lienCotisation: string | null
  lienDon: string | null
  utilisateur: UtilisateurEnTete | null
}

const boutonAction =
  'inline-flex h-9 items-center border border-white/80 px-4 font-sous-titre text-[15px] tracking-wide transition-colors hover:bg-white hover:text-charcoal'

function LienNav({ lien, className, onClick }: { lien: Lien; className: string; onClick?: () => void }) {
  if (lien.externe) {
    return (
      <a href={lien.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {lien.libelle}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    )
  }
  return (
    <Link href={lien.href} className={className} onClick={onClick}>
      {lien.libelle}
    </Link>
  )
}

export function BarreEnTete({ onglets, logo, lienCotisation, lienDon, utilisateur }: Props) {
  const pathname = usePathname()
  const [ouvert, setOuvert] = useState<number | null>(null)
  const [menuMobile, setMenuMobile] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Ferme tout à chaque changement de page
  useEffect(() => {
    setOuvert(null)
    setMenuMobile(false)
  }, [pathname])

  // Ferme le sous-menu au clic extérieur et avec Échap
  useEffect(() => {
    const clic = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOuvert(null)
    }
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOuvert(null)
        setMenuMobile(false)
      }
    }
    document.addEventListener('mousedown', clic)
    document.addEventListener('keydown', touche)
    return () => {
      document.removeEventListener('mousedown', clic)
      document.removeEventListener('keydown', touche)
    }
  }, [])

  const estActif = (o: Onglet) => pathname === o.base || pathname.startsWith(`${o.base}/`)

  const actions = (
    <>
      {lienCotisation && (
        <a href={lienCotisation} className={boutonAction}>
          Je cotise
        </a>
      )}
      {lienDon && (
        <a href={lienDon} className={boutonAction}>
          Je fais un don
        </a>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 shadow-[0_1px_0_rgba(46,64,87,0.12)]">
      {/* Bandeau supérieur : logo et actions */}
      <div className="bg-charcoal text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-4" aria-label="ADAI, retour à l’accueil">
            {logo ? (
              <Image src={logo.url} alt="" width={96} height={40} className="h-9 w-auto" priority />
            ) : (
              <span className="font-titre text-3xl leading-none">ADAI</span>
            )}
            <span className="hidden h-7 w-px bg-white/40 sm:block" aria-hidden />
            <span className="hidden font-sous-titre text-[15px] tracking-wide text-white/90 sm:block">
              Association des Anciens de l’IPEST
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {actions}
            {utilisateur ? (
              <MenuUtilisateur utilisateur={utilisateur} />
            ) : (
              <Link
                href="/connexion"
                className="inline-flex h-9 items-center bg-white px-4 font-sous-titre text-[15px] tracking-wide text-charcoal transition-colors hover:bg-ghost"
              >
                Connexion
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center md:hidden"
            aria-expanded={menuMobile}
            aria-controls="menu-mobile"
            onClick={() => setMenuMobile((v) => !v)}
          >
            <span className="sr-only">{menuMobile ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {menuMobile ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Barre des onglets (bureau) */}
      <nav ref={navRef} aria-label="Navigation principale" className="hidden border-b border-charcoal-100 bg-ghost md:block">
        <ul className="mx-auto flex max-w-7xl items-stretch justify-center gap-2 px-6 lg:gap-8">
          {onglets.map((o, i) => {
            const classeOnglet = `relative flex h-11 items-center gap-1.5 px-3 font-sous-titre text-[16px] tracking-wide transition-colors hover:text-cornflower ${
              estActif(o) ? 'text-cornflower after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-cornflower' : 'text-charcoal'
            }`
            if (!o.sousLiens) {
              return (
                <li key={o.base}>
                  <Link href={o.href ?? o.base} className={classeOnglet} aria-current={estActif(o) ? 'page' : undefined}>
                    {o.libelle}
                  </Link>
                </li>
              )
            }
            const estOuvert = ouvert === i
            return (
              <li
                key={o.base}
                className="relative"
                onMouseEnter={() => setOuvert(i)}
                onMouseLeave={() => setOuvert(null)}
              >
                <button
                  type="button"
                  className={classeOnglet}
                  aria-expanded={estOuvert}
                  aria-controls={`sous-menu-${i}`}
                  onClick={() => setOuvert(estOuvert ? null : i)}
                >
                  {o.libelle}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden
                    className={`transition-transform ${estOuvert ? 'rotate-180' : ''}`}
                  >
                    <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <ul
                  id={`sous-menu-${i}`}
                  hidden={!estOuvert}
                  className="absolute left-1/2 top-full min-w-56 -translate-x-1/2 border border-charcoal-100 border-t-2 border-t-cornflower bg-white py-2 shadow-lg"
                >
                  {o.sousLiens.map((l) => (
                    <li key={l.href}>
                      <LienNav
                        lien={l}
                        onClick={() => setOuvert(null)}
                        className="block px-5 py-2.5 text-[15px] text-charcoal transition-colors hover:bg-ghost hover:text-cornflower"
                      />
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Menu mobile */}
      <div
        id="menu-mobile"
        hidden={!menuMobile}
        className="max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-charcoal-100 bg-white md:hidden"
      >
        <nav aria-label="Navigation principale" className="px-4 py-3">
          <ul className="divide-y divide-charcoal-100">
            {onglets.map((o) => (
              <li key={o.base}>
                {o.sousLiens ? (
                  <details className="group" open={estActif(o)}>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-sous-titre text-lg tracking-wide">
                      {o.libelle}
                      <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden className="transition-transform group-open:rotate-180">
                        <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </summary>
                    <ul className="pb-3 pl-3">
                      {o.sousLiens.map((l) => (
                        <li key={l.href}>
                          <LienNav lien={l} className="block py-2 text-charcoal/85 hover:text-cornflower" />
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={o.href ?? o.base} className="block py-3 font-sous-titre text-lg tracking-wide">
                    {o.libelle}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-charcoal-100 pt-4 [&_a]:border-charcoal [&_a]:text-charcoal">
            {actions}
          </div>
          <div className="mt-4 pb-2">
            {utilisateur ? (
              <MenuUtilisateur utilisateur={utilisateur} mobile />
            ) : (
              <Link href="/connexion" className="flex h-11 items-center justify-center bg-charcoal font-sous-titre text-lg tracking-wide text-white">
                Connexion
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
