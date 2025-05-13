# Étape 1: Phase de construction
FROM node:18 AS builder

# Set working directory correctly
WORKDIR /app

# Debug: List files to make sure we're in the right directory
RUN ls -la

# Copy package files first (for better caching)
COPY package*.json ./

# Debug: List files to confirm package.json is copied
RUN ls -la

# Install dependencies
RUN npm install --force

# Copy the rest of the application
COPY . .

# Étape 2: Phase d'exécution
FROM node:18-slim

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app .

# Expose port
EXPOSE 8082

# Command to run
CMD ["npm", "start"]