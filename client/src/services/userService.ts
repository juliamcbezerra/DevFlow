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

// Tipo de Usuário Básico (para listagens)
export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  interestTags: string[];
  bannerUrl?: string; 
  location?: string;
  
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
  
  bannerUrl?: string;
  location?: string;
  socialLinks?: SocialLinks;
  // 💡 ESTE CAMPO VEM DO BACK-END após o Onboarding ser concluído
  onboardingCompleted: boolean; 

  _count: {
    followedBy: number;
    following: number;
    posts: number;
    projectsOwned: number;
  };
  isFollowing: boolean;
  isMe: boolean;
}

// Tipo de dados que o cliente envia para atualizar o perfil
export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  interestTags?: string[];
  
  bannerUrl?: string;
  location?: string;
  socialLinks?: SocialLinks;
  // 🛑 REMOVIDO: onboardingCompleted, para evitar o erro 400.
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

  // 6. Atualizar Perfil (Geral)
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>('/users/me', data);
    return response.data;
  },
  
  // 💥 7. NOVO MÉTODO: Finalizar Onboarding
  // Esta rota DEVE ser implementada no Back-end para setar onboardingCompleted=true.
  finishOnboarding: async (data: UpdateProfileData): Promise<UserProfile> => {
    // 💡 Endpoint hipotético que aceita os dados de perfil E atualiza o status de Onboarding no DB
    const response = await api.patch<UserProfile>('/users/me/onboarding', data);
    return response.data;
  },

  // 8. Buscar Followers de um usuário
  getFollowers: async (username: string) => {
    const { data } = await api.get<User[]>(`/users/${username}/followers`);
    return data;
  },

  // 9. Buscar Following de um usuário
  getFollowing: async (username: string) => {
    const { data } = await api.get<User[]>(`/users/${username}/following`);
    return data;
  }
};