import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { projectService, ProjectDetails } from "../services/projectService";
import { CreatePostWidget } from "../components/feed/CreatePostWidget"; 
import { RichTextDisplay } from "../components/feed/RichTextDisplay";
import { PostOptions } from "../components/feed/PostOptions";
import api from "../services/api"; 
import { 
    Loader2, MessageCircle, ArrowBigUp, ArrowBigDown, 
    Share2, Users, ShieldCheck, Terminal, LogOut, UserPlus, Crown
} from "lucide-react";

const postCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-900/5";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        try {
            setLoadingProject(true);
            const projData = await projectService.getById(id);
            setProject(projData);

            setLoadingPosts(true);
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

  const handleNewPost = (newPost: any) => {
      setPosts([newPost, ...posts]);
      setProject(prev => prev ? {
          ...prev,
          _count: { ...prev._count, posts: prev._count.posts + 1 }
      } : null);
  };

  const handleDeletePost = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setProject(prev => prev ? {
          ...prev,
          _count: { ...prev._count, posts: Math.max(0, prev._count.posts - 1) }
      } : null);
  };

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

  if (loadingProject) return <AppShell><Sidebar /><div className="flex-1 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;
  if (!project) return <AppShell><Sidebar /><div className="flex-1 p-10 text-center text-zinc-500">Projeto não encontrado.</div></AppShell>;

  // Lógica da Sidebar
  const staffList = project.staff || [];
  const commonMembersCount = Math.max(0, project._count.members - staffList.length);

  return (
    <AppShell>
      <Sidebar />

      {/* ÁREA CENTRAL */}
      <div className="flex-1 min-w-0 max-w-[900px] space-y-6 pb-20 px-4">
        
        {/* HEADER DO PROJETO */}
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

        {/* WIDGET CRIAR POST */}
        {project.isMember ? (
            <CreatePostWidget projectId={project.id} onPostCreated={handleNewPost} />
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
                                <button onClick={(e) => votePost(e, post.id, 1)} className={`p-1 rounded transition-all active:scale-90 ${post.userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-orange-500 hover:bg-zinc-800/50'}`}>
                                    <ArrowBigUp size={24} strokeWidth={2} className={post.userVote === 1 ? 'fill-orange-500/20' : ''} />
                                </button>
                                <span className={`font-bold text-sm my-1 ${post.userVote !== 0 ? (post.userVote === 1 ? 'text-orange-500' : 'text-violet-500') : 'text-zinc-200'}`}>{post._count?.votes || 0}</span>
                                <button onClick={(e) => votePost(e, post.id, -1)} className={`p-1 rounded transition-all active:scale-90 ${post.userVote === -1 ? 'text-violet-500 bg-violet-500/10' : 'text-zinc-500 hover:text-violet-500 hover:bg-zinc-800/50'}`}>
                                    <ArrowBigDown size={24} strokeWidth={2} className={post.userVote === -1 ? 'fill-violet-500/20' : ''} />
                                </button>
                            </div>
                            
                            <div className="flex-1 p-4 cursor-pointer hover:bg-zinc-900/40 transition-colors" onClick={() => navigate(`/post/${post.id}`)}>
                                <div className="flex items-start justify-between mb-2 text-xs text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()} className="font-bold text-zinc-300 hover:text-white cursor-pointer">
                                            @{post.author.username}
                                        </Link>
                                        <span>•</span>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>
                                    <PostOptions postId={post.id} authorId={post.author.id} onDeleteSuccess={handleDeletePost} />
                                </div>
                                <div className="mb-3 text-sm relative max-h-[300px] overflow-hidden mask-linear-fade">
                                    <RichTextDisplay content={post.content} className="line-clamp-6" />
                                </div>
                                <div className="flex gap-4 text-zinc-500 text-xs font-bold">
                                    <button className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"><MessageCircle size={16}/> {post._count?.comments || 0} Comentários</button>
                                    <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors"><Share2 size={16}/> Compartilhar</button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
                {posts.length === 0 && <div className="text-center py-16 text-zinc-500">Nenhum post ainda.</div>}
            </div>
        )}
      </div>

      {/* --- SIDEBAR DIREITA (PADRONIZADA) --- */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-24 h-[calc(100vh-7rem)]">
          
          <div className="flex flex-col h-full border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-black/20 overflow-y-auto no-scrollbar">
              
              {/* CATEGORIA: DESENVOLVEDORES */}
              <div className="mb-6">
                  <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">
                      Desenvolvedores — {staffList.length}
                  </h3>
                  
                  {staffList.map(member => (
                      <Link key={member.id} to={`/profile/${member.username}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                          <div className="relative">
                              <img 
                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}`} 
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-violet-500/50 transition-all"
                              />
                              <div className={`absolute -top-1 -right-1 rounded-full p-0.5 border ${
                                  member.role === 'OWNER' 
                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                  {member.role === 'OWNER' ? <Crown size={8} fill="currentColor"/> : <ShieldCheck size={8} fill="currentColor"/>}
                              </div>
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-200 group-hover:text-white truncate">{member.name}</p>
                              <p className={`text-[10px] font-medium ${member.role === 'OWNER' ? 'text-yellow-500' : 'text-blue-400'}`}>
                                  {member.role === 'OWNER' ? 'Owner' : 'Admin'}
                              </p>
                          </div>
                      </Link>
                  ))}
              </div>

              {/* CATEGORIA: MEMBROS */}
              <div>
                  <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">
                      Membros — {commonMembersCount}
                  </h3>
                  
                  {commonMembersCount > 0 ? (
                      <div className="px-2 py-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg text-center">
                          <div className="flex -space-x-2 justify-center mb-2 overflow-hidden py-1">
                              {[...Array(Math.min(4, commonMembersCount))].map((_, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 ring-1 ring-zinc-800"></div>
                              ))}
                              {commonMembersCount > 4 && (
                                  <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[8px] text-zinc-500 font-bold">
                                      +{commonMembersCount-4}
                                  </div>
                              )}
                          </div>
                          <p className="text-xs text-zinc-500 font-medium">
                              +{commonMembersCount} participantes
                          </p>
                      </div>
                  ) : (
                      <p className="px-2 text-xs text-zinc-600 italic">Nenhum outro membro.</p>
                  )}
              </div>
          </div>

      </aside>

    </AppShell>
  );
}