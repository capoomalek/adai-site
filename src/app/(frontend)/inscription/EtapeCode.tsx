'use client'

import { useActionState } from 'react'

import type { EtatFormulaire } from './actions'
import { BoutonEnvoi, Carte, classeChamp, Message } from './ui'

type Props = {
  titre: string
  adresse: string
  verifier: (etat: EtatFormulaire, f: FormData) => Promise<EtatFormulaire>
  renvoyer: (etat: EtatFormulaire) => Promise<EtatFormulaire>
  /** Option « Vérifier autrement » (code @ipest.ucar.tn uniquement). */
  autreOption?: () => Promise<void>
}

/** Saisie d'un code à 6 chiffres reçu par e-mail (étapes 2 et 3, option 1). */
export function EtapeCode({ titre, adresse, verifier, renvoyer, autreOption }: Props) {
  const [etat, actionVerifier] = useActionState(verifier, null)
  const [etatRenvoi, actionRenvoyer] = useActionState(renvoyer, null)

  return (
    <Carte
      titre={titre}
      description={
        <>
          Un e-mail a été envoyé à <strong className="break-all text-charcoal">{adresse}</strong>. Saisissez le code à 6 chiffres qu’il contient.
        </>
      }
    >
      <form action={actionVerifier} className="space-y-5">
        <label htmlFor="code" className="sr-only">
          Code de vérification
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="••••••"
          aria-invalid={!!etat?.erreur}
          className={`${classeChamp} h-16 text-center font-mono text-3xl tracking-[0.5em]`}
        />
        {etat?.erreur && <Message type="erreur">{etat.erreur}</Message>}
        <div className="flex justify-end">
          <BoutonEnvoi enCours="Vérification…">Valider</BoutonEnvoi>
        </div>
      </form>

      <div className="mt-6 space-y-3 border-t border-charcoal-100 pt-5 text-sm">
        {etatRenvoi?.info && <Message type="info">{etatRenvoi.info}</Message>}
        {etatRenvoi?.erreur && <Message type="erreur">{etatRenvoi.erreur}</Message>}
        <form action={actionRenvoyer} className="flex flex-wrap items-center gap-x-1">
          <span className="text-charcoal/75">Rien reçu ? Pensez à vérifier vos spams, ou</span>
          <BoutonEnvoi secondaire enCours="Envoi…">
            renvoyer le code
          </BoutonEnvoi>
        </form>
        {autreOption && (
          <form action={autreOption} className="bg-ghost px-4 py-3">
            <span className="text-charcoal/80">
              Si vous n’avez pas reçu de mail ou si vous rencontrez un problème, procédez par la deuxième option.{' '}
            </span>
            <BoutonEnvoi secondaire enCours="…">
              Vérifier autrement
            </BoutonEnvoi>
          </form>
        )}
      </div>
    </Carte>
  )
}