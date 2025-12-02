import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import './index.css'; // Garanta que o CSS global está aqui

function App() {
  return (
    // 1. O Router deve englobar tudo
    <BrowserRouter>
      {/* 2. O AuthProvider deve estar dentro do Router (para usar navigate se precisar) */}
      <AuthProvider>
        {/* 3. As Rotas da aplicação */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;