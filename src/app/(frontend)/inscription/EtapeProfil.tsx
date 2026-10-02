'use client'

import { useState } from 'react'

import { passerEtapeProfil } from '@/actions/profil'
import { FormulaireProfil } from '@/components/profil/FormulaireProfil'

import { BoutonEnvoi, Carte } from './ui'

/** Étape 4 (section 4.7) : proposition puis formulaire du profil annuaire, facultatif. */
export function EtapeProfil({ initiales }: { initiales: string }) {
  const [formulaire, setFormulaire] = useState(false)

  if (formulaire) {
    return (
      <Carte titre="Mon profil annuaire" description="Tous les champs sont facultatifs.">
        <FormulaireProfil contexte="inscription" initial={{}} photo={null} initiales={initiales} />
      </Carte>
    )
  }

  return (
    <Carte titre="Créer votre profil dans l’annuaire ?">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center bg-ghost text-cornflower-700" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="4" y="3" width="14" height="18" rx="1" />
            <circle cx="11" cy="10" r="2.5" />
            <path d="M7 16c.8-2 2.2-3 4-3s3.2 1 4 3M20 7v2M20 12v2" />
          </svg>
        </span>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-charcoal/80">
          L’annuaire est un espace privé, visible uniquement par les ipestiens et alumni détenteurs d’un compte. En créant
          votre profil, vous permettez aux membres du réseau de vous retrouver et de vous contacter. Vous pourrez le
          modifier ou le supprimer à tout moment.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <form action={passerEtapeProfil}>
            <BoutonEnvoi secondaire enCours="…">
              Plus tard
            </BoutonEnvoi>
          </form>
          <button
            type="button"
            onClick={() => setFormulaire(true)}
            className="h-11 bg-charcoal px-6 font-sous-titre text-lg tracking-wide text-white transition-colors hover:bg-charcoal-900"
          >
            Créer mon profil
          </button>
        </div>
      </div>
    </Carte>
  )
}