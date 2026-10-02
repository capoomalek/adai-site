import type { GlobalConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'

/** Section 4.1 : éléments graphiques de l'en-tête, modifiables sans validation. */
export const EnTete: GlobalConfig = {
  slug: 'en-tete',
  label: 'En-tête',
  admin: { group: 'Mise en page' },
  access: { read: publique, update: adminsSeulement },
  fields: [
    {
      name: 'logoBlanc',
      label: 'Logo blanc de l’ADAI',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Version monochrome blanche, affichée sur fond sombre.' },
    },
    {
      name: 'imageDeFond',
      label: 'Image de fond de la page d’accueil',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
