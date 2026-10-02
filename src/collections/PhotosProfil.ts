import type { Access, CollectionConfig } from 'payload'

import { adminsSeulement, estAdmin, estMembre, estMembreVerifie } from '../access/roles'

/** Lisible par les admins, les membres vérifiés (annuaire) et son propriétaire. */
const lecture: Access = ({ req: { user } }) => {
  if (estAdmin(user) || estMembreVerifie(user)) return true
  if (estMembre(user) && user) return { proprietaire: { equals: user.id } }
  return false
}

/**
 * Photos de profil de l'annuaire : privées (jamais visibles par un visiteur non connecté).
 * Elles sont servies par /api/photos-profil/file/… qui applique ces règles d'accès.
 */
export const PhotosProfil: CollectionConfig = {
  slug: 'photos-profil',
  labels: { singular: 'Photo de profil', plural: 'Photos de profil' },
  admin: { group: 'Gestion des utilisateurs' },
  access: {
    read: lecture,
    create: adminsSeulement,
    update: adminsSeulement,
    delete: adminsSeulement,
  },
  upload: {
    staticDir: 'prive/photos-profil',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [{ name: 'avatar', width: 320, height: 320, position: 'centre' }],
    adminThumbnail: 'avatar',
  },
  fields: [
    {
      name: 'proprietaire',
      label: 'Membre',
      type: 'relationship',
      relationTo: 'membres',
      admin: { readOnly: true },
    },
  ],
}