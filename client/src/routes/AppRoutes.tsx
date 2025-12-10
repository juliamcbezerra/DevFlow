import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Pages - Auth
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import VerificationSentPage from '../pages/VerificationSentPage'; 
import VerifyEmailPage from '../pages/VerifyEmailPage'; 
import ResetPasswordPage from '../pages/ResetPasswordPage'; 

// Pages - App
import FeedPage from '../pages/Feed';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/Settings';
import PostDetailsPage from '../pages/PostDetails';
import ChatPage from '../pages/ChatPage';
import SearchPage from '../pages/SearchPage';
import ProjectPage from '../pages/Project';
import ProjectsPage from '../pages/Explore';
import CommunityPage from '../pages/Community';

// Components
import { Navbar } from '../components/layout/Navbar';
import { PrivateRoute } from './PrivateRoute';
import { OnboardingGuard } from './OnboardingGuard'; // 💥 NOVO IMPORT

// Layout para páginas que têm Navbar
const PrivateLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* --- ROTAS PÚBLICAS (Autenticação e Recuperação) --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      
      {/* Rotas de Fluxo de Verificação */}
      <Route path="/verification-sent" element={<VerificationSentPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Rota de Fluxo de Senha */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* --- ROTAS PRIVADAS (Requer Login) --- */}
      <Route element={<PrivateRoute />}>
        
        {/* 💥 Onboarding (Usando o Guard) */}
        <Route path="/onboarding" element={<OnboardingGuard />} />

        {/* Rotas com Navbar (Layout) */}
        <Route element={<PrivateLayout />}>
            
            {/* Feed & Home */}
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/" element={<Navigate to="/feed" replace />} />

            {/* Perfil & Configs */}
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Posts & Interação */}
            <Route path="/post/:id" element={<PostDetailsPage />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Chat */}
            <Route path="/chat" element={<ChatPage />} />

            {/* Projetos */}
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/projects" element={<ProjectsPage />} />

            {/* Comunidade */}
            <Route path="/community" element={<CommunityPage />} />

        </Route>

      </Route>

      {/* Rota de Catch-all / 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}