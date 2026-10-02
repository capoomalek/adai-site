import type { GlobalConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'

/**
 * Section 4.1 (Maquette 3) : pied de page unique, repris sur toutes les pages.
 * Une modification ici se répercute sur l'ensemble du site.
 */
export const PiedDePage: GlobalConfig = {
  slug: 'pied-de-page',
  label: 'Pied de page',
  admin: { group: 'Mise en page' },
  access: { read: publique, update: adminsSeulement },
  fields: [
    {
      name: 'accroche',
      label: 'Phrase d’accroche',
      type: 'textarea',
      defaultValue: 'Le réseau des ipestiens, d’hier à aujourd’hui.',
    },
    {
      type: 'row',
      fields: [
        { name: 'emailContact', label: 'E-mail de contact', type: 'email' },
        { name: 'telephone', label: 'Téléphone', type: 'text' },
      ],
    },
    {
      name: 'liensInformations',
      label: 'Liens « Informations »',
      type: 'array',
      labels: { singular: 'Lien', plural: 'Liens' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'libelle', label: 'Libellé', type: 'text', required: true },
            { name: 'url', label: 'Adresse (URL ou /chemin)', type: 'text', required: true },
          ],
        },
      ],
      defaultValue: [
        { libelle: 'Contactez-nous', url: '/contact' },
        { libelle: 'Mentions légales', url: '/mentions-legales' },
      ],
    },
    {
      name: 'reseauxSociaux',
      label: 'Réseaux sociaux',
      type: 'array',
      labels: { singular: 'Réseau', plural: 'Réseaux' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'plateforme',
              label: 'Plateforme',
              type: 'select',
              required: true,
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'YouTube', value: 'youtube' },
              ],
            },
            { name: 'url', label: 'Adresse de la page', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'mentionCopyright',
      label: 'Mention de copyright',
      type: 'text',
      defaultValue: 'Association des Anciens de l’IPEST. Tous droits réservés.',
      admin: { description: 'L’année en cours est ajoutée automatiquement devant.' },
    },
  ],
}
