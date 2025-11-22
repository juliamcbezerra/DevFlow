import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm, FormDataCadastro } from '../components/auth/signup-form/SignupForm';
import  api  from '../services/api'; // Importamos a api direta para cadastro
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Para logar automaticamente após cadastro (opcional)
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

// ...

  const handleSignup = async (dados: FormDataCadastro) => {
    try {
      setError('');
      setLoading(true);

      // 1. Backend Call
      await api.post('/users', {
        name: dados.nome + ' ' + dados.sobrenome,
        email: dados.email,
        password: dados.password, // AGORA ESTÁ ALINHADO (era dados.senha)
      });

      // 2. Auto Login
      await signIn({ email: dados.email, password: dados.password }); // ALINHADO
      navigate('/feed');

    } catch (err: any) {
      // ...
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* --- COLUNA ESQUERDA (Formulário) --- */}
      <div className="flex flex-col items-center justify-center bg-zinc-950 p-6 sm:p-12 order-2 md:order-1">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header Mobile */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-white">DevFlow</h1>
            <p className="text-zinc-400 text-sm">Junte-se à comunidade</p>
          </div>

          <div className="text-center hidden md:block">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Crie sua conta</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Comece a compartilhar conhecimento hoje mesmo.
            </p>
          </div>

          {/* O Componente de Formulário Refatorado */}
          <SignupForm 
            onSubmit={handleSignup} 
            isLoading={loading} 
            error={error} 
          />

        </div>
      </div>

      {/* --- COLUNA DIREITA (Branding / Visual) --- */}
      {/* Hidden no mobile, Flex no desktop. Order mudada para ficar na direita */}
      <div className="hidden md:flex flex-col items-center justify-center relative bg-zinc-900 overflow-hidden text-center p-12 order-1 md:order-2">
        
        {/* Efeitos de Fundo Diferentes do Login (Tons de Rosa/Laranja) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        {/* Blobs de cor para dar o efeito gradiente neon */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]"></div>

        {/* Conteúdo da Marca */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Junte-se ao <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-orange-400">DevFlow</span>
          </h1>
          
          <h2 className="text-2xl font-medium text-zinc-200">
            Gerencie seus projetos com facilidade.
          </h2>
          
          <p className="text-zinc-400 text-lg max-w-xs mx-auto">
            Conecte-se com outros devs, colabore em código e evolua sua carreira.
          </p>
        </div>
      </div>

    </div>
  );
}