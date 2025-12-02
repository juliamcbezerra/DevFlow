import { useState, useEffect, useCallback } from "react";
import { Post, postsService } from "../services/postsService";
import { useAuth } from "../context/AuthContext";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await postsService.getAll();
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (content: string) => {
    try {
      const newPost = await postsService.create(content);
      
      const postWithAuthor: Post = {
        ...newPost,
        author: {
            id: user?.id || '',
            name: user?.name || 'Eu',
            username: user?.username || 'me',
            avatarUrl: user?.avatarUrl
        },
        _count: { votes: 0, comments: 0 } // Inicializa com votes 0
      };

      setPosts((prev) => [postWithAuthor, ...prev]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // --- FUNÇÃO QUE FALTAVA ---
  const votePost = async (postId: string, value: number) => {
    // 1. Atualização Otimista (UI muda na hora)
    setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
            return {
                ...post,
                _count: {
                    ...post._count,
                    votes: (post._count.votes || 0) + value
                }
            };
        }
        return post;
    }));

    // 2. Chama API
    try {
        await postsService.vote(postId, value);
    } catch (error) {
        console.error("Erro ao votar", error);
        // Opcional: Reverter estado se der erro
    }
  };

  // Retornamos 'votePost' aqui para o Feed.tsx usar
  return { posts, isLoading, createPost, votePost, refresh: fetchPosts };
}