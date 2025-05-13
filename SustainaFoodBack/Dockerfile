FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Print the working directory and list files for debugging
RUN pwd && ls -la

# Copy package.json and package-lock.json with explicit paths
COPY ./package*.json ./

# Print directory contents again to verify files were copied
RUN pwd && ls -la

# Install app dependencies
RUN npm install --force

# Bundle app source
COPY . .

# Build the app if needed (uncomment if you have a build step)
# RUN npm run build

# Expose port
EXPOSE 8082

# Start the application
CMD [ "npm", "start" ]