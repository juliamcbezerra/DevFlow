import api from './api';

export const searchService = {
  search: async (query: string) => {
    const { data } = await api.get(`/social/search?q=${query}`);
    return data; // Retorna { users: [], projects: [] }
  }
};