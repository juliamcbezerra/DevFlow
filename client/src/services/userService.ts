import api from "./api";
import { Post } from "./postsService";
import { Project } from "./projectService";

// Tipo para a lista da Comunidade
export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  interestTags: string[];
  // Campos novos da recomendação
  commonTags?: number;
  commonConnections?: number;
  score?: number;
  _count?: {
    followedBy: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  interestTags: string[];
  _count: {
    followedBy: number;
    following: number;
    posts: number;
    projectsOwned: number;
  };
  isFollowing: boolean;
  isMe: boolean;
}

export interface UpdateProfileData {
  bio?: string;
  avatarUrl?: string;
  interestTags?: string[];
}

export const userService = {
  // 1. Lista Comunidade (Aceita Filtro)
  getAll: async (type: 'foryou' | 'following' = 'foryou') => {
    const { data } = await api.get<User[]>(`/users?type=${type}`);
    return data;
  },

  // 2. Perfil Detalhado
  getByUsername: async (username: string) => {
    const { data } = await api.get<UserProfile>(`/users/${username}`);
    return data;
  },

  // 3. Posts do Usuário
  getUserPosts: async (username: string) => {
    const { data } = await api.get<Post[]>(`/social/posts/user/${username}`);
    return data;
  },

  // 4. Projetos do Usuário
  getUserProjects: async (username: string) => {
    const { data } = await api.get<Project[]>(`/projects/user/${username}`);
    return data;
  },

  // 5. Toggle Follow
  toggleFollow: async (username: string) => {
    await api.post(`/users/${username}/follow`);
  },

  // 6. Atualizar Perfil
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  }
};