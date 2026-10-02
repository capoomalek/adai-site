import type { CollectionConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'

/** Images publiques du site (logo, photos des pages, événements…). */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Médiathèque' },
  admin: { group: 'Contenu' },
  access: {
    read: publique,
    create: adminsSeulement,
    update: adminsSeulement,
    delete: adminsSeulement,
  },
  fields: [
    {
      name: 'alt',
      label: 'Description de l’image',
      type: 'text',
      required: true,
      admin: { description: 'Lue par les lecteurs d’écran et utile au référencement.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'vignette', width: 400 },
      { name: 'carte', width: 800 },
      { name: 'large', width: 1600 },
    ],
    focalPoint: true,
  },
}
