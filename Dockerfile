# Utiliser une image de base officielle Node.js
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port (ex: 3000)
EXPOSE 3000

# Commande pour lancer le serveur
CMD ["npm", "start"]

