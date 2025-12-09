import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { projectService } from "../../services/projectService";
import api from "../../services/api";

interface Member {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface ProjectMembersProps {
  projectId: string;
  projectOwnerId: string;
  isOpen: boolean;
  onClose: () => void;
  onMemberRemoved?: (memberId: string) => void;
}

export function ProjectMembers({ projectId, projectOwnerId, isOpen, onClose, onMemberRemoved }: ProjectMembersProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    async function loadMembers() {
      setLoading(true);
      setMembers([]);
      setError(null);
      try {
        const data = await api.get(`/projects/${projectId}/members`);
        setMembers(data.data || []);
      } catch (error: any) {
        console.error('Erro ao carregar membros:', error);
        setError('Erro ao carregar membros do projeto.');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [isOpen, projectId]);

  const handleRemoveMember = async (memberId: string, memberUsername: string) => {
    try {
      setRemovingMemberId(memberId);
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      
      // Remover da lista local
      setMembers(prev => prev.filter(m => m.id !== memberId));
      
      // Callback para atualizar parent
      if (onMemberRemoved) {
        onMemberRemoved(memberId);
      }
      
      setRemovingMemberId(null);
    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao remover membro';
      setError(errorMsg);
      setRemovingMemberId(null);
    }
  };

  // Determinar se o user atual pode remover este membro
  const canRemove = (member: Member) => {
    if (currentUser?.id !== projectOwnerId) return false; // Apenas owner pode remover
    if (member.id === currentUser.id) return false; // Não pode se remover (pelo menos não aqui)
    return true;
  };

  const getRoleColor = (role: string) => {
    if (role === 'OWNER') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (role === 'ADMIN') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-zinc-700/30 text-zinc-300 border-zinc-600/30';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'OWNER') return 'Dono';
    if (role === 'ADMIN') return 'Admin';
    return 'Membro';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-xl font-bold text-white">Membros do Projeto</h2>
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
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <p className="text-sm">Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl border border-zinc-800/50 transition-colors group"
                >
                  <button
                    onClick={() => {
                      navigate(`/profile/${member.username}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm truncate">{member.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRoleColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs truncate">@{member.username}</p>
                    </div>
                  </button>
                  
                  {canRemove(member) && (
                    <button 
                      onClick={() => {
                        if (window.confirm(`Remover ${member.name} do projeto?`)) {
                          handleRemoveMember(member.id, member.username);
                        }
                      }}
                      disabled={removingMemberId === member.id}
                      title="Remover membro"
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0 ml-2 disabled:opacity-50"
                    >
                      {removingMemberId === member.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
