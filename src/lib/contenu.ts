import { cache } from 'react'

import { getPayloadClient } from './payload'

/** Contenu des six pages IPEST (un seul appel par requête). */
export const getPagesIpest = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'pages-ipest', depth: 1 })
})