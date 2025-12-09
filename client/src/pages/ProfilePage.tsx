import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; 
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { userService, UserProfile } from "../services/userService";
import { Post, postsService } from "../services/postsService";
import { Project } from "../services/projectService"; 
import { ProfileHeader } from "./ProfileHeader";
import { Loader2, MessageSquare, FolderGit2, Ghost, Users } from "lucide-react";
import { RichTextDisplay } from "../components/feed/RichTextDisplay";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]); 
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'projects'>('posts');

  useEffect(() => {
    async function loadData() {
      if (!username) return;
      setLoading(true);
      try {
        // Busca tudo em paralelo para ser rápido
        const [userData, userPostsData, userProjectsData] = await Promise.all([
            userService.getByUsername(username),
            userService.getUserPosts(username),
            userService.getUserProjects(username)
        ]);

        setProfile(userData);
        setPosts(userPostsData);
        setUserProjects(userProjectsData); // Salva os projetos
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
        setProfile(prev => prev ? ({
            ...prev,
            isFollowing: !prev.isFollowing,
            _count: {
                ...prev._count,
                followedBy: prev.isFollowing ? prev._count.followedBy - 1 : prev._count.followedBy + 1
            }
        }) : null);
        await userService.toggleFollow(profile.username);
    } catch (error) { console.error(error); }
  };

  const refreshProfile = async () => {
    if (!username) return;
    try {
      const userData = await userService.getByUsername(username);
      setProfile(userData);
    } catch (error) {
      console.error("Erro ao recarregar perfil:", error);
    }
  };

  if (loading) return <AppShell><Sidebar/><div className="flex-1 flex justify-center items-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;
  
  if (!profile) return (
    <AppShell>
        <Sidebar/>
        <div className="flex-1 flex flex-col justify-center items-center h-screen text-zinc-500">
            <Ghost size={48} className="mb-4"/>
            <h2 className="text-xl font-bold text-white">Usuário não encontrado</h2>
            <button onClick={() => navigate('/feed')} className="mt-4 text-violet-400 hover:underline">Voltar para o Feed</button>
        </div>
    </AppShell>
  );

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 pb-20 overflow-y-auto custom-scrollbar">
        
        <ProfileHeader profile={profile} onFollowToggle={handleFollowToggle} onRefresh={refreshProfile} />

        <div className="px-4 md:px-10 max-w-4xl">
            
            {/* ABAS */}
            <div className="flex border-b border-zinc-800 mb-6">
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'posts' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <MessageSquare size={16}/> Posts <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px]">{posts.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'projects' ? 'border-violet-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <FolderGit2 size={16}/> Projetos <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px]">{userProjects.length}</span>
                </button>
            </div>

            {/* CONTEÚDO: POSTS */}
            {activeTab === 'posts' && (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div 
                            key={post.id} 
                            onClick={() => navigate(`/post/${post.id}`)}
                            className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:bg-zinc-900/60 hover:border-zinc-700 transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                                <span className="text-zinc-300 font-bold group-hover:text-violet-400 transition-colors">{post.author.name}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.project && <span className="text-zinc-600 bg-zinc-950 px-1.5 rounded border border-zinc-800">em c/{post.project.slug}</span>}
                            </div>
                            <RichTextDisplay content={post.content} className="line-clamp-3 text-sm"/>
                            <div className="mt-3 flex gap-4 text-xs font-bold text-zinc-500">
                                <span>{post._count.votes} Votos</span>
                                <span>{post._count.comments} Comentários</span>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <MessageSquare size={32} className="mx-auto mb-2 opacity-50"/>
                            <p>Nenhum post publicado ainda.</p>
                        </div>
                    )}
                </div>
            )}

            {/* CONTEÚDO: PROJETOS (AGORA FUNCIONAL) */}
            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProjects.map(proj => (
                        <Link to={`/projects/${proj.slug || proj.id}`} key={proj.id} className="block group">
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 hover:bg-zinc-900/60 transition-all h-full flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                                        {proj.avatarUrl ? <img src={proj.avatarUrl} className="w-full h-full object-cover rounded-lg"/> : proj.name[0]}
                                    </div>
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider border border-zinc-800 px-2 py-1 rounded bg-zinc-950">
                                        c/{proj.slug}
                                    </span>
                                </div>
                                
                                <h3 className="text-base font-bold text-white mb-1 group-hover:text-violet-400 transition-colors truncate">{proj.name}</h3>
                                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 flex-1 leading-relaxed">{proj.description || "Sem descrição."}</p>
                                
                                <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium pt-3 border-t border-zinc-800/50">
                                    <span className="flex items-center gap-1"><Users size={12}/> {proj._count.members} membros</span>
                                    <span className="flex items-center gap-1"><MessageSquare size={12}/> {proj._count.posts} posts</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    
                    {userProjects.length === 0 && (
                        <div className="col-span-full text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <FolderGit2 size={32} className="mx-auto mb-2 opacity-50"/>
                            <p>Nenhum projeto criado ainda.</p>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </AppShell>
  );
}