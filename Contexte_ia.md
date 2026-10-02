# Contexte du projet pour un assistant IA

> **À l'humain qui lit ce fichier** : colle tout son contenu au début d'une nouvelle conversation avec ton assistant IA, puis écris ta demande en dessous (voir le modèle à la fin). Si tu utilises **Claude Code**, copie ce fichier sous le nom `CLAUDE.md` à la racine du projet : il sera lu automatiquement. Avec **Cursor** ou **Codex**, nomme la copie `AGENTS.md`. Garde ce fichier à jour quand une fonctionnalité est terminée.

---

## 1. Le projet

Site web de l'**ADAI** (Association Des Anciens de l'IPEST). L'IPEST est un institut préparatoire tunisien (classes préparatoires MPSI/PCSI puis MP*/PSI*/PC*). Le site a trois objectifs :

1. **Vitrine** de l'association et de l'IPEST, accessible à tous.
2. **Réseau privé** : annuaire des anciens, retours d'expérience, ressources TIPE, FAQ, réservés aux membres vérifiés.
3. **Autonomie du bureau** : tout le contenu doit être modifiable depuis le back-office, sans toucher au code.

L'interface du site et le code sont **en français**. Le développeur avec qui tu travailles débute peut-être : explique ce que tu fais, procède par petites étapes et indique précisément quels fichiers créer ou modifier.

## 2. Stack et versions exactes

| Élément | Version | Remarques |
|---|---|---|
| Next.js | 16.3 (App Router, Turbopack) | `params` et `searchParams` des pages sont des **Promise** : `const { id } = await params` |
| React | 19.2 | Server Components par défaut ; `'use client'` seulement si nécessaire |
| Payload CMS | 3.90.2 | Intégré à Next.js, adaptateur `@payloadcms/db-postgres`, éditeur Lexical |
| PostgreSQL | 16 | En développement, Payload synchronise le schéma automatiquement (*push*) ; pas encore de migrations |
| Tailwind CSS | 4.3 | Configuration dans `src/app/(frontend)/styles.css` (`@theme`), pas de `tailwind.config.js` |
| TypeScript | 5.7 | `npm run typecheck` doit passer sans erreur |
| E-mails | `@payloadcms/email-resend` | Sans `RESEND_API_KEY`, les e-mails s'affichent dans le terminal |
| Gestionnaire de paquets | npm | |

## 3. Architecture

```
src/
├── payload.config.ts      Déclare toutes les collections et globals
├── payload-types.ts       GÉNÉRÉ par `npm run generate:types` : ne jamais l'éditer
├── access/roles.ts        Règles d'accès réutilisables
├── collections/           Listes de données (Admins, Membres, Profils, PhotosProfil, Justificatifs, Media, Actualites, Evenements)
├── globals/               Contenus uniques (EnTete, PiedDePage, Parametres, PageAssociation, PagesIpest)
├── fields/contenu.ts      Champs réutilisables : texteRiche(), photo(), blocsPhotoTexte()
├── lib/                   Utilitaires serveur : payload.ts, navigation.ts, media.ts, evenements.ts, profil.ts, contenu.ts, inscription/*
├── actions/               Server Actions partagées ('use server')
├── components/            Composants d'interface réutilisables
└── app/
    ├── (frontend)/        Pages publiques et membres (layout.tsx = en-tête + pied de page)
    └── (payload)/         Back-office généré par Payload : NE PAS MODIFIER
```

Les pages lisent les données côté serveur avec l'API locale de Payload, jamais avec `fetch` vers `/api` :

```ts
import { getPayloadClient, getSession } from '@/lib/payload'

const payload = await getPayloadClient()
const { user, acces } = await getSession() // acces : 'visiteur' | 'en_attente' | 'membre' | 'admin'
const { docs } = await payload.find({ collection: 'evenements', where: { ... }, depth: 1 })
```

## 4. Comptes, rôles et droits d'accès

Il existe **deux collections d'authentification**. Le site et le back-office partagent le même cookie `payload-token`, et `user.collection` indique de quel type de compte il s'agit.

| Collection | Qui | Connexion | Détails |
|---|---|---|---|
| `admins` | Bureau de l'ADAI | `/admin` | Champ `role` : `superadmin` (le premier compte créé, seul à gérer les admins ; le dernier ne peut pas être supprimé) ou `admin`. Champ `actif`. |
| `membres` | Ipestiens et alumni | `/connexion`, création via `/inscription` | `verification.statut` : `non_verifie`, `en_attente`, `verifie` ou `refuse`. `compteStatut` : `actif` ou `suspendu`. |

Fonctions de `src/access/roles.ts` à réutiliser : `estAdmin(user)`, `estSuperAdmin(user)`, `estMembre(user)`, `estMembreVerifie(user)`, et les règles toutes prêtes `publique`, `adminsSeulement`, `superAdminSeulement`, `adminOuSoiMeme`, `champAdminSeulement`, `champMembreVerifieOuAdmin`.

**Règle absolue** : l'API locale de Payload **ignore les droits par défaut** (`overrideAccess: true`). Quand une requête est faite au nom d'un utilisateur, passe toujours `overrideAccess: false` et `user`. Masquer un bouton ne protège rien : la vérification doit se faire côté serveur.

Les espaces réservés (« Pour les Ipestiens », « Pour les Alumni », annuaire, WhatsApp) sont visibles seulement si `voitEspacesReserves(acces)` est vrai, c'est-à-dire pour un membre vérifié ou un admin.

## 5. Modèle de données actuel

**Collections**

| Slug | Contenu | Accès en lecture |
|---|---|---|
| `admins` | Comptes du bureau | Admins |
| `membres` | Prénom, nom, année de sortie, date de naissance, `emailVerifie`, `inscriptionTerminee`, `etapeProfilFaite`, `verification` (méthode, statut, adresse institutionnelle, justificatif, motif de refus) ; codes de vérification hachés et invisibles | Admin, ou le membre lui-même |
| `profils` | Profil annuaire lié à un membre (relation unique) : `nomAffiche`, photo, WhatsApp, e-mail de contact, LinkedIn, école, promotion d'école, poste, secteur, localisation, `entreprises` (texte `hasMany`), `disponibilite`, bio | Membres vérifiés, propriétaire, admins |
| `photos-profil` | Upload privé (`prive/photos-profil`), taille `avatar` 320×320 | Membres vérifiés, propriétaire, admins |
| `justificatifs` | Upload privé (`prive/justificatifs`) envoyé à l'inscription | Admins |
| `media` | Images publiques (tailles `vignette`, `carte`, `large`) | Tout le monde |
| `actualites` | « ADAI News » : titre, date de publication, image, résumé, lien | Tout le monde |
| `evenements` | Nom, `dateDebut`, `dateFin`, en ligne, lieu ou lien visio, description, prix et montant, public, lien d'inscription, photo, contenu riche, galerie ; `finEffective` calculé et indexé | Tout le monde |

**Globals** : `en-tete` (logo blanc, image de fond), `pied-de-page`, `parametres` (liens cotisation, don, WhatsApp ; le lien WhatsApp n'est lisible que par les membres vérifiés), `page-association` (onglets Qui sommes-nous, Pourquoi adhérer, L'équipe), `pages-ipest` (onglets Présentation, Histoire, Campus, Admission, Cursus, Concours, Après l'IPEST).

## 6. Pages existantes

| URL | Fichier | Rôle |
|---|---|---|
| `/` | `app/(frontend)/page.tsx` | Accueil : carrousel des prochains événements, puis actualités et événements terminés des 15 derniers jours |
| `/association` | `association/page.tsx` | Page unique avec ancres `#qui-sommes-nous`, `#pourquoi-adherer`, `#equipe` |
| `/ipest`, `/ipest/histoire`, `/ipest/campus`, `/ipest/admission-et-cursus`, `/ipest/concours`, `/ipest/apres-ipest` | `ipest/…` | Rubrique IPEST avec sous-navigation |
| `/activites`, `/activites/[id]` | `activites/…` | Événements à venir et passés, recherche `?q=`, pagination `?page=`, fiche détaillée |
| `/connexion` | `connexion/…` | Connexion des membres (POST `/api/membres/login`) |
| `/inscription` | `inscription/…` | Parcours en 4 étapes ; l'écran affiché est déduit de l'état du compte |
| `/mon-espace`, `/mon-espace/profil` | `mon-espace/…` | Compte, statut, profil annuaire (création, modification, suppression) |

Le menu et le pied de page sont générés depuis `src/lib/navigation.ts`. Les onglets réservés pointent déjà vers des pages **qui n'existent pas encore** : `/alumni/annuaire`, `/alumni/faq`, `/ipestiens/retours-experience`, `/ipestiens/tipe`, `/ipestiens/faq`.

## 7. Conventions de code

- **Noms en français** pour les variables, fonctions, composants, slugs et champs : `evenements`, `estMembreVerifie`, `FormulaireProfil`. Textes de l'interface en français, avec l'apostrophe typographique `’`.
- **Charte graphique** : utiliser uniquement les couleurs Tailwind `charcoal` (#2E4057, texte et fonds sombres), `charcoal-900`, `charcoal-100` (bordures), `cornflower` (#5995ED, accents et liens), `cornflower-700` (liens lisibles), `ghost` (#F4F4F9, fonds de section), `banana` (#FFE74C, badges) et `bubblegum` (#FF5964, erreurs et alertes). Polices : `font-titre` (h1, h2), `font-sous-titre` (h3, boutons, étiquettes), `font-corps` (texte, appliquée par défaut). Pas de couleurs en dur.
- **Style visuel** : angles droits (pas de `rounded` sauf avatars), bordure supérieure `border-t-4 border-cornflower` pour les cartes et formulaires, conteneurs `mx-auto max-w-6xl px-4 sm:px-6`.
- **Composants existants à réutiliser** :
  - `EnTetePage`, `BlocPhotoTexte`, `ContenuAVenir` et `Tableau` dans `components/contenu/Section.tsx` ;
  - `TexteRiche` et `aDuTexte()` pour afficher un champ `richText` ;
  - `imageDe(champ, 'carte')` (`lib/media.ts`) pour l'URL d'une image publique ;
  - `urlPhotoProfil()` (`lib/profil.ts`) pour une photo de profil.
- **Formulaires** : Server Action qui renvoie `EtatFormulaire` (`{ erreur?, info?, erreurs?: Record<champ, message>, valeurs? }`). Côté client, utiliser le hook `useFormulaire` et les composants `Carte`, `Champ`, `BoutonEnvoi` (avec `enAttente={enCours}`), `Message` et `classeChamp`, tous dans `app/(frontend)/inscription/ui.tsx`. Valider **toutes** les données côté serveur.
- **Contenu modifiable par le bureau** : il passe toujours par un champ Payload (collection ou global), avec `label` et `admin.description` en français. Les listes ordonnées utilisent le type `array`.
- **Accessibilité** : `label` sur chaque champ, `aria-invalid`, `role="alert"` pour les erreurs, textes alternatifs, `sr-only` pour les icônes seules.

## 8. Pièges connus du projet

1. **Après toute modification d'une collection ou d'un global**, lancer `npm run generate:types`, sinon TypeScript ne connaît pas les nouveaux champs.
2. **URL des images** : Payload renvoie des URL absolues. Passer par `imageDe()`, qui les rend relatives, sinon `next/image` plante (« hostname not configured »).
3. **Fichiers privés** (`photos-profil`, `justificatifs`) : utiliser `<img>` et non `next/image`, car l'optimiseur de Next.js n'envoie pas les cookies et reçoit une erreur 403.
4. **Formulaires React 19** : avec `<form action={…}>`, React vide le formulaire après l'envoi, même en cas d'erreur. Utiliser `useFormulaire`, qui passe par `onSubmit`.
5. **Après une Server Action qui change le statut de l'utilisateur**, appeler `revalidatePath('/', 'layout')` avant `redirect()`, sinon l'en-tête garde l'ancien état.
6. **Navigation non intégrée** : une route n'existe que si le fichier s'appelle exactement `page.tsx`. La 404 noire de Next.js signifie qu'aucun fichier n'est trouvé ; la 404 stylée de l'ADAI signifie que la page appelle `notFound()`.
7. **Tests avec `curl`** : sans en-tête `Sec-Fetch-Site`, Payload ignore le cookie (protection CSRF). Tester les pages protégées dans un vrai navigateur.
8. **Champs `richText`** : un éditeur vide n'est pas `null`. Tester avec `aDuTexte()` avant d'afficher.
9. **Dates** : stockées en UTC, affichées avec `Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Tunis' })`. Les formateurs sont dans `lib/evenements.ts`.
10. **Base de données** : chaque développeur a sa propre base. Ne jamais pointer deux environnements de développement sur la même.

## 9. Fonctionnalités à développer (extrait du cahier des charges)

Toutes ces pages sont **réservées aux membres vérifiés et aux admins**. Le contenu proposé par les membres est **soumis à validation** d'un admin avant publication.

### Annuaire `/alumni/annuaire` (§ 4.6)
- Grille de cartes, une par profil de membre vérifié : initiales ou photo, nom, « Promo AAAA · filière », école, poste et entreprise, icônes LinkedIn et e-mail, lien « Voir le profil ».
- Clic sur une carte : fiche complète avec e-mail, LinkedIn, téléphone WhatsApp, bio et disponibilité.
- Barre de recherche textuelle (nom, entreprise) et filtres : promotion, école, secteur d'activité, localisation. La disponibilité est un filtre utile en plus.
- Afficher le nombre de membres. Exclure les profils dont le membre n'est pas vérifié ou est suspendu.

### Retours d'expérience Concours `/ipestiens/retours-experience` (§ 4.5)
- Cartes juxtaposées : initiales, nom, « filière · promotion », école intégrée, extrait du témoignage entre guillemets, bouton « Lire le témoignage » qui ouvre une fenêtre défilante avec le texte complet, sans quitter la page.
- Filtres : filière CPGE, concours, école intégrée, année de promotion, plus une recherche.
- Bouton « Partager mon retour » ouvrant un formulaire : prénom, nom, filière CPGE, école intégrée, année de promotion, témoignage et photo facultative. Mention : « Votre retour est transmis à l'administrateur pour validation avant publication. »
- Admin : valider, refuser ou retirer un témoignage ; textes d'habillage de la page modifiables.

### TIPE `/ipestiens/tipe` (§ 4.5)
- Même aspect que les retours d'expérience. Cartes : matière (badge), titre, thème de l'année, mots-clés, lien de téléchargement (présentation, MCOT, speech), filière, note éventuelle.
- Formulaire « Déposer mon TIPE » : titre, matière, filière, thème de l'année, note obtenue (facultative), mots-clés (étiquettes), PDF de la présentation (obligatoire), PDF du MCOT (obligatoire), PDF du speech (facultatif), PDF de retour d'expérience général (facultatif), option « Rester anonyme ».
- Filtres : thème de l'année, matière, titre, filière.
- Validation par l'admin avant publication. Les PDF doivent être privés (réservés aux membres vérifiés).

### FAQ `/ipestiens/faq` et `/alumni/faq` (§ 4.5, 4.6)
- Liste de questions repliées ; un clic dévoile la réponse (accordéon). Ce n'est pas un forum.
- Champ « Vous ne trouvez pas votre réponse ? » qui envoie la question à l'admin ; l'admin rédige la réponse puis publie ou rejette.
- Les couples question/réponse sont modifiables par l'admin. Un bouton d'aide discret mène à la FAQ depuis les pages Retours d'expérience et TIPE.
- Deux FAQ distinctes (Ipestiens, Alumni) avec le même fonctionnement.

### Back-office (§ 4.8)
- Tableau de bord : nouveaux inscrits par semaine et par mois, comptes en attente de validation, contenus en attente (témoignages, TIPE, questions FAQ), trafic du site.
- Gestion des utilisateurs : valider ou refuser les inscriptions (déjà possible via la collection `membres`), suspendre ou révoquer un compte, réinitialiser un accès (mot de passe oublié).

### Autres éléments à prévoir
- Mot de passe oublié pour les membres, et modification du compte.
- Pages Contact et Mentions légales (déjà liées dans le pied de page et le formulaire d'inscription).
- Paiement de la cotisation et des dons (solution à choisir).
- Mise en production (§ 5) : hébergement, stockage des fichiers en ligne, migrations de base, manuel d'utilisation pour le bureau, dossier technique, coûts récurrents. Privilégier les solutions gratuites et open source.

## 10. Comment travailler sur ce projet

1. **Avant de coder**, résume ta compréhension de la demande et liste les fichiers que tu vas créer ou modifier. Pose une question si le cahier des charges est ambigu.
2. **Procède par petites étapes testables.** Donne le contenu complet des nouveaux fichiers ; pour une modification, indique précisément le passage à remplacer.
3. **Réutilise l'existant** (composants, utilitaires, règles d'accès) au lieu de recréer.
4. **Signale toute modification du schéma** (collection, global, champ) et rappelle de lancer `npm run generate:types`.
5. **Ne touche jamais** à `.env`, `src/app/(payload)/`, `src/payload-types.ts` ni `importMap.js`. Ne jamais affaiblir une règle d'accès existante.
6. **Termine par une procédure de test** : ce qu'il faut lancer, où cliquer, ce qu'on doit observer, et rappelle `npm run typecheck`.
7. Le code est intégré à `main` uniquement par Pull Request, après relecture. Une tâche = une branche.

---

## Modèle pour démarrer une conversation

```
[Coller ici tout le contenu de CONTEXTE_IA.md]

---

Ma tâche : <décris ce que tu veux faire, par ex. « créer la page FAQ des Ipestiens »>.
Ma branche Git : <nom de ta branche>.
Mon niveau : je débute, explique-moi chaque étape et dis-moi exactement quels fichiers créer ou modifier.

Commence par me résumer ce que tu as compris et la liste des fichiers concernés, avant d'écrire du code.
```

Si l'assistant doit modifier un fichier existant, **colle-lui le contenu actuel du fichier** : il ne voit pas ton projet, sauf si tu utilises un outil comme Claude Code ou Cursor, qui lit les fichiers directement.