import type { GlobalConfig } from 'payload'

import { adminsSeulement, champMembreVerifieOuAdmin, publique } from '../access/roles'

/** Liens d'action utilisés à plusieurs endroits du site. */
export const Parametres: GlobalConfig = {
  slug: 'parametres',
  label: 'Liens et paramètres',
  admin: { group: 'Mise en page' },
  access: { read: publique, update: adminsSeulement },
  fields: [
    {
      name: 'lienCotisation',
      label: 'Lien « Je cotise »',
      type: 'text',
      admin: { description: 'Page de paiement de la cotisation (plateforme à définir).' },
    },
    {
      name: 'lienDon',
      label: 'Lien « Je fais un don »',
      type: 'text',
    },
    {
      name: 'lienWhatsApp',
      label: 'Lien d’invitation à la communauté WhatsApp',
      type: 'text',
      // Section 4.6 : visible uniquement par les membres vérifiés (et les admins).
      access: { read: champMembreVerifieOuAdmin },
    },
  ],
}
