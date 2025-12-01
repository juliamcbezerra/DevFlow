import api from "./api";

// Tipagem para a lista de projetos (Feed)
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  tags: string[];
  
  // O backend envia o owner na listagem também
  owner: {
    name: string;
    username: string;
  };

  _count: {
    members: number;
    posts: number;
  };

  // Campo calculado pelo backend para recomendação (Para Você)
  matchingTags?: number;
}

// Tipagem para os detalhes completos (Página do Projeto)
export interface ProjectDetails extends Project {
  ownerId: string;
  isMember: boolean; // Flag calculada pelo backend
  // owner já herdado de Project, mas com ID se necessário
  owner: {
    id?: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
}

// DTO para criação
export interface CreateProjectData {
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  avatarUrl?: string;
}

export const projectService = {
  // 1. Listar Projetos (Atualizado para 'foryou' e 'following')
  getAll: async (type: 'foryou' | 'following' = 'foryou') => {
    const { data } = await api.get<Project[]>(`/projects?type=${type}`);
    return data;
  },

  // 2. Buscar Detalhes (por ID ou Slug)
  getById: async (idOrSlug: string) => {
    const { data } = await api.get<ProjectDetails>(`/projects/${idOrSlug}`);
    return data;
  },

  // 3. Criar Projeto
  create: async (projectData: CreateProjectData) => {
    const { data } = await api.post<Project>('/projects', projectData);
    return data;
  },

  // 4. Entrar na Comunidade
  join: async (idOrSlug: string) => {
    await api.post(`/projects/${idOrSlug}/join`);
  },

  // 5. Sair da Comunidade
  leave: async (idOrSlug: string) => {
    await api.delete(`/projects/${idOrSlug}/leave`);
  }
};