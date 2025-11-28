import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      
      {/* Fundo decorativo fixo */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-violet-800/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-800/15 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10 min-h-screen">
        <Navbar />

        {/* CONTAINER PRINCIPAL - SEM PADDING TOP */}
        <div className="flex justify-center w-full">
          <main className="w-full max-w-[1440px] px-4 flex gap-6 items-start pt-16">
            {/* pt-[88px] = 64px (navbar) + 24px (espaço visual) */}
            {children}
          </main>
        </div>
      </div>
      
    </div>
  );
}