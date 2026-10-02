/**
 * Arborescence du site (section 2.2 du cahier des charges).
 * Modifier ce fichier suffit pour mettre à jour l'en-tête ET le pied de page.
 */
export type Lien = { libelle: string; href: string; externe?: boolean }

export type Onglet = {
  libelle: string
  /** Préfixe d'URL servant à surligner l'onglet actif. */
  base: string
  /** Onglet sans sous-menu : lien direct. */
  href?: string
  sousLiens?: Lien[]
  reserve?: boolean
}

export const onglets: Onglet[] = [
  {
    libelle: 'L’Association',
    base: '/association',
    sousLiens: [
      { libelle: 'Qui sommes-nous ?', href: '/association#qui-sommes-nous' },
      { libelle: 'Pourquoi adhérer ?', href: '/association#pourquoi-adherer' },
      { libelle: 'L’équipe', href: '/association#equipe' },
    ],
  },
  {
    libelle: 'L’IPEST',
    base: '/ipest',
    sousLiens: [
      { libelle: 'Présentation', href: '/ipest' },
      { libelle: 'Histoire', href: '/ipest/histoire' },
      { libelle: 'Campus', href: '/ipest/campus' },
      { libelle: 'Admission et cursus', href: '/ipest/admission-et-cursus' },
      { libelle: 'Concours Grandes Écoles', href: '/ipest/concours' },
      { libelle: 'Après l’IPEST', href: '/ipest/apres-ipest' },
    ],
  },
  { libelle: 'Nos activités', base: '/activites', href: '/activites' },
  {
    libelle: 'Pour les Ipestiens',
    base: '/ipestiens',
    reserve: true,
    sousLiens: [
      { libelle: 'Retours d’expérience', href: '/ipestiens/retours-experience' },
      { libelle: 'TIPE', href: '/ipestiens/tipe' },
      { libelle: 'FAQ', href: '/ipestiens/faq' },
    ],
  },
  {
    libelle: 'Pour les Alumni',
    base: '/alumni',
    reserve: true,
    sousLiens: [
      { libelle: 'Annuaire', href: '/alumni/annuaire' },
      { libelle: 'FAQ', href: '/alumni/faq' },
      // Le lien WhatsApp est ajouté dynamiquement depuis le back-office (Paramètres).
    ],
  },
]

/** Construit les onglets visibles selon le statut de l'utilisateur. */
export function ongletsVisibles(espacesReserves: boolean, lienWhatsApp?: string | null): Onglet[] {
  return onglets
    .filter((o) => !o.reserve || espacesReserves)
    .map((o) =>
      o.base === '/alumni' && lienWhatsApp
        ? {
            ...o,
            sousLiens: [
              ...(o.sousLiens ?? []),
              { libelle: 'Communauté WhatsApp', href: lienWhatsApp, externe: true },
            ],
          }
        : o,
    )
}
