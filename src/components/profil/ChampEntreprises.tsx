'use client'

import { useState } from 'react'

import { MAX_ENTREPRISES } from '@/lib/profil'

/** Saisie d'entreprises sous forme d'étiquettes (Entrée ou virgule pour valider). */
export function ChampEntreprises({ initiales }: { initiales: string[] }) {
  const [liste, setListe] = useState(initiales)
  const [saisie, setSaisie] = useState('')

  const ajouter = (texte = saisie) => {
    const nom = texte.trim().slice(0, 60)
    if (nom && !liste.some((e) => e.toLowerCase() === nom.toLowerCase()) && liste.length < MAX_ENTREPRISES) {
      setListe([...liste, nom])
    }
    setSaisie('')
  }

  return (
    <div className="mt-1.5 flex min-h-11 flex-wrap items-center gap-2 border border-charcoal-100 bg-white px-2 py-1.5 focus-within:border-cornflower">
      {liste.map((e) => (
        <span key={e} className="inline-flex items-center gap-1 bg-cornflower/15 py-1 pl-2.5 pr-1 text-sm font-bold">
          {e}
          <input type="hidden" name="entreprises" value={e} />
          <button
            type="button"
            onClick={() => setListe(liste.filter((x) => x !== e))}
            className="px-1 text-charcoal/60 hover:text-bubblegum"
            aria-label={`Retirer ${e}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id="entreprises"
        value={saisie}
        onChange={(ev) => (ev.target.value.endsWith(',') ? ajouter(ev.target.value.slice(0, -1)) : setSaisie(ev.target.value))}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault()
            ajouter()
          }
          if (ev.key === 'Backspace' && !saisie && liste.length) setListe(liste.slice(0, -1))
        }}
        onBlur={() => ajouter()}
        placeholder={liste.length ? 'Ajouter une entreprise…' : 'Ex. Thales, puis Entrée'}
        disabled={liste.length >= MAX_ENTREPRISES}
        className="h-8 min-w-40 flex-1 bg-transparent px-1 outline-none"
      />
    </div>
  )
}