import React from 'react'

type ButtonProps = {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

const Button = ({ label, onClick, variant = 'primary' }: ButtonProps) => {
  const baseStyle =
    'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none'

  const variants = {
    primary:
      'bg-[#8A3FFC] text-white hover:bg-[#7A2DE5] active:bg-[#692BCC] shadow-sm',
    secondary:
      'bg-[#F3F3F3] text-[#8A3FFC] hover:bg-[#E9E9E9] active:bg-[#DDDDDD] border border-[#8A3FFC33]',
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
      {label}
    </button>
  )
}

export default Button