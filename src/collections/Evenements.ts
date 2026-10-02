import { ValidationError, type CollectionConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'

/**
 * Section 4.4 : événements de « Nos activités ».
 * Le passage « à venir » → « passé » est automatique : il dépend de `finEffective`
 * (date de fin, ou à défaut date de début), comparée à l'heure actuelle à chaque visite.
 */
export const Evenements: CollectionConfig = {
  slug: 'evenements',
  labels: { singular: 'Événement', plural: 'Nos activités' },
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'dateDebut', 'lieu', 'public'],
    group: 'Contenu',
  },
  defaultSort: '-dateDebut',
  access: {
    read: publique,
    create: adminsSeulement,
    update: adminsSeulement,
    delete: adminsSeulement,
  },
  fields: [
    { name: 'nom', label: 'Nom de l’événement', type: 'text', required: true, maxLength: 120 },
    {
      type: 'row',
      fields: [
        {
          name: 'dateDebut',
          label: 'Début',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm', timeFormat: 'HH:mm' } },
        },
        {
          name: 'dateFin',
          label: 'Fin (facultatif)',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm', timeFormat: 'HH:mm' } },
        },
      ],
    },
    {
      name: 'enLigne',
      label: 'Événement en ligne',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'lieu',
      label: 'Lieu',
      type: 'text',
      admin: {
        placeholder: 'Ex. Campus IPEST, La Marsa',
        condition: (data) => !data?.enLigne,
      },
    },
    {
      name: 'lienVisio',
      label: 'Lien de la visioconférence',
      type: 'text',
      admin: { condition: (data) => !!data?.enLigne },
    },
    {
      name: 'description',
      label: 'Courte description',
      type: 'textarea',
      required: true,
      maxLength: 280,
      admin: { description: 'Affichée sur la carte de l’événement (280 caractères maximum).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'prix',
          label: 'Prix',
          type: 'select',
          required: true,
          defaultValue: 'gratuit',
          options: [
            { label: 'Gratuit', value: 'gratuit' },
            { label: 'Payant', value: 'payant' },
          ],
        },
        {
          name: 'montant',
          label: 'Montant',
          type: 'text',
          admin: { placeholder: 'Ex. 20 DT', condition: (data) => data?.prix === 'payant' },
        },
        {
          name: 'public',
          label: 'Ouvert à',
          type: 'select',
          required: true,
          defaultValue: 'tout_public',
          options: [
            { label: 'Tout public', value: 'tout_public' },
            { label: 'Ipestiens et alumni', value: 'ipestiens_alumni' },
            { label: 'Ipestiens', value: 'ipestiens' },
            { label: 'Alumni', value: 'alumni' },
          ],
        },
      ],
    },
    {
      name: 'lienInscription',
      label: 'Lien d’inscription (facultatif)',
      type: 'text',
      admin: { placeholder: 'https://… formulaire, billetterie' },
    },
    { name: 'photo', label: 'Photo de l’événement', type: 'upload', relationTo: 'media' },
    {
      name: 'contenu',
      label: 'Présentation détaillée (page de l’événement)',
      type: 'richText',
    },
    {
      name: 'galerie',
      label: 'Galerie photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Photos affichées sur la page détaillée, par exemple après l’événement.' },
    },
    {
      name: 'finEffective',
      type: 'date',
      index: true,
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.dateFin && data.dateDebut && new Date(data.dateFin) < new Date(data.dateDebut)) {
          throw new ValidationError({
            errors: [{ path: 'dateFin', message: 'La fin doit être postérieure au début.' }],
          })
        }
        data.finEffective = data.dateFin || data.dateDebut
        return data
      },
    ],
  },
}