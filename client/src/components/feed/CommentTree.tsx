import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CommentForm } from "./CommentForm"; 
import api from "../../services/api"; 

interface Comment {
  id: string;
  postId: string; 
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  score: number; // Vem do backend
  votes: { userId: string, value: number }[]; // Para saber se eu votei
  replies?: Comment[];
}

interface CommentTreeProps {
  comments: Comment[];
  level?: number;
  postId: string; // <--- OBRIGATÓRIO: ID do Post Pai
  onReplyAdded?: (newComment: any) => void;
}

export function CommentTree({ comments, level = 0, postId, onReplyAdded }: CommentTreeProps) {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Estado local para gerenciar votos visualmente sem refetch
  // Armazena { commentId: { score: number, userVote: number } }
  const [voteState, setVoteState] = useState<Record<string, { score: number, userVote: number }>>({});

  if (!comments || comments.length === 0) return null;

  const getVoteData = (comment: Comment) => {
    // Se já temos estado local modificado, usa ele
    if (voteState[comment.id]) {
        return voteState[comment.id];
    }
    // Senão, calcula do inicial
    const userVote = comment.votes?.find(v => v.userId === user?.id)?.value || 0;
    return { score: comment.score || 0, userVote };
  };

  const handleVote = async (commentId: string, intent: number) => {
      const comment = comments.find(c => c.id === commentId); // Acha na lista atual (rasa)
      // Nota: Em árvore profunda, ideal é ter componente separado <CommentItem> para gerenciar estado isolado.
      // Mas vamos usar a lógica de estado global local.
      
      // Encontra dados atuais (do state ou do objeto original)
      // Como estamos num map recursivo, precisamos de uma estratégia.
      // ESTRATÉGIA MELHOR: Vamos criar um sub-componente <CommentItem> aqui mesmo.
  };

  return (
    <div className={`space-y-6 ${level > 0 ? 'mt-4 border-l-2 border-zinc-800 pl-4 ml-2' : ''}`}>
      {comments.map((comment) => (
        <CommentItem 
            key={comment.id} 
            comment={comment} 
            postId={postId} 
            onReplyAdded={onReplyAdded} 
            level={level}
        />
      ))}
    </div>
  );
}

// --- SUB-COMPONENTE PARA GERENCIAR ESTADO INDIVIDUAL ---
function CommentItem({ comment, postId, onReplyAdded, level }: { comment: Comment, postId: string, onReplyAdded?: any, level: number }) {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    
    // Estado de Voto Local
    const [localScore, setLocalScore] = useState(comment.score || 0);
    const [localUserVote, setLocalUserVote] = useState(comment.votes?.find(v => v.userId === user?.id)?.value || 0);

    const handleVote = async (intent: number) => {
        const currentVote = localUserVote;
        let newVote = 0;
        let scoreDelta = 0;

        if (currentVote === intent) {
            newVote = 0;
            scoreDelta = -intent;
        } else if (currentVote === 0) {
            newVote = intent;
            scoreDelta = intent;
        } else {
            newVote = intent;
            scoreDelta = intent * 2;
        }

        setLocalUserVote(newVote);
        setLocalScore(prev => prev + scoreDelta);

        await api.post('/social/comments/vote', { commentId: comment.id, value: intent });
    };

    const formatDate = (dateString: string) => {
        try { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString)); } catch { return ""; }
    };

    return (
        <div className="group">
            <div className="flex gap-3">
                
                {/* COLUNA DE VOTOS (Mini) */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    <button onClick={() => handleVote(1)} className={`text-zinc-600 hover:text-orange-500 transition-colors ${localUserVote === 1 ? 'text-orange-500' : ''}`}>
                        <ArrowBigUp size={20} className={localUserVote === 1 ? 'fill-orange-500/20' : ''} />
                    </button>
                    {/* Mostra score se for relevante ou se tiver votos */}
                    {(localScore !== 0 || localUserVote !== 0) && (
                        <span className={`text-xs font-bold ${localUserVote === 1 ? 'text-orange-500' : (localUserVote === -1 ? 'text-violet-500' : 'text-zinc-500')}`}>
                            {localScore}
                        </span>
                    )}
                    <button onClick={() => handleVote(-1)} className={`text-zinc-600 hover:text-violet-500 transition-colors ${localUserVote === -1 ? 'text-violet-500' : ''}`}>
                        <ArrowBigDown size={20} className={localUserVote === -1 ? 'fill-violet-500/20' : ''} />
                    </button>
                </div>

                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <Link to={`/profile/${comment.author.username}`}>
                            <img src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.name}`} className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-800"/>
                        </Link>
                        <Link to={`/profile/${comment.author.username}`} className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">
                            {comment.author.name}
                        </Link>
                        <span className="text-[10px] text-zinc-500">• {formatDate(comment.createdAt)}</span>
                    </div>

                    {/* Conteúdo */}
                    <div className="text-sm text-zinc-300 mb-2 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </div>

                    {/* Botão Responder */}
                    <button 
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs font-bold text-zinc-500 hover:text-violet-400 transition-colors flex items-center gap-1 mb-2"
                    >
                        <MessageCircle size={14}/> Responder
                    </button>

                    {/* Form de Resposta */}
                    {isReplying && (
                        <div className="mt-2 mb-4">
                            <CommentForm 
                                postId={postId} // Usa o ID passado pelo pai
                                parentId={comment.id} 
                                onSuccess={(data) => {
                                    if(onReplyAdded) onReplyAdded(data);
                                    setIsReplying(false);
                                    window.location.reload(); // Refresh simples
                                }}
                                onCancel={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Recursão */}
            {comment.replies && comment.replies.length > 0 && (
                <CommentTree comments={comment.replies} level={level + 1} postId={postId} onReplyAdded={onReplyAdded} />
            )}
        </div>
    );
}