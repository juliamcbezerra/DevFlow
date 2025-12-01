import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Edit2, Share2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface PostOptionsProps {
  postId: string;
  authorId: string;
  onDeleteSuccess: (postId: string) => void;
}

export function PostOptions({ postId, authorId, onDeleteSuccess }: PostOptionsProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/social/posts/${postId}`);
      onDeleteSuccess(postId); // Avisa o pai para remover da lista
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao excluir post.");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setIsOpen(false);
    alert("Link copiado para a área de transferência!");
  };

  // Se não estou logado, não mostro nada (ou apenas compartilhar)
  if (!user) return null;

  const isOwner = user.id === authorId;

  return (
    <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            <button 
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
                <Share2 size={16} /> Compartilhar
            </button>

            {isOwner && (
              <>
                <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                <button 
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-left"
                >
                    {isDeleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />} 
                    Excluir Post
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}