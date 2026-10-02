import { cookies } from 'next/headers'
import type { Payload } from 'payload'
import { generatePayloadCookie } from 'payload/shared'

/**
 * Connecte un membre côté serveur (après l'inscription) en posant le même cookie
 * que la route /api/membres/login.
 */
export async function connecterMembre(payload: Payload, email: string, password: string) {
  const { token } = await payload.login({ collection: 'membres', data: { email, password } })
  if (!token) throw new Error('Connexion impossible')
  const cookie = generatePayloadCookie({
    collectionAuthConfig: payload.collections.membres.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    token,
    returnCookieAsObject: true,
  })
  const jar = await cookies()
  jar.set(cookie.name, cookie.value ?? '', {
    httpOnly: cookie.httpOnly,
    path: cookie.path,
    sameSite: cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined,
    secure: cookie.secure,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
    domain: cookie.domain,
  })
}