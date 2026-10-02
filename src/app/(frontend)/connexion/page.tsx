import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/payload'

import { FormulaireConnexion } from './FormulaireConnexion'

export const metadata: Metadata = { title: 'Connexion' }

export default async function PageConnexion() {
  const { user } = await getSession()
  if (user) redirect('/mon-espace')

  return (
    <div className="bg-ghost px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-md border-t-4 border-cornflower bg-white p-8 shadow-sm">
        <h1 className="font-titre text-3xl">Connexion</h1>
        <p className="mt-2 text-charcoal/75">Accédez à l’espace des ipestiens et des alumni.</p>
        <FormulaireConnexion />
      </div>
    </div>
  )
}
