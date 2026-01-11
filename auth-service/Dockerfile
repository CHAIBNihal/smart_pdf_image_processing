# Étape 1: Dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Étape 2: Builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# Étape 3: Production
FROM node:22-alpine

WORKDIR /app

# Installer dumb-init pour gérer les signaux proprement
RUN apk add --no-cache dumb-init
RUN echo "net.ipv6.conf.all.disable_ipv6 = 1" >> /etc/sysctl.conf && \
    echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.conf && \
    echo "net.ipv6.conf.lo.disable_ipv6 = 1" >> /etc/sysctl.conf
# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copier les dépendances de production
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copier les fichiers buildés
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nestjs:nodejs package*.json ./

# Changer vers l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3333

# Utiliser dumb-init pour gérer les processus
#ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
#CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
CMD ["node", "dist/src/main.js"]