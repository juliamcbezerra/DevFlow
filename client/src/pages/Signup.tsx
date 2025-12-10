import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignupForm, FormDataCadastro } from '../components/auth/signup-form/SignupForm';
import { TermsModal } from '../components/modals/TermsModal';
import api from '../services/api'; 
import { motion, Variants } from 'framer-motion';
import { Code2, Layers, GitPullRequestArrow } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // <--- Estado para o Modal de Termos

  const handleSignup = async (dados: FormDataCadastro) => {
    try {
      setError('');
      setLoading(true);

      // 1. Cria a conta no backend (que vai enviar o e-mail)
      await api.post('/auth/signup', {
        name: dados.nome + ' ' + dados.sobrenome,
        username: dados.username, 
        email: dados.email,
        password: dados.password,
        birthDate: dados.birthDate
      });

      // 2. Redireciona para tela de aviso de verificação.
      navigate('/verification-sent', { state: { email: dados.email } });

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao criar conta.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleShowTermsClick = () => {
    setShowTerms(true);
  };

  const auroraVariant: Variants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
      rotate: [0, -5, 0],
      transition: { duration: 18, repeat: Infinity, ease: "linear" }
    }
  };

  const cardVariant: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const floatingWidgetVariant: Variants = {
    animate: {
        y: [0, -12, 0],
        rotate: [1, -1, 1],
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020205] text-zinc-100 relative overflow-hidden p-4">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        <motion.div variants={auroraVariant} animate="animate" className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vh] bg-violet-600/15 rounded-full blur-[130px] mix-blend-screen" />
        <motion.div variants={auroraVariant} animate="animate" transition={{ delay: 3 }} className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-orange-600/10 rounded-full blur-[130px] mix-blend-screen" />
      </div>

      {/* WIDGETS FLUTUANTES */}
      <motion.div 
          variants={floatingWidgetVariant}
          animate="animate"
          className="absolute top-32 left-[5%] hidden xl:flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg z-0"
      >
          <div className="bg-violet-500/20 p-2 rounded-lg"><Layers size={18} className="text-violet-400"/></div>
          <div><div className="text-[10px] text-zinc-400">Descoberta</div><div className="text-xs font-bold text-white">Nova stack detectada</div></div>
      </motion.div>

      <motion.div 
          variants={floatingWidgetVariant}
          animate="animate"
          transition={{ delay: 1.5 }}
          className="absolute bottom-32 right-[5%] hidden xl:flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg z-0"
      >
          <div className="bg-green-500/20 p-2 rounded-lg"><GitPullRequestArrow size={18} className="text-green-400"/></div>
          <div><div className="text-[10px] text-zinc-400">Colaboração</div><div className="text-xs font-bold text-white">PR Aprovado!</div></div>
      </motion.div>

      {/* CARD CENTRALIZADO (Compacto: max-w-xl) */}
      <motion.div 
        variants={cardVariant}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-xl" 
      >
        <div className="absolute -inset-0.5 bg-linear-to-r from-violet-600/40 to-orange-600/40 rounded-2xl blur-lg opacity-30"></div>

        <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl">
          
          {/* Header Compacto */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
             <div className="flex items-center justify-center gap-2">
                <div className="bg-linear-to-tr from-violet-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-violet-500/20">
                    <Code2 size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Dev<span className="text-violet-500">Flow</span></span>
            </div>
             <h1 className="text-2xl font-bold text-white tracking-tight">Crie sua Identidade</h1>
          </div>

          <SignupForm 
            onSubmit={handleSignup} 
            isLoading={loading} 
            error={error} 
            // Passa a função para o formulário
            onShowTermsClick={handleShowTermsClick}
          />

          {/* TEXTO FINAL (REMOVIDO o texto dos termos duplicado) */}
          <p className="text-center text-xs text-zinc-500 mt-6 leading-relaxed border-t border-white/5 pt-4">
            <span className="block text-sm text-zinc-400">
                Já possui uma conta? <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold hover:underline">Fazer Login</Link>
            </span>
          </p>
        </div>
      </motion.div>

      {/* MODAL DE TERMOS */}
      {showTerms && (
        <TermsModal onClose={() => setShowTerms(false)} />
      )}

    </div>
  );
}