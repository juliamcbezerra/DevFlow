import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração básica do Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
