import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333', 
  
  // OBRIGATÓRIO: Permite enviar/receber cookies HttpOnly
  withCredentials: true, 
});

// Interceptor para lidar com erros de sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Não autorizado / Sessão expirada');
    }
    return Promise.reject(error);
  }
);

export default api;