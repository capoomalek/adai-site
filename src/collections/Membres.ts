import { APIError, type CollectionConfig, type Field } from 'payload'

import { adminOuSoiMeme, adminsSeulement, champAdminSeulement, estAdmin } from '../access/roles'
import { notifierDecision } from '@/lib/inscription/emails'

/** Code de vérification à usage unique (stocké haché, jamais lisible via l'API). */
const champCode = (name: string): Field => ({
  name,
  type: 'group',
  admin: { hidden: true },
  access: { read: () => false, update: () => false, create: () => false },
  fields: [
    { name: 'hash', type: 'text' },
    { name: 'expire', type: 'date' },
    { name: 'tentatives', type: 'number', defaultValue: 0 },
    { name: 'envoyeLe', type: 'date' },
  ],
})

/**
 * Comptes des ipestiens et alumni (section 4.7).
 * La création passe par le parcours /inscription (actions serveur + API locale).
 */
export const Membres: CollectionConfig = {
  slug: 'membres',
  labels: { singular: 'Membre', plural: 'Membres' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['prenom', 'nom', 'anneeSortie', 'verification.statut', 'compteStatut'],
    group: 'Gestion des utilisateurs',
    listSearchableFields: ['prenom', 'nom', 'email'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // session de 30 jours
    maxLoginAttempts: 10,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    create: adminsSeulement,
    read: adminOuSoiMeme,
    update: adminOuSoiMeme,
    delete: adminsSeulement,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'prenom', label: 'Prénom', type: 'text', required: true },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'anneeSortie',
          label: 'Année de sortie de l’IPEST',
          type: 'number',
          required: true,
          min: 1990,
          max: 2100,
        },
        {
          name: 'dateNaissance',
          label: 'Date de naissance',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
        },
      ],
    },
    {
      name: 'emailVerifie',
      label: 'E-mail personnel vérifié',
      type: 'checkbox',
      defaultValue: false,
      access: { update: champAdminSeulement },
      admin: { position: 'sidebar' },
    },
    {
      name: 'inscriptionTerminee',
      label: 'Parcours d’inscription terminé',
      type: 'checkbox',
      defaultValue: false,
      access: { update: champAdminSeulement },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'etapeProfilFaite',
      label: 'Étape « profil annuaire » passée',
      type: 'checkbox',
      defaultValue: false,
      access: { update: champAdminSeulement },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'compteStatut',
      label: 'Statut du compte',
      type: 'select',
      defaultValue: 'actif',
      options: [
        { label: 'Actif', value: 'actif' },
        { label: 'Suspendu', value: 'suspendu' },
      ],
      access: { update: champAdminSeulement },
      admin: { position: 'sidebar' },
    },
    {
      name: 'verification',
      label: 'Vérification de l’appartenance à l’IPEST',
      type: 'group',
      access: { update: champAdminSeulement },
      fields: [
        {
          name: 'methode',
          label: 'Méthode',
          type: 'select',
          options: [
            { label: 'Adresse @ipest.ucar.tn (option 1)', value: 'institutionnelle' },
            { label: 'Justificatif (option 2)', value: 'justificatif' },
          ],
        },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'non_verifie',
          options: [
            { label: 'Non vérifié', value: 'non_verifie' },
            { label: 'En attente de validation', value: 'en_attente' },
            { label: 'Vérifié', value: 'verifie' },
            { label: 'Refusé', value: 'refuse' },
          ],
          admin: {
            description:
              'Passer à « Vérifié » ou « Refusé » envoie automatiquement un e-mail au membre.',
          },
        },
        {
          name: 'adresseInstitutionnelle',
          label: 'Adresse @ipest.ucar.tn utilisée',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (_, s) => s?.methode === 'institutionnelle',
          },
        },
        {
          name: 'justificatifTexte',
          label: 'Justification saisie',
          type: 'textarea',
          admin: { readOnly: true, condition: (_, s) => s?.methode === 'justificatif' },
        },
        {
          name: 'justificatif',
          label: 'Document justificatif',
          type: 'upload',
          relationTo: 'justificatifs',
          access: { read: champAdminSeulement },
          admin: { readOnly: true, condition: (_, s) => s?.methode === 'justificatif' },
        },
        {
          name: 'motifRefus',
          label: 'Motif du refus (envoyé au membre)',
          type: 'textarea',
          admin: { condition: (_, s) => s?.statut === 'refuse' },
        },
        {
          name: 'dateValidation',
          label: 'Date de validation',
          type: 'date',
          admin: { readOnly: true },
        },
      ],
    },
    champCode('codeEmail'),
    champCode('codeIpest'),
  ],
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (user?.compteStatut === 'suspendu') {
          throw new APIError('Ce compte est suspendu. Contactez le bureau de l’ADAI.', 403, undefined, true)
        }
      },
    ],
    beforeChange: [
      // Horodate la validation quand le statut passe à « vérifié ».
      ({ data, originalDoc }) => {
        const avant = originalDoc?.verification?.statut
        const apres = data?.verification?.statut
        if (apres === 'verifie' && avant !== 'verifie') {
          data.verification = { ...data.verification, dateValidation: new Date().toISOString() }
        }
        return data
      },
    ],
    afterChange: [
      // Décision d'un admin sur une demande (option 2) : on prévient le membre par e-mail.
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || !estAdmin(req.user)) return doc
        const avant = previousDoc?.verification?.statut
        const apres = doc.verification?.statut
        if (avant !== apres && (apres === 'verifie' || apres === 'refuse')) {
          await notifierDecision(req.payload, doc, apres)
        }
        return doc
      },
    ],
  },
}