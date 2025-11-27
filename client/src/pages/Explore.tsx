import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";

// --- DADOS MOCK (Para visualizar o layout) ---
const MOCK_PROJECTS = Array.from({ length: 9 }).map((_, i) => ({
  id: i,
  name: i % 2 === 0 ? "DevFlow Platform" : "EcoTracker App",
  description: "Uma plataforma open-source para conectar desenvolvedores e facilitar o gerenciamento de projetos colaborativos com foco em experiência de usuário.",
  tags: i % 2 === 0 ? ["React", "Node.js", "Social"] : ["Flutter", "Mobile", "Eco"],
  members: 12 + i * 2,
  avatarColor: i % 2 === 0 ? "from-violet-500 to-fuchsia-500" : "from-emerald-500 to-teal-500"
}));

const TAGS_FILTER = ["Todos", "Frontend", "Backend", "Mobile", "AI/ML", "DevOps", "UI/UX"];

export default function ExplorePage() {
  const [activeTag, setActiveTag] = useState("Todos");

  return (
    <AppShell>
      <div className="w-full max-w-[1200px] mx-auto space-y-8 pb-20">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Explorar Projetos</h1>
            <p className="text-zinc-400 mt-2">Descubra projetos incríveis, colabore e evolua.</p>
          </div>
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Criar Projeto
          </button>
        </div>

        {/* --- BARRA DE CONTROLE (BUSCA E FILTROS) --- */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center shadow-lg">
          
          {/* Busca */}
          <div className="relative w-full lg:flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Buscar projetos por nome, stack ou descrição..." 
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder-zinc-600"
            />
          </div>

          {/* Filtros e Ordenação */}
          <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {/* Botão Ordenar */}
            <button className="flex items-center gap-2 px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors whitespace-nowrap text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
              <span>Relevância</span>
            </button>

            {/* Botão Filtros */}
            <button className="flex items-center gap-2 px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors whitespace-nowrap text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* --- TAGS (CHIPS) --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TAGS_FILTER.map(tag => (
            <button 
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap
                ${activeTag === tag 
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]" 
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"}
              `}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* --- GRID DE PROJETOS (3 COLUNAS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROJECTS.map((project) => (
            // CARD DO PROJETO
            <div 
              key={project.id} 
              className="group bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col h-full shadow-lg shadow-black/20"
            >
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${project.avatarColor} flex items-center justify-center shadow-lg border border-white/10`}>
                  <span className="font-bold text-white text-lg">{project.name.charAt(0)}</span>
                </div>
                <button className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </button>
              </div>

              {/* Conteúdo */}
              <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-violet-400 transition-colors cursor-pointer">
                {project.name}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                {project.description}
              </p>

              {/* Footer do Card */}
              <div className="flex flex-col gap-4 mt-auto">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800/50 hover:text-zinc-300 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="h-px w-full bg-zinc-800/50"></div>

                {/* Stats e Botão */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                      <span>{project.members} membros</span>
                   </div>
                   <button className="text-xs font-bold text-zinc-400 hover:text-violet-400 transition-colors flex items-center gap-1">
                     Ver Detalhes
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- BOTÃO CARREGAR MAIS --- */}
        <div className="flex justify-center pt-8">
          <button className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-bold flex items-center gap-2">
            Carregar mais projetos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>

      </div>
    </AppShell>
  );
}