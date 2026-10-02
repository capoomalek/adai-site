import { APIError, type CollectionConfig } from 'payload'

import { adminsSeulement, champSuperAdminSeulement, estAdmin, estSuperAdmin, superAdminSeulement } from '../access/roles'

/**
 * Comptes du back-office (section 5.2 du cahier des charges).
 *  - Super-Administrateur : compte de l'association (adresse e-mail de l'ADAI, jamais personnelle).
 *    Seul habilité à créer / révoquer les admins délégués.
 *  - Administrateur délégué : membre du bureau en mandat, compte nominatif.
 */
export const Admins: CollectionConfig = {
  slug: 'admins',
  labels: { singular: 'Administrateur', plural: 'Administrateurs' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['nomComplet', 'email', 'role', 'actif'],
    group: 'Gestion des accès',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // session de 8 h
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // blocage 15 min après 5 échecs
  },
  access: {
    // Le premier compte est créé via l'écran « Créer le premier utilisateur » de Payload.
    create: superAdminSeulement,
    read: adminsSeulement,
    // Un admin délégué peut modifier son propre compte (mot de passe, nom), le Super-Admin tous.
    update: ({ req: { user } }) => {
      if (estSuperAdmin(user)) return true
      if (estAdmin(user) && user) return { id: { equals: user.id } }
      return false
    },
    delete: superAdminSeulement,
    // Un compte désactivé ne peut plus ouvrir le back-office.
    admin: ({ req: { user } }) =>
      estAdmin(user) && (user as { actif?: boolean }).actif !== false,
  },
  fields: [
    {
      name: 'nomComplet',
      label: 'Nom et prénom',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Super-Administrateur (compte de l’association)', value: 'superadmin' },
        { label: 'Administrateur délégué (membre du bureau)', value: 'admin' },
      ],
      access: { update: champSuperAdminSeulement },
      saveToJWT: true,
    },
    {
      name: 'poste',
      label: 'Poste au bureau',
      type: 'text',
      admin: { description: 'Ex. Président, Responsable communication…' },
    },
    {
      name: 'actif',
      label: 'Compte actif',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Décocher en fin de mandat pour couper l’accès sans supprimer l’historique.',
      },
      access: { update: champSuperAdminSeulement },
      saveToJWT: true,
    },
  ],
  hooks: {
    beforeChange: [
      // Le tout premier compte créé devient automatiquement Super-Administrateur.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'admins', req })
          if (totalDocs === 0) {
            data.role = 'superadmin'
            data.actif = true
          }
        }
        return data
      },
    ],
    beforeDelete: [
      // Empêche de supprimer le dernier Super-Administrateur (risque de bloquer le site).
      async ({ id, req }) => {
        const cible = await req.payload.findByID({ collection: 'admins', id, req, depth: 0 })
        if (cible?.role !== 'superadmin') return
        const { totalDocs } = await req.payload.count({
          collection: 'admins',
          where: { role: { equals: 'superadmin' } },
          req,
        })
        if (totalDocs <= 1) {
          throw new APIError('Impossible de supprimer le dernier Super-Administrateur.', 400)
        }
      },
    ],
  },
}
