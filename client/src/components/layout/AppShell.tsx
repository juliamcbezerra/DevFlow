import { ReactNode } from "react";
import { Navbar } from "./Navbar";
// REMOVIDO: import { Sidebar } ...

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      
      {/* Fundo */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light pointer-events-none fixed z-0"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-violet-800/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-800/15 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        <Navbar />

        <div className="pt-16">
          {/* AQUI ESTAVA O ERRO: Removi a <Sidebar /> que ficava aqui */}
          
          {/* O children agora ocupa a largura total e centraliza seu próprio conteúdo */}
          <main className="min-h-[calc(100vh-4rem)] flex justify-center">
            <div className="w-full p-4 sm:p-6 flex justify-center">
              {children}
            </div>
          </main>
        </div>
      </div>
      
    </div>
  );
}