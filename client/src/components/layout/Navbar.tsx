import { useAuth } from '../../context/AuthContext'; // Ajuste o import se necessário

export function Navbar() {
  const { signOut, user } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full bg-zinc-950 border-b border-zinc-800 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center font-bold text-white">
            DF
          </div>
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
            DevFlow
          </span>
        </div>

        {/* Barra de Busca (Visual apenas por enquanto) */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <input 
            type="text" 
            placeholder="Buscar no DevFlow..." 
            className="w-full bg-zinc-900 border border-zinc-700 rounded-full py-1.5 px-4 text-sm text-zinc-300 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400 hidden sm:block">
            {user?.name || 'Visitante'}
          </span>
          <button 
            onClick={signOut}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sair
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
             {/* Placeholder de Avatar */}
             <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
}