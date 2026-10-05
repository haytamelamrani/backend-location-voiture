FROM node:20-alpine

WORKDIR /app

# Arguments de build avec valeurs par défaut
ARG PORT=5000
ARG NODE_ENV=production
ARG CLIENT_URL=http://localhost:5173

# Variables d'environnement pour le runtime
ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}
ENV CLIENT_URL=${CLIENT_URL}

# Copie des manifests de dépendances
COPY package*.json ./

# Installation propre des dépendances de production
RUN npm ci --omit=dev || npm install --omit=dev

# Copie du code source applicatif
COPY . .

# Exposition du port du serveur Express
EXPOSE ${PORT}

# Démarrage de l'API
CMD ["node", "server.js"]
