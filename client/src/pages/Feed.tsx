import React from 'react';

// Feed Placeholder melhorado (Simula posts reais para testar o Layout)
const Feed = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-white">Seu Feed</h1>
      <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors">
        + Novo Post
      </button>
    </div>

    {/* Gera 5 posts falsos para testar a rolagem */}
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-violet-500 to-orange-500"></div>
          <div>
            <p className="text-sm font-bold text-zinc-200">DevUser_{i}</p>
            <p className="text-xs text-zinc-500">Há 2 horas • p/ReactJS</p>
          </div>
        </div>
        <h2 className="font-bold text-lg text-zinc-100 mb-2">Como arquitetar uma aplicação Scalable? #{i}</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Estou tentando implementar o padrão de Clean Architecture mas estou tendo dificuldades com a camada de infraestrutura...
        </p>
        <div className="mt-4 flex gap-4 text-xs text-zinc-500 font-mono border-t border-zinc-800 pt-3">
          <span className="flex items-center gap-1 hover:text-orange-500 cursor-pointer">🔼 42 votos</span>
          <span className="flex items-center gap-1 hover:text-violet-500 cursor-pointer">💬 12 comentários</span>
          <span className="flex items-center gap-1">🔗 Compartilhar</span>
        </div>
      </div>
    ))}
  </div>
);

export default Feed;