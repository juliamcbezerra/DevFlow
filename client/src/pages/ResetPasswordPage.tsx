import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import api from "../services/api";
import { Input } from "../components/ui/Input"; 
import { Button } from "../components/ui/Button";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Senhas não conferem");
    
    setLoading(true);
    try {
        await api.post('/auth/reset-password', { email, code, newPassword: password });
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
        console.error(error);
        alert("Erro ao redefinir. Código inválido ou expirado.");
    } finally {
        setLoading(false);
    }
  };

  const auroraVariant: Variants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
      transition: { duration: 15, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
            <motion.div variants={auroraVariant} animate="animate" className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md bg-zinc-900/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            
            {success ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                        <CheckCircle2 size={32}/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Senha Alterada!</h2>
                    <p className="text-zinc-400 mb-6">Sua senha foi redefinida com sucesso.</p>
                    <p className="text-xs text-zinc-500">Redirecionando para login...</p>
                </div>
            ) : (
                <>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 mb-4 text-violet-400">
                            <KeyRound size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
                        <p className="text-sm text-zinc-400 mt-2">Para: <span className="text-white font-mono">{email}</span></p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input label="Código de 6 dígitos" placeholder="Ex: 123456" value={code} onChange={e => setCode(e.target.value)} className="font-mono tracking-widest text-center text-lg"/>
                        </div>
                        <div>
                            <Input label="Nova Senha" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
                        </div>
                        <div>
                            <Input label="Confirmar Senha" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                        </div>

                        <Button type="submit" disabled={loading} isLoading={loading} className="w-full py-3 mt-4">
                            Redefinir Senha
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-zinc-500 hover:text-white transition-colors">Cancelar</Link>
                    </div>
                </>
            )}
        </motion.div>
    </div>
  );
}