# --- Stage 1: Build ---
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Gera o cliente do Prisma (necessário para o build do TS não quebrar)
RUN npx prisma generate

# Faz o build da aplicação NestJS
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine

WORKDIR /app

# Define ambiente de produção
ENV NODE_ENV=production

# Copia arquivos necessários para instalar deps de produção
COPY package*.json ./
COPY prisma ./prisma/

# Instala APENAS dependências de produção (ignora devDependencies)
RUN npm ci --only=production

# Gera o Prisma Client novamente no ambiente final
# (Isso garante que o binário do Prisma seja compatível com a imagem Alpine final)
RUN npx prisma generate

# Copia a pasta 'dist' gerada no Stage 1
COPY --from=builder /app/dist ./dist

# Expõe a porta (ajuste conforme seu main.ts, padrão Nest é 3000)
EXPOSE 3333

# Comando para iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]