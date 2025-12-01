import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { projectService, Project } from "../services/projectService";
import { 
    FolderGit2, Sparkles, CheckCircle2, Users, MessageSquare, 
    Plus, ArrowRight 
} from "lucide-react";

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'foryou'; // Padrão 'foryou'
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await projectService.getAll(activeTab as any);
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [activeTab]);

  const handleTabChange = (type: string) => {
      setSearchParams({ type });
  };

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 pb-20 pt-6 px-4 max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FolderGit2 size={28} className="text-violet-500"/> Projetos
                </h1>
                <p className="text-zinc-400 mt-2">Explore iniciativas da comunidade e colabore.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-900/20 flex items-center gap-2"
            >
                <Plus size={18}/> Novo Projeto
            </button>
        </div>

        {/* Grid de Projetos */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="relative bg-zinc-950/30 border border-zinc-800/60 rounded-3xl flex flex-col hover:border-zinc-700 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-xl hover:shadow-black/40 h-full">
                        
                        {/* 1. BANNER (Gradiente Ciano/Azul) */}
                        <div className="h-24 w-full bg-linear-to-b from-cyan-900/20 to-transparent relative shrink-0">
                        </div>

                        {/* Conteúdo */}
                        <div className="px-6 pb-6 flex flex-col items-center text-center -mt-12 flex-1">
                            
                            {/* 2. ÍCONE (Quadrado) */}
                            <Link to={`/project/${project.slug || project.id}`} className="relative z-10 shrink-0">
                                <div className="w-24 h-24 rounded-2xl mb-4 p-1 bg-zinc-950 shadow-2xl ring-1 ring-zinc-800 group-hover:ring-zinc-600 transition-all flex items-center justify-center">
                                    {project.avatarUrl ? (
                                        <img src={project.avatarUrl} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center text-3xl font-bold text-zinc-700 uppercase">
                                            {project.name[0]}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            
                            {/* Nome e Slug (Altura mínima para alinhar) */}
                            <div className="mb-4 w-full min-h-[50px]">
                                <Link to={`/project/${project.slug || project.id}`} className="font-bold text-white text-xl hover:text-cyan-400 transition-colors block truncate">
                                    {project.name}
                                </Link>
                                <span className="text-zinc-500 text-xs font-mono bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/50">c/{project.slug}</span>
                            </div>

                            {/* Descrição (Fixo) */}
                            <p className="text-zinc-400 text-sm mb-6 line-clamp-2 min-h-10 px-2 leading-relaxed">
                                {project.description || "Sem descrição definida para este projeto."}
                            </p>

                            {/* 3. STATS */}
                            <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 mb-6 w-full justify-center">
                                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                                    <Users size={12} className="text-cyan-500"/>
                                    <span>{project._count.members}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                                    <MessageSquare size={12} className="text-violet-500"/>
                                    <span>{project._count.posts}</span>
                                </div>
                            </div>

                            {/* 4. TAGS (Espaço Reservado Fixo) */}
                            <div className="w-full min-h-[30px] flex items-start justify-center mb-6">
                                {activeTab === 'foryou' && project.matchingTags && project.matchingTags > 0 ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 py-1 px-3 rounded-md border border-cyan-500/20">
                                        <Sparkles size={10}/> {project.matchingTags} Tags compatíveis
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-1.5 w-full overflow-hidden h-full">
                                        {project.tags.slice(0, 3).map((t) => (
                                            <span key={t} className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-md">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botão de Ação (No fundo) */}
                            <Link 
                                to={`/projects/${project.slug || project.id}`}
                                className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    activeTab === 'following'
                                    ? "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 group-hover:shadow-lg"
                                }`}
                            >
                                {activeTab === 'following' ? 'Acessar Comunidade' : <><ArrowRight size={14}/> Ver Projeto</>}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {!loading && projects.length === 0 && (
            <div className="text-center py-24 opacity-50 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <FolderGit2 size={64} className="mx-auto mb-6 text-zinc-700"/>
                <p className="text-zinc-500 font-medium text-lg">
                    {activeTab === 'following' ? "Você não participa de nenhum projeto." : "Nenhum projeto encontrado."}
                </p>
                {activeTab === 'following' && (
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-violet-400 hover:underline">
                        Criar um novo projeto
                    </button>
                )}
            </div>
        )}

      </div>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppShell>
  );
}