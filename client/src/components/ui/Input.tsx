import React from "react";

// 1. Estendemos as props padrão do HTML (aceita type, placeholder, onChange, disabled, etc.)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Opcional: se passar label, ele renderiza o texto em cima
}

// 2. Exportação Nomeada (export function) para casar com o import do LoginForm
export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      
      <input
        className={`
          w-full px-4 py-3 rounded-md
          bg-zinc-800 border border-zinc-700 text-zinc-100 
          placeholder-zinc-500 
          outline-none transition-all duration-200
          
          /* Estados de Foco (o "Neon" do nosso tema) */
          focus:border-violet-600 focus:ring-1 focus:ring-violet-600
          
          /* Estado Desabilitado */
          disabled:opacity-50 disabled:cursor-not-allowed
          
          /* Permite passar classes extras via props */
          ${className} 
        `}
        {...props} // Repassa todas as props (onChange, value, type, id, etc.)
      />
    </div>
  );
}