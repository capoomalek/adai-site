import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Actualites } from './collections/Actualites'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Membres } from './collections/Membres'
import { PhotosProfil } from './collections/PhotosProfil'
import { Profils } from './collections/Profils'
import { EnTete } from './globals/EnTete'
import { PageAssociation } from './globals/PageAssociation'
import { PagesIpest } from './globals/PagesIpest'
import { Parametres } from './globals/Parametres'
import { PiedDePage } from './globals/PiedDePage'
import { Evenements } from './collections/Evenements'
import { Justificatifs } from './collections/Justificatifs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  admin: {
    // Seule la collection `admins` peut se connecter au back-office (/admin).
    user: Admins.slug,
    meta: {
      titleSuffix: ' · Back-office ADAI',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    admin: '/admin',
  },
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },
    collections: [Admins, Membres, Profils, PhotosProfil, Justificatifs, Media, Actualites, Evenements],
    globals: [EnTete, PiedDePage, Parametres, PageAssociation, PagesIpest],
  editor: lexicalEditor(),
    // Sans clé Resend (développement), les e-mails sont affichés dans le terminal.
  email: process.env.RESEND_API_KEY
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress: process.env.EMAIL_EXPEDITEUR || 'onboarding@resend.dev',
      defaultFromName: 'ADAI',
    })
  : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
