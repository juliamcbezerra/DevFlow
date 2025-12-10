import { useState } from "react";
import { X, Loader2, Mail, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Rota do backend para enviar o código
        await api.post('/auth/forgot-password', { email });
        // Redireciona para a tela de reset passando o email
        navigate('/reset-password', { state: { email } });
    } catch (error) {
        console.error(error);
        alert("Erro ao solicitar código. Verifique o e-mail.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-600 to-blue-600"></div>
        
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Recuperar Senha</h2>
                <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24}/></button>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
                Digite seu e-mail abaixo. Enviaremos um código de segurança de 6 dígitos para você redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">E-mail</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 focus-within:border-violet-500 transition-colors">
                        <Mail size={18} className="text-zinc-500"/>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-none text-white p-3 focus:ring-0 text-sm outline-none"
                            placeholder="seu@email.com"
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : <>Enviar Código <ArrowRight size={18}/></>}
                </button>
            </form>
        </div>
      </motion.div>
    </div>
  );
}