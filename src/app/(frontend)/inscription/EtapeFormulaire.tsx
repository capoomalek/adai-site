'use client'

import Link from 'next/link'
import { creerCompte, type EtatFormulaire } from './actions'
import { BoutonEnvoi, Carte, Champ, classeChamp, Message, useFormulaire } from './ui'

/** Étape 1 (section 4.7) : informations personnelles. */
export function EtapeFormulaire() {
  const { etat, onSubmit, enCours } = useFormulaire<EtatFormulaire>(creerCompte, null)
  const e = etat?.erreurs ?? {}
  const anneeMax = new Date().getFullYear() + 2
  const annees = Array.from({ length: anneeMax - 1990 + 1 }, (_, i) => anneeMax - i)
  const invalide = (n: string) => (e[n] ? { 'aria-invalid': true, 'aria-describedby': `${n}-erreur` } : {})

  return (
    <Carte titre="Créer mon compte" description="Rejoignez le réseau des ipestiens et alumni.">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ label="Prénom" name="prenom" erreur={e.prenom}>
            <input id="prenom" name="prenom" autoComplete="given-name" className={classeChamp} {...invalide('prenom')} />
          </Champ>
          <Champ label="Nom" name="nom" erreur={e.nom}>
            <input id="nom" name="nom" autoComplete="family-name" className={classeChamp} {...invalide('nom')} />
          </Champ>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ label="Année de sortie de l’IPEST" name="anneeSortie" erreur={e.anneeSortie}>
            <select id="anneeSortie" name="anneeSortie" defaultValue="" className={classeChamp} {...invalide('anneeSortie')}>
              <option value="" disabled>
                Sélectionner une année
              </option>
              {annees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Champ>
          <Champ label="Date de naissance" name="dateNaissance" erreur={e.dateNaissance}>
            <input id="dateNaissance" name="dateNaissance" type="date" autoComplete="bday" className={classeChamp} {...invalide('dateNaissance')} />
          </Champ>
        </div>
        <Champ label="Adresse e-mail personnelle" name="email" erreur={e.email} aide="Un code de vérification sera envoyé à cette adresse.">
          <input id="email" name="email" type="email" autoComplete="email" className={classeChamp} {...invalide('email')} />
        </Champ>
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ label="Mot de passe" name="password" erreur={e.password} aide="8 caractères min., une lettre et un chiffre.">
            <input id="password" name="password" type="password" autoComplete="new-password" className={classeChamp} {...invalide('password')} />
          </Champ>
          <Champ label="Confirmer le mot de passe" name="confirmation" erreur={e.confirmation} aide="Saisissez-le une seconde fois.">
            <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" className={classeChamp} {...invalide('confirmation')} />
          </Champ>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" name="consentement" className="mt-1 h-4 w-4 accent-charcoal" {...invalide('consentement')} />
            <span>
              J’accepte que l’ADAI conserve ces informations pour gérer mon compte et vérifier mon appartenance à l’IPEST.
              Elles ne sont jamais transmises à des tiers.{' '}
              <Link href="/mentions-legales" className="text-cornflower-700 underline">
                En savoir plus
              </Link>
            </span>
          </label>
          {e.consentement && (
            <p id="consentement-erreur" className="mt-1 text-sm text-bubblegum">
              {e.consentement}
            </p>
          )}
        </div>

        {etat?.erreur && <Message type="erreur">{etat.erreur}</Message>}

        <div className="flex items-center justify-between gap-4 border-t border-charcoal-100 pt-5">
          <Link href="/connexion" className="text-sm font-bold text-cornflower-700 hover:underline">
            J’ai déjà un compte
          </Link>
          <BoutonEnvoi enCours="Création…" enAttente={enCours}>
            Continuer
          </BoutonEnvoi>
        </div>
      </form>
    </Carte>
  )
}