import { X, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface TermsModalProps {
  onClose: () => void;
}

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden"
      >
        {/* Glow Decorativo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-600 via-fuchsia-600 to-blue-600"></div>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                <FileText size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Termos de Uso</h2>
                <p className="text-sm text-zinc-400">Última atualização: Dezembro 2025</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto custom-scrollbar text-zinc-300 space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-bold text-white mb-2">1. Aceitação dos Termos</h3>
            <p>Ao acessar e usar o DevFlow, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com estes termos, não deverá utilizar nossos serviços.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">2. Conduta do Usuário</h3>
            <p>Você concorda em usar o serviço apenas para fins legais e de uma maneira que não infrinja os direitos de terceiros. Comportamentos proibidos incluem:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
                <li>Assédio, bullying ou discurso de ódio.</li>
                <li>Publicação de conteúdo ilegal ou fraudulento.</li>
                <li>Tentativas de violar a segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">3. Propriedade Intelectual</h3>
            <p>Todo o código, design e conteúdo original da plataforma DevFlow são propriedade exclusiva da nossa equipe. O conteúdo postado por usuários pertence a eles, mas nos concedem licença para exibi-lo.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-white mb-2">4. Privacidade</h3>
            <p>Sua privacidade é importante para nós. Leia nossa Política de Privacidade para entender como coletamos e usamos suas informações.</p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-900/20"
          >
            Entendi e Concordo
          </button>
        </div>

      </motion.div>
    </div>
  );
}