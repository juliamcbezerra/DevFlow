import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm, FormDataLogin } from '../components/auth/login-form/LoginForm';
import { ForgotPasswordModal } from '../components/modals/ForgotPasswordModal';
import { motion, Variants } from 'framer-motion';
import { Code2, GitCommit, Cpu } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth(); 
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (dados: FormDataLogin) => {
    try {
      setError('');
      setLoading(true);
      
      // Recebe o objeto do usuário com a flag hasCompletedOnboarding
      const user = await signIn({ 
        login: dados.login, 
        password: dados.password,
        rememberMe: dados.rememberMe,
      });

      if (user) {
          // Lógica de Redirecionamento Pós-Login
          if (!user.onboardingCompleted) { 
              navigate('/onboarding');
          } else {
              navigate('/feed');
          }
      } else {
          // Caso raro onde o signIn não lançou erro mas também não retornou usuário
          setError('Login falhou. Resposta inesperada do servidor.');
      }

    } catch (err: any) {
      const backendMessage = err.response?.data?.message;
      const displayMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || 'Falha no login. Credenciais incorretas?';
      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };
    
  const handleForgotPasswordClick = () => {
    setShowForgotModal(true);
  };

  const auroraVariant: Variants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.5, 0.3],
      rotate: [0, 5, 0],
      transition: { duration: 15, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const cardVariant: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const floatingWidgetVariant: Variants = {
      animate: {
          y: [0, -10, 0],
          rotate: [-2, 2, -2],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020205] text-zinc-100 relative overflow-hidden p-4">
      
      {/* BACKGROUND VIVO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        <motion.div variants={auroraVariant} animate="animate" className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <motion.div variants={auroraVariant} animate="animate" transition={{ delay: 2 }} className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* WIDGETS FLUTUANTES */}
      <motion.div 
          variants={floatingWidgetVariant}
          animate="animate"
          className="absolute top-20 left-[10%] hidden lg:flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg z-0"
      >
          <div className="bg-orange-500/20 p-2 rounded-lg"><Cpu size={18} className="text-orange-400"/></div>
          <div><div className="text-[10px] text-zinc-400">Status do Sistema</div><div className="text-xs font-bold text-white flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Compilando...</div></div>
      </motion.div>

      <motion.div 
          variants={floatingWidgetVariant}
          animate="animate"
          transition={{ delay: 1 }}
          className="absolute bottom-20 right-[10%] hidden lg:flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg z-0"
      >
          <div className="bg-blue-500/20 p-2 rounded-lg"><GitCommit size={18} className="text-blue-400"/></div>
          <div><div className="text-[10px] text-zinc-400">Último Commit</div><div className="text-xs font-mono text-white">feat: login_ui_update</div></div>
      </motion.div>

      {/* CARD CENTRALIZADO */}
      <motion.div 
        variants={cardVariant}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute -inset-0.5 bg-linear-to-r from-violet-600/50 to-blue-600/50 rounded-2xl blur-lg opacity-30"></div>

        <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          
          <div className="text-center space-y-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-linear-to-tr from-violet-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-violet-500/20">
                    <Code2 size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">Dev<span className="text-violet-500">Flow</span></span>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
                <p className="text-zinc-400 text-sm">Acesse sua conta para continuar evoluindo.</p>
            </div>
          </div>

          <LoginForm 
            onSubmit={handleLogin} 
            isLoading={loading} 
            error={error} 
            onForgotPasswordClick={handleForgotPasswordClick}
          />

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-zinc-500">
              Não tem uma conta?{' '}
              <Link to="/signup" className="font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors">
                Criar conta
              </Link>
            </p>
          </div>

        </div>
      </motion.div>

      {/* Renderiza o Modal se estiver aberto */}
      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}

    </div>
  );
}