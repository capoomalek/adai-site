import type { Metadata } from 'next'
import Link from 'next/link'

import { ContenuAVenir, EnTetePage, Tableau } from '@/components/contenu/Section'
import { aDuTexte, TexteRiche } from '@/components/contenu/TexteRiche'
import { SchemaFilieres } from '@/components/ipest/SchemaFilieres'
import { getPagesIpest } from '@/lib/contenu'

export const metadata: Metadata = { title: 'Admission et cursus' }

const score = (n?: number | null) => (n == null ? '—' : n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }))

/** Section 4.3.3 */
export default async function PageAdmissionCursus() {
  const { admission, cursus } = await getPagesIpest()
  const stats = [...(admission?.statistiques ?? [])].sort((a, b) => b.annee - a.annee)
  const capacites = cursus?.capacites ?? []
  const volumes = cursus?.volumesHoraires ?? []

  return (
    <>
      <EnTetePage titre="Admission et cursus" rubrique="L’IPEST" photo={admission?.banniere} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section id="admission" className="scroll-mt-40 py-14">
          <h2 className="font-titre text-3xl sm:text-4xl">Admission</h2>
          {aDuTexte(admission?.texte) ? (
            <TexteRiche data={admission?.texte} className="mt-5" />
          ) : (
            <div className="mt-5">
              <ContenuAVenir />
            </div>
          )}
          {stats.length > 0 && (
            <div className="mt-10">
              <h3 className="text-2xl">Scores des premiers et derniers admis</h3>
              <div className="mt-4">
                <Tableau
                  entetes={['Année', 'MPSI, premier', 'MPSI, dernier', 'PCSI, premier', 'PCSI, dernier']}
                  lignes={stats.map((s) => [s.annee, score(s.mpsiPremier), score(s.mpsiDernier), score(s.pcsiPremier), score(s.pcsiDernier)])}
                />
              </div>
            </div>
          )}
        </section>

        <section id="cursus" className="scroll-mt-40 border-t border-charcoal-100 py-14">
          <h2 className="font-titre text-3xl sm:text-4xl">Classes préparatoires aux grandes écoles</h2>
          <TexteRiche data={cursus?.texte} className="mt-5" />
          <div className="mt-10 bg-ghost px-4 py-8">
            <SchemaFilieres />
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            {capacites.length > 0 && (
              <div>
                <h3 className="text-2xl">Capacité de chaque filière</h3>
                <div className="mt-4">
                  <Tableau entetes={['Filière', 'Capacité']} lignes={capacites.map((c) => [c.filiere, c.capacite])} />
                </div>
              </div>
            )}
            {volumes.length > 0 && (
              <div>
                <h3 className="text-2xl">Volume horaire hebdomadaire</h3>
                <div className="mt-4">
                  <Tableau
                    entetes={['Matière', 'MPSI', 'PCSI', 'MP', 'PSI', 'PC']}
                    lignes={volumes.map((v) => [v.matiere, v.mpsi || '—', v.pcsi || '—', v.mp || '—', v.psi || '—', v.pc || '—'])}
                  />
                </div>
              </div>
            )}
          </div>

          {aDuTexte(cursus?.concours) && (
            <div className="mt-12">
              <h3 className="text-2xl">Les concours</h3>
              <TexteRiche data={cursus?.concours} className="mt-3" />
            </div>
          )}
          <Link href="/ipest/concours" className="mt-6 inline-block border-b-2 border-cornflower pb-0.5 font-bold hover:text-cornflower">
            Voir la liste des concours
          </Link>
        </section>
      </div>
    </>
  )
}