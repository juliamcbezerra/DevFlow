import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Search, Bell, LogOut, Settings, User, 
    Moon, Code2, Heart, MessageSquare, UserPlus, CheckCheck, MessageCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext"; // <--- Importar Socket

export function Navbar() {
  const { user, signOut } = useAuth();
  const { socket } = useSocket(); // <--- Usar Socket
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Estado para notificações reais
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- OUVIR NOTIFICAÇÕES EM TEMPO REAL ---
  useEffect(() => {
    if (!socket) return;

    // Escuta evento do servidor
    socket.on('notification', (newNotif) => {
        console.log("🔔 Nova Notificação:", newNotif);
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Opcional: Tocar um somzinho
        // new Audio('/notification.mp3').play().catch(() => {}); 
    });

    return () => {
        socket.off('notification');
    };
  }, [socket]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${searchQuery}`);
  };

  const toggleNotifications = () => {
      setIsNotificationsOpen(!isNotificationsOpen);
      if (!isNotificationsOpen) {
          // Ao abrir, zera o contador visualmente (depois implementamos marcar como lido no back)
          setUnreadCount(0);
      }
      setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl z-50 px-4 md:px-6 flex items-center justify-between">

      {/* 1. LOGO */}
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

      {/* 2. SEARCH */}
      <form onSubmit={handleSearch} className="hidden md:block absolute left-1/2 -translate-x-1/2 w-96 lg:w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </form>

      {/* 3. AÇÕES */}
      <div className="flex items-center gap-3 z-50">

        {/* --- ÍCONE CHAT (NOVO) --- */}
        <Link 
            to="/chat" 
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors relative"
            title="Mensagens"
        >
            <MessageCircle size={20} />
            {/* Aqui você poderia por um contador de msg não lida se tivesse essa info no user */}
        </Link>

        {/* --- NOTIFICAÇÕES --- */}
        <div className="relative">
            <button 
                onClick={toggleNotifications}
                className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>
                )}
            </button>

            {isNotificationsOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Notificações</span>
                            <button className="text-[10px] text-violet-400 font-bold">Ler tudo</button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? notifications.map((notif, idx) => (
                                <div key={idx} className="p-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors flex gap-3">
                                    <div className="mt-1 p-1.5 rounded-full h-fit bg-violet-500/10 text-violet-500">
                                        <Bell size={14}/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-300 leading-tight">{notif.content}</p>
                                        <p className="text-[10px] text-zinc-500 mt-1">Agora mesmo</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-zinc-500 text-xs">Nenhuma notificação recente.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* --- PERFIL --- */}
        <div className="relative">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full transition-all hover:bg-zinc-800/50 border border-transparent hover:border-zinc-800"
            >
                <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-900"
                />
                <span className="text-sm font-medium text-zinc-200 hidden md:block max-w-[100px] truncate">{user?.name}</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-zinc-800">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-zinc-500 truncate">@{user?.username}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                            <Link to={`/profile/${user?.username}`} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                                <User size={16}/> Meu Perfil
                            </Link>
                            <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                                <Settings size={16}/> Configurações
                            </Link>
                        </div>
                        <div className="p-1.5 border-t border-zinc-800">
                            <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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

export default Navbar;