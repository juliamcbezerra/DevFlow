import api from "./api";
import { Post } from "./postsService";
import { Project } from "./projectService";

// Tipos para Links Sociais
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

// Tipo para a lista da Comunidade
export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  interestTags: string[];
  // Novos campos opcionais na listagem (se o backend mandar)
  bannerUrl?: string; 
  location?: string;
  
  // Campos da recomendação
  commonTags?: number;
  commonConnections?: number;
  score?: number;
  _count?: {
    followedBy: number;
  };
}

// Tipo para Perfil Completo
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  interestTags: string[];
  
  // --- NOVOS CAMPOS ADICIONADOS ---
  bannerUrl?: string;
  location?: string;
  socialLinks?: SocialLinks;
  // --------------------------------

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
  name?: string;
  bio?: string;
  avatarUrl?: string;
  interestTags?: string[];
  
  // Campos novos necessários para o Onboarding
  bannerUrl?: string;
  location?: string;
  socialLinks?: SocialLinks;
}

export const userService = {
  // 1. Lista Comunidade
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