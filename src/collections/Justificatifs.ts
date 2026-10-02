import type { CollectionConfig } from 'payload'

import { adminsSeulement } from '../access/roles'

/**
 * Documents justificatifs envoyés à l'option 2 de l'inscription (section 4.7).
 * Privés : seuls les administrateurs peuvent les lire, y compris le fichier lui-même.
 * Le dépôt passe par l'action serveur d'inscription (API locale), d'où `create: adminsSeulement`.
 */
export const Justificatifs: CollectionConfig = {
  slug: 'justificatifs',
  labels: { singular: 'Justificatif', plural: 'Justificatifs' },
  admin: {
    group: 'Gestion des utilisateurs',
    defaultColumns: ['filename', 'membre', 'createdAt'],
  },
  access: {
    read: adminsSeulement,
    create: adminsSeulement,
    update: adminsSeulement,
    delete: adminsSeulement,
  },
  upload: {
    staticDir: 'prive/justificatifs',
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  },
  fields: [
    {
      name: 'membre',
      label: 'Membre',
      type: 'relationship',
      relationTo: 'membres',
      admin: { readOnly: true },
    },
  ],
}