# 🚗 Backend Location de Voitures

Backend d'une plateforme de location de voitures développé avec Node.js.  
Fournit une API REST pour la gestion de la flotte de véhicules, des réservations et des utilisateurs.

---

## 📋 Stack Technique

| Composant       | Technologie          |
|-----------------|----------------------|
| Runtime         | Node.js              |
| Framework       | Express.js           |
| Base de données | MongoDB + Mongoose   |
| Sécurité        | helmet, cors         |
| Config          | dotenv               |
| Dev             | nodemon              |
| Conteneurisation| Docker               |

---

## 📁 Architecture du projet (MVC)

```
backend-location-voiture/
├── .env                    # Variables d'environnement (non versionné)
├── .gitignore
├── .dockerignore
├── Dockerfile              # Image Docker de l'API
├── docker-compose.yml      # Orchestration API + MongoDB
├── package.json
├── server.js               # Point d'entrée
└── src/
    ├── app.js              # Configuration Express
    ├── config/
    │   └── db.js           # Connexion MongoDB
    ├── controllers/
    │   ├── authController.js
    │   ├── carController.js
    │   └── rentalController.js
    ├── middlewares/
    │   ├── auth.js          # isAuth, isAdmin
    │   └── errorHandler.js
    ├── models/
    │   ├── User.js
    │   ├── Car.js
    │   └── Rental.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── cars.routes.js
    │   └── rentals.routes.js
    └── utils/
```

---

## 🏃 Méthodologie Agile — Scrum

Ce projet suit la méthodologie **Scrum**. Le développement est découpé en **sprints** successifs.  
À la fin de chaque sprint, une **image Docker** est construite et taguée pour livrer un incrément fonctionnel.

### Sprints prévus

| Sprint   | Objectif                                        | Image Docker                              |
|----------|-------------------------------------------------|-------------------------------------------|
| Sprint 1 | Initialisation du projet + structure MVC        | `location-voitures-api:sprint-1`          |
| Sprint 2 | Authentification (Register, Login, JWT)          | `location-voitures-api:sprint-2`          |
| Sprint 3 | CRUD Véhicules (Admin) + Liste (Client)          | `location-voitures-api:sprint-3`          |
| Sprint 4 | Réservations + vérification de disponibilité     | `location-voitures-api:sprint-4`          |

---

## 🐳 Docker

### Construire l'image Docker (à chaque fin de sprint)

```bash
# Construire et taguer l'image avec le numéro du sprint
docker build -t location-voitures-api:sprint-1 .
```

### Lancer avec Docker Compose (API + MongoDB)

```bash
docker-compose up -d
```

### Vérifier les conteneurs

```bash
docker ps
```

### Arrêter les conteneurs

```bash
docker-compose down
```

---

## 🚀 Lancer en local (sans Docker)

### Prérequis
- Node.js installé
- MongoDB en cours d'exécution ou un cluster MongoDB Atlas accessible

### Installation

```bash
npm install
```

### Configuration

Créer un fichier `.env` à la racine du backend s'il n'existe pas déjà,
puis adapter les valeurs (conserver la configuration existante sinon) :

```dotenv
PORT=5000
NODE_ENV=development
DATABASE_URL="mongodb+srv://<utilisateur>:<mot-de-passe>@<cluster>/location-voitures?retryWrites=true&w=majority"
JWT_SECRET=<secret-aleatoire>
JWT_EXPIRES_IN=7d
```

Pour MongoDB Atlas, renseigner `DATABASE_URL` dans `.env` avec l'URI du
cluster, en précisant la base `/location-voitures` avant les paramètres `?`.
Si le fichier fourni par Atlas utilise `MONGODB_URI`, copier sa valeur dans
`DATABASE_URL`. Le fichier `.env` contient des identifiants et reste exclu de Git.

Dans Atlas, autoriser l'adresse IP de la machine dans **Network Access** et
vérifier que l'utilisateur de base de données dispose des droits nécessaires
sur `location-voitures` dans **Database Access**.

Le serveur attend la connexion à MongoDB avant d'écouter sur le port 5000.
En cas d'échec, il s'arrête avec un message sans identifiants. Docker Compose
utilise sa propre base MongoDB locale définie dans `docker-compose.yml`.

### Vérifier la connexion MongoDB

Depuis le dossier `backend-location-voiture`, lancer :

```powershell
npm.cmd run db:check
```

Cette commande charge le `.env` du backend et exécute un `ping`, sans modifier
les données. Elle affiche la base connectée en cas de succès, ou un diagnostic
sans identifiants en cas d'échec, puis se ferme. Le délai total est limité à 25 secondes.
Sous PowerShell, `npm.cmd` permet d'utiliser npm même si les scripts `.ps1`
sont désactivés ; sur les autres systèmes, utiliser `npm run db:check`.

En cas d'échec réseau ou TLS, vérifier d'abord que l'IP actuelle est autorisée
dans Atlas : **Network Access > Add IP Address > Add Current IP Address**,
puis relancer le diagnostic. Vérifier également le VPN ou le pare-feu si besoin.
Voir la [documentation de connexion Atlas](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).

Le chemin des données est : **frontend → API du backend → MongoDB**.
L'URI MongoDB reste uniquement dans le backend. Dans cette version du projet,
les modèles et routes métier sont encore à implémenter, et le frontend contient
l'écran initial de Vite : une connexion réussie ne suffit donc pas encore à
afficher des voitures ou enregistrer des réservations.

### Démarrage

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

---

## 📡 Endpoints API (préfixe : `/api/v1`)

### Auth — `/api/v1/auth`
| Méthode | Route       | Accès    | Description                    |
|---------|-------------|----------|--------------------------------|
| POST    | `/register` | Public   | Inscription                    |
| POST    | `/login`    | Public   | Connexion (retourne un JWT)    |
| GET     | `/me`       | Privé    | Profil de l'utilisateur connecté |

### Cars — `/api/v1/cars`
| Méthode | Route   | Accès    | Description              |
|---------|---------|----------|--------------------------|
| GET     | `/`     | Public   | Liste des voitures       |
| GET     | `/:id`  | Public   | Détail d'une voiture     |
| POST    | `/`     | Admin    | Ajouter une voiture      |
| PUT     | `/:id`  | Admin    | Modifier une voiture     |
| DELETE  | `/:id`  | Admin    | Supprimer une voiture    |

### Rentals — `/api/v1/rentals`
| Méthode | Route          | Accès          | Description                |
|---------|----------------|----------------|----------------------------|
| POST    | `/`            | Client         | Créer une réservation      |
| GET     | `/my`          | Client         | Mes réservations           |
| GET     | `/`            | Admin          | Toutes les réservations    |
| PATCH   | `/:id/cancel`  | Client/Admin   | Annuler une réservation    |
