import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (data: any) => Promise<void>; 
  signUp: (data: any) => Promise<void>; 
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('@DevFlow:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function signIn(credentials: any) {
    const response = await api.post('/auth/signin', {
      email: credentials.email,    
      password: credentials.password 
    });
    
    const userData = response.data; 
    setUser(userData);
    localStorage.setItem('@DevFlow:user', JSON.stringify(userData));
  }

  async function signUp(credentials: any) {
    await api.post('/auth/signup', credentials);
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