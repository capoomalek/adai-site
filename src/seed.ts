/**
 * Données de démonstration pour tester le site en local.
 * Lancer avec : npm run seed   (sans effet si les données existent déjà)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const ilYa = (jours: number) => new Date(Date.now() - jours * 86_400_000).toISOString()

const { totalDocs: nbActus } = await payload.count({ collection: 'actualites' })
if (nbActus === 0) {
  const actus = [
    {
      titre: 'Lancement du nouveau site de l’ADAI',
      datePublication: ilYa(1),
      resume:
        'Le site de l’association ouvre ses portes : annuaire des anciens, retours d’expérience, ressources TIPE. Créez votre compte pour rejoindre le réseau.',
      lien: '/connexion',
    },
    {
      titre: 'Assemblée générale de l’association',
      datePublication: ilYa(4),
      resume:
        'Bilan de l’année, élection du nouveau bureau et présentation des projets à venir. Tous les membres sont invités.',
    },
    {
      titre: 'Rencontre avec la nouvelle promotion',
      datePublication: ilYa(9),
      resume:
        'Les anciens ont partagé leurs conseils avec les étudiants de première année autour des concours et de l’orientation.',
    },
  ]
  for (const data of actus) await payload.create({ collection: 'actualites', data })
  console.log('✔ 3 actualités créées')
}

await payload.updateGlobal({
  slug: 'pied-de-page',
  data: {
    emailContact: 'contact@adai.tn',
    reseauxSociaux: [
      { plateforme: 'facebook', url: 'https://facebook.com' },
      { plateforme: 'linkedin', url: 'https://linkedin.com' },
      { plateforme: 'instagram', url: 'https://instagram.com' },
    ],
  },
})
await payload.updateGlobal({
  slug: 'parametres',
  data: {
    lienCotisation: '#cotiser',
    lienDon: '#don',
    lienWhatsApp: 'https://chat.whatsapp.com/exemple',
  },
})
console.log('✔ pied de page et liens renseignés')

const comptes = [
  { email: 'membre@adai.test', prenom: 'Sarra', nom: 'Ben Ali', statut: 'verifie' as const },
  { email: 'attente@adai.test', prenom: 'Omar', nom: 'Gharbi', statut: 'en_attente' as const },
]
for (const c of comptes) {
  const existe = await payload.find({ collection: 'membres', where: { email: { equals: c.email } }, limit: 1 })
  if (existe.totalDocs > 0) continue
  await payload.create({
    collection: 'membres',
    data: {
      email: c.email,
      password: 'Membre1234!',
      prenom: c.prenom,
      nom: c.nom,
      anneeSortie: 2020,
      dateNaissance: '2002-05-14',
      emailVerifie: true,
      inscriptionTerminee: true,
      verification: { methode: c.statut === 'verifie' ? 'institutionnelle' : 'justificatif', statut: c.statut },
    },
  })
  console.log(`✔ membre de test ${c.email} (${c.statut}), mot de passe : Membre1234!`)
}

const { totalDocs: nbEvenements } = await payload.count({ collection: 'evenements' })
if (nbEvenements === 0) {
  const dansJours = (j: number, h: number) => {
    const d = new Date()
    d.setDate(d.getDate() + j)
    d.setHours(h, 0, 0, 0)
    return d.toISOString()
  }
  const evenements = [
    { nom: 'Gala annuel des anciens', dateDebut: dansJours(20, 18), dateFin: dansJours(20, 21), lieu: 'Hôtel Mövenpick, Tunis', description: 'La grande soirée de l’association : retrouvailles entre promotions, remise des prix et dîner.', prix: 'payant' as const, montant: '60 DT', public: 'ipestiens_alumni' as const, lienInscription: 'https://example.org/gala' },
    { nom: 'Webinaire : réussir les oraux', dateDebut: dansJours(6, 18), dateFin: dansJours(6, 20), enLigne: true, lienVisio: 'https://meet.example.org/oraux', description: 'Des anciens partagent leurs conseils pour préparer les oraux des concours.', prix: 'gratuit' as const, public: 'ipestiens' as const },
    { nom: 'Journée d’intégration', dateDebut: dansJours(-5, 9), dateFin: dansJours(-5, 17), lieu: 'Campus IPEST, La Marsa', description: 'Accueil des nouveaux ipestiens par les anciens : visite, jeux et déjeuner partagé.', prix: 'gratuit' as const, public: 'ipestiens' as const },
    { nom: 'Conférence : métiers de la data', dateDebut: dansJours(-40, 17), lieu: 'Amphithéâtre A, IPEST', description: 'Trois alumni présentent leur parcours dans la data science et l’intelligence artificielle.', prix: 'gratuit' as const, public: 'tout_public' as const },
  ]
  for (const data of evenements) await payload.create({ collection: 'evenements', data })
  console.log('✔ 4 événements créés (2 à venir, 2 passés)')
}

process.exit(0)
