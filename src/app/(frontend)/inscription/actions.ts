'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { adresseIpest } from '@/lib/inscription/adresse'
import { attenteAvantRenvoi, messagesCode, nouveauCode, verifierCode } from '@/lib/inscription/codes'
import { envoyerCode, notifierAdmins } from '@/lib/inscription/emails'
import { connecterMembre } from '@/lib/inscription/session'
import { getPayloadClient, getSession } from '@/lib/payload'

export type EtatFormulaire = {
  erreur?: string
  info?: string
  erreurs?: Record<string, string>
  valeurs?: Record<string, string>
} | null

const TAILLE_MAX_JUSTIFICATIF = 5 * 1024 * 1024
const TYPES_JUSTIFICATIF = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

/** Membre connecté, relu en base avec ses champs protégés (codes). */
async function membreCourant() {
  const { user } = await getSession()
  if (!user || user.collection !== 'membres') redirect('/inscription')
  const payload = await getPayloadClient()
  const membre = await payload.findByID({ collection: 'membres', id: user.id, overrideAccess: true, depth: 0 })
  return { payload, membre }
}

/** Le statut a changé : on force le recalcul de l'en-tête (onglets réservés, avatar). */
function suivant(url = '/inscription'): never {
  revalidatePath('/', 'layout')
  redirect(url)
}

const texte = (f: FormData, cle: string) => String(f.get(cle) ?? '').trim()

// ─── Étape 1 : formulaire d'inscription ────────────────────────────────────────

export async function creerCompte(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const valeurs = {
    prenom: texte(f, 'prenom'),
    nom: texte(f, 'nom'),
    anneeSortie: texte(f, 'anneeSortie'),
    email: texte(f, 'email').toLowerCase(),
    dateNaissance: texte(f, 'dateNaissance'),
  }
  const password = String(f.get('password') ?? '')
  const confirmation = String(f.get('confirmation') ?? '')
  const erreurs: Record<string, string> = {}
  const anneeMax = new Date().getFullYear() + 2

  if (!valeurs.prenom || valeurs.prenom.length > 60) erreurs.prenom = 'Indiquez votre prénom.'
  if (!valeurs.nom || valeurs.nom.length > 60) erreurs.nom = 'Indiquez votre nom.'
  const annee = Number(valeurs.anneeSortie)
  if (!Number.isInteger(annee) || annee < 1990 || annee > anneeMax) erreurs.anneeSortie = 'Choisissez votre année de sortie.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeurs.email)) erreurs.email = 'Adresse e-mail invalide.'
  else if (valeurs.email.endsWith('@ipest.ucar.tn'))
    erreurs.email = 'Utilisez une adresse personnelle : l’adresse @ipest.ucar.tn sert à l’étape suivante.'
  const naissance = new Date(valeurs.dateNaissance)
  const age = (Date.now() - naissance.getTime()) / (365.25 * 24 * 3600 * 1000)
  if (Number.isNaN(naissance.getTime()) || age < 14 || age > 100) erreurs.dateNaissance = 'Date de naissance invalide.'
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    erreurs.password = 'Au moins 8 caractères, dont une lettre et un chiffre.'
  if (confirmation !== password) erreurs.confirmation = 'Les deux mots de passe ne correspondent pas.'
  if (f.get('consentement') !== 'on') erreurs.consentement = 'Votre accord est nécessaire pour créer un compte.'

  if (Object.keys(erreurs).length) return { erreurs, valeurs }

  const payload = await getPayloadClient()
  const existe = await payload.count({ collection: 'membres', where: { email: { equals: valeurs.email } } })
  if (existe.totalDocs > 0) {
    return { erreurs: { email: 'Un compte existe déjà avec cette adresse. Connectez-vous plutôt.' }, valeurs }
  }

  const { code, stocke } = nouveauCode(`email:${valeurs.email}`)
  await payload.create({
    collection: 'membres',
    data: {
      email: valeurs.email,
      password,
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      anneeSortie: annee,
      dateNaissance: naissance.toISOString(),
      emailVerifie: false,
      verification: { statut: 'non_verifie' },
      codeEmail: stocke,
    },
  })

  try {
    await envoyerCode(payload, { to: valeurs.email, prenom: valeurs.prenom, code, type: 'email' })
  } catch (e) {
    // Le compte existe : le membre pourra redemander un code à l'étape suivante.
    payload.logger.error({ err: e, msg: 'Envoi du code e-mail impossible' })
  }

  await connecterMembre(payload, valeurs.email, password)
  suivant()
}

// ─── Étape 2 : code reçu sur l'e-mail personnel ────────────────────────────────

export async function verifierCodeEmail(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const { payload, membre } = await membreCourant()
  const resultat = verifierCode(texte(f, 'code'), membre.codeEmail, `email:${membre.email}`)
  if (resultat !== 'ok') {
    if (resultat === 'incorrect') {
      await payload.update({
        collection: 'membres',
        id: membre.id,
        data: { codeEmail: { ...membre.codeEmail, tentatives: (membre.codeEmail?.tentatives ?? 0) + 1 } },
      })
    }
    return { erreur: messagesCode[resultat] }
  }
  await payload.update({
    collection: 'membres',
    id: membre.id,
    data: { emailVerifie: true, codeEmail: { hash: null, expire: null, tentatives: 0 } },
  })
  suivant()
}

export async function renvoyerCodeEmail(_: EtatFormulaire): Promise<EtatFormulaire> {
  const { payload, membre } = await membreCourant()
  const attente = attenteAvantRenvoi(membre.codeEmail)
  if (attente > 0) return { erreur: `Patientez encore ${attente} secondes avant de redemander un code.` }
  const { code, stocke } = nouveauCode(`email:${membre.email}`)
  await payload.update({ collection: 'membres', id: membre.id, data: { codeEmail: stocke } })
  try {
    await envoyerCode(payload, { to: membre.email, prenom: membre.prenom, code, type: 'email' })
  } catch {
    return { erreur: 'L’e-mail n’a pas pu être envoyé. Réessayez dans un instant.' }
  }
  return { info: 'Un nouveau code vient de vous être envoyé.' }
}

// ─── Étape 3, option 1 : adresse @ipest.ucar.tn ────────────────────────────────

async function envoyerCodeIpest() {
  const { payload, membre } = await membreCourant()
  const adresse = adresseIpest(membre.prenom, membre.nom)
  const { code, stocke } = nouveauCode(`ipest:${membre.id}`)
  await payload.update({
    collection: 'membres',
    id: membre.id,
    data: {
      verification: { ...membre.verification, methode: 'institutionnelle', statut: 'non_verifie', adresseInstitutionnelle: adresse },
      codeIpest: stocke,
    },
  })
  try {
    await envoyerCode(payload, { to: adresse, prenom: membre.prenom, code, type: 'ipest' })
    return true
  } catch (e) {
    payload.logger.error({ err: e, msg: 'Envoi du code IPEST impossible' })
    return false
  }
}

export async function choisirAdresseIpest(): Promise<void> {
  await envoyerCodeIpest()
  suivant()
}

export async function verifierCodeIpest(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const { payload, membre } = await membreCourant()
  const resultat = verifierCode(texte(f, 'code'), membre.codeIpest, `ipest:${membre.id}`)
  if (resultat !== 'ok') {
    if (resultat === 'incorrect') {
      await payload.update({
        collection: 'membres',
        id: membre.id,
        data: { codeIpest: { ...membre.codeIpest, tentatives: (membre.codeIpest?.tentatives ?? 0) + 1 } },
      })
    }
    return { erreur: messagesCode[resultat] }
  }
  await payload.update({
    collection: 'membres',
    id: membre.id,
    data: {
      verification: { ...membre.verification, statut: 'verifie' },
      codeIpest: { hash: null, expire: null, tentatives: 0 },
    },
  })
  suivant()
}

export async function renvoyerCodeIpest(_: EtatFormulaire): Promise<EtatFormulaire> {
  const { membre } = await membreCourant()
  const attente = attenteAvantRenvoi(membre.codeIpest)
  if (attente > 0) return { erreur: `Patientez encore ${attente} secondes avant de redemander un code.` }
  const ok = await envoyerCodeIpest()
  return ok ? { info: 'Un nouveau code vient d’être envoyé.' } : { erreur: 'L’e-mail n’a pas pu être envoyé.' }
}

/** Retour à l'écran de choix (lien « Vérifier autrement »). */
export async function revenirAuChoix(): Promise<void> {
  const { payload, membre } = await membreCourant()
  await payload.update({
    collection: 'membres',
    id: membre.id,
    data: { verification: { ...membre.verification, methode: null, statut: 'non_verifie' } },
  })
  suivant('/inscription?option=justificatif')
}

// ─── Étape 3, option 2 : justificatif ──────────────────────────────────────────

export async function envoyerJustificatif(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const { payload, membre } = await membreCourant()
  const justification = texte(f, 'justification').slice(0, 2000)
  const fichier = f.get('document')
  const aUnFichier = fichier instanceof File && fichier.size > 0

  if (!justification && !aUnFichier) {
    return { erreur: 'Rédigez une justification ou joignez un document (ou les deux).', valeurs: { justification } }
  }
  if (aUnFichier && fichier.size > TAILLE_MAX_JUSTIFICATIF) {
    return { erreur: 'Le document dépasse 5 Mo.', valeurs: { justification } }
  }
  if (aUnFichier && !TYPES_JUSTIFICATIF.includes(fichier.type)) {
    return { erreur: 'Format accepté : PDF, JPG, PNG ou WebP.', valeurs: { justification } }
  }

  let justificatifId: number | null = null
  if (aUnFichier) {
    try {
      const doc = await payload.create({
        collection: 'justificatifs',
        data: { membre: membre.id },
        file: {
          data: Buffer.from(await fichier.arrayBuffer()),
          mimetype: fichier.type,
          name: fichier.name,
          size: fichier.size,
        },
      })
      justificatifId = doc.id
    } catch (e) {
      payload.logger.error({ err: e, msg: 'Justificatif refusé' })
      return { erreur: 'Ce fichier n’a pas pu être lu. Vérifiez qu’il n’est pas endommagé ou essayez un autre format.', valeurs: { justification } }
    }
  }

  await payload.update({
    collection: 'membres',
    id: membre.id,
    data: {
      verification: {
        ...membre.verification,
        methode: 'justificatif',
        statut: 'en_attente',
        justificatifTexte: justification || null,
        justificatif: justificatifId,
        motifRefus: null,
      },
    },
  })

  try {
    await notifierAdmins(payload, membre)
  } catch (e) {
    payload.logger.error({ err: e, msg: 'Notification des admins impossible' })
  }
  suivant()
}

// ─── Fin du parcours ───────────────────────────────────────────────────────────

export async function terminerInscription(): Promise<void> {
  const { payload, membre } = await membreCourant()
  await payload.update({ collection: 'membres', id: membre.id, data: { inscriptionTerminee: true } })
  suivant(membre.verification?.statut === 'verifie' ? '/mon-espace' : '/')
}