import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../ui/Input"; 
import { Button } from "../../ui/Button"; 

export interface FormDataCadastro {
  nome: string;
  sobrenome: string;
  username: string; 
  birthDate: string;
  email: string;
  password: string;       
  confirmPassword: string; 
  aceitaTermos: boolean;
}

interface SignupFormProps {
  onSubmit: (dados: FormDataCadastro) => Promise<void> | void;
  isLoading?: boolean;
  error?: string;
}

export function SignupForm({ onSubmit, isLoading = false, error }: SignupFormProps) {
  const [formData, setFormData] = useState<FormDataCadastro>({
    nome: "",
    sobrenome: "",
    username: "", 
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    aceitaTermos: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormDataCadastro, value: string | boolean) => {
    if (field === 'username' && typeof value === 'string') {
        value = value.toLowerCase().replace(/\s/g, '');
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ... (funções validateAge e validate mantidas iguais para economizar espaço aqui, mas use as mesmas do código anterior) ...
  const validateAge = (dateString: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Obrigatório";
    if (!formData.sobrenome.trim()) newErrors.sobrenome = "Obrigatório";
    if (!formData.username.trim()) newErrors.username = "Obrigatório";
    else if (formData.username.length < 3) newErrors.username = "Mín 3 chars";
    
    if (!formData.birthDate) newErrors.birthDate = "Obrigatório";
    else if (validateAge(formData.birthDate) < 13) newErrors.birthDate = "Mín 13 anos";

    if (!formData.email.trim()) newErrors.email = "Obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Inválido";

    if (!formData.password) newErrors.password = "Obrigatória";
    else if (formData.password.length < 8) newErrors.password = "Mín 8 chars";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Não confere";
    if (!formData.aceitaTermos) newErrors.aceitaTermos = "Aceite os termos";

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) await onSubmit(formData);
  };

  return (
    <div className="flex flex-col gap-4 w-full"> {/* Gap reduzido para 4 */}
      
      {/* Header Mobile Oculto (Já tem no card) */}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded-md text-center animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3"> {/* Gap reduzido para 3 */}
        
        {/* LINHA 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input label="Nome" placeholder="João" value={formData.nome} onChange={(e) => updateField("nome", e.target.value)} disabled={isLoading} className={fieldErrors.nome ? "border-red-500" : ""} />
            {fieldErrors.nome && <span className="text-[10px] text-red-400">{fieldErrors.nome}</span>}
          </div>
          <div>
            <Input label="Sobrenome" placeholder="Silva" value={formData.sobrenome} onChange={(e) => updateField("sobrenome", e.target.value)} disabled={isLoading} className={fieldErrors.sobrenome ? "border-red-500" : ""} />
            {fieldErrors.sobrenome && <span className="text-[10px] text-red-400">{fieldErrors.sobrenome}</span>}
          </div>
        </div>

        {/* LINHA 2 */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <Input label="Usuário" placeholder="joaosilva" value={formData.username} onChange={(e) => updateField("username", e.target.value)} disabled={isLoading} className={`font-mono ${fieldErrors.username ? "border-red-500" : ""}`} />
                {fieldErrors.username && <span className="text-[10px] text-red-400">{fieldErrors.username}</span>}
            </div>
            <div>
                <Input label="Nascimento" type="date" value={formData.birthDate} onChange={(e) => updateField("birthDate", e.target.value)} disabled={isLoading} className={`scheme-dark ${fieldErrors.birthDate ? "border-red-500" : ""}`} />
                {fieldErrors.birthDate && <span className="text-[10px] text-red-400">{fieldErrors.birthDate}</span>}
            </div>
        </div>

        {/* LINHA 3 */}
        <div>
          <Input label="Email" type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} disabled={isLoading} className={fieldErrors.email ? "border-red-500" : ""} />
          {fieldErrors.email && <span className="text-[10px] text-red-400">{fieldErrors.email}</span>}
        </div>

        {/* LINHA 4: Senhas lado a lado */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <Input label="Senha" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => updateField("password", e.target.value)} disabled={isLoading} className={fieldErrors.password ? "border-red-500" : ""} />
                {fieldErrors.password && <span className="text-[10px] text-red-400">{fieldErrors.password}</span>}
            </div>
            <div>
                <Input label="Confirmar" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} disabled={isLoading} className={fieldErrors.confirmPassword ? "border-red-500" : ""} />
                {fieldErrors.confirmPassword && <span className="text-[10px] text-red-400">{fieldErrors.confirmPassword}</span>}
            </div>
        </div>

        {/* Termos */}
        <div className="flex flex-col mt-1">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <div className="relative flex items-center">
                <input type="checkbox" checked={formData.aceitaTermos} onChange={(e) => updateField("aceitaTermos", e.target.checked)} disabled={isLoading} className="peer sr-only" />
                <div className="w-4 h-4 border-2 border-zinc-600 rounded bg-zinc-800 peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
              Li e concordo com os <a href="#" className="text-violet-400 hover:underline">Termos</a> e <a href="#" className="text-violet-400 hover:underline">Privacidade</a>.
            </span>
          </label>
          {fieldErrors.aceitaTermos && <span className="text-[10px] text-red-400 ml-6">{fieldErrors.aceitaTermos}</span>}
        </div>

        <div className="mt-2">
          <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full py-2.5 text-sm font-bold shadow-lg shadow-violet-900/20">
            Criar conta
          </Button>
        </div>
      </form>
    </div>
  );
}