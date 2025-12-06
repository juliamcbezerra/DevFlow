import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 1. Router envolve TUDO */}
    <BrowserRouter>
      
      {/* 2. AuthProvider vem depois (pode usar useNavigate agora se quiser) */}
      <AuthProvider>
        
        {/* 3. SocketProvider precisa do User do Auth */}
        <SocketProvider>
          
          {/* 4. App contém apenas os <Routes> */}
          <App />
          
        </SocketProvider>
      </AuthProvider>

    </BrowserRouter>
  </React.StrictMode>,
)