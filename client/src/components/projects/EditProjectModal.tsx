import { useState } from "react";
import { X, Loader2, Save, Camera, Sparkles } from "lucide-react";
import { projectService } from "../../services/projectService";

interface EditProjectModalProps {
  project: any;
  onClose: () => void;
  onUpdateSuccess: (updatedProject: any) => void;
}

export function EditProjectModal({ project, onClose, onUpdateSuccess }: EditProjectModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Estados do Formulário
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [avatarUrl, setAvatarUrl] = useState(project.avatarUrl || "");
  const [bannerUrl, setBannerUrl] = useState(project.bannerUrl || "");
  
  // Tags
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [customTag, setCustomTag] = useState("");

  const suggestedTags = [
    "React", "Node.js", "TypeScript", "Python", "DevOps", 
    "UI/UX", "Mobile", "AI", "Open Source", "Game Dev"
  ];

  const toggleTag = (tag: string) => {
      if (!tag.trim()) return;
      setTags(prev => {
          const exists = prev.includes(tag);
          return exists ? prev.filter(t => t !== tag) : [...prev, tag];
      });
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault(); 
          toggleTag(customTag);
          setCustomTag("");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await projectService.update(project.id, {
        name,
        description,
        avatarUrl,
        bannerUrl,
        tags
      });

      onUpdateSuccess(updated);
      onClose();
    } catch (error: any) {
      console.error(error);
      alert("Erro ao editar projeto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Editar Projeto</h2>
            <p className="text-sm text-zinc-400">Atualize as informações visuais e dados.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Imagens (Avatar e Banner) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Avatar URL</label>
                    <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-violet-500/50 transition-colors">
                        <Camera size={18} className="text-zinc-500"/>
                        <input 
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-transparent w-full text-sm text-white focus:outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Banner URL</label>
                    <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus-within:border-violet-500/50 transition-colors">
                        <Sparkles size={18} className="text-zinc-500"/>
                        <input 
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-transparent w-full text-sm text-white focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Nome do Projeto</label>
                <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus:border-violet-500/50 transition-colors text-sm text-white focus:outline-none"
                />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Descrição</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 focus:border-violet-500/50 transition-colors text-sm text-white focus:outline-none resize-none h-24"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Tags</label>
                <div className="min-h-[50px] mb-3 p-3 bg-zinc-950/30 border border-zinc-800/50 rounded-xl flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className="px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-500/20 hover:text-red-400 transition-all group">
                            #{tag} <X size={12}/>
                        </button>
                    ))}
                    <input 
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={handleCustomTagKeyDown}
                        placeholder="Adicionar..." 
                        className="bg-transparent text-sm text-white focus:outline-none min-w-20"
                    />
                </div>
                {/* Sugestões */}
                <div className="flex flex-wrap gap-2">
                    {suggestedTags.filter(t => !tags.includes(t)).map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className="px-2 py-1 rounded-lg text-xs font-bold border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all">
                            + {tag}
                        </button>
                    ))}
                </div>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 rounded-b-2xl shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white font-bold text-sm transition-colors">Cancelar</button>
          <button form="edit-project-form" type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={16}/> Salvar Alterações</>}
          </button>
        </div>

      </div>
    </div>
  );
}