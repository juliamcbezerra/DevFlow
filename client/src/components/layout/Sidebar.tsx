import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  // Estado para controlar a aba ativa (Visual apenas, lógica real seria no contexto ou URL)
  const [feedFilter, setFeedFilter] = useState<'foryou' | 'following'>('foryou');

  const linkClasses = (path: string) => `
    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
    ${isActive(path) 
      ? "bg-violet-500/15 text-violet-400 border border-violet-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" 
      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
    }
  `;

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 border-r border-zinc-800/50 bg-zinc-900/70 backdrop-blur-xl p-4 overflow-y-auto z-40">
      
      {/* --- 1. SELETOR DE FEED (ABAS) --- */}
      {/* Este bloco TEM que aparecer no topo da sidebar */}
      <div className="mb-6 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800/80 flex shadow-inner shrink-0">
        <button 
          onClick={() => setFeedFilter('foryou')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${feedFilter === 'foryou' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Para você
        </button>
        <button 
          onClick={() => setFeedFilter('following')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${feedFilter === 'following' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Seguindo
        </button>
      </div>

      {/* --- 2. NAVEGAÇÃO --- */}
      <nav className="space-y-1 flex-1">
        <Link to="/projects" className={linkClasses("/projects")}>
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm12 3h-6m6 4h-6m6 4h-6"/></svg>
          <span>Projetos</span>
        </Link>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Atalhos</h3>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span> React Frontends
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
              <span className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.4)]"></span> Backend Node
            </a>
          </nav>
        </div>
      </nav>

      {/* --- 3. RODAPÉ: CONFIGURAÇÕES E AJUDA --- */}
      <div className="mt-auto pt-4 border-t border-zinc-800/50 space-y-1 shrink-0">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors text-sm font-medium group">
          <svg className="w-5 h-5 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Configurações
        </Link>
        <Link to="/help" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors text-sm font-medium group">
          <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Ajuda e Suporte
        </Link>
      </div>

    </aside>
  );
}