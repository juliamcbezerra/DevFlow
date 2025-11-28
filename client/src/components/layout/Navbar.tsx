import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, Bell } from "lucide-react";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-violet-500/20">
          &lt;/&gt;
        </div>
        <span className="font-bold text-lg tracking-tight text-white">DevFlow</span>
      </Link>

      {/* Busca Central */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar no DevFlow..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Ações Direita */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950"></span>
        </button>

        <div className="h-6 w-px bg-zinc-800 mx-1"></div>

        {/* --- LINK DO PERFIL --- */}
        {user ? (
            <Link 
              to={`/profile/${user.username}`} 
              className="flex items-center gap-3 hover:bg-zinc-800/50 p-1.5 pr-3 rounded-full transition-all group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{user.name}</p>
                <p className="text-[10px] text-zinc-500 font-medium">@{user.username}</p>
              </div>
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                alt={user.name} 
                className="w-9 h-9 rounded-full ring-2 ring-zinc-800 group-hover:ring-violet-500/50 transition-all object-cover"
              />
            </Link>
        ) : (
            <div className="h-9 w-9 bg-zinc-800 rounded-full animate-pulse"></div>
        )}
      </div>
    </header>
  );
}