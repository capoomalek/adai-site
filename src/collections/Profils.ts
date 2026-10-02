import type { Access, CollectionConfig } from 'payload'

import { adminsSeulement, estAdmin, estMembre, estMembreVerifie } from '../access/roles'
import { DISPONIBILITES, SECTEURS } from '../lib/profil'

const proprietaireOuAdmin: Access = ({ req: { user } }) => {
  if (estAdmin(user)) return true
  if (estMembre(user) && user) return { membre: { equals: user.id } }
  return false
}

/**
 * Profils de l'annuaire (section 4.7, étape 4 ; affichés en section 4.6).
 * Visibles uniquement par les membres vérifiés ; chacun voit et modifie toujours le sien.
 * Création via les actions serveur (inscription et « Mon espace »).
 */
export const Profils: CollectionConfig = {
  slug: 'profils',
  labels: { singular: 'Profil annuaire', plural: 'Profils annuaire' },
  admin: {
    useAsTitle: 'nomAffiche',
    defaultColumns: ['nomAffiche', 'ecole', 'posteActuel', 'disponibilite'],
    group: 'Gestion des utilisateurs',
  },
  access: {
    read: ({ req, ...rest }) => (estMembreVerifie(req.user) ? true : proprietaireOuAdmin({ req, ...rest })),
    create: adminsSeulement,
    update: proprietaireOuAdmin,
    delete: proprietaireOuAdmin,
  },
  fields: [
    {
      name: 'membre',
      label: 'Membre',
      type: 'relationship',
      relationTo: 'membres',
      required: true,
      unique: true,
      index: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      // Copie du nom pour l'affichage et la recherche dans l'annuaire
      name: 'nomAffiche',
      label: 'Nom',
      type: 'text',
      index: true,
      admin: { readOnly: true },
    },
    { name: 'photo', label: 'Photo', type: 'upload', relationTo: 'photos-profil' },
    {
      type: 'row',
      fields: [
        { name: 'whatsapp', label: 'Numéro WhatsApp', type: 'text' },
        { name: 'emailContact', label: 'E-mail de contact', type: 'email' },
      ],
    },
    { name: 'linkedin', label: 'Profil LinkedIn', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'ecole', label: 'École intégrée', type: 'text' },
        { name: 'promotionEcole', label: 'Promotion d’école', type: 'number' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'posteActuel', label: 'Poste actuel', type: 'text' },
        {
          name: 'secteur',
          label: 'Secteur d’activité',
          type: 'select',
          options: SECTEURS.map((s) => ({ label: s, value: s })),
        },
      ],
    },
    { name: 'localisation', label: 'Ville, pays', type: 'text' },
    {
      name: 'entreprises',
      label: 'Entreprises',
      type: 'text',
      hasMany: true,
      admin: { description: 'Servent de critère de recherche dans l’annuaire.' },
    },
    {
      name: 'disponibilite',
      label: 'Disponibilité',
      type: 'select',
      options: DISPONIBILITES.map((d) => ({ label: `${d.label} — ${d.detail}`, value: d.value })),
    },
    { name: 'bio', label: 'Bio', type: 'textarea', maxLength: 600 },
  ],
}