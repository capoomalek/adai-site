import { createHmac, randomInt, timingSafeEqual } from 'crypto'

export const DUREE_VALIDITE_MS = 15 * 60 * 1000 // 15 minutes
export const MAX_TENTATIVES = 5
export const DELAI_RENVOI_MS = 60 * 1000 // 1 minute entre deux envois

export type CodeStocke = {
  hash?: string | null
  expire?: string | null
  tentatives?: number | null
  envoyeLe?: string | null
}

export const genererCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0')

/** Le code n'est jamais stocké en clair : HMAC lié au membre et au type de code. */
const hacher = (code: string, contexte: string) =>
  createHmac('sha256', process.env.PAYLOAD_SECRET || 'secret').update(`${contexte}:${code}`).digest('hex')

export function nouveauCode(contexte: string): { code: string; stocke: Required<CodeStocke> } {
  const code = genererCode()
  const maintenant = Date.now()
  return {
    code,
    stocke: {
      hash: hacher(code, contexte),
      expire: new Date(maintenant + DUREE_VALIDITE_MS).toISOString(),
      tentatives: 0,
      envoyeLe: new Date(maintenant).toISOString(),
    },
  }
}

export type ResultatVerification = 'ok' | 'incorrect' | 'expire' | 'trop_de_tentatives' | 'absent'

export function verifierCode(saisi: string, stocke: CodeStocke | null | undefined, contexte: string): ResultatVerification {
  if (!stocke?.hash || !stocke.expire) return 'absent'
  if ((stocke.tentatives ?? 0) >= MAX_TENTATIVES) return 'trop_de_tentatives'
  if (new Date(stocke.expire).getTime() < Date.now()) return 'expire'
  const attendu = Buffer.from(stocke.hash, 'hex')
  const recu = Buffer.from(hacher(saisi.replace(/\D/g, ''), contexte), 'hex')
  return attendu.length === recu.length && timingSafeEqual(attendu, recu) ? 'ok' : 'incorrect'
}

/** Secondes à attendre avant de pouvoir renvoyer un code (0 si possible). */
export function attenteAvantRenvoi(stocke: CodeStocke | null | undefined): number {
  if (!stocke?.envoyeLe) return 0
  const reste = new Date(stocke.envoyeLe).getTime() + DELAI_RENVOI_MS - Date.now()
  return Math.max(0, Math.ceil(reste / 1000))
}

export const messagesCode: Record<Exclude<ResultatVerification, 'ok'>, string> = {
  incorrect: 'Ce code est incorrect. Vérifiez-le et réessayez.',
  expire: 'Ce code a expiré. Demandez-en un nouveau.',
  trop_de_tentatives: 'Trop de tentatives. Demandez un nouveau code.',
  absent: 'Aucun code en cours. Demandez-en un nouveau.',
}