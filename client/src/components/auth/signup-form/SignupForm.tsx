import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../ui/Input"; 
import { Button } from "../../ui/Button"; 

// 1. Interface atualizada com 'username'
export interface FormDataCadastro {
  nome: string;
  sobrenome: string;
  username: string; // <--- NOVO CAMPO
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
    username: "", // <--- Inicializa vazio
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    aceitaTermos: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormDataCadastro, value: string | boolean) => {
    // Se for username, forçamos minúsculo e removemos espaços
    if (field === 'username' && typeof value === 'string') {
        value = value.toLowerCase().replace(/\s/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateAge = (dateString: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Obrigatório";
    if (!formData.sobrenome.trim()) newErrors.sobrenome = "Obrigatório";
    
    // Validação de Username
    if (!formData.username.trim()) {
        newErrors.username = "Obrigatório";
    } else if (formData.username.length < 3) {
        newErrors.username = "Mínimo de 3 caracteres";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Data obrigatória";
    } else {
      const age = validateAge(formData.birthDate);
      if (age < 13) {
        newErrors.birthDate = "Você precisa ter pelo menos 13 anos.";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo de 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!formData.aceitaTermos) {
      newErrors.aceitaTermos = "Você precisa aceitar os termos";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) await onSubmit(formData);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Cabeçalho Mobile */}
      <div className="flex flex-col gap-2 md:hidden">
        <h1 className="text-2xl font-bold text-white">Crie uma conta</h1>
        <p className="text-zinc-400 text-sm">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-violet-500 hover:text-violet-400 hover:underline">
            Faça Login
          </Link>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md text-center animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Nome e Sobrenome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nome"
              placeholder="João"
              value={formData.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              disabled={isLoading}
              className={fieldErrors.nome ? "border-red-500 focus:border-red-500" : ""}
            />
            {fieldErrors.nome && <span className="text-xs text-red-400 mt-1">{fieldErrors.nome}</span>}
          </div>

          <div>
            <Input
              label="Sobrenome"
              placeholder="Silva"
              value={formData.sobrenome}
              onChange={(e) => updateField("sobrenome", e.target.value)}
              disabled={isLoading}
              className={fieldErrors.sobrenome ? "border-red-500 focus:border-red-500" : ""}
            />
            {fieldErrors.sobrenome && <span className="text-xs text-red-400 mt-1">{fieldErrors.sobrenome}</span>}
          </div>
        </div>

        {/* Username (NOVO) */}
        <div>
          <Input
            label="Nome de usuário"
            placeholder="joaosilva (sem espaços)"
            value={formData.username}
            onChange={(e) => updateField("username", e.target.value)}
            disabled={isLoading}
            className={fieldErrors.username ? "border-red-500 focus:border-red-500 font-mono" : "font-mono"}
          />
          {fieldErrors.username && <span className="text-xs text-red-400 mt-1">{fieldErrors.username}</span>}
        </div>

        {/* Data de Nascimento */}
        <div>
           <Input
              label="Data de Nascimento"
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              disabled={isLoading}
              className={fieldErrors.birthDate ? "border-red-500 focus:border-red-500 scheme-dark" : "scheme-dark"}
           />
           {fieldErrors.birthDate && <span className="text-xs text-red-400 mt-1">{fieldErrors.birthDate}</span>}
        </div>

        {/* Email */}
        <div>
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isLoading}
            className={fieldErrors.email ? "border-red-500 focus:border-red-500" : ""}
          />
          {fieldErrors.email && <span className="text-xs text-red-400 mt-1">{fieldErrors.email}</span>}
        </div>

        {/* Senha */}
        <div>
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            disabled={isLoading}
            className={fieldErrors.password ? "border-red-500 focus:border-red-500" : ""}
          />
          {fieldErrors.password && <span className="text-xs text-red-400 mt-1">{fieldErrors.password}</span>}
        </div>

        {/* Confirmar Senha */}
        <div>
          <Input
            label="Confirme a senha"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            disabled={isLoading}
            className={fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}
          />
          {fieldErrors.confirmPassword && <span className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</span>}
        </div>

        {/* Termos */}
        <div className="flex flex-col mt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.aceitaTermos}
              onChange={(e) => updateField("aceitaTermos", e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-violet-600 focus:ring-violet-600 accent-violet-600"
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors leading-tight">
              Eu concordo com os <a href="#" className="text-violet-500 hover:underline">Termos e Condições</a> e a <a href="#" className="text-violet-500 hover:underline">Política de Privacidade</a>.
            </span>
          </label>
          {fieldErrors.aceitaTermos && <span className="text-xs text-red-400 mt-1 ml-7">{fieldErrors.aceitaTermos}</span>}
        </div>

        <div className="mt-4">
          <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full">
            Criar conta
          </Button>
        </div>
      </form>
    </div>
  );
}