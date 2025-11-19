import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Carregando...</div>;
  }

  // Se tem utilizador, renderiza a rota filha (Outlet). Se não, manda para o Login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}