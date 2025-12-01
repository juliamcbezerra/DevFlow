import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { 
    Terminal, MessageCircle, ArrowBigUp, ArrowBigDown, Share2, Hash, UserPlus, Sparkles
} from "lucide-react";
import api from "../services/api";
import { userService } from "../services/userService";
import { RichTextDisplay } from "../components/feed/RichTextDisplay";

const postCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-900/5";
const widgetCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm";

export default function FeedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('type') || 'foryou';

  const [posts, setPosts] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

  useEffect(() => {
    api.get('/social/tags/trending').then(res => setTrendingTags(res.data)).catch(() => {});
    api.get('/social/users/suggestions').then(res => setSuggestions(res.data)).catch(() => {});
  }, []);

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

  const handleFollow = async (username: string) => {
      try {
          await userService.toggleFollow(username);
          setSuggestions(prev => prev.filter(u => u.username !== username));
      } catch (error) { console.error(error); }
  };

  const formatDate = (dateString: string) => {
    try { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString)); } catch (e) { return ""; }
  };

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 max-w-[800px] space-y-6 pb-20"> 
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 px-2 pt-2">
            {activeTab === 'foryou' && <div className="p-1.5 bg-orange-500/10 rounded-lg"><Sparkles size={18} className="text-orange-500"/></div>}
            {activeTab === 'following' && <div className="p-1.5 bg-violet-500/10 rounded-lg"><UserPlus size={18} className="text-violet-500"/></div>}
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-none">
                    {activeTab === 'foryou' ? 'Para Você' : 'Seguindo'}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    {activeTab === 'foryou' ? 'Destaques da comunidade' : 'Posts de quem você acompanha'}
                </p>
            </div>
        </div>

        {/* Lista */}
        {isLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/50"></div>)}</div>
        ) : (
            <div className="space-y-6">
                {posts.map((post) => (
                    <article key={post.id} className={postCardClass}>
                      <div className="flex h-full">
                          
                          {/* VOTOS */}
                          <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 border-r border-zinc-800/50 gap-1 shrink-0">
                              <button onClick={(e) => votePost(e, post.id, 1)} className={`p-1 rounded transition-all active:scale-90 ${post.userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500 hover:text-orange-500 hover:bg-zinc-800/50'}`}>
                                  <ArrowBigUp size={24} strokeWidth={2} className={post.userVote === 1 ? 'fill-orange-500/20' : ''} />
                              </button>
                              <span className={`font-bold text-sm my-1 ${post.userVote !== 0 ? (post.userVote === 1 ? 'text-orange-500' : 'text-violet-500') : 'text-zinc-200'}`}>{post._count?.votes || 0}</span>
                              <button onClick={(e) => votePost(e, post.id, -1)} className={`p-1 rounded transition-all active:scale-90 ${post.userVote === -1 ? 'text-violet-500 bg-violet-500/10' : 'text-zinc-500 hover:text-violet-500 hover:bg-zinc-800/50'}`}>
                                  <ArrowBigDown size={24} strokeWidth={2} className={post.userVote === -1 ? 'fill-violet-500/20' : ''} />
                              </button>
                          </div>

                          {/* CONTEÚDO */}
                          <div className="flex-1 p-4 sm:p-5 cursor-pointer hover:bg-zinc-900/40 transition-colors" onClick={() => navigate(`/post/${post.id}`)} >
                              <div className="flex items-center gap-3 mb-3">
                                  <img src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} className="w-8 h-8 rounded-full ring-1 ring-zinc-700 object-cover" />
                                  <div className="flex items-center gap-2 flex-wrap text-sm">
                                      {post.project ? (
                                          <span className="font-bold text-zinc-200 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${post.project.slug}`); }}>c/{post.project.name}</span>
                                      ) : (
                                          <span className="font-bold text-zinc-500">Geral</span>
                                      )}
                                      <span className="text-zinc-600 text-[10px]">•</span>
                                      <Link to={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()} className="text-zinc-400 hover:text-white transition-colors">@{post.author.username}</Link>
                                      <span className="text-zinc-600 text-[10px]">•</span>
                                      <span className="text-zinc-500 text-xs">{formatDate(post.createdAt)}</span>
                                  </div>
                              </div>
                              
                              {/* --- 2. SUBSTITUIÇÃO DO CONTEÚDO AQUI --- */}
                              <div className="mb-4 text-sm relative max-h-[300px] overflow-hidden mask-linear-fade">
                                {/* Usando o RichTextDisplay com line-clamp simulado ou max-height */}
                                <RichTextDisplay content={post.content} className="line-clamp-6" />
                              </div>
                              
                              <div className="flex gap-3">
                                  <button className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold">
                                      <MessageCircle size={16}/> <span>{post._count?.comments || 0} Comentários</span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-2 hover:bg-zinc-800/50 px-2 py-1.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold">
                                      <Share2 size={16}/> <span>Compartilhar</span>
                                  </button>
                              </div>
                          </div>
                      </div>
                    </article>
                ))}
                {/* Empty State */}
                {posts.length === 0 && (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="bg-zinc-900/80 p-4 rounded-full mb-4 ring-1 ring-zinc-800"><Terminal size={32} className="text-zinc-500" /></div>
                        <h3 className="text-zinc-300 font-bold text-lg mb-1">O feed está silencioso...</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">{activeTab === 'following' ? "Você ainda não segue ninguém." : "Entre em comunidades para ver conteúdo!"}</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <aside className="hidden xl:block w-[320px] shrink-0 sticky top-24 h-fit space-y-6">
          <div className={widgetCardClass + " p-5"}>
            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 pb-2"><Hash size={16} className="text-orange-500"/> Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.length > 0 ? trendingTags.map((t: any) => (
                <span key={t.tag} className="px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40 rounded-lg text-xs text-zinc-300 hover:text-white cursor-pointer transition-colors backdrop-blur-sm">#{t.tag}</span>
              )) : <p className="text-xs text-zinc-500">Sem tendências.</p>}
            </div>
          </div>
          <div className={widgetCardClass + " p-5"}>
            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 pb-2"><UserPlus size={16} className="text-violet-500"/> Para Seguir</h3>
            <div className="space-y-4">
               {suggestions.length > 0 ? suggestions.map((u: any) => (
                   <div key={u.id} className="flex justify-between items-center group">
                       <Link to={`/profile/${u.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                           <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-8 h-8 rounded-full object-cover bg-zinc-800"/>
                           <div className="leading-tight truncate">
                               <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate">{u.name}</p>
                               <p className="text-[10px] text-zinc-500 truncate">@{u.username}</p>
                           </div>
                       </Link>
                       <button onClick={() => handleFollow(u.username)} className="text-xs font-bold text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 px-2 py-1 rounded transition-colors">Seguir</button>
                   </div>
               )) : <p className="text-xs text-zinc-500">Nenhuma sugestão.</p>}
            </div>
          </div>
      </aside>
    </AppShell>
  );
}