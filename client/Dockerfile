FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

USER node

COPY --from=builder /app/dist ./dist

EXPOSE 5173

# Comando para iniciar o servidor
# -s: Single Page App (redireciona rotas desconhecidas para index.html)
# dist: pasta a ser servida
# -l 5173: porta
CMD ["serve", "-s", "dist", "-l", "5173"]