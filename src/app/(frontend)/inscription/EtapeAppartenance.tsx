'use client'

import { useState } from 'react'

import { choisirAdresseIpest, envoyerJustificatif, type EtatFormulaire } from './actions'
   import { BoutonEnvoi, Carte, classeChamp, Message, useFormulaire } from './ui'

const grandBouton =
  'flex w-full items-center gap-4 border border-charcoal-100 bg-white p-4 text-left transition-colors hover:border-cornflower hover:bg-ghost'

function Icone({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-ghost text-cornflower-700" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </span>
  )
}

/** Étape 3 (section 4.7) : vérification de l'appartenance, deux options. */
export function EtapeAppartenance({
  adresse,
  ouvrirJustificatif,
  motifRefus,
}: {
  adresse: string
  ouvrirJustificatif: boolean
  motifRefus?: string | null
}) {
  const [justificatif, setJustificatif] = useState(ouvrirJustificatif)
  const { etat, onSubmit, enCours } = useFormulaire<EtatFormulaire>(envoyerJustificatif, null)

  if (justificatif) {
    return (
      <Carte
        titre="Vérifier mon appartenance autrement"
        description="Pour prouver votre appartenance à l’IPEST, vous pouvez rédiger un court texte (lien vers votre profil LinkedIn ou tout autre élément probant) ou joindre un document justificatif (bulletin, attestation de scolarité, etc.). Votre demande sera validée par un administrateur dans les plus brefs délais."
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="justification" className="block text-sm font-bold">
              Votre justification <span className="font-normal text-charcoal/65">(facultatif)</span>
            </label>
            <textarea
              id="justification"
              name="justification"
              rows={4}
              maxLength={2000}
              placeholder="Ex. lien vers votre profil LinkedIn, précisions sur votre parcours…"
              className={`${classeChamp} h-auto py-2`}
            />
          </div>
          <div>
            <label htmlFor="document" className="block text-sm font-bold">
              Document justificatif <span className="font-normal text-charcoal/65">(facultatif)</span>
            </label>
            <p className="mt-0.5 text-xs text-charcoal/65">PDF ou image, 5 Mo maximum.</p>
            <input
              id="document"
              name="document"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="mt-2 block w-full border border-dashed border-charcoal-100 bg-ghost p-4 text-sm file:mr-4 file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-white"
            />
          </div>
          {etat?.erreur && <Message type="erreur">{etat.erreur}</Message>}
          <div className="flex items-center justify-between gap-4 border-t border-charcoal-100 pt-5">
            <button type="button" onClick={() => setJustificatif(false)} className="text-sm font-bold text-cornflower-700 hover:underline">
              ← Retour
            </button>
               <BoutonEnvoi enCours="Envoi…" enAttente={enCours}>
                    Envoyer ma demande
                </BoutonEnvoi>
          </div>
        </form>
      </Carte>
    )
  }

  return (
    <Carte titre="Vérification d’appartenance" description="Nous devons vérifier que vous êtes bien passé par les classes préparatoires de l’IPEST.">
      {motifRefus !== undefined && (
        <div className="mb-5">
          <Message type="erreur">
            Votre précédente demande n’a pas pu être validée.{motifRefus ? ` Motif : ${motifRefus}` : ''} Vous pouvez réessayer ci-dessous.
          </Message>
        </div>
      )}
      <div className="space-y-3">
        <form action={choisirAdresseIpest}>
          <button type="submit" className={grandBouton}>
            <Icone>
              <rect x="3" y="5" width="18" height="14" rx="1" />
              <path d="M3 7l9 6 9-6" />
            </Icone>
            <span className="flex-1">
              <span className="block font-bold">Vérifier avec mon adresse @ipest.ucar.tn</span>
              <span className="block break-all text-sm text-charcoal/70">Un code sera envoyé à {adresse}</span>
            </span>
            <span aria-hidden>›</span>
          </button>
        </form>
        <button type="button" onClick={() => setJustificatif(true)} className={grandBouton}>
          <Icone>
            <path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </Icone>
          <span className="flex-1">
            <span className="block font-bold">Vérifier mon appartenance autrement</span>
            <span className="block text-sm text-charcoal/70">Justificatif ou texte, validé par un administrateur</span>
          </span>
          <span aria-hidden>›</span>
        </button>
      </div>
    </Carte>
  )
}