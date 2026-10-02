import type { Where } from 'payload'

import type { Evenement } from '@/payload-types'

const FUSEAU = 'Africa/Tunis'

export const formatJour = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: FUSEAU,
})

export const formatJourCourt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: FUSEAU,
})

export const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: FUSEAU,
})

const memeJour = (a: Date, b: Date) => formatJourCourt.format(a) === formatJourCourt.format(b)

/** « samedi 15 novembre 2026, 18:30 – 21:00 » ou sur plusieurs jours. */
export function plageHoraire(e: Pick<Evenement, 'dateDebut' | 'dateFin'>): string {
  const debut = new Date(e.dateDebut)
  if (!e.dateFin) return `${formatJour.format(debut)}, ${formatHeure.format(debut)}`
  const fin = new Date(e.dateFin)
  if (memeJour(debut, fin)) {
    return `${formatJour.format(debut)}, ${formatHeure.format(debut)} – ${formatHeure.format(fin)}`
  }
  return `Du ${formatJourCourt.format(debut)} à ${formatHeure.format(debut)} au ${formatJourCourt.format(fin)} à ${formatHeure.format(fin)}`
}

export const libellesPublic: Record<Evenement['public'], string> = {
  tout_public: 'Tout public',
  ipestiens_alumni: 'Ipestiens et alumni',
  ipestiens: 'Ipestiens',
  alumni: 'Alumni',
}

export const libellePrix = (e: Pick<Evenement, 'prix' | 'montant'>) =>
  e.prix === 'gratuit' ? 'Gratuit' : e.montant || 'Payant'

export const libelleLieu = (e: Pick<Evenement, 'enLigne' | 'lieu'>) =>
  e.enLigne ? 'En ligne' : e.lieu || 'Lieu à préciser'

export const estAVenir = (e: Pick<Evenement, 'finEffective' | 'dateDebut'>, maintenant = new Date()) =>
  new Date(e.finEffective || e.dateDebut) >= maintenant

/** Filtres Payload : événements à venir (pas encore terminés) ou passés. */
export const filtreAVenir = (maintenant: string): Where => ({ finEffective: { greater_than_equal: maintenant } })
export const filtrePasses = (maintenant: string): Where => ({ finEffective: { less_than: maintenant } })

/** Recherche texte dans le nom, la description et le lieu (insensible à la casse). */
export const filtreRecherche = (q: string): Where => ({
  or: [{ nom: { like: q } }, { description: { like: q } }, { lieu: { like: q } }],
})