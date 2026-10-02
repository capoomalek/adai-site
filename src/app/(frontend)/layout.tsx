import type { Metadata } from 'next'
import React from 'react'

import { EnTete } from '@/components/entete/EnTete'
import { PiedDePage } from '@/components/PiedDePage'

import '@fontsource/bebas-neue/400.css'

import './styles.css'

export const metadata: Metadata = {
  title: {
    default: 'ADAI · Association des Anciens de l’IPEST',
    template: '%s · ADAI',
  },
  description:
    'Le réseau des anciens de l’Institut Préparatoire aux Études Scientifiques et Techniques.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning : ignore les attributs ajoutés par les extensions du navigateur
    <html lang="fr" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white" suppressHydrationWarning>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2"
        >
          Aller au contenu
        </a>
        <EnTete />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <PiedDePage />
      </body>
    </html>
  )
}
