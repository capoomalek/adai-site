# Site web de l'ADAI

Site de l'**Association Des Anciens de l'IPEST** : vitrine publique de l'association et de l'institut, espace privé pour les ipestiens et alumni (annuaire, retours d'expérience, TIPE, FAQ) et back-office permettant au bureau de tout modifier sans toucher au code.

Ce document explique **comment installer le projet**, **comment il fonctionne** et **comment y contribuer**. Il est écrit pour être suivi même si tu débutes avec Git ou le développement web : lis-le dans l'ordre la première fois.

---

## Sommaire

1. [La stack technique](#1-la-stack-technique)
2. [Installer les outils (une seule fois)](#2-installer-les-outils-une-seule-fois)
3. [Récupérer le projet](#3-récupérer-le-projet)
4. [Lancer le projet en local](#4-lancer-le-projet-en-local)
5. [Les commandes utiles](#5-les-commandes-utiles)
6. [Comment fonctionne le site](#6-comment-fonctionne-le-site)
7. [La structure des dossiers](#7-la-structure-des-dossiers)
8. [Les fonctionnalités implémentées](#8-les-fonctionnalités-implémentées)
9. [Contribuer au projet](#9-contribuer-au-projet)
10. [Dépannage](#10-dépannage)

---

## 1. La stack technique

| Brique | Outil | Rôle dans le projet |
|---|---|---|
| Framework web | [Next.js 16](https://nextjs.org/docs) (React 19) | Affiche les pages du site, côté serveur et navigateur |
| Back-office et données | [Payload CMS 3](https://payloadcms.com/docs) | Interface d'administration, comptes, droits d'accès, fichiers |
| Base de données | PostgreSQL 16 | Stocke tout : comptes, contenus, événements, profils |
| Style | [Tailwind CSS 4](https://tailwindcss.com/docs) | Mise en forme avec les couleurs de la charte ADAI |
| E-mails | [Resend](https://resend.com) | Codes de vérification et notifications (en production) |
| Langage | TypeScript | JavaScript avec vérification des types |

Next.js et Payload tournent **dans la même application** : une seule commande lance le site public (`http://localhost:3000`) et le back-office (`http://localhost:3000/admin`).

---

## 2. Installer les outils (une seule fois)

Installe ces logiciels, puis vérifie-les avec les commandes indiquées. Sous Windows, ouvre **PowerShell** ou le terminal de VS Code pour taper les commandes.

| Outil | Pourquoi | Téléchargement | Vérifier avec |
|---|---|---|---|
| **Git** | Récupérer et partager le code | https://git-scm.com/downloads | `git --version` |
| **Node.js 20 ou plus** (version LTS) | Faire tourner le projet | https://nodejs.org | `node -v` |
| **Docker Desktop** *(facultatif)* | Base de données locale : seulement si tu choisis l'option B de la section 4 | https://www.docker.com/products/docker-desktop | `docker --version` |
| **VS Code** | Éditer le code | https://code.visualstudio.com | — |

Ensuite, **présente-toi à Git**. Ce nom et cet e-mail apparaîtront sur chacune de tes modifications ; utilise l'e-mail de ton compte GitHub :

```bash
git config --global user.name "Prénom Nom"
git config --global user.email "ton.email@exemple.com"
```

Crée aussi un compte sur https://github.com si tu n'en as pas.

> **Extensions VS Code conseillées** : *ESLint*, *Tailwind CSS IntelliSense*, *Prettier*. VS Code te les proposera à l'ouverture du projet.

---

## 3. Récupérer le projet

1. Accepte l'invitation au dépôt : tu la reçois par e-mail ou dans tes notifications GitHub.
2. Place-toi dans le dossier où tu ranges tes projets, puis clone le dépôt :

```bash
git clone https://github.com/capoomalek/adai-site.git
cd adai-site
code .
```

`code .` ouvre le projet dans VS Code. Sinon : *Fichier > Ouvrir le dossier…* et choisis `adai-site`.

Au premier `git push`, Windows ouvre une fenêtre de connexion GitHub dans le navigateur : accepte-la.

---

## 4. Lancer le projet en local

### Étape 1 : le fichier d'environnement

Le fichier `.env` contient les réglages et secrets de **ta** machine. Il n'est jamais envoyé sur GitHub. On le crée à partir du modèle `.env.example` :

```bash
cp .env.example .env
```

Ouvre `.env` et remplace la valeur de `PAYLOAD_SECRET` par une longue chaîne aléatoire. Pour en générer une :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Laisse `RESEND_API_KEY` vide : en local, les e-mails ne sont pas envoyés mais **affichés dans le terminal** (voir plus bas).

### Étape 2 : la base de données

Le site a besoin d'une base PostgreSQL. **Chaque développeur a la sienne** : ne partagez jamais la même base. Quand l'un de vous ajoute un champ sur sa branche, Payload modifie automatiquement la structure de la base, ce qui casserait celle de l'autre.

**Option A, la plus simple : une base gratuite en ligne sur Neon.** Rien à installer.

1. Crée un compte sur https://neon.tech (offre gratuite), puis **New project**. Choisis la région la plus proche (Frankfurt, par exemple).
2. Sur la page du projet, clique sur **Connect** et copie la *connection string*. Elle commence par `postgresql://` et finit par `?sslmode=require`.
3. Colle-la dans `.env`, à la place de la valeur de `DATABASE_URL` :
   ```
   DATABASE_URL=postgresql://utilisateur:motdepasse@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

**Option B : une base locale avec Docker.** Elle fonctionne sans internet. Lance **Docker Desktop**, attends qu'il indique « Running », puis :

```bash
docker compose up -d
```

Cette commande démarre une base PostgreSQL vide en arrière-plan, configurée dans `docker-compose.yml`. La valeur de `DATABASE_URL` déjà présente dans `.env.example` correspond à cette base : tu n'as rien à changer.

### Étape 3 : les dépendances

```bash
npm install
```

Cette commande télécharge toutes les bibliothèques dans le dossier `node_modules`. Elle prend une à deux minutes la première fois.

### Étape 4 : les données de démonstration (facultatif mais conseillé)

```bash
npm run seed
```

Cette commande ajoute des actualités, des événements, un pied de page rempli et deux comptes membres de test. Tu peux la relancer sans risque : elle ne crée pas de doublons.

### Étape 5 : lancer le site

```bash
npm run dev
```

Attends le message `Ready`, puis ouvre :

- le  site : **http://localhost:3000**
- le back-office : **http://localhost:3000/admin**

Le  premier affichage de chaque page prend quelques secondes, le temps que Next.js la compile.

### Étape 6 : créer ton compte administrateur

À la première ouverture de `/admin`, Payload propose de **créer le premier utilisateur**. Ce compte devient automatiquement **Super-Administrateur** de ta base locale. Ta base est indépendante de celle des autres développeurs : chacun crée son propre compte admin local.

### Les comptes de test

Créés par `npm run seed`, avec le mot de passe `Membre1234!` :

| E-mail | Situation | Ce qu'il voit |
|---|---|---|
| `membre@adai.test` | Membre vérifié | Tout, y compris « Pour les Ipestiens » et « Pour les Alumni » |
| `attente@adai.test` | Vérification en attente | Le site public et son espace, pas les rubriques réservées |

Ils se connectent sur **http://localhost:3000/connexion**, et pas sur `/admin`, qui est réservé aux administrateurs.

### Où trouver les codes de vérification ?

Tant que `RESEND_API_KEY` est vide, chaque e-mail s'affiche dans le **terminal où tourne `npm run dev`**, avec le code directement dans l'objet :

```
INFO: Email attempted without being configured. To: 'toi@gmail.com', Subject: '482913 est votre code de vérification ADAI'
```

### Arrêter proprement

- `Ctrl + C` dans le terminal arrête le site.
- Avec Docker (option B) : `docker compose stop` arrête la base, et ses données sont conservées. `docker compose down -v` **efface** la base pour repartir de zéro.

### Les jours suivants

Tout est déjà installé : lance `npm run dev`. Avec Docker (option B), lance d'abord Docker Desktop, puis `docker compose up -d`.

---

## 5. Les commandes utiles

| Commande | Ce qu'elle fait | Quand l'utiliser |
|---|---|---|
| `npm run dev` | Lance le site en mode développement | Pour travailler |
| `npm run seed` | Ajoute les données de démonstration | Après une base neuve |
| `npm run generate:types` | Régénère `src/payload-types.ts` | **Après chaque modification** d'une collection ou d'un global |
| `npm run typecheck` | Vérifie qu'il n'y a pas d'erreur TypeScript | Avant chaque Pull Request |
| `npm run lint` | Vérifie le style et les erreurs courantes | Avant chaque Pull Request |
| `npm run build` | Construit la version de production | Pour vérifier que tout compile |
| `docker compose up -d` | Démarre la base locale (option B) | Au début de chaque session |
| `docker compose down -v` | Efface complètement la base locale (option B) | Pour repartir de zéro |

---

## 6. Comment fonctionne le site

### 6.1 Vue d'ensemble

```mermaid
flowchart LR
    V[Visiteur / membre] -->|pages du site| F["Next.js<br/>src/app/(frontend)"]
    A[Administrateur] -->|/admin| B["Back-office Payload<br/>src/app/(payload)"]
    F -->|API locale| P[Payload<br/>collections, globals, droits d'accès]
    B --> P
    P --> DB[(PostgreSQL)]
    P --> FS[Fichiers téléversés<br/>/media et /prive]
    P -->|e-mails| R[Resend<br/>ou terminal en local]
```

- **Les pages du site** (`src/app/(frontend)`) sont des composants React rendus **côté serveur**. Pour lire les données, elles appellent directement Payload via son « API locale » (`payload.find(...)`, `payload.findGlobal(...)`), sans passer par des requêtes HTTP.
- **Le back-office** (`/admin`) est généré automatiquement par Payload à partir de la description des données. On ne code pas ses écrans : on décrit des **collections** et des **globals**, et Payload construit les formulaires.
- **Les formulaires du site** (inscription, profil) envoient leurs données à des **Server Actions** : des fonctions `'use server'` exécutées sur le serveur, qui vérifient tout avant d'écrire en base.

### 6.2 Collections et globals

Toutes les données sont décrites dans `src/collections` et `src/globals`.

| Type | Définition | Exemples dans le projet |
|---|---|---|
| **Collection** | Une liste d'éléments du même type (comme une table) | `evenements`, `actualites`, `membres`, `profils` |
| **Global** | Un contenu unique, modifié en un seul endroit | `pied-de-page`, `en-tete`, `pages-ipest`, `page-association` |

Pour rendre un texte du site modifiable par le bureau, on ajoute un **champ** dans la collection ou le global concerné, puis on l'affiche dans la page. C'est ce qui répond à la règle du cahier des charges : « modifiable depuis l'interface Admin, sans intervention sur le code ».

### 6.3 Les deux types de comptes

| | Administrateurs (`admins`) | Membres (`membres`) |
|---|---|---|
| Qui | Membres du bureau | Ipestiens et alumni |
| Se connectent sur | `/admin` | `/connexion` |
| Créés par | Le Super-Administrateur | Eux-mêmes, via `/inscription` |
| Rôles | `superadmin` ou `admin` | — (un statut de vérification) |

- Le **premier compte admin** créé devient automatiquement `superadmin`. Seul un `superadmin` peut créer ou désactiver d'autres admins, et il est impossible de supprimer le dernier `superadmin`. C'est le protocole de passation du cahier des charges (section 5.2).
- Le site et le back-office partagent **le même cookie de session**. Dans un même navigateur, on est connecté soit en admin, soit en membre. Pour tester les deux, utilise une fenêtre de navigation privée.

### 6.4 Qui voit quoi : les règles d'accès

Les règles sont centralisées dans `src/access/roles.ts` et appliquées par Payload à chaque lecture ou écriture, y compris pour les fichiers.

| Contenu | Visiteur | Membre non vérifié | Membre vérifié | Admin |
|---|:---:|:---:|:---:|:---:|
| Pages publiques, événements, actualités | ✅ | ✅ | ✅ | ✅ |
| Onglets « Pour les Ipestiens » / « Pour les Alumni » | ❌ | ❌ | ✅ | ✅ |
| Lien WhatsApp | ❌ | ❌ | ✅ | ✅ |
| Profils de l'annuaire et photos de profil | ❌ | son profil seulement | ✅ | ✅ |
| Justificatifs d'inscription | ❌ | ❌ | ❌ | ✅ |
| Back-office `/admin` | ❌ | ❌ | ❌ | ✅ |

La fonction `getSession()` (`src/lib/payload.ts`) renvoie l'utilisateur connecté et son niveau d'accès : `visiteur`, `en_attente`, `membre` ou `admin`. L'en-tête s'en sert pour afficher ou masquer les onglets réservés.

### 6.5 Le parcours d'inscription

Le parcours est dans `src/app/(frontend)/inscription`. L'écran affiché est **déduit de l'état du compte en base** : on peut fermer la page et reprendre plus tard, au même endroit, en se reconnectant.

```mermaid
flowchart TD
    A[1. Formulaire<br/>nom, année, e-mail, mot de passe] --> B[2. Code envoyé<br/>sur l'e-mail personnel]
    B --> C{3. Appartenance à l'IPEST}
    C -->|Option 1| D[Code envoyé sur<br/>nom.prenom@ipest.ucar.tn]
    C -->|Option 2| E[Justificatif : texte et/ou document]
    D --> V[Statut : vérifié]
    E --> W[Statut : en attente<br/>+ e-mail aux admins]
    W -->|un admin valide| V
    W -->|un admin refuse| C
    V --> P[4. Profil annuaire<br/>facultatif]
    W --> P
    P --> F[Écran final]
```

- Les codes à 6 chiffres sont **hachés** en base, valables **15 minutes**, limités à **5 essais**, avec 1 minute d'attente entre deux envois (`src/lib/inscription/codes.ts`).
- Quand un admin passe le statut d'un membre à « Vérifié » ou « Refusé » dans le back-office, un e-mail part automatiquement. C'est le hook `afterChange` de `src/collections/Membres.ts`.

### 6.6 Les fichiers téléversés

| Dossier | Contenu | Accès |
|---|---|---|
| `/media` | Images publiques (logo, photos des pages, événements) | Tout le monde |
| `/prive/justificatifs` | Documents envoyés à l'inscription | Admins uniquement |
| `/prive/photos-profil` | Photos de l'annuaire | Membres vérifiés, propriétaire, admins |

Ces dossiers ne sont **pas** sur GitHub : chacun a les siens en local. Les fichiers privés passent par l'URL `/api/<collection>/file/...`, qui vérifie les droits avant de les envoyer.

### 6.7 Quelques règles automatiques

- **Événements** : un événement passe de « à venir » à « passé » dès que sa date de fin est dépassée (ou, à défaut, sa date de début). La comparaison se fait à chaque visite.
- **Carrousel de l'accueil** : il affiche les prochains événements, puis les actualités (*ADAI News*) et les événements terminés des 15 derniers jours.
- **Navigation** : l'arborescence du menu et du pied de page est définie une seule fois, dans `src/lib/navigation.ts`.
- **Dates** : elles sont stockées en UTC et affichées dans le fuseau `Africa/Tunis`.

---

## 7. La structure des dossiers

```
adai-site/
├── .env.example              Modèle des variables d'environnement (à copier en .env)
├── docker-compose.yml        Base PostgreSQL locale
├── package.json              Dépendances et commandes npm
├── public/
│   └── fonts/                Polices de la charte (voir le README du dossier)
└── src/
    ├── payload.config.ts     ★ Configuration centrale : collections, globals, base, e-mails
    ├── payload-types.ts      Types générés automatiquement (ne pas modifier à la main)
    ├── seed.ts               Données de démonstration (npm run seed)
    │
    ├── access/
    │   └── roles.ts          Règles d'accès réutilisables (estAdmin, estMembreVerifie…)
    ├── collections/          Les listes de données
    │   ├── Admins.ts           Comptes du back-office
    │   ├── Membres.ts          Comptes ipestiens et alumni + vérification
    │   ├── Profils.ts          Profils de l'annuaire
    │   ├── PhotosProfil.ts     Photos de l'annuaire (privées)
    │   ├── Justificatifs.ts    Documents d'inscription (privés)
    │   ├── Media.ts            Images publiques
    │   ├── Actualites.ts       ADAI News
    │   └── Evenements.ts       Nos activités
    ├── globals/              Les contenus uniques
    │   ├── EnTete.ts           Logo, image de fond
    │   ├── PiedDePage.ts       Pied de page
    │   ├── Parametres.ts       Liens cotisation, don, WhatsApp
    │   ├── PageAssociation.ts  Page « L'Association »
    │   └── PagesIpest.ts       Les 6 pages « L'IPEST »
    ├── fields/
    │   └── contenu.ts        Champs réutilisables (texte riche, photo, blocs)
    │
    ├── lib/                  Fonctions utilitaires (pas d'affichage)
    │   ├── payload.ts          getPayloadClient(), getSession()
    │   ├── navigation.ts       Arborescence du menu
    │   ├── media.ts            URL des images
    │   ├── evenements.ts       Dates, filtres « à venir » / « passés »
    │   ├── profil.ts           Listes du profil (secteurs, disponibilités)
    │   ├── contenu.ts          Lecture des pages IPEST
    │   └── inscription/        Codes, e-mails, adresse IPEST, connexion
    ├── actions/
    │   └── profil.ts         Server Actions du profil annuaire
    ├── components/           Morceaux d'interface réutilisables
    │   ├── entete/             En-tête et menus
    │   ├── PiedDePage.tsx
    │   ├── accueil/            Carrousel des actualités
    │   ├── activites/          Cartes d'événements
    │   ├── contenu/            Blocs photo + texte, tableaux, texte riche
    │   ├── ipest/              Sous-navigation, schéma des filières
    │   └── profil/             Formulaire du profil annuaire
    │
    └── app/
        ├── (frontend)/       ★ Les pages du site (une URL = un dossier avec page.tsx)
        │   ├── layout.tsx        Gabarit commun : en-tête + pied de page
        │   ├── page.tsx          Accueil                       → /
        │   ├── styles.css        Charte graphique (couleurs, polices)
        │   ├── association/      → /association
        │   ├── ipest/            → /ipest, /ipest/histoire, /ipest/campus…
        │   ├── activites/        → /activites et /activites/[id]
        │   ├── connexion/        → /connexion
        │   ├── inscription/      → /inscription (parcours complet)
        │   └── mon-espace/       → /mon-espace et /mon-espace/profil
        └── (payload)/        Back-office généré par Payload : ne pas modifier
```

**La règle d'or de Next.js** : une URL correspond à un dossier contenant un fichier nommé exactement `page.tsx`. Par exemple, `src/app/(frontend)/mon-espace/profil/page.tsx` donne l'adresse `/mon-espace/profil`. Les dossiers entre parenthèses, comme `(frontend)`, regroupent des pages sans apparaître dans l'URL.

---

## 8. Les fonctionnalités implémentées

Les numéros renvoient aux sections du cahier des charges.

### Fait

- [x] **Gabarit (4.1)** : en-tête fixe avec menus déroulants, version mobile, affichage selon la connexion ; pied de page modifiable.
- [x] **Accueil (4.1)** : image de fond modifiable, carrousel des actualités et événements.
- [x] **L'Association (4.2)** : page unique avec ancres, textes, photos et composition du bureau modifiables.
- [x] **L'IPEST (4.3)** : présentation, histoire, campus, admission et cursus (statistiques, schéma des filières, tableaux), concours, après l'IPEST (écoles et écoles boursières).
- [x] **Nos activités (4.4)** : événements à venir et passés (bascule automatique), recherche, fiche détaillée, galerie, bouton « Ajouter un événement » pour les admins.
- [x] **Connexion des membres**, avec blocage des comptes suspendus.
- [x] **Inscription (4.7)** : formulaire, code par e-mail, vérification par @ipest.ucar.tn ou justificatif, notification des admins, e-mail de décision.
- [x] **Profil annuaire (4.7)** : création facultative à l'inscription, modification et suppression depuis Mon espace, photo privée.
- [x] **Mon espace** : informations du compte, statut de vérification, profil annuaire.
- [x] **Back-office** : rôles Super-Admin et Admin délégué, protection du dernier Super-Admin, tous les contenus ci-dessus modifiables.

### À venir

- [ ] Annuaire (4.6) : cartes, recherche, filtres, fiche complète.
- [ ] Retours d'expérience Concours et TIPE (4.5), avec validation par l'admin.
- [ ] FAQ Ipestiens et Alumni (4.5, 4.6).
- [ ] Tableau de bord du back-office (4.8).
- [ ] Mot de passe oublié et modification du compte.
- [ ] Paiement des cotisations et dons.
- [ ] Pages Contact et Mentions légales.
- [ ] Mise en production : hébergement, nom de domaine, stockage des fichiers, migrations de base, manuel admin (section 5).

---

## 9. Contribuer au projet

### 9.1 Le cycle de travail

La branche `main` contient la version validée du site. **Elle est protégée** : GitHub refuse tout envoi direct dessus. Chaque tâche se fait donc sur une **branche**, puis on propose de l'intégrer à `main` avec une **Pull Request** (PR). Le responsable du projet relit, approuve et fusionne. Rien n'entre dans `main` sans cette validation.

```
main ───────────────●──────────────────●────▶   (version validée)
                     \                /
 ta branche           ●───●───●───────▶  Pull Request → relecture → fusion
                     tes commits
```

**① Partir de la dernière version**

```bash
git checkout main
git pull
```

**② Créer une branche pour ta tâche**

```bash
git checkout -b annuaire-filtres
```

Donne-lui un nom court qui décrit la tâche, par exemple `page-faq` ou `correction-carrousel`.

**③ Coder, puis vérifier**

```bash
npm run typecheck
```

Si tu as modifié une collection ou un global, lance d'abord `npm run generate:types`. Teste aussi tes changements dans le navigateur.

**④ Enregistrer et envoyer**

```bash
git status
git add .
git commit -m "Ajoute les filtres par promotion dans l'annuaire"
git push -u origin annuaire-filtres
```

`git status` montre les fichiers modifiés : vérifie qu'aucun fichier `.env` n'apparaît. Le message de commit dit **ce que fait** le changement, au présent. Le `-u` n'est utile qu'au premier envoi de la branche ; ensuite, `git push` suffit.

**⑤ Ouvrir la Pull Request**

Sur la page du dépôt, un bandeau jaune propose **Compare & pull request**. Clique dessus, décris en deux lignes ce que tu as fait et comment le tester, puis **Create pull request**.

La PR affiche alors *Review required* : c'est normal, elle attend l'approbation du responsable. Il relit les modifications (onglet *Files changed*), puis les approuve et les fusionne, ou laisse des commentaires.

Pour corriger après une remarque : modifie le code sur la même branche, puis `git add .`, `git commit` et `git push`. La PR se met à jour toute seule.

**⑥ Après la fusion**

```bash
git checkout main
git pull
git branch -d annuaire-filtres
```

Ton travail est maintenant dans `main`. Reviens à l'étape ① pour la tâche suivante.

### 9.2 Récupérer le travail de l'autre pendant ta tâche

```bash
git checkout main
git pull
git checkout annuaire-filtres
git merge main
```

S'il y a un **conflit** (Git ne sait pas quelle version garder), VS Code surligne les zones concernées et propose « Accept Current », « Accept Incoming » ou « Accept Both ». Choisis, enregistre, puis `git add .` et `git commit`. En cas de doute, demande avant de trancher.

### 9.3 « J'ai travaillé directement sur `main` »

Si tu as oublié de créer une branche, ton `git push` est refusé avec un message comme celui-ci :

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
```

Pas de panique, rien n'est perdu. Déplace ton travail sur une nouvelle branche, puis remets `main` à l'état de GitHub :

```bash
git checkout -b ma-tache
git push -u origin ma-tache
git checkout main
git reset --hard origin/main
```

Ouvre ensuite la Pull Request depuis `ma-tache`, comme à l'étape ⑤.

### 9.4 Travailler avec une IA

Le fichier [`CONTEXTE_IA.md`](CONTEXTE_IA.md) résume tout le projet pour un assistant de code (Claude, ChatGPT, Cursor…) : stack, architecture, conventions, pièges connus et fonctionnalités à venir. Il explique aussi comment démarrer une conversation. Relis toujours le code proposé et teste-le avant de le commiter : c'est toi qui le soumets dans la Pull Request.

### 9.5 Les règles du projet

- **Ne jamais commiter `.env`**, ni aucun mot de passe ou clé. Seul `.env.example` est partagé, sans vraies valeurs.
- **Ne pas modifier** `src/app/(payload)/`, `src/payload-types.ts` ni `importMap.js` à la main : ils sont générés.
- **Nommer en français**, comme le reste du code (`evenements`, `estMembreVerifie`, `FormulaireProfil`), pour rester cohérent avec le cahier des charges.
- **Utiliser la charte** : les couleurs Tailwind `charcoal`, `cornflower`, `ghost`, `banana`, `bubblegum` et les polices `font-titre`, `font-sous-titre`, `font-corps`. Évite les couleurs en dur.
- **Tout ce que le bureau doit pouvoir modifier passe par un champ Payload**, jamais par du texte écrit dans le code.
- **Toujours vérifier les droits côté serveur** : un bouton masqué ne protège rien. Les règles d'accès sont dans `src/access/roles.ts`.
- Une PR = un sujet. Une petite PR est relue plus vite.

### 9.6 Recette : ajouter un champ modifiable par le bureau

Exemple : ajouter un sous-titre à la page « L'Association ».

1. Ajoute le champ dans `src/globals/PageAssociation.ts` :
   ```ts
   { name: 'sousTitre', label: 'Sous-titre', type: 'text' },
   ```
2. Lance `npm run generate:types`.
3. Affiche-le dans `src/app/(frontend)/association/page.tsx`, par exemple `{quiSommesNous?.sousTitre}`.
4. Redémarre `npm run dev` : Payload ajoute la colonne en base tout seul (en développement).
5. Remplis le champ dans `/admin` et vérifie le résultat sur le site.

### 9.7 Les commandes Git essentielles

| Commande | Ce qu'elle fait |
|---|---|
| `git status` | Montre les fichiers modifiés et la branche actuelle |
| `git diff` | Montre le détail des modifications non enregistrées |
| `git log --oneline` | Liste les derniers commits |
| `git branch` | Liste tes branches (l'actuelle est marquée d'un `*`) |
| `git checkout nom-de-branche` | Change de branche |
| `git restore fichier` | Annule les modifications non commitées d'un fichier |
| `git stash` / `git stash pop` | Met de côté puis reprend des modifications en cours |

---

## 10. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `cannot connect to Postgres` / `ECONNREFUSED` | La base est injoignable | Option A : vérifier `DATABASE_URL` dans `.env` et la connexion internet. Option B : lancer Docker Desktop, puis `docker compose up -d` |
| `port 3000 already in use` | Un ancien serveur tourne encore | Fermer les autres terminaux, ou utiliser le port indiqué (souvent 3001) |
| « Non autorisé » sur `/admin` | Tu es connecté avec un compte **membre** | Cliquer sur « Se déconnecter », puis se connecter avec le compte admin |
| Pas de code de vérification reçu | En local, les e-mails ne partent pas | Le chercher dans le terminal de `npm run dev` (ligne `Subject:`) |
| Page 404 **noire** (celle de Next.js) | Le fichier `page.tsx` est mal placé ou mal nommé | Vérifier le chemin et le nom exact `page.tsx`, puis relancer `npm run dev` |
| Erreur TypeScript sur un champ qui existe pourtant | Les types ne sont pas à jour | `npm run generate:types` |
| Erreur `SugoClassic.woff2 404` dans la console | La police des titres n'est pas encore ajoutée | Sans gravité : voir `public/fonts/README.md` |
| Avertissement « hydration mismatch » | Une extension du navigateur modifie la page | Sans gravité : vérifier en navigation privée |
| Comportement étrange après de gros changements | Cache de Next.js | Arrêter le serveur, supprimer le dossier `.next`, relancer `npm run dev` |

Toujours bloqué ? Ouvre une **Issue** sur le dépôt officiel (onglet *Issues* > *New issue*) avec : ce que tu as fait, ce que tu attendais, ce qui s'est passé, et une capture du message d'erreur.