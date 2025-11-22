import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-16 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Coluna da Esquerda (Menu) - Ocupa 3 colunas */}
        <div className="hidden md:block md:col-span-3">
            {/* O Sidebar já tem position fixed, aqui é só um espaço reservado se necessário, 
                ou removemos o fixed do Sidebar e deixamos o grid controlar. 
                Para simplificar estilo Reddit, vamos deixar o Sidebar controlar seu visual */}
             <Sidebar />
        </div>

        {/* Coluna do Meio (Feed) - Ocupa 6 colunas (metade da tela) */}
        <main className="col-span-1 md:col-span-9 lg:col-span-6 px-4 py-6">
          {children}
        </main>

        {/* Coluna da Direita (Trending) - Ocupa 3 colunas */}
        <div className="hidden lg:block lg:col-span-3 py-6">
          <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="font-bold text-zinc-200 mb-4">Trending Tags</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-zinc-800 text-xs rounded-full text-zinc-300 hover:text-white cursor-pointer">#javascript</span>
              <span className="px-3 py-1 bg-zinc-800 text-xs rounded-full text-zinc-300 hover:text-white cursor-pointer">#rust</span>
              <span className="px-3 py-1 bg-zinc-800 text-xs rounded-full text-zinc-300 hover:text-white cursor-pointer">#devflow</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}