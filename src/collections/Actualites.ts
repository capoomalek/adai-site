import type { CollectionConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'

/**
 * « ADAI News » (commentaire MM2 du cahier des charges).
 * Le carrousel « Actualités » de l'accueil affiche les actualités des 15 derniers jours.
 * Les événements de « Nos activités » y seront ajoutés à l'étape 3.
 */
export const Actualites: CollectionConfig = {
  slug: 'actualites',
  labels: { singular: 'Actualité', plural: 'ADAI News' },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'datePublication', 'updatedAt'],
    group: 'Contenu',
    description:
      'Chaque actualité apparaît dans le carrousel de la page d’accueil pendant 15 jours après sa date de publication.',
  },
  defaultSort: '-datePublication',
  access: {
    read: publique,
    create: adminsSeulement,
    update: adminsSeulement,
    delete: adminsSeulement,
  },
  fields: [
    { name: 'titre', label: 'Titre', type: 'text', required: true, maxLength: 120 },
    {
      name: 'datePublication',
      label: 'Date de publication',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
    {
      name: 'resume',
      label: 'Texte court',
      type: 'textarea',
      required: true,
      maxLength: 320,
      admin: { description: '320 caractères maximum, affichés dans le carrousel.' },
    },
    {
      name: 'lien',
      label: 'Lien « En savoir plus » (facultatif)',
      type: 'text',
      admin: { description: 'Adresse d’une page du site (/activites) ou d’un site externe.' },
    },
  ],
}
