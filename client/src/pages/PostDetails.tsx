import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { RichTextDisplay } from "../components/feed/RichTextDisplay";
import { PostOptions } from "../components/feed/PostOptions";
import { CommentTree } from "../components/feed/CommentTree";
import { CommentForm } from "../components/feed/CommentForm";
import { ConfirmModal } from "../components/ui/ConfirmModal"; 
import api from "../services/api"; 
import { 
    Loader2, MessageCircle, ArrowBigUp, ArrowBigDown, 
    Share2, ChevronLeft
} from "lucide-react";

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    async function loadPostData() {
        if (!id) return;
        try {
            setLoading(true);
            const { data: postData } = await api.get(`/social/posts/${id}`);
            setPost(postData);

            const { data: commentsData } = await api.get(`/social/posts/${id}/comments`);
            setComments(commentsData);
        } catch (error) {
            console.error("Erro ao carregar post", error);
            navigate('/feed');
        } finally {
            setLoading(false);
        }
    }
    loadPostData();
  }, [id, navigate]);

  const refreshComments = async () => {
      try {
          const { data } = await api.get(`/social/posts/${id}/comments`);
          setComments(data);
          // Atualiza contador localmente
          setPost((prev: any) => ({ ...prev, _count: { ...prev._count, comments: prev._count.comments + 1 } }));
      } catch (error) { console.error(error); }
  };

  const votePost = async (value: number) => {
      if (!post) return;
      const currentVote = post.userVote || 0;
      let newVote = 0;
      let scoreDelta = 0;

      if (currentVote === value) {
          newVote = 0;
          scoreDelta = -value; 
      } else if (currentVote === 0) {
          newVote = value;
          scoreDelta = value;
      } else {
          newVote = value;
          scoreDelta = value * 2;
      }

      setPost((prev: any) => ({
          ...prev,
          userVote: newVote,
          _count: { ...prev._count, votes: prev._count.votes + scoreDelta }
      }));
      await api.post('/social/vote', { postId: post.id, value });
  };

  const handleDeleteSuccess = () => {
      if (post.project) {
          navigate(`/projects/${post.project.slug || post.project.id}`);
      } else {
          navigate('/feed');
      }
  };

  const handleBottomShare = () => {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      setIsShareModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', year: 'numeric' }).format(new Date(dateString)); } catch (e) { return ""; }
  };

  if (loading) return <AppShell><Sidebar /><div className="flex-1 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;
  if (!post) return null;

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 max-w-[800px] space-y-6 pb-20 px-4 pt-6">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold mb-4">
            <ChevronLeft size={16} /> Voltar
        </button>

        {/* CARD DO POST */}
        <article className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg">
            <div className="flex h-full">
                
                {/* Coluna Votos */}
                <div className="w-14 bg-zinc-950/30 flex flex-col items-center py-4 border-r border-zinc-800/50 gap-2 shrink-0 rounded-l-2xl">
                    <button onClick={() => votePost(1)} className={`p-1.5 rounded transition-all active:scale-90 ${post.userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-orange-500 hover:bg-zinc-800/50'}`}>
                        <ArrowBigUp size={28} strokeWidth={2} className={post.userVote === 1 ? 'fill-orange-500/20' : ''} />
                    </button>
                    <span className={`font-bold text-lg my-1 ${post.userVote !== 0 ? (post.userVote === 1 ? 'text-orange-500' : 'text-violet-500') : 'text-zinc-200'}`}>
                        {post._count?.votes || 0}
                    </span>
                    <button onClick={() => votePost(-1)} className={`p-1.5 rounded transition-all active:scale-90 ${post.userVote === -1 ? 'text-violet-500 bg-violet-500/10' : 'text-zinc-500 hover:text-violet-500 hover:bg-zinc-800/50'}`}>
                        <ArrowBigDown size={28} strokeWidth={2} className={post.userVote === -1 ? 'fill-violet-500/20' : ''} />
                    </button>
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 p-6 sm:p-8 min-w-0">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <img 
                                src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} 
                                className="w-10 h-10 rounded-full ring-2 ring-zinc-800 object-cover" 
                            />
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {post.project ? (
                                        <Link to={`/projects/${post.project.slug || post.project.id}`} className="font-bold text-zinc-200 hover:underline">
                                            c/{post.project.name}
                                        </Link>
                                    ) : (
                                        <span className="font-bold text-zinc-500">Geral</span>
                                    )}
                                    <span className="text-zinc-600 text-[10px]">•</span>
                                    <span className="text-zinc-500 text-xs">Postado por</span>
                                    <Link to={`/profile/${post.author.username}`} className="text-violet-400 hover:text-violet-300 text-xs font-bold">
                                        @{post.author.username}
                                    </Link>
                                </div>
                                <p className="text-zinc-500 text-xs mt-0.5">{formatDate(post.createdAt)}</p>
                            </div>
                        </div>

                        {/* Menu Options */}
                        <div className="relative">
                            <PostOptions 
                                postId={post.id} 
                                authorId={post.author.id} 
                                onDeleteSuccess={handleDeleteSuccess} 
                            />
                        </div>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="text-zinc-200 mb-8 leading-relaxed whitespace-pre-wrap text-base wrap-break-word">
                        <RichTextDisplay content={post.content} />
                    </div>

                    {/* Footer */}
                    <div className="flex gap-6 pt-6 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
                            <MessageCircle size={18}/> {post._count?.comments || 0} Comentários
                        </div>
                        <button 
                            onClick={handleBottomShare}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                        >
                            <Share2 size={18}/> Compartilhar
                        </button>
                    </div>
                </div>
            </div>
        </article>

        {/* SEÇÃO DE COMENTÁRIOS */}
        <div className="mt-8">
            
            {/* Input Principal */}
            <div className="mb-8">
                <div className="flex gap-4 items-start">
                    <img 
                        src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800 shrink-0"
                    />
                    <CommentForm 
                        postId={post.id} 
                        onSuccess={refreshComments} 
                    />
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                Respostas <span className="text-zinc-500 text-sm font-normal">({post._count?.comments})</span>
            </h3>
            
            {/* Árvore */}
            {comments.length > 0 ? (
                <CommentTree 
                    comments={comments} 
                    postId={post.id} 
                    onReplyAdded={refreshComments} 
                />
            ) : (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 text-zinc-500">
                    <MessageCircle size={32} className="mx-auto mb-3 opacity-50"/>
                    Seja o primeiro a compartilhar conhecimento!
                </div>
            )}
        </div>

        <ConfirmModal 
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            onConfirm={() => setIsShareModalOpen(false)}
            title="Link Copiado!"
            description="O link para esta publicação foi copiado para sua área de transferência."
            confirmText="Entendido"
            cancelText="Fechar"
            isDestructive={false}
        />

      </div>
    </AppShell>
  );
}