import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { postsService, Post, Comment } from "../services/postsService";
import { CommentItem } from "../components/feed/CommentItem";
import { ArrowLeft, Loader2, MessageCircle, ArrowBigUp, ArrowBigDown, Share2, Terminal } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para comentário novo (Raiz)
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Função central para carregar dados (passada para filhos também)
  const loadData = async () => {
    if (!id) return;
    try {
        // Busca Post e Comentários em paralelo
        const [postData, commentsData] = await Promise.all([
            postsService.getById(id),
            postsService.getComments(id)
        ]);
        setPost(postData);
        setComments(commentsData);
    } catch (error) {
        console.error("Erro ao carregar post", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Criar comentário no Post Principal
  const handleRootComment = async () => {
      if (!newComment.trim() || !id) return;
      setSubmitting(true);
      try {
          await postsService.createComment(id, newComment); // Sem parentId = Raiz
          setNewComment("");
          loadData(); // Recarrega para mostrar o novo comentário e atualizar contadores
      } catch (err) {
          console.error(err);
          alert("Erro ao enviar comentário.");
      } finally {
          setSubmitting(false);
      }
  };

  // Voto Otimista (Atualiza UI antes do Backend)
  const votePost = async (value: number) => {
      if(!post) return;
      
      // Atualiza estado local imediatamente
      setPost({ 
          ...post, 
          _count: { ...post._count, votes: post._count.votes + value }
      });
      
      // Envia pro backend em background
      try {
        await postsService.vote(post.id, value);
      } catch (error) {
        console.error("Erro ao votar", error);
        // Opcional: Reverter estado em caso de erro
      }
  };

  const formatDate = (dateString: string) => {
    try { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString)); } catch { return ""; }
  };

  if (loading) return <AppShell><Sidebar/><div className="flex-1 flex justify-center items-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;
  if (!post) return <AppShell><Sidebar/><div className="flex-1 p-10 text-center text-zinc-500">Post não encontrado.</div></AppShell>;

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 max-w-[800px] space-y-6 pb-20 pt-6 px-4">
        
        {/* Header Voltar */}
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-2 transition-colors group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Voltar
        </button>

        {/* --- POST PRINCIPAL --- */}
        <article className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="flex h-full">
                
                {/* Coluna de Votos */}
                <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-4 border-r border-zinc-800/50 gap-1 shrink-0">
                    <button onClick={() => votePost(1)} className="text-zinc-500 hover:text-orange-500 p-1 rounded hover:bg-zinc-800/50 transition-colors active:scale-90"><ArrowBigUp size={24} strokeWidth={2} /></button>
                    <span className="font-bold text-sm text-zinc-200 my-1">{post._count.votes}</span>
                    <button onClick={() => votePost(-1)} className="text-zinc-500 hover:text-violet-500 p-1 rounded hover:bg-zinc-800/50 transition-colors active:scale-90"><ArrowBigDown size={24} strokeWidth={2} /></button>
                </div>

                {/* Conteúdo do Post */}
                <div className="flex-1 p-6">
                    {/* Cabeçalho do Post */}
                    <div className="flex items-center gap-3 mb-4">
                        <img 
                            src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`} 
                            className="w-10 h-10 rounded-full ring-2 ring-zinc-800 object-cover" 
                            alt={post.author.name}
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-100 text-base">{post.author.name}</span>
                                <span className="text-xs text-zinc-500">@{post.author.username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {post.project ? (
                                    <Link to={`/project/${post.project.slug}`} className="text-violet-400 font-bold uppercase tracking-wider hover:underline">
                                        c/{post.project.slug}
                                    </Link>
                                ) : (
                                    <span className="text-zinc-600 font-bold uppercase tracking-wider">Geral</span>
                                )}
                                <span className="text-zinc-600">• {formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Texto do Post */}
                    <div className="text-zinc-200 mb-6 text-lg leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </div>

                    {/* Rodapé do Post (Stats) */}
                    <div className="flex gap-6 text-zinc-500 text-sm font-bold border-t border-zinc-800/50 pt-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                            <MessageCircle size={18}/> 
                            {comments.length} Comentários
                        </div>
                        <button className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                            <Share2 size={18}/> 
                            Compartilhar
                        </button>
                    </div>
                </div>
            </div>
        </article>

        {/* --- ÁREA DE COMENTÁRIOS --- */}
        <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                Discussão <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs ml-2">{comments.length}</span>
            </h3>

            {/* Input Novo Comentário (Raiz) */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex gap-4 mb-8 focus-within:border-zinc-700 transition-colors">
                <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
                    className="w-10 h-10 rounded-full ring-1 ring-zinc-800 object-cover" 
                    alt="Seu avatar"
                />
                <div className="flex-1">
                    <textarea 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="O que você pensa sobre isso?"
                        className="w-full bg-transparent text-zinc-200 text-sm focus:outline-none resize-none h-20 placeholder-zinc-600"
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                            onClick={handleRootComment}
                            disabled={submitting || !newComment.trim()}
                            className="bg-zinc-100 hover:bg-white text-zinc-950 px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-white/5"
                        >
                            {submitting ? <Loader2 className="animate-spin w-3 h-3"/> : 'Comentar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista Recursiva de Comentários */}
            <div className="space-y-6 pb-20">
                {comments.map(comment => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        postId={post.id} 
                        onReplySuccess={loadData} // Mágica: Recarrega a árvore inteira se houver resposta
                    />
                ))}
                
                {comments.length === 0 && (
                    <div className="text-center py-16 opacity-50 border border-dashed border-zinc-800 rounded-xl">
                        <div className="bg-zinc-900 p-4 rounded-full inline-block mb-3">
                            <Terminal size={32} className="text-zinc-600"/>
                        </div>
                        <p className="text-zinc-500 font-medium">Seja o primeiro a iniciar a conversa!</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </AppShell>
  );
}