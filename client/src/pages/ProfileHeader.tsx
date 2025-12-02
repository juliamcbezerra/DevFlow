import { MapPin, Calendar, Link as LinkIcon, Edit3, UserPlus, UserCheck, Github, Linkedin, Instagram, Globe } from "lucide-react";
import { UserProfile } from "../services/userService";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  profile: UserProfile;
  onFollowToggle: () => void;
}

// Helper Component para renderizar ícones sociais bonitos
function SocialIconLink({ type, url }: { type: string, url?: string }) {
    if (!url || url.trim() === "") return null;
    
    // Garante que o link tenha https se não tiver
    const href = url.startsWith('http') ? url : `https://${url}`;
    
    // Configurações visuais por rede
    let Icon = LinkIcon;
    let colorClass = "text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-500";
    
    if (type === 'github') { Icon = Github; colorClass = "text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800"; }
    if (type === 'linkedin') { Icon = Linkedin; colorClass = "text-blue-400 hover:text-blue-300 border-blue-900/30 hover:border-blue-500/50 hover:bg-blue-500/10"; }
    if (type === 'instagram') { Icon = Instagram; colorClass = "text-pink-400 hover:text-pink-300 border-pink-900/30 hover:border-pink-500/50 hover:bg-pink-500/10"; }
    if (type === 'portfolio') { Icon = Globe; colorClass = "text-green-400 hover:text-green-300 border-green-900/30 hover:border-green-500/50 hover:bg-green-500/10"; }

    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${colorClass} text-xs font-bold`}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
        >
            <Icon size={14} />
            <span className="max-w-[100px] truncate hidden sm:inline">{url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
        </a>
    );
}

export function ProfileHeader({ profile, onFollowToggle }: ProfileHeaderProps) {
  const navigate = useNavigate();
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative mb-6">
      
      {/* 1. CAPA */}
      <div className="h-48 w-full bg-zinc-900 rounded-b-3xl relative overflow-hidden group">
        {profile.bannerUrl ? (
            <img src={profile.bannerUrl} className="w-full h-full object-cover" alt="Capa" />
        ) : (
            <div className="w-full h-full bg-linear-to-r from-violet-900 via-zinc-900 to-blue-900">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-950/80"></div>
      </div>

      <div className="px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-6 relative z-10">
          
          {/* 2. AVATAR */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-full p-1 bg-zinc-950">
              <img 
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=random`} 
                alt={profile.name}
                className="w-full h-full rounded-full object-cover border-4 border-zinc-800 bg-zinc-900"
              />
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-4 right-2 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            </div>
          </div>

          {/* 3. NOME E BOTÕES */}
          <div className="flex-1 pt-2 md:pt-0 w-full min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">{profile.name}</h1>
                <p className="text-zinc-500 text-lg">@{profile.username}</p>
              </div>

              {profile.isMe ? (
                <button 
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-all border border-zinc-700 shadow-lg"
                >
                  <Edit3 size={16} /> Editar Perfil
                </button>
              ) : (
                <button 
                  onClick={onFollowToggle}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    profile.isFollowing 
                      ? 'bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-red-500/50 hover:text-red-400' 
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-900/20'
                  }`}
                >
                  {profile.isFollowing ? <><UserCheck size={18}/> Seguindo</> : <><UserPlus size={18}/> Seguir</>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. BIO, METADADOS E LINKS */}
        <div className="space-y-6 max-w-4xl">
          
          {/* Bio */}
          {profile.bio && (
              <p className="text-zinc-300 text-base leading-relaxed">
                {profile.bio}
              </p>
          )}

          {/* Metadados: Localização e Data */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500 font-medium">
            
            {/* Renderização Condicional da Localização */}
            {profile.location && profile.location.trim() !== "" && (
                <span className="flex items-center gap-1.5 text-zinc-400">
                    <MapPin size={16}/> {profile.location}
                </span>
            )}
            
            <span className="flex items-center gap-1.5 ml-auto md:ml-0">
                <Calendar size={16}/> Entrou em {formatDate(profile.createdAt)}
            </span>
          </div>

          {/* Links Sociais - Agora em uma linha separada para destaque */}
          {profile.socialLinks && (
              <div className="flex flex-wrap gap-2">
                  <SocialIconLink type="github" url={profile.socialLinks.github} />
                  <SocialIconLink type="linkedin" url={profile.socialLinks.linkedin} />
                  <SocialIconLink type="portfolio" url={profile.socialLinks.portfolio} />
                  <SocialIconLink type="instagram" url={profile.socialLinks.instagram} />
              </div>
          )}

          {/* Tags */}
          {profile.interestTags && profile.interestTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {profile.interestTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
          )}

          {/* 5. STATS */}
          <div className="flex gap-12 py-6 border-t border-zinc-800/50 mt-4">
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