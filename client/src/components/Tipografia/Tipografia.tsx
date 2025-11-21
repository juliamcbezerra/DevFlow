import React from 'react'

// tipos de variantes
type TipografiaVariante = 
  | 'h1'       // titulo principal da pagina - maior tamanho
  | 'h2'       // titulo secundario - secoes principais
  | 'h3'       // titulo terciario - subsecoes
  | 'h4'       // titulo quaternario - subsubsecoes
  | 'body'     // texto padrao do corpo da pagina
  | 'small'    // texto pequeno para detalhes e informacoes auxiliares
  | 'label'    // texto para labels 

// tipos de cores disponiveis
type TipografiaCor = 
  | 'primary'       // cor principal do tema
  | 'secondary'     // cor secundaria
  | 'muted'         // cor atenuada para textos menos destacados
  | 'destructive'   // cor de erro ou acao destrutiva
  | 'foreground'    // cor padrao de texto
  | 'inherit'       // herda a cor do elemento pai

// tipos de alinhamentos de texto
type TipografiaAlinhamento = 'left' | 'center' | 'right' | 'justify'

// interface das propriedades do componente tipografia
interface TipografiaProps {
  // conteudo a ser renderizado dentro da tipografia
  children: React.ReactNode
  
  // tipo de variante tipografica a usar
  variante?: TipografiaVariante
  
  // cor do texto
  cor?: TipografiaCor
  
  // alinhamento do texto
  alinhamento?: TipografiaAlinhamento
  
  // classe css adicional para customizacoes extras
  className?: string
  
  // propriedades html padroes de um elemento de texto
  as?: React.ElementType
}

// mapa de estilos base para cada variante de tipografia
const estilosVariantes: Record<TipografiaVariante, React.CSSProperties> = {
  // titulo principal - tamanho grande, peso bold
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  
  // titulo secundario - tamanho medio-grande, peso bold
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  
  // titulo terciario - tamanho medio, peso semibold
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // titulo quaternario - tamanho pequeno-medio, peso semibold
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // texto padrao - tamanho normal, peso regular para legibilidade
  body: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  // texto pequeno - tamanho reduzido para informacoes auxiliares
  small: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // texto de label - tamanho pequeno, peso medio para formularios
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
}

// mapa de cores disponiveis
const coresDisponiveis: Record<TipografiaCor, string> = {
  primary: '#8A3FFC',       // cor roxa principal
  secondary: '#6B7280',     // cor cinza secundaria
  muted: '#9CA3AF',         // cor cinza atenuada
  destructive: '#EF4444',   // cor vermelha para erros
  foreground: '#FFFFFF',    // cor branca padrao
  inherit: 'inherit',       // herda do elemento pai
}

// componente tipografia reutilizavel para toda a aplicacao
export default function Tipografia({
  children,
  variante = 'body',
  cor = 'foreground',
  alinhamento = 'left',
  className = '',
  as: Component = 'p',
}: TipografiaProps) {
  // combina os estilos base da variante com os estilos customizados
  const estiloFinal: React.CSSProperties = {
    ...estilosVariantes[variante],
    color: coresDisponiveis[cor],
    textAlign: alinhamento,
  }

  // renderiza o componente com o elemento apropriado (div, span, p, etc)
  return (
    <Component style={estiloFinal} className={className}>
      {children}
    </Component>
  )
}
