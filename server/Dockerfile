FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]