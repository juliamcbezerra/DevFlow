import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { CreatePostWidget } from "../components/feed/CreatePostWidget"; 
import { RichTextDisplay } from "../components/feed/RichTextDisplay";
import { PostOptions } from "../components/feed/PostOptions"; 
import { ProjectSidebar } from "../components/projects/ProjectSidebar"; 
import { EditProjectModal } from "../components/projects/EditProjectModal";
import api from "../services/api"; 
import { 
    Loader2, MessageCircle, ArrowBigUp, ArrowBigDown, Settings, 
    Share2, Users, ShieldCheck, Terminal, LogOut, UserPlus, X, Crown, Trash2
} from "lucide-react";

// Estilo do Card Rico (Recuperado da versão antiga)
const postCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-900/5";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Ação
  const [joining, setJoining] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados do Modal de Convite
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  useEffect(() => {
    if (!id) return;
    async function loadData() {
        try {
            setLoading(true);
            const projData = await projectService.getById(id!);
            setProject(projData);
            const { data: postsData } = await api.get(`/social/projects/${projData.id}/posts`);
            setPosts(postsData);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    }
    loadData();
  }, [id]);

  // --- Lógica de Entrar/Sair/Deletar ---
  const handleJoinLeave = async () => {
      if (!project) return;
      setJoining(true);
      try {
          if (project.isMember) {
              await projectService.leave(project.id);
              setProject((prev: any) => prev ? ({ ...prev, isMember: false, _count: { ...prev._count, members: prev._count.members - 1 } }) : null);
          } else {
              await projectService.join(project.id);
              setProject((prev: any) => prev ? ({ ...prev, isMember: true, _count: { ...prev._count, members: prev._count.members + 1 } }) : null);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setJoining(false);
      }
  };

  const handleDeleteProject = async () => {
      if (!project) return;
      if (!window.confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) return;
      
      setJoining(true);
      try {
          await projectService.delete(project.id);
          navigate('/feed');
      } catch (err: any) {
          console.error("Erro ao deletar projeto:", err);
          const errorMsg = err.response?.data?.message || "Erro ao excluir projeto";
          alert(errorMsg);
          setJoining(false);
      }
  };

  // --- Lógica de Convidar ---
  const handleInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!project) return;
      setInviting(true);
      try {
          await api.post(`/projects/${project.id}/invite`, { username: inviteUsername, role: inviteRole });
          setShowInviteModal(false);
          setInviteUsername("");
          alert("Convite enviado!");
      } catch (err) { alert("Erro ao convidar (Usuário não existe ou já é membro)"); }
      finally { setInviting(false); }
  };

  // --- Lógica de Posts (Criar, Deletar, Votar) ---
  const handleNewPost = (newPost: any) => { 
      setPosts([newPost, ...posts]); 
      setProject((prev: any) => prev ? { ...prev, _count: { ...prev._count, posts: prev._count.posts + 1 } } : null);
  };

  const handleDeletePost = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setProject((prev: any) => prev ? {
          ...prev,
          _count: { ...prev._count, posts: Math.max(0, prev._count.posts - 1) }
      } : null);
  };

  const votePost = async (e: React.MouseEvent, postId: string, intent: number) => {
    e.stopPropagation();
    setPosts(prev => prev.map(p => {
       if (p.id !== postId) return p;
       const currentVote = p.userVote || 0;
       let newVote = 0;
       let scoreDelta = 0;

       if (currentVote === intent) {
           newVote = 0;
           scoreDelta = -intent; 
       } else if (currentVote === 0) {
           newVote = intent;
           scoreDelta = intent;
       } else {
           newVote = intent;
           scoreDelta = intent * 2;
       }

       return {
           ...p,
           userVote: newVote,
           _count: { ...p._count, votes: p._count.votes + scoreDelta }
       };
    }));
    await api.post('/social/vote', { postId, value: intent });
  };
  
  const formatDate = (dateString: string) => {
    try { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString)); } catch (e) { return ""; }
  };

  if (loading) return <AppShell><Sidebar /><div className="flex-1 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;
  if (!project) return <AppShell><Sidebar /><div className="flex-1 p-10 text-center text-zinc-500">Projeto não encontrado.</div></AppShell>;

  const canInvite = project.myRole === 'OWNER' || project.myRole === 'ADMIN';

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 flex min-w-0 pb-20 px-6 max-w-7xl mx-auto w-full gap-6">
        
        {/* === ÁREA CENTRAL === */}
        <div className="flex-1 min-w-0 space-y-6">
            
            {/* HEADER RICO */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-lg">
                <div className={`h-32 w-full bg-linear-to-r from-violet-900/40 to-blue-900/40 relative overflow-hidden`}>
                    {project.bannerUrl ? (
                        <img src={project.bannerUrl} className="w-full h-full object-cover" alt="Banner"/>
                    ) : (
                        <div className="w-full h-full bg-linear-to-r from-violet-900/40 to-blue-900/40">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                        </div>
                    )}
                </div>
                
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-10 mb-4 gap-4">
                        <div className="flex items-end gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-zinc-950 border-4 border-zinc-950 flex items-center justify-center text-4xl shadow-xl overflow-hidden relative shrink-0">
                                {project.avatarUrl ? <img src={project.avatarUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-white">{project.name[0]}</span>}
                            </div>
                            <div className="mb-1 min-w-0">
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2 truncate">
                                    {project.name}
                                    {project.ownerId === user?.id && (
                                        <span title="Dono do Projeto" className="flex items-center">
                                            <ShieldCheck size={20} className="text-yellow-500 shrink-0" />
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm text-zinc-400 font-mono">c/{project.slug}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                            {/* BOTÃO EDITAR (SÓ PARA DONO) */}
                            {project.myRole === 'OWNER' && (
                                <button 
                                    onClick={() => setShowEditModal(true)} 
                                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-zinc-700 transition-all"
                                    title="Editar Projeto"
                                >
                                    <Settings size={18} />
                                </button>
                            )}
                            {canInvite && (
                                <button onClick={() => setShowInviteModal(true)} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs border border-zinc-700 flex items-center gap-2 transition-all">
                                    <UserPlus size={14}/> <span className="hidden sm:inline">Convidar</span>
                                </button>
                            )}                           
                            {project.myRole === 'OWNER' ? (
                                <button 
                                    onClick={handleDeleteProject} 
                                    disabled={joining} 
                                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300`}
                                >
                                    {joining ? <Loader2 className="animate-spin w-4 h-4"/> : <><Trash2 size={14}/> Excluir Projeto</>}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleJoinLeave} 
                                    disabled={joining} 
                                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${
                                        project.isMember 
                                        ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-red-500/50 hover:text-red-400 hover:bg-zinc-900' 
                                        : 'bg-violet-600 hover:bg-violet-700 text-white hover:scale-105'
                                    }`}
                                >
                                    {joining ? <Loader2 className="animate-spin w-4 h-4"/> : (project.isMember ? <><LogOut size={14}/> Sair</> : <><UserPlus size={14}/> Participar</>)}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-zinc-300 mb-6 text-sm leading-relaxed max-w-2xl">
                        {project.description || "Sem descrição definida."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-800/50 pt-4">
                        <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-800/30 px-2 py-1 rounded-md border border-zinc-800/50">
                            <Users size={14} className="text-violet-400"/> {project._count?.members || 0} Membros
                        </span>
                        <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-800/30 px-2 py-1 rounded-md border border-zinc-800/50">
                            <Terminal size={14} className="text-emerald-400"/> {project._count?.posts || 0} Posts
                        </span>
                        
                        <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block"></div>
                        
                        {project.tags && project.tags.length > 0 ? (
                            project.tags.map((tag: string) => (
                                <span key={tag} className="text-zinc-400 hover:text-violet-300 transition-colors cursor-pointer">#{tag}</span>
                            ))
                        ) : (
                            <span className="text-zinc-600 italic">Sem tags</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Widget de Post */}
            {project.isMember ? (
                <CreatePostWidget projectId={project.id} onPostCreated={handleNewPost} />
            ) : (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl p-8 text-center animate-in fade-in duration-700">
                    <p className="text-zinc-400 font-bold mb-1 flex items-center justify-center gap-2"><ShieldCheck size={18}/> Modo Visitante</p>
                    <p className="text-xs text-zinc-500">Entre na comunidade para postar, interagir e ver canais exclusivos.</p>
                </div>
            )}
            
            {/* LISTA DE POSTS (Completa e Rica) */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <article key={post.id} className={postCardClass}>
                        <div className="flex h-full">
                            {/* Coluna de Votos */}
                            <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 border-r border-zinc-800/50 gap-1 shrink-0">
                                <button onClick={(e) => votePost(e, post.id, 1)} className={`p-1 rounded transition-all active:scale-90 ${post.userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-orange-500 hover:bg-zinc-800/50'}`}>
                                    <ArrowBigUp size={24} strokeWidth={2} className={post.userVote === 1 ? 'fill-orange-500/20' : ''} />
                                </button>
                                <span className={`font-bold text-sm my-1 ${post.userVote !== 0 ? (post.userVote === 1 ? 'text-orange-500' : 'text-violet-500') : 'text-zinc-200'}`}>{post._count?.votes || 0}</span>
                                <button onClick={(e) => votePost(e, post.id, -1)} className={`p-1 rounded transition-all active:scale-90 ${post.userVote === -1 ? 'text-violet-500 bg-violet-500/10' : 'text-zinc-500 hover:text-violet-500 hover:bg-zinc-800/50'}`}>
                                    <ArrowBigDown size={24} strokeWidth={2} className={post.userVote === -1 ? 'fill-violet-500/20' : ''} />
                                </button>
                            </div>
                            
                            {/* Conteúdo do Post */}
                            <div className="flex-1 p-4 cursor-pointer hover:bg-zinc-900/40 transition-colors" onClick={() => navigate(`/post/${post.id}`)}>
                                <div className="flex items-start justify-between mb-2 text-xs text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 group">
                                            <img src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`} className="w-5 h-5 rounded-full bg-zinc-800"/>
                                            <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">@{post.author.username}</span>
                                        </Link>
                                        <span>•</span>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>
                                    
                                    {/* ✅ PostOptions Recuperado */}
                                    <PostOptions postId={post.id} authorId={post.author.id} onDeleteSuccess={handleDeletePost} />
                                </div>
                                
                                <div className="mb-3 text-sm relative max-h-[300px] overflow-hidden mask-linear-fade">
                                    <RichTextDisplay content={post.content} className="line-clamp-6" />
                                </div>
                                
                                <div className="flex gap-4 text-zinc-500 text-xs font-bold pt-1">
                                    <button className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"><MessageCircle size={16}/> {post._count?.comments || 0} Comentários</button>
                                    <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"><Share2 size={16}/> Compartilhar</button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
                
                {posts.length === 0 && (
                    <div className="text-center py-10 text-zinc-600 text-sm">Nenhum post encontrado.</div>
                )}
            </div>
        </div>

        {/* === SIDEBAR DIREITA === */}
        {project.groupedMembers && (
            <ProjectSidebar groupedMembers={project.groupedMembers} />
        )}

      </div>

      {/* MODAL DE CONVITE */}
      {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">Convidar para o Projeto</h3>
                      <button onClick={() => setShowInviteModal(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <form onSubmit={handleInvite} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Username</label>
                          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 focus-within:border-violet-500 transition-colors">
                              <span className="text-zinc-500">@</span>
                              <input 
                                  value={inviteUsername} onChange={e => setInviteUsername(e.target.value)}
                                  className="w-full bg-transparent border-none text-white p-2.5 focus:ring-0 text-sm outline-none"
                                  placeholder="ex: lucasdev" required
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Cargo</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button type="button" onClick={() => setInviteRole('MEMBER')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${inviteRole === 'MEMBER' ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}>
                                  Membro
                              </button>
                              <button type="button" onClick={() => setInviteRole('ADMIN')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${inviteRole === 'ADMIN' ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}>
                                  Desenvolvedor
                              </button>
                          </div>
                      </div>

                      <button type="submit" disabled={inviting} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl mt-2 flex justify-center items-center gap-2 transition-colors">
                          {inviting ? <Loader2 className="animate-spin"/> : "Enviar Convite"}
                      </button>
                  </form>
              </div>
          </div>
      )}
    {showEditModal && (
        <EditProjectModal 
            project={project} 
            onClose={() => setShowEditModal(false)}
            onUpdateSuccess={(updatedProj) => {
                setProject((prev: any) => ({ ...prev, ...updatedProj }));
            }}
        />
    )}
    </AppShell>
  );
}