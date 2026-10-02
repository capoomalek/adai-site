import type { Metadata } from 'next'

import { PageBlocs } from '@/components/ipest/PageBlocs'
import { getPagesIpest } from '@/lib/contenu'

export const metadata: Metadata = { title: 'Histoire de l’IPEST' }

/** Section 4.3.1 */
export default async function PageHistoire() {
  const { histoire } = await getPagesIpest()
  return <PageBlocs titre="Histoire" introduction={histoire?.introduction} blocs={histoire?.blocs} />
}