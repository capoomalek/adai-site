'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { UtilisateurEnTete } from './BarreEnTete'

/** Avatar du membre connecté, ouvrant « Mon espace » et « Déconnexion » (maquette 2). */
export function MenuUtilisateur({ utilisateur, mobile = false }: { utilisateur: UtilisateurEnTete; mobile?: boolean }) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clic = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('mousedown', clic)
    return () => document.removeEventListener('mousedown', clic)
  }, [])

  async function seDeconnecter() {
    setEnCours(true)
    try {
      await fetch(`/api/${utilisateur.collection}/logout`, { method: 'POST', credentials: 'include' })
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  const liens = (
    <>
      {utilisateur.acces === 'en_attente' && (
        <p className="mx-4 mb-2 bg-banana/40 px-3 py-2 text-sm leading-snug">
          Votre appartenance à l’IPEST est en cours de vérification.
        </p>
      )}
      <Link href="/mon-espace" className="block px-4 py-2.5 hover:bg-ghost hover:text-cornflower">
        Mon espace
      </Link>
      {utilisateur.collection === 'admins' && (
        <a href="/admin" className="block px-4 py-2.5 hover:bg-ghost hover:text-cornflower">
          Back-office
        </a>
      )}
      <button
        type="button"
        onClick={seDeconnecter}
        disabled={enCours}
        className="block w-full px-4 py-2.5 text-left text-bubblegum hover:bg-ghost disabled:opacity-60"
      >
        {enCours ? 'Déconnexion…' : 'Déconnexion'}
      </button>
    </>
  )

  const avatar = (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cornflower font-sous-titre text-lg text-white ring-2 ring-white">
      {utilisateur.initiales}
    </span>
  )

  if (mobile) {
    return (
      <div className="text-charcoal">
        <div className="flex items-center gap-3 px-4 pb-2">
          {avatar}
          <span className="font-bold">{utilisateur.nom}</span>
        </div>
        {liens}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-haspopup="menu"
        onClick={() => setOuvert((v) => !v)}
        className="block rounded-full"
      >
        <span className="sr-only">Menu de {utilisateur.nom}</span>
        {avatar}
      </button>
      {ouvert && (
        <div className="absolute right-0 top-full mt-3 w-64 border border-charcoal-100 bg-white py-2 text-charcoal shadow-lg">
          <p className="px-4 pb-2 pt-1 font-bold">{utilisateur.nom}</p>
          {liens}
        </div>
      )}
    </div>
  )
}
