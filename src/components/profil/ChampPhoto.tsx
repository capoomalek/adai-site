'use client'

import { useEffect, useState } from 'react'

/** Photo de profil : aperçu, remplacement et suppression. */
export function ChampPhoto({ actuelle, initiales }: { actuelle: string | null; initiales: string }) {
  const [apercu, setApercu] = useState<string | null>(actuelle)
  const [supprimer, setSupprimer] = useState(false)

  useEffect(() => () => {
    if (apercu?.startsWith('blob:')) URL.revokeObjectURL(apercu)
  }, [apercu])

  const affichee = supprimer ? null : apercu

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-charcoal-100 bg-ghost">
        {affichee ? (
          // Photo privée servie avec contrôle d'accès : <img> plutôt que next/image (qui n'envoie pas les cookies)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={affichee} alt="Aperçu de votre photo de profil" className="h-full w-full object-cover" />
        ) : (
          <span className="font-sous-titre text-4xl text-charcoal/30" aria-hidden>
            {initiales}
          </span>
        )}
      </div>
      <label className="cursor-pointer text-sm font-bold text-cornflower-700 hover:underline">
        {affichee ? 'Changer la photo' : 'Ajouter une photo'}
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) {
              setApercu(URL.createObjectURL(f))
              setSupprimer(false)
            }
          }}
        />
      </label>
      {actuelle && (
        <label className="flex items-center gap-2 text-xs text-charcoal/70">
          <input type="checkbox" name="supprimerPhoto" checked={supprimer} onChange={(e) => setSupprimer(e.target.checked)} />
          Retirer ma photo
        </label>
      )}
      <p className="text-xs text-charcoal/60">JPG, PNG ou WebP, 3 Mo maximum.</p>
    </div>
  )
}