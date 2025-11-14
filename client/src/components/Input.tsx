import React from 'react'

type InputProps = {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ placeholder, value, onChange }: InputProps) => {
  // estados de hover e foco
  const [hover, setHover] = React.useState(false)
  const [focado, setFocado] = React.useState(false)

  // estilo base do input
  const estiloBase: React.CSSProperties = {
    width: '100%',                     // responsivo
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #D9D9D9',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    fontSize: '16px',
    transition: 'all 0.15s ease-in-out',
    fontFamily: 'inherit',
    color: '#333',
    boxSizing: 'border-box',           // responsivo: impede que padding aumente largura
  }

  // estilo quando o mouse passa por cima
  const estiloHover: React.CSSProperties = {
    borderColor: '#C5C5C5',
  }

  // estilo quando o input esta focado
  const estiloFocado: React.CSSProperties = {
    borderColor: '#8A3FFC',
    boxShadow: '0 0 0 2px rgba(138, 63, 252, 0.25)',
  }

  // combinacao de estilos dinamicos
  const estiloFinal = {
    ...estiloBase,
    ...(hover ? estiloHover : {}),
    ...(focado ? estiloFocado : {}),
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}                    
      onChange={onChange}              
      style={estiloFinal}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
    />
  )
}

export default Input
