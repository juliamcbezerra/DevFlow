import React from "react"
import Input from "../../ui/Input"
import Botao from "../../ui/Button"

// interface com os dados do formulario de login
interface FormDataLogin {
  email: string
  senha: string
  lembrarMe: boolean
}

// interface das propriedades do componente
interface LoginFormProps {
  // callback chamado quando o formulario é submetido
  onSubmit?: (dados: FormDataLogin) => Promise<void> | void
  // estado de carregamento durante o envio
  carregando?: boolean
  // mensagem de erro 
  erro?: string
}

export function LoginForm({ onSubmit, carregando = false, erro }: LoginFormProps) {
  // estado do formulario
  const [formData, setFormData] = React.useState<FormDataLogin>({
    email: "",
    senha: "",
    lembrarMe: false,
  })

  // estado pra erros de validacao por campo
  const [errosCampo, setErrosCampo] = React.useState<Record<string, string>>({})

  // funcao pra atualizar um campo do formulario
  const atualizaCampo = (campo: keyof FormDataLogin, valor: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }))
    // limpa erro do campo quando usuario começa a digitar
    if (errosCampo[campo]) {
      setErrosCampo((prev) => ({
        ...prev,
        [campo]: "",
      }))
    }
  }

  // funcao pra validar formulario antes de enviar
  const validaFormulario = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!formData.email.trim()) {
      novosErros.email = "email obrigatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = "email invalido"
    }
    if (!formData.senha) {
      novosErros.senha = "senha obrigatoria"
    } else if (formData.senha.length < 8) {
      novosErros.senha = "senha deve ter pelo menos 8 caracteres"
    }

    setErrosCampo(novosErros)
    return Object.keys(novosErros).length === 0
  }

  // funcao pra lidar com envio do formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validaFormulario()) {
      return
    }

    try {
      if (onSubmit) {
        await onSubmit(formData)
      }
    } catch (err) {
      console.error("erro ao fazer login:", err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/*titulo e subtitulo*/}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'white', margin: 0 }}>Bem-vindo de volta</h1>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
          Não tem uma conta?{" "}
          <a href="/signup" style={{ fontWeight: '500', color: '#a78bfa', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
            Cadastre-se
          </a>
        </p>
      </div>

      {/*mensagem de erro geral*/}
      {erro && (
        <div style={{ borderRadius: '6px', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '12px', fontSize: '0.875rem', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
          {erro}
        </div>
      )}

      {/*formulario*/}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/*email*/}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="seu.email@exemplo.com"
            value={formData.email}
            onChange={(e) => atualizaCampo("email", e.target.value)}
          />
          {errosCampo.email && (
            <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.email}</p>
          )}
        </div>

        {/*senha*/}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="senha" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
            Senha
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.senha}
            onChange={(e) => atualizaCampo("senha", e.target.value)}
          />
          {errosCampo.senha && (
            <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.senha}</p>
          )}
        </div>

        {/*lembre-se de mim e esqueci a senha*/}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="lembrarMe"
              type="checkbox"
              checked={formData.lembrarMe}
              onChange={(e) => atualizaCampo("lembrarMe", e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: '2px solid #a78bfa',
                backgroundColor: formData.lembrarMe ? '#a78bfa' : 'transparent',
                cursor: carregando ? 'not-allowed' : 'pointer',
                opacity: carregando ? 0.5 : 1,
                accentColor: '#a78bfa'
              }}
              disabled={carregando}
            />
            <label htmlFor="lembrarMe" style={{ fontSize: '0.875rem', fontWeight: '500', cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.5 : 1, color: 'white' }}>
              Lembre-se de mim
            </label>
          </div>
          <a href="#" style={{ fontSize: '0.875rem', color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
            Esqueceu a senha?
          </a>
        </div>

        {/*botao enviar*/}
        <div style={{ width: '100%', marginTop: '8px' }}>
          <Botao 
            label={carregando ? "Entrando..." : "Entrar"} 
            type="submit"
            disabled={carregando}
            variant="primario"
            onClick={() => {}}
          />
        </div>
      </form>
    </div>
  )
}
