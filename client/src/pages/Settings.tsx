import { useState, useEffect } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext"; // Para pegar dados iniciais
import { userService } from "../services/userService";
import { Save, Loader2, User, Hash, FileText, Image as ImageIcon, X, Plus } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth(); // Usuário logado
  
  // Estados do Formulário
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Carregar dados atuais do usuário ao abrir a página
  useEffect(() => {
    async function loadCurrentData() {
      if (!user?.username) return;
      try {
        const profile = await userService.getByUsername(user.username);
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatarUrl || "");
        setTags(profile.interestTags || []);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setInitialLoading(false);
      }
    }
    loadCurrentData();
  }, [user]);

  // Lógica de Tags (Reutilizada)
  const handleAddTag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 10) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Salvar
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateProfile({
        bio,
        avatarUrl,
        interestTags: tags
      });
      alert("Perfil atualizado com sucesso!");
      // Opcional: window.location.reload() para atualizar o avatar na Sidebar/Header
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <AppShell><Sidebar/><div className="flex-1 flex justify-center items-center h-screen"><Loader2 className="animate-spin text-violet-500"/></div></AppShell>;

  return (
    <AppShell>
      <Sidebar />

      <div className="flex-1 min-w-0 pb-20 pt-6 px-4 max-w-2xl mx-auto">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <User size={28} className="text-violet-500"/> Editar Perfil
            </h1>
            <p className="text-zinc-400 mt-2">Personalize como a comunidade vê você.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
            
            {/* 1. AVATAR */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <ImageIcon size={16} className="text-violet-400"/> Foto de Perfil
                </label>
                <div className="flex items-center gap-6">
                    <div className="relative group w-24 h-24 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar Preview" />
                        ) : (
                            <User className="text-zinc-700 w-10 h-10" />
                        )}
                    </div>
                    <div className="flex-1">
                        <input 
                            value={avatarUrl}
                            onChange={e => setAvatarUrl(e.target.value)}
                            placeholder="Cole a URL da sua imagem (Ex: Github, Gravatar)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder-zinc-600 text-sm"
                        />
                        <p className="text-xs text-zinc-500 mt-2">Recomendamos usar imagens quadradas (ex: 400x400px).</p>
                    </div>
                </div>
            </div>

            {/* 2. BIO */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <FileText size={16} className="text-violet-400"/> Sobre Você (Bio)
                </label>
                <textarea 
                    rows={4}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre sua experiência, stack favorita ou o que está aprendendo..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder-zinc-600 resize-none text-sm"
                />
            </div>

            {/* 3. TAGS DE INTERESSE */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Hash size={16} className="text-violet-400"/> Interesses & Stack
                </label>
                
                <div className="flex gap-2">
                    <input 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Adicione tags (React, Node, Design...)"
                        disabled={tags.length >= 10}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder-zinc-600 disabled:opacity-50 text-sm"
                    />
                    <button 
                        type="button"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || tags.length >= 10}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 min-h-[30px]">
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold rounded-lg group hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                            #{tag}
                            <X size={12} className="ml-1 opacity-50 group-hover:opacity-100"/>
                        </span>
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={18}/>}
                    Salvar Alterações
                </button>
            </div>

        </form>
      </div>
    </AppShell>
  );
}