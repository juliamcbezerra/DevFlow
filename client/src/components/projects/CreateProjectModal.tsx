import { useState } from 'react';
import { X, Loader2, Hash, Type, FileText, Image as ImageIcon, Plus } from 'lucide-react';
import { projectService } from '../../services/projectService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  // Estados do Formulário
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Estados das Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Gera slug automático enquanto digita o nome
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Sugere slug apenas removendo caracteres especiais e espaços
    const suggestedSlug = newName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9\s-]/g, "") 
      .replace(/\s+/g, "-");
      
    setSlug(suggestedSlug);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(val);
  };

  // Adicionar Tag
  const handleAddTag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  // Remover Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Enviar Formulário usando o Service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectService.create({
        name,
        slug,
        description,
        tags,
        avatarUrl: avatarUrl || undefined
      });
      
      // Limpar campos
      setName('');
      setSlug('');
      setDescription('');
      setTags([]);
      setAvatarUrl('');
      
      onClose();
      if (onSuccess) onSuccess();
      window.location.reload(); 
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Erro ao criar comunidade.';
      alert(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Card */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Criar Comunidade</h2>
          <p className="text-sm text-zinc-400">Crie um espaço para compartilhar conhecimento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Avatar Input */}
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="text-zinc-500 group-hover:text-violet-400 transition-colors" size={24} />
                )}
            </div>
            <div className="flex-1">
                <label className="text-xs font-medium text-zinc-400 mb-1 block">URL do Avatar / Logo (Opcional)</label>
                <input 
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Type size={16} className="text-violet-500"/> Nome
                </label>
                <input 
                    required 
                    value={name} 
                    onChange={handleNameChange} 
                    placeholder="React Brasil" 
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder-zinc-600" 
                />
            </div>

            {/* Slug */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">URL</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-zinc-500 text-sm font-mono">/</span>
                    <input 
                        required 
                        value={slug} 
                        onChange={handleSlugChange} 
                        placeholder="react-brasil" 
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-6 pr-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder-zinc-600 font-mono text-sm" 
                    />
                </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Hash size={16} className="text-violet-500"/> Tags <span className="text-zinc-500 text-xs">(Máx 5)</span>
            </label>
            
            <div className="flex gap-2">
                <input 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={tags.length >= 5 ? "Limite atingido" : "Digite e Enter..."}
                  disabled={tags.length >= 5}
                  className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder-zinc-600 disabled:opacity-50"
                />
                <button 
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 min-h-6">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm rounded-full">
                        #{tag} 
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white ml-1"><X size={14} /></button>
                    </span>
                ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <FileText size={16} className="text-violet-500"/> Descrição
            </label>
            <textarea 
                rows={3} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Sobre o que é essa comunidade?" 
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder-zinc-600 resize-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Criar Comunidade'}
          </button>
        </form>
      </div>
    </div>
  );
}