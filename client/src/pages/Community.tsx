import { useState, useEffect } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { userService, User } from "../services/userService";

const FILTERS = ["Todos", "Frontend", "Backend", "Mobile", "DevOps", "Data Science"];

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  
  // ESTADOS REAIS
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // BUSCAR DADOS DO BACKEND
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao carregar comunidade", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Filtragem simples no Frontend (pode ser movida para o backend no futuro)
  const filteredUsers = users.filter(user => {
     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.username?.toLowerCase().includes(searchTerm.toLowerCase());
     
     // Logica de filtro por tag (opcional, por enquanto mostra todos se for "Todos")
     const matchesTag = activeFilter === "Todos" ? true : user.interestTags.includes(activeFilter);

     return matchesSearch && matchesTag;
  });

  return (
    <AppShell>
      <Sidebar />
      
      <div className="flex-1 min-w-0 pb-20 overflow-y-auto no-scrollbar h-full">
        <div className="max-w-[1000px] mx-auto pt-6 px-4 space-y-8">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Comunidade</h1>
              <p className="text-zinc-400 mt-2">Conecte-se com desenvolvedores, mentores e parceiros de código.</p>
            </div>
            
            {/* Barra de Busca */}
            <div className="relative group w-full md:w-72">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-zinc-500 group-focus-within:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </div>
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 bg-zinc-950/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 sm:text-sm transition-all shadow-sm"
                 placeholder="Buscar por nome ou stack..."
               />
            </div>
          </div>

          {/* --- FILTROS --- */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             {FILTERS.map(filter => (
               <button 
                 key={filter}
                 onClick={() => setActiveFilter(filter)}
                 className={`
                   px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap
                   ${activeFilter === filter 
                     ? "bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                     : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"}
                 `}
               >
                 {filter}
               </button>
             ))}
          </div>

          {/* --- GRID DE USERS (REAL) --- */}
          {loading ? (
             // Skeleton Loading Simples
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-64 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse"></div>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map((user) => (
                  <div key={user.id} className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-black/20">
                    
                    {/* Efeito Hover Fundo */}
                    <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none"></div>

                    {/* Avatar */}
                    <div className="relative mb-4">
                      <img 
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                        alt={user.name}
                        className="w-20 h-20 rounded-full ring-4 ring-zinc-950/80 object-cover relative z-10"
                      />
                      {/* Badge da primeira Stack (se tiver) */}
                      {user.interestTags && user.interestTags.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1 ring-2 ring-zinc-950 z-20">
                            <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-violet-400">
                                {user.interestTags[0][0].toUpperCase()}
                            </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">{user.name}</h3>
                    <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
                        @{user.username || 'user'}
                    </p>
                    
                    {/* Tags (Lista Real) */}
                    <div className="flex gap-1.5 mb-6 flex-wrap justify-center min-h-6">
                        {user.interestTags && user.interestTags.length > 0 ? (
                            user.interestTags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] bg-zinc-800/80 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400">{tag}</span>
                            ))
                        ) : (
                            <span className="text-[10px] text-zinc-600 italic">Sem tags definidas</span>
                        )}
                        {user.interestTags && user.interestTags.length > 3 && (
                            <span className="text-[10px] text-zinc-600">+{user.interestTags.length - 3}</span>
                        )}
                    </div>

                    <div className="w-full h-px bg-zinc-800/50 mb-4"></div>

                    {/* Stats + Action */}
                    <div className="w-full flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-zinc-200 font-bold text-sm">{user._count?.followedBy || 0}</p>
                          <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-wide">Seguidores</p>
                        </div>
                        
                        <button className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-lg shadow-white/5 hover:scale-105 transition-all active:scale-95">
                           Ver Perfil
                        </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && filteredUsers.length === 0 && (
             <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                 <p className="text-zinc-500 mb-2">Nenhum membro encontrado.</p>
                 <p className="text-xs text-zinc-600">Tente buscar por outro termo.</p>
             </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}