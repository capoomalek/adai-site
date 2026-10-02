/**
 * Schéma de répartition des filières (maquette 4.3.3.2).
 * Volontairement non éditable (commentaire MM5) : à modifier ici si l'organisation change.
 */
const boite = (x: number, y: number, texte: string, accent = false) => (
  <g key={texte}>
    <rect x={x} y={y - 22} width="150" height="44" rx="4" className={accent ? 'fill-charcoal' : 'fill-white stroke-charcoal'} strokeWidth="1.5" />
    <text x={x + 75} y={y + 6} textAnchor="middle" className={`font-sous-titre text-[20px] ${accent ? 'fill-white' : 'fill-charcoal'}`}>
      {texte}
    </text>
  </g>
)

const trait = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2
  return <path key={`${x1}${y1}${x2}${y2}`} d={`M${x1} ${y1} H${mx} V${y2} H${x2}`} fill="none" className="stroke-cornflower" strokeWidth="2" />
}

export function SchemaFilieres() {
  return (
    <figure className="overflow-x-auto">
      <svg viewBox="0 0 660 290" role="img" aria-labelledby="schema-titre schema-desc" className="mx-auto w-full min-w-[520px] max-w-3xl">
        <title id="schema-titre">Répartition des filières à l’IPEST</title>
        <desc id="schema-desc">
          Après le bac, les élèves entrent en MPSI ou en PCSI. Depuis la MPSI, ils poursuivent en MP* ou PSI*. Depuis la PCSI, en PSI* ou PC*.
        </desc>
        {['Après le bac', '1re année', '2e année'].map((t, i) => (
          <text key={t} x={[75, 315, 555][i]} y="20" textAnchor="middle" className="fill-charcoal/60 text-[15px]">
            {t}
          </text>
        ))}
        {trait(150, 155, 240, 105)}
        {trait(150, 155, 240, 205)}
        {trait(390, 105, 480, 60)}
        {trait(390, 105, 480, 155)}
        {trait(390, 205, 480, 155)}
        {trait(390, 205, 480, 250)}
        {boite(0, 155, 'Bac maths', true)}
        {boite(240, 105, 'MPSI')}
        {boite(240, 205, 'PCSI')}
        {boite(480, 60, 'XMP / MP*')}
        {boite(480, 155, 'PSI*')}
        {boite(480, 250, 'XPC / PC*')}
      </svg>
    </figure>
  )
}