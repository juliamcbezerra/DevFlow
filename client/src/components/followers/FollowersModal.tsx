import { useState, useEffect } from "react";
import { X, Loader2, UserPlus, UserCheck } from "lucide-react";
import { userService, User } from "../../services/userService";
import { useNavigate } from "react-router-dom";

interface FollowersModalProps {
  username: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export function FollowersModal({ username, type, isOpen, onClose }: FollowersModalProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    async function loadUsers() {
      setLoading(true);
      setUsers([]);
      setError(null);
      try {
        const data = type === 'followers' 
          ? await userService.getFollowers(username)
          : await userService.getFollowing(username);
        setUsers(data || []);
      } catch (error: any) {
        console.error(`Erro ao carregar ${type}:`, error);
        setError(`Erro ao carregar ${type === 'followers' ? 'seguidores' : 'seguindo'}.`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [isOpen, username, type]);

  if (!isOpen) return null;

  const title = type === 'followers' ? 'Seguidores' : 'Seguindo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <p className="text-sm">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl border border-zinc-800/50 transition-colors group">
                  <button
                    onClick={() => {
                      navigate(`/profile/${user.username}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm truncate">{user.name}</p>
                      <p className="text-zinc-400 text-xs truncate">@{user.username}</p>
                    </div>
                  </button>
                  
                  <button className="p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors shrink-0 ml-2">
                    <UserPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
