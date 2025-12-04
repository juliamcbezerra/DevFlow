import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

// 1. Atualizei a interface com os novos campos (Banner, Bio, etc)
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;
  // Novos campos:
  bannerUrl?: string;
  bio?: string;
  location?: string;
  socialLinks?: any;
  interestTags?: string[];
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (data: any) => Promise<void>;
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
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function signIn(credentials: any) {
    const response = await api.post('/auth/signin', {
      login: credentials.login,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false,
    }, {
      withCredentials: true, // ← IMPORTANTE PARA ENVIAR COOKIES
    }
  );
    
    console.log('🔐 [Auth] Resposta do SignIn:', response.data);

    // O backend retorna { access_token, user }
    const { user, access_token } = response.data;
    if (!access_token) {
      console.error('❌ [Auth] Token não foi retornado pelo servidor!');
      return;
    }

    console.log('🔑 [Auth] Token recebido:', access_token.substring(0, 20) + '...');

    // Salva o Token (Importante para persistência)
    localStorage.setItem('@DevFlow:token', access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    // Salva o Usuário
    setUser(user);
    localStorage.setItem('@DevFlow:user', JSON.stringify(user));

    window.dispatchEvent(new Event('userLoggedIn'));

    console.log('✅ [Auth] Login completo! Token salvo.');
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

  // --- NOVA FUNÇÃO: Atualiza o usuário no contexto e no localStorage ---
  // Isso permite que a Navbar atualize o avatar instantaneamente sem F5
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