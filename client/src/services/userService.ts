import api from "./api";

// Tipo para a lista da Comunidade
export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  interestTags: string[];
  _count?: {
    followedBy: number;
  };
}

// Tipo completo para o Perfil Detalhado
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  interestTags: string[];
  _count: {
    followedBy: number;
    following: number;
    posts: number;
  };
  posts: Array<{
    id: string;
    content: any; // O conteúdo do post (JSON ou string)
    createdAt: string;
    _count: { likes: number; comments: number };
  }>;
}

export const userService = {
  // Lista todos (Comunidade)
  getAll: async () => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  // Busca perfil detalhado
  getByUsername: async (username: string) => {
    const { data } = await api.get<UserProfile>(`/users/${username}`);
    return data;
  },

  // Aqui você pode adicionar follow/unfollow futuramente
};