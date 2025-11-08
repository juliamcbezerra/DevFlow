import React from 'react'

type BotaoProps = {
  label: string
  onClick?: () => void
  variant?: 'primario' | 'secundario'
}

const Botao = ({ label, onClick, variant = 'primario' }: BotaoProps) => {
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

  // combinacao de estilos dinamicos
  const estiloFinal = {
    ...estiloBase,
    ...variantes[variant],
    ...(hover ? estilosHover[variant] : {}),
    ...(ativo ? estilosAtivo[variant] : {}),
  }

  return (
    <button
      onClick={onClick}
      style={estiloFinal}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setAtivo(false)
      }}
      onMouseDown={() => setAtivo(true)}
      onMouseUp={() => setAtivo(false)}
    >
      {label}
    </button>
  )
}

export default Botao