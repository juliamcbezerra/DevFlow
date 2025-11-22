import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 z-50 px-4 flex items-center justify-between shadow-sm">
      
      {/* 1. LOGO */}
      <div className="w-64 shrink-0 flex items-center gap-2">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-tr from-violet-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-bold text-lg">&lt;/&gt;</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Dev<span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-blue-400">Flow</span>
          </span>
        </Link>
      </div>

      {/* 2. CENTRO: HOME + BUSCA */}
      <div className="flex-1 max-w-2xl flex items-center gap-4 px-4">
        
        {/* Botão Home (Casa) - Novo! */}
        <Link to="/feed" className="p-2.5 text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 rounded-full transition-colors shadow-sm border border-transparent hover:border-zinc-700" title="Página Inicial">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </Link>

        {/* Barra de Pesquisa */}
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar no DevFlow..."
            className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-full leading-5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:bg-zinc-950/80 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 sm:text-sm transition-all backdrop-blur-md"
          />
        </div>
      </div>

      {/* 3. LADO DIREITO: NOTIFICAÇÕES E PERFIL */}
      <div className="w-64 flex justify-end items-center gap-4">
        
        {/* Sino de Notificação */}
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-zinc-900 animate-pulse"></span>
        </button>

        {/* Perfil Dropdown */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/50">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-bold text-zinc-200">{user?.name || 'Usuário'}</span>
            <span className="text-xs text-zinc-500">@dev</span>
          </div>
          <button onClick={signOut} className="group relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=8b5cf6&color=fff`} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full ring-2 ring-zinc-800 group-hover:ring-violet-500 cursor-pointer transition-all"
            />
          </button>
        </div>

      </div>
    </header>
  );
}