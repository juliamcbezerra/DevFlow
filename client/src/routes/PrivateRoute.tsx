import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Um loading simples enquanto verifica o token
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Se estiver autenticado, renderiza a página filha (Outlet).
  // Se não, manda pro Login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}