# Build stage: Geliştirme ortamında bağımlılıkların yüklenmesi
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Production stage: Sadece gerekli dosyalar
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN npm prune --production && npm cache clean --force

# Expose the port
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
