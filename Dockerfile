# Fetching the minified node image
FROM node:slim

# Setting up the work directory
WORKDIR /app

# Copying necessary files
COPY package*.json ./

# Installing dependicies
RUN npm install

COPY . .

# Starting our application
CMD ["npm", "start"]

# Exposing server port
EXPOSE 3000