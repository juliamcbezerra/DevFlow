import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { projectService, ProjectDetails } from "../services/projectService";
import { CreatePostWidget } from "../components/feed/CreatePostWidget"; 
import api from "../services/api"; 
import { 
    Loader2, MessageCircle, ArrowBigUp, ArrowBigDown, 
    Share2, Users, Hash, ShieldCheck, Terminal, LogOut, UserPlus
} from "lucide-react";

const postCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-900/5";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [joining, setJoining] = useState(false);

  // Carregar Dados
  useEffect(() => {
    async function loadData() {
        if (!id) return;
        try {
            setLoadingProject(true);
            const projData = await projectService.getById(id);
            setProject(projData);

            setLoadingPosts(true);
            // IMPORTANTE: Busca posts usando o ID retornado (caso a URL seja slug)
            const { data: postsData } = await api.get(`/social/projects/${projData.id}/posts`);
            setPosts(postsData);
        } catch (error) {
            console.error("Erro ao carregar", error);
        } finally {
            setLoadingProject(false);
            setLoadingPosts(false);
        }
    }
    loadData();
  }, [id]);

  // Função chamada quando o Widget cria um post com sucesso
  const handleNewPost = (newPost: any) => {
      setPosts([newPost, ...posts]); // Adiciona no topo da lista
  };

  // Join/Leave
  const handleJoinLeave = async () => {
      if (!project) return;
      setJoining(true);
      try {
          if (project.isMember) {
              await projectService.leave(project.id);
              setProject(prev => prev ? ({ ...prev, isMember: false, _count: { ...prev._count, members: prev._count.members - 1 } }) : null);
          } else {
              await projectService.join(project.id);
              setProject(prev => prev ? ({ ...prev, isMember: true, _count: { ...prev._count, members: prev._count.members + 1 } }) : null);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setJoining(false);
      }
  };

  // Votos
  const votePost = async (postId: string, value: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? {...p, _count: {...p._count, votes: p._count.votes + value}} : p));
    await api.post('/social/vote', { postId, value });
  };

  const formatDate = (dateString: string) => {
    try { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString)); } catch (e) { return ""; }
  };

  if (loadingProject) return <AppShell><Sidebar /><div className="flex-1 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;
  if (!project) return <AppShell><Sidebar /><div className="flex-1 p-10 text-center text-zinc-500">Projeto não encontrado.</div></AppShell>;

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 max-w-[900px] space-y-6 pb-20 px-4">
        
        {/* HEADER */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
            <div className={`h-32 w-full bg-linear-to-r from-violet-900/40 to-blue-900/40`}></div>
            <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-10 mb-4 gap-4">
                    <div className="flex items-end gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-zinc-950 border-4 border-zinc-950 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
                            {project.avatarUrl ? <img src={project.avatarUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-white">{project.name[0]}</span>}
                        </div>
                        <div className="mb-1">
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                {project.name}
                                {project.ownerId === user?.id && <span title="Você é o dono"><ShieldCheck size={20} className="text-green-500" /></span>}
                            </h1>
                            <p className="text-sm text-zinc-400 font-mono">c/{project.slug}</p>
                        </div>
                    </div>
                    <button onClick={handleJoinLeave} disabled={joining} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${project.isMember ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-red-500/50 hover:text-red-400 hover:bg-zinc-900' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                        {joining ? <Loader2 className="animate-spin w-4 h-4"/> : (project.isMember ? <><LogOut size={16}/> Sair</> : <><UserPlus size={16}/> Participar</>)}
                    </button>
                </div>
                <p className="text-zinc-300 mb-6 text-sm leading-relaxed max-w-2xl">{project.description || "Bem-vindo à comunidade!"}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-800/50 pt-4">
                    <span className="flex items-center gap-1.5 text-zinc-300"><Users size={14}/> {project._count.members} Membros</span>
                    <span className="flex items-center gap-1.5"><Terminal size={14}/> {project._count.posts} Posts</span>
                    <div className="h-4 w-px bg-zinc-800 mx-2"></div>
                    {project.tags.map(tag => <span key={tag} className="bg-zinc-800/50 text-zinc-400 px-2 py-1 rounded-md">#{tag}</span>)}
                </div>
            </div>
        </div>

        {/* --- USANDO O NOVO COMPONENTE AQUI --- */}
        {project.isMember ? (
            <CreatePostWidget 
                projectId={project.id} 
                onPostCreated={handleNewPost} 
            />
        ) : (
            <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl p-6 text-center">
                <p className="text-zinc-400 font-medium mb-1">Você é um visitante.</p>
                <p className="text-xs text-zinc-500">Entre na comunidade para postar e interagir.</p>
            </div>
        )}

        {/* LISTA DE POSTS */}
        {loadingPosts ? (
             <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/50"></div>)}</div>
        ) : (
            <div className="space-y-4">
                {posts.map((post) => (
                    <article key={post.id} className={postCardClass}>
                        <div className="flex h-full">
                            <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 border-r border-zinc-800/50 gap-1 shrink-0">
                                <button onClick={() => votePost(post.id, 1)} className="text-zinc-500 hover:text-orange-500 p-1 rounded hover:bg-zinc-800/50 transition-colors"><ArrowBigUp size={24} strokeWidth={2} /></button>
                                <span className="font-bold text-sm text-zinc-200 my-1">{post._count?.votes || 0}</span>
                                <button onClick={() => votePost(post.id, -1)} className="text-zinc-500 hover:text-violet-500 p-1 rounded hover:bg-zinc-800/50 transition-colors"><ArrowBigDown size={24} strokeWidth={2} /></button>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                                    <span className="font-bold text-zinc-300 hover:text-white cursor-pointer">@{post.author.username}</span>
                                    <span>•</span>
                                    <span>{formatDate(post.createdAt)}</span>
                                </div>
                                <div className="text-zinc-200 mb-3 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</div>
                                <div className="flex gap-4 text-zinc-500 text-xs font-bold">
                                    <button className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"><MessageCircle size={16}/> {post._count?.comments || 0} Comentários</button>
                                    <button className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"><Share2 size={16}/> Compartilhar</button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        )}
      </div>
    </AppShell>
  );
}