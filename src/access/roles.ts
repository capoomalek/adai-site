import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Deux collections d'authentification coexistent :
 *  - `admins`  : membres du bureau (back-office), rôle `superadmin` ou `admin`
 *  - `membres` : ipestiens et alumni inscrits sur le site
 * `req.user.collection` indique à laquelle appartient l'utilisateur connecté.
 */
type Utilisateur = PayloadRequest['user']

export const estAdmin = (user: Utilisateur): boolean => user?.collection === 'admins'

export const estSuperAdmin = (user: Utilisateur): boolean =>
  user?.collection === 'admins' && (user as { role?: string }).role === 'superadmin'

export const estMembre = (user: Utilisateur): boolean => user?.collection === 'membres'

/** Membre dont l'appartenance à l'IPEST a été vérifiée (option 1 ou validation admin). */
export const estMembreVerifie = (user: Utilisateur): boolean => {
  if (user?.collection !== 'membres') return false
  const m = user as { verification?: { statut?: string }; compteStatut?: string }
  return m.verification?.statut === 'verifie' && m.compteStatut !== 'suspendu'
}

// --- Règles d'accès réutilisables (collections) ---

export const publique: Access = () => true

export const adminsSeulement: Access = ({ req: { user } }) => estAdmin(user)

export const superAdminSeulement: Access = ({ req: { user } }) => estSuperAdmin(user)

/** Un admin voit tout ; un membre ne voit que son propre document. */
export const adminOuSoiMeme: Access = ({ req: { user } }) => {
  if (estAdmin(user)) return true
  if (estMembre(user) && user) return { id: { equals: user.id } }
  return false
}

// --- Règles d'accès réutilisables (champs) ---

export const champAdminSeulement: FieldAccess = ({ req: { user } }) => estAdmin(user)

export const champSuperAdminSeulement: FieldAccess = ({ req: { user } }) => estSuperAdmin(user)

export const champMembreVerifieOuAdmin: FieldAccess = ({ req: { user } }) =>
  estAdmin(user) || estMembreVerifie(user)
