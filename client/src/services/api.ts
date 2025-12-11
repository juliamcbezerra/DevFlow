/// <reference types="vite/client" />
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, 
  
});

// Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o Backend retornar 401 (Não Autorizado), significa que o Cookie expirou ou é inválido
    if (error.response && error.response.status === 401) {
      console.error('Sessão expirada. Redirecionando para login...');
      
      // Só redireciona se já não estiver na tela de login (para evitar loop)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;