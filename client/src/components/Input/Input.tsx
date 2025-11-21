import React from 'react'

type InputProps = {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
}

const Input = ({ placeholder, value, onChange, type = 'text' }: InputProps) => {
  // estados de hover e foco
  const [hover, setHover] = React.useState(false)
  const [focado, setFocado] = React.useState(false)

  // estilo base do input
  const estiloBase: React.CSSProperties = {
    width: '100%',                     // responsivo
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #404854',
    backgroundColor: '#2d2d44',
    outline: 'none',
    fontSize: '16px',
    transition: 'all 0.15s ease-in-out',
    fontFamily: 'inherit',
    color: '#ffffff',
    boxSizing: 'border-box',           // responsivo: impede que padding aumente largura
  }

  // estilo quando o mouse passa por cima
  const estiloHover: React.CSSProperties = {
    borderColor: '#a78bfa',
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
      type={type}
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
