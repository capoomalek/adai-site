'use client'

import { startTransition, type ReactNode } from 'react'

import { enregistrerProfil, passerEtapeProfil } from '@/actions/profil'
import { BoutonEnvoi, Champ, classeChamp, Message, useFormulaire } from '@/app/(frontend)/inscription/ui'
import type { EtatFormulaire } from '@/app/(frontend)/inscription/actions'
import { DISPONIBILITES, SECTEURS } from '@/lib/profil'

import { ChampEntreprises } from './ChampEntreprises'
import { ChampPhoto } from './ChampPhoto'

export type ValeursProfil = {
  whatsapp?: string | null
  emailContact?: string | null
  linkedin?: string | null
  ecole?: string | null
  promotionEcole?: number | string | null
  posteActuel?: string | null
  secteur?: string | null
  localisation?: string | null
  entreprises?: string[] | null
  disponibilite?: string | null
  bio?: string | null
}

type Props = {
  contexte: 'inscription' | 'espace'
  initial: ValeursProfil
  photo: string | null
  initiales: string
  lienAnnuler?: ReactNode
}

/** Formulaire du profil annuaire (section 4.7, étape 4) : tous les champs sont facultatifs. */
export function FormulaireProfil({ contexte, initial, photo, initiales, lienAnnuler }: Props) {
  const { etat, onSubmit, enCours } = useFormulaire<EtatFormulaire>(enregistrerProfil.bind(null, contexte), null)
  const e = etat?.erreurs ?? {}
  const v = initial
  const val = (x: unknown) => (x == null ? '' : String(x))

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <ChampPhoto actuelle={photo} initiales={initiales} />
      {e.photo && <Message type="erreur">{e.photo}</Message>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ label="Numéro WhatsApp" name="whatsapp" erreur={e.whatsapp}>
          <input id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="+216 12 345 678" defaultValue={val(v.whatsapp)} className={classeChamp} />
        </Champ>
        <Champ label="E-mail de contact" name="emailContact" erreur={e.emailContact}>
          <input id="emailContact" name="emailContact" type="email" placeholder="votre.adresse@exemple.com" defaultValue={val(v.emailContact)} className={classeChamp} />
        </Champ>
      </div>
      <Champ label="Profil LinkedIn" name="linkedin" erreur={e.linkedin}>
        <input id="linkedin" name="linkedin" type="text" inputMode="url" placeholder="linkedin.com/in/votre-profil" defaultValue={val(v.linkedin)} className={classeChamp} />
      </Champ>
      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <Champ label="École intégrée" name="ecole" erreur={e.ecole}>
          <input id="ecole" name="ecole" placeholder="Ex. CentraleSupélec" defaultValue={val(v.ecole)} className={classeChamp} />
        </Champ>
        <Champ label="Promotion d’école" name="promotionEcole" erreur={e.promotionEcole}>
          <input id="promotionEcole" name="promotionEcole" inputMode="numeric" maxLength={4} placeholder="Ex. 2024" defaultValue={val(v.promotionEcole)} className={classeChamp} />
        </Champ>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ label="Poste actuel" name="posteActuel">
          <input id="posteActuel" name="posteActuel" placeholder="Ex. Ingénieure R&D" defaultValue={val(v.posteActuel)} className={classeChamp} />
        </Champ>
        <Champ label="Secteur d’activité" name="secteur" erreur={e.secteur}>
          <select id="secteur" name="secteur" defaultValue={val(v.secteur)} className={classeChamp}>
            <option value="">Non renseigné</option>
            {SECTEURS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Champ>
      </div>
      <Champ label="Ville, pays" name="localisation">
        <input id="localisation" name="localisation" placeholder="Ex. Paris, France" defaultValue={val(v.localisation)} className={classeChamp} />
      </Champ>
      <Champ
        label="Entreprises"
        name="entreprises"
        aide="Les entreprises par lesquelles vous êtes passé servent de critère de recherche dans l’annuaire."
      >
        <ChampEntreprises initiales={v.entreprises ?? []} />
      </Champ>
      <Champ
        label="Disponibilité"
        name="disponibilite"
        erreur={e.disponibilite}
        aide="Ce label indique aux autres membres à quel point vous êtes ouvert à être sollicité (demande de conseil, mise en relation, mentorat…). Il permet de solliciter chacun dans le respect de ses disponibilités et de ses limites."
      >
        <select id="disponibilite" name="disponibilite" defaultValue={val(v.disponibilite)} className={classeChamp}>
          <option value="">Non renseignée</option>
          {DISPONIBILITES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label} — {d.detail}
            </option>
          ))}
        </select>
      </Champ>
      <Champ label="Bio" name="bio" aide="600 caractères maximum.">
        <textarea id="bio" name="bio" rows={4} maxLength={600} placeholder="Présentez-vous en quelques lignes…" defaultValue={val(v.bio)} className={`${classeChamp} h-auto py-2`} />
      </Champ>

      {Object.keys(e).length > 0 && <Message type="erreur">Certains champs sont à corriger.</Message>}

      <div className="flex items-center justify-end gap-3 border-t border-charcoal-100 pt-5">
        {contexte === 'inscription' ? (
          <button
            type="button"
            onClick={() => startTransition(() => passerEtapeProfil())}
            className="h-11 px-4 text-sm font-bold text-charcoal/70 hover:text-charcoal"
          >
            Passer cette étape
          </button>
        ) : (
          lienAnnuler
        )}
        <BoutonEnvoi enCours="Enregistrement…" enAttente={enCours}>
          {contexte === 'inscription' ? 'Terminer' : 'Enregistrer'}
        </BoutonEnvoi>
      </div>
    </form>
  )
}