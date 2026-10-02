'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { EtatFormulaire } from '@/app/(frontend)/inscription/actions'
import { getPayloadClient, getSession } from '@/lib/payload'
import { DISPONIBILITES, MAX_ENTREPRISES, SECTEURS, TAILLE_MAX_PHOTO } from '@/lib/profil'

type Contexte = 'inscription' | 'espace'

async function membreConnecte() {
  const { user } = await getSession()
  if (!user || user.collection !== 'membres') redirect('/connexion')
  return { payload: await getPayloadClient(), membre: user }
}

const texte = (f: FormData, cle: string, max = 200) => String(f.get(cle) ?? '').trim().slice(0, max)
const ouNull = (s: string) => (s === '' ? null : s)

async function profilDe(membreId: number) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'profils', where: { membre: { equals: membreId } }, limit: 1, depth: 0 })
  return docs[0] ?? null
}

/** Création ou mise à jour du profil annuaire (étape 4 de l'inscription et « Mon espace »). */
export async function enregistrerProfil(contexte: Contexte, _: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const { payload, membre } = await membreConnecte()

  const v = {
    whatsapp: texte(f, 'whatsapp', 25),
    emailContact: texte(f, 'emailContact', 120).toLowerCase(),
    linkedin: texte(f, 'linkedin', 200),
    ecole: texte(f, 'ecole', 100),
    promotionEcole: texte(f, 'promotionEcole', 4),
    posteActuel: texte(f, 'posteActuel', 120),
    secteur: texte(f, 'secteur', 60),
    localisation: texte(f, 'localisation', 80),
    disponibilite: texte(f, 'disponibilite', 20),
    bio: texte(f, 'bio', 600),
    entreprises: f
      .getAll('entreprises')
      .map((e) => String(e).trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, MAX_ENTREPRISES)
      .join('\n'),
  }
  const erreurs: Record<string, string> = {}

  if (v.whatsapp && !/^\+?[\d\s.-]{8,20}$/.test(v.whatsapp)) erreurs.whatsapp = 'Numéro invalide (ex. +216 12 345 678).'
  if (v.emailContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.emailContact)) erreurs.emailContact = 'Adresse e-mail invalide.'
  if (v.linkedin) {
    if (!/^https?:\/\//i.test(v.linkedin)) v.linkedin = `https://${v.linkedin}`
    if (!/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v.linkedin)) erreurs.linkedin = 'Collez l’adresse de votre profil (linkedin.com/in/…).'
  }
  const anneeMax = new Date().getFullYear() + 6
  if (v.promotionEcole && !(/^\d{4}$/.test(v.promotionEcole) && +v.promotionEcole >= 1990 && +v.promotionEcole <= anneeMax))
    erreurs.promotionEcole = 'Année sur 4 chiffres.'
  if (v.secteur && !SECTEURS.includes(v.secteur as (typeof SECTEURS)[number])) erreurs.secteur = 'Secteur inconnu.'
  if (v.disponibilite && !DISPONIBILITES.some((d) => d.value === v.disponibilite)) erreurs.disponibilite = 'Choix invalide.'

  const fichier = f.get('photo')
  const nouvellePhoto = fichier instanceof File && fichier.size > 0 ? fichier : null
  if (nouvellePhoto && nouvellePhoto.size > TAILLE_MAX_PHOTO) erreurs.photo = 'La photo dépasse 3 Mo.'
  if (nouvellePhoto && !['image/jpeg', 'image/png', 'image/webp'].includes(nouvellePhoto.type))
    erreurs.photo = 'Format accepté : JPG, PNG ou WebP.'

  if (Object.keys(erreurs).length) return { erreurs, valeurs: v }

  const existant = await profilDe(membre.id)
  const ancienneId = typeof existant?.photo === 'number' ? existant.photo : null
  let photoId: number | null = ancienneId

  if (nouvellePhoto) {
    try {
      const photo = await payload.create({
        collection: 'photos-profil',
        data: { proprietaire: membre.id },
        file: {
          data: Buffer.from(await nouvellePhoto.arrayBuffer()),
          mimetype: nouvellePhoto.type,
          name: nouvellePhoto.name,
          size: nouvellePhoto.size,
        },
      })
      photoId = photo.id
    } catch (e) {
      payload.logger.error({ err: e, msg: 'Photo de profil refusée' })
      return { erreurs: { photo: 'Cette image n’a pas pu être lue. Essayez une autre photo.' }, valeurs: v }
    }
  } else if (f.get('supprimerPhoto') === 'on') {
    photoId = null
  }

  const data = {
    nomAffiche: `${membre.prenom} ${membre.nom}`,
    photo: photoId,
    whatsapp: ouNull(v.whatsapp),
    emailContact: ouNull(v.emailContact),
    linkedin: ouNull(v.linkedin),
    ecole: ouNull(v.ecole),
    promotionEcole: v.promotionEcole ? Number(v.promotionEcole) : null,
    posteActuel: ouNull(v.posteActuel),
    secteur: (ouNull(v.secteur) as (typeof SECTEURS)[number] | null),
    localisation: ouNull(v.localisation),
    entreprises: v.entreprises ? v.entreprises.split('\n') : [],
    disponibilite: (ouNull(v.disponibilite) as (typeof DISPONIBILITES)[number]['value'] | null),
    bio: ouNull(v.bio),
  }

  if (existant) await payload.update({ collection: 'profils', id: existant.id, data })
  else await payload.create({ collection: 'profils', data: { ...data, membre: membre.id } })

  // L'ancienne photo n'est plus utilisée : on la supprime du serveur.
  if (ancienneId && ancienneId !== photoId) {
    await payload.delete({ collection: 'photos-profil', id: ancienneId }).catch(() => null)
  }

  revalidatePath('/', 'layout')
  if (contexte === 'inscription') {
    await payload.update({ collection: 'membres', id: membre.id, data: { etapeProfilFaite: true } })
    redirect('/inscription')
  }
  redirect('/mon-espace?profil=enregistre')
}

/** « Plus tard » / « Passer cette étape » pendant l'inscription. */
export async function passerEtapeProfil(): Promise<void> {
  const { payload, membre } = await membreConnecte()
  await payload.update({ collection: 'membres', id: membre.id, data: { etapeProfilFaite: true } })
  revalidatePath('/', 'layout')
  redirect('/inscription')
}

/** Suppression définitive du profil annuaire (et de sa photo) depuis « Mon espace ». */
export async function supprimerProfil(): Promise<void> {
  const { payload, membre } = await membreConnecte()
  const profil = await profilDe(membre.id)
  if (profil) {
    await payload.delete({ collection: 'profils', id: profil.id })
    if (typeof profil.photo === 'number') {
      await payload.delete({ collection: 'photos-profil', id: profil.photo }).catch(() => null)
    }
  }
  revalidatePath('/', 'layout')
  redirect('/mon-espace?profil=supprime')
}