import api from "./api";

// Lista Simples
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: { github?: string; discord?: string; website?: string };
  tags: string[];
  owner: { name: string; username: string };
  _count: { members: number; posts: number };
  matchingTags?: number;
}

// Detalhes Completos (com Staff)
export interface ProjectDetails extends Project {
  ownerId: string;
  isMember: boolean;
  owner: {
    id?: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  // NOVO: Lista de Admins/Owner
  staff: Array<{
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
  }>;
}

export interface CreateProjectData {
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: {
    github?: string;
    discord?: string;
    website?: string;
  };
}

export const projectService = {
  getAll: async (type: 'foryou' | 'following' = 'foryou') => {
    const { data } = await api.get<Project[]>(`/projects?type=${type}`);
    return data;
  },

  getById: async (idOrSlug: string) => {
    const { data } = await api.get<ProjectDetails>(`/projects/${idOrSlug}`);
    return data;
  },

  create: async (projectData: CreateProjectData) => {
    const { data } = await api.post<Project>('/projects/create', projectData);
    return data;
  },

  join: async (idOrSlug: string) => {
    await api.post(`/projects/${idOrSlug}/join`);
  },

  leave: async (idOrSlug: string) => {
    await api.delete(`/projects/${idOrSlug}/leave`);
  },

  update: async (id: string, data: Partial<CreateProjectData>) => {
      const { data: updated } = await api.patch(`/projects/${id}`, data);
      return updated;
  },

  delete: async (id: string) => {
      await api.delete(`/projects/${id}`);
  },
};