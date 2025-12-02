import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { postsService, Post } from "../../services/postsService";
import { Loader2, Send, Image as ImageIcon, Code, Terminal } from "lucide-react";

interface CreatePostWidgetProps {
  projectId: string; // Obrigatório: só postamos dentro de projetos
  onPostCreated: (newPost: Post) => void; // Para atualizar a lista na hora
}

export function CreatePostWidget({ projectId, onPostCreated }: CreatePostWidgetProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!content.trim()) return;
    
    setIsPublishing(true);
    try {
      // Chama o serviço passando o ID do projeto
      const newPost = await postsService.create(content, projectId);
      
      // Limpa e avisa o pai
      setContent("");
      onPostCreated(newPost);
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Não foi possível enviar seu post.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Atalho para inserir bloco de código
  const insertCodeBlock = () => {
    setContent(prev => prev + "\n```javascript\n// Seu código aqui\n```\n");
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex gap-4">
        {/* Avatar */}
        <img 
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
          alt={user?.name} 
          className="w-10 h-10 rounded-full ring-2 ring-zinc-800/50 object-cover shrink-0" 
        />
        
        <div className="flex-1">
          {/* Área de Texto */}
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe conhecimento, dúvidas ou ideias..." 
            className="w-full bg-zinc-950/50 border border-zinc-800/80 text-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder-zinc-600 resize-none h-24 text-sm"
          />
          
          {/* Toolbar de Ações */}
          <div className="flex justify-between mt-3 items-center">
              <div className="flex gap-2 text-zinc-500">
                  <button 
                    className="p-2 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors" 
                    title="Adicionar Imagem (Em breve)"
                  >
                    <ImageIcon size={20}/>
                  </button>
                  <button 
                    onClick={insertCodeBlock}
                    className="p-2 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                    title="Adicionar Código"
                  >
                    <Code size={20}/>
                  </button>
              </div>
              
              <button 
                onClick={handlePublish}
                disabled={isPublishing || !content.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-1.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2"
              >
                {isPublishing ? <Loader2 className="animate-spin w-4 h-4"/> : <Send size={14}/>}
                <span>Publicar</span> 
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}