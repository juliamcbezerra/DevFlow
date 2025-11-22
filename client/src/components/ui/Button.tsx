import React from 'react'

type BotaoProps = {
  label: string
  onClick?: () => void
  variant?: 'primario' | 'secundario'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const Botao = ({ label, onClick, variant = 'primario', type = 'button', disabled = false }: BotaoProps) => {
  // estilo base do botao
  const estiloBase: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '6px',
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  // estilos principais dos dois tipos de botoes
  const variantes: Record<'primario' | 'secundario', React.CSSProperties> = {
    primario: {
      backgroundColor: '#8A3FFC',
      color: 'white',
      border: 'none',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    secundario: {
      backgroundColor: 'white',
      color: '#8A3FFC',
      border: '2px solid #8A3FFC33',
    },
  }

  // estilos aplicados quando o mouse passa por cima
  const estilosHover: Record<'primario' | 'secundario', React.CSSProperties> = {
    primario: { backgroundColor: '#7A2DE5', transform: 'scale(1.02)' },
    secundario: { backgroundColor: '#E9E9E9', transform: 'scale(1.02)' },
  }

  // estilos aplicados quando o botao e clicado
  const estilosAtivo: Record<'primario' | 'secundario', React.CSSProperties> = {
    primario: { backgroundColor: '#692BCC', transform: 'scale(0.98)' },
    secundario: { backgroundColor: '#DDDDDD', transform: 'scale(0.98)' },
  }

  // controle dos estados de hover e clique
  const [hover, setHover] = React.useState(false)
  const [ativo, setAtivo] = React.useState(false)

  // combina os estilos: base + variante + hover + ativo + disabled
  const estiloFinal = {
    ...estiloBase,
    ...variantes[variant],
    ...(hover && !disabled ? estilosHover[variant] : {}),
    ...(ativo && !disabled ? estilosAtivo[variant] : {}),
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={estiloFinal}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setAtivo(false)
      }}
      onMouseDown={() => !disabled && setAtivo(true)}
      onMouseUp={() => !disabled && setAtivo(false)}
    >
      {label}
    </button>
  )
}

export default Botao