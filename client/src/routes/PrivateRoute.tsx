import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Um loading simples enquanto verifica o token
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // 1. Se NÃO estiver autenticado, manda para o Login.
  if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
  }

  // 2. Se está autenticado, mas NÃO completou o Onboarding, 
  // SEMPRE manda para a rota de Onboarding (a menos que já esteja lá).
  if (user && !user.onboardingCompleted) {
      if (window.location.pathname !== '/onboarding') {
          return <Navigate to="/onboarding" replace />;
      }
      // Se a rota for /onboarding e o onboarding não foi concluído, 
      // o Outlet é renderizado (que será o OnboardingGuard, que renderiza o Onboarding).
  }

  // 3. Se estiver autenticado E completou o Onboarding, 
  // ou se a lógica acima permitir, renderiza a página filha.
  return <Outlet />;
}