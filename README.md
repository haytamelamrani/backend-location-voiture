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
| Auth            | JWT + bcryptjs       |
| Sécurité        | helmet, cors         |
| Config          | dotenv               |
| Dev             | nodemon              |
| Conteneurisation| Docker               |

---

## 📁 Architecture du projet (MVC)

```
backend-location-voiture/
├── .env                    # Variables d'environnement (non versionné)
├── .env.example            # Template des variables d'environnement
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
- MongoDB en cours d'exécution

### Installation

```bash
npm install
```

### Configuration

Copier le fichier `.env.example` en `.env` et adapter les valeurs :

```bash
cp .env.example .env
```

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
