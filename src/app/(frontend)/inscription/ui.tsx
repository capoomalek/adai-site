'use client'
import { startTransition, useActionState, type FormEvent, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

/**
 * Comme useActionState, mais sans que React vide le formulaire après l'envoi :
 * en cas d'erreur, tout ce qui a été saisi (y compris un fichier choisi) reste en place.
 */
export function useFormulaire<E>(action: (etat: Awaited<E>, f: FormData) => Promise<E>, initial: Awaited<E>) {
  const [etat, envoyer, enCours] = useActionState<E, FormData>(action, initial)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const donnees = new FormData(e.currentTarget)
    startTransition(() => envoyer(donnees))
  }
  return { etat, onSubmit, enCours }
}

export const classeChamp =
  'mt-1.5 block h-11 w-full border border-charcoal-100 bg-white px-3 text-charcoal outline-none transition-colors focus:border-cornflower aria-[invalid=true]:border-bubblegum'

/** Carte centrée des maquettes de la section 4.7. */
export function Carte({ titre, description, children }: { titre: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="border-t-4 border-cornflower bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-titre text-3xl">{titre}</h1>
      {description && <div className="mt-2 leading-relaxed text-charcoal/75">{description}</div>}
      <div className="mt-6">{children}</div>
    </div>
  )
}

export function Champ({
  label,
  name,
  erreur,
  aide,
  children,
}: {
  label: string
  name: string
  erreur?: string
  aide?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold">
        {label}
      </label>
      {aide && <p className="mt-0.5 text-xs text-charcoal/65">{aide}</p>}
      {children}
      {erreur && (
        <p id={`${name}-erreur`} className="mt-1 text-sm text-bubblegum">
          {erreur}
        </p>
      )}
    </div>
  )
}

export function BoutonEnvoi({
  children,
  enCours,
  secondaire = false,
  enAttente,
}: {
  children: ReactNode
  enCours: string
  secondaire?: boolean
  /** À fournir quand le formulaire utilise useFormulaire (onSubmit) plutôt que action. */
  enAttente?: boolean
}) {
  const statut = useFormStatus()
  const pending = enAttente ?? statut.pending
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        secondaire
          ? 'h-11 px-5 font-bold text-cornflower-700 underline-offset-2 hover:underline disabled:opacity-60'
          : 'h-11 bg-charcoal px-6 font-sous-titre text-lg tracking-wide text-white transition-colors hover:bg-charcoal-900 disabled:opacity-60'
      }
    >
      {pending ? enCours : children}
    </button>
  )
}

export function Message({ type, children }: { type: 'erreur' | 'info'; children: ReactNode }) {
  return (
    <p
      role={type === 'erreur' ? 'alert' : 'status'}
      className={`border-l-4 px-3 py-2 text-sm ${type === 'erreur' ? 'border-bubblegum bg-bubblegum/10' : 'border-cornflower bg-cornflower/10'}`}
    >
      {children}
    </p>
  )
}