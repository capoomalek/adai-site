'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const champ =
  'mt-1.5 block h-11 w-full border border-charcoal-100 bg-white px-3 text-charcoal outline-none transition-colors focus:border-cornflower'

export function FormulaireConnexion() {
  const router = useRouter()
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErreur(null)
    setEnCours(true)
    const donnees = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/membres/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: donnees.get('email'), password: donnees.get('password') }),
      })
      if (!res.ok) {
        const corps = await res.json().catch(() => null)
        const message: string | undefined = corps?.errors?.[0]?.message
        if (res.status === 401) setErreur('E-mail ou mot de passe incorrect.')
        else if (res.status === 423 || message?.toLowerCase().includes('lock'))
          setErreur('Trop de tentatives. Réessayez dans 15 minutes.')
        else setErreur(message ?? 'La connexion a échoué. Réessayez dans un instant.')
        return
      }
      router.push('/mon-espace')
      router.refresh()
    } catch {
      setErreur('Impossible de joindre le serveur. Vérifiez votre connexion internet.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <form onSubmit={envoyer} className="mt-8 space-y-5" noValidate={false}>
      <label className="block text-sm font-bold">
        Adresse e-mail
        <input name="email" type="email" required autoComplete="email" className={champ} />
      </label>
      <label className="block text-sm font-bold">
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password" className={champ} />
      </label>

      {erreur && (
        <p role="alert" className="border-l-4 border-bubblegum bg-bubblegum/10 px-3 py-2 text-sm">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="h-11 w-full bg-charcoal font-sous-titre text-lg tracking-wide text-white transition-colors hover:bg-charcoal-900 disabled:opacity-60"
      >
        {enCours ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="border-t border-charcoal-100 pt-5 text-center text-sm">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-bold text-cornflower hover:underline">
          S’inscrire
        </Link>
      </p>
    </form>
  )
}
