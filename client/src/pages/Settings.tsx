import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import api from "../services/api";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { 
    User, Shield, Trash2, Save, Loader2, 
    Camera, MapPin, Globe, Github, Linkedin, Layout, Instagram, KeyRound, Mail, Hash, X, Moon, Sun, Monitor
} from "lucide-react";

// --- 1. CORREÇÃO TÉCNICA: InputGroup fora do componente principal ---
const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, type = "text" }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            {Icon && <Icon size={12}/>} {label}
        </label>
        <div className="relative group">
            <input 
                type={type}
                value={value} 
                onChange={onChange} 
                className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-zinc-700" 
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default function SettingsPage() {
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  // Tags
  const [customTag, setCustomTag] = useState("");
  const suggestedTags = ["React", "Node.js", "TypeScript", "Python", "DevOps", "UI/UX", "AI", "Mobile"];

  // Interface Settings (Mock por enquanto, já que o app é dark nativo)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // --- DADOS DO PERFIL ---
  const [profileData, setProfileData] = useState({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      avatarUrl: user?.avatarUrl || "",
      bannerUrl: user?.bannerUrl || "",
      interestTags: user?.interestTags || [], // Adicionado Tags
      socialLinks: { 
          github: user?.socialLinks?.github || "", 
          linkedin: user?.socialLinks?.linkedin || "", 
          portfolio: user?.socialLinks?.portfolio || "",
          instagram: user?.socialLinks?.instagram || ""
      }
  });

  // --- SEGURANÇA & MODAIS ---
  const [resetStep, setResetStep] = useState<'idle' | 'code-sent'>('idle');
  const [resetData, setResetData] = useState({ code: "", newPassword: "", confirmPassword: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // --- LÓGICA DE TAGS ---
  const toggleTag = (tag: string) => {
      if (!tag.trim()) return;
      setProfileData(prev => {
          const exists = prev.interestTags.includes(tag);
          return {
              ...prev,
              interestTags: exists 
                ? prev.interestTags.filter(t => t !== tag)
                : [...prev.interestTags, tag]
          };
      });
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          toggleTag(customTag);
          setCustomTag("");
      }
  };

  // 1. SALVAR PERFIL
  const handleSaveProfile = async () => {
      setLoading(true);
      try {
          const updatedUser = await userService.updateProfile(profileData);
          updateUser(updatedUser); 
          alert("Perfil atualizado com sucesso!");
      } catch (error) {
          console.error(error);
          alert("Erro ao atualizar.");
      } finally {
          setLoading(false);
      }
  };

  // 2. RECUPERAÇÃO DE SENHA
  const handleRequestCode = async () => {
      setLoading(true);
      try {
          await api.post('/auth/request-password-change');
          setResetStep('code-sent');
          alert(`Código enviado para ${user?.email}`);
      } catch (error) { alert("Erro ao solicitar código."); } 
      finally { setLoading(false); }
  };

  const handleConfirmPasswordChange = async () => {
      if (resetData.newPassword !== resetData.confirmPassword) return alert("Senhas não coincidem.");
      
      setLoading(true);
      try {
          await api.post('/auth/confirm-password-change', {
              code: resetData.code,
              newPassword: resetData.newPassword
          });
          alert("Senha alterada! Faça login novamente.");
          signOut();
      } catch (error: any) { alert(error.response?.data?.message || "Erro."); } 
      finally { setLoading(false); }
  };

  // 3. DELETAR CONTA
  const handleDeleteAccount = async () => {
      try {
          await api.post('/users/me/delete', { password: deletePassword });
          signOut();
          navigate('/login');
      } catch (error: any) { alert("Senha incorreta."); }
  };

  return (
    <AppShell>
      <Sidebar />
      
      <div className="flex-1 min-w-0 max-w-6xl mx-auto w-full pb-20 pt-8 px-6 lg:px-12">
        
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-zinc-400">Gerencie sua identidade e segurança.</p>
            </div>
            
            {/* Botão de Salvar Flutuante (Desktop) */}
            <button 
                onClick={handleSaveProfile} 
                disabled={loading} 
                className="hidden md:flex bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-900/20 items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                Salvar Alterações
            </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- COLUNA ESQUERDA (2/3) --- */}
            <div className="xl:col-span-2 space-y-8">
                
                {/* CARD: IDENTIDADE */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><User size={20}/></div>
                        <h2 className="text-lg font-bold text-white">Perfil Público</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup label="Avatar URL" icon={Camera} value={profileData.avatarUrl} onChange={(e: any) => setProfileData({...profileData, avatarUrl: e.target.value})} placeholder="https://..." />
                            <InputGroup label="Capa URL" icon={Layout} value={profileData.bannerUrl} onChange={(e: any) => setProfileData({...profileData, bannerUrl: e.target.value})} placeholder="https://..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup label="Nome de Exibição" value={profileData.name} onChange={(e: any) => setProfileData({...profileData, name: e.target.value})} />
                            <InputGroup label="Localização" icon={MapPin} value={profileData.location} onChange={(e: any) => setProfileData({...profileData, location: e.target.value})} placeholder="Ex: São Paulo, Brasil" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Bio</label>
                            <textarea 
                                value={profileData.bio} 
                                onChange={e => setProfileData({...profileData, bio: e.target.value})} 
                                className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 h-24 resize-none placeholder:text-zinc-700" 
                                placeholder="Conte um pouco sobre você..." 
                            />
                        </div>
                    </div>
                </section>

                {/* CARD: INTERESSES (NOVO) */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Hash size={20}/></div>
                        <h2 className="text-lg font-bold text-white">Interesses e Tags</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Tags Selecionadas */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-10">
                            {profileData.interestTags.length > 0 ? profileData.interestTags.map(tag => (
                                <button key={tag} onClick={() => toggleTag(tag)} className="px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all group">
                                    #{tag} <X size={12} className="opacity-50 group-hover:opacity-100"/>
                                </button>
                            )) : <span className="text-zinc-600 text-sm italic">Nenhuma tag selecionada.</span>}
                        </div>

                        {/* Input Custom */}
                        <div className="relative group">
                            <input 
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={handleCustomTagKeyDown}
                                className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-zinc-700" 
                                placeholder="Digite uma tag nova e aperte Enter..." 
                            />
                        </div>

                        {/* Sugestões */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {suggestedTags.filter(t => !profileData.interestTags.includes(t)).map(tag => (
                                <button key={tag} onClick={() => toggleTag(tag)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white transition-all">
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CARD: CONEXÕES */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Globe size={20}/></div>
                        <h2 className="text-lg font-bold text-white">Conexões</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup label="Github" icon={Github} value={profileData.socialLinks.github} onChange={(e: any) => setProfileData({...profileData, socialLinks: {...profileData.socialLinks, github: e.target.value}})} placeholder="Usuario" />
                        <InputGroup label="LinkedIn" icon={Linkedin} value={profileData.socialLinks.linkedin} onChange={(e: any) => setProfileData({...profileData, socialLinks: {...profileData.socialLinks, linkedin: e.target.value}})} placeholder="URL" />
                        <InputGroup label="Instagram" icon={Instagram} value={profileData.socialLinks.instagram} onChange={(e: any) => setProfileData({...profileData, socialLinks: {...profileData.socialLinks, instagram: e.target.value}})} placeholder="@usuario" />
                        <InputGroup label="Portfolio" icon={Globe} value={profileData.socialLinks.portfolio} onChange={(e: any) => setProfileData({...profileData, socialLinks: {...profileData.socialLinks, portfolio: e.target.value}})} placeholder="https://..." />
                    </div>
                    
                    {/* Botão Mobile */}
                    <div className="md:hidden mt-8 flex justify-end border-t border-zinc-800/50 pt-6">
                        <button onClick={handleSaveProfile} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Salvar
                        </button>
                    </div>
                </section>
            </div>

            {/* --- COLUNA DIREITA (1/3) --- */}
            <div className="space-y-8">
                
                {/* CARD: APARÊNCIA (NOVO) */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Monitor size={20}/></div>
                        <h2 className="text-lg font-bold text-white">Interface</h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'bg-zinc-800 border-violet-500 text-white ring-1 ring-violet-500/50' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Moon size={20}/>
                            <span className="text-xs font-bold">Escuro</span>
                        </button>
                        <button 
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'bg-zinc-100 border-violet-500 text-zinc-900 ring-1 ring-violet-500/50' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Sun size={20}/>
                            <span className="text-xs font-bold">Claro</span>
                        </button>
                    </div>
                </section>

                {/* CARD: SENHA */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Shield size={20}/></div>
                        <h2 className="text-lg font-bold text-white">Segurança</h2>
                    </div>

                    {resetStep === 'idle' ? (
                        <div className="text-center py-6">
                            <KeyRound size={48} className="mx-auto text-zinc-700 mb-4"/>
                            <p className="text-zinc-400 text-sm mb-6 px-2">
                                Para sua segurança, enviaremos um código para <strong>{user?.email}</strong>.
                            </p>
                            <button onClick={handleRequestCode} disabled={loading} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold text-sm transition-colors border border-zinc-700">
                                {loading ? "Enviando..." : "Redefinir Senha"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-start gap-3 mb-2">
                                <Mail size={18} className="text-blue-400 mt-0.5 shrink-0"/>
                                <p className="text-xs text-blue-200">Enviamos um código de 6 dígitos.</p>
                            </div>
                            
                            <InputGroup label="Código" value={resetData.code} onChange={(e: any) => setResetData({...resetData, code: e.target.value})} placeholder="123456" />
                            <InputGroup label="Nova Senha" type="password" value={resetData.newPassword} onChange={(e: any) => setResetData({...resetData, newPassword: e.target.value})} placeholder="••••••••" />
                            <InputGroup label="Confirmar" type="password" value={resetData.confirmPassword} onChange={(e: any) => setResetData({...resetData, confirmPassword: e.target.value})} placeholder="••••••••" />

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setResetStep('idle')} className="flex-1 bg-zinc-800 text-zinc-400 hover:text-white py-2.5 rounded-xl text-xs font-bold">Cancelar</button>
                                <button onClick={handleConfirmPasswordChange} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20">
                                    Salvar
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* CARD: ZONA DE PERIGO */}
                <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Trash2 size={20}/></div>
                        <h2 className="text-lg font-bold text-red-500">Zona de Perigo</h2>
                    </div>
                    <p className="text-xs text-red-300/70 mb-6 leading-relaxed">
                        Excluir a conta é irreversível.
                    </p>
                    <button onClick={() => setShowDeleteModal(true)} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl font-bold text-sm transition-colors">
                        Excluir Conta
                    </button>
                </section>
            </div>
        </div>

        {/* Modal de Exclusão */}
        <ConfirmModal 
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            title="Exclusão de Conta"
            description="Digite sua senha atual para confirmar a exclusão."
            confirmText="Confirmar Exclusão"
            isDestructive={true}
        />
        {showDeleteModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md p-6 pointer-events-auto mt-24">
                     <input type="password" placeholder="Sua senha..." className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-red-900/50 text-red-200 focus:outline-none shadow-2xl" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} autoFocus />
                </div>
            </div>
        )}

      </div>
    </AppShell>
  );
}