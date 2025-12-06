import { ShieldCheck, Code, User, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface Member {
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
        id: string;
        username: string;
        name: string;
        avatarUrl?: string;
    };
}

interface ProjectSidebarProps {
    groupedMembers: {
        owner: Member[];
        developers: Member[];
        members: Member[];
    };
}

export function ProjectSidebar({ groupedMembers }: ProjectSidebarProps) {
    
    const renderGroup = (title: string, members: Member[], colorClass: string, Icon: any) => {
        if (!members || members.length === 0) return null;
        
        return (
            <div className="mb-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${colorClass} opacity-80 pl-2`}>
                    {title} <span className="bg-zinc-800 text-zinc-500 px-1.5 rounded text-[10px] min-w-[1.2rem] text-center">{members.length}</span>
                </h3>
                <div className="space-y-1">
                    {members.map(m => (
                        <Link 
                            to={`/profile/${m.user.username}`} 
                            key={m.user.id} 
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className="relative shrink-0">
                                <img 
                                    src={m.user.avatarUrl || `https://ui-avatars.com/api/?name=${m.user.name}`} 
                                    className="w-9 h-9 rounded-full object-cover bg-zinc-800"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border-2 border-zinc-950">
                                    <Icon size={10} className={colorClass}/>
                                </div>
                            </div>
                            <div className="min-w-0 overflow-hidden">
                                <p className={`text-sm font-medium truncate group-hover:text-white transition-colors ${colorClass === 'text-zinc-400' ? 'text-zinc-300' : colorClass}`}>
                                    {m.user.name}
                                </p>
                                <p className="text-[10px] text-zinc-600 truncate">@{m.user.username}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 sticky top-24 h-[calc(100vh-6rem)] shrink-0">
                        <div className="flex flex-col h-full border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-black/20 overflow-y-auto custom-scrollbar">
                
                <div className="mb-4 pb-4 border-b border-zinc-800/50 px-2">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} /> Membros do Projeto
                    </h2>
                </div>

                <div className="flex-1">
                    {renderGroup("Fundador", groupedMembers.owner, "text-yellow-500", Crown)}
                    {renderGroup("Desenvolvedores", groupedMembers.developers, "text-violet-400", Code)}
                    {renderGroup("Membros", groupedMembers.members, "text-zinc-400", User)}
                </div>
            </div>
        </aside>
    );
}