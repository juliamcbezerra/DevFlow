import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    // min-h-screen: Permite que a página cresça infinitamente
    // Removi 'overflow-hidden' para liberar o scroll do navegador
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      
      {/* Fundo Fixo (Para não se mexer enquanto você rola) */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-violet-800/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-800/15 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Container Principal */}
        <div className="flex justify-center w-full pt-24 pb-10">
          {/* max-w-[1200px]: Limita a largura do conteúdo centralizado */}
          <main className="w-full max-w-[1440px] px-4 sm:px-6 flex gap-6 items-start">
            {children}
          </main>
        </div>
      </div>
      
    </div>  
  );
}