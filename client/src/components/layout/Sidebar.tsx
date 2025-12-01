import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CreateProjectModal } from "../projects/CreateProjectModal";
import { Home, Hash, Users, Settings, LogOut, Plus } from "lucide-react";
import { projectService } from "../../services/projectService";

export function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]); // Estado para os projetos

  const isActive = (path: string) => location.pathname === path;
  const currentType = searchParams.get('type') || 'foryou';

  // Carrega projetos que o usuário segue/participa
  useEffect(() => {
      async function loadShortcuts() {
          try {
              // 'following' traz projetos que sou membro
              const data = await projectService.getAll('following'); 
              setMyProjects(data.slice(0, 5)); // Limita a 5 para não quebrar o layout
          } catch (error) {
              console.error("Erro ao carregar atalhos", error);
          }
      }
      loadShortcuts();
  }, []);

  const handleTypeChange = (type: 'foryou' | 'following') => {
    setSearchParams(prev => {
      prev.set('type', type);
      return prev;
    });
  };

  const linkClasses = (path: string) => `
    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
    ${isActive(path) 
      ? "bg-violet-500/15 text-violet-400 border border-violet-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" 
      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
    }
  `;

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 sticky top-24 max-h-[calc(100vh-7rem)] shrink-0">
        
        <div className="flex flex-col h-full border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-black/20 overflow-y-auto no-scrollbar">
          
          {/* SELETOR DE FEED */}
          <div className="mb-6 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800/80 flex shadow-inner shrink-0">
            <button 
              onClick={() => handleTypeChange('foryou')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${currentType === 'foryou' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Para você
            </button>
            <button 
              onClick={() => handleTypeChange('following')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${currentType === 'following' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Seguindo
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            <Link to="/feed" className={linkClasses("/feed")}>
               <Home size={20} />
               <span>Feed Principal</span>
            </Link>
            <Link to="/projects" className={linkClasses("/projects")}>
               <Hash size={20} />
               <span>Projetos</span>
            </Link>
            <Link to="/community" className={linkClasses("/community")}>
               <Users size={20} />
               <span>Comunidade</span>
            </Link>

            {/* ATALHOS REAIS */}
            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Meus Projetos</h3>
              <nav className="space-y-1">
                {myProjects.length > 0 ? (
                    myProjects.map(proj => (
                        <Link 
                            key={proj.id}
                            to={`/projects/${proj.slug || proj.id}`}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group"
                        >
                            {/* Avatarzinho ou Dot */}
                            {proj.avatarUrl ? (
                                <img src={proj.avatarUrl} className="w-5 h-5 rounded-md object-cover" />
                            ) : (
                                <span className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.4)] group-hover:scale-125 transition-transform"></span>
                            )}
                            <span className="truncate">{proj.name}</span>
                        </Link>
                    ))
                ) : (
                    <p className="px-4 text-xs text-zinc-600 italic py-2">
                        Você não participa de nenhum.
                    </p>
                )}
              </nav>
            </div>

            {/* BOTÃO CRIAR */}
            <div className="mt-6">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700/50 hover:border-violet-500/50 hover:bg-violet-500/10 text-zinc-400 hover:text-violet-300 transition-all text-xs font-bold uppercase tracking-wide group"
                >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" /> Criar Projeto
                </button>
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t border-zinc-800/50 space-y-1">
            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors text-sm font-medium group">
              <Settings size={20} className="group-hover:text-violet-400 transition-colors" />
              Configurações
            </Link>
            <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium group">
              <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}