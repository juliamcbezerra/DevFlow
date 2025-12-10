import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  location?: string;
  socialLinks?: any;
  interestTags?: string[];
  // Nova flag para controlar o Onboarding
  hasCompletedOnboarding: boolean; 
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  // O signIn agora retorna o objeto User
  signIn: (data: any) => Promise<User | void>; 
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('@DevFlow:user');
    const storedToken = localStorage.getItem('@DevFlow:token');

    if (storedUser && storedToken) {
      // Restaura o token nas requisições do Axios
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // É crucial garantir que o storedUser parseado corresponda à interface User
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  async function signIn(credentials: any): Promise<User | void> {
    try {
      const response = await api.post('/auth/signin', {
        login: credentials.login,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false,
      }, {
        withCredentials: true, 
      });
    
      console.log('🔐 [Auth] Resposta do SignIn:', response.data);

      const { user, access_token } = response.data;
      
      if (!access_token || !user) {
        console.error('❌ [Auth] Dados de login incompletos.');
        return;
      }

      console.log('🔑 [Auth] Token recebido:', access_token.substring(0, 20) + '...');

      // Salva o Token
      localStorage.setItem('@DevFlow:token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Salva o Usuário
      setUser(user);
      localStorage.setItem('@DevFlow:user', JSON.stringify(user));

      window.dispatchEvent(new Event('userLoggedIn'));

      console.log('✅ [Auth] Login completo! Token salvo.');
      
      // Retorna o objeto do usuário para navegação imediata
      return user; 
      
    } catch (error) {
        console.error('❌ [Auth] Erro durante o login:', error);
        throw error; 
    }
  }

  async function signUp(credentials: any) {
    await api.post('/auth/signup', credentials);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('@DevFlow:user');
    localStorage.removeItem('@DevFlow:token'); // Remove o token
    delete api.defaults.headers.common['Authorization']; // Limpa o header
    window.location.href = '/login';
  }

  const updateUser = (data: Partial<User>) => {
    if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('@DevFlow:user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        signIn, 
        signUp, 
        signOut, 
        updateUser,
        loading 
    }}>
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