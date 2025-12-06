import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { userService, User } from "../services/userService";
import { Users, UserPlus, Hash } from "lucide-react";

export default function CommunityPage() {
  const [searchParams] = useSearchParams();
  // Lê a aba diretamente da URL controlada pela Sidebar
  const activeTab = searchParams.get('type') || 'foryou';
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Recarrega sempre que a URL mudar (clique na Sidebar)
  useEffect(() => {
    async function loadData() {
        setLoading(true);
        try {
            const data = await userService.getAll(activeTab as 'foryou' | 'following');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [activeTab]);

  const handleFollow = async (username: string) => {
      try {
          await userService.toggleFollow(username);
          
          // Lógica de atualização otimista:
          // Se estou nos "Recomendados" e sigo, ele some.
          // Se estou no "Seguindo" e deixo de seguir, ele some.
          setUsers(prev => prev.filter(u => u.username !== username));
          
      } catch (error) { console.error(error); }
  };

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 pb-20 px-6 max-w-6xl mx-auto w-full">
        
        {/* Header Simples */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users size={28} className="text-violet-500"/> 
                {activeTab === 'following' ? 'Seguindo' : 'Comunidade'}
            </h1>
            <p className="text-zinc-400 mt-2">
                {activeTab === 'following' 
                    ? 'Pessoas que você acompanha.' 
                    : 'Encontre desenvolvedores e expanda sua rede.'}
            </p>
        </div>

        {/* Grid de Usuários */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-zinc-900/40 rounded-3xl animate-pulse border border-zinc-800"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    // CARD PRINCIPAL
                    <div key={user.id} className="relative bg-zinc-950/30 border border-zinc-800/60 rounded-3xl flex flex-col hover:border-zinc-700 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-xl hover:shadow-black/40 h-full">
                        
                        {/* 1. TOPO GRADIENTE */}
                        <div className="h-24 w-full bg-linear-to-b from-violet-900/20 to-transparent relative shrink-0"></div>

                        {/* Conteúdo do Card */}
                        <div className="px-6 pb-6 flex flex-col items-center text-center -mt-12 flex-1">
                            
                            {/* 2. AVATAR */}
                            <Link to={`/profile/${user.username}`} className="relative z-10 shrink-0">
                                <img 
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                                    className="w-24 h-24 rounded-full mb-3 object-cover ring-4 ring-zinc-950 shadow-2xl bg-zinc-900"
                                />
                            </Link>
                            
                            {/* Nome e User */}
                            <div className="mb-4">
                                <Link to={`/profile/${user.username}`} className="font-bold text-white text-xl hover:text-violet-400 transition-colors block">
                                    {user.name}
                                </Link>
                                <span className="text-zinc-500 text-sm font-medium">@{user.username}</span>
                            </div>

                            {/* 3. SEGUIDORES */}
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-6 bg-zinc-900/80 px-4 py-1.5 rounded-lg border border-zinc-800">
                                <Users size={12} className="text-zinc-500"/>
                                <span>{user._count?.followedBy || 0} seguidores</span>
                            </div>

                            {/* 4. ÁREA DE TAGS E RECOMENDAÇÃO */}
                            <div className="w-full min-h-10 flex items-start justify-center mb-6">
                                {/* CORREÇÃO AQUI: Verificação segura de undefined */}
                                {activeTab === 'foryou' && ((user.commonTags || 0) > 0 || (user.commonConnections || 0) > 0) ? (
                                     <div className="flex flex-wrap justify-center gap-2">
                                        {(user.commonTags || 0) > 0 && (
                                            <span className="text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                                                <Hash size={10}/> {user.commonTags} Tags em comum
                                            </span>
                                        )}
                                        {(user.commonConnections || 0) > 0 && (
                                            <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                                                <Users size={10}/> {user.commonConnections} Conexões
                                            </span>
                                        )}
                                     </div>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {user.interestTags?.length > 0 ? user.interestTags.slice(0, 3).map((t: string) => (
                                            <span key={t} className="text-[11px] font-medium px-2 py-1 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-md">
                                                #{t}
                                            </span>
                                        )) : (
                                            <span className="text-[11px] text-zinc-700 italic">Dev</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Botão de Ação */}
                            <button 
                                onClick={() => handleFollow(user.username)}
                                className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    activeTab === 'following'
                                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-red-900/50 hover:text-red-400 hover:bg-red-950/10"
                                    : "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/20 active:scale-95"
                                }`}
                            >
                                {activeTab === 'following' ? 'Deixar de Seguir' : <><UserPlus size={16}/> Seguir</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {!loading && users.length === 0 && (
            <div className="text-center py-24 opacity-50 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <Users size={64} className="mx-auto mb-6 text-zinc-700"/>
                <p className="text-zinc-500 font-medium text-lg">
                    {activeTab === 'following' ? "Você ainda não segue ninguém." : "Não encontramos recomendações no momento."}
                </p>
            </div>
        )}

      </div>
    </AppShell>
  );
}