// SocketContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // 🔄 Monitora mudanças no localStorage
  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem('@DevFlow:token');
      console.log('🔍 [Socket] Verificando token no localStorage:', storedToken ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      setToken(storedToken);
    };

    // Verifica imediatamente
    checkToken();

    // Escuta mudanças no localStorage (quando o usuário faz login)
    window.addEventListener('storage', checkToken);

    // Escuta evento customizado de login
    window.addEventListener('userLoggedIn', checkToken);

    return () => {
      window.removeEventListener('storage', checkToken);
      window.removeEventListener('userLoggedIn', checkToken);
    };
  }, []);

  // 🚀 Conecta quando tiver token
  useEffect(() => {
    if (!token) {
      console.log('⏸️ [Socket] Aguardando token para conectar...');
      return;
    }

    console.log('🔌 [Socket] Inicializando conexão para: http://localhost:3333');
    console.log('🔍 [Socket] Token encontrado:', token.substring(0, 20) + '...');

    const newSocket = io('http://localhost:3333', {
      transports: ['websocket'],
      auth: {
        token: token,
      },
    });

    newSocket.on('connect', () => {
      console.log('✅ [Socket] CONECTADO COM SUCESSO! ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ [Socket] Desconectado:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [Socket] Erro na conexão:', error.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 [Socket] Limpando conexão...');
      newSocket.disconnect();
    };
  }, [token]); // ← Reconecta quando o token mudar

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};