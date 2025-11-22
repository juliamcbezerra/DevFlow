import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../ui/Input"; 
import { Button } from "../../ui/Button"; 

export interface FormDataLogin {
  email: string;
  password: string;
  lembrarMe: boolean;
}

interface LoginFormProps {
  onSubmit: (dados: FormDataLogin) => Promise<void> | void;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState<FormDataLogin>({
    email: "",
    password: "",
    lembrarMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormDataLogin, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "O email é obrigatório";
    if (!formData.password) newErrors.password = "A senha é obrigatória";
    // Removida a trava de 8 chars no login para não bloquear usuários antigos
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
      {/* Mensagem de Erro vinda do Backend */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isLoading}
            className={fieldErrors.email ? "border-red-500 focus:border-red-500" : ""}
          />
          {fieldErrors.email && <span className="text-xs text-red-400">{fieldErrors.email}</span>}
        </div>

        <div className="space-y-1">
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            disabled={isLoading}
            className={fieldErrors.password ? "border-red-500 focus:border-red-500" : ""}
          />
          {fieldErrors.password && <span className="text-xs text-red-400">{fieldErrors.password}</span>}
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.lembrarMe}
              onChange={(e) => updateField("lembrarMe", e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-violet-600 focus:ring-violet-600 accent-violet-600"
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
              Lembre-se de mim
            </span>
          </label>
          
          <Link to="#" className="text-sm font-medium text-violet-500 hover:text-violet-400">
            Esqueceu a senha?
          </Link>
        </div>

        {/* AQUI ESTAVA O PROBLEMA: Agora usamos children */}
        <div className="mt-4">
          <Button type="submit" isLoading={isLoading}>
            Entrar
          </Button>
        </div>
      </form>
    </div>
  );
}