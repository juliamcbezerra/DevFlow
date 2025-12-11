# --- Estágio 1: Build (Builder) ---
# Usamos a imagem completa para instalar dependências e compilar
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (para aproveitar o cache do Docker)
COPY package.json package-lock.json ./

# Instala as dependências (npm ci é mais rápido e seguro para CI/CD que npm install)
RUN npm ci

# Copia o restante do código fonte
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Executa o build do Vite (gera a pasta /dist)
RUN npm run build

# --- Estágio 2: Produção (Runner) ---
# Iniciamos uma nova imagem limpa
FROM node:20-alpine AS runner

WORKDIR /app

# Instala um servidor estático leve globalmente
# O 'serve' é ótimo para servir SPA (Single Page Applications)
RUN npm install -g serve

# Cria um usuário não-root para segurança (boas práticas)
USER node

# Copia APENAS a pasta 'dist' gerada no estágio anterior
# Note o --from=builder
COPY --from=builder /app/dist ./dist

# Expõe a porta que o container vai usar
EXPOSE 5173

# Comando para iniciar o servidor
# -s: Single Page App (redireciona rotas desconhecidas para index.html)
# dist: pasta a ser servida
# -l 5173: porta
CMD ["serve", "-s", "dist", "-l", "5173"]