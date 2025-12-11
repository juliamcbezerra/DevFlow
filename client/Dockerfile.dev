FROM node:20-alpine

# Muda para esse diretório
WORKDIR /usr/src/app

# Copia as dependências
COPY package*.json .

# Instala as dependências
RUN npm install

# Roda o projeto
CMD [ "npm", "run", "dev" ]