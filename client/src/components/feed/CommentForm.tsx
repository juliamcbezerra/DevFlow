import { useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import api from "../../services/api";

interface CommentFormProps {
  postId: string;
  parentId?: string; // ID do comentário pai (se for resposta)
  onSuccess: (newComment: any) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ postId, parentId, onSuccess, onCancel, placeholder }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // CORREÇÃO CRÍTICA: Monta o payload dinamicamente.
      // Se parentId não existir, ele nem vai no objeto, evitando erros de validação no backend.
      const payload = { 
        content, 
        ...(parentId && { parentId }) 
      };

      const { data } = await api.post(`/social/posts/${postId}/comments`, payload);
      
      setContent("");
      onSuccess(data);
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Erro ao comentar", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full group">
      <div 
        className={`relative bg-zinc-900/50 border rounded-2xl transition-all duration-200 ease-in-out ${
          isFocused 
            ? 'border-violet-500/50 ring-1 ring-violet-500/20 bg-zinc-900 shadow-lg shadow-violet-900/10' 
            : 'border-zinc-800 hover:border-zinc-700'
        }`}
      >
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || (parentId ? "Escreva uma resposta..." : "Compartilhe seu conhecimento...")}
          className="w-full bg-transparent px-4 py-3 text-sm text-zinc-200 focus:outline-none resize-none min-h-12 max-h-[200px] custom-scrollbar placeholder:text-zinc-600 rounded-2xl"
          rows={isFocused || content ? 3 : 1} // Expande suavemente
        />

        {/* Barra de Ações (Aparece ao focar ou digitar) */}
        {(isFocused || content) && (
            <div className="flex justify-between items-center px-2 pb-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Botão Cancelar (Esquerda) */}
                <div>
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                        >
                            <X size={14}/> Cancelar
                        </button>
                    )}
                </div>

                {/* Botão Enviar (Direita) - Estilo Pílula */}
                <button 
                    type="submit" 
                    disabled={!content.trim() || isSubmitting}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-900/20 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin"/> Enviando
                        </>
                    ) : (
                        <>
                            <Send size={14}/> Enviar
                        </>
                    )}
                </button>
            </div>
        )}
      </div>
    </form>
  );
}