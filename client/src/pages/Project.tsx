import { AppShell } from "../components/layout/AppShell";
import { Sidebar } from "../components/layout/Sidebar";

const PROJECT_MOCK = {
  name: "Rocketseat Education",
  description: "Comunidade oficial para alunos e entusiastas da Rocketseat. Tire dúvidas, compartilhe projetos e evolua sua carreira.",
  members: 45300,
  online: 120,
  isMember: false,
  color: "from-purple-600 to-pink-600"
};

const PROJECT_POSTS = [
  { id: 1, author: "Mayk Brito", role: "Admin", content: "Pessoal, saiu atualização no curso de Explorer! Confiram o módulo de React.", tags: ["Aviso", "React"], likes: 340, comments: 45 },
  { id: 2, author: "Aluno Dev", role: "Member", content: "Alguém pode me ajudar com esse erro no Docker? Estou tentando rodar o Postgres mas...", tags: ["Dúvida", "Docker"], likes: 2, comments: 8 },
];

export default function ProjectPage() {
  return (
    <AppShell>
      <Sidebar />
      
      <div className="flex-1 min-w-0 flex justify-center h-full overflow-hidden">
        
        {/* CONTAINER DO MEIO (FEED DO PROJETO) */}
        <div className="flex-1 max-w-[640px] h-full overflow-y-auto no-scrollbar pb-20 pt-6 px-4">
           
           {/* HEADER DO PROJETO */}
           <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-6 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${PROJECT_MOCK.color} flex items-center justify-center shadow-lg mb-4`}>
                 <span className="text-3xl font-bold text-white">R</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{PROJECT_MOCK.name}</h1>
              <p className="text-zinc-400 text-sm mb-6 max-w-sm">{PROJECT_MOCK.description}</p>
              
              <div className="flex gap-3 w-full">
                 <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20">
                    Entrar na Comunidade
                 </button>
                 <button className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                 </button>
              </div>
           </div>

           {/* FEED */}
           <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-4 pl-2">Discussões Recentes</h3>
           <div className="space-y-4">
              {PROJECT_POSTS.map(post => (
                 <div key={post.id} className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} className="w-8 h-8 rounded-full" />
                          <div>
                             <p className="text-sm font-bold text-white hover:underline cursor-pointer">{post.author}</p>
                             <p className="text-[10px] text-zinc-500 uppercase font-bold">{post.role}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          {post.tags.map(tag => (
                             <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">{tag}</span>
                          ))}
                       </div>
                    </div>
                    <p className="text-zinc-300 mb-4 text-sm leading-relaxed">{post.content}</p>
                    <div className="flex gap-6 text-zinc-500 text-sm">
                       <button className="flex items-center gap-2 hover:text-green-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg> {post.likes}</button>
                       <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg> {post.comments}</button>
                    </div>
                 </div>
              ))}
           </div>

        </div>

        {/* SIDEBAR DE INFORMAÇÕES (DIREITA) */}
        <div className="hidden lg:block w-72 h-full p-6 border-l border-zinc-800/50 space-y-6">
           <div>
              <h3 className="text-zinc-400 font-bold text-sm mb-4">Sobre</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
                    <div>
                       <p className="font-bold text-white">{PROJECT_MOCK.members}</p>
                       <p className="text-xs text-zinc-500">Membros</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"/></svg></div>
                    <div>
                       <p className="font-bold text-white">{PROJECT_MOCK.online}</p>
                       <p className="text-xs text-zinc-500">Online agora</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="h-px bg-zinc-800"></div>

           <div>
              <h3 className="text-zinc-400 font-bold text-sm mb-4">Admins</h3>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <img key={i} src={`https://ui-avatars.com/api/?background=random&name=Admin${i}`} className="w-8 h-8 rounded-full ring-2 ring-zinc-900" />
                 ))}
              </div>
           </div>
        </div>

      </div>
    </AppShell>
  );
}