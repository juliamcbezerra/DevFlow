import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { usePosts } from "../hooks/usePosts";
import { 
    Terminal, MessageCircle, ArrowBigUp, ArrowBigDown, Share2, Hash, UserPlus
} from "lucide-react";
import api from "../services/api";

const postCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-900/5";
const widgetCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm";

export default function FeedPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'foryou';
  
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/social/posts?type=${activeTab}`);
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    loadFeed();
  }, [activeTab]);

  const votePost = async (postId: string, value: number) => {
     setPosts(prev => prev.map(p => p.id === postId ? {...p, _count: {...p._count, votes: p._count.votes + value}} : p));
     await api.post('/social/vote', { postId, value });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
    } catch (e) { return ""; }
  };

  return (
    <AppShell>
      <Sidebar />

      {/* COLUNA CENTRAL */}
      {/* mt-6 adicionado para alinhar visualmente com o topo da sidebar sticky */}
      <div className="flex-1 min-w-0 max-w-[800px] space-y-6 pb-20"> 
        
        {/* Lista de Posts */}
        {isLoading ? (
            <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/50"></div>)}
            </div>
        ) : (
            <div className="space-y-6">
                {posts.map((post) => (
                    <article key={post.id} className={postCardClass}>
                      <div className="flex h-full">
                          
                          {/* COLUNA DE VOTOS */}
                          <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 border-r border-zinc-800/50 gap-1 shrink-0">
                              <button onClick={() => votePost(post.id, 1)} className="text-zinc-500 hover:text-orange-500 p-1 transition-all active:scale-90">
                                  <ArrowBigUp size={24} strokeWidth={2} />
                              </button>
                              <span className="font-bold text-sm text-zinc-200">{post._count?.votes || 0}</span>
                              <button onClick={() => votePost(post.id, -1)} className="text-zinc-500 hover:text-violet-500 p-1 transition-all active:scale-90">
                                  <ArrowBigDown size={24} strokeWidth={2} />
                              </button>
                          </div>

                          {/* CONTEÚDO */}
                          <div className="flex-1 p-4 sm:p-5">
                              <div className="flex items-center gap-3 mb-3">
                                  <img src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} className="w-6 h-6 rounded-full ring-1 ring-zinc-700 object-cover" />
                                  <div className="flex items-center gap-2 flex-wrap">
                                      {post.project ? (
                                          <span className="text-xs font-bold text-zinc-300 hover:underline cursor-pointer">p/{post.project.name}</span>
                                      ) : (
                                          <span className="text-xs font-bold text-zinc-500">Geral</span>
                                      )}
                                      <span className="text-zinc-600 text-[10px]">•</span>
                                      <span className="text-xs text-zinc-500">@{post.author.username}</span>
                                      <span className="text-zinc-600 text-[10px]">•</span>
                                      <span className="text-xs text-zinc-600">{formatDate(post.createdAt)}</span>
                                  </div>
                              </div>
                              
                              <div className="text-zinc-200 mb-4 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</div>
                              
                              <div className="flex gap-2 text-zinc-500 text-xs font-bold">
                                  <button className="flex items-center gap-2 hover:bg-zinc-800 px-3 py-2 rounded-full transition-colors">
                                      <MessageCircle size={16}/> <span>{post._count?.comments || 0} Comentários</span>
                                  </button>
                                  <button className="flex items-center gap-2 hover:bg-zinc-800 px-3 py-2 rounded-full transition-colors">
                                      <Share2 size={16}/> <span>Compartilhar</span>
                                  </button>
                              </div>
                          </div>
                      </div>
                    </article>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="bg-zinc-900/80 p-4 rounded-full mb-4 ring-1 ring-zinc-800">
                            <Terminal size={32} className="text-zinc-500" />
                        </div>
                        <h3 className="text-zinc-300 font-bold text-lg mb-1">O feed está silencioso...</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            {activeTab === 'following' ? "Você ainda não segue ninguém." : "Entre em comunidades para ver conteúdo!"}
                        </p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* --- WIDGETS LATERAIS --- */}
      <aside className="hidden xl:block w-[320px] shrink-0 sticky top-24 h-fit space-y-6">
          <div className={widgetCardClass + " p-5"}>
            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 pb-2">
              <Hash size={16} className="text-orange-500"/> Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {['javascript', 'reactjs', 'nodejs', 'career', 'opensource', 'ai'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40 rounded-lg text-xs text-zinc-300 hover:text-white cursor-pointer transition-colors backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className={widgetCardClass + " p-5"}>
            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 pb-2">
              <UserPlus size={16} className="text-violet-500"/> Para Seguir
            </h3>
            <div className="space-y-4">
               {[{ name: 'Rocketseat', user: '@rocketseat', bg: 'bg-blue-600' }].map((u, i) => (
                   <div key={i} className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full ${u.bg} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>{u.name[0]}</div>
                           <div className="leading-tight">
                               <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{u.name}</p>
                               <p className="text-[10px] text-zinc-500">{u.user}</p>
                           </div>
                       </div>
                       <button className="text-xs font-bold text-violet-400 hover:text-violet-300 hover:underline">Seguir</button>
                   </div>
               ))}
            </div>
          </div>
      </aside>
    </AppShell>
  );
}