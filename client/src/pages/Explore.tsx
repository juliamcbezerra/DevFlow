import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar"; 
import { Users, Hash } from "lucide-react";
import api from "../services/api";

export default function ProjectsListPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'foryou';
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
        setLoading(true);
        try {
            const { data } = await api.get(`/projects?type=${activeTab}`);
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    loadProjects();
  }, [activeTab]);

  return (
    <AppShell>
      <Sidebar />

      {/* COLUNA CENTRAL - LAYOUT CONSISTENTE */}
      <div className="flex-1 min-w-0 max-w-[1000px] px-4 space-y-8 pb-20"> {/* Mesma estrutura do Feed */}
        
        {/* Header da página */}
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'foryou' ? '✨ Projetos Recomendados' : '📂 Meus Projetos'}
            </h1>
            <p className="text-zinc-400 text-sm">
                {activeTab === 'foryou' 
                    ? 'Baseado nas suas tags de interesse' 
                    : 'Comunidades que você faz parte'}
            </p>
        </div>

        {/* Grid de projetos */}
        {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-48 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/50"></div>
                ))}
            </div>
        ) : projects.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
                <div className="bg-zinc-900/80 p-4 rounded-full mb-4 ring-1 ring-zinc-800">
                    <Users size={32} className="text-zinc-500" />
                </div>
                <h3 className="text-zinc-300 font-bold text-lg mb-1">Nenhum projeto encontrado</h3>
                <p className="text-zinc-500 text-sm max-w-xs">
                    {activeTab === 'following' 
                        ? "Você ainda não segue nenhum projeto." 
                        : "Entre em comunidades para ver conteúdo!"}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {projects.map(proj => (
                    <Link to={`/projects/${proj.id}`} key={proj.id} className="block group">
                        <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/10 transition-all duration-300">
                            
                            {/* Header do card */}
                            <div className="flex items-start gap-4 mb-4">
                                {/* Avatar do projeto */}
                                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                                    {proj.name[0]}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors mb-1 truncate">
                                        {proj.name}
                                    </h3>
                                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                                        <Users size={12} />
                                        <span>{proj.memberCount || 0} membros</span>
                                    </p>
                                </div>
                            </div>

                            {/* Descrição */}
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                                {proj.description || 'Sem descrição'}
                            </p>

                            {/* Tags */}
                            {proj.tags && proj.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {proj.tags.slice(0, 3).map((tag: string) => (
                                        <span 
                                            key={tag} 
                                            className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-md flex items-center gap-1"
                                        >
                                            <Hash size={10} />
                                            {tag}
                                        </span>
                                    ))}
                                    {proj.tags.length > 3 && (
                                        <span className="text-xs text-zinc-500">
                                            +{proj.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>

      {/* WIDGETS LATERAIS - MESMA ESTRUTURA DO FEED */}
      <aside className="hidden xl:block w-[320px] shrink-0 sticky top-24 h-fit space-y-6">
          
          {/* Widget: Criar Projeto */}
          <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm p-5">
            <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 pb-2">
              ✨ Crie seu Projeto
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Traga seu próprio projeto para o DevFlow e compartilhe conhecimento com outros devs!
            </p>
            <Link to="/projects/new">
                <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-violet-600/20">
                    + Criar Projeto
                </button>
            </Link>
          </div>

          {/* Widget: Trending Topics */}
          <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm p-5">
            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 pb-2">
              <Hash size={16} className="text-orange-500"/> Tags Populares
            </h3>
            <div className="flex flex-wrap gap-2">
              {['javascript', 'reactjs', 'nodejs', 'python', 'devops', 'ai'].map(tag => (
                <span 
                    key={tag} 
                    className="px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40 rounded-lg text-xs text-zinc-300 hover:text-white cursor-pointer transition-colors backdrop-blur-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
      </aside>
    </AppShell>
  );
}