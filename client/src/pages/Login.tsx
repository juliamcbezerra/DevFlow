import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm, FormDataLogin } from '../components/auth/login-form/LoginForm';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (dados: FormDataLogin) => {
    try {
      setError('');
      setLoading(true);
      
      // Conecta os dados do formulário com a função de login do contexto
      await signIn({ 
        email: dados.email, 
        password: dados.password 
      });
      
      // Se passar pelo await sem erro, redireciona
      navigate('/feed');
    } catch (err: any) {
      console.error(err);
      
      // Tenta pegar a mensagem de erro específica do Backend (NestJS), 
      // caso contrário usa uma genérica.
      const backendMessage = err.response?.data?.message;
      const displayMessage = Array.isArray(backendMessage) 
        ? backendMessage[0] 
        : backendMessage || 'Falha no login. Verifique suas credenciais.';
        
      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-zinc-950">
      
      {/* --- COLUNA ESQUERDA: VISUAL RICO (Identidade) --- */}
      <div className="hidden lg:flex flex-col items-center justify-center relative bg-zinc-900 overflow-hidden border-r border-zinc-800">
        
        {/* 1. Background Ambience */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        
        {/* Blobs de luz (Violeta/Azul para dar tom de segurança/tecnologia) */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>

        {/* 2. CONTEÚDO CENTRAL */}
        <div className="relative z-10 flex flex-col items-center gap-10">
          
          {/* Texto de Boas-vindas */}
          <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-xs font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistema Operacional
            </div>
            <h1 className="text-4xl font-bold text-white">
              Bem-vindo de volta ao <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-blue-400">DevFlow</span>
            </h1>
          </div>

          {/* 3. O "HERO ELEMENT": CARD DE IDENTIDADE FLUTUANTE */}
          <div className="relative group perspective-1000">
            
            {/* Brilho traseiro */}
            <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            
            {/* O Cartão (Glassmorphism) */}
            <div className="relative w-80 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 p-6 rounded-2xl shadow-2xl transform transition-transform duration-500 hover:scale-105 hover:-rotate-1">
              
              {/* Header do Cartão */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-violet-500 to-orange-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <img src="https://github.com/shadcn.png" alt="User" className="opacity-80" />
                  </div>
                </div>
                <div className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/20">
                  VERIFIED
                </div>
              </div>

              {/* Info do Usuário Simulado */}
              <div className="space-y-1 mb-6">
                <div className="h-2 w-1/3 bg-zinc-700 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-zinc-600 rounded animate-pulse"></div>
              </div>

              {/* Stats Fictícios */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-zinc-800">
                <div className="text-center">
                  <div className="text-xs text-zinc-500">Posts</div>
                  <div className="font-bold text-white">42</div>
                </div>
                <div className="text-center border-l border-zinc-800">
                  <div className="text-xs text-zinc-500">Rep</div>
                  <div className="font-bold text-violet-400">1.2k</div>
                </div>
                <div className="text-center border-l border-zinc-800">
                  <div className="text-xs text-zinc-500">Rank</div>
                  <div className="font-bold text-white">#05</div>
                </div>
              </div>

              {/* Botão Fake */}
              <div className="mt-4 w-full py-2 bg-zinc-800 rounded text-center text-xs text-zinc-400 font-mono border border-zinc-700/50">
                ACCESS_GRANTED_
              </div>

            </div>

            {/* Elemento Decorativo Flutuante (Cadeado) */}
            <div className="absolute -top-4 -right-4 bg-zinc-800 border border-zinc-700 p-3 rounded-xl shadow-xl flex items-center justify-center animate-bounce [animation-duration:4s]">
               <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>

          </div>

        </div>
      </div>

      {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-24 bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header Mobile */}
          <div className="lg:hidden text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-white">DevFlow</h1>
            <p className="text-zinc-400 text-sm">Login seguro</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Acesse sua conta</h2>
            <p className="text-zinc-400">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          {/* Componente de Login */}
          <LoginForm onSubmit={handleLogin} isLoading={loading} error={error} />

          <p className="text-center text-sm text-zinc-500 mt-8">
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-semibold text-violet-500 hover:text-violet-400 hover:underline transition-colors">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}