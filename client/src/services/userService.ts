import api from "./api";
import { Post } from "./postsService";
import { Project } from "./projectService";

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
  // 1. Lista todos (Comunidade)
  getAll: async () => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  // 2. Busca perfil detalhado
  getByUsername: async (username: string) => {
    const { data } = await api.get<UserProfile>(`/users/${username}`);
    return data;
  },

  // 3. Busca Posts (CORRIGIDO PARA A ROTA DO SOCIAL CONTROLLER)
  getUserPosts: async (username: string) => {
    // <--- MUDANÇA AQUI: Era /users/.../posts, agora é /social/posts/user/...
    const { data } = await api.get<Post[]>(`/social/posts/user/${username}`);
    return data;
  },

  // 4. Busca Projetos (CORRIGIDO PARA A ROTA DO PROJECT CONTROLLER)
  getUserProjects: async (username: string) => {
    // <--- MUDANÇA AQUI: Era /users/.../projects, agora é /projects/user/...
    const { data } = await api.get<Project[]>(`/projects/user/${username}`);
    return data;
  },

  // 5. Toggle Follow
  toggleFollow: async (username: string) => {
    await api.post(`/users/${username}/follow`);
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  }
};

