import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Share2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { ConfirmModal } from "../ui/ConfirmModal"; 

interface PostOptionsProps {
  postId: string;
  authorId: string;
  onDeleteSuccess: (postId: string) => void;
}

export function PostOptions({ postId, authorId, onDeleteSuccess }: PostOptionsProps) {
  const { user } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalState, setModalState] = useState<'NONE' | 'DELETE' | 'SHARE'>('NONE');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/social/posts/${postId}`);
      onDeleteSuccess(postId);
      setModalState('NONE');
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao excluir post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setIsMenuOpen(false);
    setModalState('SHARE'); // Abre modal de sucesso
  };

  if (!user) return null;
  const isOwner = user.id === authorId;

  return (
    <>
      <div className="relative z-20" ref={menuRef} onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-1.5 rounded-lg transition-colors ${isMenuOpen ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
        >
          <MoreHorizontal size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
            <div className="p-1">
              <button 
                  onClick={handleShare}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left font-medium"
              >
                  <Share2 size={16} /> Compartilhar
              </button>

              {isOwner && (
                <>
                  <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                  <button 
                      onClick={() => { setIsMenuOpen(false); setModalState('DELETE'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-left font-medium"
                  >
                      <Trash2 size={16} /> 
                      Excluir Post
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE DELETAR */}
      <ConfirmModal 
        isOpen={modalState === 'DELETE'}
        onClose={() => setModalState('NONE')}
        onConfirm={handleConfirmDelete}
        title="Excluir Publicação?"
        description="Esta ação é irreversível. O conteúdo será removido permanentemente."
        confirmText="Sim, excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* MODAL DE COMPARTILHAR (Apenas informativo) */}
      <ConfirmModal 
        isOpen={modalState === 'SHARE'}
        onClose={() => setModalState('NONE')}
        onConfirm={() => setModalState('NONE')}
        title="Link Copiado!"
        description="O link para esta publicação foi copiado para sua área de transferência."
        confirmText="Entendido"
        cancelText="Fechar"
        isDestructive={false}
      />
    </>
  );
}