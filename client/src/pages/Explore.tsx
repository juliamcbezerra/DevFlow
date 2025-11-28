import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { Users, Hash, Search, ArrowRight } from "lucide-react";
import { projectService } from "../services/projectService";

const TAG_FILTERS = ["Todos", "Javascript", "React", "Node", "Python", "DevOps", "AI"];

export default function ProjectsListPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'foryou';
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState("Todos");

  useEffect(() => {
    async function loadProjects() {
        setLoading(true);
        try {
            // USANDO O SERVICE AQUI
            // O 'as' garante a tipagem correta para a função
            const data = await projectService.getAll(activeTab as 'foryou' | 'following');
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    loadProjects();
  }, [activeTab]);

  const filteredProjects = projects.filter(proj => {
      const matchesSearch = 
        proj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (proj.slug && proj.slug.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = activeTagFilter === "Todos" 
        ? true 
        : proj.tags && proj.tags.some((t: string) => t.toLowerCase() === activeTagFilter.toLowerCase());

      return matchesSearch && matchesTag;
  });

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 pb-20 overflow-y-auto no-scrollbar h-full">
        <div className="max-w-[1000px] px-4 space-y-8">
            
            {/* Header + Busca */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {activeTab === 'foryou' ? '✨ Projetos Recomendados' : '📂 Meus Projetos'}
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        {activeTab === 'foryou' ? 'Descubra comunidades baseadas nos seus interesses.' : 'Gerencie as comunidades que você participa.'}
                    </p>
                </div>

                <div className="relative group w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 bg-zinc-950/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 sm:text-sm transition-all shadow-sm"
                        placeholder="Buscar projetos..."
                    />
                </div>
            </div>

            {/* Filtros de Tags */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {TAG_FILTERS.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => setActiveTagFilter(tag)}
                        className={`
                            px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap
                            ${activeTagFilter === tag 
                                ? "bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                                : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"}
                        `}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Grid de Projetos */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((proj) => (
                        <div key={proj.id} className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-black/20">
                            
                            <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none"></div>

                            {/* Avatar */}
                            <div className="relative mb-4">
                                {proj.avatarUrl ? (
                                    <img src={proj.avatarUrl} alt={proj.name} className="w-16 h-16 rounded-2xl ring-4 ring-zinc-950/80 object-cover relative z-10 shadow-lg group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-zinc-950/80 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                        {proj.name[0]}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors truncate w-full px-2">{proj.name}</h3>
                            <p className="text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-3">c/{proj.slug}</p>

                            <p className="text-sm text-zinc-500 line-clamp-2 mb-4 h-10 w-full px-2 leading-tight">
                                {proj.description || "Comunidade focada em desenvolvimento."}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap justify-center gap-1.5 mb-5 w-full min-h-6">
                                {proj.tags && proj.tags.length > 0 ? (
                                    proj.tags.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-2 py-0.5 rounded-md hover:border-violet-500/30 hover:text-violet-300 transition-colors cursor-default">#{tag}</span>
                                    ))
                                ) : (
                                    <span className="text-[10px] text-zinc-600 italic">Geral</span>
                                )}
                            </div>

                            <div className="w-full h-px bg-zinc-800/50 mb-4"></div>

                            <div className="w-full flex items-center justify-between">
                                <div className="text-left flex flex-col">
                                    <span className="text-sm font-bold text-white">{proj._count?.members || 0}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Membros</span>
                                </div>
                                
                                <Link to={`/projects/${proj.slug || proj.id}`}>
                                    <button className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-lg shadow-white/5 hover:scale-105 transition-all active:scale-95 flex items-center gap-1">
                                        Ver <ArrowRight size={12} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <div className="inline-block p-3 bg-zinc-900 rounded-full mb-3"><Hash size={24} className="text-zinc-500" /></div>
                    <h3 className="text-zinc-300 font-bold">Nenhum projeto encontrado</h3>
                    <p className="text-sm text-zinc-500 mt-1">Tente buscar por outro termo ou tag.</p>
                </div>
            )}
        </div>
      </div>
    </AppShell>
  );
}