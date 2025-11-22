import React from "react"
import Input from "../../ui/Input"

// interface com os dados do formulario de cadastro
interface FormDataCadastro {
    nome: string
    sobrenome: string
    email: string
    senha: string
    confirmaSenha: string
    aceitaTermos: boolean
}

// interface das propriedades do componente
interface SignupFormProps {
    // callback chamado quando o formulario e submetido
    onSubmit?: (dados: FormDataCadastro) => Promise<void> | void
    // estado de carregamento durante o envio
    carregando?: boolean
    // mensagem de erro para exibir
    erro?: string
}

export function SignupForm({ onSubmit, carregando = false, erro }: SignupFormProps) {
    // estado do formulario - separado em campos para facilitar validacao e backend
    const [formData, setFormData] = React.useState<FormDataCadastro>({
        nome: "",
        sobrenome: "",
        email: "",
        senha: "",
        confirmaSenha: "",
        aceitaTermos: false,
    })

    // estado para erros de validacao por campo
    const [errosCampo, setErrosCampo] = React.useState<Record<string, string>>({})

    // funcao para atualizar um campo do formulario
    const atualizaCampo = (campo: keyof FormDataCadastro, valor: string | boolean) => {
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

    // funcao para validar formulario antes de enviar
    const validaFormulario = (): boolean => {
        const novosErros: Record<string, string> = {}

        if (!formData.nome.trim()) {
            novosErros.nome = "nome obrigatorio"
        }
        if (!formData.sobrenome.trim()) {
            novosErros.sobrenome = "sobrenome obrigatorio"
        }
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
        if (formData.senha !== formData.confirmaSenha) {
            novosErros.confirmaSenha = "senhas nao conferem"
        }
        if (!formData.aceitaTermos) {
            novosErros.aceitaTermos = "voce deve aceitar os termos e condicoes"
        }

        setErrosCampo(novosErros)
        return Object.keys(novosErros).length === 0
    }

    // funcao para lidar com envio do formulario
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
            console.error("erro ao cadastrar:", err)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* titulo e subtitulo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'white', margin: 0 }}>Crie uma conta</h1>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                    Você já possui uma conta?{" "}
                    <a href="/login" style={{ fontWeight: '500', color: '#a78bfa', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                        Faça Login!
                    </a>
                </p>
            </div>

            {/* mensagem de erro geral */}
            {erro && (
                <div style={{ borderRadius: '6px', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '12px', fontSize: '0.875rem', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                    {erro}
                </div>
            )}

            {/* formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* linha com nome e sobrenome */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="nome" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
                            Nome
                        </label>
                        <Input
                            placeholder="seu nome"
                            value={formData.nome}
                            onChange={(e) => atualizaCampo("nome", e.target.value)}
                        />
                        {errosCampo.nome && (
                            <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.nome}</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="sobrenome" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
                            Sobrenome
                        </label>
                        <Input
                            placeholder="seu sobrenome"
                            value={formData.sobrenome}
                            onChange={(e) => atualizaCampo("sobrenome", e.target.value)}
                        />
                        {errosCampo.sobrenome && (
                            <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.sobrenome}</p>
                        )}
                    </div>
                </div>

                {/* email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
                        Email
                    </label>
                    <Input
                        placeholder="seu.email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => atualizaCampo("email", e.target.value)}
                    />
                    {errosCampo.email && (
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.email}</p>
                    )}
                </div>

                {/* senha */}
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

                {/* confirma senha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="confirmaSenha" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
                        Confirme sua senha
                    </label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmaSenha}
                        onChange={(e) => atualizaCampo("confirmaSenha", e.target.value)}
                    />
                    {errosCampo.confirmaSenha && (
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.confirmaSenha}</p>
                    )}
                </div>

                {/* checkbox termos */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                        id="termos"
                        type="checkbox"
                        checked={formData.aceitaTermos}
                        onChange={(e) => atualizaCampo("aceitaTermos", e.target.checked)}
                        style={{
                            marginTop: '4px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: '2px solid #a78bfa',
                            backgroundColor: formData.aceitaTermos ? '#a78bfa' : 'transparent',
                            cursor: carregando ? 'not-allowed' : 'pointer',
                            opacity: carregando ? 0.5 : 1,
                            accentColor: '#a78bfa'
                        }}
                        disabled={carregando}
                    />
                    <label htmlFor="termos" style={{ fontSize: '0.875rem', fontWeight: '500', cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.5 : 1, color: 'white' }}>
                        Eu concordo com os{" "}
                        <a href="#" style={{ color: '#a78bfa', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                            Termos e Condições
                        </a>
                    </label>
                </div>
                {errosCampo.aceitaTermos && (
                    <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{errosCampo.aceitaTermos}</p>
                )}

                {/* botao enviar */}
                <button
                    type="submit"
                    disabled={carregando}
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        backgroundColor: '#8A3FFC',
                        color: 'white',
                        fontWeight: '500',
                        border: 'none',
                        cursor: carregando ? 'not-allowed' : 'pointer',
                        opacity: carregando ? 0.7 : 1,
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#7A2DE5')}
                    onMouseLeave={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#8A3FFC')}
                    onMouseDown={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#692BCC')}
                    onMouseUp={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#7A2DE5')}
                >
                    {carregando ? "Criando conta..." : "Criar conta"}
                </button>
            </form>
        </div>
    )
}
