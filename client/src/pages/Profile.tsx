import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { userService, UserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      try {
        setLoading(true);
        const data = await userService.getByUsername(username);
        setProfile(data);
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  // Loading State
  if (loading) {
      return (
          <AppShell>
            <Sidebar />
            <div className="flex-1 flex items-center justify-center h-screen pb-20">
              <div className="animate-pulse text-zinc-500 font-bold">Carregando perfil...</div>
            </div>
          </AppShell>
      );
  }

  // Not Found State
  if (!profile) {
      return (
          <AppShell>
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center h-screen pb-20 text-zinc-500">
              <h2 className="text-xl font-bold text-white mb-2">Usuário não encontrado</h2>
              <p>Verifique o nome de usuário e tente novamente.</p>
            </div>
          </AppShell>
      );
  }

  const isMyProfile = currentUser?.username === profile.username;

  return (
    <AppShell>
      <Sidebar />
      
      <div className="flex-1 min-w-0 pb-20 overflow-y-auto no-scrollbar h-full">
        <div className="max-w-[700px] mx-auto pt-6 px-4 space-y-6">
          
          {/* --- HEADER DO PERFIL --- */}
          <div className="relative mb-16">
            {/* Capa Decorativa */}
            <div className={`h-48 w-full rounded-2xl bg-linear-to-r from-violet-900 to-indigo-900 shadow-lg shadow-violet-900/10`}></div>
            
            {/* Avatar */}
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full p-1 bg-zinc-950">
                 <img 
                   src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=random`} 
                   alt={profile.name}
                   className="w-full h-full rounded-full ring-4 ring-zinc-900 object-cover"
                 />
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="absolute -bottom-10 right-0">
               {isMyProfile ? (
                   <button className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg">
                     Editar Perfil
                   </button>
               ) : (
                   <button className="bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-white/5">
                     Seguir
                   </button>
               )}
            </div>
          </div>

          {/* --- INFO DO USUÁRIO --- */}
          <div className="px-2">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-zinc-500 text-sm mb-4">@{profile.username}</p>
            
            <p className="text-zinc-300 leading-relaxed max-w-lg mb-4">
                {profile.bio || "Nenhuma biografia definida ainda."}
            </p>
            
            {/* Stats */}
            <div className="flex gap-6 text-sm mb-6">
              <div className="flex gap-1"><span className="font-bold text-white">{profile._count.following}</span> <span className="text-zinc-500">Seguindo</span></div>
              <div className="flex gap-1"><span className="font-bold text-white">{profile._count.followedBy}</span> <span className="text-zinc-500">Seguidores</span></div>
              <div className="flex gap-1"><span className="font-bold text-white">{profile._count.posts}</span> <span className="text-zinc-500">Posts</span></div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              {profile.interestTags.length > 0 ? profile.interestTags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs text-zinc-400 font-medium">
                  {tag}
                </span>
              )) : (
                <span className="text-xs text-zinc-600 italic">Sem interesses definidos.</span>
              )}
            </div>
          </div>

          {/* --- ABAS --- */}
          <div className="flex border-b border-zinc-800 mt-6">
             <button 
               onClick={() => setActiveTab('posts')}
               className={`flex-1 py-4 text-sm font-bold relative ${activeTab === 'posts' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               Postagens
               {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-1 bg-violet-500 rounded-t-full"></div>}
             </button>
          </div>

          {/* --- LISTA DE POSTS --- */}
          <div className="space-y-4">
             {profile.posts.length > 0 ? profile.posts.map(post => (
               <article key={post.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl hover:bg-zinc-900/60 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=random`} className="w-8 h-8 rounded-full" />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-200">{profile.name}</h4>
                      <span className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Conteúdo do Post */}
                  <div className="text-zinc-300 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
                    {/* Renderiza se for string, ou faz stringify se for JSON */}
                    {typeof post.content === 'string' 
                      ? post.content 
                      : JSON.stringify(post.content).replace(/^"|"$/g, '')}
                  </div>
                  
                  {/* Ações / Contadores */}
                  <div className="flex gap-4 text-zinc-500 text-sm font-medium">
                     <span className="flex items-center gap-1 hover:text-violet-400 cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        {post._count.likes}
                     </span>
                     <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
                        {post._count.comments}
                     </span>
                  </div>
               </article>
             )) : (
                 <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                     <p className="text-zinc-500 mb-2">Este usuário ainda não publicou nada.</p>
                     <p className="text-xs text-zinc-600">Volte mais tarde para ver atualizações.</p>
                 </div>
             )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}