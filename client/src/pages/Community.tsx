import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";

// --- MOCK DATA: Desenvolvedores ---
const DEVS_MOCK = [
  { id: 1, name: "Diego Fernandes", role: "CTO", stack: "Node.js", followers: 12400, isFollowing: true, color: "from-violet-500 to-purple-500" },
  { id: 2, name: "Mayk Brito", role: "Educator", stack: "Frontend", followers: 8900, isFollowing: false, color: "from-blue-500 to-cyan-500" },
  { id: 3, name: "Jakeliny", role: "Tech Lead", stack: "React Native", followers: 4500, isFollowing: false, color: "from-pink-500 to-rose-500" },
  { id: 4, name: "Rodrigo", role: "DevOps", stack: "Go", followers: 2300, isFollowing: false, color: "from-emerald-500 to-green-500" },
  { id: 5, name: "Ana Silva", role: "Product", stack: "UX/UI", followers: 1200, isFollowing: false, color: "from-orange-500 to-amber-500" },
  { id: 6, name: "João Dev", role: "Fullstack", stack: "Rust", followers: 890, isFollowing: true, color: "from-red-500 to-orange-500" },
  { id: 7, name: "Beatriz", role: "Data Scientist", stack: "Python", followers: 3400, isFollowing: false, color: "from-indigo-500 to-blue-500" },
  { id: 8, name: "Lucas", role: "Junior Dev", stack: "Javascript", followers: 120, isFollowing: false, color: "from-gray-500 to-zinc-500" },
  { id: 9, name: "Fernanda", role: "Senior Dev", stack: "Java", followers: 5600, isFollowing: false, color: "from-teal-500 to-emerald-500" },
];

const FILTERS = ["Todos", "Frontend", "Backend", "Mobile", "DevOps", "Data Science", "Open to Work"];

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <AppShell>
      <Sidebar />
      
      {/* Container Principal Centralizado */}
      <div className="flex-1 min-w-0 pb-20 overflow-y-auto no-scrollbar h-full">
        <div className="max-w-[1000px] mx-auto pt-6 px-4 space-y-8">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Comunidade</h1>
              <p className="text-zinc-400 mt-2">Conecte-se com desenvolvedores, mentores e parceiros de código.</p>
            </div>
            
            {/* Barra de Busca Compacta */}
            <div className="relative group w-full md:w-72">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-zinc-500 group-focus-within:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </div>
               <input
                 type="text"
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

          {/* --- GRID DE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {DEVS_MOCK.map((dev) => (
                <div key={dev.id} className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-black/20">
                   
                   {/* Background Gradient Effect on Hover */}
                   <div className={`absolute inset-0 bg-linear-to-br ${dev.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500 pointer-events-none`}></div>

                   {/* Avatar */}
                   <div className="relative mb-4">
                      <div className={`absolute inset-0 bg-linear-to-br ${dev.color} rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${dev.name}&background=random`} 
                        alt={dev.name}
                        className="relative w-20 h-20 rounded-full ring-4 ring-zinc-950/80 object-cover"
                      />
                      {/* Badge Online/Stack */}
                      <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1 ring-2 ring-zinc-950">
                         <div className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                            {dev.stack[0]}
                         </div>
                      </div>
                   </div>

                   {/* Info */}
                   <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">{dev.name}</h3>
                   <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">{dev.role}</p>
                   <p className="text-zinc-500 text-xs mb-6 font-medium">{dev.stack}</p>

                   {/* Stats Divider */}
                   <div className="w-full h-px bg-zinc-800/50 mb-4"></div>

                   {/* Stats + Action */}
                   <div className="w-full flex items-center justify-between">
                      <div className="text-left">
                         <p className="text-zinc-200 font-bold text-sm">{dev.followers >= 1000 ? `${(dev.followers/1000).toFixed(1)}k` : dev.followers}</p>
                         <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-wide">Seguidores</p>
                      </div>

                      {dev.isFollowing ? (
                        <button className="px-5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all">
                           Seguindo
                        </button>
                      ) : (
                        <button className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-lg shadow-white/5 hover:scale-105 transition-all active:scale-95">
                           Seguir
                        </button>
                      )}
                   </div>

                </div>
             ))}
          </div>

          {/* Botão Ver Mais */}
          <div className="flex justify-center pt-8">
            <button className="text-zinc-500 hover:text-zinc-300 text-sm font-medium flex items-center gap-2 transition-colors">
              Carregar mais desenvolvedores
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}