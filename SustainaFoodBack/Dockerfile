# Étape 1: Phase de construction
FROM node:18 AS builder

WORKDIR /app

# D'abord copier uniquement les fichiers nécessaires pour les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances (y compris les devDependencies)
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Étape 2: Phase d'exécution
FROM node:18-alpine

WORKDIR /app

# Copier depuis le builder uniquement ce dont on a besoin
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Variables d'environnement (à définir au runtime)
ENV NODE_ENV=production
ENV PORT=8082

# Exposer le port
EXPOSE 8082

# Commande de démarrage
CMD ["npm", "start"]