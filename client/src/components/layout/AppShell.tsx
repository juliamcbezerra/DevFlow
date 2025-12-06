import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { motion, Variants } from "framer-motion"; // 1. Adicionado Variants no import

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  
  // 2. Tipagem explícita (: Variants) adicionada aqui
  const auroraVerticalVariant: Variants = {
    animate: {
      x: ["-10%", "10%", "-10%"],
      scaleX: [1, 1.2, 1],
      scaleY: [1, 0.9, 1],
      opacity: [0.4, 0.7, 0.4],
      transition: { duration: 25, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // 3. E aqui também
  const groundWaveVariant: Variants = {
    animate: {
      x: ["-25%", "0%", "-25%"],
      scaleY: [1, 1.3, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 30, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    // Fundo base: Preto absoluto (#000000) ou um azul noturno muito profundo (#05050A)
    <div className="min-h-screen bg-[#020205] text-zinc-100 relative overflow-hidden selection:bg-violet-500/30">
      
      {/* --- BACKGROUND CÓSMICO/DIGITAL --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* 1. Textura de Ruído (Noise) - Essencial para o look 'digital' */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay z-10"></div>
        
        {/* 2. Nebulosa de Fundo (Deep Space Glow) */}
        <div className="absolute top-[-50%] left-[-50%] w-[200vw] h-[200vh] bg-radial-at-c from-indigo-900/20 via-transparent to-transparent blur-[150px] opacity-50" />

        {/* --- CAMADA SUPERIOR: AURORAS VERTICAIS --- */}
        <div className="absolute inset-0 mix-blend-screen">
             {/* Cortina Violeta (Esquerda) */}
             <motion.div 
               variants={auroraVerticalVariant}
               animate="animate"
               className="absolute top-[-20%] left-[-10%] w-[50vw] h-[120vh] bg-linear-to-b from-violet-600/40 via-fuchsia-800/20 to-transparent rounded-[100%] blur-[80px] transform-gpu origin-center"
               style={{ filter: 'blur(90px)' }}
             />
             {/* Cortina Ciano/Azul (Direita, com delay) */}
             <motion.div 
               variants={auroraVerticalVariant}
               animate="animate"
               transition={{ delay: 5 }} // Deslocamento de tempo
               className="absolute top-[-30%] right-[-10%] w-[60vw] h-[130vh] bg-linear-to-b from-cyan-500/30 via-blue-700/20 to-transparent rounded-[100%] blur-[80px] transform-gpu origin-center"
               style={{ filter: 'blur(100px)' }}
             />
        </div>

        {/* --- CAMADA INFERIOR: ONDAS DIGITAIS NO HORIZONTE --- */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] mix-blend-plus-lighter">
             {/* Onda Magenta (Fundo) */}
             <motion.div 
                variants={groundWaveVariant}
                animate="animate"
                className="absolute bottom-[-20%] left-[-50%] w-[200vw] h-[40vh] bg-linear-to-t from-magenta-600/30 via-purple-900/10 to-transparent rounded-[100%] blur-[70px]"
             />
             {/* Onda Azul Elétrico (Frente) */}
             <motion.div 
                variants={groundWaveVariant}
                animate="animate"
                transition={{ delay: 7, duration: 35 }}
                className="absolute bottom-[-30%] left-[-20%] w-[200vw] h-[50vh] bg-linear-to-t from-blue-500/40 via-cyan-600/20 to-transparent rounded-[100%] blur-[80px]"
             />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col bg-black/10 backdrop-blur-[1px]"> {/* Leve blur no conteúdo para integrar */}
        <Navbar />

        {/* CONTAINER PRINCIPAL */}
        <div className="flex justify-center w-full grow">
          <motion.main 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="w-full max-w-[1440px] px-4 flex gap-6 items-start pt-24"
          >
            {children}
          </motion.main>
        </div>
      </div>
      
    </div>
  );
}