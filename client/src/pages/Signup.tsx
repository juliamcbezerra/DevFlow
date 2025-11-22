import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignupForm, FormDataCadastro } from '../components/auth/signup-form/SignupForm';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth(); 
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (dados: FormDataCadastro) => {
    try {
      setError('');
      setLoading(true);

      await api.post('/auth/signup', {
        name: dados.nome + ' ' + dados.sobrenome,
        email: dados.email,
        password: dados.password,
      });

      await signIn({ email: dados.email, password: dados.password });
      navigate('/feed');

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao criar conta.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-zinc-950">
      
      {/* --- COLUNA ESQUERDA: FORMULÁRIO (Antítese ao Login) --- */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-24 order-1 bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Crie sua conta</h2>
            <p className="text-zinc-400">
              Preencha seus dados para entrar na comunidade.
            </p>
          </div>

          <SignupForm 
            onSubmit={handleSignup} 
            isLoading={loading} 
            error={error} 
          />

          <p className="text-center text-xs text-zinc-500 mt-8">
            Ao se registrar, você concorda com nossos Termos de Uso.
          </p>
        </div>
      </div>

      {/* --- COLUNA DIREITA: VISUAL RICO (O Preenchimento) --- */}
      <div className="hidden lg:flex flex-col items-center justify-center relative bg-zinc-900 overflow-hidden order-2 border-l border-zinc-800">
        
        {/* 1. Background Noise & Gradient */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px]"></div>

        {/* 2. O CONTEÚDO CENTRAL (Preenchendo o Vazio) */}
        <div className="relative z-10 w-full max-w-lg px-8 flex flex-col gap-8">
          
          {/* Texto de Impacto */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Comunidade Ativa
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Evolua seu código com <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-orange-400">Feedback Real</span>
            </h1>
          </div>

          {/* 3. O "CARD DE CÓDIGO" FLUTUANTE (O Visual Hero) */}
          <div className="relative group">
            {/* Efeito de brilho atrás do card */}
            <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            {/* O Card em si (Simulando um editor de código) */}
            <div className="relative bg-zinc-900 ring-1 ring-zinc-700 rounded-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500 ease-out">
              
              {/* Barra de título do editor */}
              <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-xs text-zinc-500 font-mono">DevFlow.tsx</div>
              </div>

              {/* Conteúdo do Código (Syntax Highlight Fake) */}
              <div className="p-6 font-mono text-sm text-zinc-300 space-y-2 leading-relaxed bg-zinc-950/80">
                <div className="flex">
                  <span className="text-zinc-600 w-6 select-none">1</span>
                  <span><span className="text-violet-400">interface</span> <span className="text-yellow-300">Developer</span> {'{'}</span>
                </div>
                <div className="flex">
                  <span className="text-zinc-600 w-6 select-none">2</span>
                  <span className="pl-4">skills: <span className="text-orange-400">['React', 'Node', 'DevOps']</span>;</span>
                </div>
                <div className="flex">
                  <span className="text-zinc-600 w-6 select-none">3</span>
                  <span className="pl-4">level: <span className="text-green-400">'Senior'</span>;</span>
                </div>
                <div className="flex">
                  <span className="text-zinc-600 w-6 select-none">4</span>
                  <span>{'}'}</span>
                </div>
                <div className="flex mt-2">
                  <span className="text-zinc-600 w-6 select-none">5</span>
                  <span className="text-zinc-500">// Junte-se a 10.000+ devs</span>
                </div>
                <div className="flex">
                  <span className="text-zinc-600 w-6 select-none">6</span>
                  <span><span className="text-violet-400">const</span> community = <span className="text-blue-400">await</span> DevFlow.<span className="text-yellow-300">join</span>();</span>
                </div>
              </div>
            </div>

            {/* Elemento Flutuante Extra (Tag) */}
            <div className="absolute -bottom-6 -right-6 bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce [animation-duration:3s]">
              <div className="bg-green-500/20 p-1.5 rounded-md">
                 <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="text-xs">
                <div className="text-zinc-400">Status</div>
                <div className="font-bold text-white">Approved</div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}