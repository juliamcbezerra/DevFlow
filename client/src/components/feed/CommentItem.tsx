import { useState } from "react";
import { MessageCircle, CornerDownRight, Loader2, Send } from "lucide-react";
import { Comment, postsService } from "../../services/postsService";
import { useAuth } from "../../context/AuthContext";
import { RichTextDisplay } from "./RichTextDisplay";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReplySuccess?: () => void;
}

export function CommentItem({ comment, postId, onReplySuccess }: CommentItemProps) {
  const { user } = useAuth();
  
  // Estados locais para controlar a caixa de resposta
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Enviar a resposta
  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      // A mágica: enviamos o ID deste comentário como 'parentId'
      await postsService.createComment(postId, replyContent, comment.id);
      
      // Limpa tudo e avisa o componente pai para recarregar
      setIsReplying(false);
      setReplyContent("");
      if (onReplySuccess) onReplySuccess(); 
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try { 
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(new Date(dateString)); 
    } catch { return ""; }
  };

  return (
    <div className="flex flex-col mt-4 first:mt-0">
      
      {/* 1. CONTEÚDO DO COMENTÁRIO ATUAL */}
      <div className="flex gap-3 group">
        {/* Avatar */}
        <div className="flex flex-col items-center">
            <img 
                src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.name}`} 
                className="w-8 h-8 rounded-full ring-1 ring-zinc-800 object-cover bg-zinc-900 shrink-0" 
                alt={comment.author.name}
            />
        </div>

        <div className="flex-1 min-w-0">
            {/* Header: Nome e Data */}
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-zinc-300 hover:underline cursor-pointer">
                  {comment.author.name}
                </span>
                <span className="text-[10px] text-zinc-500">
                  @{comment.author.username} • {formatDate(comment.createdAt)}
                </span>
            </div>

            {/* Texto do Comentário */}
            <div className="text-sm text-zinc-300 mb-1">
                <RichTextDisplay content={comment.content} />
            </div>

            {/* Botão Responder */}
            <button 
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-violet-400 transition-colors py-1"
            >
                <MessageCircle size={12} /> Responder
            </button>

            {/* Input de Resposta (Só aparece se clicar em Responder) */}
            {isReplying && (
                <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="text-zinc-700 pt-2"><CornerDownRight size={16}/></div>
                    <div className="flex-1">
                        <textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 resize-none h-20 placeholder-zinc-600 shadow-inner" 
                            placeholder={`Respondendo a @${comment.author.username}...`} 
                            autoFocus
                        />
                        <div className="flex justify-end mt-2 gap-2">
                            <button 
                              onClick={() => setIsReplying(false)} 
                              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5"
                            >
                              Cancelar
                            </button>
                            <button 
                                onClick={handleReply}
                                disabled={submitting || !replyContent.trim()}
                                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin w-3 h-3"/> : <Send size={12}/>} Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* 2. ÁRVORE DE RESPOSTAS (Visual Conectado) */}
      {comment.replies && comment.replies.length > 0 && (
          <div className="flex mt-1">
              {/* Linha Guia Vertical (O segredo do visual tree) */}
              <div className="w-8 flex justify-center shrink-0">
                  <div className="w-0.5 bg-zinc-800 h-full hover:bg-violet-500/30 transition-colors rounded-full mb-2"></div>
              </div>
              
              {/* Container dos Filhos */}
              <div className="flex-1">
                  {comment.replies.map(reply => (
                      <CommentItem 
                          key={reply.id} 
                          comment={reply} 
                          postId={postId} 
                          onReplySuccess={onReplySuccess} 
                      />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}