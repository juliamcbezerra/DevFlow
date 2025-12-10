import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { ImagePickerModal } from "../components/ui/ImagePickerModal";
import { ImageInput } from "../components/ui/ImageInput";
import { useImagePicker } from "../hooks/useImagePicker";
import { 
    MapPin, Github, Linkedin, Globe, 
    ArrowRight, Check, Sparkles, Hash, Link as LinkIcon, X
} from "lucide-react";

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customTag, setCustomTag] = useState(""); // Input de tag manual

  // Estado do Formulário
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    avatarUrl: user?.avatarUrl || "",
    bannerUrl: "",
    interestTags: [] as string[],
    socialLinks: {
        github: "",
        linkedin: "",
        portfolio: "",
        instagram: ""
    }
  });

  // Image Pickers
  const avatarPicker = useImagePicker({
    onSuccess: (url) => {
      setFormData(prev => ({ ...prev, avatarUrl: url }));
    },
    folderType: "profile-pictures"
  });

  const bannerPicker = useImagePicker({
    onSuccess: (url) => {
      setFormData(prev => ({ ...prev, bannerUrl: url }));
    },
    folderType: "user-banners"
  });

  // Lista de tags sugeridas
  const suggestedTags = [
    "React", "Node.js", "TypeScript", "Python", "DevOps", 
    "UI/UX", "Mobile", "AI", "Data Science", "Rust", "Go"
  ];

  const handleNext = async () => {
    if (step < 3) {
        setStep(step + 1);
    } else {
        await handleSubmit();
    }
  };

  // 💥 FUNÇÃO DE SUBMIT ATUALIZADA PARA USAR O NOVO ENDPOINT
  const handleSubmit = async () => {
      setLoading(true);
      try {
        const profileData = {
            bio: formData.bio,
            location: formData.location,
            avatarUrl: formData.avatarUrl,
            bannerUrl: formData.bannerUrl,
            interestTags: formData.interestTags,
            socialLinks: formData.socialLinks
        };

        // 💡 Chama o novo método que usará a rota /users/me/onboarding
        const finishedUser = await userService.finishOnboarding(profileData);
        
        // 2. Atualiza o Contexto de Autenticação com o objeto que contêm onboardingCompleted: true
        updateUser(finishedUser); 
        
        // 3. Navega para o feed (o PrivateRoute/OnboardingGuard não deve mais bloquear)
        navigate('/feed');

      } catch (error) {
          console.error("Erro ao finalizar o onboarding:", error);
      } finally {
          setLoading(false);
      }
  };

  // Função unificada para adicionar/remover tags
  const toggleTag = (tag: string) => {
      if (!tag.trim()) return;
      
      setFormData(prev => {
          const exists = prev.interestTags.includes(tag);
          return {
              ...prev,
              interestTags: exists 
                ? prev.interestTags.filter(t => t !== tag) // Remove se já existe
                : [...prev.interestTags, tag] // Adiciona se não existe
          };
      });
  };

  // Handler para Enter no input de tag
  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault(); 
          toggleTag(customTag);
          setCustomTag(""); // Limpa o input visualmente para dar feedback
      }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Decorativo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 relative z-10">
            
            {/* Progress Bar */}
            <div className="flex justify-between mb-8 px-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            step >= s ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-zinc-800 text-zinc-500"
                        }`}>
                            {step > s ? <Check size={14}/> : s}
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${step >= s ? "text-zinc-300" : "text-zinc-600"}`}>
                            {s === 1 ? "Perfil" : s === 2 ? "Interesses" : "Social"}
                        </span>
                    </div>
                ))}
            </div>

            {/* --- PASSO 1: IDENTIDADE --- */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold text-white mb-2">Vamos criar sua identidade</h2>
                    <p className="text-zinc-400 mb-8 text-sm">Adicione uma foto e conte um pouco sobre você.</p>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Foto de Perfil</label>
                                <ImageInput
                                    imageUrl={formData.avatarUrl}
                                    placeholder="Clique para adicionar"
                                    onClick={avatarPicker.openPicker}
                                    size="lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Banner</label>
                                <ImageInput
                                    imageUrl={formData.bannerUrl}
                                    placeholder="Clique para adicionar"
                                    onClick={bannerPicker.openPicker}
                                    size="lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Localização</label>
                            <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-violet-500/50 transition-colors">
                                <MapPin size={18} className="text-zinc-500"/>
                                <input 
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    placeholder="Ex: São Paulo, Brasil"
                                    className="bg-transparent w-full text-sm text-zinc-200 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Sobre Você</label>
                            <textarea 
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                placeholder="Desenvolvedor Fullstack apaixonado por React e café..."
                                className="w-full bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus:border-violet-500/50 transition-colors text-sm text-zinc-200 focus:outline-none resize-none h-24"
                            />
                        </div>
                    </div>

                    {/* Image Picker Modals */}
                    <ImagePickerModal
                        isOpen={avatarPicker.isOpen}
                        onClose={avatarPicker.closePicker}
                        onImageSelect={avatarPicker.handleImageSelect}
                        title="Foto de Perfil"
                        description="Faça upload ou insira um link para sua foto de perfil"
                        currentImage={formData.avatarUrl}
                        folderType="profile-pictures"
                    />
                    <ImagePickerModal
                        isOpen={bannerPicker.isOpen}
                        onClose={bannerPicker.closePicker}
                        onImageSelect={bannerPicker.handleImageSelect}
                        title="Banner do Perfil"
                        description="Faça upload ou insira um link para o banner do seu perfil"
                        currentImage={formData.bannerUrl}
                        folderType="user-banners"
                    />
                </div>
            )}

            {/* --- PASSO 2: INTERESSES --- */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold text-white mb-2">O que você curte?</h2>
                    <p className="text-zinc-400 mb-8 text-sm">Selecione ou adicione tags.</p>

                    {/* LISTA DE TAGS SELECIONADAS (Feedback Visual) */}
                    <div className="min-h-[60px] mb-6 p-4 bg-zinc-950/30 border border-zinc-800/50 rounded-xl">
                        {formData.interestTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.interestTags.map(tag => (
                                    <button 
                                        key={tag} 
                                        onClick={() => toggleTag(tag)}
                                        className="px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all group"
                                    >
                                        #{tag} <X size={12} className="opacity-50 group-hover:opacity-100"/>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-600 italic">Nenhuma tag selecionada ainda.</p>
                        )}
                    </div>

                    {/* SUGESTÕES */}
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Sugestões:</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {suggestedTags.filter(t => !formData.interestTags.includes(t)).map(tag => (
                            <button 
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white transition-all flex items-center gap-1"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                    
                    {/* INPUT PERSONALIZADO */}
                    <div className="flex items-center gap-2 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-violet-500/50 transition-colors w-full">
                        <Hash size={18} className="text-zinc-500 ml-1"/>
                        <input 
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onKeyDown={handleCustomTagKeyDown}
                            placeholder="Digite uma tag e aperte Enter..." 
                            className="bg-transparent text-sm text-zinc-200 focus:outline-none w-full placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            )}

            {/* --- PASSO 3: SOCIAIS --- */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold text-white mb-2">Conecte-se</h2>
                    <p className="text-zinc-400 mb-8 text-sm">Onde mais as pessoas podem te encontrar?</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-white/20 transition-colors">
                            <Github size={20} className="text-white"/>
                            <input 
                                value={formData.socialLinks.github}
                                onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, github: e.target.value}})}
                                placeholder="github.com/seu-usuario"
                                className="bg-transparent w-full text-sm text-zinc-200 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-blue-500/50 transition-colors">
                            <Linkedin size={20} className="text-blue-500"/>
                            <input 
                                value={formData.socialLinks.linkedin}
                                onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                                placeholder="linkedin.com/in/seu-usuario"
                                className="bg-transparent w-full text-sm text-zinc-200 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-pink-500/50 transition-colors">
                            <LinkIcon size={20} className="text-pink-500"/>
                            <input 
                                value={formData.socialLinks.instagram}
                                onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
                                placeholder="instagram.com/seu-usuario"
                                className="bg-transparent w-full text-sm text-zinc-200 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-green-500/50 transition-colors">
                            <Globe size={20} className="text-green-500"/>
                            <input 
                                value={formData.socialLinks.portfolio}
                                onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, portfolio: e.target.value}})}
                                placeholder="Seu site pessoal"
                                className="bg-transparent w-full text-sm text-zinc-200 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-zinc-800">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="text-zinc-400 hover:text-white text-sm font-bold px-4 py-2 transition-colors">Voltar</button>
                ) : <div></div>}

                <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-white/10 flex items-center gap-2"
                >
                    {loading ? "Salvando..." : (step === 3 ? "Concluir" : "Próximo")}
                    {!loading && <ArrowRight size={16}/>}
                </button>
            </div>
        </div>
    </div>
  );
}