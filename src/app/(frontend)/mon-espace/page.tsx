import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BoutonSupprimerProfil } from '@/components/profil/BoutonSupprimerProfil'
import { getPayloadClient, getSession } from '@/lib/payload'
import { libelleDisponibilite, urlPhotoProfil } from '@/lib/profil'

export const metadata: Metadata = { title: 'Mon espace' }

const libellesStatut: Record<string, string> = {
  non_verifie: 'Non vérifiée',
  en_attente: 'En attente de validation par un administrateur',
  verifie: 'Vérifiée',
  refuse: 'Refusée',
}

type Props = { searchParams: Promise<{ profil?: string }> }

/** Mon espace (commentaire MM3) : « Mon compte » + « Profil annuaire ». */
export default async function MonEspace({ searchParams }: Props) {
  const { profil: notification } = await searchParams
  const { user } = await getSession()
  if (!user) redirect('/connexion')

  if (user.collection === 'admins') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-titre text-4xl">Bonjour {user.nomComplet}</h1>
        <p className="mt-4">
          Vous êtes connecté en tant qu’administrateur.{' '}
          <a href="/admin" className="font-bold text-cornflower-700 hover:underline">
            Ouvrir le back-office
          </a>
        </p>
      </div>
    )
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'profils',
    where: { membre: { equals: user.id } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
    user,
  })
  const profil = docs[0]
  const photo = urlPhotoProfil(profil?.photo)
  const dispo = libelleDisponibilite(profil?.disponibilite)

  const statut = user.verification?.statut
  const aTerminer = !user.emailVerifie || statut === 'non_verifie' || statut === 'refuse'

  const lignes: [string, string][] = [
    ['Prénom', user.prenom],
    ['Nom', user.nom],
    ['E-mail', user.email],
    ['Année de sortie de l’IPEST', String(user.anneeSortie)],
    ['Appartenance à l’IPEST', libellesStatut[statut ?? 'non_verifie']],
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-titre text-4xl">Mon espace</h1>

      {notification === 'enregistre' && (
        <p role="status" className="mt-6 border-l-4 border-cornflower bg-cornflower/10 px-4 py-3">
          Votre profil annuaire a été enregistré.
        </p>
      )}
      {notification === 'supprime' && (
        <p role="status" className="mt-6 border-l-4 border-cornflower bg-cornflower/10 px-4 py-3">
          Votre profil annuaire a été supprimé.
        </p>
      )}

      {aTerminer && (
        <div className="mt-8 border-l-4 border-banana bg-banana/20 p-5">
          <p className="font-bold">
            {statut === 'refuse' ? 'Votre demande de vérification a été refusée.' : 'Votre inscription n’est pas terminée.'}
          </p>
          <p className="mt-1 text-charcoal/80">
            Vérifiez votre appartenance à l’IPEST pour accéder à l’annuaire et aux espaces réservés.
          </p>
          <a href="/inscription" className="mt-3 inline-block font-bold text-cornflower-700 underline">
            {statut === 'refuse' ? 'Envoyer une nouvelle demande' : 'Terminer mon inscription'}
          </a>
        </div>
      )}
      {statut === 'en_attente' && (
        <p className="mt-8 border-l-4 border-cornflower bg-cornflower/10 p-5">
          Votre demande est en cours d’examen par un administrateur. Vous recevrez un e-mail dès qu’elle sera traitée.
        </p>
      )}

      <section className="mt-10">
        <h2 className="font-sous-titre text-2xl tracking-wide">Mon compte</h2>
        <dl className="mt-4 divide-y divide-charcoal-100 border-y border-charcoal-100">
          {lignes.map(([terme, valeur]) => (
            <div key={terme} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr]">
              <dt className="text-charcoal/70">{terme}</dt>
              <dd>{valeur}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-sous-titre text-2xl tracking-wide">Profil annuaire</h2>
          {profil && (
            <div className="flex items-center gap-5">
              <Link href="/mon-espace/profil" className="text-sm font-bold text-cornflower-700 hover:underline">
                Modifier mon profil
              </Link>
              <BoutonSupprimerProfil />
            </div>
          )}
        </div>

        {!profil ? (
          <div className="mt-4 bg-ghost p-6">
            <p className="text-charcoal/80">
              Vous n’avez pas encore de profil dans l’annuaire. Créez-le pour que les membres du réseau puissent vous
              retrouver et vous contacter.
            </p>
            <Link
              href="/mon-espace/profil"
              className="mt-4 inline-flex h-11 items-center bg-charcoal px-6 font-sous-titre text-lg tracking-wide text-white hover:bg-charcoal-900"
            >
              Créer mon profil annuaire
            </Link>
          </div>
        ) : (
          <article className="mt-4 border border-charcoal-100 border-t-4 border-t-cornflower bg-white p-6">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ghost">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-sous-titre text-3xl text-charcoal/30" aria-hidden>
                    {user.prenom.charAt(0)}
                    {user.nom.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-sous-titre text-2xl tracking-wide">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-sm text-charcoal/70">Promo IPEST {user.anneeSortie}</p>
                {(profil.posteActuel || profil.ecole) && (
                  <p className="mt-2">
                    {[profil.posteActuel, profil.ecole && `${profil.ecole}${profil.promotionEcole ? ` (${profil.promotionEcole})` : ''}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                {dispo && (
                  <p className="mt-2 inline-block bg-banana/50 px-2 py-0.5 text-xs font-bold">
                    {dispo.label} — {dispo.detail}
                  </p>
                )}
              </div>
            </div>
            {profil.bio && <p className="mt-5 whitespace-pre-line leading-relaxed">{profil.bio}</p>}
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Secteur', profil.secteur],
                ['Ville, pays', profil.localisation],
                ['Entreprises', profil.entreprises?.join(', ')],
                ['WhatsApp', profil.whatsapp],
                ['E-mail de contact', profil.emailContact],
                ['LinkedIn', profil.linkedin],
              ]
                .filter(([, valeur]) => valeur)
                .map(([terme, valeur]) => (
                  <div key={terme}>
                    <dt className="text-charcoal/65">{terme}</dt>
                    <dd className="break-words font-bold">{valeur}</dd>
                  </div>
                ))}
            </dl>
            {statut !== 'verifie' && (
              <p className="mt-5 text-sm text-charcoal/70">
                Votre profil apparaîtra dans l’annuaire dès que votre appartenance à l’IPEST sera vérifiée.
              </p>
            )}
          </article>
        )}
      </section>
    </div>
  )
}