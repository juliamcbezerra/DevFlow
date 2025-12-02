import { X, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Se true, o botão fica vermelho
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
  isLoading = false
}: ConfirmModalProps) {
  
  // Fechar ao apertar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      
      {/* Overlay Escuro com Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* O Card do Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 p-6">
        
        {/* Botão Fechar X */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          
          {/* Ícone de Alerta */}
          <div className={`mb-4 p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-violet-500/10 text-violet-500'}`}>
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {description}
          </p>

          {/* Botões de Ação */}
          <div className="flex gap-3 w-full sm:justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
                  : 'bg-violet-600 hover:bg-violet-700 shadow-violet-900/20'
              }`}
            >
              {isLoading ? "Processando..." : confirmText}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}