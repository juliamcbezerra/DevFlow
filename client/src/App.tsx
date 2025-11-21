import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/Signup/Signup'
import LoginPage from './pages/Login/Login'
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';

// Componentes (Placeholders) - A equipe vai substituir estes arquivos reais
const Feed = () => <div className="flex items-center justify-center h-screen text-white bg-zinc-900">Feed Principal</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Rotas Protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/" element={<Navigate to="/feed" replace />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;