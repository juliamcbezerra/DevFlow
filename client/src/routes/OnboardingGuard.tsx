// OnboardingGuard.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Onboarding from '../pages/Onboarding'; // Importe o componente original

export function OnboardingGuard() {
    const { user, loading } = useAuth();

    if (loading) {
        // Retorne o spinner de loading do PrivateRoute se estiver carregando
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
            </div>
        );
    }
    
    // Se o usuário completou o onboarding, redireciona para /feed
    if (user?.onboardingCompleted) {
        return <Navigate to="/feed" replace />;
    }

    // Se o usuário não completou o onboarding, renderiza a página de Onboarding
    return <Onboarding />;
}