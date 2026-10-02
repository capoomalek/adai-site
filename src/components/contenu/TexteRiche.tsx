import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

type Donnees = ComponentProps<typeof RichText>['data']

/** Vrai si le texte riche contient au moins un mot (un éditeur vide contient un paragraphe vide). */
export const aDuTexte = (data: unknown): boolean =>
  !!data && JSON.stringify(data).includes('"text":"')

export function TexteRiche({ data, className = '' }: { data?: unknown; className?: string }) {
  if (!aDuTexte(data)) return null
  return <RichText data={data as Donnees} className={`texte-riche ${className}`} />
}