import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // Link Importado
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { chatService, Conversation, Message } from "../services/chatService";
import { 
    Send, Search, MessageSquare, Loader2, MoreVertical, 
    Image as ImageIcon, Smile, ChevronLeft, Check, CheckCheck 
} from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. CARREGAR CONVERSAS ---
  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await chatService.getConversations();
        setConversations(data);

        const targetUser = location.state?.targetUser;
        if (targetUser) {
            const existingChat = data.find(c => c.user.id === targetUser.id);
            if (existingChat) {
                handleSelectChat(existingChat);
            } else {
                // Ghost Chat
                setActiveChat({
                    user: {
                        id: targetUser.id,
                        name: targetUser.name,
                        username: targetUser.username,
                        avatarUrl: targetUser.avatarUrl
                    },
                    lastMessage: "",
                    date: new Date().toISOString(),
                    read: true
                });
                setMessages([]); 
            }
            window.history.replaceState({}, document.title);
        }
      } catch (error) {
        console.error("Erro ao carregar conversas", error);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [location.state]);

  // --- 2. SOCKET: OUVIR MENSAGENS ---
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      console.log("📨 Socket recebeu:", message);

      const isActive = activeChat  
        ?( message.senderId === activeChat.user.id || 
        (message.senderId === user?.id && message.receiverId === activeChat.user.id))
        : false;

      if (isActive) {
        setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
        });
        scrollToBottom();
      }

      // Atualiza Lista
      setConversations(prev => {
        const exists = prev.some(c => c.user.id === message.senderId || c.user.id === message.receiverId);
        if (exists) {
             return prev.map(c => {
                const isTarget = c.user.id === message.senderId || c.user.id === message.receiverId;
                if (isTarget) {
                    return { 
                        ...c, 
                        lastMessage: message.content, 
                        date: message.createdAt,
                        read: message.senderId === user?.id || isActive
                    };
                }
                return c;
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            if (message.senderId !== user?.id) {
                chatService.getConversations().then(setConversations);
            }
            return prev;
        }
      });
    };

    socket.on('receiveMessage', handleReceiveMessage);
    return () => { socket.off('receiveMessage', handleReceiveMessage); };
  }, [socket, activeChat, user]);

  // --- 3. AÇÕES ---
  const handleSelectChat = async (conversation: Conversation) => {
      setActiveChat(conversation);
      setMessages([]);
      try {
        const history = await chatService.getMessages(conversation.user.id);
        setMessages(history);
        scrollToBottom();
      } catch (error) { console.error(error); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !activeChat || !socket) return;

      const content = newMessage;
      setNewMessage("");
      setSending(true);

      try {
          socket.emit('sendMessage', {
              receiverId: activeChat.user.id,
              content: content
          });

          // Se for chat novo, atualiza a lista após 1s
          const isNew = !conversations.some(c => c.user.id === activeChat.user.id);
          if (isNew) {
              setTimeout(() => chatService.getConversations().then(setConversations), 1000);
          }
      } catch (error) {
          console.error("Erro ao enviar", error);
      } finally {
          setSending(false);
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const formatTime = (date: string) => {
      try { return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ""; }
  };

  return (
    <AppShell>
      <Sidebar />
      
      {/* Layout Principal Travado */}
      <div className="flex-1 h-[calc(100vh-128px)] w-full flex overflow-hidden">
        <div className="flex-1 w-full max-w-[1600px] mx-auto flex gap-0 md:gap-6 p-0 md:p-6 h-full">

            {/* --- LISTA (SIDEBAR) --- */}
            <aside className={`w-full md:w-80 lg:w-96 bg-zinc-900/60 backdrop-blur-md md:border border-zinc-800 md:rounded-2xl flex flex-col shrink-0 transition-all h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-zinc-800/50 shrink-0">
                    <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="text-violet-500" /> Mensagens
                    </h1>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/>
                        <input placeholder="Buscar conversa..." className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all"/>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {loading ? (
                        <div className="text-center py-10 text-zinc-500"><Loader2 className="animate-spin mx-auto mb-2"/>Carregando...</div>
                    ) : conversations.length > 0 ? (
                        conversations.map(chat => (
                            <button 
                                key={chat.user.id} 
                                onClick={() => handleSelectChat(chat)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all border ${activeChat?.user.id === chat.user.id ? 'bg-violet-600/10 border-violet-500/30' : 'border-transparent hover:bg-zinc-800/50'}`}
                            >
                                <div className="relative shrink-0">
                                    <img src={chat.user.avatarUrl || `https://ui-avatars.com/api/?name=${chat.user.name}`} className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800"/>
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-sm font-bold truncate ${activeChat?.user.id === chat.user.id ? 'text-white' : 'text-zinc-200'}`}>{chat.user.name}</span>
                                        <span className="text-[10px] text-zinc-500">{formatTime(chat.date)}</span>
                                    </div>
                                    <p className={`text-xs truncate ${!chat.read ? 'text-white font-bold' : 'text-zinc-500'}`}>{chat.lastMessage}</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-12 px-4 text-zinc-500 text-sm">Nenhuma conversa.</div>
                    )}
                </div>
            </aside>

            {/* --- ÁREA DO CHAT --- */}
            <main className={`flex-1 bg-zinc-900/60 backdrop-blur-md md:border border-zinc-800 md:rounded-2xl flex flex-col overflow-hidden relative h-full ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <header className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/90 backdrop-blur-xl z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveChat(null)} className="md:hidden text-zinc-400"><ChevronLeft size={24}/></button>
                                
                                {/* ✅ CORREÇÃO: LINK PARA O PERFIL */}
                                <Link to={`/profile/${activeChat.user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                                    <img src={activeChat.user.avatarUrl || `https://ui-avatars.com/api/?name=${activeChat.user.name}`} className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-zinc-600 transition-all"/>
                                    <div>
                                        <h3 className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors">{activeChat.user.name}</h3>
                                        <span className="text-xs text-green-500 flex items-center gap-1">● Online</span>
                                    </div>
                                </Link>
                            </div>
                            <MoreVertical size={20} className="text-zinc-500"/>
                        </header>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-zinc-950/30">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-5 py-3 text-sm rounded-2xl ${isMe ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'}`}>
                                            <p className="leading-relaxed">{msg.content}</p>
                                            <div className="flex items-center gap-1 mt-1 justify-end opacity-70">
                                                <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                                                {isMe && (msg.read ? <CheckCheck size={12}/> : <Check size={12}/>)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 focus-within:border-violet-500/50 transition-all">
                                <button type="button" className="p-2 text-zinc-400 hover:text-white"><Smile size={20}/></button>
                                <input 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-transparent border-none text-zinc-200 text-sm focus:ring-0 py-2.5 px-2"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-xl">
                                    {sending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <MessageSquare size={48} className="mb-4 opacity-50"/>
                        <p>Selecione uma conversa para começar.</p>
                    </div>
                )}
            </main>

        </div>
      </div>
    </AppShell>
  );
}