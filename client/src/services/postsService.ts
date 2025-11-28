import api from "./api";

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
  _count: {
    votes: number; // <--- MUDAMOS DE 'likes' PARA 'votes'
    comments: number;
  };
}

export const postsService = {
  // Buscar posts
  getAll: async () => {
    const { data } = await api.get<Post[]>('/social/posts');
    return data;
  },

  // Criar post
  create: async (content: string) => {
    const { data } = await api.post<Post>('/social/posts', { content });
    return data;
  },

  // Votar (Up/Down)
  vote: async (postId: string, value: number) => {
    await api.post(`/posts/${postId}/vote`, { value }); 
  }
};