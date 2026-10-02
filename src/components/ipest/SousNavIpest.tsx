'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { onglets } from '@/lib/navigation'

/** Navigation secondaire entre les pages de la rubrique IPEST. */
export function SousNavIpest() {
  const pathname = usePathname()
  const liens = onglets.find((o) => o.base === '/ipest')?.sousLiens ?? []

  return (
    <nav aria-label="Rubrique L’IPEST" className="border-b border-charcoal-100 bg-white">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none]">
        {liens.map((l) => {
          const actif = pathname === l.href
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                aria-current={actif ? 'page' : undefined}
                className={`block border-b-2 px-3 py-3 text-[15px] transition-colors ${
                  actif ? 'border-cornflower font-bold text-charcoal' : 'border-transparent text-charcoal/70 hover:text-charcoal'
                }`}
              >
                {l.libelle}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}