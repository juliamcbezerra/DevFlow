import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { PrivateRoute } from './routes/PrivateRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import Home from './pages/Home'
import About from './pages/About'
import './index.css'


// Define rotas da aplicação
const router = createBrowserRouter([
  // --- ROTAS PÚBLICAS (Sem Sidebar) ---
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },

  // --- ROTAS PRIVADAS (Com Sidebar e Proteção) ---
  {
    element: <PrivateRoute />, // 1. Verifica se está logado
    children: [
      {
        element: <AppShell />, // 2. Adiciona o Layout (Navbar/Sidebar)
        children: [
          {
            path: "/feed", 
            element: <Feed /> // 3. Renderiza o Feed no lugar do Outlet
          },
          // Redireciona a raiz "/" para "/feed" automaticamente
          {
            path: "/",
            element: <Navigate to="/feed" replace />
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)