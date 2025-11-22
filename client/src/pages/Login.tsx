// client/src/pages/Login/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/auth/login-form'; // Ajuste o import para named export se necessário

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (dados: any) => {
    try {
      setError('');
      setLoading(true);
      
      // Chama a autenticação real do nosso Contexto
      // Passamos um único objeto contendo email e password
    await signIn({ email: dados.email, password: dados.password });
      
      // Se der certo, redireciona para o Feed
      navigate('/feed');
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* --- COLUNA ESQUERDA (Branding / Visual) --- */}
      {/* Hidden no mobile, Flex no desktop */}
      <div className="hidden md:flex flex-col items-center justify-center relative bg-zinc-900 overflow-hidden text-center p-12">
        
        {/* Efeitos de Fundo (Simulando o "Dark Portal") */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"></div>

        {/* Conteúdo da Marca */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Dev<span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-violet-600">Flow</span>
          </h1>
          
          <h2 className="text-2xl font-medium text-zinc-200">
            Onde o código encontra a comunidade.
          </h2>
          
          <ul className="text-zinc-400 space-y-3 text-left inline-block mt-4">
            <li className="flex items-center gap-2">
              <span className="text-violet-500">✔</span> Compartilhe snippets com syntax highlight
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-500">✔</span> Participe de comunidades técnicas
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-500">✔</span> Construa sua reputação como Dev
            </li>
          </ul>
        </div>
      </div>

      {/* --- COLUNA DIREITA (Formulário) --- */}
      <div className="flex flex-col items-center justify-center bg-zinc-950 p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Cabeçalho Mobile (Só aparece se tela for pequena) */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-white">DevFlow</h1>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Entre com suas credenciais para acessar o feed.
            </p>
          </div>

          {/* Exibe erro se houver */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded text-center">
              {error}
            </div>
          )}

          {/* O Componente de Formulário que você já criou */}
          <LoginForm onSubmit={handleLogin} isLoading={loading} />

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