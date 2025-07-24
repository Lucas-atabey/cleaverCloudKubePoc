# Build React frontend
FROM node:20 AS build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build serveur Node.js
FROM node:20

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Copie build React dans dossier public du serveur
COPY --from=build /app/frontend/dist ./public

RUN mkdir -p ./public/config

# Copie du script d’entrée
COPY server/entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE 3000

# Utilise CMD pour ne pas override ENTRYPOINT
CMD ["./entrypoint.sh"]
