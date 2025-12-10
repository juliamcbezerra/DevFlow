import { useLocation, Link } from "react-router-dom";
import { MailCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationSentPage() {
  const location = useLocation();
  const email = location.state?.email || "seu e-mail";

  return (
    <div className="min-h-screen bg-[#020205] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Aurora Igual ao Login */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        <motion.div animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <motion.div animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }} className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen" />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl text-center"
        >
            <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-400 ring-4 ring-violet-500/10">
                <MailCheck size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-3">Verifique seu e-mail</h1>
            
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 mb-6">
                <p className="text-zinc-400 text-sm mb-1">Enviamos um link de confirmação para:</p>
                <p className="text-white font-mono font-medium truncate">{email}</p>
            </div>
            
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                Para garantir a segurança da sua conta, precisamos que você confirme seu endereço clicando no link enviado.
                <br/>
                <span className="text-xs opacity-70">(Verifique também sua caixa de spam)</span>
            </p>

            <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-900/20 hover:scale-[1.02]">
                Voltar para o Login <ArrowRight size={18}/>
            </Link>
        </motion.div>
    </div>
  );
}