# Étape 1: Phase de construction
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application
COPY . .

# Build if needed (uncomment if you have a build step)
# RUN npm run build

# Étape 2: Phase d'exécution
FROM node:18-slim

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app .

# Expose port
EXPOSE 8082

# Command to run
CMD ["npm", "start"]