/**
 * Adresse institutionnelle au format nom.prénom@ipest.ucar.tn (section 4.7, option 1).
 * Les noms et prénoms composés sont concaténés sans espace ; on retire aussi accents,
 * tirets et apostrophes, absents des adresses e-mail réelles.
 * À faire confirmer par l'IPEST si certaines adresses suivent une autre règle.
 */
const normaliser = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export const adresseIpest = (prenom: string, nom: string) =>
  `${normaliser(nom)}.${normaliser(prenom)}@ipest.ucar.tn`