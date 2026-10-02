import type { GlobalConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'
import { photo, texteRiche } from '../fields/contenu'

/** Section 4.2 : page unique en trois sections, modifiable sans validation. */
export const PageAssociation: GlobalConfig = {
  slug: 'page-association',
  label: 'Page « L’Association »',
  admin: { group: 'Pages' },
  access: { read: publique, update: adminsSeulement },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'quiSommesNous',
          label: 'Qui sommes-nous ?',
          fields: [
            {
              name: 'titre',
              label: 'Titre',
              type: 'text',
              defaultValue: 'L’Association des Anciens de l’IPEST',
            },
            texteRiche('texte', 'Texte'),
            photo(),
          ],
        },
        {
          name: 'pourquoiAdherer',
          label: 'Pourquoi adhérer ?',
          fields: [
            texteRiche('texte', 'Pourquoi adhérer ?'),
            texteRiche('cotisation', 'À quoi sert la cotisation ?'),
          ],
        },
        {
          name: 'equipe',
          label: 'L’équipe',
          fields: [
            {
              name: 'membres',
              label: 'Membres du bureau',
              type: 'array',
              labels: { singular: 'Membre', plural: 'Membres' },
              admin: {
                description: 'L’ordre de la liste est l’ordre d’affichage. Glisser-déposer pour réordonner.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'prenom', label: 'Prénom', type: 'text', required: true },
                    { name: 'nom', label: 'Nom', type: 'text', required: true },
                  ],
                },
                { name: 'poste', label: 'Poste', type: 'text', required: true },
                photo(),
              ],
            },
          ],
        },
      ],
    },
  ],
}