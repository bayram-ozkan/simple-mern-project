# Build stage
FROM node:18-alpine

WORKDIR /app

# package.json ve package-lock.json files 
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

COPY . .


# Run the application
CMD ["npm", "start"]
