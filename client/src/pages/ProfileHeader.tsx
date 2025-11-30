import { MapPin, Calendar, Link as LinkIcon, Edit3, UserPlus, UserCheck } from "lucide-react";
import { UserProfile } from "../services/userService";

interface ProfileHeaderProps {
  profile: UserProfile;
  onFollowToggle: () => void;
}

export function ProfileHeader({ profile, onFollowToggle }: ProfileHeaderProps) {
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative mb-6">
      {/* 1. CAPA */}
      <div className="h-48 w-full bg-linear-to-r from-violet-900 via-zinc-900 to-blue-900 rounded-b-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-6">
          
          {/* 2. AVATAR */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1 bg-zinc-950">
              <img 
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=random`} 
                alt={profile.name}
                className="w-full h-full rounded-full object-cover border-4 border-zinc-800"
              />
            </div>
            {/* Status Online */}
            <div className="absolute bottom-4 right-2 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            </div>
          </div>

          {/* 3. NOME E AÇÕES */}
          <div className="flex-1 pt-2 md:pt-0 w-full">
            <div className="flex justify-between items-start md:items-end">
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">{profile.name}</h1>
                <p className="text-zinc-500 text-lg">@{profile.username}</p>
              </div>

              {profile.isMe ? (
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-sm transition-all border border-zinc-700">
                  <Edit3 size={16} /> Editar Perfil
                </button>
              ) : (
                <button 
                  onClick={onFollowToggle}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${
                    profile.isFollowing 
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-red-500/50 hover:text-red-400' 
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-900/20'
                  }`}
                >
                  {profile.isFollowing ? <><UserCheck size={18}/> Seguindo</> : <><UserPlus size={18}/> Seguir</>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. BIO E INFO */}
        <div className="space-y-4 max-w-3xl">
          <p className="text-zinc-300 text-base leading-relaxed">
            {profile.bio || "Desenvolvedor apaixonado por código, café e comunidades open-source. 🚀"}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><MapPin size={16}/> Brasil</span>
            <span className="flex items-center gap-1.5"><LinkIcon size={16}/> <a href="#" className="hover:text-violet-400">github.com/{profile.username}</a></span>
            <span className="flex items-center gap-1.5"><Calendar size={16}/> Entrou em {formatDate(profile.createdAt)}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {profile.interestTags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400">
                {tag}
              </span>
            ))}
          </div>

          {/* 5. STATS (CORRIGIDO E ALINHADO) */}
          <div className="flex gap-8 py-4 border-t border-zinc-800/50 mt-6">
            <div className="flex flex-col items-start">
              <span className="font-bold text-white text-xl">{profile._count.following}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Seguindo</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-white text-xl">{profile._count.followedBy}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Seguidores</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}