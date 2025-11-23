import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";

// 1. ESTILO DOS POSTS (Com efeitos de hover, sombra e brilho)
const postCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-900/5";

// 2. ESTILO DA DIREITA (Estático - Sem sombra/brilho no hover para não bugar)
const widgetCardClass = "bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden";

export default function FeedPage() {
  const { user } = useAuth();

  const fakePosts = [
    { id: 1, author: "Diego Fernandes", role: "CTO @ Rocketseat", time: "2h", content: "Acabei de migrar um projeto gigante de Create React App para Vite. A performance é absurda! 🚀", tags: ["react", "vite", "dx"], likes: 42, comments: 12 },
    { id: 2, author: "Mayk Brito", role: "Educator", time: "5h", content: "Dica de CSS: usem gap no Flexbox.", code: ".box { display: flex; gap: 16px; }", tags: ["css"], likes: 128, comments: 34 },
    { id: 3, author: "Dev Test", role: "Admin", time: "1d", content: "Testando o scroll infinito com sidebars fixas...", likes: 10, comments: 2 },
    { id: 4, author: "User", role: "Member", time: "2d", content: "Mais um post para encher a tela...", likes: 5, comments: 0 },
    { id: 5, author: "User 2", role: "Member", time: "3d", content: "Scroll invisível ativado!", likes: 15, comments: 3 },
  ];
  
  const trendingTags = ["javascript", "reactjs", "nodejs", "career", "opensource"];

  return (
    <AppShell>
        
        {/* 1. SIDEBAR ESQUERDA */}
        <Sidebar />

        {/* 2. FEED CENTRAL */}
        <div className="flex-1 min-w-0 space-y-6 pb-10">
          
          {/* Criar Post */}
          <div className={postCardClass + " p-4"}>
            <div className="flex gap-4">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Eu'}&background=random`} alt="Avatar" className="w-10 h-10 rounded-full ring-2 ring-zinc-800/50 shrink-0" />
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="No que você está pensando?" 
                  className="w-full bg-zinc-950/50 border border-zinc-800/80 text-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder-zinc-600 backdrop-blur-sm"
                />
                <div className="flex justify-between mt-3 items-center">
                    <div className="flex gap-2 text-zinc-500">
                        <button className="p-2 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
                        <button className="p-2 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg></button>
                    </div>
                    <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-1.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-violet-600/20">Publicar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {fakePosts.map((post) => (
            <article key={post.id} className={postCardClass}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} alt={post.author} className="w-10 h-10 rounded-full ring-2 ring-zinc-800/50 group-hover:ring-violet-500/20 transition-all" />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 hover:text-violet-400 cursor-pointer transition-colors">{post.author}</h3>
                    <p className="text-xs text-zinc-400">{post.role} • {post.time}</p>
                  </div>
                </div>
                <p className="text-zinc-200 mb-4 leading-relaxed">{post.content}</p>
                {post.code && <div className="bg-zinc-950/80 p-4 rounded-xl font-mono text-sm text-zinc-300 mb-4 border border-zinc-800/80 custom-scrollbar overflow-x-auto"><pre>{post.code}</pre></div>}
                
                {post.tags && (
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-xs font-medium text-violet-400/80 hover:text-violet-300 bg-violet-500/5 px-2 py-1 rounded-md cursor-pointer transition-colors">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-3 bg-zinc-950/30 border-t border-zinc-800/50 flex items-center gap-6 text-zinc-400">
                  <button className="flex items-center gap-2 hover:text-violet-400 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg> <span className="text-xs font-bold">{post.likes}</span></button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg> <span className="text-xs font-bold">{post.comments}</span></button>
              </div>
            </article>
          ))}
        </div>

        {/* 3. DIREITA: WIDGETS (Sticky) */}
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-24 h-fit space-y-6">
            
            {/* Trending */}
            <div className={widgetCardClass + " p-5"}>
              <h3 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                <span className="text-orange-500">🔥</span> Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40 rounded-full text-xs text-zinc-300 hover:text-white cursor-pointer transition-colors backdrop-blur-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Who to Follow */}
            <div className={widgetCardClass + " p-5"}>
              <h3 className="font-bold text-zinc-500 mb-4 text-sm uppercase tracking-wider">Para seguir</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${i===1 ? 'from-blue-500 to-cyan-500' : i===2 ? 'from-purple-500 to-pink-500' : 'from-orange-500 to-red-500'} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-bold text-xs">{i===1 ? 'R' : i===2 ? 'B' : 'D'}</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{i===1 ? 'Rocketseat' : i===2 ? 'Backend Br' : 'DevOps'}</p>
                        <p className="text-xs text-zinc-500">Education</p>
                      </div>
                    </div>
                    <button className="text-violet-400 text-xs font-bold hover:bg-violet-500/10 px-3 py-1 rounded-full transition-colors">Seguir</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-zinc-600 px-2 text-center leading-relaxed">
               © 2025 DevFlow Inc.
            </div>

        </aside>

    </AppShell>
  );
}