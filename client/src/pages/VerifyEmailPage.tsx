import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api"; 

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mensagem de erro específica

  useEffect(() => {
    if (!token) {
      // Se não houver token na URL
      setStatus('error');
      setErrorMessage("Link de verificação inválido ou incompleto. O token está faltando.");
      return;
    }

    // Chama o backend para validar o token
    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        // Redireciona para login após 3 segundos
        setTimeout(() => navigate('/login'), 3000); 
      })
      .catch((err: any) => {
        console.error("Erro na verificação do e-mail:", err);
        // Tenta obter uma mensagem de erro específica do backend
        const msg = err.response?.data?.message || 'O token expirou ou é inválido.';
        setErrorMessage(Array.isArray(msg) ? msg[0] : msg);
        setStatus('error');
      });
      // A dependência 'navigate' foi removida do array para evitar loop desnecessário,
      // pois ela é estável. Deixamos apenas 'token'.
  }, [token]);

  // Função para reenviar o e-mail (se o token falhar)
  const handleResendVerification = async () => {
    // Nota: Para reenviar o email, você precisaria do email do usuário. 
    // Como você não o tem diretamente aqui, precisaria de uma rota no backend que 
    // reenvie o email baseado no token inválido, ou ter armazenado o email na sessão.
    // Para simplificar, vamos pedir para o usuário ir para a tela de login.
    navigate('/login', { state: { error: "Seu link expirou. Tente logar para reenviar a verificação." } });
  }

  return (
    <div className="min-h-screen bg-[#020205] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Aurora */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        <motion.div animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl text-center"
        >
            <div className="flex justify-center mb-6">
                {status === 'loading' && <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" size={32}/></div>}
                {status === 'success' && <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400"><CheckCircle2 size={32}/></div>}
                {status === 'error' && <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-400"><XCircle size={32}/></div>}
            </div>
            
            {status === 'loading' && (
                <>
                    <h1 className="text-2xl font-bold text-white mb-2">Verificando...</h1>
                    <p className="text-zinc-400">Aguarde enquanto validamos seu link de segurança.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <h1 className="text-2xl font-bold text-white mb-2">E-mail Verificado!</h1>
                    <p className="text-zinc-400 mb-8">Sua conta foi ativada. Você será redirecionado para o login em breve.</p>
                    <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-900/20">
                        Ir para o Login <ArrowRight size={18}/>
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 className="text-2xl font-bold text-white mb-2">Falha na Verificação</h1>
                    <p className="text-zinc-400 mb-6">{errorMessage}</p>
                    <p className="text-sm text-zinc-500 mb-6">Tente fazer login novamente. Se a conta não estiver verificada, o sistema deve te dar a opção de reenviar o link.</p>
                    <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors">
                        Voltar para o Login
                    </Link>
                </>
            )}
        </motion.div>
    </div>
  );
}