const ETAPES = ['Informations', 'E-mail', 'Appartenance', 'Profil annuaire']
/** Indicateur d'avancement du parcours d'inscription. */
export function Progression({ actuelle }: { actuelle: number }) {
  return (
    <ol className="mb-6 flex gap-2" aria-label="Étapes de l’inscription">
      {ETAPES.map((nom, i) => {
        const etat = i < actuelle ? 'faite' : i === actuelle ? 'en cours' : 'à venir'
        return (
          <li key={nom} className="flex-1" aria-current={i === actuelle ? 'step' : undefined}>
            <span className={`block h-1.5 ${i <= actuelle ? 'bg-cornflower' : 'bg-charcoal-100'}`} />
            <span className={`mt-1.5 block text-xs ${i === actuelle ? 'font-bold' : 'text-charcoal/60'}`}>
              {nom}
              <span className="sr-only"> ({etat})</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}