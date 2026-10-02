import type { GlobalConfig } from 'payload'

import { adminsSeulement, publique } from '../access/roles'
import { blocsPhotoTexte, photo, texteRiche } from '../fields/contenu'

/**
 * Section 4.3 : les six pages de la rubrique IPEST, regroupées en onglets.
 * Le schéma des filières n'est pas éditable (commentaire MM5) : il est codé en dur.
 */
export const PagesIpest: GlobalConfig = {
  slug: 'pages-ipest',
  label: 'Pages « L’IPEST »',
  admin: { group: 'Pages' },
  access: { read: publique, update: adminsSeulement },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'presentation',
          label: 'Présentation',
          fields: [texteRiche('texte', 'Texte introductif'), photo()],
        },
        {
          name: 'histoire',
          label: 'Histoire',
          fields: [
            texteRiche('introduction', 'Introduction'),
            blocsPhotoTexte('blocs', 'Blocs de l’histoire (textes et photos historiques)'),
          ],
        },
        {
          name: 'campus',
          label: 'Campus',
          fields: [
            texteRiche('introduction', 'Introduction'),
            blocsPhotoTexte('blocs', 'Lieux du campus (restaurant, dortoirs, laboratoires…)'),
          ],
        },
        {
          name: 'admission',
          label: 'Admission',
          fields: [
            photo('banniere', 'Photo de bannière'),
            texteRiche('texte', 'Processus d’admission'),
            {
              name: 'statistiques',
              label: 'Scores des premiers et derniers admis',
              type: 'array',
              labels: { singular: 'Année', plural: 'Années' },
              admin: { description: 'Une ligne par année. À mettre à jour chaque année.' },
              fields: [
                { name: 'annee', label: 'Année', type: 'number', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'mpsiPremier', label: 'MPSI, premier admis', type: 'number' },
                    { name: 'mpsiDernier', label: 'MPSI, dernier admis', type: 'number' },
                    { name: 'pcsiPremier', label: 'PCSI, premier admis', type: 'number' },
                    { name: 'pcsiDernier', label: 'PCSI, dernier admis', type: 'number' },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'cursus',
          label: 'Cursus',
          fields: [
            texteRiche('texte', 'Présentation des classes préparatoires'),
            {
              name: 'capacites',
              label: 'Capacité de chaque filière',
              type: 'array',
              labels: { singular: 'Filière', plural: 'Filières' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'filiere', label: 'Filière', type: 'text', required: true },
                    { name: 'capacite', label: 'Capacité', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'volumesHoraires',
              label: 'Volume horaire hebdomadaire par matière',
              type: 'array',
              labels: { singular: 'Matière', plural: 'Matières' },
              fields: [
                { name: 'matiere', label: 'Matière', type: 'text', required: true },
                {
                  type: 'row',
                  fields: ['mpsi', 'pcsi', 'mp', 'psi', 'pc'].map((f) => ({
                    name: f,
                    label: f.toUpperCase(),
                    type: 'text' as const,
                  })),
                },
              ],
            },
            texteRiche('concours', 'Paragraphe « Les concours »'),
          ],
        },
        {
          name: 'concours',
          label: 'Concours',
          fields: [
            texteRiche('introduction', 'Introduction'),
            {
              name: 'liste',
              label: 'Concours',
              type: 'array',
              labels: { singular: 'Concours', plural: 'Concours' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'nom', label: 'Nom', type: 'text', required: true },
                    { name: 'url', label: 'Site officiel', type: 'text', required: true },
                  ],
                },
                {
                  name: 'description',
                  label: 'Spécificités (facultatif)',
                  type: 'textarea',
                },
              ],
            },
          ],
        },
        {
          name: 'apresIpest',
          label: 'Après l’IPEST',
          fields: [
            texteRiche('introduction', 'Introduction'),
            {
              name: 'ecoles',
              label: 'Écoles accessibles',
              type: 'array',
              labels: { singular: 'École', plural: 'Écoles' },
              admin: { description: 'Les écoles sont regroupées par concours sur la page.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'nom', label: 'École', type: 'text', required: true },
                    {
                      name: 'concours',
                      label: 'Concours',
                      type: 'text',
                      required: true,
                      admin: { description: 'Ex. X-ENS, Mines-Ponts, Centrale-Supélec, CCINP…' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'url', label: 'Site de l’école', type: 'text' },
                    { name: 'boursiere', label: 'École boursière', type: 'checkbox' },
                  ],
                },
              ],
            },
            {
              name: 'lienListeBoursieres',
              label: 'Lien vers la liste officielle des écoles boursières',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}