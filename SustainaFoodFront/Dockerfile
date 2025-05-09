# Use Node.js 20 for the build stage
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci
RUN npm install react@17.0.2 react-dom@17.0.2
RUN npm install date-fns --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application (assuming Vite outputs to 'dist')
RUN npm run build

# Use Nginx for serving the built application
FROM nginx:alpine

# Copy the built application to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the nginx.conf file into the Nginx container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5173 for the web server
EXPOSE 5173

# Expose port 80 for the web server
EXPOSE 80

# Default command to run Nginx
CMD ["nginx", "-g", "daemon off;"]