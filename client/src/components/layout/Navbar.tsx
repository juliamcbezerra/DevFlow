import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
    Search, Bell, LogOut, Settings, User, 
    Code2, Heart, MessageSquare, UserPlus, MessageCircle, X, Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../services/api";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (!user) return;
    api.get('/notifications')
      .then(res => {
          setNotifications(res.data);
          setUnreadCount(res.data.filter((n: any) => !n.read).length);
      })
      .catch(console.error);
  }, [user]);

  // 2. Socket Listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (newNotif: any) => {
        console.log("🔔 Nova Notificação", newNotif);
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const handleMessage = (msg: any) => {
        if (msg.senderId !== user.id && location.pathname !== '/chat') {
            setHasNewMessages(true);
        }
    };

    socket.on('notification', handleNotification);
    socket.on('receiveMessage', handleMessage);

    return () => {
        socket.off('notification', handleNotification);
        socket.off('receiveMessage', handleMessage);
    };
  }, [socket, user, location.pathname]);

  // Limpa bolinha do chat
  useEffect(() => {
      if (location.pathname === '/chat') setHasNewMessages(false);
  }, [location.pathname]);

  // --- AÇÕES DE NOTIFICAÇÃO ---

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Evita fechar o menu ou clicar no item
      try {
          await api.patch(`/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) { console.error(error); }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string, read: boolean) => {
      e.stopPropagation();
      try {
          await api.delete(`/notifications/${id}`);
          setNotifications(prev => prev.filter(n => n.id !== id));
          if (!read) setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) { console.error(error); }
  };

  const handleMarkAllRead = async () => {
      try {
          await api.patch('/notifications/read');
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
      } catch (error) { console.error(error); }
  };

  const toggleNotifications = () => {
      setIsNotificationsOpen(!isNotificationsOpen);
      setIsDropdownOpen(false);
  };

  const getNotifIcon = (type: string) => {
      if (type === 'LIKE') return <Heart size={14} className="text-red-500 fill-red-500"/>;
      if (type === 'COMMENT') return <MessageSquare size={14} className="text-blue-500 fill-blue-500"/>;
      if (type === 'FOLLOW') return <UserPlus size={14} className="text-violet-500"/>;
      if (type === 'INVITE') return <Code2 size={14} className="text-green-500"/>; // Futuro
      return <Bell size={14} className="text-zinc-400"/>;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${searchQuery}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl z-50 px-4 md:px-6 flex items-center justify-between">
      
      {/* LOGO */}
      <div className="flex items-center gap-8 z-50">
        <Link to="/feed" className="flex items-center gap-2 group">
            <div className="bg-linear-to-tr from-violet-600 to-indigo-600 p-2 rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
                <Code2 size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden md:block">Dev<span className="text-violet-500">Flow</span></span>
        </Link>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="hidden md:block absolute left-1/2 -translate-x-1/2 w-96 lg:w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </form>

      {/* AÇÕES */}
      <div className="flex items-center gap-3 z-50">

        {/* CHAT */}
        <Link to="/chat" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors relative" title="Mensagens">
            <MessageCircle size={20} className={hasNewMessages ? "text-white" : ""} />
            {hasNewMessages && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-violet-600 rounded-full border-2 border-zinc-950 animate-bounce"></span>}
        </Link>

        {/* NOTIFICATIONS */}
        <div className="relative">
            <button onClick={toggleNotifications} className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>}
            </button>

            {isNotificationsOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                            <span className="text-sm font-bold text-white">Notificações</span>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && <span className="text-[10px] text-zinc-500">{unreadCount} novas</span>}
                                <button onClick={handleMarkAllRead} className="text-[10px] text-violet-400 font-bold hover:text-violet-300">Ler tudo</button>
                            </div>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? notifications.map((notif) => (
                                <div key={notif.id} className={`group relative p-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors flex gap-3 ${!notif.read ? 'bg-zinc-800/20' : ''}`}>
                                    
                                    {/* Ícone Tipo */}
                                    <div className="mt-1 p-1.5 rounded-full h-fit bg-zinc-900 border border-zinc-800 shrink-0">
                                        {getNotifIcon(notif.type)}
                                    </div>
                                    
                                    {/* Texto */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className={`text-sm leading-snug wrap-break-word ${!notif.read ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                            {notif.content}
                                        </p>
                                        <p className="text-[10px] text-zinc-600 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    {/* Ações Hover (Check e Delete) */}
                                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 rounded-lg p-0.5 backdrop-blur-sm">
                                        {!notif.read && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                                className="p-1 text-zinc-400 hover:text-green-400 hover:bg-green-400/10 rounded"
                                                title="Marcar como lida"
                                            >
                                                <Check size={12}/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => handleDeleteNotification(e, notif.id, notif.read)}
                                            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded"
                                            title="Excluir"
                                        >
                                            <X size={12}/>
                                        </button>
                                    </div>

                                    {/* Bolinha Azul se não lido */}
                                    {!notif.read && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-violet-500 rounded-full group-hover:opacity-0 transition-opacity"></div>}
                                </div>
                            )) : (
                                <div className="p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                                    <Bell size={24} className="opacity-20"/>
                                    Nenhuma notificação.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* PROFILE */}
        <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-1 pr-3 rounded-full transition-all hover:bg-zinc-800/50 border border-transparent hover:border-zinc-800">
                <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-900" />
                <span className="text-sm font-medium text-zinc-200 hidden md:block max-w-[100px] truncate">{user?.name}</span>
            </button>
            {isDropdownOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-3 border-b border-zinc-800">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-zinc-500 truncate">@{user?.username}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                            <Link to={`/profile/${user?.username}`} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"><User size={16}/> Meu Perfil</Link>
                            <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"><Settings size={16}/> Configurações</Link>
                        </div>
                        <div className="p-1.5 border-t border-zinc-800">
                            <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={16} /> Sair</button>
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