FROM node:20-alpine

WORKDIR /usr/src/app

# COPIAR para ./ (diretório atual de trabalho) explicitamente
COPY package*.json ./

RUN npm install

# Copia o resto dos arquivos
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# O host é necessário para o Docker mapear a porta corretamente
CMD [ "npm", "run", "dev", "--", "--host" ]