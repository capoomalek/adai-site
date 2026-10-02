import Image from 'next/image'
import Link from 'next/link'

import { imageDe } from '@/lib/media'
import { ongletsVisibles } from '@/lib/navigation'
import { getPayloadClient, getSession, voitEspacesReserves } from '@/lib/payload'

const nomsReseaux: Record<string, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
}

/** Pied de page unique (section 4.1, maquette 3), alimenté par le back-office. */
export async function PiedDePage() {
  const payload = await getPayloadClient()
  const { acces } = await getSession()
  const [pied, enTete, parametres] = await Promise.all([
    payload.findGlobal({ slug: 'pied-de-page' }),
    payload.findGlobal({ slug: 'en-tete', depth: 1 }),
    payload.findGlobal({ slug: 'parametres' }),
  ])

  const logo = imageDe(enTete.logoBlanc, 'vignette')
  const navigation = [
    ...ongletsVisibles(voitEspacesReserves(acces)).map((o) => ({
      libelle: o.libelle,
      href: o.href ?? o.sousLiens?.[0]?.href ?? o.base,
    })),
    { libelle: 'Actualités', href: '/#actualites' },
  ]

  const titreColonne = 'mb-4 font-sous-titre text-base tracking-wide text-white'
  const lienColonne = 'text-white/70 transition-colors hover:text-white'

  return (
    <footer className="bg-charcoal text-sm text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            {logo ? (
              <Image src={logo.url} alt="ADAI" width={96} height={40} className="h-10 w-auto" />
            ) : (
              <span className="font-titre text-4xl leading-none text-white">ADAI</span>
            )}
            <span className="h-9 w-px bg-white/40" aria-hidden />
            <span className="font-sous-titre text-base leading-tight tracking-wide text-white">
              Association des
              <br />
              Anciens de l’IPEST
            </span>
          </div>
          {pied.accroche && <p className="mt-5 max-w-xs leading-relaxed">{pied.accroche}</p>}
        </div>

        <nav aria-label="Plan du site">
          <h2 className={titreColonne}>Navigation</h2>
          <ul className="space-y-2">
            {navigation.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={lienColonne}>
                  {l.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={titreColonne}>Informations</h2>
          <ul className="space-y-2">
            {pied.liensInformations?.map((l) => (
              <li key={l.id ?? l.url}>
                <Link href={l.url} className={lienColonne}>
                  {l.libelle}
                </Link>
              </li>
            ))}
            {pied.emailContact && (
              <li>
                <a href={`mailto:${pied.emailContact}`} className={lienColonne}>
                  {pied.emailContact}
                </a>
              </li>
            )}
            {pied.telephone && (
              <li>
                <a href={`tel:${pied.telephone.replace(/\s/g, '')}`} className={lienColonne}>
                  {pied.telephone}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className={titreColonne}>Suivez-nous</h2>
          {pied.reseauxSociaux?.length ? (
            <ul className="flex flex-wrap gap-2">
              {pied.reseauxSociaux.map((r) => (
                <li key={r.id ?? r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-full border border-white/50 px-3.5 text-white/90 transition-colors hover:bg-white hover:text-charcoal"
                  >
                    {nomsReseaux[r.plateforme] ?? r.plateforme}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/50">Les réseaux seront bientôt ajoutés.</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-charcoal-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-white/60">
            © {new Date().getFullYear()} {pied.mentionCopyright}
          </p>
          <div className="flex gap-3">
            {parametres.lienCotisation && (
              <a href={parametres.lienCotisation} className="inline-flex h-8 items-center border border-white/70 px-4 font-sous-titre tracking-wide text-white hover:bg-white hover:text-charcoal">
                Je cotise
              </a>
            )}
            {parametres.lienDon && (
              <a href={parametres.lienDon} className="inline-flex h-8 items-center border border-white/70 px-4 font-sous-titre tracking-wide text-white hover:bg-white hover:text-charcoal">
                Je fais un don
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
