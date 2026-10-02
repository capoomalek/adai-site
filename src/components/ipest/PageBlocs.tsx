import { BlocPhotoTexte, ContenuAVenir, EnTetePage } from '@/components/contenu/Section'
import { TexteRiche } from '@/components/contenu/TexteRiche'
import type { Media } from '@/payload-types'

type Bloc = {
  id?: string | null
  titre?: string | null
  texte?: unknown
  photo?: number | Media | null
  legende?: string | null
}

/** Gabarit commun à Histoire et Campus : introduction puis blocs « Photo + Texte » alternés. */
export function PageBlocs({ titre, introduction, blocs }: { titre: string; introduction?: unknown; blocs?: Bloc[] | null }) {
  const liste = blocs ?? []
  return (
    <>
      <EnTetePage titre={titre} rubrique="L’IPEST" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <TexteRiche data={introduction} className="text-lg" />
        {liste.length === 0 ? (
          <div className="mt-8">
            <ContenuAVenir />
          </div>
        ) : (
          <div className="mt-14 space-y-20">
            {liste.map((b, i) => (
              <BlocPhotoTexte key={b.id ?? i} titre={b.titre} texte={b.texte} photo={b.photo} legende={b.legende} inverse={i % 2 === 1} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}