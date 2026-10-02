'use client'

import { supprimerProfil } from '@/actions/profil'

/** Suppression du profil, avec confirmation. */
export function BoutonSupprimerProfil() {
  return (
    <form
      action={supprimerProfil}
      onSubmit={(e) => {
        if (!window.confirm('Supprimer définitivement votre profil de l’annuaire ? Votre compte reste actif.')) e.preventDefault()
      }}
    >
      <button type="submit" className="text-sm font-bold text-bubblegum hover:underline">
        Supprimer mon profil
      </button>
    </form>
  )
}