import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export type StatusType = 'success' | 'error' | 'warning';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: StatusType;
  title: string;
  message: string;
}

export function StatusModal({ isOpen, onClose, type, title, message }: StatusModalProps) {
  
  // Fecha automaticamente após 3 segundos se for sucesso
  useEffect(() => {
    if (isOpen && type === 'success') {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  const config = {
    success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-full max-w-sm bg-zinc-900 border ${current.border} p-6 rounded-2xl shadow-2xl relative overflow-hidden`}
          >
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className={`p-4 rounded-full ${current.bg} ${current.color} mb-2`}>
                <Icon size={40} strokeWidth={2} />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <p className="text-zinc-400 text-sm">{message}</p>
              </div>

              <button 
                onClick={onClose}
                className="mt-4 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                {type === 'success' ? 'Continuar' : 'Tentar Novamente'}
              </button>
            </div>

            {/* Glow de Fundo */}
            <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] ${current.bg} blur-[80px] opacity-20 pointer-events-none`}></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}