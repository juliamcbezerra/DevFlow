import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
// 1. Importar o novo Layout
import { AppShell } from './components/layout/AppShell';
import Feed from './pages/Feed';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Fundo global escuro para evitar clarões ao carregar */}
        <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
          <Routes>
            {/* --- Rotas Públicas (Sem Sidebar/Navbar) --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* --- Rotas Protegidas (Com AppShell) --- */}
            <Route element={<PrivateRoute />}>
              <Route path="/feed" element={
                // O AppShell envolve o conteúdo, adicionando Navbar e Sidebar
                <AppShell>
                  <Feed />
                </AppShell>
              } />
              
              {/* Redirecionamento padrão */}
              <Route path="/" element={<Navigate to="/feed" replace />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;