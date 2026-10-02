import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FormulaireProfil } from '@/components/profil/FormulaireProfil'
import { getPayloadClient, getSession } from '@/lib/payload'
import { urlPhotoProfil } from '@/lib/profil'

export const metadata: Metadata = { title: 'Mon profil annuaire' }

/** Création ou modification du profil annuaire depuis « Mon espace ». */
export default async function PageProfil() {
  const { user } = await getSession()
  if (!user) redirect('/connexion')
  if (user.collection !== 'membres') redirect('/mon-espace')

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

  return (
    <div className="bg-ghost px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl border-t-4 border-cornflower bg-white p-6 shadow-sm sm:p-8">
        <Link href="/mon-espace" className="text-sm font-bold text-cornflower-700 hover:underline">
          ← Mon espace
        </Link>
        <h1 className="mt-3 font-titre text-3xl">{profil ? 'Modifier mon profil annuaire' : 'Créer mon profil annuaire'}</h1>
        <p className="mt-2 text-charcoal/75">
          Tous les champs sont facultatifs. Votre profil n’est visible que par les ipestiens et alumni connectés.
        </p>
        <div className="mt-6">
          <FormulaireProfil
            contexte="espace"
            initial={profil ?? {}}
            photo={urlPhotoProfil(profil?.photo)}
            initiales={`${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase()}
            lienAnnuler={
              <Link href="/mon-espace" className="h-11 px-4 text-sm font-bold leading-[2.75rem] text-charcoal/70 hover:text-charcoal">
                Annuler
              </Link>
            }
          />
        </div>
      </div>
    </div>
  )
}