FROM node:20-alpine

WORKDIR /usr/src/app

# Copia nossas dependências para instalar
COPY package*.json ./

RUN npm install

# Copia o schema + migrations p/ manter o banco
COPY prisma ./prisma
# Gera os tipos
RUN npx prisma generate

CMD [ "npm", "run", "start:dev" ]