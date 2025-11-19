import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

// Tipagem do Utilizador (ajuste conforme o teu DTO do backend)
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (data: any) => Promise<void>; // O "data" virá do formulário de Login
  signUp: (data: any) => Promise<void>; // O "data" virá do formulário de Signup
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Ao carregar a app, podemos tentar recuperar o user (se houver persistência)
  // Nota: Como usamos Cookies HttpOnly, não podemos "ler" o token.
  // Idealmente, teríamos um endpoint GET /auth/me para validar a sessão no load.
  // Para o Sprint 1, vamos confiar no Login explícito.
  useEffect(() => {
    const storedUser = localStorage.getItem('@DevFlow:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function signIn(credentials: any) {
    const response = await api.post('/auth/signin', credentials);
    
    // O Backend define o Cookie automaticamente.
    // Nós guardamos apenas os dados não sensíveis do user para a UI.
    const userData = response.data; // O backend deve retornar o objeto user

    setUser(userData);
    localStorage.setItem('@DevFlow:user', JSON.stringify(userData));
  }

  async function signUp(credentials: any) {
    // Chama o endpoint de registo
    await api.post('/auth/signup', credentials);
    // Depois do cadastro, podemos fazer login automático ou redirecionar
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('@DevFlow:user');
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}