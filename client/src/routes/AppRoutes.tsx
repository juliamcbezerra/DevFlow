import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import FeedPage from '../pages/Feed';
import ExplorePage from '../pages/Explore';
import { PrivateRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* --- ROTAS PÚBLICAS --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* --- ROTAS PRIVADAS (Protegidas) --- */}
      {/* Todo mundo aqui dentro precisa de login */}
      <Route element={<PrivateRoute />}>
        <Route path="/feed" element={<FeedPage />} />
        
        {/* Rota padrão: Se acessar a raiz '/', vai pro feed (ou login se não tiver auth) */}
        <Route path="/" element={<Navigate to="/feed" replace />} />
        
        {/* Usando /projects para bater com a Sidebar */}
        <Route path="/projects" element={<ExplorePage />} /> 

        {/* Adicione aqui as futuras páginas como /projects, /profile etc */}
      </Route>

      {/* Rota 404 - Redireciona qualquer coisa errada para o login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}