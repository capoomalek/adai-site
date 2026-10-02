import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { adresseIpest } from '@/lib/inscription/adresse'
import { getSession } from '@/lib/payload'

import {
  renvoyerCodeEmail,
  renvoyerCodeIpest,
  revenirAuChoix,
  terminerInscription,
  verifierCodeEmail,
  verifierCodeIpest,
} from './actions'
import { EtapeProfil } from './EtapeProfil'
import { EtapeAppartenance } from './EtapeAppartenance'
import { EtapeCode } from './EtapeCode'
import { EtapeFormulaire } from './EtapeFormulaire'

import { Progression } from './Progression'
import { BoutonEnvoi, Carte } from './ui'

export const metadata: Metadata = { title: 'Créer mon compte' }

type Props = { searchParams: Promise<{ option?: string }> }

/**
 * Parcours de création de compte (section 4.7).
 * L'écran affiché se déduit de l'état du compte en base : on peut fermer la page
 * et reprendre plus tard au même endroit en se reconnectant.
 */
export default async function PageInscription({ searchParams }: Props) {
  const { option } = await searchParams
  const { user } = await getSession()

  if (user?.collection === 'admins') redirect('/admin')

  let contenu: React.ReactNode
  let etape = 0

  if (!user) {
    contenu = <EtapeFormulaire />
  } else {
    const statut = user.verification?.statut ?? 'non_verifie'
    const methode = user.verification?.methode

    if (!user.emailVerifie) {
      etape = 1
      contenu = <EtapeCode titre="Vérifiez votre adresse e-mail" adresse={user.email} verifier={verifierCodeEmail} renvoyer={renvoyerCodeEmail} />
    } else if (statut === 'refuse') {
      etape = 2
      contenu = (
        <EtapeAppartenance
          adresse={adresseIpest(user.prenom, user.nom)}
          ouvrirJustificatif={option === 'justificatif'}
          motifRefus={user.verification?.motifRefus ?? null}
        />
      )
    } else if (statut === 'non_verifie' && methode === 'institutionnelle') {
      etape = 2
      contenu = (
        <EtapeCode
          titre="Code de vérification"
          adresse={user.verification?.adresseInstitutionnelle || adresseIpest(user.prenom, user.nom)}
          verifier={verifierCodeIpest}
          renvoyer={renvoyerCodeIpest}
          autreOption={revenirAuChoix}
        />
      )
    } else if (statut === 'non_verifie') {
      etape = 2
      contenu = <EtapeAppartenance adresse={adresseIpest(user.prenom, user.nom)} ouvrirJustificatif={option === 'justificatif'} />
    } else if (user.inscriptionTerminee) {
      redirect('/mon-espace')
    } else if (!user.etapeProfilFaite) {
      etape = 3
      contenu = <EtapeProfil initiales={`${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase()} />
    } else {
      etape = 4
      const verifie = statut === 'verifie'
      contenu = (
        <Carte titre={verifie ? 'Votre compte a été créé !' : 'Demande de création de compte envoyée'}>
          <div className="text-center">
            <span
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${verifie ? 'bg-cornflower/15 text-cornflower-700' : 'bg-banana/40 text-charcoal'}`}
              aria-hidden
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                {verifie ? <path d="M5 12l5 5 9-10" /> : <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>}
              </svg>
            </span>
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-charcoal/80">
              {verifie
                ? 'Votre appartenance à l’IPEST a été vérifiée. Bienvenue dans le réseau des ipestiens et alumni ! Votre compte est actif dès maintenant.'
                : 'Votre demande a été transmise à un administrateur pour validation de votre appartenance à l’IPEST. Votre compte n’est pas encore actif : vous recevrez un e-mail dès qu’elle sera traitée.'}
            </p>
            <form action={terminerInscription} className="mt-6">
              <BoutonEnvoi enCours="…">{verifie ? 'Accéder à mon espace' : 'Retour à l’accueil'}</BoutonEnvoi>
            </form>
          </div>
        </Carte>
      )
    }
  }

  return (
    <div className="bg-ghost px-4 py-12 sm:py-16">
        <div className={`mx-auto ${etape === 3 ? 'max-w-2xl' : 'max-w-xl'}`}>
                {etape < 4 && <Progression actuelle={etape} />}
        {contenu}
      </div>
    </div>
  )
}