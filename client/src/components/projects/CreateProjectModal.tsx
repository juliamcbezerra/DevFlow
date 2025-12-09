import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Rocket, Hash, Image as ImageIcon, Link as LinkIcon, CheckCircle2, Layout, Github, Globe, MessageSquare } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { ImagePickerModal } from "../ui/ImagePickerModal";
import { ImageInput } from "../ui/ImageInput";
import { useImagePicker } from "../../hooks/useImagePicker";

interface CreateProjectModalProps {
    onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Image Pickers
    const avatarPicker = useImagePicker({
        onSuccess: (url) => {
            setFormData(prev => ({ ...prev, avatarUrl: url }));
        },
        folderType: "project-images"
    });

    const bannerPicker = useImagePicker({
        onSuccess: (url) => {
            setFormData(prev => ({ ...prev, bannerUrl: url }));
        },
        folderType: "project-banners"
    });

    // Estado do Formulário
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        tags: "", // String temporária para separar por vírgula
        avatarUrl: "",
        bannerUrl: "",
        github: "",
        discord: "",
        website: ""
    });

    // Gera slug automaticamente a partir do nome
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, name, slug }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Processa as tags
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== "");
            
            // Monta o payload
            const payload = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                tags: tagsArray,
                avatarUrl: formData.avatarUrl,
                bannerUrl: formData.bannerUrl,
                socialLinks: {
                    github: formData.github,
                    discord: formData.discord,
                    website: formData.website
                }
            };

            const { data } = await api.post('/projects/create', payload);
            onClose();
            navigate(`/projects/${data.slug}`); // Redireciona para o projeto criado
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao criar projeto.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO DAS ETAPAS ---

    const renderStep1_Identity = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-violet-400">
                    <Rocket size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Vamos começar!</h3>
                <p className="text-zinc-400 text-sm">Dê um nome e uma identidade única para sua comunidade.</p>
            </div>

            <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nome do Projeto</label>
                <input 
                    value={formData.name} onChange={handleNameChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-violet-500 transition-colors"
                    placeholder="Ex: Rocketseat Education" autoFocus
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Identificador (Slug)</label>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-zinc-500">
                    <span className="text-sm">devflow.com/projects/</span>
                    <input 
                        value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                        className="flex-1 bg-transparent border-none text-white p-3 focus:ring-0"
                        placeholder="rocketseat-education"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2_Details = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-400">
                    <Layout size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Sobre o que é?</h3>
                <p className="text-zinc-400 text-sm">Descreva o propósito e adicione tags para ser encontrado.</p>
            </div>

            <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Descrição Curta</label>
                <textarea 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-violet-500 transition-colors h-24 resize-none"
                    placeholder="Ex: Comunidade focada em React Native e desenvolvimento mobile..."
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Tags (Separadas por vírgula)</label>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3">
                    <Hash size={16} className="text-zinc-500"/>
                    <input 
                        value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                        className="flex-1 bg-transparent border-none text-white p-3 focus:ring-0"
                        placeholder="react, javascript, open-source"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3_Visuals = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-pink-400">
                    <ImageIcon size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Identidade Visual</h3>
                <p className="text-zinc-400 text-sm">Adicione imagens para personalizar seu projeto.</p>
            </div>

            <div className="space-y-4">
                {/* Logo/Avatar */}
                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Logo do Projeto</label>
                    <ImageInput
                        imageUrl={formData.avatarUrl}
                        placeholder="Clique para adicionar logo"
                        onClick={avatarPicker.openPicker}
                        size="lg"
                    />
                </div>

                {/* Banner */}
                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Banner do Projeto</label>
                    <ImageInput
                        imageUrl={formData.bannerUrl}
                        placeholder="Clique para adicionar banner"
                        onClick={bannerPicker.openPicker}
                        size="lg"
                    />
                </div>
            </div>

            {/* Image Picker Modals */}
            <ImagePickerModal
                isOpen={avatarPicker.isOpen}
                onClose={avatarPicker.closePicker}
                onImageSelect={avatarPicker.handleImageSelect}
                title="Logo do Projeto"
                description="Faça upload ou insira um link para o logo"
                currentImage={formData.avatarUrl}
                folderType="project-images"
            />
            <ImagePickerModal
                isOpen={bannerPicker.isOpen}
                onClose={bannerPicker.closePicker}
                onImageSelect={bannerPicker.handleImageSelect}
                title="Banner do Projeto"
                description="Faça upload ou insira um link para o banner"
                currentImage={formData.bannerUrl}
                folderType="project-banners"
            />
        </div>
    );

    const renderStep4_Links = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-green-400">
                    <LinkIcon size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Conexões</h3>
                <p className="text-zinc-400 text-sm">Onde os membros podem encontrar mais informações?</p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-3">
                    <Github size={18} className="text-zinc-400"/>
                    <input 
                        value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})}
                        className="flex-1 bg-transparent border-none text-white p-3 focus:ring-0 text-sm"
                        placeholder="GitHub Repository URL"
                    />
                </div>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-3">
                    <MessageSquare size={18} className="text-zinc-400"/>
                    <input 
                        value={formData.discord} onChange={e => setFormData({...formData, discord: e.target.value})}
                        className="flex-1 bg-transparent border-none text-white p-3 focus:ring-0 text-sm"
                        placeholder="Discord Invite Link"
                    />
                </div>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-3">
                    <Globe size={18} className="text-zinc-400"/>
                    <input 
                        value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                        className="flex-1 bg-transparent border-none text-white p-3 focus:ring-0 text-sm"
                        placeholder="Website Oficial"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step >= i ? 'bg-violet-500' : 'bg-zinc-800'}`}></div>
                        ))}
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo Dinâmico */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {step === 1 && renderStep1_Identity()}
                    {step === 2 && renderStep2_Details()}
                    {step === 3 && renderStep3_Visuals()}
                    {step === 4 && renderStep4_Links()}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                            <ChevronLeft size={20}/> Voltar
                        </button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step < 4 ? (
                        <button 
                            onClick={() => setStep(step + 1)} 
                            disabled={step === 1 && !formData.name} // Impede avançar sem nome
                            className="bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            Próximo <ChevronRight size={20}/>
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-900/20 transition-colors disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><CheckCircle2 size={20}/> Criar Projeto</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}