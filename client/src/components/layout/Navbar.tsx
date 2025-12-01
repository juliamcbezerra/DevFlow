import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Search, Bell, LogOut, Settings, User, 
    Moon, Sun, Code2, Menu 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl z-50 px-4 md:px-6 flex items-center justify-between">

      {/* 1. LOGO DEVFLOW */}
      <div className="flex items-center gap-8 z-50">
        <Link to="/feed" className="flex items-center gap-2 group">
            <div className="bg-linear-to-tr from-violet-600 to-indigo-600 p-2 rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
                <Code2 size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden md:block">
                Dev<span className="text-violet-500">Flow</span>
            </span>
        </Link>
      </div>

      {/* 2. SEARCH BAR CENTRALIZADA */}
      <form 
        onSubmit={handleSearch} 
        className="hidden md:block absolute left-1/2 -translate-x-1/2 w-xl"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar projetos, devs..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
        />
      </form>

      {/* 3. AÇÕES DIREITA */}
      <div className="flex items-center gap-4 z-50">

        {/* Notificações */}
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950"></span>
        </button>

        {/* Dropdown de Perfil */}
        <div className="relative">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 pr-3 rounded-full transition-all border border-transparent hover:border-zinc-800"
            >
                <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-900"
                />
                <span className="text-sm font-medium text-zinc-200 hidden md:block max-w-[100px] truncate">{user?.name}</span>
            </button>

            {/* Menu Dropdown */}
            {isDropdownOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="fixed right-4 top-16 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="p-3 border-b border-zinc-800">
                            <p className="text-sm font-bold text-white">{user?.name}</p>
                            <p className="text-xs text-zinc-500">@{user?.username}</p>
                        </div>

                        <div className="p-1.5">
                            <Link 
                              to={`/profile/${user?.username}`} 
                              onClick={() => setIsDropdownOpen(false)} 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <User size={16} /> Meu Perfil
                            </Link>

                            <Link 
                              to="/settings" 
                              onClick={() => setIsDropdownOpen(false)} 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <Settings size={16} /> Configurações
                            </Link>
                            
                            {/* Toggle Tema (Mock) */}
                            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                                <span className="flex items-center gap-2">
                                    <Moon size={16} /> Tema Escuro
                                </span>
                                <div className="w-8 h-4 bg-violet-600 rounded-full relative">
                                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </button>
                        </div>

                        <div className="p-1.5 border-t border-zinc-800">
                            <button 
                                onClick={signOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} /> Sair
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </nav>
  );
}
