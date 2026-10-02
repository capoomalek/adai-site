import type { Field } from 'payload'

/** Texte mis en forme (gras, liens, listes…) éditable dans le back-office. */
export const texteRiche = (name: string, label: string): Field => ({
  name,
  label,
  type: 'richText',
})

export const photo = (name = 'photo', label = 'Photo'): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
})

/** Succession de blocs « Photo + Texte » (Histoire, Campus…). */
export const blocsPhotoTexte = (name: string, label: string): Field => ({
  name,
  label,
  type: 'array',
  labels: { singular: 'Bloc', plural: 'Blocs' },
  admin: { initCollapsed: true },
  fields: [
    { name: 'titre', label: 'Titre', type: 'text' },
    texteRiche('texte', 'Texte'),
    photo(),
    { name: 'legende', label: 'Légende de la photo', type: 'text' },
  ],
})