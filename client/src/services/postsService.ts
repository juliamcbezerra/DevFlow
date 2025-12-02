import api from "./api";

// Interface do Post
export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

// Interface do Comentário
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

export const postsService = {
  // 1. Listar (Feed ou Projeto)
  getAll: async (type: string = 'foryou') => {
    const { data } = await api.get<Post[]>(`/social/posts?type=${type}`);
    return data;
  },

  // 2. Criar Post (CORRIGIDO AQUI)
  // Agora aceita projectId como segundo argumento opcional
  create: async (content: string, projectId?: string) => {
    const url = projectId ? `/social/projects/${projectId}/posts` : '/social/posts'; 
    const { data } = await api.post<Post>(url, { content });
    return data;
  },

  // 3. Votar
  vote: async (postId: string, value: number) => {
    await api.post(`/social/vote`, { postId, value });
  },

  // 4. Pegar UM Post (Detalhes)
  getById: async (postId: string) => {
    const { data } = await api.get<Post>(`/social/posts/${postId}`);
    return data;
  },

  // 5. Pegar Comentários
  getComments: async (postId: string) => {
    const { data } = await api.get<Comment[]>(`/social/posts/${postId}/comments`);
    return data;
  },

  // 6. Criar Comentário
  createComment: async (postId: string, content: string, parentId?: string) => {
    const { data } = await api.post<Comment>(`/social/posts/${postId}/comments`, { 
      content,
      parentId 
    });
    return data;
  }
};

